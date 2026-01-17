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
  conversation_history?: string;
}

interface ChatContext {
  campaigns?: Record<string, unknown>[];
  autopilotConfig?: Record<string, unknown>;
  recentActivity?: Record<string, unknown>[];
  conversationCampaign?: ConversationCampaign;
  conversationHistory?: string;
}

interface ExtractedCampaignData {
  product: string;
  audience: string;
  budget: number;
  goals: string;
  timeline: string;
  channels: string[];
  keyMessages: string[];
  strategy: string;
  sprints?: Array<{
    name: string;
    duration: string;
    goals: string;
    tactics: string[];
    budget: number;
  }>;
}

interface CompletenessCheck {
  isComplete: boolean;
  score: number;
  missingFields: string[];
  presentFields: string[];
}

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

    // Fetch conversation history for this session
    const conversationHistory = await getConversationHistory(supabase, sessionId);

    const enrichedContext = await enrichContext(supabase, user.id, context);
    enrichedContext.conversationHistory = conversationHistory;

    // Detect campaign-related intents
    const wantsToCreateCampaign = detectCampaignCreationIntent(query);
    const wantsToImplementPlan = detectImplementationIntent(query);

    // Get existing conversation campaign state
    let conversationCampaign = await getConversationCampaign(supabase, user.id, sessionId);

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

    let aiResponse: string;
    let createdCampaign: Record<string, unknown> | null = null;

    // Check conversation completeness to enable proactive campaign creation
    const completeness = conversationHistory ? checkConversationCompleteness(conversationHistory) : { isComplete: false, score: 0, missingFields: [], presentFields: [] };
    const hasSubstantialConversation = conversationHistory && conversationHistory.length > 500;

    // Check if user wants to implement a campaign plan from the conversation
    if (wantsToImplementPlan && hasSubstantialConversation) {
      console.log('User wants to implement campaign plan from conversation');

      // Use AI to extract campaign data from the conversation
      const extractedData = await extractCampaignDataFromConversation(
        decryptedApiKey,
        conversationHistory,
        query,
        apiKeyData.service_name === 'anthropic_api_key'
      );

      if (extractedData && extractedData.product) {
        // Create the campaign with extracted data
        createdCampaign = await createCampaignFromExtractedData(
          supabase,
          user.id,
          extractedData
        );

        if (createdCampaign) {
          // Save or update conversation campaign record
          await saveConversationCampaign(
            supabase,
            user.id,
            sessionId,
            extractedData,
            createdCampaign.id as string
          );

          // Generate success response
          aiResponse = generateCampaignCreatedResponse(extractedData, createdCampaign);
        } else {
          aiResponse = "I encountered an issue creating the campaign. Let me know if you'd like to try again or adjust any details.";
        }
      } else {
        // Couldn't extract enough data, ask for clarification
        aiResponse = await generateClarificationResponse(
          decryptedApiKey,
          conversationHistory,
          query,
          apiKeyData.service_name === 'anthropic_api_key'
        );
      }
    } else if (wantsToCreateCampaign && !conversationCampaign) {
      // User wants to create a campaign - start strategic conversation
      conversationCampaign = await createConversationCampaign(supabase, user.id, sessionId);
      enrichedContext.conversationCampaign = conversationCampaign;

      const systemPrompt = buildStrategicSystemPrompt(enrichedContext);
      const userPrompt = buildUserPrompt(query, enrichedContext);

      if (apiKeyData.service_name === 'anthropic_api_key') {
        aiResponse = await callClaude(decryptedApiKey, systemPrompt, userPrompt);
      } else {
        aiResponse = await callGemini(decryptedApiKey, systemPrompt, userPrompt);
      }
    } else {
      // Normal conversation - strategic marketing discussion
      // Include completeness awareness in the system prompt
      const systemPrompt = buildSystemPrompt(enrichedContext, completeness);
      const userPrompt = buildUserPrompt(query, enrichedContext);

      if (apiKeyData.service_name === 'anthropic_api_key') {
        aiResponse = await callClaude(decryptedApiKey, systemPrompt, userPrompt);
      } else {
        aiResponse = await callGemini(decryptedApiKey, systemPrompt, userPrompt);
      }

      // If conversation is complete enough, append a proactive offer
      if (completeness.isComplete && hasSubstantialConversation && !aiResponse.includes('create the campaign')) {
        aiResponse += `\n\n---\n\nI've gathered enough information to create your campaign now. Would you like me to go ahead and set it up? Just say **"yes"** or **"create the campaign"** and I'll put this plan into action.`;
      }
    }

    // Save this exchange to conversation history
    await saveConversationMessage(supabase, sessionId, user.id, query, aiResponse);

    const actionSuggestions = detectActions(query, aiResponse, createdCampaign !== null);

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
        message: error instanceof Error ? error.message : 'Failed to process chat'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper Functions

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
    'help me advertise',
    'help me create my first'
  ];

  return triggers.some(trigger => lowerQuery.includes(trigger));
}

