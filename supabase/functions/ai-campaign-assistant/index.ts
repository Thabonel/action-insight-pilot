import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const AssistantRequestSchema = z.object({
  type: z.enum(['key-messages', 'target-personas']).optional(),
  message: z.string().optional(),
  userId: z.string().optional(),
  context: z.union([
    z.object({
      campaignName: z.string().optional(),
      campaignType: z.string().optional(),
      targetAudience: z.string().optional(),
      primaryObjective: z.string().optional(),
      valueProposition: z.string().optional(),
      demographics: z.record(z.unknown()).optional(),
      industry: z.string().optional()
    }),
    z.object({
      type: z.literal('autopilot_setup'),
      config: z.any()
    })
  ]).optional()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const requestBody = await req.json();
    console.log('Received request:', JSON.stringify(requestBody, null, 2));

    const validationResult = AssistantRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      console.error('Request body that failed:', JSON.stringify(requestBody, null, 2));
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type, message, context } = validationResult.data;
    console.log('Validated request - type:', type, 'has message:', !!message, 'has context:', !!context);

    let systemPrompt = '';
    let userPrompt = '';

    // Handle autopilot setup request (new format)
    if (message) {
      systemPrompt = 'You are an expert marketing strategist and automation specialist. Generate comprehensive marketing strategies that can be automated. Always respond in valid JSON format.';
      userPrompt = message;
    } else if (type === 'key-messages' && context) {
      systemPrompt = 'You are an expert marketing strategist. Generate 3-5 compelling key messages for a marketing campaign based on the provided context. Each message should be clear, action-oriented, and resonate with the target audience.';
      userPrompt = `Campaign Context:
Campaign Name: ${context.campaignName || 'Not specified'}
Campaign Type: ${context.campaignType || 'Not specified'}
Target Audience: ${context.targetAudience || 'Not specified'}
Primary Objective: ${context.primaryObjective || 'Not specified'}
Value Proposition: ${context.valueProposition || 'Not specified'}

Generate key messages that align with these campaign details. Return them as a JSON array of strings.`;
    } else if (type === 'target-personas' && context) {
      systemPrompt = 'You are an expert marketing researcher. Create 2-3 detailed buyer personas based on the campaign context provided. Each persona should include name, demographics, pain points, motivations, and preferred communication channels.';
      userPrompt = `Campaign Context:
Campaign Name: ${context.campaignName || 'Not specified'}
Campaign Type: ${context.campaignType || 'Not specified'}
Target Audience: ${context.targetAudience || 'Not specified'}
Demographics: ${JSON.stringify(context.demographics || {})}
Industry/Category: ${context.industry || 'Not specified'}

Create detailed buyer personas. Return them as a JSON array of objects with the structure: {name: string, description: string, demographics: string, painPoints: string, motivations: string, channels: string}`;
    } else {
      throw new Error('Invalid request: must provide either message or type with context');
    }

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable not set');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Calling OpenAI API with model: gpt-5');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      console.error('Status:', response.status, 'StatusText:', response.statusText);
      throw new Error(errorData.error?.message || `OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = data.choices[0].message.content;

    try {
      const parsedContent = JSON.parse(generatedContent);
      return new Response(JSON.stringify({
        success: true,
        response: parsedContent,
        data: parsedContent,
        type: type || 'autopilot_setup'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.warn('JSON parsing failed, returning raw content:', parseError);
      return new Response(JSON.stringify({
        success: true,
        response: generatedContent,
        data: generatedContent,
        type: type || 'autopilot_setup',
        format: 'text'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-campaign-assistant function:', error);
    console.error('Error stack:', error.stack);

    const errorMessage = error.message || 'An error occurred generating campaign content';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('configured');

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      hint: isConfigError ? 'Check that OPENAI_API_KEY is set in Supabase Edge Function environment variables' : undefined
    }), {
      status: isConfigError ? 503 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});