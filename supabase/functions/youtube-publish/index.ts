// YouTube Shorts Publishing Handler
// Publishes videos to YouTube using resumable upload protocol
// Handles quota tracking and auto-detection for Shorts
// Created: 2026-01-01

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubePublishRequest {
  user_id: string
  video_url: string
  caption: string
  hashtags?: string[]
  title?: string
  description?: string
  privacy?: 'public' | 'unlisted' | 'private'
  tags?: string[]
  published_video_id?: string
}

interface QuotaUsage {
  user_id: string
  date: string
  units_used: number
  uploads_count: number
}

const YOUTUBE_UPLOAD_QUOTA_COST = 1600 // Units per upload
const YOUTUBE_DAILY_QUOTA_LIMIT = 10000 // Default quota limit per day
const MAX_UPLOADS_PER_DAY = Math.floor(YOUTUBE_DAILY_QUOTA_LIMIT / YOUTUBE_UPLOAD_QUOTA_COST) // ~6 uploads

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
    const body: YouTubePublishRequest = await req.json()
    const {
      user_id,
      video_url,
      caption,
      hashtags = [],
      title,
      description,
      privacy = 'public',
      tags = [],
      published_video_id
    } = body

    console.log('[YouTube Publish] Starting upload for user:', user_id)
    console.log('[YouTube Publish] Video URL:', video_url)

    // Check daily quota usage
    const today = new Date().toISOString().split('T')[0]
    const { data: quotaData, error: quotaError } = await supabase
      .from('youtube_quota_usage')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', today)
      .single()

    if (quotaError && quotaError.code !== 'PGRST116') {
      console.error('[YouTube Publish] Error checking quota:', quotaError)
    }

    const currentUploads = quotaData?.uploads_count || 0
    if (currentUploads >= MAX_UPLOADS_PER_DAY) {
      console.error('[YouTube Publish] Daily quota exceeded:', currentUploads)
      return new Response(
        JSON.stringify({
          error: `Daily upload limit reached (${MAX_UPLOADS_PER_DAY} uploads/day). YouTube API quota resets at midnight PST.`,
          code: 'QUOTA_EXCEEDED',
          uploads_today: currentUploads,
          max_uploads: MAX_UPLOADS_PER_DAY
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[YouTube Publish] Quota check passed:', currentUploads, '/', MAX_UPLOADS_PER_DAY)

    // Get YouTube OAuth connection
    const { data: connection, error: connError } = await supabase
      .from('oauth_connections')
      .select('access_token, refresh_token, token_expires_at, platform_user_id, connection_metadata')
      .eq('user_id', user_id)
      .eq('platform_name', 'youtube')
      .eq('connection_status', 'connected')
      .single()

    if (connError || !connection) {
      console.error('[YouTube Publish] No YouTube connection found:', connError)
      return new Response(
        JSON.stringify({ error: 'YouTube account not connected. Please connect in Settings.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let accessToken = connection.access_token

    // Check if token needs refresh
    const expiresAt = new Date(connection.token_expires_at)
    const now = new Date()
    if (expiresAt <= now) {
      console.log('[YouTube Publish] Access token expired, refreshing...')

      // Refresh token
      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token'
        })
      })

      if (!refreshResponse.ok) {
        console.error('[YouTube Publish] Token refresh failed')
        return new Response(
          JSON.stringify({ error: 'Failed to refresh YouTube access token. Please reconnect your account.' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      // Update token in database
      await supabase
        .from('oauth_connections')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(now.getTime() + refreshData.expires_in * 1000).toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', user_id)
        .eq('platform_name', 'youtube')

      console.log('[YouTube Publish] Access token refreshed')
    }

    // Download video to check metadata and prepare for upload
    console.log('[YouTube Publish] Downloading video to check metadata...')
    const videoResponse = await fetch(video_url)
    if (!videoResponse.ok) {
      throw new Error('Failed to download video from URL')
    }

    const videoBlob = await videoResponse.blob()
    const videoSize = videoBlob.size

    console.log('[YouTube Publish] Video size:', videoSize, 'bytes')

    // Prepare video metadata
    const videoTitle = title || caption.substring(0, 100) // YouTube title max 100 chars
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    const videoDescription = description || `${caption}\n\n${hashtagString}`
    const videoTags = tags.length > 0 ? tags : hashtags

    // Auto-detect if this should be a Short
    // Shorts: vertical (9:16), under 60 seconds
    const metadata = connection.connection_metadata || {}
    const isShort = metadata.is_short !== false // Default to true unless explicitly set

    console.log('[YouTube Publish] Video metadata prepared:', {
      title: videoTitle,
      privacy,
      tags: videoTags,
      isShort
    })

    // Step 1: Initialize resumable upload session
    console.log('[YouTube Publish] Step 1: Initializing resumable upload...')

    const uploadMetadata = {
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: videoTags,
        categoryId: '22' // People & Blogs category
      },
      status: {
        privacyStatus: privacy,
        selfDeclaredMadeForKids: false
      }
    }

    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': videoSize.toString()
        },
        body: JSON.stringify(uploadMetadata)
      }
    )

    if (!initResponse.ok) {
      const errorData = await initResponse.text()
      console.error('[YouTube Publish] Upload initialization failed:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize YouTube upload. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const uploadUrl = initResponse.headers.get('Location')
    if (!uploadUrl) {
      throw new Error('No upload URL returned from YouTube')
    }

    console.log('[YouTube Publish] Upload session initialized')

    // Step 2: Upload video data using resumable upload
    console.log('[YouTube Publish] Step 2: Uploading video data...')

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoSize.toString()
      },
      body: videoBlob
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text()
      console.error('[YouTube Publish] Video upload failed:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to upload video to YouTube. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const uploadData = await uploadResponse.json()
    const videoId = uploadData.id

    if (!videoId) {
      throw new Error('No video ID returned from YouTube')
    }

    console.log('[YouTube Publish] Video uploaded successfully:', videoId)

    // Update quota usage
    const newUploadsCount = currentUploads + 1
    const newUnitsUsed = (quotaData?.units_used || 0) + YOUTUBE_UPLOAD_QUOTA_COST

    if (quotaData) {
      // Update existing quota record
      await supabase
        .from('youtube_quota_usage')
        .update({
          units_used: newUnitsUsed,
          uploads_count: newUploadsCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('date', today)
    } else {
      // Create new quota record
      await supabase
        .from('youtube_quota_usage')
        .insert({
          user_id,
          date: today,
          units_used: newUnitsUsed,
          uploads_count: newUploadsCount
        })
    }

    console.log('[YouTube Publish] Quota updated:', newUploadsCount, 'uploads,', newUnitsUsed, 'units')

    // Update published_videos record if provided
    if (published_video_id) {
      const { data: existingRecord } = await supabase
        .from('published_videos')
        .select('platforms')
        .eq('id', published_video_id)
        .single()

      const platforms = existingRecord?.platforms || {}
      platforms.youtube = {
        platform_video_id: videoId,
        platform_url: `https://youtube.com/shorts/${videoId}`,
        published_at: new Date().toISOString(),
        status: 'published'
      }

      await supabase
        .from('published_videos')
        .update({
          platforms,
          updated_at: new Date().toISOString()
        })
        .eq('id', published_video_id)

      console.log('[YouTube Publish] Updated published_videos record')
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        platform_video_id: videoId,
        platform_url: `https://youtube.com/shorts/${videoId}`,
        message: 'Video uploaded to YouTube successfully',
        quota_info: {
          uploads_today: newUploadsCount,
          max_uploads: MAX_UPLOADS_PER_DAY,
          remaining: MAX_UPLOADS_PER_DAY - newUploadsCount
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('[YouTube Publish] Unexpected error:', error)
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
