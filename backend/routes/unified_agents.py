from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging
import uuid

router = APIRouter(prefix="/api/agents", tags=["agents"])
logger = logging.getLogger(__name__)

@router.get("/")
async def list_agents():
    """List available agents"""
    return {
        "agents": [
            {"id": "content", "name": "Content Agent", "status": "available"},
            {"id": "campaign", "name": "Campaign Agent", "status": "available"},
            {"id": "lead_generation", "name": "Lead Generation Agent", "status": "available"}
        ]
    }

@router.post("/execute")
async def execute_agent_task(task_data: Dict[str, Any]):
    """Execute an agent task"""
    try:
        agent_type = task_data.get("agent_type")
        if not agent_type:
            raise HTTPException(status_code=400, detail="Agent type is required")
        
        task_id = str(uuid.uuid4())

        return {
            "status": "success",
            "message": f"Task queued for {agent_type} agent",
            "task_id": task_id
        }
    except Exception as e:
        logger.error(f"Error executing agent task: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")