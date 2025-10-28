# Complete Backend Architecture Documentation

## Action Insight Marketing Platform - FastAPI Backend

**Version:** 1.0.2  
**Database:** PostgreSQL (Supabase)  
**AI Services:** OpenAI, Anthropic Claude, Google Gemini, Mistral  
**Deployment:** Render (with Supabase backend)

---

## TABLE OF CONTENTS

1. [Application Structure](#application-structure)
2. [Core Files](#core-files)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database Layer](#database-layer)
5. [Routes (All Endpoints)](#routes-all-endpoints)
6. [AI Services & Models](#ai-services--models)
7. [Agents System](#agents-system)
8. [Services & Utilities](#services--utilities)
9. [Request/Response Patterns](#requestresponse-patterns)
10. [Error Handling](#error-handling)

---

## APPLICATION STRUCTURE

```
backend/
├── main.py                          # FastAPI app initialization & routing
├── auth.py                          # JWT token verification & user extraction
├── config.py                        # Configuration & AgentManager
├── models.py                        # Pydantic models (APIResponse)
├── database/
│   ├── __init__.py
│   ├── supabase_client.py          # Singleton Supabase client
│   └── user_secrets_client.py      # Encrypted user API key management
├── routes/                          # All API endpoints (see Routes section)
├── agents/                          # AI agent implementations
│   ├── base_agent_core.py          # Abstract base class for agents
│   ├── base_agent.py               # Backward compatibility alias
│   ├── enums.py                    # TaskStatus, AgentStatus enums
│   ├── agent_registry.py           # Agent registry system
│   ├── agent_logging.py            # Logging for agent tasks
│   ├── agent_utils.py              # Utility functions for agents
│   ├── ai_service.py               # Unified AI service facade
│   ├── campaign_agent.py           # Campaign management AI agent
│   ├── social_media_agent.py       # Social content generation agent
│   ├── content_agent.py            # Content creation agent
│   ├── email_automation_agent.py   # Email campaign agent
│   ├── lead_generation_agent.py    # Lead management agent
│   ├── analytics_agent.py          # Performance analytics agent
│   ├── proposal_generator.py       # Proposal generation agent
│   ├── internal_publishing_agent.py # Internal content publishing
│   ├── mcp_agent.py                # Model Context Protocol agent
│   ├── user_ai_service.py          # User-specific AI operations
│   ├── enhanced_user_ai_service.py # Enhanced AI with knowledge base
│   ├── ai/                         # Specialized AI services
│   │   ├── base_ai_service.py
│   │   ├── email_ai_service.py
│   │   ├── social_ai_service.py
│   │   ├── lead_ai_service.py
│   │   └── campaign_ai_service.py
│   ├── content/                    # Content generation services
│   │   ├── base_content_service.py
│   │   ├── email_content_service.py
│   │   ├── social_content_service.py
│   │   ├── blog_content_service.py
│   │   ├── headlines_service.py
│   │   └── content_optimization_service.py
│   ├── leads/                      # Lead management services
│   │   ├── base_lead_service.py
│   │   ├── lead_scoring_service.py
│   │   ├── lead_enrichment_service.py
│   │   ├── lead_qualification_service.py
│   │   ├── lead_analytics_service.py
│   │   └── lead_outreach_service.py
│   ├── social/                     # Social media services
│   │   ├── multi_model_service.py  # Multi-provider LLM support
│   │   ├── image_generation_service.py
│   │   ├── ab_testing_service.py
│   │   ├── real_time_metrics_service.py
│   │   ├── trend_monitoring_service.py
│   │   └── platform_extensions_service.py
│   ├── email/                      # Email services
│   │   ├── enhanced_email_service.py
│   │   ├── metrics_service.py
│   │   ├── personalization_service.py
│   │   ├── template_versioning_service.py
│   │   └── webhook_service.py
│   └── seo/                        # SEO services
│       ├── keyword_research_agent.py
│       └── keyword_research_service.py
├── services/                        # Business logic services
│   ├── task_scheduler.py           # APScheduler for background tasks
│   └── campaign_executor.py        # Campaign orchestration
├── social_connectors/              # Third-party platform connectors
│   ├── base_connector.py
│   ├── buffer_connector.py
│   ├── sprout_connector.py
│   ├── later_connector.py
│   └── hootsuite_connector.py
├── workflows/                      # Workflow definitions
│   └── ai_video_creator_workflow.py
├── static/                         # Static files (form HTML, etc.)
├── tests/                          # Test suite
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Container configuration
├── README.md
└── .env / .env.example             # Environment variables
```

---

## CORE FILES

### 1. main.py - FastAPI Application Entry Point

**Location:** `/backend/main.py`

```
Key Features:
- FastAPI app initialization with metadata
- CORS configuration (supports multiple origins)
- Router loading with graceful error handling
- Static file mounting for form embeds
- Task scheduler initialization on startup
- Health check endpoints

Key Routes Registered:
- Essential: system_health
- Optional: unified_agents, campaigns, lead_capture, email, workflows, 
           brand, keyword_research, research, ai_video, user, support
```

**Startup Flow:**
1. Load environment variables
2. Initialize FastAPI app with CORS
3. Load essential routers (with error handling)
4. Load optional routers (with fallback)
5. Mount static files
6. Initialize TaskScheduler on startup
7. Shutdown TaskScheduler on shutdown

---

### 2. auth.py - Authentication & Token Verification

**Location:** `/backend/auth.py`

**Key Functions:**

```python
def get_supabase_jwt_secret() -> str:
    """Get Supabase JWT secret from environment with caching"""
    
def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token from Supabase"""
    # Returns: payload with 'sub' (user ID), 'email', etc.
    # Exceptions: ExpiredSignatureError, InvalidTokenError
    
def get_current_user(token: str) -> Dict[str, Any]:
    """Extract full user data from JWT"""
    # Returns: {id, email, role, app_metadata, user_metadata, ...}
    
def extract_user_id(token: str) -> str:
    """Extract just the user ID"""
    
def is_admin_user(token: str) -> bool:
    """Check if user has admin privileges"""
    
def get_current_user_dependency(authorization: str) -> Dict[str, Any]:
    """FastAPI dependency for token injection"""
```

**Token Format:**
- Bearer scheme: "Bearer <jwt_token>"
- Algorithm: HS256
- Secret: SUPABASE_JWT_SECRET env var
- Required claims: 'sub' (user ID)

---

### 3. config.py - Configuration & Agent Manager

**Location:** `/backend/config.py`

**AgentManager Class:**
- Singleton pattern for agent initialization
- Graceful degradation on missing dependencies
- Production vs development mode handling
- Mock agents for production stability
- API key validation on startup

**Key Configuration Methods:**

```python
class AgentManager:
    _validate_api_keys()          # Check required/optional keys
    _initialize_agents()          # Load all AI agents
    _get_integrations_config()    # Build integrations dict
    get_agent(name: str)          # Retrieve agent by name
    is_agent_available(name: str) # Check agent availability
    get_system_status()           # Health check data
```

**Environment Variables Validated:**
- Required: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- Optional: ANTHROPIC_API_KEY, FACEBOOK_CLIENT_ID, TWITTER_CLIENT_ID, LINKEDIN_CLIENT_ID

---

## AUTHENTICATION & AUTHORIZATION

### Token Verification Flow

1. Client sends: `Authorization: Bearer <jwt>`
2. Backend extracts token
3. Verifies signature using SUPABASE_JWT_SECRET
4. Extracts user_id from 'sub' claim
5. Optional: Check admin role

### User Identity Extraction

```python
# In routes:
token = Depends(verify_token)  # Just verify it's valid
user_data = get_current_user(token)  # Get full user info
user_id = extract_user_id(token)  # Get just ID
```

### Admin Check

```python
if not is_admin_user(token):
    raise HTTPException(status_code=403, detail="Admin access required")
```

---

## DATABASE LAYER

### Supabase Client (Singleton Pattern)

**Location:** `/backend/database/supabase_client.py`

```python
class SupabaseClient:
    """Singleton Supabase client with connection pooling"""
    - _instance: Optional[SupabaseClient]  # Singleton instance
    - _client: Optional[Client]  # Actual Supabase client
    
    Methods:
    - __init__()                          # Auto-initialize on first access
    - _initialize_client()                # Connect with env vars
    - client: Client (property)           # Get client instance
    - test_connection()                   # Verify database connectivity
    
def get_supabase() -> Client:
    """Module-level getter function"""
```

**Environment Requirements:**
- SUPABASE_URL: Project URL
- SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY: Auth key

**Connection Test:**
```python
supabase.table('active_campaigns').select('count', count='exact').execute()
```

---

### User Secrets Client (Encrypted API Keys)

**Location:** `/backend/database/user_secrets_client.py`

```python
class UserSecretsClient:
    """Manages encrypted user API keys (Gemini, OpenAI, etc.)"""
    
    async def get_user_secret(user_id: str, service_name: str) -> Optional[str]:
        """Retrieve and decrypt user's secret"""
        # Query: user_secrets table
        # Filter: user_id, service_name, is_active=true
        # Returns: Decrypted secret value
        
    async def has_user_secret(user_id: str, service_name: str) -> bool:
        """Check if user has configured secret"""
        
    def _decrypt_secret(encrypted_value: str, iv: str) -> str:
        """Decrypt using AES-GCM with SECRET_MASTER_KEY"""
```

**Encryption Details:**
- Algorithm: AES-256-GCM
- Key: SECRET_MASTER_KEY (64 hex characters)
- Storage: Base64 encoded encrypted_value + IV
- Table: user_secrets with fields:
  - user_id (UUID)
  - service_name (TEXT)
  - encrypted_value (TEXT, base64)
  - initialization_vector (TEXT, base64)
  - is_active (BOOLEAN)
  - last_used_at (TIMESTAMP)

---

## ROUTES (ALL ENDPOINTS)

### Overview

**Total Route Files:** 19  
**Total Documented Endpoints:** 50+  
**Authentication:** Most require Bearer token in Authorization header

---

### 1. System Health Routes

**File:** `/backend/routes/system_health.py`  
**Prefix:** `/api/health`  
**Authentication:** None

#### Endpoints:

##### `GET /api/health/`
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T19:30:00",
  "environment": "production",
  "version": "1.0.2"
}
```

##### `GET /api/health/status`
**Response:**
```json
{
  "status": "operational",
  "services": {
    "api": "healthy",
    "database": "healthy"
  },
  "timestamp": "2025-10-28T19:30:00"
}
```

---

### 2. Campaign Management Routes

**File:** `/backend/routes/campaigns.py`  
**Prefix:** `/api/campaigns`  
**Authentication:** Bearer token required

#### Endpoints:

##### `GET /api/campaigns`
**Description:** Get all campaigns for authenticated user  
**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign-uuid",
      "name": "Summer Campaign",
      "type": "email|social|content",
      "status": "draft|active|paused|completed",
      "description": "Campaign description",
      "budget_allocated": 5000,
      "target_audience": {...},
      "content": {...},
      "metrics": {...},
      "created_at": "2025-10-28T19:30:00",
      "updated_at": "2025-10-28T19:30:00",
      "created_by": "user-uuid"
    }
  ]
}
```

##### `POST /api/campaigns`
**Description:** Create new campaign  
**Authentication:** Required  
**Request Body:**
```json
{
  "name": "Campaign Name",
  "type": "email|social|content",
  "objective": "Increase engagement",
  "target_audience": {...},
  "budget": 5000,
  "channels": ["email", "social"],
  "description": "Optional description"
}
```
**Response:**
```json
{
  "success": true,
  "data": {...campaign object...}
}
```

##### `POST /api/campaigns/bulk/create`
**Description:** Create multiple campaigns in bulk  
**Authentication:** Required  
**Request Body:**
```json
{
  "campaigns": [
    {...campaign1...},
    {...campaign2...}
  ]
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "created": 2,
    "campaigns": [...]
  }
}
```

---

### 3. Lead Capture Routes

**File:** `/backend/routes/lead_capture.py`  
**Prefix:** `/api/lead-capture`

#### Endpoints:

##### `POST /api/lead-capture/webhook/{form_id}`
**Description:** Public webhook for form submissions (no auth)  
**Authentication:** None  
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "company": "ACME Corp",
  "custom_fields": {...},
  "referrer": "https://example.com",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer"
}
```
**Response:**
```json
{
  "success": true,
  "lead_id": "lead-uuid",
  "message": "Thank you! We'll be in touch soon."
}
```

##### `GET /api/lead-capture/forms`
**Description:** Get all forms for authenticated user  
**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [{form objects}]
}
```

##### `GET /api/lead-capture/forms/{form_id}`
**Description:** Get specific form  
**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": {form object}
}
```

##### `POST /api/lead-capture/forms`
**Description:** Create new lead capture form  
**Authentication:** Required  
**Request Body:**
```json
{
  "name": "Contact Form",
  "campaign_id": "campaign-uuid",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "email", "type": "email", "required": true},
    {"name": "phone", "type": "tel", "required": false}
  ],
  "styling": {...},
  "settings": {...}
}
```

##### `PUT /api/lead-capture/forms/{form_id}`
**Description:** Update form  
**Authentication:** Required

##### `DELETE /api/lead-capture/forms/{form_id}`
**Description:** Delete form  
**Authentication:** Required

---

### 4. Leads Management Routes

**File:** `/backend/routes/leads.py`  
**Prefix:** `/api/leads`  
**Authentication:** Bearer token required

#### Endpoints:

##### `GET /api/leads`
**Description:** Get all leads  
**Response:** List of lead objects with scoring and enrichment data

##### `GET /api/leads/search?q=query`
**Description:** Search leads  
**Query Param:** q (search query)

##### `GET /api/leads/analytics/overview`
**Description:** Get lead analytics  
**Response:**
```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "new_leads": 23,
    "qualified_leads": 45,
    "conversion_rate": 0.30
  }
}
```

##### `POST /api/leads`
**Description:** Create new lead  
**Request Body:**
```json
{
  "name": "Lead Name",
  "email": "lead@example.com",
  "company": "Company",
  "phone": "555-1234",
  "source": "form|import|manual"
}
```

##### `GET /api/leads/export?format=csv|json`
**Description:** Export leads in format  
**Response:** CSV or JSON file download

##### `POST /api/leads/sync`
**Description:** Sync leads from external sources  
**Response:**
```json
{
  "success": true,
  "data": {
    "synced_count": 50,
    "new_leads": 20,
    "updated_leads": 30,
    "sources": ["website", "social_media", "email"]
  }
}
```

---

### 5. Email Routes

**File:** `/backend/routes/email.py`  
**Prefix:** `/api/email`  
**Authentication:** Various

#### Endpoints:

##### `POST /api/email/send`
**Description:** Send email  
**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Subject",
  "body": "Email content",
  "template_id": "optional-template-id"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Email queued for sending",
  "email_id": "email-uuid"
}
```

##### `GET /api/email/templates`
**Description:** Get available email templates  
**Response:**
```json
{
  "templates": [
    {"id": "welcome", "name": "Welcome Email"},
    {"id": "newsletter", "name": "Newsletter Template"}
  ]
}
```

---

### 6. Workflows Routes

**File:** `/backend/routes/workflows.py`  
**Prefix:** `/api/workflows`

#### Endpoints:

##### `GET /api/workflows/`
**Description:** List available workflows  
**Response:**
```json
{
  "workflows": [
    {"id": "lead_nurture", "name": "Lead Nurture Workflow", "status": "active"},
    {"id": "onboarding", "name": "User Onboarding", "status": "active"}
  ]
}
```

##### `POST /api/workflows/execute`
**Description:** Execute a workflow  
**Request Body:**
```json
{
  "workflow_id": "lead_nurture",
  "parameters": {...}
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Workflow executed",
  "execution_id": "exec-uuid"
}
```

---

### 7. Brand Routes

**File:** `/backend/routes/brand.py`  
**Prefix:** `/api/brand`

#### Endpoints:

##### `GET /api/brand/`
**Description:** Get brand information  
**Response:**
```json
{
  "brand": {
    "name": "Marketing Automation Platform",
    "description": "AI-powered marketing automation",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b"
    }
  }
}
```

##### `POST /api/brand/update`
**Description:** Update brand information  
**Request Body:**
```json
{
  "name": "Brand Name",
  "colors": {...},
  "description": "Brand description"
}
```

---

### 8. Keyword Research Routes

**File:** `/backend/routes/keyword_research.py`  
**Prefix:** `/api/keyword-research`

#### Endpoints:

##### `POST /api/keyword-research/analyze`
**Description:** Analyze keywords for SEO  
**Request Body:**
```json
{
  "keywords": ["keyword1", "keyword2"]
}
```
**Response:**
```json
{
  "status": "success",
  "analysis": {
    "keywords": ["keyword1", "keyword2"],
    "suggestions": ["long-tail keyword 1", "related keyword"],
    "difficulty_score": 65
  }
}
```

##### `GET /api/keyword-research/suggestions?query=search_term`
**Description:** Get keyword suggestions  
**Response:**
```json
{
  "suggestions": [
    "digital marketing",
    "content strategy",
    "social media automation"
  ]
}
```

---

### 9. Content Routes

**File:** `/backend/routes/content.py`  
**Prefix:** `/api/content`  
**Authentication:** Bearer token required

#### Endpoints:

##### `POST /api/content/generate`
**Description:** Generate AI-powered content  
**Request Body:**
```json
{
  "title": "Article Title",
  "content_type": "blog|email|social|ad_copy",
  "target_audience": "Target audience description",
  "key_messages": ["message1", "message2"],
  "platform": "LinkedIn|Twitter|Facebook|email",
  "tone": "professional|casual|urgent",
  "length": "short|medium|long",
  "keywords": ["keyword1", "keyword2"],
  "cta": "Call-to-action text"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "generated_content": "...",
    "variations": [...]
  }
}
```

##### `POST /api/content/create`
**Description:** Create new content  
**Request Body:**
```json
{
  "type": "blog|email|social",
  "platform": "platform-name",
  "brief": {...},
  "target_audience": "..."
}
```

##### `GET /api/content/library?content_type=&platform=`
**Description:** Get content library with optional filters  
**Response:** List of content items

---

### 10. Proposals Routes

**File:** `/backend/routes/proposals.py`  
**Prefix:** `/api/proposals`  
**Authentication:** Bearer token required

#### Endpoints:

##### `POST /api/proposals/generate`
**Description:** Generate new proposal  
**Request Body:**
```json
{
  "client_name": "Client Name",
  "project_description": "...",
  "scope": "...",
  "budget": 10000,
  "timeline": "30 days"
}
```

##### `GET /api/proposals/templates`
**Description:** Get proposal templates  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template-1",
      "name": "Service Proposal",
      "category": "services"
    }
  ]
}
```

##### `GET /api/proposals?status=&client=`
**Description:** Get proposals with optional filters  
**Query Params:** status, client

##### `POST /api/proposals/{proposal_id}/save`
**Description:** Save proposal changes

##### `POST /api/proposals/{proposal_id}/export?format=pdf|word`
**Description:** Export proposal to PDF or Word

---

### 11. Research Routes

**File:** `/backend/routes/research.py`  
**Prefix:** `/api/research`

#### Endpoints:

##### `POST /api/research/analyze`
**Description:** Analyze market research data  
**Request Body:**
```json
{
  "topic": "Market research topic"
}
```
**Response:**
```json
{
  "status": "success",
  "analysis": {
    "topic": "...",
    "insights": ["insight1", "insight2"],
    "recommendations": ["recommendation1"]
  }
}
```

##### `GET /api/research/topics`
**Description:** Get available research topics  
**Response:**
```json
{
  "topics": [
    {"id": "market_trends", "name": "Market Trends"},
    {"id": "competitor_analysis", "name": "Competitor Analysis"}
  ]
}
```

---

### 12. Integrations Routes

**File:** `/backend/routes/integrations.py`  
**Prefix:** `/api/integrations`  
**Authentication:** Bearer token required (mostly)

#### Webhook Management:

##### `GET /api/integrations/webhooks`
**Description:** Get all webhooks

##### `POST /api/integrations/webhooks`
**Description:** Create new webhook  
**Request Body:**
```json
{
  "name": "Webhook Name",
  "url": "https://example.com/webhook",
  "events": ["campaign.created", "lead.captured"],
  "is_active": true,
  "secret_token": "optional-secret"
}
```

##### `DELETE /api/integrations/webhooks/{webhook_id}`
**Description:** Delete webhook

##### `POST /api/integrations/webhooks/{webhook_id}/test`
**Description:** Test webhook delivery  
**Response:**
```json
{
  "success": true,
  "data": {
    "webhook_id": "...",
    "status": "success",
    "response_code": 200,
    "response_time_ms": 150
  }
}
```

#### Social Platform Integrations:

##### `POST /api/integrations/buffer/connect`
**Status:** Not Implemented (501)

##### `POST /api/integrations/sprout/connect`
**Status:** Available

##### `POST /api/integrations/later/connect`
**Status:** Available

##### `POST /api/integrations/hootsuite/connect`
**Status:** Available

---

### 13. AI Video Routes

**File:** `/backend/routes/ai_video.py`  
**Prefix:** `/ai-video`  
**Authentication:** Bearer token required

#### Endpoints:

##### `POST /ai-video/plan`
**Description:** Generate video plan from brief  
**Request Body:**
```json
{
  "goal": "Product launch video",
  "platform": "YouTubeShort|TikTok|Reels|Landscape",
  "duration_s": 15,
  "language": "en",
  "brand_kit": {
    "primary_color": "#FF5722",
    "secondary_color": "#FFC107",
    "logo_url": "https://...",
    "font_family": "Inter"
  }
}
```
**Response:**
```json
{
  "project_id": "video-uuid",
  "scenes": [
    {
      "visual": "Scene description",
      "text_overlay": "Optional text",
      "duration": 5,
      "audio_cue": "Background music"
    }
  ],
  "final_cta": "Call-to-action",
  "estimated_cost": 3.20
}
```

##### `POST /ai-video/generate-images`
**Description:** Generate scene images  
**Request Body:**
```json
{
  "project_id": "video-uuid",
  "scene_descriptions": [
    "Scene 1 description",
    "Scene 2 description"
  ]
}
```
**Response:**
```json
{
  "project_id": "video-uuid",
  "image_urls": ["https://...", "https://..."],
  "cost_usd": 0.078
}
```

##### `POST /ai-video/generate`
**Description:** Generate final video  
**Request Body:**
```json
{
  "project_id": "video-uuid",
  "final_prompt": "Complete video prompt",
  "image_url": "https://optional-reference-image",
  "use_veo_fast": true
}
```
**Response:**
```json
{
  "project_id": "video-uuid",
  "operation_id": "op-uuid",
  "status": "generating",
  "estimated_time_minutes": 5
}
```

##### `GET /ai-video/status/{project_id}`
**Description:** Check video generation status  
**Response:**
```json
{
  "project_id": "video-uuid",
  "status": "generating|completed|failed",
  "video_url": "https://... or null",
  "progress": 45,
  "error_message": null
}
```

##### `GET /ai-video/projects`
**Description:** List user's video projects

##### `POST /ai-video/autopilot`
**Description:** Generate video for autopilot (internal)  
**Request Body:**
```json
{
  "user_id": "user-uuid",
  "campaign_id": "campaign-uuid",
  "goal": "Campaign promotion",
  "platform": "YouTubeShort",
  "duration_s": 8,
  "brand_kit": {...}
}
```

---

### 14. User Routes

**File:** `/backend/routes/user.py`  
**Prefix:** `/api/user`  
**Authentication:** Bearer token required

#### Endpoints:

##### `DELETE /api/user/account`
**Description:** Delete user account and all data (GDPR compliance)  
**Response:**
```json
{
  "status": "success",
  "message": "Account deleted successfully",
  "user_id": "user-uuid"
}
```

**Deletes from tables:**
- user_preferences, user_secrets
- marketing_autopilot_config, autopilot_activity_log, autopilot_weekly_reports
- campaigns, leads, content_library
- ai_video_projects
- brand_positioning_analyses, funnel_designs
- competitive_gap_analyses, performance_tracking_frameworks

##### `GET /api/user/data-export`
**Description:** Export all user data (GDPR compliance)  
**Response:**
```json
{
  "user_id": "user-uuid",
  "email": "user@example.com",
  "export_date": "2025-10-28T19:30:00",
  "data": {
    "user_preferences": [...],
    "marketing_autopilot_config": [...],
    "campaigns": [...],
    "leads": [...],
    "content_library": [...],
    "ai_video_projects": [...]
  }
}
```

---

### 15. Support Routes

**File:** `/backend/routes/support.py`  
**Prefix:** `/api/support`

#### Endpoints:

##### `POST /api/support/ticket`
**Description:** Create support ticket (public + authenticated)  
**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "subject": "Ticket Subject",
  "message": "Detailed message",
  "user_id": "optional-user-uuid"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Support ticket created successfully",
  "ticket_id": "ticket-uuid"
}
```

