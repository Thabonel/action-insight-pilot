import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

const PLATFORM_CONFIGS = {
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    clientId: Deno.env.get('FACEBOOK_CLIENT_ID') || '',
    clientSecret: Deno.env.get('FACEBOOK_CLIENT_SECRET') || ''
  },
  instagram: {
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    userInfoUrl: 'https://graph.instagram.com/me',
    clientId: Deno.env.get('INSTAGRAM_CLIENT_ID') || '',
    clientSecret: Deno.env.get('INSTAGRAM_CLIENT_SECRET') || ''
  },
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
    clientId: Deno.env.get('TWITTER_CLIENT_ID') || '',
    clientSecret: Deno.env.get('TWITTER_CLIENT_SECRET') || ''
  },
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/people/~',
    clientId: Deno.env.get('LINKEDIN_CLIENT_ID') || '',
    clientSecret: Deno.env.get('LINKEDIN_CLIENT_SECRET') || ''
  },
  youtube: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    clientId: Deno.env.get('YOUTUBE_CLIENT_ID') || '',
    clientSecret: Deno.env.get('YOUTUBE_CLIENT_SECRET') || ''
  },
  tiktok: {
    tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    userInfoUrl: 'https://open-api.tiktok.com/user/info/',
    clientId: Deno.env.get('TIKTOK_CLIENT_ID') || '',
    clientSecret: Deno.env.get('TIKTOK_CLIENT_SECRET') || ''
  }
}

async function exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<TokenResponse> {
  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
  
  const tokenData = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: tokenData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${errorText}`)
  }

  return await response.json()
}

async function getUserInfo(platform: string, accessToken: string) {
  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
  
  const response = await fetch(config.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.warn(`Failed to get user info: ${errorText}`)
    return null
  }

  return await response.json()
}

function encryptToken(token: string): string {
  // In a real implementation, use proper encryption
  // For now, we'll use base64 encoding as a placeholder
  return btoa(token)
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

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    // Verify state and get OAuth details
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', state)
      .single()

    if (stateError || !oauthState) {
      throw new Error('Invalid or expired state token')
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(
      oauthState.platform_name,
      code,
      oauthState.redirect_uri
    )

    // Get user info from the platform
    const userInfo = await getUserInfo(oauthState.platform_name, tokenData.access_token)

    // Store or update the connection
    const connectionData = {
      user_id: oauthState.user_id,
      platform_name: oauthState.platform_name,
      access_token_encrypted: encryptToken(tokenData.access_token),
      refresh_token_encrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
      token_expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      platform_user_id: userInfo?.id || userInfo?.sub || null,
      platform_username: userInfo?.username || userInfo?.name || userInfo?.email || null,
      connection_metadata: userInfo || {},
      connection_status: 'connected'
    }

    const { error: upsertError } = await supabase
      .from('oauth_connections')
      .upsert(connectionData, {
        onConflict: 'user_id,platform_name'
      })

    if (upsertError) {
      console.error('Error storing connection:', upsertError)
      throw new Error('Failed to store connection')
    }

    // Clean up the OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('id', oauthState.id)

    // Redirect back to the app
    const redirectUrl = `${oauthState.redirect_uri.split('/oauth/callback')[0]}/app/connect-platforms?success=true&platform=${oauthState.platform_name}`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    })

  } catch (error: unknown) {
    console.error('OAuth callback error:', error)
    
    // Redirect back to app with error
    const redirectUrl = `${req.headers.get('origin')}/app/connect-platforms?error=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    })
  }
})