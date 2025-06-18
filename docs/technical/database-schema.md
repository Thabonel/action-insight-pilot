
# Database Schema

## Core Tables

### users (Supabase Auth)
```sql
-- Managed by Supabase Auth
-- Contains: id, email, created_at, etc.
```

### campaigns
```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'social', 'content', 'mixed')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### leads
```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'converted', 'lost')),
  source TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### content
```sql
CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog_post', 'social_post', 'email', 'ad_copy')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### social_connections
```sql
CREATE TABLE social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin')),
  platform_user_id TEXT NOT NULL,
  username TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);
```

### email_campaigns
```sql
CREATE TABLE email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  recipient_list JSONB NOT NULL,
  send_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### analytics_events
```sql
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  user_agent TEXT,
  ip_address INET
);
```

### user_secrets
```sql
CREATE TABLE user_secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  secret_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, secret_name)
);
```

### workflows
```sql
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_config JSONB NOT NULL,
  action_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### workflow_executions
```sql
CREATE TABLE workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) NOT NULL,
  trigger_data JSONB,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

## Indexes

### Performance Indexes
```sql
-- Campaign queries
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Lead queries
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_status ON leads(status);

-- Content queries
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_status ON content(status);

-- Analytics queries
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
```

## Row Level Security (RLS) Policies

### Universal User Data Access
```sql
-- Users can only access their own data
CREATE POLICY "Users can access own data" ON {table_name}
  FOR ALL USING (auth.uid() = user_id);
```

### Specific Policies per Table
```sql
-- Campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);

-- Content
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own content" ON content
  FOR ALL USING (auth.uid() = user_id);
```

## Functions and Triggers

### Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Lead Scoring Function
```sql
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  lead_data RECORD;
BEGIN
  SELECT * INTO lead_data FROM leads WHERE id = lead_id;
  
  -- Scoring logic
  IF lead_data.company IS NOT NULL THEN score := score + 10; END IF;
  IF lead_data.phone IS NOT NULL THEN score := score + 5; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
```

## Data Relationships

### Campaign → Email Campaigns (1:N)
- One campaign can have multiple email campaigns
- Foreign key: `email_campaigns.campaign_id → campaigns.id`

### User → Multiple Entities (1:N)
- Users own campaigns, leads, content, etc.
- Foreign key: `{table}.user_id → auth.users.id`

### Workflow → Executions (1:N)
- One workflow can have multiple executions
- Foreign key: `workflow_executions.workflow_id → workflows.id`

## Migration Strategy

### Version Control
- Sequential migration files
- Rollback scripts for each migration
- Testing on staging environment
- Backup before production deployment

### Data Migration
- Preserve existing data
- Handle schema changes gracefully
- Update RLS policies as needed
- Test data integrity
