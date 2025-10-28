# AI Model Management System

## Overview

The AI Model Management System automatically discovers, tracks, and manages the latest AI models from OpenAI, Anthropic, Google, and Mistral. The system runs monthly to ensure the platform always uses the best and most current models.

**Last Updated:** 2025-10-28
**Status:** Active Development

---

## Architecture

### Components

1. **Database Layer** - PostgreSQL tables for model storage
2. **Discovery Cron** - Monthly Edge Function that queries AI providers
3. **Config API** - Edge Function that provides current model information
4. **Admin UI** - React component for monitoring and manual triggers
5. **Client Libraries** - Frontend/backend wrappers for easy access

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Monthly Cron Schedule                        │
│                    (1st of month, 3 AM UTC)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ai-model-updater Edge Function                      │
│  - Queries OpenAI /v1/models                                    │
│  - Queries Google Gemini /v1beta/models                         │
│  - Validates Anthropic models                                   │
│  - Queries Mistral /v1/models                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ai_model_configs Table                         │
│  - Inserts new models                                           │
│  - Marks deprecated models as inactive                          │
│  - Updates default flagship models                              │
│  - Logs to ai_model_update_logs                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ai-model-config Edge Function                       │
│  GET /ai-model-config?provider=openai&type=flagship             │
│  - Queries database for current models                          │
│  - 5-minute cache for performance                               │
│  - Fallback to hardcoded defaults                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Edge Functions & Backend Services                      │
│  - 18+ Edge Functions use dynamic config                        │
│  - Backend Python services query config API                     │
│  - All AI calls use latest flagship models                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table: `ai_model_configs`

Stores all discovered AI models with metadata.

```sql
CREATE TABLE ai_model_configs (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,  -- 'openai' | 'anthropic' | 'google' | 'mistral'
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,  -- 'flagship' | 'fast' | 'legacy'
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  max_tokens INTEGER,
  context_window INTEGER,
  discovered_at TIMESTAMP WITH TIME ZONE,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(provider, model_name)
);
```

**Key Fields:**
- `is_default` - Marks the current flagship model for each provider
- `is_active` - Whether model is currently available
- `capabilities` - Vision, function calling, JSON mode, reasoning
- `pricing` - Input/output cost per million tokens

### Table: `ai_model_update_logs`

Tracks monthly discovery runs.

```sql
CREATE TABLE ai_model_update_logs (
  id UUID PRIMARY KEY,
  run_date TIMESTAMP WITH TIME ZONE,
  models_discovered INTEGER,
  models_added INTEGER,
  models_deprecated INTEGER,
  providers_checked TEXT[],
  errors JSONB DEFAULT '[]',
  execution_time_ms INTEGER,
  status TEXT,  -- 'success' | 'partial' | 'failed'
  created_at TIMESTAMP WITH TIME ZONE
);
```

---

## Edge Functions

### 1. ai-model-updater

**Path:** `/supabase/functions/ai-model-updater/index.ts`
**Schedule:** `0 3 1 * *` (Monthly, 1st at 3 AM UTC)

**Functionality:**
- Queries each AI provider's models API
- Classifies models as flagship, fast, or legacy
- Inserts new models into database
- Marks deprecated models as inactive
- Updates default flagship models
- Logs execution results

**Model Classification Rules:**

**OpenAI:**
- `gpt-5` → flagship
- `gpt-5-mini`, `gpt-5-nano` → fast
- `gpt-4.1` series → legacy

**Anthropic:**
- `claude-opus-4.1` → flagship
- `claude-sonnet-4.5` → flagship
- `claude-haiku-4.5` → fast
- `claude-sonnet-4` → legacy

**Google:**
- `gemini-2.5-pro` → flagship
- `gemini-2.5-flash`, `gemini-2.5-flash-lite` → fast
- `gemini-2.0-*` → legacy

**Mistral:**
- `mistral-large-latest` → flagship
- `mistral-medium-latest` → fast

**Error Handling:**
- Continues on per-provider errors
- Logs errors to database
- Status: success / partial / failed

### 2. ai-model-config

