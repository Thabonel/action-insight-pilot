
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface UserProfile {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
}

const platformTokenUrls: Record<string, string> = {
  buffer: 'https://api.bufferapp.com/1/oauth2/token.json',
  hootsuite: 'https://platform.hootsuite.com/oauth2/token',
  later: 'https://api.later.com/oauth2/token',
  sprout_social: 'https://api.sproutsocial.com/oauth/token'
}

const platformUserUrls: Record<string, string> = {
  buffer: 'https://api.bufferapp.com/1/user.json',
  hootsuite: 'https://platform.hootsuite.com/v1/me',
  later: 'https://api.later.com/v1/me',
  sprout_social: 'https://api.sproutsocial.com/v1/me'
}

async function exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = Deno.env.get(`${platform.toUpperCase()}_CLIENT_ID`)
  const clientSecret = Deno.env.get(`${platform.toUpperCase()}_CLIENT_SECRET`)

  if (!clientId || !clientSecret) {
    throw new Error(`${platform} credentials not configured`)
  }

  const tokenUrl = platformTokenUrls[platform]
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Token exchange failed for ${platform}:`, errorText)
    throw new Error(`Token exchange failed: ${response.status}`)
  }

  return await response.json()
}

async function getUserProfile(platform: string, accessToken: string): Promise<UserProfile> {
  const userUrl = platformUserUrls[platform]
  const response = await fetch(userUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    console.error(`Failed to get user profile for ${platform}:`, response.status)
    throw new Error(`Failed to get user profile: ${response.status}`)
  }

  const userData = await response.json()
  
  // Map platform-specific response to common format
  switch (platform) {
    case 'buffer':
      return {
        id: userData.id,
        username: userData.name || userData.id,
        name: userData.name,
        avatar: userData.avatar
      }
    case 'hootsuite':
      return {
        id: userData.id,
        username: userData.email || userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        avatar: userData.avatarUrl
      }
    case 'later':
      return {
        id: userData.id,
        username: userData.username || userData.email,
        name: userData.name,
        avatar: userData.avatar_url
      }
    case 'sprout_social':
      return {
        id: userData.id,
        username: userData.username || userData.email,
        name: userData.name,
        avatar: userData.profile_image_url
      }
    default:
      return userData
  }
}

// Simple encryption for storing tokens (in production, use proper encryption)
function encryptToken(token: string): string {
  const key = Deno.env.get('SECRET_MASTER_KEY') || 'default-key'
  // This is a simple base64 encoding - in production use proper encryption
  return btoa(key + ':' + token)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
      return new Response(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Authorization was cancelled or failed: ${error}</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    if (!code || !state) {
      return new Response(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Missing authorization code or state parameter</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Parse state to get platform and token
    const [platform, stateToken] = state.split(':')
    
    if (!platform || !stateToken) {
      throw new Error('Invalid state parameter')
    }

    // Verify and get OAuth state from database
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', stateToken)
      .eq('platform_name', platform)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (stateError || !oauthState) {
      throw new Error('Invalid or expired OAuth state')
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(platform, code, oauthState.redirect_uri)
    
    // Get user profile from platform
    const userProfile = await getUserProfile(platform, tokenData.access_token)

    // Calculate token expiration
    const tokenExpiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null

    // Store encrypted tokens in database
    const connectionData = {
      user_id: oauthState.user_id,
      platform_name: platform,
      platform_user_id: userProfile.id,
      platform_username: userProfile.username,
      access_token_encrypted: encryptToken(tokenData.access_token),
      refresh_token_encrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
      token_expires_at: tokenExpiresAt?.toISOString(),
      connection_status: 'connected',
      connection_metadata: {
        user_profile: userProfile,
        token_type: tokenData.token_type || 'Bearer'
      }
    }

    // Upsert connection (update if exists, insert if new)
    const { error: connectionError } = await supabase
      .from('oauth_connections')
      .upsert(connectionData, {
        onConflict: 'user_id,platform_name'
      })

    if (connectionError) {
      console.error('Error storing connection:', connectionError)
      throw new Error('Failed to store connection')
    }

    // Clean up OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('id', oauthState.id)

    // Return success page that closes the popup
    return new Response(`
      <html>
        <body>
          <h1>Successfully Connected!</h1>
          <p>Your ${platform} account has been connected successfully.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth_success',
                platform: '${platform}',
                connection: ${JSON.stringify(userProfile)}
              }, '*');
            }
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('OAuth callback error:', error)
    return new Response(`
      <html>
        <body>
          <h1>OAuth Error</h1>
          <p>Failed to complete authorization: ${error.message}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth_error',
                error: '${error.message}'
              }, '*');
            }
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
})
