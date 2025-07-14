-- Create research_notes table to store flagged AI answers
CREATE TABLE public.research_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_refs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their research notes" ON public.research_notes
  FOR ALL
  USING (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id));

CREATE INDEX IF NOT EXISTS idx_research_notes_conversation ON public.research_notes(conversation_id);
