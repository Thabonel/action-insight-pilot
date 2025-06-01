
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

# Load environment variables
load_dotenv()

app = FastAPI(title="Marketing Automation API", version="1.0.0")

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
    # Mock token verification - replace with real Supabase JWT verification
    if not credentials.token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return credentials.token

# Campaign endpoints
@app.get("/api/campaigns")
async def get_campaigns(token: str = Depends(verify_token)):
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

@app.post("/api/campaigns")
async def create_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    new_campaign = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z",
        **campaign_data
    }
    return APIResponse(success=True, data=new_campaign)

@app.post("/api/campaigns/bulk/create")
async def bulk_create_campaigns(campaigns_data: Dict[str, List[Dict[str, Any]]], token: str = Depends(verify_token)):
    campaigns = campaigns_data.get("campaigns", [])
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

@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, token: str = Depends(verify_token)):
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

@app.put("/api/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    updated_campaign = {
        "id": campaign_id,
        "updated_at": datetime.now().isoformat() + "Z",
        **updates
    }
    return APIResponse(success=True, data=updated_campaign)

@app.delete("/api/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, token: str = Depends(verify_token)):
    return APIResponse(success=True, data={"deleted": True, "id": campaign_id})

# Lead endpoints
@app.get("/api/leads")
async def get_leads(token: str = Depends(verify_token)):
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

@app.get("/api/leads/search")
async def search_leads(q: str, token: str = Depends(verify_token)):
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

@app.get("/api/leads/analytics/overview")
async def get_lead_analytics(token: str = Depends(verify_token)):
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

@app.post("/api/leads")
async def create_lead(lead_data: Dict[str, Any], token: str = Depends(verify_token)):
    new_lead = {
        "id": str(uuid.uuid4()),
        "score": 50,  # Default score
        "status": "new",  # Default status
        "created_at": datetime.now().isoformat() + "Z",
        **lead_data
    }
    return APIResponse(success=True, data=new_lead)

# Content endpoints
@app.post("/api/content/create")
async def create_content(content_data: Dict[str, Any], token: str = Depends(verify_token)):
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

@app.get("/api/content/library")
async def get_content_library(token: str = Depends(verify_token)):
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

# Social endpoints
@app.get("/api/social/posts")
async def get_social_posts(token: str = Depends(verify_token)):
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

@app.post("/api/social/posts")
async def create_social_post(post_data: Dict[str, Any], token: str = Depends(verify_token)):
    new_post = {
        "id": str(uuid.uuid4()),
        "status": "draft",
        "engagement": {"likes": 0, "shares": 0, "comments": 0},
        "created_at": datetime.now().isoformat() + "Z",
        **post_data
    }
    return APIResponse(success=True, data=new_post)

@app.get("/api/social/analytics")
async def get_social_analytics(token: str = Depends(verify_token)):
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

@app.post("/api/social/schedule")
async def schedule_social_post(post_data: Dict[str, Any], token: str = Depends(verify_token)):
    scheduled_post = {
        "id": str(uuid.uuid4()),
        "status": "scheduled",
        "scheduled_at": datetime.now().isoformat() + "Z",
        **post_data
    }
    return APIResponse(success=True, data=scheduled_post)

# Email endpoints
@app.get("/api/email/campaigns")
async def get_email_campaigns(token: str = Depends(verify_token)):
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

@app.post("/api/email/campaigns")
async def create_email_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
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

@app.get("/api/email/analytics")
async def get_email_analytics(token: str = Depends(verify_token)):
    mock_analytics = {
        "total_sent": 15000,
        "avg_open_rate": 22.3,
        "avg_click_rate": 3.8,
        "bounce_rate": 2.1,
        "unsubscribe_rate": 0.5,
        "revenue_generated": 45000
    }
    return APIResponse(success=True, data=mock_analytics)

@app.post("/api/email/send")
async def send_email(email_data: Dict[str, Any], token: str = Depends(verify_token)):
    sent_email = {
        "id": str(uuid.uuid4()),
        "status": "sent",
        "sent_at": datetime.now().isoformat() + "Z",
        "recipient_count": email_data.get("recipients", 1),
        **email_data
    }
    return APIResponse(success=True, data=sent_email)

# Analytics endpoints
@app.get("/api/analytics/overview")
async def get_analytics_overview(token: str = Depends(verify_token)):
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

@app.get("/api/system/stats")
async def get_system_stats(token: str = Depends(verify_token)):
    mock_stats = {
        "uptime": "99.9%",
        "active_users": 156,
        "api_calls_today": 15420,
        "storage_used": "2.3 GB",
        "last_backup": "2024-01-15T02:00:00Z"
    }
    return APIResponse(success=True, data=mock_stats)

@app.get("/api/analytics/performance")
async def get_performance_metrics(token: str = Depends(verify_token)):
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

# Workflow endpoints
@app.get("/api/workflow/list")
async def get_workflows(token: str = Depends(verify_token)):
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
        }
    ]
    return APIResponse(success=True, data=mock_workflows)

@app.post("/api/workflow/create")
async def create_workflow(workflow_data: Dict[str, Any], token: str = Depends(verify_token)):
    new_workflow = {
        "id": str(uuid.uuid4()),
        "status": "draft",
        "completion_rate": 0,
        "created_at": datetime.now().isoformat() + "Z",
        **workflow_data
    }
    return APIResponse(success=True, data=new_workflow)

@app.post("/api/workflow/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, token: str = Depends(verify_token)):
    execution_result = {
        "workflow_id": workflow_id,
        "execution_id": str(uuid.uuid4()),
        "status": "running",
        "started_at": datetime.now().isoformat() + "Z",
        "estimated_completion": (datetime.now() + timedelta(minutes=30)).isoformat() + "Z"
    }
    return APIResponse(success=True, data=execution_result)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
