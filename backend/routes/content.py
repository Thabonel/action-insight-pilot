from fastapi import APIRouter, Depends
from typing import Dict, Any
import uuid
from datetime import datetime
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content", tags=["content"])

@router.post("/create", response_model=APIResponse)
async def create_content(content_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create new content"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.content_agent.create_content(
                content_type=content_data.get("type"),
                platform=content_data.get("platform"),
                brief=content_data.get("brief"),
                target_audience=content_data.get("target_audience")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            new_content = {
                "id": str(uuid.uuid4()),
                "title": content_data.get("title", "Generated Content"),
                "content": "This is AI-generated content based on your prompt.",
                "type": content_data.get("type", "blog_post"),
                "status": "draft",
                "created_at": datetime.now().isoformat() + "Z",
                **content_data
            }
            return APIResponse(success=True, data=new_content)
    except Exception as e:
        logger.error(f"Error creating content: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/library", response_model=APIResponse)
async def get_content_library(content_type: str = None, platform: str = None, token: str = Depends(verify_token)):
    """Get content library"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.content_agent.get_content_library(content_type, platform)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_content = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "10 Marketing Tips for 2024",
                    "type": "blog_post",
                    "status": "published",
                    "engagement": 245,
                    "created_at": "2024-01-10T10:00:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Product Launch Email Template",
                    "type": "email_template",
                    "status": "draft",
                    "engagement": 0,
                    "created_at": "2024-01-12T15:30:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_content)
    except Exception as e:
        logger.error(f"Error getting content library: {e}")
        return APIResponse(success=False, error=str(e))
