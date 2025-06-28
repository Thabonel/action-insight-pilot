-- Create user privacy settings table
CREATE TABLE public.user_privacy_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  data_processing_consent boolean NOT NULL DEFAULT false,
  marketing_consent boolean NOT NULL DEFAULT false,
  analytics_consent boolean NOT NULL DEFAULT false,
  third_party_consent boolean NOT NULL DEFAULT false,
  data_retention_days integer NOT NULL DEFAULT 730,
  right_to_be_deleted_requested boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create data export requests table
CREATE TABLE public.data_export_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  download_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create data deletion requests table
CREATE TABLE public.data_deletion_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  confirmation_required boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create privacy audit log table
CREATE TABLE public.privacy_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all privacy-related tables
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user privacy settings
CREATE POLICY "Users can view their own privacy settings" 
ON public.user_privacy_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings" 
ON public.user_privacy_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" 
ON public.user_privacy_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for data export requests
CREATE POLICY "Users can view their own export requests" 
ON public.data_export_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests" 
ON public.data_export_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for data deletion requests
CREATE POLICY "Users can view their own deletion requests" 
ON public.data_deletion_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests" 
ON public.data_deletion_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for privacy audit log
CREATE POLICY "Users can view their own privacy audit logs" 
ON public.privacy_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy audit logs" 
ON public.privacy_audit_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_privacy_settings_user_id ON public.user_privacy_settings(user_id);
CREATE INDEX idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX idx_data_deletion_requests_user_id ON public.data_deletion_requests(user_id);
CREATE INDEX idx_privacy_audit_log_user_id ON public.privacy_audit_log(user_id);
CREATE INDEX idx_privacy_audit_log_timestamp ON public.privacy_audit_log(timestamp);

-- Add updated_at triggers
CREATE TRIGGER update_user_privacy_settings_updated_at
  BEFORE UPDATE ON public.user_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();