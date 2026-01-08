// Publish Video Orchestrator Edge Function
// Coordinates video publishing to multiple platforms (TikTok, Instagram, YouTube)
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublishVideoRequest {
  video_project_id: string
  platforms: string[] // ['tiktok', 'instagram', 'youtube']
  caption: string
  hashtags?: string[]
  scheduled_for?: string // ISO 8601 timestamp
  platform_options?: {
    tiktok?: {
      privacy?: 'public' | 'friends' | 'private'
    }
    instagram?: {
      share_to_feed?: boolean
    }
    youtube?: {
      title?: string
      description?: string
      privacy?: 'public' | 'unlisted' | 'private'
      tags?: string[]
    }
  }
}

interface PlatformResult {
  platform: string
  status: 'published' | 'failed' | 'skipped'
  platform_video_id?: string
  platform_url?: string
  error?: string
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
    const body: PublishVideoRequest = await req.json()
    const {
      video_project_id,
      platforms = [],
      caption,
      hashtags = [],
      scheduled_for,
      platform_options = {}
    } = body

    // Validate required fields
    if (!video_project_id || !caption || platforms.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: video_project_id, caption, platforms'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Publish Video] Starting publish for user:', user.id)
    console.log('[Publish Video] Platforms:', platforms)
    console.log('[Publish Video] Scheduled:', scheduled_for)

