
# Code Structure

## Project Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── dashboard/      # Dashboard-specific components
│   ├── campaigns/      # Campaign management components
│   ├── content/        # Content creation components
│   ├── email/          # Email campaign components
│   ├── social/         # Social media components
│   ├── analytics/      # Analytics and reporting components
│   ├── workflows/      #----flow builder components
│   ├── leads/          # Lead management components
│   ├── settings/       # Settings and configuration components
│   └── knowledge/      # Knowledge management components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and services
│   ├── api/           # API client and service methods
│   ├── services/      # Business logic services
│   └── utils/         # Helper utilities
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

### Backend Structure
```
backend/
├── agents/             # AI agents and services
│   ├── ai/            # AI service implementations
│   ├── content/       # Content generation services
│   ├── email/         # Email automation services
│   ├── leads/         # Lead management services
│   └── social/        # Social media services
├── routes/             # API route handlers
├── database/           # Database connection and utilities
├── social_connectors/  # Social media platform connectors
└── tests/             # Test files
```

## Component Organization

### Component Hierarchy
- **Pages**: Top-level route components
- **Feature Components**: Feature-specific functionality
- **UI Components**: Reusable interface elements
- **Utility Components**: Helper and wrapper components

### Component Naming Conventions
- PascalCase for component names
- Descriptive, action-oriented names
- Consistent naming patterns within features
- Clear distinction between components and utilities

### File Organization
- One component per file
- Co-locate related files (component, styles, tests)
- Use index files for cleaner imports
- Separate types and interfaces

## State Management

### React Hooks Pattern
- Custom hooks for business logic
- useQuery for data fetching
- Context for shared state
- Local state for component-specific data

### Data Flow
- Props down, events up
- Centralized state management where needed
- Separation of concerns
- Predictable state updates

## API Architecture

### Service Layer Pattern
- API clients for external services
- Service classes for business logic
- Error handling and retry logic
- Type safety with TypeScript

### Integration Patterns
- Supabase for backend services
- Edge Functions for serverless logic
- Real-time subscriptions
- File upload handling

## Styling Architecture

### Tailwind CSS Structure
- Utility-first approach
- Component-level styling
- Responsive design patterns
- Dark mode support

### Component Styling
- shadcn/ui component library
- Consistent design tokens
- Reusable style patterns
- Custom CSS for complex layouts

## Type Safety

### TypeScript Usage
- Strict type checking
- Interface definitions
- Generic type usage
- Type guards and assertions

### API Type Safety
- Generated types from Supabase
- Request/response type validation
- Error type definitions
- Integration type safety

## Testing Strategy

### Testing Pyramid
- Unit tests for utilities
- Component tests for UI
- Integration tests for features
- End-to-end tests for workflows

### Testing Tools
- Jest for unit testing
- React Testing Library for components
- Playwright for E2E testing
- Mock Service Worker for API mocking

## Performance Considerations

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports
- Bundle size optimization

### Optimization Patterns
- Memoization for expensive calculations
- Virtual scrolling for large lists
- Image optimization
- Caching strategies

## Security Implementation

### Frontend Security
- Input validation
- XSS prevention
- CSRF protection
- Secure authentication

### API Security
- Authentication middleware
- Authorization checks
- Rate limiting
- Input sanitization

## Documentation Standards

### Code Documentation
- JSDoc comments for functions
- README files for complex features
- Architecture decision records
- API documentation

### Component Documentation
- Props documentation
- Usage examples
- Storybook stories
- Design system documentation
