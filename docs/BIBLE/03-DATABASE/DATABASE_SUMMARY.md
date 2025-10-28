# Database Schema Summary

**Documentation File:** `/docs/DATABASE_SCHEMA_COMPLETE.md`  
**Last Updated:** October 28, 2025  
**Total Pages:** 2,358 lines

---

## Quick Overview

### Database Statistics
- **Total Tables:** 60+
- **Total Functions:** 20+
- **Total Triggers:** 30+
- **Storage Buckets:** 1 (ai-videos)
- **Views:** 2 (autopilot_cron_monitor, ai_video_stats)
- **Cron Jobs:** 2 scheduled + 2 manual triggers

### Technology Stack
- **Database:** PostgreSQL (Supabase)
- **Vector Extension:** pgvector (OpenAI ada-002: 1536 dimensions)
- **Extensions:** uuid-ossp, vector, pg_cron, net
- **Encryption:** Service-side for API keys
- **Security:** RLS (Row Level Security) on all user tables

---

## Database Organization by Domain

### 1. User Management (6 tables)
- `user_preferences` - Settings and interface mode (simple/advanced)
- `user_secrets` - Encrypted API keys (Gemini, OpenAI, etc.)
- `secret_audit_logs` - Secret operations audit trail
- `user_privacy_settings` - GDPR compliance preferences
- `data_export_requests` - Right to data portability
- `data_deletion_requests` - Right to be forgotten

### 2. Campaign Management (8 tables)
- `campaigns` - Main campaign hub (auto_managed flag for autopilot)
- `campaign_tasks` - Campaign-specific task tracking
- `campaign_metrics` - Historical performance data
- `campaign_performance_metrics` - Detailed metrics
- `campaign_performance_monitor` - Real-time monitoring
- `campaign_predictions` - AI-generated forecasts
- `generated_content_pieces` - AI-generated content
- `workflow_executions` - Campaign workflow tracking

### 3. Lead Management (4 tables)
- `leads` - Central lead database (created_by for isolation)
- `lead_activities` - Interaction history (email opens, clicks, etc.)
- `lead_scoring_rules` - Automated scoring rules
- `autopilot_lead_inbox` - Simplified inbox for autopilot users

### 4. Content & Assets (5 tables)
- `content_calendar` - Publishing schedule planning
- `digital_assets` - Uploaded files and media
- `brand_assets` - Brand identity assets
- `content_templates` - Reusable content templates
- `proposal_templates` - Sales proposal templates

### 5. Communication (7 tables)
- `email_campaigns` - Email marketing campaigns
- `email_templates` - Reusable email templates
- `email_contacts` - Distribution lists
- `email_automation_rules` - Automated sending rules
- `chat_sessions` - User-AI conversations
- `chat_messages` - Individual chat messages
- `conversations` - Alternative conversation tracking with embeddings

### 6. Conversation Intelligence (3 tables)
- `conversation_messages` - Messages with vector embeddings
- `conversation_knowledge_refs` - Links to knowledge base
- `research_notes` - Flagged answers from AI

### 7. Integrations & Connections (5 tables)
- `webhooks` - Outgoing webhook management
- `integration_connections` - Third-party service connections
- `oauth_connections` - Social platform OAuth tokens
- `oauth_states` - OAuth security tokens
- `social_platform_connections` - Social media platform connections

### 8. Knowledge Management (4 tables)
- `knowledge_buckets` - Grouped knowledge (campaign or general)
- `knowledge_documents` - Uploaded documents with chunking status
- `knowledge_chunks` - Chunked content with vector embeddings
- `knowledge_access_logs` - Semantic search audit trail

