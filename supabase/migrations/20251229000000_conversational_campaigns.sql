-- Migration: Conversational Campaign Creation System
-- Purpose: Enable AI-guided campaign creation through conversation
-- Date: 2025-12-29

-- Table to track conversation state for campaign creation
CREATE TABLE IF NOT EXISTS public.conversation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collecting_info',
  current_step TEXT NOT NULL DEFAULT 'product',

  -- Collected campaign information
  collected_data JSONB DEFAULT '{}'::jsonb,

  -- Campaign reference once created
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('collecting_info', 'creating_campaign', 'completed', 'cancelled')),
  CONSTRAINT valid_step CHECK (current_step IN ('product', 'audience', 'budget', 'goals', 'timeline', 'review', 'done'))
);

-- Index for faster lookups
CREATE INDEX idx_conversation_campaigns_user_id ON public.conversation_campaigns(user_id);
CREATE INDEX idx_conversation_campaigns_conversation_id ON public.conversation_campaigns(conversation_id);
CREATE INDEX idx_conversation_campaigns_status ON public.conversation_campaigns(status);

-- RLS Policies
ALTER TABLE public.conversation_campaigns ENABLE ROW LEVEL SECURITY;

-- Users can only view their own conversation campaigns
CREATE POLICY "Users can view own conversation campaigns"
  ON public.conversation_campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own conversation campaigns
CREATE POLICY "Users can insert own conversation campaigns"
  ON public.conversation_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversation campaigns
CREATE POLICY "Users can update own conversation campaigns"
  ON public.conversation_campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own conversation campaigns
CREATE POLICY "Users can delete own conversation campaigns"
  ON public.conversation_campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_conversation_campaigns_updated_at
  BEFORE UPDATE ON public.conversation_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_campaigns_updated_at();

COMMENT ON TABLE public.conversation_campaigns IS 'Tracks state of AI-guided conversational campaign creation';
COMMENT ON COLUMN public.conversation_campaigns.conversation_id IS 'Unique identifier for the conversation session';
COMMENT ON COLUMN public.conversation_campaigns.status IS 'Overall status: collecting_info, creating_campaign, completed, cancelled';
COMMENT ON COLUMN public.conversation_campaigns.current_step IS 'Current question step: product, audience, budget, goals, timeline, review, done';
COMMENT ON COLUMN public.conversation_campaigns.collected_data IS 'JSONB storing all collected campaign information';
COMMENT ON COLUMN public.conversation_campaigns.campaign_id IS 'Reference to created campaign (NULL until campaign is created)';
