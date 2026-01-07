# Mention Building System - Integration Guide

Complete guide for integrating the @-mention and #hashtag system into social posting features.

**Status**: Phase 3 Complete (Frontend Components)
**Last Updated**: 2026-01-08

---

## Overview

The Mention Building System provides:
- **@-mention autocomplete** - Smart suggestions for user mentions
- **#hashtag autocomplete** - AI-powered hashtag suggestions using Claude
- **Usage tracking** - Automatic tracking of mentions/hashtags after successful posts
- **Historical suggestions** - Performance-sorted suggestions based on past usage

---

## Architecture

### Database Layer (Phase 1 - Complete)

**Tables:**
- `social_mentions` - User mention autocomplete history
- `hashtag_suggestions` - Hashtag history + AI generations
- `mention_monitoring` - Discovered brand mentions (Phase 4)
- `mention_analytics` - Performance aggregation (Phase 4)

**Functions:**
- `increment_mention_usage()` - Tracks mention usage after posts
- `get_unread_mentions_count()` - For notification badges
- `get_top_hashtags_by_engagement()` - Performance-sorted hashtags

### Backend Layer (Phase 2 - Complete)

**Edge Functions:**
- `ai-autocomplete` - Extended with `mentions` and `hashtags` cases
- `social-post` - Extended to track usage after successful posts

### Frontend Layer (Phase 3 - Complete)

**Components:**
- `MentionInput` - Rich text input with @/# autocomplete
- `PostCreationForm` - Updated to use MentionInput

---

## Quick Start Integration

### Step 1: Import Required Components

```typescript
import { MentionInput } from '@/components/social/MentionInput';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
```

### Step 2: Add State for Mentions and Hashtags

```typescript
const [postContent, setPostContent] = useState('');
const [mentions, setMentions] = useState<string[]>([]);
const [hashtags, setHashtags] = useState<string[]>([]);
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
```

### Step 3: Use MentionInput Component

```typescript
<MentionInput
  value={postContent}
  onChange={(content, extractedMentions, extractedHashtags) => {
    setPostContent(content);
    setMentions(extractedMentions);
    setHashtags(extractedHashtags);
  }}
  platform={selectedPlatforms[0] || 'twitter'}
  placeholder="What would you like to share? Use @ to mention and # for hashtags..."
  className="min-h-24"
/>
```

### Step 4: Post to Social Media with Mentions/Hashtags

```typescript
const handlePostNow = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('social-post', {
      body: {
        platforms: selectedPlatforms,
        content: {
          text: postContent,
          mentions: mentions,
          hashtags: hashtags
        }
      }
    });

    if (error) throw error;

    toast({
      title: 'Posted successfully!',
      description: `Published to ${selectedPlatforms.length} platform(s)`
    });

    // Clear form
    setPostContent('');
    setMentions([]);
    setHashtags([]);
  } catch (error: any) {
    toast({
      title: 'Failed to post',
      description: error.message,
      variant: 'destructive'
    });
  }
};
```

---

## Component API Reference

### MentionInput

Rich text input with @-mention and #hashtag autocomplete.

**Props:**

```typescript
interface MentionInputProps {
  value: string;                    // Current text value
  onChange: (                       // Callback when content changes
    content: string,                // Full text content
    mentions: string[],             // Extracted @mentions (e.g., ['@john', '@jane'])
    hashtags: string[]              // Extracted #hashtags (e.g., ['#marketing', '#ai'])
  ) => void;
  platform: string;                 // Platform for suggestions ('twitter', 'facebook', etc.)
  placeholder?: string;             // Placeholder text
  className?: string;               // Additional CSS classes
  disabled?: boolean;               // Disable input
}
```

**Features:**
- Triggers autocomplete on `@` or `#` characters
- Debounced API calls (300ms) for performance
- Keyboard navigation (Escape to close suggestions)
- Visual badges showing extracted mentions/hashtags
- Loading states during suggestion fetching

**Example:**

```typescript
<MentionInput
  value={content}
  onChange={(text, mentions, tags) => {
    setContent(text);
    setMentions(mentions);
    setHashtags(tags);
  }}
  platform="twitter"
  placeholder="Share your thoughts..."
/>
```

---

### PostCreationForm (Updated)

Multi-platform post creation form with mention support.

**New Props:**

```typescript
interface PostCreationFormProps {
  // Existing props...
  postContent: string;
  setPostContent: (content: string) => void;

  // NEW: Mention/hashtag props
  mentions?: string[];
  hashtags?: string[];
  onMentionsChange?: (mentions: string[]) => void;
  onHashtagsChange?: (hashtags: string[]) => void;

  // Other props...
  selectedPlatforms: string[];
  onTogglePlatform: (platformId: string) => void;
  onPostNow: () => void;
  onScheduleForLater: () => void;
  isPosting: boolean;
  isScheduling: boolean;
  platforms: Platform[];
}
```

