# TikTok Developer Setup Guide

Complete guide for setting up TikTok publishing integration with **two options**: Blotato (paid, instant) or Direct TikTok API (free, requires approval).

---

## Option 1: Blotato (Recommended for Quick Start)

**Best for:** Immediate launch, minimal technical setup
**Cost:** $29/month (Pro plan)
**Setup time:** 10 minutes
**Approval:** Not required (Blotato is pre-approved)

### Setup Steps

1. **Sign up for Blotato**
   - Go to https://blotato.com
   - Create account and upgrade to Pro plan ($29/mo)
   - Navigate to API Keys section

2. **Get your Blotato API Key**
   - Copy your API key (format: `blt_...`)

3. **Add to Action Insight**
   - Go to Settings → Integrations
   - Find "Blotato API Key"
   - Paste your key and save

4. **Connect TikTok Account**
   - In Settings → Integrations
   - Click "Connect TikTok" (via Blotato)
   - Authorize your TikTok account

5. **Start Publishing**
   - Go to AI Video Studio
   - Generate or upload video
   - Select TikTok as publishing platform
   - Add caption and hashtags
   - Publish!

### Pros
- ✅ Works immediately (no approval wait)
- ✅ Blotato handles TikTok API changes
- ✅ No compliance burden
- ✅ Reliable and tested

### Cons
- ❌ Costs $29/month
- ❌ Dependency on third-party service

---

## Option 2: Direct TikTok API (Free)

**Best for:** Long-term use, budget-conscious users
**Cost:** Free
**Setup time:** 2-8 weeks (approval time)
**Approval:** Required (60-70% rejection rate)

### Prerequisites

Before applying, you MUST have:
- [ ] Live company website with Privacy Policy and Terms of Service
- [ ] Valid business use case for TikTok API
- [ ] Company email address (not Gmail/Yahoo)
- [ ] Detailed explanation of how you'll use the API
- [ ] Optional but helpful: Existing TikTok presence with followers

### Setup Steps

#### Step 1: Apply for TikTok Developer Access

1. **Go to TikTok for Developers**
   - Visit https://developers.tiktok.com
   - Click "Get Started" or "Register"

2. **Fill out Application Form**
   - **Company Name**: Your business name
   - **Company Website**: Your website URL (must have Privacy Policy + ToS)
   - **Company Email**: Use company domain email
   - **Use Case**: Be specific and detailed. Example:
     ```
     We are building a marketing automation platform that helps small
     businesses create and publish short-form video content to TikTok.
     Our platform uses AI to generate marketing videos and allows users
     to schedule and publish content directly to their TikTok accounts.

     We need access to:
     - Content Posting API (to publish videos on behalf of users)
     - OAuth 2.0 (to authenticate users)

     Our users are small business owners and marketers who want to
     maintain an active TikTok presence without manual posting.
     ```
   - **Data Usage**: Explain what data you'll access
     ```
     We will access:
     - User's TikTok profile information
     - Posting permissions to publish videos

     We will NOT access:
     - User's followers/following lists
     - Private messages
     - User's watch history
     ```

3. **Submit Application**
   - Review all information carefully
   - Submit and wait for response (2-8 weeks typical)

4. **Wait for Approval**
   - Check email regularly
   - TikTok may request additional information
   - Respond promptly to any requests

#### Step 2: Create TikTok App (After Approval)

1. **Log into Developer Portal**
   - Go to https://developers.tiktok.com
   - Navigate to "My Apps"

2. **Create New App**
   - Click "Add a New App"
   - **App Name**: Your app name (e.g., "Action Insight Marketing")
   - **Description**: Describe your app's purpose

3. **Configure App Settings**
   - **Redirect URI**: `https://your-domain.com/oauth/tiktok/callback`
   - **Scopes**: Select permissions you need:
     - `user.info.basic` (basic profile info)
     - `video.publish` (publish videos)
     - `video.upload` (upload videos)

4. **Get API Credentials**
   - Copy your **Client Key** (like an API key)
   - Copy your **Client Secret** (keep this secret!)

#### Step 3: Configure Action Insight

