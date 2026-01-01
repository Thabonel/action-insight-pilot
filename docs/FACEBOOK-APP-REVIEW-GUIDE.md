# Facebook App Review Guide for Instagram Reels Publishing

**Complete guide for getting your Facebook App approved for Instagram content publishing**

**Last Updated:** 2026-01-01
**Approval Time:** 1-2 weeks typically
**Success Rate:** ~80% (if properly prepared)

---

## 📋 Overview

To publish to Instagram Reels via the API, you **must** get your Facebook App approved by Meta. This is a mandatory requirement enforced by Facebook/Instagram to prevent spam and abuse.

**What you need approval for:**
- `instagram_content_publish` - Permission to publish Reels
- `pages_read_engagement` - Permission to read Page data (if using Page-based flow)

**Without approval:**
- ❌ Cannot publish Reels via API
- ✅ Can still connect Instagram accounts (OAuth works)
- ✅ Can read public profile information

---

## ⚠️ Prerequisites (CRITICAL)

Before starting the App Review process, you **MUST** have:

### 1. Facebook Developer Account
- [ ] Account verified with phone number
- [ ] Business verification completed (if applicable)
- [ ] Developer account in good standing

### 2. Facebook App Created
- [ ] App created at https://developers.facebook.com
- [ ] App ID and App Secret obtained
- [ ] Basic settings configured

### 3. Instagram Business Account
- [ ] Instagram account converted to Business or Creator
- [ ] Business account linked to a Facebook Page
- [ ] Page has admin access

### 4. Working Integration
- [ ] OAuth flow implemented and working
- [ ] Can successfully connect Instagram account
- [ ] Publishing code implemented (even if it fails due to permissions)

### 5. Documentation Ready
- [ ] Privacy Policy URL (publicly accessible, HTTPS)
- [ ] Terms of Service URL (publicly accessible, HTTPS)
- [ ] Data Deletion Instructions URL
- [ ] App icon (1024x1024px minimum)
- [ ] Screen recording demo video

### 6. Test Account
- [ ] Test Instagram Business account created
- [ ] Test account connected to test Facebook Page
- [ ] Test credentials ready to share with reviewers

---

## 🚀 Step-by-Step App Review Process

### Step 1: Prepare Your Facebook App

1. **Go to Facebook Developers**
   - Visit https://developers.facebook.com/apps
   - Select your app

2. **Configure Basic Settings**
   - App Name: "Action Insight Marketing"
   - App Domains: Your domain (e.g., `action-insight.com`)
   - Privacy Policy URL: `https://your-domain.com/privacy`
   - Terms of Service URL: `https://your-domain.com/terms`
   - Data Deletion Instructions: `https://your-domain.com/data-deletion`

3. **Add App Icon**
   - Upload 1024x1024px icon
   - Should represent your brand
   - No text or gradients (Facebook preference)

4. **Set Category**
   - Primary Category: "Business and Pages"
   - Or: "Content and Publishing"

### Step 2: Implement Required URLs

