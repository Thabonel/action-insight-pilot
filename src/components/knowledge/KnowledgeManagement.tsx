
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKnowledgeBuckets } from '@/hooks/useKnowledge'
import { CreateBucketDialog } from './CreateBucketDialog'
import { BucketCard } from './BucketCard'
import { DocumentUploadDialog } from './DocumentUploadDialog'
import { KnowledgeSearch } from './KnowledgeSearch'
import { DocumentsList } from './DocumentsList'

const KnowledgeManagement: React.FC = () => {
  const { buckets, isLoading, createBucket } = useKnowledgeBuckets()
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

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
          <Button onClick={() => setShowUploadDialog(true)} variant="outline">
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
              {buckets.reduce((sum, bucket) => sum + (bucket.knowledge_documents?.length || 0), 0)}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {campaignBuckets.map(bucket => (
                    <BucketCard 
                      key={bucket.id}
                      bucket={bucket}
                      onSelect={setSelectedBucket}
                      isSelected={selectedBucket === bucket.id}
                    />
                  ))}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generalBuckets.map(bucket => (
                    <BucketCard 
                      key={bucket.id}
                      bucket={bucket}
                      onSelect={setSelectedBucket}
                      isSelected={selectedBucket === bucket.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedBucket && (
        <div className="space-y-4">
          <DocumentsList bucketId={selectedBucket} />
        </div>
      )}

      <CreateBucketDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateBucket={createBucket}
      />

      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        buckets={buckets}
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
