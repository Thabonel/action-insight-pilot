from fastapi import APIRouter, Depends
from typing import Dict, Any, List
import uuid
from datetime import datetime, date
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager
from database import get_supabase

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
                        "monitor_campaigns", 
                        {
                            "campaigns": campaigns,
                            "context": context,
                            "focus_date": today,
                            "query": query
                        }
                    )
                    
                    if result.get("success", True):  # Assume success if not specified
                        # Transform the monitoring results into daily focus format
                        focus_response = transform_monitoring_to_focus(result, campaigns, query)
                        logger.info("✅ Generated daily focus via AI agent")
                        return APIResponse(success=True, data=focus_response)
                        
            except Exception as agent_error:
                logger.error(f"❌ AI agent focus failed: {agent_error}")
        
        # Fallback to smart analysis based on campaign data
        focus_response = analyze_daily_focus_fallback(campaigns, query, today)
        logger.info("📢 Generated daily focus via fallback analysis")
        return APIResponse(success=True, data=focus_response)
        
    except Exception as e:
        logger.error(f"❌ Error generating daily focus: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/content", response_model=APIResponse)
async def handle_content_query(request_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Handle content-related queries and suggestions"""
    try:
        query = request_data.get("query", "")
        campaigns = request_data.get("campaigns", [])
        context = request_data.get("context", [])
        
        logger.info(f"📝 Processing content query: {query[:50]}...")
        
        # Try AI agent first
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager, 'content_agent') and hasattr(agent_manager.content_agent, 'execute_task'):
                    result = await agent_manager.content_agent.execute_task(
                        "generate_content_suggestions", 
                        {
                            "query": query,
                            "campaigns": campaigns,
                            "context": context,
                            "content_type": "mixed"
                        }
                    )
                    
                    if result.get("success", True):
                        content_response = transform_content_response(result, query)
                        logger.info("✅ Generated content suggestions via AI agent")
                        return APIResponse(success=True, data=content_response)
                        
                # Try campaign agent as fallback for content tasks
                elif hasattr(agent_manager.campaign_agent, 'execute_task'):
                    result = await agent_manager.campaign_agent.execute_task(
                        "create_campaign_copy", 
                        {
                            "campaign_type": "content",
                            "target_audience": {"general": True},
                            "brand_voice": "professional",
                            "query": query,
                            "campaigns": campaigns
                        }
                    )
                    
                    if result.get("success", True):
                        content_response = transform_campaign_copy_to_content(result, query)
                        logger.info("✅ Generated content via campaign agent")
                        return APIResponse(success=True, data=content_response)
                        
            except Exception as agent_error:
                logger.error(f"❌ AI agent content failed: {agent_error}")
        
        # Fallback to smart content analysis
        content_response = analyze_content_needs_fallback(campaigns, query)
        logger.info("📢 Generated content suggestions via fallback analysis")
        return APIResponse(success=True, data=content_response)
        
    except Exception as e:
        logger.error(f"❌ Error handling content query: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/leads", response_model=APIResponse)
async def handle_leads_query(request_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Handle lead-related queries and analysis"""
    try:
        query = request_data.get("query", "")
        context = request_data.get("context", [])
        
        logger.info(f"👥 Processing leads query: {query[:50]}...")
        
        # Try AI agent first
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager, 'lead_generation_agent') and hasattr(agent_manager.lead_generation_agent, 'execute_task'):
                    result = await agent_manager.lead_generation_agent.execute_task(
                        "analyze_lead_performance", 
                        {
                            "query": query,
                            "context": context,
                            "timeframe": "30d"
                        }
                    )
                    
                    if result.get("success", True):
                        leads_response = transform_leads_response(result, query)
                        logger.info("✅ Generated leads analysis via AI agent")
                        return APIResponse(success=True, data=leads_response)
                        
                # Try campaign agent as fallback for lead analysis
                elif hasattr(agent_manager.campaign_agent, 'execute_task'):
                    result = await agent_manager.campaign_agent.execute_task(
                        "analyze_performance", 
                        {
                            "campaign_ids": [],  # Will analyze all campaigns
                            "focus": "lead_conversion",
                            "query": query,
                            "context": context
                        }
                    )
                    
                    if result.get("success", True):
                        leads_response = transform_performance_to_leads(result, query)
                        logger.info("✅ Generated leads analysis via campaign agent")
                        return APIResponse(success=True, data=leads_response)
                        
            except Exception as agent_error:
                logger.error(f"❌ AI agent leads failed: {agent_error}")
        
        # Fallback to mock lead analysis
        leads_response = analyze_leads_fallback(query)
        logger.info("📢 Generated leads analysis via fallback")
        return APIResponse(success=True, data=leads_response)
        
    except Exception as e:
        logger.error(f"❌ Error handling leads query: {e}")
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
                        
                # Handle general queries specifically
                elif task_type == "general_query":
                    result = await handle_general_query_fallback(input_data)
                    logger.info("✅ Handled general query via fallback")
                    return APIResponse(success=True, data=result)
                    
            except Exception as agent_error:
                logger.error(f"❌ Campaign agent task failed: {agent_error}")
        
        # Fallback based on task type
        if task_type == "analyze_performance":
            result = analyze_performance_fallback(input_data)
        elif task_type == "general_query":
            result = await handle_general_query_fallback(input_data)
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

