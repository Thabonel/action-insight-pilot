
# API Documentation

## Overview

The AI Marketing Hub API provides programmatic access to all platform features including campaign management, lead tracking, content generation, and analytics.

## Authentication

All API requests require authentication using Supabase Auth tokens. The token should be included in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Base URL

```
https://your-project.supabase.co/functions/v1
```

## Endpoints

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
