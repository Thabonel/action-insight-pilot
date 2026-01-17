import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decryption utilities for API keys
async function generateKey(): Promise<CryptoKey> {
  const masterKeyString = Deno.env.get('SECRET_MASTER_KEY');
  if (!masterKeyString || masterKeyString.length !== 64) {
    throw new Error('Master key must be 64 hex characters (32 bytes)');
  }

  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = parseInt(masterKeyString.substr(i * 2, 2), 16);
  }

  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function decryptSecret(encryptedValue: string, iv: string): Promise<string> {
  const key = await generateKey();
  const encryptedData = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivData },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decrypted);
}

interface ConversationCampaign {
  id: string;
  status: string;
  current_step: string;
  collected_data: Record<string, unknown>;
}

interface ChatContext {
  campaigns?: Record<string, unknown>[];
  autopilotConfig?: Record<string, unknown>;
  recentActivity?: Record<string, unknown>[];
  conversationCampaign?: ConversationCampaign;
}

const CAMPAIGN_CREATION_STEPS = [
  'product',
  'audience',
  'budget',
  'goals',
  'timeline',
  'review'
] as const;

type CampaignStep = typeof CAMPAIGN_CREATION_STEPS[number];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, conversationId } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sessionId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing dashboard chat query for user:', user.id);

    const enrichedContext = await enrichContext(supabase, user.id, context);

    // Check if user wants to create a campaign
    const wantsToCreateCampaign = detectCampaignCreationIntent(query);

    // Get or create conversation campaign state
    let conversationCampaign = await getConversationCampaign(supabase, user.id, sessionId);

    // If user wants to create a campaign and no conversation exists, start one
    if (wantsToCreateCampaign && !conversationCampaign) {
      conversationCampaign = await createConversationCampaign(supabase, user.id, sessionId);
      enrichedContext.conversationCampaign = conversationCampaign;
    } else if (conversationCampaign && conversationCampaign.status === 'collecting_info') {
      // Update conversation with user response
      conversationCampaign = await updateConversationWithResponse(
        supabase,
        conversationCampaign,
        query
      );
      enrichedContext.conversationCampaign = conversationCampaign;
    }

    // Query for API keys - prefer Anthropic, fallback to Gemini
    const { data: apiKeys, error: keyError } = await supabase
      .from('user_secrets')
      .select('encrypted_value, initialization_vector, service_name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('service_name', ['Anthropic', 'Gemini']);

    if (keyError || !apiKeys || apiKeys.length === 0) {
      console.error('API key query error:', keyError);
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          message: 'Please add your Anthropic Claude or Gemini API key in Settings > Integrations to enable AI chat.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-type': 'application/json' } }
      );
    }

    // Prefer Anthropic Claude, fallback to Gemini
    const apiKeyData = apiKeys.find(k => k.service_name === 'Anthropic')
      || apiKeys.find(k => k.service_name === 'Gemini');

    if (!apiKeyData) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          message: 'Please add your Anthropic Claude or Gemini API key in Settings > Integrations to enable AI chat.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-type': 'application/json' } }
      );
    }

    console.log('Using AI service:', apiKeyData.service_name);

    // Decrypt the API key
    let decryptedApiKey: string;
    try {
      decryptedApiKey = await decryptSecret(apiKeyData.encrypted_value, apiKeyData.initialization_vector);
    } catch (decryptError) {
      console.error('Failed to decrypt API key:', decryptError);
      return new Response(
        JSON.stringify({
          error: 'API key decryption failed',
          message: 'There was an issue with your API key. Please re-enter it in Settings > Integrations.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt(enrichedContext);
    const userPrompt = buildUserPrompt(query, enrichedContext);

    let aiResponse: string;

    if (apiKeyData.service_name === 'Anthropic') {
      aiResponse = await callClaude(decryptedApiKey, systemPrompt, userPrompt);
    } else {
      aiResponse = await callGemini(decryptedApiKey, systemPrompt, userPrompt);
    }

    const actionSuggestions = detectActions(query, aiResponse);

    // Check if we need to create the campaign
    let createdCampaign = null;
    if (
      conversationCampaign &&
      conversationCampaign.status === 'collecting_info' &&
      conversationCampaign.current_step === 'review' &&
      isConfirmation(query)
    ) {
      // User confirmed, create and launch campaign
      createdCampaign = await createAndLaunchCampaign(
        supabase,
        user.id,
        conversationCampaign
      );

      if (createdCampaign) {
        await supabase
          .from('conversation_campaigns')
          .update({
            status: 'completed',
            campaign_id: createdCampaign.id,
            completed_at: new Date().toISOString()
          })
          .eq('id', conversationCampaign.id);
      }
    }

    console.log('Successfully processed dashboard chat query');

    return new Response(
      JSON.stringify({
        message: aiResponse,
        suggestions: actionSuggestions,
        success: true,
        conversationId: sessionId,
        campaignCreated: createdCampaign ? true : false,
        campaignId: createdCampaign?.id || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('dashboard-chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Failed to process chat'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper Functions for Conversational Campaign Creation

function detectCampaignCreationIntent(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const triggers = [
    'create campaign',
    'new campaign',
    'make campaign',
    'start campaign',
    'set up campaign',
    'launch campaign',
    'need to market',
    'want to advertise',
    'promote my',
    'market my product',
    'market my service',
    'help me advertise'
  ];

  return triggers.some(trigger => lowerQuery.includes(trigger));
}

async function getConversationCampaign(
  supabase: Record<string, unknown>,
  userId: string,
  conversationId: string
): Promise<ConversationCampaign | null> {
  const { data, error } = await supabase
    .from('conversation_campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .eq('status', 'collecting_info')
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    status: data.status,
    current_step: data.current_step,
    collected_data: data.collected_data || {}
  };
}

async function createConversationCampaign(
  supabase: Record<string, unknown>,
  userId: string,
  conversationId: string
): Promise<ConversationCampaign> {
  const { data, error } = await supabase
    .from('conversation_campaigns')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      status: 'collecting_info',
      current_step: 'product',
      collected_data: {}
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    status: data.status,
    current_step: data.current_step,
    collected_data: data.collected_data || {}
  };
}

async function updateConversationWithResponse(
  supabase: Record<string, unknown>,
  conversation: Record<string, unknown>,
  userResponse: string
): Promise<ConversationCampaign> {
  const currentStep = conversation.current_step;
  const collectedData = { ...conversation.collected_data };

  // Extract information based on current step
  switch (currentStep) {
    case 'product':
      collectedData.product = userResponse.trim();
      break;
    case 'audience':
      collectedData.audience = userResponse.trim();
      break;
    case 'budget': {
      const budgetMatch = userResponse.match(/(\d+)/);
      collectedData.budget = budgetMatch ? parseInt(budgetMatch[1]) : 500;
      break;
    }
    case 'goals':
      collectedData.goals = userResponse.trim();
      break;
    case 'timeline':
      collectedData.timeline = userResponse.trim();
      break;
  }

  // Determine next step
  const currentIndex = CAMPAIGN_CREATION_STEPS.indexOf(currentStep as CampaignStep);
  const nextStep = CAMPAIGN_CREATION_STEPS[currentIndex + 1] || 'review';

  // Update database
  const { data, error } = await supabase
    .from('conversation_campaigns')
    .update({
      current_step: nextStep,
      collected_data: collectedData
    })
    .eq('id', conversation.id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    status: data.status,
    current_step: data.current_step,
    collected_data: data.collected_data || {}
  };
}

function isConfirmation(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  const confirmations = [
    'yes',
    'yeah',
    'yep',
    'sure',
    'ok',
    'okay',
    'confirm',
    'looks good',
    'perfect',
    'go ahead',
    'do it',
    'create it',
    'launch it'
  ];

  return confirmations.some(confirmation => lowerQuery.includes(confirmation));
}

async function createAndLaunchCampaign(
  supabase: Record<string, unknown>,
  userId: string,
  conversation: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const data = conversation.collected_data;

  // Determine campaign type and channels based on goals and budget
  const budget = data.budget || 500;
  let channels: string[] = [];
  const type = 'digital';

  if (budget < 300) {
    channels = ['social'];
  } else if (budget < 1000) {
    channels = ['social', 'email'];
  } else {
    channels = ['social', 'email', 'content'];
  }

  // Create campaign object
  const campaignData = {
    name: `${data.product} Campaign`,
    description: `AI-generated campaign for ${data.product} targeting ${data.audience}`,
    type,
    channel: channels[0],
    status: 'active',
    target_audience: data.audience || 'General audience',
    primary_objective: data.goals || 'Increase brand awareness and generate leads',
    total_budget: budget,
    budget_allocated: budget,
    budget_spent: 0,
    start_date: new Date().toISOString(),
    end_date: getEndDate(data.timeline),
    channels,
    demographics: {
      ageRange: '25-54',
      location: 'United States',
      interests: data.product || ''
    },
    content: {
      valueProposition: `High-quality ${data.product}`,
      keyMessages: [`${data.product} for ${data.audience}`],
      contentStrategy: 'Educational and engaging content'
    },
    settings: {
      audienceSegments: [data.audience || 'General'],
      channelStrategy: `Multi-channel approach using ${channels.join(', ')}`,
      contentTypes: ['social posts', 'email campaigns']
    },
    metrics: {
      reach: 0,
      conversion_rate: 0,
      impressions: 0,
      clicks: 0,
      engagement_rate: 0,
      cost_per_click: 0,
      cost_per_acquisition: 0,
      revenue_generated: 0
    },
    created_by: userId
  };

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert([campaignData])
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }

  console.log('Campaign created and launched:', campaign.id);

  return campaign;
}

function getEndDate(timeline?: string): string {
  const now = new Date();
  let daysToAdd = 30;

  if (timeline) {
    const lowerTimeline = timeline.toLowerCase();
    if (lowerTimeline.includes('week')) {
      daysToAdd = 7;
    } else if (lowerTimeline.includes('month') || lowerTimeline.includes('30')) {
      daysToAdd = 30;
    } else if (lowerTimeline.includes('quarter') || lowerTimeline.includes('90')) {
      daysToAdd = 90;
    }
  }

  const endDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return endDate.toISOString();
}

async function enrichContext(supabase: Record<string, unknown>, userId: string, providedContext?: Record<string, unknown>): Promise<ChatContext> {
  const context: ChatContext = {};

  try {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, type, status, total_budget, budget_allocated, budget_spent, start_date, end_date, metrics')
      .eq('created_by', userId)
      .eq('status', 'active')
      .limit(10);

    context.campaigns = campaigns || [];

    const { data: autopilotConfig } = await supabase
      .from('marketing_autopilot_config')
      .select('business_description, target_audience, ai_strategy, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    context.autopilotConfig = autopilotConfig;

    const { data: recentActivity } = await supabase
      .from('autopilot_activity_log')
      .select('activity_type, activity_description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    context.recentActivity = recentActivity || [];
  } catch (error: unknown) {
    console.error('Error enriching context:', error);
  }

  return context;
}

function buildSystemPrompt(context: ChatContext): string {
  const activeCampaigns = context.campaigns?.length || 0;
  const autopilotEnabled = context.autopilotConfig?.is_active || false;
  const businessDesc = context.autopilotConfig?.business_description || 'your business';
  const conversationCampaign = context.conversationCampaign;

  // If in campaign creation mode, provide guided prompts
  if (conversationCampaign && conversationCampaign.status === 'collecting_info') {
    const step = conversationCampaign.current_step;
    const collectedData = conversationCampaign.collected_data;

    let stepInstruction = '';

    switch (step) {
      case 'product':
        stepInstruction = `Ask the user: "What product or service do you want to promote?" Be friendly and conversational.`;
        break;
      case 'audience':
        stepInstruction = `The user is promoting: ${collectedData.product}. Now ask: "Who is your ideal customer or target audience?" Be specific and helpful.`;
        break;
      case 'budget':
        stepInstruction = `Product: ${collectedData.product}, Audience: ${collectedData.audience}. Now ask: "What's your monthly marketing budget?" Suggest a range like $300-$1000 if they're unsure.`;
        break;
      case 'goals':
        stepInstruction = `Ask: "What's your main goal for this campaign?" Provide examples like: generate leads, increase sales, build brand awareness, drive website traffic.`;
        break;
      case 'timeline':
        stepInstruction = `Ask: "How long would you like to run this campaign?" Suggest options: 1 week, 1 month, or 3 months.`;
        break;
      case 'review':
        stepInstruction = `Present a friendly summary of the campaign you'll create:
- Product/Service: ${collectedData.product}
- Target Audience: ${collectedData.audience}
- Budget: $${collectedData.budget}/month
- Goal: ${collectedData.goals}
- Duration: ${collectedData.timeline}
- Channels: ${getBudgetChannels(collectedData.budget || 500)}

Then ask: "Does this look good? I'll create and launch this campaign right away!" Be enthusiastic and supportive.`;
        break;
    }

    return `You are a friendly AI Marketing Assistant helping a non-marketer create their first campaign.

CURRENT TASK: Guiding user through campaign creation
CURRENT STEP: ${step}

INSTRUCTIONS:
${stepInstruction}

TONE:
- Warm, friendly, and encouraging
- Simple language (user knows nothing about marketing)
- One question at a time
- Acknowledge their answer before asking next question
- Be enthusiastic about helping them succeed

Remember: This user is new to marketing. Make them feel confident and supported.`;
  }

  // Normal conversation mode (not creating campaign)
  return `You are the AI Marketing Assistant for Action Insight Marketing Platform.

PLATFORM CONTEXT:
- User is managing ${activeCampaigns} active campaign(s)
- Marketing Autopilot: ${autopilotEnabled ? 'ENABLED' : 'DISABLED'}
- Business: ${businessDesc}
${context.autopilotConfig?.target_audience ? `- Target Audience: ${context.autopilotConfig.target_audience}` : ''}

YOUR CAPABILITIES:
- Analyze campaign performance and provide insights
- Recommend optimizations for budget, targeting, and content
- Help create new campaigns through guided conversation
- Answer questions about marketing automation
- Provide strategic marketing advice

GUIDELINES:
- Be conversational and helpful, not generic or robotic
- When user wants to create a campaign, guide them through simple questions
- Reference specific campaigns when relevant
- Focus on actionable advice that drives business results
- If you don't have specific data, acknowledge it honestly

CURRENT DATA AVAILABLE:
${context.campaigns && context.campaigns.length > 0 ? `
Active Campaigns:
${context.campaigns.map(c => `- ${c.name} (${c.type}): $${c.budget_spent || 0}/$${c.budget_allocated || 0} spent`).join('\n')}
` : 'No active campaigns yet.'}

${context.recentActivity && context.recentActivity.length > 0 ? `
Recent Activity:
${context.recentActivity.map(a => `- ${a.activity_type}: ${a.activity_description}`).join('\n')}
` : ''}

Remember: You're part of an intelligent marketing automation platform. Help users succeed with their marketing goals.`;
}

function getBudgetChannels(budget: number): string {
  if (budget < 300) return 'Social Media';
  if (budget < 1000) return 'Social Media + Email';
  return 'Social Media + Email + Content Marketing';
}

function buildUserPrompt(query: string, context: ChatContext): string {
  return query;
}

async function callClaude(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser Query: ${userPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
}

function detectActions(query: string, response: string): string[] {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  if (queryLower.includes('create') || queryLower.includes('new campaign')) {
    suggestions.push('Create a new campaign');
  }

  if (queryLower.includes('content') || queryLower.includes('generate')) {
    suggestions.push('Generate marketing content');
  }

  if (queryLower.includes('performance') || queryLower.includes('analytics')) {
    suggestions.push('View detailed analytics');
  }

  if (queryLower.includes('optimize') || queryLower.includes('improve')) {
    suggestions.push('Get optimization recommendations');
  }

  if (suggestions.length === 0) {
    suggestions.push('Tell me more about my campaigns');
    suggestions.push('Help me create new content');
    suggestions.push('Show me performance insights');
  }

  return suggestions.slice(0, 3);
}
