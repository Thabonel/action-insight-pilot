# Instagram Reels Publishing - Testing Guide

**Complete testing checklist for Instagram Reels integration**

**Last Updated:** 2026-01-01

---

## 🎯 Testing Overview

This guide covers end-to-end testing of Instagram Reels publishing, including OAuth connection, video upload, processing polling, and verification.

---

## ✅ Prerequisites

Before testing, ensure:
- [ ] Instagram Business or Creator account created
- [ ] Instagram account linked to a Facebook Page
- [ ] You have admin access to the Page
- [ ] Facebook App created with App ID and Secret
- [ ] Facebook App Review submitted (or approved)
- [ ] Edge functions deployed to Supabase

---

## 🔧 Environment Setup

### 1. Set Environment Variables

Add to Supabase Edge Function secrets:
```bash
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
INSTAGRAM_REDIRECT_URI=https://your-domain.com/oauth/instagram/callback
```

### 2. Deploy Edge Functions

```bash
supabase functions deploy instagram-oauth-callback
supabase functions deploy instagram-publish
supabase functions deploy publish-video  # Redeploy with Instagram support
```

### 3. Verify Database

Ensure `oauth_connections` table exists:
```sql
SELECT * FROM oauth_connections WHERE platform_name = 'instagram';
```

---

## 📋 Test Cases

### Test Case 1: Instagram OAuth Connection

**Objective:** Verify users can connect Instagram Business account

**Steps:**
1. Log into Action Insight platform
2. Go to Settings → Integrations
3. Click "Connect Instagram"
4. Should redirect to Facebook OAuth page
5. Log in with Facebook credentials
6. Grant all requested permissions
7. Should redirect back to Action Insight
8. Should show "Connected" status with green badge

**Expected Result:**
- ✅ OAuth flow completes without errors
- ✅ `oauth_connections` table has new row with `platform_name = 'instagram'`
- ✅ `connection_metadata.account_type = 'business'`
- ✅ `connection_metadata.instagram_username` is populated
- ✅ UI shows "Connected" badge

**Common Issues:**
- ❌ "No Instagram Business Account found" → Account is Personal, not Business
- ❌ "Not linked to Facebook Page" → Link Instagram to a Page first
- ❌ Redirect loop → Check REDIRECT_URI matches exactly

---

### Test Case 2: Personal Account Rejection

**Objective:** Verify Personal Instagram accounts are rejected

**Steps:**
1. Try to connect Personal Instagram account
2. Complete OAuth flow
3. Should see error message

**Expected Result:**
- ❌ Connection fails
- ✅ Error message: "No Instagram Business Account found..."
- ✅ Explains need for Business/Creator account

**Why This Matters:**
Instagram API does NOT support Personal accounts. This must be enforced.

---

### Test Case 3: Publish Single Video to Instagram

**Objective:** End-to-end video publishing to Instagram Reels

**Steps:**
1. Ensure Instagram is connected
2. Go to AI Video Studio
3. Generate or upload a test video:
   - Format: MP4 (H.264/AAC)
   - Resolution: 1080x1920 (9:16)
   - Duration: 10-30 seconds
   - Size: < 1GB
4. Navigate to "Publish to Social Media" section
5. Select "Instagram Reels" platform
6. Add caption: "Test Reel from Action Insight 🎬"
7. Add hashtags: "test, automation, marketing"
8. Click "Publish to 1 Platform"
9. Wait for processing (may take 1-5 minutes)
10. Should see "Successfully published" message

**Expected Result:**
- ✅ Upload initiates successfully
- ✅ Processing status shows "Processing..." (polling works)
- ✅ After 1-5 minutes, status changes to "Published"
- ✅ Platform URL provided (Instagram Reel link)
- ✅ `published_videos` table updated with Instagram data
- ✅ Video appears on Instagram profile

**Verification:**
1. Open Instagram app or https://instagram.com
2. Go to your profile
3. Check Reels tab
4. Should see newly published Reel
5. Caption and hashtags should match

---

### Test Case 4: Multi-Platform Publishing (TikTok + Instagram)

**Objective:** Publish same video to multiple platforms simultaneously

**Steps:**
1. Ensure both TikTok and Instagram are connected
2. Generate video in AI Video Studio
3. Select BOTH TikTok and Instagram platforms
4. Add caption and hashtags
5. Click "Publish to 2 Platforms"
6. Wait for both to complete