function detectImplementationIntent(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const triggers = [
    'implement this',
    'implement it',
    'create it now',
    'launch it',
    'do it',
    'do your thing',
    'make it happen',
    'execute this',
    'execute the plan',
    'create the campaign',
    'set it up',
    'let\'s do it',
    'go ahead',
    'proceed',
    'start the campaign',
    'can you now implement',
    'now implement',
    'create a new campaign',  // When said after planning
    'yes',  // Affirmative response to "should I create this?"
    'yes please',
    'yes go ahead',
    'sounds good',
    'that sounds good',
    'looks good',
    'perfect',
    'do it',
    'make it so'
  ];

  return triggers.some(trigger => lowerQuery.includes(trigger));
}

// Check how complete the campaign data is from conversation
function checkConversationCompleteness(conversationHistory: string): CompletenessCheck {
  const check: CompletenessCheck = {
    isComplete: false,
    score: 0,
    missingFields: [],
    presentFields: []
  };

  const lowerHistory = conversationHistory.toLowerCase();

  // Check for product/service (required)
  const hasProduct = /(?:product|service|sell|offer|business|company|app|platform|tool|software)/i.test(lowerHistory);
  if (hasProduct) {
    check.presentFields.push('product');
    check.score += 25;
  } else {
    check.missingFields.push('product');
  }

  // Check for audience (required)
  const hasAudience = /(?:audience|target|customer|user|people|demographic|market|segment|who)/i.test(lowerHistory);
  if (hasAudience) {
    check.presentFields.push('audience');
    check.score += 25;
  } else {
    check.missingFields.push('audience');
  }

  // Check for budget (optional but valuable)
  const hasBudget = /(?:\$|dollar|budget|spend|cost|price|investment|\d{2,})/i.test(lowerHistory);
  if (hasBudget) {
    check.presentFields.push('budget');
    check.score += 20;
  } else {
    check.missingFields.push('budget');
  }

  // Check for goals (required)
  const hasGoals = /(?:goal|objective|aim|want to|trying to|increase|grow|generate|leads|sales|awareness|revenue|conversion)/i.test(lowerHistory);
  if (hasGoals) {
    check.presentFields.push('goals');
    check.score += 20;
  } else {
    check.missingFields.push('goals');
  }

  // Check for channels (optional but valuable)
  const hasChannels = /(?:channel|social|email|content|reddit|twitter|linkedin|facebook|instagram|youtube|ads|seo)/i.test(lowerHistory);
  if (hasChannels) {
    check.presentFields.push('channels');
    check.score += 10;
  }

  // Consider complete if score >= 70 (has at least product + audience + goals or budget)
  check.isComplete = check.score >= 70;

  return check;
}

async function getConversationHistory(
  supabase: ReturnType<typeof createClient>,
  conversationId: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('user_message, ai_response, created_at')
      .eq('session_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (error || !data || data.length === 0) {
      return '';
    }

    return data.map(msg => {
      const response = typeof msg.ai_response === 'object'
        ? (msg.ai_response as Record<string, unknown>).response || JSON.stringify(msg.ai_response)
        : msg.ai_response;
      return `User: ${msg.user_message}\n\nAssistant: ${response}`;
    }).join('\n\n---\n\n');
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return '';
  }
}

