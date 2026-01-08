// Facebook Reels Publishing Handler
// Publishes videos to Facebook Reels using Facebook Graph API
// Reuses Facebook OAuth connection from Instagram integration
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FacebookPublishRequest {
  user_id: string
  video_url: string
  caption: string
  hashtags?: string[]
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

    // Get request body
    const body: FacebookPublishRequest = await req.json()
    const {
      user_id,
      video_url,
      caption,
      hashtags = [],
      published_video_id
    } = body

    console.log('[Facebook Publish] Starting publish for user:', user_id)
    console.log('[Facebook Publish] Video URL:', video_url)

    // Get Facebook OAuth connection
    // Note: We can use either 'facebook' or 'instagram' connection
    // Both use the same Facebook OAuth and have Page access
    const { data: connections, error: connError } = await supabase
      .from('oauth_connections')
      .select('access_token, platform_user_id, connection_metadata, platform_name')
      .eq('user_id', user_id)
      .in('platform_name', ['facebook', 'instagram'])
      .eq('connection_status', 'connected')

    if (connError || !connections || connections.length === 0) {
      console.error('[Facebook Publish] No Facebook/Instagram connection found:', connError)
      return new Response(
        JSON.stringify({
          error: 'Facebook or Instagram account not connected. Please connect in Settings to publish to Facebook Reels.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prefer Facebook connection, fallback to Instagram
    const connection = connections.find(c => c.platform_name === 'facebook') || connections[0]
    const accessToken = connection.access_token

    // Get Facebook Page ID from connection metadata
    // If user connected via Instagram, we should have their linked Page ID
    let pageId = connection.connection_metadata?.facebook_page_id

    if (!pageId) {
      // If no Page ID stored, try to fetch it
      console.log('[Facebook Publish] No Page ID in metadata, fetching from API...')

      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
        { method: 'GET' }
      )

      if (!pagesResponse.ok) {
        console.error('[Facebook Publish] Failed to fetch Pages')
        return new Response(
          JSON.stringify({
            error: 'Unable to find Facebook Page. Please ensure you have a Facebook Page connected.'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const pagesData = await pagesResponse.json()
      const pages = pagesData.data || []

      if (pages.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'No Facebook Page found. You need a Facebook Page to publish Reels. Please create a Page first.'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Use first Page (or we could let user select)
      pageId = pages[0].id
      const pageAccessToken = pages[0].access_token // Pages have their own access tokens

      // Update connection metadata with Page info
      await supabase
        .from('oauth_connections')
        .update({
          connection_metadata: {
            ...connection.connection_metadata,
            facebook_page_id: pageId,
            facebook_page_name: pages[0].name,
            facebook_page_access_token: pageAccessToken
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('platform_name', connection.platform_name)

      console.log('[Facebook Publish] Page found and saved:', pages[0].name)
    }

    // Get Page access token (Pages have separate tokens with more permissions)
    const pageAccessToken = connection.connection_metadata?.facebook_page_access_token || accessToken

    // Prepare caption with hashtags
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    const fullCaption = `${caption}\n\n${hashtagString}`.trim()
    const description = fullCaption.substring(0, 2200) // Facebook limit

    console.log('[Facebook Publish] Publishing to Page ID:', pageId)
    console.log('[Facebook Publish] Description length:', description.length)

    // Publish Reel to Facebook
    // Facebook uses direct upload (no container processing like Instagram)
    console.log('[Facebook Publish] Uploading Reel...')

    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: pageAccessToken,
          upload_phase: 'start',
          description: description,
          video_state: {
            published: true // Publish immediately
          }
        })
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.text()
      console.error('[Facebook Publish] Upload failed:', errorData)

      // Check for common errors
      if (errorData.includes('permission')) {
        return new Response(
          JSON.stringify({
            error: 'Insufficient permissions to publish to Facebook Page. Please reconnect your account and grant all permissions.'
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to upload Reel to Facebook. Please try again or check video format.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const uploadData = await publishResponse.json()
    const videoSessionId = uploadData.video_id || uploadData.id

    if (!videoSessionId) {
      console.error('[Facebook Publish] No video session ID returned:', uploadData)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize Facebook Reel upload' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Facebook Publish] Video session created:', videoSessionId)

    // Upload video file
    console.log('[Facebook Publish] Transferring video file...')

    const transferResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: pageAccessToken,
          video_id: videoSessionId,
          upload_phase: 'transfer',
          video_file_chunk: video_url // Facebook can fetch from URL
        })
      }
    )

    if (!transferResponse.ok) {
      const errorData = await transferResponse.text()
      console.error('[Facebook Publish] Video transfer failed:', errorData)
      return new Response(
        JSON.stringify({
          error: 'Failed to transfer video to Facebook. Please ensure video is publicly accessible.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Facebook Publish] Video transferred successfully')

    // Finalize upload
    console.log('[Facebook Publish] Finalizing upload...')

    const finalizeResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: pageAccessToken,
          video_id: videoSessionId,
          upload_phase: 'finish'
        })
      }
    )

    if (!finalizeResponse.ok) {
      const errorData = await finalizeResponse.text()
      console.error('[Facebook Publish] Finalization failed:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to finalize Facebook Reel upload' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const finalData = await finalizeResponse.json()
    const reelId = finalData.id || videoSessionId

    console.log('[Facebook Publish] Reel published successfully:', reelId)

    // Construct Facebook Reel URL
    const platformUrl = `https://www.facebook.com/reel/${reelId}`

    // Update published_videos record if provided
    if (published_video_id) {
      const { data: existingRecord } = await supabase
        .from('published_videos')
        .select('platforms')
        .eq('id', published_video_id)
        .single()

      const platforms = existingRecord?.platforms || {}
      platforms.facebook = {
        platform_video_id: reelId,
        platform_url: platformUrl,
        published_at: new Date().toISOString(),
        status: 'published',
        page_id: pageId
      }

      await supabase
        .from('published_videos')
        .update({
          platforms,
          updated_at: new Date().toISOString()
        })
        .eq('id', published_video_id)

      console.log('[Facebook Publish] Updated published_videos record')
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        platform_video_id: reelId,
        platform_url: platformUrl,
        message: 'Facebook Reel published successfully',
        page_id: pageId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('[Facebook Publish] Unexpected error:', error)
    return new Response(
      JSON.stringify({
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