**Path:** `/supabase/functions/ai-model-config/index.ts`
**Type:** HTTP API (no schedule)

**Endpoints:**

```typescript
// Get current flagship/fast model for a provider
GET /ai-model-config?provider=openai&type=flagship
Response: {
  success: true,
  model_name: "gpt-5",
  provider: "openai",
  model_type: "flagship",
  capabilities: { vision: true, function_calling: true },
  pricing: { input_per_mtok: 2.50, output_per_mtok: 10.00 },
  context_window: 128000
}

// Get all default models for all providers
GET /ai-model-config/providers
Response: {
  success: true,
  providers: {
    openai: {
      flagship: { model_name: "gpt-5", ... },
      fast: { model_name: "gpt-5-mini", ... }
    },
    anthropic: { ... },
    google: { ... },
    mistral: { ... }
  }
}

// Get update history logs
GET /ai-model-config/history?limit=10
Response: {
  success: true,
  logs: [...]
}

// Get all models (active and inactive)
GET /ai-model-config/all
Response: {
  success: true,
  models: [...],
  count: 18
}

// Validate a specific model
POST /ai-model-config/validate
Body: { provider: "openai", model_name: "gpt-5" }
Response: {
  success: true,
  valid: true
}
```

**Caching:**
- 5-minute in-memory cache per provider/type
- Reduces database queries
- Improves performance

**Fallback:**
- Returns hardcoded defaults if database query fails
- Ensures system continues working

---

## Admin UI

### Location

`/app/admin` → AI Models tab

### Features

1. **Model List**
   - View all discovered models
   - Filter by provider
   - See status (active/inactive/default)
   - View capabilities and pricing

2. **Manual Discovery**
   - "Discover Models" button
   - Triggers ai-model-updater immediately
   - Shows progress and results

3. **Update History**
   - View past discovery runs
   - See models added/deprecated
   - Check for errors

### Component

```typescript
import { AIModelManager } from '@/components/admin/AIModelManager';

// Usage in AdminDashboard
<TabsContent value="ai-models">
  <AIModelManager />
</TabsContent>
```

---

## Usage in Code

### Frontend (Edge Functions)

```typescript
// Before (hardcoded)
const model = 'gpt-5-mini';

// After (dynamic)
const { data } = await supabase.functions.invoke('ai-model-config', {
  body: { provider: 'openai', type: 'flagship' }
});
const model = data.model_name;  // 'gpt-5'
```

### Backend (Python)

```python
# Create ai_model_service.py wrapper
import os
import requests
from typing import Optional, Dict

class AIModelService:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes

    def get_model(self, provider: str, model_type: str = 'flagship') -> str:
        cache_key = f"{provider}:{model_type}"

        # Check cache
        if cache_key in self.cache:
            cached_at, model_name = self.cache[cache_key]
            if time.time() - cached_at < self.cache_ttl:
                return model_name

        # Query config API
        response = requests.get(
            f"{self.supabase_url}/functions/v1/ai-model-config",
            params={'provider': provider, 'type': model_type},
            headers={'Authorization': f'Bearer {self.service_key}'}
        )

        if response.ok:
            data = response.json()
            model_name = data.get('model_name')
            self.cache[cache_key] = (time.time(), model_name)
            return model_name

        # Fallback
        fallbacks = {
            'openai': {'flagship': 'gpt-5', 'fast': 'gpt-5-mini'},
            'anthropic': {'flagship': 'claude-sonnet-4-5', 'fast': 'claude-haiku-4-5'},
            'google': {'flagship': 'gemini-2.5-pro', 'fast': 'gemini-2.5-flash'},
            'mistral': {'flagship': 'mistral-large-latest', 'fast': 'mistral-medium-latest'}
        }
        return fallbacks.get(provider, {}).get(model_type, 'gpt-5')

# Usage
model_service = AIModelService()
model = model_service.get_model('openai', 'flagship')  # Returns 'gpt-5'
```

---

## Deployment

### 1. Apply Database Migration

```bash
# Copy migration SQL to Supabase SQL Editor
# File: supabase/migrations/20251028000000_ai_model_management.sql
# Run in Supabase Dashboard
```

