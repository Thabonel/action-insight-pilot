# Enterprise Mention Features - Phase 6

Team collaboration, approval workflows, and brand safety protection for the mention system.

**Status**: Phase 6 Complete
**Last Updated**: 2026-01-08

---

## Overview

Phase 6 adds enterprise-grade features for teams and brands:
- **Team Collaboration** - Share mention recommendations across team members
- **Approval Workflows** - Require approval before posts with mentions go live
- **Brand Safety Filters** - Block controversial handles, keywords, and domains
- **Custom AI Training** - Train AI models on company-specific successful posts

---

## Features

### 1. Team Collaboration

**Component**: `TeamCollaborationPanel`

**Purpose**: Share AI-generated mention and hashtag recommendations with team members.

**How It Works**:
```mermaid
User gets AI recommendation
        ↓
Clicks "Share with Team"
        ↓
Enters team member email
        ↓
System finds user by email
        ↓
Creates share record in team_mention_shares
        ↓
Recipient sees shared recommendation
        ↓
Recipient can Accept or Decline
        ↓
If accepted, recommendation added to their autocomplete
```

**Database Table**: `team_mention_shares`

**API**:
```typescript
// Share a recommendation
const { data } = await supabase.rpc('share_recommendation', {
  p_user_id: user.id,
  p_shared_with_user_id: recipientId,
  p_recommendation_type: 'mention', // or 'hashtag'
  p_recommendation_data: {
    handle: 'techcrunch',
    reason: 'Tech news authority',
    confidence: 0.9
  }
});

// Fetch shares received
const { data: shares } = await supabase
  .from('team_mention_shares')
  .select('*')
  .eq('shared_with_user_id', user.id);

// Respond to share
await supabase
  .from('team_mention_shares')
  .update({ is_accepted: true, accepted_at: new Date().toISOString() })
  .eq('id', shareId);
```

**Use Cases**:
- Senior marketer shares best-performing mentions with team
- Content coordinator distributes brand-approved hashtags
- Manager shares competitor analysis recommendations
- Cross-functional teams align on messaging

---

### 2. Approval Workflows

**Component**: `ApprovalWorkflowDashboard`
**Edge Function**: `approval-workflow`

**Purpose**: Require approval before posts containing mentions can be published.

**How It Works**:
```mermaid
User creates post with mentions
        ↓
Requests approval via approval-workflow
        ↓
System creates approval request
        ↓
Approver sees pending request
        ↓
Approver reviews:
  - Post content
  - Mentions used
  - Hashtags used
  - Platform
        ↓
Approver Approves or Rejects
        ↓
If approved: Post can be published
If rejected: User gets feedback
```

**Database Table**: `team_approvals`

**Edge Function API**:

```typescript
// Create approval request
const { data } = await supabase.functions.invoke('approval-workflow', {
  body: {
    action: 'create',
    post_content: 'Just launched our new product!',
    mentions: ['@techcrunch', '@producthunt'],
    hashtags: ['#startup', '#innovation'],
    platform: 'twitter'
  }
});
// Returns: { success: true, approval_id: 'uuid', approval: {...} }

// List pending approvals
const { data } = await supabase.functions.invoke('approval-workflow', {
  body: { action: 'list' }
});
// Returns: { success: true, approvals: [...], count: 5 }

// Approve request
const { data } = await supabase.functions.invoke('approval-workflow', {
  body: {
    action: 'approve',
    approval_id: 'approval-uuid'
  }
});

// Reject request
const { data } = await supabase.functions.invoke('approval-workflow', {
  body: {
    action: 'reject',
    approval_id: 'approval-uuid',
    rejection_reason: 'Mentions not approved by legal'
  }
});
```

**Approval Expiration**:
- Requests expire after 48 hours by default
- Expired requests cannot be approved
- System automatically marks as expired

**Use Cases**:
- Legal review for regulated industries
- Brand approval before mentioning partners
- Manager oversight for junior team members
- Compliance verification for public companies

---

### 3. Brand Safety Filters

**Component**: `BrandSafetySettings`
**Edge Function**: `brand-safety-checker`

**Purpose**: Prevent controversial mentions, keywords, and domains from appearing in posts.

