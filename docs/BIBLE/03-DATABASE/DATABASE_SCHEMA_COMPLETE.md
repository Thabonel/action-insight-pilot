# Action Insight Pilot - Complete Database Schema Documentation

**Last Updated:** October 28, 2025
**Database:** PostgreSQL via Supabase
**Total Tables:** 60+
**Total Functions:** 20+
**Total Triggers:** 30+

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Evolution History](#schema-evolution-history)
3. [Core Tables](#core-tables)
4. [User Management](#user-management)
5. [Campaign Management](#campaign-management)
6. [Lead Management](#lead-management)
7. [Content & Assets](#content--assets)
8. [Communication](#communication)
9. [Integrations & Connections](#integrations--connections)
10. [Knowledge Management](#knowledge-management)
11. [AI & Automation](#ai--automation)
12. [Analytics & Reporting](#analytics--reporting)
13. [Support & Privacy](#support--privacy)
14. [Database Functions](#database-functions)
15. [Database Triggers](#database-triggers)
16. [Relationships Map](#relationships-map)

---

## Database Overview

### Key Features
- **Row Level Security (RLS):** All user-related tables have RLS policies
- **Vector Storage:** Support for embeddings (1536 dimensions - OpenAI ada-002)
- **JSONB Support:** Extensive use of JSONB for flexible data storage
- **Audit Logging:** Comprehensive activity tracking and privacy logs
- **Cron Jobs:** pg_cron extension for automated tasks (autopilot orchestration)
- **Time Travel:** Created_at, updated_at timestamps on all major tables

### Extensions Enabled
- `uuid-ossp` - UUID generation
- `vector` - pgvector for embeddings
- `pg_cron` - Cron job scheduling
- `net` - HTTP calls for webhook integration

---

## Schema Evolution History

### Migration Timeline

**Phase 1: Initial Setup (June 10, 2025)**
- Created: campaigns, leads, content_calendar, email_campaigns, etc.
- Added: user_preferences, workflow_executions, social_platform_connections
- Established: RLS policies and basic security

**Phase 2: Enhanced Automation (June 10-15, 2025)**
- Created: user_secrets (encrypted API key storage)
- Added: webhooks, integration_connections, oauth_connections
- Created: chat_sessions, chat_messages (conversation history)
- Added: email_templates, email_contacts RLS policies

**Phase 3: Knowledge Base System (June 15-29, 2025)**
- Created: knowledge_buckets, knowledge_documents, knowledge_chunks
- Added: Vector embeddings for semantic search
- Created: knowledge_access_logs for audit trail
- Added: knowledge_documents.summary column

**Phase 4: Marketing Automation (July 9-15, 2025)**
- Created: ai_interaction_feedback, agent_learning_data
- Added: campaign_copilot_sessions
- Created: campaign_performance_monitor, campaign_predictions
- Added: generated_content_pieces, keyword_research
- Created: user_analytics_events, conversations, conversation_messages
- Added: conversation_knowledge_refs, research_notes
- Created: user_privacy_settings, data_export_requests, data_deletion_requests
- Added: privacy_audit_log

**Phase 5: Autopilot System (June 10, 2025)**
- Created: marketing_autopilot_config
- Added: autopilot_weekly_reports, autopilot_activity_log
- Created: autopilot_lead_inbox
- Added: interface_mode column to user_preferences
- Created: campaign_tasks
- Set up: pg_cron for daily and weekly automation

**Phase 6: Video Generation (October 8, 2025)**
- Created: ai_video_projects, ai_video_jobs
- Added: Storage bucket for video files
- Set up: Veo 3 and Nano Banana integration

**Phase 7: Strategic Marketing (October 11, 2025)**
- Created: brand_positioning_analyses
- Added: funnel_designs, competitive_gap_analyses
- Created: performance_tracking_frameworks

**Phase 8: Support System (October 24, 2025)**
- Created: support_tickets table
- Added: Status tracking and admin notes

**Phase 9: AI Model Management (October 28, 2025)**
- Created: ai_model_configs, ai_model_update_logs
- Added: Model discovery and management system

---

## Core Tables

### User Authentication (auth.users)
- **Provider:** Supabase Auth
- **Columns:** id (UUID), email, password (hashed), user_metadata, app_metadata, created_at, updated_at
- **Note:** Automatically managed by Supabase, not created in migrations

---

## User Management

### Table: user_preferences
**Purpose:** Store user settings and interface preferences
**Owner:** Any authenticated user

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE | User who owns preference |
| preference_category | TEXT | UNIQUE(with user_id) | Category of preference (e.g., 'general', 'interface') |
| preference_data | JSONB | DEFAULT '{}'::jsonb | Flexible preference data |
| interface_mode | TEXT | DEFAULT 'simple' | 'simple' or 'advanced' UI mode |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage their own preferences

**Indexes:**
- idx_user_preferences_user_category (user_id, preference_category)

**Triggers:**
- update_user_preferences_updated_at (updates updated_at)

---

### Table: user_secrets
**Purpose:** Store encrypted API keys and secrets securely
**Owner:** Any authenticated user
**Encryption:** Service-side encryption with initialization vector

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE(with service_name) | User who owns secret |
| service_name | TEXT | UNIQUE(with user_id) | Service identifier (e.g., 'gemini_api_key_encrypted') |
| encrypted_value | TEXT | NOT NULL | Encrypted secret value |
| initialization_vector | TEXT | NOT NULL | IV for decryption |
| is_active | BOOLEAN | DEFAULT true | Whether secret is active |
| last_used_at | TIMESTAMPTZ | NULL | Last usage timestamp |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view their own secrets metadata
- Users can create/update/delete their own secrets

**Indexes:**
- None (lookups by user_id + service_name)

**Triggers:**
- update_user_secrets_updated_at (updates updated_at)

---

### Table: secret_audit_logs
**Purpose:** Audit trail for secret operations
**Owner:** System (reads by users for their own logs)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User performing operation |
| service_name | TEXT | NOT NULL | Service name |
| operation | TEXT | CHECK IN ('create', 'read', 'update', 'delete') | Operation type |
| ip_address | INET | NULL | Client IP address |
| user_agent | TEXT | NULL | Browser user agent |
| success | BOOLEAN | NOT NULL | Success flag |
| error_message | TEXT | NULL | Error if failed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Log timestamp |

**RLS Policies:**
- Users can view their own audit logs

---

### Table: user_privacy_settings
**Purpose:** GDPR compliance - user privacy preferences
**Owner:** Any authenticated user

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | NOT NULL, UNIQUE | User who owns settings |
| data_processing_consent | BOOLEAN | DEFAULT false | Consent for data processing |
| marketing_consent | BOOLEAN | DEFAULT false | Consent for marketing |
| analytics_consent | BOOLEAN | DEFAULT false | Consent for analytics |
| third_party_consent | BOOLEAN | DEFAULT false | Consent for third-party sharing |
| data_retention_days | INTEGER | DEFAULT 730 | Days to retain user data |
| right_to_be_deleted_requested | BOOLEAN | DEFAULT false | Account deletion requested |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/update their own privacy settings

**Indexes:**
- idx_user_privacy_settings_user_id (user_id)

**Triggers:**
- update_user_privacy_settings_updated_at (updates updated_at)

---

### Table: data_export_requests
**Purpose:** Track user data export requests (GDPR right to data portability)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| request_id | TEXT | UNIQUE | Human-readable request ID |
| user_id | UUID | NOT NULL | User requesting export |
| status | TEXT | DEFAULT 'pending' | pending, processing, completed, failed |
| requested_at | TIMESTAMPTZ | DEFAULT NOW() | When request was made |
| completed_at | TIMESTAMPTZ | NULL | When export completed |
| download_url | TEXT | NULL | URL to download exported data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view their own export requests

---

### Table: data_deletion_requests
**Purpose:** Track user data deletion requests (GDPR right to be forgotten)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| request_id | TEXT | UNIQUE | Human-readable request ID |
| user_id | UUID | NOT NULL | User requesting deletion |
| status | TEXT | DEFAULT 'pending' | pending, processing, completed, failed |
| requested_at | TIMESTAMPTZ | DEFAULT NOW() | When request was made |
| completed_at | TIMESTAMPTZ | NULL | When deletion completed |
| confirmation_required | BOOLEAN | DEFAULT true | Whether confirmation needed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view their own deletion requests

---

### Table: privacy_audit_log
**Purpose:** Audit trail for all privacy-related operations

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | NOT NULL | User involved |
| event_type | TEXT | NOT NULL | Type of privacy event |
| details | JSONB | DEFAULT '{}' | Detailed event information |
| ip_address | TEXT | NULL | Client IP |
| user_agent | TEXT | NULL | Browser info |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Log creation timestamp |

**RLS Policies:**
- Users can view their own audit logs

**Indexes:**
- idx_privacy_audit_log_user_id (user_id)
- idx_privacy_audit_log_timestamp (timestamp)

---

## Campaign Management

### Table: campaigns
**Purpose:** Central hub for marketing campaigns
**Owner:** User who created campaign (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users), NOT NULL | User who created |
| name | TEXT | NOT NULL, UNIQUE(with created_by) | Campaign name |
| description | TEXT | NULL | Campaign description |
| type | TEXT | CHECK (various types) | lead_generation, brand_awareness, product_launch, email, social_media, etc. |
| channel | TEXT | NULL | Primary channel |
| status | TEXT | CHECK IN ('draft', 'active', 'paused', 'completed') | Campaign status |
| total_budget | NUMERIC | DEFAULT 0 | Total budget allocated |
| budget_allocated | NUMERIC | DEFAULT 0 | Amount allocated |
| budget_spent | NUMERIC | DEFAULT 0 | Amount spent |
| start_date | TIMESTAMPTZ | NULL | Campaign start date |
| end_date | TIMESTAMPTZ | NULL | Campaign end date |
| primary_objective | TEXT | NULL | Main goal |
| target_audience | TEXT | NULL | Audience description |
| channels | JSONB | DEFAULT '[]' | Array of channels used |
| demographics | JSONB | DEFAULT '{}' | Target demographics |
| kpi_targets | JSONB | DEFAULT '{}' | KPI targets and goals |
| content | JSONB | DEFAULT '{}' | Campaign content |
| settings | JSONB | DEFAULT '{}' | Campaign settings |
| metrics | JSONB | DEFAULT '{}' | Current metrics |
| auto_managed | BOOLEAN | DEFAULT false | Autopilot managed flag |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own campaigns

**Indexes:**
- idx_campaigns_created_by (created_by)
- idx_campaigns_status (status)
- idx_campaigns_type (type)
- idx_campaigns_created_at (created_at DESC)
- idx_campaigns_start_date (start_date)
- idx_campaigns_end_date (end_date)
- idx_campaigns_auto_managed (created_by, auto_managed, status)
- idx_campaigns_name_user_unique (created_by, name)

**Constraints:**
- CHECK: start_date <= end_date
- CHECK: all budgets >= 0

**Triggers:**
- update_campaigns_updated_at (updates updated_at)

---

### Table: campaign_tasks
**Purpose:** Track tasks associated with campaigns

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| created_by | UUID | FOREIGN KEY (auth.users) | User who created task |
| title | TEXT | NOT NULL | Task title |
| description | TEXT | NULL | Task description |
| status | TEXT | DEFAULT 'pending' | pending, in_progress, completed, cancelled |
| priority | TEXT | DEFAULT 'medium' | low, medium, high, urgent |
| due_date | TIMESTAMPTZ | NULL | Task due date |
| completed_at | TIMESTAMPTZ | NULL | When task was completed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage their own campaign tasks

**Indexes:**
- idx_campaign_tasks_campaign (campaign_id, status)
- idx_campaign_tasks_user_due (created_by, due_date) WHERE status != 'completed'

**Triggers:**
- update_campaign_tasks_updated_at (updates updated_at)

---

### Table: campaign_metrics
**Purpose:** Historical performance metrics for campaigns

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| metric_type | TEXT | NOT NULL | Type of metric (impressions, clicks, conversions, etc.) |
| metric_value | NUMERIC | NOT NULL | Metric value |
| metric_date | DATE | NOT NULL | Date of metric |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view/create/update/delete metrics for their own campaigns

**Indexes:**
- idx_campaign_metrics_campaign_id (campaign_id)
- idx_campaign_metrics_metric_date (metric_date DESC)
- idx_campaign_metrics_metric_type (metric_type)

---

### Table: campaign_performance_metrics
**Purpose:** Detailed performance metrics (similar to campaign_metrics)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| metric_name | TEXT | NOT NULL | Metric name |
| metric_value | NUMERIC | NOT NULL | Metric value |
| recorded_at | TIMESTAMPTZ | DEFAULT NOW() | When metric was recorded |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- idx_campaign_performance_campaign_id (campaign_id)
- idx_campaign_performance_recorded_at (recorded_at)

---

### Table: campaign_performance_monitor
**Purpose:** Real-time performance monitoring for autopilot optimization

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| channel | TEXT | NOT NULL | Marketing channel |
| metrics | JSONB | NOT NULL | Current metrics |
| benchmark_metrics | JSONB | NULL | Benchmark metrics for comparison |
| performance_score | REAL | DEFAULT 0 | Calculated performance score (0-100) |
| optimization_suggestions | JSONB | DEFAULT '[]' | AI-generated optimization suggestions |
| auto_actions_taken | JSONB | DEFAULT '[]' | Actions automatically taken |
| measured_at | TIMESTAMPTZ | DEFAULT NOW() | When measurement was taken |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view performance for their own campaigns
- Service role has full access

---

### Table: campaign_predictions
**Purpose:** AI-generated predictions for campaign performance

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| prediction_type | TEXT | NOT NULL | kpi_forecast, budget_optimization, performance_prediction |
| prediction_data | JSONB | NOT NULL | Prediction data and confidence intervals |
| confidence_score | REAL | NOT NULL | Confidence of prediction (0-1) |
| based_on_campaigns | JSONB | NULL | Historical campaign IDs used for prediction |
| actual_outcome | JSONB | NULL | Actual results after campaign completes |
| accuracy_score | REAL | NULL | Calculated accuracy (0-1) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view predictions for their own campaigns
- Service role has full access

---

### Table: generated_content_pieces
**Purpose:** Store AI-generated content for campaigns

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| content_type | TEXT | NOT NULL | blog_post, ad_copy, email, social_post, etc. |
| title | TEXT | NOT NULL | Content title |
| content | TEXT | NOT NULL | Full content |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| approval_status | TEXT | DEFAULT 'pending' | pending, approved, rejected, needs_revision |
| performance_data | JSONB | NULL | Performance metrics if published |
| created_by_agent | TEXT | DEFAULT 'ai_content_generator' | Which AI agent generated it |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage content for their own campaigns
- Service role has full access

---

## Lead Management

### Table: leads
**Purpose:** Central database for leads and prospects
**Owner:** User who created lead (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| first_name | TEXT | NULL | Lead first name |
| last_name | TEXT | NULL | Lead last name |
| email | TEXT | NULL, UNIQUE(created_by) | Email address |
| company | TEXT | NULL | Company name |
| job_title | TEXT | NULL | Job title |
| phone | TEXT | NULL | Phone number |
| industry | TEXT | NULL | Industry |
| company_size | TEXT | NULL | Company size (startup, small, medium, enterprise) |
| source | TEXT | NOT NULL | Lead source (website, email, event, referral, etc.) |
| status | TEXT | DEFAULT 'new' | new, contacted, qualified, converted, lost |
| lead_score | INTEGER | DEFAULT 0, CHECK (0-100) | Lead quality score |
| tags | TEXT[] | DEFAULT '{}' | Array of tags |
| created_by | UUID | FOREIGN KEY (auth.users) | User who created lead |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own leads

**Indexes:**
- idx_leads_created_by (created_by)
- idx_leads_status (status)
- idx_leads_source (source)
- idx_leads_created_at (created_at DESC)
- idx_leads_lead_score (lead_score DESC)
- idx_leads_email (email)
- idx_leads_company (company)
- idx_leads_email_user_unique (created_by, email) WHERE email IS NOT NULL

**Constraints:**
- CHECK: lead_score between 0 and 100
- CHECK: email format validation

**Triggers:**
- update_leads_updated_at (updates updated_at)

---

### Table: lead_activities
**Purpose:** Track all interactions with leads

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| lead_id | UUID | FOREIGN KEY (leads) | Associated lead |
| activity_type | TEXT | NOT NULL | email_opened, email_clicked, form_filled, call_scheduled, etc. |
| activity_data | JSONB | NOT NULL DEFAULT '{}' | Activity details |
| occurred_at | TIMESTAMPTZ | NOT NULL | When activity occurred |
| created_by | UUID | FOREIGN KEY (auth.users) | User who logged activity |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view activities for their own leads
- Users can create activities for their own leads
- Users can update/delete their own activities

**Indexes:**
- idx_lead_activities_lead_id (lead_id)
- idx_lead_activities_occurred_at (occurred_at DESC)
- idx_lead_activities_activity_type (activity_type)
- idx_lead_activities_created_by (created_by)

---

### Table: lead_scoring_rules
**Purpose:** Define rules for automated lead scoring

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| rule_name | TEXT | NOT NULL | Rule name |
| conditions | JSONB | NOT NULL | Conditions for scoring |
| score_weight | INTEGER | DEFAULT 0 | Weight/points assigned |
| is_active | BOOLEAN | DEFAULT true | Whether rule is active |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Accessible to authenticated users

---

### Table: autopilot_lead_inbox
**Purpose:** Simplified lead inbox for autopilot users

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE(with lead_id) | User |
| lead_id | UUID | FOREIGN KEY (leads) | Associated lead |
| full_name | TEXT | NULL | Lead full name |
| company_name | TEXT | NULL | Company name |
| email | TEXT | NULL | Email |
| phone | TEXT | NULL | Phone |
| source | TEXT | NULL | Lead source |
| score | INTEGER | NULL | Lead score |
| status | TEXT | DEFAULT 'new' | new, contacted, qualified, converted |
| notes | TEXT | NULL | Notes |
| received_at | TIMESTAMPTZ | DEFAULT NOW() | When lead was added |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can manage their lead inbox

---

## Content & Assets

### Table: content_calendar
**Purpose:** Plan and track content publishing schedule
**Owner:** User who created calendar entry (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | User who created |
| title | TEXT | NOT NULL | Content title |
| description | TEXT | NULL | Content description |
| content_type | TEXT | NOT NULL | blog, video, infographic, social, email, etc. |
| platform | TEXT | NULL | Target platform |
| scheduled_date | TIMESTAMPTZ | NOT NULL | When content should be published |
| status | TEXT | DEFAULT 'draft' | draft, scheduled, published, archived |
| content_data | JSONB | DEFAULT '{}' | Full content/outline |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own content calendar entries

**Indexes:**
- idx_content_calendar_created_by (created_by)
- idx_content_calendar_scheduled_date (scheduled_date)
- idx_content_calendar_status (status)

**Triggers:**
- update_content_calendar_updated_at (updates updated_at)

---

### Table: digital_assets
**Purpose:** Manage uploaded digital assets (images, videos, documents)
**Owner:** User who uploaded asset (uploaded_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| uploaded_by | UUID | FOREIGN KEY (auth.users) | User who uploaded |
| file_name | TEXT | NOT NULL | Original filename |
| file_size | BIGINT | NULL | File size in bytes |
| asset_type | TEXT | NOT NULL | image, video, document, audio |
| mime_type | TEXT | NULL | MIME type |
| storage_path | TEXT | NOT NULL | Path in storage bucket |
| access_url | TEXT | NULL | Public URL if applicable |
| metadata | JSONB | DEFAULT '{}' | File metadata |
| tags | TEXT[] | DEFAULT '{}' | Asset tags |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/upload/update/delete their own assets

**Indexes:**
- idx_digital_assets_uploaded_by (uploaded_by)
- idx_digital_assets_asset_type (asset_type)
- idx_digital_assets_created_at (created_at DESC)

**Triggers:**
- update_digital_assets_updated_at (updates updated_at)

---

### Table: brand_assets
**Purpose:** Store brand identity and styling assets
**Owner:** User who created (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | User who created |
| asset_name | TEXT | NOT NULL | Asset name |
| asset_type | TEXT | NOT NULL | logo, font, color_scheme, image, etc. |
| asset_data | JSONB | NOT NULL | Asset data or reference |
| metadata | JSONB | DEFAULT '{}' | Additional info |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own brand assets

**Indexes:**
- idx_brand_assets_created_by (created_by)

**Triggers:**
- update_brand_assets_updated_at (updates updated_at)

---

### Table: content_templates
**Purpose:** Reusable content templates
**Owner:** User who created (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | Creator |
| name | TEXT | NOT NULL | Template name |
| template_type | TEXT | NOT NULL | Type of template |
| content | TEXT | NOT NULL | Template content with variables |
| variables | JSONB | DEFAULT '{}' | Expected variables |
| is_public | BOOLEAN | DEFAULT false | Whether publicly available |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view templates they created or public templates
- Users can create/update/delete their own templates

**Indexes:**
- idx_content_templates_created_by (created_by)

**Triggers:**
- update_content_templates_updated_at (updates updated_at)

---

### Table: proposal_templates
**Purpose:** Store proposal and pitch templates
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | Template owner |
| name | TEXT | NOT NULL | Template name |
| content | TEXT | NOT NULL | Template content |
| sections | JSONB | DEFAULT '[]' | Content sections |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own proposal templates

**Indexes:**
- idx_proposal_templates_user_id (user_id)

**Triggers:**
- update_proposal_templates_updated_at (updates updated_at)

---

## Communication

### Table: email_campaigns
**Purpose:** Manage email marketing campaigns

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | TEXT | NOT NULL | Campaign name |
| subject_line | TEXT | NULL | Email subject |
| from_address | TEXT | NULL | From email |
| template_id | UUID | NULL | Email template |
| recipient_list JSONB | DEFAULT '[]' | List of recipients |
| status | TEXT | DEFAULT 'draft' | draft, scheduled, sent, failed |
| scheduled_for | TIMESTAMPTZ | NULL | When to send |
| sent_at | TIMESTAMPTZ | NULL | When actually sent |
| open_rate | NUMERIC | NULL | Open rate percentage |
| click_rate | NUMERIC | NULL | Click rate percentage |
| metadata | JSONB | DEFAULT '{}' | Campaign metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Authenticated users can manage email campaigns

---

### Table: email_templates
**Purpose:** Store reusable email templates

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | Creator |
| name | TEXT | NOT NULL | Template name |
| subject_line | TEXT | NOT NULL | Email subject template |
| html_content | TEXT | NOT NULL | HTML body |
| plain_text | TEXT | NULL | Plain text version |
| variables | JSONB | DEFAULT '{}' | Template variables |
| metadata | JSONB | DEFAULT '{}' | Additional info |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/delete their own templates

---

### Table: email_contacts
**Purpose:** Store email distribution lists and contacts

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | TEXT | NOT NULL | Contact email |
| name | TEXT | NULL | Contact name |
| company | TEXT | NULL | Company |
| tags | TEXT[] | DEFAULT '{}' | Contact tags |
| subscription_status | TEXT | DEFAULT 'subscribed' | subscribed, unsubscribed, bounced |
| metadata | JSONB | DEFAULT '{}' | Contact data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Authenticated users can view/create/update/delete contacts

---

### Table: email_automation_rules
**Purpose:** Define rules for automated email sending

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| rule_name | TEXT | NOT NULL | Rule name |
| trigger_type | TEXT | NOT NULL | Type of trigger |
| trigger_conditions | JSONB | DEFAULT '{}' | Conditions to trigger |
| action_type | TEXT | NOT NULL | Type of action |
| action_config | JSONB | DEFAULT '{}' | Action configuration |
| is_active | BOOLEAN | DEFAULT true | Whether rule is active |
| created_by | UUID | FOREIGN KEY (auth.users) | Creator |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage their email automation rules

**Triggers:**
- update_email_automation_rules_updated_at (updates updated_at)

---

### Table: chat_sessions
**Purpose:** Store user-AI chat conversation sessions
**Owner:** User who owns session (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | Session owner |
| title | TEXT | NOT NULL | Session title |
| metadata | JSONB | DEFAULT '{}' | Session metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own sessions

**Indexes:**
- idx_chat_sessions_user_id (user_id)
- idx_chat_sessions_updated_at (updated_at DESC)

**Triggers:**
- update_chat_sessions_updated_at (updates updated_at)

---

### Table: chat_messages
**Purpose:** Store individual messages within chat sessions
**Owner:** User who owns parent session

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| session_id | UUID | FOREIGN KEY (chat_sessions) | Parent session |
| user_message | TEXT | NOT NULL | User's message |
| ai_response | JSONB | NOT NULL | AI response (can be complex object) |
| agent_type | TEXT | NULL | Which agent responded |
| metadata | JSONB | DEFAULT '{}' | Message metadata |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Message timestamp |

**RLS Policies:**
- Users can view/create/update/delete messages in their sessions

**Indexes:**
- idx_chat_messages_session_id (session_id)
- idx_chat_messages_timestamp (timestamp DESC)

---

### Table: conversations (Alternative to chat_sessions)
**Purpose:** Alternative conversation tracking with vector embeddings
**Owner:** User who owns conversation (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | Conversation owner |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can manage their own conversations

**Indexes:**
- idx_conversations_user_id (user_id)

---

### Table: conversation_messages
**Purpose:** Messages in conversations with embeddings for semantic search
**Owner:** User who owns parent conversation

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| conversation_id | UUID | FOREIGN KEY (conversations) | Parent conversation |
| role | TEXT | CHECK IN ('user','assistant') | message sender role |
| content | TEXT | NOT NULL | Message content |
| embedding | vector(1536) | NULL | OpenAI ada-002 embedding |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Message timestamp |

**RLS Policies:**
- Users can manage messages in their conversations

**Indexes:**
- idx_conversation_messages_conversation (conversation_id)
- idx_conversation_messages_time (timestamp DESC)
- idx_conversation_messages_embedding (embedding vector_cosine_ops, IVFFLAT)

---

### Table: conversation_knowledge_refs
**Purpose:** Link conversations to knowledge base chunks for context

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| conversation_id | UUID | FOREIGN KEY (conversations) | Parent conversation |
| chunk_id | UUID | FOREIGN KEY (knowledge_chunks) | Referenced knowledge chunk |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can manage refs in their conversations

**Indexes:**
- idx_conversation_knowledge_conversation (conversation_id)
- idx_conversation_knowledge_chunk (chunk_id)

---

### Table: research_notes
**Purpose:** Store flagged/saved AI answers from conversations
**Owner:** User who owns parent conversation

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| conversation_id | UUID | FOREIGN KEY (conversations) | Parent conversation |
| content | TEXT | NOT NULL | Note content |
| source_refs | TEXT | NULL | Source references |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can manage their research notes

**Indexes:**
- idx_research_notes_conversation (conversation_id)

---

## Integrations & Connections

### Table: webhooks
**Purpose:** Manage outgoing webhooks for event notifications
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | Owner |
| name | TEXT | NOT NULL | Webhook name |
| url | TEXT | NOT NULL | Webhook endpoint URL |
| events | TEXT[] | DEFAULT '{}' | Events to trigger on |
| is_active | BOOLEAN | DEFAULT true | Whether webhook is active |
| secret_token | TEXT | NULL | Webhook secret for verification |
| last_triggered_at | TIMESTAMPTZ | NULL | Last trigger time |
| last_response_code | INTEGER | NULL | HTTP response code |
| retry_count | INTEGER | DEFAULT 0 | Number of retry attempts |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own webhooks

**Triggers:**
- update_webhooks_updated_at (updates updated_at)

---

### Table: integration_connections
**Purpose:** Manage connections to third-party services
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE(with service_name) | Owner |
| service_name | TEXT | NOT NULL | Service name (Salesforce, HubSpot, etc.) |
| connection_status | TEXT | DEFAULT 'disconnected' | connected, disconnected, error, pending |
| last_sync_at | TIMESTAMPTZ | NULL | Last sync timestamp |
| sync_status | TEXT | DEFAULT 'idle' | idle, syncing, error, success |
| configuration | JSONB | DEFAULT '{}' | Service configuration |
| error_message | TEXT | NULL | Error details if any |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own connections

**Indexes:**
- idx_integration_connections_user_id (user_id)
- idx_integration_connections_service_name (service_name)
- idx_integration_connections_connection_status (connection_status)

**Triggers:**
- update_integration_connections_updated_at (updates updated_at)

---

### Table: oauth_connections
**Purpose:** Store OAuth connections to social platforms
**Owner:** User who authorized (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE(with platform_name) | User |
| platform_name | TEXT | NOT NULL | Platform (Facebook, Twitter, LinkedIn, etc.) |
| platform_user_id | TEXT | NULL | User ID on platform |
| platform_username | TEXT | NULL | Username on platform |
| access_token_encrypted | TEXT | NOT NULL | Encrypted access token |
| refresh_token_encrypted | TEXT | NULL | Encrypted refresh token |
| token_expires_at | TIMESTAMPTZ | NULL | Token expiration |
| connection_status | TEXT | DEFAULT 'connected' | Connection status |
| connection_metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own connections

**Indexes:**
- idx_oauth_connections_user_id (user_id)
- idx_oauth_connections_platform_name (platform_name)
- idx_oauth_connections_user_platform_unique (user_id, platform_name)

**Triggers:**
- update_oauth_connections_updated_at (updates updated_at)

---

### Table: oauth_states
**Purpose:** Store OAuth state tokens for security
**Owner:** User initiating OAuth flow (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | Initiating user |
| state_token | TEXT | NOT NULL, UNIQUE | State token for CSRF protection |
| platform_name | TEXT | NOT NULL | Target platform |
| redirect_uri | TEXT | NOT NULL | Callback URI |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| expires_at | TIMESTAMPTZ | DEFAULT NOW() + 10 MINUTES | Token expiration |

**RLS Policies:**
- Users can manage their own OAuth states

**Indexes:**
- idx_oauth_states_token (state_token)
- idx_oauth_states_expires (expires_at)

---

### Table: social_platform_connections
**Purpose:** Track connections to social media platforms (legacy/alternate)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE(with platform_name) | User |
| platform_name | TEXT | NOT NULL | Platform name |
| connection_status | TEXT | DEFAULT 'disconnected' | Status |
| access_token_encrypted | TEXT | NULL | Encrypted token |
| refresh_token_encrypted | TEXT | NULL | Encrypted refresh token |
| token_expires_at | TIMESTAMPTZ | NULL | Token expiration |
| platform_user_id | TEXT | NULL | User ID on platform |
| platform_username | TEXT | NULL | Username |
| connection_metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their connections

**Indexes:**
- idx_social_connections_user_platform (user_id, platform_name)

**Triggers:**
- update_social_platform_connections_updated_at (updates updated_at)

---

### Table: social_engagement
**Purpose:** Track social media engagement metrics

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| post_id TEXT | NOT NULL | External post ID |
| platform TEXT | NOT NULL | Social platform |
| engagement_type TEXT | NOT NULL | like, comment, share, etc. |
| engagement_count INTEGER | NOT NULL | Count of engagement |
| recorded_at TIMESTAMPTZ | DEFAULT NOW() | When recorded |

**RLS Policies:**
- Anyone can view engagement (public data)
- Authenticated users can create/update engagement

---

### Table: generated_content
**Purpose:** Track generated social media content

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| content TEXT | NOT NULL | Generated content |
| platform TEXT | NOT NULL | Target platform |
| status TEXT | DEFAULT 'draft' | draft, scheduled, posted |
| metadata JSONB | DEFAULT '{}' | Content metadata |
| created_at TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Anyone can view (public)
- Authenticated users can create/update

---

## Knowledge Management

### Table: knowledge_buckets
**Purpose:** Group related knowledge documents
**Owner:** User who created (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | Owner |
| name | TEXT | NOT NULL, UNIQUE(with created_by) | Bucket name |
| bucket_type | TEXT | CHECK IN ('campaign', 'general') | Type of bucket |
| campaign_id | UUID | FOREIGN KEY (campaigns), conditional | Associated campaign (if campaign type) |
| description | TEXT | NULL | Bucket description |
| metadata | JSONB | DEFAULT '{}' | Metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage their own buckets

**Indexes:**
- idx_knowledge_buckets_user_type (created_by, bucket_type)
- idx_knowledge_buckets_campaign (campaign_id) WHERE campaign_id IS NOT NULL

**Constraints:**
- CHECK: (campaign and campaign_id required) OR (general and no campaign_id)

**Triggers:**
- update_knowledge_buckets_updated_at (updates updated_at)

---

### Table: knowledge_documents
**Purpose:** Store documents/files in knowledge base
**Owner:** User who created (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| bucket_id | UUID | FOREIGN KEY (knowledge_buckets) | Parent bucket |
| created_by | UUID | FOREIGN KEY (auth.users) | Uploader |
| title | TEXT | NOT NULL | Document title |
| content | TEXT | NOT NULL | Full text content |
| summary | TEXT | NULL | Document summary |
| file_name | TEXT | NULL | Original filename |
| file_type | TEXT | NULL | File type (pdf, docx, txt) |
| file_size | BIGINT | NULL | File size in bytes |
| upload_path | TEXT | NULL | Storage path |
| status | TEXT | DEFAULT 'processing' | processing, ready, failed |
| processing_error | TEXT | NULL | Error if failed |
| metadata | JSONB | DEFAULT '{}' | Document metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage documents in their buckets

**Indexes:**
- idx_knowledge_documents_bucket (bucket_id)
- idx_knowledge_documents_status (status)

**Triggers:**
- update_knowledge_documents_updated_at (updates updated_at)

---

### Table: knowledge_chunks
**Purpose:** Chunked documents for semantic search with embeddings
**Owner:** Inherited from bucket (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| document_id | UUID | FOREIGN KEY (knowledge_documents), UNIQUE(with chunk_index) | Parent document |
| bucket_id | UUID | FOREIGN KEY (knowledge_buckets) | Bucket reference |
| chunk_index | INTEGER | NOT NULL | Chunk sequence number |
| content | TEXT | NOT NULL | Chunk text |
| content_hash | TEXT | NOT NULL | SHA256 hash of content |
| token_count | INTEGER | NULL | Number of tokens in chunk |
| embedding | vector(1536) | NULL | OpenAI ada-002 embedding |
| metadata | JSONB | DEFAULT '{}' | Chunk metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can access chunks from their buckets

**Indexes:**
- idx_knowledge_chunks_document (document_id)
- idx_knowledge_chunks_bucket (bucket_id)
- idx_knowledge_chunks_embedding (embedding vector_cosine_ops, IVFFLAT)

---

### Table: knowledge_access_logs
**Purpose:** Audit trail for knowledge base usage

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| bucket_id | UUID | FOREIGN KEY (knowledge_buckets) | Accessed bucket |
| document_id | UUID | FOREIGN KEY (knowledge_documents) | Accessed document |
| chunk_id | UUID | FOREIGN KEY (knowledge_chunks) | Accessed chunk |
| agent_type | TEXT | NULL | Which agent accessed |
| query_text | TEXT | NULL | What was searched |
| similarity_score | FLOAT | NULL | Relevance score |
| used_in_response | BOOLEAN | DEFAULT false | Whether used in AI response |
| user_id | UUID | FOREIGN KEY (auth.users) | User who triggered |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Access timestamp |

**RLS Policies:**
- Users can view their own access logs

**Indexes:**
- idx_knowledge_access_logs_bucket (bucket_id)
- idx_knowledge_access_logs_user_time (user_id, created_at)

---

## AI & Automation

### Table: marketing_autopilot_config
**Purpose:** Configure and manage marketing autopilot for users
**Owner:** User who owns config (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE | User |
| business_description | TEXT | NOT NULL | Business description |
| target_audience | JSONB | DEFAULT '{}' | Target audience |
| monthly_budget | NUMERIC | NOT NULL | Monthly budget |
| goals | JSONB | DEFAULT '[]' | Campaign goals |
| ai_strategy | JSONB | DEFAULT '{}' | Generated AI strategy |
| is_active | BOOLEAN | DEFAULT true | Whether autopilot is active |
| last_optimized_at | TIMESTAMPTZ | NULL | Last optimization run |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage their own config

**Indexes:**
- idx_autopilot_config_user_id (user_id)
- idx_autopilot_config_active (user_id, is_active)

**Triggers:**
- update_autopilot_config_updated_at (updates updated_at)

---

### Table: autopilot_weekly_reports
**Purpose:** Weekly performance summaries for autopilot users
**Owner:** User who owns config (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users), UNIQUE(with week_start_date) | User |
| autopilot_config_id | UUID | FOREIGN KEY (marketing_autopilot_config) | Config reference |
| week_start_date | DATE | NOT NULL | Week start date |
| week_end_date | DATE | NOT NULL | Week end date |
| total_leads_generated | INTEGER | DEFAULT 0 | Leads generated |
| total_spend | NUMERIC | DEFAULT 0 | Money spent |
| roi | NUMERIC | DEFAULT 0 | Return on investment |
| top_performing_channel | TEXT | NULL | Best channel |
| summary | JSONB | DEFAULT '{}' | Weekly summary |
| ai_insights | JSONB | DEFAULT '{}' | AI-generated insights |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view their own reports

**Indexes:**
- idx_autopilot_reports_user_date (user_id, week_start_date DESC)

---

### Table: autopilot_activity_log
**Purpose:** Audit trail for all autopilot actions
**Owner:** User who owns config (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| autopilot_config_id | UUID | FOREIGN KEY (marketing_autopilot_config) | Config reference |
| activity_type | TEXT | NOT NULL | Type of activity (campaign_created, etc.) |
| activity_description | TEXT | NOT NULL | Description |
| entity_type | TEXT | NULL | Type of entity (campaign, ad, lead_form) |
| entity_id | UUID | NULL | ID of entity |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| impact_metrics | JSONB | DEFAULT '{}' | Metrics changed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view their own activity logs

**Indexes:**
- idx_autopilot_activity_user_date (user_id, created_at DESC)

---

### Table: campaign_copilot_sessions
**Purpose:** Track AI-assisted campaign design sessions
**Owner:** User who owns session (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| brief_data | JSONB | NOT NULL | Campaign brief |
| generated_campaign | JSONB | NULL | AI-generated campaign |
| interaction_history | JSONB | DEFAULT '[]' | Chat history |
| status | TEXT | DEFAULT 'active' | active, completed, saved |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can manage their copilot sessions

**Triggers:**
- update_copilot_sessions_updated_at (updates updated_at)

---

### Table: ai_interaction_feedback
**Purpose:** Collect feedback on AI-generated content for learning
**Owner:** User providing feedback (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | NOT NULL | User |
| session_id | UUID | NULL | Related session |
| interaction_type | TEXT | NOT NULL | edit, approve, regenerate, reject |
| original_suggestion | JSONB | NOT NULL | Original AI suggestion |
| user_modification | JSONB | NULL | User's modifications |
| context_data | JSONB | NOT NULL | Context (campaign brief, etc.) |
| feedback_score | INTEGER | NULL | 1-5 rating |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | When provided |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can create their own feedback
- Users can view their own feedback
- Service role can access all for learning

**Indexes:**
- idx_ai_feedback_user_id (user_id)
- idx_ai_feedback_interaction_type (interaction_type)
- idx_ai_feedback_timestamp (timestamp)

---

### Table: agent_learning_data
**Purpose:** Learned patterns from user interactions
**Owner:** System (service role only)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| agent_type | TEXT | NOT NULL | Which agent (audience, channel, etc.) |
| pattern_data | JSONB | NOT NULL | Learned patterns |
| confidence_score | REAL | DEFAULT 0.5 | Confidence (0-1) |
| usage_count | INTEGER | DEFAULT 0 | How many times used |
| success_rate | REAL | DEFAULT 0.5 | Success rate (0-1) |
| last_updated | TIMESTAMPTZ | DEFAULT NOW() | Last update |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Service role only (manages learning)

---

### Table: ai_video_projects
**Purpose:** Store user AI video generation projects
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | Owner |
| campaign_id | UUID | FOREIGN KEY (campaigns) | Associated campaign |
| goal | TEXT | NOT NULL | Video goal |
| platform | TEXT | CHECK IN (...) | YouTubeShort, TikTok, Reels, Landscape |
| duration_s | INTEGER | DEFAULT 8, CHECK (1-120) | Duration in seconds |
| brand_kit | JSONB | DEFAULT '{}' | Brand styling |
| scene_plan | JSONB | NULL | AI-generated scene breakdown |
| generated_images | TEXT[] | NULL | Nano Banana image URLs |
| final_prompt | TEXT | NULL | Final Veo 3 prompt |
| video_url | TEXT | NULL | Output video URL |
| veo_operation_id | TEXT | NULL | Veo 3 job ID for polling |
| status | TEXT | DEFAULT 'draft' | draft, planning, generating_images, generating_video, completed, failed |
| error_message | TEXT | NULL | Error if failed |
| cost_usd | NUMERIC(10,4) | DEFAULT 0 | Actual cost in USD |
| auto_generated | BOOLEAN | DEFAULT false | Whether autopilot generated |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| completed_at | TIMESTAMPTZ | NULL | Completion timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own projects

**Indexes:**
- idx_ai_video_projects_user_id (user_id, created_at DESC)
- idx_ai_video_projects_campaign_id (campaign_id)
- idx_ai_video_projects_status (user_id, status)
- idx_ai_video_projects_auto_generated (user_id, auto_generated, created_at DESC)

**Triggers:**
- update_ai_video_projects_updated_at (updates updated_at)

---

### Table: ai_video_jobs
**Purpose:** Background jobs for video generation steps
**Owner:** User who owns project (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FOREIGN KEY (ai_video_projects) | Parent project |
| user_id | UUID | FOREIGN KEY (auth.users) | Owner |
| job_type | TEXT | CHECK IN ('image_generation', 'video_generation') | Job type |
| veo_operation_id | TEXT | NULL | External job ID |
| status | TEXT | DEFAULT 'pending' | pending, processing, completed, failed |
| result_url | TEXT | NULL | Result URL |
| error_message | TEXT | NULL | Error message |
| metadata | JSONB | DEFAULT '{}' | Job metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| completed_at | TIMESTAMPTZ | NULL | Completion timestamp |

**RLS Policies:**
- Users can view/create/update their own jobs

**Indexes:**
- idx_ai_video_jobs_project_id (project_id, status)
- idx_ai_video_jobs_user_id (user_id, status, created_at DESC)

**Triggers:**
- update_ai_video_jobs_updated_at (updates updated_at)

---

### Table: ai_model_configs
**Purpose:** Automatic discovery and management of AI models
**Owner:** System (service role manages, authenticated users read)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| provider | TEXT | CHECK IN ('openai', 'anthropic', 'google', 'mistral') | AI provider |
| model_name | TEXT | NOT NULL, UNIQUE(with provider) | Model identifier |
| model_type | TEXT | CHECK IN ('flagship', 'fast', 'legacy') | Model classification |
| is_active | BOOLEAN | DEFAULT true | Whether model is available |
| is_default | BOOLEAN | DEFAULT false | Default for provider |
| capabilities | JSONB | DEFAULT '{}' | Model capabilities |
| pricing | JSONB | DEFAULT '{}' | Pricing info |
| max_tokens | INTEGER | NULL | Max output tokens |
| context_window | INTEGER | NULL | Context window size |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| discovered_at | TIMESTAMPTZ | DEFAULT NOW() | Discovery timestamp |
| last_validated_at | TIMESTAMPTZ | NULL | Last validation |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Service role full access
- Authenticated users read-only

**Indexes:**
- idx_ai_model_configs_provider (provider)
- idx_ai_model_configs_type (model_type)
- idx_ai_model_configs_active (is_active)
- idx_ai_model_configs_default (is_default)

**Triggers:**
- update_ai_model_configs_updated_at_trigger (updates updated_at)

**Initial Data (Oct 28, 2025):**
- OpenAI: gpt-5, gpt-5-mini, gpt-5-nano, gpt-4.1, gpt-4.1-mini, o3, o4-mini
- Anthropic: claude-sonnet-4.5, claude-opus-4.1, claude-haiku-4-5, claude-sonnet-4
- Google: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash
- Mistral: mistral-large-latest, mistral-medium-latest

---

### Table: ai_model_update_logs
**Purpose:** Track monthly model discovery runs
**Owner:** System (service role only)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| run_date | TIMESTAMPTZ | DEFAULT NOW() | When discovery run occurred |
| models_discovered | INTEGER | DEFAULT 0 | Total models found |
| models_added | INTEGER | DEFAULT 0 | New models added |
| models_deprecated | INTEGER | DEFAULT 0 | Models removed |
| providers_checked | TEXT[] | DEFAULT '{}' | Providers checked |
| errors | JSONB | DEFAULT '[]' | Any errors encountered |
| execution_time_ms | INTEGER | NULL | How long it took |
| status | TEXT | CHECK IN ('success', 'partial', 'failed') | Overall status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Service role full access
- Authenticated users read-only

**Indexes:**
- idx_ai_model_update_logs_run_date (run_date DESC)

---

## Analytics & Reporting

### Table: campaign_metrics (detailed metrics)
**Purpose:** Detailed metrics similar to campaign_performance_metrics

Already covered above in Campaign Management section

---

### Table: performance_analytics
**Purpose:** User analytics and performance tracking
**Owner:** User who created (created_by)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | Creator |
| metric_type | TEXT | NOT NULL | Type of metric |
| metric_data | JSONB | NOT NULL | Metric data |
| time_period | TIMESTAMPTZ | NOT NULL | Period covered |
| metadata | JSONB | DEFAULT '{}' | Additional info |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view/create analytics they created

---

### Table: analytics_reports
**Purpose:** Generated analytics reports

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| report_type | TEXT | NOT NULL | Type of report |
| report_data | JSONB | NOT NULL | Report data |
| generated_at | TIMESTAMPTZ | DEFAULT NOW() | Generation time |

**RLS Policies:**
- Authenticated users can view/create reports

---

### Table: real_time_metrics
**Purpose:** Real-time tracking of entity metrics

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| entity_type | TEXT | NOT NULL | campaign, lead, social_post, etc. |
| entity_id | UUID | NOT NULL | ID of entity |
| metric_type | TEXT | NOT NULL | Type of metric |
| current_value | NUMERIC | NOT NULL | Current value |
| previous_value | NUMERIC | DEFAULT 0 | Previous value |
| change_percentage | NUMERIC | DEFAULT 0 | Percent change |
| recorded_at | TIMESTAMPTZ | DEFAULT NOW() | Record timestamp |

**RLS Policies:**
- Accessible to authenticated users

**Indexes:**
- idx_real_time_metrics_entity (entity_type, entity_id)
- idx_real_time_metrics_recorded_at (recorded_at)

---

### Table: ai_insights
**Purpose:** AI-generated insights and recommendations

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| insight_type | TEXT | NOT NULL | Type of insight |
| insight_data | JSONB | NOT NULL | Insight data |
| confidence_score | REAL | NULL | Confidence |
| generated_at | TIMESTAMPTZ | DEFAULT NOW() | Generation time |

**RLS Policies:**
- Authenticated users can view/create/update insights

---

### Table: user_analytics_events
**Purpose:** Track user interactions for form optimization

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| event_type | TEXT | NOT NULL | Event type |
| event_data | JSONB | DEFAULT '{}' | Event details |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can create/view their own events

**Indexes:**
- idx_user_analytics_events_user_id (user_id)
- idx_user_analytics_events_type (event_type)
- idx_user_analytics_events_created_at (created_at)

---

### Table: keyword_research
**Purpose:** Store keyword research results

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| created_by | UUID | FOREIGN KEY (auth.users) | Creator |
| query | TEXT | NOT NULL | Search query |
| keywords | JSONB | DEFAULT '[]' | Results |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own research

**Indexes:**
- idx_keyword_research_created_by (created_by)
- idx_keyword_research_created_at (created_at)
- idx_keyword_research_query (query)

**Triggers:**
- update_keyword_research_updated_at (updates updated_at)

---

## Strategic Marketing Tables

### Table: brand_positioning_analyses
**Purpose:** Store 3Cs brand positioning analysis results
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| positioning_statement | TEXT | NOT NULL | Brand positioning statement |
| differentiators | JSONB | DEFAULT '[]' | Key differentiators |
| brand_tone | JSONB | DEFAULT '{}' | Brand voice and tone |
| three_cs_analysis | JSONB | DEFAULT '{}' | Company, Customer, Competition analysis |
| recommendations | JSONB | DEFAULT '[]' | AI recommendations |
| input_data | JSONB | DEFAULT '{}' | Original input data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own analyses

**Indexes:**
- idx_brand_positioning_analyses_user_id (user_id, created_at DESC)

**Triggers:**
- update_brand_positioning_analyses_updated_at (updates updated_at)

---

### Table: funnel_designs
**Purpose:** Store complete sales funnel designs
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| business_type | TEXT | NOT NULL | Type of business |
| funnel_structure | JSONB | DEFAULT '{}' | Awareness, Engagement, Conversion, Retention stages |
| input_data | JSONB | DEFAULT '{}' | Original input |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own funnels

**Indexes:**
- idx_funnel_designs_user_id (user_id, created_at DESC)
- idx_funnel_designs_business_type (business_type)

**Triggers:**
- update_funnel_designs_updated_at (updates updated_at)

---

### Table: competitive_gap_analyses
**Purpose:** Store competitive gap analysis results
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| our_brand | TEXT | NOT NULL | User's brand name |
| competitors | TEXT[] | NOT NULL | Competitor names |
| gap_analysis | JSONB | DEFAULT '{}' | Messaging, channel, audience, content gaps |
| ownable_differentiator | JSONB | DEFAULT '{}' | Recommended differentiator |
| input_data | JSONB | DEFAULT '{}' | Original input |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own analyses

**Indexes:**
- idx_competitive_gap_analyses_user_id (user_id, created_at DESC)

**Triggers:**
- update_competitive_gap_analyses_updated_at (updates updated_at)

---

### Table: performance_tracking_frameworks
**Purpose:** Store KPI tracking frameworks
**Owner:** User who created (user_id)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User |
| campaign_name | TEXT | NOT NULL | Campaign name |
| channels | TEXT[] | NOT NULL | Channels to track |
| tracking_framework | JSONB | DEFAULT '{}' | KPI definitions and tracking |
| input_data | JSONB | DEFAULT '{}' | Original input |
| is_active | BOOLEAN | DEFAULT true | Whether framework is active |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete their own frameworks

**Indexes:**
- idx_performance_tracking_frameworks_user_id (user_id, created_at DESC)
- idx_performance_tracking_frameworks_active (user_id, is_active, created_at DESC)

**Triggers:**
- update_performance_tracking_frameworks_updated_at (updates updated_at)

---

## Support & Privacy Tables

### Table: support_tickets
**Purpose:** Customer support ticket system
**Owner:** User who created (user_id) or anonymous

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (auth.users) | User (can be null for anonymous) |
| email | TEXT | NOT NULL | Contact email |
| name | TEXT | NOT NULL | Ticket creator name |
| subject | TEXT | NOT NULL | Ticket subject |
| message | TEXT | NOT NULL | Ticket description |
| status | TEXT | DEFAULT 'open' | open, in_progress, resolved, closed |
| priority | TEXT | DEFAULT 'normal' | low, normal, high, urgent |
| admin_notes | TEXT | NULL | Internal notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| resolved_at | TIMESTAMPTZ | NULL | Resolution timestamp |

**RLS Policies:**
- Authenticated users can view/create their own tickets
- Anonymous users can create tickets (TO anon)

**Indexes:**
- idx_support_tickets_user_id (user_id)
- idx_support_tickets_status (status)
- idx_support_tickets_created_at (created_at DESC)

**Triggers:**
- support_tickets_updated_at (updates updated_at)

---

## Database Functions

### Core Utility Functions

#### update_updated_at_column()
**Purpose:** Trigger function to automatically update `updated_at` timestamp
**Parameters:** None
**Returns:** TRIGGER
**Security:** DEFINER
**Usage:**
```sql
CREATE TRIGGER table_updated_at BEFORE UPDATE ON table
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

#### cleanup_expired_oauth_states()
**Purpose:** Delete expired OAuth state tokens
**Parameters:** None
**Returns:** void
**Security:** None specified
**Cron:** Can be run periodically

---

### Autopilot Functions

#### log_autopilot_activity(p_user_id, p_config_id, p_activity_type, p_description, p_entity_type, p_entity_id, p_metadata)
**Purpose:** Log an autopilot activity to activity log
**Parameters:**
- p_user_id: UUID - User ID
- p_config_id: UUID - Autopilot config ID
- p_activity_type: TEXT - Activity type
- p_description: TEXT - Description
- p_entity_type: TEXT (optional) - Entity type
- p_entity_id: UUID (optional) - Entity ID
- p_metadata: JSONB (optional) - Additional data
**Returns:** UUID - Activity ID
**Security:** DEFINER

---

#### get_autopilot_dashboard_stats(p_user_id)
**Purpose:** Get dashboard statistics for autopilot user
**Parameters:**
- p_user_id: UUID - User ID
**Returns:** JSONB
**Contains:**
- this_week_leads
- this_week_spend
- this_week_roi
- total_leads
- week_start
**Security:** DEFINER

---

### Knowledge Base Functions

#### search_knowledge_chunks(p_user_id, p_query_embedding, p_bucket_type, p_campaign_id, p_limit, p_similarity_threshold)
**Purpose:** Semantic search in knowledge base chunks using vector similarity
**Parameters:**
- p_user_id: UUID - User ID
- p_query_embedding: vector(1536) - Query embedding (OpenAI ada-002)
- p_bucket_type: TEXT (optional) - 'campaign' or 'general'
- p_campaign_id: UUID (optional) - Filter by campaign
- p_limit: INTEGER (default 10) - Max results
- p_similarity_threshold: FLOAT (default 0.7) - Min similarity (0-1)
**Returns:** TABLE with:
- chunk_id
- bucket_id
- document_id
- bucket_name
- document_title
- document_summary
- chunk_content
- chunk_index
- similarity_score
- metadata
**Security:** DEFINER
**Implementation:** Uses cosine distance (`<=>` operator) for similarity

---

### AI Model Functions

#### get_default_model(p_provider, p_type)
**Purpose:** Get default model for a provider
**Parameters:**
- p_provider: TEXT - Provider name
- p_type: TEXT (default 'flagship') - Model type
**Returns:** TABLE with:
- model_name
- capabilities
- pricing
- context_window
**Security:** Not specified

---

### Seed/Demo Functions

#### seed_demo_data(demo_user_id)
**Purpose:** Create demo data for testing
**Parameters:**
- demo_user_id: UUID (optional) - User ID (uses auth.uid() if not provided)
**Returns:** void
**Creates:**
- Sample campaigns
- Sample leads
- Sample lead activities
- Sample metrics
**Security:** DEFINER

---

### Trigger Functions

#### update_user_secrets_updated_at()
**Purpose:** Update user_secrets.updated_at before update

#### update_support_ticket_updated_at()
**Purpose:** Update support_tickets.updated_at before update

#### update_chat_sessions_updated_at()
**Purpose:** Update chat_sessions.updated_at before update

#### update_oauth_connections_updated_at()
**Purpose:** Update oauth_connections.updated_at before update

#### update_knowledge_updated_at()
**Purpose:** Update knowledge_buckets/documents.updated_at before update

#### update_ai_video_updated_at()
**Purpose:** Update ai_video_projects/jobs.updated_at before update

#### update_ai_video_projects_updated_at()
**Purpose:** Specific trigger for ai_video_projects

#### update_ai_video_jobs_updated_at()
**Purpose:** Specific trigger for ai_video_jobs

#### update_ai_model_configs_updated_at_trigger()
**Purpose:** Update ai_model_configs.updated_at before update

---

## Database Triggers

### List of All Triggers

| Table | Trigger Name | Event | Action |
|-------|-------------|-------|--------|
| user_preferences | update_user_preferences_updated_at | BEFORE UPDATE | update_updated_at_column() |
| user_secrets | update_user_secrets_updated_at | BEFORE UPDATE | update_user_secrets_updated_at() |
| user_privacy_settings | update_user_privacy_settings_updated_at | BEFORE UPDATE | update_updated_at_column() |
| marketing_autopilot_config | update_autopilot_config_updated_at | BEFORE UPDATE | update_updated_at_column() |
| campaign_tasks | update_campaign_tasks_updated_at | BEFORE UPDATE | update_updated_at_column() |
| social_platform_connections | update_social_platform_connections_updated_at | BEFORE UPDATE | update_updated_at_column() |
| email_automation_rules | update_email_automation_rules_updated_at | BEFORE UPDATE | update_updated_at_column() |
| webhooks | update_webhooks_updated_at | BEFORE UPDATE | update_updated_at_column() |
| integration_connections | update_integration_connections_updated_at | BEFORE UPDATE | update_updated_at_column() |
| oauth_connections | oauth_connections_updated_at | BEFORE UPDATE | update_oauth_connections_updated_at() |
| chat_sessions | chat_sessions_updated_at_trigger | BEFORE UPDATE | update_chat_sessions_updated_at() |
| keyword_research | update_keyword_research_updated_at | BEFORE UPDATE | update_updated_at_column() |
| campaign_copilot_sessions | update_copilot_sessions_updated_at | BEFORE UPDATE | update_updated_at_column() |
| knowledge_buckets | knowledge_buckets_updated_at | BEFORE UPDATE | update_knowledge_updated_at() |
| knowledge_documents | knowledge_documents_updated_at | BEFORE UPDATE | update_knowledge_updated_at() |
| ai_video_projects | update_ai_video_projects_updated_at | BEFORE UPDATE | update_ai_video_updated_at() |
| ai_video_jobs | update_ai_video_jobs_updated_at | BEFORE UPDATE | update_ai_video_updated_at() |
| brand_positioning_analyses | update_brand_positioning_analyses_updated_at | BEFORE UPDATE | update_updated_at_column() |
| funnel_designs | update_funnel_designs_updated_at | BEFORE UPDATE | update_updated_at_column() |
| competitive_gap_analyses | update_competitive_gap_analyses_updated_at | BEFORE UPDATE | update_updated_at_column() |
| performance_tracking_frameworks | update_performance_tracking_frameworks_updated_at | BEFORE UPDATE | update_updated_at_column() |
| support_tickets | support_tickets_updated_at | BEFORE UPDATE | update_support_ticket_updated_at() |
| ai_model_configs | update_ai_model_configs_updated_at_trigger | BEFORE UPDATE | update_ai_model_configs_updated_at() |

---

## Relationships Map

### Foreign Key Relationships

```
auth.users
├── user_preferences (user_id) [1:1]
├── user_secrets (user_id) [1:N] - UNIQUE on (user_id, service_name)
├── secret_audit_logs (user_id) [1:N]
├── user_privacy_settings (user_id) [1:1]
├── data_export_requests (user_id) [1:N]
├── data_deletion_requests (user_id) [1:N]
├── privacy_audit_log (user_id) [1:N]
├── campaigns (created_by) [1:N]
│   ├── campaign_tasks (campaign_id) [1:N]
│   ├── campaign_metrics (campaign_id) [1:N]
│   ├── campaign_performance_metrics (campaign_id) [1:N]
│   ├── campaign_performance_monitor (campaign_id) [1:N]
│   ├── campaign_predictions (campaign_id) [1:N]
│   ├── generated_content_pieces (campaign_id) [1:N]
│   ├── ai_video_projects (campaign_id) [1:N]
│   │   └── ai_video_jobs (project_id) [1:N]
│   ├── knowledge_buckets (campaign_id) [0:1] (optional, if campaign type)
│   │   └── knowledge_documents (bucket_id) [1:N]
│   │       └── knowledge_chunks (document_id) [1:N]
│   │           └── knowledge_access_logs (chunk_id) [0:1]
│   └── knowledge_buckets (campaign_id) [1:1] (optional for campaigns)
├── leads (created_by) [1:N]
│   └── lead_activities (lead_id) [1:N]
├── content_calendar (created_by) [1:N]
├── digital_assets (uploaded_by) [1:N]
├── brand_assets (created_by) [1:N]
├── content_templates (created_by) [1:N]
├── proposal_templates (user_id) [1:N]
├── email_campaigns (user_id) [1:N]
├── email_templates (created_by) [1:N]
├── email_automation_rules (created_by) [1:N]
├── webhooks (user_id) [1:N]
├── integration_connections (user_id) [1:N] - UNIQUE on (user_id, service_name)
├── oauth_connections (user_id) [1:N] - UNIQUE on (user_id, platform_name)
├── oauth_states (user_id) [1:N]
├── social_platform_connections (user_id) [1:N]
├── chat_sessions (user_id) [1:N]
│   ├── chat_messages (session_id) [1:N]
│   ├── conversations (user_id) [1:N]
│   │   ├── conversation_messages (conversation_id) [1:N]
│   │   ├── conversation_knowledge_refs (conversation_id) [1:N]
│   │   │   └── knowledge_chunks (chunk_id) [0:1]
│   │   └── research_notes (conversation_id) [1:N]
├── knowledge_buckets (created_by) [1:N]
│   ├── knowledge_documents (bucket_id) [1:N]
│   │   └── knowledge_chunks (document_id) [1:N]
│   └── knowledge_access_logs (bucket_id) [1:N]
├── marketing_autopilot_config (user_id) [1:1]
│   ├── autopilot_weekly_reports (autopilot_config_id) [1:N]
│   └── autopilot_activity_log (autopilot_config_id) [1:N]
├── autopilot_lead_inbox (user_id) [1:N]
├── keyword_research (created_by) [1:N]
├── ai_interaction_feedback (user_id) [1:N]
├── campaign_copilot_sessions (user_id) [1:N]
├── ai_video_projects (user_id) [1:N]
│   └── ai_video_jobs (user_id) [1:N] (also links to project)
├── brand_positioning_analyses (user_id) [1:N]
├── funnel_designs (user_id) [1:N]
├── competitive_gap_analyses (user_id) [1:N]
├── performance_tracking_frameworks (user_id) [1:N]
├── support_tickets (user_id) [0:N] (nullable for anonymous)
├── user_analytics_events (user_id) [0:N]
└── ai_model_configs - no user FK (global, service-managed)
```

### Data Flow Relationships

**Campaign Workflow:**
1. User creates campaign (campaigns table)
2. Campaign can have tasks (campaign_tasks)
3. Campaign gets metrics (campaign_metrics, campaign_performance_metrics)
4. Autopilot monitors performance (campaign_performance_monitor)
5. AI generates predictions (campaign_predictions)
6. AI generates content (generated_content_pieces)
7. User can generate videos (ai_video_projects → ai_video_jobs)
8. Campaign can have knowledge base (knowledge_buckets)

**Lead Workflow:**
1. User creates lead (leads table)
2. Lead has activities (lead_activities)
3. Lead score is calculated (lead_scoring_rules)
4. Autopilot tracks leads (autopilot_lead_inbox)

**Knowledge Base Workflow:**
1. User creates bucket (knowledge_buckets)
2. Upload documents (knowledge_documents)
3. Documents chunked (knowledge_chunks)
4. Chunks embedded (embedding field)
5. Semantic search used (knowledge_chunks via search function)
6. Access logged (knowledge_access_logs)
7. Referenced in conversations (conversation_knowledge_refs)

**AI Copilot Workflow:**
1. User creates chat session (chat_sessions)
2. Messages exchanged (chat_messages)
3. Feedback collected (ai_interaction_feedback)
4. Patterns learned (agent_learning_data)
5. Campaign copilot session (campaign_copilot_sessions)

**Video Generation Workflow:**
1. User creates project (ai_video_projects)
2. Background jobs process (ai_video_jobs)
3. Images generated (stored via Nano Banana)
4. Final video generated (Veo 3)
5. Cost tracked (cost_usd field)
6. Auto-generation by autopilot (auto_generated flag)

---

## Views

### autopilot_cron_monitor
**Purpose:** Monitor pg_cron job execution
**Columns:**
- jobid
- schedule
- command
- nodename
- nodeport
- database
- username
- active
- jobname
**Access:** SELECT for authenticated users

---

### ai_video_stats
**Purpose:** Analytics for video generation usage
**Columns:**
- user_id
- total_videos
- autopilot_videos
- manual_videos
- completed_videos
- failed_videos
- total_cost_usd
- avg_cost_per_video
- last_video_created
**Access:** SELECT for authenticated users

---

## Storage Buckets

### ai-videos
**Purpose:** Store generated AI videos
**Public:** Yes
**Policies:**
- Users can upload to their own folder: `bucket_id = 'ai-videos' AND (foldername(name))[1] = auth.uid()::text`
- Users can read their own videos
- Users can delete their own videos
**Path Format:** `{user_id}/{filename}`

---

## Cron Jobs (pg_cron)

### autopilot-daily-orchestration
**Schedule:** 0 2 * * * (Every day at 2 AM UTC)
**Action:** Calls `autopilot-orchestrator` Edge Function
**Purpose:** Daily campaign optimization, budget adjustments, etc.

### autopilot-weekly-reports
**Schedule:** 0 9 * * 1 (Every Monday at 9 AM UTC)
**Action:** Calls `autopilot-weekly-report` Edge Function
**Purpose:** Generate weekly performance summaries

### Manual Triggers Available
```sql
SELECT trigger_autopilot_orchestration();
SELECT trigger_weekly_report_generation();
```

---

## Enums and Type Definitions

### campaign_type
- lead_generation
- brand_awareness
- product_launch
- email
- social_media
- custom

### lead_status
- new
- contacted
- qualified
- converted
- lost

### campaign_status
- draft
- active
- paused
- completed

### email_subscription_status
- subscribed
- unsubscribed
- bounced

### ai_video_status
- draft
- planning
- generating_images
- generating_video
- completed
- failed

### ai_video_platform
- YouTubeShort
- TikTok
- Reels
- Landscape

### knowledge_bucket_type
- campaign
- general

### knowledge_document_status
- processing
- ready
- failed

### ai_model_type
- flagship
- fast
- legacy

### ai_provider
- openai
- anthropic
- google
- mistral

### support_ticket_status
- open
- in_progress
- resolved
- closed

### support_ticket_priority
- low
- normal
- high
- urgent

---

## Performance Optimization Notes

### Indexes Strategy
- **Foreign keys:** Indexed by default via relationships
- **User filtering:** user_id indexed where RLS required
- **Date ranges:** created_at DESC indexed for recent queries
- **Composite indexes:** (user_id, status) for common filters
- **Vector indexes:** IVFFLAT for embedding similarity search
- **Partial indexes:** WHERE clauses for filtered queries

### Query Optimization Tips
1. Always filter by user_id first (RLS)
2. Use created_at DESC with LIMIT for recent items
3. Leverage composite indexes for multi-column filters
4. Use vector indexes for semantic search
5. Paginate large result sets
6. Cache embedding queries

### Index Usage by Query Pattern
```sql
-- Pattern 1: User's recent items
SELECT * FROM table WHERE user_id = X ORDER BY created_at DESC LIMIT 10;
-- Uses: idx_table_user_created_at or idx_table_user_id

-- Pattern 2: Filter by status and user
SELECT * FROM table WHERE user_id = X AND status = 'active';
-- Uses: idx_table_user_status

-- Pattern 3: Vector similarity
SELECT * FROM table WHERE (embedding <=> query_embedding) < threshold;
-- Uses: idx_table_embedding (IVFFLAT)

-- Pattern 4: Unique constraint check
SELECT * FROM table WHERE user_id = X AND service_name = 'Y';
-- Uses: UNIQUE constraint (user_id, service_name)
```

---

## Data Retention & Privacy

### User Data Retention
- Controlled by `user_privacy_settings.data_retention_days` (default 730 days)
- Supports GDPR "right to be forgotten"
- Data export via `data_export_requests`
- Data deletion via `data_deletion_requests`
- Audit trail via `privacy_audit_log`

### Encryption
- API keys stored in `user_secrets` with encryption
- IV (initialization vector) stored separately
- Decryption handled server-side only
- Audit logs track secret operations

### RLS Security
- Every user-owned table has RLS enabled
- Policies use `auth.uid()` for user isolation
- Service role has elevated access for background jobs
- Anonymous users have limited access (e.g., support tickets)

---

## Known Limitations & TODO

### Current Gaps
1. Some tables missing NOT NULL constraints (campaigns.created_by fixed in migration)
2. Duplicate tables: chat_sessions vs conversations (legacy support)
3. No built-in archival strategy (consider soft deletes)
4. Vector embeddings require manual population
5. No automatic JWT refresh token management

### Recommended Enhancements
1. Add audit logging trigger to all tables
2. Implement soft delete pattern with is_deleted flag
3. Add data versioning for important entities
4. Create materialized views for complex analytics
5. Add row-level filtering for shared campaigns

---

## References

### Key Migrations
- `20250610120000_autopilot_system.sql` - Autopilot tables
- `20250610130000_autopilot_campaigns.sql` - Campaign autopilot integration
- `20250610140000_autopilot_cron_jobs.sql` - Cron scheduling
- `20251008000000_ai_video_system.sql` - Video generation
- `20251011000000_strategic_marketing_agents.sql` - Strategic analysis tables
- `20251024000000_support_tickets.sql` - Support system
- `20251028000000_ai_model_management.sql` - Model discovery

### Important Files
- Seed data: `/database-seed.sql`
- Type definitions: `/src/types/`
- Backend database module: `/backend/database.py`