async function saveConversationMessage(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  try {
    await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        user_message: userMessage,
        ai_response: { response: aiResponse },
        message_type: 'general'
      });
  } catch (error) {
    console.error('Error saving conversation message:', error);
  }
}

async function extractCampaignDataFromConversation(
  apiKey: string,
  conversationHistory: string,
  currentQuery: string,
  isAnthropic: boolean
): Promise<ExtractedCampaignData | null> {
  const extractionPrompt = `You are a data extraction assistant. Analyze this marketing conversation and extract structured campaign data.

CONVERSATION HISTORY:
${conversationHistory}

CURRENT USER REQUEST: ${currentQuery}

Extract the following campaign information from the conversation. Be thorough - the user provided detailed information during the planning discussion.

Return ONLY a valid JSON object with this structure (no markdown, no explanation):
{
  "product": "The product or service being marketed",
  "audience": "Target audience description",
  "budget": 1000,
  "goals": "Primary campaign goals",
  "timeline": "Campaign duration (e.g., '90 days', '3 months')",
  "channels": ["channel1", "channel2"],
  "keyMessages": ["message1", "message2"],
  "strategy": "Overall strategy summary",
  "sprints": [
    {
      "name": "Sprint 1 Name",
      "duration": "Days 1-30",
      "goals": "Sprint goals",
      "tactics": ["tactic1", "tactic2"],
      "budget": 200
    }
  ]
}

Rules:
- Extract actual values mentioned in the conversation
- If budget is mentioned in AUD or another currency, convert to USD equivalent or note the currency
- Include all channels mentioned (reddit, twitter, linkedin, email, content marketing, etc.)
- Capture the sprint/phase structure if mentioned
- For timeline, use the total campaign duration
- Return ONLY the JSON, no other text`;

  try {
    let response: Response;

    if (isAnthropic) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          messages: [{ role: 'user', content: extractionPrompt }],
          temperature: 0.1,  // Low temperature for structured extraction
        }),
      });
    } else {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: extractionPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
        }),
      });
    }

    if (!response.ok) {
      console.error('Extraction API error:', response.status);
      return null;
    }

    const data = await response.json();
    let extractedText: string;

    if (isAnthropic) {
      extractedText = data.content?.[0]?.text || '';
    } else {
      extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // Clean and parse JSON
    extractedText = extractedText.trim();
    if (extractedText.startsWith('```json')) {
      extractedText = extractedText.slice(7);
    }
    if (extractedText.startsWith('```')) {
      extractedText = extractedText.slice(3);
    }
    if (extractedText.endsWith('```')) {
      extractedText = extractedText.slice(0, -3);
    }
    extractedText = extractedText.trim();

    const extracted = JSON.parse(extractedText) as ExtractedCampaignData;

    // Validate required fields
    if (!extracted.product || extracted.product === 'The product or service being marketed') {
      return null;
    }

    return extracted;
  } catch (error) {
    console.error('Error extracting campaign data:', error);
    return null;
  }
}

