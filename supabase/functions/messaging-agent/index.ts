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
    const { brief, personas, channelStrategy, userId, sessionId } = await req.json();

    console.log('Generating messaging strategy for:', brief);

    // Get user's messaging preferences from feedback
    const { data: feedback } = await supabase
      .from('ai_interaction_feedback')
      .select('*')
      .eq('user_id', userId)
      .like('context_data->type', '%messaging%')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get learned messaging patterns
    const { data: patterns } = await supabase
      .from('agent_learning_data')
      .select('*')
      .eq('agent_type', 'messaging')
      .order('success_rate', { ascending: false })
      .limit(5);

    const prompt = `
You are an expert messaging strategist. Create compelling messaging pillars and value propositions.

Campaign Brief:
${JSON.stringify(brief, null, 2)}

Target Personas:
${JSON.stringify(personas, null, 2)}

Channel Strategy:
${JSON.stringify(channelStrategy, null, 2)}

User's Messaging Preferences:
${JSON.stringify(feedback?.slice(0, 3) || [], null, 2)}

Proven Messaging Patterns:
${JSON.stringify(patterns?.map(p => p.pattern_data) || [], null, 2)}

Create a comprehensive messaging strategy with:
1. Core value propositions for each persona
2. Key messaging pillars and themes
3. Channel-specific message adaptations
4. Emotional and rational appeal balance
5. Competitive differentiation
6. Call-to-action variations
7. Tone and voice guidelines

Consider:
- Persona-specific pain points and motivations
- Channel context and constraints
- Brand voice and positioning
- Competitive landscape
- Cultural and demographic factors

Format as JSON:
{
  "messagingPillars": [
    {
      "id": "pillar_1",
      "title": "Core Message Theme",
      "description": "Detailed explanation",
      "targetPersonas": ["persona_1"],
      "emotionalAppeal": "...",
      "rationalAppeal": "...",
      "proofPoints": [...],
      "channels": ["email", "social"],
      "variations": {...}
    }
  ],
  "valuePropositions": {
    "primary": "Main value prop",
    "secondary": [...],
    "personaSpecific": {
      "persona_1": "Tailored value prop",
      "persona_2": "Another tailored prop"
    }
  },
  "toneAndVoice": {
    "personality": [...],
    "doAndDont": {...},
    "vocabulary": [...],
    "examples": [...]
  },
  "callsToAction": {
    "primary": "Main CTA",
    "variations": [...],
    "channelSpecific": {...}
  },
  "competitiveDifferentiation": {
    "uniqueAngles": [...],
    "positioning": "...",
    "advantages": [...]
  },
  "testing": {
    "messagingTests": [...],
    "variants": [...],
    "metrics": [...]
  },
  "confidence": 0.87,
  "reasoning": "Why this messaging strategy..."
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
          { role: 'system', content: 'You are an expert messaging strategist and copywriter. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    const messagingStrategy = JSON.parse(data.choices[0].message.content);

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
            messagingStrategy
          },
          interaction_history: [
            ...session.interaction_history || [],
            {
              type: 'messaging_generation',
              timestamp: new Date().toISOString(),
              data: messagingStrategy
            }
          ]
        })
        .eq('id', sessionId);
    }

    return new Response(JSON.stringify(messagingStrategy), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in messaging-agent:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});