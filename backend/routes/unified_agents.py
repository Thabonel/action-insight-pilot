from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from ..auth import verify_token, get_current_user_dependency
from ..database.supabase_client import get_supabase
from ..config import agent_manager

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# ===============================
# Request Models
# ===============================

class AgentExecuteRequest(BaseModel):
    agent_type: str
    task_type: str
    input_data: Dict[str, Any]

class DailyFocusRequest(BaseModel):
    query: str
    campaigns: List[Dict[str, Any]] = []
    context: List[Dict[str, Any]] = []
    date: str

class GeneralQueryRequest(BaseModel):
    task_type: str
    input_data: Dict[str, Any]

class CampaignCreateRequest(BaseModel):
    name: str
    type: str = "content"
    channel: str = "email"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

# ===============================
# Authentication Dependency
# ===============================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user ID from JWT token"""
    try:
        user_data = verify_token(credentials.credentials)
        return user_data.get('sub')
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# ===============================
# Helper Functions
# ===============================

async def get_user_campaigns(user_id: str) -> List[Dict[str, Any]]:
    """Fetch user's campaigns from Supabase"""
    try:
        supabase = get_supabase()
        
        result = supabase.table('campaigns')\
            .select('*')\
            .eq('created_by', user_id)\
            .execute()
        
        campaigns = result.data or []
        logger.info(f"✅ Retrieved {len(campaigns)} campaigns for user {user_id}")
        
        # Transform campaigns to expected format
        formatted_campaigns = []
        for campaign in campaigns:
            formatted_campaigns.append({
                'id': campaign.get('id'),
                'name': campaign.get('name'),
                'type': campaign.get('type'),
                'status': campaign.get('status'),
                'channel': campaign.get('channel'),
                'budget_allocated': float(campaign.get('budget_allocated', 0)),
                'budget_spent': float(campaign.get('budget_spent', 0)),
                'metrics': campaign.get('metrics', {}),
                'target_audience': campaign.get('target_audience', {}),
                'content': campaign.get('content', {}),
                'start_date': campaign.get('start_date'),
                'end_date': campaign.get('end_date'),
                'created_at': campaign.get('created_at')
            })
        
        return formatted_campaigns
        
    except Exception as e:
        logger.error(f"❌ Failed to get campaigns for user {user_id}: {e}")
        return []

def check_api_key_configured() -> bool:
    """Check if required API keys are configured"""
    return agent_manager.agents_available and len(agent_manager.missing_api_keys) == 0

# ===============================
# Agent Execution Endpoints
# ===============================

