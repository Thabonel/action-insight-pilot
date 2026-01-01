# Facebook Reels Publishing - Testing Guide

**Complete testing checklist for Facebook Reels integration**

**Last Updated:** 2026-01-01

---

## 🎯 Testing Overview

This guide covers end-to-end testing of Facebook Reels publishing, including OAuth connection (shared with Instagram), video upload, and verification.

**Key Note:** Facebook Reels uses the **same OAuth connection as Instagram** since both use Facebook Graph API. If you've already connected Instagram, your Facebook connection may already be available!

---

## ✅ Prerequisites

Before testing, ensure:
- [ ] Facebook Page created (Reels publish to Pages, not personal profiles)
- [ ] Facebook Page has admin access
- [ ] Facebook/Instagram OAuth already configured (from Phase 2)
- [ ] Edge function `facebook-publish` deployed to Supabase

---

## 🔧 Environment Setup

### 1. Facebook Page Requirement

**CRITICAL:** Facebook Reels can only be published to **Facebook Pages**, not personal profiles.

**Create a Facebook Page:**
1. Go to https://www.facebook.com/pages/create
2. Select page type (Business, Brand, Community, etc.)
3. Fill in page details (name, category, description)
4. Add profile picture and cover photo
5. Publish page

**Verify Page Access:**
- You must be an admin of the Page
- Go to Page Settings → Page Roles
- Confirm you're listed as "Admin"

---

### 2. OAuth Connection (Shared with Instagram)

Facebook Reels uses the **same OAuth connection** as Instagram:

**If Instagram already connected:**
- ✅ No additional OAuth setup needed!
- ✅ Same access token works for both platforms
- ✅ Just need to fetch Facebook Page ID (happens automatically)

**If Instagram NOT connected:**
- Follow `docs/FACEBOOK-APP-REVIEW-GUIDE.md`
- Connect Instagram/Facebook via OAuth
- Grants access to both platforms simultaneously

---

### 3. Deploy Edge Function

```bash
supabase functions deploy facebook-publish
supabase functions deploy publish-video  # Redeploy with Facebook support
```

---

## 📋 Test Cases

### Test Case 1: Verify Facebook Connection

**Objective:** Confirm Facebook/Instagram OAuth provides Page access

**Steps:**
1. Log into Action Insight
2. Go to Settings → Integrations
3. Check Instagram connection status

**Expected Result:**
- ✅ Instagram shows "Connected" (if previously connected)
- ✅ Facebook should automatically detect connection
- ✅ Connection can be reused for Facebook Reels

**Database Verification:**
```sql
SELECT platform_name, connection_status, connection_metadata
FROM oauth_connections
WHERE platform_name IN ('instagram', 'facebook')
  AND user_id = 'your-user-id';
```

Should show either:
- Instagram connection with `connection_metadata.facebook_page_id` (ideal)
- OR separate Facebook connection

---

### Test Case 2: Facebook Page Detection

**Objective:** Verify edge function can find and access Facebook Page

**Steps:**
1. Have a Facebook Page created and accessible
2. Attempt to publish first Facebook Reel
3. Edge function should automatically fetch Page ID

**Expected Result:**
- ✅ Edge function fetches user's Facebook Pages
- ✅ Selects first Page (or admin Page)
- ✅ Stores Page ID in `connection_metadata.facebook_page_id`
- ✅ Stores Page name in `connection_metadata.facebook_page_name`
- ✅ Obtains Page access token for publishing

**Database Check After First Publish:**
```sql
SELECT connection_metadata->>'facebook_page_id' as page_id,
       connection_metadata->>'facebook_page_name' as page_name
FROM oauth_connections
WHERE platform_name IN ('instagram', 'facebook')
  AND user_id = 'your-user-id';
```

Should show Page ID and name populated.

---

### Test Case 3: Publish Single Video to Facebook Reels

**Objective:** End-to-end video publishing to Facebook Reels

