
import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKnowledgeBuckets } from '@/hooks/useKnowledge'
import { CreateBucketDialog } from './CreateBucketDialog'
import { DocumentUploadDialog } from './DocumentUploadDialog'
import { KnowledgeSearch } from './KnowledgeSearch'
import { DocumentsList } from './DocumentsList'
import { KnowledgeBucket } from '@/lib/services/knowledge-service'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ChevronDown, ChevronRight, Upload } from 'lucide-react'

const KnowledgeManagement: React.FC = () => {
  const { buckets, isLoading, createBucket } = useKnowledgeBuckets()
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(new Set())
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadBucketId, setUploadBucketId] = useState<string | undefined>(undefined)
  const [showSearch, setShowSearch] = useState(false)

  // Callback to update document count when DocumentsList loads
  const handleDocumentCountChange = useCallback((bucketId: string, count: number) => {
    setDocumentCounts(prev => ({ ...prev, [bucketId]: count }))
  }, [])

  const toggleBucket = (bucketId: string) => {
    setExpandedBuckets(prev => {
      const next = new Set(prev)
      if (next.has(bucketId)) {
        next.delete(bucketId)
      } else {
        next.add(bucketId)
      }
      return next
    })
  }

  const handleUploadToBucket = (bucketId: string) => {
    setUploadBucketId(bucketId)
    setShowUploadDialog(true)
  }

  const handleOpenUploadDialog = () => {
    setUploadBucketId(undefined)
    setShowUploadDialog(true)
  }

  const campaignBuckets = buckets.filter(b => b.bucket_type === 'campaign')
  const generalBuckets = buckets.filter(b => b.bucket_type === 'general')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge buckets...</p>
        </div>
      </div>
    )
  }

  const renderBucketItem = (bucket: KnowledgeBucket) => {
    const isExpanded = expandedBuckets.has(bucket.id)
    // Use tracked count if available, otherwise fall back to API data
    const documentCount = documentCounts[bucket.id] ?? bucket.document_count ?? 0

    return (
      <div key={bucket.id} className="border rounded-lg overflow-hidden">
        {/* Bucket Header - clickable to expand */}
        <div
          className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-muted/50 ${isExpanded ? 'bg-muted/30 border-b' : ''}`}
          onClick={() => toggleBucket(bucket.id)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{bucket.name}</span>
                <Badge variant={bucket.bucket_type === 'campaign' ? 'default' : 'secondary'} className="text-xs">
                  {bucket.bucket_type === 'campaign' ? 'Campaign' : 'General'}
                </Badge>
              </div>
              {bucket.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{bucket.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {documentCount} {documentCount === 1 ? 'document' : 'documents'}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Created {formatDistanceToNow(new Date(bucket.created_at), { addSuffix: true })}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleUploadToBucket(bucket.id)
              }}
              className="gap-1"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </div>
        </div>

        {/* Documents List - shown when expanded */}
        {isExpanded && (
          <div className="p-4 bg-background">
            <DocumentsList
              bucketId={bucket.id}
              inDialog
              onCountChange={(count) => handleDocumentCountChange(bucket.id, count)}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Management</h1>
          <p className="text-muted-foreground">
            Organize and manage your marketing knowledge for AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSearch(true)} variant="outline">
            Search Knowledge
          </Button>
          <Button onClick={handleOpenUploadDialog} variant="outline">
            Upload Document
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            New Bucket
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buckets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignBuckets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">General Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalBuckets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buckets.reduce((sum, bucket) => {
                // Use tracked count if available, otherwise fall back to API data
                const count = documentCounts[bucket.id] ?? bucket.document_count ?? 0
                return sum + count
              }, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaign" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaign">Campaign Knowledge</TabsTrigger>
          <TabsTrigger value="general">General Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign-Specific Knowledge</CardTitle>
              <CardDescription>
                Knowledge buckets tied to specific campaigns for targeted AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignBuckets.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">No campaign buckets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create campaign-specific knowledge buckets to help AI agents understand your campaigns better
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    Create Campaign Bucket
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaignBuckets.map(bucket => renderBucketItem(bucket))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Marketing Knowledge</CardTitle>
              <CardDescription>
                Industry knowledge, trends, and best practices for all AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalBuckets.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">No general buckets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create general knowledge buckets for marketing industry insights and best practices
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    Create General Bucket
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {generalBuckets.map(bucket => renderBucketItem(bucket))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateBucketDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateBucket={createBucket}
      />

      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        buckets={buckets}
        defaultBucketId={uploadBucketId}
      />

      <KnowledgeSearch
        open={showSearch}
        onOpenChange={setShowSearch}
        buckets={buckets}
      />
    </div>
  )
}

export default KnowledgeManagement