async function generateClarificationResponse(
  apiKey: string,
  conversationHistory: string,
  currentQuery: string,
  isAnthropic: boolean
): Promise<string> {
  const clarificationPrompt = `The user wants to create a campaign but I need more information. Based on this conversation, what key details are missing?

CONVERSATION:
${conversationHistory}

USER REQUEST: ${currentQuery}

Generate a friendly response that:
1. Acknowledges their request to create/implement the campaign
2. Lists what information you DO have from the conversation
3. Asks for any critical missing details (product, audience, budget, or goals)
4. Keeps it conversational and helpful

If enough information exists to create a basic campaign, offer to proceed with reasonable defaults for missing items.`;

  try {
    let response: Response;

    if (isAnthropic) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1000,
          messages: [{ role: 'user', content: clarificationPrompt }],
          temperature: 0.7,
        }),
      });
    } else {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: clarificationPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      });
    }

    if (!response.ok) {
      return "I'd love to help create your campaign! Could you tell me more about what product or service you want to promote, who your target audience is, and your approximate budget?";
    }

    const data = await response.json();

    if (isAnthropic) {
      return data.content?.[0]?.text || "Let me help you create a campaign. What would you like to promote?";
    } else {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Let me help you create a campaign. What would you like to promote?";
    }
  } catch (error) {
    console.error('Error generating clarification:', error);
    return "I'd be happy to create your campaign! Could you share some details about what you're promoting and who you want to reach?";
  }
}

async function createCampaignFromExtractedData(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data: ExtractedCampaignData
): Promise<Record<string, unknown> | null> {
  try {
    const budget = data.budget || 500;
    const channels = data.channels && data.channels.length > 0
      ? data.channels
      : determineChannelsFromBudget(budget);

    const campaignData = {
      name: `${data.product} Campaign`,
      description: data.strategy || `AI-generated campaign for ${data.product} targeting ${data.audience}`,
      type: 'digital',
      channel: channels[0] || 'social',
      status: 'active',
      target_audience: data.audience || 'General audience',
      primary_objective: data.goals || 'Increase brand awareness and generate leads',
      total_budget: budget,
      budget_allocated: budget,
      budget_spent: 0,
      start_date: new Date().toISOString(),
      end_date: calculateEndDate(data.timeline),
      channels,
      demographics: {
        ageRange: '25-54',
        location: 'Global',
        interests: data.product
      },
      content: {
        valueProposition: data.keyMessages?.[0] || `High-quality ${data.product}`,
        keyMessages: data.keyMessages || [`${data.product} for ${data.audience}`],
        contentStrategy: data.strategy || 'Multi-channel marketing approach'
      },
      settings: {
        audienceSegments: [data.audience],
        channelStrategy: `Multi-channel approach using ${channels.join(', ')}`,
        contentTypes: determineContentTypes(channels),
        sprints: data.sprints || null
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
      return null;
    }

    console.log('Campaign created from extracted data:', campaign.id);
    return campaign;
  } catch (error) {
    console.error('Error in createCampaignFromExtractedData:', error);
    return null;
  }
}

function generateCampaignCreatedResponse(data: ExtractedCampaignData, campaign: Record<string, unknown>): string {
  const sprintSummary = data.sprints && data.sprints.length > 0
    ? `\n\n**Campaign Structure:**\n${data.sprints.map(s => `- **${s.name}** (${s.duration}): ${s.goals}`).join('\n')}`
    : '';

  return `I've created and launched your campaign! Here's what I set up:

**Campaign: ${data.product} Campaign**

**Target Audience:** ${data.audience}

**Budget:** $${data.budget} (${data.timeline || '30 days'})

**Primary Goal:** ${data.goals}

**Channels:** ${data.channels?.join(', ') || 'Social Media, Content Marketing'}

**Key Message:** ${data.keyMessages?.[0] || `Quality ${data.product} for ${data.audience}`}
${sprintSummary}

Your campaign is now **active** and ready to go! You can:
- View it in your Campaigns dashboard
- Monitor performance in real-time
- Let Marketing Autopilot optimize it automatically

Would you like me to help you create content for the first sprint, or set up any specific automations?`;
}

function determineChannelsFromBudget(budget: number): string[] {
  if (budget < 300) return ['social'];
  if (budget < 1000) return ['social', 'email', 'content'];
  return ['social', 'email', 'content', 'paid_ads'];
}

function determineContentTypes(channels: string[]): string[] {
  const contentTypes: string[] = [];

  if (channels.some(c => c.toLowerCase().includes('social') || c.toLowerCase().includes('reddit') || c.toLowerCase().includes('twitter'))) {
    contentTypes.push('social posts', 'community engagement');
  }
  if (channels.some(c => c.toLowerCase().includes('email'))) {
    contentTypes.push('email campaigns', 'newsletters');
  }
  if (channels.some(c => c.toLowerCase().includes('content'))) {
    contentTypes.push('blog posts', 'articles');
  }
  if (channels.some(c => c.toLowerCase().includes('video') || c.toLowerCase().includes('youtube'))) {
    contentTypes.push('video content');
  }

  return contentTypes.length > 0 ? contentTypes : ['social posts', 'email campaigns'];
}

function calculateEndDate(timeline?: string): string {
  const now = new Date();
  let daysToAdd = 30;

  if (timeline) {
    const lowerTimeline = timeline.toLowerCase();
    if (lowerTimeline.includes('week') || lowerTimeline.includes('7')) {
      daysToAdd = 7;
    } else if (lowerTimeline.includes('90') || lowerTimeline.includes('quarter') || lowerTimeline.includes('3 month')) {
      daysToAdd = 90;
    } else if (lowerTimeline.includes('60') || lowerTimeline.includes('2 month')) {
      daysToAdd = 60;
    } else if (lowerTimeline.includes('month') || lowerTimeline.includes('30')) {
      daysToAdd = 30;
    } else {
      // Try to extract number
      const match = timeline.match(/(\d+)\s*day/i);
      if (match) {
        daysToAdd = parseInt(match[1]);
      }
    }
  }

  const endDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return endDate.toISOString();
}

async function getConversationCampaign(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  conversationId: string
): Promise<ConversationCampaign | null> {
  try {
    const { data, error } = await supabase
      .from('conversation_campaigns')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .in('status', ['collecting_info', 'planning'])
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      status: data.status,
      current_step: data.current_step,
      collected_data: data.collected_data || {}
    };
  } catch (error) {
    console.error('Error getting conversation campaign:', error);
    return null;
  }
}

