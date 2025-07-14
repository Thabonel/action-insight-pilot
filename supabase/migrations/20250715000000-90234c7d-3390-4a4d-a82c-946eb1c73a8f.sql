-- Create conversation_knowledge_refs table
CREATE TABLE public.conversation_knowledge_refs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES public.knowledge_chunks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_knowledge_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their conversation knowledge refs"
  ON public.conversation_knowledge_refs
  FOR ALL
  USING (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id));

CREATE INDEX IF NOT EXISTS idx_conversation_knowledge_conversation ON public.conversation_knowledge_refs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_knowledge_chunk ON public.conversation_knowledge_refs(chunk_id);
