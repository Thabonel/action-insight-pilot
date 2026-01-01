# YouTube Shorts Publishing - Testing Guide

**Complete testing checklist for YouTube Shorts integration**

**Last Updated:** 2026-01-01

---

## 🎯 Testing Overview

This guide covers end-to-end testing of YouTube Shorts publishing, including OAuth connection, resumable upload, quota tracking, and verification.

---

## ✅ Prerequisites

Before testing, ensure:
- [ ] YouTube channel created and active
- [ ] Google Cloud Project configured
- [ ] YouTube Data API v3 enabled
- [ ] OAuth 2.0 credentials created
- [ ] Edge functions deployed to Supabase
- [ ] Database migration applied (`youtube_quota_usage` table)

---

## 🔧 Environment Setup

### 1. Set Environment Variables

Add to Supabase Edge Function secrets:
```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMn
YOUTUBE_REDIRECT_URI=https://your-domain.com/oauth/youtube/callback
```

### 2. Deploy Edge Functions

```bash
supabase functions deploy youtube-oauth-callback
supabase functions deploy youtube-publish
supabase functions deploy publish-video  # Redeploy with YouTube support
```

### 3. Verify Database

Ensure `youtube_quota_usage` table exists:
```sql
SELECT * FROM youtube_quota_usage WHERE user_id = 'your-user-id';
```

---

## 📋 Test Cases

### Test Case 1: YouTube OAuth Connection

**Objective:** Verify users can connect YouTube channel via Google OAuth

**Steps:**
1. Log into Action Insight platform
2. Go to Settings → Integrations
3. Click "Connect YouTube"
4. Should redirect to Google OAuth page
5. Log in with Google credentials
6. Grant YouTube permissions:
   - View YouTube account
   - Manage YouTube videos
   - Upload videos
7. Should redirect back to Action Insight
8. Should show "Connected" status with green badge

**Expected Result:**
- ✅ OAuth flow completes without errors
- ✅ `oauth_connections` table has new row with `platform_name = 'youtube'`
- ✅ `connection_metadata.channel_title` is populated
- ✅ `connection_metadata.channel_id` matches user's channel
- ✅ UI shows "Connected" badge

**Common Issues:**
- ❌ "redirect_uri_mismatch" → Check REDIRECT_URI matches Google Cloud Console exactly
- ❌ "Access Not Configured" → YouTube Data API v3 not enabled
- ❌ "invalid_client" → Wrong Client ID or Secret

---

### Test Case 2: Token Refresh Mechanism

**Objective:** Verify access token automatically refreshes when expired

**Steps:**
1. Connect YouTube account
2. Manually expire token in database:
   ```sql
   UPDATE oauth_connections
   SET token_expires_at = '2020-01-01T00:00:00Z'
   WHERE platform_name = 'youtube' AND user_id = 'your-user-id';
   ```
3. Try to publish a video
4. Should automatically refresh token and proceed

**Expected Result:**
- ✅ Token refresh happens automatically
- ✅ New access token stored in database
- ✅ New expiry time set (1 hour from now)
- ✅ Upload continues without user intervention
- ✅ No error shown to user

**Verification:**
```sql
SELECT access_token, token_expires_at, updated_at
FROM oauth_connections
WHERE platform_name = 'youtube' AND user_id = 'your-user-id';
```

---

### Test Case 3: Publish Single Video to YouTube Shorts

**Objective:** End-to-end video publishing to YouTube Shorts

**Steps:**
1. Ensure YouTube is connected
2. Go to AI Video Studio
3. Generate or upload a test video:
   - Format: MP4 (H.264/AAC)
   - Resolution: 1080x1920 (9:16 vertical)
   - Duration: 10-30 seconds
   - Size: < 256MB
4. Navigate to "Publish to Social Media" section
5. Select "YouTube Shorts" platform
6. Add title: "Test Short from Action Insight"
7. Add description with hashtags
8. Select privacy: "Public" or "Unlisted"
9. Click "Publish to 1 Platform"
10. Wait for upload (30-60 seconds)
11. Should see "Successfully published" message