##### `GET /api/support/tickets`
**Description:** Get all support tickets (admin only)  
**Response:**
```json
{
  "status": "success",
  "tickets": [
    {
      "id": "ticket-uuid",
      "email": "user@example.com",
      "subject": "...",
      "status": "open|in_progress|resolved|closed",
      "priority": "normal|high|urgent",
      "created_at": "...",
      "resolved_at": null
    }
  ]
}
```

##### `GET /api/support/ticket/{ticket_id}`
**Description:** Get specific ticket  
**Response:**
```json
{
  "status": "success",
  "ticket": {...}
}
```

##### `PATCH /api/support/ticket/{ticket_id}`
**Description:** Update ticket (admin only)  
**Request Body:**
```json
{
  "status": "resolved|closed",
  "priority": "high",
  "admin_notes": "Resolution notes"
}
```

---

### 16. User-Aware Agents Routes

**File:** `/backend/routes/user_aware_agents.py`  
**Prefix:** `/api/agents` (overlaps with agents.py)  
**Authentication:** Bearer token required

#### Endpoints:

##### `POST /api/agents/daily-focus`
**Description:** Generate daily focus recommendations  
**Request Body:**
```json
{
  "query": "What should I focus on today?",
  "campaigns": [...campaign objects...],
  "context": [...],
  "date": "2025-10-28"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "focus_summary": "Based on your 5 active campaigns...",
    "campaign_count": 5,
    "timestamp": "2025-10-28T19:30:00"
  }
}
```

