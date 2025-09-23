-- Fix RLS infinite recursion on user_roles by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = check_role);
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop all existing problematic policies on user_roles (including recursive ones)
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their companies" ON public.user_roles;

-- Create new secure, non-recursive policies for user_roles
CREATE POLICY "Users can view their own user roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Service role full access to user roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

-- Drop problematic permissive policies on proposal_templates (those with OR user_id IS NULL)
DROP POLICY IF EXISTS "Users can create their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON public.proposal_templates;

-- Keep the existing secure policies and add service role access
CREATE POLICY IF NOT EXISTS "Service role full access to proposal templates"
ON public.proposal_templates
FOR ALL
USING (auth.role() = 'service_role');

-- Fix asset_usage_analytics - drop overly permissive policy
DROP POLICY IF EXISTS "Users can view analytics" ON public.asset_usage_analytics;

-- Create secure policy for asset_usage_analytics
CREATE POLICY "Users can view their own asset usage analytics"
ON public.asset_usage_analytics
FOR SELECT
USING (user_id = auth.uid());

-- Make user_id required for analytics (skip if it causes issues with existing data)
-- ALTER TABLE public.asset_usage_analytics ALTER COLUMN user_id SET NOT NULL;