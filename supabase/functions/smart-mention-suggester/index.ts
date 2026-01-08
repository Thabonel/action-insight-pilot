import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SmartSuggestion {
  handle: string
  reason: string
  confidence: number
  type: 'user' | 'brand' | 'influencer' | 'competitor'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { postContent, platform, context } = await req.json()

    if (!postContent || postContent.length < 10) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Smart Suggester] Analyzing post content for user:', user.id)

    // Get user's Claude API key
    const { data: secrets, error: secretError } = await supabase
      .from('user_secrets')
      .select('encrypted_value, initialization_vector')
      .eq('user_id', user.id)
      .eq('service_name', 'anthropic_api_key')
      .eq('is_active', true)
      .single()

    if (secretError || !secrets) {
      console.log('[Smart Suggester] No Claude API key found for user')
      // Fallback to historical suggestions
      return await getHistoricalSuggestions(supabase, user.id, platform)
    }

    const apiKey = secrets.encrypted_value

    // Get user's historical mentions for context
    const { data: historicalMentions } = await supabase
      .from('social_mentions')
      .select('mention_handle, mention_display_name, mention_type, usage_count')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .order('usage_count', { ascending: false })
      .limit(20)

    const historicalContext = historicalMentions?.map(m =>
      `@${m.mention_handle} (${m.mention_type}, used ${m.usage_count}x)`
    ).join(', ') || 'No historical data'

    // Get industry/business context if available
    const { data: autopilotConfig } = await supabase
      .from('marketing_autopilot_config')
      .select('business_description')
      .eq('user_id', user.id)
      .single()

    const businessContext = autopilotConfig?.business_description || 'Not specified'

    const prompt = `You are a social media expert analyzing a post to suggest relevant @mentions.

Post Content:
"${postContent}"

Platform: ${platform}
Business Context: ${businessContext}
User's Historical Mentions: ${historicalContext}

${context?.industry ? `Industry: ${context.industry}` : ''}
${context?.campaign_type ? `Campaign Type: ${context.campaign_type}` : ''}

Analyze this post and suggest 3-5 relevant @mentions that would:
1. Add credibility or authority
2. Increase engagement through collaboration
3. Tag relevant brands, partners, or influencers
4. Attribute quotes or references

For each suggestion, provide:
- handle: The @mention (without @)
- reason: Why this mention is relevant (max 50 chars)
- confidence: 0-1 score
- type: user/brand/influencer/competitor

Return ONLY valid JSON array. Example:
[
  {
    "handle": "techcrunch",
    "reason": "Tech news authority, relevant to AI topic",
    "confidence": 0.9,
    "type": "brand"
  }
]`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4.5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Smart Suggester] Claude API error ${response.status}:`, errorText)

      if (response.status === 401) {
        throw new Error('Invalid Claude API key')
      }

      // Fallback to historical suggestions
      return await getHistoricalSuggestions(supabase, user.id, platform)
    }

    const data = await response.json()

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('[Smart Suggester] Invalid response structure from Claude API')
      return await getHistoricalSuggestions(supabase, user.id, platform)
    }

    // Parse JSON from Claude's response
    const responseText = data.content[0].text.trim()

    // Extract JSON array from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('[Smart Suggester] No JSON array found in response')
      return await getHistoricalSuggestions(supabase, user.id, platform)
    }

    const suggestions: SmartSuggestion[] = JSON.parse(jsonMatch[0])

    // Validate suggestions
    const validSuggestions = suggestions
      .filter(s =>
        s.handle &&
        s.handle.length > 0 &&
        s.handle.length < 50 &&
        s.confidence >= 0 &&
        s.confidence <= 1
      )
      .slice(0, 5)

    console.log(`[Smart Suggester] Generated ${validSuggestions.length} suggestions`)

    return new Response(
      JSON.stringify({ suggestions: validSuggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions'
    console.error('[Smart Suggester] Error:', error)
    return new Response(
      JSON.stringify({
        error: errorMessage,
        suggestions: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getHistoricalSuggestions(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  platform: string
) {
  const { data: historicalMentions } = await supabase
    .from('social_mentions')
    .select('mention_handle, mention_display_name, mention_type, usage_count')
    .eq('user_id', userId)
    .eq('platform', platform)
    .order('usage_count', { ascending: false })
    .limit(5)

  const suggestions = historicalMentions?.map((m) => ({
    handle: m.mention_handle,
    reason: `Previously used ${m.usage_count}x`,
    confidence: Math.min(m.usage_count / 10, 1),
    type: m.mention_type || 'user'
  })) || []

  return new Response(
    JSON.stringify({ suggestions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
