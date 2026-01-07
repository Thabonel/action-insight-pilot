# Advanced Mention Features - Phase 5

AI-powered smart suggestions, performance predictions, and engagement optimization.

**Status**: Phase 5 Complete
**Last Updated**: 2026-01-08

---

## Overview

Phase 5 adds intelligent, AI-driven features to the mention system:
- **Smart Mention Suggestions** - Claude analyzes post content to suggest relevant @mentions
- **Hashtag Performance Prediction** - ML-based predictions of how hashtags will perform
- **Competitor Mention Tracking** - Monitor when others mention your competitors
- **Engagement Recommendations** - Real-time AI suggestions to improve posts
- **Context-Aware Autocomplete** - Smarter suggestions based on post content

---

## Features

### 1. Smart Mention Suggester

**Edge Function**: `smart-mention-suggester`

**Purpose**: Analyzes post content using Claude Opus 4.5 to suggest relevant @mentions.

**How It Works**:
```mermaid
User types post content
        ↓
Frontend calls smart-mention-suggester
        ↓
Edge function analyzes:
  - Post content and context
  - Business description
  - Historical mentions
  - Industry/campaign type
        ↓
Claude API generates suggestions:
  - Relevant brands/influencers
  - Attribution sources
  - Collaboration opportunities
        ↓
Returns ranked suggestions with confidence scores
```

**API Call**:
```typescript
const { data } = await supabase.functions.invoke('smart-mention-suggester', {
  body: {
    postContent: "Just launched our new AI-powered analytics tool!",
    platform: "twitter",
    context: {
      industry: "technology",
      campaign_type: "product_launch"
    }
  }
});

// Response:
{
  suggestions: [
    {
      handle: "techcrunch",
      reason: "Tech news authority, relevant to AI topic",
      confidence: 0.9,
      type: "brand"
    },
    {
      handle: "awscloud",
      reason: "Cloud infrastructure partner",
      confidence: 0.75,
      type: "brand"
    }
  ]
}
```

**Features**:
- Claude Opus 4.5 for advanced reasoning
- Historical mention context
- Business description awareness
- Confidence scoring (0-1)
- Type classification (user/brand/influencer/competitor)
- Fallback to historical data if API unavailable

---

### 2. Hashtag Performance Predictor

**Edge Function**: `hashtag-performance-predictor`

**Purpose**: Predicts engagement rates for hashtags using historical performance data.

**How It Works**:
```mermaid
User types hashtags
        ↓
Frontend calls hashtag-performance-predictor
        ↓
Edge function queries:
  - Exact hashtag historical data
  - Similar hashtag performance
  - Platform-specific trends
        ↓
Calculates prediction:
  - Predicted engagement rate
  - Recommendation (excellent/good/average/poor)
  - Similar alternatives
        ↓
Returns predictions sorted by performance
```

**Prediction Algorithm**:
```typescript
// If exact historical data exists:
predicted_engagement = avg_engagement_rate
confidence = min(0.5 + (usage_count * 0.05), 0.95)

// If similar hashtags exist:
predicted_engagement = average(similar_hashtags.engagement)
confidence = 0.6

// New hashtag (no data):
predicted_engagement = 2.5  // Baseline
confidence = 0.3
```

**API Call**:
```typescript
const { data } = await supabase.functions.invoke('hashtag-performance-predictor', {
  body: {
    hashtags: ['#ai', '#marketing', '#newproduct'],
    platform: "twitter",
    postContent: "Just launched our new AI tool..."
  }
});

// Response:
{
  predictions: [
    {
      hashtag: "#ai",
      predicted_engagement: 5.2,
      confidence: 0.85,
      recommendation: "excellent",
      reasoning: "This hashtag historically performs at 5.2% engagement. Keep using it!",
      similar_hashtags: ["#artificialintelligence", "#machinelearning"]
    },
    {
      hashtag: "#newproduct",
      predicted_engagement: 1.8,
      confidence: 0.45,
      recommendation: "average",
      reasoning: "New hashtag. Based on similar hashtags, predicted 1.8% engagement.",
      similar_hashtags: ["#productlaunch", "#newrelease"]
    }
  ]
}
```

**Recommendations**:
- **Excellent** (5%+ predicted): 🔥 Use it!
- **Good** (3-5% predicted): 📈 Solid choice
- **Average** (1.5-3% predicted): 📊 Consider alternatives
- **Poor** (<1.5% predicted): ❌ Try different hashtags

