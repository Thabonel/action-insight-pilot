# Conversational Campaign Creation - Implementation Guide

**Date**: 2025-12-29
**Feature**: AI-Guided Campaign Creation for Simple Mode
**Status**: Implemented, Pending Deployment

---

## Overview

This feature enables users in Simple Mode (non-marketers) to create and launch campaigns through a conversational interface. The AI asks questions, collects information, and automatically creates and launches campaigns without requiring marketing knowledge.

## User Experience Flow

### Step-by-Step Interaction

1. **User**: "I need to market my product"
2. **AI**: "I'll help you create a campaign! What product or service do you want to promote?"
3. **User**: "Handmade organic soap"
4. **AI**: "Great! Who is your ideal customer or target audience?"
5. **User**: "Women aged 25-45 who care about natural products"
6. **AI**: "Perfect! What's your monthly marketing budget? (Typically $300-$1000)"
7. **User**: "$500"
8. **AI**: "Excellent! What's your main goal for this campaign? (Examples: generate leads, increase sales, build brand awareness)"
9. **User**: "Increase sales"
10. **AI**: "How long would you like to run this campaign? (Options: 1 week, 1 month, 3 months)"
11. **User**: "1 month"
12. **AI**: *Reviews summary* "Here's what I'll create:
    - Product: Handmade organic soap
    - Target Audience: Women aged 25-45 who care about natural products
    - Budget: $500/month
    - Goal: Increase sales
    - Duration: 1 month
    - Channels: Social Media + Email

    Does this look good? I'll create and launch this campaign right away!"
13. **User**: "Yes, looks good!"
14. **AI**: "Your campaign has been created and launched! Check your Autopilot Dashboard to see results."

## Technical Implementation

### Database Schema

**New Table**: `conversation_campaigns`

```sql
CREATE TABLE public.conversation_campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  conversation_id TEXT NOT NULL,
  status TEXT DEFAULT 'collecting_info',
  current_step TEXT DEFAULT 'product',
  collected_data JSONB DEFAULT '{}'::jsonb,
  campaign_id UUID REFERENCES campaigns(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Fields**:
- `conversation_id`: Unique session identifier
- `status`: collecting_info | creating_campaign | completed | cancelled
- `current_step`: product | audience | budget | goals | timeline | review | done
- `collected_data`: Stores user responses in JSON format

### Conversation Steps

| Step | Question | Data Collected |
|------|----------|----------------|
| product | "What product or service do you want to promote?" | `collected_data.product` |
| audience | "Who is your ideal customer or target audience?" | `collected_data.audience` |
| budget | "What's your monthly marketing budget?" | `collected_data.budget` (number) |
| goals | "What's your main goal for this campaign?" | `collected_data.goals` |
| timeline | "How long would you like to run this campaign?" | `collected_data.timeline` |
| review | *Shows summary and asks for confirmation* | - |

### AI Logic Flow

**File**: `supabase/functions/dashboard-chat/index.ts`

1. **Intent Detection**: Detects campaign creation triggers
   - Keywords: "create campaign", "market my product", "need to advertise", etc.

2. **State Management**:
   - Creates/retrieves `conversation_campaigns` record
   - Tracks current step in conversation
   - Stores collected data progressively

3. **Question Progression**:
   - AI system prompt adapts based on `current_step`
   - After each answer, updates database and moves to next step

4. **Campaign Creation**:
   - Triggered when step = 'review' and user confirms
   - Calls `createAndLaunchCampaign()` function
   - Creates campaign with status = 'active'
   - Returns campaign ID to frontend

5. **Budget-Based Channel Selection**:
   ```typescript
   if (budget < $300)   → Social Media
   if (budget < $1000)  → Social Media + Email
   if (budget >= $1000) → Social Media + Email + Content
   ```

### Frontend Integration

**Modified Files**:
1. `src/hooks/useChatLogic.tsx`
   - Added `conversationId` state
   - Stores conversation ID from API response
   - Shows success toast when campaign created
   - Resets conversation after completion

2. `src/lib/api-client.ts`
   - Passes `conversationId` to dashboard-chat function
   - Handles campaign creation response

**API Response**:
```json
{
  "message": "AI response text",
  "suggestions": ["suggestion1", "suggestion2"],
  "success": true,
  "conversationId": "conv_12345_abc",
  "campaignCreated": true,
  "campaignId": "campaign-uuid"
}
```

## Deployment Instructions

### Step 1: Apply Database Migration

```bash
# Copy migration SQL to Supabase SQL Editor
cat supabase/migrations/20251229000000_conversational_campaigns.sql

# Execute in Supabase Dashboard:
# 1. Go to https://supabase.com/dashboard/project/kciuuxoqxfsogjuqflou
# 2. Navigate to SQL Editor
# 3. Paste migration SQL
# 4. Click "Run"
# 5. Verify table creation: SELECT * FROM conversation_campaigns;
```

### Step 2: Deploy Edge Function

```bash
# From project root
cd supabase

