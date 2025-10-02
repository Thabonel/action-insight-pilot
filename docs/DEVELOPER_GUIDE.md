# AI Marketing Hub - Developer Guide

## What Is This?
AI-powered marketing automation SaaS platform for campaign management, content generation, lead tracking, and multi-channel publishing.

## Tech Stack
**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend:** Supabase (PostgreSQL + Auth + Edge Functions) + FastAPI (Python)  
**AI:** OpenAI GPT-5 / Lovable AI (Google Gemini)  
**Routing:** React Router Dom  
**State:** React Hooks + Context API + TanStack Query

## Quick Start
```bash
npm install
npm run dev  # Frontend at localhost:5173
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000  # Backend at localhost:8000
```

## Architecture

### Frontend Structure
```
src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui base components
│   ├── dashboard/      # Dashboard widgets
│   ├── campaigns/      # Campaign management
│   └── AICampaignCopilot.tsx  # AI campaign generator
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── lib/                # Utils, API clients, services
├── contexts/           # React contexts (Auth, Onboarding, ContentIdeas)
├── types/              # TypeScript definitions
└── integrations/       # Supabase client & types
```

### Backend Structure
```
backend/
├── main.py            # FastAPI entry point
├── routes/            # API route handlers
├── agents/            # AI agent logic (content, email, leads, social)
├── database/          # Database utilities
└── social_connectors/ # Social media API integrations

supabase/functions/    # Serverless edge functions
├── audience-insight-agent/
├── channel-strategy-agent/
├── messaging-agent/
└── content-calendar-agent/
```

## Key Features & Files

### 1. AI Campaign Copilot
**File:** `src/components/AICampaignCopilot.tsx`  
**Purpose:** Multi-step AI campaign generator using 4 edge functions  
**Flow:**
1. `audience-insight-agent` → Generates personas from business description
2. `channel-strategy-agent` → Recommends channels & budget allocation
3. `messaging-agent` → Creates messaging strategy
4. `content-calendar-agent` → Builds 30-day content calendar

### 2. Authentication
**File:** `src/contexts/AuthContext.tsx`  
**Features:** Supabase Auth with email/password + Google OAuth  
**Tables:** `auth.users` (managed by Supabase), `profiles` (custom user data)

### 3. Campaign Management
**Key Files:**
- `src/pages/Campaigns.tsx` - Campaign list
- `src/pages/CampaignDetails.tsx` - Edit/view campaign
- `src/pages/CampaignCreation.tsx` - Manual campaign creation
- `src/pages/CopilotPage.tsx` - AI-powered campaign creation

### 4. Content Generation
**Files:** `src/components/content/`, `backend/agents/content_agent.py`  
**Features:** AI-generated blog posts, social posts, email campaigns

### 5. Lead Management
**Files:** `src/pages/Leads.tsx`, `backend/routes/leads.py`  
**Features:** Lead scoring, enrichment, activity tracking

### 6. Social Media
**Files:** `src/components/social/`, `backend/social_connectors/`  
**Integrations:** Twitter, Facebook, LinkedIn, Instagram (via OAuth)

## Database Schema

### Core Tables
```sql
-- Users & Auth
profiles (id, first_name, last_name, avatar_url, phone)
user_preferences (user_id, preference_category, preference_data)

-- Campaigns
campaigns (id, name, type, status, channels, budget, metrics, created_by)
campaign_groups (campaign_group_id, group_name, channels, total_budget)

-- Leads
leads (id, email, first_name, last_name, lead_score, status, enriched_data, created_by)
lead_activities (lead_id, activity_type, activity_data, occurred_at)

-- Content
generated_content (id, brief, content, seo_score, status, user_id)
social_posts (id, platform, content, scheduled_time, engagement_metrics)

-- Integrations
oauth_connections (user_id, platform_name, access_token_encrypted, connection_status)
integration_connections (user_id, service_name, connection_status, configuration)

-- Analytics
performance_analytics (metric_category, metric_name, metric_value, created_by)
user_analytics_events (user_id, event_type, event_data)
ai_insights (user_id, insight_type, title, description, recommendations)
```

