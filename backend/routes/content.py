from fastapi import APIRouter, Depends
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel

from backend.models import APIResponse
from backend.auth import verify_token
from backend.config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content", tags=["content"])

class ContentBriefRequest(BaseModel):
    title: str
    content_type: str
    target_audience: str
    key_messages: List[str]
    platform: str
    tone: Optional[str] = "professional"
    length: Optional[str] = "medium"
    keywords: Optional[List[str]] = []
    cta: Optional[str] = None

@router.post("/generate", response_model=APIResponse)
async def generate_content(brief: ContentBriefRequest, token: str = Depends(verify_token)):
    """Generate AI-powered content based on brief"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.content_agent.create_content(
                content_type=brief.content_type,
                platform=brief.platform,
                brief={
                    "title": brief.title,
                    "target_audience": brief.target_audience,
                    "key_messages": brief.key_messages,
                    "tone": brief.tone,
                    "length": brief.length,
                    "keywords": brief.keywords,
                    "cta": brief.cta
                }
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            # Mock content generation
            mock_content = {
                "id": str(uuid.uuid4()),
                "title": brief.title,
                "content": f"AI-generated {brief.content_type} content for {brief.target_audience}. This content focuses on {', '.join(brief.key_messages[:3])} with a {brief.tone} tone.",
                "html_content": f"<h2>{brief.title}</h2><p>AI-generated {brief.content_type} content for <strong>{brief.target_audience}</strong>.</p><p>This content focuses on {', '.join(brief.key_messages[:3])} with a {brief.tone} tone.</p>",
                "cta": brief.cta or "Take Action Now",
                "seo_score": 85,
                "readability_score": 92,
                "engagement_prediction": 0.78,
                "tags": brief.keywords[:5] if brief.keywords else ["marketing", "growth", "engagement"],
                "status": "generated",
                "created_at": datetime.now().isoformat() + "Z"
            }
            return APIResponse(success=True, data=mock_content)
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        return APIResponse(success=False, error=str(e))

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
