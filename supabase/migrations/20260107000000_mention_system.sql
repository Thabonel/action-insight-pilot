-- Mention Building System
-- Database schema for @-mentions, #hashtags, monitoring, and analytics
-- Created: 2026-01-07

-- =============================================================================
-- TABLE 1: social_mentions
-- Purpose: User mention autocomplete history
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.social_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  mention_handle TEXT NOT NULL,
  mention_display_name TEXT,
  mention_type TEXT DEFAULT 'user' CHECK (mention_type IN ('user', 'brand', 'influencer', 'competitor')),
  usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT social_mentions_unique_user_platform_handle UNIQUE (user_id, platform, mention_handle)
);

-- Index for fast autocomplete lookups
CREATE INDEX IF NOT EXISTS idx_social_mentions_user_platform ON public.social_mentions(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_mentions_usage ON public.social_mentions(user_id, platform, usage_count DESC);

-- =============================================================================
-- TABLE 2: hashtag_suggestions
-- Purpose: Hashtag history + AI generations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hashtag_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  platform TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
  avg_engagement_rate NUMERIC CHECK (avg_engagement_rate >= 0 AND avg_engagement_rate <= 100),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence_score NUMERIC CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  context_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT hashtag_suggestions_unique_user_hashtag_platform UNIQUE (user_id, hashtag, platform)
);

-- Index for performance-sorted autocomplete
CREATE INDEX IF NOT EXISTS idx_hashtag_suggestions_user_platform ON public.hashtag_suggestions(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_hashtag_suggestions_engagement ON public.hashtag_suggestions(user_id, platform, avg_engagement_rate DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_hashtag_suggestions_ai ON public.hashtag_suggestions(user_id, ai_generated, created_at DESC);

-- =============================================================================
-- TABLE 3: mention_monitoring
-- Purpose: Discovered brand mentions from social platforms
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mention_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  post_url TEXT,
  mentioned_handle TEXT NOT NULL,
  mentioned_by_handle TEXT NOT NULL,
  post_content TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  engagement_stats JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT false,
  is_responded BOOLEAN DEFAULT false,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT mention_monitoring_unique_platform_post UNIQUE (platform, post_id)
);

-- Index for inbox-style queries
CREATE INDEX IF NOT EXISTS idx_mention_monitoring_user_unread ON public.mention_monitoring(user_id, is_read, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_mention_monitoring_user_platform ON public.mention_monitoring(user_id, platform, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_mention_monitoring_sentiment ON public.mention_monitoring(user_id, sentiment, discovered_at DESC);

-- =============================================================================
-- TABLE 4: mention_analytics
-- Purpose: Aggregated performance metrics for mentions/hashtags
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mention_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  platform TEXT NOT NULL,
  tag_text TEXT NOT NULL,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('mention', 'hashtag')),
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  total_reach INTEGER DEFAULT 0 CHECK (total_reach >= 0),
  total_impressions INTEGER DEFAULT 0 CHECK (total_impressions >= 0),
  total_engagement INTEGER DEFAULT 0 CHECK (total_engagement >= 0),
  avg_engagement_rate NUMERIC CHECK (avg_engagement_rate >= 0 AND avg_engagement_rate <= 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_mention_analytics_user_period ON public.mention_analytics(user_id, period_start DESC, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_mention_analytics_user_platform_type ON public.mention_analytics(user_id, platform, tag_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_mention_analytics_engagement ON public.mention_analytics(user_id, avg_engagement_rate DESC NULLS LAST);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function: Increment mention usage count
-- Called after successful post to track mention usage
CREATE OR REPLACE FUNCTION public.increment_mention_usage(
  p_user_id UUID,
  p_platform TEXT,
  p_mention_handle TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.social_mentions (
    user_id,
    platform,
    mention_handle,
    mention_display_name,
    usage_count,
    last_used_at
  )
  VALUES (
    p_user_id,
    p_platform,
    p_mention_handle,
    p_display_name,
    1,
    now()
  )
  ON CONFLICT (user_id, platform, mention_handle)
  DO UPDATE SET
    usage_count = public.social_mentions.usage_count + 1,
    last_used_at = now(),
    mention_display_name = COALESCE(EXCLUDED.mention_display_name, public.social_mentions.mention_display_name);
END;
$$;

-- Function: Get unread mentions count
-- Used for notification badges
CREATE OR REPLACE FUNCTION public.get_unread_mentions_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.mention_monitoring
  WHERE user_id = p_user_id AND is_read = false;
$$;

-- Function: Get top hashtags by engagement
-- Used for recommendations and analytics
CREATE OR REPLACE FUNCTION public.get_top_hashtags_by_engagement(
  p_user_id UUID,
  p_platform TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  hashtag TEXT,
  usage_count INTEGER,
  avg_engagement_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    hashtag,
    usage_count,
    avg_engagement_rate
  FROM public.hashtag_suggestions
  WHERE user_id = p_user_id
    AND platform = p_platform
    AND avg_engagement_rate IS NOT NULL
  ORDER BY avg_engagement_rate DESC NULLS LAST, usage_count DESC
  LIMIT p_limit;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.social_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mention_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mention_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own mentions
DROP POLICY IF EXISTS "Users can manage own mentions" ON public.social_mentions;
CREATE POLICY "Users can manage own mentions"
  ON public.social_mentions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can manage their own hashtag suggestions
DROP POLICY IF EXISTS "Users can manage own hashtags" ON public.hashtag_suggestions;
CREATE POLICY "Users can manage own hashtags"
  ON public.hashtag_suggestions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can manage their own mention monitoring data
DROP POLICY IF EXISTS "Users can manage own monitoring" ON public.mention_monitoring;
CREATE POLICY "Users can manage own monitoring"
  ON public.mention_monitoring
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own analytics (read-only for now)
DROP POLICY IF EXISTS "Users can view own analytics" ON public.mention_analytics;
CREATE POLICY "Users can view own analytics"
  ON public.mention_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert analytics (for aggregator function)
DROP POLICY IF EXISTS "Service role can insert analytics" ON public.mention_analytics;
CREATE POLICY "Service role can insert analytics"
  ON public.mention_analytics
  FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.social_mentions TO authenticated;
GRANT ALL ON public.hashtag_suggestions TO authenticated;
GRANT ALL ON public.mention_monitoring TO authenticated;
GRANT SELECT ON public.mention_analytics TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.increment_mention_usage(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_mentions_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_hashtags_by_engagement(UUID, TEXT, INTEGER) TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.social_mentions IS 'Stores user mention history for autocomplete suggestions';
COMMENT ON TABLE public.hashtag_suggestions IS 'Stores hashtag history and AI-generated suggestions with performance metrics';
COMMENT ON TABLE public.mention_monitoring IS 'Tracks discovered brand mentions from social media platforms';
COMMENT ON TABLE public.mention_analytics IS 'Aggregated performance analytics for mentions and hashtags';

COMMENT ON FUNCTION public.increment_mention_usage IS 'Increments usage count for a mention after successful post';
COMMENT ON FUNCTION public.get_unread_mentions_count IS 'Returns count of unread mentions for notification badges';
COMMENT ON FUNCTION public.get_top_hashtags_by_engagement IS 'Returns top-performing hashtags sorted by engagement rate';