### 9. AI & Automation (11 tables)
- `marketing_autopilot_config` - Autopilot configuration (1:1 per user)
- `autopilot_weekly_reports` - Weekly performance summaries
- `autopilot_activity_log` - Autopilot action audit trail
- `campaign_copilot_sessions` - AI-assisted campaign design
- `ai_interaction_feedback` - User feedback on AI suggestions
- `agent_learning_data` - Learned patterns from interactions
- `ai_video_projects` - AI video generation projects
- `ai_video_jobs` - Background video processing jobs
- `ai_model_configs` - Discovered AI models (OpenAI, Anthropic, Google, Mistral)
- `ai_model_update_logs` - Monthly model discovery runs
- `user_analytics_events` - Form friction point tracking

### 10. Analytics & Reporting (6 tables)
- `performance_analytics` - User performance tracking
- `analytics_reports` - Generated reports
- `real_time_metrics` - Real-time entity metrics
- `ai_insights` - AI-generated insights
- `keyword_research` - Keyword research results
- `user_analytics_events` - User interaction tracking

### 11. Strategic Marketing (4 tables)
- `brand_positioning_analyses` - 3Cs framework analysis
- `funnel_designs` - Sales funnel designs (Awareness→Retention)
- `competitive_gap_analyses` - Competitive positioning gaps
- `performance_tracking_frameworks` - KPI tracking setup

### 12. Support & Privacy (2 tables)
- `support_tickets` - Customer support system (anonymous + authenticated)
- `privacy_audit_log` - Privacy operations audit

---

## Key Features

### Row Level Security (RLS)
Every user-owned table uses RLS policies:
```sql
-- Standard user isolation pattern
CREATE POLICY "Users can manage own data"
ON table_name FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Automatic Timestamp Management
30+ triggers automatically update `updated_at`:
```sql
-- All major tables have this
CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON table_name
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Vector Search
Knowledge base supports semantic search:
- Embeddings: 1536 dimensions (OpenAI ada-002)
- Index type: IVFFLAT (efficient similarity search)
- Function: `search_knowledge_chunks()` for retrieval
- Distance metric: Cosine distance

### Encryption
API keys stored securely:
- Table: `user_secrets`
- Fields: `encrypted_value`, `initialization_vector`
- Decryption: Server-side only
- Audit: `secret_audit_logs` tracks all operations

### JSONB for Flexibility
Extensive use of JSONB columns:
- Campaign `metrics`, `demographics`, `kpi_targets`
- Lead activity `activity_data`
- Autopilot `ai_strategy`, `goals`
- Video project `brand_kit`, `scene_plan`
- Performance `optimization_suggestions`, `auto_actions_taken`

---

## Important Relationships

### One-to-One (1:1)
- User → user_preferences (interface_mode stored here)
- User → marketing_autopilot_config (1 autopilot per user)
- User → user_privacy_settings

### One-to-Many (1:N)
- Campaign → campaign_tasks (multiple tasks per campaign)
- Campaign → campaign_metrics (historical data)
- Lead → lead_activities (interaction history)
- User → campaigns (multiple campaigns per user)
- User → leads (multiple leads per user)
- Chat_session → chat_messages (conversation history)

### Many-to-Many (M:N) via Junction
- Conversations ↔ Knowledge_chunks (via conversation_knowledge_refs)

### Composite/Multi-Column Unique Constraints
- `user_id + service_name` in user_secrets (one key per service)
- `user_id + platform_name` in oauth_connections (one per platform)
- `created_by + name` in campaigns (unique campaign names per user)
- `document_id + chunk_index` in knowledge_chunks (unique chunks)

---

## Autopilot System Architecture

### Configuration
```
marketing_autopilot_config (1 per user)
├── business_description
├── target_audience
├── monthly_budget
├── goals
└── ai_strategy (AI-generated)
```

### Activity Tracking
```
autopilot_activity_log
├── activity_type (campaign_created, budget_adjusted, etc.)
├── activity_description
├── entity_type (campaign, ad, etc.)
├── entity_id
└── metadata (impact metrics)
```

### Reporting
```
autopilot_weekly_reports (unique: user_id + week_start_date)
├── total_leads_generated
├── total_spend
├── roi
├── top_performing_channel
└── ai_insights
```

