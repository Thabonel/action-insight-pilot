-- Video Publishing System Migration
-- Created: 2026-01-01
-- Purpose: Enable video publishing to TikTok, Instagram Reels, YouTube Shorts via Blotato and direct APIs

-- =============================================
-- TABLE: published_videos
-- Stores metadata and status for published videos
-- =============================================

CREATE TABLE IF NOT EXISTS public.published_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_project_id UUID REFERENCES public.ai_video_projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  -- Video file details
  video_url TEXT NOT NULL, -- Supabase Storage URL or external URL
  video_duration_s INTEGER,
  video_format TEXT DEFAULT 'mp4', -- 'mp4', 'webm', 'mov'
  video_size_bytes BIGINT,
  video_aspect_ratio TEXT, -- '9:16', '16:9', '1:1'

  -- Publishing details (JSONB for flexibility)
  platforms JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example platforms structure:
  -- {
  --   "tiktok": {
  --     "status": "published",
  --     "platform_video_id": "7123456789",
  --     "platform_url": "https://tiktok.com/@user/video/7123456789",
  --     "caption": "Check this out! #viral",
  --     "hashtags": ["viral", "trending"],
  --     "published_at": "2026-01-01T12:00:00Z",
  --     "error_message": null,
  --     "retry_count": 0
  --   },
  --   "instagram": {
  --     "status": "failed",
  --     "error_message": "Token expired",
  --     "retry_count": 3
  --   }
  -- }

  -- Content metadata
  caption TEXT,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT,

  -- Scheduling
  scheduled_for TIMESTAMPTZ,

  -- Status tracking
  overall_status TEXT DEFAULT 'pending' CHECK (overall_status IN ('pending', 'publishing', 'published', 'partially_published', 'failed', 'scheduled')),
  publish_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_published_videos_user_id ON public.published_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_published_videos_status ON public.published_videos(overall_status);
CREATE INDEX IF NOT EXISTS idx_published_videos_scheduled ON public.published_videos(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_published_videos_video_project ON public.published_videos(video_project_id) WHERE video_project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_published_videos_campaign ON public.published_videos(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_published_videos_created_at ON public.published_videos(created_at DESC);

-- RLS Policies
ALTER TABLE public.published_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own published videos" ON public.published_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own published videos" ON public.published_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own published videos" ON public.published_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own published videos" ON public.published_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_published_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_published_videos_updated_at
  BEFORE UPDATE ON public.published_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_published_videos_updated_at();

-- =============================================
-- TABLE: publishing_queue
-- Stores scheduled posts to be published later
-- =============================================

CREATE TABLE IF NOT EXISTS public.publishing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_video_id UUID NOT NULL REFERENCES public.published_videos(id) ON DELETE CASCADE,

  -- Scheduling details
  scheduled_for TIMESTAMPTZ NOT NULL,
  platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube', 'facebook'

  -- Platform-specific options
  platform_options JSONB DEFAULT '{}'::jsonb,
  -- Example: { "privacy": "public", "share_to_feed": true }

  -- Status tracking
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Error handling
  error_message TEXT,
  error_code TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_publishing_queue_scheduled ON public.publishing_queue(scheduled_for) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_publishing_queue_status ON public.publishing_queue(status);
CREATE INDEX IF NOT EXISTS idx_publishing_queue_user_id ON public.publishing_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_queue_video_id ON public.publishing_queue(published_video_id);

-- RLS Policies
ALTER TABLE public.publishing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue items" ON public.publishing_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue items" ON public.publishing_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue items" ON public.publishing_queue
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue items" ON public.publishing_queue
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TABLE: publishing_analytics
-- Stores performance metrics from platforms
-- =============================================

CREATE TABLE IF NOT EXISTS public.publishing_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_video_id UUID NOT NULL REFERENCES public.published_videos(id) ON DELETE CASCADE,

  -- Platform details
  platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube', 'facebook'
  platform_video_id TEXT,
  platform_url TEXT,

  -- Performance metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,

  -- Calculated metrics
  engagement_rate NUMERIC, -- (likes + comments + shares) / views
  watch_time_seconds INTEGER,
  average_watch_percentage NUMERIC,

  -- Demographics (JSONB for flexibility)
  audience_demographics JSONB DEFAULT '{}'::jsonb,
  -- Example: { "age_groups": { "18-24": 45, "25-34": 30 }, "countries": { "US": 60, "UK": 20 } }

  -- Fetching metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  fetch_method TEXT, -- 'api', 'manual', 'webhook'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_user_id ON public.publishing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_video_id ON public.publishing_analytics(published_video_id);
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_platform ON public.publishing_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_fetched_at ON public.publishing_analytics(fetched_at DESC);

-- RLS Policies
ALTER TABLE public.publishing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON public.publishing_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.publishing_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.publishing_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_publishing_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_publishing_analytics_updated_at
  BEFORE UPDATE ON public.publishing_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_publishing_analytics_updated_at();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get publishing summary for a user
CREATE OR REPLACE FUNCTION public.get_user_publishing_summary(p_user_id UUID)
RETURNS TABLE (
  total_published BIGINT,
  total_scheduled BIGINT,
  total_failed BIGINT,
  platforms_used TEXT[],
  total_views BIGINT,
  total_engagement BIGINT,
  avg_engagement_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.overall_status = 'published') AS total_published,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.overall_status = 'scheduled') AS total_scheduled,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.overall_status = 'failed') AS total_failed,
    ARRAY_AGG(DISTINCT jsonb_object_keys(pv.platforms)) AS platforms_used,
    COALESCE(SUM(pa.views), 0) AS total_views,
    COALESCE(SUM(pa.likes + pa.comments + pa.shares), 0) AS total_engagement,
    COALESCE(AVG(pa.engagement_rate), 0) AS avg_engagement_rate
  FROM public.published_videos pv
  LEFT JOIN public.publishing_analytics pa ON pa.published_video_id = pv.id
  WHERE pv.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform-specific publishing stats
