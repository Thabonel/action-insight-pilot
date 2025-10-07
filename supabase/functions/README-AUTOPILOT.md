# Marketing Autopilot System

## Overview

The Marketing Autopilot system is a fully automated marketing engine that runs campaigns for users with zero manual intervention.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  USER INTERFACE                  │
├─────────────────────────────────────────────────┤
│  Simple Dashboard  │  Autopilot Setup Wizard    │
│  Lead Inbox        │  Activity Feed             │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              EDGE FUNCTIONS (Deno)               │
├─────────────────────────────────────────────────┤
│  autopilot-orchestrator    (Daily 2 AM)         │
│  autopilot-weekly-report   (Monday 9 AM)        │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                   DATABASE                       │
├─────────────────────────────────────────────────┤
│  marketing_autopilot_config                     │
│  autopilot_weekly_reports                       │
│  autopilot_activity_log                         │
│  autopilot_lead_inbox                           │
│  campaigns (auto_managed = true)                │
└─────────────────────────────────────────────────┘
```

## Edge Functions

### 1. autopilot-orchestrator

**Schedule**: Daily at 2:00 AM UTC

**Purpose**: Main automation engine that manages campaigns

**Actions**:
- Creates initial campaigns from AI strategy
- Optimizes campaign budgets based on performance
- Syncs leads to autopilot inbox
- Logs all activities to activity feed

**Logic**:
```typescript
For each active autopilot user:
  ├─ If no campaigns exist:
  │   └─ Create campaigns from AI strategy
  │       └─ One campaign per channel
  │       └─ Allocate budgets per strategy percentages
  │       └─ Create campaign tasks
  │
  └─ If campaigns exist:
      └─ Analyze last 7 days performance
          ├─ If conversion < 1% and spend > 50%:
          │   └─ Reduce budget by 20%
          │
          └─ If conversion > 3% and spend < 70%:
              └─ Increase budget by 20%
```

**Manual Trigger** (for testing):
```sql
SELECT trigger_autopilot_orchestration();
```

### 2. autopilot-weekly-report

**Schedule**: Every Monday at 9:00 AM UTC

**Purpose**: Generate weekly performance summaries

**Calculates**:
- Total leads generated (this week)
- Total spend (this week)
- ROI (revenue / spend)
- Top performing channel
- AI insights and recommendations

**Manual Trigger** (for testing):
```sql
SELECT trigger_weekly_report_generation();
```

## Database Schema

### marketing_autopilot_config
Stores user's autopilot setup and AI-generated strategy.

```sql
- id: UUID
- user_id: UUID
- business_description: TEXT
- target_audience: JSONB
- monthly_budget: NUMERIC
- goals: JSONB
- ai_strategy: JSONB
- is_active: BOOLEAN
- last_optimized_at: TIMESTAMP
```

### autopilot_weekly_reports
Weekly performance summaries.

```sql
- id: UUID
- user_id: UUID
- week_start_date: DATE
- week_end_date: DATE
- total_leads_generated: INTEGER
- total_spend: NUMERIC
- roi: NUMERIC
- top_performing_channel: TEXT
- summary: JSONB
- ai_insights: JSONB
```

### autopilot_activity_log
Tracks all automated actions.

```sql
- id: UUID
- user_id: UUID
- activity_type: TEXT
- activity_description: TEXT
- entity_type: TEXT
- entity_id: UUID
- metadata: JSONB
- created_at: TIMESTAMP
```

### autopilot_lead_inbox
Simplified lead view for autopilot users.

```sql
- id: UUID
- user_id: UUID
- lead_id: UUID
- full_name: TEXT
- company_name: TEXT
- email: TEXT
- phone: TEXT
- source: TEXT
- score: INTEGER
- status: TEXT
- received_at: TIMESTAMP
```

## Setup Instructions

### 1. Deploy Edge Functions

```bash
# Deploy autopilot orchestrator
supabase functions deploy autopilot-orchestrator

# Deploy weekly report generator
supabase functions deploy autopilot-weekly-report
```

### 2. Run Database Migrations

```bash
# Run all autopilot migrations
supabase db push

