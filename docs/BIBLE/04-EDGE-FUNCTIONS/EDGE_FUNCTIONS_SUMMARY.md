# Supabase Edge Functions Summary
## Action Insight Marketing Platform

**Documentation Location:** `/SUPABASE_EDGE_FUNCTIONS.md`  
**Last Updated:** 2025-10-28

---

## Quick Stats

- **Total Functions:** 34 Edge Functions
- **Scheduled (Cron) Functions:** 3
- **AI Agent Functions:** 10+
- **Total Lines of Documentation:** 2500+

---

## Functions by Category

### Scheduled (Cron) - 3 Functions
**Files:** `_shared/cron.ts`

1. **autopilot-orchestrator** (Daily 2 AM UTC)
   - Campaign creation and optimization
   - Lead syncing
   - Video ad generation for low-engagement campaigns

2. **autopilot-weekly-report** (Monday 9 AM UTC)
   - Weekly performance reports
   - ROI calculations
   - AI insights generation

3. **ai-model-updater** (Monthly 1st 3 AM UTC)
   - Discovers latest models from OpenAI, Anthropic, Google, Mistral
   - Auto-categorizes models (flagship/fast/legacy)
   - Updates database and deprecates old models

### AI Agent Functions - 10 Functions

**Strategic Marketing Agents:**
- `brand-positioning-agent` - 3Cs framework analysis
- `funnel-design-agent` - Complete funnel design with automation
- `competitor-gap-agent` - Competitive gap analysis
- `performance-tracker-agent` - KPI framework creation
- `channel-strategy-agent` - Channel mix optimization
- `audience-insight-agent` - Persona generation
- `messaging-agent` - Messaging pillars & value props
- `content-calendar-agent` - 30-day content planning
- `agent-executor` - Task routing for multiple agent types
- `gtm-planner` - Go-to-Market strategy generation

### Chat & Conversation - 3 Functions
- `chat-ai` - Context-aware chat with knowledge base
- `chat-memory` - Conversation history management
- `dashboard-chat` - Quick AI responses via Lovable Gateway

### Content Generation - 1 Function
- `full-content-generator` - Blog posts, ads, emails

### Knowledge Management - 2 Functions
- `knowledge-processor` - Document upload and semantic search
- `ai-autocomplete` - Smart field suggestions
- `ai-feedback-loop` - Learn from user feedback

### AI Model Management - 2 Functions
- `ai-model-config` - Query and validate models
- `ai-model-updater` - Cron-scheduled model discovery

### Performance Analysis - 2 Functions
- `performance-optimizer` - Campaign analysis & recommendations
- `predictive-analytics` - KPI forecasting

### OAuth & Social - 5 Functions
- `oauth-initiate`, `oauth-callback` - Supabase auth
- `social-oauth-initiate`, `social-oauth-callback` - Social platform auth
- `social-post` - Publish to Facebook, Twitter, LinkedIn, Instagram
- `social-connections` - Manage social connections

### Utilities - 1 Function
- `manage-user-secrets` - Encrypted API key management

---

## AI Models Used

### OpenAI
- `gpt-5` - Full-featured model
- `gpt-5-mini` - Fast variant
- `gpt-5-2025-08-07` - Latest version
- `text-embedding-ada-002` - Embeddings
- `gpt-4.1-mini` - Lightweight variant

### Anthropic Claude
- `claude-sonnet-4.5` - Fallback for OpenAI
- Tested but not frequently used

### Google Gemini
- `gemini-2.5-flash` - Via Lovable AI Gateway (dashboard-chat)
- `gemini-2.5-pro` - Video planning (not in Edge Functions)

### Perplexity
- `llama-3.1-sonar-large-128k-online` - Real-time market research (GTM Planner)

---

## Key Database Tables

**Marketing Core:**
- campaigns, campaign_metrics, campaign_tasks, campaign_performance_monitor

**Autopilot System:**
- marketing_autopilot_config, autopilot_activity_log, autopilot_weekly_reports, autopilot_lead_inbox