##### `POST /api/agents/campaign`
**Description:** Handle general campaign queries  
**Request Body:**
```json
{
  "task_type": "general_query|analyze_performance",
  "input_data": {
    "query": "How can I improve engagement?",
    "campaigns": [...],
    "context": [...]
  }
}
```

##### `GET /api/campaigns`
**Description:** Retrieve campaigns for user  
**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

##### `POST /api/campaigns`
**Description:** Create new campaign (alternate route)  
**Request Body:**
```json
{
  "name": "Campaign Name",
  "type": "mixed|marketing|email|social",
  "channel": "email|social|mixed",
  "start_date": "2025-11-01",
  "end_date": "2025-11-30"
}
```

---

### 17. Agents Execution Routes

**File:** `/backend/routes/agents.py`  
**Prefix:** `/api/agents`  
**Authentication:** Bearer token required

#### Endpoints:

##### `POST /api/agents/execute`
**Description:** Execute agent task with proper error handling  
**Request Body:**
```json
{
  "agent_type": "campaign|content|lead|social",
  "task_type": "task-name",
  "input_data": {...}
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Executed task-name for agent_type",
    "timestamp": "2025-10-28T19:30:00",
    "user_id": "user-uuid"
  }
}
```

##### `POST /api/agents/daily-focus` (Duplicate)
**Description:** Daily focus with fallback analysis

