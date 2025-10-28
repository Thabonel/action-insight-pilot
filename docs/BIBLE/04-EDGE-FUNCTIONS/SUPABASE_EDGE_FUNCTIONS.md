# Supabase Edge Functions Documentation
## Action Insight Marketing Platform

**Last Updated:** 2025-10-28  
**Total Functions:** 34 Edge Functions  
**Cron Jobs:** 3 Scheduled Functions

---

## Table of Contents
1. [Shared Configuration](#shared-configuration)
2. [Cron Scheduled Functions](#cron-scheduled-functions)
3. [AI Agent Functions](#ai-agent-functions)
4. [Marketing Automation Functions](#marketing-automation-functions)
5. [AI Model Management Functions](#ai-model-management-functions)
6. [Chat & Conversation Functions](#chat--conversation-functions)
7. [Content Generation Functions](#content-generation-functions)
8. [Knowledge Management Functions](#knowledge-management-functions)
9. [OAuth & Social Integration Functions](#oauth--social-integration-functions)
10. [Utility Functions](#utility-functions)

---

## Shared Configuration

### CORS Headers
**File:** `/supabase/functions/_shared/cors.ts`

**Production CORS Configuration:**
- Origin: `https://wheels-wins-orchestrator.onrender.com,https://lovable.dev,https://app.lovable.dev`
- Methods: `POST, GET, OPTIONS, PUT, DELETE`
- Headers: `authorization, x-client-info, apikey, content-type`

**Development:** Allows all origins (`*`)

**Environment Detection:** Uses `Deno.env.get('DENO_DEPLOYMENT_ID')` to determine deployment environment.

### Cron Configuration
**File:** `/supabase/functions/_shared/cron.ts`

Three scheduled Edge Functions:

| Function | Schedule | Description |
|----------|----------|-------------|
| `autopilot-orchestrator` | `0 2 * * *` (Daily 2 AM UTC) | Daily campaign optimization and lead syncing |
| `autopilot-weekly-report` | `0 9 * * 1` (Monday 9 AM UTC) | Weekly performance report generation |
| `ai-model-updater` | `0 3 1 * *` (Monthly 3 AM UTC) | Discover and update latest AI models from all providers |

**Cron Format:** Standard Unix cron format (minute hour day month weekday)

---

## Cron Scheduled Functions

### autopilot-orchestrator
**Path:** `/supabase/functions/autopilot-orchestrator/`  
**Trigger:** `0 2 * * *` (Daily at 2 AM UTC)  
**Type:** HTTP (via Cron)

**Purpose:** Daily marketing automation orchestration

**Key Operations:**
1. Get all active autopilot configurations
2. For each user's autopilot:
   - Check if initial campaigns need creation
   - Optimize existing campaigns based on metrics
   - Sync new leads to autopilot inbox
   - Update last_optimized_at timestamp

**Database Queries:**
- SELECT from `marketing_autopilot_config` (is_active=true)
- SELECT from `campaigns` (created_by=user_id, auto_managed=true)
- SELECT from `campaign_metrics` (last 7 days)
- UPDATE `marketing_autopilot_config`
- INSERT/UPDATE `autopilot_activity_log`

**Database Mutations:**
- Create campaigns with `auto_managed=true`
- Create campaign_tasks for initial setup
- Update campaign budgets based on performance
- Sync leads to `autopilot_lead_inbox`
- Log activity via `log_autopilot_activity` RPC

**Campaign Creation Logic:**
- Creates one campaign per channel in AI strategy
- Budget split proportional to `channel.budgetPercentage`
- Duration: 30 days from execution date
- Initial tasks: setup targeting, create ad content, launch campaign

**Campaign Optimization Logic:**
- Conversion rate < 1% + spent > 50% of budget → reduce budget by 20%
- Conversion rate > 3% + spent < 70% of budget → increase budget by 20% (max +$500)
- Engagement < 2% → triggers video ad generation (if budget allows)

**Video Ad Generation:**
- Only for video-friendly channels: LinkedIn, Facebook, TikTok, YouTube, Instagram
- Rate limit: Max 5 videos per campaign per week
- Cost estimate: $3.20 per 8-second video
- Calls backend endpoint: `/ai-video/autopilot-generate`

**External API Calls:**
- Calls backend `$BACKEND_URL/ai-video/autopilot-generate` (async video generation)

**Authentication:** Service Role (Supabase)

**Error Handling:**
- Try/catch per user autopilot processing
- Errors logged but don't stop other users from processing
- Returns array of results with success/error per user

---

### autopilot-weekly-report
**Path:** `/supabase/functions/autopilot-weekly-report/`  
**Trigger:** `0 9 * * 1` (Weekly, Monday at 9 AM UTC)  
**Type:** HTTP (via Cron)

**Purpose:** Generate weekly performance reports for autopilot users

**Key Operations:**
1. Get all active autopilot configurations
2. For each user, calculate:
   - Leads generated this week
   - Total spend and conversions
   - ROI calculation
   - Top performing channel
   - Activity summary (last 10 activities)
3. Generate AI insights and recommendations
4. Save report to database

**Database Queries:**
- SELECT from `marketing_autopilot_config` (is_active=true)
- SELECT from `autopilot_lead_inbox` (week_start to week_end)
- SELECT from `campaign_metrics` (week_start to week_end)
- SELECT from `campaigns` (created_by=user_id, auto_managed=true)
- SELECT from `autopilot_activity_log` (week_start to week_end)

**Database Mutations:**
- INSERT into `autopilot_weekly_reports`

**Report Structure:**
```json
{
  "total_leads_generated": number,
  "total_spend": number,
  "roi": number,
  "top_performing_channel": string,
  "ai_insights": {
    "trend": "Growing|Starting up",
    "recommendation": string,
    "top_activities": string[]
  }
}
```

**AI Insights Logic:**
- No leads → "Your autopilot is setting up campaigns. Leads should start coming in within 48 hours."
- < 10 leads → "Early stage - AI is optimizing targeting to improve lead flow."
- >= 10 leads → "Campaigns are performing well. AI is continuously optimizing for better results."

**Authentication:** Service Role (Supabase)

**Error Handling:**
- Individual user report failures don't block other reports
- Logs to console for monitoring

**TODOs:** Email report integration not yet implemented

---

### ai-model-updater
**Path:** `/supabase/functions/ai-model-updater/`  
**Trigger:** `0 3 1 * *` (Monthly, 1st at 3 AM UTC)  
**Type:** HTTP (via Cron)

**Purpose:** Discover available AI models from all providers and update database

**Key Operations:**
1. Call each AI provider's model list API
2. Categorize models (flagship, fast, legacy)
3. Store new models in database
4. Mark deprecated models as inactive
5. Log discovery process

**Supported Providers:**
- OpenAI
- Anthropic (Claude)
- Google (Gemini)
- Mistral

**External API Calls:**
- OpenAI: `GET https://api.openai.com/v1/models`
- Anthropic: `POST https://api.anthropic.com/v1/messages` (validation call)
- Google Gemini: `GET https://generativelanguage.googleapis.com/v1beta/models`
- Mistral: `GET https://api.mistral.ai/v1/models`

**Database Queries:**
- SELECT from `ai_model_configs` (check for existing models)
- SELECT from `ai_model_configs` (find all active models per provider)

**Database Mutations:**
- INSERT into `ai_model_configs` (new models)
- UPDATE `ai_model_configs` (existing models, validate/deprecate)
- INSERT into `ai_model_update_logs` (discovery results)

**Model Categorization:**
**OpenAI:**
- gpt-5* → flagship (gpt-5-mini → fast)
- o3/o4 reasoning models → flagship or fast
- gpt-4.1 → legacy

**Anthropic:**
- claude-sonnet-4-5 → flagship
- claude-opus-4-1 → flagship
- claude-haiku-4-5 → fast
- claude-sonnet-4 → legacy

**Google:**
- gemini-2.5-pro → flagship
- gemini-2.5-flash → fast
- gemini-2.0* → legacy

**Mistral:**
- *large* → flagship
- *medium* → fast

**Model Data Stored:**
```json
{
  "provider": string,
  "model_name": string,
  "model_type": "flagship|fast|legacy",
  "capabilities": {
    "vision": boolean,
    "function_calling": boolean,
    "json_mode": boolean,
    "reasoning": boolean
  },
  "context_window": number,
  "pricing": { "input_per_mtok": number, "output_per_mtok": number },
  "metadata": Record<string, any>
}
```

**Response:** 
```json
{
  "success": boolean,
  "models_discovered": number,
  "models_added": number,
  "models_deprecated": number,
  "providers_checked": string[],
  "errors": any[],
  "execution_time_ms": number
}
```

**Authentication:** Service Role (Supabase)

**Error Handling:**
- Per-provider try/catch blocks
- Errors don't block other providers
- Logging to ai_model_update_logs table

---

## AI Agent Functions

### brand-positioning-agent
**Path:** `/supabase/functions/brand-positioning-agent/`  
**Trigger:** HTTP POST (user-invoked)  
**Authentication:** Requires userId and validation

**Purpose:** Generate brand positioning analysis using 3Cs framework

**Input Schema:**
```typescript
{
  companyMission: string (required),
  productOffer: string (required),
  targetAudience: string (required),
  competitors: string (required),
  coreCapabilities?: string,
  customerNeeds?: string,
  customerPainPoints?: string,
  marketPosition?: string,
  competitiveAdvantages?: string,
  userId: string (UUID, required)
}
```

**AI Model:** `gpt-5-mini` (OpenAI)

**Prompt Strategy:**
- System: Expert brand strategist
- Output: JSON format only
- Temperature: 0.7
- Max tokens: 2000

**Output Structure:**
```json
{
  "positioningStatement": "We help [target] achieve [benefit] through [unique approach]...",
  "differentiators": [
    {
      "title": string,
      "description": string,
      "evidence": string
    }
  ],
  "brandTone": {
    "personality": string[],
    "voiceCharacteristics": string,
    "styleGuidelines": string
  },
  "recommendations": string[],
  "threeCs": {
    "company": {
      "strengths": string[],
      "uniqueCapabilities": string
    },
    "customer": {
      "primaryNeed": string,
      "emotionalDrivers": string[],
      "decisionCriteria": string
    },
    "competition": {
      "mainCompetitors": string[],
      "theirWeaknesses": string[],
      "ourAdvantage": string
    }
  }
}
```

**Database Mutations:**
- INSERT into `brand_positioning_analyses`

**CORS:** Enabled

**Error Handling:**
- Returns 400 on validation error
- Returns 500 on AI API error
- Full error logged server-side, generic error to client

---

### funnel-design-agent
**Path:** `/supabase/functions/funnel-design-agent/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Design complete marketing funnels with automation opportunities

**Input Schema:**
```typescript
{
  businessType: string (required),
  productOffer: string (required),
  averageOrderValue?: number,
  customerLifetimeValue?: number,
  currentMarketingCapabilities?: string,
  userId: string (UUID, required)
}
```

**AI Model:** `gpt-5-mini` (OpenAI)

**Funnel Stages:** Awareness → Engagement → Conversion → Retention

**Output Structure:**
```json
{
  "funnelOverview": {
    "totalEstimatedConversionRate": string,
    "averageTimeToConvert": string,
    "recommendedBudgetSplit": {
      "awareness": number,
      "engagement": number,
      "conversion": number,
      "retention": number
    }
  },
  "stages": {
    "awareness": {
      "goal": string,
      "offers": [
        {
          "type": string,
          "name": string,
          "description": string,
          "deliveryMethod": string
        }
      ],
      "automation": {
        "task": string,
        "implementation": string,
        "tools": string[]
      },
      "metrics": string[],
      "transitionTriggers": string[],
      "touchpoints": string[]
    },
    "engagement": {...},
    "conversion": {...},
    "retention": {...}
  },
  "integrationStrategy": string,
  "quickWins": string[],
  "longTermOptimizations": string[]
}
```

**Database Mutations:**
- INSERT into `funnel_designs`

**Prompt Requirements:**
- Per-stage offer, automation, metrics, triggers, touchpoints
- Budget split recommendations
- Integration strategy
- Quick wins and long-term strategies

---

### competitor-gap-agent
**Path:** `/supabase/functions/competitor-gap-agent/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Analyze competitive gaps and identify ownable differentiators

**Input Schema:**
```typescript
{
  ourBrand: string (required),
  ourOffering: string (required),
  competitor1: string (required),
  competitor2: string (required),
  competitor3: string (required),
  ourStrengths?: string,
  userId: string (UUID, required)
}
```

**AI Model:** `gpt-5-mini` (OpenAI)

**Gap Analysis Categories:**
1. Messaging Gaps
2. Channel Gaps
3. Audience Gaps
4. Content Gaps
5. Experience Gaps

**Output Structure:**
```json
{
  "competitiveOverview": {
    "marketDynamics": string,
    "competitorStrengths": string[],
    "competitorWeaknesses": string[]
  },
  "gapAnalysis": {
    "messaging": {
      "competitorApproach": string,
      "missedOpportunities": string[],
      "recommendation": string
    },
    "channels": {...},
    "audience": {...},
    "content": {...},
    "experience": {...}
  },
  "ownableDifferentiator": {
    "title": string,
    "description": string,
    "whyDefensible": string,
    "activationStrategy": string[],
    "expectedImpact": string,
    "timeline": string,
    "resources": string[]
  },
  "quickWins": string[],
  "avoidTraps": string[]
}
```

**Database Mutations:**
- INSERT into `competitive_gap_analyses`

---

### performance-tracker-agent
**Path:** `/supabase/functions/performance-tracker-agent/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Create KPI tracking frameworks for non-marketers

**Input Schema:**
```typescript
{
  campaignName: string (required),
  campaignGoals: string (required),
  channels: string[] (required),
  budget?: number,
  businessStage?: string,
  userId: string (UUID, required)
}
```

**AI Model:** `gpt-5-mini` (OpenAI, temperature: 0.6)

**Output Structure:**
```json
{
  "primaryKPIs": [
    {
      "metric": string,
      "whatToTrack": string,
      "whyItMatters": string,
      "successBenchmark": string,
      "howToMeasure": string,
      "redFlag": string,
      "currentIndustryAverage": string
    }
  ],
  "secondaryKPIs": {
    "leadingIndicators": [{"metric": string, "predictiveValue": string}],
    "healthMetrics": string[],
    "efficiencyMetrics": [{"metric": string, "target": string}]
  },
  "channelMetrics": {
    "channelName": {
      "primaryMetric": string,
      "baseline": string,
      "target": string,
      "optimizationTips": string[]
    }
  },
  "automation": {
    "dataCollection": [...],
    "reporting": {
      "frequency": string,
      "recipients": string[],
      "format": string,
      "keyInsights": string[]
    },
    "alerts": [{"condition": string, "action": string, "priority": string}]
  },
  "dashboardStructure": {
    "topRow": string[],
    "secondRow": string[],
    "trends": string[],
    "drillDowns": string[]
  },
  "actionTriggers": [{"if": string, "then": string, "owner": string}],
  "simplifiedForNonMarketers": {
    "dailyCheckIn": string,
    "weeklyReview": string,
    "monthlyDeepDive": string,
    "explanations": Record<string, string>
  }
}
```

**Database Mutations:**
- INSERT into `performance_tracking_frameworks`

---

### channel-strategy-agent
**Path:** `/supabase/functions/channel-strategy-agent/`  
**Trigger:** HTTP POST (user-invoked via Campaign Copilot)

**Purpose:** Generate optimal channel mix and budget allocation

**Input Schema:**
```typescript
{
  brief: Record<string, unknown> (required),
  personas?: Array<Record<string, unknown>>,
  userId: string (UUID, required),
  sessionId: string (UUID, required)
}
```

**AI Model:** `gpt-5-2025-08-07` (OpenAI)

**Learns From:**
- User's historical channel preferences (ai_interaction_feedback)
- Proven channel patterns (agent_learning_data)

**Output Structure:**
```json
{
  "channelMix": [
    {
      "channel": string,
      "budgetPercentage": number,
      "rationale": string,
      "targetPersonas": string[],
      "tactics": string[],
      "timing": Record<string, any>,
      "expectedROI": string,
      "kpis": string[],
      "implementation": Record<string, any>
    }
  ],
  "budgetBreakdown": {
    "paid": number,
    "organic": number,
    "content": number
  },
  "integration": {
    "crossChannelOpportunities": string[],
    "sequencing": string[],
    "retargeting": Record<string, any>
  },
  "timeline": {
    "phase1": string[],
    "phase2": string[],
    "phase3": string[]
  },
  "riskFactors": string[],
  "contingencyPlans": string[],
  "confidence": number,
  "reasoning": string
}
```

**Database Mutations:**
- UPDATE `campaign_copilot_sessions` (generated_campaign, interaction_history)
- UPDATE `agent_learning_data` (usage_count, success_rate if patterns exist)

---

### audience-insight-agent
**Path:** `/supabase/functions/audience-insight-agent/`  
**Trigger:** HTTP POST (user-invoked via Campaign Copilot)

**Purpose:** Generate detailed customer personas and audience segments

**Input Schema:**
```typescript
{
  brief: Record<string, unknown> (required),
  userId: string (UUID, required),
  sessionId: string (UUID, required)
}
```

**AI Models:** 
- Primary: `gpt-5-2025-08-07` (OpenAI)
- Fallback: `google/gemini-2.5-flash` (Lovable AI Gateway)

**Persona Structure:**
```json
{
  "id": string,
  "name": string,
  "description": string,
  "demographics": Record<string, any>,
  "psychographics": Record<string, any>,
  "painPoints": string[],
  "motivations": string[],
  "channels": string[],
  "contentPreferences": string[],
  "buyingBehavior": Record<string, any>,
  "messagingAngles": string[],
  "audienceSize": "Small|Medium|Large"
}
```

**Output Structure:**
```json
{
  "personas": Persona[],
  "insights": {
    "primaryAudience": string,
    "channelRecommendations": string[],
    "behavioralInsights": string[],
    "targetingParameters": Record<string, any>
  },
  "confidence": number,
  "reasoning": string
}
```

**Learning Integration:**
- Reads previous user feedback (ai_interaction_feedback)
- Reads learned patterns (agent_learning_data)
- Updates session with generated insights
- Updates pattern usage counts

**Database Mutations:**
- UPDATE `campaign_copilot_sessions`
- UPDATE `agent_learning_data` (if patterns exist)

---

### messaging-agent
**Path:** `/supabase/functions/messaging-agent/`  
**Trigger:** HTTP POST (user-invoked via Campaign Copilot)

**Purpose:** Create messaging pillars and value propositions

**Input Schema:**
```typescript
{
  brief: Record<string, unknown> (required),
  personas: Record<string, unknown>[] (required),
  channelStrategy: Record<string, unknown> (required),
  userId: string (UUID, required),
  sessionId: string (UUID, required)
}
```

**AI Model:** `gpt-5-2025-08-07` (OpenAI)

**Output Structure:**
```json
{
  "messagingPillars": [
    {
      "id": string,
      "title": string,
      "description": string,
      "targetPersonas": string[],
      "emotionalAppeal": string,
      "rationalAppeal": string,
      "proofPoints": string[],
      "channels": string[],
      "variations": Record<string, string>
    }
  ],
  "valuePropositions": {
    "primary": string,
    "secondary": string[],
    "personaSpecific": Record<string, string>
  },
  "toneAndVoice": {
    "personality": string[],
    "doAndDont": Record<string, string>,
    "vocabulary": string[],
    "examples": string[]
  },
  "callsToAction": {
    "primary": string,
    "variations": string[],
    "channelSpecific": Record<string, string>
  },
  "competitiveDifferentiation": {
    "uniqueAngles": string[],
    "positioning": string,
    "advantages": string[]
  },
  "testing": {
    "messagingTests": string[],
    "variants": string[],
    "metrics": string[]
  },
  "confidence": number,
  "reasoning": string
}
```

**Database Mutations:**
- UPDATE `campaign_copilot_sessions`
- UPDATE `agent_learning_data`

---

### content-calendar-agent
**Path:** `/supabase/functions/content-calendar-agent/`  
**Trigger:** HTTP POST (user-invoked via Campaign Copilot)

**Purpose:** Generate 30-day content calendar with channel distribution

**Input Schema:**
```typescript
{
  brief: Record<string, unknown> (required),
  personas: Record<string, unknown>[] (required),
  channelStrategy: Record<string, unknown> (required),
  messagingStrategy: Record<string, unknown> (required),
  userId: string (UUID, required),
  sessionId: string (UUID, required)
}
```

**AI Model:** `gpt-5-mini` (OpenAI)

**Content Type Distribution:**
- Educational: 40%
- Promotional: 30%
- Entertaining: 20%
- User Generated: 10%

**Daily Content Structure:**
```json
{
  "date": "YYYY-MM-DD",
  "content": [
    {
      "id": string,
      "channel": string,
      "platform": string,
      "contentType": string,
      "title": string,
      "description": string,
      "messagingPillar": string,
      "targetPersona": string,
      "optimalTime": string,
      "format": string,
      "callToAction": string,
      "tags": string[],
      "expectedEngagement": string,
      "resourcesNeeded": string[]
    }
  ]
}
```

**Database Mutations:**
- UPDATE `campaign_copilot_sessions` (sets status to 'completed')

**Campaign Completion:** This function marks the Campaign Copilot session as 'completed'

---

### agent-executor
**Path:** `/supabase/functions/agent-executor/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Route and execute tasks for various agent types

**Supported Agents:**
- content_creator
- campaign_manager
- lead_generator
- social_media_manager

**Task Types:**
- Content: create_email_content
- Campaign: generate_ab_variants, suggest_send_time
- Lead: score_leads, analyze_performance
- Social: create_social_post

**AI Models:**
- Primary: OpenAI (gpt-5-mini)
- Fallback: Claude (claude-sonnet-4.5)

**Authentication:** Bearer token required

**Error Handling:** Returns generic error to client, detailed error logging server-side

---

## Marketing Automation Functions

### gtm-planner
**Path:** `/supabase/functions/gtm-planner/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Generate comprehensive Go-to-Market strategy documents

**Input Schema:**
```typescript
{
  productName: string (required),
  productCategory: string (required),
  productSubCategory: string (required),
  targetLaunchDate: string (required),
  primaryMarkets: string[] (required),
  coreValueProposition: string (required),
  budgetCeiling: number (required),
  userId: string (required),
  sessionId?: string
}
```

**AI Models:**
- Primary: `gpt-5` (OpenAI)
- Fallback: `llama-3.1-sonar-large-128k-online` (Perplexity, real-time data)

**Market Research Process:**
1. Parallel queries for: market size, competitors, trends, pricing
2. Uses Perplexity API if available (real-time data)
3. Falls back to OpenAI with general knowledge

**Output:** Markdown document with sections:
- Executive Summary
- Product Definition & Market Research
- Market Sizing Analysis (TAM/SAM/SOM)
- Customer Acquisition Strategy
- Pricing Strategy Development
- Launch Timeline & Execution Plan
- Implementation Checklist

**Database Mutations:**
- INSERT into `gtm_strategies`

---

## AI Model Management Functions

### ai-model-config
**Path:** `/supabase/functions/ai-model-config/`  
**Trigger:** HTTP GET/POST (on-demand)

**Purpose:** Query AI model configurations and validate models

**Endpoints:**

**1. GET /ai-model-config (Get default model)**
Parameters:
- `provider` (required): openai, anthropic, google, mistral
- `type` (optional): flagship, fast, legacy (default: flagship)

Response: Single model config or fallback

**2. GET /providers (Get all providers)**
Response: All active default models grouped by provider

**3. GET /history (Get update logs)**
Parameters:
- `limit` (optional): default 10

Response: Recent ai_model_update_logs

**4. GET /all (Get all models)**
Response: All models in database

**5. POST /validate (Validate model)**
Body: `{ provider: string, model_name: string }`

Response: `{ valid: boolean, error?: string }`

**Caching:**
- 5-minute TTL on model lookups
- In-memory cache with expiration

**Fallback Models** (hardcoded for reliability):
```json
{
  "openai": { "flagship": "gpt-5", "fast": "gpt-5-mini" },
  "anthropic": { "flagship": "claude-sonnet-4-5", "fast": "claude-haiku-4-5" },
  "google": { "flagship": "gemini-2.5-pro", "fast": "gemini-2.5-flash" },
  "mistral": { "flagship": "mistral-large-latest", "fast": "mistral-medium-latest" }
}
```

**Database Queries:**
- SELECT from `ai_model_configs`
- SELECT from `ai_model_update_logs`

---

### ai-model-updater
See [Cron Scheduled Functions](#cron-scheduled-functions) section above.

---

## Chat & Conversation Functions

### chat-ai
**Path:** `/supabase/functions/chat-ai/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Chat with context-aware marketing assistant using knowledge base

**Input Schema:**
```typescript
{
  message: string (required),
  conversationId: string (UUID, required),
  context?: {
    userId?: string
  }
}
```

**Process Flow:**
1. Retrieve conversation history (last 20 messages)
2. Estimate token count of history
3. If > 1500 tokens, summarize using AI
4. Generate embedding for combined history + message
5. Search knowledge base using semantic similarity (threshold: 0.7, limit: 5)
6. Call OpenAI with conversation + knowledge context
7. Save both user and assistant messages with embeddings
8. Log knowledge chunk references

**AI Models:**
- Chat: `gpt-5-2025-08-07` (OpenAI)
- Embedding: `text-embedding-ada-002` (OpenAI)
- Summarization: `gpt-5-mini-2025-08-07` (OpenAI, for history)

**Database Queries:**
- SELECT from `conversation_messages`
- RPC `search_knowledge_chunks`

**Database Mutations:**
- INSERT into `conversation_messages` (user + assistant)
- INSERT into `conversation_knowledge_refs`

---

### chat-memory
**Path:** `/supabase/functions/chat-memory/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Store and retrieve conversation history with embeddings

**Input Schema:**
```typescript
{
  conversationId: string (UUID, required),
  role?: string (optional: 'user' | 'assistant'),
  content?: string (optional, required if role is provided),
  limit?: number (optional, default: 20)
}
```

**Process:**
1. If role & content provided: generate embedding and save message
2. Retrieve conversation messages (limited by parameter, reverse chronological)

**Database Mutations:**
- INSERT into `conversation_messages` (with embedding)

**Database Queries:**
- SELECT from `conversation_messages`

---

### dashboard-chat
**Path:** `/supabase/functions/dashboard-chat/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Quick AI responses via Lovable AI Gateway

**Input Schema:**
```typescript
{
  query: string (required),
  context?: Record<string, unknown>
}
```

**AI Model:** `google/gemini-2.5-flash` (Lovable AI Gateway)

**Endpoint:** `https://ai.gateway.lovable.dev/v1/chat/completions`

**Authentication:** LOVABLE_API_KEY

**Error Handling:**
- 429: Rate limit → "Rate limit exceeded. Please try again in a moment."
- 402: Insufficient credits → "AI credits exhausted. Please add credits to continue."
- Other: "AI service temporarily unavailable"

**Response:**
```json
{
  "message": string (AI response),
  "success": boolean
}
```

---

## Content Generation Functions

### full-content-generator
**Path:** `/supabase/functions/full-content-generator/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Generate complete content pieces (blog, ads, emails)

**Input Schema:**
```typescript
{
  campaignId: string (UUID, required),
  contentType: string ('blog_post' | 'ad_copy' | 'email' | custom, required),
  brief: Record<string, any>,
  messagingStrategy: Record<string, any>,
  targetPersona: Record<string, any>
}
```

**Supported Content Types:**

1. **blog_post** (1500-2000 words)
   ```json
   {
     "title": "SEO headline",
     "content": "Full markdown blog post",
     "metaDescription": "150-char meta",
     "cta": "Call-to-action",
     "tags": ["keyword1", "keyword2"]
   }
   ```

2. **ad_copy** (multi-platform)
   ```json
   {
     "title": "Campaign name",
     "content": {
       "facebook": {
         "primaryText": string,
         "headline": string,
         "description": string
       },
       "google": {
         "headlines": string[],
         "descriptions": string[]
       },
       "linkedin": {
         "headline": string,
         "introText": string,
         "cta": string
       }
     },
     "cta": string
   }
   ```

3. **email** (3-email sequence)
   ```json
   {
     "title": "Campaign name",
     "content": {
       "email1": { "subject": string, "preheader": string, "body": string, "cta": string },
       "email2": {...},
       "email3": {...}
     },
     "cta": string
   }
   ```

**AI Model:** `gpt-5` (OpenAI)

**Database Mutations:**
- INSERT into `generated_content_pieces`

**Metadata Stored:**
- Word count
- Estimated read time
- Tone
- Call-to-action
- Target persona
- Messaging pillar

---

## Knowledge Management Functions

### knowledge-processor
**Path:** `/supabase/functions/knowledge-processor/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Process and manage knowledge base documents

**Supported Actions:**

1. **create_bucket**
   - Creates knowledge buckets (personal, campaign-specific, shared)

2. **upload_document**
   - Upload text/file content
   - Returns immediately (background processing starts)
   - Status: 'processing' → 'ready' or 'failed'

3. **process_document**
   - Reprocess existing document
   - Deletes old chunks and regenerates

4. **search_knowledge**
   - Semantic search using embeddings
   - Threshold: 0.7 similarity
   - Returns chunks with similarity scores

5. **get_buckets**
   - List user's knowledge buckets with document counts

6. **get_documents**
   - List documents in specific bucket

**Processing Pipeline:**

For each uploaded document:
1. Split into chunks (1000 chars, 200 overlap)
2. Generate embedding for each chunk
3. Calculate content hash
4. Generate document summary
5. Insert chunks into database
6. Update document status

**Document Chunking:**
- Chunk size: 1000 characters
- Overlap: 200 characters
- Sentence-based boundaries (split on . ! ?)

**Embeddings:** `text-embedding-ada-002` (OpenAI)

**Summarization:** `gpt-4.1-mini` (OpenAI)

**Database Structures:**
- `knowledge_buckets`: Organized collections
- `knowledge_documents`: Individual documents
- `knowledge_chunks`: Searchable segments with embeddings
- `knowledge_access_logs`: Usage tracking

**Database Mutations:**
- INSERT/UPDATE `knowledge_buckets`
- INSERT `knowledge_documents`
- INSERT `knowledge_chunks`
- INSERT `knowledge_access_logs`

---

### ai-autocomplete
**Path:** `/supabase/functions/ai-autocomplete/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Smart field suggestions based on user history and patterns

**Input Schema:**
```typescript
{
  field: string (campaign field name, required),
  currentValue: string (partial input, required),
  context: Record<string, any> (campaign context, optional),
  userId: string (UUID, required)
}
```

**Supported Fields:**
- name/campaignName
- description/campaignDescription
- targetAudience/audience
- objectives/goals
- budget
- channels

**Suggestion Strategy:**
- Extract historical values for field
- Get learned success patterns
- Filter by current input
- Return top 5 matches

**Historical Data Sources:**
- Recent campaigns (10 most recent)
- Successful interactions (5 most recent approvals)
- Learned patterns (top 5 by success rate)

**Database Queries:**
- SELECT from `campaigns` (user's recent campaigns)
- SELECT from `agent_learning_data` (success patterns)
- SELECT from `ai_interaction_feedback` (approvals)

---

### ai-feedback-loop
**Path:** `/supabase/functions/ai-feedback-loop/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Record and learn from user feedback on AI suggestions

**Input Schema:**
```typescript
{
  userId: string (UUID, required),
  sessionId?: string,
  interactionType: 'approve' | 'edit' | 'regenerate' | 'reject' (required),
  originalSuggestion: Record<string, any> (required),
  userModification?: Record<string, any> (if edited),
  contextData?: Record<string, any>,
  feedbackScore?: number (1-5)
}
```

**Learning Logic:**

Confidence Score Adjustment:
- approve: +0.10
- edit: +(feedbackScore - 3) * 0.05
- regenerate: -0.15
- reject: -0.20

Success Rate Update:
- Success if: approve OR feedbackScore >= 4
- Recalculated as: (current_success * count + new_success) / (count + 1)

**Agent Type Detection:**
- 'audience' for audience/personas context
- 'channel' for channels context
- 'messaging' for messaging context
- 'content' for content context

**Database Mutations:**
- INSERT into `ai_interaction_feedback`
- INSERT/UPDATE `agent_learning_data`
- UPDATE `campaign_copilot_sessions`

---

## OAuth & Social Integration Functions

### oauth-initiate / oauth-callback
**Path:** `/supabase/functions/oauth-initiate/` and `/supabase/functions/oauth-callback/`  
**Trigger:** HTTP (user-initiated OAuth flow)

**Purpose:** Initiate and handle OAuth authentication for Supabase auth providers

### social-oauth-initiate / social-oauth-callback
**Path:** `/supabase/functions/social-oauth-initiate/` and `/supabase/functions/social-oauth-callback/`  
**Trigger:** HTTP (user-initiated social platform OAuth)

**Purpose:** Handle OAuth for social platforms (Facebook, Twitter, LinkedIn, Instagram)

**Supported Platforms:**
- Facebook
- Twitter/X
- LinkedIn
- Instagram

**Process:**
1. Generate state token
2. Redirect to platform OAuth endpoint
3. Handle callback with authorization code
4. Exchange for access token
5. Store encrypted token in `oauth_connections` table

**Database Structure:**
```json
{
  "user_id": UUID,
  "platform_name": string,
  "platform_user_id": string,
  "access_token_encrypted": string (base64 encrypted),
  "refresh_token_encrypted": string,
  "connection_status": "connected|disconnected",
  "scope": string[],
  "expires_at": timestamp
}
```

---

### social-post
**Path:** `/supabase/functions/social-post/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Publish content to multiple social platforms

**Input Schema:**
```typescript
{
  platforms: string[] ('facebook' | 'twitter' | 'linkedin' | 'instagram'),
  content: {
    text?: string,
    image?: string (URL),
    video?: string (URL),
    url?: string
  }
}
```

**Authentication:** Bearer token required

**Platform-Specific Implementations:**

**Facebook:**
- Endpoint: `https://graph.facebook.com/v18.0/{pageId}/posts`
- Posts message with optional image URL

**Twitter:**
- Endpoint: `https://api.twitter.com/2/tweets`
- Posts text content

**LinkedIn:**
- Endpoint: `https://api.linkedin.com/v2/ugcPosts`
- Posts with specific visibility = PUBLIC
- Requires personUrn (urn:li:person:{id})

**Instagram:**
- Endpoint: `https://graph.facebook.com/v18.0/{igUserId}/media`
- Two-step: create container, then publish
- Requires image
- Caption from text field

**Response:**
```json
{
  "results": [
    {
      "platform": string,
      "success": boolean,
      "data": Record<string, any>,
      "error": string (if failed)
    }
  ]
}
```

**Database Queries:**
- SELECT from `oauth_connections`

**Error Handling:**
- Per-platform error handling
- Returns all results (partial success allowed)
- Detailed error messages included

---

### social-connections
**Path:** `/supabase/functions/social-connections/`  
**Trigger:** HTTP GET/POST (on-demand)

**Purpose:** Manage user's social media connections

---

## Utility Functions

### manage-user-secrets
**Path:** `/supabase/functions/manage-user-secrets/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Securely manage encrypted API keys and credentials

**Authentication:** Bearer token required

**Supported Actions:**

1. **save**
   - Encrypt and store secret
   - Parameters: serviceName, value
   - Uses AES-GCM encryption

2. **list**
   - List active secrets (metadata only)
   - Returns: service_name, created_at, updated_at, last_used_at, is_active

3. **get**
   - Decrypt and retrieve specific secret
   - Parameters: serviceName
   - Updates last_used_at timestamp

4. **delete**
   - Mark secret as inactive (soft delete)
   - Parameters: serviceName

**Encryption:**
- Algorithm: AES-GCM
- Key: 32 bytes (64 hex chars from SECRET_MASTER_KEY environment variable)
- IV: 12 bytes (random per encryption)
- Encoding: Base64

**Database Structure:**
```json
{
  "user_id": UUID,
  "service_name": string (unique per user),
  "encrypted_value": string (base64),
  "initialization_vector": string (base64),
  "is_active": boolean,
  "created_at": timestamp,
  "updated_at": timestamp,
  "last_used_at": timestamp
}
```

**Audit Logging:**
```json
{
  "user_id": UUID,
  "service_name": string,
  "operation": "create|read|delete",
  "success": boolean,
  "error_message": string,
  "ip_address": string,
  "user_agent": string
}
```

**Database Mutations:**
- UPSERT into `user_secrets`
- INSERT into `secret_audit_logs`

---

### performance-optimizer
**Path:** `/supabase/functions/performance-optimizer/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** AI-powered campaign performance analysis and recommendations

**Input Schema:**
```typescript
{
  campaignId: string (UUID, required)
}
```

**Analysis Process:**
1. Get campaign details
2. Retrieve recent metrics (30 days)
3. Get benchmarks from similar campaigns
4. Call AI for performance analysis
5. Generate optimization suggestions
6. Save analysis to database

**Database Queries:**
- SELECT from `campaigns`
- SELECT from `campaign_metrics` (last 30 days)
- SELECT from `campaigns` (similar type, for benchmarks)

**Database Mutations:**
- INSERT into `campaign_performance_monitor`

**AI Analysis Output:**
```json
{
  "overallPerformance": "excellent|good|average|poor",
  "performanceScore": 0-100,
  "channelPerformance": {
    "bestPerforming": string,
    "underperforming": string[],
    "recommendations": string[]
  },
  "trends": {
    "direction": "improving|declining|stable",
    "insights": string[]
  },
  "alertLevel": "none|low|medium|high",
  "urgentActions": string[]
}
```

**Optimization Suggestions:**
1. Budget reallocation (underperforming channels)
2. Timing optimization (declining trends)
3. Content refresh (poor performance)

---

### predictive-analytics
**Path:** `/supabase/functions/predictive-analytics/`  
**Trigger:** HTTP POST (user-invoked)

**Purpose:** Forecast campaign KPIs based on historical data

**Input Schema:**
```typescript
{
  campaignId: string (UUID, required),
  predictionType?: string ('kpi_forecast' | custom, default: 'kpi_forecast')
}
```

**Analysis Process:**
1. Get campaign details
2. Retrieve similar historical campaigns (20 most recent)
3. Call AI with historical data
4. Generate predictions
5. Save prediction record

**Database Queries:**
- SELECT from `campaigns`
- SELECT from `campaigns` with `campaign_metrics` (similar type, last 20)

**Database Mutations:**
- INSERT into `campaign_predictions`

**Prediction Output:**
```json
{
  "kpiForecast": {
    "probabilityOfSuccess": number,
    "expectedROI": string,
    "leadGeneration": {
      "low": number,
      "expected": number,
      "high": number
    },
    "budgetEfficiency": string,
    "timeToFirstResult": string
  },
  "budgetOptimization": {
    "recommendedBudget": number,
    "channelAllocation": Record<string, number>,
    "expectedSavings": string
  },
  "riskFactors": [
    {
      "factor": string,
      "probability": number,
      "impact": string,
      "mitigation": string
    }
  ],
  "optimizationOpportunities": string[],
  "confidence": number,
  "basedOnSimilarity": string,
  "keyInsights": string[]
}
```

---

## Environment Variables Summary

### Required (Production)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase
- `OPENAI_API_KEY`: OpenAI API key
- `SECRET_MASTER_KEY`: 64-character hex string for encryption

### Optional (by feature)
- `ANTHROPIC_API_KEY`: Claude API key (fallback)
- `GEMINI_API_KEY`: Google Gemini API key (video generation)
- `MISTRAL_API_KEY`: Mistral API key (fallback)
- `PERPLEXITY_API_KEY`: Perplexity API key (GTM Planner real-time data)
- `LOVABLE_API_KEY`: Lovable AI Gateway key (dashboard chat, audience insights fallback)
- `BACKEND_URL`: Backend URL for video generation callbacks (default: https://wheels-wins-orchestrator.onrender.com)

### Development
- `DENO_DEPLOYMENT_ID`: Automatically set; determines production vs development (CORS changes)

---

## Database Tables Referenced

**Core Marketing:**
- campaigns
- campaign_metrics
- campaign_tasks
- campaign_performance_monitor
- campaign_predictions

**Autopilot:**
- marketing_autopilot_config
- autopilot_activity_log
- autopilot_weekly_reports
- autopilot_lead_inbox

**AI/ML:**
- ai_model_configs
- ai_model_update_logs
- agent_learning_data
- ai_interaction_feedback

**Content/Knowledge:**
- generated_content_pieces
- knowledge_buckets
- knowledge_documents
- knowledge_chunks
- knowledge_access_logs

**Conversations:**
- conversation_messages
- conversation_knowledge_refs
- campaign_copilot_sessions

**Strategic Marketing:**
- brand_positioning_analyses
- funnel_designs
- competitive_gap_analyses
- performance_tracking_frameworks
- gtm_strategies

**Integration:**
- oauth_connections
- user_secrets
- secret_audit_logs

**Video:**
- ai_video_projects
- ai_video_jobs

---

## Common Patterns

### Error Handling
All functions follow this pattern:
- Try/catch outer wrapper
- Validation of inputs (Zod schemas where applicable)
- Detailed server-side logging (console.error)
- Generic error to client (never expose internal details)

### Authentication
- Most functions require Bearer token
- Extract token from Authorization header
- Verify with supabase.auth.getUser(token)

### Database Operations
- Use Supabase JS client (v2)
- Select from database for reads
- Upsert/insert/update for mutations
- RPC calls for complex operations

### AI Integration
- Consistent model selection logic
- Fallback chains (OpenAI → Claude → Mistral)
- JSON response parsing with error handling
- Token estimation and summarization for long contexts

### CORS Headers
- Consistent across all functions
- Imported from _shared/cors.ts
- Environment-aware (different for prod/dev)

---

## Performance Considerations

1. **Caching:** ai-model-config implements 5-minute TTL cache
2. **Batch Processing:** autopilot-orchestrator processes multiple users efficiently
3. **Embeddings:** Knowledge processor chunks documents for semantic search
4. **Token Limits:** chat-ai summarizes long conversation histories
5. **Rate Limiting:** Supabase and AI provider rate limits apply

---

## Security Considerations

1. **Encryption:** API keys encrypted with AES-GCM in manage-user-secrets
2. **Authentication:** All user-invoked functions require valid JWT token
3. **Service Role:** Cron jobs use service role for elevated permissions
4. **Audit Logging:** Secret operations logged with IP/user-agent
5. **Error Messages:** Production sends generic errors, logs full details server-side
6. **Token Handling:** Access tokens for social platforms encrypted at rest

---

## Monitoring & Logging

- All functions log key operations to console (visible in Supabase logs)
- Database operations logged in audit tables (secret_audit_logs, knowledge_access_logs, autopilot_activity_log)
- ai-model-updater logs discovery results in ai_model_update_logs
- Performance metrics available via campaign_performance_monitor table

