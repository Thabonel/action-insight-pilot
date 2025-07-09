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
    const { field, currentValue, context, userId } = await req.json();

    console.log('Generating autocomplete for field:', field);

    // Get user's historical data for this field type
    const { data: userHistory } = await supabase
      .from('campaigns')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get learned patterns for similar contexts
    const { data: patterns } = await supabase
      .from('agent_learning_data')
      .select('*')
      .order('success_rate', { ascending: false })
      .limit(5);

    // Get user's previous successful interactions
    const { data: successfulFeedback } = await supabase
      .from('ai_interaction_feedback')
      .select('*')
      .eq('user_id', userId)
      .in('interaction_type', ['approve'])
      .order('timestamp', { ascending: false })
      .limit(5);

    const suggestions = await generateSmartSuggestions(
      field,
      currentValue,
      context,
      userHistory || [],
      patterns || [],
      successfulFeedback || []
    );

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-autocomplete:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSmartSuggestions(
  field: string,
  currentValue: string,
  context: any,
  userHistory: any[],
  patterns: any[],
  successfulFeedback: any[]
): Promise<string[]> {
  
  // Extract relevant historical data
  const historicalValues = extractHistoricalValues(field, userHistory);
  const successfulPatterns = extractSuccessfulPatterns(field, successfulFeedback);
  
  // Generate context-aware suggestions based on field type
  switch (field) {
    case 'name':
    case 'campaignName':
      return generateCampaignNameSuggestions(currentValue, context, historicalValues);
    
    case 'description':
    case 'campaignDescription':
      return generateDescriptionSuggestions(currentValue, context, historicalValues);
    
    case 'targetAudience':
    case 'audience':
      return generateAudienceSuggestions(currentValue, context, historicalValues);
    
    case 'objectives':
    case 'goals':
      return generateObjectiveSuggestions(currentValue, context, historicalValues);
    
    case 'budget':
      return generateBudgetSuggestions(currentValue, context, historicalValues);
    
    case 'channels':
      return generateChannelSuggestions(currentValue, context, historicalValues);
    
    default:
      return generateGenericSuggestions(currentValue, context, historicalValues);
  }
}

function extractHistoricalValues(field: string, userHistory: any[]): string[] {
  const values: string[] = [];
  
  userHistory.forEach(campaign => {
    if (campaign[field]) {
      values.push(campaign[field]);
    }
    
    // Also check in nested objects
    if (campaign.content && campaign.content[field]) {
      values.push(campaign.content[field]);
    }
    
    if (campaign.settings && campaign.settings[field]) {
      values.push(campaign.settings[field]);
    }
  });
  
  // Remove duplicates and return unique values
  return [...new Set(values)].filter(v => v && v.length > 2);
}

function extractSuccessfulPatterns(field: string, successfulFeedback: any[]): any[] {
  return successfulFeedback
    .filter(f => f.original_suggestion && f.original_suggestion[field])
    .map(f => f.original_suggestion[field]);
}

function generateCampaignNameSuggestions(currentValue: string, context: any, history: string[]): string[] {
  const suggestions: string[] = [];
  
  // Add relevant historical names
  if (history.length > 0) {
    suggestions.push(...history.slice(0, 2));
  }
  
  // Generate context-based suggestions
  if (context.product || context.service) {
    const product = context.product || context.service;
    suggestions.push(
      `${product} Launch Campaign`,
      `${product} Awareness Drive`,
      `${product} Success Stories`
    );
  }
  
  if (context.industry) {
    suggestions.push(
      `${context.industry} Innovation Campaign`,
      `${context.industry} Transformation Initiative`
    );
  }
  
  // Add seasonal/time-based suggestions
  const month = new Date().toLocaleString('default', { month: 'long' });
  suggestions.push(
    `${month} Marketing Blitz`,
    `Q${Math.ceil((new Date().getMonth() + 1) / 3)} Growth Campaign`
  );
  
  // Filter based on current input
  if (currentValue.length > 0) {
    return suggestions.filter(s => 
      s.toLowerCase().includes(currentValue.toLowerCase())
    ).slice(0, 5);
  }
  
  return suggestions.slice(0, 5);
}

function generateDescriptionSuggestions(currentValue: string, context: any, history: string[]): string[] {
  const suggestions: string[] = [];
  
  // Template-based suggestions
  if (context.product) {
    suggestions.push(
      `Comprehensive marketing campaign to promote ${context.product} and drive customer acquisition`,
      `Strategic initiative to increase ${context.product} market penetration and brand awareness`,
      `Multi-channel campaign designed to showcase ${context.product} benefits and generate qualified leads`
    );
  }
  
  if (context.targetAudience) {
    suggestions.push(
      `Targeted campaign focusing on ${context.targetAudience} to maximize engagement and conversion`,
      `Personalized marketing approach designed specifically for ${context.targetAudience} segment`
    );
  }
  
  // Add relevant historical descriptions
  suggestions.push(...history.slice(0, 2));
  
  return suggestions.slice(0, 5);
}

function generateAudienceSuggestions(currentValue: string, context: any, history: string[]): string[] {
  const suggestions: string[] = [];
  
  // Industry-specific audiences
  if (context.industry) {
    suggestions.push(
      `${context.industry} professionals`,
      `${context.industry} decision makers`,
      `${context.industry} executives and managers`
    );
  }
  
  // Common B2B audiences
  suggestions.push(
    'C-level executives',
    'IT decision makers',
    'Marketing professionals',
    'Small business owners',
    'Enterprise clients'
  );
  
  // Add historical audiences
  suggestions.push(...history.slice(0, 2));
  
  return suggestions.slice(0, 5);
}

function generateObjectiveSuggestions(currentValue: string, context: any, history: string[]): string[] {
  const suggestions = [
    'Increase brand awareness and recognition',
    'Generate qualified leads and prospects',
    'Drive website traffic and engagement',
    'Boost product sales and revenue',
    'Improve customer retention and loyalty',
    'Expand market reach and penetration',
    'Launch new product or service',
    'Establish thought leadership position',
    'Increase social media following',
    'Improve customer acquisition cost (CAC)'
  ];
  
  // Add historical objectives
  suggestions.push(...history.slice(0, 2));
  
  return suggestions.slice(0, 5);
}

function generateBudgetSuggestions(currentValue: string, context: any, history: string[]): string[] {
  const suggestions: string[] = [];
  
  // Common budget ranges
  suggestions.push(
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000+'
  );
  
  // Add historical budgets if available
  const historicalBudgets = history.filter(h => h.includes('$') || !isNaN(Number(h)));
  suggestions.push(...historicalBudgets.slice(0, 2));
  
  return suggestions.slice(0, 5);
}

function generateChannelSuggestions(currentValue: string, context: any, history: string[]): string[] {
  const suggestions = [
    'Email marketing',
    'Social media (LinkedIn, Twitter)',
    'Content marketing and blogging',
    'Search engine optimization (SEO)',
    'Pay-per-click advertising (PPC)',
    'Trade shows and events',
    'Influencer partnerships',
    'Direct mail campaigns',
    'Webinars and virtual events',
    'Video marketing and YouTube'
  ];
  
  return suggestions.slice(0, 5);
}

function generateGenericSuggestions(currentValue: string, context: any, history: string[]): string[] {
  // Return most relevant historical values
  return history.slice(0, 5);
}