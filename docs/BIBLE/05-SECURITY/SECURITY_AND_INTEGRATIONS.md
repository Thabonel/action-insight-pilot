# Security and Third-Party Integrations Documentation

**Last Updated**: October 28, 2025  
**Status**: Production-Ready  
**Scope**: Complete Authentication, Authorization, API Key Management, and Integration Details

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Key Management](#api-key-management)
3. [Security Measures](#security-measures)
4. [Third-Party Integrations](#third-party-integrations)
5. [Environment Variables](#environment-variables)
6. [Error Handling & Security Best Practices](#error-handling--security-best-practices)

---

## Authentication & Authorization

### Supabase Auth (Primary Auth System)

**Location**: Frontend: `src/contexts/AuthContext.tsx` | Backend: `backend/auth.py`

#### Frontend Authentication Flow

```typescript
// Location: src/contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
```

**Features**:
- Email/password authentication
- Password strength validation before signup
- Session state management
- Auth state change listener
- Automatic session recovery on app load

**Sign Up Flow**:
1. Password strength validation using `validatePasswordStrength()`
2. Email validation
3. Email redirect to configure redirect URL
4. User must verify email before full access

**Sign In Flow**:
1. Email and password verification
2. Returns error if credentials invalid
3. Session automatically established

**Sign Out Flow**:
1. Session cleared via Supabase
2. User redirected to home page
3. Local auth state cleared

#### Backend JWT Verification

**Location**: `backend/auth.py`

```python
def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token from Supabase and extract user data"""
    # Removes 'Bearer ' prefix
    # Decodes using HS256 algorithm
    # Validates required 'sub' field (user ID)
    
def get_current_user(token: str) -> Dict[str, Any]:
    """Extract user information from JWT payload"""
    # Returns: id, email, role, app_metadata, user_metadata, exp, iat

def extract_user_id(token: str) -> str:
    """Extract user ID from JWT token"""

def is_admin_user(token: str) -> bool:
    """Check admin privileges from token"""
    # Checks multiple locations: role, app_metadata, app_metadata.roles[]
```

**JWT Secret Handling**:
- Looks for `SUPABASE_JWT_SECRET` environment variable (primary)
- Falls back to `JWT_SECRET` for backwards compatibility
- Cached with `@lru_cache(maxsize=1)` for performance
- Required for production deployments

**Token Claims Structure**:
```python
{
    "sub": "user-uuid",           # User ID
    "email": "user@example.com",
    "role": "authenticated",       # or "admin"
    "app_metadata": {
        "role": "admin"            # Custom role storage
    },
    "user_metadata": {
        "role": "admin"
    },
    "aud": "authenticated",
    "exp": 1234567890,             # Expiration timestamp
    "iat": 1234567800              # Issued at
}
```

### User Roles & Permissions

**Admin Role Detection**:
```python
# Checks in priority order:
1. payload.get("role") == "admin"
2. payload.get("app_metadata", {}).get("role") == "admin"
3. payload.get("user_metadata", {}).get("role") == "admin"
4. "admin" in payload.get("app_metadata", {}).get("roles", [])
```

**FastAPI Dependency**:
```python
def get_current_user_dependency(authorization: str = None) -> Dict[str, Any]:
    """FastAPI dependency to get current user from Authorization header"""
    # Raises ValueError if Authorization header missing
    # Returns user data extracted from JWT
```

### Row Level Security (RLS) Policies

**All tables with RLS enabled**:

#### user_secrets Table
```sql
-- Users can view their own secrets metadata
CREATE POLICY "Users can view their own secrets metadata" 
ON public.user_secrets 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own secrets
CREATE POLICY "Users can create their own secrets" 
ON public.user_secrets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own secrets
CREATE POLICY "Users can update their own secrets" 
ON public.user_secrets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own secrets
CREATE POLICY "Users can delete their own secrets" 
ON public.user_secrets 
FOR DELETE 
USING (auth.uid() = user_id);
```

**Unique Constraint**: `UNIQUE(user_id, service_name)` - One secret per service per user

#### secret_audit_logs Table
```sql
-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.secret_audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);
```

**Audit Log Fields**:
- `user_id`: UUID
- `service_name`: TEXT
- `operation`: TEXT ('create'|'read'|'update'|'delete')
- `ip_address`: INET
- `user_agent`: TEXT
- `success`: BOOLEAN
- `error_message`: TEXT
- `created_at`: TIMESTAMP

#### support_tickets Table
```sql
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT 
TO authenticated USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = user_id);

-- Anonymous users can create tickets (for homepage)
CREATE POLICY "Anonymous users can create tickets" ON support_tickets FOR INSERT 
TO anon WITH CHECK (true);
```

### Session Management

**Frontend Session Context** (`src/contexts/SecurityContext.tsx`):

```typescript
interface SecurityContextType {
  tokenManager: TokenSecurityManager;
  securitySettings: {
    autoRefresh: boolean;        // Default: true
    encryptStorage: boolean;     // Default: true
    sessionTimeout: number;      // Default: 3600000ms (1 hour)
  };
}
```

**Token Management Functions**:
- `encryptToken()`: Tokens handled securely by Supabase client (no additional encryption)
- `decryptToken()`: Returns token as-is, relies on Supabase security
- `refreshTokens()`: Calls `supabase.auth.refreshSession()`
- `validateTokens()`: Checks session exists and not expired
- `revokeTokens()`: Signs out, clears OAuth tokens

**Auto-Refresh Logic**:
- Validates tokens every 5 minutes
- Refreshes if token is invalid
- Automatic session timeout after 1 hour of inactivity

### OAuth Providers

**Supported Providers** (via Supabase Auth):
- Google
- Facebook
- Twitter
- LinkedIn (OIDC)
- GitHub

**OAuth Implementation** (`src/hooks/useSecureOAuth.ts`):

```typescript
interface OAuthProvider {
  provider: 'google' | 'facebook' | 'twitter' | 'linkedin_oidc' | 'github';
  scopes?: string[];
  options?: Record<string, any>;
}

// Security features:
// 1. PKCE (Proof Key for Public Clients)
// 2. State parameter for CSRF protection
// 3. Secure random state generation: new Uint8Array(32)
```

**OAuth Flow**:
1. Generate secure state: 32 bytes random data base64 encoded
2. Include code_challenge_method: 'S256' (PKCE)
3. User redirected to provider
4. Provider redirects back with authorization code
5. Backend exchanges code for token
6. Session established

**Token Refresh**:
- Automatic every 5 minutes
- Manual refresh available via `refreshConnection(platform)`
- Token validation checks expiry

**Token Revocation**:
- Platform-specific OAuth tokens cleared
- Supabase session terminated
- Stored OAuth tokens removed from localStorage

---

## API Key Management

### User Secrets Storage System

**Location**: `backend/database/user_secrets_client.py` | `supabase/functions/manage-user-secrets/index.ts`

#### Database Schema

**user_secrets Table**:
```sql
CREATE TABLE public.user_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  initialization_vector TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, service_name)
);
```

**Supported Service Names**:
```
gemini_api_key_encrypted
openai_api_key_encrypted
anthropic_api_key_encrypted
mistral_api_key_encrypted
buffer_oauth_token
hootsuite_oauth_token
later_oauth_token
sprout_social_oauth_token
facebook_oauth_token
instagram_oauth_token
twitter_oauth_token
linkedin_oauth_token
youtube_oauth_token
tiktok_oauth_token
```

#### Encryption Method

**Algorithm**: AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)

**Key Derivation**:
- Master Key: 64 hex characters (32 bytes)
- Environment Variable: `SECRET_MASTER_KEY`
- Format: Hex string, must be exactly 64 characters

**Encryption Process** (Deno Edge Function):
```typescript
async function encryptSecret(plaintext: string): Promise<{ encryptedValue: string; iv: string }> {
  const key = await generateKey()  // Import 32-byte key
  const iv = crypto.getRandomValues(new Uint8Array(12))  // 12-byte IV
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  )
  
  return {
    encryptedValue: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  }
}
```

**Decryption Process**:
```typescript
async function decryptSecret(encryptedValue: string, iv: string): Promise<string> {
  const key = await generateKey()
  const encryptedData = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0))
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivData },
    key,
    encryptedData
  )
  
  return new TextDecoder().decode(decrypted)
}
```

### SecretsService (Frontend)

**Location**: `src/lib/services/secrets-service.ts`

```typescript
class SecretsService {
  // Calls Supabase Edge Function with Bearer token
  
  static async saveSecret(serviceName: string, value: string): Promise<void>
  static async listSecrets(): Promise<SecretMetadata[]>
  static async deleteSecret(serviceName: string): Promise<void>
  static async getSecret(serviceName: string): Promise<string>
  static async hasSecret(serviceName: string): Promise<boolean>
}

interface SecretMetadata {
  service_name: string;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
}
```

**Edge Function URL**: `https://kciuuxoqxfsogjuqflou.supabase.co/functions/v1/manage-user-secrets`

**Request Format**:
```typescript
// Save
POST ?action=save
{
  "serviceName": "gemini_api_key_encrypted",
  "value": "actual-api-key-value"
}

// List
GET ?action=list

// Get
GET ?action=get&serviceName=gemini_api_key_encrypted

// Delete
POST ?action=delete
{
  "serviceName": "gemini_api_key_encrypted"
}
```

### manage-user-secrets Edge Function

**Location**: `supabase/functions/manage-user-secrets/index.ts`

**Authentication**: Validates Bearer token via Supabase Auth

**Operations**:

1. **Save (Upsert)**
   - Encrypts plaintext value with AES-GCM
   - Generates random 12-byte IV
   - Stores encrypted_value and iv
   - Updates last_used_at timestamp
   - Logs audit entry

2. **List**
   - Returns metadata only (no decrypted values)
   - Includes timestamps and active status
   - Filters to active secrets only

3. **Get**
   - Retrieves encrypted_value and iv
   - Decrypts using master key
   - Updates last_used_at timestamp
   - Logs read operation
   - Returns plaintext value

4. **Delete**
   - Soft delete: sets is_active = false
   - Preserves audit trail
   - Logs deletion operation

**Security Features**:
- IP address logging (x-forwarded-for header)
- User agent logging
- Success/failure tracking
- Error message sanitization (no internal details to client)
- All operations audit logged

**Error Handling**:
```typescript
// Master key validation
if (!masterKeyString || masterKeyString.length !== 64) {
  throw new Error('Master key must be 64 hex characters (32 bytes)')
}

// Generic error messages to client
if (error.message?.includes('Master key')) {
  userMessage = 'Configuration error'
} else if (error.message?.includes('not found')) {
  userMessage = 'Secret not found'
}
```

### Backend User Secrets Retrieval

**Location**: `backend/database/user_secrets_client.py`

```python
async def get_user_secret(user_id: str, service_name: str) -> Optional[str]:
    """Retrieve and decrypt a user's secret"""
    # Query user_secrets table
    # Decrypt using SECRET_MASTER_KEY
    # Update last_used_at timestamp
    # Return plaintext value
    
async def has_user_secret(user_id: str, service_name: str) -> bool:
    """Check if user has a specific secret configured"""
```

**Decryption in Python**:
```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Split ciphertext and tag
ciphertext = encrypted_data[:-16]
tag = encrypted_data[-16:]

# Decrypt
decryptor.authenticate_additional_data(b"")
plaintext = decryptor.finalize_with_tag(tag)
```

---

## Security Measures

### CORS Configuration

**Backend CORS** (`backend/main.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aiboostcampaign.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://wheels-wins-orchestrator.onrender.com",
        "https://lovable.dev",
        "https://app.lovable.dev",
        "*",  # Allow all during deployment debugging
    ],
    allow_headers=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
)
```

**Supabase Edge Functions CORS** (`supabase/functions/_shared/cors.ts`):
```typescript
const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;

export const corsHeaders = {
  'Access-Control-Allow-Origin': isProduction ? 
    'https://wheels-wins-orchestrator.onrender.com,https://lovable.dev,https://app.lovable.dev' : 
    '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
```

**Security Issues**:
- Production: Allow-Origin restricted to specific domains
- Development: Allow-Origin wildcard acceptable for testing
- All methods allowed (POST, GET, PUT, DELETE, OPTIONS, HEAD, PATCH)
- Credentials allowed for authentication

### Input Validation

**Password Strength Validation** (`src/contexts/AuthContext.tsx`):
```typescript
const { validatePasswordStrength } = await import('@/lib/validation/input-sanitizer');
const validation = validatePasswordStrength(password);

// Returns:
// {
//   isValid: boolean,
//   errors: string[]
// }
```

**OAuth State Validation** (`src/components/socialConnectors/OAuthHandler.tsx`):
```typescript
// State is base64-encoded JSON
const oauthState: OAuthState = JSON.parse(atob(state));

// Validate state matches platform
if (oauthState.platform !== platform) {
  throw new Error('Invalid OAuth state');
}
```

**Video Request Validation** (`backend/routes/ai_video.py`):
```python
class VideoPlanRequest(BaseModel):
    goal: str
    platform: str = Field(pattern="^(YouTubeShort|TikTok|Reels|Landscape)$")
    duration_s: int = Field(ge=8, le=120)
    language: str = "en"
    brand_kit: BrandKit = Field(default_factory=BrandKit)
```

**Pydantic Models**: Automatic validation of:
- Type checking
- String patterns (regex)
- Numeric ranges (ge=minimum, le=maximum)
- Required vs optional fields

### SQL Injection Prevention

**All database operations use parameterized queries**:
```python
# Via Supabase client (safe)
result = supabase.table('user_secrets')\
    .select('encrypted_value, initialization_vector')\
    .eq('user_id', user_id)\
    .eq('service_name', service_name)\
    .execute()

# No string concatenation in queries
```

### XSS Protection

**React Automatic Escaping**: JSX automatically escapes all values
```typescript
// Safe - user input automatically escaped
const [userInput] = useState<string>();
return <div>{userInput}</div>;  // XSS-proof
```

**Content Security in Edge Functions**:
```typescript
// Sanitize error messages before returning to client
let userMessage = 'An error occurred';  // Generic message
// Server logs full error with error.message
```

### CSRF Protection

**OAuth State Parameter** (PKCE flow):
```typescript
function generateSecureState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// State validated on callback:
const oauthState: OAuthState = JSON.parse(atob(state));
if (oauthState.platform !== platform) {
  throw new Error('Invalid OAuth state');
}
```

**PKCE Code Challenge Method**:
```typescript
const oauthOptions = {
  queryParams: {
    code_challenge_method: 'S256',
    state: generateSecureState(),
  }
};
```

### Rate Limiting

**Backend**: Not explicitly implemented (should be added at nginx/reverse proxy level)

**Edge Functions**: Supabase provides built-in rate limiting per function

**Per-Provider Rate Limits** (in code comments):
```python
LLMProvider.OPENAI: {
  "rate_limit": 60  # requests per minute
},
LLMProvider.ANTHROPIC: {
  "rate_limit": 50
},
LLMProvider.MISTRAL: {
  "rate_limit": 100
},
LLMProvider.GOOGLE: {
  "rate_limit": 60
}
```

---

## Third-Party Integrations

### AI Models & LLM Services

#### OpenAI (Primary)

**Location**: `backend/agents/ai/base_ai_service.py`, `backend/agents/social/multi_model_service.py`

**Models (2025)**:
- `gpt-5` - Best model for coding and agentic tasks (August 2025)
- `gpt-5-mini` - Fast, cost-effective (default)
- `gpt-4.1` - Improved coding and instruction following
- `gpt-4.1-mini` - Smaller, faster variant

**API Configuration**:
```python
{
  "api_url": "https://api.openai.com/v1/chat/completions",
  "default_model": "gpt-5-mini",
  "max_tokens": 4000,
  "temperature": 0.7,
  "supports_vision": True,
  "rate_limit": 60  # requests per minute
}
```

**Authentication**:
- Header: `Authorization: Bearer {OPENAI_API_KEY}`
- Key stored in: `user_secrets` table (encrypted)
- OR environment variable: `OPENAI_API_KEY`

**Request Format**:
```python
{
  "model": "gpt-5-mini",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "max_completion_tokens": 800,  # For GPT-5 models
  "temperature": 0.7
}
```

**Error Handling**:
```python
try:
    response = await client.post(
        "https://api.openai.com/v1/chat/completions",
        headers=self.headers,
        json=data
    )
    response.raise_for_status()
    return response.json()
except httpx.HTTPError as e:
    logger.error(f"OpenAI API request failed: {str(e)}")
    raise Exception(f"AI service error: {str(e)}")
```

**Fallback Mechanism**:
- Tries OpenAI first
- Falls back to Anthropic if OpenAI fails
- Falls back to Mistral if Anthropic fails
- Returns error if all fail

#### Anthropic Claude (Fallback)

**Models (2025)**:
- `claude-sonnet-4.5` - Best coding model (September 2025) (default)
- `claude-opus-4.1` - Most powerful model
- `claude-sonnet-4` - Previous version

**API Configuration**:
```python
{
  "api_url": "https://api.anthropic.com/v1/messages",
  "default_model": "claude-sonnet-4.5",
  "max_tokens": 4000,
  "temperature": 0.7,
  "supports_vision": True,
  "rate_limit": 50
}
```

**Authentication**:
- Header: `x-api-key: {ANTHROPIC_API_KEY}`
- Key stored in: `user_secrets` table (encrypted)
- OR environment variable: `ANTHROPIC_API_KEY`

#### Google Gemini (Video & Image Generation)

**Models (2025)**:
- `gemini-2.5-pro` - State-of-the-art thinking model
- `gemini-2.5-flash` - Best price-performance (default)
- `gemini-2.0-flash` - Second generation workhorse
- `veo-3` / `veo-3-fast` - Video generation
- `nano-banana` - Image generation

**API Configuration**:
```python
{
  "api_url": "https://generativelanguage.googleapis.com/v1beta/models",
  "default_model": "gemini-2.5-flash",
  "max_tokens": 4000,
  "temperature": 0.7,
  "supports_vision": True,
  "rate_limit": 60
}
```

**Authentication**:
- Query Parameter: `?key={GEMINI_API_KEY}`
- Environment Variable: `GEMINI_API_KEY`
- User-provided key via Settings → Integrations

**Video Generation Costs**:
- Veo 3 Fast: $0.40/second
- Veo 3 Standard: $0.75/second
- Nano Banana (images): $0.039/image

**Usage** (`backend/routes/ai_video.py`):
```python
import google.generativeai as genai

async def get_user_gemini_key(user_id: str) -> Optional[str]:
    """Retrieve user's Gemini API key from user_secrets"""
    result = supabase.table('user_secrets')\
        .select('encrypted_value')\
        .eq('user_id', user_id)\
        .eq('service_name', 'gemini_api_key_encrypted')\
        .single()\
        .execute()
    
    return result.data['encrypted_value'] if result.data else None

async def validate_gemini_key(api_key: str) -> bool:
    """Validate key with test request"""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Hello")
    return True
```

#### Mistral AI (Tertiary Fallback)

**Models**:
- `mistral-large-latest` - Current flagship (default)
- `mistral-medium-latest` - Smaller variant

**API Configuration**:
```python
{
  "api_url": "https://api.mistral.ai/v1/chat/completions",
  "default_model": "mistral-large-latest",
  "max_tokens": 4000,
  "temperature": 0.7,
  "supports_vision": False,
  "rate_limit": 100
}
```

**Authentication**:
- Header: `Authorization: Bearer {MISTRAL_API_KEY}`
- Environment Variable: `MISTRAL_API_KEY`

### Social Media Connectors

All social connectors inherit from `BaseSocialConnector` and implement:

#### Buffer

**File**: `backend/social_connectors/buffer_connector.py`

**OAuth Details**:
```python
{
  "client_id": BUFFER_CLIENT_ID,
  "client_secret": BUFFER_CLIENT_SECRET,
  "redirect_uri": "https://yourapp.com/oauth/callback",
  "auth_url": "https://bufferapp.com/oauth2/authorize",
  "token_url": "https://api.bufferapp.com/1/oauth2/token.json"
}
```

**OAuth Scopes**: Default (no scopes required)

**API Endpoints**:
- Base URL: `https://api.bufferapp.com/1`
- Get Profiles: `GET /profiles.json?access_token={token}`
- Create Post: `POST /updates/create.json`
- Get Analytics: `GET /updates/{post_id}.json`
- Validate Token: `GET /user.json`

**Post Request Format**:
```python
{
  "access_token": "...",
  "text": "Post content",
  "profile_ids[]": "profile_id",
  "media": {"link": "image_url"},  # Optional
  "scheduled_at": unix_timestamp    # Optional
}
```

**Response**:
```python
{
  "success": True,
  "platform_post_id": "post_id",
  "scheduled": False,
  "profiles_posted": 1
}
```

#### Hootsuite

**File**: `backend/social_connectors/hootsuite_connector.py`

**OAuth Details**:
```python
{
  "client_id": HOOTSUITE_CLIENT_ID,
  "client_secret": HOOTSUITE_CLIENT_SECRET,
  "auth_url": "https://platform.hootsuite.com/oauth2/auth",
  "token_url": "https://platform.hootsuite.com/oauth2/token",
  "scope": "offline"
}
```

**API Base URL**: `https://platform.hootsuite.com/v1`

**API Endpoints**:
- Get Networks: `GET /socialNetworks` (Bearer token header)
- Create Post: `POST /messages` (JSON body)
- Get Analytics: `GET /messages/{id}` (returns empty currently)
- Validate Token: `GET /me` (Bearer token header)

**Post Request Format**:
```python
{
  "text": "Post content",
  "socialNetworkIds": ["network_id"],
  "scheduledSendTime": "2025-11-01T15:30:00Z"  # Optional
}
```

**Authentication Header**: `Authorization: Bearer {access_token}`

#### Later

**File**: `backend/social_connectors/later_connector.py`

**OAuth Details**:
```python
{
  "auth_url": "https://api.later.com/v1/oauth/authorize",
  "token_url": "https://api.later.com/v1/oauth/token",
  "scope": "read write"
}
```

**API Base URL**: `https://api.later.com/v1`

**API Endpoints**:
- Get Profiles: `GET /social_profiles` (Bearer token)
- Create Post: `POST /posts` (per platform)
- Get Analytics: `GET /social_profiles/{id}/posts/{post_id}`

#### Sprout Social

**File**: `backend/social_connectors/sprout_connector.py`

**OAuth Details**:
```python
{
  "auth_url": "https://sproutsocial.com/oauth/authorize",
  "token_url": "https://api.sproutsocial.com/oauth/token",
  "scope": "write"
}
```

**API Base URL**: `https://api.sproutsocial.com/v1`

**API Endpoints**:
- Get Profiles: `GET /customer/profiles` (Bearer token)
- Create Post: `POST /messages`
- Validate Token: `GET /me`

**Post Request Format**:
```python
{
  "content": "Post content",
  "profileIds": ["profile_id"],
  "scheduledTime": "2025-11-01T15:30:00Z"  # Optional
}
```

### Common Social Connector Pattern

**Base Class Structure** (`backend/social_connectors/base_connector.py`):

```python
class BaseSocialConnector:
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    async def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """OAuth code -> access token exchange"""
        
    async def get_user_profiles(self, access_token: str) -> List[PlatformProfile]:
        """Get user's social profiles"""
        
    async def create_post(self, access_token: str, post: SocialPost) -> Dict[str, Any]:
        """Create/schedule a post"""
        
    async def get_post_analytics(self, access_token: str, post_id: str) -> Dict[str, Any]:
        """Get post performance metrics"""
        
    async def validate_token(self, access_token: str) -> bool:
        """Verify token is still valid"""
```

**Common OAuth Flow**:
1. Generate authorization URL with client_id, redirect_uri, state
2. User authorizes on provider
3. Provider redirects with authorization code
4. Backend exchanges code for access token
5. Token stored in user_secrets table (encrypted)

### OAuth Flow (Frontend)

**Location**: `src/components/socialConnectors/OAuthHandler.tsx`

**Steps**:
1. **Prepare**: Display permissions, generate auth URL via backend
2. **Authorizing**: Redirect to OAuth provider URL
3. **Processing**: Exchange code for token
4. **Complete**: Display success, store connection

**State Handling**:
```typescript
interface OAuthState {
  platform: string;
  userId: string;
  returnUrl: string;
  timestamp: number;
}

// Encoded as base64: btoa(JSON.stringify(oauthState))
```

**Error Handling**:
```typescript
const errorMessages: Record<string, string> = {
  'access_denied': 'Authorization was cancelled by user',
  'invalid_request': 'Invalid authorization request',
  'invalid_client': 'Invalid client credentials',
  'invalid_grant': 'Invalid authorization grant',
  'unsupported_response_type': 'Unsupported response type'
};
```

**URL Cleanup**: `window.history.replaceState()` removes OAuth parameters from URL

---

## Environment Variables

### Frontend Environment Variables

**Location**: `.env` (Vite)

```bash
VITE_SUPABASE_PROJECT_ID="kciuuxoqxfsogjuqflou"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://kciuuxoqxfsogjuqflou.supabase.co"
VITE_BACKEND_URL="https://wheels-wins-orchestrator.onrender.com"
```

**Usage in Code**:
```typescript
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
import.meta.env.VITE_BACKEND_URL
```

### Backend Environment Variables

**Location**: `backend/.env`

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key_here  # Server-side only
SUPABASE_JWT_SECRET=your_jwt_secret_here

# AI Model Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Optional fallback
GEMINI_API_KEY=your_gemini_api_key_here  # Optional for video

# Social Connectors (OAuth Credentials)
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...
BUFFER_CLIENT_ID=...
BUFFER_CLIENT_SECRET=...
HOOTSUITE_CLIENT_ID=...
HOOTSUITE_CLIENT_SECRET=...
LATER_CLIENT_ID=...
LATER_CLIENT_SECRET=...
SPROUT_CLIENT_ID=...
SPROUT_CLIENT_SECRET=...

# Encryption
SECRET_MASTER_KEY=32_byte_hex_string_64_chars  # CRITICAL

# Server Configuration
ENVIRONMENT=production|development
PORT=8000
HOST=0.0.0.0
```

### Supabase Edge Functions Environment

**Available in Deno Edge Functions**:
```typescript
Deno.env.get('SUPABASE_URL')
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
Deno.env.get('SECRET_MASTER_KEY')
Deno.env.get('OPENAI_API_KEY')
Deno.env.get('ANTHROPIC_API_KEY')
Deno.env.get('FACEBOOK_CLIENT_ID')
Deno.env.get('FACEBOOK_CLIENT_SECRET')
// ... and all other environment variables
```

### Critical Environment Variables for Security

| Variable | Usage | Required | Where |
|----------|-------|----------|-------|
| `SUPABASE_JWT_SECRET` | Backend JWT verification | Yes | Backend |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend database access | Yes | Backend |
| `SECRET_MASTER_KEY` | API key encryption (64 hex chars) | Yes | Backend + Edge Functions |
| `OPENAI_API_KEY` | Primary AI model | Yes (unless user-provided) | Backend |
| `GEMINI_API_KEY` | Video generation | No (user-provided) | Backend |
| `ANTHROPIC_API_KEY` | Fallback AI model | No | Backend |

---

## Error Handling & Security Best Practices

### Standard Error Responses

**Generic Client Messages**:
```typescript
// Frontend: Always show generic error to user
"An error occurred"
"Failed to process request"
"Authentication required"

// Server logs detailed error
console.error('Detailed error:', error.message);
```

**Example from manage-user-secrets**:
```typescript
let userMessage = 'An error occurred';

if (error.message?.includes('Master key')) {
  userMessage = 'Configuration error';
} else if (error.message?.includes('not found')) {
  userMessage = 'Secret not found';
} else if (error.message?.includes('Invalid action')) {
  userMessage = 'Invalid request';
}

return new Response(
  JSON.stringify({ error: userMessage }),
  { status: 400, headers: corsHeaders }
);
```

### Password Strength Requirements

**Via `validatePasswordStrength()`**:
- Minimum length: 8 characters (or configured value)
- Must include uppercase letter
- Must include lowercase letter
- Must include number
- Must include special character

**Returns**:
```typescript
{
  isValid: boolean;
  errors: string[];  // e.g., ["Password must be at least 8 characters"]
}
```

### Logging Best Practices

**Development Only**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.warn('Token encryption is not implemented');
  console.error('Token refresh failed:', error);
}
```

**Production Logging**:
```python
logger.info("User logged in successfully")  # No emojis
logger.error("Database connection failed", { error, endpoint })
logger.warning("API rate limit approaching")
```

### Token Expiration Handling

**Frontend Automatic Refresh**:
- Check every 5 minutes
- Refresh if invalid
- Session timeout after 1 hour of inactivity

**Backend JWT Validation**:
```python
except jwt.ExpiredSignatureError:
    logger.warning("Token has expired")
    raise ValueError("Token has expired")
```

### API Key Rotation

**Process**:
1. Generate new API key from service provider
2. Add new key via Settings → Integrations
3. Test with new key
4. Remove old key (soft delete: set is_active = false)

**Audit Trail**: All key operations logged in secret_audit_logs

### Database Connection Security

**Singleton Pattern**:
```python
class SupabaseClient:
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

**Service Role vs Anon Key**:
- Service Role: Full access, server-side only
- Anon Key: Limited, client-side

**Fallback Logic**:
```python
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
```

### OAuth Security Features

**State Parameter Validation**:
- Prevents CSRF attacks
- Cryptographically random generation
- Validated before token exchange

**PKCE (Proof Key for Public Clients)**:
- Code challenge method: 'S256'
- Prevents authorization code interception
- Required for public OAuth flows

**Token Validation**:
- Validates expiration
- Checks session still active
- Refreshes if needed automatically

---

## Incident Response

### If Master Key is Compromised

1. **Generate new 32-byte master key**:
   ```bash
   openssl rand -hex 32
   ```
2. **Update `SECRET_MASTER_KEY` environment variable**
3. **Re-encrypt all user secrets** (requires data migration)
4. **Notify all users to update API keys**
5. **Rotate all external API keys** (OpenAI, Gemini, etc.)

### If JWT Secret is Compromised

1. **Generate new JWT secret** in Supabase dashboard
2. **Update `SUPABASE_JWT_SECRET` environment variable**
3. **All existing tokens become invalid** (users must re-login)
4. **Invalidate existing sessions** via Supabase dashboard

### If User API Key is Exposed

1. **Delete key from user_secrets** (is_active = false)
2. **User must generate new key** from service provider
3. **Add new key in Settings → Integrations**
4. **Audit log shows operation with IP/user agent**

---

## Security Checklist

Before deploying to production:

- [ ] All `.env` files are `.gitignore`d
- [ ] `SECRET_MASTER_KEY` is 64 hex characters (32 bytes)
- [ ] `SUPABASE_JWT_SECRET` is configured
- [ ] CORS origins are restricted (not wildcard in production)
- [ ] RLS policies enabled on all sensitive tables
- [ ] Password strength validation implemented
- [ ] OAuth state validation implemented
- [ ] Error messages are generic to clients
- [ ] Detailed errors logged server-side
- [ ] Rate limiting configured (via reverse proxy)
- [ ] API keys stored only in user_secrets or environment
- [ ] Audit logging enabled for security operations
- [ ] HTTPS enforced on all endpoints
- [ ] Session timeout configured (1 hour default)
- [ ] Token refresh implemented (5 minute interval)
- [ ] All API integrations use Bearer token authentication
- [ ] Test security features in staging before production deploy

---

**Document Version**: 1.0  
**Last Review**: October 28, 2025  
**Next Review**: Quarterly or after major security updates
