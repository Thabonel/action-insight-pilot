
-- Fix NULL values before applying constraints
-- Update campaigns with NULL created_by to use a default user (we'll use the first user in the system)
UPDATE public.campaigns 
SET created_by = (
    SELECT id FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE created_by IS NULL;

-- Update leads with NULL source to use a default value
UPDATE public.leads 
SET source = 'unknown'
WHERE source IS NULL;

-- Update chat_sessions with NULL user_id (if any exist)
UPDATE public.chat_sessions 
SET user_id = (
    SELECT id FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE user_id IS NULL;

-- Update knowledge_buckets with NULL created_by (if any exist)
UPDATE public.knowledge_buckets 
SET created_by = (
    SELECT id FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE created_by IS NULL;

-- Update knowledge_documents with NULL created_by (if any exist)
UPDATE public.knowledge_documents 
SET created_by = (
    SELECT id FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE created_by IS NULL;

-- Now apply the NOT NULL constraints and other fixes
ALTER TABLE public.campaigns ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN source SET NOT NULL;
ALTER TABLE public.chat_sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.knowledge_buckets ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.knowledge_documents ALTER COLUMN created_by SET NOT NULL;

-- Add missing indexes for foreign key relationships
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON public.campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_metric_date ON public.campaign_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_bucket_id ON public.knowledge_chunks(bucket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_bucket_id ON public.knowledge_documents(bucket_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON public.oauth_connections(user_id);

-- Add proper foreign key constraints if missing
DO $$ 
BEGIN
    -- Add foreign key for campaigns.created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'campaigns_created_by_fkey' 
        AND table_name = 'campaigns'
    ) THEN
        ALTER TABLE public.campaigns 
        ADD CONSTRAINT campaigns_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for chat_sessions.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_sessions_user_id_fkey' 
        AND table_name = 'chat_sessions'
    ) THEN
        ALTER TABLE public.chat_sessions 
        ADD CONSTRAINT chat_sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for chat_messages.session_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_session_id_fkey' 
        AND table_name = 'chat_messages'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT chat_messages_session_id_fkey 
        FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for knowledge_buckets.created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_buckets_created_by_fkey' 
        AND table_name = 'knowledge_buckets'
    ) THEN
        ALTER TABLE public.knowledge_buckets 
        ADD CONSTRAINT knowledge_buckets_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for knowledge_documents.created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_documents_created_by_fkey' 
        AND table_name = 'knowledge_documents'
    ) THEN
        ALTER TABLE public.knowledge_documents 
        ADD CONSTRAINT knowledge_documents_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for knowledge_chunks.bucket_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_chunks_bucket_id_fkey' 
        AND table_name = 'knowledge_chunks'
    ) THEN
        ALTER TABLE public.knowledge_chunks 
        ADD CONSTRAINT knowledge_chunks_bucket_id_fkey 
        FOREIGN KEY (bucket_id) REFERENCES public.knowledge_buckets(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for knowledge_chunks.document_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_chunks_document_id_fkey' 
        AND table_name = 'knowledge_chunks'
    ) THEN
        ALTER TABLE public.knowledge_chunks 
        ADD CONSTRAINT knowledge_chunks_document_id_fkey 
        FOREIGN KEY (document_id) REFERENCES public.knowledge_documents(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for oauth_connections.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'oauth_connections_user_id_fkey' 
        AND table_name = 'oauth_connections'
    ) THEN
        ALTER TABLE public.oauth_connections 
        ADD CONSTRAINT oauth_connections_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on tables that should have it but might be missing
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for user data access
DO $$
BEGIN
    -- Campaigns policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Users can view their own campaigns'
    ) THEN
        CREATE POLICY "Users can view their own campaigns" ON public.campaigns
        FOR SELECT USING (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Users can create their own campaigns'
    ) THEN
        CREATE POLICY "Users can create their own campaigns" ON public.campaigns
        FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Users can update their own campaigns'
    ) THEN
        CREATE POLICY "Users can update their own campaigns" ON public.campaigns
        FOR UPDATE USING (auth.uid() = created_by);
    END IF;

    -- Chat sessions policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'chat_sessions' AND policyname = 'Users can view their own chat sessions'
    ) THEN
        CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'chat_sessions' AND policyname = 'Users can create their own chat sessions'
    ) THEN
        CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Knowledge buckets policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'knowledge_buckets' AND policyname = 'Users can view their own knowledge buckets'
    ) THEN
        CREATE POLICY "Users can view their own knowledge buckets" ON public.knowledge_buckets
        FOR SELECT USING (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'knowledge_buckets' AND policyname = 'Users can create their own knowledge buckets'
    ) THEN
        CREATE POLICY "Users can create their own knowledge buckets" ON public.knowledge_buckets
        FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;

    -- OAuth connections policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'oauth_connections' AND policyname = 'Users can view their own oauth connections'
    ) THEN
        CREATE POLICY "Users can view their own oauth connections" ON public.oauth_connections
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'oauth_connections' AND policyname = 'Users can create their own oauth connections'
    ) THEN
        CREATE POLICY "Users can create their own oauth connections" ON public.oauth_connections
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
