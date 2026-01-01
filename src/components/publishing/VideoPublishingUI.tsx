// Video Publishing UI Component
// Main component for publishing videos to social platforms (TikTok, Instagram, YouTube)
// Created: 2026-01-01

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send, Calendar, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { PlatformSelector } from './PlatformSelector'
import { PublishingStatus } from './PublishingStatus'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook'

export interface PlatformResult {
  platform: Platform
  status: 'published' | 'failed' | 'skipped'
  platform_video_id?: string
  platform_url?: string
  error?: string
}

interface VideoPublishingUIProps {
  videoProjectId: string
  videoUrl: string
  defaultCaption?: string
  onPublishComplete?: (results: PlatformResult[]) => void
}

export function VideoPublishingUI({
  videoProjectId,
  videoUrl,
  defaultCaption = '',
  onPublishComplete
}: VideoPublishingUIProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])
  const [caption, setCaption] = useState(defaultCaption)
  const [hashtags, setHashtags] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResults, setPublishResults] = useState<PlatformResult[] | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const { toast } = useToast()

  const hashtagArray = hashtags
    .split(/[,\s]+/)
    .filter(tag => tag.length > 0)
    .map(tag => tag.startsWith('#') ? tag : `#${tag}`)

  const captionLength = caption.length
  const maxCaptionLength = 2200

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: 'No platforms selected',
        description: 'Please select at least one platform to publish to',
        variant: 'destructive'
      })
      return
    }

    if (!caption.trim()) {
      toast({
        title: 'Caption required',
        description: 'Please add a caption for your video',
        variant: 'destructive'
      })
      return
    }

    setIsPublishing(true)
    setPublishResults(null)

    try {
      // Build scheduled_for timestamp if scheduling
      let scheduledFor: string | undefined
      if (showSchedule && scheduledDate && scheduledTime) {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      }

      const { data, error } = await supabase.functions.invoke('publish-video', {
        body: {
          video_project_id: videoProjectId,
          platforms: selectedPlatforms,
          caption: caption.trim(),
          hashtags: hashtagArray,
          scheduled_for: scheduledFor,
          platform_options: {
            tiktok: {
              privacy: 'public'
            }
          }
        }
      })

      if (error) {
        console.error('[VideoPublishingUI] Publish error:', error)
        throw error
      }

      console.log('[VideoPublishingUI] Publish response:', data)

      if (data.success) {
        setPublishResults(data.results || [])

        if (scheduledFor) {
          toast({
            title: '✅ Video scheduled',
            description: `Your video is scheduled to publish to ${selectedPlatforms.length} platform(s) on ${new Date(scheduledFor).toLocaleString()}`
          })
        } else {
          const successCount = data.summary?.published || 0
          const totalCount = data.summary?.total_platforms || selectedPlatforms.length

          toast({
            title: successCount === totalCount ? '✅ Published successfully!' : '⚠️ Partially published',
            description: data.message || `Published to ${successCount} of ${totalCount} platform(s)`
          })
        }

        if (onPublishComplete) {
          onPublishComplete(data.results || [])
        }
      } else {
        throw new Error(data.error || 'Publishing failed')
      }
    } catch (error: any) {
      console.error('[VideoPublishingUI] Publishing error:', error)
      toast({
        title: '❌ Publishing failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleGenerateCaption = async () => {
    // AI-powered caption generation (future enhancement)
    toast({
      title: '✨ AI Caption Generation',
      description: 'AI-powered caption generation coming soon!',
    })
  }

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Platforms</Label>
        <PlatformSelector
          selectedPlatforms={selectedPlatforms}
          onSelectionChange={setSelectedPlatforms}
        />
      </div>

      {/* Caption Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="caption" className="text-base font-semibold">
            Caption
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateCaption}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generate
          </Button>
        </div>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your video caption here..."
          className="min-h-[100px] resize-none"
          maxLength={maxCaptionLength}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {captionLength}/{maxCaptionLength} characters
          </span>
          {captionLength > maxCaptionLength * 0.9 && (
            <span className="text-yellow-600">
              Approaching character limit
            </span>
          )}
        </div>
      </div>

      {/* Hashtags */}
      <div className="space-y-3">
        <Label htmlFor="hashtags" className="text-base font-semibold">
          Hashtags <span className="text-sm font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="trending, viral, fyp (comma-separated)"
          className="font-mono"
        />
        {hashtagArray.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtagArray.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scheduling */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Publishing</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {showSchedule ? 'Publish Now' : 'Schedule'}
          </Button>
        </div>

        {showSchedule && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="schedule-date" className="text-sm">
                Date
              </Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time" className="text-sm">
                Time
              </Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Publish Button */}
      <Button
        onClick={handlePublish}
        disabled={isPublishing || selectedPlatforms.length === 0 || !caption.trim()}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            {showSchedule && scheduledDate && scheduledTime ? 'Scheduling...' : 'Publishing...'}
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            {showSchedule && scheduledDate && scheduledTime
              ? `Schedule for ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}`
              : `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}`}
          </>
        )}
      </Button>

      {/* Publishing Results */}
      {publishResults && publishResults.length > 0 && (
        <PublishingStatus results={publishResults} />
      )}
    </div>
  )
}
