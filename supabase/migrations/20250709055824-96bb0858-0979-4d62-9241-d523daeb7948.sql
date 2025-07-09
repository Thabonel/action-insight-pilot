-- Create user analytics events table to track form friction points
CREATE TABLE IF NOT EXISTS public.user_analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own analytics events" 
ON public.user_analytics_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events" 
ON public.user_analytics_events FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_events_user_id ON public.user_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_events_type ON public.user_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_events_created_at ON public.user_analytics_events(created_at);