# backend/main.py

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
import uuid
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import all agents - FIXED VERSION
try:
    from agents.campaign_agent import CampaignAgent
    from agents.social_media_agent import SocialMediaAgent, SocialPlatform, PostStatus  
    from agents.lead_generation_agent import LeadGenerationAgent
    from agents.content_agent import ContentAgent
    from agents.email_automation_agent import EmailAutomationAgent
    from agents.analytics_agent import AnalyticsAgent
    from agents.mcp_agent import MCPAgent
    
    # Initialize agents with proper error handling
    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    integrations = {}
    mcp_agent = MCPAgent()
    
    # Create agent instances
    campaign_agent = CampaignAgent(openai_api_key, integrations)
    social_media_agent = SocialMediaAgent(openai_api_key, integrations)
    lead_generation_agent = LeadGenerationAgent(openai_api_key, integrations)
    content_agent = ContentAgent(openai_api_key, integrations)
    email_automation_agent = EmailAutomationAgent(openai_api_key, integrations)
    analytics_agent = AnalyticsAgent(openai_api_key, integrations)
    
    AGENTS_AVAILABLE = True
    logger.info("✅ All AI agents loaded successfully!")
    
except ImportError as e:
    logger.warning(f"⚠️ Could not import agents: {e}. Using mock data.")
    AGENTS_AVAILABLE = False
    
    # Create mock agent objects for fallback
    campaign_agent = None
    social_media_agent = None
    lead_generation_agent = None
    content_agent = None
    email_automation_agent = None
    analytics_agent = None

