# Claude Code Session Guide

This file provides essential context for Claude Code when working on this project.

---

## Project Overview

**Action Insight Marketing Platform** - AI-powered marketing automation platform with autopilot features.

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend**: FastAPI (Python), deployed on Render
- **Database**: PostgreSQL via Supabase
- **AI Services**: Google Gemini API (user-provided keys)
- **Deployment**: Frontend on Vercel/Netlify, Backend on Render

---

## 🛠️ Development Tools

### Knip - Code Cleanup Tool

**Location**: Installed in `devDependencies` (staging only, never production)

**What it does**:
- Finds unused dependencies in package.json
- Detects unused exports (functions, components never imported)
- Identifies unused files (never referenced)
- Helps reduce bundle size and maintain clean code

**How to use**:
```bash
npm run knip
```

**Documentation**: See `docs/KNIP.md` for full guide

**Important**:
- ✅ **Staging/Dev only** - Automatically excluded from production builds
- ✅ Review all suggestions before removing code
- ✅ Run regularly to prevent code bloat
- ❌ Never run `knip --fix` without careful review

**Example output**:
```
❌ Unused dependencies (3)
  axios, lodash, moment

❌ Unused exports (12)
  src/utils/format.ts: formatCurrency, parseDate

❌ Unused files (5)
  src/components/OldModal.tsx
```

---

## 🤖 AI Models & Services

All AI services use **user-provided API keys** (no platform markup on costs).

### OpenAI (Primary - Required)

**Latest Models (2025)**:
- `gpt-5` - Best model for coding and agentic tasks (August 2025)
- `gpt-5-mini` - Fast, cost-effective (default for most tasks)
- `gpt-4.1` - Improved coding and instruction following
- `gpt-4.1-mini` - Smaller, faster variant

**Current Usage**:
- **Default**: `gpt-5-mini` (backend/agents/social/multi_model_service.py:33)
- Content generation, social media posts
- Video script creation
- Analytics and campaign optimization

**Legacy models removed**: ~~gpt-4o~~, ~~gpt-4o-mini~~, ~~gpt-3.5-turbo~~ (deprecated)

### Anthropic Claude (Optional Fallback)

**Latest Models (2025)**:
- `claude-sonnet-4.5` - Best coding model in the world (September 2025)
- `claude-opus-4.1` - Most powerful model (August 2025)
- `claude-sonnet-4` - Previous version (May 2025)

**Current Usage**:
- **Default**: `claude-sonnet-4.5` (backend/agents/social/multi_model_service.py:42)
- Alternative to OpenAI for advanced reasoning
- Analytics (optional)
- Fallback when OpenAI fails

**Legacy models removed**: ~~claude-3-sonnet-20240229~~, ~~claude-3-haiku-20240307~~ (deprecated)

### Google Gemini (Required for Video)

**Latest Models (2025)**:
- `gemini-2.5-pro` - State-of-the-art thinking model
- `gemini-2.5-flash` - Best price-performance (default)
- `gemini-2.0-flash` - Second generation workhorse
- `veo-3` / `veo-3-fast` - Video generation
- `nano-banana` - Image generation (Gemini 2.5 Flash Image)

**Current Usage**:
- **Default**: `gemini-2.5-flash` (backend/agents/social/multi_model_service.py:60)
- AI video generation (`/app/studio/ai-video`)
- Autopilot video ads
- Scene planning and image generation

**Legacy models removed**: ~~gemini-pro~~, ~~gemini-pro-vision~~ (deprecated)

### Mistral AI (Optional Fallback)

**Models**:
- `mistral-large-latest` - Current flagship (default)
- `mistral-medium-latest` - Smaller variant

**Usage**: Third fallback option in multi-model service

### Model Fallback Order

```python
fallback_order = [OpenAI, Anthropic, Mistral]
```

If OpenAI fails → tries Anthropic → tries Mistral → returns error

---

## Key Features

