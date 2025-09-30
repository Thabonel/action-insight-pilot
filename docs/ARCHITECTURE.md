# Architecture Documentation

## System Overview

AI Marketing Hub is a comprehensive, cloud-native marketing automation platform combining React frontend, FastAPI backend, and Supabase infrastructure. The system follows a multi-tier architecture with AI-powered agents handling specialized marketing tasks.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                             │
│              React 18 + TypeScript + Vite                        │
└──────────────────────┬───────────────────────────────────────────┘
                       │ REST API (HTTPS)
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                    API Gateway Layer                              │
│                  FastAPI (Python 3.8+)                           │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │   Routes      │  │  AI Agents     │  │   Workflows      │   │
│  │   (REST API)  │  │  (Specialized) │  │   (Automation)   │   │
│  └───────────────┘  └────────────────┘  └──────────────────┘   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                     Data & Auth Layer                             │
│                   Supabase Cloud Platform                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ PostgreSQL   │  │  Auth + JWT  │  │  Real-time + Storage│   │
│  │   + RLS      │  │   + OAuth    │  │                     │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                   External Services Layer                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ OpenAI   │  │  Social   │  │  Email   │  │  Analytics   │   │
│  │   API    │  │Media APIs │  │ Services │  │  Services    │   │
│  └──────────┘  └───────────┘  └──────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── campaigns/       # Campaign management
│   ├── leads/          # Lead management
│   ├── content/        # Content creation
│   ├── email/          # Email marketing
│   ├── social/         # Social media management
│   └── analytics/      # Analytics and reporting
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/               # Utility functions
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

### State Management

- **React Context API** for global state (auth, theme)
- **React Hook Form** for form state management
- **Local component state** for UI-specific state
- **Supabase Real-time** for synchronized data state

### Routing

```typescript
// Route structure
/                    # Landing page
/auth               # Authentication (login/signup)
/dashboard          # Main dashboard
/campaigns          # Campaign management
/leads              # Lead management
/content            # Content creation tools
/email              # Email marketing
/social             # Social media management
/analytics          # Analytics and reporting
/settings           # User and platform settings
```

## Backend Architecture

### FastAPI Application Layer

The backend is built with FastAPI (Python 3.8+), providing:

**Core Structure:**
```
backend/
├── main.py              # FastAPI app initialization & router loading
├── routes/              # API endpoint handlers
├── agents/              # AI-powered agent system
├── workflows/           # Automation workflows
├── database/            # Supabase client & utilities
├── social_connectors/   # Social media platform integrations
├── models.py           # Pydantic data models
├── config.py           # Configuration management
└── auth.py             # Authentication utilities
```

**Key Features:**
- **Async Support** - High-performance async/await patterns
- **Auto Documentation** - OpenAPI/Swagger docs at `/docs`
- **Type Safety** - Pydantic models for request/response validation
- **CORS Middleware** - Configured for frontend origins
- **Health Checks** - `/health` and `/api/system-health` endpoints

### AI Agent System

The platform employs a sophisticated **multi-agent architecture** with specialized agents:

**Agent Types:**
```
backend/agents/
├── base_agent.py                    # Base agent class
├── campaign_agent.py                # Campaign strategy & planning
├── content_agent.py                 # Content generation
├── email_automation_agent.py        # Email campaigns
├── social_media_agent.py            # Social media management
├── enhanced_social_media_agent.py   # Advanced social features
├── analytics_agent.py               # Performance analytics
├── lead_generation_agent.py         # Lead management
├── internal_publishing_agent.py     # Content publishing
├── proposal_generator.py            # Proposal generation
├── mcp_agent.py                     # MCP protocol agent
├── ai/                              # AI service modules
├── content/                         # Content services
├── email/                           # Email services
├── leads/                           # Lead services
├── seo/                             # SEO services
└── social/                          # Social media services
```

**Agent Architecture:**
- Inherits from `BaseAgentCore`
- Managed by `AgentRegistry`
- Status tracking with `AgentStatus` and `TaskStatus` enums
- Centralized logging via `AgentLogger`
- Utility functions in `AgentUtils`

### Supabase Infrastructure

- **PostgreSQL Database** - Primary data store with JSONB support
- **Row Level Security (RLS)** - Database-level authorization
- **Real-time Subscriptions** - Live data synchronization
- **Authentication** - JWT-based auth with multiple providers
- **Storage** - File and media asset storage

### Database Design

The database follows a normalized design with strategic denormalization for performance:

