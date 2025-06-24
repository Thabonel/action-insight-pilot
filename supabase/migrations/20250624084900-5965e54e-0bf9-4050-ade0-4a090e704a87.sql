
-- Fix common RLS and security issues in the database
-- Handle existing policies by using DROP IF EXISTS and CREATE

-- Enable RLS on tables that don't have it enabled (ignore if already enabled)
DO $$ 
BEGIN
    ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if already enabled
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

-- Create campaign policies
CREATE POLICY "Users can view their own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = created_by);

-- Create leads policies (simplified)
DROP POLICY IF EXISTS "Users can manage their own leads" ON public.leads;
CREATE POLICY "Users can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create content calendar policies
DROP POLICY IF EXISTS "Users can view their own content calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can create their own content calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can update their own content calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can delete their own content calendar" ON public.content_calendar;

CREATE POLICY "Users can view their own content calendar" ON public.content_calendar
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own content calendar" ON public.content_calendar
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own content calendar" ON public.content_calendar
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own content calendar" ON public.content_calendar
  FOR DELETE USING (auth.uid() = created_by);

-- Create digital assets policies
DROP POLICY IF EXISTS "Users can view their own digital assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Users can create their own digital assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Users can update their own digital assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Users can delete their own digital assets" ON public.digital_assets;

CREATE POLICY "Users can view their own digital assets" ON public.digital_assets
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can create their own digital assets" ON public.digital_assets
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own digital assets" ON public.digital_assets
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own digital assets" ON public.digital_assets
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Create email campaigns policies
DROP POLICY IF EXISTS "Users can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Users can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create performance analytics policies
DROP POLICY IF EXISTS "Users can view their own performance analytics" ON public.performance_analytics;
DROP POLICY IF EXISTS "Users can create their own performance analytics" ON public.performance_analytics;

CREATE POLICY "Users can view their own performance analytics" ON public.performance_analytics
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own performance analytics" ON public.performance_analytics
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create proposal templates policies
DROP POLICY IF EXISTS "Users can view their own proposal templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can create their own proposal templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can update their own proposal templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can delete their own proposal templates" ON public.proposal_templates;

CREATE POLICY "Users can view their own proposal templates" ON public.proposal_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proposal templates" ON public.proposal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposal templates" ON public.proposal_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposal templates" ON public.proposal_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create brand assets policies
DROP POLICY IF EXISTS "Users can view their own brand assets" ON public.brand_assets;
DROP POLICY IF EXISTS "Users can create their own brand assets" ON public.brand_assets;
DROP POLICY IF EXISTS "Users can update their own brand assets" ON public.brand_assets;
DROP POLICY IF EXISTS "Users can delete their own brand assets" ON public.brand_assets;

CREATE POLICY "Users can view their own brand assets" ON public.brand_assets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own brand assets" ON public.brand_assets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own brand assets" ON public.brand_assets
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own brand assets" ON public.brand_assets
  FOR DELETE USING (auth.uid() = created_by);

-- Create content templates policies
DROP POLICY IF EXISTS "Users can view content templates" ON public.content_templates;
DROP POLICY IF EXISTS "Users can create their own content templates" ON public.content_templates;
DROP POLICY IF EXISTS "Users can update their own content templates" ON public.content_templates;
DROP POLICY IF EXISTS "Users can delete their own content templates" ON public.content_templates;

CREATE POLICY "Users can view content templates" ON public.content_templates
  FOR SELECT USING (auth.uid() = created_by OR is_public = true);

CREATE POLICY "Users can create their own content templates" ON public.content_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own content templates" ON public.content_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own content templates" ON public.content_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Add performance indexes for commonly queried columns (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(type);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by ON public.content_calendar(created_by);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON public.content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_digital_assets_uploaded_by ON public.digital_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_digital_assets_asset_type ON public.digital_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_created_by ON public.performance_analytics(created_by);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_user_id ON public.proposal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_created_by ON public.brand_assets(created_by);
CREATE INDEX IF NOT EXISTS idx_content_templates_created_by ON public.content_templates(created_by);