**Expected Result:**
- ✅ Upload initiates successfully
- ✅ Resumable upload protocol used
- ✅ Video uploaded within 60 seconds
- ✅ Platform URL provided (https://youtube.com/shorts/VIDEO_ID)
- ✅ `published_videos` table updated with YouTube data
- ✅ Video appears in YouTube Studio
- ✅ Quota usage recorded

**Verification:**
1. Open YouTube Studio: https://studio.youtube.com
2. Go to Content → Shorts
3. Should see newly uploaded Short
4. Check title, description, privacy status

**Check Database:**
```sql
SELECT * FROM published_videos
WHERE platforms ? 'youtube'
ORDER BY created_at DESC
LIMIT 1;

SELECT * FROM youtube_quota_usage
WHERE user_id = 'your-user-id'
AND date = CURRENT_DATE;
```

---

### Test Case 4: Quota Tracking - Daily Limit

**Objective:** Verify quota tracking prevents exceeding 6 uploads/day

**Steps:**
1. Upload 6 videos in one day
2. After each upload, check quota:
   ```sql
   SELECT uploads_count, units_used
   FROM youtube_quota_usage
   WHERE user_id = 'your-user-id' AND date = CURRENT_DATE;
   ```
3. Try to upload 7th video
4. Should receive quota exceeded error

**Expected Result:**
- ✅ First 6 uploads succeed
- ✅ Quota increments by 1,600 units per upload
- ✅ After 6 uploads: `uploads_count = 6`, `units_used = 9600`
- ✅ 7th upload fails with clear error message
- ✅ Error message explains quota limit and reset time

**Expected Error Response:**
```json
{
  "error": "Daily upload limit reached (6 uploads/day). YouTube API quota resets at midnight PST.",
  "code": "QUOTA_EXCEEDED",
  "uploads_today": 6,
  "max_uploads": 6
}
```

**Quota Reset:**
- Quota resets at midnight Pacific Time (PST/PDT)
- Test again after midnight to verify reset

---

### Test Case 5: Multi-Platform Publishing (All 3 Platforms)

**Objective:** Publish same video to TikTok, Instagram, and YouTube simultaneously

**Steps:**
1. Ensure TikTok, Instagram, and YouTube are all connected
2. Generate video in AI Video Studio
3. Select ALL THREE platforms: TikTok + Instagram + YouTube
4. Add caption and hashtags
5. Click "Publish to 3 Platforms"
6. Wait for all to complete

**Expected Result:**
- ✅ All 3 platforms publish successfully
- ✅ PublishingStatus shows 3 successful publishes
- ✅ Each platform has unique platform_video_id
- ✅ Video appears on TikTok, Instagram Reels, AND YouTube Shorts
- ✅ Each platform URL is correct and accessible

**Verification:**
- TikTok: Check profile for new video
- Instagram: Check Reels tab for new Reel
- YouTube: Check YouTube Studio → Shorts

---

### Test Case 6: Large Video Upload (Resumable Upload)

**Objective:** Test resumable upload protocol with large video

**Steps:**
1. Upload a video near the size limit:
   - Size: 100-200 MB
   - Duration: 45-59 seconds
   - Resolution: 1080x1920
2. Publish to YouTube Shorts
3. Monitor upload progress

**Expected Result:**
- ✅ Upload uses resumable upload protocol
- ✅ Upload completes without timeout
- ✅ Large file handled correctly
- ✅ Video quality preserved

**Technical Verification:**
Check edge function logs for:
```
[YouTube Publish] Step 1: Initializing resumable upload...
[YouTube Publish] Upload session initialized
[YouTube Publish] Step 2: Uploading video data...
[YouTube Publish] Video uploaded successfully: VIDEO_ID
```

---

### Test Case 7: Shorts Auto-Detection

**Objective:** Verify vertical videos under 60s are marked as Shorts

**Steps:**
1. Upload vertical video (9:16 aspect ratio, 30 seconds)
2. Publish to YouTube
3. Check YouTube Studio

**Expected Result:**
- ✅ Video appears in "Shorts" section (not regular videos)
- ✅ Video URL is `https://youtube.com/shorts/VIDEO_ID` format
- ✅ Shorts badge shown in Studio

**Non-Shorts Test:**
1. Upload horizontal video (16:9 aspect ratio)
2. Should appear in regular "Videos" section (not Shorts)

**Note:** YouTube automatically detects Shorts based on:
- Vertical aspect ratio (9:16 or similar)
- Duration under 60 seconds

---

### Test Case 8: Privacy Settings

**Objective:** Test different privacy levels (Public, Unlisted, Private)

**Steps:**
1. Publish video with `privacy: 'public'`
   - Should be visible to everyone
   - Appears in search results
2. Publish video with `privacy: 'unlisted'`
   - Accessible via link only
   - Not in search results
3. Publish video with `privacy: 'private'`
   - Only visible to you
   - Not accessible to others

**Expected Result:**
- ✅ Each privacy setting applied correctly
- ✅ Public video is searchable
- ✅ Unlisted video requires link
- ✅ Private video only visible to uploader

**Verification:**
1. Log out of YouTube
2. Try to access each video URL
3. Public: Should play
4. Unlisted: Should play (if you have link)
5. Private: Should show "Video unavailable"

---

### Test Case 9: Error Handling - Invalid Video Format

**Objective:** Verify error handling for unsupported video formats

**Steps:**
1. Try to publish non-MP4 video (e.g., WebM, AVI)
2. Or try extremely large file (> 256MB)
3. Should fail with clear error

**Expected Result:**
- ❌ Upload fails gracefully
- ✅ Error message explains issue
- ✅ Suggests corrective action (re-encode to MP4, reduce size)
- ✅ No partial upload or corrupted data

**Expected Error:**
```json
{
  "error": "Failed to upload video to YouTube. Please ensure video is MP4 format and under 256MB.",
  "code": "UPLOAD_ERROR"
}
```

---

### Test Case 10: Concurrent Publishing (Multiple Users)

**Objective:** Test multiple users publishing to YouTube simultaneously

**Steps:**
1. Have 3+ users publish videos at same time
2. All to YouTube Shorts
3. Verify no conflicts or quota issues

**Expected Result:**
- ✅ All publishes succeed independently
- ✅ Each user's quota tracked separately
- ✅ No database lock issues
- ✅ No race conditions
- ✅ Each video published to correct channel

**Database Verification:**
```sql
SELECT user_id, uploads_count, units_used
FROM youtube_quota_usage
WHERE date = CURRENT_DATE;
```

Each user should have separate quota record.

---

## 🐛 Known Issues & Workarounds

### Issue 1: "Access Not Configured" Error

**Symptoms:**
- API calls fail with 403 error
- "YouTube Data API has not been used..."

**Causes:**
1. YouTube Data API v3 not enabled
2. Wrong Google Cloud Project
3. API just enabled (propagation delay)

**Fix:**
1. Go to Google Cloud Console
2. APIs & Services → Library
3. Search "YouTube Data API v3"
4. Click "Enable"
5. Wait 5 minutes for propagation

---

### Issue 2: Daily Quota Exceeded

**Symptoms:**
- After 6 uploads, 7th fails
- Error: "Daily upload limit reached"

**Causes:**
- YouTube provides only 10,000 units/day
- Each upload costs 1,600 units
- Maximum 6 uploads/day

**Fix:**
1. Wait until midnight PST for quota reset
2. Request quota increase from Google:
   - Google Cloud Console → Quotas
   - Request higher limit (requires justification)
3. Optimize: reduce test uploads, batch production uploads

---

### Issue 3: Token Refresh Fails

**Symptoms:**
- "invalid_grant" error
- "Token has been expired or revoked"

**Causes:**
1. Refresh token expired (6 months of inactivity)
2. User revoked access manually
3. OAuth credentials changed

**Fix:**
1. User must reconnect YouTube:
   - Settings → Disconnect YouTube
   - Connect YouTube again
   - Complete OAuth flow
2. New refresh token issued

---

### Issue 4: Video Appears as Regular Video (Not Short)

**Symptoms:**
- Video uploaded but not in Shorts section
- URL is `/watch?v=` instead of `/shorts/`

**Causes:**
1. Video not vertical (9:16 aspect ratio)
2. Video duration > 60 seconds
3. YouTube's auto-detection didn't classify as Short

**Fix:**
1. Ensure video is:
   - Vertical (9:16 or 4:5)
   - Under 60 seconds
   - Minimum 720p resolution
2. Re-upload with correct specs

**Note:** YouTube's Shorts detection is automatic and cannot be forced via API.

---

### Issue 5: Upload Timeout

**Symptoms:**
- Upload fails after 2-3 minutes
- "Request timeout" error

**Causes:**
1. Very large video file (> 200MB)
2. Slow internet connection
3. Edge function timeout (default 60s)

**Fix:**
1. Compress video before upload:
   - Target < 100MB
   - Use H.264 encoding
   - Reduce bitrate if needed
2. Increase edge function timeout (Supabase settings)
3. Retry upload

---

## 📊 Performance Benchmarks

**Expected Performance:**

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| OAuth Connection | < 10s | < 20s | > 30s |
| Video Upload (10MB) | < 30s | < 60s | > 90s |
| Video Upload (100MB) | < 60s | < 120s | > 180s |
| Token Refresh | < 5s | < 10s | > 15s |
| Quota Check | < 1s | < 3s | > 5s |
| Success Rate | > 95% | > 85% | < 80% |

**Monitor:**
- Time from "Publish" click to "Success" message
- Percentage of successful uploads
- Average file size uploaded
- Common error types

---

## 🔍 Debugging Tips

### Enable Verbose Logging

In edge functions, check Supabase logs:
```bash
supabase functions logs youtube-publish --tail
```

Look for:
- `[YouTube Publish]` prefixed messages
- Resumable upload initialization
- Upload progress
- Quota updates
- Token refresh events

### Check Database State

```sql
-- View YouTube connections
SELECT user_id, platform_user_id, connection_status,
       connection_metadata, token_expires_at
FROM oauth_connections
WHERE platform_name = 'youtube';

-- View quota usage
SELECT user_id, date, uploads_count, units_used
FROM youtube_quota_usage
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, user_id;

-- View publishing history
SELECT id, user_id, platforms->'youtube' as youtube_data, created_at
FROM published_videos
WHERE platforms ? 'youtube'
ORDER BY created_at DESC
LIMIT 10;
```

### Test with cURL

```bash
# Test OAuth callback (replace with real code and state)
curl -X GET "https://your-function-url/youtube-oauth-callback?code=AUTH_CODE&state=BASE64_USER_ID"

# Test publishing (requires valid auth token)
curl -X POST "https://your-function-url/youtube-publish" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "video_url": "https://example.com/video.mp4",
    "caption": "Test Short",
    "hashtags": ["test", "automation"],
    "privacy": "unlisted"
  }'
```

### Google Cloud Console Debugging

1. **Check API Usage:**
   - APIs & Services → YouTube Data API v3
   - View usage charts
   - Check quota consumption

2. **Review Logs:**
   - Logging → Logs Explorer
   - Filter by `youtube.googleapis.com`
   - Look for errors or warnings

3. **Test API Directly:**
   - APIs & Services → Credentials → Test API
   - Try manual upload via API Explorer

---

## ✅ Sign-Off Checklist

Before considering YouTube Shorts integration complete:

### Functional Testing
- [ ] OAuth connection works
- [ ] YouTube channel connected successfully
- [ ] Video upload succeeds
- [ ] Video appears in YouTube Studio
- [ ] Quota tracking works correctly
- [ ] Daily limit enforced (6 uploads/day)
- [ ] Token refresh works automatically
- [ ] Multi-platform works (TikTok + Instagram + YouTube)
- [ ] Error handling works (invalid format, quota exceeded, etc.)

### Edge Cases
- [ ] Large video files (100-200 MB)
- [ ] Very short videos (< 10 seconds)
- [ ] Videos near 60-second limit
- [ ] Special characters in title/description
- [ ] Many hashtags (10+)
- [ ] Expired tokens
- [ ] Concurrent uploads from same user
- [ ] Concurrent uploads from different users

### Privacy & Security
- [ ] All privacy settings work (Public, Unlisted, Private)
- [ ] OAuth tokens stored securely
- [ ] Refresh tokens encrypted
- [ ] No credentials in logs
- [ ] HTTPS enforced

### Documentation
- [ ] Google Cloud setup guide complete
- [ ] Testing guide complete
- [ ] User-facing help docs updated
- [ ] Error messages user-friendly
- [ ] Quota limits explained to users

### Performance
- [ ] Upload time < 60s for typical videos
- [ ] Success rate > 90%
- [ ] No memory leaks
- [ ] Quota tracking efficient
- [ ] Token refresh seamless

---

## 📞 Support

**Issues?** Check:
1. Supabase function logs
2. YouTube Data API v3 enabled in Google Cloud
3. OAuth credentials correct
4. Video format (MP4, vertical, <60s)
5. Daily quota not exceeded

**Still stuck?** Review:
- `docs/GOOGLE-CLOUD-SETUP-GUIDE.md`
- YouTube API documentation: https://developers.google.com/youtube/v3
- Google OAuth guide: https://developers.google.com/identity/protocols/oauth2

---

**Last Updated:** 2026-01-01
**API Version:** YouTube Data API v3
**Status:** Phase 3 Complete ✅
