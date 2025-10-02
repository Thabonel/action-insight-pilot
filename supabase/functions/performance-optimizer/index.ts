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
    const { campaignId } = await req.json();

    console.log('Analyzing performance for campaign:', campaignId);

    // Get current campaign performance data
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    // Get recent performance metrics
    const { data: metrics } = await supabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('metric_date', { ascending: false })
      .limit(30);

    // Get historical benchmark data for similar campaigns
    const { data: benchmarks } = await supabase
      .from('campaigns')
      .select('*, campaign_metrics(*)')
      .eq('type', campaign.type)
      .neq('id', campaignId)
      .limit(10);

    const analysis = await analyzePerformanceWithAI(campaign, metrics, benchmarks);

    // Check if auto-optimization is needed
    const optimizations = await generateOptimizationSuggestions(analysis, campaign);

    // Save performance monitoring data
    await savePerformanceAnalysis(supabase, campaignId, analysis, optimizations);

    return new Response(JSON.stringify({
      analysis,
      optimizations,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in performance-optimizer:', error);
    // Return generic error to client, log full error server-side
    const publicError = error.message?.includes('API key') || error.message?.includes('OPENAI')
      ? 'Configuration error - please contact support'
      : 'An error occurred analyzing performance';
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzePerformanceWithAI(campaign: any, metrics: any[], benchmarks: any[]): Promise<any> {
  const prompt = `
Analyze this campaign's performance against benchmarks and provide optimization recommendations:

Campaign: ${JSON.stringify(campaign, null, 2)}

Recent Metrics: ${JSON.stringify(metrics?.slice(0, 10) || [], null, 2)}

Industry Benchmarks: ${JSON.stringify(benchmarks?.slice(0, 5) || [], null, 2)}

Provide analysis in JSON format:
{
  "overallPerformance": "excellent/good/average/poor",
  "performanceScore": 0-100,
  "channelPerformance": {
    "bestPerforming": "channel_name",
    "underperforming": ["channel1", "channel2"],
    "recommendations": ["action1", "action2"]
  },
  "trends": {
    "direction": "improving/declining/stable",
    "insights": ["insight1", "insight2"]
  },
  "alertLevel": "none/low/medium/high",
  "urgentActions": ["action1", "action2"]
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
        { role: 'system', content: 'You are an expert marketing analyst. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateOptimizationSuggestions(analysis: any, campaign: any): Promise<any[]> {
  const suggestions = [];

  // Budget reallocation suggestions
  if (analysis.channelPerformance?.underperforming?.length > 0) {
    suggestions.push({
      type: 'budget_reallocation',
      priority: 'high',
      action: `Reallocate 15% budget from ${analysis.channelPerformance.underperforming[0]} to ${analysis.channelPerformance.bestPerforming}`,
      impact: 'Estimated 20-30% improvement in ROI',
      confidence: 0.85
    });
  }

  // Timing optimization
  if (analysis.trends?.direction === 'declining') {
    suggestions.push({
      type: 'timing_optimization',
      priority: 'medium',
      action: 'Adjust posting schedule to peak engagement hours',
      impact: 'Potential 15% increase in engagement',
      confidence: 0.75
    });
  }

  // Content optimization
  if (analysis.overallPerformance === 'poor') {
    suggestions.push({
      type: 'content_refresh',
      priority: 'high',
      action: 'Refresh ad creative and messaging based on top-performing competitors',
      impact: 'Expected 25-40% improvement in CTR',
      confidence: 0.80
    });
  }

  return suggestions;
}

async function savePerformanceAnalysis(supabase: any, campaignId: string, analysis: any, optimizations: any[]): Promise<void> {
  await supabase
    .from('campaign_performance_monitor')
    .insert({
      campaign_id: campaignId,
      channel: 'all_channels',
      metrics: analysis,
      performance_score: analysis.performanceScore || 0,
      optimization_suggestions: optimizations
    });
}