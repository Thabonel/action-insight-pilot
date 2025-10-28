-- Assessment-Based Lead Generation System Migration
-- Creates tables for high-converting assessment funnels (20-40% conversion rate)
-- Based on industry best practices from ScoreApp, HubSpot, Typeform

-- ============================================================================
-- TABLE 1: assessment_templates
-- ============================================================================
-- Stores reusable assessment templates
-- Each assessment follows the 15-question methodology:
--   - 10 best practice questions (industry-specific)
--   - 5 qualification questions (situation, goal, obstacle, solution, open-text)

CREATE TABLE IF NOT EXISTS assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Assessment Content
  name TEXT NOT NULL,
  description TEXT,
  headline TEXT NOT NULL, -- Landing page hook
  subheadline TEXT NOT NULL, -- Value proposition

  -- 15-Question Structure
  questions JSONB NOT NULL, -- Array of 15 question objects
  scoring_logic JSONB NOT NULL, -- How to calculate score from answers
  result_categories JSONB NOT NULL, -- Score ranges and messaging

  -- Status & Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Performance Tracking
  total_views INTEGER DEFAULT 0,
  total_starts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  total_emails_captured INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2), -- (emails_captured / views) * 100
  avg_score DECIMAL(5,2),
  avg_completion_time INTEGER, -- Seconds

  -- Template Reusability
  is_template BOOLEAN DEFAULT false,
  times_reused INTEGER DEFAULT 0,
  parent_template_id UUID REFERENCES assessment_templates(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assessment_templates_user_id ON assessment_templates(user_id);
CREATE INDEX idx_assessment_templates_campaign_id ON assessment_templates(campaign_id);
CREATE INDEX idx_assessment_templates_status ON assessment_templates(status);
CREATE INDEX idx_assessment_templates_is_template ON assessment_templates(is_template) WHERE is_template = true;

-- ============================================================================
-- TABLE 2: assessment_responses
-- ============================================================================
-- Individual lead submissions to assessments
-- Captures full qualification data for lead scoring

CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessment_templates(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Assessment owner

  -- Lead Information
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  lead_email TEXT NOT NULL,
  lead_name TEXT,
  lead_phone TEXT,

  -- Response Data
  answers JSONB NOT NULL, -- {question_id: answer_value}
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_percentage DECIMAL(5,2),
  result_category TEXT NOT NULL, -- 'high', 'medium', 'low' or custom categories

  -- Engagement Tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_time INTEGER, -- Seconds from start to completion
  questions_answered INTEGER DEFAULT 0,
  drop_off_question_index INTEGER, -- If incomplete, where they stopped

  -- Traffic Source
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  ip_address INET,
  country_code TEXT,

  -- Post-Assessment Actions
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  results_viewed BOOLEAN DEFAULT false,
  results_viewed_at TIMESTAMPTZ,
  cta_clicked BOOLEAN DEFAULT false,
  cta_clicked_at TIMESTAMPTZ,
  cta_action TEXT, -- 'calendar_booking', 'download', 'webinar', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX idx_assessment_responses_user_id ON assessment_responses(user_id);
CREATE INDEX idx_assessment_responses_lead_id ON assessment_responses(lead_id);
CREATE INDEX idx_assessment_responses_lead_email ON assessment_responses(lead_email);
CREATE INDEX idx_assessment_responses_campaign_id ON assessment_responses(campaign_id);
CREATE INDEX idx_assessment_responses_completed_at ON assessment_responses(completed_at);
CREATE INDEX idx_assessment_responses_score ON assessment_responses(score);
CREATE INDEX idx_assessment_responses_result_category ON assessment_responses(result_category);

-- ============================================================================
-- TABLE 3: assessment_analytics
-- ============================================================================
-- Daily aggregated analytics for assessment performance
-- Tracks conversion funnel: views → starts → completions → emails

CREATE TABLE IF NOT EXISTS assessment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessment_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Conversion Funnel
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  emails_captured INTEGER DEFAULT 0,

  -- Conversion Rates
  start_rate DECIMAL(5,2), -- (starts / views) * 100
  completion_rate DECIMAL(5,2), -- (completions / starts) * 100
  email_capture_rate DECIMAL(5,2), -- (emails / completions) * 100
  overall_conversion_rate DECIMAL(5,2), -- (emails / views) * 100

  -- Performance Metrics
  avg_score DECIMAL(5,2),
  avg_completion_time INTEGER, -- Seconds

  -- Score Distribution
  high_score_count INTEGER DEFAULT 0, -- Score 75+
  medium_score_count INTEGER DEFAULT 0, -- Score 50-74
  low_score_count INTEGER DEFAULT 0, -- Score <50

  -- Post-Assessment Actions
  calendar_bookings INTEGER DEFAULT 0,
  resource_downloads INTEGER DEFAULT 0,
  webinar_registrations INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(assessment_id, date)
);

-- Indexes for performance
CREATE INDEX idx_assessment_analytics_assessment_id ON assessment_analytics(assessment_id);
CREATE INDEX idx_assessment_analytics_user_id ON assessment_analytics(user_id);
CREATE INDEX idx_assessment_analytics_date ON assessment_analytics(date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

-- ===== assessment_templates POLICIES =====

-- Users can view their own assessments
CREATE POLICY "Users can view own assessments"
  ON assessment_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create assessments
CREATE POLICY "Users can create assessments"
  ON assessment_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments"
  ON assessment_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
  ON assessment_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can view published assessments (for public access pages)
CREATE POLICY "Public can view published assessments"
  ON assessment_templates FOR SELECT
  TO anon
  USING (status = 'published');

-- ===== assessment_responses POLICIES =====

-- Users can view responses to their assessments
CREATE POLICY "Users can view own assessment responses"
  ON assessment_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can create responses (for public form submissions)
CREATE POLICY "Public can submit assessment responses"
  ON assessment_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Users can update responses to their assessments (for marking actions)
CREATE POLICY "Users can update own assessment responses"
  ON assessment_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== assessment_analytics POLICIES =====

-- Users can view their own analytics
CREATE POLICY "Users can view own assessment analytics"
  ON assessment_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can create/update analytics (service role only)
CREATE POLICY "Service role can manage analytics"
  ON assessment_analytics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update assessment_templates performance metrics
CREATE OR REPLACE FUNCTION update_assessment_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the template's performance metrics
  UPDATE assessment_templates
  SET
    total_views = (
      SELECT COALESCE(SUM(views), 0)
      FROM assessment_analytics
      WHERE assessment_id = NEW.assessment_id
    ),
    total_starts = (
      SELECT COALESCE(SUM(starts), 0)
      FROM assessment_analytics
      WHERE assessment_id = NEW.assessment_id
    ),
    total_completions = (
      SELECT COALESCE(SUM(completions), 0)
      FROM assessment_analytics
      WHERE assessment_id = NEW.assessment_id
    ),
    total_emails_captured = (
      SELECT COALESCE(SUM(emails_captured), 0)
      FROM assessment_analytics
      WHERE assessment_id = NEW.assessment_id
    ),
    conversion_rate = (
      SELECT CASE
        WHEN SUM(views) > 0
        THEN (SUM(emails_captured)::DECIMAL / SUM(views) * 100)
        ELSE 0
      END
      FROM assessment_analytics
      WHERE assessment_id = NEW.assessment_id
    ),
    avg_score = (
      SELECT AVG(score)::DECIMAL(5,2)
      FROM assessment_responses
      WHERE assessment_id = NEW.assessment_id AND completed_at IS NOT NULL
    ),
    avg_completion_time = (
      SELECT AVG(completion_time)::INTEGER
      FROM assessment_responses
      WHERE assessment_id = NEW.assessment_id AND completion_time IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = NEW.assessment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update template stats when analytics change
CREATE TRIGGER trigger_update_assessment_template_stats
  AFTER INSERT OR UPDATE ON assessment_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_template_stats();

-- Function: Auto-update assessment_templates.updated_at
CREATE OR REPLACE FUNCTION update_assessment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on assessment_templates
CREATE TRIGGER trigger_assessment_templates_updated_at
  BEFORE UPDATE ON assessment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_updated_at();

-- Trigger: Auto-update updated_at on assessment_responses
CREATE TRIGGER trigger_assessment_responses_updated_at
  BEFORE UPDATE ON assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_updated_at();

-- Trigger: Auto-update updated_at on assessment_analytics
CREATE TRIGGER trigger_assessment_analytics_updated_at
  BEFORE UPDATE ON assessment_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_updated_at();

-- Function: Calculate assessment response score
CREATE OR REPLACE FUNCTION calculate_assessment_score(
  p_answers JSONB,
  p_scoring_logic JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_total_score INTEGER := 0;
  v_question_id TEXT;
  v_answer TEXT;
  v_point_value INTEGER;
BEGIN
  -- Loop through each answer
  FOR v_question_id, v_answer IN SELECT * FROM jsonb_each_text(p_answers)
  LOOP
    -- Get point value for this answer from scoring logic
    v_point_value := (p_scoring_logic->v_question_id->v_answer)::INTEGER;

    -- Add to total (handle null as 0)
    v_total_score := v_total_score + COALESCE(v_point_value, 0);
  END LOOP;

  -- Ensure score is within 0-100 range
  RETURN LEAST(GREATEST(v_total_score, 0), 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Track assessment view (called when someone lands on assessment page)
CREATE OR REPLACE FUNCTION track_assessment_view(
  p_assessment_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update today's analytics
  INSERT INTO assessment_analytics (assessment_id, user_id, date, views)
  VALUES (p_assessment_id, p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (assessment_id, date)
  DO UPDATE SET
    views = assessment_analytics.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Track assessment start (called when user answers first question)
CREATE OR REPLACE FUNCTION track_assessment_start(
  p_assessment_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO assessment_analytics (assessment_id, user_id, date, starts)
  VALUES (p_assessment_id, p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (assessment_id, date)
  DO UPDATE SET
    starts = assessment_analytics.starts + 1,
    start_rate = CASE
      WHEN assessment_analytics.views > 0
      THEN ((assessment_analytics.starts + 1)::DECIMAL / assessment_analytics.views * 100)
      ELSE 0
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Track assessment completion (called when all questions answered)
CREATE OR REPLACE FUNCTION track_assessment_completion(
  p_assessment_id UUID,
  p_user_id UUID,
  p_email_captured BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO assessment_analytics (
    assessment_id,
    user_id,
    date,
    completions,
    emails_captured
  )
  VALUES (
    p_assessment_id,
    p_user_id,
    CURRENT_DATE,
    1,
    CASE WHEN p_email_captured THEN 1 ELSE 0 END
  )
  ON CONFLICT (assessment_id, date)
  DO UPDATE SET
    completions = assessment_analytics.completions + 1,
    emails_captured = assessment_analytics.emails_captured +
      CASE WHEN p_email_captured THEN 1 ELSE 0 END,
    completion_rate = CASE
      WHEN assessment_analytics.starts > 0
      THEN ((assessment_analytics.completions + 1)::DECIMAL / assessment_analytics.starts * 100)
      ELSE 0
    END,
    email_capture_rate = CASE
      WHEN (assessment_analytics.completions + 1) > 0
      THEN ((assessment_analytics.emails_captured + CASE WHEN p_email_captured THEN 1 ELSE 0 END)::DECIMAL
        / (assessment_analytics.completions + 1) * 100)
      ELSE 0
    END,
    overall_conversion_rate = CASE
      WHEN assessment_analytics.views > 0
      THEN ((assessment_analytics.emails_captured + CASE WHEN p_email_captured THEN 1 ELSE 0 END)::DECIMAL
        / assessment_analytics.views * 100)
      ELSE 0
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE assessment_templates IS 'Stores reusable assessment templates following the 15-question methodology for 20-40% conversion rates';
COMMENT ON TABLE assessment_responses IS 'Individual lead submissions to assessments with full qualification data';
COMMENT ON TABLE assessment_analytics IS 'Daily aggregated analytics tracking conversion funnel performance';

COMMENT ON COLUMN assessment_templates.questions IS 'Array of 15 question objects: 10 best practice + 5 qualification questions';
COMMENT ON COLUMN assessment_templates.scoring_logic IS 'Maps question IDs and answers to point values for score calculation';
COMMENT ON COLUMN assessment_templates.result_categories IS 'Score ranges and associated messaging (high/medium/low categories)';

COMMENT ON COLUMN assessment_responses.score IS 'Calculated score from 0-100 based on answers and scoring logic';
COMMENT ON COLUMN assessment_responses.result_category IS 'Category based on score: high (75+), medium (50-74), low (<50)';

COMMENT ON FUNCTION calculate_assessment_score IS 'Calculates total score (0-100) from answers and scoring logic';
COMMENT ON FUNCTION track_assessment_view IS 'Increments view count for assessment analytics';
COMMENT ON FUNCTION track_assessment_start IS 'Increments start count and updates start rate';
COMMENT ON FUNCTION track_assessment_completion IS 'Increments completion count and updates all conversion rates';
