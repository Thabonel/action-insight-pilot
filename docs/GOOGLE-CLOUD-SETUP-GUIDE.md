# Google Cloud Console Setup Guide for YouTube Shorts Publishing

**Complete guide for setting up YouTube Data API v3 OAuth integration**

**Last Updated:** 2026-01-01
**Estimated Setup Time:** 30-45 minutes
**API Version:** YouTube Data API v3
**Required for:** YouTube Shorts publishing via Action Insight

---

## 📋 Overview

To publish videos to YouTube Shorts via the API, you must create a Google Cloud Project and enable the YouTube Data API v3. This guide walks you through the entire setup process.

**What you'll need:**
- Google account (Gmail)
- YouTube channel (optional but recommended for testing)
- Access to Google Cloud Console
- Development environment URLs (staging + production)

**What you'll get:**
- Google Cloud Project
- OAuth 2.0 Client ID and Secret
- YouTube Data API v3 enabled
- 10,000 quota units/day (~6 video uploads/day)

---

## ⚠️ Prerequisites

Before starting, ensure you have:

### 1. Google Account
- [ ] Active Google account (Gmail or Workspace)
- [ ] Two-factor authentication enabled (recommended)
- [ ] Account in good standing

### 2. YouTube Channel (Recommended)
- [ ] YouTube channel created for testing
- [ ] Channel name and ID known
- [ ] Content uploaded for verification

### 3. Development Environment
- [ ] Frontend deployed and accessible (e.g., `https://your-app.com`)
- [ ] Redirect URI planned (e.g., `https://your-app.com/oauth/youtube/callback`)
- [ ] HTTPS enabled (required for OAuth)

---

## 🚀 Step-by-Step Setup Process

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" dropdown at top
   - Click "New Project"
   - **Project Name**: `Action Insight Marketing` (or your app name)
   - **Project ID**: Auto-generated (e.g., `action-insight-12345`)
   - **Organization**: Leave as "No organization" unless using Workspace
   - Click "Create"

3. **Wait for Project Creation**
   - Takes 10-30 seconds
   - You'll see notification when ready
   - Project will auto-select once created

**Important**: Note your Project ID - you'll need it later!

---

### Step 2: Enable YouTube Data API v3

1. **Navigate to APIs & Services**
   - From left sidebar, click "APIs & Services"
   - Click "Library"

2. **Search for YouTube Data API**
   - In search box, type: `YouTube Data API v3`
   - Click on "YouTube Data API v3" result

3. **Enable the API**
   - Click "Enable" button
   - Wait 5-10 seconds for activation
   - You'll be redirected to API dashboard

4. **Verify Activation**
   - Should see "API enabled" status
   - Dashboard shows quota information
   - Default quota: 10,000 units/day

**Quota Breakdown:**
- Video upload: 1,600 units per upload
- Daily limit: ~6 uploads/day maximum
- Resets at midnight Pacific Time

---

### Step 3: Configure OAuth Consent Screen

**CRITICAL STEP** - Required before creating credentials

1. **Navigate to OAuth Consent Screen**
   - Left sidebar → "OAuth consent screen"
   - If already configured, skip to Step 4

2. **Choose User Type**
   - **External** - For public applications (most common)
   - **Internal** - Only for Google Workspace orgs
   - Select "External"
   - Click "Create"

3. **App Information**
   - **App name**: `Action Insight Marketing` (your brand name)
   - **User support email**: Your email address
   - **App logo**: Upload 120x120px logo (optional but recommended)
   - **Application home page**: `https://your-app.com`
   - **Application privacy policy**: `https://your-app.com/privacy`
   - **Application terms of service**: `https://your-app.com/terms`
   - **Authorized domains**: Add your domain (e.g., `your-app.com`)
   - **Developer contact email**: Your email address
   - Click "Save and Continue"

4. **Scopes**
   - Click "Add or Remove Scopes"
   - Search for: `youtube.upload`
   - Select:
     - ✅ `https://www.googleapis.com/auth/youtube.upload` - Upload videos
     - ✅ `https://www.googleapis.com/auth/youtube` - Full YouTube access
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users** (Only for "External" apps in testing)
   - Click "Add Users"
   - Add your Google account email
   - Add any other test accounts (max 100)
   - Click "Save and Continue"

6. **Summary**
   - Review all settings
   - Click "Back to Dashboard"

**Publishing Status:**
- **Testing** - Limited to test users only (default)
- **In Production** - Available to all users (requires verification)
- For development, "Testing" is sufficient

---

### Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - Left sidebar → "Credentials"
   - Click "Create Credentials" dropdown
   - Select "OAuth client ID"