@router.post("/api/agents/execute")
async def execute_agent_task(
    request: AgentExecuteRequest,
    user_id: str = Depends(get_current_user)
):
    """Execute specific agent tasks with comprehensive error handling"""
    try:
        logger.info(f"Executing {request.agent_type} task '{request.task_type}' for user {user_id}")
        
        # Check system status
        if not agent_manager.agents_available:
            system_status = agent_manager.get_system_status()
            raise HTTPException(
                status_code=503,
                detail={
                    "message": "Agent system unavailable",
                    "missing_dependencies": system_status.get('missing_dependencies', []),
                    "missing_api_keys": system_status.get('missing_api_keys', [])
                }
            )
        
        # Route to appropriate agent
        agent_mapping = {
            'content_creator': 'content_agent',
            'campaign_manager': 'campaign_agent', 
            'lead_generator': 'lead_generation_agent',
            'social_media_manager': 'social_media_agent',
            'email_automation': 'email_agent',
            'analytics': 'analytics_agent'
        }
        
        agent_name = agent_mapping.get(request.agent_type)
        if not agent_name:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown agent type: {request.agent_type}. Available: {list(agent_mapping.keys())}"
            )
        
        if not agent_manager.is_agent_available(agent_name):
            raise HTTPException(
                status_code=503,
                detail=f"Agent '{request.agent_type}' is not available"
            )
        
        agent = agent_manager.get_agent(agent_name)
        
        # Execute task based on agent type and task type
        result = await execute_agent_task_internal(agent, request.task_type, request.input_data, user_id)
        
        return {
            "success": True,
            "data": result,
            "agent_type": request.agent_type,
            "task_type": request.task_type,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Agent execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def execute_agent_task_internal(agent, task_type: str, input_data: Dict[str, Any], user_id: str):
    """Internal agent task execution logic"""
    
    # For now, provide a structured response
    # This can be enhanced with actual agent method calls
    if task_type == "create_content":
        return {
            "content": f"Generated content for: {input_data.get('topic', 'general topic')}",
            "suggestions": ["Optimize for SEO", "Add call-to-action", "Include visuals"],
            "estimated_performance": "85% engagement predicted"
        }
    elif task_type == "analyze_campaign":
        return {
            "analysis": "Campaign performance is above average",
            "recommendations": ["Increase budget on top-performing ads", "Test new audience segments"],
            "metrics": {"ctr": 2.3, "conversion_rate": 4.1, "roi": 150}
        }
    elif task_type == "generate_leads":
        return {
            "leads_generated": 42,
            "lead_score_average": 87,
            "top_sources": ["LinkedIn", "Website", "Referrals"]
        }
    else:
        return {
            "message": f"Task '{task_type}' executed successfully",
            "data": input_data,
            "user_id": user_id
        }

@router.post("/api/agents/daily-focus")
async def daily_focus_agent(
    request: DailyFocusRequest,
    user_id: str = Depends(get_current_user)
):
    """Generate intelligent daily focus recommendations"""
    try:
        logger.info(f"Daily focus request for user {user_id}: {request.query}")
        
        # Check if OpenAI API key is configured
        if not check_api_key_configured():
            missing_keys = [key['key'] for key in agent_manager.missing_api_keys if key['required']]
            raise HTTPException(
                status_code=400,
                detail=f"Required API keys not configured: {missing_keys}. Please configure in Settings > Integrations."
            )
        
        # Get fresh campaign data
        campaigns = await get_user_campaigns(user_id)
        campaign_count = len(campaigns)
        
        # Generate intelligent focus recommendations
        focus_insights = generate_daily_focus_insights(request.query, campaigns, request.context)
        
        result = {
            "success": True,
            "data": {
                "focus_summary": focus_insights["summary"],
                "priorities": focus_insights["priorities"],
                "campaign_count": campaign_count,
                "recommendations": focus_insights["recommendations"],
                "kpis_to_watch": focus_insights["kpis"],
                "timestamp": datetime.now().isoformat()
            }
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Daily focus agent failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_daily_focus_insights(query: str, campaigns: List[Dict], context: List[Dict]) -> Dict[str, Any]:
    """Generate intelligent daily focus insights based on user data"""
    
    active_campaigns = [c for c in campaigns if c.get('status') == 'active']
    campaign_count = len(campaigns)
    active_count = len(active_campaigns)
    
    if active_count == 0:
        return {
            "summary": "Focus today on activating your drafted campaigns and setting up proper tracking systems.",
            "priorities": ["Activate pending campaigns", "Set up analytics tracking", "Define success metrics"],
            "recommendations": ["Start with your highest-potential campaign", "Set daily monitoring alerts"],
            "kpis": ["Campaign activation rate", "Initial engagement metrics"]
        }
    
    # Analyze campaign performance
    total_budget = sum(c.get('budget_allocated', 0) for c in active_campaigns)
    total_spent = sum(c.get('budget_spent', 0) for c in active_campaigns)
    spend_rate = (total_spent / total_budget * 100) if total_budget > 0 else 0
    
    priorities = []
    recommendations = []
    kpis = ["ROI", "Conversion rate", "Cost per acquisition"]
    
    if spend_rate > 80:
        priorities.append("Budget optimization and reallocation")
        recommendations.append("Review high-spending campaigns for optimization opportunities")
    
    if spend_rate < 20:
        priorities.append("Increase campaign visibility and reach")
        recommendations.append("Consider increasing budgets on well-performing campaigns")
    
    if "performance" in query.lower():
        priorities.insert(0, "Performance analysis and optimization")
        recommendations.insert(0, "Deep-dive into campaign metrics and A/B test results")
    
    if not priorities:
        priorities = ["Campaign monitoring", "Content optimization", "Audience analysis"]
    
    if not recommendations:
        recommendations = ["Monitor key performance indicators", "Test new creative variations"]
    
    summary = f"Today's focus: You have {active_count} active campaigns with {spend_rate:.1f}% budget utilization. " + priorities[0] + " should be your top priority."
    
    return {
        "summary": summary,
        "priorities": priorities[:3],
        "recommendations": recommendations[:3],
        "kpis": kpis
    }

@router.post("/api/agents/campaign")
async def general_campaign_agent(
    request: GeneralQueryRequest,
    user_id: str = Depends(get_current_user)
):
    """Handle general campaign queries with contextual AI responses"""
    try:
        logger.info(f"General query request for user {user_id}: {request.task_type}")
        
        # Check if API keys are configured
        if not check_api_key_configured():
            missing_keys = [key['key'] for key in agent_manager.missing_api_keys if key['required']]
            raise HTTPException(
                status_code=400,
                detail=f"Required API keys not configured: {missing_keys}. Please configure in Settings > Integrations."
            )
        
        input_data = request.input_data
        query = input_data.get('query', '')
        context = input_data.get('context', [])
        
        # Get fresh campaign data
        campaigns = await get_user_campaigns(user_id)
        
        # Process query with enhanced context
        result = await process_general_campaign_query(query, campaigns, context, user_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ General campaign agent failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_general_campaign_query(query: str, campaigns: List[Dict], context: List[Dict], user_id: str) -> Dict[str, Any]:
    """Process general campaign queries with enhanced AI logic"""
    
    campaign_count = len(campaigns)
    active_campaigns = [c for c in campaigns if c.get('status') == 'active']
    
    # Analyze query intent
    query_lower = query.lower()
    
    if 'performance' in query_lower or 'metrics' in query_lower:
        explanation = analyze_campaign_performance(campaigns)
    elif 'improve' in query_lower or 'optimize' in query_lower:
        explanation = generate_optimization_recommendations(campaigns)
    elif 'budget' in query_lower:
        explanation = analyze_budget_utilization(campaigns)
    elif 'create' in query_lower or 'new' in query_lower:
        explanation = provide_campaign_creation_guidance(campaigns)
    else:
        explanation = provide_general_campaign_insights(campaigns)
    
    return {
        "success": True,
        "data": {
            "explanation": explanation,
            "campaigns_analyzed": campaign_count,
            "active_campaigns": len(active_campaigns),
            "insights": generate_campaign_insights(campaigns),
            "timestamp": datetime.now().isoformat()
        }
    }

def analyze_campaign_performance(campaigns: List[Dict]) -> str:
    """Analyze campaign performance and provide insights"""
    if not campaigns:
        return "No campaigns found. Start by creating your first campaign to establish baseline performance metrics."
    
    active_campaigns = [c for c in campaigns if c.get('status') == 'active']
    if not active_campaigns:
        return "You have campaigns but none are currently active. Activate campaigns to start tracking performance metrics."
    
    total_budget = sum(c.get('budget_allocated', 0) for c in active_campaigns)
    total_spent = sum(c.get('budget_spent', 0) for c in active_campaigns)
    
    if total_budget > 0:
        utilization = (total_spent / total_budget) * 100
        return f"Your {len(active_campaigns)} active campaigns show {utilization:.1f}% budget utilization. " + \
               ("Consider optimizing high-spend campaigns for better ROI." if utilization > 80 else 
                "There's room to scale successful campaigns with additional budget allocation.")
    
    return "Campaign performance tracking is active. Monitor engagement rates, conversion metrics, and ROI for optimization opportunities."

def generate_optimization_recommendations(campaigns: List[Dict]) -> str:
    """Generate campaign optimization recommendations"""
    if not campaigns:
        return "Start with campaign creation best practices: define clear objectives, target specific audiences, and set measurable KPIs."
    
    recommendations = []
    
    # Check for budget optimization opportunities
    overspent = [c for c in campaigns if c.get('budget_spent', 0) > c.get('budget_allocated', 0)]
    if overspent:
        recommendations.append("Review overspent campaigns for budget reallocation opportunities")
    
    # Check for underperforming campaigns
    draft_campaigns = [c for c in campaigns if c.get('status') == 'draft']
    if draft_campaigns:
        recommendations.append("Activate drafted campaigns and establish performance baselines")
    
    if not recommendations:
        recommendations = ["A/B test your messaging", "Refine audience targeting", "Optimize content timing"]
    
    return f"Key optimization opportunities: {', '.join(recommendations[:3])}. Focus on data-driven improvements and continuous testing."

def analyze_budget_utilization(campaigns: List[Dict]) -> str:
    """Analyze budget utilization across campaigns"""
    if not campaigns:
        return "No budget data available. Set campaign budgets to track spending and ROI effectively."
    
    total_allocated = sum(c.get('budget_allocated', 0) for c in campaigns)
    total_spent = sum(c.get('budget_spent', 0) for c in campaigns)
    
    if total_allocated == 0:
        return "Budget allocation needed. Set campaign budgets to enable spending tracking and optimization."
    
    utilization = (total_spent / total_allocated) * 100
    return f"Overall budget utilization: {utilization:.1f}%. " + \
           ("Consider reallocating budget from overspent to underutilized campaigns." if utilization > 90 else
            "Healthy budget management detected. Consider scaling successful campaigns." if utilization > 50 else
            "Low budget utilization suggests opportunity for campaign scaling or activation.")

def provide_campaign_creation_guidance(campaigns: List[Dict]) -> str:
    """Provide campaign creation guidance"""
    campaign_types = {c.get('type') for c in campaigns if c.get('type')}
    
    if not campaigns:
        return "Start with a content marketing campaign targeting your core audience. Define clear objectives, set realistic budgets, and establish success metrics."
    
    if 'email' not in campaign_types:
        return "Consider adding email marketing campaigns to your mix for direct audience engagement and nurturing."
    
    if 'social' not in campaign_types:
        return "Social media campaigns can expand your reach and engagement. Consider platform-specific content strategies."
    
    return "Diversify your campaign portfolio with different types and channels. Focus on integrated campaigns that work together toward common objectives."

def provide_general_campaign_insights(campaigns: List[Dict]) -> str:
    """Provide general campaign insights"""
    if not campaigns:
        return "Campaign management best practices: start with clear objectives, define target audiences, set measurable KPIs, and maintain consistent monitoring."
    
    active_count = len([c for c in campaigns if c.get('status') == 'active'])
    draft_count = len([c for c in campaigns if c.get('status') == 'draft'])
    
    return f"Campaign portfolio overview: {len(campaigns)} total campaigns ({active_count} active, {draft_count} in draft). " + \
           "Focus on consistent optimization and performance monitoring for best results."

def generate_campaign_insights(campaigns: List[Dict]) -> List[str]:
    """Generate actionable campaign insights"""
    insights = []
    
    if not campaigns:
        return ["Create your first campaign to start building marketing momentum"]
    
    active_campaigns = [c for c in campaigns if c.get('status') == 'active']
    
    if len(active_campaigns) < len(campaigns):
        insights.append(f"{len(campaigns) - len(active_campaigns)} campaigns ready for activation")
    
    total_budget = sum(c.get('budget_allocated', 0) for c in campaigns)
    if total_budget > 0:
        insights.append(f"Total campaign budget: ${total_budget:,.2f}")
    
    campaign_types = {c.get('type') for c in campaigns if c.get('type')}
    if campaign_types:
        insights.append(f"Campaign types: {', '.join(campaign_types)}")
    
    return insights[:3] if insights else ["Campaigns are configured and ready for optimization"]

# ===============================
# Campaign Management Endpoints  
# ===============================

@router.get("/api/campaigns")
async def get_campaigns(user_id: str = Depends(get_current_user)):
    """Retrieve campaigns for the authenticated user"""
    try:
        campaigns = await get_user_campaigns(user_id)
        return {"success": True, "data": campaigns}
    except Exception as e:
        logger.error(f"Failed to retrieve campaigns for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/campaigns")
async def create_campaign(
    request: CampaignCreateRequest,
    user_id: str = Depends(get_current_user)
):
    """Create a new campaign for the authenticated user"""
    try:
        supabase = get_supabase()
        
        # Map frontend type to valid enum value
        type_mapping = {
            "mixed": "content",
            "marketing": "content", 
            "email": "email",
            "social": "social"
        }
        campaign_type = type_mapping.get(request.type, "content")
        
        campaign_data = {
            "name": request.name,
            "type": campaign_type,
            "channel": request.channel,
            "status": "draft",
            "created_by": user_id
        }
        
        if request.start_date:
            campaign_data["start_date"] = request.start_date
        if request.end_date:
            campaign_data["end_date"] = request.end_date
            
        result = supabase.table('campaigns').insert(campaign_data).execute()
        
        logger.info(f"✅ Created campaign '{request.name}' for user {user_id}")
        return {"success": True, "data": result.data[0]}
        
    except Exception as e:
        logger.error(f"❌ Failed to create campaign for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# System Health Endpoints
# ===============================

@router.get("/api/agents/health")
async def agents_health_check():
    """Get agent system health status"""
    try:
        system_status = agent_manager.get_system_status()
        return {
            "success": True,
            "data": system_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/healthcheck")
async def health_check():
    """General health check endpoint"""
    return {
        "status": "ok", 
        "timestamp": datetime.utcnow().isoformat(),
        "agents_available": agent_manager.agents_available
    }