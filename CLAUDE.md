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

## 🚨 Anti-AI-Slop Rules (CRITICAL - READ FIRST)

### Code Quality Standards - NO EXCEPTIONS

**NEVER include any of the following patterns in code:**

#### 1. Emojis in Code or Comments

- **BANNED**: Any emoji in code, comments, or logging statements
- **Examples**: ✅ ❌ 🚀 💡 🚨 ⚠️ 🎉 🔥 🎯 💰 📋
- **Exception**: User-facing UI strings ONLY (e.g., toast messages, button labels)
- **Why**: Unprofessional, breaks text processing, IDE issues

```typescript
// BAD
logger.info("✅ User logged in successfully");
console.log("🚀 Starting process...");

// GOOD
logger.info("User logged in successfully");
console.log("Starting process...");
```

#### 2. Poor Error Handling

- **BANNED**: Bare console.log/console.error in try/catch blocks
- **BANNED**: Generic error messages without context
- **BANNED**: Swallowing errors silently

```typescript
// BAD
try {
  await fetchData();
} catch (error) {
  console.log(error); // Useless
}

// GOOD
try {
  await fetchData();
} catch (error) {
  if (error instanceof NetworkError) {
    logger.error("Network request failed", { error, endpoint });
    toast.error("Unable to load data. Please check your connection.");
  } else {
    logger.error("Unexpected error in fetchData", { error });
    throw error; // Re-throw if unhandled
  }
}
```

#### 3. Verbose or Obvious Comments

- **BANNED**: Comments that restate what the code does
- **BANNED**: "This function does X" when function name already says it
- **REQUIRED**: Comments explain WHY, not WHAT

```typescript
// BAD
// This function gets the user data
function getUserData() { ... }

// This increments the counter by 1
counter++;

// GOOD
// Cache user data for 5 minutes to reduce API calls
function getUserData() { ... }

// Increment must happen before validation due to race condition
counter++;
```

#### 4. Em-Dashes and Fancy Punctuation

- **BANNED**: Em-dashes (—) in code, comments, or UI text
- **USE**: Regular hyphens (-) or colons (:) instead
- **Why**: Encoding issues, copy-paste problems, accessibility

```typescript
// BAD
<p>Fill out as much or as little as you like — here's what you'll get</p>

// GOOD
<p>Fill out as much or as little as you like - here's what you'll get</p>
```

#### 5. Mismatched Naming and Logic

- **BANNED**: Variable names that don't match their content
- **BANNED**: Function names that don't describe their actual behavior

```typescript
// BAD
const userData = fetchCompanySettings(); // Name says user, returns company
function saveUser() { deleteUser(); } // Name says save, does delete

// GOOD
const companySettings = fetchCompanySettings();
function deleteUser() { deleteUser(); }
```

#### 6. Hardcoded Mock Data in Production Code

- **BANNED**: Mock data in files outside tests/ or mocks/
- **BANNED**: TODO comments saying "replace with real API"
- **REQUIRED**: Real implementations or clearly marked feature flags

```typescript
// BAD (in production file)
async function getWeather() {
  // TODO: Connect to real API
  return { temp: 72, condition: "sunny" };
}

// GOOD
async function getWeather(location: string) {
  const response = await fetch(`/api/weather?location=${location}`);
  return response.json();
}
```

#### 7. Repeated Code Blocks

- **BANNED**: Copy-pasted code with minor variations
- **REQUIRED**: Extract to shared function or use parameters

```typescript
// BAD
function processUserA() {
  validate();
  transform();
  save();
}
function processUserB() {
  validate();
  transform();
  save();
}

// GOOD
function processUser(type: 'A' | 'B') {
  validate();
  transform();
  save(type);
}
```

#### 8. Imports/Dependencies That Don't Exist

- **BANNED**: Importing non-existent packages
- **BANNED**: Using APIs that don't exist in the current version
- **REQUIRED**: Verify all imports against package.json

```typescript
// BAD
import { nonExistentFunction } from 'made-up-library';

// GOOD
// Check package.json first, then import
import { realFunction } from 'installed-library';
```

#### 9. Missing Integration Glue

- **BANNED**: Creating new features without connecting to existing systems
- **REQUIRED**: Wire new code into actual application flow

```typescript
// BAD - function exists but never called
async function newFeature() { ... }

// GOOD - function created AND registered
async function newFeature() { ... }
router.post('/new-feature', newFeature); // Wired up!
```

#### 10. Inconsistent Formatting

- **BANNED**: Mixing tabs and spaces
- **BANNED**: Inconsistent quote styles ('single' vs "double")
- **REQUIRED**: Follow project's existing style (see .prettierrc)