async function createConversationCampaign(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  conversationId: string
): Promise<ConversationCampaign> {
  const { data, error } = await supabase
    .from('conversation_campaigns')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      status: 'planning',
      current_step: 'strategic_discussion',
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

async function saveConversationCampaign(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  conversationId: string,
  extractedData: ExtractedCampaignData,
  campaignId: string
): Promise<void> {
  try {
    await supabase
      .from('conversation_campaigns')
      .upsert({
        user_id: userId,
        conversation_id: conversationId,
        status: 'completed',
        current_step: 'created',
        collected_data: extractedData,
        campaign_id: campaignId,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,conversation_id'
      });
  } catch (error) {
    console.error('Error saving conversation campaign:', error);
  }
}

async function enrichContext(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  providedContext?: Record<string, unknown>
): Promise<ChatContext> {
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
  } catch (error) {
    console.error('Error enriching context:', error);
  }

  return context;
}

function buildStrategicSystemPrompt(context: ChatContext): string {
  const activeCampaigns = context.campaigns?.length || 0;
  const autopilotEnabled = context.autopilotConfig?.is_active || false;
  const businessDesc = context.autopilotConfig?.business_description || 'your business';

  return `You are an expert Marketing Strategist AI for Action Insight Marketing Platform.

PLATFORM CONTEXT:
- User is managing ${activeCampaigns} active campaign(s)
- Marketing Autopilot: ${autopilotEnabled ? 'ENABLED' : 'DISABLED'}
- Business: ${businessDesc}

YOUR ROLE:
You are helping the user develop a comprehensive marketing campaign strategy. Have a natural, strategic conversation to understand their:
1. Product/service they want to promote
2. Target audience (be specific - demographics, psychographics, where they hang out)
3. Budget and resource constraints
4. Goals and success metrics
5. Timeline and urgency
6. Preferred channels and tactics

CONVERSATION STYLE:
- Be a strategic partner, not just a form-filler
- Ask insightful follow-up questions
- Provide expert recommendations based on their answers
- Help them think through their strategy
- Suggest creative tactics they might not have considered
- Reference proven marketing frameworks when relevant

IMPORTANT:
- Have a real strategic conversation
- Don't just collect data - provide value with each response
- Help them develop a complete, actionable marketing plan
- When they've shared enough information and want to proceed, they can say "create the campaign" or "implement this"

When they're ready to create the campaign, remind them they can say "create the campaign" or "implement this" and you'll set everything up based on your conversation.`;
}

