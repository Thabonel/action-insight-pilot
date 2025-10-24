import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const FunnelDesignRequestSchema = z.object({
  businessType: z.string(),
  productOffer: z.string(),
  averageOrderValue: z.number().optional(),
  customerLifetimeValue: z.number().optional(),
  currentMarketingCapabilities: z.string().optional(),
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
    const validationResult = FunnelDesignRequestSchema.safeParse(requestBody);

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

    console.log('Designing marketing funnel with automation opportunities...');

    const systemPrompt = `You are an expert funnel strategist and conversion optimizer. Design complete customer journeys with appropriate offers at each stage.

Your funnels should:
- Map to actual customer decision journeys
- Have stage-appropriate offers
- Include automation opportunities
- Balance immediate conversion with long-term value
- Consider resource constraints

Focus on practical, implementable funnel designs.`;

    const userPrompt = `Create a simple funnel for this business - awareness, engagement, conversion, retention.

Business Information:
Business Type: ${data.businessType}
Product/Offer: ${data.productOffer}
Average Order Value: $${data.averageOrderValue || 'Not specified'}
Customer Lifetime Value: $${data.customerLifetimeValue || 'Not specified'}
Current Marketing Capabilities: ${data.currentMarketingCapabilities || 'Starting from scratch'}

For each funnel stage, suggest:
1. Best-fit offer at that stage
2. One automation or AI task that could run that stage
3. Key metrics to track
4. Transition triggers to next stage
5. Content/touchpoint recommendations

Design these four stages:

**Awareness Stage:**
- How prospects discover you
- Top-of-funnel offers (lead magnets, free content)
- Discovery channels
- First impression tactics

**Engagement Stage:**
- How you nurture interest
- Middle-funnel offers (webinars, demos, trials)
- Education and trust-building
- Objection handling

**Conversion Stage:**
- How you drive the first purchase
- Bottom-funnel offers (discounts, guarantees, bonuses)
- Conversion optimization tactics
- Purchase friction reduction

**Retention Stage:**
- How you build loyalty and repeat business
- Post-purchase offers (upsells, cross-sells, referrals)
- Customer success tactics
- Advocacy programs

Format as JSON with complete funnel structure:
{
  "funnelOverview": {
    "totalEstimatedConversionRate": "X%",
    "averageTimeToConvert": "X days",
    "recommendedBudgetSplit": {
      "awareness": 30,
      "engagement": 25,
      "conversion": 30,
      "retention": 15
    }
  },
  "stages": {
    "awareness": {
      "goal": "Drive qualified traffic and brand discovery",
      "offers": [
        {
          "type": "lead_magnet",
          "name": "Offer name",
          "description": "What it includes",
          "deliveryMethod": "How it's delivered"
        }
      ],
      "automation": {
        "task": "AI/automation opportunity",
        "implementation": "How to set it up",
        "tools": ["Tool suggestions"]
      },
      "metrics": ["metric1", "metric2"],
      "transitionTriggers": ["When visitor does X", "When engagement reaches Y"],
      "touchpoints": ["Blog", "Social media", "Paid ads"]
    },
    "engagement": {
      "goal": "Nurture interest and build trust",
      "offers": [...],
      "automation": {...},
      "metrics": [...],
      "transitionTriggers": [...],
      "touchpoints": [...]
    },
    "conversion": {
      "goal": "Drive first purchase decision",
      "offers": [...],
      "automation": {...},
      "metrics": [...],
      "transitionTriggers": [...],
      "touchpoints": [...]
    },
    "retention": {
      "goal": "Maximize customer lifetime value",
      "offers": [...],
      "automation": {...},
      "metrics": [...],
      "transitionTriggers": ["Repurchase", "Referral", "Upgrade"],
      "touchpoints": [...]
    }
  },
  "integrationStrategy": "How the stages work together",
  "quickWins": ["3 things to implement first"],
  "longTermOptimizations": ["Strategic improvements over time"]
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
    const funnelDesign = JSON.parse(aiResponse.choices[0].message.content);

    // Store the funnel design
    const { data: savedFunnel, error: saveError } = await supabase
      .from('funnel_designs')
      .insert({
        user_id: data.userId,
        business_type: data.businessType,
        funnel_structure: funnelDesign,
        input_data: {
          businessType: data.businessType,
          productOffer: data.productOffer,
          averageOrderValue: data.averageOrderValue,
          customerLifetimeValue: data.customerLifetimeValue
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving funnel:', saveError);
      // Continue anyway
    }

    return new Response(JSON.stringify({
      success: true,
      funnel: funnelDesign,
      funnelId: savedFunnel?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in funnel-design-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred designing the marketing funnel',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
