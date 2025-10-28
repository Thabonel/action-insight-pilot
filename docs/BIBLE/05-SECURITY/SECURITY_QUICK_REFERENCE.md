# Security & Integrations Quick Reference

**Quick lookup table for all security and integration configurations**

---

## Authentication & Authorization Quick Links

| Component | Location | Purpose |
|-----------|----------|---------|
| Auth Context | `src/contexts/AuthContext.tsx` | Frontend sign-in/sign-up/sign-out |
| JWT Verification | `backend/auth.py` | Backend token validation |
| Security Context | `src/contexts/SecurityContext.tsx` | Token lifecycle management |
| OAuth Handler | `src/components/socialConnectors/OAuthHandler.tsx` | OAuth 2.0 flow implementation |
| Secure OAuth Hook | `src/hooks/useSecureOAuth.ts` | PKCE + CSRF protection |

**Quick Facts**:
- Primary Auth: Supabase Auth (email/password + OAuth)
- JWT Algorithm: HS256
- JWT Secret Variable: `SUPABASE_JWT_SECRET`
- Session Timeout: 1 hour
- Token Auto-Refresh: Every 5 minutes
- PKCE Enabled: Yes (S256)

---

## API Key Management Quick Links

| Component | Location | Purpose |
|-----------|----------|---------|
| Secrets Service | `src/lib/services/secrets-service.ts` | Frontend API for key management |
| manage-user-secrets | `supabase/functions/manage-user-secrets/index.ts` | Edge Function that encrypts/decrypts |
| User Secrets Client | `backend/database/user_secrets_client.py` | Backend API for key retrieval |
| user_secrets Table | `supabase/migrations/20250610225039-*.sql` | Database schema |

**Encryption Details**:
- Algorithm: AES-GCM (authenticated encryption)
- Key Length: 32 bytes (256-bit)
- Key Format: 64 hex characters
- IV Length: 12 bytes (randomly generated per secret)
- Key Variable: `SECRET_MASTER_KEY`

**Supported Secrets**:
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

---

## Security Measures Quick Reference

| Measure | Status | Location |
|---------|--------|----------|
| CORS Configuration | Implemented | `backend/main.py` + `supabase/functions/_shared/cors.ts` |
| Password Validation | Implemented | `src/contexts/AuthContext.tsx` |
| OAuth State Validation | Implemented | `src/components/socialConnectors/OAuthHandler.tsx` |
| PKCE (S256) | Implemented | `src/hooks/useSecureOAuth.ts` |
| RLS Policies | Implemented | `supabase/migrations/*.sql` |
| Input Validation | Implemented | Pydantic models in routes |
| SQL Injection Prevention | Implemented | Parameterized queries via Supabase client |
| XSS Protection | Implemented | React automatic escaping |
| CSRF Protection | Implemented | OAuth state parameter |
| Rate Limiting | Not Implemented | TODO: Add at reverse proxy level |

**CORS Origins** (Production):
- https://aiboostcampaign.com
- https://wheels-wins-orchestrator.onrender.com
- https://lovable.dev
- https://app.lovable.dev

---

## AI Models & Services

| Provider | Models | Default | Auth | Status |
|----------|--------|---------|------|--------|
| OpenAI | gpt-5, gpt-5-mini, gpt-4.1, gpt-4.1-mini | gpt-5-mini | Bearer token | Primary |
| Anthropic | claude-sonnet-4.5, claude-opus-4.1 | claude-sonnet-4.5 | x-api-key | Fallback |
| Google Gemini | gemini-2.5-flash, gemini-2.0-flash, veo-3 | gemini-2.5-flash | Query param | Video gen |
| Mistral | mistral-large-latest, mistral-medium-latest | mistral-large-latest | Bearer token | Fallback |

**API URLs**:
- OpenAI: https://api.openai.com/v1/chat/completions
- Anthropic: https://api.anthropic.com/v1/messages
- Gemini: https://generativelanguage.googleapis.com/v1beta/models
- Mistral: https://api.mistral.ai/v1/chat/completions

---

## Social Connectors Overview

| Platform | File | OAuth URL | API Base |
|----------|------|-----------|----------|
| Buffer | `buffer_connector.py` | https://bufferapp.com/oauth2/authorize | https://api.bufferapp.com/1 |
| Hootsuite | `hootsuite_connector.py` | https://platform.hootsuite.com/oauth2/auth | https://platform.hootsuite.com/v1 |
| Later | `later_connector.py` | https://api.later.com/v1/oauth/authorize | https://api.later.com/v1 |
| Sprout | `sprout_connector.py` | https://sproutsocial.com/oauth/authorize | https://api.sproutsocial.com/v1 |

**All inherit from**: `backend/social_connectors/base_connector.py`

