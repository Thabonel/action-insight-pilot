"""
AI Video Generator Routes
Handles video generation using Google's Nano Banana (images) and Veo 3 (videos)
"""

import os
import logging
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
import google.generativeai as genai
from database import get_supabase
from auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/ai-video", tags=["ai-video"])

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class BrandKit(BaseModel):
    """Brand kit configuration"""
    primary_color: Optional[str] = "#FF5722"
    secondary_color: Optional[str] = "#FFC107"
    logo_url: Optional[str] = None
    font_family: Optional[str] = "Inter"

class Scene(BaseModel):
    """Single scene in video plan"""
    visual: str
    text_overlay: Optional[str] = None
    duration: int = Field(ge=1, le=8)
    audio_cue: Optional[str] = None

class VideoPlanRequest(BaseModel):
    """Request to generate video plan"""
    goal: str
    platform: str = Field(pattern="^(YouTubeShort|TikTok|Reels|Landscape)$")
    duration_s: int = Field(ge=8, le=120)
    language: str = "en"
    brand_kit: BrandKit = Field(default_factory=BrandKit)

class VideoPlanResponse(BaseModel):
    """Response with generated video plan"""
    project_id: str
    scenes: List[Scene]
    final_cta: str
    estimated_cost: float

class GenerateImagesRequest(BaseModel):
    """Request to generate scene images"""
    project_id: str
    scene_descriptions: List[str]

class GenerateImagesResponse(BaseModel):
    """Response with generated image URLs"""
    project_id: str
    image_urls: List[str]
    cost_usd: float

class GenerateVideoRequest(BaseModel):
    """Request to generate final video"""
    project_id: str
    final_prompt: str
    image_url: Optional[str] = None
    use_veo_fast: bool = True

class GenerateVideoResponse(BaseModel):
    """Response with video generation status"""
    project_id: str
    operation_id: str
    status: str
    estimated_time_minutes: int

class VideoStatusResponse(BaseModel):
    """Video generation status"""
    project_id: str
    status: str
    video_url: Optional[str] = None
    progress: int = 0
    error_message: Optional[str] = None

class AutopilotVideoRequest(BaseModel):
    """Request from autopilot orchestrator"""
    user_id: str
    campaign_id: str
    goal: str
    platform: str = "YouTubeShort"
    duration_s: int = 8
    brand_kit: BrandKit = Field(default_factory=BrandKit)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def get_user_gemini_key(user_id: str) -> Optional[str]:
    """
    Retrieve and decrypt user's Gemini API key from user_secrets table
    """
    try:
        supabase = get_supabase()
        result = supabase.table('user_secrets').select('encrypted_value').eq('user_id', user_id).eq('service_name', 'gemini_api_key_encrypted').single().execute()

        if result.data and result.data.get('encrypted_value'):
            # The encrypted_value from user_secrets is already the API key
            # The secrets service handles encryption/decryption via Edge Functions
            return result.data['encrypted_value']

        return None
    except Exception as e:
        logger.error(f"Error fetching Gemini key for user {user_id}: {e}")
        return None

