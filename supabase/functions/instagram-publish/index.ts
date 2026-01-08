// Instagram Reels Publishing Edge Function
// Publishes videos to Instagram Reels via Facebook Graph API
// Handles video processing polling and Business account validation
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublishRequest {
  user_id: string
  video_url: string
  caption: string
  hashtags?: string[]
  location_id?: string
  share_to_feed?: boolean
  published_video_id?: string
}

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

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const body: PublishRequest = await req.json()
    const {
      video_url,
      caption,
      hashtags = [],
      location_id,
      share_to_feed = false,
      published_video_id
    } = body

    console.log('[Instagram Publish] Publishing video for user:', user.id)

    // Fetch Instagram OAuth connection
    const { data: connection, error: connError } = await supabase
      .from('oauth_connections')
      .select('access_token, platform_user_id, connection_metadata')
      .eq('user_id', user.id)
      .eq('platform_name', 'instagram')
      .eq('connection_status', 'connected')
      .single()

    if (connError || !connection) {
      console.error('[Instagram Publish] No Instagram connection found:', connError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Instagram account not connected. Please connect your Instagram Business account in Settings.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify this is a Business account
    if (connection.connection_metadata?.account_type !== 'business') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Instagram Reels publishing requires a Business or Creator account. Personal accounts are not supported by the Instagram API.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accessToken = connection.access_token
    const instagramAccountId = connection.platform_user_id

    // Build caption with hashtags
    let fullCaption = caption
    if (hashtags.length > 0) {
      fullCaption += '\n\n' + hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    }

    // Step 1: Create media container (upload video)
    console.log('[Instagram Publish] Step 1: Creating media container...')

    const containerParams = new URLSearchParams({
      media_type: 'REELS',
      video_url: video_url,
      caption: fullCaption.substring(0, 2200), // Instagram max caption length
      share_to_feed: share_to_feed.toString(),
      access_token: accessToken,
    })

    if (location_id) {
      containerParams.append('location_id', location_id)
    }

    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        method: 'POST',
        body: containerParams,
      }
    )

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      console.error('[Instagram Publish] Container creation failed:', errorData)

      let errorMessage = 'Failed to create Instagram media container'
      if (errorData.error?.message) {
        errorMessage = errorData.error instanceof Error ? error.message : String(error)
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const containerData = await containerResponse.json()
    const containerId = containerData.id

    if (!containerId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No container ID received from Instagram'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Instagram Publish] Container created:', containerId)

    // Step 2: Poll for processing status
    console.log('[Instagram Publish] Step 2: Polling for video processing...')

    let processingStatus = 'IN_PROGRESS'
    let pollAttempts = 0
    const maxPollAttempts = 60 // 5 minutes max (5 seconds * 60)

    while (pollAttempts < maxPollAttempts && processingStatus === 'IN_PROGRESS') {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(
        `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
      )

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        processingStatus = statusData.status_code

        console.log('[Instagram Publish] Processing status:', {
          status: processingStatus,
          attempt: pollAttempts + 1,
          containerId
        })

        if (processingStatus === 'FINISHED') {
          break
        } else if (processingStatus === 'ERROR') {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Instagram failed to process the video. Please check video format and size (max 1GB, MP4 format).'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      pollAttempts++
    }

    if (processingStatus !== 'FINISHED') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Video processing timed out. Instagram may still be processing the video. Try again in a few minutes.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Publish the container
    console.log('[Instagram Publish] Step 3: Publishing container...')

    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error('[Instagram Publish] Publishing failed:', errorData)

      return new Response(
        JSON.stringify({
          success: false,
          error: errorData.error?.message || 'Failed to publish to Instagram'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const publishData = await publishResponse.json()
    const mediaId = publishData.id

    console.log('[Instagram Publish] Successfully published:', mediaId)

    // Update published_videos record if provided
    if (published_video_id) {
      const platformData = {
        instagram: {
          status: 'published',
          media_id: mediaId,
          container_id: containerId,
          published_at: new Date().toISOString(),
        }
      }

      await supabase
        .from('published_videos')
        .update({
          platforms: platformData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', published_video_id)
    }

    // Build Instagram Reel URL
    const username = connection.connection_metadata?.instagram_username
    const platform_url = username
      ? `https://www.instagram.com/${username}/reel/${mediaId}/`
      : `https://www.instagram.com/reel/${mediaId}/`

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        platform: 'instagram',
        platform_video_id: mediaId,
        platform_url: platform_url,
        message: 'Successfully published to Instagram Reels',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('[Instagram Publish] Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error) || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
