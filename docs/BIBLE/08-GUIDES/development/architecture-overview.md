
# Architecture Overview

## System Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React hooks + Context API
- **Routing**: React Router Dom

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Edge Functions**: Deno-based serverless functions
- **Storage**: Supabase Storage for file uploads

### External Services
- **AI Services**: OpenAI GPT for content generation
- **Email**: SendGrid/Mailgun for email campaigns
- **Social Media**: Platform APIs (Twitter, Facebook, LinkedIn)
- **Analytics**: Custom tracking + external providers

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard-specific components
│   ├── campaigns/      # Campaign-related components
│   └── ...
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and services
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

## Data Flow

1. **User Interaction** → Component Event Handler
2. **Event Handler** → Custom Hook
3. **Custom Hook** → API Service
4. **API Service** → Supabase/External API
5. **Response** → State Update → UI Re-render

## Key Design Patterns

### Component Composition
- Small, focused components
- Composition over inheritance
- Props interface design
- Reusable component library

### Hook-based State Management
- Custom hooks for business logic
- Separation of concerns
- Reusable stateful logic
- Side effect management

### Service Layer Pattern
- API abstraction layer
- Error handling centralization
- Request/response transformation
- Authentication management

## Security Architecture

### Authentication Flow
1. User login via Supabase Auth
2. JWT token generation
3. Token validation on requests
4. RLS policy enforcement

### Data Protection
- Row Level Security (RLS)
- API key encryption
- Secure secret management
- HTTPS enforcement

## Scalability Considerations

### Performance Optimization
- Code splitting
- Lazy loading
- Memoization
- Virtual scrolling

### Caching Strategy
- Browser caching
- API response caching
- Static asset caching
- Database query optimization

### Monitoring and Observability
- Error tracking
- Performance monitoring
- User analytics
- System health checks