---

### 3. Competitor Mention Tracker

**Edge Function**: `competitor-mention-tracker`

**Purpose**: Monitors when others mention your competitors on social media.

**How It Works**:
```mermaid
Daily Cron (6 AM UTC)
        ↓
Fetch users with competitor tracking enabled
        ↓
For each competitor handle:
  → Search Twitter API for @competitor mentions
  → Extract post metadata
  → Analyze sentiment
  → Check engagement stats
        ↓
Store in mention_monitoring table
(flagged as competitor mention)
        ↓
Display in MentionMonitoringDashboard
```

**Setup**:

1. **Mark mentions as competitors**:
```sql
UPDATE social_mentions
SET mention_type = 'competitor'
WHERE mention_handle IN ('competitor1', 'competitor2');
```

2. **Deploy cron job**:
```bash
supabase functions deploy competitor-mention-tracker
supabase functions schedule competitor-mention-tracker --cron "0 6 * * *"
```

**Use Cases**:
- **Competitive Intelligence**: See what people say about competitors
- **Opportunity Detection**: Find users complaining about competitors
- **Trend Monitoring**: Track competitor campaigns and launches
- **Sentiment Analysis**: Gauge public perception of competitors

---

### 4. Engagement Recommendations Panel

**Component**: `EngagementRecommendationsPanel`

**Purpose**: Real-time AI-powered suggestions to improve post engagement.

**Features**:
- 5 types of recommendations:
  1. **Mention Suggestions** - Relevant @mentions to add
  2. **Hashtag Performance** - Improve underperforming hashtags
  3. **Content Length** - Optimal word count guidance
  4. **Timing Optimization** - Best time to post
  5. **Call-to-Action** - Add questions or CTAs

**Priority Levels**:
- 🔴 **High**: Critical improvements (e.g., no hashtags, posting at 3 AM)
- 🟡 **Medium**: Moderate impact (e.g., short content, weak hashtags)
- 🟢 **Low**: Nice-to-have (e.g., already excellent choices)

**Example Recommendations**:

```typescript
[
  {
    type: 'mention',
    priority: 'high',
    title: 'Tag @techcrunch',
    description: 'Tech news authority, relevant to AI topic',
    action: 'Add @techcrunch to your post',
    impact: '+27% engagement',
    confidence: 0.9
  },
  {
    type: 'hashtag',
    priority: 'high',
    title: 'Add Hashtags for Discovery',
    description: 'No hashtags detected in your post',
    action: 'Add 3-5 relevant hashtags to increase reach',
    impact: '+40% average reach improvement',
    confidence: 0.85
  },
  {
    type: 'timing',
    priority: 'medium',
    title: 'Consider Scheduling for Peak Hours',
    description: 'Posting now may limit visibility',
    action: 'Schedule for 9 AM - 3 PM for better engagement',
    impact: '+35% average engagement during peak hours',
    confidence: 0.75
  }
]
```

**Integration**:
```typescript
import { EngagementRecommendationsPanel } from '@/components/social/EngagementRecommendationsPanel';

<EngagementRecommendationsPanel
  postContent={postContent}
  platform="twitter"
  selectedPlatforms={['twitter', 'linkedin']}
/>
```

**Auto-Generated Recommendations**:
- Debounced 1 second after user stops typing
- Updates in real-time as content changes
- Sorts by priority (high → medium → low)
- Shows top 5 recommendations
- User can mark as "Applied" to track implementation

---

## Implementation Guide

### 1. Deploy Edge Functions

```bash
# Smart mention suggester
supabase functions deploy smart-mention-suggester

# Hashtag performance predictor
supabase functions deploy hashtag-performance-predictor

# Competitor mention tracker (cron)
supabase functions deploy competitor-mention-tracker
supabase functions schedule competitor-mention-tracker --cron "0 6 * * *"
```

### 2. Integrate EngagementRecommendationsPanel

Add to your post creation form:

```typescript
import { useState } from 'react';
import { MentionInput } from '@/components/social/MentionInput';
import { EngagementRecommendationsPanel } from '@/components/social/EngagementRecommendationsPanel';

function PostCreationPage() {
  const [postContent, setPostContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter']);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Post Creation */}
      <div>
        <MentionInput
          value={postContent}
          onChange={(content, m, h) => {
            setPostContent(content);
            setMentions(m);
            setHashtags(h);
          }}
          platform={selectedPlatforms[0]}
        />
      </div>

      {/* Right Column - AI Recommendations */}
      <div>
        <EngagementRecommendationsPanel
          postContent={postContent}
          platform={selectedPlatforms[0]}
          selectedPlatforms={selectedPlatforms}
        />
      </div>
    </div>
  );
}
```

