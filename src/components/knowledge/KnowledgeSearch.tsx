
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Target } from 'lucide-react'
import { useKnowledgeSearch } from '@/hooks/useKnowledge'
import { KnowledgeBucket } from '@/lib/services/knowledge-service'

interface KnowledgeSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  buckets: KnowledgeBucket[]
}

export const KnowledgeSearch: React.FC<KnowledgeSearchProps> = ({
  open,
  onOpenChange,
  buckets
}) => {
  const [query, setQuery] = useState('')
  const [bucketType, setBucketType] = useState<'campaign' | 'general' | ''>('')
  const [campaignId, setCampaignId] = useState('')
  
  const { searchKnowledge, searchResults, isSearching, clearResults } = useKnowledgeSearch()

  const campaignBuckets = buckets.filter(b => b.bucket_type === 'campaign')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    await searchKnowledge(
      query.trim(),
      bucketType || undefined,
      campaignId || undefined,
      10
    )
  }

  const handleClose = () => {
    setQuery('')
    setBucketType('')
    setCampaignId('')
    clearResults()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Knowledge Base</DialogTitle>
          <DialogDescription>
            Search across your knowledge buckets using semantic similarity
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., social media best practices, email campaign strategies..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bucket-type">Bucket Type (Optional)</Label>
              <Select value={bucketType} onValueChange={setBucketType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="general">General Knowledge</SelectItem>
                  <SelectItem value="campaign">Campaign Knowledge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bucketType === 'campaign' && (
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign (Optional)</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Campaigns</SelectItem>
                    {campaignBuckets.map(bucket => (
                      <SelectItem key={bucket.id} value={bucket.campaign_id!}>
                        {bucket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSearching || !query.trim()} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Search Results ({searchResults.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((result, index) => (
                <Card key={`${result.chunk_id}-${index}`} className="text-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {result.bucket_name === 'campaign' ? (
                          <Target className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                        {result.document_title}
                      </CardTitle>
                      <Badge variant="outline">
                        {Math.round(result.similarity_score * 100)}% match
                      </Badge>
                    </div>
                    <CardDescription>
                      From: {result.bucket_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {result.chunk_content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && query && !isSearching && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query or check different bucket types
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