##### `POST /api/agents/campaign` (Duplicate)
**Description:** General campaign agent task

---

### 18. AI Agents Routes (Older)

**File:** `/backend/routes/ai_agents.py`  
**Prefix:** `/api/agents` (overlaps)  
**Authentication:** Bearer token (HTTP Bearer)

#### Endpoints:

##### `POST /api/agents/execute`
**Description:** Execute agent task (authentication via HTTPBearer)

##### `POST /api/agents/daily-focus`
**Description:** Daily focus agent

##### `POST /api/agents/campaign`
**Description:** General campaign agent

---

### 19. Unified Agents Routes

**File:** `/backend/routes/unified_agents.py`  
**Prefix:** `/api/agents`  
**Authentication:** None (stub routes)

#### Endpoints:

##### `GET /api/agents/`
**Description:** List available agents  
**Response:**
```json
{
  "agents": [
    {"id": "content", "name": "Content Agent", "status": "available"},
    {"id": "campaign", "name": "Campaign Agent", "status": "available"},
    {"id": "lead_generation", "name": "Lead Generation Agent", "status": "available"}
  ]
}
```

##### `POST /api/agents/execute`
**Description:** Execute agent task (stub)  
**Response:**
```json
{
  "status": "success",
  "message": "Task queued for agent_type agent",
  "task_id": "task-uuid"
}
```

