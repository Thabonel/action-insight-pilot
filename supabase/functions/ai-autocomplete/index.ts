import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      userId,
      userHistory || [],
      patterns || [],
      successfulFeedback || []
    );

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in ai-autocomplete:', error);

    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'An error occurred generating suggestions';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('OPENAI');
    const publicError = isConfigError ? 'Configuration error - please contact support' : errorMessage;

    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface Campaign {
  [key: string]: unknown;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

async function generateSmartSuggestions(
  field: string,
  currentValue: string,
  context: Record<string, unknown>,
  userId: string,
  userHistory: Campaign[],
  patterns: unknown[],
  successfulFeedback: Array<{ original_suggestion?: Record<string, unknown> }>
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

    case 'mentions':
      return await generateMentionSuggestions(currentValue, context, userId);

    case 'hashtags':
      return await generateHashtagSuggestions(currentValue, context, userId);

    default:
      return generateGenericSuggestions(currentValue, context, historicalValues);
  }
}

function extractHistoricalValues(field: string, userHistory: Campaign[]): string[] {
  const values: string[] = [];
  
  userHistory.forEach(campaign => {
    const fieldValue = campaign[field];
    if (typeof fieldValue === 'string') {
      values.push(fieldValue);
    }

    if (campaign.content && typeof campaign.content === 'object') {
      const contentValue = campaign.content[field];
      if (typeof contentValue === 'string') {
        values.push(contentValue);
      }
    }

    if (campaign.settings && typeof campaign.settings === 'object') {
      const settingsValue = campaign.settings[field];
      if (typeof settingsValue === 'string') {
        values.push(settingsValue);
      }
    }
  });

  return [...new Set(values)].filter(v => v && v.length > 2);
}

function extractSuccessfulPatterns(field: string, successfulFeedback: Array<{ original_suggestion?: Record<string, unknown> }>): unknown[] {
  return successfulFeedback
    .filter(f => f.original_suggestion && f.original_suggestion[field])
    .map(f => f.original_suggestion[field]);
}

function generateCampaignNameSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
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

function generateDescriptionSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
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

function generateAudienceSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
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

function generateObjectiveSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
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

function generateBudgetSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
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

function generateChannelSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
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

function generateGenericSuggestions(currentValue: string, context: Record<string, unknown>, history: string[]): string[] {
  // Return most relevant historical values
  return history.slice(0, 5);
}

async function generateMentionSuggestions(currentValue: string, context: Record<string, unknown>, userId: string): Promise<string[]> {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
  const platform = context?.platform || 'twitter';

  // Query user's mention history
  const { data: mentions } = await supabase
    .from('social_mentions')
    .select('mention_handle, mention_display_name, usage_count')
    .eq('user_id', userId)
    .eq('platform', platform)
    .order('usage_count', { ascending: false })
    .limit(10);

  if (!mentions || mentions.length === 0) {
    return [];
  }

  // Filter by current input
  const filtered = mentions.filter((m: { mention_handle: string }) =>
    m.mention_handle.toLowerCase().includes(currentValue.toLowerCase())
  );

  return filtered.map((m: { mention_handle: string }) => `@${m.mention_handle}`).slice(0, 5);
}

async function generateHashtagSuggestions(currentValue: string, context: Record<string, unknown>, userId: string): Promise<string[]> {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
  const platform = context?.platform || 'twitter';
  const postContent = context?.postContent || '';

  // 1. Get user's historical hashtags (performance-sorted)
  const { data: historical } = await supabase
    .from('hashtag_suggestions')
    .select('hashtag, avg_engagement_rate')
    .eq('user_id', userId)
    .eq('platform', platform)
    .order('avg_engagement_rate', { ascending: false, nullsLast: true })
    .limit(5);

  const historicalHashtags = historical?.map((h: { hashtag: string }) => h.hashtag) || [];

  let aiHashtags: string[] = [];
  if (typeof postContent === 'string' && postContent.length > 10) {
    try {
      aiHashtags = await generateAIHashtags(postContent, platform, userId, supabase);
    } catch (error: unknown) {
      console.error('[Hashtag AI] Error generating AI hashtags:', error);
    }
  }

  // 3. Merge and deduplicate
  const allHashtags = [...historicalHashtags, ...aiHashtags];
  const unique = Array.from(new Set(allHashtags));

  // Filter by current input if provided
  if (currentValue.length > 0) {
    return unique.filter(tag =>
      tag.toLowerCase().includes(currentValue.toLowerCase())
    ).slice(0, 10);
  }

  return unique.slice(0, 10);
}

async function generateAIHashtags(
  postContent: string,
  platform: string,
  userId: string,
  supabase: SupabaseClient
): Promise<string[]> {
  // Get user's Claude API key
  const { data: secrets, error: secretError } = await supabase
    .from('user_secrets')
    .select('encrypted_value, initialization_vector')
    .eq('user_id', userId)
    .eq('service_name', 'anthropic_api_key')
    .eq('is_active', true)
    .single();

  if (secretError || !secrets) {
    console.log('[Hashtag AI] No Claude API key found for user:', secretError?.message);
    return [];
  }

  // TODO: Implement proper decryption using initialization_vector
  // For now, assuming encrypted_value can be used directly or is base64 encoded
  const apiKey = secrets.encrypted_value;

  if (!apiKey || apiKey.length < 10) {
    console.error('[Hashtag AI] Invalid API key format');
    return [];
  }

  const prompt = `Generate 5 highly relevant hashtags for this ${platform} post.

Post content:
"${postContent}"

Requirements:
- No spaces (e.g., #SocialMedia, not #Social Media)
- Mix of trending and niche hashtags
- Relevant to content and platform audience
- Include broad and specific hashtags

Return ONLY hashtags, one per line, with # symbol.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4.5',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Hashtag AI] Claude API error ${response.status}:`, errorText);

    // Handle common error cases
    if (response.status === 401) {
      throw new Error('Invalid Claude API key');
    } else if (response.status === 429) {
      throw new Error('Claude API rate limit exceeded');
    } else if (response.status >= 500) {
      throw new Error('Claude API service unavailable');
    }

    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response structure
  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    console.error('[Hashtag AI] Invalid response structure from Claude API');
    return [];
  }

  const hashtags = data.content[0].text
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.startsWith('#') && line.length > 1 && line.length < 100)
    .slice(0, 5);

  if (hashtags.length === 0) {
    console.warn('[Hashtag AI] Claude API returned no valid hashtags');
    return [];
  }

  // Store AI-generated hashtags for future use
  for (const tag of hashtags) {
    // Check if hashtag already exists
    const { data: existing } = await supabase
      .from('hashtag_suggestions')
      .select('usage_count, ai_generated')
      .eq('user_id', userId)
      .eq('hashtag', tag)
      .eq('platform', platform)
      .single()

    // If it exists and was already AI-generated, don't update it
    // If it's new or user-generated, add as AI suggestion
    if (!existing || !existing.ai_generated) {
      await supabase.from('hashtag_suggestions').upsert({
        user_id: userId,
        hashtag: tag,
        platform,
        usage_count: existing ? existing.usage_count : 0,
        ai_generated: true,
        ai_confidence_score: 0.85,
        context_keywords: extractKeywords(postContent),
        last_used_at: new Date().toISOString()
      }, { onConflict: 'user_id,hashtag,platform', ignoreDuplicates: false })
    }
  }

  return hashtags;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - split by space and filter common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10);
}