### Lead Management
```
autopilot_lead_inbox (denormalized for quick access)
└── References leads table for relationship
```

### Cron Schedule
- Daily: 2 AM UTC (optimization)
- Weekly: Monday 9 AM UTC (reports)

---

## AI Video System

### Project Workflow
```
ai_video_projects (user-created)
├── goal: Video objective
├── platform: YouTubeShort|TikTok|Reels|Landscape
├── duration_s: 1-120 seconds
├── brand_kit: Styling JSONB
├── status: draft → planning → generating_images → generating_video → completed
└── auto_generated: Flag for autopilot videos

ai_video_jobs (background processing)
├── job_type: image_generation|video_generation
├── veo_operation_id: Polling ID for async jobs
├── status: pending → processing → completed|failed
└── result_url: Output location
```

### Integrations
- **Nano Banana:** Image generation ($0.039 per image)
- **Veo 3:** Video generation ($0.40-0.75 per second)
- **Storage:** Supabase bucket `ai-videos` (public, user-isolated paths)

### Cost Tracking
- `cost_usd` field tracks actual API costs
- `created_at` and `completed_at` for time analysis
- `auto_generated` flag for autopilot attribution

---

## Strategic Marketing Analysis Tables

### Brand Positioning (3Cs)
```
brand_positioning_analyses
├── positioning_statement
├── differentiators (array)
├── brand_tone (JSON)
├── three_cs_analysis (Company, Customer, Competition)
└── recommendations
```

### Sales Funnel
```
funnel_designs
└── funnel_structure (Awareness → Engagement → Conversion → Retention)
    ├── stage definitions
    ├── offers per stage
    └── automation tasks
```

### Competitive Analysis
```
competitive_gap_analyses
├── our_brand
├── competitors (array)
├── gap_analysis (messaging, channels, audience, content gaps)
└── ownable_differentiator
```

### KPI Framework
```
performance_tracking_frameworks
├── campaign_name
├── channels (array)
├── tracking_framework (KPI definitions)
└── is_active (boolean)
```

---

## AI Model Management

### Discovered Models (as of Oct 28, 2025)

**OpenAI:**
- Flagship: gpt-5
- Fast: gpt-5-mini, gpt-5-nano
- Reasoning: o3, o4-mini
- Legacy: gpt-4.1, gpt-4.1-mini

**Anthropic:**
- Flagship: claude-sonnet-4.5
- Most Powerful: claude-opus-4.1
- Fast: claude-haiku-4-5
- Legacy: claude-sonnet-4

**Google:**
- Flagship: gemini-2.5-pro
- Fast: gemini-2.5-flash, gemini-2.5-flash-lite
- Legacy: gemini-2.0-flash

**Mistral:**
- Flagship: mistral-large-latest
- Fast: mistral-medium-latest

### Configuration Storage
```
ai_model_configs (global, service-managed)
├── provider + model_name (UNIQUE)
├── model_type (flagship|fast|legacy)
├── is_active
├── is_default
├── capabilities (vision, function_calling, etc.)
├── pricing (input/output per token)
├── context_window
└── metadata
```

### Discovery Runs
```
ai_model_update_logs
├── run_date (monthly)
├── models_discovered
├── models_added
├── models_deprecated
├── providers_checked
└── execution_time_ms
```

---

## Data Isolation & Multi-Tenancy

### User-Level Isolation
All user data uses `created_by` or `user_id` column with RLS:
```
Campaigns: created_by (auth.uid())
Leads: created_by (auth.uid())
Content Calendar: created_by (auth.uid())
Knowledge Buckets: created_by (auth.uid())
Autopilot Config: user_id (auth.uid(), 1:1)
```

### RLS Policy Pattern
Every policy checks user identity:
```sql
USING (auth.uid() = user_id)  -- Read access
WITH CHECK (auth.uid() = user_id)  -- Write check
```