**How It Works**:
```mermaid
User creates post
        ↓
Frontend calls brand-safety-checker
        ↓
Edge function fetches user's filters:
  - Blocked handles
  - Blocked keywords
  - Blocked domains
        ↓
Checks post content for violations
        ↓
Returns safety check result:
  - is_safe: true/false
  - blocked_items: [...]
  - warnings: [...]
        ↓
If unsafe: Show warning dialog
If warnings: Show review recommendations
```

**Database Table**: `brand_safety_filters`

**Filter Types**:

1. **Blocked Handle** - `@competitor` prevented from being mentioned
2. **Blocked Keyword** - Words like "scandal" or "controversy" flagged
3. **Blocked Domain** - Links to specific domains prevented

**Edge Function API**:

```typescript
const { data } = await supabase.functions.invoke('brand-safety-checker', {
  body: {
    mentions: ['@competitor', '@newsoutlet'],
    hashtags: ['#innovation', '#tech'],
    postContent: 'Check out this article at blocked-site.com'
  }
});

// Response:
{
  is_safe: false,
  blocked_items: [
    {
      type: 'mention',
      value: '@competitor',
      reason: 'Blocked by brand safety policy'
    },
    {
      type: 'keyword',
      value: 'blocked-site.com',
      reason: 'Contains blocked domain: blocked-site.com'
    }
  ],
  warnings: [
    'Post contains link to blocked domain "blocked-site.com": Not approved for public posts'
  ]
}
```

**Management UI**:

```typescript
// Add filter
await supabase.from('brand_safety_filters').insert({
  user_id: user.id,
  filter_type: 'blocked_handle',
  filter_value: 'competitor_handle',
  reason: 'Competitor - do not mention',
  is_active: true
});

// Toggle filter on/off
await supabase.from('brand_safety_filters')
  .update({ is_active: false })
  .eq('id', filterId);

// Delete filter
await supabase.from('brand_safety_filters')
  .delete()
  .eq('id', filterId);
```

**Use Cases**:
- Prevent mentioning competitors
- Avoid controversial topics/keywords
- Block links to unauthorized domains
- Protect brand reputation

---

### 4. Custom AI Training Data

**Database Table**: `custom_mention_training_data`

**Purpose**: Store user-specific successful posts to train custom AI models.

**How It Works**:
```mermaid
User publishes post with mentions
        ↓
Post gets engagement metrics
        ↓
If engagement > threshold:
  → Store as training data
        ↓
Custom AI model learns:
  - Which mentions perform best
  - Which hashtags drive engagement
  - Which content patterns succeed
        ↓
Future suggestions personalized to user's brand
```

**Data Stored**:
- Post content
- Successful mentions used
- Successful hashtags used
- Engagement rate
- Platform
- Timestamp

**Future Enhancement**:
- Train custom Claude model on user's successful posts
- Personalized mention suggestions
- Brand-specific hashtag recommendations
- Industry-specific optimization

---

## Implementation Guide

### 1. Deploy Database Migration

```bash
# Apply Phase 6 migration
# Copy supabase/migrations/20260108000000_enterprise_mention_features.sql
# Paste into Supabase SQL Editor
# Execute migration
```

**Tables Created**:
- `team_mention_shares` - Team collaboration
- `team_approvals` - Approval workflows
- `brand_safety_filters` - Brand safety
- `custom_mention_training_data` - AI training

**Functions Created**:
- `is_mention_safe(user_id, mention_handle)` - Check if mention is blocked
- `get_pending_approvals_count(user_id)` - Get pending count
- `share_recommendation(...)` - Share with team member

### 2. Deploy Edge Functions

```bash
# Brand safety checker
supabase functions deploy brand-safety-checker

# Approval workflow
supabase functions deploy approval-workflow
```

### 3. Integrate Components

**Add to Post Creation Form**:

```typescript
import { TeamCollaborationPanel } from '@/components/social/TeamCollaborationPanel';
import { BrandSafetySettings } from '@/components/social/BrandSafetySettings';

// In your post creation page
function PostCreationPage() {
  const [currentRecommendation, setCurrentRecommendation] = useState(null);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Post Creation */}
      <div>
        {/* ... MentionInput, etc. */}
      </div>

      {/* Right Column - Team & Safety */}
      <div className="space-y-4">
        {/* Share current recommendation */}
        <TeamCollaborationPanel
          currentRecommendation={currentRecommendation}
        />

        {/* Check brand safety before posting */}
        <Button onClick={checkBrandSafety}>
          Check Brand Safety
        </Button>
      </div>
    </div>
  );
}
```

