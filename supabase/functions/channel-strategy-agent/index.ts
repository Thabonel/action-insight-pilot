import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { brief, personas, userId, sessionId } = await req.json();

    console.log('Generating channel strategy for:', brief);

    // Get user's historical channel preferences
    const { data: feedback } = await supabase
      .from('ai_interaction_feedback')
      .select('*')
      .eq('user_id', userId)
      .like('context_data->type', '%channel%')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get learned channel patterns
    const { data: patterns } = await supabase
      .from('agent_learning_data')
      .select('*')
      .eq('agent_type', 'channel')
      .order('success_rate', { ascending: false })
      .limit(5);

    const prompt = `
You are an expert channel strategy agent. Create an optimal channel mix and budget allocation strategy.

Campaign Brief:
${JSON.stringify(brief, null, 2)}

Target Personas:
${JSON.stringify(personas, null, 2)}

User's Previous Channel Preferences:
${JSON.stringify(feedback?.slice(0, 3) || [], null, 2)}

Proven Channel Patterns:
${JSON.stringify(patterns?.map(p => p.pattern_data) || [], null, 2)}

Create a comprehensive channel strategy with:
1. Recommended channels ranked by effectiveness
2. Budget allocation percentages
3. Channel-specific tactics and timing
4. Integration opportunities between channels
5. Performance expectations and KPIs
6. Timeline and implementation phases

Consider:
- Audience channel preferences from personas
- Budget efficiency and ROI potential
- Seasonal and timing factors
- Competition and market saturation
- Cross-channel synergies

Format as JSON:
{
  "channelMix": [
    {
      "channel": "Channel Name",
      "budgetPercentage": 35,
      "rationale": "Why this channel",
      "targetPersonas": ["persona_1", "persona_2"],
      "tactics": [...],
      "timing": {...},
      "expectedROI": "2.5x",
      "kpis": [...],
      "implementation": {...}
    }
  ],
  "budgetBreakdown": {
    "paid": 60,
    "organic": 25,
    "content": 15
  },
  "integration": {
    "crossChannelOpportunities": [...],
    "sequencing": [...],
    "retargeting": {...}
  },
  "timeline": {
    "phase1": [...],
    "phase2": [...],
    "phase3": [...]
  },
  "riskFactors": [...],
  "contingencyPlans": [...],
  "confidence": 0.88,
  "reasoning": "Strategy rationale..."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert marketing channel strategist. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    const channelStrategy = JSON.parse(data.choices[0].message.content);

    // Update learning patterns
    if (patterns && patterns.length > 0) {
      await supabase
        .from('agent_learning_data')
        .update({
          usage_count: patterns[0].usage_count + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', patterns[0].id);
    }

    // Update session
    const { data: session } = await supabase
      .from('campaign_copilot_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (session) {
      await supabase
        .from('campaign_copilot_sessions')
        .update({
          generated_campaign: {
            ...session.generated_campaign,
            channelStrategy
          },
          interaction_history: [
            ...session.interaction_history || [],
            {
              type: 'channel_generation',
              timestamp: new Date().toISOString(),
              data: channelStrategy
            }
          ]
        })
        .eq('id', sessionId);
    }

    return new Response(JSON.stringify(channelStrategy), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in channel-strategy-agent:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});