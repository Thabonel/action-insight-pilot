// Platform Selector Component
// Allows users to select which social platforms to publish to
// Created: 2026-01-01

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Platform } from './VideoPublishingUI'

interface PlatformOption {
  id: Platform
  name: string
  icon: string
  color: string
  description: string
  comingSoon?: boolean
}

const platformOptions: PlatformOption[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-pink-500 to-cyan-500',
    description: 'Reach millions with short videos'
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    icon: '📸',
    color: 'from-purple-500 to-pink-500',
    description: 'Share with your Instagram followers (Business account required)'
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    icon: '▶️',
    color: 'from-red-500 to-red-600',
    description: 'Publish to the largest video platform (max 6 uploads/day)'
  },
  {
    id: 'facebook',
    name: 'Facebook Reels',
    icon: '👥',
    color: 'from-blue-500 to-blue-600',
    description: 'Share with Facebook community (requires Facebook Page)'
  }
]

interface PlatformSelectorProps {
  selectedPlatforms: Platform[]
  onSelectionChange: (platforms: Platform[]) => void
}

export function PlatformSelector({
  selectedPlatforms,
  onSelectionChange
}: PlatformSelectorProps) {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<Platform>>(new Set())
  const [tiktokMethod, setTiktokMethod] = useState<'blotato' | 'direct_api' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchConnectedPlatforms()
  }, [])

  const fetchConnectedPlatforms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('oauth_connections')
        .select('platform_name, connection_status, connection_metadata')
        .eq('user_id', user.id)
        .eq('connection_status', 'connected')

      if (error) throw error

      const connected = new Set<Platform>(
        data?.map(conn => conn.platform_name as Platform) || []
      )
      setConnectedPlatforms(connected)

      // Check TikTok connection method
      const tiktokConn = data?.find(conn => conn.platform_name === 'tiktok')
      if (tiktokConn) {
        setTiktokMethod(tiktokConn.connection_metadata?.method || 'blotato')
      }
    } catch (error) {
      console.error('[PlatformSelector] Error fetching connections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlatformToggle = (platformId: Platform) => {
    const platform = platformOptions.find(p => p.id === platformId)

    // Check if coming soon
    if (platform?.comingSoon) {
      toast({
        title: `${platform.name} Coming Soon`,
        description: `${platform.name} publishing will be available in a future update`,
      })
      return
    }

    // Check if platform is connected
    if (!connectedPlatforms.has(platformId)) {
      toast({
        title: `${platform?.name} Not Connected`,
        description: `Please connect your ${platform?.name} account in Settings > Integrations`,
        variant: 'destructive'
      })
      return
    }

    // Toggle selection
    if (selectedPlatforms.includes(platformId)) {
      onSelectionChange(selectedPlatforms.filter(p => p !== platformId))
    } else {
      onSelectionChange([...selectedPlatforms, platformId])
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {platformOptions.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform.id)
        const isConnected = connectedPlatforms.has(platform.id)
        const isDisabled = platform.comingSoon || !isConnected

        return (
          <Card
            key={platform.id}
            className={`
              relative p-4 cursor-pointer transition-all border-2
              ${isSelected
                ? `border-primary bg-primary/5 shadow-lg`
                : isDisabled
                  ? 'border-border/50 bg-muted/30 opacity-60'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
              }
            `}
            onClick={() => handlePlatformToggle(platform.id)}
          >
            {/* Selected Check Mark */}
            {isSelected && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}

            {/* Platform Icon & Gradient */}
            <div className="flex items-start gap-3">
              <div className={`
                h-12 w-12 rounded-lg bg-gradient-to-br ${platform.color}
                flex items-center justify-center text-2xl flex-shrink-0
              `}>
                {platform.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {platform.name}
                  </h3>
                  {platform.comingSoon && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Soon
                    </Badge>
                  )}
                  {!platform.comingSoon && !isConnected && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 text-yellow-600 border-yellow-600">
                      Not Connected
                    </Badge>
                  )}
                  {isConnected && !platform.comingSoon && (
                    <>
                      <Badge variant="outline" className="text-xs px-1.5 py-0 text-green-600 border-green-600">
                        Connected
                      </Badge>
                      {platform.id === 'tiktok' && tiktokMethod && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 text-blue-600 border-blue-600">
                          {tiktokMethod === 'direct_api' ? 'Direct API' : 'Blotato'}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {platform.description}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