**Add Approval Dashboard**:

```typescript
import { ApprovalWorkflowDashboard } from '@/components/social/ApprovalWorkflowDashboard';

// In your approval management page
function ApprovalManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <ApprovalWorkflowDashboard />
    </div>
  );
}
```

**Add Brand Safety Settings**:

```typescript
import { BrandSafetySettings } from '@/components/social/BrandSafetySettings';

// In your settings page
function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* ... other settings */}
      <BrandSafetySettings />
    </div>
  );
}
```

### 4. Integrate Brand Safety Check

**Before posting**, check brand safety:

```typescript
async function handlePostSubmit() {
  // 1. Check brand safety
  const { data: safetyCheck } = await supabase.functions.invoke('brand-safety-checker', {
    body: {
      mentions,
      hashtags,
      postContent
    }
  });

  // 2. If unsafe, show warning
  if (!safetyCheck.is_safe) {
    showWarningDialog({
      title: 'Brand Safety Violation',
      blockedItems: safetyCheck.blocked_items,
      warnings: safetyCheck.warnings
    });
    return; // Don't post
  }

  // 3. If approval required, request approval
  if (requiresApproval) {
    const { data } = await supabase.functions.invoke('approval-workflow', {
      body: {
        action: 'create',
        post_content: postContent,
        mentions,
        hashtags,
        platform: selectedPlatform
      }
    });

    showSuccessMessage('Approval requested. Your post will be reviewed.');
    return;
  }

  // 4. Otherwise, post normally
  await publishPost();
}
```

---

## Performance & Cost

### Team Collaboration

**Cost**: Free (database queries only)

**Latency**: <100ms

**Optimization**:
- Cached shares for 5 minutes
- Indexed queries on `(shared_with_user_id, is_accepted)`
- Limit shares to active team members

### Approval Workflows

**Cost**: Free (database + edge function)

**Latency**: <200ms

**Optimization**:
- Auto-expire approvals after 48 hours
- Batch approval operations
- Real-time updates via Supabase subscriptions

### Brand Safety Checker

**Cost**: Free (no AI calls, rule-based)

**Latency**: <150ms

**Optimization**:
- In-memory filter cache
- Regex pre-compilation
- Early exit on first violation

### Custom AI Training

**Cost**: Storage only (~$0.001 per 1000 posts)

**Future Cost** (when custom models enabled):
- Claude fine-tuning: ~$5-10 per 1M tokens
- Inference: Standard Claude pricing

---

## Testing Guide

### Test Team Collaboration

1. **Create and share a recommendation**:
   ```typescript
   // User A generates mention suggestion
   const suggestion = {
     handle: 'techcrunch',
     reason: 'Tech news authority',
     confidence: 0.9
   };

   // User A shares with User B
   await supabase.rpc('share_recommendation', {
     p_user_id: userA.id,
     p_shared_with_user_id: userB.id,
     p_recommendation_type: 'mention',
     p_recommendation_data: suggestion
   });
   ```

2. **Verify User B receives share**:
   ```sql
   SELECT * FROM team_mention_shares
   WHERE shared_with_user_id = 'user-b-uuid'
   ORDER BY shared_at DESC;
   ```

3. **User B accepts share**:
   ```typescript
   await supabase.from('team_mention_shares')
     .update({ is_accepted: true, accepted_at: now() })
     .eq('id', shareId);
   ```

### Test Approval Workflow

1. **Create approval request**:
   ```bash
   supabase functions invoke approval-workflow \
     --body '{"action":"create","post_content":"Test post","mentions":["@test"],"hashtags":["#test"],"platform":"twitter"}'
   ```

2. **List pending approvals**:
   ```bash
   supabase functions invoke approval-workflow \
     --body '{"action":"list"}'
   ```

3. **Approve request**:
   ```bash
   supabase functions invoke approval-workflow \
     --body '{"action":"approve","approval_id":"approval-uuid"}'
   ```

### Test Brand Safety

1. **Add blocked filter**:
   ```sql
   INSERT INTO brand_safety_filters (user_id, filter_type, filter_value, reason, is_active)
   VALUES ('user-uuid', 'blocked_handle', 'competitor', 'Do not mention', true);
   ```

