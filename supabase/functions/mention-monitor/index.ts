import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlatformConnection {
  user_id: string
  platform_name: string
  access_token_encrypted: string
  platform_user_id: string
  connection_metadata: any
}

interface DiscoveredMention {
  id: string
  url: string
  author: string
  text: string
  stats: {
    likes: number
    shares: number
    comments: number
  }
  created_at: string
}

function decryptToken(encryptedToken: string): string {
  // In production, use proper decryption
  // For now, base64 decoding as placeholder
  return atob(encryptedToken)
}

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  // Simple keyword-based sentiment analysis
  // In production, use Claude API for better accuracy
  const positiveWords = ['great', 'awesome', 'excellent', 'love', 'amazing', 'fantastic', 'perfect', 'wonderful']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointing', 'poor', 'worst', 'horrible']

  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

async function searchTwitterMentions(
  accessToken: string,
  username: string
): Promise<DiscoveredMention[]> {
  try {
    // Twitter API v2 - Search recent mentions
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=@${username}&max_results=100&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error(`[Twitter] API error ${response.status}:`, await response.text())
      return []
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return []
    }

    // Map users by ID for lookup
    const usersMap = new Map()
    if (data.includes?.users) {
      data.includes.users.forEach((user: any) => {
        usersMap.set(user.id, user.username)
      })
    }

    return data.data.map((tweet: any) => ({
      id: tweet.id,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      author: usersMap.get(tweet.author_id) || tweet.author_id,
      text: tweet.text,
      stats: {
        likes: tweet.public_metrics?.like_count || 0,
        shares: tweet.public_metrics?.retweet_count || 0,
        comments: tweet.public_metrics?.reply_count || 0
      },
      created_at: tweet.created_at
    }))
  } catch (error) {
    console.error('[Twitter] Error searching mentions:', error)
    return []
  }
}

async function searchFacebookMentions(
  accessToken: string,
  pageId: string
): Promise<DiscoveredMention[]> {
  try {
    // Facebook Graph API - Search mentions on Page
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/tagged?fields=id,message,from,created_time,likes.summary(true),comments.summary(true),shares&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error(`[Facebook] API error ${response.status}:`, await response.text())
      return []
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return []
    }

    return data.data.map((post: any) => ({
      id: post.id,
      url: `https://www.facebook.com/${post.id}`,
      author: post.from?.name || post.from?.id || 'Unknown',
      text: post.message || '',
      stats: {
        likes: post.likes?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        comments: post.comments?.summary?.total_count || 0
      },
      created_at: post.created_time
    }))
  } catch (error) {
    console.error('[Facebook] Error searching mentions:', error)
    return []
  }
}

async function searchLinkedInMentions(
  accessToken: string,
  personUrn: string
): Promise<DiscoveredMention[]> {
  try {
    // LinkedIn API - Search for mentions
    // Note: LinkedIn's mention search is limited
    const response = await fetch(
      `https://api.linkedin.com/v2/shares?q=owners&owners=${personUrn}&count=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error(`[LinkedIn] API error ${response.status}:`, await response.text())
      return []
    }

    const data = await response.json()

    if (!data.elements || data.elements.length === 0) {
      return []
    }

    return data.elements
      .filter((share: any) => share.text?.text?.includes('@'))
      .map((share: any) => ({
        id: share.id,
        url: `https://www.linkedin.com/feed/update/${share.id}`,
        author: share.owner || 'Unknown',
        text: share.text?.text || '',
        stats: {
          likes: share.content?.['com.linkedin.ugc.ShareStatistics']?.likeCount || 0,
          shares: share.content?.['com.linkedin.ugc.ShareStatistics']?.shareCount || 0,
          comments: share.content?.['com.linkedin.ugc.ShareStatistics']?.commentCount || 0
        },
        created_at: new Date(share.created?.time || Date.now()).toISOString()
      }))
  } catch (error) {
    console.error('[LinkedIn] Error searching mentions:', error)
    return []
  }
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

    console.log('[Mention Monitor] Starting daily mention monitoring...')

    // Fetch all connected users
    const { data: connections, error: connectionsError } = await supabase
      .from('oauth_connections')
      .select('user_id, platform_name, access_token_encrypted, platform_user_id, connection_metadata')
      .eq('connection_status', 'connected')
      .in('platform_name', ['twitter', 'facebook', 'linkedin'])

    if (connectionsError) {
      throw new Error(`Failed to fetch connections: ${connectionsError.message}`)
    }

    if (!connections || connections.length === 0) {
      console.log('[Mention Monitor] No connected platforms found')
      return new Response(
        JSON.stringify({ message: 'No connected platforms to monitor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalMentionsFound = 0
    let totalProcessed = 0

    // Process each connection
    for (const conn of connections as PlatformConnection[]) {
      try {
        console.log(`[Mention Monitor] Processing ${conn.platform_name} for user ${conn.user_id}`)

        const accessToken = decryptToken(conn.access_token_encrypted)
        let mentions: DiscoveredMention[] = []

        // Search for mentions on each platform
        switch (conn.platform_name) {
          case 'twitter':
            mentions = await searchTwitterMentions(accessToken, conn.platform_user_id)
            break
          case 'facebook':
            const pageId = conn.connection_metadata?.facebook_page_id || conn.platform_user_id
            mentions = await searchFacebookMentions(accessToken, pageId)
            break
          case 'linkedin':
            const personUrn = `urn:li:person:${conn.platform_user_id}`
            mentions = await searchLinkedInMentions(accessToken, personUrn)
            break
        }

        console.log(`[Mention Monitor] Found ${mentions.length} mentions on ${conn.platform_name}`)
        totalMentionsFound += mentions.length

        // Insert discovered mentions into database
        for (const mention of mentions) {
          try {
            const sentiment = analyzeSentiment(mention.text)

            // Check if mention already exists
            const { data: existing } = await supabase
              .from('mention_monitoring')
              .select('id')
              .eq('platform', conn.platform_name)
              .eq('post_id', mention.id)
              .single()

            if (existing) {
              console.log(`[Mention Monitor] Mention ${mention.id} already exists, skipping`)
              continue
            }

            // Insert new mention
            const { error: insertError } = await supabase
              .from('mention_monitoring')
              .insert({
                user_id: conn.user_id,
                platform: conn.platform_name,
                post_id: mention.id,
                post_url: mention.url,
                mentioned_handle: conn.platform_user_id,
                mentioned_by_handle: mention.author,
                post_content: mention.text,
                sentiment: sentiment,
                engagement_stats: mention.stats,
                is_read: false,
                is_responded: false,
                discovered_at: mention.created_at
              })

            if (insertError) {
              console.error(`[Mention Monitor] Failed to insert mention ${mention.id}:`, insertError)
            } else {
              totalProcessed++
            }
          } catch (mentionError) {
            console.error(`[Mention Monitor] Error processing mention:`, mentionError)
          }
        }
      } catch (connError) {
        console.error(`[Mention Monitor] Error processing connection for ${conn.platform_name}:`, connError)
      }
    }

    console.log(`[Mention Monitor] Complete: Found ${totalMentionsFound} mentions, processed ${totalProcessed}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mention monitoring complete',
        stats: {
          connections_checked: connections.length,
          mentions_found: totalMentionsFound,
          mentions_processed: totalProcessed
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Mention Monitor] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