**Steps:**
1. Ensure Facebook connection available (via Instagram OAuth)
2. Go to AI Video Studio
3. Generate or upload a test video:
   - Format: MP4 (H.264/AAC)
   - Resolution: 1080x1920 (9:16 vertical)
   - Duration: 4-90 seconds (Facebook Reels limit)
   - Size: < 1GB
4. Navigate to "Publish to Social Media" section
5. Select "Facebook Reels" platform
6. Add caption: "Test Reel from Action Insight"
7. Add hashtags: "test", "marketing", "automation"
8. Click "Publish to 1 Platform"
9. Wait for upload (30-90 seconds)
10. Should see "Successfully published" message

**Expected Result:**
- ✅ Upload initiates successfully
- ✅ Three-phase upload (start → transfer → finish)
- ✅ Video uploaded within 90 seconds
- ✅ Platform URL provided (https://www.facebook.com/reel/VIDEO_ID)
- ✅ `published_videos` table updated with Facebook data
- ✅ Video appears on Facebook Page

**Verification:**
1. Go to your Facebook Page
2. Navigate to "Reels" tab
3. Should see newly uploaded Reel
4. Check caption and hashtags match

**Database Check:**
```sql
SELECT * FROM published_videos
WHERE platforms ? 'facebook'
ORDER BY created_at DESC
LIMIT 1;
```

Should show:
```json
{
  "facebook": {
    "platform_video_id": "123456789",
    "platform_url": "https://www.facebook.com/reel/123456789",
    "published_at": "2026-01-01T12:00:00Z",
    "status": "published",
    "page_id": "page_id_here"
  }
}
```

---

### Test Case 4: Multi-Platform Publishing (All 4 Platforms!)

**Objective:** Publish same video to TikTok, Instagram, YouTube, AND Facebook

**Steps:**
1. Ensure all 4 platforms connected:
   - TikTok (Blotato or Direct API)
   - Instagram Reels (Business account)
   - YouTube Shorts (Google OAuth)
   - Facebook Reels (Facebook Page)
2. Generate video in AI Video Studio
3. Select ALL FOUR platforms
4. Add caption and hashtags
5. Click "Publish to 4 Platforms"
6. Wait for all to complete (1-3 minutes)

**Expected Result:**
- ✅ All 4 platforms publish successfully
- ✅ PublishingStatus shows 4 successful publishes
- ✅ Each platform has unique platform_video_id
- ✅ Video appears on:
  - TikTok profile
  - Instagram Reels tab
  - YouTube Shorts section
  - Facebook Page Reels tab

**Verification:**
Check each platform:
- **TikTok:** Profile → Videos
- **Instagram:** Profile → Reels tab
- **YouTube:** YouTube Studio → Shorts
- **Facebook:** Facebook Page → Reels tab

**Database Verification:**
```sql
SELECT platforms FROM published_videos
WHERE platforms ?& ARRAY['tiktok', 'instagram', 'youtube', 'facebook']
ORDER BY created_at DESC
LIMIT 1;
```

Should show all 4 platforms in the JSON.

---

### Test Case 5: No Facebook Page Error Handling

**Objective:** Verify error when user has no Facebook Page

**Steps:**
1. Use test account with NO Facebook Page
2. Try to publish to Facebook Reels
3. Should receive clear error

**Expected Result:**
- ❌ Publishing fails
- ✅ Error message: "No Facebook Page found. You need a Facebook Page to publish Reels. Please create a Page first."
- ✅ Provides link/instructions to create Page

**Fix:**
User must create a Facebook Page before publishing Reels.

---

### Test Case 6: Permissions Error Handling

**Objective:** Test error when insufficient Facebook permissions

**Steps:**
1. Manually revoke Page permissions from Facebook OAuth
2. Try to publish Facebook Reel
3. Should fail with permissions error

**Expected Result:**
- ❌ Publishing fails
- ✅ Error message: "Insufficient permissions to publish to Facebook Page. Please reconnect your account and grant all permissions."
- ✅ Suggests reconnecting Instagram/Facebook

**Fix:**
1. Settings → Integrations
2. Disconnect Instagram (also disconnects Facebook)
3. Reconnect Instagram
4. Grant all permissions when prompted

---

### Test Case 7: Video Duration Limits

**Objective:** Test Facebook Reels duration limits (4-90 seconds)

**Steps:**
1. Try to publish video < 4 seconds
   - Should fail or be rejected by Facebook
2. Try to publish video > 90 seconds
   - Should fail or be rejected by Facebook
3. Publish video within range (e.g., 30 seconds)
   - Should succeed

**Expected Result:**
- ❌ Videos <4s or >90s fail
- ✅ Videos 4-90s succeed
- ✅ Error message explains duration limits

**Workaround:**
- Trim videos to 4-90 second range before uploading
- Consider adding duration validation in frontend

---

### Test Case 8: Concurrent Publishing (Multiple Users)

**Objective:** Test multiple users publishing to Facebook simultaneously

**Steps:**
1. Have 3+ users publish Facebook Reels at same time
2. Each user has their own Facebook Page
3. Verify no conflicts

**Expected Result:**
- ✅ All publishes succeed independently
- ✅ Each video published to correct user's Page
- ✅ No database lock issues
- ✅ No race conditions
- ✅ Page IDs correctly stored per user

---

### Test Case 9: Reusing Instagram Connection

**Objective:** Confirm Instagram OAuth works for Facebook Reels

**Steps:**
1. User has Instagram connected (Phase 2)
2. NO separate Facebook connection
3. Try to publish to Facebook Reels
4. Should work using Instagram connection

**Expected Result:**
- ✅ Instagram connection detected
- ✅ Used for Facebook Reel publishing
- ✅ No need to connect separately
- ✅ Both platforms share same access token

**Database Verification:**
```sql
-- Should show Instagram connection being used for both
SELECT platform_name, connection_metadata
FROM oauth_connections
WHERE user_id = 'your-user-id'
  AND platform_name IN ('instagram', 'facebook');
```

May show only Instagram connection, but metadata includes `facebook_page_id`.

---

### Test Case 10: Caption Length Validation

**Objective:** Verify captions are truncated to Facebook's 2200 char limit

**Steps:**
1. Create caption with 2500 characters
2. Add 10 hashtags (each ~15 chars)
3. Total > 2200 characters
4. Publish to Facebook Reels

**Expected Result:**
- ✅ Caption automatically truncated to 2200 chars
- ✅ Publishing succeeds
- ✅ No error about caption length
- ✅ On Facebook, caption shows truncated version

**Verification:**
Check published Reel on Facebook Page - caption should be cut off at 2200 characters.

---

## 🐛 Known Issues & Workarounds

### Issue 1: "No Facebook Page found"

**Symptoms:**
- Publishing fails
- Error: "No Facebook Page found"

**Causes:**
1. User has no Facebook Page
2. Page not linked to account
3. Not admin of any Page

**Fix:**
1. Create Facebook Page: https://www.facebook.com/pages/create
2. Ensure you're admin of the Page
3. Reconnect Instagram/Facebook if needed

---

### Issue 2: "Insufficient permissions to publish"

**Symptoms:**
- OAuth completed but publishing fails
- Permission error

**Causes:**
1. Didn't grant `pages_manage_posts` permission
2. Page access revoked manually
3. OAuth consent screen missing required scopes

**Fix:**
1. Disconnect and reconnect Instagram/Facebook
2. When granting permissions, ensure ALL are checked:
   - Manage Pages
   - Publish content to Pages
   - Read Page insights
3. Complete OAuth flow again

---

### Issue 3: Published Reel Not Visible on Page

**Symptoms:**
- Publishing succeeds but Reel not on Page
- No error shown

**Causes:**
1. Facebook processing delay (rare)
2. Video violated community guidelines (auto-removed)
3. Page settings block Reels

**Fix:**
1. Wait 10-15 minutes (Facebook processing delay)
2. Check Facebook notifications for removal notice
3. Verify Page settings allow Reels:
   - Page Settings → Templates and Tabs
   - Ensure "Reels" tab is enabled

---

### Issue 4: Wrong Page Selected

**Symptoms:**
- Reel published to unexpected Page
- User has multiple Pages

**Causes:**
- Edge function selects first Page by default
- User is admin of multiple Pages

**Fix (Current):**
- Edge function uses first Page returned by API
- User can manually select preferred Page in Page Settings

**Future Enhancement:**
- Add Page selection UI in frontend
- Let user choose which Page to publish to
- Store preferred Page in user preferences

---

## 📊 Performance Benchmarks

**Expected Performance:**

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Page ID Fetch | < 5s | < 10s | > 15s |
| Video Upload (10MB) | < 30s | < 60s | > 90s |
| Video Upload (100MB) | < 60s | < 120s | > 180s |
| Three-Phase Upload | < 90s | < 150s | > 180s |
| Success Rate | > 90% | > 80% | < 70% |

**Monitor:**
- Time from "Publish" click to "Success" message
- Percentage of successful uploads
- Common error types

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Check Supabase function logs:
```bash
supabase functions logs facebook-publish --tail
```

Look for:
- `[Facebook Publish]` prefixed messages
- Page ID detection
- Three-phase upload (start → transfer → finish)
- Video ID returned
- Platform URL generated

### Check Database State

```sql
-- View Facebook/Instagram connections
SELECT platform_name, connection_status,
       connection_metadata->>'facebook_page_id' as page_id,
       connection_metadata->>'facebook_page_name' as page_name
FROM oauth_connections
WHERE platform_name IN ('facebook', 'instagram');

-- View Facebook publishing history
SELECT id, platforms->'facebook' as facebook_data, created_at
FROM published_videos
WHERE platforms ? 'facebook'
ORDER BY created_at DESC
LIMIT 10;
```

### Test with cURL

```bash
# Test publishing (requires valid auth token)
curl -X POST "https://your-function-url/facebook-publish" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "video_url": "https://example.com/video.mp4",
    "caption": "Test Reel",
    "hashtags": ["test", "automation"]
  }'
```

---

## ✅ Sign-Off Checklist

Before considering Facebook Reels integration complete:

### Functional Testing
- [ ] OAuth connection works (shared with Instagram)
- [ ] Facebook Page detected automatically
- [ ] Video upload succeeds
- [ ] Video appears on Facebook Page
- [ ] Multi-platform works (TikTok + Instagram + YouTube + Facebook)
- [ ] Error handling works (no Page, permissions, duration limits)

### Edge Cases
- [ ] Large video files (100-200 MB)
- [ ] Videos at duration limits (4s, 90s)
- [ ] Special characters in caption
- [ ] Many hashtags (10+)
- [ ] Multiple Facebook Pages (selects first)
- [ ] Concurrent uploads from different users

### Documentation
- [ ] Testing guide complete
- [ ] User-facing help docs updated
- [ ] Error messages user-friendly
- [ ] Facebook Page requirement explained

### Performance
- [ ] Upload time < 90s for typical videos
- [ ] Success rate > 85%
- [ ] No memory leaks
- [ ] Concurrent publishes work

---

## 📞 Support

**Issues?** Check:
1. Supabase function logs
2. Facebook Page exists and you're admin
3. Instagram/Facebook OAuth connected
4. Video format (MP4, vertical, 4-90s)
5. Page permissions granted

**Still stuck?** Review:
- `docs/FACEBOOK-APP-REVIEW-GUIDE.md` (Instagram OAuth)
- Facebook Graph API docs: https://developers.facebook.com/docs/video-api

---

**Last Updated:** 2026-01-01
**API Version:** Facebook Graph API v18.0
**Status:** Phase 4 Complete ✅
