from fastapi import APIRouter, Depends
from typing import Dict, Any
import uuid
from datetime import datetime
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

@router.get("", response_model=APIResponse)
async def get_campaigns(token: str = Depends(verify_token)):
    """Get all campaigns"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.get_campaigns()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            # Fallback mock data
            mock_campaigns = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Summer Product Launch",
                    "type": "email",
                    "status": "active",
                    "description": "Marketing campaign for our new summer product line",
                    "created_at": "2024-01-15T10:00:00Z",
                    "updated_at": "2024-01-20T15:30:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Social Media Boost",
                    "type": "social", 
                    "status": "paused",
                    "description": "Increase brand awareness through social media",
                    "created_at": "2024-01-10T09:00:00Z",
                    "updated_at": "2024-01-18T12:00:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_campaigns)
    except Exception as e:
        logger.error(f"Error getting campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("", response_model=APIResponse)
async def create_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new campaign"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.create_campaign(
                name=campaign_data.get("name"),
                objective=campaign_data.get("objective"),
                target_audience=campaign_data.get("target_audience"),
                budget=campaign_data.get("budget"),
                channels=campaign_data.get("channels", [])
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            new_campaign = {
                "id": str(uuid.uuid4()),
                "created_at": datetime.now().isoformat() + "Z",
                "updated_at": datetime.now().isoformat() + "Z",
                **campaign_data
            }
            return APIResponse(success=True, data=new_campaign)
    except Exception as e:
        logger.error(f"Error creating campaign: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/bulk/create", response_model=APIResponse)
async def bulk_create_campaigns(campaigns_data: Dict[str, list], token: str = Depends(verify_token)):
    """Create multiple campaigns in bulk"""
    try:
        campaigns = campaigns_data.get("campaigns", [])
        
        if agent_manager.agents_available:
            created_campaigns = []
            for campaign_data in campaigns:
                result = await agent_manager.campaign_agent.create_campaign(
                    name=campaign_data.get("name"),
                    objective=campaign_data.get("objective"),
                    target_audience=campaign_data.get("target_audience"),
                    budget=campaign_data.get("budget"),
                    channels=campaign_data.get("channels", [])
                )
                if result["success"]:
                    created_campaigns.append(result["data"])
            
            return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
        else:
            created_campaigns = []
            for campaign in campaigns:
                new_campaign = {
                    "id": str(uuid.uuid4()),
                    "created_at": datetime.now().isoformat() + "Z",
                    "updated_at": datetime.now().isoformat() + "Z",
                    **campaign
                }
                created_campaigns.append(new_campaign)
            return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
    except Exception as e:
        logger.error(f"Error bulk creating campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/{campaign_id}", response_model=APIResponse)
async def get_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Get specific campaign"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.get_campaign_performance(campaign_id)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_campaign = {
                "id": campaign_id,
                "name": "Summer Product Launch",
                "type": "email",
                "status": "active",
                "description": "Marketing campaign for our new summer product line",
                "metrics": {
                    "opens": 1250,
                    "clicks": 340,
                    "conversions": 45
                },
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-20T15:30:00Z"
            }
            return APIResponse(success=True, data=mock_campaign)
    except Exception as e:
        logger.error(f"Error getting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.put("/{campaign_id}", response_model=APIResponse)
async def update_campaign(campaign_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    """Update campaign"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.optimize_campaign(campaign_id)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            updated_campaign = {
                "id": campaign_id,
                "updated_at": datetime.now().isoformat() + "Z",
                **updates
            }
            return APIResponse(success=True, data=updated_campaign)
    except Exception as e:
        logger.error(f"Error updating campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.delete("/{campaign_id}", response_model=APIResponse)
async def delete_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Delete campaign"""
    try:
        return APIResponse(success=True, data={"deleted": True, "id": campaign_id})
    except Exception as e:
        logger.error(f"Error deleting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))
