-- AI Model Management System
-- Creates tables for automatic AI model discovery and configuration

-- Table: ai_model_configs
-- Stores all discovered AI models with metadata
CREATE TABLE IF NOT EXISTS ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'mistral')),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('flagship', 'fast', 'legacy')),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  max_tokens INTEGER,
  context_window INTEGER,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_validated_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider, model_name)
);

-- Table: ai_model_update_logs
-- Tracks monthly model discovery runs
CREATE TABLE IF NOT EXISTS ai_model_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  models_discovered INTEGER DEFAULT 0,
  models_added INTEGER DEFAULT 0,
  models_deprecated INTEGER DEFAULT 0,
  providers_checked TEXT[] DEFAULT '{}',
  errors JSONB DEFAULT '[]',
  execution_time_ms INTEGER,
  status TEXT CHECK (status IN ('success', 'partial', 'failed')) DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_provider ON ai_model_configs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_type ON ai_model_configs(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_active ON ai_model_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_default ON ai_model_configs(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_model_update_logs_run_date ON ai_model_update_logs(run_date DESC);

-- Row Level Security
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_update_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow service role full access, authenticated users read-only
CREATE POLICY "Service role full access on ai_model_configs"
  ON ai_model_configs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users read ai_model_configs"
  ON ai_model_configs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role full access on ai_model_update_logs"
  ON ai_model_update_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users read ai_model_update_logs"
  ON ai_model_update_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Seed initial data with current models (as of October 2025)
INSERT INTO ai_model_configs (provider, model_name, model_type, is_active, is_default, capabilities, pricing, context_window, metadata) VALUES
  -- OpenAI Models
  ('openai', 'gpt-5', 'flagship', true, true, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 2.50, "output_per_mtok": 10.00}', 128000, '{"release_date": "2025-08-01", "description": "Latest flagship model"}'),
  ('openai', 'gpt-5-mini', 'fast', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.15, "output_per_mtok": 0.60}', 128000, '{"release_date": "2025-08-01", "description": "Cost-effective fast model"}'),
  ('openai', 'gpt-5-nano', 'fast', true, false, '{"vision": false, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.05, "output_per_mtok": 0.20}', 128000, '{"release_date": "2025-08-01", "description": "Smallest fast model"}'),
  ('openai', 'gpt-4.1', 'legacy', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 2.00, "output_per_mtok": 8.00}', 1000000, '{"release_date": "2025-06-01", "description": "Previous generation flagship"}'),
  ('openai', 'gpt-4.1-mini', 'legacy', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.10, "output_per_mtok": 0.40}', 1000000, '{"release_date": "2025-06-01", "description": "Previous generation fast model"}'),
  ('openai', 'o3', 'flagship', true, false, '{"reasoning": true, "vision": true, "function_calling": true}', '{"input_per_mtok": 5.00, "output_per_mtok": 15.00}', 128000, '{"release_date": "2025-09-01", "description": "Advanced reasoning model"}'),
  ('openai', 'o4-mini', 'fast', true, false, '{"reasoning": true, "vision": true, "function_calling": true}', '{"input_per_mtok": 1.00, "output_per_mtok": 4.00}', 128000, '{"release_date": "2025-09-01", "description": "Fast reasoning model"}'),

  -- Anthropic Models
  ('anthropic', 'claude-sonnet-4-5', 'flagship', true, true, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 3.00, "output_per_mtok": 15.00}', 200000, '{"release_date": "2025-09-29", "description": "Best coding model in the world"}'),
  ('anthropic', 'claude-opus-4-1', 'flagship', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 15.00, "output_per_mtok": 75.00}', 200000, '{"release_date": "2025-08-05", "description": "Most powerful model for complex tasks"}'),
  ('anthropic', 'claude-haiku-4-5', 'fast', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 1.00, "output_per_mtok": 5.00}', 200000, '{"release_date": "2025-10-15", "description": "Fast and cost-effective"}'),
  ('anthropic', 'claude-sonnet-4', 'legacy', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 3.00, "output_per_mtok": 15.00}', 1000000, '{"release_date": "2025-05-22", "description": "Previous generation"}'),

  -- Google Models
  ('google', 'gemini-2.5-pro', 'flagship', true, true, '{"vision": true, "function_calling": true, "json_mode": true, "thinking": true}', '{"input_per_mtok": 1.25, "output_per_mtok": 5.00}', 1000000, '{"release_date": "2025-03-01", "description": "Most powerful with adaptive thinking"}'),
  ('google', 'gemini-2.5-flash', 'fast', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.075, "output_per_mtok": 0.30}', 1000000, '{"release_date": "2025-02-01", "description": "Best price-performance"}'),
  ('google', 'gemini-2.5-flash-lite', 'fast', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.03, "output_per_mtok": 0.10}', 1000000, '{"release_date": "2025-02-01", "description": "Most cost-efficient"}'),
  ('google', 'gemini-2.0-flash', 'legacy', true, false, '{"vision": true, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.10, "output_per_mtok": 0.40}', 1000000, '{"release_date": "2024-12-01", "description": "Previous generation"}'),

  -- Mistral Models
  ('mistral', 'mistral-large-latest', 'flagship', true, true, '{"vision": false, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 2.00, "output_per_mtok": 6.00}', 128000, '{"release_date": "2025-01-01", "description": "Current flagship"}'),
  ('mistral', 'mistral-medium-latest', 'fast', true, false, '{"vision": false, "function_calling": true, "json_mode": true}', '{"input_per_mtok": 0.70, "output_per_mtok": 2.10}', 32000, '{"release_date": "2025-01-01", "description": "Balanced performance"}'
)
ON CONFLICT (provider, model_name) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_model_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_ai_model_configs_updated_at_trigger
  BEFORE UPDATE ON ai_model_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_model_configs_updated_at();

-- Function to get default model for a provider
CREATE OR REPLACE FUNCTION get_default_model(p_provider TEXT, p_type TEXT DEFAULT 'flagship')
RETURNS TABLE (
  model_name TEXT,
  capabilities JSONB,
  pricing JSONB,
  context_window INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    amc.model_name,
    amc.capabilities,
    amc.pricing,
    amc.context_window
  FROM ai_model_configs amc
  WHERE amc.provider = p_provider
    AND amc.model_type = p_type
    AND amc.is_active = true
    AND amc.is_default = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE ai_model_configs IS 'Stores all discovered AI models with metadata for automatic model management';
COMMENT ON TABLE ai_model_update_logs IS 'Tracks monthly model discovery runs and their results';
COMMENT ON FUNCTION get_default_model IS 'Returns the default model for a given provider and type (flagship/fast/legacy)';