### No Shared Data (Currently)
- No multi-user campaign collaboration
- No shared templates/asset libraries
- Each user has isolated: leads, campaigns, content, knowledge base

---

## Performance Optimization

### Index Strategy
```sql
-- User-scoped filtering (primary)
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- Status/type filtering
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Time-based queries
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Composite for complex filters
CREATE INDEX idx_autopilot_config_active ON marketing_autopilot_config(user_id, is_active);

-- Vector similarity search
CREATE INDEX idx_knowledge_chunks_embedding 
ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);

-- Partial indexes for filtered queries
CREATE INDEX idx_campaign_tasks_user_due ON campaign_tasks(created_by, due_date)
WHERE status != 'completed';
```

### Query Optimization Tips
1. Always filter by `user_id` first (RLS + performance)
2. Use `created_at DESC LIMIT` for pagination
3. Leverage composite indexes for multiple filters
4. Use vector indexes for embedding search
5. Cache embedding queries (expensive)

---

## GDPR Compliance

### Privacy Settings
```
user_privacy_settings
├── data_processing_consent
├── marketing_consent
├── analytics_consent
├── third_party_consent
├── data_retention_days (default 730)
└── right_to_be_deleted_requested
```

### Data Export
```
data_export_requests
├── status: pending → processing → completed
├── requested_at
├── completed_at
└── download_url
```

### Data Deletion
```
data_deletion_requests
├── status: pending → processing → completed
├── confirmation_required
└── completion timestamp
```

### Audit Trail
```
privacy_audit_log
├── event_type (export_requested, deletion_completed, etc.)
├── details (JSONB)
├── ip_address
├── user_agent
└── timestamp
```

---

## Migration History

| Date | Phase | Key Changes |
|------|-------|-------------|
| Jun 10, 2025 | Phase 1 | Initial: campaigns, leads, content_calendar, RLS setup |
| Jun 10-15, 2025 | Phase 2 | user_secrets, webhooks, oauth, chat, email templates |
| Jun 15-29, 2025 | Phase 3 | Knowledge base + vector embeddings |
| Jul 9-15, 2025 | Phase 4 | AI feedback, copilot sessions, predictions, privacy |
| Jun 10, 2025 | Phase 5 | Autopilot system (config, reports, activity log, cron) |
| Oct 8, 2025 | Phase 6 | AI video generation (projects, jobs, storage bucket) |
| Oct 11, 2025 | Phase 7 | Strategic marketing (positioning, funnel, gaps, KPIs) |
| Oct 24, 2025 | Phase 8 | Support tickets system |
| Oct 28, 2025 | Phase 9 | AI model discovery and management |

---

## Related Documentation

- **Complete Schema:** `docs/DATABASE_SCHEMA_COMPLETE.md` (2,358 lines)
- **Project Instructions:** `CLAUDE.md`
- **AI Models:** `CLAUDE.md` section "AI Models & Services"
- **Autopilot:** `CLAUDE.md` section "Key Features - Marketing Autopilot"
- **Video Generation:** `docs/AI-VIDEO-GENERATOR.md`

---

## Querying Examples

### Get User's Recent Campaigns
```sql
SELECT * FROM campaigns
WHERE created_by = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

### Search Knowledge Base
```sql
SELECT * FROM search_knowledge_chunks(
  p_user_id := auth.uid(),
  p_query_embedding := embedding_vector,
  p_limit := 10,
  p_similarity_threshold := 0.7
);
```

### Get Autopilot Dashboard Stats
```sql
SELECT * FROM get_autopilot_dashboard_stats(auth.uid());
```

### Get Default AI Model
```sql
SELECT * FROM get_default_model('openai', 'flagship');
```

### View Autopilot Activity
```sql
SELECT * FROM autopilot_activity_log
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 20;
```

---

**Complete documentation:** See `/docs/DATABASE_SCHEMA_COMPLETE.md` for full table definitions, functions, triggers, and relationship maps.
