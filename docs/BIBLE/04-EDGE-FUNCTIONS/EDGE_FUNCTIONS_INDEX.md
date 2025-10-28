# Supabase Edge Functions - Complete Reference Index
## Action Insight Marketing Platform

---

## Documentation Files

1. **SUPABASE_EDGE_FUNCTIONS.md** (42 KB, 1,741 lines)
   - Comprehensive documentation covering ALL 34 Edge Functions
   - Every function includes: purpose, inputs, outputs, database operations, auth, error handling
   - Environment variables, patterns, monitoring, security

2. **EDGE_FUNCTIONS_SUMMARY.md** (7.5 KB, 269 lines)
   - Quick reference guide with stats and categories
   - AI models used across platform
   - Key patterns and insights
   - Testing endpoints and deployment notes

3. **EDGE_FUNCTIONS_INDEX.md** (this file)
   - Navigation guide and quick lookup reference
   - Organized by category and function name

---

## Functions by File Path

### Shared Configuration
- `/supabase/functions/_shared/cors.ts` - CORS headers (prod/dev aware)
- `/supabase/functions/_shared/cron.ts` - Cron job schedule definitions

### Scheduled (Cron) Functions
- `/supabase/functions/autopilot-orchestrator/` - Daily optimization (2 AM UTC)
- `/supabase/functions/autopilot-weekly-report/` - Weekly reports (Mon 9 AM UTC)
- `/supabase/functions/ai-model-updater/` - Monthly discovery (1st 3 AM UTC)

### AI Agent Functions (Strategic Marketing)
- `/supabase/functions/brand-positioning-agent/` - 3Cs brand analysis
- `/supabase/functions/funnel-design-agent/` - Complete funnel architecture
- `/supabase/functions/competitor-gap-agent/` - Competitive opportunity analysis
- `/supabase/functions/performance-tracker-agent/` - KPI framework design
- `/supabase/functions/channel-strategy-agent/` - Channel mix optimization
- `/supabase/functions/audience-insight-agent/` - Persona generation
- `/supabase/functions/messaging-agent/` - Messaging strategy creation
- `/supabase/functions/content-calendar-agent/` - 30-day content planning
- `/supabase/functions/agent-executor/` - Multi-agent task router
- `/supabase/functions/gtm-planner/` - Go-to-Market strategy

### Chat & Conversation
- `/supabase/functions/chat-ai/` - Context-aware chat with knowledge
- `/supabase/functions/chat-memory/` - Conversation storage & retrieval
- `/supabase/functions/dashboard-chat/` - Quick AI responses via Lovable

### Content Generation
- `/supabase/functions/full-content-generator/` - Blog/ads/email generation

### Knowledge Management
- `/supabase/functions/knowledge-processor/` - Document processing & search
- `/supabase/functions/ai-autocomplete/` - Smart field suggestions
- `/supabase/functions/ai-feedback-loop/` - Learn from user feedback

### AI Model Management
- `/supabase/functions/ai-model-config/` - Model queries & validation
- `/supabase/functions/ai-model-updater/` - Model discovery (cron)

### Performance Analysis
- `/supabase/functions/performance-optimizer/` - Campaign analysis
- `/supabase/functions/predictive-analytics/` - KPI forecasting

### OAuth & Social Integration
- `/supabase/functions/oauth-initiate/` - Supabase auth start
- `/supabase/functions/oauth-callback/` - Supabase auth callback
- `/supabase/functions/social-oauth-initiate/` - Social platform auth start
- `/supabase/functions/social-oauth-callback/` - Social platform auth callback
- `/supabase/functions/social-post/` - Multi-platform publishing
- `/supabase/functions/social-connections/` - Connection management
- `/supabase/functions/ai-feedback-loop/` - (also listed above)

### Utilities
- `/supabase/functions/manage-user-secrets/` - Encrypted key management

---

## Quick Lookup Table

