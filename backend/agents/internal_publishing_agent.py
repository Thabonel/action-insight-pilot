# agents/internal_publisher_agent.py

import os
import asyncio
import logging
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
import anthropic
from pydantic import BaseModel
from .base_agent import BaseAgent

logger = logging.getLogger(__name__)

# Enums for better type safety
class VideoStatus(Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    READY = "ready"
    PUBLISHED = "published"
    FAILED = "failed"

class PublishPlatform(Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    LINKEDIN = "linkedin"

# Data models
class VideoScene(BaseModel):
    scene_number: int
    duration: int  # seconds
    text: str
    visual_description: str
    transition: str = "fade"

class VideoProject(BaseModel):
    id: str
    title: str
    scenes: List[VideoScene]
    status: VideoStatus
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime
    published_at: Optional[datetime] = None
    platforms: List[PublishPlatform] = []
    analytics: Dict[str, Any] = {}

class PublishRequest(BaseModel):
    video_id: str
    platform: PublishPlatform
    caption: str
    hashtags: List[str] = []
    scheduled_time: Optional[datetime] = None
    account_id: str

class InternalPublisherAgent(BaseAgent):
    def __init__(self, anthropic_api_key: str, supabase_client):
        super().__init__(
            name="InternalPublisherAgent",
            description="AI agent for creating and publishing video content",
            capabilities=[
                "Generate video scripts from prompts",
                "Create videos using AI",
                "Publish to multiple social platforms",
                "Track video performance"
            ]
        )
        self.anthropic_client = anthropic.AsyncAnthropic(api_key=anthropic_api_key)
        self.supabase = supabase_client
        self.json2video_key = os.getenv("JSON2VIDEO_API_KEY")
        self.blotato_key = os.getenv("BLOTATO_API_KEY")

        # In-memory storage (replace with Supabase in production)
        self.videos_store: Dict[str, VideoProject] = {}
        self.publish_history: List[Dict[str, Any]] = []

    async def generate_video_script(self,
                                  prompt: str,
                                  target_audience: str = "general",
                                  duration: int = 60,
                                  style: str = "engaging") -> List[VideoScene]:
        """Generate video script with scenes using AI"""
        try:
            system_prompt = f"""You are a video script writer specializing in marketing videos.
Create a {duration}-second video script for {target_audience} audience.
Style: {style}

For each scene, provide:
1. Scene duration (in seconds)
2. Text/narration
3. Visual description
4. Transition type

Format as a structured list of scenes."""

            response = await self.anthropic_client.messages.create(
                model="claude-opus-4.5",
                max_tokens=2000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": f"Create a video script for: {prompt}"}
                ],
                temperature=0.7
            )

            # Parse response into scenes
            content = response.content[0].text
            scenes = self._parse_scenes(content)

            return scenes

        except Exception as e:
            self.logger.error(f"Error generating script: {str(e)}")
            raise

    def _parse_scenes(self, script_content: str) -> List[VideoScene]:
        """Parse AI response into structured scenes"""
        # Simplified parsing - in production, use better NLP
        scenes = []
        scene_blocks = script_content.split("\n\n")
        
        for i, block in enumerate(scene_blocks):
            if block.strip():
                # Extract scene details (simplified)
                scenes.append(VideoScene(
                    scene_number=i + 1,
                    duration=5,  # Default 5 seconds per scene
                    text=block.split("\n")[0] if "\n" in block else block,
                    visual_description="Dynamic visuals",  # Would parse from content
                    transition="fade"
                ))
        
        return scenes

    async def create_video(self, 
                          project_id: str,
                          title: str,
                          scenes: List[VideoScene],
                          music_url: Optional[str] = None,
                          intro_url: Optional[str] = None) -> str:
        """Create video using json2video API"""
        try:
            # Convert scenes to json2video format
            json2video_scenes = [
                {
                    "duration": scene.duration,
                    "text": scene.text,
                    "transition": scene.transition
                }
                for scene in scenes
            ]
            
            payload = {
                "template": "marketing-default",
                "data": {
                    "title": title,
                    "scenes": json2video_scenes,
                    "resolution": "full-hd",
                    "quality": "high",
                    "fps": 30
                }
            }
            
            if music_url:
                payload["data"]["background_music"] = music_url
            if intro_url:
                payload["data"]["intro_video"] = intro_url
            
            headers = {"x-api-key": self.json2video_key}
            
            # Make API call
            response = requests.post(
                "https://api.json2video.com/v2/movies",
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            video_url = result.get("url")
            
            # Update project status
            if project_id in self.videos_store:
                self.videos_store[project_id].video_url = video_url
                self.videos_store[project_id].status = VideoStatus.READY
            
            # Save to Supabase
            await self._save_to_supabase(project_id, {"video_url": video_url})
            
            return video_url
            
        except requests.RequestException as e:
            self.logger.error(f"Error creating video: {str(e)}")
            if project_id in self.videos_store:
                self.videos_store[project_id].status = VideoStatus.FAILED
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error: {str(e)}")
            raise

    async def publish_to_platform(self, request: PublishRequest) -> Dict[str, Any]:
        """Publish video to specified platform"""
        try:
            # Get video project
            video = self.videos_store.get(request.video_id)
            if not video or not video.video_url:
                raise ValueError(f"Video {request.video_id} not found or not ready")
            
            # Prepare caption with hashtags
            full_caption = request.caption
            if request.hashtags:
                full_caption += "\n\n" + " ".join(f"#{tag}" for tag in request.hashtags)
            
            # Platform-specific formatting
            platform_config = self._get_platform_config(request.platform)
            
            payload = {
                "post": {
                    "target": {
                        "targetType": request.platform.value
                    },
                    "content": {
                        "text": full_caption[:platform_config["max_caption_length"]],
                        "platform": request.platform.value,
                        "mediaUrls": [video.video_url]
                    },
                    "accountId": request.account_id
                }
            }
            
            # Add scheduling if provided
            if request.scheduled_time:
                payload["post"]["scheduledTime"] = request.scheduled_time.isoformat()
            
            headers = {"blotato-api-key": self.blotato_key}
            
            response = requests.post(
                "https://backend.blotato.com/v2/posts",
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Update video status
            video.status = VideoStatus.PUBLISHED
            video.published_at = datetime.now()
            video.platforms.append(request.platform)
            
            # Track publish history
            self.publish_history.append({
                "video_id": request.video_id,
                "platform": request.platform.value,
                "published_at": datetime.now(),
                "post_id": result.get("postId"),
                "status": "success"
            })
            
            return {
                "success": True,
                "platform": request.platform.value,
                "post_id": result.get("postId"),
                "post_url": result.get("postUrl")
            }
            
        except Exception as e:
            self.logger.error(f"Error publishing to {request.platform.value}: {str(e)}")
            
            # Track failed attempt
            self.publish_history.append({
                "video_id": request.video_id,
                "platform": request.platform.value,
                "published_at": datetime.now(),
                "status": "failed",
                "error": str(e)
            })
            
            raise

    def _get_platform_config(self, platform: PublishPlatform) -> Dict[str, Any]:
        """Get platform-specific configuration"""
        configs = {
            PublishPlatform.FACEBOOK: {
                "max_caption_length": 63206,
                "video_formats": ["mp4", "mov"],
                "max_duration": 240  # 4 hours
            },
            PublishPlatform.INSTAGRAM: {
                "max_caption_length": 2200,
                "video_formats": ["mp4"],
                "max_duration": 60  # 60 seconds for feed
            },
            PublishPlatform.YOUTUBE: {
                "max_caption_length": 5000,
                "video_formats": ["mp4", "avi", "mov"],
                "max_duration": 43200  # 12 hours
            },
            PublishPlatform.TIKTOK: {
                "max_caption_length": 2200,
                "video_formats": ["mp4"],
                "max_duration": 600  # 10 minutes
            },
            PublishPlatform.LINKEDIN: {
                "max_caption_length": 3000,
                "video_formats": ["mp4"],
                "max_duration": 600  # 10 minutes
            }
        }
        return configs.get(platform, configs[PublishPlatform.FACEBOOK])

    async def create_and_publish_video(self,
                                     prompt: str,
                                     title: str,
                                     platforms: List[PublishPlatform],
                                     caption: str,
                                     account_ids: Dict[str, str],
                                     **kwargs) -> Dict[str, Any]:
        """Complete workflow: generate script, create video, and publish"""
        try:
            # 1. Generate script
            self.logger.info(f"Generating script for: {title}")
            scenes = await self.generate_video_script(
                prompt=prompt,
                target_audience=kwargs.get("target_audience", "general"),
                duration=kwargs.get("duration", 60),
                style=kwargs.get("style", "engaging")
            )
            
            # 2. Create video project
            project = VideoProject(
                id=self._generate_id(),
                title=title,
                scenes=scenes,
                status=VideoStatus.GENERATING,
                created_at=datetime.now()
            )
            self.videos_store[project.id] = project
            
            # 3. Generate video
            self.logger.info(f"Creating video: {project.id}")
            video_url = await self.create_video(
                project_id=project.id,
                title=title,
                scenes=scenes,
                music_url=kwargs.get("music_url"),
                intro_url=kwargs.get("intro_url")
            )
            
            # 4. Publish to platforms
            results = []
            for platform in platforms:
                if platform.value not in account_ids:
                    self.logger.warning(f"No account ID for {platform.value}")
                    continue
                
                try:
                    self.logger.info(f"Publishing to {platform.value}")
                    publish_request = PublishRequest(
                        video_id=project.id,
                        platform=platform,
                        caption=caption,
                        hashtags=kwargs.get("hashtags", []),
                        scheduled_time=kwargs.get("scheduled_time"),
                        account_id=account_ids[platform.value]
                    )
                    
                    result = await self.publish_to_platform(publish_request)
                    results.append(result)
                    
                except Exception as e:
                    self.logger.error(f"Failed to publish to {platform.value}: {str(e)}")
                    results.append({
                        "success": False,
                        "platform": platform.value,
                        "error": str(e)
                    })
            
            return {
                "project_id": project.id,
                "video_url": video_url,
                "title": title,
                "duration": sum(scene.duration for scene in scenes),
                "scenes_count": len(scenes),
                "publish_results": results,
                "status": "completed"
            }
            
        except Exception as e:
            self.logger.error(f"Error in create_and_publish workflow: {str(e)}")
            raise

    async def get_video_analytics(self, video_id: str) -> Dict[str, Any]:
        """Get analytics for published video across platforms"""
        # Would integrate with platform APIs to get real analytics
        video = self.videos_store.get(video_id)
        if not video:
            raise ValueError(f"Video {video_id} not found")
        
        # Mock analytics for now
        return {
            "video_id": video_id,
            "title": video.title,
            "total_views": 1234,
            "total_likes": 89,
            "total_shares": 23,
            "engagement_rate": 7.2,
            "platform_breakdown": {
                platform.value: {
                    "views": 300,
                    "likes": 20,
                    "shares": 5,
                    "comments": 3
                }
                for platform in video.platforms
            }
        }

    async def _save_to_supabase(self, project_id: str, data: Dict[str, Any]):
        """Save video project to Supabase"""
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not initialized, skipping save")
                return

            # Get the video project from in-memory store
            video = self.videos_store.get(project_id)
            if not video:
                self.logger.warning(f"Project {project_id} not found in store")
                return

            # Prepare data for Supabase
            update_data = {
                "status": video.status.value if hasattr(video.status, 'value') else str(video.status),
                "updated_at": datetime.now().isoformat(),
                **data  # Merge additional data
            }

            # Update ai_video_projects table
            result = self.supabase.table('ai_video_projects')\
                .update(update_data)\
                .eq('id', project_id)\
                .execute()

            if result.data:
                self.logger.info(f"Successfully saved project {project_id} to Supabase")
            else:
                self.logger.warning(f"No rows updated for project {project_id}")

        except Exception as e:
            self.logger.error(f"Error saving to Supabase: {str(e)}")

# Usage example:
async def main():
    agent = InternalPublisherAgent(
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        supabase_client=None  # Your Supabase client
    )
    
    # Create and publish video for Grey Nomads campaign
    result = await agent.create_and_publish_video(
        prompt="Create an engaging video about the best RV destinations in Australia for Grey Nomads",
        title="Top 10 RV Destinations for Grey Nomads",
        platforms=[PublishPlatform.FACEBOOK, PublishPlatform.YOUTUBE],
        caption="Discover the ultimate RV destinations across Australia! Perfect for Grey Nomads seeking adventure.",
        account_ids={
            "facebook": "your-fb-account-id",
            "youtube": "your-yt-channel-id"
        },
        target_audience="Adults 55+ interested in RV travel",
        duration=90,
        hashtags=["GreyNomads", "RVTravel", "Australia", "RetirementTravel"],
        music_url="https://example.com/upbeat-travel-music.mp3"
    )

    logger.info(f"Video created and published: {result}")

if __name__ == "__main__":
    asyncio.run(main())
