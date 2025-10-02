-- Create a SECURITY DEFINER function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.user_has_company_role(
  _user_id uuid, 
  _company_id uuid, 
  _roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role = ANY(_roles)
  )
$$;

-- Drop the existing recursive policy
DROP POLICY IF EXISTS "Users can view roles in their companies" ON public.user_roles;

-- Create a new non-recursive policy using the SECURITY DEFINER function
CREATE POLICY "Users can view roles in their companies" 
ON public.user_roles 
FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.user_has_company_role(auth.uid(), company_id, ARRAY['admin','editor'])
);