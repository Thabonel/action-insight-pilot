import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const AudienceInsightRequestSchema = z.object({
  brief: z.record(z.unknown()),
  userId: z.string().uuid(),
  sessionId: z.string().uuid()
});

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const requestBody = await req.json();
    const validationResult = AudienceInsightRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(JSON.stringify({ 
        error: 'Invalid request parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { brief, userId, sessionId } = validationResult.data;
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Generating audience insights for:', brief);

    // Get user's historical feedback for learning
    const { data: feedback } = await supabase
      .from('ai_interaction_feedback')
      .select('*')
      .eq('user_id', userId)
      .eq('interaction_type', 'edit')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get learned patterns for audience insights
    const { data: patterns } = await supabase
      .from('agent_learning_data')
      .select('*')
      .eq('agent_type', 'audience')
      .order('confidence_score', { ascending: false })
      .limit(5);

    // Build context from previous interactions
    const learningContext = feedback ? 
      feedback.map(f => ({
        original: f.original_suggestion,
        modified: f.user_modification,
        context: f.context_data
      })) : [];

    const prompt = `
You are an expert audience insight agent. Generate detailed customer personas and audience segments based on the campaign brief and learned patterns.

Campaign Brief:
${JSON.stringify(brief, null, 2)}

Previous User Preferences (learn from these):
${JSON.stringify(learningContext.slice(0, 3), null, 2)}

Learned Patterns:
${JSON.stringify(patterns?.map(p => p.pattern_data) || [], null, 2)}

Generate 3-4 detailed audience personas with:
1. Demographics and psychographics
2. Pain points and motivations
3. Preferred communication channels
4. Content preferences
5. Buying behavior patterns
6. Key messaging angles for each persona

Also provide:
- Audience sizing estimates
- Channel preferences analysis
- Behavioral insights
- Recommended targeting parameters

Format as JSON:
{
  "personas": [
    {
      "id": "persona_1",
      "name": "Persona Name",
      "description": "Brief description",
      "demographics": {...},
      "psychographics": {...},
      "painPoints": [...],
      "motivations": [...],
      "channels": [...],
      "contentPreferences": [...],
      "buyingBehavior": {...},
      "messagingAngles": [...],
      "audienceSize": "Small/Medium/Large"
    }
  ],
  "insights": {
    "primaryAudience": "...",
    "channelRecommendations": [...],
    "behavioralInsights": [...],
    "targetingParameters": {...}
  },
  "confidence": 0.85,
  "reasoning": "Why these personas were generated..."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'You are an expert marketing audience analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const data = await response.json();
    const audienceInsights = JSON.parse(data.choices[0].message.content);

    // Store learning data for future improvements
    if (patterns && patterns.length > 0) {
      await supabase
        .from('agent_learning_data')
        .update({
          usage_count: patterns[0].usage_count + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', patterns[0].id);
    }

    // Update session with generated insights
    await supabase
      .from('campaign_copilot_sessions')
      .update({
        generated_campaign: {
          ...brief.existingCampaign,
          audienceInsights
        },
        interaction_history: [
          ...brief.existingCampaign?.interaction_history || [],
          {
            type: 'audience_generation',
            timestamp: new Date().toISOString(),
            data: audienceInsights
          }
        ]
      })
      .eq('id', sessionId);

    return new Response(JSON.stringify(audienceInsights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Log detailed error server-side only
    console.error('Error in audience-insight-agent:', error);
    
    // Return generic error to client
    return new Response(JSON.stringify({ 
      error: 'An error occurred generating audience insights' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});