CREATE OR REPLACE FUNCTION public.get_platform_publishing_stats(p_user_id UUID, p_platform TEXT)
RETURNS TABLE (
  total_published BIGINT,
  success_rate NUMERIC,
  avg_views NUMERIC,
  avg_engagement_rate NUMERIC,
  total_engagement BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_published,
    (COUNT(*) FILTER (WHERE (pv.platforms->p_platform->>'status') = 'published')::NUMERIC / NULLIF(COUNT(*), 0)) * 100 AS success_rate,
    AVG(pa.views) AS avg_views,
    AVG(pa.engagement_rate) AS avg_engagement_rate,
    SUM(pa.likes + pa.comments + pa.shares) AS total_engagement
  FROM public.published_videos pv
  LEFT JOIN public.publishing_analytics pa ON pa.published_video_id = pv.id AND pa.platform = p_platform
  WHERE pv.user_id = p_user_id
    AND pv.platforms ? p_platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old scheduled posts (past scheduled_for time but still queued)
CREATE OR REPLACE FUNCTION public.cleanup_stale_queue_items()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.publishing_queue
  WHERE status = 'queued'
    AND scheduled_for < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKET FOR PUBLISHED VIDEOS
-- =============================================

-- Create storage bucket for published videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'published-videos',
  'published-videos',
  true, -- Public bucket for platform access
  1073741824, -- 1GB max file size (for Instagram Reels)
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage bucket
CREATE POLICY "Users can upload own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'published-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'published-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'published-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'published-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access for platforms to download videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'published-videos');

-- =============================================
-- GRANTS (if needed for edge functions)
-- =============================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.published_videos TO authenticated;
GRANT ALL ON public.publishing_queue TO authenticated;
GRANT ALL ON public.publishing_analytics TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_publishing_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_publishing_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_queue_items() TO authenticated;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.published_videos IS 'Stores metadata and publishing status for videos published to social platforms';
COMMENT ON TABLE public.publishing_queue IS 'Queue for scheduled video publishing jobs';
COMMENT ON TABLE public.publishing_analytics IS 'Performance metrics fetched from social platforms';

COMMENT ON COLUMN public.published_videos.platforms IS 'JSONB object containing platform-specific publishing details and status';
COMMENT ON COLUMN public.published_videos.overall_status IS 'Aggregate status across all platforms: pending, publishing, published, partially_published, failed, scheduled';
COMMENT ON COLUMN public.publishing_queue.platform_options IS 'Platform-specific options like privacy settings, share_to_feed flags, etc.';

COMMENT ON FUNCTION public.get_user_publishing_summary(UUID) IS 'Returns aggregate publishing statistics for a user across all platforms';
COMMENT ON FUNCTION public.get_platform_publishing_stats(UUID, TEXT) IS 'Returns detailed statistics for a specific platform and user';
COMMENT ON FUNCTION public.cleanup_stale_queue_items() IS 'Deletes queue items that are 24+ hours past their scheduled time but still queued';