**Example:**

```typescript
<PostCreationForm
  postContent={postContent}
  setPostContent={setPostContent}
  mentions={mentions}
  hashtags={hashtags}
  onMentionsChange={setMentions}
  onHashtagsChange={setHashtags}
  selectedPlatforms={selectedPlatforms}
  onTogglePlatform={togglePlatform}
  onPostNow={handlePostNow}
  onScheduleForLater={handleSchedule}
  isPosting={isPosting}
  isScheduling={isScheduling}
  platforms={availablePlatforms}
/>
```

---

## Backend Integration

### Calling social-post Edge Function

**Request Format:**

```typescript
const { data, error } = await supabase.functions.invoke('social-post', {
  body: {
    platforms: ['twitter', 'facebook', 'linkedin'],
    content: {
      text: "Check out our new product! @partnerbrand #innovation #ai",
      image: "https://example.com/image.jpg",  // Optional
      mentions: ["@partnerbrand"],              // NEW
      hashtags: ["#innovation", "#ai"]          // NEW
    }
  }
});
```

**Response Format:**

```typescript
{
  results: [
    {
      platform: 'twitter',
      success: true,
      data: { id: '123456', url: 'https://twitter.com/...' }
    },
    {
      platform: 'facebook',
      success: false,
      error: 'Platform not connected'
    }
  ]
}
```

**What Happens Behind the Scenes:**

1. Posts to each selected platform
2. If post succeeds, tracks usage:
   - Increments mention usage count in `social_mentions`
   - Increments hashtag usage count in `hashtag_suggestions`
3. Returns success/failure for each platform

---

## AI Hashtag Generation

The system uses **Claude Opus 4.5** to generate intelligent hashtag suggestions.

### How It Works

1. User types post content
2. User types `#` character
3. Edge function calls Claude API with prompt:
   ```
   Generate 5 highly relevant hashtags for this [platform] post.

   Post content:
   "[user's post text]"

   Requirements:
   - No spaces (e.g., #SocialMedia, not #Social Media)
   - Mix of trending and niche hashtags
   - Relevant to content and platform audience
   - Include broad and specific hashtags

   Return ONLY hashtags, one per line, with # symbol.
   ```

4. Claude returns hashtags
5. Hashtags stored in `hashtag_suggestions` with `ai_generated: true`
6. Combined with historical hashtags and shown in dropdown

### Requirements

- User must have Claude API key in `user_secrets` table
- Service name: `anthropic_api_key`
- If no API key found, falls back to historical hashtags only

---

## Autocomplete Flow

### @-Mention Autocomplete

```mermaid
User types "@j" → ai-autocomplete Edge Function
                  ↓
          Query social_mentions table
          WHERE user_id = current_user
          AND platform = selected_platform
          AND mention_handle LIKE '%j%'
          ORDER BY usage_count DESC
                  ↓
          Return ["@john", "@jane", "@jacksmith"]
                  ↓
          Display in dropdown
```

### #-Hashtag Autocomplete

```mermaid
User types "#m" → ai-autocomplete Edge Function
                  ↓
          1. Query hashtag_suggestions table
             (historical hashtags, performance-sorted)
                  ↓
          2. Call Claude API for AI suggestions
             (if user has API key)
                  ↓
          3. Merge and deduplicate
                  ↓
          Return ["#marketing", "#media", "#motivation", ...]
                  ↓
          Display in dropdown
```

---

## Usage Tracking Flow

### After Successful Post

```mermaid
Social post succeeds on Twitter
                  ↓
    Extract mentions: ["@partner"]
    Extract hashtags: ["#ai", "#marketing"]
                  ↓
For each mention:
  CALL increment_mention_usage(user_id, 'twitter', 'partner', null)
  → Increments usage_count in social_mentions
                  ↓
For each hashtag:
  UPSERT into hashtag_suggestions
  → Increments usage_count
  → Updates last_used_at
```

---

## Platform-Specific Notes

### Twitter
- Mentions limited to @username format
- Hashtags: no spaces, letters/numbers/underscores only
- Max 280 characters total (mentions/hashtags count toward limit)

### Facebook
- Mentions: @username or @PageName
- Hashtags: same format as Twitter
- No character limit

### LinkedIn
- Mentions: @FirstName LastName
- Hashtags: same format as Twitter
- Professional hashtags preferred

### Instagram
- Mentions: @username
- Hashtags: up to 30 per post (recommended: 11-15)
- First comment can have additional hashtags

---

## Error Handling

### Common Errors and Solutions

