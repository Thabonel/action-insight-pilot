import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SafetyCheckRequest {
  mentions?: string[]
  hashtags?: string[]
  postContent?: string
}

interface SafetyCheckResult {
  is_safe: boolean
  blocked_items: {
    type: 'mention' | 'hashtag' | 'keyword'
    value: string
    reason: string
  }[]
  warnings: string[]
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

    const { mentions = [], hashtags = [], postContent = '' }: SafetyCheckRequest = await req.json()

    console.log('[Brand Safety] Checking safety for user:', user.id)

    const result: SafetyCheckResult = {
      is_safe: true,
      blocked_items: [],
      warnings: []
    }

    // Get user's brand safety filters
    const { data: filters, error: filtersError } = await supabase
      .from('brand_safety_filters')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (filtersError) {
      console.error('[Brand Safety] Error fetching filters:', filtersError)
      // Fail safe - if we can't fetch filters, allow the content
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!filters || filters.length === 0) {
      // No filters configured - everything is safe
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check blocked handles
    const blockedHandles = filters
      .filter(f => f.filter_type === 'blocked_handle')
      .map(f => f.filter_value.toLowerCase())

    for (const mention of mentions) {
      const cleanHandle = mention.replace('@', '').toLowerCase()
      const filter = filters.find(
        f => f.filter_type === 'blocked_handle' && f.filter_value.toLowerCase() === cleanHandle
      )

      if (filter) {
        result.is_safe = false
        result.blocked_items.push({
          type: 'mention',
          value: mention,
          reason: filter.reason || 'Blocked by brand safety policy'
        })
      }
    }

    // Check blocked keywords in hashtags
    const blockedKeywords = filters
      .filter(f => f.filter_type === 'blocked_keyword')
      .map(f => f.filter_value.toLowerCase())

    for (const hashtag of hashtags) {
      const cleanTag = hashtag.replace('#', '').toLowerCase()

      for (const keyword of blockedKeywords) {
        if (cleanTag.includes(keyword)) {
          const filter = filters.find(
            f => f.filter_type === 'blocked_keyword' && f.filter_value.toLowerCase() === keyword
          )

          result.is_safe = false
          result.blocked_items.push({
            type: 'hashtag',
            value: hashtag,
            reason: filter?.reason || `Contains blocked keyword: ${keyword}`
          })
          break
        }
      }
    }

    // Check blocked keywords in post content
    const contentLower = postContent.toLowerCase()

    for (const keyword of blockedKeywords) {
      if (contentLower.includes(keyword)) {
        const filter = filters.find(
          f => f.filter_type === 'blocked_keyword' && f.filter_value.toLowerCase() === keyword
        )

        result.warnings.push(
          `Post contains blocked keyword "${keyword}": ${filter?.reason || 'Review recommended'}`
        )
      }
    }

    // Check blocked domains (in URLs)
    const blockedDomains = filters
      .filter(f => f.filter_type === 'blocked_domain')
      .map(f => f.filter_value.toLowerCase())

    const urlRegex = /https?:\/\/(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g
    const urls = postContent.match(urlRegex) || []

    for (const url of urls) {
      try {
        const domain = new URL(url).hostname.replace('www.', '')

        for (const blockedDomain of blockedDomains) {
          if (domain.includes(blockedDomain)) {
            const filter = filters.find(
              f => f.filter_type === 'blocked_domain' && f.filter_value.toLowerCase() === blockedDomain
            )

            result.warnings.push(
              `Post contains link to blocked domain "${domain}": ${filter?.reason || 'Review recommended'}`
            )
          }
        }
      } catch (error) {
        console.error('[Brand Safety] Invalid URL:', url)
      }
    }

    console.log(`[Brand Safety] Safety check complete: ${result.is_safe ? 'PASS' : 'FAIL'}`)
    console.log(`[Brand Safety] Blocked items: ${result.blocked_items.length}, Warnings: ${result.warnings.length}`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Brand Safety] Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to check brand safety',
        is_safe: true, // Fail safe - don't block if check fails
        blocked_items: [],
        warnings: ['Brand safety check failed - manual review recommended']
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
