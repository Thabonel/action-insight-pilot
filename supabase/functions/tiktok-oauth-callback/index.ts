// TikTok OAuth Callback Handler
// Handles OAuth authorization callback from TikTok
// Exchanges authorization code for access token and stores in oauth_connections
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TikTok OAuth Configuration
const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY')!
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET')!
const REDIRECT_URI = Deno.env.get('TIKTOK_REDIRECT_URI') || 'https://your-app.com/oauth/tiktok/callback'

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
      console.error('[TikTok OAuth] Authorization error:', error)
      return new Response(
        JSON.stringify({ error: `TikTok authorization failed: ${error}` }),
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

    console.log('[TikTok OAuth] Exchanging code for access token...')

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('[TikTok OAuth] Token exchange failed:', errorData)
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
      refresh_expires_in,
      open_id,
      scope,
    } = tokenData

    if (!access_token) {
      console.error('[TikTok OAuth] No access token in response:', tokenData)
      return new Response(
        JSON.stringify({ error: 'No access token received from TikTok' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[TikTok OAuth] Access token received, storing in database...')

    // Calculate expiry times
    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + expires_in * 1000)
    const refreshTokenExpiresAt = refresh_expires_in
      ? new Date(now.getTime() + refresh_expires_in * 1000)
      : null

    // Store or update oauth_connection
    const { data: existingConnection } = await supabase
      .from('oauth_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform_name', 'tiktok')
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
          platform_user_id: open_id,
          scopes: scope ? scope.split(',') : [],
          connection_metadata: {
            refresh_expires_at: refreshTokenExpiresAt?.toISOString(),
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
          platform_name: 'tiktok',
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: accessTokenExpiresAt.toISOString(),
          connection_status: 'connected',
          platform_user_id: open_id,
          scopes: scope ? scope.split(',') : [],
          connection_metadata: {
            refresh_expires_at: refreshTokenExpiresAt?.toISOString(),
            method: 'direct_api',
          },
        })
    }

    console.log('[TikTok OAuth] Successfully stored TikTok connection')

    // Return success response (this would typically redirect to frontend)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'TikTok account connected successfully',
        platform_user_id: open_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[TikTok OAuth] Unexpected error:', error)
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
