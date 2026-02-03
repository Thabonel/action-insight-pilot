-- Migration: Web Scraper Agent Tables
-- Created: 2026-02-03
-- Description: Tables for storing web scraping results and configurations

-- =====================================================
-- Table: scrape_results
-- Stores results from web scraping operations
-- =====================================================
CREATE TABLE IF NOT EXISTS scrape_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INTEGER,
    url TEXT NOT NULL,
    scrape_type TEXT NOT NULL DEFAULT 'generic',
    data JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    fetch_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_scrape_results_user ON scrape_results(user_id);

-- Index for URL lookups (for caching)
CREATE INDEX IF NOT EXISTS idx_scrape_results_url ON scrape_results(url, created_at DESC);

-- Index for scrape type filtering
CREATE INDEX IF NOT EXISTS idx_scrape_results_type ON scrape_results(scrape_type);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_scrape_results_status ON scrape_results(status);

-- =====================================================
-- Table: scrape_jobs
-- Tracks scraping jobs for batch/crawl operations
-- =====================================================
CREATE TABLE IF NOT EXISTS scrape_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'single', 'batch', 'crawl'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    config JSONB NOT NULL DEFAULT '{}',
    progress JSONB DEFAULT '{"completed": 0, "total": 0, "failed": 0}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user jobs
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_user ON scrape_jobs(user_id, created_at DESC);

-- Index for job status
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs(status);

-- =====================================================
-- Table: scrape_schedules
-- Stores scheduled scraping tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS scrape_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    scrape_type TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    schedule_cron TEXT NOT NULL, -- Cron expression
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_result_id UUID REFERENCES scrape_results(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active schedules
CREATE INDEX IF NOT EXISTS idx_scrape_schedules_active ON scrape_schedules(is_active, next_run_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE scrape_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_schedules ENABLE ROW LEVEL SECURITY;

-- scrape_results policies
CREATE POLICY "Users can view their own scrape results"
    ON scrape_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scrape results"
    ON scrape_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrape results"
    ON scrape_results FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrape results"
    ON scrape_results FOR DELETE
    USING (auth.uid() = user_id);

-- scrape_jobs policies
CREATE POLICY "Users can view their own scrape jobs"
    ON scrape_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scrape jobs"
    ON scrape_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrape jobs"
    ON scrape_jobs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrape jobs"
    ON scrape_jobs FOR DELETE
    USING (auth.uid() = user_id);

-- scrape_schedules policies
CREATE POLICY "Users can view their own scrape schedules"
    ON scrape_schedules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scrape schedules"
    ON scrape_schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrape schedules"
    ON scrape_schedules FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrape schedules"
    ON scrape_schedules FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Utility Functions
-- =====================================================

-- Function to log a scrape result
CREATE OR REPLACE FUNCTION log_scrape_result(
    p_user_id UUID,
    p_url TEXT,
    p_scrape_type TEXT,
    p_data JSONB,
    p_status TEXT DEFAULT 'success',
    p_error_message TEXT DEFAULT NULL,
    p_fetch_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_result_id UUID;
BEGIN
    INSERT INTO scrape_results (
        user_id, url, scrape_type, data, status, error_message, fetch_time_ms
    ) VALUES (
        p_user_id, p_url, p_scrape_type, p_data, p_status, p_error_message, p_fetch_time_ms
    )
    RETURNING id INTO v_result_id;

    RETURN v_result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cached scrape result
CREATE OR REPLACE FUNCTION get_cached_scrape(
    p_url TEXT,
    p_max_age_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    data JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT sr.id, sr.data, sr.created_at
    FROM scrape_results sr
    WHERE sr.url = p_url
      AND sr.status = 'success'
      AND sr.created_at > NOW() - (p_max_age_hours || ' hours')::INTERVAL
    ORDER BY sr.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update job progress
CREATE OR REPLACE FUNCTION update_scrape_job_progress(
    p_job_id UUID,
    p_completed INTEGER,
    p_total INTEGER,
    p_failed INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE scrape_jobs
    SET progress = jsonb_build_object(
            'completed', p_completed,
            'total', p_total,
            'failed', p_failed
        ),
        updated_at = NOW()
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_scrape_result TO authenticated;
GRANT EXECUTE ON FUNCTION get_cached_scrape TO authenticated;
GRANT EXECUTE ON FUNCTION update_scrape_job_progress TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE scrape_results IS 'Stores results from web scraping operations';
COMMENT ON TABLE scrape_jobs IS 'Tracks batch and crawl scraping jobs';
COMMENT ON TABLE scrape_schedules IS 'Stores scheduled recurring scrape tasks';
COMMENT ON FUNCTION log_scrape_result IS 'Logs a scrape result to the database';
COMMENT ON FUNCTION get_cached_scrape IS 'Retrieves cached scrape result if available';
COMMENT ON FUNCTION update_scrape_job_progress IS 'Updates progress of a scrape job';
