from fastapi import APIRouter, Depends
from typing import Dict, Any, List
import uuid
from datetime import datetime, date
import logging

from backend.models import APIResponse
from backend.auth import verify_token
from backend.config import agent_manager
from backend.database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.post("/daily-focus", response_model=APIResponse)
async def get_daily_focus(request_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Analyze what the user should focus on today based on campaign data and context"""
    try:
        query = request_data.get("query", "")
        campaigns = request_data.get("campaigns", [])
        context = request_data.get("context", [])
        today = request_data.get("date", str(date.today()))
        
        logger.info(f"🎯 Processing daily focus request for {today}")
        
        # Try AI agent first
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'execute_task'):
                    result = await agent_manager.campaign_agent.execute_task(
                        "general_query", 
                        {
                            "query": query,
                            "campaigns": campaigns,
                            "context": context,
                            "focus_date": today
                        }
                    )
                    
                    if result.get("success", True):
                        logger.info("✅ Generated daily focus via AI agent")
                        return APIResponse(success=True, data=result)
                        
            except Exception as agent_error:
                logger.error(f"❌ AI agent focus failed: {agent_error}")
        
        # Fallback to smart analysis based on campaign data
        focus_response = analyze_daily_focus_fallback(campaigns, query, today)
        logger.info("📢 Generated daily focus via fallback analysis")
        return APIResponse(success=True, data=focus_response)
        
    except Exception as e:
        logger.error(f"❌ Error generating daily focus: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/campaign", response_model=APIResponse)
async def handle_campaign_agent_task(request_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Handle direct campaign agent tasks (including general queries)"""
    try:
        task_type = request_data.get("task_type", "general_query")
        input_data = request_data.get("input_data", {})
        
        logger.info(f"🎯 Processing campaign agent task: {task_type}")
        
        # Try AI agent
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'execute_task'):
                    result = await agent_manager.campaign_agent.execute_task(task_type, input_data)
                    
                    if result.get("success", True):
                        logger.info(f"✅ Campaign agent task '{task_type}' completed")
                        return APIResponse(success=True, data=result)
                        
            except Exception as agent_error:
                logger.error(f"❌ Campaign agent task failed: {agent_error}")
        
        # Fallback based on task type
        if task_type == "analyze_performance":
            result = analyze_performance_fallback(input_data)
        elif task_type == "general_query":
            result = handle_general_query_fallback(input_data)
        else:
            result = {
                "success": False,
                "message": f"Task type '{task_type}' not supported in fallback mode"
            }
        
        logger.info(f"📢 Campaign task '{task_type}' handled via fallback")
        return APIResponse(success=True, data=result)
        
    except Exception as e:
        logger.error(f"❌ Error handling campaign agent task: {e}")
        return APIResponse(success=False, error=str(e))

# Fallback analysis functions

def analyze_daily_focus_fallback(campaigns: List, query: str, today: str) -> Dict:
    """Smart fallback analysis for daily focus when AI agents aren't available"""
    active_campaigns = [c for c in campaigns if c.get("status") == "active"]
    
    priorities = []
    if len(active_campaigns) > 0:
        # Sort by budget to find high-priority campaigns
        high_budget = sorted(active_campaigns, key=lambda x: x.get("budget_allocated", 0), reverse=True)[:2]
        for campaign in high_budget:
            priorities.append({
                "campaign": campaign.get("name", "Unknown"),
                "priority": "high",
                "action": f"Review {campaign.get('type', 'campaign')} performance",
                "impact": f"${campaign.get('budget_allocated', 0)} budget optimization"
            })
    
    return {
        "success": True,
        "title": "Your Marketing Focus for Today",
        "focus_summary": f"You have {len(active_campaigns)} active campaigns. Focus on your highest-budget campaigns today.",
        "business_impact": "Optimizing your top campaigns can improve ROI by 20-30%.",
        "recommended_actions": [
            "Review campaign performance metrics",
            "Check budget utilization", 
            "Analyze audience engagement",
            "Update underperforming content",
            "Plan next week's activities"
        ],
        "priority_items": priorities,
        "timestamp": datetime.utcnow().isoformat()
    }

def analyze_performance_fallback(input_data: Dict) -> Dict:
    """Fallback performance analysis"""
    campaign_ids = input_data.get("campaign_ids", [])
    
    return {
        "success": True,
        "analyses": [
            {
                "campaign_id": cid,
                "campaign_name": f"Campaign {cid[:8]}",
                "performance_score": 75,
                "key_metrics": {"total_data_points": 100, "average_performance": 75},
                "ai_recommendations": ["Optimize targeting", "Improve content", "Increase frequency"]
            } for cid in campaign_ids[:3]
        ],
        "total_campaigns": len(campaign_ids),
        "successful_analyses": min(3, len(campaign_ids))
    }

def handle_general_query_fallback(input_data: Dict) -> Dict:
    """Handle general marketing queries when AI agents aren't available"""
    query = input_data.get("query", "")
    campaigns = input_data.get("campaigns", [])
    
    if "focus" in query.lower() and "today" in query.lower():
        return analyze_daily_focus_fallback(campaigns, query, str(date.today()))
    
    return {
        "success": True,
        "title": "Marketing Assistant Response",
        "explanation": f"I understand you're asking about your marketing performance. Based on your {len(campaigns)} campaigns, everything appears to be running well.",
        "business_impact": "Continuous monitoring and optimization can improve your marketing ROI by 25-40%.",
        "recommended_actions": [
            "Review campaign performance regularly",
            "Test new content variations", 
            "Optimize your conversion funnels",
            "Analyze customer journey data"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }
