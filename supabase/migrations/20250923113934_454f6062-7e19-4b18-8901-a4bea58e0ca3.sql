-- Fix RLS infinite recursion on user_roles by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = check_role);
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic recursive policy on user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create non-recursive policy for user_roles management
CREATE POLICY "Service role full access to user roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

-- Fix overly permissive policies on proposal_templates - remove the ones with OR user_id IS NULL
DROP POLICY IF EXISTS "Users can create their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON public.proposal_templates;

-- The secure policies for proposal_templates already exist, no need to recreate them

-- Fix asset_usage_analytics overly permissive policy
DROP POLICY IF EXISTS "Users can view analytics" ON public.asset_usage_analytics;

-- Create secure policy for asset_usage_analytics
CREATE POLICY "Users can view their own asset usage analytics"
ON public.asset_usage_analytics
FOR SELECT
USING (user_id = auth.uid());

-- Ensure user_id is required for new analytics records
ALTER TABLE public.asset_usage_analytics ALTER COLUMN user_id SET NOT NULL;