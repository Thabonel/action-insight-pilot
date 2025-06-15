
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { KnowledgeService, KnowledgeBucket, KnowledgeDocument, KnowledgeChunk } from '@/lib/services/knowledge-service'

export function useKnowledgeBuckets() {
  const [buckets, setBuckets] = useState<KnowledgeBucket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadBuckets = async () => {
    try {
      setIsLoading(true)
      const data = await KnowledgeService.getBuckets()
      setBuckets(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load buckets'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createBucket = async (
    name: string,
    bucket_type: 'campaign' | 'general',
    description?: string,
    campaign_id?: string
  ) => {
    try {
      const newBucket = await KnowledgeService.createBucket(name, bucket_type, description, campaign_id)
      setBuckets(prev => [newBucket, ...prev])
      toast({
        title: "Success",
        description: "Knowledge bucket created successfully"
      })
      return newBucket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bucket'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  useEffect(() => {
    loadBuckets()
  }, [])

  return {
    buckets,
    isLoading,
    error,
    createBucket,
    reload: loadBuckets
  }
}

export function useKnowledgeDocuments(bucketId?: string) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadDocuments = async (bucket_id: string) => {
    try {
      setIsLoading(true)
      const data = await KnowledgeService.getDocuments(bucket_id)
      setDocuments(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const uploadDocument = async (
    bucket_id: string,
    title: string,
    content: string,
    file_name?: string,
    file_type?: string,
    file_size?: number
  ) => {
    try {
      const newDocument = await KnowledgeService.uploadDocument(
        bucket_id,
        title,
        content,
        file_name,
        file_type,
        file_size
      )
      setDocuments(prev => [newDocument, ...prev])
      toast({
        title: "Success",
        description: "Document uploaded and processing started"
      })
      return newDocument
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const reprocessDocument = async (document_id: string) => {
    try {
      await KnowledgeService.reprocessDocument(document_id)
      // Update document status in local state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === document_id 
            ? { ...doc, status: 'processing' as const, processing_error: undefined }
            : doc
        )
      )
      toast({
        title: "Success",
        description: "Document reprocessing started"
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reprocess document'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (bucketId) {
      loadDocuments(bucketId)
    }
  }, [bucketId])

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    reprocessDocument,
    reload: bucketId ? () => loadDocuments(bucketId) : () => {}
  }
}

export function useKnowledgeSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<KnowledgeChunk[]>([])
  const { toast } = useToast()

  const searchKnowledge = async (
    query: string,
    bucket_type?: 'campaign' | 'general',
    campaign_id?: string,
    limit = 10
  ) => {
    try {
      setIsSearching(true)
      const results = await KnowledgeService.searchKnowledge(query, bucket_type, campaign_id, limit)
      setSearchResults(results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive"
      })
      return []
    } finally {
      setIsSearching(false)
    }
  }

  const clearResults = () => {
    setSearchResults([])
  }

  return {
    searchKnowledge,
    searchResults,
    isSearching,
    clearResults
  }
}