#### 11. Trivial or Meaningless Tests

- **BANNED**: Tests that don't actually test anything
- **BANNED**: Tests that just verify mocks return mocked values

```typescript
// BAD
test('getUserData works', () => {
  const mockData = { name: 'John' };
  jest.mock('api', () => ({ get: () => mockData }));
  expect(getUserData()).toBe(mockData); // Just testing the mock!
});

// GOOD
test('getUserData handles network errors gracefully', async () => {
  jest.spyOn(api, 'get').mockRejectedValue(new NetworkError());
  const result = await getUserData();
  expect(result).toBeNull();
  expect(logger.error).toHaveBeenCalledWith('Network error fetching user');
});
```

#### 12. Wrong or Hallucinated File Paths

- **BANNED**: Creating files in non-existent directories
- **REQUIRED**: Use Glob tool to verify directory structure first

```bash
# BAD - assuming directory exists
Write: /src/components/new-feature/Component.tsx

# GOOD - verify first
Glob: src/components/**
# Confirm directory exists or needs creation
# THEN write file
```

### Enforcement Checklist

Before committing any code, verify:

- ✅ No emojis in code/comments (UI strings excepted)
- ✅ All errors properly handled with context
- ✅ Comments explain WHY, not WHAT
- ✅ No em-dashes or fancy punctuation
- ✅ Variable names match their content
- ✅ No mock data in production paths
- ✅ No repeated code blocks (DRY principle)
- ✅ All imports exist in package.json
- ✅ New features wired into application
- ✅ Formatting consistent with project
- ✅ Tests actually test behavior
- ✅ File paths verified before creation

### Quality Check Commands

```bash
# Run before every commit
npm run quality:check:full
npm run type-check
npm run lint
```

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

### AI Model Management System (NEW - October 2025)

The platform now includes an **automated AI model management system** that:
- Discovers latest models monthly from all providers
- Automatically switches to newest flagship models
- Tracks model capabilities, pricing, and availability
- Provides admin UI for monitoring and manual triggers

**Documentation**: `docs/AI-MODEL-MANAGEMENT.md`
**Admin UI**: `/app/admin` → AI Models tab
**Edge Functions**: `ai-model-updater` (monthly cron), `ai-model-config` (API)

### OpenAI (Primary - Required)

**Latest Models (October 2025)**:
- `gpt-5` - Flagship model with best performance (August 2025)
- `gpt-5-mini` - Fast, cost-effective (recommended default)
- `gpt-5-nano` - Smallest fast model
- `gpt-4.1` - Previous generation flagship (1M token context)
- `gpt-4.1-mini` - Previous generation fast model
- `o3` / `o4-mini` - Advanced reasoning models

**Default Model**: `gpt-5` (flagship) - auto-updated monthly

**Usage**:
- Content generation, social media posts
- Video script creation
- Analytics and campaign optimization
- All AI-powered features

**Legacy models removed**: ~~gpt-4o~~, ~~gpt-4o-mini~~, ~~gpt-3.5-turbo~~ (deprecated)

### Anthropic Claude (Optional Fallback)

**Latest Models (October 2025)**:
- `claude-sonnet-4-5` - Best coding model in the world (September 29, 2025)
- `claude-opus-4-1` - Most powerful model for complex tasks (August 5, 2025)
- `claude-haiku-4-5` - Fast and cost-effective (October 15, 2025)
- `claude-sonnet-4` - Previous generation (May 22, 2025, 1M token context)

**Default Model**: `claude-sonnet-4-5` (flagship) - auto-updated monthly

**Usage**:
- Alternative to OpenAI for advanced reasoning
- Analytics (optional)
- Fallback when OpenAI fails

**Legacy models removed**: ~~claude-3-sonnet~~, ~~claude-3-haiku~~, ~~claude-3-opus~~ (deprecated)

### Google Gemini (Required for Video)

**Latest Models (October 2025)**:
- `gemini-2.5-pro` - State-of-the-art with adaptive thinking (1M token context)
- `gemini-2.5-flash` - Best price-performance (recommended default)
- `gemini-2.5-flash-lite` - Most cost-efficient
- `gemini-2.5-computer-use` - UI interaction capabilities
- `gemini-2.0-flash` - Previous generation
- `veo-3` / `veo-3-fast` - Video generation
- `nano-banana` - Image generation

**Default Model**: `gemini-2.5-pro` (flagship) - auto-updated monthly

**Usage**:
- AI video generation (`/app/studio/ai-video`)
- Autopilot video ads
- Scene planning and image generation
- Visual content creation

**Legacy models removed**: ~~gemini-pro~~, ~~gemini-pro-vision~~, ~~gemini-1.5~~ (deprecated)

