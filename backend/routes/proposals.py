
from fastapi import APIRouter, Depends
from typing import Dict, Any
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
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.generate_proposal(proposal_data)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            # Mock proposal generation
            mock_proposal = {
                "id": str(uuid.uuid4()),
                "template_type": proposal_data.get("template_type", "custom"),
                "client_info": proposal_data.get("client_info", {}),
                "content": {
                    "executive_summary": "This is a mock proposal generated for demonstration purposes.",
                    "proposed_services": "Mock services based on your requirements."
                },
                "pricing": [
                    {"item": "Service 1", "description": "Mock service", "price": 5000, "quantity": 1},
                    {"item": "Service 2", "description": "Another mock service", "price": 3000, "quantity": 1}
                ],
                "timeline": [
                    {"phase": "Planning", "duration": "1 week", "deliverables": ["Project plan"]},
                    {"phase": "Implementation", "duration": "4 weeks", "deliverables": ["Main deliverables"]}
                ],
                "terms": {
                    "payment_terms": "50% upfront, 50% upon completion",
                    "warranty": "90-day warranty"
                },
                "created_at": datetime.now().isoformat(),
                "status": "draft"
            }
            return APIResponse(success=True, data=mock_proposal)
    except Exception as e:
        logger.error(f"Error generating proposal: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/templates", response_model=APIResponse)
async def get_proposal_templates(token: str = Depends(verify_token)):
    """Get available proposal templates"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.get_proposal_templates()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_templates = {
                "marketing_services": {
                    "name": "Marketing Services Proposal",
                    "sections": ["executive_summary", "client_overview", "proposed_services", "timeline", "pricing", "terms"],
                    "default_services": ["SEO", "Content Marketing", "Social Media Management", "PPC Advertising"]
                },
                "web_development": {
                    "name": "Web Development Proposal",
                    "sections": ["project_overview", "technical_requirements", "development_phases", "timeline", "pricing", "terms"],
                    "default_services": ["UI/UX Design", "Frontend Development", "Backend Development", "Testing & QA"]
                },
                "consulting": {
                    "name": "Consulting Services Proposal",
                    "sections": ["executive_summary", "problem_analysis", "proposed_solution", "methodology", "timeline", "pricing", "terms"],
                    "default_services": ["Strategy Consulting", "Process Optimization", "Training & Development"]
                }
            }
            return APIResponse(success=True, data=mock_templates)
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("", response_model=APIResponse)
async def get_proposals(status: str = None, client: str = None, token: str = Depends(verify_token)):
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
            mock_proposals = [
                {
                    "id": str(uuid.uuid4()),
                    "client_name": "Acme Corp",
                    "template_type": "marketing_services",
                    "status": "sent",
                    "created_at": "2024-01-15T10:00:00Z",
                    "value": 15000
                },
                {
                    "id": str(uuid.uuid4()),
                    "client_name": "TechStart Inc", 
                    "template_type": "web_development",
                    "status": "draft",
                    "created_at": "2024-01-14T14:30:00Z",
                    "value": 25000
                }
            ]
            return APIResponse(success=True, data=mock_proposals)
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
            saved_proposal = {
                **proposal_data,
                "id": proposal_id,
                "saved_at": datetime.now().isoformat()
            }
            return APIResponse(success=True, data=saved_proposal)
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
            export_data = {
                "proposal_id": proposal_id,
                "format": format_type,
                "download_url": f"/api/proposals/{proposal_id}/download/{format_type}",
                "generated_at": datetime.now().isoformat()
            }
            return APIResponse(success=True, data=export_data)
    except Exception as e:
        logger.error(f"Error exporting proposal: {e}")
        return APIResponse(success=False, error=str(e))
