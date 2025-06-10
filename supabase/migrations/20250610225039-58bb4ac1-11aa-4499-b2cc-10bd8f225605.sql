
-- Create user_secrets table for encrypted storage
CREATE TABLE public.user_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  initialization_vector TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, service_name)
);

-- Enable RLS
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own secrets metadata" 
ON public.user_secrets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own secrets" 
ON public.user_secrets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secrets" 
ON public.user_secrets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secrets" 
ON public.user_secrets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_secrets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_secrets_updated_at
  BEFORE UPDATE ON public.user_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_secrets_updated_at();

-- Create audit log table for secret operations
CREATE TABLE public.secret_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'read', 'update', 'delete')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.secret_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.secret_audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);