function buildSystemPrompt(context: ChatContext, completeness?: CompletenessCheck): string {
  const activeCampaigns = context.campaigns?.length || 0;
  const autopilotEnabled = context.autopilotConfig?.is_active || false;
  const businessDesc = context.autopilotConfig?.business_description || 'your business';
  const hasHistory = context.conversationHistory && context.conversationHistory.length > 100;

  // Add completeness awareness
  let completenessNote = '';
  if (completeness && completeness.score > 0) {
    if (completeness.isComplete) {
      completenessNote = `\n\nIMPORTANT: You have gathered enough information from this conversation to create a campaign. The user has provided: ${completeness.presentFields.join(', ')}. When appropriate, proactively offer to create the campaign by saying something like "I have all the information I need. Would you like me to create this campaign now?"`;
    } else if (completeness.score >= 50) {
      completenessNote = `\n\nNote: You have gathered some campaign details (${completeness.presentFields.join(', ')}). You still need: ${completeness.missingFields.join(', ')}. Continue the strategic conversation to gather the remaining details.`;
    }
  }

  return `You are the AI Marketing Assistant for Action Insight Marketing Platform.

PLATFORM CONTEXT:
- User is managing ${activeCampaigns} active campaign(s)
- Marketing Autopilot: ${autopilotEnabled ? 'ENABLED' : 'DISABLED'}
- Business: ${businessDesc}
${hasHistory ? '- You have been having a conversation with this user (see history below)' : ''}

${context.conversationHistory ? `\nPREVIOUS CONVERSATION:\n${context.conversationHistory.slice(-3000)}\n` : ''}

YOUR CAPABILITIES:
- Analyze campaign performance and provide insights
- Develop comprehensive marketing strategies
- Help create new campaigns through strategic conversation
- Answer questions about marketing automation
- Provide actionable marketing advice

GUIDELINES:
- Be conversational, strategic, and helpful
- Reference the conversation history when relevant
- When user wants to create a campaign, have a strategic discussion first
- When they're ready to implement, they can say "create the campaign" or "implement this"
- Focus on actionable advice that drives business results

CURRENT DATA:
${context.campaigns && context.campaigns.length > 0 ? `
Active Campaigns:
${context.campaigns.map(c => `- ${c.name} (${c.type}): $${c.budget_spent || 0}/$${c.budget_allocated || 0} spent`).join('\n')}
` : 'No active campaigns yet.'}

${context.recentActivity && context.recentActivity.length > 0 ? `
Recent Activity:
${context.recentActivity.map(a => `- ${a.activity_type}: ${a.activity_description}`).join('\n')}
` : ''}

Remember: Help users succeed with strategic, actionable marketing guidance.${completenessNote}`;
}

function buildUserPrompt(query: string, _context: ChatContext): string {
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
      model: 'claude-sonnet-4-5-20250929',
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

function detectActions(query: string, response: string, campaignCreated: boolean): string[] {
  const suggestions: string[] = [];

  if (campaignCreated) {
    suggestions.push('View campaign dashboard');
    suggestions.push('Create content for campaign');
    suggestions.push('Set up automations');
    return suggestions;
  }

  const queryLower = query.toLowerCase();
  const responseLower = response.toLowerCase();

  // If we've been discussing campaign strategy, suggest implementation
  if (responseLower.includes('campaign') && (responseLower.includes('strategy') || responseLower.includes('plan'))) {
    suggestions.push('Create the campaign');
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
    suggestions.push('Help me create a campaign');
    suggestions.push('Show campaign performance');
    suggestions.push('Generate content ideas');
  }

  return suggestions.slice(0, 3);
}
