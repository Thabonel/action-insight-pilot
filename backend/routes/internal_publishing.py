from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ..config import agent_manager

router = APIRouter()

class PublishingInput(BaseModel):
    prompt: str
    title: str
    caption: str
    music_url: str
    intro_url: str
    platform: str
    account_id: str

@router.post("/internal-publishing", tags=["internal"])
async def publish_with_internal_agent(input: PublishingInput):
    if not agent_manager.agents_available or not agent_manager.internal_publisher_agent:
        raise HTTPException(status_code=503, detail="InternalPublisherAgent not available")

    result = agent_manager.internal_publisher_agent.run(input.dict())
    return {
        "success": True,
        "data": result
    }
