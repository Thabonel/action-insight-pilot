from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
import logging

from ..models import APIResponse
from ..auth import verify_token
from ..config import agent_manager

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
            # Mock data that matches EmailMetricsData interface
            mock_metrics = {
                "total_sent": 1250,
                "total_delivered": 1200,
                "total_opened": 480,
                "total_clicked": 96,
                "total_bounced": 50,
                "total_unsubscribed": 12,
                "delivery_rate": 96.0,
                "open_rate": 40.0,
                "click_rate": 8.0,
                "bounce_rate": 4.0,
                "unsubscribe_rate": 1.0,
                "engagement_score": 85,
                "trends": [
                    {
                        "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                        "opens": 120,
                        "clicks": 24
                    },
                    {
                        "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
                        "opens": 180,
                        "clicks": 36
                    },
                    {
                        "timestamp": datetime.now().isoformat(),
                        "opens": 180,
                        "clicks": 36
                    }
                ],
                "insights": [
                    {
                        "type": "success",
                        "metric": "open_rate",
                        "message": "Open rate is performing above average",
                        "recommendation": "Continue with current subject line strategy"
                    },
                    {
                        "type": "warning",
                        "metric": "click_rate",
                        "message": "Click-through rate could be improved",
                        "recommendation": "Consider A/B testing your call-to-action buttons"
                    }
                ],
                "last_updated": datetime.now().isoformat()
            }
            return APIResponse(success=True, data=mock_metrics)
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
            new_campaign = {
                "id": str(uuid.uuid4()),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                **campaign_data
            }
            return APIResponse(success=True, data=new_campaign)
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
            # Mock AI generated content
            mock_content = {
                "content": "🚀 Exciting News! Our latest product launch is here and we're thrilled to share it with you. Discover innovative features that will transform your workflow and boost productivity by 40%. Limited time offer - get 20% off your first month!",
                "subject_lines": [
                    {"text": "🚀 Revolutionary Product Launch - 40% Productivity Boost!", "score": 94},
                    {"text": "Transform Your Workflow Today - Limited Time Offer", "score": 87},
                    {"text": "Exclusive Access: Game-Changing Features Inside", "score": 91}
                ]
            }
            return APIResponse(success=True, data=mock_content)
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
            # Mock A/B variants
            mock_variants = {
                "variants": [
                    {"text": "Boost Your Success - Try Our New Features!", "score": 88},
                    {"text": "Unlock Premium Features - Special Launch Pricing", "score": 92},
                    {"text": "Don't Miss Out - Revolutionary Tools Inside", "score": 85}
                ]
            }
            return APIResponse(success=True, data=mock_variants)
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
            # Mock optimal timing
            mock_timing = {
                "optimal_time": "Tuesday 10:30 AM",
                "improvement": 23,
                "confidence": 87
            }
            return APIResponse(success=True, data=mock_timing)
    except Exception as e:
        logger.error(f"Error optimizing send time: {e}")
        return APIResponse(success=False, error=str(e))
