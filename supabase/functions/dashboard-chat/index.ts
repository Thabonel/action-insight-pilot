import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatContext {
  campaigns?: any[];
  autopilotConfig?: any;
  recentActivity?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing dashboard chat query for user:', user.id);

    const enrichedContext = await enrichContext(supabase, user.id, context);

    const { data: apiKeyData, error: keyError } = await supabase
      .from('user_secrets')
      .select('encrypted_value, service_name')
      .eq('user_id', user.id)
      .in('service_name', ['anthropic_api_key', 'gemini_api_key_encrypted'])
      .maybeSingle();

    if (keyError || !apiKeyData) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          message: 'Please add your Anthropic Claude or Gemini API key in Settings > Integrations to enable AI chat.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt(enrichedContext);
    const userPrompt = buildUserPrompt(query, enrichedContext);

    let aiResponse: string;

    if (apiKeyData.service_name === 'anthropic_api_key') {
      aiResponse = await callClaude(apiKeyData.encrypted_value, systemPrompt, userPrompt);
    } else {
      aiResponse = await callGemini(apiKeyData.encrypted_value, systemPrompt, userPrompt);
    }

    const actionSuggestions = detectActions(query, aiResponse);

    console.log('Successfully processed dashboard chat query');

    return new Response(
      JSON.stringify({
        message: aiResponse,
        suggestions: actionSuggestions,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('dashboard-chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Failed to process chat'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function enrichContext(supabase: any, userId: string, providedContext?: any): Promise<ChatContext> {
  const context: ChatContext = {};

  try {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, type, status, total_budget, budget_allocated, budget_spent, start_date, end_date, metrics')
      .eq('created_by', userId)
      .eq('status', 'active')
      .limit(10);

    context.campaigns = campaigns || [];

    const { data: autopilotConfig } = await supabase
      .from('marketing_autopilot_config')
      .select('business_description, target_audience, ai_strategy, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    context.autopilotConfig = autopilotConfig;

    const { data: recentActivity } = await supabase
      .from('autopilot_activity_log')
      .select('activity_type, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    context.recentActivity = recentActivity || [];
  } catch (error) {
    console.error('Error enriching context:', error);
  }

  return context;
}

function buildSystemPrompt(context: ChatContext): string {
  const activeCampaigns = context.campaigns?.length || 0;
  const autopilotEnabled = context.autopilotConfig?.is_active || false;
  const businessDesc = context.autopilotConfig?.business_description || 'your business';

  return `You are the AI Marketing Assistant for Action Insight Marketing Platform.

PLATFORM CONTEXT:
- User is managing ${activeCampaigns} active campaign(s)
- Marketing Autopilot: ${autopilotEnabled ? 'ENABLED' : 'DISABLED'}
- Business: ${businessDesc}
${context.autopilotConfig?.target_audience ? `- Target Audience: ${context.autopilotConfig.target_audience}` : ''}

YOUR CAPABILITIES:
- Analyze campaign performance and provide insights
- Recommend optimizations for budget, targeting, and content
- Help create new campaigns and marketing content
- Answer questions about marketing automation
- Provide strategic marketing advice

GUIDELINES:
- Be conversational and helpful, not generic or robotic
- Reference specific campaigns when relevant
- Offer to perform actions (create campaign, generate content, etc.)
- Focus on actionable advice that drives business results
- If you don't have specific data, acknowledge it honestly

CURRENT DATA AVAILABLE:
${context.campaigns && context.campaigns.length > 0 ? `
Active Campaigns:
${context.campaigns.map(c => `- ${c.name} (${c.type}): $${c.budget_spent || 0}/$${c.budget_allocated || 0} spent`).join('\n')}
` : 'No active campaigns yet.'}

${context.recentActivity && context.recentActivity.length > 0 ? `
Recent Activity:
${context.recentActivity.map(a => `- ${a.activity_type}: ${a.description}`).join('\n')}
` : ''}

Remember: You're part of an intelligent marketing automation platform. Help users succeed with their marketing goals.`;
}

function buildUserPrompt(query: string, context: ChatContext): string {
  return query;
}

async function callClaude(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4.5',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser Query: ${userPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
}

function detectActions(query: string, response: string): string[] {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  if (queryLower.includes('create') || queryLower.includes('new campaign')) {
    suggestions.push('Create a new campaign');
  }

  if (queryLower.includes('content') || queryLower.includes('generate')) {
    suggestions.push('Generate marketing content');
  }

  if (queryLower.includes('performance') || queryLower.includes('analytics')) {
    suggestions.push('View detailed analytics');
  }

  if (queryLower.includes('optimize') || queryLower.includes('improve')) {
    suggestions.push('Get optimization recommendations');
  }

  if (suggestions.length === 0) {
    suggestions.push('Tell me more about my campaigns');
    suggestions.push('Help me create new content');
    suggestions.push('Show me performance insights');
  }

  return suggestions.slice(0, 3);
}
