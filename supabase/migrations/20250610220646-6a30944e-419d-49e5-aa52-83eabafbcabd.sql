
-- Enable RLS on tables where it's not already enabled
-- Using the correct system tables for checking RLS status

DO $$
BEGIN
    -- Enable RLS on email_templates if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'email_templates' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on email_contacts if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'email_contacts' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on social_engagement if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'social_engagement' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.social_engagement ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on generated_content if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'generated_content' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on analytics_reports if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'analytics_reports' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on ai_insights if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'ai_insights' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create missing policies for email_templates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_templates' AND policyname = 'Users can view their own email templates') THEN
        CREATE POLICY "Users can view their own email templates" 
        ON public.email_templates 
        FOR SELECT 
        USING (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_templates' AND policyname = 'Users can create their own email templates') THEN
        CREATE POLICY "Users can create their own email templates" 
        ON public.email_templates 
        FOR INSERT 
        WITH CHECK (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_templates' AND policyname = 'Users can delete their own email templates') THEN
        CREATE POLICY "Users can delete their own email templates" 
        ON public.email_templates 
        FOR DELETE 
        USING (auth.uid() = created_by);
    END IF;
END $$;

-- Create missing policies for email_contacts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_contacts' AND policyname = 'Users can view all email contacts') THEN
        CREATE POLICY "Users can view all email contacts" 
        ON public.email_contacts 
        FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_contacts' AND policyname = 'Users can create email contacts') THEN
        CREATE POLICY "Users can create email contacts" 
        ON public.email_contacts 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_contacts' AND policyname = 'Users can update email contacts') THEN
        CREATE POLICY "Users can update email contacts" 
        ON public.email_contacts 
        FOR UPDATE 
        USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_contacts' AND policyname = 'Users can delete email contacts') THEN
        CREATE POLICY "Users can delete email contacts" 
        ON public.email_contacts 
        FOR DELETE 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create missing policies for social_engagement
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_engagement' AND policyname = 'Anyone can view social engagement') THEN
        CREATE POLICY "Anyone can view social engagement" 
        ON public.social_engagement 
        FOR SELECT 
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_engagement' AND policyname = 'Authenticated users can create social engagement') THEN
        CREATE POLICY "Authenticated users can create social engagement" 
        ON public.social_engagement 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_engagement' AND policyname = 'Authenticated users can update social engagement') THEN
        CREATE POLICY "Authenticated users can update social engagement" 
        ON public.social_engagement 
        FOR UPDATE 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create missing policies for generated_content
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Anyone can view generated content') THEN
        CREATE POLICY "Anyone can view generated content" 
        ON public.generated_content 
        FOR SELECT 
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Authenticated users can create generated content') THEN
        CREATE POLICY "Authenticated users can create generated content" 
        ON public.generated_content 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Authenticated users can update generated content') THEN
        CREATE POLICY "Authenticated users can update generated content" 
        ON public.generated_content 
        FOR UPDATE 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create missing policies for analytics_reports
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Authenticated users can view analytics reports') THEN
        CREATE POLICY "Authenticated users can view analytics reports" 
        ON public.analytics_reports 
        FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Authenticated users can create analytics reports') THEN
        CREATE POLICY "Authenticated users can create analytics reports" 
        ON public.analytics_reports 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Authenticated users can update analytics reports') THEN
        CREATE POLICY "Authenticated users can update analytics reports" 
        ON public.analytics_reports 
        FOR UPDATE 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create missing policies for ai_insights
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Authenticated users can view AI insights') THEN
        CREATE POLICY "Authenticated users can view AI insights" 
        ON public.ai_insights 
        FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Authenticated users can create AI insights') THEN
        CREATE POLICY "Authenticated users can create AI insights" 
        ON public.ai_insights 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Authenticated users can update AI insights') THEN
        CREATE POLICY "Authenticated users can update AI insights" 
        ON public.ai_insights 
        FOR UPDATE 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;
