# Architecture Documentation

## System Overview

PAM is a modern, cloud-native marketing automation platform built with a serverless architecture. The system follows a three-tier architecture pattern with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React SPA)   │◄──►│   (Supabase)    │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • PostgreSQL    │    │ • OpenAI API    │
│ • TypeScript    │    │ • Edge Functions │    │ • Resend        │
│ • Tailwind CSS  │    │ • Real-time     │    │ • OAuth         │
│ • Vite          │    │ • Auth          │    │   Providers     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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

### Supabase Infrastructure

- **PostgreSQL Database** - Primary data store with JSONB support
- **Row Level Security (RLS)** - Database-level authorization
- **Edge Functions** - Serverless functions for business logic
- **Real-time Subscriptions** - Live data synchronization
- **Authentication** - JWT-based auth with multiple providers

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

### Edge Functions

Located in `supabase/functions/`, these serverless functions handle:
- AI content generation
- Email sending
- Third-party API integrations
- Complex business logic
- Scheduled tasks

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

- **Vercel/Netlify** - Frontend hosting and CDN
- **Supabase Cloud** - Backend infrastructure
- **Custom Domains** - Professional domain configuration
- **SSL/TLS** - End-to-end encryption

### CI/CD Pipeline

```yaml
# Example workflow
build → test → type-check → deploy
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