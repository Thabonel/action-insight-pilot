-- YouTube Quota Tracking System
-- Tracks daily YouTube API quota usage per user
-- YouTube provides 10,000 units/day, with uploads costing 1,600 units each (~6 uploads/day)
-- Created: 2026-01-01

-- Create youtube_quota_usage table
CREATE TABLE IF NOT EXISTS public.youtube_quota_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  units_used INTEGER NOT NULL DEFAULT 0,
  uploads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one record per user per day
  CONSTRAINT youtube_quota_usage_user_date_unique UNIQUE (user_id, date)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_youtube_quota_usage_user_id
  ON public.youtube_quota_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_youtube_quota_usage_date
  ON public.youtube_quota_usage(date);

CREATE INDEX IF NOT EXISTS idx_youtube_quota_usage_user_date
  ON public.youtube_quota_usage(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.youtube_quota_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own quota usage
CREATE POLICY "Users can view own quota usage"
  ON public.youtube_quota_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own quota records
CREATE POLICY "Users can insert own quota usage"
  ON public.youtube_quota_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own quota records
CREATE POLICY "Users can update own quota usage"
  ON public.youtube_quota_usage
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all quota records (for edge functions)
CREATE POLICY "Service role can manage all quota"
  ON public.youtube_quota_usage
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to clean up old quota records (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_youtube_quota()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.youtube_quota_usage
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$;

-- Comment on table
COMMENT ON TABLE public.youtube_quota_usage IS 'Tracks daily YouTube API quota usage per user. YouTube provides 10,000 units/day with uploads costing 1,600 units (~6 uploads/day max).';

COMMENT ON COLUMN public.youtube_quota_usage.units_used IS 'Total YouTube API quota units consumed today (uploads = 1,600 units each)';
COMMENT ON COLUMN public.youtube_quota_usage.uploads_count IS 'Number of videos uploaded today';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.youtube_quota_usage TO authenticated;
GRANT ALL ON public.youtube_quota_usage TO service_role;
