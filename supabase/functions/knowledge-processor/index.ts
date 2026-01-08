
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentChunk {
  content: string
  metadata: Record<string, unknown>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'create_bucket':
        return await createKnowledgeBucket(supabaseClient, user.id, payload)
      case 'upload_document':
        return await uploadDocument(supabaseClient, user.id, payload)
      case 'process_document':
        return await processDocument(supabaseClient, user.id, payload)
      case 'search_knowledge':
        return await searchKnowledge(supabaseClient, user.id, payload)
      case 'get_buckets':
        return await getKnowledgeBuckets(supabaseClient, user.id)
      case 'get_documents':
        return await getDocuments(supabaseClient, user.id, payload)
      default:
        throw new Error('Invalid action')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'
    console.error('Knowledge processor error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function createKnowledgeBucket(supabaseClient: SupabaseClient, userId: string, payload: Record<string, unknown>) {
  const { name, bucket_type, description, campaign_id } = payload

  const { data, error } = await supabaseClient
    .from('knowledge_buckets')
    .insert({
      name,
      bucket_type,
      description,
      campaign_id: bucket_type === 'campaign' ? campaign_id : null,
      created_by: userId
    })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function uploadDocument(supabaseClient: SupabaseClient, userId: string, payload: Record<string, unknown>) {
  const { bucket_id, title, content, file_name, file_type, file_size } = payload

  // Verify bucket ownership
  const { data: bucket } = await supabaseClient
    .from('knowledge_buckets')
    .select('id')
    .eq('id', bucket_id)
    .eq('created_by', userId)
    .single()

  if (!bucket) throw new Error('Bucket not found')

  const { data, error } = await supabaseClient
    .from('knowledge_documents')
    .insert({
      bucket_id,
      title,
      content,
      file_name,
      file_type,
      file_size,
      created_by: userId,
      status: 'processing'
    })
    .select()
    .single()

  if (error) throw error

  // Process document in background
  processDocumentBackground(supabaseClient, data.id, content)

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processDocumentBackground(supabaseClient: SupabaseClient, documentId: string, content: string): Promise<void> {
  try {
    // Get document and bucket info
    const { data: document } = await supabaseClient
      .from('knowledge_documents')
      .select('*, knowledge_buckets(*)')
      .eq('id', documentId)
      .single()

    if (!document) return

    // Chunk the content
    const chunks = chunkText(content, 1000, 200) // 1000 chars with 200 overlap

    // Generate embeddings for each chunk
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const chunksToInsert = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await generateEmbedding(chunk.content, openaiKey)

      chunksToInsert.push({
        document_id: documentId,
        bucket_id: document.bucket_id,
        chunk_index: i,
        content: chunk.content,
        content_hash: await hashString(chunk.content),
        token_count: estimateTokenCount(chunk.content),
        embedding,
        metadata: chunk.metadata
      })
    }

    // Generate a short summary for the entire document
    let summary: string | null = null
    try {
      summary = await summarizeText(content, openaiKey)
    } catch (e) {
      console.error('Summary generation failed:', e)
    }

    // Insert chunks
    const { error: chunksError } = await supabaseClient
      .from('knowledge_chunks')
      .insert(chunksToInsert)

    if (chunksError) throw chunksError

    // Update document status and summary
    await supabaseClient
      .from('knowledge_documents')
      .update({ status: 'ready', summary })
      .eq('id', documentId)

  } catch (error: unknown) {
    console.error('Document processing error:', error)
    await supabaseClient
      .from('knowledge_documents')
      .update({ 
        status: 'failed',
        processing_error: error instanceof Error ? error.message : String(error) 
      })
      .eq('id', documentId)
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  let currentChunk = ''
  let currentSize = 0
  
  for (const sentence of sentences) {
    const sentenceLength = sentence.trim().length
    
    if (currentSize + sentenceLength > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { sentences: currentChunk.split(/[.!?]+/).length }
      })
      
      // Handle overlap
      const words = currentChunk.split(' ')
      const overlapWords = words.slice(-Math.floor(overlap / 10))
      currentChunk = overlapWords.join(' ') + ' ' + sentence.trim()
      currentSize = currentChunk.length
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence.trim()
      currentSize = currentChunk.length
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { sentences: currentChunk.split(/[.!?]+/).length }
    })
  }
  
  return chunks
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002'
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
  }

  return data.data[0].embedding
}

async function summarizeText(text: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'Summarize the following text' },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.3
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
  }

  return data.choices[0].message.content as string
}

function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function searchKnowledge(supabaseClient: SupabaseClient, userId: string, payload: Record<string, unknown>) {
  const { query, bucket_type, campaign_id, limit = 10 } = payload

  // Generate embedding for query
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const queryEmbedding = await generateEmbedding(query, openaiKey)

  // Search using the database function
  const { data, error } = await supabaseClient
    .rpc('search_knowledge_chunks', {
      p_user_id: userId,
      p_query_embedding: queryEmbedding,
      p_bucket_type: bucket_type,
      p_campaign_id: campaign_id,
      p_limit: limit
    })

  if (error) throw error

  // Log access
  if (data && data.length > 0) {
    const accessLogs = data.map((chunk) => ({
      bucket_id: chunk.bucket_id,
      document_id: chunk.document_id,
      chunk_id: chunk.chunk_id,
      query_text: query,
      similarity_score: chunk.similarity_score,
      user_id: userId
    }))

    await supabaseClient
      .from('knowledge_access_logs')
      .insert(accessLogs)
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getKnowledgeBuckets(supabaseClient: SupabaseClient, userId: string) {
  const { data, error } = await supabaseClient
    .from('knowledge_buckets')
    .select(`
      *,
      campaigns(name),
      knowledge_documents(count)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getDocuments(supabaseClient: SupabaseClient, userId: string, payload: Record<string, unknown>) {
  const { bucket_id } = payload

  // Verify bucket ownership
  const { data: bucket } = await supabaseClient
    .from('knowledge_buckets')
    .select('id')
    .eq('id', bucket_id)
    .eq('created_by', userId)
    .single()

  if (!bucket) throw new Error('Bucket not found')

  const { data, error } = await supabaseClient
    .from('knowledge_documents')
    .select('*')
    .eq('bucket_id', bucket_id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processDocument(supabaseClient: SupabaseClient, userId: string, payload: Record<string, unknown>) {
  const { document_id } = payload

  // Verify document ownership
  const { data: document } = await supabaseClient
    .from('knowledge_documents')
    .select('*, knowledge_buckets!inner(created_by)')
    .eq('id', document_id)
    .single()

  if (!document || document.knowledge_buckets.created_by !== userId) {
    throw new Error('Document not found')
  }

  if (document.status === 'processing') {
    throw new Error('Document is already being processed')
  }

  // Update status and reprocess
  await supabaseClient
    .from('knowledge_documents')
    .update({ status: 'processing' })
    .eq('id', document_id)

  // Delete existing chunks
  await supabaseClient
    .from('knowledge_chunks')
    .delete()
    .eq('document_id', document_id)

  // Process in background
  processDocumentBackground(supabaseClient, document_id, document.content)

  return new Response(
    JSON.stringify({ success: true, message: 'Document processing started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