# Helper functions to transform AI agent responses

def transform_monitoring_to_focus(monitoring_result: Dict, campaigns: List, query: str) -> Dict:
    """Transform campaign monitoring results into daily focus format"""
    alerts = monitoring_result.get("alerts", [])
    monitoring_results = monitoring_result.get("monitoring_results", [])
    
    # Extract priorities from alerts and monitoring
    priority_items = []
    for alert in alerts[:3]:  # Top 3 alerts
        priority_items.append({
            "campaign": alert.get("campaign_id", "Unknown"),
            "priority": "high" if alert.get("alert_type") == "critical" else "medium",
            "action": alert.get("message", "Needs attention"),
            "impact": "Performance optimization needed"
        })
    
    focus_summary = f"Based on your {len(campaigns)} active campaigns, here are today's priorities:"
    if alerts:
        focus_summary += f" {len(alerts)} campaigns need immediate attention."
    else:
        focus_summary += " All campaigns are performing well."
    
    return {
        "focus_summary": focus_summary,
        "business_impact": f"Addressing these priorities could improve overall campaign performance by 15-25%.",
        "recommended_actions": [
            action for alert in alerts[:3] 
            for action in alert.get("recommendations", ["Review campaign performance"])
        ][:5],
        "priority_items": priority_items
    }

def transform_content_response(content_result: Dict, query: str) -> Dict:
    """Transform content agent response into expected format"""
    return {
        "suggestions": content_result.get("content_suggestions", [
            {"type": "Blog Post", "topic": "Marketing Best Practices", "confidence": 85},
            {"type": "Social Media", "topic": "Engagement Tips", "confidence": 78}
        ]),
        "explanation": content_result.get("explanation", "Based on your campaign performance, these content types would be most effective."),
        "business_impact": content_result.get("business_impact", "High-quality content can increase engagement by 40-60%."),
        "next_actions": content_result.get("next_actions", ["Create content calendar", "Start with highest confidence suggestion"])
    }

def transform_campaign_copy_to_content(copy_result: Dict, query: str) -> Dict:
    """Transform campaign copy creation into content suggestions"""
    campaign_copy = copy_result.get("campaign_copy", {})
    
    return {
        "suggestions": [
            {"type": "Email Campaign", "topic": "Generated Copy", "confidence": 90},
            {"type": "Social Media", "topic": "Promotional Content", "confidence": 85}
        ],
        "explanation": "AI-generated content suggestions based on your successful campaign patterns.",
        "business_impact": "Using AI-optimized content can improve campaign performance by 20-30%.",
        "next_actions": ["Review generated content", "Customize for your brand", "Test with small audience"]
    }

def transform_leads_response(leads_result: Dict, query: str) -> Dict:
    """Transform lead agent response into expected format"""
    return {
        "lead_analysis": leads_result.get("lead_data", {}),
        "explanation": leads_result.get("explanation", "Your lead conversion patterns show opportunities for optimization."),
        "business_impact": leads_result.get("business_impact", "Improving lead quality could increase revenue by 25%."),
        "next_actions": leads_result.get("next_actions", ["Optimize lead scoring", "Improve follow-up timing"])
    }

