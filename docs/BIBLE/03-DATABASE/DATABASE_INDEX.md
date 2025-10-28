# Database Documentation Index

This folder contains comprehensive documentation for the Action Insight Pilot database schema.

---

## Available Documentation

### 1. DATABASE_SCHEMA_COMPLETE.md (2,358 lines)
**Comprehensive reference for the entire database schema**

Most detailed documentation available. Covers:
- All 60+ tables with complete column definitions
- All 20+ database functions with parameters and return types
- All 30+ triggers
- Full relationship maps and foreign key dependencies
- RLS policies for every table
- Indexes on all tables
- Constraints and check conditions
- Storage buckets and views
- Complete migration history (9 phases)

**Use this when you need:**
- Complete table schema for a specific table
- Function signatures and usage
- Detailed relationship information
- Constraint definitions
- Index creation statements
- Full RLS policy details

**Size:** 84 KB, 2,358 lines

---

### 2. DATABASE_SUMMARY.md (527 lines)
**Quick reference guide and architecture overview**

Medium-detail documentation. Covers:
- Quick statistics (60+ tables, 20+ functions, 30+ triggers)
- Database organization by domain (12 categories)
- Key features (RLS, vector search, encryption, JSONB)
- Important relationships and unique constraints
- Autopilot system architecture
- AI video generation workflow
- Strategic marketing analysis tables
- AI model management
- Data isolation and multi-tenancy patterns
- Performance optimization tips
- GDPR compliance structure
- Migration timeline
- Useful SQL query examples

**Use this when you need:**
- Quick overview of what's in the database
- Architecture decisions and patterns
- High-level table organization
- Performance optimization tips
- Common query examples
- Data isolation patterns

**Size:** 15 KB, 527 lines

---

### 3. DATABASE.md (738 lines)
**Legacy database documentation**

Older documentation covering core concepts. May contain outdated information but useful for historical context.

**Size:** 21 KB, 738 lines

---

## Quick Navigation Guide

### By Use Case

#### "I need to understand the entire schema"
Start with **DATABASE_SCHEMA_COMPLETE.md** - Complete reference

#### "I need a quick overview"
Start with **DATABASE_SUMMARY.md** - Quick reference

#### "I need to write a query for campaigns"
1. Read **DATABASE_SUMMARY.md** section "Campaign Management"
2. Reference **DATABASE_SCHEMA_COMPLETE.md** section "Table: campaigns"
3. Check indexes in complete documentation for query optimization

#### "I need to implement vector search"
1. Read **DATABASE_SUMMARY.md** section "Vector Search"
2. See **DATABASE_SCHEMA_COMPLETE.md** section "Table: knowledge_chunks"
3. Find `search_knowledge_chunks()` function in complete documentation

#### "I need to understand autopilot"
1. Read **DATABASE_SUMMARY.md** section "Autopilot System Architecture"
2. Read **DATABASE_SCHEMA_COMPLETE.md** section "Table: marketing_autopilot_config"
3. Check related tables: autopilot_weekly_reports, autopilot_activity_log
4. See cron jobs section for scheduling

#### "I need to implement RLS policies"
1. Read **DATABASE_SUMMARY.md** section "Row Level Security"
2. Check any table in **DATABASE_SCHEMA_COMPLETE.md** for policy examples
3. All user-owned tables follow same pattern

#### "I need AI model information"
1. Read **DATABASE_SUMMARY.md** section "AI Model Management"
2. See **DATABASE_SCHEMA_COMPLETE.md** section "Table: ai_model_configs"
3. Check models list (as of Oct 28, 2025)

#### "I need to implement video generation"
1. Read **DATABASE_SUMMARY.md** section "AI Video System"
2. See **DATABASE_SCHEMA_COMPLETE.md** section "Table: ai_video_projects"
3. Check ai_video_jobs and storage bucket sections

### By Domain

**User Management & Security:**
- user_preferences, user_secrets, user_privacy_settings
- See: DATABASE_SUMMARY.md → User Management section

**Campaigns:**
- campaigns, campaign_tasks, campaign_metrics, campaign_performance_*
- See: DATABASE_SUMMARY.md → Campaign Management section

**Leads & Sales:**
- leads, lead_activities, lead_scoring_rules
- See: DATABASE_SUMMARY.md → Lead Management section

**Content & Marketing:**
- content_calendar, digital_assets, brand_assets, content_templates
- See: DATABASE_SUMMARY.md → Content & Assets section

**AI & Automation:**
- marketing_autopilot_config, ai_video_projects, ai_model_configs
- See: DATABASE_SUMMARY.md → AI & Automation sections

**Knowledge Management:**
- knowledge_buckets, knowledge_documents, knowledge_chunks
- See: DATABASE_SUMMARY.md → Knowledge Management section

**Strategic Analysis:**
- brand_positioning_analyses, funnel_designs, competitive_gap_analyses
- See: DATABASE_SUMMARY.md → Strategic Marketing Analysis Tables

---

## Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 60+ |
| User Management Tables | 6 |
| Campaign Tables | 8 |
| Lead Tables | 4 |
| Content & Assets Tables | 5 |
| Communication Tables | 7 |
| Integration Tables | 5 |
| Knowledge Tables | 4 |
| AI & Automation Tables | 11 |
| Analytics Tables | 6 |
| Strategic Marketing Tables | 4 |
| Support & Privacy Tables | 2 |
| **Database Functions** | **20+** |
| **Database Triggers** | **30+** |
| **Storage Buckets** | **1** |
| **Views** | **2** |
| **Cron Jobs** | **2 scheduled + 2 manual** |

