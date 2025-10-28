# Security & Integrations Documentation Index

Welcome to the comprehensive security and third-party integrations documentation for Action Insight Marketing Platform.

## Quick Navigation

### Start Here
- **New to the platform?** Start with [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md)
- **Need everything?** Read [SECURITY_AND_INTEGRATIONS.md](SECURITY_AND_INTEGRATIONS.md)
- **Setting up production?** Go to [DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md)

---

## Documentation Files

### 1. SECURITY_AND_INTEGRATIONS.md (1,305 lines)
**Comprehensive Reference Manual**

The complete guide to all security and integration aspects. Organized in 6 major sections:

**Sections**:
1. **Authentication & Authorization** - Supabase Auth, JWT, RLS, OAuth
2. **API Key Management** - Encryption (AES-GCM), storage, retrieval
3. **Security Measures** - CORS, validation, XSS/SQL injection prevention
4. **Third-Party Integrations** - AI models, social connectors with API specs
5. **Environment Variables** - All required configuration variables
6. **Error Handling & Best Practices** - Security patterns and incident response

**Best for**: Developers implementing features, security audits, detailed understanding

**Key Topics**:
- JWT token structure and verification
- AES-GCM encryption for API keys
- OAuth 2.0 flow with PKCE
- RLS policies on database tables
- API specifications for all integrations
- Error handling patterns
- Incident response procedures

---

### 2. SECURITY_QUICK_REFERENCE.md (301 lines)
**Quick Lookup Cheat Sheet**

Fast reference tables and code examples for common tasks.

**Sections**:
- Component location quick links
- Quick facts tables (AI models, social platforms, security measures)
- Critical environment variables
- Common security patterns (code examples)
- Incident response checklists
- Testing checklist
- Debugging guide

**Best for**: Quick lookups, troubleshooting, daily development

**Quick Find**:
- Where is component X located? See "Quick Links" section
- How do I store an API key? See "Common Security Patterns"
- What's wrong with my OAuth? See "Debugging Guide"
- Am I ready for production? See "Testing Checklist"

---

### 3. DOCUMENTATION_SUMMARY.md (200+ lines)
**Overview and Navigation Guide**

High-level overview of the entire documentation package.

**Contains**:
- Document structure overview
- Key findings and highlights
- File locations reference
- How to use documentation by role
- Key statistics
- Notable implementation details
- Security checklist
- Maintenance information

**Best for**: Understanding what's documented, finding starting points by role

---

## Quick Facts

### Authentication
- **System**: Supabase Auth
- **Methods**: Email/password + 5 OAuth providers
- **Token Algorithm**: HS256
- **Session Timeout**: 1 hour
- **Auto-Refresh**: Every 5 minutes
- **Security**: PKCE + State parameter

### API Key Encryption
- **Algorithm**: AES-GCM (authenticated encryption)
- **Key Size**: 256-bit (32 bytes)
- **IV**: 12 bytes per secret (random)
- **Storage**: Encrypted in database
- **Audit Logging**: Yes (IP + User Agent)

### Integrations
- **AI Models**: 4 providers (OpenAI, Anthropic, Gemini, Mistral)
- **Social Platforms**: 4 connectors (Buffer, Hootsuite, Later, Sprout)
- **Fallback Mechanism**: Yes (OpenAI → Anthropic → Mistral)
- **OAuth Platforms**: 5 (Google, Facebook, Twitter, LinkedIn, GitHub)

### Security Measures Implemented
- AES-GCM encryption for secrets: Yes
- RLS policies on tables: Yes
- JWT token verification: Yes
- OAuth PKCE: Yes
- SQL injection prevention: Yes
- XSS protection: Yes
- CSRF protection: Yes
- Rate limiting: No (TODO - add at reverse proxy)

---

## By Role

