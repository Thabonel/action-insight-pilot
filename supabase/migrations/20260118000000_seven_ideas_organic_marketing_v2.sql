-- Seven Ideas Organic Marketing System (v2)
-- This migration creates new tables and alters the existing content_pieces table
-- to support the Seven Ideas methodology

-- 1. Organic Marketing Config - User's organic marketing settings
CREATE TABLE IF NOT EXISTS public.organic_marketing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_description TEXT,
  founder_story TEXT,
  personality_traits JSONB DEFAULT '[]'::jsonb,
  brand_voice TEXT,
  quality_threshold INTEGER DEFAULT 70 CHECK (quality_threshold >= 0 AND quality_threshold <= 100),
  golden_hour_enabled BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  setup_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Audience Research - The Audit results
CREATE TABLE IF NOT EXISTS public.audience_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platforms_discovered JSONB DEFAULT '[]'::jsonb,
  problem_language JSONB DEFAULT '[]'::jsonb,
  ai_scrape_sources JSONB DEFAULT '[]'::jsonb,
  competitor_gaps JSONB DEFAULT '[]'::jsonb,
  raw_quotes TEXT[] DEFAULT ARRAY[]::TEXT[],
  questions_asked TEXT[] DEFAULT ARRAY[]::TEXT[],
  audit_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Positioning Definitions - Blank for Blank + Mega Mean Mouse
CREATE TABLE IF NOT EXISTS public.positioning_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  positioning_statement TEXT,
  what_you_do TEXT,
  who_you_serve TEXT,
  villain TEXT,
  villain_type TEXT CHECK (villain_type IS NULL OR villain_type IN ('broken_system', 'industry_practice', 'outdated_method', 'common_misconception', 'market_gap')),
  downstream_costs JSONB DEFAULT '[]'::jsonb,
  core_messages JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Golden Hour Analytics - Engagement pattern tracking
CREATE TABLE IF NOT EXISTS public.golden_hour_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour_slot INTEGER NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
  avg_engagement NUMERIC DEFAULT 0,
  sample_count INTEGER DEFAULT 0,
  is_golden_hour BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, day_of_week, hour_slot)
);

-- 5. Alter existing content_pieces table to add Seven Ideas columns
-- Add columns if they don't exist
DO $$
BEGIN
  -- Add platform column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'platform') THEN
    ALTER TABLE public.content_pieces ADD COLUMN platform TEXT;
  END IF;

  -- Add message_tag column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'message_tag') THEN
    ALTER TABLE public.content_pieces ADD COLUMN message_tag TEXT;
  END IF;

  -- Add problem_match_opening column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'problem_match_opening') THEN
    ALTER TABLE public.content_pieces ADD COLUMN problem_match_opening TEXT;
  END IF;

  -- Add personality_elements column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'personality_elements') THEN
    ALTER TABLE public.content_pieces ADD COLUMN personality_elements JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add aeo_optimized column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'aeo_optimized') THEN
    ALTER TABLE public.content_pieces ADD COLUMN aeo_optimized BOOLEAN DEFAULT false;
  END IF;

  -- Add aeo_questions_answered column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'aeo_questions_answered') THEN
    ALTER TABLE public.content_pieces ADD COLUMN aeo_questions_answered TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Add quality_score column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'quality_score') THEN
    ALTER TABLE public.content_pieces ADD COLUMN quality_score INTEGER CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100));
  END IF;

  -- Add quality_feedback column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'quality_feedback') THEN
    ALTER TABLE public.content_pieces ADD COLUMN quality_feedback JSONB;
  END IF;

  -- Add passed_quality_gate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'passed_quality_gate') THEN
    ALTER TABLE public.content_pieces ADD COLUMN passed_quality_gate BOOLEAN DEFAULT false;
  END IF;

  -- Add scheduled_for column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'scheduled_for') THEN
    ALTER TABLE public.content_pieces ADD COLUMN scheduled_for TIMESTAMPTZ;
  END IF;

  -- Add engagement_metrics column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_pieces' AND column_name = 'engagement_metrics') THEN
    ALTER TABLE public.content_pieces ADD COLUMN engagement_metrics JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_organic_marketing_config_user ON public.organic_marketing_config(user_id);