---

### 20. Internal Publishing Routes

**File:** `/backend/routes/internal_publishing.py`  
**No Prefix:** Root level  
**Authentication:** None

#### Endpoints:

##### `POST /internal-publishing`
**Description:** Internal agent for publishing (requires agent to be available)  
**Request Body:**
```json
{
  "prompt": "Content prompt",
  "title": "Content title",
  "caption": "Caption text",
  "music_url": "https://...",
  "intro_url": "https://...",
  "platform": "platform-name",
  "account_id": "account-uuid"
}
```
**Response:**
```json
{
  "success": true,
  "data": {...}
}
```

---

## AI SERVICES & MODELS

### 1. Multi-Model Service (Central Hub)

**Location:** `/backend/agents/social/multi_model_service.py`

**Class:** `MultiModelService`

```python
class MultiModelService:
    """Support for multiple LLM providers with fallback"""
    
    _initialize_model_configs()  # Config for each provider
    set_llm_provider(provider, api_key)  # Switch provider
    generate_social_content(prompt, platform, model, provider)  # Generate content
```

**Supported Providers & Models:**

#### OpenAI (Default - 2025 Models)
- `gpt-5` - Best model for coding/agentic tasks
- `gpt-5-mini` - Fast, cost-effective (default)
- `gpt-4.1` - Improved coding
- `gpt-4.1-mini` - Smaller variant
- Max tokens: 4000
- Temperature: 0.7
- Supports vision: YES
- Rate limit: 60 req/min

