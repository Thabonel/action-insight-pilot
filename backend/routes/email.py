from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/email", tags=["email"])

@router.get("/campaigns/{campaign_id}/metrics", response_model=APIResponse)
async def get_email_real_time_metrics(
    campaign_id: str, 
    time_range: str = "24h",
    token: str = Depends(verify_token)
):
    """Get real-time email campaign metrics"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.email_agent.get_campaign_metrics(campaign_id, time_range)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="AI agents not available")
    except Exception as e:
        logger.error(f"Error getting email metrics for campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/campaigns", response_model=APIResponse)
async def create_email_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new email campaign"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.email_agent.create_campaign(
                name=campaign_data.get("name"),
                subject=campaign_data.get("subject"),
                content=campaign_data.get("content"),
                recipients=campaign_data.get("recipients", []),
                send_time=campaign_data.get("send_time")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="AI agents not available")
    except Exception as e:
        logger.error(f"Error creating email campaign: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/content/generate", response_model=APIResponse)
async def generate_email_content(content_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Generate AI-powered email content"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.email_agent.generate_content(
                campaign_type=content_data.get("campaign_type"),
                audience=content_data.get("audience"),
                template=content_data.get("template")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="AI agents not available")
    except Exception as e:
        logger.error(f"Error generating email content: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/ab-variants", response_model=APIResponse)
async def generate_ab_variants(variant_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Generate A/B test variants"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.email_agent.generate_ab_variants(
                base_content=variant_data.get("base_content")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="AI agents not available")
    except Exception as e:
        logger.error(f"Error generating A/B variants: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/send-time/optimize", response_model=APIResponse)
async def optimize_send_time(timing_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Suggest optimal send time"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.email_agent.optimize_send_time(
                audience=timing_data.get("audience"),
                campaign_type=timing_data.get("campaign_type")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="AI agents not available")
    except Exception as e:
        logger.error(f"Error optimizing send time: {e}")
        return APIResponse(success=False, error=str(e))