**Privacy Policy** (`/privacy` page):
Must include sections on:
- What data you collect (access tokens, Instagram user ID, username)
- How you use data (publishing Reels on user's behalf)
- How long you store data (token expiry, user control)
- User rights (delete data, revoke access)
- Contact information

**Data Deletion Instructions** (`/data-deletion` page):
Must explain:
- How users can request data deletion
- What happens when they disconnect Instagram
- Response time for deletion requests (within 30 days)
- Contact email for deletion requests

**Example Data Deletion Page:**
```markdown
# Data Deletion Instructions

## How to Delete Your Data

1. Go to Settings → Integrations in Action Insight
2. Click "Disconnect" next to Instagram
3. Your access tokens and connection data will be immediately deleted

## Request Manual Deletion

If you need manual data deletion, email us at privacy@action-insight.com

We will process your request within 30 days and confirm deletion via email.

## What Gets Deleted

- Instagram access tokens
- Instagram user ID and username
- Connection metadata
- All publishing history linked to your Instagram account
```

### Step 3: Add Products to Your App

1. **Add Facebook Login**
   - Go to Dashboard → Add Product → Facebook Login
   - Click "Set Up"

2. **Configure Facebook Login**
   - Valid OAuth Redirect URIs: `https://your-domain.com/oauth/instagram/callback`
   - Client OAuth Login: Yes
   - Web OAuth Login: Yes
   - Enforce HTTPS: Yes

3. **Add Instagram API**
   - Go to Dashboard → Add Product → Instagram
   - Click "Set Up"

### Step 4: Request Advanced Access

1. **Go to App Review → Permissions and Features**
   - Find `instagram_content_publish`
   - Click "Request Advanced Access"

2. **Complete the Questionnaire**

   **Question: How will your app use this permission?**
   ```
   Our app allows small businesses to automate their marketing by creating
   and publishing AI-generated Reels to Instagram. Users connect their
   Instagram Business accounts via OAuth, create videos using our AI tools,
   and publish them directly to Instagram Reels without leaving our platform.

   This permission is essential for our core functionality - without it,
   users must manually download videos and upload them separately, defeating
   the purpose of automation.

   We only publish content that the user explicitly creates and approves.
   Users have full control over what gets published, when, and to which platforms.
   ```

   **Question: Describe your integration**
   ```
   1. User connects Instagram Business account via Facebook Login OAuth
   2. User creates a short-form video (Reels) using our AI video generator
   3. User adds caption, hashtags, and selects Instagram as publish target
   4. User clicks "Publish" button
   5. Our app uses `instagram_content_publish` to upload and publish the Reel
   6. User receives confirmation of successful publish
   7. Reel appears on user's Instagram profile

   We do not publish any content without explicit user action. Each video
   requires manual approval from the user before publishing.
   ```

### Step 5: Record Screen Recording Demo

**CRITICAL:** This is the most important part of the review!

**What to show:**
1. **Login/OAuth Flow** (30 seconds)
   - Show user logging in
   - Connecting Instagram account
   - Granting permissions

2. **Creating Content** (1 minute)
   - Show AI video generation or upload
   - Adding caption and hashtags
   - Preview of content

3. **Publishing** (1 minute)
   - Clicking "Publish to Instagram"
   - Loading/processing states
   - Success confirmation

4. **Verification** (30 seconds)
   - Open Instagram app/website
   - Show published Reel on profile
   - Verify it matches what was published

**Recording Tips:**
- Use QuickTime (Mac) or OBS Studio (Windows/Mac)
- Record in HD (1080p minimum)
- Include audio narration explaining each step
- Keep under 5 minutes total
- Show REAL functionality (not mockups)
- Upload to YouTube as "Unlisted" video

**Example Script:**
```
"Hi, I'm demonstrating how Action Insight publishes Instagram Reels.

First, I'll connect my Instagram Business account. [Click Connect Instagram]
I'm prompted to log into Facebook and grant permissions. [Complete OAuth]
My account is now connected.

Next, I'll create a video. [Generate AI video]
I'll add a caption and some hashtags. [Type caption]

Now I'll publish to Instagram Reels. [Click Publish]
The video is being uploaded and processed. [Wait for confirmation]

Let's verify it published. [Open Instagram app]
Here's the Reel on my profile, published just now. [Show Reel]

This demonstrates the instagram_content_publish permission in action."
```

### Step 6: Provide Test Credentials

**Create test accounts for reviewers:**

1. **Create Test Instagram Business Account**
   - Use `test.instagram@your-company.com` email
   - Create as Business account
   - Link to test Facebook Page

2. **Provide Test Login**
   ```
   Username: test.instagram@action-insight.com
   Password: TestPass123!

   Instagram Account: @actioninsighttest
   Password: InstagramTest123!
   ```

3. **Provide Step-by-Step Instructions**
   ```
   HOW TO TEST:

   1. Log into test account at https://app.action-insight.com
   2. Go to Settings → Integrations
   3. Click "Connect Instagram"
   4. Use Instagram test account: @actioninsighttest / InstagramTest123!
   5. Grant all permissions when prompted
   6. Return to Action Insight dashboard
   7. Go to AI Video Studio
   8. Click "Generate Video" or upload a sample video
   9. Add caption: "Test Reel from Action Insight"
   10. Select "Instagram Reels" as platform
   11. Click "Publish to 1 Platform"
   12. Wait for "Successfully published" confirmation
   13. Verify Reel appears on @actioninsighttest Instagram profile
   ```

### Step 7: Submit for Review

1. **Click "Add Items for Review"**
   - Select `instagram_content_publish`
   - Answer all required questions

2. **Upload Screen Recording**
   - Paste YouTube URL of demo video
   - Ensure video is "Unlisted" (not Private)

3. **Provide Test Credentials**
   - Paste test account details
   - Include step-by-step instructions

4. **Review and Submit**
   - Double-check all information
   - Click "Submit for Review"

---

## ⏱️ Review Timeline

**Typical Timeline:**
- **Submission → In Review:** 1-3 days
- **In Review → Decision:** 3-7 days
- **Total:** 4-10 days average

**Possible Outcomes:**
1. **Approved** ✅ - Permission granted, can publish immediately
2. **More Information Needed** ⚠️ - Answer questions, resubmit
3. **Rejected** ❌ - Fix issues, wait 7 days, resubmit

---

## 🚨 Common Rejection Reasons

### 1. Incomplete Documentation
**Issue:** Missing or invalid Privacy Policy/Terms
**Fix:** Ensure all URLs are publicly accessible and comprehensive

### 2. Poor Screen Recording
**Issue:** Video doesn't clearly show the permission being used
**Fix:** Re-record with clear narration and step-by-step demonstration

### 3. Test Credentials Don't Work
**Issue:** Reviewers can't log in or replicate functionality
**Fix:** Test credentials yourself before submitting

### 4. Personal Account Used
**Issue:** Test account is Personal, not Business
**Fix:** Convert test account to Business/Creator

### 5. Functionality Not Working
**Issue:** Publishing fails during review
**Fix:** Thoroughly test before submitting

### 6. Vague Use Case Description
**Issue:** Explanation doesn't clearly explain why permission is needed
**Fix:** Be specific about user flow and business need

---

## ✅ How to Increase Approval Chances

### Do's ✅
- ✅ Test EVERYTHING before submitting
- ✅ Record clear, narrated demo video
- ✅ Provide working test credentials
- ✅ Have comprehensive Privacy Policy
- ✅ Show real, working functionality
- ✅ Explain business need clearly
- ✅ Use Business Instagram account
- ✅ Link Instagram to Facebook Page
- ✅ Respond quickly to reviewer questions

### Don'ts ❌
- ❌ Submit with broken functionality
- ❌ Use personal Instagram account
- ❌ Provide fake/mockup screenshots
- ❌ Have generic Privacy Policy
- ❌ Use test credentials that don't work
- ❌ Submit incomplete integration
- ❌ Ignore reviewer feedback
- ❌ Rush the submission

---

## 🔄 If Rejected: How to Resubmit

1. **Read Rejection Reason Carefully**
   - Facebook provides specific feedback
   - Address EVERY point mentioned

2. **Fix All Issues**
   - Update documentation
   - Fix broken functionality
   - Re-record demo video if needed

3. **Wait 7 Days**
   - Facebook enforces 7-day waiting period after rejection
   - Use this time to thoroughly improve submission

4. **Resubmit with Changes**
   - Mention what you fixed in description
   - Provide even more detail than before

---

## 📊 Post-Approval Monitoring

**After approval:**
- ✅ Permission is active immediately
- ✅ Can publish to all user Instagram accounts
- ⚠️ Facebook monitors usage for policy violations
- ⚠️ Permission can be revoked if misused

**Best Practices:**
- Never publish without explicit user action
- Respect user's publishing settings
- Handle errors gracefully
- Monitor for policy changes
- Keep Privacy Policy updated

---

## 📞 Support Resources

- **Facebook Developer Support**: https://developers.facebook.com/support/
- **Instagram API Documentation**: https://developers.facebook.com/docs/instagram-api
- **App Review FAQs**: https://developers.facebook.com/docs/app-review
- **Community Forum**: https://developers.facebook.com/community/

---

## 🎯 Checklist Before Submitting

Use this checklist to ensure you're ready:

### Documentation
- [ ] Privacy Policy URL works (HTTPS, publicly accessible)
- [ ] Terms of Service URL works
- [ ] Data Deletion Instructions URL works
- [ ] All pages clearly explain Instagram data usage

### App Configuration
- [ ] App icon uploaded (1024x1024px)
- [ ] App category set correctly
- [ ] OAuth redirect URIs configured
- [ ] HTTPS enforced

### Integration
- [ ] OAuth flow works end-to-end
- [ ] Can connect Instagram Business account
- [ ] Publishing functionality implemented
- [ ] Error handling in place

### Demo Video
- [ ] Screen recording completed
- [ ] Shows complete flow (OAuth → Create → Publish → Verify)
- [ ] Under 5 minutes
- [ ] Uploaded to YouTube as Unlisted
- [ ] Clear narration explains each step

### Test Account
- [ ] Test Instagram Business account created
- [ ] Linked to test Facebook Page
- [ ] Test credentials work
- [ ] Step-by-step instructions written

### Submission
- [ ] Use case clearly explained
- [ ] Integration description detailed
- [ ] All questions answered
- [ ] Screen recording URL provided
- [ ] Test credentials provided

---

## ✨ Summary

**Facebook App Review is required** to publish Instagram Reels via API. The process typically takes **1-2 weeks** with an **~80% approval rate** if properly prepared.

**Keys to Success:**
1. Complete, accurate documentation
2. Working test credentials
3. Clear, narrated screen recording demo
4. Instagram Business account (not Personal)
5. Thorough testing before submission

**After approval**, you can publish Instagram Reels immediately for all users!

---

**Last Updated:** 2026-01-01
**Review Process Version:** Facebook Graph API v18.0
**Status:** Active (process may change - check Facebook docs)
