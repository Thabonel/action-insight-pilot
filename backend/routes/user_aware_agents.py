from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import json
from datetime import datetime

from agents.enhanced_user_ai_service import EnhancedUserAIService
from database.supabase_client import get_supabase
from auth import verify_token

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

class CampaignCreateRequest(BaseModel):
    name: str
    type: str = "content"
    channel: str = "email"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

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
                'budget_allocated': float(campaign.get('budget_allocated') or 0),
                'budget_spent': float(campaign.get('budget_spent') or 0),
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

async def verify_campaign_ownership(campaign_id: str, user_id: str):
    """Verify that the campaign belongs to the authenticated user"""
    try:
        supabase = get_supabase()
        result = supabase.table('campaigns')\
            .select('id, created_by')\
            .eq('id', campaign_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = result.data[0]
        if campaign.get('created_by') != user_id:
            raise HTTPException(status_code=403, detail="Access denied: Campaign belongs to another user")
        
        return campaign
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to verify campaign ownership: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/api/agents/daily-focus")
async def daily_focus_agent(
    request: DailyFocusRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Generate daily focus recommendations using user's OpenAI API key and knowledge base
    """
    try:
        logger.info(f"Daily focus request for user {user_id}: {request.query}")
        
        # Initialize enhanced AI service
        enhanced_ai = EnhancedUserAIService(user_id)
        
        # Check if user has API key configured
        if not await enhanced_ai.has_api_key():
            raise HTTPException(
                status_code=400, 
                detail="OpenAI API key not configured. Please add your API key in Settings > Integrations."
            )
        
        # Get fresh campaign data from Supabase
        campaigns = await get_user_campaigns(user_id)
        
        if not campaigns:
            logger.warning(f"No campaigns found for user {user_id}")
        
        # Generate AI response using enhanced service with knowledge base
        result = await enhanced_ai.generate_daily_focus_with_knowledge(
            query=request.query,
            campaigns=campaigns,
            context=request.context
        )
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'AI processing failed'))
        
        logger.info(f"✅ Enhanced daily focus generated successfully for user {user_id}")
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
    Handle general campaign queries using user's OpenAI API key and knowledge base
    """
    try:
        logger.info(f"General query request for user {user_id}: {request.task_type}")
        
        # Initialize enhanced AI service
        enhanced_ai = EnhancedUserAIService(user_id)
        
        # Check if user has API key configured
        if not await enhanced_ai.has_api_key():
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
        
        # Process query using enhanced service with knowledge base
        result = await enhanced_ai.process_general_query_with_knowledge(
            query=query,
            campaigns=campaigns,
            context=context
        )
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'AI processing failed'))
        
        logger.info(f"✅ Enhanced general query processed successfully for user {user_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ General campaign agent failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Campaigns endpoint
@router.get("/api/campaigns")
async def get_campaigns(user_id: str = Depends(get_current_user)):
    """
    Retrieve campaigns for the authenticated user.
    """
    try:
        campaigns = await get_user_campaigns(user_id)
        return {"success": True, "data": campaigns}
    except Exception as e:
        logger.error(f"Failed to retrieve campaigns for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/campaigns")
async def create_campaign(
    request: CampaignCreateRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Create a new campaign for the authenticated user.
    """
    try:
        supabase = get_supabase()
        
        # Map frontend type to valid enum value
        type_mapping = {
            "mixed": "content",
            "marketing": "content",
            "email": "email",
            "social": "social"
        }
        campaign_type = type_mapping.get(request.type, "content")
        
        campaign_data = {
            "name": request.name,
            "type": campaign_type,
            "channel": request.channel,
            "status": "draft",
            "created_by": user_id
        }
        
        if request.start_date:
            campaign_data["start_date"] = request.start_date
        if request.end_date:
            campaign_data["end_date"] = request.end_date
            
        result = supabase.table('campaigns').insert(campaign_data).execute()
        
        logger.info(f"✅ Created campaign for user {user_id}")
        return {"success": True, "data": result.data[0]}
        
    except Exception as e:
        logger.error(f"❌ Failed to create campaign for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Permanently delete a campaign for the authenticated user.
    """
    try:
        # Verify campaign ownership
        await verify_campaign_ownership(campaign_id, user_id)
        
        supabase = get_supabase()
        
        # Delete the campaign
        result = supabase.table('campaigns')\
            .delete()\
            .eq('id', campaign_id)\
            .execute()
        
        logger.info(f"✅ Deleted campaign {campaign_id} for user {user_id}")
        return {"success": True, "message": "Campaign deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to delete campaign {campaign_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/campaigns/{campaign_id}/archive")
async def archive_campaign(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Archive a campaign for the authenticated user.
    """
    try:
        # Verify campaign ownership
        await verify_campaign_ownership(campaign_id, user_id)
        
        supabase = get_supabase()
        
        # Update campaign status to archived
        result = supabase.table('campaigns')\
            .update({"status": "archived", "updated_at": datetime.utcnow().isoformat()})\
            .eq('id', campaign_id)\
            .execute()
        
        if result.data:
            logger.info(f"✅ Archived campaign {campaign_id} for user {user_id}")
            return {"success": True, "data": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to archive campaign")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to archive campaign {campaign_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/campaigns/{campaign_id}/restore")
async def restore_campaign(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Restore an archived campaign for the authenticated user.
    """
    try:
        # Verify campaign ownership
        await verify_campaign_ownership(campaign_id, user_id)
        
        supabase = get_supabase()
        
        # Update campaign status to active
        result = supabase.table('campaigns')\
            .update({"status": "active", "updated_at": datetime.utcnow().isoformat()})\
            .eq('id', campaign_id)\
            .execute()
        
        if result.data:
            logger.info(f"✅ Restored campaign {campaign_id} for user {user_id}")
            return {"success": True, "data": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to restore campaign")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to restore campaign {campaign_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@router.get("/healthcheck")
async def health_check():
    """
    Endpoint to check the health of the agent service.
    """
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}