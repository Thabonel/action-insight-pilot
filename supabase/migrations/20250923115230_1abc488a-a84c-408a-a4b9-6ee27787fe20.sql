-- CRITICAL SECURITY FIX: Fix overly permissive RLS policies (Final)
-- This migration addresses critical data exposure vulnerabilities

-- Check current dangerous policies and drop them
DO $$ 
BEGIN
    -- Drop dangerous public access policies
    DROP POLICY IF EXISTS "Anyone can view generated content" ON public.generated_content;
    DROP POLICY IF EXISTS "Anyone can view social engagement" ON public.social_engagement;
    
    -- Drop overly broad authenticated user policies
    DROP POLICY IF EXISTS "Authenticated users can view AI insights" ON public.ai_insights;
    DROP POLICY IF EXISTS "Authenticated users can create AI insights" ON public.ai_insights;
    DROP POLICY IF EXISTS "Authenticated users can update AI insights" ON public.ai_insights;
    DROP POLICY IF EXISTS "Authenticated users can view analytics reports" ON public.analytics_reports;
    DROP POLICY IF EXISTS "Authenticated users can create analytics reports" ON public.analytics_reports;
    DROP POLICY IF EXISTS "Authenticated users can update analytics reports" ON public.analytics_reports;
END $$;

-- Update user ownership for existing records
UPDATE public.generated_content 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email IS NOT NULL 
    ORDER BY created_at ASC 
    LIMIT 1
) 
WHERE user_id IS NULL;

UPDATE public.social_engagement 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email IS NOT NULL 
    ORDER BY created_at ASC 
    LIMIT 1
) 
WHERE user_id IS NULL;

UPDATE public.ai_insights 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email IS NOT NULL 
    ORDER BY created_at ASC 
    LIMIT 1
) 
WHERE user_id IS NULL;

UPDATE public.analytics_reports 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email IS NOT NULL 
    ORDER BY created_at ASC 
    LIMIT 1
) 
WHERE user_id IS NULL;

-- Create secure user-specific policies only if they don't exist
DO $$
BEGIN
    -- Create policies for ai_insights (these are the most critical to fix)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Users can view their own AI insights') THEN
        CREATE POLICY "Users can view their own AI insights" 
        ON public.ai_insights 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Users can create their own AI insights') THEN
        CREATE POLICY "Users can create their own AI insights" 
        ON public.ai_insights 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Users can update their own AI insights') THEN
        CREATE POLICY "Users can update their own AI insights" 
        ON public.ai_insights 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Create policies for analytics_reports
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Users can view their own analytics reports') THEN
        CREATE POLICY "Users can view their own analytics reports" 
        ON public.analytics_reports 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Users can create their own analytics reports') THEN
        CREATE POLICY "Users can create their own analytics reports" 
        ON public.analytics_reports 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Users can update their own analytics reports') THEN
        CREATE POLICY "Users can update their own analytics reports" 
        ON public.analytics_reports 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Create policies for social_engagement
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_engagement' AND policyname = 'Users can view their own social engagement') THEN
        CREATE POLICY "Users can view their own social engagement" 
        ON public.social_engagement 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_engagement' AND policyname = 'Users can create their own social engagement') THEN
        CREATE POLICY "Users can create their own social engagement" 
        ON public.social_engagement 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Add service role access for system operations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Service role full access to generated content') THEN
        CREATE POLICY "Service role full access to generated content" 
        ON public.generated_content 
        FOR ALL 
        USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_engagement' AND policyname = 'Service role full access to social engagement') THEN
        CREATE POLICY "Service role full access to social engagement" 
        ON public.social_engagement 
        FOR ALL 
        USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights' AND policyname = 'Service role full access to AI insights') THEN
        CREATE POLICY "Service role full access to AI insights" 
        ON public.ai_insights 
        FOR ALL 
        USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_reports' AND policyname = 'Service role full access to analytics reports') THEN
        CREATE POLICY "Service role full access to analytics reports" 
        ON public.analytics_reports 
        FOR ALL 
        USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_social_engagement_user_id ON public.social_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON public.analytics_reports(user_id);