**AI/ML:**
- ai_model_configs, ai_model_update_logs, agent_learning_data, ai_interaction_feedback

**Strategic Marketing:**
- brand_positioning_analyses, funnel_designs, competitive_gap_analyses, performance_tracking_frameworks, gtm_strategies

**Conversations:**
- conversation_messages, conversation_knowledge_refs, campaign_copilot_sessions

**Knowledge:**
- knowledge_buckets, knowledge_documents, knowledge_chunks, knowledge_access_logs

**Integration:**
- oauth_connections, user_secrets, secret_audit_logs

---

## Environment Variables Required

### Critical
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `SECRET_MASTER_KEY` (64-char hex for encryption)

### Optional by Feature
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `MISTRAL_API_KEY`
- `PERPLEXITY_API_KEY`
- `LOVABLE_API_KEY`
- `BACKEND_URL`

---

## Common Patterns

### Authentication
- Bearer token from Authorization header
- Verified with `supabase.auth.getUser(token)`
- Service role for cron jobs

### Error Handling
- Detailed server-side logging (console.error)
- Generic error messages to client
- Per-function/per-user try/catch

### AI Integration
- Consistent model selection
- Fallback chains
- JSON response parsing
- Token estimation for large contexts

### Database
- Supabase JS client v2
- RPC calls for complex operations
- Transaction support where needed

---

## Performance Features

1. **Caching:** ai-model-config has 5-minute TTL
2. **Batch Processing:** autopilot-orchestrator handles multiple users
3. **Chunking:** knowledge-processor splits documents for semantic search
4. **Summarization:** chat-ai summarizes long conversation histories
5. **Async:** knowledge-processor does background processing

---

## Security Features

1. **Encryption:** AES-GCM for API keys in user_secrets
2. **Audit Logging:** All secret operations logged
3. **Token Handling:** Social platform tokens encrypted at rest
4. **Input Validation:** Zod schemas for all user inputs
5. **Authentication:** JWT verification on all user-invoked functions
6. **Environment Detection:** Different CORS for prod/dev

---

## Testing Endpoints

All functions are accessible via standard HTTP:

```bash
# Example: Brand positioning
curl -X POST https://your-supabase.functions.supabase.co/brand-positioning-agent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyMission": "...",
    "productOffer": "...",
    "targetAudience": "...",
    "competitors": "...",
    "userId": "uuid"
  }'
```

---

## Monitoring & Logs

- All functions log to Supabase function logs
- Key operations logged in database (activity_logs, audit_logs)
- Model discovery logged in ai_model_update_logs
- Performance monitoring stored in campaign_performance_monitor

---

## Related Documentation

- **Main Guide:** `/CLAUDE.md`
- **AI Video:** `/docs/AI-VIDEO-GENERATOR.md`
- **Knip Code Cleanup:** `/docs/KNIP.md`
- **Migrations:** `/docs/APPLY_MIGRATIONS.md`
- **Architecture:** `/docs/ARCHITECTURE.md`
- **API Reference:** `/docs/API.md`

---

## Key Insights

### Campaign Copilot Flow
1. User initiates campaign creation
2. Parallel calls to: audience-insight, channel-strategy, messaging-agent
3. content-calendar-agent combines results
4. Session marked 'completed'
5. All steps update session.interaction_history

### Learning System
- Feedback recorded in ai_interaction_feedback
- Patterns extracted and confidence/success_rate calculated
- agent_learning_data updated with usage metrics
- Future generations learn from previous user modifications

### Automation Intelligence
- autopilot-orchestrator runs daily at 2 AM UTC
- Analyzes campaign metrics for optimization opportunities
- Triggers video generation for low-engagement campaigns
- Syncs new leads automatically
- All actions logged for transparency

---

## Deployment Notes

- All functions use Deno runtime
- Service role key required for cron jobs
- CORS automatically applied
- Fallback models ensure reliability when APIs unavailable
- Encryption key must be exactly 64 hex characters (32 bytes)

---

**For detailed documentation, see: `/SUPABASE_EDGE_FUNCTIONS.md`**
