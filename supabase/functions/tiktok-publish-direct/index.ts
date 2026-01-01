// TikTok Direct API Publishing Edge Function
// Publishes videos directly to TikTok using official TikTok API
// Alternative to Blotato - requires TikTok Developer approval
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
  privacy?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'
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
      privacy = 'PUBLIC_TO_EVERYONE',
      published_video_id
    } = body

    console.log('[TikTok Direct] Publishing video for user:', user.id)

    // Fetch TikTok OAuth connection
    const { data: connection, error: connError } = await supabase
      .from('oauth_connections')
      .select('access_token, platform_user_id, connection_metadata')
      .eq('user_id', user.id)
      .eq('platform_name', 'tiktok')
      .eq('connection_status', 'connected')
      .single()

    if (connError || !connection) {
      console.error('[TikTok Direct] No TikTok connection found:', connError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TikTok account not connected. Please connect your TikTok account in Settings.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify this is a direct API connection (not Blotato)
    if (connection.connection_metadata?.method !== 'direct_api') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'This TikTok connection is configured for Blotato. Please use the Blotato publishing method or reconnect with Direct API.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accessToken = connection.access_token

    // Step 1: Initialize video upload
    console.log('[TikTok Direct] Step 1: Initializing video upload...')

    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: privacy,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_URL',
          video_url: video_url,
        },
      }),
    })

    if (!initResponse.ok) {
      const errorText = await initResponse.text()
      console.error('[TikTok Direct] Init upload failed:', errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to initialize TikTok upload: ${errorText}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const initData = await initResponse.json()
    console.log('[TikTok Direct] Upload initialized:', initData)

    if (initData.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `TikTok API error: ${initData.error.message || initData.error.code}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const publishId = initData.data?.publish_id

    if (!publishId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No publish_id received from TikTok'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Check publish status (TikTok processes video asynchronously)
    console.log('[TikTok Direct] Step 2: Checking publish status...')

    // Poll for status (TikTok recommends polling every 5 seconds for up to 5 minutes)
    let statusCheckAttempts = 0
    let publishStatus = 'PROCESSING_UPLOAD'
    let shareId = null

    while (statusCheckAttempts < 12 && publishStatus === 'PROCESSING_UPLOAD') {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(
        `https://open.tiktokapis.com/v2/post/publish/status/fetch/?publish_id=${publishId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        publishStatus = statusData.data?.status
        shareId = statusData.data?.publicaly_available_post_id?.[0]

        console.log('[TikTok Direct] Status check:', { publishStatus, shareId, attempt: statusCheckAttempts + 1 })

        if (publishStatus === 'PUBLISH_COMPLETE') {
          break
        }
      }

      statusCheckAttempts++
    }

    // Update published_videos record if provided
    if (published_video_id) {
      const platformData = {
        tiktok: {
          status: publishStatus === 'PUBLISH_COMPLETE' ? 'published' : 'processing',
          publish_id: publishId,
          share_id: shareId,
          published_at: publishStatus === 'PUBLISH_COMPLETE' ? new Date().toISOString() : null,
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

    // Return response
    const platform_url = shareId
      ? `https://www.tiktok.com/@${connection.platform_user_id}/video/${shareId}`
      : null

    return new Response(
      JSON.stringify({
        success: true,
        platform: 'tiktok',
        platform_video_id: shareId || publishId,
        platform_url: platform_url,
        status: publishStatus,
        message: publishStatus === 'PUBLISH_COMPLETE'
          ? 'Video published successfully to TikTok'
          : 'Video is being processed by TikTok. Check back in a few minutes.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[TikTok Direct] Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
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
