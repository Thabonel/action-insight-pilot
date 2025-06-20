
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
import logging
from backend.agents.mcp_agent import MCPAgent
from backend.auth import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/workflows", tags=["workflows"])

# Global MCP agent instance
mcp_agent = MCPAgent()

class WorkflowCreate(BaseModel):
    name: str
    description: str
    steps: List[Dict[str, Any]]
    schedule: Optional[Dict[str, Any]] = None

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    schedule: Optional[Dict[str, Any]] = None

@router.get("/list")
async def get_workflows():
    """Get all available workflows"""
    try:
        # For now, return some example workflows that match the frontend structure
        workflows = [
            {
                "id": "lead_nurture_sequence",
                "name": "Lead Nurture Sequence",
                "description": "Automated lead nurturing with personalized follow-ups",
                "status": "active",
                "steps": [
                    {
                        "id": 1,
                        "type": "trigger",
                        "title": "New Lead Captured",
                        "description": "Form submission or landing page conversion",
                        "icon": "Target",
                        "color": "green",
                        "status": "active"
                    },
                    {
                        "id": 2,
                        "type": "action", 
                        "title": "Send Welcome Email",
                        "description": "Personalized welcome message with next steps",
                        "icon": "Mail",
                        "color": "blue",
                        "status": "active"
                    },
                    {
                        "id": 3,
                        "type": "delay",
                        "title": "Wait 2 Days",
                        "description": "AI-optimized timing for maximum engagement",
                        "icon": "Calendar",
                        "color": "orange",
                        "status": "active"
                    },
                    {
                        "id": 4,
                        "type": "condition",
                        "title": "Email Opened?",
                        "description": "Branch workflow based on engagement",
                        "icon": "MessageSquare",
                        "color": "purple",
                        "status": "active"
                    },
                    {
                        "id": 5,
                        "type": "action",
                        "title": "Share on Social",
                        "description": "Cross-promote lead magnet to social channels",
                        "icon": "Share2",
                        "color": "indigo",
                        "status": "pending"
                    }
                ],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            }
        ]
        
        return {
            "success": True,
            "data": workflows
        }
    except Exception as e:
        logger.error(f"Failed to get workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_workflow(workflow_data: WorkflowCreate):
    """Create a new workflow"""
    try:
        # Convert to MCP workflow format
        workflow = {
            "id": f"workflow_{workflow_data.name.lower().replace(' ', '_')}",
            "name": workflow_data.name,
            "description": workflow_data.description,
            "steps": workflow_data.steps,
            "schedule": workflow_data.schedule
        }
        
        # In a real implementation, you'd save this to a database
        logger.info(f"Created workflow: {workflow['id']}")
        
        return {
            "success": True,
            "data": {
                "id": workflow["id"],
                "message": "Workflow created successfully"
            }
        }
    except Exception as e:
        logger.error(f"Failed to create workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{workflow_id}/execute")
async def execute_workflow(workflow_id: str):
    """Execute a workflow"""
    try:
        # Initialize MCP agent if not already connected
        await mcp_agent.connect_all_servers()
        
        # Get workflow definition (in real implementation, fetch from database)
        if workflow_id == "lead_nurture_sequence":
            workflow = {
                "id": workflow_id,
                "name": "Lead Nurture Sequence",
                "steps": [
                    {
                        "name": "capture_lead",
                        "tool": "crm_connector.capture_lead",
                        "parameters": {
                            "source": "web_form",
                            "campaign": "nurture_sequence"
                        }
                    },
                    {
                        "name": "send_welcome_email",
                        "tool": "email_automation.send_template",
                        "parameters": {
                            "template": "welcome_sequence",
                            "personalization": True
                        }
                    }
                ]
            }
        else:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Execute workflow using MCP agent
        result = await mcp_agent.execute_marketing_workflow(workflow)
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Failed to execute workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get workflow execution status"""
    try:
        # In real implementation, fetch from execution logs/database
        return {
            "success": True,
            "data": {
                "workflow_id": workflow_id,
                "status": "running",
                "current_step": 2,
                "total_steps": 5,
                "started_at": "2024-01-15T10:30:00Z",
                "estimated_completion": "2024-01-15T10:35:00Z"
            }
        }
    except Exception as e:
        logger.error(f"Failed to get workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, workflow_data: WorkflowUpdate):
    """Update an existing workflow"""
    try:
        # In real implementation, update in database
        logger.info(f"Updated workflow: {workflow_id}")
        
        return {
            "success": True,
            "data": {
                "id": workflow_id,
                "message": "Workflow updated successfully"
            }
        }
    except Exception as e:
        logger.error(f"Failed to update workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow"""
    try:
        # In real implementation, delete from database
        logger.info(f"Deleted workflow: {workflow_id}")
        
        return {
            "success": True,
            "data": {
                "message": "Workflow deleted successfully"
            }
        }
    except Exception as e:
        logger.error(f"Failed to delete workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
