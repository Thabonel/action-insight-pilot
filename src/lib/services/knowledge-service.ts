
import { supabase } from '@/integrations/supabase/client'

export interface KnowledgeBucket {
  id: string
  name: string
  bucket_type: 'campaign' | 'general'
  description?: string
  campaign_id?: string
  created_by: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
  knowledge_documents?: KnowledgeDocument[]
}

export interface KnowledgeDocument {
  id: string
  bucket_id: string
  title: string
  content: string
  file_name?: string
  file_type?: string
  file_size?: number
  upload_path?: string
  status: 'processing' | 'ready' | 'failed'
  processing_error?: string
  created_by: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface KnowledgeChunk {
  chunk_id: string
  bucket_id: string
  document_id: string
  bucket_name: string
  document_title: string
  chunk_content: string
  chunk_index: number
  similarity_score: number
  metadata: Record<string, any>
}

export class KnowledgeService {
  static async createBucket(
    name: string,
    bucket_type: 'campaign' | 'general',
    description?: string,
    campaign_id?: string
  ): Promise<KnowledgeBucket> {
    const { data, error } = await supabase.functions.invoke('knowledge-processor', {
      body: {
        action: 'create_bucket',
        name,
        bucket_type,
        description,
        campaign_id
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)
    
    return data.data
  }

  static async getBuckets(): Promise<KnowledgeBucket[]> {
    const { data, error } = await supabase.functions.invoke('knowledge-processor', {
      body: { action: 'get_buckets' }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)
    
    return data.data || []
  }

  static async uploadDocument(
    bucket_id: string,
    title: string,
    content: string,
    file_name?: string,
    file_type?: string,
    file_size?: number
  ): Promise<KnowledgeDocument> {
    const { data, error } = await supabase.functions.invoke('knowledge-processor', {
      body: {
        action: 'upload_document',
        bucket_id,
        title,
        content,
        file_name,
        file_type,
        file_size
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)
    
    return data.data
  }

  static async getDocuments(bucket_id: string): Promise<KnowledgeDocument[]> {
    const { data, error } = await supabase.functions.invoke('knowledge-processor', {
      body: {
        action: 'get_documents',
        bucket_id
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)
    
    return data.data || []
  }

  static async searchKnowledge(
    query: string,
    bucket_type?: 'campaign' | 'general',
    campaign_id?: string,
    limit = 10
  ): Promise<KnowledgeChunk[]> {
    const { data, error } = await supabase.functions.invoke('knowledge-processor', {
      body: {
        action: 'search_knowledge',
        query,
        bucket_type,
        campaign_id,
        limit
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)
    
    return data.data || []
  }

  static async reprocessDocument(document_id: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('knowledge-processor', {
      body: {
        action: 'process_document',
        document_id
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)
  }

  static extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const content = event.target?.result as string
        
        if (file.type === 'text/plain' || file.type === 'text/markdown') {
          resolve(content)
        } else if (file.type === 'application/json') {
          try {
            const json = JSON.parse(content)
            resolve(JSON.stringify(json, null, 2))
          } catch {
            resolve(content)
          }
        } else {
          // For other file types, return raw content
          // In a real implementation, you'd use libraries like pdf-parse, mammoth, etc.
          resolve(content)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}
