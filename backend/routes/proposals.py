
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
async def get_proposal_templates(token: Optional[str] = Depends(verify_token)):
    """Get available proposal templates"""
    try:
        logger.info("Getting proposal templates...")
        
        if agent_manager.agents_available:
            result = await agent_manager.proposal_generator.get_proposal_templates()
            logger.info(f"Agent templates result: {result}")
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            # Comprehensive mock templates with proper structure
            mock_templates = {
                "trade_services": {
                    "name": "Trade Services Template",
                    "description": "Professional template for trade services like plumbing, electrical, HVAC, construction, landscaping, etc.",
                    "sections": ["service_assessment", "project_scope", "materials_labor", "timeline", "pricing", "warranty_terms"],
                    "default_services": ["Service Assessment", "Installation/Repair", "Quality Inspection", "Cleanup & Completion"],
                    "category": "trade"
                },
                "digital_marketing": {
                    "name": "Digital Marketing Template",
                    "description": "Comprehensive template for digital marketing services, SEO, social media campaigns, and advertising",
                    "sections": ["executive_summary", "marketing_strategy", "proposed_services", "timeline", "investment", "kpis"],
                    "default_services": ["SEO Optimization", "Content Marketing", "Social Media Management", "PPC Advertising", "Analytics & Reporting"],
                    "category": "marketing"
                },
                "web_development": {
                    "name": "Web Development Template",
                    "description": "Complete template for website and web application development projects",
                    "sections": ["project_overview", "technical_requirements", "development_phases", "timeline", "pricing", "terms"],
                    "default_services": ["UI/UX Design", "Frontend Development", "Backend Development", "Testing & QA", "Deployment"],
                    "category": "development"
                },
                "consulting": {
                    "name": "Business Consulting Template",
                    "description": "Professional template for business strategy, operations, and management consulting services",
                    "sections": ["executive_summary", "situation_analysis", "recommendations", "implementation", "timeline", "fees"],
                    "default_services": ["Strategy Consulting", "Process Optimization", "Change Management", "Training & Development"],
                    "category": "consulting"
                },
                "general_business": {
                    "name": "General Business Template",
                    "description": "Flexible template suitable for various business services and projects",
                    "sections": ["overview", "services", "timeline", "pricing", "terms"],
                    "default_services": ["Business Analysis", "Solution Implementation", "Support & Training"],
                    "category": "general"
                }
            }
            
            logger.info(f"Returning mock templates: {list(mock_templates.keys())}")
            return APIResponse(success=True, data=mock_templates)
            
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