### 3. Enable Competitor Tracking

Mark specific mentions as competitors:

```sql
-- Via SQL
INSERT INTO social_mentions (user_id, platform, mention_handle, mention_type)
VALUES ('user-uuid', 'twitter', 'competitor_handle', 'competitor');

-- Or via frontend
await supabase.from('social_mentions').upsert({
  user_id: user.id,
  platform: 'twitter',
  mention_handle: 'competitor_handle',
  mention_type: 'competitor'
});
```

---

## Performance & Cost

### Smart Mention Suggester

**Cost per request**:
- Claude Opus 4.5: ~$0.015 (300 tokens input, 500 tokens output)
- Fallback (no API key): Free (historical data only)

**Latency**:
- Claude API call: 1-2 seconds
- Fallback: <100ms

**Optimization**:
- Cache suggestions for 5 minutes per post content
- Debounce API calls (1 second delay)
- Use fallback for cost-sensitive users

### Hashtag Performance Predictor

**Cost**: Free (database queries only)

**Latency**: <200ms

**Optimization**:
- Indexed queries on `(user_id, platform, avg_engagement_rate)`
- Limit to top 5 similar hashtags
- Cache predictions for 10 minutes

### Competitor Mention Tracker

**Cost per run**:
- Twitter API: Free tier (100 requests/15 min)
- Runs daily at 6 AM UTC

**Optimization**:
- Batch competitor searches (max 5 per user)
- Rate limiting between API calls
- Deduplication by `(platform, post_id)`

### Engagement Recommendations

**Cost**:
- Smart mentions: $0.015 per generation
- Hashtag predictions: Free
- Other recommendations: Free (rule-based)

**Total per post**: ~$0.015 (if Claude API used)

---

## Testing Guide

### Test Smart Mention Suggester

1. **Create post with relevant content**:
   ```
   "Just launched our new AI-powered analytics platform
   built on cutting-edge machine learning technology!"
   ```

2. **Call edge function**:
   ```bash
   supabase functions invoke smart-mention-suggester \
     --body '{"postContent":"Just launched our new AI...","platform":"twitter"}'
   ```

3. **Expected output**:
   - 3-5 relevant @mentions
   - Confidence scores 0.7-0.95
   - Reasons explaining relevance
   - Mix of brands, influencers, partners

### Test Hashtag Performance Predictor

1. **Create hashtags with history**:
   - Use `#ai` in 5 posts over time
   - Track engagement rates

2. **Call predictor**:
   ```bash
   supabase functions invoke hashtag-performance-predictor \
     --body '{"hashtags":["#ai","#newhashtag"],"platform":"twitter"}'
   ```

3. **Expected output**:
   - `#ai`: High confidence, shows historical data
   - `#newhashtag`: Low confidence, baseline prediction

### Test Competitor Tracking

1. **Mark competitor**:
   ```sql
   UPDATE social_mentions
   SET mention_type = 'competitor'
   WHERE mention_handle = 'competitor_brand';
   ```

2. **Manually trigger cron**:
   ```bash
   supabase functions invoke competitor-mention-tracker
   ```

3. **Check database**:
   ```sql
   SELECT * FROM mention_monitoring
   WHERE mentioned_handle = 'competitor_brand'
   ORDER BY discovered_at DESC;
   ```

### Test Engagement Recommendations

1. **Type post content** in UI with EngagementRecommendationsPanel
2. **Wait 1 second** (debounce delay)
3. **Verify recommendations appear**:
   - Check mention suggestions
   - Check hashtag predictions
   - Check timing/content/CTA recommendations
4. **Click "Mark Applied"** to track implementation

---

## Error Handling

### Common Issues

**Error: "Invalid Claude API key"**
- **Cause**: User hasn't added Claude API key or key is invalid
- **Solution**: Redirect to Settings → Integrations
- **Fallback**: Use historical mention suggestions

**Error: "Failed to predict performance"**
- **Cause**: Database error or no historical data
- **Solution**: Return baseline predictions (2.5% engagement)
- **Impact**: Lower confidence scores