1. **Add Environment Variables**
   - Add to your `.env` file (or Supabase Edge Function secrets):
   ```bash
   TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   TIKTOK_REDIRECT_URI=https://your-domain.com/oauth/tiktok/callback
   ```

2. **Update Supabase Edge Functions**
   - Deploy the `tiktok-oauth-callback` function
   - Deploy the `tiktok-publish-direct` function
   ```bash
   supabase functions deploy tiktok-oauth-callback
   supabase functions deploy tiktok-publish-direct
   ```

3. **Connect TikTok in Settings**
   - Go to Settings → Integrations
   - Click "Connect TikTok (Direct API)"
   - Authorize your TikTok account
   - You'll be redirected back to the app

4. **Verify Connection**
   - Check that "Connected" badge shows "Direct API" method
   - If it shows "Blotato", you're using the wrong connection

#### Step 4: Start Publishing

- Go to AI Video Studio
- Generate or upload video
- Select TikTok as publishing platform
- Add caption and hashtags
- Publish!

### Pros
- ✅ Completely free (no monthly fees)
- ✅ No third-party dependency
- ✅ Direct TikTok integration

### Cons
- ❌ 2-8 week approval wait
- ❌ 60-70% rejection rate
- ❌ Requires valid business justification
- ❌ You're responsible for compliance
- ❌ Must maintain Privacy Policy and ToS

---

## Common Issues and Solutions

### Issue: TikTok Application Rejected

**Reasons for rejection:**
- No valid business website
- Missing Privacy Policy or Terms of Service
- Vague or unclear use case
- Suspicious activity or bot-like behavior
- Personal/non-business use case

**Solutions:**
- Create professional website with legal pages
- Be very specific in use case description
- Use company email (not Gmail)
- Demonstrate legitimate business need
- Reapply after addressing issues

### Issue: OAuth Callback Not Working

**Check:**
- Redirect URI matches exactly in TikTok app settings
- Edge function `tiktok-oauth-callback` is deployed
- Supabase environment variables are set correctly
- SSL/HTTPS is enabled (TikTok requires HTTPS)

### Issue: Video Upload Fails

**Check:**
- Video file size < 50MB
- Video format is MP4
- Video duration < 10 minutes
- Access token hasn't expired
- User granted necessary permissions

### Issue: "Method not allowed" Error

**Solution:**
- Make sure you're using the correct publishing method
- Check `oauth_connections.connection_metadata.method` field
- Should be either `'blotato'` or `'direct_api'`
- Reconnect TikTok if method is wrong

---

## Hybrid Approach (Recommended)

**Best strategy for most users:**

1. **Start with Blotato** ($29/mo)
   - Get immediate TikTok publishing
   - Start creating content right away
   - Test the feature with real users

2. **Apply for TikTok Developer Access** (in parallel)
   - Submit application while using Blotato
   - Prepare all required documentation
   - Wait for approval (2-8 weeks)

3. **Switch to Direct API** (when approved)
   - Connect TikTok with Direct API method
   - Existing videos and data are preserved
   - Cancel Blotato subscription

4. **Save $348/year**
   - No more Blotato fees
   - Keep all functionality

---

## Comparison Table

| Feature | Blotato | Direct TikTok API |
|---------|---------|-------------------|
| **Cost** | $29/month | Free |
| **Setup Time** | 10 minutes | 2-8 weeks |
| **Approval Required** | No | Yes (60-70% rejection) |
| **Technical Difficulty** | Easy | Moderate |
| **Compliance Burden** | None (Blotato handles) | You handle |
| **Reliability** | High (proven) | High (official API) |
| **Third-party Dependency** | Yes | No |
| **Best For** | Quick launch, prototyping | Long-term, budget-conscious |

---

## Support Resources

- **TikTok for Developers**: https://developers.tiktok.com
- **TikTok API Documentation**: https://developers.tiktok.com/doc/login-kit-web
- **Blotato Support**: https://blotato.com/support
- **Action Insight Support**: [Your support channel]

---

## Next Steps

1. **Choose your approach**: Blotato, Direct API, or Hybrid
2. **Follow setup steps** above
3. **Test publishing** with a sample video
4. **Create your first AI-generated TikTok** in AI Video Studio!

**Need help?** Check our [troubleshooting guide](#common-issues-and-solutions) or contact support.