---

## Key Design Patterns

### 1. User Isolation Pattern
Every user-owned table has:
- `created_by UUID REFERENCES auth.users(id)` or `user_id UUID REFERENCES auth.users(id)`
- RLS policy using `auth.uid()`
- Index on user column

Example: `campaigns(created_by)` with RLS policy

### 2. Timestamp Pattern
Every major table has:
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Trigger to auto-update `updated_at` on changes

### 3. Enumeration Pattern
Statuses and types use CHECK constraints:
```sql
status TEXT CHECK IN ('draft', 'active', 'completed')
```

### 4. Flexible Data Pattern
Complex data stored as JSONB:
- Campaign metrics, demographics, KPI targets
- AI strategy and feedback
- Optimization suggestions

### 5. Composite Unique Constraint Pattern
Multi-column uniqueness:
- `(user_id, service_name)` in user_secrets
- `(user_id, platform_name)` in oauth_connections
- `(created_by, name)` in campaigns
- `(document_id, chunk_index)` in knowledge_chunks

### 6. Vector Embedding Pattern
Knowledge chunks support semantic search:
- `embedding vector(1536)` - OpenAI ada-002 format
- IVFFLAT index for similarity search
- Custom function `search_knowledge_chunks()` for queries

### 7. Activity Log Pattern
Track all operations:
- Separate audit tables for secrets, privacy, autopilot
- Captures: user_id, event_type, details, timestamp, context

### 8. Foreign Key Cascade Pattern
Related tables cascade on deletion:
- Campaign → campaign_tasks (CASCADE)
- Lead → lead_activities (CASCADE)
- Knowledge bucket → documents → chunks (CASCADE)

---

## Performance Considerations

### Index Coverage
- User-scoped filtering: `idx_table_created_by` or `idx_table_user_id`
- Status/type filtering: `idx_table_status`, `idx_table_type`
- Time-based queries: `idx_table_created_at DESC`
- Vector search: IVFFLAT index on embeddings
- Composite filtering: Multi-column indexes like `(user_id, status)`

### Query Optimization
1. Always filter by `user_id` or `created_by` first
2. Use `created_at DESC LIMIT` for pagination
3. Leverage composite indexes
4. Cache vector embedding queries
5. Use partial indexes for filtered queries

### Scalability Notes
- RLS enforces user isolation automatically
- Partitioning recommended if single tables exceed 1B rows
- Vector index (IVFFLAT) recommended for 100k+ chunks
- Connection pooling recommended for high concurrency

---

## Security Features

### Row Level Security (RLS)
- Enforced at database layer
- Every user-owned table has policies
- Pattern: `USING (auth.uid() = user_id)`

### Encryption
- API keys encrypted in `user_secrets` table
- Decryption handled server-side only
- IV stored separately from encrypted value
- Audit trail in `secret_audit_logs`

### Audit Trails
- `secret_audit_logs` - All secret operations
- `privacy_audit_log` - Privacy operations
- `autopilot_activity_log` - Autopilot actions
- `knowledge_access_logs` - Search history

### GDPR Compliance
- `user_privacy_settings` - Consent tracking
- `data_export_requests` - Right to data portability
- `data_deletion_requests` - Right to be forgotten
- Configurable data retention (days)

---

## Maintenance & Updates

### Schema Migrations
Located in: `/supabase/migrations/`

**Latest migrations (by date):**
- Oct 28, 2025: AI model management
- Oct 24, 2025: Support tickets
- Oct 11, 2025: Strategic marketing agents
- Oct 8, 2025: AI video system
- Jul 9, 2025: Campaign performance monitoring
- Jun 15, 2025: Knowledge base system
- Jun 10, 2025: Autopilot system

### Applying Migrations
1. Create migration file with timestamp
2. Apply via Supabase SQL Editor
3. Document in APPLY_MIGRATIONS.md

### Backup & Recovery
- Supabase provides automated backups
- Point-in-time recovery available
- Export/import via pg_dump recommended

---

## Useful Commands

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### View All Triggers
```sql
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### Check Active Cron Jobs
```sql
SELECT * FROM cron.job WHERE active = true;
```

### View All Indexes
```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

### Get Table Sizes
```sql
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## Related Files

- **CLAUDE.md** - Project instructions including database overview
- **AI-VIDEO-GENERATOR.md** - Detailed video generation guide
- **APPLY_MIGRATIONS.md** - How to apply database migrations
- **ARCHITECTURE.md** - System design and architecture
- **/supabase/migrations/** - All migration files

---

## Contributing

When updating database documentation:

1. **Completeness:** Include all columns, constraints, indexes
2. **Consistency:** Follow existing table documentation format
3. **Examples:** Add query examples for complex tables
4. **Timestamps:** Update "Last Updated" date
5. **Synchronization:** Keep SUMMARY and COMPLETE docs in sync

---

**Last Updated:** October 28, 2025  
**Database Version:** PostgreSQL via Supabase  
**Documentation Version:** 1.0.0
