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

    const systemPrompt = `You are an expert competitive strategist specializing in honesty-first competitor analysis and ownable differentiation discovery.

## ADVANCED COMPETITOR INTELLIGENCE FRAMEWORK:

**Honesty-First Analysis Methodology:**
- Acknowledge competitor strengths openly and objectively
- Identify genuine competitive advantages (not manufactured differences)
- Analyze sustainable vs. temporary competitive moats
- Assess realistic opportunities based on resources and market position
- Avoid wishful thinking or underestimating competition

**Content & Messaging Intelligence:**
- Hook formula analysis: Problem/Outcome/Method/Social proof angle usage
- Content pillar breakdown: Educational/Inspirational/Entertaining/Promotional ratios
- Platform-specific messaging adaptation and performance
- Voice and tone differentiation opportunities
- Untapped messaging territories and positioning white space

**Copywriting Excellence Comparison:**
- Headline formula effectiveness: Specificity, social proof, outcome focus
- CTA psychology: Urgency, clarity, friction reduction analysis
- Email subject line strategies and open rate optimization
- Value proposition clarity and differentiation strength
- Story framework usage and emotional connection depth

**Social Media Platform Analysis:**
- Content type performance across platforms (video/image/text ratios)
- Platform-specific optimization and algorithm understanding
- Community engagement quality vs. quantity metrics
- Influencer and partnership strategy assessment
- User-generated content cultivation and amplification

**Market Positioning Intelligence:**
- Customer segment prioritization and focus areas
- Price positioning and value justification strategies
- Distribution channel strength and expansion opportunities
- Brand personality and emotional positioning gaps
- Innovation pipeline and future market direction

Your analysis must be:
- Brutally honest about competitor strengths
- Specific about actionable opportunities
- Grounded in realistic resource assessment
- Focused on sustainable competitive advantage
- Rich in tactical implementation details

Recommend only ownable differentiators that can be defended and scaled.`;

    const userPrompt = `Conduct comprehensive competitive intelligence analysis using honesty-first methodology and advanced messaging/content frameworks.

## OUR BRAND CONTEXT:

Name: ${data.ourBrand}
Offering: ${data.ourOffering}
Strengths: ${data.ourStrengths || 'To be determined'}

## COMPETITORS TO ANALYZE:

1. ${data.competitor1}
2. ${data.competitor2}
3. ${data.competitor3}

## ANALYSIS REQUIREMENTS:

**Honesty-First Assessment:**
Acknowledge competitor strengths objectively. Identify genuine (not manufactured) opportunities. Focus on sustainable competitive advantages.

**Messaging & Copywriting Intelligence:**
- Hook formula analysis: Problem/Outcome/Method/Social proof angle usage
- Headline effectiveness: Specificity, social proof, outcome focus
- CTA psychology: Urgency, clarity, friction reduction
- Email subject line strategies and performance
- Value proposition differentiation and story framework usage

**Content & Social Media Analysis:**
- Content pillar ratios: Educational/Inspirational/Entertaining/Promotional
- Platform-specific optimization and algorithm performance
- Content format distribution: Video/image/text effectiveness
- Community engagement quality vs. quantity
- User-generated content cultivation strategies

**Market Positioning Intelligence:**
- Customer segment focus and prioritization
- Price positioning and value justification
- Distribution channel strength and gaps
- Brand personality and emotional positioning
- Innovation pipeline and future direction

## OUTPUT FORMAT:

{
  "honestyFirstAssessment": {
    "competitorStrengths": [
      {
        "competitor": "Competitor name",
        "genuineStrengths": ["What they truly do well"],
        "competitiveAdvantages": ["Sustainable advantages they hold"],
        "marketPosition": "Their defendable market position"
      }
    ],
    "realOpportunities": ["Genuine gaps we can exploit"],
    "competitiveRealities": ["Hard truths about our position"]
  },
  "messagingIntelligence": {
    "hookFormulas": {
      "competitorUsage": {
        "problemFocused": "How they use pain-point messaging",
        "outcomeFocused": "How they promise benefits",
        "methodFocused": "How they highlight their process",
        "socialProof": "How they use testimonials/numbers"
      },
      "missedAngles": ["Hook formulas they're not using"],
      "ownershipOpportunity": "Which angle we can dominate"
    },
    "copywritingGaps": {
      "headlines": "Headline formula opportunities they're missing",
      "ctas": "Call-to-action psychology gaps",
      "emailSubjects": "Subject line opportunities",
      "valueProps": "Value proposition weaknesses"
    }
  },
  "contentAnalysis": {
    "contentPillars": {
      "competitorRatio": "Their Educational/Inspirational/Entertaining/Promotional %",
      "gapOpportunity": "Pillar they're under-investing in",
      "recommendedRatio": "Our optimal content mix"
    },
    "platformStrategy": {
      "strongPlatforms": ["Where they dominate"],
      "weakPlatforms": ["Where they underperform"],
      "untappedPlatforms": ["Platforms they're ignoring"],
      "formatGaps": ["Content types they're missing"]
    },
    "engagementQuality": {
      "theirApproach": "How they engage community",
      "qualityVsQuantity": "Their engagement philosophy",
      "communityGaps": "Engagement opportunities they miss"
    }
  },
  "socialMediaIntelligence": {
    "platformPresence": [
      {
        "platform": "Platform name",
        "competitorPerformance": "How they perform",
        "contentStrategy": "Their content approach",
        "engagementRate": "Estimated engagement quality",
        "opportunityGap": "What they're missing"
      }
    ],
    "algorithmOptimization": {
      "theirMastery": "Platforms where they excel",
      "algorithmGaps": "Where they struggle with algorithms",
      "optimizationOpportunity": "Our algorithmic advantage potential"
    }
  },
  "positioningAnalysis": {
    "customerSegments": {
      "theirFocus": "Primary customer segments they target",
      "underservedSegments": ["Segments they ignore or serve poorly"],
      "segmentOpportunity": "Customer segment we can own"
    },
    "pricePositioning": {
      "theirStrategy": "How they position on price/value",
      "valueGaps": "Value justification weaknesses",
      "pricingOpportunity": "Our pricing/value positioning"
    },
    "brandPersonality": {
      "theirPersonality": "Their brand voice and personality",
      "emotionalGaps": "Emotional territories they don't own",
      "personalityOpportunity": "Personality space we can claim"
    }
  },
  "ownableDifferentiator": {
    "title": "The defensible position we can own",
    "description": "Detailed explanation of our unique opportunity",
    "whyDefensible": "Why this can't be easily copied",
    "competitorWeakness": "Specific competitor vulnerability this exploits",
    "activationStrategy": [
      "Phase 1: Establish foundation (Week 1-4)",
      "Phase 2: Build momentum (Month 2-3)",
      "Phase 3: Dominate space (Month 4-12)"
    ],
    "messagingFramework": {
      "coreMessage": "Primary positioning statement",
      "hookFormula": "Best hook angle for this differentiator",
      "proofPoints": ["Evidence that supports our claim"],
      "competitorComparison": "How we'll honestly compare vs competition"
    },
    "contentStrategy": "Content approach to reinforce this position",
    "expectedImpact": "Realistic market position outcome",
    "resourceRequirements": ["Capabilities needed to execute"],
    "timeline": "Realistic timeframe to establish dominance"
  },
  "implementationPlan": {
    "immediateActions": [
      "Week 1 tactical move",
      "Week 2 tactical move",
      "Week 3 tactical move"
    ],
    "messagingRollout": "How to launch new messaging",
    "contentCalendar": "Content strategy to support positioning",
    "competitorResponse": "How competitors might react and counter-moves"
  },
  "realityChecks": {
    "competitorAdvantages": ["Advantages we need to acknowledge"],
    "resourceConstraints": ["Limitations we must work within"],
    "marketRealities": ["Industry dynamics we cannot ignore"],
    "avoidanceTraps": ["Competitive mistakes to avoid"]
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'
    console.error('Error in competitor-gap-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred analyzing competitive gaps',
      message: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
