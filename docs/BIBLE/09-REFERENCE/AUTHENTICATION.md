# Authentication & Authorization Documentation

## Overview

PAM uses Supabase Auth as its primary authentication system, providing secure user management with JWT tokens, row-level security, and OAuth integrations. The system supports multiple authentication methods and implements enterprise-grade security practices.

## Authentication Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   OAuth         │
│   (React App)   │◄──►│   Auth          │◄──►│   Providers     │
│                 │    │                 │    │                 │
│ • Auth Context  │    │ • JWT Tokens    │    │ • Google        │
│ • Protected     │    │ • User Sessions │    │ • LinkedIn      │
│   Routes        │    │ • RLS Policies  │    │ • Microsoft     │
│ • Token Refresh │    │ • Rate Limiting │    │   (planned)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Authentication Methods

### Email/Password Authentication

**Sign Up Process**:
```typescript
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
```

**Sign In Process**:
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
```

**Password Reset**:
```typescript
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });

  if (error) {
    throw new Error(error.message);
  }
};
```

### OAuth Authentication

**Google OAuth**:
```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
```

**LinkedIn OAuth**:
```typescript
const signInWithLinkedIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'openid profile email'
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
```

## Auth Context Implementation

### AuthContext Provider

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### useAuth Hook

```typescript
// src/hooks/use-auth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

## Route Protection

### Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Save attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### Route Configuration

```typescript
// src/App.tsx
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/campaigns" element={
            <ProtectedRoute>
              <CampaignsPage />
            </ProtectedRoute>
          } />
          
          {/* More protected routes... */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## User Profile Management

### Profile Schema

```sql
-- profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### Profile Management Hook

```typescript
// src/hooks/use-profile.ts
export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
```

## Row Level Security (RLS)

### RLS Policy Examples

**Campaigns Table**:
```sql
-- Users can only access their own campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create campaigns" 
ON public.campaigns FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns FOR DELETE 
USING (auth.uid() = created_by);
```

**Leads Table**:
```sql
-- More complex policy with role-based access
CREATE POLICY "Team members can view leads" 
ON public.leads FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'sales')
  )
);
```

## Session Management

### Automatic Token Refresh

```typescript
// Supabase client configuration with auto-refresh
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
```

### Session Validation

```typescript
// Validate session on app initialization
const validateSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session validation error:', error);
    await supabase.auth.signOut();
    return null;
  }
  
  return session;
};
```

## Security Features

### Rate Limiting

Supabase automatically implements rate limiting:
- Anonymous requests: 100 requests per hour
- Authenticated requests: 1000 requests per hour
- Auth endpoint: 60 requests per hour per IP

### Password Requirements

```typescript
// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
```

### Audit Logging

```sql
-- Security audit table
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

```typescript
// Log security events
const logSecurityEvent = async (action: string, details?: any) => {
  const { error } = await supabase
    .from('security_logs')
    .insert({
      user_id: user?.id,
      action,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      details
    });

  if (error) {
    console.error('Failed to log security event:', error);
  }
};
```

## Error Handling

### Auth Error Types

```typescript
interface AuthError {
  message: string;
  status?: number;
}

const handleAuthError = (error: AuthError) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link.';
    case 'User already registered':
      return 'An account with this email already exists. Try signing in instead.';
    case 'Signup not allowed for this instance':
      return 'Registration is currently disabled. Please contact support.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

### Error Boundary for Auth

```typescript
// Auth-specific error boundary
class AuthErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log auth errors to monitoring service
    console.error('Auth error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Multi-Factor Authentication (Planned)

### MFA Setup Flow

```typescript
// Enable MFA for user account
const enableMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'PAM Mobile App'
  });

  if (error) throw error;
  
  // Show QR code for user to scan
  return data.totp;
};

// Verify MFA setup
const verifyMFA = async (code: string, factorId: string) => {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: 'challenge-id',
    code
  });

  if (error) throw error;
  return data;
};
```

## OAuth Integration Management

### Platform Connection

```sql
-- OAuth connections table
CREATE TABLE public.oauth_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform_name TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT NOT NULL DEFAULT 'connected',
  connection_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Token Encryption

```typescript
// Encrypt sensitive tokens before storage
const encryptToken = async (token: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('encrypt-data', {
    body: { data: token }
  });

  if (error) throw error;
  return data.encrypted;
};

const decryptToken = async (encryptedToken: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('decrypt-data', {
    body: { encrypted: encryptedToken }
  });

  if (error) throw error;
  return data.decrypted;
};
```

## Best Practices

### Security Best Practices

1. **Always use HTTPS** in production
2. **Validate user input** on both client and server
3. **Implement proper session timeout** for sensitive operations
4. **Use secure headers** (CSP, HSTS, etc.)
5. **Regular security audits** and penetration testing
6. **Monitor failed login attempts** and implement account lockout
7. **Use strong password policies** and encourage 2FA

### Development Best Practices

1. **Never store sensitive data** in localStorage
2. **Implement proper error handling** for auth flows
3. **Use TypeScript** for better type safety
4. **Test auth flows thoroughly** including edge cases
5. **Keep dependencies updated** for security patches
6. **Use environment variables** for configuration
7. **Implement proper logging** for debugging and monitoring

### Performance Best Practices

1. **Minimize auth state changes** to prevent unnecessary re-renders
2. **Use proper memoization** for expensive auth operations
3. **Implement efficient token refresh** strategies
4. **Cache user profile data** appropriately
5. **Optimize database queries** with proper indexing
6. **Use connection pooling** for database efficiency