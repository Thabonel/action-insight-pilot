-- Phase 6: Enterprise Mention Features
-- Team collaboration, approval workflows, brand safety filters

-- 1. Team Mention Shares
-- Allows users to share mention recommendations with team members
CREATE TABLE IF NOT EXISTS team_mention_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'mention' or 'hashtag'
  recommendation_data JSONB NOT NULL,
  shared_at TIMESTAMPTZ DEFAULT now(),
  is_accepted BOOLEAN DEFAULT NULL, -- NULL = pending, TRUE = accepted, FALSE = rejected
  accepted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Team Approvals
-- Approval workflow for mentions before they go live
CREATE TABLE IF NOT EXISTS team_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_content TEXT NOT NULL,
  mentions TEXT[],
  hashtags TEXT[],
  platform TEXT NOT NULL,
  requested_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '48 hours')
);

-- 3. Brand Safety Filters
-- Configurable filters to avoid controversial mentions
CREATE TABLE IF NOT EXISTS brand_safety_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filter_type TEXT NOT NULL, -- 'blocked_handle', 'blocked_keyword', 'blocked_domain'
  filter_value TEXT NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, filter_type, filter_value)
);

-- 4. Custom AI Models (Training Data)
-- Stores user-specific training data for custom mention models
CREATE TABLE IF NOT EXISTS custom_mention_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_content TEXT NOT NULL,
  successful_mentions TEXT[],
  successful_hashtags TEXT[],
  engagement_rate NUMERIC,
  platform TEXT NOT NULL,
  trained_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_team_shares_shared_with ON team_mention_shares(shared_with_user_id, is_accepted);
CREATE INDEX idx_team_shares_user ON team_mention_shares(user_id);
CREATE INDEX idx_team_approvals_user ON team_approvals(user_id, approval_status);
CREATE INDEX idx_team_approvals_requested_by ON team_approvals(requested_by_user_id);
CREATE INDEX idx_brand_safety_user ON brand_safety_filters(user_id, is_active);
CREATE INDEX idx_custom_training_user ON custom_mention_training_data(user_id, platform);

-- Row Level Security (RLS)
ALTER TABLE team_mention_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_safety_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_mention_training_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Team Shares
CREATE POLICY "Users can view shares they created or received"
  ON team_mention_shares FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = shared_with_user_id);

CREATE POLICY "Users can create shares"
  ON team_mention_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recipients can update shares"
  ON team_mention_shares FOR UPDATE
  USING (auth.uid() = shared_with_user_id);

-- RLS Policies for Team Approvals
CREATE POLICY "Users can view own approval requests"
  ON team_approvals FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = requested_by_user_id OR auth.uid() = approved_by_user_id);

CREATE POLICY "Users can create approval requests"
  ON team_approvals FOR INSERT
  WITH CHECK (auth.uid() = requested_by_user_id);

CREATE POLICY "Approvers can update approvals"
  ON team_approvals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Brand Safety Filters
CREATE POLICY "Users can manage own brand safety filters"
  ON brand_safety_filters FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for Custom Training Data
CREATE POLICY "Users can manage own training data"
  ON custom_mention_training_data FOR ALL
  USING (auth.uid() = user_id);

-- Helper Functions

-- Function: Check if mention is blocked by brand safety filters
CREATE OR REPLACE FUNCTION is_mention_safe(
  p_user_id UUID,
  p_mention_handle TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_blocked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_blocked_count
  FROM brand_safety_filters
  WHERE user_id = p_user_id
    AND filter_type = 'blocked_handle'
    AND filter_value = p_mention_handle
    AND is_active = true;

  RETURN v_blocked_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get pending approvals count
CREATE OR REPLACE FUNCTION get_pending_approvals_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM team_approvals
  WHERE user_id = p_user_id
    AND approval_status = 'pending'
    AND expires_at > now();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function: Share recommendation with team member
CREATE OR REPLACE FUNCTION share_recommendation(
  p_user_id UUID,
  p_shared_with_user_id UUID,
  p_recommendation_type TEXT,
  p_recommendation_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_share_id UUID;
BEGIN
  INSERT INTO team_mention_shares (
    user_id,
    shared_with_user_id,
    recommendation_type,
    recommendation_data
  ) VALUES (
    p_user_id,
    p_shared_with_user_id,
    p_recommendation_type,
    p_recommendation_data
  ) RETURNING id INTO v_share_id;

  RETURN v_share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at on brand_safety_filters
CREATE OR REPLACE FUNCTION update_brand_safety_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_safety_updated_at
BEFORE UPDATE ON brand_safety_filters
FOR EACH ROW
EXECUTE FUNCTION update_brand_safety_updated_at();

COMMENT ON TABLE team_mention_shares IS 'Collaborative mention recommendations shared between team members';
COMMENT ON TABLE team_approvals IS 'Approval workflow for posts with mentions before publishing';
COMMENT ON TABLE brand_safety_filters IS 'User-defined filters to avoid controversial or blocked mentions';
COMMENT ON TABLE custom_mention_training_data IS 'Training data for custom AI models based on user-specific successful posts';
