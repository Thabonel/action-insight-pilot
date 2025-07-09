-- Create user interaction feedback table for AI learning
CREATE TABLE public.ai_interaction_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  interaction_type TEXT NOT NULL, -- 'edit', 'approve', 'regenerate', 'reject'
  original_suggestion JSONB NOT NULL,
  user_modification JSONB,
  context_data JSONB NOT NULL, -- campaign brief, previous suggestions, etc.
  feedback_score INTEGER, -- 1-5 rating if explicit feedback
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_ai_feedback_user_id ON public.ai_interaction_feedback(user_id);
CREATE INDEX idx_ai_feedback_interaction_type ON public.ai_interaction_feedback(interaction_type);
CREATE INDEX idx_ai_feedback_timestamp ON public.ai_interaction_feedback(timestamp);

-- Create RLS policies
ALTER TABLE public.ai_interaction_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own feedback" ON public.ai_interaction_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.ai_interaction_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can access all feedback for learning
CREATE POLICY "Service role full access" ON public.ai_interaction_feedback
  FOR ALL USING (auth.role() = 'service_role');

-- Create agent learning data table
CREATE TABLE public.agent_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type TEXT NOT NULL, -- 'audience', 'channel', 'messaging', 'content'
  pattern_data JSONB NOT NULL, -- learned patterns from user interactions
  confidence_score REAL DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0.5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for agent learning data
ALTER TABLE public.agent_learning_data ENABLE ROW LEVEL SECURITY;

-- Only service role can manage learning data
CREATE POLICY "Service role manages learning data" ON public.agent_learning_data
  FOR ALL USING (auth.role() = 'service_role');

-- Create campaign copilot sessions table
CREATE TABLE public.campaign_copilot_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brief_data JSONB NOT NULL,
  generated_campaign JSONB,
  interaction_history JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'saved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_copilot_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their copilot sessions" ON public.campaign_copilot_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_copilot_sessions_updated_at
  BEFORE UPDATE ON public.campaign_copilot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();