    // Fetch video project
    const { data: videoProject, error: projectError } = await supabase
      .from('ai_video_projects')
      .select('*')
      .eq('id', video_project_id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !videoProject) {
      console.error('[Publish Video] Video project not found:', projectError)
      return new Response(
        JSON.stringify({ error: 'Video project not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!videoProject.video_url) {
      return new Response(
        JSON.stringify({ error: 'Video file not found. Please generate the video first.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Publish Video] Video URL:', videoProject.video_url)

    // Create published_videos record
    const { data: publishedVideo, error: createError } = await supabase
      .from('published_videos')
      .insert({
        user_id: user.id,
        video_project_id: video_project_id,
        video_url: videoProject.video_url,
        video_duration_s: videoProject.duration_s,
        video_format: 'mp4',
        video_aspect_ratio: videoProject.platform === 'Landscape' ? '16:9' : '9:16',
        caption,
        hashtags,
        scheduled_for: scheduled_for ? new Date(scheduled_for).toISOString() : null,
        overall_status: scheduled_for ? 'scheduled' : 'pending',
        platforms: {}
      })
      .select()
      .single()

    if (createError || !publishedVideo) {
      console.error('[Publish Video] Error creating published_videos record:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create publishing record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Publish Video] Created published_videos record:', publishedVideo.id)

    // If scheduled, add to queue and return
    if (scheduled_for) {
      console.log('[Publish Video] Scheduling for:', scheduled_for)

      // Add each platform to publishing queue
      for (const platform of platforms) {
        await supabase
          .from('publishing_queue')
          .insert({
            user_id: user.id,
            published_video_id: publishedVideo.id,
            scheduled_for: new Date(scheduled_for).toISOString(),
            platform,
            platform_options: platform_options[platform as keyof typeof platform_options] || {},
            status: 'queued'
          })
      }

      return new Response(
        JSON.stringify({
          success: true,
          published_video_id: publishedVideo.id,
          status: 'scheduled',
          scheduled_for: scheduled_for,
          platforms: platforms,
          message: `Video scheduled to publish to ${platforms.length} platform(s) on ${new Date(scheduled_for).toLocaleString()}`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Publish immediately to all platforms in parallel
    console.log('[Publish Video] Publishing immediately to platforms...')

    const publishResults: PlatformResult[] = []

    // Publish to each platform
    for (const platform of platforms) {
      try {
        if (platform === 'tiktok') {
          // Determine which TikTok publishing method to use
          // Check oauth_connections to see if user has Blotato or Direct API configured
          const { data: tiktokConnection } = await supabase
            .from('oauth_connections')
            .select('connection_metadata')
            .eq('user_id', user.id)
            .eq('platform_name', 'tiktok')
            .eq('connection_status', 'connected')
            .single()

          // Determine which edge function to call
          const publishMethod = tiktokConnection?.connection_metadata?.method || 'blotato'
          const edgeFunctionName = publishMethod === 'direct_api' ? 'tiktok-publish-direct' : 'tiktok-publish'

          console.log(`[Publish Video] Using TikTok ${publishMethod} method via ${edgeFunctionName}`)

          // Call appropriate TikTok publish edge function
          const tiktokResult = await fetch(`${supabaseUrl}/functions/v1/${edgeFunctionName}`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              video_url: videoProject.video_url,
              caption,
              hashtags,
              privacy: platform_options?.tiktok?.privacy || 'public',
              published_video_id: publishedVideo.id
            })
          })

          const tiktokData = await tiktokResult.json()

          if (tiktokResult.ok && tiktokData.success) {
            publishResults.push({
              platform: 'tiktok',
              status: 'published',
              platform_video_id: tiktokData.platform_video_id,
              platform_url: tiktokData.platform_url
            })
          } else {
            publishResults.push({
              platform: 'tiktok',
              status: 'failed',
              error: tiktokData.error || 'Unknown error'
            })
          }
        } else if (platform === 'instagram') {
          // Call Instagram Reels publish edge function
          console.log('[Publish Video] Publishing to Instagram Reels')

          const instagramResult = await fetch(`${supabaseUrl}/functions/v1/instagram-publish`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              video_url: videoProject.video_url,
              caption,
              hashtags,
              share_to_feed: platform_options?.instagram?.share_to_feed || false,
              published_video_id: publishedVideo.id
            })
          })

          const instagramData = await instagramResult.json()

          if (instagramResult.ok && instagramData.success) {
            publishResults.push({
              platform: 'instagram',
              status: 'published',
              platform_video_id: instagramData.platform_video_id,
              platform_url: instagramData.platform_url
            })
          } else {
            publishResults.push({
              platform: 'instagram',
              status: 'failed',
              error: instagramData.error || 'Unknown error'
            })
          }
        } else if (platform === 'youtube') {
          // YouTube Shorts publishing
          console.log('[Publish Video] Publishing to YouTube Shorts')

          const youtubeResult = await fetch(`${supabaseUrl}/functions/v1/youtube-publish`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              video_url: videoProject.video_url,
              caption,
              hashtags,
              title: platform_options?.youtube?.title,
              description: platform_options?.youtube?.description,
              privacy: platform_options?.youtube?.privacy || 'public',
              tags: platform_options?.youtube?.tags || [],
              published_video_id: publishedVideo.id
            })
          })

          const youtubeData = await youtubeResult.json()

          if (youtubeResult.ok && youtubeData.success) {
            publishResults.push({
              platform: 'youtube',
              status: 'published',
              platform_video_id: youtubeData.platform_video_id,
              platform_url: youtubeData.platform_url
            })
          } else {
            publishResults.push({
              platform: 'youtube',
              status: 'failed',
              error: youtubeData.error || 'Unknown error'
            })
          }
        } else if (platform === 'facebook') {
          // Facebook Reels publishing
          console.log('[Publish Video] Publishing to Facebook Reels')

          const facebookResult = await fetch(`${supabaseUrl}/functions/v1/facebook-publish`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              video_url: videoProject.video_url,
              caption,
              hashtags,
              published_video_id: publishedVideo.id
            })
          })

          const facebookData = await facebookResult.json()

          if (facebookResult.ok && facebookData.success) {
            publishResults.push({
              platform: 'facebook',
              status: 'published',
              platform_video_id: facebookData.platform_video_id,
              platform_url: facebookData.platform_url
            })
          } else {
            publishResults.push({
              platform: 'facebook',
              status: 'failed',
              error: facebookData.error || 'Unknown error'
            })
          }
        } else {
          publishResults.push({
            platform,
            status: 'skipped',
            error: `Platform ${platform} not yet supported`
          })
        }
      } catch (error: unknown) {
        console.error(`[Publish Video] Error publishing to ${platform}:`, error)
        publishResults.push({
          platform,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error) || 'Unknown error'
        })
      }
    }

    // Count successes and failures
    const successCount = publishResults.filter(r => r.status === 'published').length
    const failureCount = publishResults.filter(r => r.status === 'failed').length

    // Determine overall status
    let overallStatus: string
    if (successCount === platforms.length) {
      overallStatus = 'published'
    } else if (successCount > 0) {
      overallStatus = 'partially_published'
    } else {
      overallStatus = 'failed'
    }

    // Update published_videos record with final status
    await supabase
      .from('published_videos')
      .update({
        overall_status: overallStatus,
        published_at: successCount > 0 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', publishedVideo.id)

    console.log('[Publish Video] Publishing complete:', {
      success: successCount,
      failed: failureCount,
      total: platforms.length
    })

    // Return results
    return new Response(
      JSON.stringify({
        success: successCount > 0,
        published_video_id: publishedVideo.id,
        overall_status: overallStatus,
        results: publishResults,
        summary: {
          total_platforms: platforms.length,
          published: successCount,
          failed: failureCount,
          skipped: publishResults.filter(r => r.status === 'skipped').length
        },
        message: `Published to ${successCount} of ${platforms.length} platform(s) successfully`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('[Publish Video] Unexpected error:', error)
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
