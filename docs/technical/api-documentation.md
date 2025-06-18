
# API Documentation

## Base URL
- Production: `https://wheels-wins-orchestrator.onrender.com`
- Local Development: `http://localhost:3000`

## Authentication
All API requests require authentication via Bearer token:
```
Authorization: Bearer <supabase_jwt_token>
```

## Campaigns API

### Get Campaigns
```http
GET /api/campaigns
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Campaign Name",
      "type": "email",
      "status": "active",
      "description": "Campaign description",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Campaign
```http
POST /api/campaigns
```

**Request Body:**
```json
{
  "name": "New Campaign",
  "type": "email",
  "status": "draft",
  "description": "Campaign description"
}
```

### Update Campaign
```http
PUT /api/campaigns/:id
```

### Delete Campaign
```http
DELETE /api/campaigns/:id
```

## Leads API

### Get Leads
```http
GET /api/leads
```

### Create Lead
```http
POST /api/leads
```

### Update Lead Score
```http
PUT /api/leads/:id/score
```

## Content API

### Generate Content
```http
POST /api/content/generate
```

**Request Body:**
```json
{
  "type": "blog_post",
  "topic": "Content topic",
  "keywords": ["keyword1", "keyword2"],
  "tone": "professional"
}
```

### Optimize Content
```http
POST /api/content/optimize
```

## Social Media API

### Get Platform Connections
```http
GET /api/social/connections
```

### Post to Platform
```http
POST /api/social/post
```

**Request Body:**
```json
{
  "platform": "twitter",
  "content": "Post content",
  "scheduled_at": "2024-01-01T12:00:00Z",
  "media": ["image_url"]
}
```

## Email API

### Send Email Campaign
```http
POST /api/email/campaign
```

### Get Email Metrics
```http
GET /api/email/metrics/:campaign_id
```

## Analytics API

### Get Campaign Analytics
```http
GET /api/analytics/campaigns/:id
```

### Get Performance Insights
```http
GET /api/analytics/insights
```

## AI Agents API

### Daily Focus Agent
```http
POST /api/agents/daily-focus
```

**Request Body:**
```json
{
  "query": "What should I focus on today?",
  "campaigns": [],
  "context": [],
  "date": "2024-01-01"
}
```

### General Campaign Agent
```http
POST /api/agents/campaign
```

**Request Body:**
```json
{
  "task_type": "general_query",
  "input_data": {
    "query": "How to improve campaign performance?",
    "campaigns": [],
    "context": []
  }
}
```

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Higher limits for premium users

## Webhooks
Available webhook events:
- `campaign.created`
- `campaign.updated`
- `lead.created`
- `email.sent`
- `social.posted`

### Webhook Payload
```json
{
  "event": "campaign.created",
  "data": {
    "id": "uuid",
    "name": "Campaign Name"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## SDK Examples

### JavaScript
```javascript
import { apiClient } from '@/lib/api-client';

// Get campaigns
const campaigns = await apiClient.getCampaigns();

// Create campaign
const newCampaign = await apiClient.createCampaign({
  name: 'New Campaign',
  type: 'email'
});
```

### cURL
```bash
curl -X GET \
  https://wheels-wins-orchestrator.onrender.com/api/campaigns \
  -H 'Authorization: Bearer YOUR_TOKEN'
```