2. **Application Type**
   - Select "Web application"
   - **Name**: `Action Insight YouTube OAuth` (descriptive name)

3. **Authorized JavaScript Origins**
   - Click "Add URI"
   - Add your frontend URLs:
     - `https://your-app.com` (production)
     - `http://localhost:5173` (local development)
     - `https://staging.your-app.com` (if applicable)
   - Click "Add URI" for each

4. **Authorized Redirect URIs**
   - Click "Add URI"
   - Add your OAuth callback URLs:
     - `https://your-app.com/oauth/youtube/callback` (production)
     - `http://localhost:5173/oauth/youtube/callback` (local development)
   - **CRITICAL**: URL must match EXACTLY (no trailing slash)
   - Click "Add URI" for each

5. **Create Credentials**
   - Click "Create"
   - You'll see a popup with Client ID and Client Secret
   - **IMPORTANT**: Copy both immediately!

**Example Credentials:**
```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

6. **Download JSON (Optional)**
   - Click "Download JSON" in popup
   - Save as `google-oauth-credentials.json`
   - Store securely (DO NOT commit to git)

---

### Step 5: Configure Supabase Edge Function Secrets

1. **Open Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project
   - Go to Settings → Edge Functions → Secrets

2. **Add Google OAuth Secrets**
   - Click "Add Secret"
   - **Name**: `GOOGLE_CLIENT_ID`
   - **Value**: Paste your Client ID
   - Click "Save"

   - Click "Add Secret"
   - **Name**: `GOOGLE_CLIENT_SECRET`
   - **Value**: Paste your Client Secret
   - Click "Save"

   - Click "Add Secret"
   - **Name**: `YOUTUBE_REDIRECT_URI`
   - **Value**: `https://your-app.com/oauth/youtube/callback`
   - Click "Save"

3. **Verify Secrets**
   - Should see 3 secrets listed:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `YOUTUBE_REDIRECT_URI`

---

### Step 6: Deploy Edge Functions

1. **Deploy YouTube OAuth Callback**
   ```bash
   supabase functions deploy youtube-oauth-callback
   ```

2. **Deploy YouTube Publish Function**
   ```bash
   supabase functions deploy youtube-publish
   ```

3. **Redeploy Publish Video Orchestrator**
   ```bash
   supabase functions deploy publish-video
   ```

4. **Verify Deployment**
   - Go to Supabase Dashboard → Edge Functions
   - Should see all 3 functions deployed
   - Check logs for any errors

---

### Step 7: Apply Database Migration

1. **Open Supabase SQL Editor**
   - Dashboard → SQL Editor
   - Click "New Query"

2. **Copy Migration SQL**
   - Open `supabase/migrations/20260101000003_youtube_quota_tracking.sql`
   - Copy entire contents

3. **Execute Migration**
   - Paste SQL into editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Should see "Success. No rows returned"

4. **Verify Table Created**
   ```sql
   SELECT * FROM youtube_quota_usage LIMIT 1;
   ```
   - Should return empty result (table exists but no data yet)

---

## 🧪 Testing the Integration

### Test 1: OAuth Connection Flow

1. **Log into Action Insight**
   - Go to your app: `https://your-app.com`
   - Log in with your account

2. **Connect YouTube**
   - Navigate to Settings → Integrations
   - Find "YouTube Shorts" section
   - Click "Connect YouTube"

3. **Google OAuth Flow**
   - Should redirect to Google login
   - Log in with Google account
   - Grant permissions:
     - View YouTube account
     - Manage YouTube videos
     - Upload videos
   - Click "Allow"

4. **Verify Connection**
   - Should redirect back to Action Insight
   - Should see "Connected" status with green badge
   - Should display YouTube channel name

**Expected Database State:**
```sql
SELECT platform_name, connection_status, platform_user_id, connection_metadata
FROM oauth_connections
WHERE platform_name = 'youtube';
```

Should show:
- `connection_status = 'connected'`
- `platform_user_id = your_channel_id`
- `connection_metadata.channel_title = 'Your Channel Name'`

---

### Test 2: Upload YouTube Short

1. **Generate Test Video**
   - Go to AI Video Studio (`/app/studio/ai-video`)
   - Generate a short vertical video (9:16, under 60 seconds)
   - Wait for video generation to complete

2. **Publish to YouTube Shorts**
   - Scroll to "Publish to Social Media" section
   - Select "YouTube Shorts" platform
   - Add caption: "Test Short from Action Insight"
   - Add hashtags: "test", "automation"
   - Click "Publish to 1 Platform"

