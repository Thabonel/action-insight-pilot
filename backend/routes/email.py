
from fastapi import APIRouter, Depends
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel

from models import APIResponse
from auth import verify_token
from config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/email", tags=["email"])

class EmailTemplateVersionRequest(BaseModel):
    template_id: str
    subject_line: Optional[str] = None
    html_content: Optional[str] = None
    text_content: Optional[str] = None
    merge_tags: Optional[List[str]] = None
    changelog: Optional[str] = None

class PersonalizedEmailRequest(BaseModel):
    template_id: str
    recipient_data: Dict[str, Any]
    campaign_id: Optional[str] = None

class WebhookRequest(BaseModel):
    url: str
    events: List[str] = ["sent", "opened", "clicked"]
    secret: Optional[str] = None
    headers: Optional[Dict[str, str]] = None

@router.post("/templates/{template_id}/versions", response_model=APIResponse)
async def create_template_version(
    template_id: str, 
    version_request: EmailTemplateVersionRequest,
    token: str = Depends(verify_token)
):
    """Create a new version of an email template"""
    try:
        if agent_manager.agents_available:
            # Use enhanced email service
            from agents.email.enhanced_email_service import EnhancedEmailService
            email_service = EnhancedEmailService()
            
            result = await email_service.template_service.create_template_version(
                template_id,
                version_request.dict(exclude_unset=True)
            )
            return APIResponse(success=True, data=result)
        else:
            # Mock response
            mock_version = {
                "id": str(uuid.uuid4()),
                "template_id": template_id,
                "version": 2,
                "subject_line": version_request.subject_line or "Updated Subject Line",
                "created_at": datetime.now().isoformat() + "Z",
                "status": "draft"
            }
            return APIResponse(success=True, data=mock_version)
    except Exception as e:
        logger.error(f"Error creating template version: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/templates/{template_id}/versions", response_model=APIResponse)
async def get_template_versions(template_id: str, token: str = Depends(verify_token)):
    """Get all versions of a template"""
    try:
        if agent_manager.agents_available:
            from agents.email.enhanced_email_service import EnhancedEmailService
            email_service = EnhancedEmailService()
            
            versions = await email_service.template_service.get_template_versions(template_id)
            return APIResponse(success=True, data=versions)
        else:
            # Mock versions
            mock_versions = [
                {
                    "id": str(uuid.uuid4()),
                    "template_id": template_id,
                    "version": 2,
                    "subject_line": "Updated: Your exclusive offer awaits!",
                    "performance_score": 8.5,
                    "created_at": datetime.now().isoformat() + "Z",
                    "status": "active"
                },
                {
                    "id": str(uuid.uuid4()),
                    "template_id": template_id,
                    "version": 1,
                    "subject_line": "Your exclusive offer awaits!",
                    "performance_score": 7.2,
                    "created_at": datetime.now().isoformat() + "Z",
                    "status": "archived"
                }
            ]
            return APIResponse(success=True, data=mock_versions)
    except Exception as e:
        logger.error(f"Error getting template versions: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/send-personalized", response_model=APIResponse)
async def send_personalized_email(
    email_request: PersonalizedEmailRequest,
    token: str = Depends(verify_token)
):
    """Send personalized email with merge tags"""
    try:
        if agent_manager.agents_available:
            from agents.email.enhanced_email_service import EnhancedEmailService
            email_service = EnhancedEmailService()
            
            result = await email_service.send_personalized_email(
                email_request.template_id,
                email_request.recipient_data,
                email_request.campaign_id
            )
            return APIResponse(success=result["success"], data=result)
        else:
            # Mock response
            mock_result = {
                "success": True,
                "email_id": str(uuid.uuid4()),
                "sent_at": datetime.now().isoformat() + "Z",
                "recipient": email_request.recipient_data.get("email", "user@example.com"),
                "personalized_subject": f"Hello {email_request.recipient_data.get('first_name', 'there')}!"
            }
            return APIResponse(success=True, data=mock_result)
    except Exception as e:
        logger.error(f"Error sending personalized email: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/campaigns/{campaign_id}/metrics", response_model=APIResponse)
async def get_real_time_metrics(
    campaign_id: str, 
    time_range: str = "24h",
    token: str = Depends(verify_token)
):
    """Get real-time campaign metrics"""
    try:
        if agent_manager.agents_available:
            from agents.email.enhanced_email_service import EnhancedEmailService
            email_service = EnhancedEmailService()
            
            metrics = await email_service.get_campaign_analytics(campaign_id, time_range)
            return APIResponse(success=True, data=metrics)
        else:
            # Mock real-time metrics
            mock_metrics = {
                "total_sent": 1250,
                "total_delivered": 1180,
                "total_opened": 425,
                "total_clicked": 89,
                "total_bounced": 15,
                "total_unsubscribed": 3,
                "delivery_rate": 94.4,
                "open_rate": 36.0,
                "click_rate": 7.5,
                "bounce_rate": 1.2,
                "unsubscribe_rate": 0.25,
                "engagement_score": 18.2,
                "trends": [
                    {"timestamp": datetime.now().isoformat(), "opens": 45, "clicks": 12},
                    {"timestamp": datetime.now().isoformat(), "opens": 38, "clicks": 8}
                ],
                "insights": [
                    {
                        "type": "success",
                        "metric": "open_rate",
                        "message": "Excellent open rate! This subject line is performing well.",
                        "recommendation": "Save this template for future campaigns"
                    }
                ],
                "last_updated": datetime.now().isoformat() + "Z"
            }
            return APIResponse(success=True, data=mock_metrics)
    except Exception as e:
        logger.error(f"Error getting real-time metrics: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/webhooks", response_model=APIResponse)
async def register_webhook(webhook_request: WebhookRequest, token: str = Depends(verify_token)):
    """Register a webhook endpoint"""
    try:
        if agent_manager.agents_available:
            from agents.email.enhanced_email_service import EnhancedEmailService
            email_service = EnhancedEmailService()
            
            webhook_id = await email_service.webhook_service.register_webhook(
                webhook_request.dict()
            )
            return APIResponse(success=True, data={"webhook_id": webhook_id})
        else:
            # Mock webhook registration
            webhook_id = f"webhook_{uuid.uuid4()}"
            return APIResponse(success=True, data={"webhook_id": webhook_id})
    except Exception as e:
        logger.error(f"Error registering webhook: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/track/{email_id}/{event_type}", response_model=APIResponse)
async def track_email_event(
    email_id: str, 
    event_type: str,
    metadata: Optional[Dict[str, Any]] = None
):
    """Track email events (for webhook endpoints)"""
    try:
        if agent_manager.agents_available:
            from agents.email.enhanced_email_service import EnhancedEmailService
            email_service = EnhancedEmailService()
            
            success = await email_service.metrics_service.track_email_event(
                email_id, event_type, metadata or {}
            )
            
            if success:
                # Send webhook notification
                await email_service.webhook_service.send_webhook(event_type, {
                    "email_id": email_id,
                    "event_type": event_type,
                    "metadata": metadata
                })
            
            return APIResponse(success=success)
        else:
            return APIResponse(success=True, data={"tracked": True})
    except Exception as e:
        logger.error(f"Error tracking email event: {e}")
        return APIResponse(success=False, error=str(e))

