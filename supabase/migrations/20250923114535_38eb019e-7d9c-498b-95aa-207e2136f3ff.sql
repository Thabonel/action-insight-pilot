-- Fix email_contacts security vulnerability
-- Step 1: Add user_id column for ownership
ALTER TABLE public.email_contacts ADD COLUMN user_id UUID;

-- Step 2: Assign existing contacts to the first authenticated user (or create demo data ownership)
UPDATE public.email_contacts 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Step 3: Make user_id non-nullable and add foreign key constraint
ALTER TABLE public.email_contacts 
ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "delete_email_contacts" ON public.email_contacts;
DROP POLICY IF EXISTS "insert_email_contacts" ON public.email_contacts;
DROP POLICY IF EXISTS "select_email_contacts" ON public.email_contacts;
DROP POLICY IF EXISTS "update_email_contacts" ON public.email_contacts;

-- Step 5: Create secure RLS policies that restrict access to user's own contacts
CREATE POLICY "Users can view their own email contacts" 
ON public.email_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email contacts" 
ON public.email_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email contacts" 
ON public.email_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email contacts" 
ON public.email_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Step 6: Allow service role full access for system operations
CREATE POLICY "Service role full access to email contacts" 
ON public.email_contacts 
FOR ALL 
USING (auth.role() = 'service_role');

-- Step 7: Add index for performance
CREATE INDEX IF NOT EXISTS idx_email_contacts_user_id ON public.email_contacts(user_id);