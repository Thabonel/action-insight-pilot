-- Strategic Marketing Agents System Migration
-- Adds support for brand positioning, funnel design, competitive analysis, and performance tracking

-- ============================================================================
-- 1. BRAND POSITIONING ANALYSES TABLE (3Cs Framework)
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_positioning_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core positioning
  positioning_statement TEXT NOT NULL,
  differentiators JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand_tone JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- 3Cs Analysis
  three_cs_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Recommendations
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Input data for reference
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. FUNNEL DESIGNS TABLE (Awareness → Retention)
-- ============================================================================

CREATE TABLE IF NOT EXISTS funnel_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Business context
  business_type TEXT NOT NULL,

  -- Funnel structure
  funnel_structure JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Input data for reference
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. COMPETITIVE GAP ANALYSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitive_gap_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Brand info
  our_brand TEXT NOT NULL,
  competitors TEXT[] NOT NULL,

  -- Analysis results
  gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  ownable_differentiator JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Input data for reference
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PERFORMANCE TRACKING FRAMEWORKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_tracking_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campaign context
  campaign_name TEXT NOT NULL,
  channels TEXT[] NOT NULL,

  -- Tracking framework
  tracking_framework JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Input data for reference
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Active status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Brand Positioning Analyses
CREATE INDEX IF NOT EXISTS idx_brand_positioning_analyses_user_id
  ON brand_positioning_analyses(user_id, created_at DESC);

-- Funnel Designs
CREATE INDEX IF NOT EXISTS idx_funnel_designs_user_id
  ON funnel_designs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_designs_business_type
  ON funnel_designs(business_type);

-- Competitive Gap Analyses
CREATE INDEX IF NOT EXISTS idx_competitive_gap_analyses_user_id
  ON competitive_gap_analyses(user_id, created_at DESC);

-- Performance Tracking Frameworks
CREATE INDEX IF NOT EXISTS idx_performance_tracking_frameworks_user_id
  ON performance_tracking_frameworks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_tracking_frameworks_active
  ON performance_tracking_frameworks(user_id, is_active, created_at DESC)
  WHERE is_active = true;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE brand_positioning_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_tracking_frameworks ENABLE ROW LEVEL SECURITY;

-- Brand Positioning Analyses Policies
CREATE POLICY "Users can view own brand positioning analyses"
  ON brand_positioning_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand positioning analyses"
  ON brand_positioning_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand positioning analyses"
  ON brand_positioning_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand positioning analyses"
  ON brand_positioning_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Funnel Designs Policies
CREATE POLICY "Users can view own funnel designs"
  ON funnel_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funnel designs"
  ON funnel_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funnel designs"
  ON funnel_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own funnel designs"
  ON funnel_designs FOR DELETE
  USING (auth.uid() = user_id);

-- Competitive Gap Analyses Policies
CREATE POLICY "Users can view own competitive gap analyses"
  ON competitive_gap_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitive gap analyses"
  ON competitive_gap_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitive gap analyses"
  ON competitive_gap_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitive gap analyses"
  ON competitive_gap_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Performance Tracking Frameworks Policies
CREATE POLICY "Users can view own performance tracking frameworks"
  ON performance_tracking_frameworks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance tracking frameworks"
  ON performance_tracking_frameworks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance tracking frameworks"
  ON performance_tracking_frameworks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own performance tracking frameworks"
  ON performance_tracking_frameworks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================================================

-- Create or replace the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Brand Positioning Analyses
CREATE TRIGGER update_brand_positioning_analyses_updated_at
  BEFORE UPDATE ON brand_positioning_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funnel Designs
CREATE TRIGGER update_funnel_designs_updated_at
  BEFORE UPDATE ON funnel_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Competitive Gap Analyses
CREATE TRIGGER update_competitive_gap_analyses_updated_at
  BEFORE UPDATE ON competitive_gap_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Performance Tracking Frameworks
CREATE TRIGGER update_performance_tracking_frameworks_updated_at
  BEFORE UPDATE ON performance_tracking_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
