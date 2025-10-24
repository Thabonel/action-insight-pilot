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

    const systemPrompt = `You are an expert brand strategist specializing in positioning analysis. Use the 3Cs framework (Company, Customer, Competition) to analyze brand positioning.

Your analysis should be:
- Data-driven and objective
- Clear and actionable
- Based on real competitive advantages
- Customer-centric

Always provide specific, implementable recommendations.`;

    const userPrompt = `Analyze the company's mission, audience, and offer. Summarize the brand's unique position using the 3Cs (Company, Customer, Competition).

Company Information:
Mission: ${data.companyMission}
Product/Offer: ${data.productOffer}
Core Capabilities: ${data.coreCapabilities || 'Not specified'}

Customer Information:
Target Audience: ${data.targetAudience}
Customer Needs: ${data.customerNeeds || 'To be determined'}
Pain Points: ${data.customerPainPoints || 'To be determined'}

Competition Information:
Competitors: ${data.competitors}
Market Position: ${data.marketPosition || 'To be determined'}
Competitive Advantages: ${data.competitiveAdvantages || 'To be determined'}

Output a comprehensive positioning analysis with:
1. One-sentence positioning statement
2. Three key differentiators (what makes you unique)
3. Brand tone description (personality, voice, style)
4. Strategic positioning recommendations

Format as JSON:
{
  "positioningStatement": "We help [target customer] achieve [benefit] through [unique approach], unlike [competitors] who [their limitation]",
  "differentiators": [
    {
      "title": "Differentiator name",
      "description": "Why this matters",
      "evidence": "Proof points or metrics"
    }
  ],
  "brandTone": {
    "personality": ["trait1", "trait2", "trait3"],
    "voiceCharacteristics": "Description of how the brand communicates",
    "styleGuidelines": "Specific do's and don'ts"
  },
  "recommendations": ["Strategic recommendation 1", "Strategic recommendation 2"],
  "threeCs": {
    "company": {
      "strengths": ["strength1", "strength2"],
      "uniqueCapabilities": "What we can do that others can't"
    },
    "customer": {
      "primaryNeed": "Most important customer need we address",
      "emotionalDrivers": ["driver1", "driver2"],
      "decisionCriteria": "What influences their choice"
    },
    "competition": {
      "mainCompetitors": ["competitor1", "competitor2"],
      "theirWeaknesses": ["weakness1", "weakness2"],
      "ourAdvantage": "How we win"
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

  } catch (error) {
    console.error('Error in brand-positioning-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred generating brand positioning analysis',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
