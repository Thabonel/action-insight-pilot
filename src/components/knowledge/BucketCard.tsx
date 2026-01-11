
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KnowledgeBucket } from '@/lib/services/knowledge-service'
import { formatDistanceToNow } from 'date-fns'

interface BucketCardProps {
  bucket: KnowledgeBucket
  onSelect: (bucketId: string) => void
  onUpload: (bucketId: string) => void
  isSelected: boolean
}

export const BucketCard: React.FC<BucketCardProps> = ({
  bucket,
  onSelect,
  onUpload,
  isSelected
}) => {
  const documentCount = bucket.knowledge_documents?.length || 0

  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={bucket.bucket_type === 'campaign' ? 'default' : 'secondary'}>
              {bucket.bucket_type === 'campaign' ? 'Campaign' : 'General'}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg">{bucket.name}</CardTitle>
        {bucket.description && (
          <CardDescription className="line-clamp-2">
            {bucket.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>{documentCount} documents</span>
          <span>
            Created {formatDistanceToNow(new Date(bucket.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelect(bucket.id)}
            className="flex-1"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onUpload(bucket.id)
            }}
            title="Upload to this bucket"
          >
            Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
