"""
Assessment-Based Lead Generation System - FastAPI Routes
Implements high-converting assessment funnels (20-40% conversion rate)
Based on The Online Assessment Lead Generation Method
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, EmailStr, Field, validator
import uuid
from datetime import datetime, date, timedelta
import logging

from database import get_supabase_client
from auth import verify_token, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/assessments", tags=["assessments"])

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class AssessmentGenerationRequest(BaseModel):
    """Request to generate a new assessment"""
    business_type: str = Field(..., min_length=1, description="Type of business")
    target_audience: str = Field(..., min_length=1, description="Target audience description")
    product_offer: str = Field(..., min_length=1, description="Product or service being offered")
    assessment_goal: str = Field(..., min_length=1, description="Goal of the assessment")
    campaign_id: Optional[str] = Field(None, description="Associated campaign ID")


class AssessmentSubmissionRequest(BaseModel):
    """Request to submit assessment answers"""
    email: EmailStr = Field(..., description="Lead email (required)")
    name: Optional[str] = Field(None, description="Lead name")
    phone: Optional[str] = Field(None, description="Lead phone")
    answers: Dict[str, Any] = Field(..., description="Question ID -> Answer value mapping")
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None
    referrer: Optional[str] = None
    device_type: Optional[str] = None
    started_at: Optional[str] = None  # ISO timestamp when started

    @validator('answers')
    def validate_answers(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one answer is required")
        return v


class AssessmentUpdateRequest(BaseModel):
    """Request to update assessment template"""
    name: Optional[str] = None
    description: Optional[str] = None
    headline: Optional[str] = None
    subheadline: Optional[str] = None
    questions: Optional[List[Dict[str, Any]]] = None
    scoring_logic: Optional[Dict[str, Any]] = None
    result_categories: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = Field(None, pattern="^(draft|published|archived)$")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_score(answers: Dict[str, Any], scoring_logic: Dict[str, Any]) -> int:
    """
    Calculate assessment score from answers

    Args:
        answers: Question ID -> Answer value mapping
        scoring_logic: Question ID -> Answer -> Points mapping

    Returns:
        Total score (0-100)
    """
    total_score = 0

    for question_id, answer_value in answers.items():
        if question_id in scoring_logic:
            # Get point value for this answer
            if isinstance(answer_value, str):
                points = scoring_logic[question_id].get(answer_value, 0)
            elif isinstance(answer_value, list):
                # Multiple selection - sum all selected options
                points = sum(
                    scoring_logic[question_id].get(val, 0)
                    for val in answer_value
                )
            else:
                points = 0

            total_score += points

    # Ensure score is within 0-100 range
    return max(0, min(100, total_score))


def get_result_category(score: int, result_categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get result category based on score

    Args:
        score: Assessment score (0-100)
        result_categories: List of category definitions

    Returns:
        Matching category dict
    """
    for category in result_categories:
        if category['min_score'] <= score <= category['max_score']:
            return category

    # Fallback to first category if no match
    return result_categories[0] if result_categories else {
        "name": "unknown",
        "label": "Unknown",
        "message": "Your results",
        "cta_text": "Next Steps",
        "cta_action": "contact"
    }


async def create_or_update_lead(
    email: str,
    name: Optional[str],
    phone: Optional[str],
    assessment_id: str,
    campaign_id: Optional[str],
    score: int,
    result_category: str,
    answers: Dict[str, Any],
    supabase: Any
) -> str:
    """
    Create new lead or update existing lead with assessment data

    Returns:
        Lead ID
    """
    # Check if lead exists
    existing_lead = supabase.table('leads').select('id, tags, custom_fields').eq('email', email).execute()

    lead_data = {
        'email': email,
        'name': name,
        'phone': phone,
        'source': 'assessment',
        'campaign_id': campaign_id,
        'status': 'new',
        'score': score,
        'tags': [f'assessment-{result_category}', 'assessment-completed'],
        'custom_fields': {
            'assessment_id': assessment_id,
            'assessment_score': score,
            'assessment_category': result_category,
            'assessment_completed_at': datetime.now().isoformat()
        }
    }

    if existing_lead.data and len(existing_lead.data) > 0:
        # Update existing lead
        lead_id = existing_lead.data[0]['id']
        existing_tags = existing_lead.data[0].get('tags', [])
        existing_custom = existing_lead.data[0].get('custom_fields', {})

        # Merge tags (avoid duplicates)
        new_tags = list(set(existing_tags + lead_data['tags']))

        # Merge custom fields
        merged_custom = {**existing_custom, **lead_data['custom_fields']}

        supabase.table('leads').update({
            'score': score,
            'tags': new_tags,
            'custom_fields': merged_custom,
            'updated_at': datetime.now().isoformat()
        }).eq('id', lead_id).execute()

        logger.info(f"Updated existing lead {lead_id} with assessment data")
    else:
        # Create new lead
        lead_data['id'] = str(uuid.uuid4())
        result = supabase.table('leads').insert(lead_data).execute()
        lead_id = result.data[0]['id']
        logger.info(f"Created new lead {lead_id} from assessment")

    return lead_id


