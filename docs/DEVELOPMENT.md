# Development Guide

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** for version control
- **Supabase CLI** (optional, for local development)

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd pam-marketing-assistant
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── auth/            # Authentication-related components
│   ├── dashboard/       # Dashboard components
│   ├── campaigns/       # Campaign management components
│   ├── leads/           # Lead management components
│   ├── content/         # Content creation components
│   ├── email/           # Email marketing components
│   ├── social/          # Social media components
│   └── analytics/       # Analytics and reporting components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state management
│   └── ThemeContext.tsx # Theme and UI state management
├── hooks/               # Custom React hooks
│   ├── use-auth.ts      # Authentication hook
│   ├── use-campaigns.ts # Campaign management hook
│   └── use-leads.ts     # Lead management hook
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and utilities
├── lib/                 # Utility functions and configurations
│   ├── utils.ts         # General utility functions
│   ├── validations.ts   # Zod validation schemas
│   └── constants.ts     # Application constants
├── pages/               # Page components
│   ├── Landing.tsx      # Landing page
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # Main dashboard
│   └── ...              # Other page components
└── types/               # TypeScript type definitions
    ├── database.ts      # Database schema types
    ├── api.ts           # API response types
    └── components.ts    # Component prop types
```

## Development Workflow

### Code Style and Standards

#### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
interface CampaignData {
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
}

const createCampaign = async (data: CampaignData): Promise<Campaign> => {
  // Implementation
};

// Use type guards for runtime type checking
const isCampaign = (obj: any): obj is Campaign => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};
```

#### Component Patterns

```typescript
// Use function components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick 
}) => {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### Custom Hooks Pattern

```typescript
// Custom hooks for data fetching and state management
const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
};
```

### Styling Guidelines

#### Tailwind CSS Usage

```typescript
// Use semantic tokens from index.css
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
    {children}
  </div>
);

// Use design system utilities
const Button = ({ variant }: { variant: 'primary' | 'secondary' }) => (
  <button className={cn(
    "px-4 py-2 rounded-md font-medium transition-colors",
    variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  )}>
    Click me
  </button>
);
```

#### Responsive Design

```typescript
// Mobile-first responsive design
const ResponsiveGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Grid items */}
  </div>
);

// Responsive typography
const Heading = () => (
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Responsive Heading
  </h1>
);
```

### State Management

#### Context API Usage

```typescript
// Auth Context Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Form State Management

```typescript
// React Hook Form with Zod validation
const CampaignForm = () => {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'email'
    }
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      await createCampaign(data);
      toast.success('Campaign created successfully');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

## Database Development

### Local Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local development
supabase init

# Start local development stack
supabase start

# Link to remote project
supabase link --project-ref your-project-ref
```

### Migration Workflow

```bash
# Create new migration
supabase migration new add_campaigns_table

# Apply migrations locally
supabase db reset

# Apply migrations to remote
supabase db push
```

### Database Schema Changes

```sql
-- Example migration file
-- migrations/20240101000000_add_campaigns_table.sql

CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type campaign_type NOT NULL,
  status campaign_status DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create campaigns" 
ON public.campaigns FOR INSERT 
WITH CHECK (auth.uid() = created_by);
```

## Testing Strategy

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

### Integration Testing

```typescript
// Example hook test
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaigns } from '@/hooks/use-campaigns';

describe('useCampaigns', () => {
  beforeEach(() => {
    // Mock Supabase client
  });

  it('fetches campaigns on mount', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.campaigns).toBeDefined();
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load page components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Campaigns = lazy(() => import('@/pages/Campaigns'));

// Use Suspense for loading states
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/campaigns" element={<Campaigns />} />
  </Routes>
</Suspense>
```

### Memoization

```typescript
// Memoize expensive calculations
const ExpensiveComponent = ({ data }: { data: ComplexData[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);

  return <div>{/* Render processed data */}</div>;
};

// Memoize callbacks to prevent unnecessary re-renders
const ParentComponent = () => {
  const handleClick = useCallback((id: string) => {
    // Handle click logic
  }, []);

  return <ChildComponent onClick={handleClick} />;
};
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

## Debugging

### Development Tools

```typescript
// React Developer Tools
// Install browser extension for React debugging

// Debug Supabase queries
const { data, error } = await supabase
  .from('campaigns')
  .select('*')
  .eq('status', 'active');

console.log('Query result:', { data, error });
```

### Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Code Quality

### Linting Configuration

```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## API Development

### Supabase Edge Functions

```typescript
// supabase/functions/chat-ai/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { message, context } = await req.json();
    
    // Process AI request
    const response = await processAIRequest(message, context);
    
    return new Response(
      JSON.stringify({ response }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Local Function Testing

```bash
# Serve functions locally
supabase functions serve

# Test function
curl -X POST 'http://localhost:54321/functions/v1/chat-ai' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello", "context": {}}'
```

## Contributing Guidelines

### Branch Strategy

```bash
# Feature branches
git checkout -b feature/campaign-management
git checkout -b fix/auth-redirect-issue
git checkout -b docs/api-documentation

# Commit message format
git commit -m "feat: add campaign creation form"
git commit -m "fix: resolve authentication redirect loop"
git commit -m "docs: update API documentation"
```

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checking
4. Create pull request with description
5. Request code review
6. Address review feedback
7. Merge after approval

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] TypeScript types are properly defined
- [ ] Performance implications considered
- [ ] Security best practices followed
- [ ] Documentation updated if needed

## Troubleshooting

### Common Issues

1. **Node Version Mismatch**
   ```bash
   # Use Node Version Manager
   nvm use 18
   ```

2. **Module Resolution Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Supabase Connection Issues**
   ```bash
   # Check environment variables
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

4. **Build Failures**
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Check linting errors
   npm run lint
   ```

For more troubleshooting help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).