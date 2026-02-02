-- OpenClaw Integration Migration
-- Creates tables and functions needed for OpenClaw memory storage and multi-tenant support

-- OpenClaw Memory Storage
-- Stores conversation history, context, and skill execution results
CREATE TABLE openclaw_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL DEFAULT 'main',
    session_id TEXT NOT NULL,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('session', 'long_term', 'skill_context', 'conversation', 'system')),
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration for temporary memory

    -- Composite index for efficient queries
    UNIQUE(user_id, agent_name, session_id, memory_type, id)
);

-- Add indexes for performance
CREATE INDEX idx_openclaw_memory_user_session ON openclaw_memory(user_id, session_id);
CREATE INDEX idx_openclaw_memory_agent ON openclaw_memory(agent_name, memory_type);
CREATE INDEX idx_openclaw_memory_created ON openclaw_memory(created_at DESC);
CREATE INDEX idx_openclaw_memory_expires ON openclaw_memory(expires_at) WHERE expires_at IS NOT NULL;

-- GIN index for JSONB content search
CREATE INDEX idx_openclaw_memory_content ON openclaw_memory USING GIN(content);
CREATE INDEX idx_openclaw_memory_metadata ON openclaw_memory USING GIN(metadata);

-- OpenClaw Skill Execution Log
-- Tracks skill executions, performance, and results for monitoring and optimization
CREATE TABLE openclaw_skill_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    task_type TEXT,
    input_data JSONB NOT NULL,
    output_data JSONB,
    execution_path TEXT CHECK (execution_path IN ('openclaw', 'legacy', 'openclaw_failed_fallback_legacy', 'error')),
    execution_time_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for skill execution tracking
CREATE INDEX idx_openclaw_skills_user ON openclaw_skill_executions(user_id, created_at DESC);
CREATE INDEX idx_openclaw_skills_performance ON openclaw_skill_executions(skill_name, success, execution_time_ms);
CREATE INDEX idx_openclaw_skills_session ON openclaw_skill_executions(session_id, created_at);

-- OpenClaw Configuration
-- Stores per-user OpenClaw configuration and preferences
CREATE TABLE openclaw_user_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    config_data JSONB NOT NULL DEFAULT '{}',
    agent_preferences JSONB DEFAULT '{}',
    skill_preferences JSONB DEFAULT '{}',
    routing_preferences JSONB DEFAULT '{"openclaw_percentage": 0, "fallback_enabled": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user config lookups
CREATE UNIQUE INDEX idx_openclaw_config_user ON openclaw_user_config(user_id);

-- OpenClaw System Status
-- Tracks system health, skill availability, and integration status
CREATE TABLE openclaw_system_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'degraded', 'error')),
    status_data JSONB DEFAULT '{}',
    last_check_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(component_name)
);

-- Index for system status monitoring
CREATE INDEX idx_openclaw_status_check ON openclaw_system_status(last_check_at DESC);

-- Row Level Security Policies

-- OpenClaw Memory - Users can only access their own memory
ALTER TABLE openclaw_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own memory" ON openclaw_memory
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all memory" ON openclaw_memory
    FOR ALL USING (auth.role() = 'service_role');

-- OpenClaw Skill Executions - Users can only see their own executions
ALTER TABLE openclaw_skill_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own skill executions" ON openclaw_skill_executions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all executions" ON openclaw_skill_executions
    FOR ALL USING (auth.role() = 'service_role');

-- OpenClaw User Config - Users can only access their own config
ALTER TABLE openclaw_user_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own config" ON openclaw_user_config
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all configs" ON openclaw_user_config
    FOR ALL USING (auth.role() = 'service_role');

-- OpenClaw System Status - Read-only for authenticated users, full access for service role
ALTER TABLE openclaw_system_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read system status" ON openclaw_system_status
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage system status" ON openclaw_system_status
    FOR ALL USING (auth.role() = 'service_role');

