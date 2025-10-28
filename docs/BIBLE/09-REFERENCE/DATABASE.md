# Database Documentation

## Overview

PAM uses PostgreSQL as its primary database, hosted on Supabase Cloud. The database design follows a normalized structure with strategic denormalization for performance, implementing Row Level Security (RLS) for data isolation and comprehensive audit trails.

## Database Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Supabase      │    │   Extensions    │
│   Layer         │◄──►│   PostgreSQL    │◄──►│   & Functions   │
│                 │    │                 │    │                 │
│ • ORM Layer     │    │ • Tables        │    │ • pgvector      │
│ • Query Builder │    │ • Indexes       │    │ • RLS Policies  │
│ • Migrations    │    │ • Constraints   │    │ • Triggers      │
│ • Real-time     │    │ • Functions     │    │ • Custom Types  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Schema Overview

### Core Entities

1. **User Management** - profiles, companies, user_roles
2. **Campaign System** - campaigns, campaign_metrics, campaign_performance_metrics
3. **Lead Management** - leads, lead_activities, customer_journeys, lead_scoring_rules
4. **Content Management** - content_calendar, content_templates, digital_assets
5. **Email Marketing** - email_campaigns, email_templates, email_contacts, email_automation_rules
6. **Knowledge Base** - knowledge_buckets, knowledge_documents, knowledge_chunks
7. **Analytics** - performance_analytics, real_time_metrics, analytics_reports
8. **Integrations** - oauth_connections, integration_connections, social_platform_connections
9. **Security** - security_logs, secret_audit_logs
10. **AI & Automation** - chat_sessions, chat_messages, agents, automation_rules

## Detailed Table Schemas

### User Management

#### profiles
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);
```

#### companies
```sql
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
```

### Campaign System

#### campaigns
```sql
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type campaign_type NOT NULL,
  channel TEXT NOT NULL,
  status campaign_status DEFAULT 'draft',
  content JSONB DEFAULT '{}',
  target_audience TEXT DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  budget_allocated NUMERIC,
  budget_spent NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom Types
CREATE TYPE campaign_type AS ENUM ('email', 'social', 'content', 'ads', 'seo');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled');

-- Indexes
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- RLS Policies
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns" 
ON public.campaigns 
USING (auth.uid() = created_by);
```

#### campaign_metrics
```sql
CREATE TABLE public.campaign_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  additional_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_type_date ON campaign_metrics(metric_type, metric_date);
CREATE INDEX idx_campaign_metrics_recorded_at ON campaign_metrics(recorded_at DESC);
```

### Lead Management

#### leads
```sql
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  job_title TEXT,
  industry TEXT,
  country TEXT,
  source TEXT NOT NULL,
  source_details JSONB,
  tags TEXT[] DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  status lead_status DEFAULT 'new',
  company_size company_size_enum,
  annual_revenue BIGINT,
  enriched_data JSONB DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom Types
CREATE TYPE lead_status AS ENUM ('new', 'qualified', 'contacted', 'opportunity', 'converted', 'lost');
CREATE TYPE company_size_enum AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');

-- Indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_company ON leads(company);

-- Unique constraint for email
CREATE UNIQUE INDEX idx_leads_email_unique ON leads(email) WHERE email IS NOT NULL;
```

#### lead_activities
```sql
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  source TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_occurred_at ON lead_activities(occurred_at DESC);
```

### Content Management

#### content_calendar
```sql
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  content_data JSONB DEFAULT '{}',
  status content_status DEFAULT 'draft',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  platform TEXT[],
  assets TEXT[],
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom Types
CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- Indexes
CREATE INDEX idx_content_calendar_created_by ON content_calendar(created_by);
CREATE INDEX idx_content_calendar_status ON content_calendar(status);
CREATE INDEX idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_content_type ON content_calendar(content_type);
```

#### digital_assets
```sql
CREATE TABLE public.digital_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  asset_type asset_type_enum NOT NULL,
  tags TEXT[],
  thumbnail_path TEXT,
  folder_id UUID REFERENCES folders(id),
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom Types
CREATE TYPE asset_type_enum AS ENUM ('image', 'video', 'audio', 'document', 'other');

