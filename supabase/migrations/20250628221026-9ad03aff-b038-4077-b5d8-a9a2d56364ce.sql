-- ===============================================
-- ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on all user-data tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- RLS POLICIES FOR CAMPAIGNS
-- ===============================================

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

CREATE POLICY "Users can view their own campaigns" ON public.campaigns
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own campaigns" ON public.campaigns
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own campaigns" ON public.campaigns
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
FOR DELETE USING (auth.uid() = created_by);

-- ===============================================
-- RLS POLICIES FOR LEADS
-- ===============================================

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads" ON public.leads
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own leads" ON public.leads
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own leads" ON public.leads
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own leads" ON public.leads
FOR DELETE USING (auth.uid() = created_by);

-- ===============================================
-- RLS POLICIES FOR LEAD ACTIVITIES
-- ===============================================

DROP POLICY IF EXISTS "Users can view activities for their own leads" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can create activities for their own leads" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can update activities for their own leads" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can delete activities for their own leads" ON public.lead_activities;

CREATE POLICY "Users can view activities for their own leads" ON public.lead_activities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_activities.lead_id 
    AND leads.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create activities for their own leads" ON public.lead_activities
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_activities.lead_id 
    AND leads.created_by = auth.uid()
  ) AND auth.uid() = created_by
);

CREATE POLICY "Users can update activities for their own leads" ON public.lead_activities
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete activities for their own leads" ON public.lead_activities
FOR DELETE USING (auth.uid() = created_by);

-- ===============================================
-- RLS POLICIES FOR CAMPAIGN METRICS
-- ===============================================

DROP POLICY IF EXISTS "Users can view metrics for their own campaigns" ON public.campaign_metrics;
DROP POLICY IF EXISTS "Users can create metrics for their own campaigns" ON public.campaign_metrics;
DROP POLICY IF EXISTS "Users can update metrics for their own campaigns" ON public.campaign_metrics;
DROP POLICY IF EXISTS "Users can delete metrics for their own campaigns" ON public.campaign_metrics;

CREATE POLICY "Users can view metrics for their own campaigns" ON public.campaign_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_metrics.campaign_id 
    AND campaigns.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create metrics for their own campaigns" ON public.campaign_metrics
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_metrics.campaign_id 
    AND campaigns.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update metrics for their own campaigns" ON public.campaign_metrics
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_metrics.campaign_id 
    AND campaigns.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete metrics for their own campaigns" ON public.campaign_metrics
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_metrics.campaign_id 
    AND campaigns.created_by = auth.uid()
  )
);

-- ===============================================
-- RLS POLICIES FOR CONTENT AND ASSETS
-- ===============================================

-- Digital assets policies
DROP POLICY IF EXISTS "Users can view their own assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Users can upload their own assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.digital_assets;

CREATE POLICY "Users can view their own assets" ON public.digital_assets
FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload their own assets" ON public.digital_assets
FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own assets" ON public.digital_assets
FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own assets" ON public.digital_assets
FOR DELETE USING (auth.uid() = uploaded_by);

-- Content calendar policies
DROP POLICY IF EXISTS "Users can view their own content" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can create their own content" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can update their own content" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can delete their own content" ON public.content_calendar;

CREATE POLICY "Users can view their own content" ON public.content_calendar
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own content" ON public.content_calendar
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own content" ON public.content_calendar
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own content" ON public.content_calendar
FOR DELETE USING (auth.uid() = created_by);

-- ===============================================
-- RLS POLICIES FOR INTEGRATIONS
-- ===============================================

-- Integration connections policies
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can create their own integrations" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.integration_connections;

CREATE POLICY "Users can view their own integrations" ON public.integration_connections
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations" ON public.integration_connections
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON public.integration_connections
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON public.integration_connections
FOR DELETE USING (auth.uid() = user_id);

