
-- Create knowledge buckets table
CREATE TABLE IF NOT EXISTS public.knowledge_buckets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bucket_type TEXT NOT NULL CHECK (bucket_type IN ('campaign', 'general')),
  description TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(name, created_by),
  -- Campaign buckets must have campaign_id, general buckets must not
  CHECK (
    (bucket_type = 'campaign' AND campaign_id IS NOT NULL) OR
    (bucket_type = 'general' AND campaign_id IS NULL)
  )
);

-- Create knowledge documents table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id UUID REFERENCES public.knowledge_buckets(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  upload_path TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  processing_error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create knowledge chunks table for vector storage
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  bucket_id UUID REFERENCES public.knowledge_buckets(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  token_count INTEGER,
  embedding vector(1536), -- OpenAI ada-002 embedding dimensions
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

-- Create knowledge access logs table
CREATE TABLE IF NOT EXISTS public.knowledge_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id UUID REFERENCES public.knowledge_buckets(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES public.knowledge_chunks(id) ON DELETE CASCADE,
  agent_type TEXT,
  query_text TEXT,
  similarity_score FLOAT,
  used_in_response BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.knowledge_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_buckets
CREATE POLICY "Users can manage their own knowledge buckets" 
  ON public.knowledge_buckets 
  FOR ALL 
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for knowledge_documents
CREATE POLICY "Users can manage documents in their buckets" 
  ON public.knowledge_documents 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_buckets 
      WHERE id = bucket_id AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_buckets 
      WHERE id = bucket_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for knowledge_chunks
CREATE POLICY "Users can access chunks from their buckets" 
  ON public.knowledge_chunks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_buckets 
      WHERE id = bucket_id AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_buckets 
      WHERE id = bucket_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for knowledge_access_logs
CREATE POLICY "Users can view their own access logs" 
  ON public.knowledge_access_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert access logs" 
  ON public.knowledge_access_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_buckets_user_type ON public.knowledge_buckets(created_by, bucket_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_buckets_campaign ON public.knowledge_buckets(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_bucket ON public.knowledge_documents(bucket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON public.knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_bucket ON public.knowledge_chunks(bucket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_access_logs_bucket ON public.knowledge_access_logs(bucket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_access_logs_user_time ON public.knowledge_access_logs(user_id, created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_buckets_updated_at
    BEFORE UPDATE ON public.knowledge_buckets
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_updated_at();

CREATE TRIGGER knowledge_documents_updated_at
    BEFORE UPDATE ON public.knowledge_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_updated_at();

-- Create function to search knowledge chunks by similarity
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