-- Indexes
CREATE INDEX idx_digital_assets_uploaded_by ON digital_assets(uploaded_by);
CREATE INDEX idx_digital_assets_asset_type ON digital_assets(asset_type);
CREATE INDEX idx_digital_assets_folder_id ON digital_assets(folder_id);
CREATE INDEX idx_digital_assets_tags ON digital_assets USING GIN(tags);
```

### Knowledge Base

#### knowledge_buckets
```sql
CREATE TABLE public.knowledge_buckets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  bucket_type TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_buckets_created_by ON knowledge_buckets(created_by);
CREATE INDEX idx_knowledge_buckets_type ON knowledge_buckets(bucket_type);
CREATE INDEX idx_knowledge_buckets_campaign_id ON knowledge_buckets(campaign_id);
```

#### knowledge_documents
```sql
CREATE TABLE public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id UUID NOT NULL REFERENCES knowledge_buckets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  upload_path TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  processing_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_documents_bucket_id ON knowledge_documents(bucket_id);
CREATE INDEX idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX idx_knowledge_documents_created_by ON knowledge_documents(created_by);

-- Full-text search index
CREATE INDEX idx_knowledge_documents_content_fts ON knowledge_documents USING gin(to_tsvector('english', content));
```

#### knowledge_chunks
```sql
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id UUID NOT NULL REFERENCES knowledge_buckets(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_chunks_bucket_id ON knowledge_chunks(bucket_id);
CREATE INDEX idx_knowledge_chunks_content_hash ON knowledge_chunks(content_hash);

-- Vector similarity index
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
```

## Database Functions

### Knowledge Search Function

```sql
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
  p_user_id UUID,
  p_query_embedding vector,
  p_bucket_type TEXT DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE(
  chunk_id UUID,
  bucket_id UUID,
  document_id UUID,
  bucket_name TEXT,
  document_title TEXT,
  document_summary TEXT,
  chunk_content TEXT,
  chunk_index INTEGER,
  similarity_score FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kc.id as chunk_id,
    kc.bucket_id,
    kc.document_id,
    kb.name as bucket_name,
    kd.title as document_title,
    kd.summary as document_summary,
    kc.content as chunk_content,
    kc.chunk_index,
    (1 - (kc.embedding <=> p_query_embedding)) as similarity_score,
    kc.metadata
  FROM knowledge_chunks kc
  JOIN knowledge_buckets kb ON kc.bucket_id = kb.id
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE 
    kb.created_by = p_user_id
    AND (p_bucket_type IS NULL OR kb.bucket_type = p_bucket_type)
    AND (p_campaign_id IS NULL OR kb.campaign_id = p_campaign_id)
    AND kd.status = 'ready'
    AND (1 - (kc.embedding <=> p_query_embedding)) >= p_similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$;
```

### User Role Function

```sql
CREATE OR REPLACE FUNCTION get_user_role(company_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SET search_path TO public;

    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = auth.uid() AND company_id = company_uuid;

    RETURN COALESCE(user_role, 'viewer');
END;
$$;
```

## Triggers

### Automatic Timestamp Updates

```sql
-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Continue for other tables...
```

## Indexes and Performance

### Query Performance Optimization

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_campaigns_user_status ON campaigns(created_by, status);
CREATE INDEX idx_leads_status_score ON leads(status, lead_score DESC);
CREATE INDEX idx_campaign_metrics_campaign_date ON campaign_metrics(campaign_id, metric_date DESC);

-- Partial indexes for active records
CREATE INDEX idx_active_campaigns ON campaigns(created_by) WHERE status IN ('active', 'scheduled');
CREATE INDEX idx_qualified_leads ON leads(lead_score DESC) WHERE status = 'qualified';

-- GIN indexes for JSONB and array columns
CREATE INDEX idx_campaigns_content ON campaigns USING GIN(content);
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);
CREATE INDEX idx_lead_activities_data ON lead_activities USING GIN(activity_data);
```

### Vector Indexes for AI Features

```sql
-- Vector similarity indexes for embeddings
CREATE INDEX idx_content_embeddings_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);

-- Configure vector index parameters
SET ivfflat.probes = 10;
```

## Row Level Security (RLS)

### Campaign Security

```sql
-- Comprehensive campaign access control
CREATE POLICY "campaign_select_policy" ON campaigns
FOR SELECT USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'manager')
  )
);

CREATE POLICY "campaign_insert_policy" ON campaigns
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "campaign_update_policy" ON campaigns
FOR UPDATE USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);
```

### Lead Security

```sql
-- Lead access based on team membership
CREATE POLICY "lead_team_access" ON leads
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN companies c ON ur.company_id = c.id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'manager', 'sales')
  )
);
```

## Data Migration Scripts

### Campaign Status Migration

```sql
-- Add new status values to enum
ALTER TYPE campaign_status ADD VALUE 'archived';
ALTER TYPE campaign_status ADD VALUE 'error';

-- Migrate existing data
UPDATE campaigns 
SET status = 'archived' 
WHERE status = 'completed' 
AND end_date < NOW() - INTERVAL '30 days';
```

### Lead Scoring Migration

```sql
-- Add lead scoring columns
ALTER TABLE leads ADD COLUMN demographic_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN behavioral_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN engagement_score INTEGER DEFAULT 0;

-- Calculate initial scores
UPDATE leads SET 
  demographic_score = CASE 
    WHEN company_size = 'enterprise' THEN 25
    WHEN company_size = 'large' THEN 20
    WHEN company_size = 'medium' THEN 15
    ELSE 10
  END,
  behavioral_score = (
    SELECT COUNT(*) * 5 
    FROM lead_activities 
    WHERE lead_id = leads.id 
    AND activity_type IN ('email_opened', 'link_clicked')
  );

-- Update total lead score
UPDATE leads SET lead_score = COALESCE(demographic_score, 0) + COALESCE(behavioral_score, 0) + COALESCE(engagement_score, 0);
```

## Backup and Recovery

### Automated Backups

Supabase provides:
- **Automatic daily backups** for paid plans
- **Point-in-time recovery** up to 7 days
- **Full database exports** in SQL format

### Manual Backup Scripts

```bash
# Export specific tables
pg_dump --host=db.your-project.supabase.co \
        --port=5432 \
        --username=postgres \
        --dbname=postgres \
        --table=campaigns \
        --table=leads \
        --no-owner \
        --no-acl \
        --data-only \
        > backup_$(date +%Y%m%d).sql

# Restore from backup
psql --host=db.your-project.supabase.co \
     --port=5432 \
     --username=postgres \
     --dbname=postgres \
     < backup_20240101.sql
```

## Database Monitoring

### Performance Metrics

```sql
-- Query performance analysis
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC
LIMIT 10;

-- Table size monitoring
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage analysis
SELECT 
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Database Health Checks

```sql
-- Connection monitoring
SELECT 
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;

-- Lock monitoring
SELECT 
  mode,
  locktype,
  COUNT(*) as lock_count
FROM pg_locks
GROUP BY mode, locktype
ORDER BY lock_count DESC;
```

## Security Best Practices

### Data Encryption

- **Encryption at rest**: Automatic via Supabase
- **Encryption in transit**: TLS 1.2+ for all connections
- **Column-level encryption**: For sensitive fields using pgcrypto

```sql
-- Encrypt sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt email addresses
UPDATE leads SET email = pgp_sym_encrypt(email, 'encryption_key');
```

### Audit Logging

```sql
-- Comprehensive audit trail
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, operation, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Maintenance Tasks

### Regular Maintenance

```sql
-- Vacuum and analyze tables
VACUUM ANALYZE campaigns;
VACUUM ANALYZE leads;
VACUUM ANALYZE lead_activities;

-- Reindex for performance
REINDEX INDEX idx_campaigns_created_by;
REINDEX INDEX idx_leads_email;

-- Update table statistics
ANALYZE campaigns;
ANALYZE leads;
```

### Cleanup Scripts

```sql
-- Clean up old audit logs (keep 90 days)
DELETE FROM audit_log 
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Archive old campaign metrics
INSERT INTO campaign_metrics_archive 
SELECT * FROM campaign_metrics 
WHERE recorded_at < NOW() - INTERVAL '1 year';

DELETE FROM campaign_metrics 
WHERE recorded_at < NOW() - INTERVAL '1 year';
```

This comprehensive database documentation provides a complete overview of PAM's data architecture, security implementation, and operational procedures for maintaining optimal database performance and reliability.