#### Anthropic Claude (Fallback #1 - 2025 Models)
- `claude-sonnet-4.5` - Best coding (September 2025, default)
- `claude-opus-4.1` - Most powerful (August 2025)
- `claude-sonnet-4` - Previous version (May 2025)
- Max tokens: 4000
- Temperature: 0.7
- Supports vision: YES
- Rate limit: 50 req/min

#### Google Gemini (Video & Images)
- `gemini-2.5-pro` - State-of-the-art thinking model
- `gemini-2.5-flash` - Best price-performance (default)
- `gemini-2.0-flash` - Second generation
- `veo-3` / `veo-3-fast` - Video generation
- `nano-banana` - Image generation
- Max tokens: 4000
- Supports vision: YES

#### Mistral (Fallback #3)
- `mistral-large-latest` - Flagship (default)
- `mistral-medium-latest` - Smaller variant
- Max tokens: 4000
- Rate limit: 100 req/min

**Fallback Order:**
1. OpenAI (gpt-5-mini)
2. Anthropic (claude-sonnet-4.5)
3. Mistral (mistral-large-latest)
4. Error response

---

### 2. Unified AI Service

**Location:** `/backend/agents/ai_service.py`

**Class:** `AIService`

```python
class AIService:
    """Unified AI service delegating to specialized services"""
    
    __init__(api_key: str)  # Initialize with OpenAI key
    
    # Email generation
    async generate_email_content(campaign_type, target_audience) -> Dict
    
    # Social media generation
    async generate_social_post(platform, content_theme, brand_voice) -> Dict
    
    # Lead enrichment
    async generate_lead_enrichment_insights(lead_data) -> Dict
    
    # Campaign optimization
    async optimize_campaign_copy(campaign_data) -> Dict
```

**Specialized Services:**
- `EmailAIService` - Email content generation
- `SocialAIService` - Social post generation
- `LeadAIService` - Lead insights
- `CampaignAIService` - Campaign optimization

---

### 3. User-Specific AI Service

**Location:** `/backend/agents/user_ai_service.py`

**Uses user's own OpenAI API key from Supabase user_secrets**

```python
class UserAIService:
    """AI service using user's personal API key"""
    
    async get_ai_service()  # Get or create service with user's key
    async make_request(prompt, system_prompt)  # Make API call
    async analyze_campaigns(campaigns)  # Analyze user data
```

---

### 4. Enhanced User AI Service

**Location:** `/backend/agents/enhanced_user_ai_service.py`

**Adds knowledge base integration**

```python
class EnhancedUserAIService:
    """User AI service with knowledge base and RAG"""
    
    async has_api_key() -> bool  # Check if key configured
    async generate_daily_focus_with_knowledge(query, campaigns, context)  # RAG query
    async process_general_query_with_knowledge(query, campaigns, context)  # RAG query
```

---

## AGENTS SYSTEM

### Agent Architecture

**Base Class Hierarchy:**
```
BaseAgentCore (abstract)
  ├── CampaignAgent
  ├── SocialMediaAgent
  ├── ContentAgent
  ├── EmailAutomationAgent
  ├── LeadGenerationAgent
  ├── AnalyticsAgent
  ├── ProposalGenerator
  ├── KeywordResearchAgent
  ├── MCPAgent
  └── EnhancedSocialMediaAgent
```

---

### Core Agent Types

#### 1. Campaign Agent

**Location:** `/backend/agents/campaign_agent.py`

**Responsibilities:**
- Campaign optimization
- Performance analysis
- A/B test generation
- Campaign scheduling
- Copy creation
- Campaign monitoring

**Supported Tasks:**
- `optimize_campaign` - Improve campaign performance
- `analyze_performance` - Analyze metrics
- `generate_ab_tests` - Create test variations
- `schedule_campaigns` - Schedule launches
- `create_campaign_copy` - Generate copy
- `monitor_campaigns` - Track performance

**Key Methods:**
```python
async get_campaigns(filters=None, limit=50)
async create_campaign(name, objective, target_audience, budget, channels)
async optimize_campaign(campaign_id, metrics)
async generate_ab_tests(campaign_id, copy_variations)
```

---

#### 2. Social Media Agent

**Location:** `/backend/agents/social_media_agent.py`

**Data Structures:**
```python
class SocialPlatform(Enum):
    LINKEDIN, TWITTER, FACEBOOK, INSTAGRAM, YOUTUBE, TIKTOK

class PostStatus(Enum):
    DRAFT, SCHEDULED, PUBLISHED, FAILED, DELETED

class EngagementType(Enum):
    LIKE, COMMENT, SHARE, MENTION, DIRECT_MESSAGE

@dataclass
class SocialPost:
    id, platform, content, media_urls, scheduled_time, published_time
    status, engagement_stats, hashtags, mentions, campaign_id
    created_at, updated_at

@dataclass
class EngagementItem:
    id, platform, post_id, type, author, content, sentiment
    timestamp, responded, response_content, priority_score
```

**Supported Tasks:**
- Content generation per platform
- Engagement tracking
- Sentiment analysis
- Hashtag optimization
- Schedule management

---

#### 3. Content Agent

**Location:** `/backend/agents/content_agent.py`

**Content Services:**
```python
_content_services = {
    "email": EmailContentService,
    "social": SocialContentService,
    "blog": BlogContentService,
    "optimization": ContentOptimizationService,
    "headlines": HeadlinesService
}
```

**Supported Tasks:**
- `create_email_content` - Generate emails
- `create_social_content` - Generate social posts
- `create_blog_content` - Generate blog articles
- `optimize_content` - Improve content
- `generate_headlines` - Create headlines

---

#### 4. Email Automation Agent

**Location:** `/backend/agents/email_automation_agent.py`

**Handles:**
- Email campaign creation
- Template management
- Send scheduling
- Personalization
- Metrics tracking
- Webhook handling

---

#### 5. Lead Generation Agent

**Location:** `/backend/agents/lead_generation_agent.py`

**Sub-Services:**
```python
LeadEnrichmentService    # Enrich lead data
LeadScoringService       # Score leads
LeadOutreachService      # Outreach campaigns
LeadAnalyticsService     # Lead analytics
LeadQualificationService # Qualify leads
```