-- OAuth connections policies
DROP POLICY IF EXISTS "Users can view their own oauth connections" ON public.oauth_connections;
DROP POLICY IF EXISTS "Users can create their own oauth connections" ON public.oauth_connections;
DROP POLICY IF EXISTS "Users can update their own oauth connections" ON public.oauth_connections;
DROP POLICY IF EXISTS "Users can delete their own oauth connections" ON public.oauth_connections;

CREATE POLICY "Users can view their own oauth connections" ON public.oauth_connections
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own oauth connections" ON public.oauth_connections
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth connections" ON public.oauth_connections
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth connections" ON public.oauth_connections
FOR DELETE USING (auth.uid() = user_id);

-- ===============================================
-- SEED DATA FUNCTION
-- ===============================================

-- Include the seed data function from the separate file
CREATE OR REPLACE FUNCTION public.seed_demo_data(demo_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
    campaign_id_1 UUID;
    campaign_id_2 UUID;
    campaign_id_3 UUID;
    lead_id_1 UUID;
    lead_id_2 UUID;
    lead_id_3 UUID;
    lead_id_4 UUID;
BEGIN
    user_id := COALESCE(demo_user_id, auth.uid());
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user ID provided and no authenticated user found';
    END IF;

    -- Clear existing demo data for this user
    DELETE FROM public.campaign_metrics WHERE campaign_id IN (
        SELECT id FROM public.campaigns WHERE created_by = user_id
    );
    DELETE FROM public.lead_activities WHERE created_by = user_id;
    DELETE FROM public.content_calendar WHERE created_by = user_id;
    DELETE FROM public.campaigns WHERE created_by = user_id;
    DELETE FROM public.leads WHERE created_by = user_id;

    -- Insert demo campaigns (sample data)
    INSERT INTO public.campaigns (
        id, name, description, type, channel, status, created_by, 
        total_budget, budget_allocated, budget_spent, start_date, end_date,
        primary_objective, target_audience, channels, metrics
    ) VALUES 
    (
        gen_random_uuid(), 
        'Q1 Product Launch Campaign',
        'Comprehensive marketing campaign for our new AI-powered analytics platform',
        'product_launch',
        'multi_channel',
        'active',
        user_id,
        50000.00,
        45000.00,
        12500.00,
        NOW() - INTERVAL '30 days',
        NOW() + INTERVAL '60 days',
        'Increase brand awareness and drive product adoption',
        'Tech-savvy professionals in enterprise companies',
        '["email", "social_media", "content_marketing", "paid_ads"]'::jsonb,
        '{"reach": 125000, "conversion_rate": 12.5, "impressions": 890000, "clicks": 25400}'::jsonb
    ) RETURNING id INTO campaign_id_1;

    -- Insert demo leads
    INSERT INTO public.leads (
        id, first_name, last_name, email, company, job_title, status,
        lead_score, source, industry, company_size, created_by, tags
    ) VALUES 
    (
        gen_random_uuid(),
        'Sarah',
        'Johnson',
        'sarah.johnson@techcorp.com',
        'TechCorp Solutions',
        'VP of Marketing',
        'qualified',
        85,
        'website',
        'Technology',
        'enterprise',
        user_id,
        '["high-priority", "decision-maker"]'::text[]
    ) RETURNING id INTO lead_id_1;

    -- Insert lead activity
    INSERT INTO public.lead_activities (
        lead_id, activity_type, activity_data, occurred_at, created_by
    ) VALUES 
    (lead_id_1, 'email_opened', '{"campaign": "Product Demo Invitation"}'::jsonb, NOW() - INTERVAL '2 hours', user_id);

    -- Insert campaign metrics
    INSERT INTO public.campaign_metrics (
        campaign_id, metric_type, metric_value, metric_date
    ) VALUES 
    (campaign_id_1, 'impressions', 25400, CURRENT_DATE - 1),
    (campaign_id_1, 'clicks', 1890, CURRENT_DATE - 1),
    (campaign_id_1, 'conversions', 156, CURRENT_DATE - 1);

    RAISE NOTICE 'Demo data seeded successfully for user %', user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;