# ============================================================================
# PUBLIC ENDPOINTS (No Auth Required)
# ============================================================================

@router.get("/public/{assessment_id}")
async def get_public_assessment(assessment_id: str):
    """
    Get published assessment for public access
    No authentication required

    Returns landing page content and questions
    Tracks view in analytics
    """
    supabase = get_supabase_client()

    try:
        # Get assessment
        result = supabase.table('assessment_templates') \
            .select('*') \
            .eq('id', assessment_id) \
            .eq('status', 'published') \
            .single() \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Assessment not found or not published")

        assessment = result.data

        # Track view
        try:
            supabase.rpc('track_assessment_view', {
                'p_assessment_id': assessment_id,
                'p_user_id': assessment['user_id']
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to track assessment view: {e}")

        # Return public-safe data (hide user_id, internal fields)
        return {
            "success": True,
            "assessment": {
                "id": assessment['id'],
                "name": assessment['name'],
                "description": assessment.get('description'),
                "headline": assessment['headline'],
                "subheadline": assessment['subheadline'],
                "questions": assessment['questions'],
                "total_questions": len(assessment['questions']),
                "estimated_time": "3-5 minutes",
                "created_at": assessment['created_at']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching public assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching assessment: {str(e)}")


@router.post("/public/{assessment_id}/submit")
async def submit_assessment_response(
    assessment_id: str,
    submission: AssessmentSubmissionRequest,
    request: Request
):
    """
    Submit assessment response (public endpoint)

    1. Calculate score from answers
    2. Determine result category
    3. Create/update lead
    4. Save response
    5. Track analytics
    6. Return personalized results

    No authentication required (public form submission)
    """
    supabase = get_supabase_client()

    try:
        # Get assessment (with scoring logic)
        assessment_result = supabase.table('assessment_templates') \
            .select('*') \
            .eq('id', assessment_id) \
            .eq('status', 'published') \
            .single() \
            .execute()

        if not assessment_result.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        assessment = assessment_result.data

        # Calculate score
        score = calculate_score(submission.answers, assessment['scoring_logic'])

        # Get result category
        result_category_data = get_result_category(score, assessment['result_categories'])
        result_category_name = result_category_data['name']

        # Create or update lead
        lead_id = await create_or_update_lead(
            email=submission.email,
            name=submission.name,
            phone=submission.phone,
            assessment_id=assessment_id,
            campaign_id=assessment.get('campaign_id'),
            score=score,
            result_category=result_category_name,
            answers=submission.answers,
            supabase=supabase
        )

        # Calculate completion time
        completion_time = None
        if submission.started_at:
            try:
                started = datetime.fromisoformat(submission.started_at.replace('Z', '+00:00'))
                completed = datetime.now()
                completion_time = int((completed - started).total_seconds())
            except:
                pass

        # Get client IP
        client_ip = request.client.host if request.client else None

        # Save response
        response_id = str(uuid.uuid4())
        response_data = {
            'id': response_id,
            'assessment_id': assessment_id,
            'campaign_id': assessment.get('campaign_id'),
            'user_id': assessment['user_id'],
            'lead_id': lead_id,
            'lead_email': submission.email,
            'lead_name': submission.name,
            'lead_phone': submission.phone,
            'answers': submission.answers,
            'score': score,
            'score_percentage': round(score, 2),
            'result_category': result_category_name,
            'started_at': submission.started_at,
            'completed_at': datetime.now().isoformat(),
            'completion_time': completion_time,
            'questions_answered': len(submission.answers),
            'device_type': submission.device_type,
            'utm_source': submission.utm_source,
            'utm_medium': submission.utm_medium,
            'utm_campaign': submission.utm_campaign,
            'utm_content': submission.utm_content,
            'utm_term': submission.utm_term,
            'referrer': submission.referrer,
            'ip_address': client_ip,
            'email_sent': False,
            'results_viewed': True,
            'results_viewed_at': datetime.now().isoformat()
        }

        supabase.table('assessment_responses').insert(response_data).execute()

        # Track analytics
        try:
            supabase.rpc('track_assessment_completion', {
                'p_assessment_id': assessment_id,
                'p_user_id': assessment['user_id'],
                'p_email_captured': True
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to track assessment completion: {e}")

        # TODO: Send results email (integrate with email service)
        # TODO: Trigger autopilot workflow based on score

        # Return personalized results
        return {
            "success": True,
            "response_id": response_id,
            "lead_id": lead_id,
            "score": score,
            "result": {
                "category": result_category_data['name'],
                "label": result_category_data['label'],
                "score": score,
                "message": result_category_data['message'],
                "insights": result_category_data.get('insights', []),
                "cta": {
                    "text": result_category_data['cta_text'],
                    "action": result_category_data['cta_action']
                }
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting assessment response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error submitting response: {str(e)}")


# ============================================================================
# AUTHENTICATED ENDPOINTS (Require User Auth)
# ============================================================================

@router.post("/generate")
async def generate_assessment(
    request: AssessmentGenerationRequest,
    token: str = Depends(verify_token)
):
    """
    Generate new assessment using AI

    Calls assessment-generator Edge Function
    Saves as draft for user review/approval
    """
    supabase = get_supabase_client()
    user_data = get_current_user(token)

    try:
        # Call Edge Function to generate assessment
        edge_result = supabase.functions.invoke('assessment-generator', {
            'body': {
                'businessType': request.business_type,
                'targetAudience': request.target_audience,
                'productOffer': request.product_offer,
                'assessmentGoal': request.assessment_goal,
                'campaignId': request.campaign_id,
                'userId': user_data['id']
            }
        })

        if edge_result.get('error'):
            raise HTTPException(status_code=500, detail=f"Assessment generation failed: {edge_result['error']}")

        generated = edge_result['data']['assessment']

        # Save as draft
        assessment_id = str(uuid.uuid4())
        assessment_data = {
            'id': assessment_id,
            'user_id': user_data['id'],
            'campaign_id': request.campaign_id,
            'name': f"Assessment for {request.business_type}",
            'description': f"Generated for {request.target_audience}",
            'headline': generated['landing_page']['headline'],
            'subheadline': generated['landing_page']['subheadline'],
            'questions': generated['questions'],
            'scoring_logic': generated['scoring_logic'],
            'result_categories': generated['result_categories'],
            'status': 'draft'
        }

        supabase.table('assessment_templates').insert(assessment_data).execute()

        logger.info(f"Generated assessment {assessment_id} for user {user_data['id']}")

        return {
            "success": True,
            "assessment_id": assessment_id,
            "assessment": generated,
            "metadata": edge_result['data'].get('metadata', {})
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating assessment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating assessment: {str(e)}")


@router.get("/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    token: str = Depends(verify_token)
):
    """Get assessment by ID (owner only)"""
    supabase = get_supabase_client()
    user_data = get_current_user(token)

    try:
        result = supabase.table('assessment_templates') \
            .select('*') \
            .eq('id', assessment_id) \
            .eq('user_id', user_data['id']) \
            .single() \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        return {
            "success": True,
            "assessment": result.data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching assessment: {str(e)}")


@router.patch("/{assessment_id}")
async def update_assessment(
    assessment_id: str,
    update_data: AssessmentUpdateRequest,
    token: str = Depends(verify_token)
):
    """Update assessment (owner only)"""
    supabase = get_supabase_client()
    user_data = get_current_user(token)

    try:
        # Verify ownership
        existing = supabase.table('assessment_templates') \
            .select('user_id') \
            .eq('id', assessment_id) \
            .single() \
            .execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        if existing.data['user_id'] != user_data['id']:
            raise HTTPException(status_code=403, detail="Not authorized to update this assessment")

        # Build update dict (only include provided fields)
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}

        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_dict['updated_at'] = datetime.now().isoformat()

        # If publishing, set published_at
        if update_dict.get('status') == 'published':
            update_dict['published_at'] = datetime.now().isoformat()

        # Update
        result = supabase.table('assessment_templates') \
            .update(update_dict) \
            .eq('id', assessment_id) \
            .execute()

        logger.info(f"Updated assessment {assessment_id}")

        return {
            "success": True,
            "assessment": result.data[0] if result.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating assessment: {str(e)}")


@router.get("/{assessment_id}/analytics")
async def get_assessment_analytics(
    assessment_id: str,
    days: int = 30,
    token: str = Depends(verify_token)
):
    """
    Get analytics for assessment

    Returns:
    - Daily funnel metrics
    - Overall conversion rates
    - Score distribution
    - Recent responses
    """
    supabase = get_supabase_client()
    user_data = get_current_user(token)

    try:
        # Verify ownership
        assessment = supabase.table('assessment_templates') \
            .select('user_id, name, total_views, total_completions, conversion_rate') \
            .eq('id', assessment_id) \
            .single() \
            .execute()

        if not assessment.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        if assessment.data['user_id'] != user_data['id']:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Get daily analytics
        start_date = (date.today() - timedelta(days=days)).isoformat()
        daily_analytics = supabase.table('assessment_analytics') \
            .select('*') \
            .eq('assessment_id', assessment_id) \
            .gte('date', start_date) \
            .order('date', desc=True) \
            .execute()

        # Get response distribution
        responses = supabase.table('assessment_responses') \
            .select('score, result_category, completed_at') \
            .eq('assessment_id', assessment_id) \
            .order('completed_at', desc=True) \
            .limit(100) \
            .execute()

        # Calculate score distribution
        score_distribution = {'high': 0, 'medium': 0, 'low': 0}
        if responses.data:
            for response in responses.data:
                category = response.get('result_category', 'low')
                score_distribution[category] = score_distribution.get(category, 0) + 1

        # Calculate averages from daily data
        total_views = sum(d['views'] for d in daily_analytics.data) if daily_analytics.data else 0
        total_completions = sum(d['completions'] for d in daily_analytics.data) if daily_analytics.data else 0
        total_emails = sum(d['emails_captured'] for d in daily_analytics.data) if daily_analytics.data else 0

        overall_conversion = (total_emails / total_views * 100) if total_views > 0 else 0

        return {
            "success": True,
            "assessment_name": assessment.data['name'],
            "summary": {
                "total_views": total_views,
                "total_completions": total_completions,
                "total_emails_captured": total_emails,
                "overall_conversion_rate": round(overall_conversion, 2),
                "avg_score": assessment.data.get('avg_score'),
            },
            "daily_analytics": daily_analytics.data,
            "score_distribution": score_distribution,
            "recent_responses": responses.data[:10] if responses.data else []
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")


@router.get("")
async def list_assessments(
    status: Optional[str] = None,
    campaign_id: Optional[str] = None,
    token: str = Depends(verify_token)
):
    """List user's assessments with optional filters"""
    supabase = get_supabase_client()
    user_data = get_current_user(token)

    try:
        query = supabase.table('assessment_templates') \
            .select('id, name, status, campaign_id, total_views, total_completions, conversion_rate, created_at, updated_at') \
            .eq('user_id', user_data['id'])

        if status:
            query = query.eq('status', status)

        if campaign_id:
            query = query.eq('campaign_id', campaign_id)

        result = query.order('created_at', desc=True).execute()

        return {
            "success": True,
            "assessments": result.data,
            "count": len(result.data) if result.data else 0
        }

    except Exception as e:
        logger.error(f"Error listing assessments: {e}")
        raise HTTPException(status_code=500, detail=f"Error listing assessments: {str(e)}")
