import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('[Analytics Aggregator] Starting weekly analytics aggregation...')

    // Calculate period (last 7 days)
    const now = new Date()
    const periodEnd = now.toISOString()
    const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id')

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      console.log('[Analytics Aggregator] No users found')
      return new Response(
        JSON.stringify({ message: 'No users to aggregate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalAggregated = 0

    // Aggregate for each user
    for (const userRecord of users) {
      const userId = userRecord.user_id

      try {
        console.log(`[Analytics Aggregator] Processing user ${userId}`)

        // Aggregate mention analytics
        const { data: mentionUsage, error: mentionError } = await supabase
          .from('social_mentions')
          .select('platform, mention_handle, usage_count')
          .eq('user_id', userId)
          .gte('last_used_at', periodStart)
          .lte('last_used_at', periodEnd)

        if (!mentionError && mentionUsage && mentionUsage.length > 0) {
          for (const mention of mentionUsage) {
            await supabase.from('mention_analytics').insert({
              user_id: userId,
              period_start: periodStart,
              period_end: periodEnd,
              platform: mention.platform,
              tag_text: `@${mention.mention_handle}`,
              tag_type: 'mention',
              usage_count: mention.usage_count,
              total_reach: 0, // TODO: Calculate from actual post reach
              total_impressions: 0,
              total_engagement: 0,
              avg_engagement_rate: 0
            })
          }
        }

        // Aggregate hashtag analytics
        const { data: hashtagUsage, error: hashtagError } = await supabase
          .from('hashtag_suggestions')
          .select('platform, hashtag, usage_count, avg_engagement_rate')
          .eq('user_id', userId)
          .gte('last_used_at', periodStart)
          .lte('last_used_at', periodEnd)

        if (!hashtagError && hashtagUsage && hashtagUsage.length > 0) {
          for (const hashtag of hashtagUsage) {
            await supabase.from('mention_analytics').insert({
              user_id: userId,
              period_start: periodStart,
              period_end: periodEnd,
              platform: hashtag.platform,
              tag_text: hashtag.hashtag,
              tag_type: 'hashtag',
              usage_count: hashtag.usage_count,
              total_reach: 0, // TODO: Calculate from actual post reach
              total_impressions: 0,
              total_engagement: 0,
              avg_engagement_rate: hashtag.avg_engagement_rate || 0
            })
          }
        }

        totalAggregated++
      } catch (userError) {
        console.error(`[Analytics Aggregator] Error processing user ${userId}:`, userError)
      }
    }

    console.log(`[Analytics Aggregator] Complete: Aggregated for ${totalAggregated} users`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics aggregation complete',
        stats: {
          users_processed: totalAggregated,
          period_start: periodStart,
          period_end: periodEnd
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('[Analytics Aggregator] Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
