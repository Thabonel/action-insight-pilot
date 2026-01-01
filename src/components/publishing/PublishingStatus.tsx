// Publishing Status Component
// Displays the results of publishing to multiple platforms
// Created: 2026-01-01

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, XCircle, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'
import { PlatformResult } from './VideoPublishingUI'

interface PublishingStatusProps {
  results: PlatformResult[]
  onRetry?: (platform: string) => void
}

const platformNames: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube Shorts',
  facebook: 'Facebook Reels'
}

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
  facebook: '👥'
}

export function PublishingStatus({ results, onRetry }: PublishingStatusProps) {
  const successCount = results.filter(r => r.status === 'published').length
  const failureCount = results.filter(r => r.status === 'failed').length
  const skippedCount = results.filter(r => r.status === 'skipped').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Check className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'skipped':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'skipped':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-border'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published Successfully'
      case 'failed':
        return 'Publishing Failed'
      case 'skipped':
        return 'Skipped'
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Publishing Results</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {successCount > 0 && (
                <span className="text-green-600 font-medium">
                  {successCount} successful
                </span>
              )}
              {failureCount > 0 && (
                <>
                  {successCount > 0 && ', '}
                  <span className="text-red-600 font-medium">
                    {failureCount} failed
                  </span>
                </>
              )}
              {skippedCount > 0 && (
                <>
                  {(successCount > 0 || failureCount > 0) && ', '}
                  <span className="text-yellow-600 font-medium">
                    {skippedCount} skipped
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="text-3xl">
            {successCount === results.length ? '🎉' : failureCount > 0 ? '⚠️' : '📊'}
          </div>
        </div>
      </Card>

      {/* Individual Platform Results */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <Card
            key={index}
            className={`p-4 border-2 ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start gap-3">
              {/* Platform Icon */}
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                {platformIcons[result.platform] || '📱'}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(result.status)}
                  <h4 className="font-semibold text-sm">
                    {platformNames[result.platform] || result.platform}
                  </h4>
                </div>

                <p className={`text-xs ${
                  result.status === 'published'
                    ? 'text-green-700'
                    : result.status === 'failed'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                }`}>
                  {result.status === 'published'
                    ? getStatusText(result.status)
                    : result.error || getStatusText(result.status)}
                </p>

                {/* Platform URL */}
                {result.platform_url && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-2 text-xs"
                    onClick={() => window.open(result.platform_url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on {platformNames[result.platform]}
                  </Button>
                )}
              </div>

              {/* Retry Button */}
              {result.status === 'failed' && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(result.platform)}
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
