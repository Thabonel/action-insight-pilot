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
    const { campaignId, predictionType = 'kpi_forecast' } = await req.json();

    console.log('Generating predictions for campaign:', campaignId);

    // Get campaign data
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    // Get historical similar campaigns for ML training data
    const { data: historicalCampaigns } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_metrics(*)
      `)
      .eq('type', campaign.type)
      .neq('id', campaignId)
      .order('created_at', { ascending: false })
      .limit(20);

    const predictions = await generatePredictionsWithAI(campaign, historicalCampaigns, predictionType);

    // Save predictions to database
    const { data: savedPrediction } = await supabase
      .from('campaign_predictions')
      .insert({
        campaign_id: campaignId,
        prediction_type: predictionType,
        prediction_data: predictions,
        confidence_score: predictions.confidence || 0.75,
        based_on_campaigns: historicalCampaigns?.map(c => c.id) || []
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      predictions,
      predictionId: savedPrediction.id,
      basedOnCampaigns: historicalCampaigns?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in predictive-analytics:', error);
    // Return generic error to client, log full error server-side
    const errorMessage = error instanceof Error ? error.message : ''
    const publicError = errorMessage?.includes('API key') || errorMessage?.includes('OPENAI')
      ? 'Configuration error - please contact support'
      : 'An error occurred generating predictions';
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePredictionsWithAI(campaign: Record<string, unknown>, historicalData: unknown[], predictionType: string): Promise<unknown> {
  const prompt = `
As an expert marketing data scientist, analyze the historical campaign data and predict outcomes for the new campaign.

Current Campaign:
${JSON.stringify(campaign, null, 2)}

Historical Similar Campaigns (last 20):
${JSON.stringify(historicalData?.map(c => ({
  id: c.id,
  type: c.type,
  budget: c.total_budget,
  metrics: c.campaign_metrics?.slice(0, 5) // Latest metrics only
})) || [], null, 2)}

Prediction Type: ${predictionType}

Generate predictions in JSON format:
{
  "kpiForecast": {
    "probabilityOfSuccess": 0.85,
    "expectedROI": "2.4x",
    "leadGeneration": {
      "low": 150,
      "expected": 250,
      "high": 380
    },
    "budgetEfficiency": "above_average",
    "timeToFirstResult": "7-10 days"
  },
  "budgetOptimization": {
    "recommendedBudget": 45000,
    "channelAllocation": {
      "email": 0.35,
      "social": 0.40,
      "content": 0.25
    },
    "expectedSavings": "12%"
  },
  "riskFactors": [
    {
      "factor": "Market saturation",
      "probability": 0.3,
      "impact": "medium",
      "mitigation": "Diversify targeting"
    }
  ],
  "optimizationOpportunities": [
    "Increase LinkedIn budget by 20%",
    "A/B test email send times",
    "Focus on enterprise segment"
  ],
  "confidence": 0.87,
  "basedOnSimilarity": "High similarity to 15 successful campaigns",
  "keyInsights": [
    "Similar campaigns averaged 240% ROI",
    "Best performing channel typically social media",
    "Peak performance usually reached in week 3"
  ]
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
        { role: 'system', content: 'You are an expert marketing data scientist and predictive analyst. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1500,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}