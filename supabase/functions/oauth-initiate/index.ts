import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OAuthConfig {
  clientId: string
  clientSecret: string
  authUrl: string
  scopes: string[]
}

const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  facebook: {
    clientId: Deno.env.get('FACEBOOK_CLIENT_ID') || '',
    clientSecret: Deno.env.get('FACEBOOK_CLIENT_SECRET') || '',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list']
  },
  instagram: {
    clientId: Deno.env.get('INSTAGRAM_CLIENT_ID') || '',
    clientSecret: Deno.env.get('INSTAGRAM_CLIENT_SECRET') || '',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['user_profile', 'user_media']
  },
  twitter: {
    clientId: Deno.env.get('TWITTER_CLIENT_ID') || '',
    clientSecret: Deno.env.get('TWITTER_CLIENT_SECRET') || '',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: ['tweet.read', 'tweet.write', 'users.read']
  },
  linkedin: {
    clientId: Deno.env.get('LINKEDIN_CLIENT_ID') || '',
    clientSecret: Deno.env.get('LINKEDIN_CLIENT_SECRET') || '',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['r_liteprofile', 'w_member_social']
  },
  youtube: {
    clientId: Deno.env.get('YOUTUBE_CLIENT_ID') || '',
    clientSecret: Deno.env.get('YOUTUBE_CLIENT_SECRET') || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly']
  },
  tiktok: {
    clientId: Deno.env.get('TIKTOK_CLIENT_ID') || '',
    clientSecret: Deno.env.get('TIKTOK_CLIENT_SECRET') || '',
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    scopes: ['user.info.basic', 'video.upload']
  }
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

    const { platform } = await req.json()
    
    if (!platform || !OAUTH_CONFIGS[platform]) {
      throw new Error('Invalid platform')
    }

    const config = OAUTH_CONFIGS[platform]
    const stateToken = crypto.randomUUID()
    const redirectUri = `${req.headers.get('origin')}/oauth/callback`

    // Store OAuth state
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        user_id: user.id,
        platform_name: platform,
        state_token: stateToken,
        redirect_uri: redirectUri
      })

    if (stateError) {
      console.error('Error storing OAuth state:', stateError)
      throw new Error('Failed to initialize OAuth flow')
    }

    // Build authorization URL
    const authUrl = new URL(config.authUrl)
    authUrl.searchParams.set('client_id', config.clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', config.scopes.join(' '))
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', stateToken)

    // Add platform-specific parameters
    if (platform === 'twitter') {
      authUrl.searchParams.set('code_challenge', 'challenge')
      authUrl.searchParams.set('code_challenge_method', 'plain')
    }

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('OAuth initiate error:', error)
    // Return generic error to client, log full error server-side
    const publicError = error.message?.includes('authorization')
      ? 'Authentication required'
      : error.message?.includes('Invalid platform')
      ? 'Invalid platform specified'
      : 'Failed to initiate OAuth flow';
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