-- Add auto_managed flag to campaigns table for autopilot-managed campaigns

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns'
    AND column_name = 'auto_managed'
  ) THEN
    ALTER TABLE campaigns
    ADD COLUMN auto_managed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add metadata column for storing autopilot configuration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns'
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE campaigns
    ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Create index for faster autopilot campaign queries
CREATE INDEX IF NOT EXISTS idx_campaigns_auto_managed
  ON campaigns(created_by, auto_managed, status)
  WHERE auto_managed = true;

-- Add campaign_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaign_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on campaign_tasks
ALTER TABLE campaign_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policy for campaign tasks
CREATE POLICY "Users can manage their campaign tasks"
  ON campaign_tasks
  FOR ALL
  USING (auth.uid() = created_by);

-- Create index for campaign tasks
CREATE INDEX IF NOT EXISTS idx_campaign_tasks_campaign
  ON campaign_tasks(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_tasks_user_due
  ON campaign_tasks(created_by, due_date)
  WHERE status != 'completed';

-- Trigger for campaign_tasks updated_at
CREATE TRIGGER update_campaign_tasks_updated_at
  BEFORE UPDATE ON campaign_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