| Function | Type | Trigger | AI Model | Database Read | Database Write |
|----------|------|---------|----------|----------------|-----------------|
| autopilot-orchestrator | Cron | 0 2 * * * | None | campaigns, metrics | campaigns, logs |
| autopilot-weekly-report | Cron | 0 9 * * 1 | None | leads, metrics | reports |
| ai-model-updater | Cron | 0 3 1 * * | HTTP API | model_configs | model_configs, logs |
| brand-positioning-agent | HTTP POST | User | gpt-5-mini | None | brand_positioning |
| funnel-design-agent | HTTP POST | User | gpt-5-mini | None | funnel_designs |
| competitor-gap-agent | HTTP POST | User | gpt-5-mini | None | competitive_gap |
| performance-tracker-agent | HTTP POST | User | gpt-5-mini | None | performance_tracking |
| channel-strategy-agent | HTTP POST | User | gpt-5-2025-08-07 | feedback, patterns | sessions, learning |
| audience-insight-agent | HTTP POST | User | gpt-5/gemini-2.5 | feedback, patterns | sessions, learning |
| messaging-agent | HTTP POST | User | gpt-5-2025-08-07 | feedback, patterns | sessions, learning |
| content-calendar-agent | HTTP POST | User | gpt-5-mini | feedback, patterns | sessions (marks complete) |
| agent-executor | HTTP POST | User | gpt-5-mini | None | None |
| gtm-planner | HTTP POST | User | gpt-5 + Perplexity | None | gtm_strategies |
| chat-ai | HTTP POST | User | gpt-5-2025-08-07 | messages, knowledge | messages, refs |
| chat-memory | HTTP POST | User | embeddings | messages | messages |
| dashboard-chat | HTTP POST | User | gemini-2.5-flash | None | None |
| full-content-generator | HTTP POST | User | gpt-5 | campaigns | content_pieces |
| knowledge-processor | HTTP POST | User | embeddings + summarization | buckets, docs | chunks, logs |
| ai-autocomplete | HTTP POST | User | None | campaigns, feedback | None |
| ai-feedback-loop | HTTP POST | User | None | None | feedback, learning |
| ai-model-config | HTTP GET/POST | User | None | model_configs, logs | None |
| performance-optimizer | HTTP POST | User | gpt-5-2025-08-07 | campaigns, metrics | performance_monitor |
| predictive-analytics | HTTP POST | User | gpt-5-2025-08-07 | campaigns, metrics | campaign_predictions |
| oauth-initiate | HTTP GET | User | None | None | None |
| oauth-callback | HTTP POST | OAuth Callback | None | None | oauth_connections |
| social-oauth-initiate | HTTP GET | User | None | None | None |
| social-oauth-callback | HTTP POST | OAuth Callback | None | None | oauth_connections |
| social-post | HTTP POST | User | None | oauth_connections | None |
| social-connections | HTTP GET/POST | User | None | oauth_connections | oauth_connections |
| manage-user-secrets | HTTP POST | User | None (crypto) | user_secrets | user_secrets, audit |

---

## Authentication Reference

**Functions Requiring Bearer Token:**
- All HTTP POST/GET functions from users (agent functions, content generators, etc.)
- OAuth callbacks receive state parameter
- Social post requires valid platform connections

**Functions Using Service Role:**
- All cron-scheduled functions (autopilot-orchestrator, autopilot-weekly-report, ai-model-updater)
- These have elevated database permissions

---

## Environment Variables Used

**By Multiple Functions:**
- `SUPABASE_URL` - Used by: All functions (database access)
- `SUPABASE_SERVICE_ROLE_KEY` - Used by: Cron functions, some agents
- `OPENAI_API_KEY` - Used by: All AI agents, chat, content, knowledge
- `SECRET_MASTER_KEY` - Used by: manage-user-secrets only

**By Specific Functions:**
- `ANTHROPIC_API_KEY` - agent-executor (fallback), ai-model-updater
- `GEMINI_API_KEY` - ai-model-updater
- `MISTRAL_API_KEY` - ai-model-updater, agent-executor (fallback)
- `PERPLEXITY_API_KEY` - gtm-planner (market research)
- `LOVABLE_API_KEY` - audience-insight-agent (fallback), dashboard-chat
- `BACKEND_URL` - autopilot-orchestrator (video generation)

---

## Campaign Copilot Agent Workflow

**Execution Order (Parallel where possible):**

1. **Initiate Session** (user)
   - Creates `campaign_copilot_sessions` record
   - Initializes `generated_campaign` object

2. **Phase 1 - Parallel Execution:**
   - `audience-insight-agent` - Generate personas
   - `channel-strategy-agent` - Design channel mix
   - Updates session.interaction_history

