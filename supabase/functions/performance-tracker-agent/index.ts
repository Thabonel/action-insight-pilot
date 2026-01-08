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

    const systemPrompt = `You are an expert marketing analyst and automation specialist. Create simple, actionable performance tracking frameworks.

Your frameworks should:
- Focus on metrics that matter
- Be appropriate for the business stage
- Be easy to track and understand
- Include automation opportunities
- Provide clear success benchmarks

Design for non-marketers who need clear insights without complexity.`;

    const userPrompt = `Summarize key KPIs to monitor this campaign and suggest automation.

Campaign Information:
Name: ${data.campaignName}
Goals: ${data.campaignGoals}
Channels: ${data.channels.join(', ')}
Budget: $${data.budget || 'Not specified'}
Business Stage: ${data.businessStage || 'Growth stage'}

Create a performance tracking framework:

1. **Primary KPIs** (3-5 metrics that directly measure goals)
   For each KPI provide:
   - What to track
   - Why it matters
   - Success benchmark
   - How to measure it
   - Red flag threshold (when to worry)

2. **Secondary KPIs** (supporting metrics)
   - Leading indicators (early signals)
   - Health metrics (system health)
   - Efficiency metrics (cost per result)

3. **Channel-Specific Metrics**
   For each channel, identify:
   - Key performance indicator
   - Baseline to beat
   - Optimization opportunity

4. **Automation & Simplification**
   - How AI/automation can simplify tracking
   - Automated reporting structure for non-marketers
   - Alert thresholds (when to take action)
   - Dashboard structure (what to show first)

5. **Action Triggers**
   - When metric hits X, do Y
   - Escalation protocols
   - Optimization opportunities

Format as JSON:
{
  "primaryKPIs": [
    {
      "metric": "KPI name",
      "whatToTrack": "Specific measurement",
      "whyItMatters": "Business impact",
      "successBenchmark": "Target value or range",
      "howToMeasure": "Calculation method",
      "redFlag": "When to be concerned",
      "currentIndustryAverage": "Benchmark data"
    }
  ],
  "secondaryKPIs": {
    "leadingIndicators": [
      {
        "metric": "Early signal",
        "predictiveValue": "What it predicts"
      }
    ],
    "healthMetrics": ["System health indicator 1", "System health indicator 2"],
    "efficiencyMetrics": [
      {
        "metric": "Cost efficiency measure",
        "target": "Optimal range"
      }
    ]
  },
  "channelMetrics": {
    "email": {
      "primaryMetric": "Open rate",
      "baseline": "20%",
      "target": "30%",
      "optimizationTips": ["Tip 1", "Tip 2"]
    }
    // ... for each channel
  },
  "automation": {
    "dataCollection": [
      {
        "what": "Data to auto-collect",
        "how": "Collection method",
        "tools": ["Tool options"]
      }
    ],
    "reporting": {
      "frequency": "Daily/Weekly/Monthly",
      "recipients": ["Who gets what report"],
      "format": "Email digest, Slack alert, Dashboard",
      "keyInsights": ["What to highlight"]
    },
    "alerts": [
      {
        "condition": "When X happens",
        "action": "Do Y",
        "priority": "High/Medium/Low"
      }
    ]
  },
  "dashboardStructure": {
    "topRow": ["Most important metric to see first"],
    "secondRow": ["Supporting context"],
    "trends": ["Time-based views"],
    "drillDowns": ["Where to investigate deeper"]
  },
  "actionTriggers": [
    {
      "if": "Condition",
      "then": "Action to take",
      "owner": "Who's responsible"
    }
  ],
  "simplifiedForNonMarketers": {
    "dailyCheckIn": "One number to check daily",
    "weeklyReview": "What to review weekly",
    "monthlyDeep dive": "Monthly analysis focus",
    "explanations": {
      "jargonFree": ["Metric": "Plain English explanation"]
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
