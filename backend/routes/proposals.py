
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import uuid
from datetime import datetime
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/proposals", tags=["proposals"])

@router.post("/generate", response_model=APIResponse)
async def generate_proposal(proposal_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Generate a new proposal"""
    try:
        logger.info(f"Generating proposal with data: {proposal_data}")
        
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.generate_proposal(proposal_data)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="Proposal agent not available")
    except Exception as e:
        logger.error(f"Error generating proposal: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/templates", response_model=APIResponse)
async def get_proposal_templates(token: Optional[str] = Depends(verify_token)):
    """Get available proposal templates"""
    try:
        logger.info("Getting proposal templates...")
        
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.get_proposal_templates()
            logger.info(f"Agent templates result: {result}")
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="Proposal agent not available")
            
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("", response_model=APIResponse)
async def get_proposals(status: Optional[str] = None, client: Optional[str] = None, token: str = Depends(verify_token)):
    """Get saved proposals with optional filters"""
    try:
        filters = {}
        if status:
            filters["status"] = status
        if client:
            filters["client"] = client
            
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.get_proposals(filters)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="Proposal agent not available")
    except Exception as e:
        logger.error(f"Error getting proposals: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{proposal_id}/save", response_model=APIResponse)
async def save_proposal(proposal_id: str, proposal_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Save proposal changes"""
    try:
        proposal_data["id"] = proposal_id
        
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.save_proposal(proposal_data)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="Proposal agent not available")
    except Exception as e:
        logger.error(f"Error saving proposal: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{proposal_id}/export", response_model=APIResponse)
async def export_proposal(proposal_id: str, format_data: Dict[str, str], token: str = Depends(verify_token)):
    """Export proposal to PDF or Word"""
    try:
        format_type = format_data.get("format", "pdf")
        
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.export_proposal(proposal_id, format_type)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            raise HTTPException(status_code=503, detail="Proposal agent not available")
    except Exception as e:
        logger.error(f"Error exporting proposal: {e}")
        return APIResponse(success=False, error=str(e))