### 1. Marketing Autopilot
- **Location**: `/app/autopilot`
- **Backend**: `supabase/functions/autopilot-orchestrator/`
- **Database Tables**: `marketing_autopilot_config`, `autopilot_activity_log`, `autopilot_weekly_reports`
- **Cron**: Daily at 2 AM UTC via Supabase Edge Function

**What it does**:
- Automatically optimizes campaigns based on performance
- Generates video ads for low-engagement campaigns
- Adjusts budgets and targets
- Logs all actions to activity feed

### 2. AI Video Generator
- **Location**: `/app/studio/ai-video` (manual), autopilot integration (automatic)
- **Backend**: `backend/routes/ai_video.py`
- **Database Tables**: `ai_video_projects`, `ai_video_jobs`
- **AI Models**: Google Veo 3 (video), Nano Banana (images)

**Documentation**: `docs/AI-VIDEO-GENERATOR.md`

**Cost**:
- Veo 3 Fast: $0.40/second
- Veo 3 Standard: $0.75/second
- Nano Banana: $0.039/image

### 3. User Mode Switching
- **Modes**: Simple (2 nav items) vs Advanced (14+ nav items)
- **Storage**: `user_preferences.interface_mode` column
- **Context**: `src/contexts/UserModeContext.tsx`
- **UI**: `src/components/layout/ModeSwitcher.tsx`

---

## Database Schema

### Important Tables

**user_preferences**
- `user_id` (UUID, UNIQUE) - One row per user
- `preference_category` (TEXT, default 'general')
- `preference_data` (JSONB)
- `interface_mode` (TEXT) - 'simple' or 'advanced'

**user_secrets**
- Stores encrypted API keys (Gemini, OpenAI, etc.)
- Managed via Edge Function `manage-user-secrets`
- Never query directly - use `SecretsService` in frontend

**marketing_autopilot_config**
- One config per user
- Stores business description, targets, AI strategy

**ai_video_projects**
- User's video generation projects
- Links to campaigns via `campaign_id`
- `auto_generated` flag for autopilot videos

### Migrations

**Location**: `supabase/migrations/`

**Applied via**: Supabase SQL Editor (not automatic)

**Recent migrations**:
1. `migration_01_autopilot_system.sql` - Autopilot tables + interface_mode column
2. `migration_02_ai_video_system.sql` - AI video tables + storage bucket
3. `migration_03_fix_user_preferences.sql` - UNIQUE constraint on user_id

**How to apply**: See `docs/APPLY_MIGRATIONS.md`

---

## Common Patterns

### API Key Management

**Frontend**:
```typescript
import { SecretsService } from '@/lib/services/secrets-service';

// Save key
await SecretsService.saveSecret('gemini_api_key_encrypted', apiKey);

// Check if exists
const hasKey = await SecretsService.hasSecret('gemini_api_key_encrypted');
```

**Backend**:
```python
# Query user_secrets table
result = supabase.table('user_secrets').select('encrypted_value').eq('user_id', user_id).eq('service_name', 'gemini_api_key_encrypted').single().execute()
```

### User Mode Context

```typescript
import { useUserMode } from '@/hooks/useUserMode';

const { mode, isLoading, setMode, toggleMode } = useUserMode();

// mode is 'simple' or 'advanced'
// Call setMode('advanced') or toggleMode() to switch
```

### Autopilot Activity Logging

```sql
SELECT * FROM log_autopilot_activity(
  p_user_id := 'user-uuid',
  p_config_id := 'config-uuid',
  p_activity_type := 'video_generation',
  p_description := 'Generated video for campaign X',
  p_entity_type := 'campaign',
  p_entity_id := 'campaign-uuid'
);
```

---

## Configuration Files

### Environment Variables