### 2. Deploy Edge Functions

```bash
# Deploy ai-model-updater
supabase functions deploy ai-model-updater

# Deploy ai-model-config
supabase functions deploy ai-model-config

# Verify deployment
supabase functions list
```

### 3. Test Manual Discovery

```bash
# Trigger discovery manually
curl -X POST https://your-project.supabase.co/functions/v1/ai-model-updater \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Check results
curl https://your-project.supabase.co/functions/v1/ai-model-config/all \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 4. Verify Cron Schedule

Check that `ai-model-updater` appears in Supabase Edge Functions with cron schedule.

---

## Refactoring Existing Code

### Files to Update

**Edge Functions (18 files):**
1. `agent-executor/index.ts`
2. `chat-ai/index.ts`
3. `full-content-generator/index.ts`
4. `competitor-gap-agent/index.ts`
5. `ai-campaign-assistant/index.ts`
6. And 13 more...

**Backend Services:**
1. `backend/agents/social/multi_model_service.py`
2. `backend/routes/ai_video.py`

### Refactoring Pattern

**Step 1:** Add model config helper

```typescript
// Add to each Edge Function
async function getModel(provider: string, type: string = 'flagship'): Promise<string> {
  try {
    const { data } = await supabase.functions.invoke('ai-model-config', {
      body: { provider, type }
    });
    return data?.model_name || getFallbackModel(provider, type);
  } catch (error) {
    return getFallbackModel(provider, type);
  }
}

function getFallbackModel(provider: string, type: string): string {
  const fallbacks = {
    openai: { flagship: 'gpt-5', fast: 'gpt-5-mini' },
    // ... other providers
  };
  return fallbacks[provider]?.[type] || 'gpt-5';
}
```

**Step 2:** Replace hardcoded models

```typescript
// Before
const model = 'gpt-5-mini';

// After
const model = await getModel('openai', 'flagship');
```

**Step 3:** Test each function

---

## Monitoring

### Key Metrics

1. **Discovery Success Rate**
   - Target: 100% (all 4 providers checked)
   - Alert if < 75%

2. **Model Updates**
   - Track models_added per month
   - Alert on 0 additions for 3+ months

3. **API Latency**
   - Config API response time < 100ms
   - Discovery execution time < 60 seconds

4. **Errors**
   - Monitor error logs
   - Alert on repeated failures

### Logs Location

- Supabase Edge Functions logs
- `ai_model_update_logs` table
- Frontend console (admin UI)

---

## Troubleshooting

### Issue: Discovery returns 0 models

**Causes:**
- API keys not configured
- Provider API changed
- Network issues

**Solution:**
1. Check environment variables in Supabase
2. Test provider API manually
3. Review error logs in `ai_model_update_logs`

### Issue: Edge Functions still use old models

**Causes:**
- Code not refactored
- Deployment not updated
- Fallback being used

**Solution:**
1. Verify Edge Function code uses dynamic config
2. Redeploy Edge Functions
3. Check config API returns correct model

### Issue: Config API returns fallback

**Causes:**
- Database migration not applied
- No models in database
- RLS policy blocking access

**Solution:**
1. Run migration SQL
2. Trigger manual discovery
3. Check RLS policies allow service_role access

---

## Future Enhancements

### Phase 2 (Planned)

1. **Cost Optimization**
   - Track API usage by model
   - Suggest cost-saving alternatives
   - Budget alerts

2. **Performance Tracking**
   - Log response quality by model
   - A/B test models
   - Auto-switch based on performance

3. **Custom Model Selection**
   - Per-user model preferences
   - Task-specific model routing
   - Custom fallback chains

4. **Model Testing**
   - Automated validation on discovery
   - Performance benchmarks
   - Quality scoring

---

## API Reference

See inline code documentation for full API details:
- `/supabase/functions/ai-model-updater/index.ts`
- `/supabase/functions/ai-model-config/index.ts`
- `/src/types/ai-models.ts`

---

## Support

For issues or questions:
1. Check this documentation
2. Review logs in Admin UI
3. Check Supabase Edge Function logs
4. Create GitHub issue