3. **Monitor Upload**
   - Should see "Uploading..." status
   - Upload takes 30-60 seconds
   - Should see "Successfully published" message

4. **Verify on YouTube**
   - Open YouTube Studio: https://studio.youtube.com
   - Go to Content → Shorts
   - Should see newly uploaded Short
   - Check caption, hashtags, privacy status

**Expected Response:**
```json
{
  "success": true,
  "platform_video_id": "abc123XYZ",
  "platform_url": "https://youtube.com/shorts/abc123XYZ",
  "quota_info": {
    "uploads_today": 1,
    "max_uploads": 6,
    "remaining": 5
  }
}
```

---

### Test 3: Quota Tracking

1. **Check Quota Usage**
   ```sql
   SELECT * FROM youtube_quota_usage
   WHERE user_id = 'your-user-id'
   ORDER BY date DESC
   LIMIT 1;
   ```

   Should show:
   - `uploads_count = 1`
   - `units_used = 1600`

2. **Test Multiple Uploads**
   - Upload 2-3 more videos
   - Check quota updates after each upload
   - Should increment by 1600 units each time

3. **Test Quota Limit**
   - Try to upload 7th video in same day
   - Should receive quota exceeded error:
   ```json
   {
     "error": "Daily upload limit reached (6 uploads/day). YouTube API quota resets at midnight PST.",
     "code": "QUOTA_EXCEEDED",
     "uploads_today": 6,
     "max_uploads": 6
   }
   ```

---

## 📊 Understanding YouTube API Quotas

### Default Quota Allocation

**Daily Quota**: 10,000 units per project per day

**Operation Costs:**
- Video upload: 1,600 units
- Video update: 50 units
- Video list: 1 unit
- Channel info: 1 unit

**Practical Limits:**
- Maximum uploads: ~6 videos/day
- Quota resets: Midnight Pacific Time (PST/PDT)
- Cannot be increased without申请

### Quota Tracking

Our implementation automatically tracks:
- Daily uploads count per user
- Total units consumed per user
- Remaining quota before limit

**Database Schema:**
```sql
CREATE TABLE youtube_quota_usage (
  user_id UUID,
  date DATE,
  units_used INTEGER,
  uploads_count INTEGER
);
```

### Requesting Quota Increase

If you need more than 6 uploads/day:

1. **Go to Google Cloud Console**
   - APIs & Services → YouTube Data API v3
   - Click "Quotas & System Limits"

2. **Request Quota Increase**
   - Find "Queries per day"
   - Click "Edit Quotas"
   - Request higher limit (e.g., 100,000 units)

3. **Provide Justification**
   - Explain use case (automated marketing content)
   - Estimate daily upload volume
   - Describe user base size

4. **Wait for Approval**
   - Typically takes 1-3 business days
   - Approval not guaranteed
   - May require additional verification

---

## 🚨 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch" Error

**Symptoms:**
- OAuth flow fails with error
- Message: "redirect_uri_mismatch"

**Causes:**
1. Redirect URI in code doesn't match Google Cloud Console
2. Extra trailing slash in URI
3. HTTP vs HTTPS mismatch
4. Wrong domain

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Ensure redirect URI matches EXACTLY:
   - `https://your-app.com/oauth/youtube/callback` (no trailing slash)
4. Redeploy edge functions with correct `YOUTUBE_REDIRECT_URI`

---

### Issue 2: "Access Not Configured" Error

**Symptoms:**
- API calls fail with 403 error
- Message: "Access Not Configured. YouTube Data API has not been used..."

**Causes:**
- YouTube Data API v3 not enabled
- Wrong project selected
- API recently enabled (propagation delay)

**Fix:**
1. Go to Google Cloud Console
2. Select correct project (check project ID)
3. APIs & Services → Library
4. Search "YouTube Data API v3"
5. Ensure "Enabled" status
6. Wait 5 minutes for propagation

---

### Issue 3: "Daily Limit Exceeded" Error

**Symptoms:**
- Upload fails after 6 uploads
- Error code: `QUOTA_EXCEEDED`

**Causes:**
- Hit 10,000 units/day quota limit
- 6 videos already uploaded today

**Fix:**
1. Wait until midnight PST for quota reset
2. Request quota increase (see above)
3. Optimize: batch uploads, reduce test uploads

**Workaround:**
- Create multiple Google Cloud Projects (not recommended)
- Use different project per environment (dev/staging/prod)

---

### Issue 4: OAuth Consent Screen Shows "Unverified App" Warning

**Symptoms:**
- Google shows warning during OAuth
- "This app isn't verified"
- Users must click "Advanced" → "Go to [app] (unsafe)"

