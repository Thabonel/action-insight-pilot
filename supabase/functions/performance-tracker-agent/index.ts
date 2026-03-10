import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const PerformanceTrackerRequestSchema = z.object({
  campaignName: z.string(),
  campaignGoals: z.string(),
  channels: z.array(z.string()),
  budget: z.number().optional(),
  businessStage: z.string().optional(),
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
    const validationResult = PerformanceTrackerRequestSchema.safeParse(requestBody);

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

    console.log('Creating performance tracking framework...');

    const systemPrompt = `You are an expert marketing analyst specializing in psychology-driven performance tracking with growth engineering focus.

## ADVANCED PERFORMANCE TRACKING FRAMEWORK:

**Psychology-Based Metrics (BJ Fogg Model):**
- MOTIVATION tracking: Emotional engagement metrics (sentiment, excitement, urgency response)
- ABILITY metrics: Friction points, completion rates, effort required per action
- PROMPT effectiveness: Trigger response rates, timing optimization, call-to-action performance
- Behavioral change indicators: Adoption rates, habit formation, retention curves

**Growth Engineering Metrics:**
- Viral coefficient (K-factor): Users acquired per existing user
- Viral cycle time: Time from share to conversion
- Network effects: Value increase with user base growth
- Compound growth rate: Month-over-month acceleration
- Retention cohort analysis: Long-term value creation

**Creative Performance Intelligence:**
- Creative angle effectiveness: Problem/Outcome/Method/Social proof performance
- Iteration velocity: Testing frequency and learning speed
- Creative fatigue indicators: Performance degradation over time
- Audience-angle fit: Which angles resonate with which segments
- Cross-platform creative adaptation: Performance across channels

**Behavioral Data Analysis:**
- Micro-conversions: Small steps toward main goal
- Engagement depth: Time spent, pages visited, content consumed
- Social proof generation: Reviews, shares, user-generated content
- Decision velocity: Time from awareness to purchase
- Customer journey bottlenecks: Where people drop off and why

Your frameworks must:
- Track both rational metrics AND emotional engagement
- Identify psychological barriers AND conversion blockers
- Monitor growth mechanics AND traditional KPIs
- Provide creative optimization AND audience insights
- Be actionable for non-marketers WITH psychological sophistication

Focus on leading indicators that predict long-term success, not just vanity metrics.`;

    const userPrompt = `Create a comprehensive performance tracking framework combining traditional KPIs with psychology-driven metrics and growth engineering analytics.

## CAMPAIGN CONTEXT:

Name: ${data.campaignName}
Goals: ${data.campaignGoals}
Channels: ${data.channels.join(', ')}
Budget: $${data.budget || 'Not specified'}
Business Stage: ${data.businessStage || 'Growth stage'}

## FRAMEWORK REQUIREMENTS:

**Psychology Metrics (BJ Fogg Model):**
- Track MOTIVATION: Emotional engagement, urgency response, desire intensity
- Monitor ABILITY: Friction points, completion rates, effort barriers
- Measure PROMPT effectiveness: Trigger response, timing optimization, CTA performance
- Analyze behavioral change: Adoption, habit formation, retention patterns

**Growth Engineering Analytics:**
- Viral coefficient: K-factor calculation and tracking
- Viral cycle time: Share-to-conversion timeline
- Network effects: Value scaling with user base
- Compound growth: MoM acceleration measurement
- Cohort retention: Long-term value analysis

**Creative Performance Intelligence:**
- Angle effectiveness: Problem/Outcome/Method/Social proof performance
- Iteration velocity: Testing frequency and learning rate
- Creative fatigue: Performance degradation patterns
- Audience-angle fit: Segmented response analysis
- Cross-platform adaptation: Creative performance across channels

## OUTPUT FORMAT:

{
  "primaryKPIs": [
    {
      "metric": "KPI name",
      "whatToTrack": "Specific measurement",
      "whyItMatters": "Business and psychological impact",
      "successBenchmark": "Target value or range",
      "howToMeasure": "Calculation method",
      "redFlag": "When to be concerned",
      "psychologyConnection": "Which psychological principle this validates"
    }
  ],
  "behaviorMetrics": {
    "motivation": [
      {
        "metric": "Emotional engagement score",
        "measurement": "Sentiment analysis + time spent + repeat visits",
        "target": "7.5/10 average",
        "indicator": "Desire intensity and purchase intent"
      }
    ],
    "ability": [
      {
        "metric": "Friction coefficient",
        "measurement": "Steps to complete / successful completions",
        "target": "< 3 steps for key actions",
        "indicator": "Ease of taking desired action"
      }
    ],
    "prompt": [
      {
        "metric": "Trigger response rate",
        "measurement": "Actions taken / triggers shown",
        "target": "> 15% response rate",
        "indicator": "Call-to-action effectiveness"
      }
    ]
  },
  "growthEngineering": {
    "viralCoefficient": {
      "calculation": "New users acquired / existing users / time period",
      "target": "> 1.0 for sustainable viral growth",
      "measurement": "Weekly cohorts",
      "optimization": "Share incentives and friction reduction"
    },
    "viralCycleTime": {
      "calculation": "Time from share to new user activation",
      "target": "< 24 hours for optimal viral loops",
      "measurement": "Event tracking from share to signup",
      "optimization": "Onboarding simplification"
    },
    "networkEffects": {
      "calculation": "Value per user increase with network size",
      "target": "20% value increase per 10x users",
      "measurement": "User satisfaction vs network size",
      "optimization": "Community features and social proof"
    },
    "compoundGrowth": {
      "calculation": "Month-over-month growth acceleration",
      "target": "> 20% monthly growth",
      "measurement": "New user acquisition rate",
      "optimization": "Retention and referral optimization"
    }
  },
  "creativeIntelligence": {
    "angleEffectiveness": {
      "problemFocused": {
        "metric": "Problem-angle conversion rate",
        "benchmark": "Industry average for pain-point messaging",
        "optimization": "Pain point specificity and emotional intensity"
      },
      "outcomeFocused": {
        "metric": "Outcome-angle conversion rate",
        "benchmark": "Industry average for benefit messaging",
        "optimization": "Benefit specificity and credibility proof"
      },
      "methodFocused": {
        "metric": "Method-angle conversion rate",
        "benchmark": "Industry average for process messaging",
        "optimization": "Unique approach differentiation"
      },
      "socialProof": {
        "metric": "Social proof angle conversion rate",
        "benchmark": "Industry average for testimonial messaging",
        "optimization": "Credibility and relatability"
      }
    },
    "iterationVelocity": {
      "metric": "Creative tests per week",
      "target": "3-5 new creative tests weekly",
      "measurement": "New creative launches",
      "optimization": "Testing workflow and approval process"
    },
    "creativeFatigue": {
      "metric": "Performance degradation rate",
      "calculation": "Week 4 performance / Week 1 performance",
      "target": "> 0.8 (less than 20% degradation)",
      "optimization": "Creative refresh frequency"
    }
  },
  "behavioralAnalytics": {
    "microConversions": [
      {
        "action": "Email open",
        "psychologyTrigger": "Curiosity/urgency response",
        "target": "25% open rate",
        "leadingTo": "Click and engagement"
      }
    ],
    "engagementDepth": {
      "metric": "Session depth score",
      "calculation": "Pages * Time * Actions / Session",
      "target": "Score > 50 for qualified leads",
      "psychologyInsight": "Interest and consideration level"
    },
    "socialProofGeneration": {
      "metric": "User-generated content rate",
      "calculation": "UGC created / total customers",
      "target": "10% of customers create content",
      "psychologyPrinciple": "Social proof amplification"
    },
    "decisionVelocity": {
      "metric": "Awareness-to-purchase time",
      "calculation": "First touch to purchase conversion",
      "target": "< 14 days for direct response",
      "psychologyBarrier": "Analysis paralysis and friction"
    }
  },
  "automatedInsights": {
    "psychologyAlerts": [
      {
        "trigger": "Engagement drops below psychological threshold",
        "action": "Test new motivation triggers",
        "priority": "High"
      }
    ],
    "growthAlerts": [
      {
        "trigger": "Viral coefficient below 0.8",
        "action": "Optimize sharing incentives",
        "priority": "Critical"
      }
    ],
    "creativeAlerts": [
      {
        "trigger": "Creative fatigue detected (>20% performance drop)",
        "action": "Launch new creative angle",
        "priority": "Medium"
      }
    ]
  },
  "intelligentDashboard": {
    "psychologyOverview": {
      "motivation": "Emotional engagement trend",
      "ability": "Friction coefficient trend",
      "prompt": "Trigger effectiveness trend"
    },
    "growthOverview": {
      "viral": "K-factor and cycle time",
      "network": "Network effects strength",
      "compound": "Growth acceleration rate"
    },
    "creativeOverview": {
      "angles": "Best performing creative angles",
      "iteration": "Testing velocity and learning rate",
      "fatigue": "Creative refresh needs"
    }
  },
  "simplifiedForNonMarketers": {
    "dailyCheckIn": "Psychology score (motivation + ability + prompt effectiveness)",
    "weeklyReview": "Growth velocity and viral performance",
    "monthlyDeepDive": "Creative performance and behavioral patterns",
    "explanations": {
      "psychologyScore": "How emotionally engaged and motivated your audience is",
      "viralCoefficient": "How many new customers each existing customer brings",
      "creativeAngle": "Which type of message works best with your audience",
      "frictionCoefficient": "How easy or hard it is for people to take action",
      "engagementDepth": "How interested people are in your content and offer"
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
        max_completion_tokens: 3000,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const trackingFramework = JSON.parse(aiResponse.choices[0].message.content);

    // Store the tracking framework
    const { data: savedFramework, error: saveError } = await supabase
      .from('performance_tracking_frameworks')
      .insert({
        user_id: data.userId,
        campaign_name: data.campaignName,
        tracking_framework: trackingFramework,
        channels: data.channels,
        input_data: {
          campaignName: data.campaignName,
          campaignGoals: data.campaignGoals,
          channels: data.channels,
          budget: data.budget
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving framework:', saveError);
      // Continue anyway
    }

    return new Response(JSON.stringify({
      success: true,
      framework: trackingFramework,
      frameworkId: savedFramework?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in performance-tracker-agent:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred creating performance tracking framework',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
