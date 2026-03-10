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

    const systemPrompt = `You are an expert funnel strategist specializing in high-converting customer journeys with built-in growth mechanics and professional automation frameworks.

## COMPREHENSIVE FUNNEL DESIGN FRAMEWORK:

**Email Sequence Mastery:**
- Hook-Bridge-Value-Close structure for all email communications
- Timing optimization: Day 1, 3, 7, 14, 21 pattern for nurture sequences
- Subject line psychology: 2-6 words, curiosity-driven, no spam triggers
- Deliverability focus: warmup patterns, engagement monitoring

**Lead Magnet Value-First Design:**
- Quick Win Principle: Instant value within 5 minutes of consumption
- Funnel stage specificity: Top-funnel (awareness), Mid-funnel (consideration), Bottom-funnel (decision)
- Format matching: Checklists for awareness, templates for consideration, calculators for decision
- Implementation ease: Must be actionable without additional tools/purchases

**ORB Channel Framework Integration:**
- OWNED: Email list, website, customer database (highest control)
- RENTED: Social media platforms, third-party marketplaces (medium control)
- BORROWED: PR, influencers, partnerships (lowest control but highest reach)
- 70-20-10 budget allocation: 70% owned, 20% rented, 10% borrowed

**Growth & Viral Mechanics:**
- Built-in referral loops at each stage with psychological motivations
- Shared incentives: Both referrer and referee benefit
- Social sharing friction reduction: One-click sharing with pre-written copy
- Network effects: Community features that increase value with more users

**Ad Creative Angle Development:**
- Problem-focused angles: "Tired of X?"
- Outcome-focused angles: "Get Y without Z"
- Method-focused angles: "The Z way to achieve Y"
- Social proof angles: "Join N+ people who..."
- Iteration protocol: 3 angles per stage, test weekly, scale winners

Your funnels must be:
- Growth-engineered with viral loops
- Email-centric with professional automation
- Lead magnet optimized for instant value
- Channel-diversified using ORB framework
- Creative-ready with multiple testing angles

Design for exponential growth, not just linear conversion.`;

    const userPrompt = `Design a growth-engineered funnel with professional automation, viral mechanics, and multi-channel acquisition using proven frameworks.

## BUSINESS CONTEXT:

Business Type: ${data.businessType}
Product/Offer: ${data.productOffer}
Average Order Value: $${data.averageOrderValue || 'Not specified'}
Customer Lifetime Value: $${data.customerLifetimeValue || 'Not specified'}
Current Marketing Capabilities: ${data.currentMarketingCapabilities || 'Starting from scratch'}

## DESIGN REQUIREMENTS:

**Email Sequence Integration:**
For each stage, design Hook-Bridge-Value-Close email sequences with:
- Day 1, 3, 7, 14, 21 timing optimization
- 2-6 word subject lines with curiosity psychology
- Deliverability-safe content and sender reputation management

**Lead Magnet Quick Win Design:**
Create instant-value lead magnets for each stage:
- 5-minute consumption time maximum
- Actionable without additional purchases
- Format matched to buyer stage (checklist/template/calculator)

**ORB Channel Strategy:**
Allocate touchpoints across:
- OWNED (70%): Email, website, customer database
- RENTED (20%): Social platforms, marketplaces
- BORROWED (10%): PR, influencers, partnerships

**Viral Growth Mechanics:**
Build referral loops with:
- Dual incentives (referrer + referee benefits)
- Friction-reduced sharing (one-click + pre-written copy)
- Network effects that increase value with scale

**Ad Creative Angles:**
Develop 3 testing angles per stage:
- Problem-focused, Outcome-focused, Method-focused, Social proof
- Weekly testing rotation with performance scaling

## OUTPUT FORMAT:

{
  "funnelOverview": {
    "totalEstimatedConversionRate": "X%",
    "averageTimeToConvert": "X days",
    "viralCoefficient": "Expected K-factor",
    "orbChannelAllocation": {
      "owned": 70,
      "rented": 20,
      "borrowed": 10
    },
    "growthProjection": "Month 1-12 growth estimate"
  },
  "stages": {
    "awareness": {
      "goal": "Drive qualified discovery with viral amplification",
      "leadMagnet": {
        "name": "Specific lead magnet name",
        "format": "Checklist/Template/Calculator/Guide",
        "quickWinPromise": "Outcome achievable in 5 minutes",
        "deliveryMethod": "How it's delivered instantly",
        "viralHook": "Why people would share this"
      },
      "emailSequence": {
        "sequenceName": "Awareness nurture sequence",
        "emailCount": 5,
        "timeline": "Day 1, 3, 7, 14, 21",
        "emails": [
          {
            "day": 1,
            "subject": "2-6 word curiosity subject",
            "structure": "Hook-Bridge-Value-Close outline",
            "cta": "Primary action"
          }
        ]
      },
      "adCreativeAngles": [
        {
          "type": "problem_focused",
          "hook": "Tired of [pain point]?",
          "promise": "What they'll get",
          "social_proof": "Join X+ people who..."
        }
      ],
      "orbChannels": {
        "owned": ["Email capture", "Website blog"],
        "rented": ["Social media", "Content platforms"],
        "borrowed": ["PR mentions", "Influencer features"]
      },
      "viralMechanics": {
        "shareIncentive": "What motivates sharing",
        "referralReward": "Reward for successful referral",
        "sharingFriction": "How to reduce sharing effort",
        "networkEffect": "Value increase with network size"
      },
      "automation": {
        "task": "AI/automation opportunity",
        "implementation": "Setup instructions",
        "tools": ["Tool suggestions"],
        "triggers": "When automation activates"
      },
      "metrics": ["Traffic", "Conversion rate", "Viral shares"],
      "transitionTriggers": ["Email opens", "Content engagement", "Time threshold"]
    },
    "engagement": {
      "goal": "Build trust and demonstrate expertise",
      "leadMagnet": {...},
      "emailSequence": {...},
      "adCreativeAngles": [...],
      "orbChannels": {...},
      "viralMechanics": {...},
      "automation": {...},
      "metrics": [...],
      "transitionTriggers": [...]
    },
    "conversion": {
      "goal": "Drive first purchase with urgency",
      "leadMagnet": {...},
      "emailSequence": {...},
      "adCreativeAngles": [...],
      "orbChannels": {...},
      "viralMechanics": {...},
      "automation": {...},
      "metrics": [...],
      "transitionTriggers": [...]
    },
    "retention": {
      "goal": "Maximize LTV and create advocates",
      "leadMagnet": {...},
      "emailSequence": {...},
      "adCreativeAngles": [...],
      "orbChannels": {...},
      "viralMechanics": {...},
      "automation": {...},
      "metrics": [...],
      "transitionTriggers": ["Repurchase", "Referral", "Upgrade"]
    }
  },
  "growthStrategy": {
    "viralLoops": "How viral mechanics connect across stages",
    "compoundGrowth": "How each stage amplifies others",
    "retentionEngine": "How we keep growth sustainable"
  },
  "implementationPlan": {
    "week1": ["Immediate setup tasks"],
    "week2-4": ["Email sequences and automation"],
    "month2-3": ["Viral mechanics and ORB expansion"],
    "longTerm": ["Scale and optimization strategy"]
  },
  "expectedResults": {
    "month1": "Growth metrics projection",
    "month3": "Viral coefficient and LTV targets",
    "month12": "Scale and sustainability outcomes"
  }
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

  } catch (error: unknown) {
    console.error('Error in funnel-design-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred designing the marketing funnel',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