**Frontend** (`.env`):
```
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend** (`backend/.env`):
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### TypeScript Paths

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Allows imports like: `import { Button } from '@/components/ui/button'`

---

## Known Issues & Solutions

### Issue: Mode switching not working
**Error**: `there is no unique or exclusion constraint matching the ON CONFLICT specification`

**Solution**: Run `migration_03_fix_user_preferences.sql` to add UNIQUE constraint on `user_id`

### Issue: "column does not exist" errors
**Cause**: Database migrations not applied

**Solution**:
1. Check `supabase/migrations/` for migration files
2. Apply them manually via Supabase SQL Editor
3. See `docs/APPLY_MIGRATIONS.md`

### Issue: Gemini API key not found
**Error**: `Please add your Gemini API key in Settings`

**Solution**:
1. Go to Settings → Integrations
2. Add key from https://aistudio.google.com/apikey
3. Key is stored in `user_secrets` table with service_name = 'gemini_api_key_encrypted'

---

## Development Workflow

### Starting Development

```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

### Running Code Cleanup

```bash
# Find unused code
npm run knip

# Review results carefully before removing anything
```

### Applying Database Changes

1. Create migration file in `supabase/migrations/`
2. Copy SQL to Supabase SQL Editor
3. Run migration
4. Document in `APPLY_MIGRATIONS.md` if critical

### Deploying

**Frontend** (Vercel/Netlify):
- Auto-deploys from `main` branch
- Build command: `npm run build`
- Output: `dist/`

**Backend** (Render):
- Auto-deploys from `main` branch
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Important Constraints

### Security
- ✅ Never commit API keys to git
- ✅ Store user keys in `user_secrets` table (encrypted)
- ✅ Use RLS policies on all tables
- ✅ Edge Functions for sensitive operations

### Performance
- ✅ Use indexes on frequently queried columns
- ✅ Limit real-time subscriptions
- ✅ Cache expensive operations
- ✅ Use `user_api_keys` pattern for user-provided keys (no platform markup)

### Code Quality
- ✅ Run `npm run knip` before major refactors
- ✅ Use TypeScript strict mode
- ✅ Follow existing patterns in codebase
- ✅ Keep components under 300 lines

---

## File Structure

```
action-insight-pilot/
├── src/
│   ├── components/          # React components
│   │   ├── layout/          # Layout components (nav, sidebar)
│   │   ├── settings/        # Settings UI
│   │   └── ui/              # Shadcn/ui components
│   ├── contexts/            # React contexts (Auth, UserMode, etc.)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities and services
│   ├── pages/               # Page components
│   └── integrations/        # Supabase client setup
├── backend/
│   ├── routes/              # FastAPI routes
│   ├── database.py          # Supabase connection
│   └── auth.py              # Auth middleware
├── supabase/
│   ├── functions/           # Edge Functions (Deno)
│   └── migrations/          # SQL migrations
├── docs/                    # Documentation
└── public/                  # Static assets
```

---

## Resources

- **Main docs**: `docs/CONVERSATION.md` - Full development history
- **AI Video**: `docs/AI-VIDEO-GENERATOR.md` - Video generation guide
- **Knip**: `docs/KNIP.md` - Code cleanup tool guide
- **Migrations**: `docs/APPLY_MIGRATIONS.md` - How to apply DB changes
- **Architecture**: `docs/ARCHITECTURE.md` - System design
- **API**: `docs/API.md` - Backend API reference

---

## Quick Reference

### Common Commands
```bash
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run knip             # Find unused code
npm run lint             # Lint code
```

### Database Quick Queries
```sql
-- Check user mode
SELECT interface_mode FROM user_preferences WHERE user_id = 'user-uuid';

-- Check autopilot config
SELECT * FROM marketing_autopilot_config WHERE user_id = 'user-uuid';

-- Check video projects
SELECT * FROM ai_video_projects WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

### Useful URLs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Gemini API Keys**: https://aistudio.google.com/apikey

---

**Last Updated**: 2025-10-08
**Project Version**: 1.0.0
**Status**: Active Development