**Common Methods**:
- `exchange_code_for_token()` - OAuth token exchange
- `get_user_profiles()` - List connected accounts
- `create_post()` - Create/schedule post
- `get_post_analytics()` - Performance metrics
- `validate_token()` - Token verification

---

## Environment Variables (Critical)

### Must-Have for Production

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_JWT_SECRET=xxxxx

# Encryption (CRITICAL)
SECRET_MASTER_KEY=64_character_hex_string

# AI (at least one required)
OPENAI_API_KEY=xxxxx
OR GEMINI_API_KEY=xxxxx

# Server
ENVIRONMENT=production
PORT=8000
```

### How to Generate SECRET_MASTER_KEY

```bash
# Generate 32 random bytes as hex (64 characters)
openssl rand -hex 32
# or
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Database RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| user_secrets | auth.uid() = user_id | auth.uid() = user_id | auth.uid() = user_id | auth.uid() = user_id |
| secret_audit_logs | auth.uid() = user_id | - | - | - |
| support_tickets | auth.uid() = user_id OR anon | auth.uid() = user_id OR anon | - | - |

**All tables**: RLS enabled, no public access

---

## Common Security Patterns

### Storing a User API Key

```typescript
// Frontend
import { SecretsService } from '@/lib/services/secrets-service';

await SecretsService.saveSecret('openai_api_key_encrypted', userProvidedKey);
```

### Retrieving a User API Key

```python
# Backend
from backend.database.user_secrets_client import UserSecretsClient

client = UserSecretsClient()
api_key = await client.get_user_secret(user_id, 'openai_api_key_encrypted')
```

### Verifying JWT Token

```python
# Backend
from backend.auth import verify_token, is_admin_user

payload = verify_token(authorization_header)
user_id = payload['sub']
is_admin = is_admin_user(authorization_header)
```

### OAuth Flow

```typescript
// Frontend - Initiate
const { data } = await supabase.functions.invoke('oauth-initiate', {
  body: { platform: 'facebook' }
});
window.location.href = data.authUrl;

// Backend - Callback (handled by social connector)
const token = await connector.exchange_code_for_token(code);
```

---

## Incident Response Checklist

### API Key Compromised
- [ ] Delete from user_secrets (soft delete)
- [ ] Notify user via email
- [ ] User regenerates key from provider
- [ ] User adds new key in Settings

### Master Key Compromised
- [ ] Generate new `SECRET_MASTER_KEY`
- [ ] Update environment variables everywhere
- [ ] Re-encrypt all user secrets (data migration)
- [ ] Notify all users to rotate external API keys

### JWT Secret Compromised
- [ ] Generate new `SUPABASE_JWT_SECRET`
- [ ] Update environment variables
- [ ] All existing sessions invalidated
- [ ] Users must re-login

### Database Breach
- [ ] Check `secret_audit_logs` for unauthorized access
- [ ] Investigate IP addresses and user agents
- [ ] Check RLS policies are enforced
- [ ] Review recent schema changes

---

## Testing Checklist

### Before Production Deployment

- [ ] Test sign-up with weak password (should reject)
- [ ] Test sign-up with strong password (should succeed)
- [ ] Test OAuth flow with actual provider
- [ ] Test API key encryption/decryption
- [ ] Test JWT token verification with expired token
- [ ] Test CORS with different origins
- [ ] Test RLS policies with different users
- [ ] Test rate limiting on API endpoints
- [ ] Test session timeout (1 hour inactivity)
- [ ] Test token auto-refresh (5 minute interval)
- [ ] Verify no API keys in logs
- [ ] Verify error messages are generic to users
- [ ] Test HTTPS certificate validity
- [ ] Run security scan on dependencies

---

## Quick Debugging Guide

### 401 Unauthorized
- Check `Authorization` header present
- Check token not expired
- Check `SUPABASE_JWT_SECRET` matches
- Check user exists in Supabase auth

### RLS Policy Violation
- Check user_id matches auth.uid()
- Check RLS policies are enabled on table
- Check user has correct role in token

### Failed OAuth
- Check OAuth state parameter validation
- Check redirect_uri matches provider config
- Check client_id and client_secret correct
- Check scopes requested are available
- Check OAuth token was exchanged for access token

### API Key Encryption Fails
- Check `SECRET_MASTER_KEY` is 64 hex characters
- Check `SECRET_MASTER_KEY` exists in environment
- Check IV is valid base64 string
- Check encrypted_value is valid base64 string

### CORS Error
- Check origin is in allowed list
- Check credentials: true if needed
- Check preflight OPTIONS request succeeds
- Check Access-Control headers returned

---

**Last Updated**: October 28, 2025
**Document Version**: 1.0
**Audience**: Developers, DevOps, Security