**Expected Result:**
- ✅ Both platforms publish successfully
- ✅ PublishingStatus shows 2 successful publishes
- ✅ Each platform has unique platform_video_id
- ✅ Video appears on both TikTok AND Instagram

---

### Test Case 5: Video Processing Timeout

**Objective:** Verify timeout handling if Instagram takes too long

**Steps:**
1. Publish a very large video (near 1GB) or complex format
2. Instagram may take longer than 5 minutes to process
3. Should timeout gracefully

**Expected Result:**
- ✅ After 5 minutes of polling, returns timeout error
- ✅ Error message: "Video processing timed out..."
- ✅ Suggests trying again later
- ✅ Does NOT crash or hang indefinitely

**Manual Test:**
You can artificially trigger this by modifying `maxPollAttempts` to a lower value (e.g., 3) for testing.

---

### Test Case 6: Invalid Video Format

**Objective:** Verify error handling for unsupported formats

**Steps:**
1. Try to publish video in wrong format:
   - WebM instead of MP4
   - Wrong aspect ratio (16:9 instead of 9:16)
   - File too large (> 1GB)
2. Should fail with clear error

**Expected Result:**
- ❌ Publishing fails
- ✅ Error message explains issue:
  - "Instagram failed to process the video. Please check video format and size (max 1GB, MP4 format)."
- ✅ Does NOT proceed to publish step

---

### Test Case 7: Caption Length Validation

**Objective:** Verify captions are truncated to Instagram's 2200 char limit

**Steps:**
1. Create caption with 2500 characters
2. Add 10 hashtags (each ~15 chars)
3. Total > 2200 characters
4. Publish to Instagram

**Expected Result:**
- ✅ Caption automatically truncated to 2200 chars
- ✅ Publishing succeeds
- ✅ No error about caption length
- ✅ On Instagram, caption shows truncated version

**Verification:**
```typescript
// In instagram-publish edge function:
caption: fullCaption.substring(0, 2200)
```

---

### Test Case 8: Expired Access Token

**Objective:** Verify error handling when Instagram token expires

**Steps:**
1. Manually expire token in database (set `token_expires_at` to past date):
   ```sql
   UPDATE oauth_connections
   SET token_expires_at = '2020-01-01T00:00:00Z'
   WHERE platform_name = 'instagram' AND user_id = 'your-user-id';
   ```
2. Try to publish video
3. Should fail with clear error

**Expected Result:**
- ❌ Publishing fails
- ✅ Error message indicates token issue
- ✅ Suggests reconnecting Instagram account

**Fix:**
User needs to disconnect and reconnect Instagram.

---

### Test Case 9: Share to Feed Option

**Objective:** Test `share_to_feed` parameter

**Steps:**
1. Publish video with `share_to_feed: true`
2. Should appear in BOTH Reels tab AND main feed
3. Publish another video with `share_to_feed: false`
4. Should appear ONLY in Reels tab

**Expected Result:**
- ✅ `share_to_feed: true` → Video in feed + Reels
- ✅ `share_to_feed: false` → Video only in Reels
- ✅ Users can choose this option

**Future Enhancement:**
Add checkbox in publishing UI for "Share to Feed"

---

### Test Case 10: Concurrent Publishing

**Objective:** Test multiple users publishing simultaneously

**Steps:**
1. Have 3+ users publish videos at same time
2. All to Instagram Reels
3. Verify no race conditions or conflicts

**Expected Result:**
- ✅ All publishes succeed independently
- ✅ No database lock issues
- ✅ Each user's video published to their own account
- ✅ Processing happens concurrently

---

## 🐛 Known Issues & Workarounds

### Issue 1: "No Instagram Business Account found"

**Symptoms:**
- OAuth completes but connection fails
- Error: "No Instagram Business Account found"

**Causes:**
1. Instagram account is Personal (not Business/Creator)
2. Instagram account not linked to Facebook Page
3. Page doesn't have admin access

**Fix:**
1. Convert Instagram to Business: Profile → Settings → Account → Switch to Professional Account
2. Link to Facebook Page: Settings → Business → Link Page
3. Ensure you're admin of the Page

---

### Issue 2: Video Processing Takes Forever

**Symptoms:**
- "Processing..." status for > 5 minutes
- Eventually times out

**Causes:**
1. Video file too large (near 1GB)
2. Video format requires transcoding
3. Instagram servers slow
4. Video URL not accessible

**Fix:**
1. Optimize video before upload (compress to < 100MB)
2. Ensure video is MP4 H.264/AAC
3. Retry publishing
4. Ensure video URL is publicly accessible

---

### Issue 3: Published Video Not Visible

**Symptoms:**
- Publishing succeeds but video not on profile
- No Reel appears in Instagram app

**Causes:**
1. Account switched to Personal mid-publish
2. Instagram processing delay
3. Video violated community guidelines (auto-removed)

**Fix:**
1. Wait 10-15 minutes (Instagram may have delay)
2. Check Instagram app notifications for removal notice
3. Ensure account is still Business
4. Retry publishing

---

### Issue 4: Hashtags Not Working

**Symptoms:**
- Hashtags appear as plain text (not clickable)
- Video not discoverable by hashtag search

**Causes:**
1. Hashtags not formatted correctly
2. Hashtags in caption but not recognized
3. Too many hashtags (Instagram limit ~30)

**Fix:**
1. Ensure hashtags start with # (no spaces)
2. Add space between hashtags
3. Limit to 20-25 hashtags max
4. Use popular, relevant hashtags

---

## 📊 Performance Benchmarks

**Expected Performance:**

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| OAuth Connection | < 10s | < 30s | > 60s |
| Video Upload | < 30s | < 60s | > 120s |
| Processing Poll | 1-3 min | 3-5 min | > 5 min |
| End-to-End Publish | < 4 min | < 6 min | > 10 min |
| Success Rate | > 95% | > 85% | < 80% |

**Monitor:**
- Time from "Publish" click to "Success" message
- Percentage of successful publishes
- Common error types

---

## 🔍 Debugging Tips

### Enable Verbose Logging

In edge functions, check Supabase logs:
```bash
supabase functions logs instagram-publish --tail
```

Look for:
- `[Instagram Publish]` prefixed messages
- Container ID creation
- Processing status updates
- Publish confirmation

### Check Database

```sql
-- View all Instagram connections
SELECT user_id, platform_user_id, connection_status, connection_metadata
FROM oauth_connections
WHERE platform_name = 'instagram';

-- View publishing history
SELECT * FROM published_videos
WHERE platforms ? 'instagram'
ORDER BY created_at DESC
LIMIT 10;
```

### Test with cURL

```bash
# Test OAuth callback
curl -X GET "https://your-function-url/instagram-oauth-callback?code=ABC123&state=base64_user_id"

# Test publishing (requires valid auth token)
curl -X POST "https://your-function-url/instagram-publish" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "video_url": "https://example.com/video.mp4",
    "caption": "Test",
    "hashtags": ["test"]
  }'
```

---

## ✅ Sign-Off Checklist

Before considering Instagram Reels integration complete:

### Functional Testing
- [ ] OAuth connection works
- [ ] Personal accounts rejected
- [ ] Business accounts accepted
- [ ] Video upload succeeds
- [ ] Processing polling works
- [ ] Publishing succeeds
- [ ] Video appears on Instagram
- [ ] Multi-platform works (TikTok + Instagram)
- [ ] Error handling works (invalid format, timeout, etc.)

### Edge Cases
- [ ] Large video files (near 1GB)
- [ ] Very short videos (< 5 seconds)
- [ ] Long videos (> 60 seconds)
- [ ] Special characters in caption
- [ ] Many hashtags (20+)
- [ ] Expired tokens
- [ ] Concurrent publishing

### Documentation
- [ ] Facebook App Review guide complete
- [ ] Testing guide complete
- [ ] User-facing help docs updated
- [ ] Error messages user-friendly

### Performance
- [ ] End-to-end publish < 6 minutes
- [ ] Success rate > 85%
- [ ] No memory leaks
- [ ] Concurrent publishes work

---

## 📞 Support

**Issues?** Check:
1. Supabase function logs
2. Instagram Business account status
3. Facebook App permissions
4. Video format and size

**Still stuck?** Review `docs/FACEBOOK-APP-REVIEW-GUIDE.md`

---

**Last Updated:** 2026-01-01
**Integration Version:** Instagram Graph API v18.0
**Status:** Phase 2 Complete ✅
