import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompetitorMention {
  competitor_handle: string
  post_id: string
  post_url: string
  author: string
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  engagement_stats: {
    likes: number
    shares: number
    comments: number
  }
  discovered_at: string
  platform: string
}

function decryptToken(encryptedToken: string): string {
  return atob(encryptedToken)
}

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['great', 'awesome', 'excellent', 'love', 'amazing', 'fantastic', 'perfect', 'wonderful', 'best']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointing', 'poor', 'worst', 'horrible', 'slow']

  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

async function searchCompetitorMentionsTwitter(
  accessToken: string,
  competitorHandles: string[]
): Promise<CompetitorMention[]> {
  const mentions: CompetitorMention[] = []

  for (const handle of competitorHandles) {
    try {
      const query = `@${handle} -is:retweet`
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=50&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.error(`[Twitter] API error ${response.status} for ${handle}`)
        continue
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0) continue

      const usersMap = new Map()
      if (data.includes?.users) {
        data.includes.users.forEach((user: any) => {
          usersMap.set(user.id, user.username)
        })
      }

      for (const tweet of data.data) {
        mentions.push({
          competitor_handle: handle,
          post_id: tweet.id,
          post_url: `https://twitter.com/i/web/status/${tweet.id}`,
          author: usersMap.get(tweet.author_id) || tweet.author_id,
          content: tweet.text,
          sentiment: analyzeSentiment(tweet.text),
          engagement_stats: {
            likes: tweet.public_metrics?.like_count || 0,
            shares: tweet.public_metrics?.retweet_count || 0,
            comments: tweet.public_metrics?.reply_count || 0
          },
          discovered_at: tweet.created_at,
          platform: 'twitter'
        })
      }
    } catch (error) {
      console.error(`[Twitter] Error searching competitor ${handle}:`, error)
    }
  }

  return mentions
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

    console.log('[Competitor Tracker] Starting competitor mention tracking...')

    // Get all users and their competitor tracking settings
    const { data: connections, error: connectionsError } = await supabase
      .from('oauth_connections')
      .select('user_id, platform_name, access_token_encrypted, connection_metadata')
      .eq('connection_status', 'connected')
      .eq('platform_name', 'twitter') // Start with Twitter only

    if (connectionsError) {
      throw new Error(`Failed to fetch connections: ${connectionsError.message}`)
    }

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No connected platforms to track' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalMentionsFound = 0
    let totalProcessed = 0

    for (const conn of connections) {
      try {
        // Get competitor list for this user
        const { data: competitors } = await supabase
          .from('social_mentions')
          .select('mention_handle')
          .eq('user_id', conn.user_id)
          .eq('mention_type', 'competitor')

        if (!competitors || competitors.length === 0) {
          console.log(`[Competitor Tracker] No competitors tracked for user ${conn.user_id}`)
          continue
        }

        const competitorHandles = competitors.map((c: any) => c.mention_handle)
        console.log(`[Competitor Tracker] Tracking ${competitorHandles.length} competitors for user ${conn.user_id}`)

        const accessToken = decryptToken(conn.access_token_encrypted)
        const mentions = await searchCompetitorMentionsTwitter(accessToken, competitorHandles)

        totalMentionsFound += mentions.length

        // Store competitor mentions
        for (const mention of mentions) {
          try {
            // Check if mention already exists
            const { data: existing } = await supabase
              .from('mention_monitoring')
              .select('id')
              .eq('platform', mention.platform)
              .eq('post_id', mention.post_id)
              .single()

            if (existing) continue

            // Insert new competitor mention
            const { error: insertError } = await supabase
              .from('mention_monitoring')
              .insert({
                user_id: conn.user_id,
                platform: mention.platform,
                post_id: mention.post_id,
                post_url: mention.post_url,
                mentioned_handle: mention.competitor_handle,
                mentioned_by_handle: mention.author,
                post_content: mention.content,
                sentiment: mention.sentiment,
                engagement_stats: mention.engagement_stats,
                is_read: false,
                is_responded: false,
                discovered_at: mention.discovered_at
              })

            if (!insertError) {
              totalProcessed++
            }
          } catch (mentionError) {
            console.error('[Competitor Tracker] Error storing mention:', mentionError)
          }
        }
      } catch (connError) {
        console.error(`[Competitor Tracker] Error processing connection:`, connError)
      }
    }

    console.log(`[Competitor Tracker] Complete: Found ${totalMentionsFound} mentions, processed ${totalProcessed}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Competitor tracking complete',
        stats: {
          mentions_found: totalMentionsFound,
          mentions_processed: totalProcessed
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Competitor Tracker] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
