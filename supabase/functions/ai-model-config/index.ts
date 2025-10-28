import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelConfig {
  model_name: string;
  provider: string;
  model_type: string;
  capabilities: Record<string, boolean>;
  pricing: Record<string, number>;
  context_window: number;
  metadata: Record<string, any>;
}

const modelCache = new Map<string, { data: ModelConfig; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (path === 'ai-model-config' || path === 'model') {
      const provider = url.searchParams.get('provider');
      const modelType = url.searchParams.get('type') || 'flagship';

      if (!provider) {
        return new Response(
          JSON.stringify({
            error: 'Provider parameter is required',
            usage: '/ai-model-config?provider=openai&type=flagship',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const cacheKey = `${provider}:${modelType}`;
      const cached = modelCache.get(cacheKey);

      if (cached && cached.expires > Date.now()) {
        console.log(`Cache hit for ${cacheKey}`);
        return new Response(
          JSON.stringify({ success: true, ...cached.data, cached: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('ai_model_configs')
        .select('*')
        .eq('provider', provider)
        .eq('model_type', modelType)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      if (error || !data) {
        console.error(`Model not found for ${provider}/${modelType}:`, error);

        const fallbackModels: Record<string, Record<string, string>> = {
          openai: { flagship: 'gpt-5', fast: 'gpt-5-mini' },
          anthropic: { flagship: 'claude-sonnet-4-5', fast: 'claude-haiku-4-5' },
          google: { flagship: 'gemini-2.5-pro', fast: 'gemini-2.5-flash' },
          mistral: { flagship: 'mistral-large-latest', fast: 'mistral-medium-latest' },
        };

        const fallbackModel = fallbackModels[provider]?.[modelType];

        if (fallbackModel) {
          console.log(`Using fallback model: ${fallbackModel}`);
          return new Response(
            JSON.stringify({
              success: true,
              model_name: fallbackModel,
              provider,
              model_type: modelType,
              fallback: true,
              warning: 'Using hardcoded fallback - database config not available',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({
            error: 'Model not found and no fallback available',
            provider,
            model_type: modelType,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      modelCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL_MS });

      return new Response(
        JSON.stringify({ success: true, ...data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'providers') {
      const { data: configs, error } = await supabase
        .from('ai_model_configs')
        .select('provider, model_name, model_type, capabilities, pricing, context_window')
        .eq('is_active', true)
        .eq('is_default', true)
        .order('provider');

      if (error) {
        throw error;
      }

      const providers: Record<string, any> = {};
      for (const config of configs || []) {
        if (!providers[config.provider]) {
          providers[config.provider] = {};
        }
        providers[config.provider][config.model_type] = {
          model_name: config.model_name,
          capabilities: config.capabilities,
          pricing: config.pricing,
          context_window: config.context_window,
        };
      }

      return new Response(
        JSON.stringify({ success: true, providers }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'history' || path === 'logs') {
      const limit = parseInt(url.searchParams.get('limit') || '10');

      const { data: logs, error } = await supabase
        .from('ai_model_update_logs')
        .select('*')
        .order('run_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, logs }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'all') {
      const { data: models, error } = await supabase
        .from('ai_model_configs')
        .select('*')
        .order('provider')
        .order('model_type')
        .order('model_name');

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, models, count: models?.length || 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'validate' && req.method === 'POST') {
      const { provider, model_name } = await req.json();

      if (!provider || !model_name) {
        return new Response(
          JSON.stringify({ error: 'provider and model_name are required' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      let isValid = false;
      let errorMessage = '';

      try {
        if (provider === 'openai') {
          const apiKey = Deno.env.get('OPENAI_API_KEY');
          if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model_name,
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1,
            }),
          });

          isValid = response.status === 200 || response.status === 400;
          if (!isValid) {
            errorMessage = `HTTP ${response.status}`;
          }
        } else if (provider === 'anthropic') {
          const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
          if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: model_name,
              max_tokens: 1,
              messages: [{ role: 'user', content: 'test' }],
            }),
          });

          isValid = response.status === 200 || response.status === 400;
          if (!isValid) {
            errorMessage = `HTTP ${response.status}`;
          }
        } else if (provider === 'google') {
          const apiKey = Deno.env.get('GEMINI_API_KEY');
          if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model_name}?key=${apiKey}`
          );

          isValid = response.ok;
          if (!isValid) {
            errorMessage = `HTTP ${response.status}`;
          }
        } else {
          isValid = false;
          errorMessage = 'Provider not supported for validation';
        }

        if (isValid) {
          await supabase
            .from('ai_model_configs')
            .update({ last_validated_at: new Date().toISOString() })
            .eq('provider', provider)
            .eq('model_name', model_name);
        }

        return new Response(
          JSON.stringify({ success: true, valid: isValid, error: errorMessage || undefined }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, valid: false, error: error.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Invalid endpoint',
        available_endpoints: [
          'GET /ai-model-config?provider=<provider>&type=<flagship|fast|legacy>',
          'GET /providers',
          'GET /history?limit=10',
          'GET /all',
          'POST /validate {provider, model_name}',
        ],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  } catch (error) {
    console.error('Error in ai-model-config:', error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
