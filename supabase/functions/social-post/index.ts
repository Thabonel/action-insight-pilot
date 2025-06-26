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
}

function decryptToken(encryptedToken: string): string {
  // In a real implementation, use proper decryption
  // For now, we'll use base64 decoding as a placeholder
  return atob(encryptedToken)
}

async function postToFacebook(accessToken: string, content: PostContent, pageId?: string) {
  const postData: any = {
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

      } catch (error) {
        console.error(`Error posting to ${platform}:`, error)
        results.push({
          platform,
          success: false,
          error: error.message
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

  } catch (error) {
    console.error('Social post error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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