-- ============================================================================
-- MIGRATION 2: AI Video Generator System
-- Run this second in Supabase SQL Editor (after migration_01)
-- ============================================================================

-- Note: Gemini API keys are stored in the existing user_secrets table
-- No changes needed to the secrets storage structure

-- AI Video Projects Table
CREATE TABLE IF NOT EXISTS ai_video_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  goal TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('YouTubeShort', 'TikTok', 'Reels', 'Landscape')),
  duration_s INTEGER NOT NULL DEFAULT 8 CHECK (duration_s > 0 AND duration_s <= 120),
  brand_kit JSONB DEFAULT '{}'::jsonb,
  scene_plan JSONB,
  generated_images TEXT[],
  final_prompt TEXT,
  video_url TEXT,
  veo_operation_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'planning', 'generating_images', 'generating_video', 'completed', 'failed')
  ),
  error_message TEXT,
  cost_usd NUMERIC(10,4) DEFAULT 0.00,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- AI Video Jobs Table
CREATE TABLE IF NOT EXISTS ai_video_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES ai_video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('image_generation', 'video_generation')),
  veo_operation_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  result_url TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_video_projects_user_id ON ai_video_projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_video_projects_campaign_id ON ai_video_projects(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_video_projects_status ON ai_video_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_video_projects_auto_generated ON ai_video_projects(user_id, auto_generated, created_at DESC) WHERE auto_generated = true;
CREATE INDEX IF NOT EXISTS idx_ai_video_jobs_project_id ON ai_video_jobs(project_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_video_jobs_user_id ON ai_video_jobs(user_id, status, created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_video_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_video_projects
CREATE POLICY "Users can view their own video projects"
  ON ai_video_projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video projects"
  ON ai_video_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video projects"
  ON ai_video_projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video projects"
  ON ai_video_projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_video_jobs
CREATE POLICY "Users can view their own video jobs"
  ON ai_video_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video jobs"
  ON ai_video_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video jobs"
  ON ai_video_jobs FOR UPDATE USING (auth.uid() = user_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_ai_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at timestamps
DROP TRIGGER IF EXISTS update_ai_video_projects_updated_at ON ai_video_projects;
CREATE TRIGGER update_ai_video_projects_updated_at
  BEFORE UPDATE ON ai_video_projects
  FOR EACH ROW EXECUTE FUNCTION update_ai_video_updated_at();

DROP TRIGGER IF EXISTS update_ai_video_jobs_updated_at ON ai_video_jobs;
CREATE TRIGGER update_ai_video_jobs_updated_at
  BEFORE UPDATE ON ai_video_jobs
  FOR EACH ROW EXECUTE FUNCTION update_ai_video_updated_at();

-- Create storage bucket for AI-generated videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-videos', 'ai-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-videos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can upload their own videos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their own videos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = ''ai-videos'' AND (storage.foldername(name))[1] = auth.uid()::text)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can read their own videos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read their own videos"
      ON storage.objects FOR SELECT
      USING (bucket_id = ''ai-videos'' AND (storage.foldername(name))[1] = auth.uid()::text)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can delete their own videos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own videos"
      ON storage.objects FOR DELETE
      USING (bucket_id = ''ai-videos'' AND (storage.foldername(name))[1] = auth.uid()::text)';
  END IF;
END $$;

-- Analytics view for video generation statistics
CREATE OR REPLACE VIEW ai_video_stats AS
SELECT
  user_id,
  COUNT(*) as total_videos,
  COUNT(*) FILTER (WHERE auto_generated = true) as autopilot_videos,
  COUNT(*) FILTER (WHERE auto_generated = false) as manual_videos,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_videos,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_videos,
  SUM(cost_usd) as total_cost_usd,
  AVG(cost_usd) FILTER (WHERE status = 'completed') as avg_cost_per_video,
  MAX(created_at) as last_video_created
FROM ai_video_projects
GROUP BY user_id;

-- Grant access to authenticated users
GRANT SELECT ON ai_video_stats TO authenticated;