### Mistral AI (Optional Fallback)

**Latest Models (October 2025)**:
- `mistral-large-latest` - Current flagship (default)
- `mistral-medium-latest` - Balanced performance

**Default Model**: `mistral-large-latest` (flagship) - auto-updated monthly

**Usage**: Third fallback option in multi-model service

### Model Fallback Order

```python
fallback_order = [OpenAI, Anthropic, Mistral]
```

If OpenAI fails → tries Anthropic → tries Mistral → returns error

### Accessing Current Models

All AI features now use the **AI Model Config API** for dynamic model selection:

```typescript
// Frontend/Edge Functions
const { data } = await supabase.functions.invoke('ai-model-config', {
  body: { provider: 'openai', type: 'flagship' }
});
const model = data.model_name;  // Returns current flagship model
```

```python
# Backend Python
from services.ai_model_service import AIModelService
model_service = AIModelService()
model = model_service.get_model('openai', 'flagship')
```

**Model Types**:
- `flagship` - Best/latest model (always used by default)
- `fast` - Cost-effective alternative
- `legacy` - Deprecated but still available

---

## 🧠 Strategic Marketing Prompts

The platform includes **10 core strategic marketing prompts** for foundational marketing strategy work.

**Location**: `src/lib/strategic-marketing-prompts.ts`

### Core Prompts Library

1. **Brand Positioning (3Cs Analysis)** - `strategy-001`
   - Analyzes Company, Customer, Competition
   - Outputs: positioning statement, 3 differentiators, brand tone
   - Agent: `brand-positioning-agent`
   - Table: `brand_positioning_analyses`

2. **Customer Persona Builder** - `strategy-002`
   - Generates 2-3 detailed personas
   - Includes demographics, motivations, emotional triggers
   - Uses existing `audience-insight-agent`

3. **Message Crafting (3-Tier)** - `strategy-003`
   - Emotional hook, practical value, credibility proof
   - Uses existing `messaging-agent`

4. **Offer & Funnel Design** - `strategy-004`
   - Awareness → Engagement → Conversion → Retention
   - Stage-appropriate offers + automation tasks
   - Agent: `funnel-design-agent`
   - Table: `funnel_designs`

5. **30-Day Content Strategy** - `strategy-005`
   - Authenticity and storytelling focus
   - Uses existing `content-calendar-agent`

6. **Full Campaign Generator** - `strategy-006`
   - Headline, tagline, ad copy, CTA, landing page, viral variant
   - Uses existing `ai-campaign-assistant`

7. **SEO & Keyword Framework** - `strategy-007`
   - Keywords grouped by buyer stage (awareness/consideration/purchase)
   - 3 content titles per group
   - Uses existing `keyword-research-agent` (backend)

8. **Competitor Gap Analyzer** - `strategy-008`
   - Gaps in messaging, channels, audience, content
   - Ownable differentiator recommendation
   - Agent: `competitor-gap-agent`
   - Table: `competitive_gap_analyses`

9. **Performance Tracker Framework** - `strategy-009`
   - KPI framework for non-marketers
   - Automation suggestions
   - Agent: `performance-tracker-agent`
   - Table: `performance_tracking_frameworks`

10. **Marketing Review & Pivot** - `strategy-010`
    - What's working / not working analysis
    - Quick win, experiment, long-term strategy shift
    - Uses existing `performance-optimizer`

### Usage Pattern

```typescript
import { getPromptById, parsePromptTemplate, validatePromptInputs } from '@/lib/strategic-marketing-prompts';

// Get a prompt
const prompt = getPromptById('strategy-001');

// Validate inputs
const inputs = {
  companyMission: "...",
  productOffer: "...",
  targetAudience: "...",
  competitors: "..."
};
const validation = validatePromptInputs(prompt, inputs);

// Parse template
const parsedPrompt = parsePromptTemplate(prompt.userPromptTemplate, inputs);

// Call appropriate Edge Function
const response = await supabase.functions.invoke('brand-positioning-agent', {
  body: inputs
});
```

### New Edge Functions

**Strategic Agents** (Supabase Functions):
- `brand-positioning-agent` - 3Cs framework analysis
- `funnel-design-agent` - Complete funnel with automation
- `competitor-gap-agent` - Competitive gap analysis
- `performance-tracker-agent` - KPI tracking setup

**Database Tables**:
- `brand_positioning_analyses` - Stores positioning analyses
- `funnel_designs` - Stores funnel designs
- `competitive_gap_analyses` - Stores competitive analyses
- `performance_tracking_frameworks` - Stores KPI frameworks

**Migration**: `supabase/migrations/20251011000000_strategic_marketing_agents.sql`

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
