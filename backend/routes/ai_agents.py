from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Any, List
import logging
import json
from datetime import datetime

from backend.auth import verify_token
from backend.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

class AgentExecuteRequest(BaseModel):
    agent_type: str
    task_type: str
    input_data: Dict[str, Any]

class DailyFocusRequest(BaseModel):
    query: str
    campaigns: List[Dict[str, Any]]
    context: List[Dict[str, Any]] = []
    date: str

class GeneralQueryRequest(BaseModel):
    task_type: str
    input_data: Dict[str, Any]

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user ID from JWT token"""
    try:
        user_data = verify_token(credentials.credentials)
        return user_data.get('sub')
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.post("/api/agents/execute")
async def execute_agent_task(
    request: AgentExecuteRequest,
    user_id: str = Depends(get_current_user)
):
    """Execute agent tasks with proper error handling"""
    try:
        logger.info(f"Executing {request.agent_type} task for user {user_id}")
        
        # Simple response for now - can be enhanced with actual AI logic
        result = {
            "success": True,
            "data": {
                "message": f"Executed {request.task_type} for {request.agent_type}",
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Agent execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/agents/daily-focus")
async def daily_focus_agent(
    request: DailyFocusRequest,
    user_id: str = Depends(get_current_user)
):
    """Generate daily focus recommendations"""
    try:
        logger.info(f"Daily focus request for user {user_id}: {request.query}")
        
        # Generate a meaningful response based on campaigns
        campaign_count = len(request.campaigns)
        focus_message = f"Based on your {campaign_count} active campaigns, here's your focus for today: "
        
        if campaign_count > 0:
            active_campaigns = [c for c in request.campaigns if c.get('status') == 'active']
            if active_campaigns:
                focus_message += f"Review performance of your '{active_campaigns[0].get('name', 'main')}' campaign and optimize based on recent metrics."
            else:
                focus_message += "Activate your drafted campaigns and monitor their initial performance."
        else:
            focus_message += "Start by creating your first marketing campaign to establish your baseline metrics."
        
        result = {
            "success": True,
            "data": {
                "focus_summary": focus_message,
                "campaign_count": campaign_count,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Daily focus agent failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/agents/campaign")
async def general_campaign_agent(
    request: GeneralQueryRequest,
    user_id: str = Depends(get_current_user)
):
    """Handle general campaign queries"""
    try:
        logger.info(f"General query for user {user_id}: {request.task_type}")
        
        query = request.input_data.get('query', '')
        campaigns = request.input_data.get('campaigns', [])
        
        # Generate contextual response
        if 'performance' in query.lower():
            explanation = "Your campaigns are performing well. Focus on optimizing high-performing content and reallocating budget from underperforming channels."
        elif 'improve' in query.lower():
            explanation = "To improve campaign performance, consider A/B testing your messaging, refining your target audience, and increasing frequency on your best-performing channels."
        else:
            explanation = f"Based on your {len(campaigns)} campaigns, I recommend focusing on data-driven optimization and consistent messaging across all channels."
        
        result = {
            "success": True,
            "data": {
                "explanation": explanation,
                "campaigns_analyzed": len(campaigns),
                "timestamp": datetime.now().isoformat()
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"General campaign agent failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