-- Utility Functions

-- Function to clean up expired memory entries
CREATE OR REPLACE FUNCTION cleanup_expired_openclaw_memory()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    DELETE FROM openclaw_memory
    WHERE expires_at IS NOT NULL AND expires_at < NOW();

    GET DIAGNOSTICS cleaned_count = ROW_COUNT;

    INSERT INTO openclaw_system_status (component_name, status, status_data)
    VALUES ('memory_cleanup', 'active', jsonb_build_object(
        'cleaned_entries', cleaned_count,
        'cleanup_time', NOW()
    ))
    ON CONFLICT (component_name)
    DO UPDATE SET
        status_data = EXCLUDED.status_data,
        last_check_at = NOW();

    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log OpenClaw skill execution
CREATE OR REPLACE FUNCTION log_openclaw_skill_execution(
    p_user_id UUID,
    p_session_id TEXT,
    p_skill_name TEXT,
    p_task_type TEXT,
    p_input_data JSONB,
    p_output_data JSONB DEFAULT NULL,
    p_execution_path TEXT DEFAULT 'openclaw',
    p_execution_time_ms INTEGER DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_confidence_score DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    execution_id UUID;
BEGIN
    INSERT INTO openclaw_skill_executions (
        user_id, session_id, skill_name, task_type, input_data,
        output_data, execution_path, execution_time_ms, success,
        error_message, confidence_score, completed_at
    ) VALUES (
        p_user_id, p_session_id, p_skill_name, p_task_type, p_input_data,
        p_output_data, p_execution_path, p_execution_time_ms, p_success,
        p_error_message, p_confidence_score,
        CASE WHEN p_output_data IS NOT NULL THEN NOW() ELSE NULL END
    )
    RETURNING id INTO execution_id;

    RETURN execution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's OpenClaw configuration with defaults
CREATE OR REPLACE FUNCTION get_user_openclaw_config(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_config JSONB;
BEGIN
    SELECT config_data INTO user_config
    FROM openclaw_user_config
    WHERE user_id = p_user_id;

    -- Return default config if user config doesn't exist
    IF user_config IS NULL THEN
        user_config := jsonb_build_object(
            'openclaw_percentage', 0,
            'fallback_enabled', true,
            'agent_preferences', jsonb_build_object(),
            'skill_preferences', jsonb_build_object()
        );

        -- Create default config for user
        INSERT INTO openclaw_user_config (user_id, config_data)
        VALUES (p_user_id, user_config)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN user_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user's OpenClaw routing percentage
CREATE OR REPLACE FUNCTION update_user_openclaw_percentage(
    p_user_id UUID,
    p_percentage INTEGER
)
RETURNS JSONB AS $$
DECLARE
    updated_config JSONB;
BEGIN
    -- Validate percentage
    IF p_percentage < 0 OR p_percentage > 100 THEN
        RAISE EXCEPTION 'Percentage must be between 0 and 100';
    END IF;

    INSERT INTO openclaw_user_config (user_id, routing_preferences, updated_at)
    VALUES (p_user_id, jsonb_build_object('openclaw_percentage', p_percentage, 'fallback_enabled', true), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        routing_preferences = jsonb_set(
            COALESCE(openclaw_user_config.routing_preferences, '{}'),
            '{openclaw_percentage}',
            to_jsonb(p_percentage)
        ),
        updated_at = NOW()
    RETURNING routing_preferences INTO updated_config;

    RETURN updated_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save OpenClaw memory with automatic cleanup
CREATE OR REPLACE FUNCTION save_openclaw_memory(
    p_user_id UUID,
    p_agent_name TEXT,
    p_session_id TEXT,
    p_memory_type TEXT,
    p_content JSONB,
    p_metadata JSONB DEFAULT '{}',
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    memory_id UUID;
    max_entries INTEGER := 1000; -- Maximum entries per user per agent
    cleanup_threshold INTEGER := 50; -- Clean up when over this many entries
BEGIN
    -- Insert new memory entry
    INSERT INTO openclaw_memory (
        user_id, agent_name, session_id, memory_type,
        content, metadata, expires_at
    ) VALUES (
        p_user_id, p_agent_name, p_session_id, p_memory_type,
        p_content, p_metadata, p_expires_at
    )
    RETURNING id INTO memory_id;

    -- Clean up old entries if we exceed the threshold
    IF (SELECT COUNT(*) FROM openclaw_memory
        WHERE user_id = p_user_id AND agent_name = p_agent_name) > max_entries THEN

        DELETE FROM openclaw_memory
        WHERE id IN (
            SELECT id FROM openclaw_memory
            WHERE user_id = p_user_id AND agent_name = p_agent_name
            ORDER BY created_at ASC
            LIMIT cleanup_threshold
        );
    END IF;

    RETURN memory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance tracking view
CREATE VIEW openclaw_performance_summary AS
SELECT
    skill_name,
    execution_path,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE success = true) as successful_executions,
    ROUND(AVG(execution_time_ms)::numeric, 2) as avg_execution_time_ms,
    ROUND(AVG(confidence_score)::numeric, 3) as avg_confidence_score,
    DATE_TRUNC('day', created_at) as execution_date
FROM openclaw_skill_executions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY skill_name, execution_path, DATE_TRUNC('day', created_at)
ORDER BY execution_date DESC, total_executions DESC;

-- User activity summary view
CREATE VIEW openclaw_user_activity AS
SELECT
    u.id as user_id,
    u.email,
    COUNT(DISTINCT ose.session_id) as unique_sessions,
    COUNT(ose.id) as total_skill_executions,
    COUNT(ose.id) FILTER (WHERE ose.success = true) as successful_executions,
    MAX(ose.created_at) as last_activity,
    COALESCE(ouc.routing_preferences->>'openclaw_percentage', '0')::integer as openclaw_percentage
FROM auth.users u
LEFT JOIN openclaw_skill_executions ose ON u.id = ose.user_id AND ose.created_at >= NOW() - INTERVAL '7 days'
LEFT JOIN openclaw_user_config ouc ON u.id = ouc.user_id
GROUP BY u.id, u.email, ouc.routing_preferences
HAVING COUNT(ose.id) > 0 OR MAX(ose.created_at) IS NOT NULL
ORDER BY last_activity DESC NULLS LAST;

-- Grant permissions to authenticated users for functions
GRANT EXECUTE ON FUNCTION get_user_openclaw_config(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_openclaw_percentage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION save_openclaw_memory(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ) TO authenticated;

-- Grant permissions for views
GRANT SELECT ON openclaw_performance_summary TO service_role;
GRANT SELECT ON openclaw_user_activity TO service_role;

-- Create a scheduled job to clean up expired memory (if pg_cron is available)
-- SELECT cron.schedule('openclaw-memory-cleanup', '0 2 * * *', 'SELECT cleanup_expired_openclaw_memory();');

-- Insert initial system status
INSERT INTO openclaw_system_status (component_name, status, status_data) VALUES
('openclaw_integration', 'active', '{"version": "1.0.0", "installation_date": "2026-02-02"}'),
('memory_storage', 'active', '{"max_entries_per_user": 1000, "cleanup_enabled": true}'),
('skill_execution_tracking', 'active', '{"logging_enabled": true}')
ON CONFLICT (component_name) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE openclaw_memory IS 'Stores OpenClaw agent memory, conversations, and context for multi-tenant support';
COMMENT ON TABLE openclaw_skill_executions IS 'Tracks OpenClaw skill executions for monitoring, performance analysis, and A/B testing';
COMMENT ON TABLE openclaw_user_config IS 'Per-user OpenClaw configuration including routing preferences and agent settings';
COMMENT ON TABLE openclaw_system_status IS 'System health monitoring for OpenClaw integration components';