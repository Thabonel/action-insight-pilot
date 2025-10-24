import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const CompetitorGapRequestSchema = z.object({
  ourBrand: z.string(),
  ourOffering: z.string(),
  competitor1: z.string(),
  competitor2: z.string(),
  competitor3: z.string(),
  ourStrengths: z.string().optional(),
  userId: z.string().uuid(),
});

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const validationResult = CompetitorGapRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(JSON.stringify({
        error: 'Invalid request parameters',
        details: validationResult.error.issues
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = validationResult.data;
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Analyzing competitive gaps and opportunities...');

    const systemPrompt = `You are an expert competitive analyst and strategist. Identify market gaps and opportunities through competitive analysis.

Your analysis should be:
- Objective and data-driven
- Identify genuine opportunities (not just differences)
- Consider feasibility and resources
- Find ownable differentiators
- Provide actionable recommendations

Focus on what the brand can realistically own and dominate.`;

    const userPrompt = `Compare this brand against its top three competitors. Find missed opportunities.

Our Brand:
Name: ${data.ourBrand}
Offering: ${data.ourOffering}
Strengths: ${data.ourStrengths || 'To be determined'}

Top 3 Competitors:
1. ${data.competitor1}
2. ${data.competitor2}
3. ${data.competitor3}

Analyze gaps in these areas:

1. **Messaging Gaps**
   - What are competitors saying that we're not?
   - What message positioning are they missing?
   - What story could we tell better?

2. **Channel Gaps**
   - Where are they present that we're not?
   - Where are they weak or absent?
   - What emerging channels are being ignored?

3. **Audience Gaps**
   - Who are they targeting that we could own?
   - What underserved segments exist?
   - Who are they ignoring?

4. **Content Gaps**
   - What content types are they dominating?
   - What topics are they neglecting?
   - What format/medium opportunities exist?

5. **Experience Gaps**
   - What customer experience elements could we own?
   - What pain points are they not addressing?
   - What delighters could we add?

Then suggest:
- One unique differentiator that this brand can own and dominate
- Why this differentiator is defensible
- How to activate this differentiator

Format as JSON:
{
  "competitiveOverview": {
    "marketDynamics": "Brief market state",
    "competitorStrengths": ["Common strengths across competitors"],
    "competitorWeaknesses": ["Common gaps in competition"]
  },
  "gapAnalysis": {
    "messaging": {
      "competitorApproach": "What they're doing",
      "missedOpportunities": ["Opportunity 1", "Opportunity 2"],
      "recommendation": "What we should do differently"
    },
    "channels": {
      "competitorPresence": ["Where they are strong"],
      "underutilizedChannels": ["Channel opportunities"],
      "recommendation": "Channel strategy"
    },
    "audience": {
      "competitorFocus": "Who they target",
      "underservedSegments": ["Segment 1", "Segment 2"],
      "recommendation": "Who we should own"
    },
    "content": {
      "competitorContentTypes": ["What they create"],
      "contentGaps": ["Type 1", "Type 2"],
      "recommendation": "Content strategy"
    },
    "experience": {
      "competitorExperience": "What they offer",
      "experienceGaps": ["Gap 1", "Gap 2"],
      "recommendation": "Experience differentiator"
    }
  },
  "ownableDifferentiator": {
    "title": "The one thing we can own",
    "description": "Detailed explanation of the differentiator",
    "whyDefensible": "Why competitors can't easily copy this",
    "activationStrategy": [
      "Step 1: How to start owning this",
      "Step 2: How to reinforce it",
      "Step 3: How to dominate it"
    ],
    "expectedImpact": "What success looks like",
    "timeline": "How long to establish dominance",
    "resources": ["What you need to execute"]
  },
  "quickWins": [
    "Immediate action 1",
    "Immediate action 2",
    "Immediate action 3"
  ],
  "avoidTraps": [
    "Don't do X because...",
    "Avoid Y trap because..."
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const gapAnalysis = JSON.parse(aiResponse.choices[0].message.content);

    // Store the competitive analysis
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('competitive_gap_analyses')
      .insert({
        user_id: data.userId,
        our_brand: data.ourBrand,
        competitors: [data.competitor1, data.competitor2, data.competitor3],
        gap_analysis: gapAnalysis,
        ownable_differentiator: gapAnalysis.ownableDifferentiator,
        input_data: {
          ourBrand: data.ourBrand,
          ourOffering: data.ourOffering,
          competitors: [data.competitor1, data.competitor2, data.competitor3]
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      // Continue anyway
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: gapAnalysis,
      analysisId: savedAnalysis?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in competitor-gap-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred analyzing competitive gaps',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
