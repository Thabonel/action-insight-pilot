# Conversational Campaign Creation - Deployment Checklist

**Feature**: AI-Guided Campaign Creation for Simple Mode
**Date**: 2025-12-29

---

## Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Local testing passed
- [ ] Documentation created
- [ ] Migration SQL verified

## Deployment Steps

### 1. Apply Database Migration

**Where**: Supabase Dashboard → SQL Editor

**Steps**:
1. Go to https://supabase.com/dashboard/project/kciuuxoqxfsogjuqflou
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Copy contents of `supabase/migrations/20251229000000_conversational_campaigns.sql`
5. Paste into editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. Wait for success message

**Verification**:
```sql
-- Verify table exists
SELECT * FROM conversation_campaigns LIMIT 1;

-- Should return empty result (no data yet) but no error
```

**Rollback** (if needed):
```sql
DROP TABLE IF EXISTS public.conversation_campaigns CASCADE;
```

---

### 2. Deploy Edge Function

**Where**: Terminal / Command Line

**Steps**:
```bash
# Navigate to project root
cd /Users/thabonel/Code/action-insight-pilot

# Deploy dashboard-chat function
supabase functions deploy dashboard-chat --project-ref kciuuxoqxfsogjuqflou
```

**Expected Output**:
```
Deploying function dashboard-chat...
Function deployed successfully
URL: https://kciuuxoqxfsogjuqflou.supabase.co/functions/v1/dashboard-chat
```

**Verification**:
```bash
# List deployed functions
supabase functions list --project-ref kciuuxoqxfsogjuqflou

# Should show dashboard-chat in the list
```

**Test Edge Function**:
```bash
# Test with curl
curl -X POST https://kciuuxoqxfsogjuqflou.supabase.co/functions/v1/dashboard-chat \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello", "conversationId": null}'

# Should return JSON response with AI message
```

---

### 3. Deploy Frontend

**Option A: Auto-Deploy (Vercel/Netlify connected to Git)**

```bash
# Commit and push changes
git add .
git commit -m "feat: Add conversational campaign creation for Simple Mode

- New conversation_campaigns table for state management
- Enhanced dashboard-chat Edge Function with question flow
- Frontend integration with conversationId tracking
- Automatic campaign creation and launch
- Success notifications and toast messages

Closes: Simple Mode campaign creation feature
"
git push origin main

# Auto-deploy will trigger
# Monitor deployment on Vercel/Netlify dashboard
```

**Option B: Manual Deploy**

```bash
# Build production bundle
npm run build

# Test build locally
npm run preview

# Deploy dist/ folder to hosting provider
```

---

### 4. Post-Deployment Verification

#### Test in Production

1. **Open Production Site**:
   - Go to your deployed frontend URL
   - Login with test account

2. **Switch to Simple Mode**:
   - Click mode switcher dropdown
   - Select "Simple Mode"
   - Should navigate to `/app/autopilot`

3. **Go to AI Chat**:
   - Click "AI Chat" in sidebar
   - Should navigate to `/app/conversational-dashboard`

4. **Test Campaign Creation**:
   - Type: "I want to create a campaign"
   - Answer each question:
     - Product: "Test Product"
     - Audience: "Test Audience"
     - Budget: "500"
     - Goals: "Generate leads"
     - Timeline: "1 month"
   - Confirm: "Yes"

5. **Verify Campaign Created**:
   - Success toast should appear
   - Go to Settings → Switch to Advanced Mode
   - Go to Campaign Management
   - Verify new campaign exists with status "active"

#### Database Verification

```sql
-- Check conversation records
SELECT
  id,
  status,
  current_step,
  collected_data,
  created_at
FROM conversation_campaigns
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check created campaigns
SELECT
  id,
  name,
  status,
  total_budget,
  channels,
  created_at
FROM campaigns
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Verify campaign linked to conversation
SELECT
  cc.conversation_id,
  cc.status as conversation_status,
  c.name as campaign_name,
  c.status as campaign_status
FROM conversation_campaigns cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
WHERE cc.created_at > NOW() - INTERVAL '1 hour'
ORDER BY cc.created_at DESC;
```

---

## Rollback Plan

If critical issues are discovered:

### 1. Rollback Frontend

```bash
# If using Vercel/Netlify
# Go to dashboard → Deployments → Select previous deployment → "Promote to Production"

# Or revert Git commit
git revert HEAD
git push origin main
```

### 2. Disable Edge Function

```bash
# The old version is still accessible, just redeploy old code
# Or create a simple passthrough that returns old behavior
```

### 3. Remove Database Table (if needed)

```sql
-- Only if table causes issues
DROP TABLE IF EXISTS public.conversation_campaigns CASCADE;
```

---

## Monitoring Post-Deployment

### Week 1: Monitor These Metrics

1. **Error Rate**:
   ```sql
   -- Check for failed conversations
   SELECT COUNT(*)
   FROM conversation_campaigns
   WHERE status = 'collecting_info'
     AND created_at < NOW() - INTERVAL '1 day';
   -- Should be low (users might abandon)
   ```

2. **Completion Rate**:
   ```sql
   -- Calculate completion rate
   SELECT
     COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT /
     NULLIF(COUNT(*), 0) * 100 as completion_rate_percent
   FROM conversation_campaigns
   WHERE created_at > NOW() - INTERVAL '7 days';
   -- Target: >50%
   ```

3. **Edge Function Logs**:
   ```bash
   # Check for errors
   supabase functions logs dashboard-chat --project-ref kciuuxoqxfsogjuqflou
   ```

4. **Campaign Performance**:
   ```sql
   -- Check if AI-created campaigns are performing
   SELECT
     AVG(metrics->>'engagement_rate') as avg_engagement,
     COUNT(*) as total_campaigns
   FROM campaigns
   WHERE created_at > NOW() - INTERVAL '7 days'
     AND description LIKE '%AI-generated%';
   ```

---

## Success Criteria

Deployment is successful if:

- ✅ Database migration applied without errors
- ✅ Edge function deployed and accessible
- ✅ Frontend deployed successfully
- ✅ Test campaign creation works end-to-end
- ✅ Campaign appears in database with status 'active'
- ✅ No critical errors in logs first 24 hours
- ✅ Conversation completion rate >40% in first week

---

## Support & Troubleshooting

### Common Issues

**Issue**: "API key not configured"
- **Solution**: User needs to add Claude/Gemini API key in Settings

**Issue**: Campaign not appearing
- **Check**: Database for campaign_id in conversation_campaigns table
- **Debug**: Edge function logs for creation errors

**Issue**: Conversation stuck on same step
- **Check**: Database current_step value
- **Fix**: May need to manually update or reset conversation

### Contact

For issues during deployment:
- Check: `/docs/CONVERSATIONAL-CAMPAIGN-CREATION.md`
- Logs: Supabase Dashboard → Edge Functions → Logs
- Database: Supabase Dashboard → Table Editor

---

**Deployment Prepared By**: Claude Code Assistant
**Date**: 2025-12-29
**Ready for Production**: Yes ✅