CREATE INDEX IF NOT EXISTS idx_audience_research_user ON public.audience_research(user_id);
CREATE INDEX IF NOT EXISTS idx_positioning_definitions_user ON public.positioning_definitions(user_id);
CREATE INDEX IF NOT EXISTS idx_positioning_definitions_active ON public.positioning_definitions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_golden_hour_analytics_user ON public.golden_hour_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_golden_hour_analytics_platform ON public.golden_hour_analytics(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_golden_hour_analytics_golden ON public.golden_hour_analytics(user_id, platform) WHERE is_golden_hour = true;

-- Create indexes for new content_pieces columns
CREATE INDEX IF NOT EXISTS idx_content_pieces_platform ON public.content_pieces(platform) WHERE platform IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_pieces_quality ON public.content_pieces(passed_quality_gate) WHERE passed_quality_gate = true;
CREATE INDEX IF NOT EXISTS idx_content_pieces_scheduled ON public.content_pieces(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Enable Row Level Security on new tables
ALTER TABLE public.organic_marketing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positioning_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golden_hour_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organic_marketing_config
DROP POLICY IF EXISTS "Users can view own organic marketing config" ON public.organic_marketing_config;
CREATE POLICY "Users can view own organic marketing config"
  ON public.organic_marketing_config FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own organic marketing config" ON public.organic_marketing_config;
CREATE POLICY "Users can insert own organic marketing config"
  ON public.organic_marketing_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own organic marketing config" ON public.organic_marketing_config;
CREATE POLICY "Users can update own organic marketing config"
  ON public.organic_marketing_config FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own organic marketing config" ON public.organic_marketing_config;
CREATE POLICY "Users can delete own organic marketing config"
  ON public.organic_marketing_config FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for audience_research
DROP POLICY IF EXISTS "Users can view own audience research" ON public.audience_research;
CREATE POLICY "Users can view own audience research"
  ON public.audience_research FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audience research" ON public.audience_research;
CREATE POLICY "Users can insert own audience research"
  ON public.audience_research FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own audience research" ON public.audience_research;
CREATE POLICY "Users can update own audience research"
  ON public.audience_research FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own audience research" ON public.audience_research;
CREATE POLICY "Users can delete own audience research"
  ON public.audience_research FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for positioning_definitions
DROP POLICY IF EXISTS "Users can view own positioning definitions" ON public.positioning_definitions;
CREATE POLICY "Users can view own positioning definitions"
  ON public.positioning_definitions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own positioning definitions" ON public.positioning_definitions;
CREATE POLICY "Users can insert own positioning definitions"
  ON public.positioning_definitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own positioning definitions" ON public.positioning_definitions;
CREATE POLICY "Users can update own positioning definitions"
  ON public.positioning_definitions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own positioning definitions" ON public.positioning_definitions;
CREATE POLICY "Users can delete own positioning definitions"
  ON public.positioning_definitions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for golden_hour_analytics
DROP POLICY IF EXISTS "Users can view own golden hour analytics" ON public.golden_hour_analytics;
CREATE POLICY "Users can view own golden hour analytics"
  ON public.golden_hour_analytics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own golden hour analytics" ON public.golden_hour_analytics;
CREATE POLICY "Users can insert own golden hour analytics"
  ON public.golden_hour_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own golden hour analytics" ON public.golden_hour_analytics;
CREATE POLICY "Users can update own golden hour analytics"
  ON public.golden_hour_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own golden hour analytics" ON public.golden_hour_analytics;
CREATE POLICY "Users can delete own golden hour analytics"
  ON public.golden_hour_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- Service role policies for Edge Functions
DROP POLICY IF EXISTS "Service role can manage organic_marketing_config" ON public.organic_marketing_config;
CREATE POLICY "Service role can manage organic_marketing_config"
  ON public.organic_marketing_config FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage audience_research" ON public.audience_research;
CREATE POLICY "Service role can manage audience_research"
  ON public.audience_research FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage positioning_definitions" ON public.positioning_definitions;
CREATE POLICY "Service role can manage positioning_definitions"
  ON public.positioning_definitions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage golden_hour_analytics" ON public.golden_hour_analytics;
CREATE POLICY "Service role can manage golden_hour_analytics"
  ON public.golden_hour_analytics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_seven_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new tables
DROP TRIGGER IF EXISTS update_organic_marketing_config_updated_at ON public.organic_marketing_config;
CREATE TRIGGER update_organic_marketing_config_updated_at
  BEFORE UPDATE ON public.organic_marketing_config
  FOR EACH ROW EXECUTE FUNCTION update_seven_ideas_updated_at();

DROP TRIGGER IF EXISTS update_audience_research_updated_at ON public.audience_research;
CREATE TRIGGER update_audience_research_updated_at
  BEFORE UPDATE ON public.audience_research
  FOR EACH ROW EXECUTE FUNCTION update_seven_ideas_updated_at();

DROP TRIGGER IF EXISTS update_positioning_definitions_updated_at ON public.positioning_definitions;
CREATE TRIGGER update_positioning_definitions_updated_at
  BEFORE UPDATE ON public.positioning_definitions
  FOR EACH ROW EXECUTE FUNCTION update_seven_ideas_updated_at();

DROP TRIGGER IF EXISTS update_golden_hour_analytics_updated_at ON public.golden_hour_analytics;
CREATE TRIGGER update_golden_hour_analytics_updated_at
  BEFORE UPDATE ON public.golden_hour_analytics
  FOR EACH ROW EXECUTE FUNCTION update_seven_ideas_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.organic_marketing_config IS 'User configuration for Seven Ideas organic marketing system';
COMMENT ON TABLE public.audience_research IS 'Results from The Audit - audience discovery and language capture';
COMMENT ON TABLE public.positioning_definitions IS 'Blank for Blank positioning and Mega Mean Mouse villain identification';
COMMENT ON TABLE public.golden_hour_analytics IS 'Engagement pattern tracking for optimal posting times';
COMMENT ON COLUMN public.content_pieces.platform IS 'Target platform for Seven Ideas content';
COMMENT ON COLUMN public.content_pieces.quality_score IS 'Seven Ideas quality gate score (0-100)';
COMMENT ON COLUMN public.content_pieces.passed_quality_gate IS 'Whether content passed the Seven Ideas quality threshold';