### Developers Implementing Features
1. Read [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Component locations
2. Check [SECURITY_AND_INTEGRATIONS.md](SECURITY_AND_INTEGRATIONS.md) - Implementation details
3. Use code examples in "Common Security Patterns" section

### DevOps / Deployment
1. Check [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Environment Variables
2. Follow the 17-item Security Checklist before deployment
3. Use Incident Response Checklist if needed

### Security / Compliance
1. Read entire [SECURITY_AND_INTEGRATIONS.md](SECURITY_AND_INTEGRATIONS.md)
2. Verify all items in Security Checklist
3. Review RLS policies section
4. Check error handling practices

### Integration Development
1. Use Quick Links in [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md)
2. Find API specifications in [SECURITY_AND_INTEGRATIONS.md](SECURITY_AND_INTEGRATIONS.md)
3. Review code examples and common patterns

### System Operators
1. Check [DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md) - Overview
2. Use [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Debugging Guide
3. Follow Incident Response Checklist for issues

---

## Critical Environment Variables for Production

These MUST be set before deploying to production:

```bash
# Supabase (Required)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_JWT_SECRET=xxxxx

# Encryption (CRITICAL - 64 hex characters)
SECRET_MASTER_KEY=generate_with_openssl_rand_-hex_32

# AI Models (at least one required)
OPENAI_API_KEY=xxxxx
OR GEMINI_API_KEY=xxxxx

# Server
ENVIRONMENT=production
PORT=8000
```

**Generate SECRET_MASTER_KEY**:
```bash
openssl rand -hex 32
# or
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## File Locations

### Core Authentication
```
Frontend:
  src/contexts/AuthContext.tsx
  src/contexts/SecurityContext.tsx
  src/hooks/useSecureOAuth.ts
  src/components/socialConnectors/OAuthHandler.tsx

Backend:
  backend/auth.py
  backend/config.py
```

### API Key Management
```
Frontend:
  src/lib/services/secrets-service.ts

Backend:
  backend/database/user_secrets_client.py

Edge Functions:
  supabase/functions/manage-user-secrets/index.ts
```

### Social Connectors
```
  backend/social_connectors/base_connector.py
  backend/social_connectors/buffer_connector.py
  backend/social_connectors/hootsuite_connector.py
  backend/social_connectors/later_connector.py
  backend/social_connectors/sprout_connector.py
```

### AI Services
```
  backend/agents/ai/base_ai_service.py
  backend/agents/social/multi_model_service.py
```

### Database
```
  supabase/migrations/20250610225039-*.sql (user_secrets table)
  supabase/migrations/20251024000000_*.sql (support_tickets table)
```

---

## Common Tasks

### Store a User API Key
```typescript
import { SecretsService } from '@/lib/services/secrets-service';

await SecretsService.saveSecret('openai_api_key_encrypted', apiKey);
```

### Retrieve a User API Key
```python
from backend.database.user_secrets_client import UserSecretsClient

client = UserSecretsClient()
api_key = await client.get_user_secret(user_id, 'openai_api_key_encrypted')
```

### Verify JWT Token
```python
from backend.auth import verify_token, is_admin_user

payload = verify_token(authorization_header)
user_id = payload['sub']
is_admin = is_admin_user(authorization_header)
```

### Initiate OAuth Flow
```typescript
const { data } = await supabase.functions.invoke('oauth-initiate', {
  body: { platform: 'facebook' }
});
window.location.href = data.authUrl;
```

---

## Checklists

### Before Production Deployment
See [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Testing Checklist

Items include:
- Password validation testing
- OAuth flow testing
- Encryption/decryption testing
- CORS testing
- RLS policy testing
- Session timeout testing
- Token refresh testing
- And more...

### Incident Response
See [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Incident Response Checklist

Covers:
- API key compromised
- Master key compromised
- JWT secret compromised
- Database breach

---

## Troubleshooting

See [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Debugging Guide

Quick troubleshooting for:
- 401 Unauthorized errors
- RLS policy violations
- OAuth failures
- Encryption failures
- CORS errors

---

## Document Statistics

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| SECURITY_AND_INTEGRATIONS.md | 1,305 | 34 KB | Complete reference |
| SECURITY_QUICK_REFERENCE.md | 301 | 8.9 KB | Quick lookup |
| DOCUMENTATION_SUMMARY.md | 200+ | - | Navigation |
| **Total** | **1,600+** | **43 KB** | Full coverage |

---

## Updates & Maintenance

**Last Updated**: October 28, 2025  
**Version**: 1.0  
**Next Review**: Quarterly or after major updates

**Update Triggers**:
- New integration added
- Security vulnerability found
- Authentication system changes
- Environment variable additions
- API endpoint changes

---

## Key Numbers Quick Reference

| Category | Count |
|----------|-------|
| Supported OAuth providers | 5 |
| AI model providers | 4 |
| Social media connectors | 4 |
| RLS-protected tables | 3 |
| Implemented security measures | 10 |
| API key service names | 15+ |
| Environment variables | 30+ |
| Pre-deployment checklist items | 17 |

---

## Need Help?

**For specific questions**:
- **Authentication**: See backend/auth.py and src/contexts/AuthContext.tsx
- **API Keys**: See supabase/functions/manage-user-secrets/index.ts
- **Social Connectors**: See backend/social_connectors/ directory
- **Security**: See supabase/migrations/ for RLS policies

**For quick answers**: Use [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md)

**For deep dives**: Use [SECURITY_AND_INTEGRATIONS.md](SECURITY_AND_INTEGRATIONS.md)

---

**Start exploring the documentation with the links above!**

All files are located in the `/docs/` directory of the project.

