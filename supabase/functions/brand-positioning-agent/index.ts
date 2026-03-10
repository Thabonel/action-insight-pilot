import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const BrandPositioningRequestSchema = z.object({
  companyMission: z.string(),
  productOffer: z.string(),
  targetAudience: z.string(),
  competitors: z.string(),
  coreCapabilities: z.string().optional(),
  customerNeeds: z.string().optional(),
  customerPainPoints: z.string().optional(),
  marketPosition: z.string().optional(),
  competitiveAdvantages: z.string().optional(),
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
    const validationResult = BrandPositioningRequestSchema.safeParse(requestBody);

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

    console.log('Generating brand positioning analysis using 3Cs framework...');

    const systemPrompt = `You are an expert brand strategist specializing in psychology-driven positioning analysis. Use the 3Cs framework enhanced with behavioral psychology and competitor intelligence.

## PSYCHOLOGY-DRIVEN POSITIONING FRAMEWORK:

**BJ Fogg Behavior Model Integration:**
- MOTIVATION: Identify core emotional triggers (pleasure/pain, hope/fear, acceptance/rejection)
- ABILITY: Assess customer's capability to engage (time, money, physical effort, brain cycles, social deviance, non-routine)
- PROMPT: Design positioning that serves as behavioral trigger at the right moment

**EAST Framework Application:**
- EASY: Position as the simplest path to desired outcome
- ATTRACTIVE: Use loss aversion, social proof, and scarcity where genuine
- SOCIAL: Leverage network effects and community belonging
- TIMELY: Address immediate needs and decision-making moments

**Competitor Analysis Excellence:**
- Honesty-first comparisons: Acknowledge competitor strengths, highlight our unique advantages
- Gap identification: Where competitors under-serve or over-complicate
- Content format opportunities: What they're not doing in content/messaging
- Positioning white space: Unexplored market positions

Your analysis must be:
- Psychology-informed and behavior-change focused
- Honest about competitive landscape
- Specific about emotional triggers and rational benefits
- Actionable for immediate implementation

Focus on genuine differentiation, not manufactured uniqueness.`;

    const userPrompt = `Conduct a psychology-driven brand positioning analysis using enhanced 3Cs framework with behavioral triggers and competitor intelligence.

## INPUT DATA:

**Company Information:**
Mission: ${data.companyMission}
Product/Offer: ${data.productOffer}
Core Capabilities: ${data.coreCapabilities || 'Not specified'}

**Customer Information:**
Target Audience: ${data.targetAudience}
Customer Needs: ${data.customerNeeds || 'To be determined'}
Pain Points: ${data.customerPainPoints || 'To be determined'}

**Competition Information:**
Competitors: ${data.competitors}
Market Position: ${data.marketPosition || 'To be determined'}
Competitive Advantages: ${data.competitiveAdvantages || 'To be determined'}

## ANALYSIS REQUIREMENTS:

Apply BJ Fogg Behavior Model to understand customer psychology:
- MOTIVATION triggers (what drives them emotionally)
- ABILITY barriers (what might stop them)
- PROMPT opportunities (when they're ready to act)

Use EAST Framework for positioning:
- How we make success EASY for customers
- What makes us ATTRACTIVE (loss aversion, social proof)
- SOCIAL elements we can leverage
- TIMELY moments we should target

Conduct honest competitor analysis:
- Their genuine strengths we must acknowledge
- Gaps they leave that we can fill
- Content/messaging opportunities they're missing
- Market positions they haven't claimed

## OUTPUT FORMAT:

{
  "positioningStatement": "We help [specific target] achieve [specific outcome] through [unique method], unlike [competitors] who [specific limitation]",
  "differentiators": [
    {
      "title": "Differentiator name",
      "description": "Why this matters to customers",
      "evidence": "Specific proof points or advantages",
      "psychologyTrigger": "Which psychological need this addresses"
    }
  ],
  "brandTone": {
    "personality": ["trait1", "trait2", "trait3"],
    "voiceCharacteristics": "How we communicate emotionally and rationally",
    "styleGuidelines": "Communication dos and don'ts",
    "persuasionStyle": "Authority/Social proof/Scarcity approach"
  },
  "behaviorModel": {
    "motivation": {
      "pleasure": "What positive outcome we promise",
      "pain": "What negative outcome we prevent",
      "socialTrigger": "Belonging/status element"
    },
    "ability": {
      "simplicityFactor": "How we reduce effort/complexity",
      "barrierRemoval": "What obstacles we eliminate",
      "timeInvestment": "Realistic time commitment"
    },
    "prompt": {
      "triggerMoments": ["When customer feels X", "When situation Y occurs"],
      "callToAction": "Primary action we want them to take"
    }
  },
  "eastFramework": {
    "easy": "How we're the simplest path to success",
    "attractive": "Loss aversion and social proof elements",
    "social": "Community/network effects we offer",
    "timely": "When customers are most ready to engage"
  },
  "competitorIntelligence": {
    "honestComparison": {
      "theirStrengths": ["What they do well that we acknowledge"],
      "ourAdvantages": ["What we do better and how"],
      "marketGaps": ["Opportunities they're leaving on table"]
    },
    "contentOpportunities": ["Messaging angles they haven't used"],
    "positioningWhiteSpace": "Unexplored market position we can claim"
  },
  "recommendations": [
    "Immediate positioning action 1",
    "Behavioral trigger implementation 2",
    "Competitive differentiation strategy 3"
  ],
  "threeCs": {
    "company": {
      "strengths": ["Our key capabilities"],
      "uniqueCapabilities": "What only we can do",
      "psychologyAlignment": "How our strengths match customer psychology"
    },
    "customer": {
      "primaryNeed": "Core functional need",
      "emotionalDrivers": ["Emotional motivations"],
      "decisionCriteria": "What influences their choice",
      "behaviorBarriers": "What stops them from acting"
    },
    "competition": {
      "mainCompetitors": ["Key competitors to watch"],
      "theirWeaknesses": ["Honest assessment of their gaps"],
      "ourAdvantage": "Our sustainable competitive edge",
      "positioningGaps": "Market positions not claimed"
    }
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
        max_completion_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const positioningAnalysis = JSON.parse(aiResponse.choices[0].message.content);

    // Store the positioning analysis
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('brand_positioning_analyses')
      .insert({
        user_id: data.userId,
        positioning_statement: positioningAnalysis.positioningStatement,
        differentiators: positioningAnalysis.differentiators,
        brand_tone: positioningAnalysis.brandTone,
        three_cs_analysis: positioningAnalysis.threeCs,
        recommendations: positioningAnalysis.recommendations,
        input_data: {
          companyMission: data.companyMission,
          productOffer: data.productOffer,
          targetAudience: data.targetAudience,
          competitors: data.competitors
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      // Continue anyway, return the analysis
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: positioningAnalysis,
      analysisId: savedAnalysis?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in brand-positioning-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred generating brand positioning analysis',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