**Supported Tasks:**
- `enrich_leads` - Add data to leads
- `score_leads` - Calculate lead scores
- `qualify_leads` - Qualify/disqualify
- `create_outreach` - Create outreach campaign
- `get_lead_analytics` - Analytics

---

#### 6. Analytics Agent

**Location:** `/backend/agents/analytics_agent.py`

**Enums:**
```python
class MetricType(Enum):
    CAMPAIGN_PERFORMANCE, LEAD_GENERATION, CONTENT_ENGAGEMENT
    SOCIAL_MEDIA, WEBSITE_TRAFFIC, CONVERSION, ROI

class ReportType(Enum):
    DAILY, WEEKLY, MONTHLY, QUARTERLY, CUSTOM

class InsightLevel(Enum):
    CRITICAL, HIGH, MEDIUM, LOW

@dataclass
class MetricData:
    metric_name, value, previous_value, change_percent, timestamp, metadata

@dataclass
class Insight:
    id, level, title, description, metric_type, impact_score
    recommendations, timestamp, data_points
```

---

#### 7. Proposal Generator

**Location:** `/backend/agents/proposal_generator.py`

**Functionality:**
- Generate proposals from templates
- Get template library
- Save proposals
- Export to PDF/Word

**Methods:**
```python
async generate_proposal(proposal_data)
async get_proposal_templates()
async get_proposals(filters)
async save_proposal(proposal_data)
async export_proposal(proposal_id, format_type)
```

---

### Lead Management Services

**Location:** `/backend/agents/leads/`

#### Lead Enrichment Service
**enriches lead data** with company info, verified contacts, firmographics

#### Lead Scoring Service
**calculates lead quality scores** based on engagement, demographics, firmographics

#### Lead Qualification Service
**determines if lead meets criteria** using qualification rules engine

#### Lead Outreach Service
**creates personalized outreach campaigns** with messaging and timing

#### Lead Analytics Service
**provides insights on lead pipeline**, conversion rates, velocity

---

### Content Generation Services

**Location:** `/backend/agents/content/`

#### Email Content Service
- Professional email generation
- Personalization fields
- CTA optimization

#### Social Content Service
- Platform-specific content
- Hashtag optimization
- Emoji integration
- Character limits

#### Blog Content Service
- Long-form article generation
- SEO optimization
- Structured content

#### Headlines Service
- Multiple headline variations
- A/B test optimization
- Emotional triggers

#### Content Optimization Service
- Readability improvement
- SEO enhancement
- Tone adjustment

---

### Social Media Services

**Location:** `/backend/agents/social/`

#### Image Generation Service
**Generates images using Google Nano Banana or other vision models**

#### AB Testing Service
**Creates test variations for social posts**

#### Real-Time Metrics Service
**Tracks engagement metrics in real-time**

#### Trend Monitoring Service
**Monitors trending topics and hashtags**

#### Platform Extensions Service
**Extends support for new platforms**

---

### Email Services

**Location:** `/backend/agents/email/`

#### Enhanced Email Service
- Template management
- Send scheduling
- A/B testing

#### Metrics Service
- Open rates
- Click rates
- Conversion tracking

#### Personalization Service
- Dynamic content blocks
- User data merging
- Custom fields

#### Template Versioning Service
- Version control for templates
- Rollback capability
- Draft/Live management

#### Webhook Service
- Bounce handling
- Complaint handling
- Engagement tracking

---

### SEO Services

**Location:** `/backend/agents/seo/`

#### Keyword Research Agent
**Researches keywords and opportunities**

#### Keyword Research Service
**Implements keyword analysis**

---

### Agent Registry & Logging

#### Agent Registry
**Location:** `/backend/agents/agent_registry.py`

```python
class AgentRegistry:
    """Central registry of all agents"""
    register_agent(agent_id, agent_instance)
    get_agent(agent_id)
    get_all_agents()
    remove_agent(agent_id)
```

#### Agent Logging
**Location:** `/backend/agents/agent_logging.py`

```python
class AgentLogger:
    """Logging for agent tasks"""
    async log_task_start(task_id, task_type, input_data)
    async log_task_completion(task_id, output_data, execution_time_ms)
    async log_task_failure(task_id, error_message, execution_time_ms)
    async update_agent_status(status)
```

#### Agent Utils
**Location:** `/backend/agents/agent_utils.py`

```python
class AgentUtils:
    """Utility functions for agents"""
    async save_result(result_data)
    async load_context(context_id)
    async format_response(data, format_type)
```

---

## SERVICES & UTILITIES

### 1. Campaign Executor

**Location:** `/backend/services/campaign_executor.py`

```python
class CampaignStatus(Enum):
    DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED, FAILED

class CampaignExecutor:
    """Orchestrates campaign execution across channels"""
    
    async launch_campaign(campaign_id, user_id) -> ExecutionResult
    async schedule_campaign(campaign_id, start_time) -> ExecutionResult
    async pause_campaign(campaign_id) -> ExecutionResult
    async resume_campaign(campaign_id) -> ExecutionResult
    async complete_campaign(campaign_id) -> ExecutionResult
    
    # Internal helpers
    async _get_campaign(campaign_id, user_id)
    def _validate_campaign(campaign) -> Dict
    async _execute_email_channel(campaign)
    async _execute_social_channel(campaign)
    async _execute_content_channel(campaign)
```

**Responsibilities:**
1. Fetch campaign from database
2. Validate campaign configuration
3. Orchestrate multi-channel execution
4. Track execution status
5. Log activities
6. Handle errors gracefully

---

### 2. Task Scheduler

**Location:** `/backend/services/task_scheduler.py`

**Framework:** APScheduler (Background Scheduler)

```python
class TaskScheduler:
    """Background task scheduling with APScheduler"""
    
    __init__(supabase_client, email_agent, social_agent, content_agent)
    
    # Social media scheduling
    def schedule_social_post(post_id, campaign_id, user_id, content, 
                            platforms, scheduled_time, media_urls) -> Optional[str]
    
    # Email scheduling
    def schedule_email_sequence(sequence_id, campaign_id, user_id,
                               emails, interval_hours) -> Optional[str]
    
    # Content publishing
    def schedule_content_publish(content_id, campaign_id, user_id,
                                publish_time, channels) -> Optional[str]
    
    # Campaign monitoring
    def schedule_campaign_monitor(campaign_id, user_id, check_interval_hours) -> Optional[str]
    
    # Lead nurturing
    def schedule_lead_nurture(workflow_id, user_id, leads, schedule) -> Optional[str]
    
    # Utility methods
    def get_scheduled_jobs(user_id) -> List[Job]
    def cancel_job(job_id) -> bool
    def shutdown()
```

