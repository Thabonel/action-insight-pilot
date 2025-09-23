-- Fix RLS infinite recursion on user_roles by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = check_role);
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new non-recursive policies for user_roles
CREATE POLICY "Users can view their own user roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Service role full access to user roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

-- Fix overly permissive policies on proposal_templates (use correct column name: user_id)
DROP POLICY IF EXISTS "Users can view proposal templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can create proposal templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can update proposal templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can delete proposal templates" ON public.proposal_templates;

-- Create secure policies for proposal_templates (remove OR user_id IS NULL condition)
CREATE POLICY "Users can view their own proposal templates"
ON public.proposal_templates
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own proposal templates"
ON public.proposal_templates
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own proposal templates"
ON public.proposal_templates
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own proposal templates"
ON public.proposal_templates
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Service role full access to proposal templates"
ON public.proposal_templates
FOR ALL
USING (auth.role() = 'service_role');

-- Fix asset_usage_analytics to be user-specific only
DROP POLICY IF EXISTS "Users can view analytics" ON public.asset_usage_analytics;

CREATE POLICY "Users can view their own asset usage analytics"
ON public.asset_usage_analytics
FOR SELECT
USING (user_id = auth.uid());

-- Ensure user_id is required for new analytics records
ALTER TABLE public.asset_usage_analytics ALTER COLUMN user_id SET NOT NULL;