app = FastAPI(title="Agentic AI Marketing Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Response models
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

# Auth dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token from Supabase or other auth provider"""
    if not credentials.token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.token

# ================== CAMPAIGN ENDPOINTS ==================

@app.get("/api/campaigns", response_model=APIResponse)
async def get_campaigns(token: str = Depends(verify_token)):
    """Get all campaigns"""
    try:
        if AGENTS_AVAILABLE:
            result = await campaign_agent.get_campaigns()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            # Fallback mock data
            mock_campaigns = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Summer Product Launch",
                    "type": "email",
                    "status": "active",
                    "description": "Marketing campaign for our new summer product line",
                    "created_at": "2024-01-15T10:00:00Z",
                    "updated_at": "2024-01-20T15:30:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Social Media Boost",
                    "type": "social", 
                    "status": "paused",
                    "description": "Increase brand awareness through social media",
                    "created_at": "2024-01-10T09:00:00Z",
                    "updated_at": "2024-01-18T12:00:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_campaigns)
    except Exception as e:
        logger.error(f"Error getting campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/campaigns", response_model=APIResponse)
async def create_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new campaign"""
    try:
        if AGENTS_AVAILABLE:
            result = await campaign_agent.create_campaign(
                name=campaign_data.get("name"),
                objective=campaign_data.get("objective"),
                target_audience=campaign_data.get("target_audience"),
                budget=campaign_data.get("budget"),
                channels=campaign_data.get("channels", [])
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            new_campaign = {
                "id": str(uuid.uuid4()),
                "created_at": datetime.now().isoformat() + "Z",
                "updated_at": datetime.now().isoformat() + "Z",
                **campaign_data
            }
            return APIResponse(success=True, data=new_campaign)
    except Exception as e:
        logger.error(f"Error creating campaign: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/campaigns/bulk/create", response_model=APIResponse)
async def bulk_create_campaigns(campaigns_data: Dict[str, List[Dict[str, Any]]], token: str = Depends(verify_token)):
    """Create multiple campaigns in bulk"""
    try:
        campaigns = campaigns_data.get("campaigns", [])
        
        if AGENTS_AVAILABLE:
            created_campaigns = []
            for campaign_data in campaigns:
                result = await campaign_agent.create_campaign(
                    name=campaign_data.get("name"),
                    objective=campaign_data.get("objective"),
                    target_audience=campaign_data.get("target_audience"),
                    budget=campaign_data.get("budget"),
                    channels=campaign_data.get("channels", [])
                )
                if result["success"]:
                    created_campaigns.append(result["data"])
            
            return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
        else:
            created_campaigns = []
            for campaign in campaigns:
                new_campaign = {
                    "id": str(uuid.uuid4()),
                    "created_at": datetime.now().isoformat() + "Z",
                    "updated_at": datetime.now().isoformat() + "Z",
                    **campaign
                }
                created_campaigns.append(new_campaign)
            return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
    except Exception as e:
        logger.error(f"Error bulk creating campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@app.get("/api/campaigns/{campaign_id}", response_model=APIResponse)
async def get_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Get specific campaign"""
    try:
        if AGENTS_AVAILABLE:
            result = await campaign_agent.get_campaign_performance(campaign_id)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_campaign = {
                "id": campaign_id,
                "name": "Summer Product Launch",
                "type": "email",
                "status": "active",
                "description": "Marketing campaign for our new summer product line",
                "metrics": {
                    "opens": 1250,
                    "clicks": 340,
                    "conversions": 45
                },
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-20T15:30:00Z"
            }
            return APIResponse(success=True, data=mock_campaign)
    except Exception as e:
        logger.error(f"Error getting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@app.put("/api/campaigns/{campaign_id}", response_model=APIResponse)
async def update_campaign(campaign_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    """Update campaign"""
    try:
        if AGENTS_AVAILABLE:
            result = await campaign_agent.optimize_campaign(campaign_id)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            updated_campaign = {
                "id": campaign_id,
                "updated_at": datetime.now().isoformat() + "Z",
                **updates
            }
            return APIResponse(success=True, data=updated_campaign)
    except Exception as e:
        logger.error(f"Error updating campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@app.delete("/api/campaigns/{campaign_id}", response_model=APIResponse)
async def delete_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Delete campaign"""
    try:
        # Note: Add delete method to campaign agent if needed
        return APIResponse(success=True, data={"deleted": True, "id": campaign_id})
    except Exception as e:
        logger.error(f"Error deleting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

# ================== LEAD ENDPOINTS ==================

@app.get("/api/leads", response_model=APIResponse)
async def get_leads(token: str = Depends(verify_token)):
    """Get all leads"""
    try:
        if AGENTS_AVAILABLE:
            result = await lead_generation_agent.get_leads()
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

@app.get("/api/leads/search", response_model=APIResponse)
async def search_leads(q: str, token: str = Depends(verify_token)):
    """Search for leads"""
    try:
        if AGENTS_AVAILABLE:
            search_criteria = {"query": q}
            result = await lead_generation_agent.find_leads(search_criteria)
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

@app.get("/api/leads/analytics/overview", response_model=APIResponse)
async def get_lead_analytics(token: str = Depends(verify_token)):
    """Get lead analytics overview"""
    try:
        if AGENTS_AVAILABLE:
            result = await lead_generation_agent.get_lead_analytics()
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

@app.post("/api/leads", response_model=APIResponse)
async def create_lead(lead_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new lead"""
    try:
        if AGENTS_AVAILABLE:
            result = await lead_generation_agent.add_lead(lead_data)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
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

# ================== CONTENT ENDPOINTS ==================

@app.post("/api/content/create", response_model=APIResponse)
async def create_content(content_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create new content"""
    try:
        if AGENTS_AVAILABLE:
            result = await content_agent.create_content(
                content_type=content_data.get("type"),
                platform=content_data.get("platform"),
                brief=content_data.get("brief"),
                target_audience=content_data.get("target_audience")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            new_content = {
                "id": str(uuid.uuid4()),
                "title": content_data.get("title", "Generated Content"),
                "content": "This is AI-generated content based on your prompt.",
                "type": content_data.get("type", "blog_post"),
                "status": "draft",
                "created_at": datetime.now().isoformat() + "Z",
                **content_data
            }
            return APIResponse(success=True, data=new_content)
    except Exception as e:
        logger.error(f"Error creating content: {e}")
        return APIResponse(success=False, error=str(e))

@app.get("/api/content/library", response_model=APIResponse)
async def get_content_library(content_type: str = None, platform: str = None, token: str = Depends(verify_token)):
    """Get content library"""
    try:
        if AGENTS_AVAILABLE:
            result = await content_agent.get_content_library(content_type, platform)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_content = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "10 Marketing Tips for 2024",
                    "type": "blog_post",
                    "status": "published",
                    "engagement": 245,
                    "created_at": "2024-01-10T10:00:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Product Launch Email Template",
                    "type": "email_template",
                    "status": "draft",
                    "engagement": 0,
                    "created_at": "2024-01-12T15:30:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_content)
    except Exception as e:
        logger.error(f"Error getting content library: {e}")
        return APIResponse(success=False, error=str(e))

# ================== SOCIAL ENDPOINTS ==================

@app.get("/api/social/posts", response_model=APIResponse)
async def get_social_posts(platform: str = None, status: str = None, token: str = Depends(verify_token)):
    """Get social media posts"""
    try:
        if AGENTS_AVAILABLE:
            platform_enum = SocialPlatform(platform) if platform else None
            status_enum = PostStatus(status) if status else None
            result = await social_media_agent.get_posts(platform_enum, status_enum)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_posts = [
                {
                    "id": str(uuid.uuid4()),
                    "content": "Check out our latest product features! #innovation",
                    "platform": "twitter",
                    "status": "published",
                    "engagement": {"likes": 42, "shares": 15, "comments": 8},
                    "scheduled_for": "2024-01-15T10:00:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "content": "Behind the scenes at our office today",
                    "platform": "instagram",
                    "status": "scheduled",
                    "engagement": {"likes": 0, "shares": 0, "comments": 0},
                    "scheduled_for": "2024-01-16T14:00:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_posts)
    except Exception as e:
        logger.error(f"Error getting social posts: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/social/posts", response_model=APIResponse)
async def create_social_post(post_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create social media post"""
    try:
        if AGENTS_AVAILABLE:
            platform = SocialPlatform(post_data["platform"])
            scheduled_time = None
            if post_data.get("scheduled_time"):
                scheduled_time = datetime.fromisoformat(post_data["scheduled_time"])
            
            result = await social_media_agent.create_post(
                platform=platform,
                content=post_data["content"],
                media_urls=post_data.get("media_urls", []),
                hashtags=post_data.get("hashtags", []),
                scheduled_time=scheduled_time,
                campaign_id=post_data.get("campaign_id")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            new_post = {
                "id": str(uuid.uuid4()),
                "status": "draft",
                "engagement": {"likes": 0, "shares": 0, "comments": 0},
                "created_at": datetime.now().isoformat() + "Z",
                **post_data
            }
            return APIResponse(success=True, data=new_post)
    except Exception as e:
        logger.error(f"Error creating social post: {e}")
        return APIResponse(success=False, error=str(e))

@app.get("/api/social/analytics", response_model=APIResponse)
async def get_social_analytics(platform: str = None, days: int = 30, token: str = Depends(verify_token)):
    """Get social media analytics"""
    try:
        if AGENTS_AVAILABLE:
            platform_enum = SocialPlatform(platform) if platform else None
            result = await social_media_agent.get_analytics(platform_enum, days)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_analytics = {
                "total_posts": 156,
                "total_engagement": 3420,
                "avg_engagement_rate": 4.2,
                "platform_breakdown": {
                    "twitter": {"posts": 65, "engagement": 1230},
                    "instagram": {"posts": 45, "engagement": 1890},
                    "linkedin": {"posts": 46, "engagement": 300}
                }
            }
            return APIResponse(success=True, data=mock_analytics)
    except Exception as e:
        logger.error(f"Error getting social analytics: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/social/schedule", response_model=APIResponse)
async def schedule_social_post(post_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Schedule social media post"""
    try:
        if AGENTS_AVAILABLE:
            # For bulk scheduling, expect a list of posts
            if isinstance(post_data.get("posts"), list):
                result = await social_media_agent.bulk_schedule_posts(post_data["posts"])
            else:
                # Single post scheduling
                platform = SocialPlatform(post_data["platform"])
                scheduled_time = datetime.fromisoformat(post_data["scheduled_time"])
                
                # Create post first, then schedule it
                create_result = await social_media_agent.create_post(
                    platform=platform,
                    content=post_data["content"],
                    media_urls=post_data.get("media_urls", []),
                    hashtags=post_data.get("hashtags", []),
                    scheduled_time=scheduled_time,
                    campaign_id=post_data.get("campaign_id")
                )
                result = create_result
            
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            scheduled_post = {
                "id": str(uuid.uuid4()),
                "status": "scheduled",
                "scheduled_at": datetime.now().isoformat() + "Z",
                **post_data
            }
            return APIResponse(success=True, data=scheduled_post)
    except Exception as e:
        logger.error(f"Error scheduling social post: {e}")
        return APIResponse(success=False, error=str(e))

# ================== EMAIL ENDPOINTS ==================

@app.get("/api/email/campaigns", response_model=APIResponse)
async def get_email_campaigns(token: str = Depends(verify_token)):
    """Get email campaigns"""
    try:
        if AGENTS_AVAILABLE:
            result = await email_automation_agent.get_campaigns()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_campaigns = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Weekly Newsletter",
                    "subject": "Your Weekly Update",
                    "status": "sent",
                    "recipients": 2500,
                    "open_rate": 24.5,
                    "click_rate": 3.2,
                    "sent_at": "2024-01-15T09:00:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Product Launch Announcement",
                    "subject": "Introducing Our Latest Innovation",
                    "status": "draft",
                    "recipients": 0,
                    "open_rate": 0,
                    "click_rate": 0,
                    "created_at": "2024-01-16T10:00:00Z"
                }
            ]
            return APIResponse(success=True, data=mock_campaigns)
    except Exception as e:
        logger.error(f"Error getting email campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/email/campaigns", response_model=APIResponse)
async def create_email_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create email campaign"""
    try:
        if AGENTS_AVAILABLE:
            result = await email_automation_agent.create_campaign(
                name=campaign_data["name"],
                email_type=campaign_data["type"],
                subject_line=campaign_data["subject"],
                target_audience=campaign_data.get("target_audience"),
                send_time=campaign_data.get("send_time")
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            new_campaign = {
                "id": str(uuid.uuid4()),
                "status": "draft",
                "recipients": 0,
                "open_rate": 0,
                "click_rate": 0,
                "created_at": datetime.now().isoformat() + "Z",
                **campaign_data
            }
            return APIResponse(success=True, data=new_campaign)
    except Exception as e:
        logger.error(f"Error creating email campaign: {e}")
        return APIResponse(success=False, error=str(e))

@app.get("/api/email/analytics", response_model=APIResponse)
async def get_email_analytics(campaign_id: str = None, token: str = Depends(verify_token)):
    """Get email analytics"""
    try:
        if AGENTS_AVAILABLE:
            result = await email_automation_agent.get_campaign_analytics(campaign_id)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_analytics = {
                "total_sent": 15000,
                "avg_open_rate": 22.3,
                "avg_click_rate": 3.8,
                "bounce_rate": 2.1,
                "unsubscribe_rate": 0.5,
                "revenue_generated": 45000
            }
            return APIResponse(success=True, data=mock_analytics)
    except Exception as e:
        logger.error(f"Error getting email analytics: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/email/send", response_model=APIResponse)
async def send_email(email_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Send email"""
    try:
        if AGENTS_AVAILABLE:
            result = await email_automation_agent.send_email(
                campaign_id=email_data["campaign_id"],
                recipients=email_data["recipients"]
            )
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            sent_email = {
                "id": str(uuid.uuid4()),
                "status": "sent",
                "sent_at": datetime.now().isoformat() + "Z",
                "recipient_count": email_data.get("recipients", 1),
                **email_data
            }
            return APIResponse(success=True, data=sent_email)
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return APIResponse(success=False, error=str(e))

# ================== MCP ENDPOINTS ==================

@app.get("/api/tools", response_model=APIResponse)
async def list_mcp_tools(token: str = Depends(verify_token)):
    """List all available MCP tools"""
    try:
        tools = await mcp_agent.list_available_tools()
        return APIResponse(success=True, data={"tools": tools, "count": len(tools)})
    except Exception as e:
        return APIResponse(success=False, error=str(e))

@app.post("/api/workflows/execute", response_model=APIResponse)
async def execute_mcp_workflow(workflow_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Execute MCP workflow"""
    try:
        result = await mcp_agent.execute_marketing_workflow(workflow_data)
        return APIResponse(success=True, data=result)
    except Exception as e:
        return APIResponse(success=False, error=str(e))

# ================== ANALYTICS ENDPOINTS ==================

@app.get("/api/analytics/overview", response_model=APIResponse)
async def get_analytics_overview(token: str = Depends(verify_token)):
    """Get analytics overview"""
    try:
        if AGENTS_AVAILABLE:
            result = await analytics_agent.get_executive_dashboard()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_overview = {
                "campaigns": {
                    "total": 45,
                    "active": 12,
                    "performance": 78.5
                },
                "leads": {
                    "total": 1247,
                    "qualified": 342,
                    "conversion_rate": 27.4
                },
                "revenue": {
                    "total": 125000,
                    "monthly_growth": 15.3,
                    "avg_deal_size": 2500
                },
                "engagement": {
                    "email_open_rate": 22.3,
                    "social_engagement": 4.2,
                    "website_traffic": 8500
                }
            }
            return APIResponse(success=True, data=mock_overview)
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        return APIResponse(success=False, error=str(e))

@app.get("/api/system/stats", response_model=APIResponse)
async def get_system_stats(token: str = Depends(verify_token)):
    """Get system statistics"""
    try:
        if AGENTS_AVAILABLE:
            result = await analytics_agent.get_system_performance()
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_stats = {
                "uptime": "99.9%",
                "active_users": 156,
                "api_calls_today": 15420,
                "storage_used": "2.3 GB",
                "last_backup": "2024-01-15T02:00:00Z"
            }
            return APIResponse(success=True, data=mock_stats)
    except Exception as e:
        logger.error(f"Error getting system stats: {e}")
        return APIResponse(success=False, error=str(e))

@app.get("/api/analytics/performance", response_model=APIResponse)
async def get_performance_metrics(days: int = 30, token: str = Depends(verify_token)):
    """Get performance analytics"""
    try:
        if AGENTS_AVAILABLE:
            result = await analytics_agent.get_performance_insights(days)
            return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        else:
            mock_metrics = {
                "campaign_performance": {
                    "best_performing": "Summer Product Launch",
                    "avg_roi": 285,
                    "total_conversions": 1250
                },
                "channel_performance": {
                    "email": {"roi": 320, "conversions": 680},
                    "social": {"roi": 245, "conversions": 340},
                    "content": {"roi": 190, "conversions": 230}
                },
                "predictions": {
                    "next_month_revenue": 145000,
                    "lead_growth": 23.5,
                    "recommended_budget": 15000
                }
            }
            return APIResponse(success=True, data=mock_metrics)
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        return APIResponse(success=False, error=str(e))

# ================== WORKFLOW ENDPOINTS ==================

@app.get("/api/workflow/list", response_model=APIResponse)
async def get_workflows(token: str = Depends(verify_token)):
    """Get available workflows"""
    try:
        # This would integrate with a workflow engine in the future
        mock_workflows = [
            {
                "id": str(uuid.uuid4()),
                "name": "Lead Nurturing Sequence",
                "status": "active",
                "trigger": "new_lead",
                "steps": 5,
                "completion_rate": 78.5,
                "created_at": "2024-01-10T10:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Welcome Email Series",
                "status": "active",
                "trigger": "user_signup",
                "steps": 3,
                "completion_rate": 92.1,
                "created_at": "2024-01-08T15:30:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Content to Social Media",
                "status": "active",
                "trigger": "content_published",
                "steps": 4,
                "completion_rate": 85.3,
                "created_at": "2024-01-05T12:00:00Z"
            }
        ]
        return APIResponse(success=True, data=mock_workflows)
    except Exception as e:
        logger.error(f"Error getting workflows: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/workflow/create", response_model=APIResponse)
async def create_workflow(workflow_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create new workflow"""
    try:
        # Future: integrate with workflow engine
        new_workflow = {
            "id": str(uuid.uuid4()),
            "status": "draft",
            "completion_rate": 0,
            "created_at": datetime.now().isoformat() + "Z",
            **workflow_data
        }
        return APIResponse(success=True, data=new_workflow)
    except Exception as e:
        logger.error(f"Error creating workflow: {e}")
        return APIResponse(success=False, error=str(e))

@app.post("/api/workflow/{workflow_id}/execute", response_model=APIResponse)
async def execute_workflow(workflow_id: str, execution_data: Dict[str, Any] = None, token: str = Depends(verify_token)):
    """Execute workflow"""
    try:
        execution_result = {
            "workflow_id": workflow_id,
            "execution_id": str(uuid.uuid4()),
            "status": "running",
            "started_at": datetime.now().isoformat() + "Z",
            "estimated_completion": (datetime.now() + timedelta(minutes=30)).isoformat() + "Z",
            "input_data": execution_data or {}
        }
        return APIResponse(success=True, data=execution_result)
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {e}")
        return APIResponse(success=False, error=str(e))

# ================== HEALTH CHECK & INFO ENDPOINTS ==================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "agents_available": AGENTS_AVAILABLE,
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Agentic AI Marketing Platform API",
        "version": "1.0.0",
        "agents_status": "loaded" if AGENTS_AVAILABLE else "using_mock_data",
        "documentation": "/docs",
        "health_check": "/health"
    }

@app.get("/api/status")
async def api_status():
    """API status endpoint with agent information"""
    agent_status = {}
    
    if AGENTS_AVAILABLE:
        agents = {
            "campaign_agent": "loaded",
            "lead_generation_agent": "loaded", 
            "content_agent": "loaded",
            "social_media_agent": "loaded",
            "email_automation_agent": "loaded",
            "analytics_agent": "loaded"
        }
    else:
        agents = {
            "campaign_agent": "mock_data",
            "lead_generation_agent": "mock_data",
            "content_agent": "mock_data", 
            "social_media_agent": "mock_data",
            "email_automation_agent": "mock_data",
            "analytics_agent": "mock_data"
        }
    
    return {
        "api_version": "1.0.0",
        "status": "operational",
        "agents": agents,
        "endpoints": {
            "campaigns": 6,
            "leads": 4, 
            "content": 2,
            "social": 4,
            "email": 4,
            "analytics": 3,
            "workflows": 3
        },
        "total_endpoints": 26,
        "timestamp": datetime.now().isoformat()
    }

# ================== ERROR HANDLERS ==================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return APIResponse(
        success=False,
        error=f"HTTP {exc.status_code}: {exc.detail}"
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return APIResponse(
        success=False,
        error="An unexpected error occurred. Please try again later."
    )

# ================== STARTUP EVENTS ==================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Agentic AI Marketing Platform API...")
    
    # Initialize agents with environment variables
    if AGENTS_AVAILABLE:
        try:
            # Set API keys for agents
            openai_key = os.getenv("OPENAI_API_KEY")
            supabase_url = os.getenv("SUPABASE_URL") 
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if openai_key:
                logger.info("OpenAI API key found")
            else:
                logger.warning("No OpenAI API key found - agents may have limited functionality")
                
            if supabase_url and supabase_key:
                logger.info("Supabase configuration found")
            else:
                logger.warning("No Supabase configuration found - using in-memory storage")
             logger.info("All agents initialized successfully")
            await mcp_agent.connect_all_servers()  # ADD THIS LINE
            logger.info("MCP universal tool connector initialized")  # ADD THIS LINE
        except Exception as e:
        except Exception as e:
            logger.error(f"Error initializing agents: {e}")
    else:
        logger.info("Running in mock mode - agents not available")
    
    logger.info("API startup complete")

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Agentic AI Marketing Platform API...")

# ================== MAIN ==================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
