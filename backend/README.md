
# Marketing_Automation_Backend

A FastAPI backend for the marketing automation platform with AI agents, campaign management, lead tracking, and analytics.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Fill in your environment variables in `.env`

4. Run the development server:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Authentication
All endpoints require a Bearer token in the Authorization header.

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create a new campaign
- `POST /api/campaigns/bulk/create` - Bulk create campaigns
- `GET /api/campaigns/{id}` - Get campaign by ID
- `PUT /api/campaigns/{id}` - Update campaign
- `DELETE /api/campaigns/{id}` - Delete campaign

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/search?q={query}` - Search leads
- `GET /api/leads/analytics/overview` - Get lead analytics
- `POST /api/leads` - Create a new lead

### Content
- `POST /api/content/create` - Create new content
- `GET /api/content/library` - Get content library

### Social Media
- `GET /api/social/posts` - Get social media posts
- `POST /api/social/posts` - Create social media post
- `GET /api/social/analytics` - Get social media analytics
- `POST /api/social/schedule` - Schedule social media post

### Email
- `GET /api/email/campaigns` - Get email campaigns
- `POST /api/email/campaigns` - Create email campaign
- `GET /api/email/analytics` - Get email analytics
- `POST /api/email/send` - Send email

### Analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/system/stats` - Get system statistics
- `GET /api/analytics/performance` - Get performance metrics

### Workflows
- `GET /api/workflow/list` - Get all workflows
- `POST /api/workflow/create` - Create new workflow
- `POST /api/workflow/{id}/execute` - Execute workflow

## Response Format

All endpoints return responses in this format:
```json
{
  "success": boolean,
  "data": any,
  "error": string
}
```

## Testing

Run tests with:
```bash
pytest
```

## Deployment

### Render
1. Connect your repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard

### Manual Deployment
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
