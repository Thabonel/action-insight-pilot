-- Create conversations table for chat history
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_messages table with vector embeddings
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  embedding vector(1536)
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can manage their own conversations"
  ON public.conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for conversation_messages
CREATE POLICY "Users can manage messages in their conversations"
  ON public.conversation_messages
  FOR ALL
  USING (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_time ON public.conversation_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_embedding ON public.conversation_messages USING ivfflat (embedding vector_cosine_ops);
