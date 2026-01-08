export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral';

export type ModelType = 'flagship' | 'fast' | 'legacy';

export interface ModelCapabilities {
  vision?: boolean;
  function_calling?: boolean;
  json_mode?: boolean;
  reasoning?: boolean;
  thinking?: boolean;
}

export interface ModelPricing {
  input_per_mtok?: number;
  output_per_mtok?: number;
}

export interface AIModelConfig {
  id: string;
  provider: AIProvider;
  model_name: string;
  model_type: ModelType;
  is_active: boolean;
  is_default: boolean;
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  max_tokens?: number;
  context_window?: number;
  discovered_at: string;
  last_validated_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIModelUpdateLog {
  id: string;
  run_date: string;
  models_discovered: number;
  models_added: number;
  models_deprecated: number;
  providers_checked: AIProvider[];
  errors: Array<{ provider?: string; error: string }>;
  execution_time_ms: number;
  status: 'success' | 'partial' | 'failed';
  created_at: string;
}

export interface ModelConfigResponse {
  success: boolean;
  model_name?: string;
  provider?: AIProvider;
  model_type?: ModelType;
  capabilities?: ModelCapabilities;
  pricing?: ModelPricing;
  context_window?: number;
  metadata?: Record<string, unknown>;
  cached?: boolean;
  fallback?: boolean;
  warning?: string;
  error?: string;
}

export interface ProvidersResponse {
  success: boolean;
  providers: Record<AIProvider, Record<ModelType, {
    model_name: string;
    capabilities: ModelCapabilities;
    pricing: ModelPricing;
    context_window: number;
  }>>;
}

export interface ModelHistoryResponse {
  success: boolean;
  logs: AIModelUpdateLog[];
}

export interface AllModelsResponse {
  success: boolean;
  models: AIModelConfig[];
  count: number;
}

export interface ValidateModelRequest {
  provider: AIProvider;
  model_name: string;
}

export interface ValidateModelResponse {
  success: boolean;
  valid: boolean;
  error?: string;
}
