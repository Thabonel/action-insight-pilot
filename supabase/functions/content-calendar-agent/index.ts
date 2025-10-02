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
    const { brief, personas, channelStrategy, messagingStrategy, userId, sessionId } = await req.json();

    console.log('Generating content calendar for:', brief);

    // Get user's content preferences
    const { data: feedback } = await supabase
      .from('ai_interaction_feedback')
      .select('*')
      .eq('user_id', userId)
      .like('context_data->type', '%content%')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get learned content patterns
    const { data: patterns } = await supabase
      .from('agent_learning_data')
      .select('*')
      .eq('agent_type', 'content')
      .order('success_rate', { ascending: false })
      .limit(5);

    const prompt = `
You are an expert content strategist. Create a comprehensive content calendar and strategy.

Campaign Brief:
${JSON.stringify(brief, null, 2)}

Target Personas:
${JSON.stringify(personas, null, 2)}

Channel Strategy:
${JSON.stringify(channelStrategy, null, 2)}

Messaging Strategy:
${JSON.stringify(messagingStrategy, null, 2)}

User's Content Preferences:
${JSON.stringify(feedback?.slice(0, 3) || [], null, 2)}

Proven Content Patterns:
${JSON.stringify(patterns?.map(p => p.pattern_data) || [], null, 2)}

Create a 30-day content calendar with:
1. Daily content recommendations by channel
2. Content types and formats
3. Messaging alignment for each piece
4. Optimal posting times
5. Content themes and campaigns
6. User-generated content opportunities
7. Performance tracking suggestions

Consider:
- Channel-specific content formats
- Persona preferences and behaviors
- Messaging pillar distribution
- Content mix (educational, promotional, entertaining)
- Seasonal and trending topics
- Resource requirements

Format as JSON:
{
  "contentCalendar": [
    {
      "date": "2025-07-10",
      "content": [
        {
          "id": "content_1",
          "channel": "social_media",
          "platform": "LinkedIn",
          "contentType": "educational_post",
          "title": "Content Title",
          "description": "Content description",
          "messagingPillar": "pillar_1",
          "targetPersona": "persona_1",
          "optimalTime": "09:00",
          "format": "text_with_image",
          "callToAction": "Learn more",
          "tags": ["hashtag1", "hashtag2"],
          "expectedEngagement": "medium",
          "resourcesNeeded": ["graphic_design"]
        }
      ]
    }
  ],
  "contentThemes": {
    "week1": "Awareness & Education",
    "week2": "Problem Identification",
    "week3": "Solution Presentation", 
    "week4": "Conversion & Trust"
  },
  "contentMix": {
    "educational": 40,
    "promotional": 30,
    "entertaining": 20,
    "userGenerated": 10
  },
  "channelDistribution": {
    "email": ["newsletters", "nurture_sequences"],
    "social_media": ["posts", "stories", "videos"],
    "blog": ["articles", "case_studies"],
    "paid_ads": ["ad_creatives", "landing_pages"]
  },
  "production": {
    "batchingOpportunities": [...],
    "resourceRequirements": {...},
    "timeline": {...},
    "approvalProcess": [...]
  },
  "optimization": {
    "testingPlan": [...],
    "metrics": [...],
    "iterationCycle": "..."
  },
  "confidence": 0.86,
  "reasoning": "Content strategy rationale..."
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
          { role: 'system', content: 'You are an expert content strategist and calendar planner. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    const contentCalendar = JSON.parse(data.choices[0].message.content);

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

    // Update session with complete campaign
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
            contentCalendar
          },
          interaction_history: [
            ...session.interaction_history || [],
            {
              type: 'content_generation',
              timestamp: new Date().toISOString(),
              data: contentCalendar
            }
          ],
          status: 'completed'
        })
        .eq('id', sessionId);
    }

    return new Response(JSON.stringify(contentCalendar), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-calendar-agent:', error);
    // Return generic error to client, log full error server-side
    const publicError = error.message?.includes('API key') || error.message?.includes('OPENAI')
      ? 'Configuration error - please contact support'
      : 'An error occurred generating content calendar';
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});