2. **Test safety check**:
   ```bash
   supabase functions invoke brand-safety-checker \
     --body '{"mentions":["@competitor","@allowed"],"hashtags":["#test"],"postContent":"Test post"}'
   ```

3. **Expected output**:
   ```json
   {
     "is_safe": false,
     "blocked_items": [
       {
         "type": "mention",
         "value": "@competitor",
         "reason": "Do not mention"
       }
     ],
     "warnings": []
   }
   ```

---

## Error Handling

### Common Issues

**Error: "User not found with that email"**
- **Cause**: Email not registered or team member not in system
- **Solution**: Invite team member to platform first
- **Fallback**: Share via external method (email, Slack)

**Error: "Not authorized to approve this request"**
- **Cause**: User trying to approve someone else's approval
- **Solution**: Only assigned approver can approve
- **Impact**: Security feature, prevents unauthorized approvals

**Error: "Approval already approved/rejected"**
- **Cause**: Trying to change approval status twice
- **Solution**: Check approval_status before attempting
- **Impact**: Prevents accidental overrides

**Error: "Filter already exists"**
- **Cause**: Duplicate filter (same type + value)
- **Solution**: Update existing filter instead
- **Impact**: Maintains data integrity

---

## Security Considerations

### Access Control

**Team Shares**:
- Users can only share from their own account
- Users can only see shares they sent or received
- RLS policies enforce row-level security

**Approvals**:
- Only assigned approver can approve/reject
- Requesters cannot self-approve
- Approval history immutable (cannot be deleted)

**Brand Safety**:
- Users can only manage their own filters
- Filters apply only to the creating user
- No cross-user filter access

### Data Privacy

**Shared Data**:
- Recommendations shared are visible to recipient only
- No global team visibility (respects RLS)
- Audit trail via timestamps

**Approval Records**:
- Full post content stored for audit
- Retention policy: 90 days (configurable)
- Delete approved posts after publishing

---

## Best Practices

### Team Collaboration

- ✅ Share only high-confidence recommendations (>0.7)
- ✅ Include context in share notes
- ✅ Review shares weekly to stay updated
- ❌ Don't spam team with every suggestion
- ❌ Don't ignore shared recommendations without review

### Approval Workflows

- ✅ Set clear approval criteria upfront
- ✅ Respond to approvals within 24 hours
- ✅ Provide detailed rejection reasons
- ❌ Don't use approvals for every post (creates bottleneck)
- ❌ Don't self-approve (defeats purpose)

### Brand Safety

- ✅ Review and update filters quarterly
- ✅ Document reasons for each filter
- ✅ Test filters before relying on them
- ❌ Don't over-filter (limits creativity)
- ❌ Don't block without reason

### Custom AI Training

- ✅ Only store high-performing posts (>5% engagement)
- ✅ Review training data for bias
- ✅ Refresh training data every 3 months
- ❌ Don't train on negative examples
- ❌ Don't include proprietary information

---

## Future Enhancements

### Planned Features (Phase 7):

- **Multi-Level Approval Chains** - Manager → Director → VP approval flow
- **Approval Templates** - Pre-configured approval rules by post type
- **Team Analytics** - Track team collaboration metrics
- **Smart Filters** - AI-powered brand safety (context-aware)
- **Custom Model Training UI** - No-code interface for training
- **Bulk Operations** - Approve/reject multiple requests at once
- **Slack/Teams Integration** - Approval notifications in chat tools

### Long-Term Vision:

- **Organization-Level Collaboration** - Share across departments
- **Brand Voice Consistency** - AI checks for brand voice adherence
- **Competitive Intelligence** - Auto-suggest based on competitor analysis
- **Dynamic Approval Rules** - Sentiment-based auto-approval
- **Advanced Training** - Fine-tune Claude on company data

---

## Support

**Debugging**:
- Check Supabase function logs for API errors
- Verify RLS policies allow expected access
- Test edge functions via Supabase CLI

**Questions**:
- See Phase 3 integration guide: `docs/MENTION-SYSTEM-INTEGRATION.md`
- See Phase 4 monitoring guide: `docs/MENTION-MONITORING-ANALYTICS.md`
- See Phase 5 advanced features: `docs/ADVANCED-MENTION-FEATURES.md`

---

**Last Updated**: 2026-01-08
**Phase**: 6 of 6 (Enterprise Features Complete)
**Status**: Production Ready ✅
