-- CRITICAL SECURITY FIX: Fix overly permissive RLS policies (Updated)
-- This migration addresses critical data exposure vulnerabilities

-- 1. Fix generated_content table security (user_id already exists)
-- Update existing records to have proper user ownership
UPDATE public.generated_content 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Drop dangerous "Anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Authenticated users can create generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Authenticated users can update generated content" ON public.generated_content;

-- Create secure user-specific policies for generated_content
CREATE POLICY "Users can view their own generated content" 
ON public.generated_content 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated content" 
ON public.generated_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated content" 
ON public.generated_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated content" 
ON public.generated_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Fix social_engagement table security  
-- Add user ownership column if it doesn't exist
ALTER TABLE public.social_engagement ADD COLUMN IF NOT EXISTS user_id UUID;

-- Assign existing engagement data to first available user
UPDATE public.social_engagement 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Drop dangerous "Anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view social engagement" ON public.social_engagement;
DROP POLICY IF EXISTS "Authenticated users can create social engagement" ON public.social_engagement;
DROP POLICY IF EXISTS "Authenticated users can update social engagement" ON public.social_engagement;

-- Create secure user-specific policies for social_engagement
CREATE POLICY "Users can view their own social engagement" 
ON public.social_engagement 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social engagement" 
ON public.social_engagement 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social engagement" 
ON public.social_engagement 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social engagement" 
ON public.social_engagement 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Fix ai_insights table - add user ownership if needed
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS user_id UUID;

UPDATE public.ai_insights 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Drop overly broad policies
DROP POLICY IF EXISTS "Authenticated users can view AI insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Authenticated users can create AI insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Authenticated users can update AI insights" ON public.ai_insights;

-- Create secure user-specific policies for ai_insights
CREATE POLICY "Users can view their own AI insights" 
ON public.ai_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI insights" 
ON public.ai_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI insights" 
ON public.ai_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI insights" 
ON public.ai_insights 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Fix analytics_reports table - add user ownership if needed
ALTER TABLE public.analytics_reports ADD COLUMN IF NOT EXISTS user_id UUID;

UPDATE public.analytics_reports 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Drop overly broad policies
DROP POLICY IF EXISTS "Authenticated users can view analytics reports" ON public.analytics_reports;
DROP POLICY IF EXISTS "Authenticated users can create analytics reports" ON public.analytics_reports;
DROP POLICY IF EXISTS "Authenticated users can update analytics reports" ON public.analytics_reports;

-- Create secure user-specific policies for analytics_reports
CREATE POLICY "Users can view their own analytics reports" 
ON public.analytics_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics reports" 
ON public.analytics_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics reports" 
ON public.analytics_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics reports" 
ON public.analytics_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Add service role access for all tables (system operations)
CREATE POLICY "Service role full access to generated content" 
ON public.generated_content 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to social engagement" 
ON public.social_engagement 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to AI insights" 
ON public.ai_insights 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to analytics reports" 
ON public.analytics_reports 
FOR ALL 
USING (auth.role() = 'service_role');

-- 6. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_social_engagement_user_id ON public.social_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON public.analytics_reports(user_id);