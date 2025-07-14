-- Add summary column to knowledge_documents and update search function
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS summary TEXT;

CREATE OR REPLACE FUNCTION search_knowledge_chunks(
  p_user_id UUID,
  p_query_embedding vector(1536),
  p_bucket_type TEXT DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  chunk_id UUID,
  bucket_id UUID,
  document_id UUID,
  bucket_name TEXT,
  document_title TEXT,
  document_summary TEXT,
  chunk_content TEXT,
  chunk_index INTEGER,
  similarity_score FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id as chunk_id,
    kc.bucket_id,
    kc.document_id,
    kb.name as bucket_name,
    kd.title as document_title,
    kd.summary as document_summary,
    kc.content as chunk_content,
    kc.chunk_index,
    (1 - (kc.embedding <=> p_query_embedding)) as similarity_score,
    kc.metadata
  FROM public.knowledge_chunks kc
  JOIN public.knowledge_buckets kb ON kc.bucket_id = kb.id
  JOIN public.knowledge_documents kd ON kc.document_id = kd.id
  WHERE
    kb.created_by = p_user_id
    AND (p_bucket_type IS NULL OR kb.bucket_type = p_bucket_type)
    AND (p_campaign_id IS NULL OR kb.campaign_id = p_campaign_id)
    AND kd.status = 'ready'
    AND (1 - (kc.embedding <=> p_query_embedding)) >= p_similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$;
