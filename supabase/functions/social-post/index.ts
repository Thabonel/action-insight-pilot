import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PostContent {
  text?: string
  image?: string
  video?: string
  url?: string
  mentions?: string[]
  hashtags?: string[]
}

function decryptToken(encryptedToken: string): string {
  // In a real implementation, use proper decryption
  // For now, we'll use base64 decoding as a placeholder
  return atob(encryptedToken)
}

async function postToFacebook(accessToken: string, content: PostContent, pageId?: string) {
  const postData: Record<string, unknown> = {
    message: content.text
  }

  if (content.image) {
    postData.url = content.image
  }

  const endpoint = pageId 
    ? `https://graph.facebook.com/v18.0/${pageId}/posts`
    : 'https://graph.facebook.com/v18.0/me/feed'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Facebook post failed: ${error}`)
  }

  return await response.json()
}

async function postToTwitter(accessToken: string, content: PostContent) {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: content.text
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twitter post failed: ${error}`)
  }

  return await response.json()
}

async function postToLinkedIn(accessToken: string, content: PostContent, personUrn: string) {
  const postData = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content.text
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn post failed: ${error}`)
  }

  return await response.json()
}

async function postToInstagram(accessToken: string, content: PostContent, igUserId: string) {
  // Instagram posting requires a multi-step process
  // 1. Upload media
  // 2. Create media container
  // 3. Publish media

  if (!content.image) {
    throw new Error('Instagram posts require an image')
  }

  // Create media container
  const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: content.image,
      caption: content.text
    })
  })

  if (!containerResponse.ok) {
    const error = await containerResponse.text()
    throw new Error(`Instagram container creation failed: ${error}`)
  }

  const containerData = await containerResponse.json()

  // Publish media
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      creation_id: containerData.id
    })
  })

  if (!publishResponse.ok) {
    const error = await publishResponse.text()
    throw new Error(`Instagram publish failed: ${error}`)
  }

  return await publishResponse.json()
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    const { platforms, content } = await req.json()
    
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      throw new Error('No platforms specified')
    }

    if (!content || !content.text) {
      throw new Error('No content provided')
    }

    const results = []

    for (const platform of platforms) {
      try {
        // Get the connection for this platform
        const { data: connection, error: connectionError } = await supabase
          .from('oauth_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform_name', platform)
          .eq('connection_status', 'connected')
          .single()

        if (connectionError || !connection) {
          results.push({
            platform,
            success: false,
            error: 'Platform not connected'
          })
          continue
        }

        const accessToken = decryptToken(connection.access_token_encrypted)
        let postResult

        switch (platform) {
          case 'facebook':
            postResult = await postToFacebook(accessToken, content)
            break
          case 'twitter':
            postResult = await postToTwitter(accessToken, content)
            break
          case 'linkedin':
            postResult = await postToLinkedIn(accessToken, content, `urn:li:person:${connection.platform_user_id}`)
            break
          case 'instagram':
            postResult = await postToInstagram(accessToken, content, connection.platform_user_id)
            break
          default:
            throw new Error(`Platform ${platform} not supported`)
        }

        results.push({
          platform,
          success: true,
          data: postResult
        })

        // Track mention and hashtag usage after successful post
        try {
          if (content.mentions && content.mentions.length > 0) {
            for (const mention of content.mentions) {
              // Validate mention format
              const cleanHandle = mention.replace('@', '').trim()
              if (cleanHandle.length === 0 || cleanHandle.length > 50) {
                console.warn(`[Tracking] Invalid mention format: ${mention}`)
                continue
              }

              try {
                await supabase.rpc('increment_mention_usage', {
                  p_user_id: user.id,
                  p_platform: platform,
                  p_mention_handle: cleanHandle,
                  p_display_name: null
                })
              } catch (mentionError) {
                console.error(`[Tracking] Failed to track mention ${mention}:`, mentionError)
              }
            }
          }

          if (content.hashtags && content.hashtags.length > 0) {
            for (const tag of content.hashtags) {
              // Validate hashtag format
              const cleanTag = tag.trim()
              if (!cleanTag.startsWith('#') || cleanTag.length < 2 || cleanTag.length > 100) {
                console.warn(`[Tracking] Invalid hashtag format: ${tag}`)
                continue
              }

              try {
                // First try to get existing record to increment
                const { data: existing } = await supabase
                  .from('hashtag_suggestions')
                  .select('usage_count')
                  .eq('user_id', user.id)
                  .eq('hashtag', cleanTag)
                  .eq('platform', platform)
                  .single()

                const newUsageCount = existing ? existing.usage_count + 1 : 1

                await supabase.from('hashtag_suggestions').upsert({
                  user_id: user.id,
                  hashtag: cleanTag,
                  platform: platform,
                  usage_count: newUsageCount,
                  last_used_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id,hashtag,platform',
                  ignoreDuplicates: false
                })
              } catch (hashtagError) {
                console.error(`[Tracking] Failed to track hashtag ${tag}:`, hashtagError)
              }
            }
          }
        } catch (trackingError) {
          console.error(`Error tracking mentions/hashtags for ${platform}:`, trackingError)
        }

      } catch (error: unknown) {
        console.error(`Error posting to ${platform}:`, error)
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: unknown) {
    console.error('Social post error:', error)
    // Return generic error to client, log full error server-side
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : ''
    const publicError = errorMessage?.includes('authorization') || errorMessage?.includes('token')
      ? 'Authentication required'
      : errorMessage?.includes('platforms')
      ? 'Invalid platform configuration'
      : errorMessage?.includes('content')
      ? 'Invalid content provided'
      : 'Failed to post to social media';
    return new Response(
      JSON.stringify({ error: publicError }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})