- **User Management** - profiles, companies, user_roles
- **Campaign System** - campaigns, campaign_metrics, campaign_performance_metrics
- **Lead Management** - leads, lead_activities, customer_journeys
- **Content System** - content_calendar, content_templates, digital_assets
- **Email Marketing** - email_campaigns, email_templates, email_contacts
- **Knowledge Base** - knowledge_buckets, knowledge_documents, knowledge_chunks
- **Analytics** - performance_analytics, real_time_metrics
- **Integrations** - oauth_connections, integration_connections

### API Architecture

**FastAPI Routes:**
```python
# Main route modules
routes/
├── system_health.py     # Health check endpoints
├── unified_agents.py    # Unified agent API
├── email.py            # Email campaign endpoints
├── workflows.py        # Workflow automation
├── brand.py            # Brand management
├── keyword_research.py # SEO keyword research
└── research.py         # Research tools
```

**Frontend Client:**
```typescript
// Supabase Client Configuration
const supabase = createClient(url, key, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens** - Secure, stateless authentication
- **Row Level Security** - Database-level access control
- **OAuth Integration** - Social platform authentication
- **Session Management** - Automatic token refresh

### Data Security

- **Encryption at Rest** - All data encrypted in PostgreSQL
- **Encryption in Transit** - HTTPS/TLS for all communications
- **Secrets Management** - Supabase secrets for API keys
- **Audit Logging** - Comprehensive security and access logs

## Performance Architecture

### Frontend Optimization

- **Code Splitting** - Lazy loading with React.lazy()
- **Bundle Optimization** - Vite's optimized bundling
- **Asset Optimization** - Image compression and CDN delivery
- **Caching Strategy** - Browser caching and service worker ready

### Backend Optimization

- **Database Indexing** - Strategic indexes on frequently queried columns
- **Connection Pooling** - Supabase's built-in connection management
- **Real-time Optimization** - Selective subscriptions to minimize overhead
- **Vector Operations** - Optimized similarity search for AI features

## Scalability Considerations

### Horizontal Scaling

- **Serverless Architecture** - Auto-scaling edge functions
- **CDN Distribution** - Global content delivery
- **Database Scaling** - Supabase's managed scaling

### Vertical Scaling

- **Resource Optimization** - Efficient queries and data structures
- **Caching Layers** - Multiple levels of caching
- **Asynchronous Processing** - Background job processing

## Development Architecture

### Build System

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Code Quality

- **TypeScript** - Type safety and developer experience
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting (configured in ESLint)
- **Git Hooks** - Pre-commit validation

### Testing Strategy

- **Unit Tests** - Component and utility function testing
- **Integration Tests** - API and database integration testing
- **E2E Tests** - Critical user flow testing
- **Type Checking** - Compile-time error prevention

## Deployment Architecture

### Production Environment

**Frontend:**
- **Vercel/Netlify** - Static site hosting and CDN
- **Vite Build** - Optimized production bundles
- **Environment Variables** - Configured via hosting platform

**Backend:**
- **Render/Railway** - Python/FastAPI hosting
- **Auto-scaling** - Dynamic resource allocation
- **Health Monitoring** - Continuous uptime checks

**Database & Services:**
- **Supabase Cloud** - Managed PostgreSQL + Auth + Storage
- **Custom Domains** - Professional domain configuration
- **SSL/TLS** - End-to-end encryption

### CI/CD Pipeline

```yaml
# Frontend workflow
build → type-check → lint → deploy to CDN

# Backend workflow
install deps → run tests → deploy to Render/Railway
```

### Environment Configuration

**Frontend (.env):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend.onrender.com
```

**Backend (Supabase Secrets/Environment):**
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SECRET_MASTER_KEY=your_encryption_key
ENVIRONMENT=production
```

## Monitoring & Observability

### Application Monitoring

- **Error Tracking** - Client-side error monitoring
- **Performance Monitoring** - Core Web Vitals tracking
- **User Analytics** - Usage patterns and feature adoption

### Infrastructure Monitoring

- **Database Metrics** - Query performance and usage
- **API Monitoring** - Response times and error rates
- **Resource Usage** - Memory and CPU utilization

## Future Architecture Considerations

### Planned Enhancements

- **Microservices Migration** - Gradual extraction of services
- **Event-Driven Architecture** - Improved system decoupling
- **Advanced Caching** - Redis integration for enhanced performance
- **Multi-tenant Architecture** - Enterprise scalability