3. **Phase 2 - Parallel Execution:**
   - `messaging-agent` - Create messaging pillars (using personas + channels)
   - Both use channel strategy as input

4. **Phase 3 - Final:**
   - `content-calendar-agent` - Generate calendar (uses all previous)
   - Marks session.status = 'completed'

**Feedback Loop:**
- User modifies outputs → `ai-feedback-loop` records feedback
- `agent_learning_data` updated with confidence/success rates
- Next generation learns from modifications

---

## Database Schema Relationships

**Campaign Ecosystem:**
```
campaigns
  ├─ campaign_metrics
  ├─ campaign_tasks
  ├─ campaign_performance_monitor
  ├─ campaign_predictions
  └─ generated_content_pieces
```

**Autopilot Ecosystem:**
```
marketing_autopilot_config
  ├─ autopilot_activity_log
  ├─ autopilot_weekly_reports
  └─ autopilot_lead_inbox
```

**AI Learning Ecosystem:**
```
campaign_copilot_sessions
  ├─ ai_interaction_feedback
  │   └─ agent_learning_data
  └─ interaction_history
```

**Knowledge Ecosystem:**
```
knowledge_buckets
  ├─ knowledge_documents
  │   ├─ knowledge_chunks
  │   └─ knowledge_access_logs
  └─ campaigns (optional reference)
```

**Strategic Marketing Results:**
```
brand_positioning_analyses
funnel_designs
competitive_gap_analyses
performance_tracking_frameworks
gtm_strategies
```

---

## Error Response Patterns

**All functions follow:**
```json
{
  "error": "Generic user-friendly message",
  "details": "Optional validation details (only on 400)",
  "hint": "Optional help text for config errors"
}
```

**Status Codes:**
- 200: Success
- 400: Validation error (Zod schema failure)
- 401: Authentication error (missing/invalid token)
- 402: Payment error (AI credits, from Lovable)
- 429: Rate limit (from AI providers)
- 500: Unexpected error (full details logged server-side only)
- 503: Service unavailable (config error, e.g., missing API key)

---

## Performance Characteristics

**Fastest Functions (< 100ms):**
- oauth-initiate, social-connections (redirect only)
- ai-autocomplete (memory lookup)
- manage-user-secrets (crypto operations)

**Fast Functions (100-500ms):**
- chat-memory (simple database operations)
- ai-model-config (with cache)

**Medium Speed (500-2000ms):**
- chat-ai, full-content-generator
- performance-optimizer, predictive-analytics
- social-post (network to platforms)

**Slow Functions (2-10 seconds):**
- All agent-executor tasks
- gtm-planner (parallel API calls + AI)
- knowledge-processor (embedding generation)

**Very Slow / Async (>10 seconds):**
- autopilot-orchestrator (processes all users)
- autopilot-weekly-report (generates all reports)
- ai-model-updater (tests all providers)

---

## Testing Checklist

Before using Edge Functions in production:

- [ ] All required environment variables are set
- [ ] Secret master key is exactly 64 hex characters
- [ ] CORS configuration matches your domain
- [ ] API keys are valid and have sufficient quota
- [ ] Database tables exist and are properly migrated
- [ ] RLS (Row Level Security) policies are configured
- [ ] Service role has required permissions for cron jobs
- [ ] Cron schedule times are in UTC
- [ ] Error handling works for missing API keys

---

## Support & Maintenance

**Regular Tasks:**
- Monthly: Review ai_model_update_logs for new models
- Weekly: Monitor autopilot_activity_log for errors
- Weekly: Check ai_model_configs for deprecated models
- Daily: Monitor function execution logs in Supabase console

**Common Issues:**
- "API key not configured" - Check environment variables
- "Configuration error" - Usually API key issue, check Supabase logs
- "Rate limit exceeded" - Wait or upgrade API plan
- "Model not found" - Check ai_model_configs table, may need ai-model-updater to run

---

**For detailed information on each function, see:**
- `/SUPABASE_EDGE_FUNCTIONS.md` - Full documentation
- `/EDGE_FUNCTIONS_SUMMARY.md` - Quick reference

**Last Updated:** 2025-10-28  
**Total Coverage:** 34 Edge Functions, 3 Cron Jobs, 2,000+ lines of documentation
