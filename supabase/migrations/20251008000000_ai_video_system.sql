-- AI Video Generator System Migration
-- Adds support for user-provided Gemini API keys and AI video generation

-- ============================================================================
-- 1. EXTEND USER API KEYS TABLE
-- ============================================================================

-- Add Gemini API key support to existing user_api_keys table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_api_keys'
    AND column_name = 'gemini_api_key_encrypted'
  ) THEN
    ALTER TABLE user_api_keys
    ADD COLUMN gemini_api_key_encrypted TEXT,
    ADD COLUMN gemini_key_added_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- 2. AI VIDEO PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_video_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- User inputs
  goal TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('YouTubeShort', 'TikTok', 'Reels', 'Landscape')),
  duration_s INTEGER NOT NULL DEFAULT 8 CHECK (duration_s > 0 AND duration_s <= 120),
  brand_kit JSONB DEFAULT '{}'::jsonb,

  -- AI-generated content
  scene_plan JSONB, -- LLM-generated scene breakdown
  generated_images TEXT[], -- Nano Banana image URLs
  final_prompt TEXT, -- Final Veo 3 prompt

  -- Output
  video_url TEXT, -- Final video URL from Supabase Storage
  veo_operation_id TEXT, -- For polling Veo 3 job status

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'planning', 'generating_images', 'generating_video', 'completed', 'failed')
  ),
  error_message TEXT,

  -- Cost tracking
  cost_usd NUMERIC(10,4) DEFAULT 0.00,

  -- Autopilot integration
  auto_generated BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. VIDEO GENERATION JOBS TABLE (for background processing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_video_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES ai_video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  job_type TEXT NOT NULL CHECK (job_type IN ('image_generation', 'video_generation')),
  veo_operation_id TEXT,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),

  -- Results
  result_url TEXT,
  error_message TEXT,

  -- API response metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_video_projects_user_id
  ON ai_video_projects(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_video_projects_campaign_id
  ON ai_video_projects(campaign_id)
  WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_video_projects_status
  ON ai_video_projects(user_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_video_projects_auto_generated
  ON ai_video_projects(user_id, auto_generated, created_at DESC)
  WHERE auto_generated = true;

CREATE INDEX IF NOT EXISTS idx_ai_video_jobs_project_id
  ON ai_video_jobs(project_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_video_jobs_user_id
  ON ai_video_jobs(user_id, status, created_at DESC);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE ai_video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_video_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own video projects
CREATE POLICY "Users can view their own video projects"
  ON ai_video_projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video projects"
  ON ai_video_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video projects"
  ON ai_video_projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video projects"
  ON ai_video_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only access their own video jobs
CREATE POLICY "Users can view their own video jobs"
  ON ai_video_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video jobs"
  ON ai_video_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video jobs"
  ON ai_video_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ai_video_projects
DROP TRIGGER IF EXISTS update_ai_video_projects_updated_at ON ai_video_projects;
CREATE TRIGGER update_ai_video_projects_updated_at
  BEFORE UPDATE ON ai_video_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

-- Trigger for ai_video_jobs
DROP TRIGGER IF EXISTS update_ai_video_jobs_updated_at ON ai_video_jobs;
CREATE TRIGGER update_ai_video_jobs_updated_at
  BEFORE UPDATE ON ai_video_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

-- ============================================================================
-- 7. STORAGE BUCKET FOR VIDEO FILES
-- ============================================================================

-- Create storage bucket for AI-generated videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-videos', 'ai-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ai-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read their own videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ai-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'ai-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 8. VIEWS FOR ANALYTICS
-- ============================================================================

-- View for video generation statistics per user
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

-- Grant access to view
GRANT SELECT ON ai_video_stats TO authenticated;

-- ============================================================================
-- 9. SAMPLE DATA (for testing)
-- ============================================================================

-- Note: This will be populated by the application, not by migration
-- This is just a reference for the expected data structure

/*
EXAMPLE INSERT:

INSERT INTO ai_video_projects (
  user_id,
  goal,
  platform,
  duration_s,
  brand_kit,
  scene_plan,
  status
) VALUES (
  auth.uid(),
  'Promote Unimog recovery tips for off-road enthusiasts',
  'YouTubeShort',
  8,
  '{"primary_color": "#FF5722", "secondary_color": "#FFC107", "logo_url": "https://..."}'::jsonb,
  '{
    "scenes": [
      {"visual": "Dramatic shot of Unimog stuck in mud", "text_overlay": "Stuck off-road?", "duration": 2},
      {"visual": "Expert demonstrates winch technique", "text_overlay": "Pro recovery tips inside", "duration": 3},
      {"visual": "Unimog drives away successfully", "text_overlay": "Subscribe for more!", "duration": 3}
    ]
  }'::jsonb,
  'planning'
);
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'AI Video Generator System migration completed successfully';
  RAISE NOTICE 'Tables created: ai_video_projects, ai_video_jobs';
  RAISE NOTICE 'Storage bucket created: ai-videos';
  RAISE NOTICE 'RLS policies enabled for all tables';
END $$;
