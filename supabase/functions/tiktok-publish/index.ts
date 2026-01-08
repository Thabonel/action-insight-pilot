// TikTok Publishing Edge Function
// Publishes videos to TikTok via Blotato API
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TikTokPublishRequest {
  user_id: string
  video_url: string
  caption: string
  hashtags?: string[]
  privacy?: 'public' | 'friends' | 'private'
  published_video_id?: string
}

interface BlotatoResponse {
  success: boolean
  post_id?: string
  tiktok_video_id?: string
  tiktok_url?: string
  error?: string
  message?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Blotato API key from environment
    const blotatoApiKey = Deno.env.get('BLOTATO_API_KEY')
    if (!blotatoApiKey) {
      throw new Error('BLOTATO_API_KEY not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const body: TikTokPublishRequest = await req.json()
    const { user_id, video_url, caption, hashtags = [], privacy = 'public', published_video_id } = body

    // Validate required fields
    if (!user_id || !video_url || !caption) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, video_url, caption'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[TikTok Publish] Starting publish for user:', user_id)

    // Fetch user's TikTok OAuth connection
    const { data: connection, error: connError } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform_name', 'tiktok')
      .single()

    if (connError || !connection) {
      console.error('[TikTok Publish] No TikTok connection found:', connError)
      return new Response(
        JSON.stringify({
          error: 'TikTok account not connected. Please connect your TikTok account first.',
          code: 'TIKTOK_NOT_CONNECTED'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (connection.connection_status !== 'connected') {
      console.error('[TikTok Publish] TikTok connection not active:', connection.connection_status)
      return new Response(
        JSON.stringify({
          error: `TikTok connection is ${connection.connection_status}. Please reconnect your account.`,
          code: 'TIKTOK_CONNECTION_EXPIRED'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Decrypt access token (Note: Implement proper decryption in production)
    // For now, assuming token is stored in a retrievable format
    const accessToken = connection.access_token_encrypted

    // Build caption with hashtags
    const fullCaption = hashtags.length > 0
      ? `${caption} ${hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`
      : caption

    // Ensure caption is within TikTok limits (2200 characters)
    const finalCaption = fullCaption.substring(0, 2200)

    console.log('[TikTok Publish] Publishing to Blotato API...')
    console.log('[TikTok Publish] Video URL:', video_url)
    console.log('[TikTok Publish] Caption length:', finalCaption.length)

    // Call Blotato API to publish to TikTok
    const blotatoResponse = await fetch('https://backend.blotato.com/v2/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${blotatoApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'tiktok',
        user_access_token: accessToken,
        video_url: video_url,
        caption: finalCaption,
        privacy: privacy,
        metadata: {
          published_video_id: published_video_id,
          user_id: user_id
        }
      })
    })

    const blotatoData: BlotatoResponse = await blotatoResponse.json()

    console.log('[TikTok Publish] Blotato response status:', blotatoResponse.status)
    console.log('[TikTok Publish] Blotato response:', blotatoData)

    if (!blotatoResponse.ok || !blotatoData.success) {
      const errorMessage = blotatoData.error || blotatoData.message || 'Unknown error from Blotato API'
      console.error('[TikTok Publish] Blotato API error:', errorMessage)

      // Update published_videos record with failure
      if (published_video_id) {
        await supabase
          .from('published_videos')
          .update({
            platforms: {
              tiktok: {
                status: 'failed',
                error_message: errorMessage,
                retry_count: 0,
                failed_at: new Date().toISOString()
              }
            },
            overall_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', published_video_id)
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          code: 'BLOTATO_API_ERROR'
        }),
        {
          status: blotatoResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract TikTok video ID and URL from Blotato response
    const tiktokVideoId = blotatoData.tiktok_video_id || blotatoData.post_id
    const tiktokUrl = blotatoData.tiktok_url

    console.log('[TikTok Publish] Success! TikTok video ID:', tiktokVideoId)
    console.log('[TikTok Publish] TikTok URL:', tiktokUrl)

    // Update published_videos record with success
    if (published_video_id) {
      const { error: updateError } = await supabase
        .from('published_videos')
        .update({
          platforms: {
            tiktok: {
              status: 'published',
              platform_video_id: tiktokVideoId,
              platform_url: tiktokUrl,
              caption: finalCaption,
              hashtags: hashtags,
              published_at: new Date().toISOString(),
              error_message: null,
              retry_count: 0
            }
          },
          overall_status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', published_video_id)

      if (updateError) {
        console.error('[TikTok Publish] Error updating database:', updateError)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        platform: 'tiktok',
        platform_video_id: tiktokVideoId,
        platform_url: tiktokUrl,
        caption: finalCaption,
        published_at: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('[TikTok Publish] Unexpected error:', error)
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
