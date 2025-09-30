
# API Documentation

## Overview

The AI Marketing Hub API is built with **FastAPI** and provides programmatic access to all platform features including AI agent orchestration, campaign management, lead tracking, content generation, and analytics.

## Authentication

All API requests require authentication using Supabase Auth JWT tokens. The token should be included in the Authorization header:

```
Authorization: Bearer <your-supabase-jwt-token>
```

## Base URLs

**Backend API (FastAPI):**
```
Production: https://your-backend.onrender.com
Development: http://localhost:8000
```

**Interactive API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Core Endpoints

### Health Check

#### Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "message": "Marketing Automation Backend API",
  "status": "running"
}
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.2",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production",
  "agents_status": "operational"
}
```

#### System Health
```http
GET /api/system-health
```

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "ai_agents": "healthy",
    "external_apis": "healthy"
  }
}
```

## Endpoints

### AI Agents API

The unified agents API allows you to execute tasks across all specialized AI agents.

#### Execute Agent Task
```http
POST /api/agents/{agent_type}/{task_type}
```

**Path Parameters:**
- `agent_type`: Type of agent (`campaign`, `content`, `email`, `social`, `analytics`, `leads`)
- `task_type`: Specific task to execute (varies by agent)

**Request Body:**
```json
{
  "campaign_id": 123,
  "goals": ["increase_conversions"],
  "parameters": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "string",
    "status": "completed",
    "output": {},
    "execution_time_ms": 1500
  }
}
```

**Agent Types & Tasks:**

**Campaign Agent** (`/api/agents/campaign/...`)
- `optimize_campaign` - Optimize campaign parameters
- `analyze_performance` - Analyze metrics
- `generate_ab_tests` - A/B test creation
- `schedule_campaigns` - Scheduling optimization
- `create_campaign_copy` - Copy generation

**Content Agent** (`/api/agents/content/...`)
- `create_email_content` - Email copy
- `create_social_content` - Social posts
- `create_blog_content` - Blog articles
- `optimize_content` - Content optimization
- `generate_headlines` - Headlines generation

**Email Agent** (`/api/agents/email/...`)
- `create_email_sequence` - Drip campaigns
- `personalize_emails` - Personalization
- `optimize_send_times` - Send timing
- `segment_audience` - Segmentation

**Social Media Agent** (`/api/agents/social/...`)
- `create_social_post` - Post creation
- `schedule_posts` - Post scheduling
- `analyze_engagement` - Engagement analytics
- `suggest_hashtags` - Hashtag suggestions

**Analytics Agent** (`/api/agents/analytics/...`)
- `analyze_campaign_performance` - Campaign analysis
- `generate_insights` - AI insights
- `predict_trends` - Forecasting
- `create_reports` - Report generation

**Lead Agent** (`/api/agents/leads/...`)
- `score_leads` - Lead scoring
- `qualify_leads` - Qualification
- `enrich_lead_data` - Data enrichment
- `generate_outreach` - Outreach creation

#### Example: Generate Blog Content
```bash
curl -X POST https://your-backend.onrender.com/api/agents/content/create_blog_content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Marketing Automation Best Practices",
    "keywords": ["marketing", "automation", "AI"],
    "tone": "professional",
    "length": 1500
  }'
```

### Campaigns

#### Get All Campaigns
```http
GET /api/campaigns
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "type": "email|social|content",
      "status": "draft|active|paused|completed",
      "created_at": "string",
      "updated_at": "string",
      "metrics": {
        "sent": "number",
        "opened": "number",
        "clicked": "number"
      }
    }
  ]
}
```

#### Create Campaign
```http
POST /api/campaigns
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "type": "email|social|content",
  "target_audience": "string",
  "settings": {}
}
```

#### Update Campaign
```http
PUT /api/campaigns/{id}
```

#### Delete Campaign
```http
DELETE /api/campaigns/{id}
```

### Leads

#### Get All Leads
```http
GET /api/leads
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "score": "number",
      "status": "new|qualified|converted",
      "source": "string",
      "created_at": "string",
      "last_activity": "string"
    }
  ]
}
```

#### Score Leads
```http
POST /api/leads/score
```

#### Enrich Lead Data
```http
POST /api/leads/{id}/enrich
```

### Content

#### Generate Content
```http
POST /api/content/generate
```

**Request Body:**
```json
{
  "topic": "string",
  "audience": "string",
  "tone": "professional|casual|friendly",
  "platform": "website|social|email",
  "length": "short|medium|long",
  "keywords": ["string"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "html_content": "string",
    "seo_score": "number",
    "readability_score": "number",
    "engagement_prediction": "number",
    "tags": ["string"]
  }
}
```

### Analytics

#### Get Dashboard Analytics
```http
GET /api/analytics
```

#### Get Email Metrics
```http
GET /api/analytics/email
```

#### Get Social Metrics
```http
GET /api/analytics/social
```

### Social Media

#### Get Connected Platforms
```http
GET /api/social/platforms
```

#### Connect Platform
```http
POST /api/social/connect
```

**Request Body:**
```json
{
  "platform": "facebook|twitter|instagram|linkedin",
  "access_token": "string",
  "account_id": "string"
}
```

### Workflows

#### Get All Workflows
```http
GET /api/workflows
```

#### Create Workflow
```http
POST /api/workflows
```

#### Execute Workflow
```http
POST /api/workflows/{id}/execute
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Invalid or missing authentication token
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server-side error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Standard endpoints**: 100 requests per minute
- **Content generation**: 10 requests per minute
- **Analytics endpoints**: 200 requests per minute

## Webhooks

The platform supports webhooks for real-time notifications:

### Supported Events
- `campaign.started`
- `campaign.completed`
- `lead.created`
- `lead.scored`
- `content.generated`

### Webhook Payload
```json
{
  "event": "string",
  "timestamp": "string",
  "data": {}
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @aimarketinghub/sdk
```

```javascript
import { AIMarketingHub } from '@aimarketinghub/sdk';

const client = new AIMarketingHub({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-project.supabase.co/functions/v1'
});

// Get campaigns
const campaigns = await client.campaigns.getAll();

// Generate content
const content = await client.content.generate({
  topic: 'AI in Marketing',
  audience: 'marketers',
  tone: 'professional'
});
```

## Examples

### Creating a Complete Campaign
```javascript
// 1. Create campaign
const campaign = await client.campaigns.create({
  name: 'Summer Sale Campaign',
  type: 'email',
  description: 'Promotional campaign for summer products'
});

// 2. Generate content
const content = await client.content.generate({
  topic: 'Summer Sale',
  audience: 'existing customers',
  tone: 'friendly',
  platform: 'email'
});

// 3. Update campaign with content
await client.campaigns.update(campaign.id, {
  content: content.html_content
});

// 4. Launch campaign
await client.campaigns.update(campaign.id, {
  status: 'active'
});
```

### Lead Scoring Workflow
```javascript
// Get all new leads
const leads = await client.leads.getAll({ status: 'new' });

// Score leads in batch
await client.leads.score();

// Get high-scoring leads
const qualifiedLeads = await client.leads.getAll({ 
  score: { gte: 80 } 
});

// Create nurturing workflow
const workflow = await client.workflows.create({
  name: 'High Score Lead Nurturing',
  trigger: { event: 'lead.scored', condition: 'score >= 80' },
  actions: [
    { type: 'email', template: 'welcome_sequence' },
    { type: 'assign_sales_rep' }
  ]
});
```

## Support

For API support and technical questions:
- Email: api-support@aimarketinghub.com
- Documentation: https://docs.aimarketinghub.com
- Status Page: https://status.aimarketinghub.com
