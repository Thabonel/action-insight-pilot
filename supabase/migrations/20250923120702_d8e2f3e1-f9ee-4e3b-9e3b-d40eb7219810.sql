-- Fix critical user_roles infinite recursion and secure other tables

-- 1. Fix user_roles infinite recursion by dropping existing policies and creating security definer functions
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage company roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create security definer function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = check_role);
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create non-recursive RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role full access to user roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Secure campaign_groups table
ALTER TABLE public.campaign_groups ENABLE ROW LEVEL SECURITY;

-- Add created_by column if it doesn't exist
ALTER TABLE public.campaign_groups ADD COLUMN IF NOT EXISTS created_by UUID;

CREATE POLICY "Users can view their own campaign groups"
ON public.campaign_groups
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can create their own campaign groups"
ON public.campaign_groups
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own campaign groups"
ON public.campaign_groups
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own campaign groups"
ON public.campaign_groups
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Service role full access to campaign groups"
ON public.campaign_groups
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Add security indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_groups_created_by ON public.campaign_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 4. Add audit logging for security-sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to audit log"
ON public.security_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can only view their own audit entries
CREATE POLICY "Users can view their own audit log"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());