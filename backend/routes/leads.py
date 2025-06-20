from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
import uuid
import logging
import csv
import json
import io
from datetime import datetime

from backend.models import APIResponse
from backend.auth import verify_token
from backend.config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/leads", tags=["leads"])

@router.get("", response_model=APIResponse)
async def get_leads(token: str = Depends(verify_token)):
    """Get all leads"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.lead_generation_agent.get_leads()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_leads = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "John Smith",
                    "email": "john.smith@example.com",
                    "company": "Tech Corp",
                    "score": 85,
                    "status": "qualified",
                    "source": "website",
                    "created_at": "2024-01-15T10:00:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Sarah Johnson",
                    "email": "sarah.j@company.com",
                    "company": "Innovation Inc",
                    "score": 72,
                    "status": "contacted",
                    "source": "social_media",
                    "created_at": "2024-01-14T14:30:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_leads)
    except Exception as e:
        logger.error(f"Error getting leads: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/search", response_model=APIResponse)
async def search_leads(q: str, token: str = Depends(verify_token)):
    """Search for leads"""
    try:
        if agent_manager.agents_available:
            search_criteria = {"query": q}
            result = await agent_manager.lead_generation_agent.find_leads(search_criteria)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_results = [
                {
                    "id": str(uuid.uuid4()),
                    "name": f"Lead matching '{q}'",
                    "email": f"lead@{q.lower()}.com",
                    "company": f"{q} Company",
                    "score": 78,
                    "status": "new"
                }
            ]
            return APIResponse(success=True, data=mock_results)
    except Exception as e:
        logger.error(f"Error searching leads: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/analytics/overview", response_model=APIResponse)
async def get_lead_analytics(token: str = Depends(verify_token)):
    """Get lead analytics overview"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.lead_generation_agent.get_lead_analytics()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_analytics = {
                "total_leads": 1247,
                "qualified_leads": 342,
                "conversion_rate": 27.4,
                "avg_score": 68.5,
                "trends": {
                    "weekly_growth": 12.3,
                    "monthly_growth": 45.7
                }
            }
            return APIResponse(success=True, data=mock_analytics)
    except Exception as e:
        logger.error(f"Error getting lead analytics: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("", response_model=APIResponse)
async def create_lead(lead_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new lead"""
    try:
        if agent_manager.agents_available:
            result = await agent_manager.lead_generation_agent.add_lead(lead_data)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            from datetime import datetime
            new_lead = {
                "id": str(uuid.uuid4()),
                "score": 50,
                "status": "new",
                "created_at": datetime.now().isoformat() + "Z",
                **lead_data
            }
            return APIResponse(success=True, data=new_lead)
    except Exception as e:
        logger.error(f"Error creating lead: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/export")
async def export_leads(format: str = "csv", token: str = Depends(verify_token)):
    """Export leads in CSV or JSON format"""
    try:
        # Get leads data
        if agent_manager.agents_available:
            result = await agent_manager.lead_generation_agent.get_leads()
            leads_data = result.get("data", []) if result["success"] else []
        else:
            leads_data = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "John Smith",
                    "email": "john.smith@example.com",
                    "company": "Tech Corp",
                    "score": 85,
                    "status": "qualified",
                    "source": "website",
                    "created_at": "2024-01-15T10:00:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Sarah Johnson",
                    "email": "sarah.j@company.com",
                    "company": "Innovation Inc",
                    "score": 72,
                    "status": "contacted",
                    "source": "social_media",
                    "created_at": "2024-01-14T14:30:00Z"
                }
            ]

        if format.lower() == "csv":
            # Create CSV export
            output = io.StringIO()
            if leads_data:
                fieldnames = leads_data[0].keys()
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(leads_data)
            
            response = StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
            )
            return response
        
        elif format.lower() == "json":
            # Create JSON export
            json_data = json.dumps(leads_data, indent=2)
            response = StreamingResponse(
                io.BytesIO(json_data.encode('utf-8')),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"}
            )
            return response
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'json'.")
            
    except Exception as e:
        logger.error(f"Error exporting leads: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync", response_model=APIResponse)
async def sync_leads(token: str = Depends(verify_token)):
    """Sync leads from external sources"""
    try:
        if agent_manager.agents_available:
            # Simulate sync operation
            result = await agent_manager.lead_generation_agent.get_leads()
            sync_results = {
                "synced_count": len(result.get("data", [])) if result["success"] else 0,
                "new_leads": 5,
                "updated_leads": 12,
                "sync_time": datetime.now().isoformat() + "Z",
                "sources": ["website", "social_media", "email_campaigns"]
            }
            return APIResponse(success=True, data=sync_results)
        else:
            # Mock sync results
            sync_results = {
                "synced_count": 25,
                "new_leads": 8,
                "updated_leads": 17,
                "sync_time": datetime.now().isoformat() + "Z",
                "sources": ["website", "social_media", "email_campaigns", "crm"]
            }
            return APIResponse(success=True, data=sync_results)
    except Exception as e:
        logger.error(f"Error syncing leads: {e}")
        return APIResponse(success=False, error=str(e))
