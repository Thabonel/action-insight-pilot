import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decryption utilities for API keys
async function generateKey(): Promise<CryptoKey> {
  console.log('[DEBUG] generateKey: Checking SECRET_MASTER_KEY...');
  const masterKeyString = Deno.env.get('SECRET_MASTER_KEY');
  if (!masterKeyString) {
    console.error('[DEBUG] generateKey: SECRET_MASTER_KEY is not set!');
    throw new Error('Master key must be 64 hex characters (32 bytes)');
  }
  if (masterKeyString.length !== 64) {
    console.error('[DEBUG] generateKey: SECRET_MASTER_KEY wrong length:', masterKeyString.length, 'expected: 64');
    throw new Error('Master key must be 64 hex characters (32 bytes)');
  }
  console.log('[DEBUG] generateKey: SECRET_MASTER_KEY is valid (64 chars)');

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
  console.log('[DEBUG] decryptSecret: Starting decryption...');
  console.log('[DEBUG] decryptSecret: Encrypted value length:', encryptedValue?.length || 0);
  console.log('[DEBUG] decryptSecret: IV length:', iv?.length || 0);

  const key = await generateKey();
  console.log('[DEBUG] decryptSecret: CryptoKey generated successfully');

  try {
    const encryptedData = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    console.log('[DEBUG] decryptSecret: Encrypted data decoded, bytes:', encryptedData.length);

    const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    console.log('[DEBUG] decryptSecret: IV decoded, bytes:', ivData.length);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivData },
      key,
      encryptedData
    );
    console.log('[DEBUG] decryptSecret: Decryption successful, result bytes:', decrypted.byteLength);

    const result = new TextDecoder().decode(decrypted);
    console.log('[DEBUG] decryptSecret: Text decoded, length:', result.length);
    return result;
  } catch (decryptError) {
    console.error('[DEBUG] decryptSecret: Decryption failed!');
    console.error('[DEBUG] decryptSecret: Error name:', decryptError?.name);
    console.error('[DEBUG] decryptSecret: Error message:', decryptError?.message);
    throw decryptError;
  }
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
    console.log('[DEBUG] ========================================');
    console.log('[DEBUG] dashboard-chat: New request received');
    console.log('[DEBUG] Timestamp:', new Date().toISOString());

    const { query, context, conversationId } = await req.json();
    console.log('[DEBUG] Request parsed successfully');
    console.log('[DEBUG] Query length:', query?.length || 0);

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
      .in('service_name', ['anthropic_api_key', 'gemini_api_key_encrypted']);

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
    const apiKeyData = apiKeys.find(k => k.service_name === 'anthropic_api_key')
      || apiKeys.find(k => k.service_name === 'gemini_api_key_encrypted');

    if (!apiKeyData) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          message: 'Please add your Anthropic Claude or Gemini API key in Settings > Integrations to enable AI chat.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-type': 'application/json' } }
      );
    }

    console.log('[DEBUG] Using AI service:', apiKeyData.service_name);
    console.log('[DEBUG] API key data found:');
    console.log('[DEBUG]   - encrypted_value exists:', !!apiKeyData.encrypted_value);
    console.log('[DEBUG]   - encrypted_value length:', apiKeyData.encrypted_value?.length || 0);
    console.log('[DEBUG]   - initialization_vector exists:', !!apiKeyData.initialization_vector);
    console.log('[DEBUG]   - initialization_vector length:', apiKeyData.initialization_vector?.length || 0);

    // Decrypt the API key
    let decryptedApiKey: string;
    try {
      console.log('[DEBUG] Starting decryption process...');
      decryptedApiKey = await decryptSecret(apiKeyData.encrypted_value, apiKeyData.initialization_vector);
      console.log('[DEBUG] API key decrypted successfully!');
      console.log('[DEBUG]   - Decrypted key length:', decryptedApiKey.length);

      // Validate API key format
      if (apiKeyData.service_name === 'anthropic_api_key') {
        const isValidFormat = decryptedApiKey.startsWith('sk-ant-');
        console.log('[DEBUG]   - Anthropic key format valid (starts with sk-ant-):', isValidFormat);
        console.log('[DEBUG]   - Key prefix:', decryptedApiKey.substring(0, 10) + '...');
        if (!isValidFormat) {
          console.warn('[DEBUG] WARNING: Anthropic key does not start with sk-ant-');
        }
      } else {
        console.log('[DEBUG]   - Gemini key prefix:', decryptedApiKey.substring(0, 6) + '...');
      }
    } catch (decryptError) {
      console.error('[DEBUG] DECRYPTION FAILED!');
      console.error('[DEBUG] Error details:', {
        name: decryptError?.name,
        message: decryptError?.message,
        stack: decryptError?.stack
      });
      return new Response(
        JSON.stringify({
          error: 'API key decryption failed',
          message: 'There was an issue with your API key. Please re-enter it in Settings > Integrations.',
          debug: { errorName: decryptError?.name, errorMessage: decryptError?.message }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt(enrichedContext);
    const userPrompt = buildUserPrompt(query, enrichedContext);
    console.log('[DEBUG] Prompts built successfully');

    let aiResponse: string;

    console.log('[DEBUG] About to call AI API...');
    console.log('[DEBUG] Service:', apiKeyData.service_name === 'anthropic_api_key' ? 'Claude (Anthropic)' : 'Gemini (Google)');

    if (apiKeyData.service_name === 'anthropic_api_key') {
      console.log('[DEBUG] Calling Claude API...');
      aiResponse = await callClaude(decryptedApiKey, systemPrompt, userPrompt);
      console.log('[DEBUG] Claude API call completed successfully');
    } else {
      console.log('[DEBUG] Calling Gemini API...');
      aiResponse = await callGemini(decryptedApiKey, systemPrompt, userPrompt);
      console.log('[DEBUG] Gemini API call completed successfully');
    }
    console.log('[DEBUG] AI response length:', aiResponse?.length || 0);

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

    console.log('[DEBUG] ========================================');
    console.log('[DEBUG] SUCCESS! Chat query processed completely');
    console.log('[DEBUG] Response ready to send');
    console.log('[DEBUG] ========================================');

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
    console.error('[DEBUG] MAIN ERROR HANDLER CAUGHT EXCEPTION!');
    console.error('[DEBUG] Error type:', typeof error);
    console.error('[DEBUG] Error name:', error instanceof Error ? error.name : 'N/A');
    console.error('[DEBUG] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('[DEBUG] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error || {})));

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    // Categorize the error for better debugging
    let errorCode = 'UNKNOWN_ERROR';
    let userMessage = 'An unexpected error occurred. Please try again.';

    if (errorMessage.includes('SECRET_MASTER_KEY')) {
      errorCode = 'SECRET_KEY_ERROR';
      userMessage = 'Server configuration issue. Please contact support.';
    } else if (errorMessage.includes('Decryption failed') || errorName === 'OperationError') {
      errorCode = 'DECRYPTION_FAILED';
      userMessage = 'Unable to decrypt your API key. Please re-save it in Settings.';
    } else if (errorMessage.includes('Claude API error: 401')) {
      errorCode = 'CLAUDE_AUTH_ERROR';
      userMessage = 'Your Claude API key is invalid. Please check and update it in Settings.';
    } else if (errorMessage.includes('Claude API error: 429')) {
      errorCode = 'CLAUDE_RATE_LIMIT';
      userMessage = 'Rate limit reached. Please wait a moment and try again.';
    } else if (errorMessage.includes('Claude API error')) {
      errorCode = 'CLAUDE_API_ERROR';
      userMessage = 'Error communicating with Claude API.';
    } else if (errorMessage.includes('Gemini API error')) {
      errorCode = 'GEMINI_API_ERROR';
      userMessage = 'Error communicating with Gemini API.';
    }

    return new Response(
      JSON.stringify({
        error: errorCode,
        message: userMessage,
        debug: {
          errorName,
          errorMessage,
          errorType: typeof error,
          timestamp: new Date().toISOString()
        }
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
  console.log('[DEBUG] callClaude: Starting Claude API call...');
  console.log('[DEBUG] callClaude: API key length:', apiKey?.length || 0);
  console.log('[DEBUG] callClaude: API key prefix:', apiKey?.substring(0, 10) + '...');
  console.log('[DEBUG] callClaude: System prompt length:', systemPrompt?.length || 0);
  console.log('[DEBUG] callClaude: User prompt length:', userPrompt?.length || 0);

  // Use explicit model version for reliability
  const model = 'claude-sonnet-4-5-20250929';
  console.log('[DEBUG] callClaude: Using model:', model);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    console.log('[DEBUG] callClaude: Response received');
    console.log('[DEBUG] callClaude: Status:', response.status);
    console.log('[DEBUG] callClaude: Status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] callClaude: API ERROR!');
      console.error('[DEBUG] callClaude: Status:', response.status);
      console.error('[DEBUG] callClaude: Error body:', errorText);

      // Parse error for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('[DEBUG] callClaude: Error type:', errorJson?.error?.type);
        console.error('[DEBUG] callClaude: Error message:', errorJson?.error?.message);
      } catch {
        // Not JSON, that's ok
      }

      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] callClaude: Response parsed successfully');
    console.log('[DEBUG] callClaude: Response has content:', !!data.content);
    console.log('[DEBUG] callClaude: Content length:', data.content?.[0]?.text?.length || 0);

    return data.content?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
  } catch (fetchError) {
    console.error('[DEBUG] callClaude: FETCH ERROR!');
    console.error('[DEBUG] callClaude: Error name:', fetchError?.name);
    console.error('[DEBUG] callClaude: Error message:', fetchError?.message);
    console.error('[DEBUG] callClaude: Error stack:', fetchError?.stack);
    throw fetchError;
  }
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  console.log('[DEBUG] callGemini: Starting Gemini API call...');
  console.log('[DEBUG] callGemini: API key length:', apiKey?.length || 0);
  console.log('[DEBUG] callGemini: API key prefix:', apiKey?.substring(0, 6) + '...');

  const model = 'gemini-2.5-flash';
  console.log('[DEBUG] callGemini: Using model:', model);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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

    console.log('[DEBUG] callGemini: Response received');
    console.log('[DEBUG] callGemini: Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] callGemini: API ERROR!');
      console.error('[DEBUG] callGemini: Status:', response.status);
      console.error('[DEBUG] callGemini: Error body:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] callGemini: Response parsed successfully');
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
  } catch (fetchError) {
    console.error('[DEBUG] callGemini: FETCH ERROR!');
    console.error('[DEBUG] callGemini: Error name:', fetchError?.name);
    console.error('[DEBUG] callGemini: Error message:', fetchError?.message);
    throw fetchError;
  }
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
