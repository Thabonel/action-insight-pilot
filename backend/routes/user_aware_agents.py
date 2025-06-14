
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import json
from datetime import datetime

from ..agents.user_ai_service import UserAIService
from ..database.supabase_client import get_supabase
from ..auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

class DailyFocusRequest(BaseModel):
    query: str
    campaigns: List[Dict[str, Any]]
    context: List[Dict[str, Any]] = []
    date: str

class GeneralQueryRequest(BaseModel):
    task_type: str
    input_data: Dict[str, Any]

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user ID from JWT token"""
    try:
        user_data = verify_token(credentials.credentials)
        return user_data.get('sub')  # user ID from JWT
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

async def get_user_campaigns(user_id: str) -> List[Dict[str, Any]]:
    """Fetch user's campaigns from Supabase"""
    try:
        supabase = get_supabase()
        
        # Get campaigns created by or associated with the user
        result = supabase.table('campaigns')\
            .select('*')\
            .eq('created_by', user_id)\
            .execute()
        
        campaigns = result.data or []
        logger.info(f"✅ Retrieved {len(campaigns)} campaigns for user {user_id}")
        
        # Transform campaigns to expected format
        formatted_campaigns = []
        for campaign in campaigns:
            formatted_campaigns.append({
                'id': campaign.get('id'),
                'name': campaign.get('name'),
                'type': campaign.get('type'),
                'status': campaign.get('status'),
                'channel': campaign.get('channel'),
                'budget_allocated': float(campaign.get('budget_allocated', 0)),
                'budget_spent': float(campaign.get('budget_spent', 0)),
                'metrics': campaign.get('metrics', {}),
                'target_audience': campaign.get('target_audience', {}),
                'content': campaign.get('content', {}),
                'start_date': campaign.get('start_date'),
                'end_date': campaign.get('end_date'),
                'created_at': campaign.get('created_at')
            })
        
        return formatted_campaigns
        
    except Exception as e:
        logger.error(f"❌ Failed to get campaigns for user {user_id}: {e}")
        return []

@router.post("/api/agents/daily-focus")
async def daily_focus_agent(
    request: DailyFocusRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Generate daily focus recommendations using user's own OpenAI API key
    """
    try:
        logger.info(f"Daily focus request for user {user_id}: {request.query}")
        
        # Initialize user-specific AI service
        user_ai = UserAIService(user_id)
        
        # Check if user has API key configured
        if not await user_ai.has_api_key():
            raise HTTPException(
                status_code=400, 
                detail="OpenAI API key not configured. Please add your API key in Settings > Integrations."
            )
        
        # Get fresh campaign data from Supabase instead of using request data
        campaigns = await get_user_campaigns(user_id)
        
        if not campaigns:
            logger.warning(f"No campaigns found for user {user_id}")
        
        # Generate AI response using user's API key
        result = await user_ai.generate_daily_focus(
            query=request.query,
            campaigns=campaigns,
            context=request.context
        )
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'AI processing failed'))
        
        logger.info(f"✅ Daily focus generated successfully for user {user_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Daily focus agent failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/agents/campaign")
async def general_campaign_agent(
    request: GeneralQueryRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Handle general campaign queries using user's own OpenAI API key
    """
    try:
        logger.info(f"General query request for user {user_id}: {request.task_type}")
        
        # Initialize user-specific AI service
        user_ai = UserAIService(user_id)
        
        # Check if user has API key configured
        if not await user_ai.has_api_key():
            raise HTTPException(
                status_code=400, 
                detail="OpenAI API key not configured. Please add your API key in Settings > Integrations."
            )
        
        # Extract query parameters
        input_data = request.input_data
        query = input_data.get('query', '')
        context = input_data.get('context', [])
        
        # Get fresh campaign data from Supabase
        campaigns = await get_user_campaigns(user_id)
        
        if not campaigns:
            logger.warning(f"No campaigns found for user {user_id}")
        
        # Process query using user's API key
        result = await user_ai.process_general_query(
            query=query,
            campaigns=campaigns,
            context=context
        )
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'AI processing failed'))
        
        logger.info(f"✅ General query processed successfully for user {user_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ General campaign agent failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/campaigns")
async def get_campaigns(user_id: str = Depends(get_current_user)):
    """
    Get user's campaigns with accurate count
    """
    try:
        campaigns = await get_user_campaigns(user_id)
        
        return {
            "success": True,
            "data": campaigns,
            "count": len(campaigns)
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get campaigns for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "user-aware-agents"
    }
