-- Marketing Autopilot System Schema
-- This migration adds tables for the automated marketing autopilot feature

-- Table: Marketing Autopilot Configuration
-- Stores user's autopilot setup and AI-generated strategy
CREATE TABLE IF NOT EXISTS marketing_autopilot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_description TEXT NOT NULL,
  target_audience JSONB NOT NULL DEFAULT '{}',
  monthly_budget NUMERIC NOT NULL,
  goals JSONB NOT NULL DEFAULT '[]',
  ai_strategy JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_optimized_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table: Autopilot Weekly Reports
-- Stores weekly performance summaries for autopilot users
CREATE TABLE IF NOT EXISTS autopilot_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  autopilot_config_id UUID REFERENCES marketing_autopilot_config(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_leads_generated INTEGER DEFAULT 0,
  total_spend NUMERIC DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  top_performing_channel TEXT,
  summary JSONB NOT NULL DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Table: Autopilot Activity Log
-- Tracks all automated actions taken by the AI
CREATE TABLE IF NOT EXISTS autopilot_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  autopilot_config_id UUID REFERENCES marketing_autopilot_config(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'campaign_created', 'budget_adjusted', 'ad_copy_generated', etc.
  activity_description TEXT NOT NULL,
  entity_type TEXT, -- 'campaign', 'ad', 'lead_form', etc.
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  impact_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Autopilot Lead Inbox
-- Simplified view of leads for autopilot users
CREATE TABLE IF NOT EXISTS autopilot_lead_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  score INTEGER,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted'
  notes TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lead_id)
);

-- Add interface_mode column to user_preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences'
    AND column_name = 'interface_mode'
  ) THEN
    ALTER TABLE user_preferences
    ADD COLUMN interface_mode TEXT DEFAULT 'simple';
  END IF;
END $$;

-- Enable RLS on all autopilot tables
ALTER TABLE marketing_autopilot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_lead_inbox ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own autopilot data
CREATE POLICY "Users can manage their own autopilot config"
  ON marketing_autopilot_config
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own weekly reports"
  ON autopilot_weekly_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity log"
  ON autopilot_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their lead inbox"
  ON autopilot_lead_inbox
  FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_autopilot_config_user_id ON marketing_autopilot_config(user_id);
CREATE INDEX idx_autopilot_config_active ON marketing_autopilot_config(user_id, is_active);
CREATE INDEX idx_autopilot_reports_user_date ON autopilot_weekly_reports(user_id, week_start_date DESC);
CREATE INDEX idx_autopilot_activity_user_date ON autopilot_activity_log(user_id, created_at DESC);
CREATE INDEX idx_autopilot_leads_user_status ON autopilot_lead_inbox(user_id, status, received_at DESC);

-- Trigger to update updated_at on autopilot config
CREATE TRIGGER update_autopilot_config_updated_at
  BEFORE UPDATE ON marketing_autopilot_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log autopilot activity
CREATE OR REPLACE FUNCTION log_autopilot_activity(
  p_user_id UUID,
  p_config_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO autopilot_activity_log (
    user_id,
    autopilot_config_id,
    activity_type,
    activity_description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_user_id,
    p_config_id,
    p_activity_type,
    p_description,
    p_entity_type,
    p_entity_id,
    p_metadata
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get autopilot dashboard stats
CREATE OR REPLACE FUNCTION get_autopilot_dashboard_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
  v_this_week_leads INTEGER;
  v_this_week_spend NUMERIC;
  v_this_week_roi NUMERIC;
  v_total_leads INTEGER;
  v_week_start DATE;
BEGIN
  -- Calculate start of current week (Monday)
  v_week_start := DATE_TRUNC('week', CURRENT_DATE);

  -- Get this week's stats
  SELECT
    total_leads_generated,
    total_spend,
    roi
  INTO
    v_this_week_leads,
    v_this_week_spend,
    v_this_week_roi
  FROM autopilot_weekly_reports
  WHERE user_id = p_user_id
    AND week_start_date = v_week_start
  LIMIT 1;

  -- Get total leads count
  SELECT COUNT(*)
  INTO v_total_leads
  FROM autopilot_lead_inbox
  WHERE user_id = p_user_id;

  -- Build response
  v_stats := jsonb_build_object(
    'this_week_leads', COALESCE(v_this_week_leads, 0),
    'this_week_spend', COALESCE(v_this_week_spend, 0),
    'this_week_roi', COALESCE(v_this_week_roi, 0),
    'total_leads', COALESCE(v_total_leads, 0),
    'week_start', v_week_start
  );

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
