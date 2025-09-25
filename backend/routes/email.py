from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

router = APIRouter(prefix="/api/email", tags=["email"])
logger = logging.getLogger(__name__)

@router.post("/send")
async def send_email(email_data: Dict[str, Any]):
    """Send email endpoint"""
    try:
        return {
            "status": "success",
            "message": "Email queued for sending",
            "email_id": "placeholder-email-id"
        }
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/templates")
async def get_email_templates():
    """Get available email templates"""
    return {
        "templates": [
            {"id": "welcome", "name": "Welcome Email"},
            {"id": "newsletter", "name": "Newsletter Template"}
        ]
    }