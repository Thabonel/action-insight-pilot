import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelInfo {
  provider: string;
  model_name: string;
  model_type: 'flagship' | 'fast' | 'legacy';
  capabilities: Record<string, boolean>;
  pricing?: {
    input_per_mtok?: number;
    output_per_mtok?: number;
  };
  max_tokens?: number;
  context_window?: number;
  metadata: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const errors: any[] = [];
  const providersChecked: string[] = [];
  const discoveredModels: ModelInfo[] = [];

  try {
    console.log('Starting AI model discovery...');

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const openaiModels = await discoverOpenAIModels(openaiKey);
        discoveredModels.push(...openaiModels);
        providersChecked.push('openai');
        console.log(`Discovered ${openaiModels.length} OpenAI models`);
      } catch (error) {
        console.error('Error discovering OpenAI models:', error);
        errors.push({ provider: 'openai', error: error.message });
      }
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      try {
        const anthropicModels = await discoverAnthropicModels(anthropicKey);
        discoveredModels.push(...anthropicModels);
        providersChecked.push('anthropic');
        console.log(`Discovered ${anthropicModels.length} Anthropic models`);
      } catch (error) {
        console.error('Error discovering Anthropic models:', error);
        errors.push({ provider: 'anthropic', error: error.message });
      }
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const geminiModels = await discoverGeminiModels(geminiKey);
        discoveredModels.push(...geminiModels);
        providersChecked.push('google');
        console.log(`Discovered ${geminiModels.length} Google models`);
      } catch (error) {
        console.error('Error discovering Google models:', error);
        errors.push({ provider: 'google', error: error.message });
      }
    }

    const mistralKey = Deno.env.get('MISTRAL_API_KEY');
    if (mistralKey) {
      try {
        const mistralModels = await discoverMistralModels(mistralKey);
        discoveredModels.push(...mistralModels);
        providersChecked.push('mistral');
        console.log(`Discovered ${mistralModels.length} Mistral models`);
      } catch (error) {
        console.error('Error discovering Mistral models:', error);
        errors.push({ provider: 'mistral', error: error.message });
      }
    }

    let modelsAdded = 0;
    let modelsDeprecated = 0;

    for (const model of discoveredModels) {
      const { data: existing } = await supabase
        .from('ai_model_configs')
        .select('id, is_active')
        .eq('provider', model.provider)
        .eq('model_name', model.model_name)
        .single();

      if (!existing) {
        const isDefault = model.model_type === 'flagship';

        if (isDefault) {
          await supabase
            .from('ai_model_configs')
            .update({ is_default: false })
            .eq('provider', model.provider)
            .eq('model_type', 'flagship');
        }

        const { error: insertError } = await supabase
          .from('ai_model_configs')
          .insert({
            ...model,
            is_default: isDefault,
            is_active: true,
            discovered_at: new Date().toISOString(),
            last_validated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Error inserting model ${model.model_name}:`, insertError);
          errors.push({ model: model.model_name, error: insertError.message });
        } else {
          modelsAdded++;
          console.log(`Added new model: ${model.provider}/${model.model_name}`);
        }
      } else {
        await supabase
          .from('ai_model_configs')
          .update({ last_validated_at: new Date().toISOString() })
          .eq('provider', model.provider)
          .eq('model_name', model.model_name);
      }
    }

    for (const provider of providersChecked) {
      const currentModelNames = discoveredModels
        .filter(m => m.provider === provider)
        .map(m => m.model_name);

      const { data: existingModels } = await supabase
        .from('ai_model_configs')
        .select('id, model_name')
        .eq('provider', provider)
        .eq('is_active', true);

      if (existingModels) {
        for (const existing of existingModels) {
          if (!currentModelNames.includes(existing.model_name)) {
            await supabase
              .from('ai_model_configs')
              .update({ is_active: false, model_type: 'legacy' })
              .eq('id', existing.id);

            modelsDeprecated++;
            console.log(`Deprecated model: ${provider}/${existing.model_name}`);
          }
        }
      }
    }

    const executionTime = Date.now() - startTime;
    const logStatus = errors.length === 0 ? 'success' : (providersChecked.length > 0 ? 'partial' : 'failed');

    await supabase.from('ai_model_update_logs').insert({
      models_discovered: discoveredModels.length,
      models_added: modelsAdded,
      models_deprecated: modelsDeprecated,
      providers_checked: providersChecked,
      errors: errors,
      execution_time_ms: executionTime,
      status: logStatus,
    });

    console.log(`AI model discovery completed in ${executionTime}ms`);
    console.log(`Added: ${modelsAdded}, Deprecated: ${modelsDeprecated}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        models_discovered: discoveredModels.length,
        models_added: modelsAdded,
        models_deprecated: modelsDeprecated,
        providers_checked: providersChecked,
        errors: errors,
        execution_time_ms: executionTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Fatal error in AI model updater:', error);

    const executionTime = Date.now() - startTime;
    await supabase.from('ai_model_update_logs').insert({
      models_discovered: 0,
      models_added: 0,
      models_deprecated: 0,
      providers_checked: providersChecked,
      errors: [{ error: error.message, stack: error.stack }],
      execution_time_ms: executionTime,
      status: 'failed',
    });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function discoverOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const models: ModelInfo[] = [];

  for (const model of data.data) {
    const modelId = model.id;

    if (modelId.startsWith('gpt-5')) {
      let modelType: 'flagship' | 'fast' | 'legacy' = 'flagship';
      if (modelId.includes('mini')) modelType = 'fast';
      if (modelId.includes('nano')) modelType = 'fast';

      models.push({
        provider: 'openai',
        model_name: modelId,
        model_type: modelType,
        capabilities: {
          vision: !modelId.includes('nano'),
          function_calling: true,
          json_mode: true,
        },
        context_window: 128000,
        metadata: {
          discovered_via: 'api',
          raw_id: model.id,
          created: model.created,
        },
      });
    } else if (modelId.startsWith('gpt-4.1') || modelId.startsWith('gpt-4-1')) {
      models.push({
        provider: 'openai',
        model_name: modelId,
        model_type: 'legacy',
        capabilities: {
          vision: true,
          function_calling: true,
          json_mode: true,
        },
        context_window: 1000000,
        metadata: {
          discovered_via: 'api',
          raw_id: model.id,
        },
      });
    } else if (modelId.startsWith('o3') || modelId.startsWith('o4')) {
      models.push({
        provider: 'openai',
        model_name: modelId,
        model_type: modelId.includes('mini') ? 'fast' : 'flagship',
        capabilities: {
          reasoning: true,
          vision: true,
          function_calling: true,
          json_mode: true,
        },
        context_window: 128000,
        metadata: {
          discovered_via: 'api',
          raw_id: model.id,
          reasoning_model: true,
        },
      });
    }
  }

  return models;
}

async function discoverAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
  const knownModels = [
    { name: 'claude-sonnet-4-5', type: 'flagship' as const, context: 200000 },
    { name: 'claude-opus-4-1', type: 'flagship' as const, context: 200000 },
    { name: 'claude-haiku-4-5', type: 'fast' as const, context: 200000 },
    { name: 'claude-sonnet-4', type: 'legacy' as const, context: 1000000 },
  ];

  const models: ModelInfo[] = [];

  for (const model of knownModels) {
    try {
      const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model.name,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      if (testResponse.status === 200 || testResponse.status === 400) {
        models.push({
          provider: 'anthropic',
          model_name: model.name,
          model_type: model.type,
          capabilities: {
            vision: true,
            function_calling: true,
            json_mode: true,
          },
          context_window: model.context,
          metadata: {
            discovered_via: 'validation',
            validated_at: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.log(`Could not validate ${model.name}: ${error.message}`);
    }
  }

  return models;
}

async function discoverGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const models: ModelInfo[] = [];

  for (const model of data.models || []) {
    const modelName = model.name.replace('models/', '');

    if (modelName.startsWith('gemini-2.5') || modelName.startsWith('gemini-2.0')) {
      let modelType: 'flagship' | 'fast' | 'legacy' = 'legacy';

      if (modelName.includes('2.5-pro')) {
        modelType = 'flagship';
      } else if (modelName.includes('2.5-flash')) {
        modelType = 'fast';
      } else if (modelName.includes('2.0')) {
        modelType = 'legacy';
      }

      models.push({
        provider: 'google',
        model_name: modelName,
        model_type: modelType,
        capabilities: {
          vision: model.supportedGenerationMethods?.includes('generateContent') || false,
          function_calling: true,
          json_mode: true,
          thinking: modelName.includes('2.5-pro'),
        },
        context_window: 1000000,
        metadata: {
          discovered_via: 'api',
          display_name: model.displayName,
          supported_methods: model.supportedGenerationMethods,
        },
      });
    }
  }

  return models;
}

async function discoverMistralModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const models: ModelInfo[] = [];

  for (const model of data.data || []) {
    const modelId = model.id;

    if (modelId.includes('large')) {
      models.push({
        provider: 'mistral',
        model_name: modelId,
        model_type: 'flagship',
        capabilities: {
          vision: false,
          function_calling: true,
          json_mode: true,
        },
        context_window: 128000,
        metadata: {
          discovered_via: 'api',
          created: model.created,
        },
      });
    } else if (modelId.includes('medium')) {
      models.push({
        provider: 'mistral',
        model_name: modelId,
        model_type: 'fast',
        capabilities: {
          vision: false,
          function_calling: true,
          json_mode: true,
        },
        context_window: 32000,
        metadata: {
          discovered_via: 'api',
          created: model.created,
        },
      });
    }
  }

  return models;
}