# Or run individually
psql $DATABASE_URL -f supabase/migrations/20250610120000_autopilot_system.sql
psql $DATABASE_URL -f supabase/migrations/20250610130000_autopilot_campaigns.sql
psql $DATABASE_URL -f supabase/migrations/20250610140000_autopilot_cron_jobs.sql
```

### 3. Configure Environment Variables

Ensure these are set in Supabase Dashboard → Settings → Edge Functions:

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 4. Set Up Cron Jobs (Option A: pg_cron)

The migration creates these automatically, but verify:

```sql
-- View scheduled jobs
SELECT * FROM autopilot_cron_monitor;

-- Expected output:
-- autopilot-daily-orchestration | 0 2 * * * | Every day at 2 AM
-- autopilot-weekly-reports      | 0 9 * * 1 | Every Monday at 9 AM
```

### 5. Set Up Cron Jobs (Option B: External Scheduler)

If using an external cron service (like cron-job.org or GitHub Actions):

**Daily Orchestrator:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/autopilot-orchestrator \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Weekly Reports:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/autopilot-weekly-report \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Testing

### Test Autopilot Setup Flow

1. Navigate to `/app/autopilot/setup`
2. Complete the 4-step wizard:
   - Business description
   - Target audience
   - Monthly budget
   - Review AI strategy
3. Activate autopilot
4. Verify config saved in database:
   ```sql
   SELECT * FROM marketing_autopilot_config WHERE user_id = 'your-user-id';
   ```

### Test Campaign Creation

```sql
-- Manually trigger orchestrator
SELECT trigger_autopilot_orchestration();

-- Verify campaigns created
SELECT * FROM campaigns WHERE auto_managed = true;

-- Check activity log
SELECT * FROM autopilot_activity_log ORDER BY created_at DESC;
```

### Test Weekly Report

```sql
-- Manually trigger report generation
SELECT trigger_weekly_report_generation();

-- View generated reports
SELECT * FROM autopilot_weekly_reports ORDER BY created_at DESC;
```

## Monitoring

### View Cron Job Status

```sql
SELECT * FROM autopilot_cron_monitor;
```

### View Recent Activities

```sql
SELECT
  activity_type,
  activity_description,
  created_at
FROM autopilot_activity_log
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Check Active Autopilot Users

```sql
SELECT
  COUNT(*) as active_users,
  SUM(monthly_budget) as total_budget
FROM marketing_autopilot_config
WHERE is_active = true;
```

## Troubleshooting

### Orchestrator Not Running

1. Check cron jobs are scheduled:
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE 'autopilot-%';
   ```

2. Check Edge Function logs in Supabase Dashboard

3. Manually trigger and check output:
   ```sql
   SELECT trigger_autopilot_orchestration();
   ```

### Campaigns Not Created

1. Verify autopilot config exists:
   ```sql
   SELECT * FROM marketing_autopilot_config WHERE is_active = true;
   ```

2. Check AI strategy format:
   ```sql
   SELECT ai_strategy FROM marketing_autopilot_config;
   -- Should have: {"channels": [...], "messaging": {...}}
   ```

3. Check activity log for errors:
   ```sql
   SELECT * FROM autopilot_activity_log ORDER BY created_at DESC LIMIT 10;
   ```

### No Leads in Inbox

1. Verify leads exist:
   ```sql
   SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '7 days';
   ```

2. Check lead syncing:
   ```sql
   SELECT COUNT(*) FROM autopilot_lead_inbox;
   ```

3. Manually run sync (orchestrator does this automatically):
   ```sql
   SELECT trigger_autopilot_orchestration();
   ```

## Performance Optimization Rules

### Budget Reduction Triggers
- Conversion rate < 1%
- Spend > 50% of total budget
- Action: Reduce budget by 20%

### Budget Increase Triggers
- Conversion rate > 3%
- Spend < 70% of total budget
- Action: Increase budget by 20% (max +$500)

### Lead Syncing
- Syncs leads from last 7 days
- Runs daily with orchestrator
- Avoids duplicates

## Future Enhancements

- [ ] Email notifications for weekly reports
- [ ] SMS alerts for high-value leads
- [ ] A/B testing automation
- [ ] Content generation integration
- [ ] Multi-platform posting (social media)
- [ ] Slack/Discord integration for activity feed
- [ ] Custom optimization rules per user
- [ ] Predictive budget allocation

## Support

For issues or questions:
1. Check Supabase Edge Function logs
2. Review database activity logs
3. Check GitHub issues
4. Contact support with user ID and timestamp