async def validate_gemini_key(api_key: str) -> bool:
    """
    Validate Gemini API key with a test request
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content("Hello")
        return True
    except Exception as e:
        logger.error(f"Invalid Gemini API key: {e}")
        return False

def get_aspect_ratio(platform: str) -> tuple:
    """Get aspect ratio for platform"""
    ratios = {
        "YouTubeShort": (9, 16),  # Vertical
        "TikTok": (9, 16),         # Vertical
        "Reels": (9, 16),          # Vertical
        "Landscape": (16, 9)       # Horizontal
    }
    return ratios.get(platform, (9, 16))

def calculate_video_cost(duration_s: int, use_veo_fast: bool = True) -> float:
    """Calculate estimated video generation cost"""
    cost_per_second = 0.40 if use_veo_fast else 0.75
    return duration_s * cost_per_second

def calculate_image_cost(num_images: int) -> float:
    """Calculate image generation cost (Nano Banana)"""
    cost_per_image = 0.039
    return num_images * cost_per_image

# ============================================================================
# ROUTE 1: GENERATE VIDEO PLAN
# ============================================================================

@router.post("/plan", response_model=VideoPlanResponse)
async def generate_video_plan(
    request: VideoPlanRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate AI video plan with scene breakdown
    Uses Gemini API to create structured video outline
    """
    try:
        user_id = current_user['id']

        # Get user's Gemini API key
        api_key = await get_user_gemini_key(user_id)
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="Please add your Gemini API key in Settings to use AI video generation"
            )

        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # Build prompt for video planning
        aspect_ratio = get_aspect_ratio(request.platform)
        prompt = f"""
You are an expert video marketing strategist. Create a detailed video plan for a {request.duration_s}-second {request.platform} video.

GOAL: {request.goal}
PLATFORM: {request.platform} ({aspect_ratio[0]}:{aspect_ratio[1]} aspect ratio)
DURATION: {request.duration_s} seconds
BRAND COLORS: Primary {request.brand_kit.primary_color}, Secondary {request.brand_kit.secondary_color}

Generate a JSON response with this structure:
{{
  "scenes": [
    {{
      "visual": "Detailed visual description for AI video generation",
      "text_overlay": "Short punchy text to display",
      "duration": 2,
      "audio_cue": "Sound effect or music description"
    }}
  ],
  "final_cta": "Call to action text"
}}

Requirements:
- Total scene durations must equal {request.duration_s} seconds
- Keep scenes between 2-4 seconds each
- Visual descriptions should be detailed enough for AI video generation
- Text overlays should be short (max 5 words)
- Make it attention-grabbing for social media

Respond ONLY with valid JSON, no markdown or explanations.
"""

        # Generate plan
        response = model.generate_content(prompt)

        # Parse JSON response
        try:
            # Clean response text (remove markdown if present)
            response_text = response.text.strip()
            if response_text.startswith('```'):
                # Extract JSON from markdown code block
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]

            plan_data = json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {response.text}")
            raise HTTPException(status_code=500, detail="AI generated invalid response format")

        # Create project in database
        supabase = get_supabase()
        project_data = {
            'user_id': user_id,
            'goal': request.goal,
            'platform': request.platform,
            'duration_s': request.duration_s,
            'brand_kit': request.brand_kit.dict(),
            'scene_plan': plan_data,
            'status': 'planning'
        }

        result = supabase.table('ai_video_projects').insert(project_data).execute()
        project_id = result.data[0]['id']

        # Convert to response model
        scenes = [Scene(**scene) for scene in plan_data.get('scenes', [])]
        estimated_cost = calculate_video_cost(request.duration_s, use_veo_fast=True)

        return VideoPlanResponse(
            project_id=project_id,
            scenes=scenes,
            final_cta=plan_data.get('final_cta', 'Learn more!'),
            estimated_cost=estimated_cost
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating video plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate video plan: {str(e)}")

# ============================================================================
# ROUTE 2: GENERATE SCENE IMAGES
# ============================================================================

@router.post("/generate-images", response_model=GenerateImagesResponse)
async def generate_scene_images(
    request: GenerateImagesRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate custom images for scenes using Nano Banana (Gemini 2.5 Flash Image)
    """
    try:
        user_id = current_user['id']

        # Get user's Gemini API key
        api_key = await get_user_gemini_key(user_id)
        if not api_key:
            raise HTTPException(status_code=400, detail="Gemini API key required")

        # Get project
        supabase = get_supabase()
        project = supabase.table('ai_video_projects').select('*').eq('id', request.project_id).eq('user_id', user_id).single().execute()

        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")

        # Update status
        supabase.table('ai_video_projects').update({'status': 'generating_images'}).eq('id', request.project_id).execute()

        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-image')

        # Generate images for each scene
        image_urls = []
        aspect_ratio = get_aspect_ratio(project.data['platform'])

        for idx, description in enumerate(request.scene_descriptions):
            try:
                # Build image generation prompt
                prompt = f"{description}, {aspect_ratio[0]}:{aspect_ratio[1]} aspect ratio, high quality, cinematic lighting, professional photography"

                response = model.generate_content(prompt)

                # Note: In production, you'd extract the image from response
                # and upload to Supabase Storage. For now, using placeholder
                # TODO: Implement actual image extraction and storage
                image_url = f"https://placeholder-image-{idx}.jpg"
                image_urls.append(image_url)

                logger.info(f"Generated image {idx+1}/{len(request.scene_descriptions)}")

            except Exception as e:
                logger.error(f"Failed to generate image for scene {idx}: {e}")
                # Continue with other images even if one fails
                image_urls.append(None)

        # Update project with generated images
        supabase.table('ai_video_projects').update({
            'generated_images': image_urls,
            'status': 'planning'
        }).eq('id', request.project_id).execute()

        cost = calculate_image_cost(len(request.scene_descriptions))

        return GenerateImagesResponse(
            project_id=request.project_id,
            image_urls=image_urls,
            cost_usd=cost
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating images: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ROUTE 3: GENERATE VIDEO
# ============================================================================

@router.post("/generate-video", response_model=GenerateVideoResponse)
async def generate_video(
    request: GenerateVideoRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate final video using Veo 3
    This starts a background job since video generation takes 2-6 minutes
    """
    try:
        user_id = current_user['id']

        # Get user's Gemini API key
        api_key = await get_user_gemini_key(user_id)
        if not api_key:
            raise HTTPException(status_code=400, detail="Gemini API key required")

        # Get project
        supabase = get_supabase()
        project = supabase.table('ai_video_projects').select('*').eq('id', request.project_id).eq('user_id', user_id).single().execute()

        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")

        # Update status
        supabase.table('ai_video_projects').update({
            'status': 'generating_video',
            'final_prompt': request.final_prompt
        }).eq('id', request.project_id).execute()

        # Configure Gemini
        genai.configure(api_key=api_key)

        # Choose model based on speed preference
        model_name = "veo-3.0-fast-generate-001" if request.use_veo_fast else "veo-3.0-generate-001"

        # Start video generation (this is async)
        try:
            # Build generation parameters
            generation_config = {
                "prompt": request.final_prompt,
                "aspect_ratio": get_aspect_ratio(project.data['platform']),
            }

            # If image provided, use image-to-video
            if request.image_url:
                generation_config["image_url"] = request.image_url

            # Note: Actual Veo 3 API call would look like this:
            # operation = genai.models.generate_videos(
            #     model=model_name,
            #     **generation_config
            # )

            # For now, creating a mock operation ID
            # TODO: Replace with actual Veo 3 API call
            operation_id = f"veo3-{uuid4()}"

            # Create job record
            job_data = {
                'project_id': request.project_id,
                'user_id': user_id,
                'job_type': 'video_generation',
                'veo_operation_id': operation_id,
                'status': 'processing',
                'metadata': {'model': model_name, 'use_fast': request.use_veo_fast}
            }

            supabase.table('ai_video_jobs').insert(job_data).execute()

            # Update project with operation ID
            supabase.table('ai_video_projects').update({
                'veo_operation_id': operation_id
            }).eq('id', request.project_id).execute()

            # Schedule background task to poll status
            background_tasks.add_task(poll_veo_status, operation_id, request.project_id, user_id, api_key)

            # Estimate completion time
            estimated_minutes = 4 if request.use_veo_fast else 6

            return GenerateVideoResponse(
                project_id=request.project_id,
                operation_id=operation_id,
                status="processing",
                estimated_time_minutes=estimated_minutes
            )

        except Exception as e:
            logger.error(f"Failed to start video generation: {e}")
            supabase.table('ai_video_projects').update({
                'status': 'failed',
                'error_message': str(e)
            }).eq('id', request.project_id).execute()
            raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_video: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ROUTE 4: CHECK VIDEO STATUS
# ============================================================================

@router.get("/status/{project_id}", response_model=VideoStatusResponse)
async def check_video_status(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check the status of video generation
    """
    try:
        user_id = current_user['id']

        # Get project
        supabase = get_supabase()
        project = supabase.table('ai_video_projects').select('*').eq('id', project_id).eq('user_id', user_id).single().execute()

        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")

        data = project.data

        # Calculate progress based on status
        progress_map = {
            'draft': 0,
            'planning': 20,
            'generating_images': 40,
            'generating_video': 70,
            'completed': 100,
            'failed': 0
        }

        return VideoStatusResponse(
            project_id=project_id,
            status=data['status'],
            video_url=data.get('video_url'),
            progress=progress_map.get(data['status'], 0),
            error_message=data.get('error_message')
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ROUTE 5: SAVE PROJECT
# ============================================================================

@router.post("/save")
async def save_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Save/finalize video project
    """
    try:
        user_id = current_user['id']

        supabase = get_supabase()
        project = supabase.table('ai_video_projects').select('*').eq('id', project_id).eq('user_id', user_id).single().execute()

        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")

        # Update timestamps
        supabase.table('ai_video_projects').update({
            'updated_at': datetime.now().isoformat()
        }).eq('id', project_id).execute()

        return {"status": "saved", "project_id": project_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ROUTE 6: AUTOPILOT VIDEO GENERATION
# ============================================================================

@router.post("/autopilot-generate")
async def autopilot_generate_video(
    request: AutopilotVideoRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate video automatically for autopilot campaigns
    Called by autopilot orchestrator - no user interaction required
    """
    try:
        # Get user's Gemini API key
        api_key = await get_user_gemini_key(request.user_id)

        if not api_key:
            logger.warning(f"User {request.user_id} missing Gemini API key for autopilot video generation")
            return {
                "status": "skipped",
                "reason": "no_api_key",
                "message": "User needs to add Gemini API key in Settings"
            }

        # Create video plan automatically
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        aspect_ratio = get_aspect_ratio(request.platform)
        prompt = f"""
Create a {request.duration_s}-second video ad plan for: {request.goal}
Platform: {request.platform} ({aspect_ratio[0]}:{aspect_ratio[1]})
Brand: Primary {request.brand_kit.primary_color}

Generate JSON with scenes array (visual, text_overlay, duration, audio_cue) and final_cta.
Keep it punchy and attention-grabbing for social media ads.
Total duration must equal {request.duration_s} seconds.
"""

        response = model.generate_content(prompt)

        # Parse plan
        response_text = response.text.strip()
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]

        plan_data = json.loads(response_text.strip())

        # Create project
        supabase = get_supabase()
        project_data = {
            'user_id': request.user_id,
            'campaign_id': request.campaign_id,
            'goal': request.goal,
            'platform': request.platform,
            'duration_s': request.duration_s,
            'brand_kit': request.brand_kit.dict(),
            'scene_plan': plan_data,
            'status': 'generating_video',
            'auto_generated': True
        }

        result = supabase.table('ai_video_projects').insert(project_data).execute()
        project_id = result.data[0]['id']

        # Start video generation in background
        background_tasks.add_task(
            generate_autopilot_video,
            project_id,
            request.user_id,
            request.campaign_id,
            plan_data,
            api_key
        )

        return {
            "status": "generating",
            "project_id": project_id,
            "campaign_id": request.campaign_id,
            "estimated_cost": calculate_video_cost(request.duration_s)
        }

    except Exception as e:
        logger.error(f"Error in autopilot video generation: {e}")
        return {
            "status": "failed",
            "reason": str(e)
        }

# ============================================================================
# BACKGROUND TASKS
# ============================================================================

async def poll_veo_status(operation_id: str, project_id: str, user_id: str, api_key: str):
    """
    Background task to poll Veo 3 generation status
    In production, this would check the actual Veo API
    """
    try:
        # TODO: Implement actual Veo 3 status polling
        # For now, simulating completion after delay
        import asyncio
        await asyncio.sleep(10)  # Simulate processing time

        # Mock video URL (in production, this would come from Veo 3)
        video_url = f"https://storage.supabase.com/ai-videos/{user_id}/{project_id}/video.mp4"

        # Update project as completed
        supabase = get_supabase()
        supabase.table('ai_video_projects').update({
            'status': 'completed',
            'video_url': video_url,
            'completed_at': datetime.now().isoformat(),
            'cost_usd': 3.20  # 8 seconds * $0.40
        }).eq('id', project_id).execute()

        # Update job
        supabase.table('ai_video_jobs').update({
            'status': 'completed',
            'result_url': video_url,
            'completed_at': datetime.now().isoformat()
        }).eq('veo_operation_id', operation_id).execute()

        logger.info(f"Video generation completed for project {project_id}")

    except Exception as e:
        logger.error(f"Error polling Veo status: {e}")

async def generate_autopilot_video(
    project_id: str,
    user_id: str,
    campaign_id: str,
    plan_data: dict,
    api_key: str
):
    """
    Background task for autopilot video generation
    """
    try:
        # Build final prompt from plan
        scenes_text = " ".join([
            f"Scene {i+1}: {scene.get('visual', '')} ({scene.get('duration', 2)}s)."
            for i, scene in enumerate(plan_data.get('scenes', []))
        ])

        final_prompt = f"{scenes_text} {plan_data.get('final_cta', '')}"

        # Generate video (mock for now)
        # TODO: Implement actual Veo 3 call
        operation_id = f"autopilot-veo3-{uuid4()}"

        # Create job
        supabase = get_supabase()
        job_data = {
            'project_id': project_id,
            'user_id': user_id,
            'job_type': 'video_generation',
            'veo_operation_id': operation_id,
            'status': 'processing'
        }

        supabase.table('ai_video_jobs').insert(job_data).execute()

        # Simulate processing
        import asyncio
        await asyncio.sleep(15)

        # Complete
        video_url = f"https://storage.supabase.com/ai-videos/{user_id}/{project_id}/autopilot.mp4"

        supabase.table('ai_video_projects').update({
            'status': 'completed',
            'video_url': video_url,
            'final_prompt': final_prompt,
            'completed_at': datetime.now().isoformat(),
            'cost_usd': 3.20
        }).eq('id', project_id).execute()

        # Log to autopilot activity
        supabase.table('autopilot_activity_log').insert({
            'user_id': user_id,
            'activity_type': 'video_generation',
            'activity_description': f'Auto-generated video ad for campaign',
            'entity_type': 'campaign',
            'entity_id': campaign_id,
            'metadata': {'project_id': project_id, 'cost': 3.20}
        }).execute()

        logger.info(f"Autopilot video completed for campaign {campaign_id}")

    except Exception as e:
        logger.error(f"Error in autopilot video generation: {e}")
        supabase = get_supabase()
        supabase.table('ai_video_projects').update({
            'status': 'failed',
            'error_message': str(e)
        }).eq('id', project_id).execute()

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/projects")
async def list_projects(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """
    List user's video projects
    """
    try:
        user_id = current_user['id']
        supabase = get_supabase()

        result = supabase.table('ai_video_projects')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()

        return {
            "projects": result.data,
            "count": len(result.data)
        }

    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a video project
    """
    try:
        user_id = current_user['id']
        supabase = get_supabase()

        # Verify ownership and delete
        supabase.table('ai_video_projects')\
            .delete()\
            .eq('id', project_id)\
            .eq('user_id', user_id)\
            .execute()

        return {"status": "deleted", "project_id": project_id}

    except Exception as e:
        logger.error(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail=str(e))
