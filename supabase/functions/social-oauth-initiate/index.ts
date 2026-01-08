
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
}

const platformConfigs: Record<string, Omit<OAuthConfig, 'clientId' | 'clientSecret'>> = {
  buffer: {
    redirectUri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-oauth-callback`,
    scopes: ['publish', 'profiles'],
    authUrl: 'https://bufferapp.com/oauth2/authorize'
  },
  hootsuite: {
    redirectUri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-oauth-callback`,
    scopes: ['read', 'write'],
    authUrl: 'https://platform.hootsuite.com/oauth2/auth'
  },
  later: {
    redirectUri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-oauth-callback`,
    scopes: ['publish', 'read'],
    authUrl: 'https://api.later.com/oauth2/authorize'
  },
  sprout_social: {
    redirectUri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-oauth-callback`,
    scopes: ['content', 'analytics'],
    authUrl: 'https://api.sproutsocial.com/oauth/authorize'
  }
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { platform } = await req.json()
    
    if (!platformConfigs[platform]) {
      return new Response(
        JSON.stringify({ error: 'Unsupported platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get platform credentials from Supabase secrets
    const clientId = Deno.env.get(`${platform.toUpperCase()}_CLIENT_ID`)
    const clientSecret = Deno.env.get(`${platform.toUpperCase()}_CLIENT_SECRET`)

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: `${platform} credentials not configured` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate secure state token
    const stateToken = crypto.randomUUID()
    const config = platformConfigs[platform]

    // Store OAuth state in database
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        user_id: user.id,
        state_token: stateToken,
        platform_name: platform,
        redirect_uri: config.redirectUri
      })

    if (stateError) {
      console.error('Error storing OAuth state:', stateError)
      return new Response(
        JSON.stringify({ error: 'Failed to initiate OAuth flow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build authorization URL
    const authUrl = new URL(config.authUrl)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', config.redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', config.scopes.join(' '))
    authUrl.searchParams.set('state', `${platform}:${stateToken}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: { 
          authorization_url: authUrl.toString(),
          state: stateToken 
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('OAuth initiate error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