**Error: "Competitor tracking failed"**
- **Cause**: Twitter API rate limit or auth error
- **Solution**: Retry on next cron run (24 hours later)
- **Impact**: Delayed competitor insights

**Error: "No recommendations generated"**
- **Cause**: Post content too short (<10 characters)
- **Solution**: Show message "Type more content..."
- **Impact**: User sees empty state

---

## Advanced Use Cases

### 1. Campaign-Specific Mention Suggestions

```typescript
const { data } = await supabase.functions.invoke('smart-mention-suggester', {
  body: {
    postContent: "Excited to announce our partnership...",
    platform: "linkedin",
    context: {
      campaign_type: "partnership_announcement",
      industry: "fintech",
      partners: ["stripe", "plaid"]
    }
  }
});

// Returns: @stripe, @plaid, relevant fintech influencers
```

### 2. A/B Testing Hashtag Predictions

```typescript
// Test Option A: High-performing hashtags
const optionA = ["#ai", "#machinelearning", "#innovation"];

// Test Option B: Niche hashtags
const optionB = ["#mlops", "#dataengineering", "#aiethics"];

const { data: predictionsA } = await predictPerformance(optionA);
const { data: predictionsB } = await predictPerformance(optionB);

// Compare predicted engagement
const avgA = average(predictionsA.map(p => p.predicted_engagement));
const avgB = average(predictionsB.map(p => p.predicted_engagement));

console.log(`Option A predicted: ${avgA}%`);
console.log(`Option B predicted: ${avgB}%`);
```

### 3. Automated Competitor Response

```typescript
// Fetch competitor mentions with negative sentiment
const { data: negativeCompetitorMentions } = await supabase
  .from('mention_monitoring')
  .select('*')
  .eq('sentiment', 'negative')
  .eq('mentioned_handle', 'competitor_brand')
  .eq('is_responded', false)
  .limit(10);

// Generate response suggestions
for (const mention of negativeCompetitorMentions) {
  // Opportunity to engage and offer alternative
  console.log(`Potential customer dissatisfied with ${mention.mentioned_handle}`);
  console.log(`Post: ${mention.post_url}`);
}
```

---

## Best Practices

### Smart Mentions
- ✅ Use for product launches, partnerships, attributions
- ✅ Review AI suggestions before applying
- ✅ Mix AI suggestions with your own knowledge
- ❌ Don't blindly tag everyone Claude suggests
- ❌ Don't spam irrelevant brands/influencers

### Hashtag Predictions
- ✅ Test new hashtags in low-stakes posts first
- ✅ Replace poor performers (< 1.5% predicted)
- ✅ Build on excellent performers (5%+ predicted)
- ❌ Don't use only predicted hashtags (mix proven + new)
- ❌ Don't ignore platform-specific norms

### Competitor Tracking
- ✅ Focus on 3-5 key competitors max
- ✅ Monitor sentiment trends over time
- ✅ Identify switching opportunities
- ❌ Don't track too many competitors (noise)
- ❌ Don't engage negatively with competitors

### Engagement Recommendations
- ✅ Apply high-priority recommendations first
- ✅ Mark as "Applied" to track improvements
- ✅ A/B test recommendations vs. baseline
- ❌ Don't apply ALL recommendations (authenticity matters)
- ❌ Don't ignore your brand voice for engagement

---

## Future Enhancements

### Planned Features:
- **ML-based mention suggestions** - Train custom model on user's successful posts
- **Hashtag trend detection** - Identify emerging hashtags before they peak
- **Competitor campaign alerts** - Notify when competitor launches major campaign
- **Engagement prediction scores** - Overall post performance prediction
- **A/B test recommendations** - Suggest variations to test

### Enterprise Features (Phase 6):
- **Team collaboration** - Share recommendations across team
- **Brand safety filters** - Avoid controversial mentions
- **Approval workflows** - Require approval before applying suggestions
- **Custom AI models** - Train on company-specific data

---

## Support

**Debugging**:
- Check Supabase function logs for API errors
- Verify Claude API key is active
- Ensure historical data exists for predictions

**Questions**:
- See Phase 3 integration guide: `docs/MENTION-SYSTEM-INTEGRATION.md`
- See Phase 4 monitoring guide: `docs/MENTION-MONITORING-ANALYTICS.md`

---

**Last Updated**: 2026-01-08
**Phase**: 5 of 6 (Advanced Features Complete)
**Status**: Production Ready ✅
