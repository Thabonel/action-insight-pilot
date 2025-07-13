from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel

from ..models import APIResponse
from ..auth import verify_token
from ..config import agent_manager

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
            raise HTTPException(status_code=503, detail="AI agents not available")
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
            raise HTTPException(status_code=503, detail="AI agents not available")
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
            raise HTTPException(status_code=503, detail="AI agents not available")
    except Exception as e:
        logger.error(f"Error getting content library: {e}")
        return APIResponse(success=False, error=str(e))