# Deploy dashboard-chat function
supabase functions deploy dashboard-chat --project-ref kciuuxoqxfsogjuqflou

# Verify deployment
supabase functions list --project-ref kciuuxoqxfsogjuqflou
```

### Step 3: Deploy Frontend

```bash
# Build frontend
npm run build

# Deploy to Vercel/Netlify (auto-deploy if connected to git)
git add .
git commit -m "Add conversational campaign creation for Simple Mode"
git push origin main
```

## Testing Guide

### Test Scenario 1: Complete Flow

1. Switch to Simple Mode (if not already)
2. Go to "AI Chat" (Conversational Dashboard)
3. Type: "I want to create a campaign"
4. Answer each question:
   - Product: "Test Product"
   - Audience: "Test Audience 25-45"
   - Budget: "500"
   - Goals: "Generate leads"
   - Timeline: "1 month"
5. Confirm: "Yes, create it"
6. Verify:
   - Success toast appears
   - Go to Autopilot Dashboard
   - New campaign should be visible

### Test Scenario 2: Alternative Triggers

Try different phrases to start campaign creation:
- "Help me market my service"
- "I need to advertise my product"
- "Create a new campaign"
- "Promote my business"

All should trigger the conversation flow.

### Test Scenario 3: Interruption and Resume

1. Start campaign creation
2. Answer first 2 questions
3. Refresh page
4. Type another message
5. Resume should work (conversation state persists)

### Test Scenario 4: Validation

Check database after campaign creation:

```sql
-- View conversation record
SELECT * FROM conversation_campaigns
WHERE status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- View created campaign
SELECT * FROM campaigns
ORDER BY created_at DESC LIMIT 1;
```

## Troubleshooting

### Issue: "API key not configured" error

**Solution**: User needs to add Claude or Gemini API key:
1. Go to Settings → Integrations
2. Add API key for Anthropic Claude or Google Gemini
3. Retry campaign creation

### Issue: Conversation doesn't progress

**Check**:
1. Database table exists: `SELECT * FROM conversation_campaigns;`
2. Edge function deployed: Check Supabase Functions dashboard
3. Console logs in browser DevTools
4. Edge function logs: `supabase functions logs dashboard-chat`

### Issue: Campaign not created

**Debug**:
1. Check conversation status:
   ```sql
   SELECT status, current_step, collected_data
   FROM conversation_campaigns
   WHERE user_id = 'your-user-id'
   ORDER BY created_at DESC LIMIT 1;
   ```
2. Verify `collected_data` has all required fields
3. Check Edge Function logs for errors

### Issue: Campaign created but not launched

**Verify**:
```sql
SELECT status FROM campaigns
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC LIMIT 1;
```

Status should be `'active'`, not `'draft'`.

## Key Design Decisions

### Why Conversation State in Database?

- Persists across page refreshes
- Enables multi-device support
- Allows conversation history analysis
- Easy debugging and monitoring

### Why Automatic Launch?

- Reduces friction for non-marketers
- Aligns with Simple Mode philosophy
- Users can pause/stop later if needed

### Why Budget-Based Channel Selection?

- Simplifies decision-making for beginners
- Provides sensible defaults
- Optimizes spend across channels

### Why Require Confirmation?

- Prevents accidental campaign creation
- Gives user opportunity to review
- Builds confidence in the system

## Future Enhancements

### Phase 2 (Planned)

- **Smart Budget Suggestions**: Analyze industry benchmarks
- **Multi-Language Support**: Detect user language and ask in native tongue
- **Template Selection**: Offer campaign templates based on product type
- **A/B Test Variants**: Auto-create test variations
- **Performance Predictions**: Show expected results before launch

### Phase 3 (Ideas)

- **Voice Input**: Allow voice-based campaign creation
- **Image Upload**: Upload product images during conversation
- **Competitor Analysis**: Ask for competitors and suggest differentiation
- **Seasonal Optimization**: Recommend timelines based on seasonality

## Metrics to Track

After deployment, monitor:

1. **Conversion Rate**: % of conversations that complete campaign creation
2. **Drop-off Points**: Which step do users abandon most?
3. **Campaign Performance**: How do AI-created campaigns perform vs manual?
4. **User Satisfaction**: Survey Simple Mode users after first campaign
5. **Time to Campaign**: Average duration from first message to launch

## Related Documentation

- **CLAUDE.md**: Project instructions (User Mode section)
- **docs/FEATURES.md**: Feature documentation
- **docs/DEVELOPER_GUIDE.md**: Technical architecture
- **supabase/migrations/**: Database schema changes

---

**Implementation Complete**: 2025-12-29
**Next Steps**: Deploy to production and monitor user adoption