**Error: "No Claude API key found"**
- **Cause**: User hasn't added Claude API key
- **Solution**: Redirect to Settings → Integrations
- **Fallback**: Show only historical hashtags

**Error: "Invalid mention format"**
- **Cause**: Mention longer than 50 characters
- **Solution**: Warn user, skip tracking for that mention
- **Prevention**: Validate in frontend before sending

**Error: "Invalid hashtag format"**
- **Cause**: Hashtag doesn't start with # or is too long
- **Solution**: Warn user, skip tracking for that hashtag
- **Prevention**: Validate in frontend before sending

**Error: "Failed to track mention"**
- **Cause**: Database error during tracking
- **Impact**: Post still succeeds, only tracking fails
- **Solution**: Log error, continue (tracking is non-critical)

---

## Testing Checklist

### Frontend Testing

- [ ] Type `@` character - autocomplete dropdown appears
- [ ] Type `#` character - autocomplete dropdown appears
- [ ] Select suggestion from dropdown - inserts into text
- [ ] Press Escape - closes dropdown
- [ ] Extracted mentions show as blue badges
- [ ] Extracted hashtags show as purple badges
- [ ] Loading state shows during suggestion fetch

### Backend Testing

- [ ] Post with mentions - `increment_mention_usage()` called
- [ ] Post with hashtags - `hashtag_suggestions` updated
- [ ] Post without mentions/hashtags - no tracking errors
- [ ] Invalid mention format - skipped, post succeeds
- [ ] Invalid hashtag format - skipped, post succeeds

### Integration Testing

- [ ] Post to Twitter with @mention - appears in tweet
- [ ] Post to Facebook with #hashtag - appears in post
- [ ] Multi-platform post - tracking works for all platforms
- [ ] Historical suggestions improve over time

---

## Performance Considerations

### Autocomplete Performance

- **Debounced API calls**: 300ms delay prevents excessive requests
- **Database indexes**: Fast lookups on `user_id` + `platform`
- **Caching**: Consider adding frontend cache for frequent searches

### AI Hashtag Generation

- **Cost**: ~$0.005 per generation (200 tokens)
- **Latency**: ~1-2 seconds for Claude API response
- **Optimization**: Cache AI-generated hashtags for 24 hours per user

### Usage Tracking

- **Async operation**: Doesn't block post success
- **Error handling**: Individual try-catch prevents batch failures
- **Database load**: Minimal (upsert operations)

---

## Future Enhancements (Phases 4-6)

### Phase 4: Monitoring & Analytics
- Mention monitoring dashboard
- Brand mention detection
- Sentiment analysis
- Performance analytics

### Phase 5: Advanced Features
- Smart mention suggestions based on context
- Hashtag performance predictions
- Competitor mention tracking
- Automated engagement recommendations

### Phase 6: Enterprise Features
- Team collaboration on mentions
- Multi-brand mention management
- Advanced analytics dashboards
- Mention approval workflows

---

## Migration Guide

If you have an existing social posting component, follow these steps:

### Step 1: Update Dependencies

Ensure you have the latest versions:
- `@/hooks/useAIAutocomplete` - Updated in Phase 2
- `@/components/ui/command` - Required for dropdown
- `@/components/ui/badge` - Required for tag display

### Step 2: Replace Textarea with MentionInput

**Before:**
```typescript
<Textarea
  value={postContent}
  onChange={(e) => setPostContent(e.target.value)}
  placeholder="What's on your mind?"
/>
```

**After:**
```typescript
const [mentions, setMentions] = useState<string[]>([]);
const [hashtags, setHashtags] = useState<string[]>([]);

<MentionInput
  value={postContent}
  onChange={(content, mentions, hashtags) => {
    setPostContent(content);
    setMentions(mentions);
    setHashtags(hashtags);
  }}
  platform={selectedPlatform}
  placeholder="What's on your mind? Use @ and # for suggestions..."
/>
```

### Step 3: Update API Call

Add mentions and hashtags to your social-post API call:

```typescript
const { data, error } = await supabase.functions.invoke('social-post', {
  body: {
    platforms: selectedPlatforms,
    content: {
      text: postContent,
      mentions: mentions,      // ADD THIS
      hashtags: hashtags       // ADD THIS
    }
  }
});
```

---

## Support

**Issues?**
- Check Supabase function logs for backend errors
- Verify Claude API key is set in `user_secrets` table
- Ensure database migration was applied successfully

**Questions?**
- See plan file: `.claude/plans/joyful-tickling-moore.md`
- Review migration: `supabase/migrations/20260107000000_mention_system.sql`

---

**Last Updated**: 2026-01-08
**Phase**: 3 of 6 (Frontend Components Complete)
**Status**: Ready for Integration ✅