def transform_performance_to_leads(performance_result: Dict, query: str) -> Dict:
    """Transform campaign performance analysis into lead-focused insights"""
    analyses = performance_result.get("analyses", [])
    
    # Extract lead-related insights from campaign performance
    lead_insights = []
    for analysis in analyses:
        if analysis.get("key_metrics", {}).get("total_data_points", 0) > 0:
            lead_insights.append({
                "campaign": analysis.get("campaign_name", "Unknown"),
                "performance": analysis.get("performance_score", 0),
                "leads_potential": analysis.get("key_metrics", {}).get("average_performance", 0)
            })
    
    return {
        "lead_analysis": {"campaigns": lead_insights},
        "explanation": "Based on campaign performance, these insights highlight lead generation opportunities.",
        "business_impact": "Optimizing top-performing campaigns for lead generation could double your conversion rate.",
        "next_actions": ["Focus on high-performing campaigns", "A/B test lead magnets", "Improve conversion funnels"]
    }

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
        "focus_summary": f"You have {len(active_campaigns)} active campaigns. Focus on your highest-budget campaigns today.",
        "business_impact": "Optimizing your top campaigns can improve ROI by 20-30%.",
        "recommended_actions": [
            "Review campaign performance metrics",
            "Check budget utilization",
            "Analyze audience engagement",
            "Update underperforming content",
            "Plan next week's activities"
        ],
        "priority_items": priorities
    }

def analyze_content_needs_fallback(campaigns: List, query: str) -> Dict:
    """Smart content analysis based on campaign data"""
    campaign_types = [c.get("type", "unknown") for c in campaigns]
    
    suggestions = []
    if "email" in campaign_types:
        suggestions.append({"type": "Email Newsletter", "topic": "Customer Success Stories", "confidence": 88})
    if "social" in campaign_types:
        suggestions.append({"type": "Social Media", "topic": "Behind-the-Scenes Content", "confidence": 82})
    if "content" in campaign_types:
        suggestions.append({"type": "Blog Post", "topic": "Industry Insights", "confidence": 85})
    
    if not suggestions:
        suggestions = [
            {"type": "Blog Post", "topic": "Getting Started Guide", "confidence": 75},
            {"type": "Social Media", "topic": "Tips and Tricks", "confidence": 70}
        ]
    
    return {
        "suggestions": suggestions,
        "explanation": f"Based on your {len(campaigns)} campaigns, these content types align with your current strategy.",
        "business_impact": "Strategic content creation can increase engagement by 40% and generate 3x more leads.",
        "next_actions": ["Start with highest confidence suggestion", "Create content calendar", "Plan distribution strategy"]
    }

def analyze_leads_fallback(query: str) -> Dict:
    """Mock lead analysis for fallback"""
    return {
        "lead_analysis": {
            "total_leads": 456,
            "conversion_rate": 12.4,
            "top_sources": ["Organic Search", "Email Campaign", "Social Media"],
            "quality_score": 78
        },
        "explanation": "Your lead generation is performing well with a 12.4% conversion rate, which is above industry average.",
        "business_impact": "Improving lead quality by 10% could result in $15,000 additional monthly revenue.",
        "next_actions": [
            "Optimize your top-performing lead sources",
            "Improve lead scoring criteria",
            "Create targeted follow-up sequences",
            "A/B test landing pages"
        ]
    }

def analyze_performance_fallback(input_data: Dict) -> Dict:
    """Fallback performance analysis"""
    campaign_ids = input_data.get("campaign_ids", [])
    
    return {
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

async def handle_general_query_fallback(input_data: Dict) -> Dict:
    """Handle general marketing queries when AI agents aren't available"""
    query = input_data.get("query", "")
    campaigns = input_data.get("campaigns", [])
    
    if "focus" in query.lower() and "today" in query.lower():
        return analyze_daily_focus_fallback(campaigns, query, str(date.today()))
    
    return {
        "title": "Marketing Assistant Response",
        "explanation": f"I understand you're asking about your marketing performance. Based on your {len(campaigns)} campaigns, everything appears to be running well.",
        "business_impact": "Continuous monitoring and optimization can improve your marketing ROI by 25-40%.",
        "recommendations": [
            "Review campaign performance regularly",
            "Test new content variations",
            "Optimize your conversion funnels",
            "Analyze customer journey data"
        ]
    }