**Causes:**
- App still in "Testing" mode
- Not yet verified by Google

**Fix (Short-term):**
- Add users as "Test users" in OAuth consent screen
- Test users won't see warning

**Fix (Long-term):**
1. Submit app for verification:
   - OAuth consent screen → "Publish App"
   - Provide required information
   - Wait 1-2 weeks for review
2. Get verified:
   - Requires domain ownership verification
   - Privacy policy review
   - Brand verification

---

### Issue 5: "Invalid Grant" Error During Token Refresh

**Symptoms:**
- Token refresh fails
- Error: `invalid_grant`

**Causes:**
- Refresh token expired (after 6 months of inactivity)
- User revoked access
- OAuth client credentials changed

**Fix:**
1. User must reconnect YouTube account:
   - Settings → Integrations → Disconnect YouTube
   - Click "Connect YouTube" again
   - Complete OAuth flow
2. New refresh token will be issued

---

## 🔒 Security Best Practices

### Protecting Credentials

1. **Never Commit Secrets to Git**
   - Add `.env` to `.gitignore`
   - Use Supabase Edge Function secrets
   - Rotate credentials if leaked

2. **Use Environment Variables**
   ```bash
   # Local development (.env)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   YOUTUBE_REDIRECT_URI=http://localhost:5173/oauth/youtube/callback

   # Production (Supabase secrets)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   YOUTUBE_REDIRECT_URI=https://your-app.com/oauth/youtube/callback
   ```

3. **Restrict OAuth Scopes**
   - Only request `youtube.upload` scope
   - Don't request unnecessary permissions
   - Review scopes annually

4. **Monitor API Usage**
   - Enable Google Cloud Console alerts
   - Track unusual quota spikes
   - Review access logs monthly

---

## 📋 Checklist Before Launch

Use this checklist to ensure proper setup:

### Google Cloud Console
- [ ] Google Cloud Project created
- [ ] Project ID documented
- [ ] YouTube Data API v3 enabled
- [ ] OAuth consent screen configured
- [ ] App name and branding set
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] Test users added (for testing mode)

### OAuth Credentials
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID copied and stored securely
- [ ] Client Secret copied and stored securely
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added (production + staging)
- [ ] Redirect URIs match EXACTLY (no typos, trailing slashes)

### Supabase Configuration
- [ ] `GOOGLE_CLIENT_ID` secret added
- [ ] `GOOGLE_CLIENT_SECRET` secret added
- [ ] `YOUTUBE_REDIRECT_URI` secret added
- [ ] Edge functions deployed:
  - [ ] `youtube-oauth-callback`
  - [ ] `youtube-publish`
  - [ ] `publish-video` (updated)
- [ ] Database migration applied
- [ ] `youtube_quota_usage` table created

### Testing
- [ ] OAuth connection tested
- [ ] YouTube channel connected successfully
- [ ] Test video uploaded successfully
- [ ] Video appears in YouTube Studio
- [ ] Quota tracking verified
- [ ] Daily limit tested (optional)
- [ ] Token refresh tested (wait 1 hour)

### Documentation
- [ ] Team trained on quota limits
- [ ] Users notified about 6 uploads/day limit
- [ ] Support docs created for users
- [ ] Error handling tested and documented

---

## 📞 Support Resources

- **Google Cloud Console**: https://console.cloud.google.com
- **YouTube Data API Docs**: https://developers.google.com/youtube/v3
- **OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2
- **Quota Information**: https://developers.google.com/youtube/v3/getting-started#quota
- **API Support**: https://support.google.com/youtube/topic/9257988

---

## ✨ Summary

**What you've accomplished:**
1. ✅ Created Google Cloud Project
2. ✅ Enabled YouTube Data API v3
3. ✅ Configured OAuth 2.0 credentials
4. ✅ Set up OAuth consent screen
5. ✅ Deployed Supabase edge functions
6. ✅ Applied database migration
7. ✅ Tested YouTube Shorts publishing
8. ✅ Implemented quota tracking

**Key Takeaways:**
- YouTube allows ~6 uploads/day (10,000 units quota)
- OAuth requires verified domain and privacy policy
- Quota resets at midnight Pacific Time
- Shorts are auto-detected (vertical + <60s)
- All uploads tracked in `youtube_quota_usage` table

**Next Steps:**
- Monitor quota usage in production
- Request quota increase if needed
- Submit app for Google verification (for public launch)
- Optimize upload frequency based on user needs

---

**Last Updated:** 2026-01-01
**API Version:** YouTube Data API v3
**Status:** Phase 3 Complete ✅
