// Instagram OAuth Callback Handler
// Handles OAuth authorization callback from Instagram/Facebook
// Exchanges authorization code for access token and stores in oauth_connections
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Instagram/Facebook OAuth Configuration
const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID')!
const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')!
const REDIRECT_URI = Deno.env.get('INSTAGRAM_REDIRECT_URI') || 'https://your-app.com/oauth/instagram/callback'

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
    const errorReason = url.searchParams.get('error_reason')
    const errorDescription = url.searchParams.get('error_description')

    if (error) {
      console.error('[Instagram OAuth] Authorization error:', { error, errorReason, errorDescription })
      return new Response(
        JSON.stringify({
          error: `Instagram authorization failed: ${errorDescription || error}`
        }),
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

    console.log('[Instagram OAuth] Exchanging code for access token...')

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `code=${authCode}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('[Instagram OAuth] Token exchange failed:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to exchange authorization code for access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    if (!access_token) {
      console.error('[Instagram OAuth] No access token in response:', tokenData)
      return new Response(
        JSON.stringify({ error: 'No access token received from Instagram' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Instagram OAuth] Access token received, fetching user info...')

    // Get user's Facebook pages and Instagram accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
    )

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.text()
      console.error('[Instagram OAuth] Failed to fetch pages:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Facebook pages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pagesData = await pagesResponse.json()
    const pages = pagesData.data || []

    // Find Instagram Business Account linked to a page
    let instagramAccountId = null
    let instagramUsername = null
    let pageAccessToken = null

    for (const page of pages) {
      // Get Instagram account connected to this page
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )

      if (igResponse.ok) {
        const igData = await igResponse.json()
        if (igData.instagram_business_account) {
          instagramAccountId = igData.instagram_business_account.id
          pageAccessToken = page.access_token

          // Get Instagram username
          const usernameResponse = await fetch(
            `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=username&access_token=${pageAccessToken}`
          )

          if (usernameResponse.ok) {
            const usernameData = await usernameResponse.json()
            instagramUsername = usernameData.username
          }

          break // Use first Instagram Business Account found
        }
      }
    }

    if (!instagramAccountId) {
      return new Response(
        JSON.stringify({
          error: 'No Instagram Business Account found. Please ensure you have a Business or Creator account linked to a Facebook Page.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Instagram OAuth] Instagram Business Account found:', { instagramAccountId, instagramUsername })

    // Exchange for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${pageAccessToken}`
    )

    let finalAccessToken = pageAccessToken
    let expiresIn = 5184000 // 60 days default

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json()
      if (longLivedData.access_token) {
        finalAccessToken = longLivedData.access_token
        expiresIn = longLivedData.expires_in || expiresIn
      }
    }

    // Calculate expiry time
    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + expiresIn * 1000)

    // Store or update oauth_connection
    const { data: existingConnection } = await supabase
      .from('oauth_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform_name', 'instagram')
      .single()

    if (existingConnection) {
      // Update existing connection
      await supabase
        .from('oauth_connections')
        .update({
          access_token: finalAccessToken,
          token_expires_at: accessTokenExpiresAt.toISOString(),
          connection_status: 'connected',
          platform_user_id: instagramAccountId,
          connection_metadata: {
            instagram_username: instagramUsername,
            account_type: 'business',
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
          platform_name: 'instagram',
          access_token: finalAccessToken,
          token_expires_at: accessTokenExpiresAt.toISOString(),
          connection_status: 'connected',
          platform_user_id: instagramAccountId,
          connection_metadata: {
            instagram_username: instagramUsername,
            account_type: 'business',
            method: 'direct_api',
          },
        })
    }

    console.log('[Instagram OAuth] Successfully stored Instagram connection')

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Instagram Business account connected successfully',
        platform_user_id: instagramAccountId,
        username: instagramUsername,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[Instagram OAuth] Unexpected error:', error)
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
