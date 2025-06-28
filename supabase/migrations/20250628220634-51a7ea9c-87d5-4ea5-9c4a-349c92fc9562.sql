-- ===============================================
-- ADD MISSING COLUMNS FOR PROPER DATA ISOLATION
-- ===============================================

-- Add created_by column to leads table for proper user isolation
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by column to lead_activities for proper isolation
ALTER TABLE public.lead_activities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing data to set created_by for existing records (optional - for existing data)
-- UPDATE public.leads SET created_by = '00000000-0000-0000-0000-000000000000'::uuid WHERE created_by IS NULL;
-- UPDATE public.lead_activities SET created_by = '00000000-0000-0000-0000-000000000000'::uuid WHERE created_by IS NULL;

-- ===============================================
-- PERFORMANCE INDEXES
-- ===============================================

-- Campaigns indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON public.campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON public.campaigns(end_date);

-- Leads indexes for better query performance  
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON public.leads(company);

-- Lead activities indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_occurred_at ON public.lead_activities(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_activity_type ON public.lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_by ON public.lead_activities(created_by);

-- Campaign metrics indexes
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON public.campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_metric_date ON public.campaign_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_metric_type ON public.campaign_metrics(metric_type);

-- Content calendar indexes
CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by ON public.content_calendar(created_by);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON public.content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON public.content_calendar(status);

-- Digital assets indexes
CREATE INDEX IF NOT EXISTS idx_digital_assets_uploaded_by ON public.digital_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_digital_assets_asset_type ON public.digital_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_digital_assets_created_at ON public.digital_assets(created_at DESC);

-- Integration connections indexes
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_id ON public.integration_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_service_name ON public.integration_connections(service_name);
CREATE INDEX IF NOT EXISTS idx_integration_connections_connection_status ON public.integration_connections(connection_status);

-- OAuth connections indexes
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON public.oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_platform_name ON public.oauth_connections(platform_name);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_connection_status ON public.oauth_connections(connection_status);

-- ===============================================
-- CONSTRAINTS AND DATA INTEGRITY
-- ===============================================

-- Ensure email uniqueness per user for leads (only if created_by is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email_user_unique 
ON public.leads(created_by, email) 
WHERE email IS NOT NULL AND created_by IS NOT NULL;

-- Ensure campaign names are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_name_user_unique 
ON public.campaigns(created_by, name);

-- Ensure platform connections are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_connections_user_platform_unique 
ON public.oauth_connections(user_id, platform_name);

-- Add constraints for data validation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_campaigns_dates') THEN
        ALTER TABLE public.campaigns 
        ADD CONSTRAINT chk_campaigns_dates 
        CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_campaigns_budget') THEN
        ALTER TABLE public.campaigns 
        ADD CONSTRAINT chk_campaigns_budget 
        CHECK (total_budget >= 0 AND budget_allocated >= 0 AND budget_spent >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_leads_score') THEN
        ALTER TABLE public.leads 
        ADD CONSTRAINT chk_leads_score 
        CHECK (lead_score >= 0 AND lead_score <= 100);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_leads_email_format') THEN
        ALTER TABLE public.leads 
        ADD CONSTRAINT chk_leads_email_format 
        CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END $$;