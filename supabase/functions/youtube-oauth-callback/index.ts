// YouTube OAuth Callback Handler
// Handles OAuth authorization callback from Google
// Exchanges authorization code for access token and refresh token
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const REDIRECT_URI = Deno.env.get('YOUTUBE_REDIRECT_URI') || 'https://your-app.com/oauth/youtube/callback'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get authorization code from query params
    const url = new URL(req.url)
    const authCode = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      console.error('[YouTube OAuth] Authorization error:', error)
      return new Response(
        JSON.stringify({ error: `YouTube authorization failed: ${error}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authCode) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decode state to get user_id (state should be base64 encoded user_id)
    let userId: string
    try {
      userId = atob(state || '')
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[YouTube OAuth] Exchanging code for access token...')

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('[YouTube OAuth] Token exchange failed:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to exchange authorization code for access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    const {
      access_token,
      refresh_token,
      expires_in,
      scope,
    } = tokenData

    if (!access_token || !refresh_token) {
      console.error('[YouTube OAuth] Missing tokens in response:', tokenData)
      return new Response(
        JSON.stringify({ error: 'No access token or refresh token received from Google' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[YouTube OAuth] Tokens received, fetching channel info...')

    // Get YouTube channel information
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    )

    if (!channelResponse.ok) {
      const errorData = await channelResponse.text()
      console.error('[YouTube OAuth] Failed to fetch channel:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch YouTube channel information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const channelData = await channelResponse.json()
    const channels = channelData.items || []

    if (channels.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No YouTube channel found. Please create a YouTube channel before connecting.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const channel = channels[0]
    const channelId = channel.id
    const channelTitle = channel.snippet?.title
    const channelThumbnail = channel.snippet?.thumbnails?.default?.url

    console.log('[YouTube OAuth] Channel found:', { channelId, channelTitle })

    // Calculate expiry time
    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + expires_in * 1000)

    // Store or update oauth_connection
    const { data: existingConnection } = await supabase
      .from('oauth_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform_name', 'youtube')
      .single()

    if (existingConnection) {
      // Update existing connection
      await supabase
        .from('oauth_connections')
        .update({
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: accessTokenExpiresAt.toISOString(),
          connection_status: 'connected',
          platform_user_id: channelId,
          scopes: scope ? scope.split(' ') : [],
          connection_metadata: {
            channel_title: channelTitle,
            channel_thumbnail: channelThumbnail,
            method: 'direct_api',
          },
          updated_at: now.toISOString(),
        })
        .eq('id', existingConnection.id)
    } else {
      // Create new connection
      await supabase
        .from('oauth_connections')
        .insert({
          user_id: userId,
          platform_name: 'youtube',
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: accessTokenExpiresAt.toISOString(),
          connection_status: 'connected',
          platform_user_id: channelId,
          scopes: scope ? scope.split(' ') : [],
          connection_metadata: {
            channel_title: channelTitle,
            channel_thumbnail: channelThumbnail,
            method: 'direct_api',
          },
        })
    }

    console.log('[YouTube OAuth] Successfully stored YouTube connection')

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'YouTube channel connected successfully',
        platform_user_id: channelId,
        channel_title: channelTitle,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[YouTube OAuth] Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
