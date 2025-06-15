
-- Create a table for storing OAuth connection credentials
CREATE TABLE IF NOT EXISTS public.oauth_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform_name TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT NOT NULL DEFAULT 'connected',
  connection_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_name)
);

-- Enable RLS on oauth_connections
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own connections
CREATE POLICY "Users can manage their own OAuth connections" 
  ON public.oauth_connections 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_oauth_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oauth_connections_updated_at
    BEFORE UPDATE ON public.oauth_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_oauth_connections_updated_at();

-- Create a table for storing OAuth state parameters (for security)
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  state_token TEXT NOT NULL UNIQUE,
  platform_name TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Enable RLS on oauth_states
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policy for oauth_states
CREATE POLICY "Users can manage their own OAuth states" 
  ON public.oauth_states 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON public.oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON public.oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_platform ON public.oauth_connections(user_id, platform_name);

-- Clean up expired OAuth states periodically (you'd run this as a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
    DELETE FROM public.oauth_states WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