**Scheduler Configuration:**
```python
BackgroundScheduler(
    timezone=pytz.UTC,
    job_defaults={
        'coalesce': False,         # Run each missed job individually
        'max_instances': 3,        # Up to 3 concurrent per job
        'misfire_grace_time': 300  # 5 min grace for missed jobs
    }
)
```

**Job Types:**
- DateTrigger: One-time jobs at specific time
- IntervalTrigger: Recurring at intervals
- CronTrigger: Cron-based scheduling

---

## REQUEST/RESPONSE PATTERNS

### Standard API Response

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": "Error description"
}
```

**Model:** `/backend/models.py`
```python
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
```

---

### Authentication Pattern

**All protected routes use:**
```python
token: str = Depends(verify_token)
```

**Token extraction:**
```python
# In route handler
user_data = get_current_user(token)
user_id = user_data["id"]
```

---

### Error Handling Pattern

**Common HTTP Status Codes:**
- 200: Success
- 400: Bad request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Internal server error
- 503: Service unavailable (agents not ready)

**Structured Logging:**
```python
logger.info(f"✅ Operation succeeded")
logger.warning(f"⚠️ Partial failure")
logger.error(f"❌ Operation failed: {error}")
```

---

## ERROR HANDLING

### Authentication Errors

```python
if not token:
    raise ValueError("Token is required")

if token.startswith('Bearer '):
    token = token[7:]

try:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
except jwt.ExpiredSignatureError:
    raise ValueError("Token has expired")
except jwt.InvalidTokenError:
    raise ValueError("Invalid token")
```

---

### Database Errors

```python
try:
    result = supabase.table('campaigns').select('*').execute()
except Exception as e:
    logger.error(f"Database error: {e}")
    return APIResponse(success=False, error=str(e))
```

---

### Agent Fallback Pattern

```python
# Try AI agent first
if agent_manager.agents_available:
    try:
        result = await agent_manager.campaign_agent.get_campaigns()
        if result.get("success"):
            return APIResponse(success=True, data=result["data"])
    except Exception as agent_error:
        logger.error(f"AI agent failed: {agent_error}")

# Try database second
db_data = await get_campaigns_from_database(user_id)
if db_data is not None:
    return APIResponse(success=True, data=db_data)

# Fallback
return APIResponse(success=True, data=[])
```

---

### Service Initialization Safety

```python
try:
    module = __import__(module_path, fromlist=[router_name])
    if hasattr(module, "router"):
        router = getattr(module, "router")
        app.include_router(router)
        logger.info(f"✅ Loaded router: {module_path}")
except ImportError as e:
    logger.warning(f"⚠️ Missing dependency: {e}")
except AttributeError as e:
    logger.warning(f"⚠️ Missing attribute: {e}")
except Exception as e:
    logger.error(f"❌ Failed to load: {e}")
```

---

## ENVIRONMENT VARIABLES

### Required

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
```

### Optional

```
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
MISTRAL_API_KEY=...
SECRET_MASTER_KEY=...    # For encrypting user secrets
FACEBOOK_CLIENT_ID=...
TWITTER_CLIENT_ID=...
LINKEDIN_CLIENT_ID=...
```

### Configuration

```
ENVIRONMENT=production|development
PORT=8000
HOST=0.0.0.0
```

---

## DEPLOYMENT

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
```

### Render Configuration

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## DATABASE TABLES (Referenced in Code)

### User & Configuration
- `user_preferences` - User settings & interface mode
- `user_secrets` - Encrypted API keys
- `marketing_autopilot_config` - Autopilot configuration

### Content & Campaigns
- `active_campaigns` - Campaign data
- `campaigns` - Campaign records
- `lead_capture_forms` - Lead form configurations
- `content_library` - Saved content

### Analytics & Logging
- `autopilot_activity_log` - Autopilot activity records
- `autopilot_weekly_reports` - Weekly summaries
- `support_tickets` - Support ticket system

### Advanced Features
- `ai_video_projects` - Video generation projects
- `brand_positioning_analyses` - Brand strategy analyses
- `funnel_designs` - Sales funnel designs
- `competitive_gap_analyses` - Competitive analyses
- `performance_tracking_frameworks` - KPI frameworks
- `leads` - Lead records

---

## STARTUP SEQUENCE

1. **main.py loads**
   - Environment variables loaded
   - FastAPI app created
   - CORS configured

2. **Router loading begins**
   - Essential routers loaded first (system_health)
   - Optional routers loaded with fallback
   - Errors logged but don't crash startup

3. **Static files mounted**
   - /static directory mounted
   - Form HTML served

4. **Startup event triggered**
   - Supabase client initialized
   - AgentManager initializes agents
   - TaskScheduler starts
   - Services ready

5. **App listening**
   - Endpoints available
   - Health checks responding

---

## SHUTDOWN SEQUENCE

1. **Shutdown event triggered**
   - TaskScheduler stops gracefully
   - Pending jobs completed
   - Connections closed

2. **App stops**
   - No new requests accepted
   - Graceful timeout enforced

---

## SUMMARY

The Action Insight Marketing Platform backend is a comprehensive FastAPI application with:

- **50+ REST endpoints** covering campaigns, leads, content, email, video, analytics
- **10+ AI agents** for marketing automation across channels
- **Multi-provider AI support** (OpenAI, Anthropic, Google, Mistral) with intelligent fallbacks
- **Sophisticated agent architecture** with specialized services for content, leads, analytics, email, social
- **Enterprise services** like task scheduling, campaign orchestration, lead enrichment
- **Secure credential management** with AES-256-GCM encryption for user API keys
- **Graceful degradation** with mock agents and fallback services for production stability
- **Comprehensive logging** and error handling throughout

The system is designed for scalability, reliability, and ease of maintenance with clear separation of concerns and well-defined interfaces.