### RLS Security
All tables use Row Level Security (RLS). Standard pattern:
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = created_by);
```

## API Architecture

### Supabase Edge Functions
**Location:** `supabase/functions/*/index.ts`  
**Auth:** Requires `Authorization: Bearer <supabase_anon_key>`  
**Common Pattern:**
```typescript
const { data: { user } } = await supabaseClient.auth.getUser(authHeader);
// Process request
return new Response(JSON.stringify(result), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

### FastAPI Backend
**Base URL:** `http://localhost:8000/api/`  
**Auth:** Bearer token from Supabase  
**Key Endpoints:**
- `/campaigns` - CRUD operations
- `/leads` - Lead management
- `/content/create` - Content generation
- `/social/posts` - Social media posting
- `/email/campaigns` - Email campaigns
- `/analytics/overview` - Analytics data

## AI Integration

### Current Setup
**Edge Functions:** Use OpenAI GPT-5 or Lovable AI (Google Gemini)  
**API Key Priority:**
1. If `LOVABLE_API_KEY` exists → Use `google/gemini-2.5-flash` via Lovable AI Gateway
2. Else → Use `gpt-5-2025-08-07` via OpenAI

**Example (audience-insight-agent):**
```typescript
const apiUrl = lovableApiKey 
  ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
  : 'https://api.openai.com/v1/chat/completions';
const model = lovableApiKey ? 'google/gemini-2.5-flash' : 'gpt-5-2025-08-07';
```

### AI Agent Pattern
```typescript
const prompt = `Analyze: ${businessDescription}
Return JSON: { "personas": [...], "reasoning": "..." }`;

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({
    model,
    messages: [
      { role: 'system', content: 'You are an expert...' },
      { role: 'user', content: prompt }
    ]
  })
});
```

## Design System

### Colors (HSL Semantic Tokens)
**Location:** `src/index.css`  
**Usage:** Always use semantic tokens, NEVER direct colors
```css
/* ❌ Wrong */
<div className="bg-white text-black">

/* ✅ Correct */
<div className="bg-background text-foreground">
```

**Key Tokens:**
- `--background`, `--foreground` - Base colors
- `--primary`, `--primary-foreground` - Primary actions
- `--secondary`, `--accent`, `--muted` - UI elements
- `--destructive` - Error/delete actions
- `--card`, `--popover` - Component backgrounds

### Component Variants
**Pattern:** Use `class-variance-authority` (CVA) for component variants  
**Example:** `src/components/ui/button.tsx`
```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "...", outline: "..." },
    size: { default: "...", sm: "...", lg: "..." }
  }
});
```

## Common Workflows

### Adding a New Feature
1. **Create component** in `src/components/[feature]/`
2. **Add route** in `src/App.tsx` or `src/components/AppRouter.tsx`
3. **Create page** in `src/pages/[Feature].tsx`
4. **Add API endpoint** (if needed) in `backend/routes/` or `supabase/functions/`
5. **Update types** in `src/types/`

### Creating a New Edge Function
```bash
supabase functions new my-function
# Edit supabase/functions/my-function/index.ts
supabase functions deploy my-function
```

### Adding Database Tables
```sql
-- Create migration
CREATE TABLE public.my_table (...);
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON public.my_table FOR SELECT USING (...);
```

### Calling Edge Functions from Frontend
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' }
});
```

## Environment Variables

### Required
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# AI (one of these)
OPENAI_API_KEY=sk-...
LOVABLE_API_KEY=...  # Auto-provided in Lovable Cloud

# Backend
SUPABASE_SERVICE_ROLE_KEY=...  # For edge functions
```

## Testing
```bash
npm run test          # Frontend tests (Vitest)
cd backend && pytest  # Backend tests
```

## Deployment

### Frontend (Lovable Hosting)
Click "Publish" in Lovable editor → Auto-deploys to `[project].lovableproject.com`

### Backend (Render/AWS/etc)
```bash
npm run build  # Creates dist/
# Deploy dist/ to static host
# Deploy backend/ to Python hosting (Render, Heroku, AWS)
```

### Edge Functions
```bash
supabase functions deploy --project-ref your-project-ref
```

## Debugging

### Frontend
- **Console Logs:** Check browser DevTools console
- **Network Requests:** DevTools Network tab
- **State:** React DevTools extension

### Edge Functions
```bash
supabase functions logs my-function --project-ref your-ref
```

### Database
```bash
supabase db inspect
```

## Common Issues

### "Generation Failed" Error
**Cause:** Edge function returning 500 (usually JSON parsing error)  
**Fix:** Check edge function logs, ensure AI returns valid JSON

### RLS Policy Errors
**Cause:** User trying to access data they don't own  
**Fix:** Verify RLS policies allow current user access

### "Multiple GoTrueClient instances"
**Cause:** Multiple Supabase client instances  
**Fix:** Already handled via singleton pattern in `src/integrations/supabase/client.ts`

## Key Design Patterns

### 1. Service Layer
**Pattern:** Separate API logic from components  
**Example:** `src/lib/api/` contains reusable API functions

### 2. Custom Hooks
**Pattern:** Extract stateful logic  
**Example:** `src/hooks/useCampaigns.ts`, `usePlatformDocumentation.ts`

### 3. Context for Global State
**Used For:** Auth, Onboarding, Content Ideas  
**Example:** `src/contexts/AuthContext.tsx`

### 4. Protected Routes
**Pattern:** Wrap routes requiring auth  
**Example:** `src/components/ProtectedRoute.tsx`

## Code Style

- **TypeScript:** Strict mode enabled
- **Naming:** camelCase for variables, PascalCase for components
- **Components:** Functional components with hooks
- **Styling:** Tailwind classes only (no inline styles)
- **Imports:** Absolute imports via `@/` alias

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **React Router:** https://reactrouter.com
- **FastAPI:** https://fastapi.tiangolo.com
- **Full Docs:** See `docs/` folder for detailed guides

---

**Last Updated:** 2025-01-28  
**Maintained By:** Development Team
