# Product Requirements Document (PRD)
## Short-Form Video Platform Integrations

**Document Version:** 1.0
**Date:** 2026-01-01
**Owner:** Product Team
**Status:** Ready for Review
**Target Release:** Q1 2026

---

## Executive Summary

### Overview
This PRD defines the requirements for integrating short-form video publishing capabilities into the Action Insight Marketing Platform, enabling users to automatically publish AI-generated videos to TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels.

### Business Opportunity
Short-form video represents the fastest-growing content format across social media platforms. Our platform currently generates high-quality vertical videos via Google Gemini Veo 3 but lacks the ability to publish them automatically. This creates a significant gap in our marketing automation offering.

**Market Data:**
- TikTok: 1.7B+ monthly active users, 52 minutes average daily usage
- Instagram Reels: 2B+ monthly active users, 30% of Instagram time spent on Reels
- YouTube Shorts: 2B+ monthly users, 70B+ daily views
- Facebook Reels: Integrated across 3B+ Facebook users

### Strategic Goals
1. **Complete the automation loop** - Users can create AND publish videos without leaving the platform
2. **Increase user retention** - Video automation is a high-value feature that reduces churn
3. **Enable cross-platform publishing** - One video published to 4+ platforms automatically
4. **Competitive differentiation** - Few marketing platforms offer full short-form video automation

### Success Criteria
- **Adoption:** 40% of active users publish at least 1 video within 30 days of launch
- **Publishing Volume:** 500+ videos published per week by month 3
- **Multi-platform Usage:** 60% of users publish to 2+ platforms
- **Success Rate:** 95%+ publishing success rate (no failed uploads)
- **Time to First Video:** Under 5 minutes from signup to first published video

### Investment Required
- **Development Time:** 4-5 weeks (3 engineers)
- **Recurring Costs:** $29/month (Blotato API for TikTok)
- **One-time Setup:** API credentials, business account verifications

---

## Problem Statement

### Current State
**What works today:**
- ✅ Users can generate high-quality vertical videos (9:16) using AI Video Studio
- ✅ Videos are optimized for short-form platforms (duration, format, resolution)
- ✅ Cost tracking and project management for video generation

**What's broken:**
- ❌ No way to publish generated videos to social platforms
- ❌ Users must manually download videos and upload to each platform separately
- ❌ No scheduling, no cross-platform publishing, no automation
- ❌ High friction reduces video publishing adoption

### User Pain Points

**Pain Point 1: Manual Export & Upload**
> "I spent 2 minutes generating a video, then spent 15 minutes downloading it and uploading to TikTok, Instagram, and YouTube separately. This defeats the purpose of automation."

**Pain Point 2: Platform-Specific Requirements**
> "Each platform has different requirements - TikTok needs hashtags, Instagram needs a cover image, YouTube needs SEO tags. I have to remember all of this for every video."

**Pain Point 3: No Scheduling**
> "I want to batch-create videos on Sunday and schedule them throughout the week, but I can't. I have to manually post each one at the right time."

**Pain Point 4: Missing Analytics**
> "After I manually upload videos, I have no way to track performance across platforms in one place. I have to log into 4 different apps to see how my videos are doing."

### Competitive Landscape

**Direct Competitors:**
- **Latte Social** - $29/mo, TikTok + Instagram Reels publishing
- **OpusClip** - $99/mo, YouTube Shorts + TikTok publishing with AI editing
- **Vidyo.ai** - $49/mo, Multi-platform publishing with AI repurposing
- **Kapwing** - $24/mo, Manual publishing to TikTok, Instagram, YouTube

**Our Advantage:**
- ✅ AI video generation already built (Google Gemini Veo 3)
- ✅ Full marketing automation platform (not just video)
- ✅ Campaign integration (videos tied to campaigns)
- ✅ Analytics integration (performance tracking in one dashboard)
- ✅ Lower cost ($29/mo via Blotato vs $49-99/mo competitors)

### Why Now?
1. **AI video generation is ready** - Veo 3 produces broadcast-quality videos
2. **User requests are increasing** - #1 feature request in last 2 months
3. **Competitive pressure** - Competitors are launching similar features
4. **Platform APIs are mature** - Instagram Reels API now stable (2025)
5. **Market timing** - Short-form video adoption at peak growth

---

## Goals & Success Metrics

### Primary Goals

**Goal 1: Enable Automated Multi-Platform Publishing**
- **Metric:** Users can publish 1 video to 3+ platforms with 1 click
- **Target:** 80% of published videos go to 2+ platforms
- **Timeline:** Launch within 5 weeks

**Goal 2: Reduce Time-to-Publish**
- **Metric:** Time from video generation to published on platform
- **Current:** 15+ minutes (manual download + upload)
- **Target:** Under 2 minutes (automated)
- **Timeline:** Launch within 5 weeks

**Goal 3: Increase Video Publishing Volume**
- **Metric:** Total videos published per week
- **Current:** ~50/week (manual uploads outside platform)
- **Target:** 500+/week by Month 3
- **Timeline:** Progressive growth over 3 months

### Secondary Goals

**Goal 4: Improve User Retention**
- **Metric:** 30-day retention rate for users who publish videos
- **Current:** 45% overall retention
- **Target:** 65% retention for video publishers
- **Rationale:** Video automation is a high-value sticky feature

**Goal 5: Drive Premium Upgrades**
- **Metric:** Free-to-paid conversion rate
- **Current:** 8% free-to-paid conversion
- **Target:** 15% conversion for users who publish 3+ videos
- **Rationale:** Video publishing can be a premium feature differentiator

### Success Metrics (OKRs)

**Objective 1: Launch Multi-Platform Video Publishing by End of Q1 2026**

Key Results:
- KR1: TikTok publishing via Blotato live by Week 2 (100% success rate)
- KR2: Instagram Reels direct integration live by Week 4 (95%+ success rate)
- KR3: YouTube Shorts live by Week 5 (95%+ success rate)
- KR4: 40% of active users publish at least 1 video in first 30 days

**Objective 2: Achieve 500+ Videos Published Per Week by Month 3**

Key Results:
- KR1: Week 1-4: 100 videos/week (early adopters)
- KR2: Month 2: 250 videos/week (growth phase)
- KR3: Month 3: 500+ videos/week (steady state)
- KR4: 95%+ publishing success rate maintained

**Objective 3: Establish Video Publishing as Core Platform Feature**

Key Results:
- KR1: 60% of videos published to 2+ platforms (cross-posting adoption)
- KR2: 25% of videos scheduled (not immediately published)
- KR3: Video publishers have 65%+ 30-day retention (vs 45% baseline)
- KR4: Net Promoter Score (NPS) of 40+ from video feature users

### Anti-Metrics (What We're NOT Optimizing For)

❌ **Not optimizing for:** Maximum platform coverage (20+ platforms)
- **Why:** Diminishing returns, focus on top 4 platforms first

❌ **Not optimizing for:** Advanced video editing features
- **Why:** AI generation already produces good videos, editing is scope creep

❌ **Not optimizing for:** Real-time analytics from platforms
- **Why:** Platform APIs have rate limits, focus on publishing first

❌ **Not optimizing for:** Viral prediction/optimization
- **Why:** Too speculative, focus on consistent publishing workflow

---

## User Stories & Use Cases

### Primary User Personas

**Persona 1: Small Business Owner Sarah**
- **Background:** Owns a boutique coffee shop, no marketing team
- **Tech Level:** Basic (uses Instagram personally, unfamiliar with APIs)
- **Goals:** Promote daily specials, build local following
- **Pain Points:** No time to create content, unfamiliar with video editing

**Persona 2: Marketing Manager Mike**
- **Background:** Works at B2B SaaS startup, manages 2-person marketing team
- **Tech Level:** Advanced (familiar with marketing automation tools)
- **Goals:** Generate leads, build thought leadership, drive website traffic
- **Pain Points:** Limited budget, needs data to justify spend

**Persona 3: Content Creator Jasmine**
- **Background:** Freelance social media manager for 5 clients
- **Tech Level:** Expert (uses multiple tools, understands platform algorithms)
- **Goals:** Scale client services, improve video quality, automate posting
- **Pain Points:** Time-consuming manual work, hard to scale beyond 5 clients

### User Stories

**Epic 1: Video Publishing**

**US-1.1:** As Sarah, I want to publish my AI-generated video to TikTok with one click, so I don't have to manually download and re-upload it.
- **Acceptance Criteria:**
  - Given I have generated a video in AI Video Studio
  - When I click "Publish to TikTok"
  - Then the video is posted to my connected TikTok account within 2 minutes
  - And I see a success confirmation with a link to the published video

**US-1.2:** As Mike, I want to publish one video to Instagram Reels, TikTok, and YouTube Shorts simultaneously, so I maximize reach without extra work.
- **Acceptance Criteria:**
  - Given I have generated a video
  - When I select multiple platforms and click "Publish to All"
  - Then the video is published to all selected platforms
  - And I see individual success/failure status for each platform
  - And failed platforms don't block successful publishes

**US-1.3:** As Jasmine, I want to schedule videos to publish at optimal times for each platform, so my clients' content posts when their audience is most active.
- **Acceptance Criteria:**
  - Given I have generated a video
  - When I select "Schedule" and choose date/time for each platform
  - Then the video is queued for publishing at the specified times
  - And I receive a confirmation email when each video publishes
  - And I can view/edit scheduled posts in a calendar view

**Epic 2: Platform Connection Management**

**US-2.1:** As Sarah, I want to connect my TikTok account with clear instructions, so I don't get confused by OAuth flows.
- **Acceptance Criteria:**
  - Given I am on the Integrations page
  - When I click "Connect TikTok"
  - Then I see clear step-by-step instructions with screenshots
  - And the OAuth popup opens automatically
  - And after approval, I see my connected account info (username, profile pic)
  - And the connection status is stored and visible

**US-2.2:** As Mike, I want to see which platforms are connected and their status, so I know if tokens have expired or need re-authorization.
- **Acceptance Criteria:**
  - Given I am on the Integrations page
  - When I view my connected platforms
  - Then I see status for each: Connected (green), Expired (yellow), Disconnected (red)
  - And I can click "Reconnect" to refresh expired tokens
  - And I receive email alerts before tokens expire (7 days warning)

**Epic 3: Video Optimization & Metadata**

**US-3.1:** As Jasmine, I want platform-specific captions and hashtags generated automatically, so I don't have to manually customize for each platform.
- **Acceptance Criteria:**
  - Given I have generated a video
  - When I click "Optimize for Platforms"
  - Then the AI suggests platform-specific captions (TikTok: casual, LinkedIn: professional)
  - And relevant hashtags are auto-generated (3-5 per platform)
  - And I can edit before publishing

**US-3.2:** As Mike, I want to add custom thumbnails for YouTube Shorts, so I can maintain brand consistency.
- **Acceptance Criteria:**
  - Given I am publishing to YouTube
  - When I select a custom thumbnail image
  - Then the image is uploaded and set as the video thumbnail
  - And I see a preview before publishing

**Epic 4: Analytics & Performance**

**US-4.1:** As Sarah, I want to see how many views each video got across all platforms, so I know what content works.
- **Acceptance Criteria:**
  - Given I have published videos
  - When I view the Video Analytics dashboard
  - Then I see total views, likes, comments for each video
  - And I can filter by platform
  - And data updates every 24 hours

**US-4.2:** As Mike, I want to compare video performance across platforms, so I can optimize my publishing strategy.
- **Acceptance Criteria:**
  - Given I have published the same video to multiple platforms
  - When I view the comparison report
  - Then I see side-by-side metrics (views, engagement rate, shares)
  - And I can identify best-performing platform
  - And I see recommendations for future publishing

### Edge Cases & Error Scenarios

**EC-1: Platform API Failure**
- **Scenario:** TikTok API returns 500 error during upload
- **Expected Behavior:** Show user-friendly error message, offer retry button, log error for debugging
- **User Message:** "TikTok is experiencing issues. We'll retry automatically. You can also retry manually."

**EC-2: Video Format Rejection**
- **Scenario:** Instagram rejects video due to unsupported codec
- **Expected Behavior:** Auto-convert video to compatible format and retry
- **User Message:** "Converting video for Instagram... this may take 30 seconds."

**EC-3: Expired OAuth Token**
- **Scenario:** User's YouTube token expired, publish fails
- **Expected Behavior:** Detect expiration, prompt re-authorization, queue video for retry after reconnection
- **User Message:** "Your YouTube connection expired. Please reconnect to publish. Your video will publish automatically after reconnecting."

**EC-4: Rate Limit Exceeded**
- **Scenario:** User hits YouTube's 6 uploads/day quota
- **Expected Behavior:** Queue video for next day, notify user of delay
- **User Message:** "YouTube daily upload limit reached. Your video is scheduled to publish tomorrow at 12:01 AM UTC."

**EC-5: Account Not Business Type**
- **Scenario:** User tries to publish Reels to personal Instagram account
- **Expected Behavior:** Detect account type, show conversion instructions
- **User Message:** "Instagram Reels require a Business or Creator account. Here's how to convert: [link to guide]"

---

## Functional Requirements

### Must-Have (P0) - Launch Blockers

**FR-1: TikTok Publishing via Blotato**
- **Description:** Publish videos to TikTok using Blotato API
- **Requirements:**
  - User can connect TikTok account via Blotato OAuth flow
  - User can publish video with caption (max 2200 chars) and hashtags
  - System stores Blotato API key securely
  - Publishing completes within 2 minutes
  - Success/failure status shown in UI
  - Video URL returned after successful publish
- **Priority:** P0 (launch blocker)
- **Phase:** Phase 1 (Week 1-2)

**FR-2: Instagram Reels Publishing (Direct API)**
- **Description:** Publish videos to Instagram Reels using Meta Graph API
- **Requirements:**
  - User can connect Instagram Business/Creator account via OAuth
  - System uploads video to public URL (Supabase Storage)
  - System calls Graph API with video_url, caption, media_type=REELS
  - System polls for processing completion (max 5 minutes)
  - System publishes Reel when processing complete
  - Error handling for failed uploads (retry 3x)
  - Support captions up to 2200 characters
- **Priority:** P0 (launch blocker)
- **Phase:** Phase 2 (Week 2-4)

**FR-3: YouTube Shorts Publishing (Direct API)**
- **Description:** Publish videos to YouTube as Shorts using YouTube Data API v3
- **Requirements:**
  - User can connect YouTube account via OAuth
  - System uploads video using resumable upload (videos can be large)
  - Auto-detection of Shorts (vertical format + <60 seconds)
  - System tracks daily quota usage (max 6 uploads/day)
  - Queue videos if quota exceeded (publish next day)
  - Support title, description, tags, privacy settings
  - Return YouTube video URL after publish
- **Priority:** P0 (launch blocker)
- **Phase:** Phase 3 (Week 3-5)

**FR-4: Multi-Platform Publishing**
- **Description:** Publish one video to multiple platforms with one action
- **Requirements:**
  - User can select 2+ platforms from UI
  - System publishes to all platforms simultaneously (parallel requests)
  - Show individual status for each platform (success/pending/failed)
  - Failed platforms don't block successful publishes
  - Retry failed platforms up to 3 times
  - Show summary: "Published to 3 of 4 platforms successfully"
- **Priority:** P0 (launch blocker)
- **Phase:** Phase 1 (Week 1-2)

**FR-5: Video Hosting & Public URLs**
- **Description:** Host generated videos at publicly accessible URLs for API uploads
- **Requirements:**
  - Store videos in Supabase Storage with public bucket
  - Generate signed URLs with 24-hour expiration
  - Support videos up to 1GB (Instagram Reels max)
  - Auto-delete videos after 7 days (cost optimization)
  - CDN delivery for fast platform downloads
- **Priority:** P0 (launch blocker)
- **Phase:** Phase 1 (Week 1-2)

**FR-6: Platform Connection Management**
- **Description:** Manage OAuth connections to social platforms
- **Requirements:**
  - User can connect/disconnect platforms from Settings > Integrations
  - Show connection status (connected, expired, error)
  - Display connected account info (username, profile picture)
  - Refresh expired tokens automatically (background job)
  - Notify user 7 days before token expiration
  - Store encrypted tokens in database with RLS policies
- **Priority:** P0 (launch blocker)
- **Phase:** Phase 1 (Week 1-2)

### Should-Have (P1) - High Value

**FR-7: Scheduled Publishing**
- **Description:** Schedule videos to publish at future date/time
- **Requirements:**
  - User can select date/time for each platform
  - Support timezone selection (auto-detect user timezone)
  - Show scheduled posts in calendar view
  - Allow editing/canceling scheduled posts
  - Send confirmation email when video publishes
  - Cron job checks every 5 minutes for pending publishes
- **Priority:** P1
- **Phase:** Phase 4 (Post-Launch)

**FR-8: Platform-Specific Optimization**
- **Description:** Auto-generate platform-specific captions and hashtags
- **Requirements:**
  - AI generates platform-appropriate captions (TikTok: casual, LinkedIn: professional)
  - Auto-suggest 3-5 relevant hashtags per platform
  - User can edit AI-generated content before publishing
  - Enforce platform character limits (TikTok: 2200, Instagram: 2200, YouTube: 5000)
  - Show character count in real-time as user types
- **Priority:** P1
- **Phase:** Phase 4 (Post-Launch)

**FR-9: Publishing Analytics Dashboard**
- **Description:** Track published video performance across platforms
- **Requirements:**
  - Display views, likes, comments, shares per video
  - Show aggregate stats across all platforms
  - Filter by date range, platform, campaign
  - Export data to CSV
  - Update metrics every 24 hours (background job)
- **Priority:** P1
- **Phase:** Phase 5 (Post-Launch)

**FR-10: Bulk Publishing**
- **Description:** Publish multiple videos at once
- **Requirements:**
  - User can select multiple generated videos
  - Publish all to same platforms with one action
  - Show progress bar for batch publish
  - Display summary of successes/failures
  - Queue large batches (>10 videos) for background processing
- **Priority:** P1
- **Phase:** Phase 4 (Post-Launch)

### Nice-to-Have (P2) - Future Enhancements

**FR-11: Facebook Reels Publishing**
- **Description:** Publish videos to Facebook Reels
- **Requirements:**
  - Connect Facebook Page via OAuth
  - Publish to Facebook Reels using Graph API
  - Support cross-posting from Instagram Reels
- **Priority:** P2
- **Phase:** Future

**FR-12: Custom Thumbnails**
- **Description:** Upload custom thumbnails for videos (YouTube, TikTok)
- **Requirements:**
  - User can upload image (JPG/PNG, max 2MB)
  - Auto-crop to platform specs (YouTube: 1280x720, TikTok: 1080x1920)
  - Show preview before publishing
- **Priority:** P2
- **Phase:** Future

**FR-13: Video Preview Before Publishing**
- **Description:** Preview how video will appear on each platform
- **Requirements:**
  - Show platform-specific mockup (TikTok UI, Instagram UI, YouTube UI)
  - Include caption, hashtags, thumbnail in preview
  - Allow editing from preview screen
- **Priority:** P2
- **Phase:** Future

**FR-14: A/B Testing for Videos**
- **Description:** Test different captions/thumbnails to optimize performance
- **Requirements:**
  - Create 2-3 variants of same video with different captions
  - Publish variants to different platforms
  - Track performance and declare winner
  - Auto-apply winning variant to future videos
- **Priority:** P2
- **Phase:** Future

---

## Non-Functional Requirements

### Performance

**NFR-1: Publishing Latency**
- **Requirement:** Video publishes within 2 minutes of user clicking "Publish"
- **Measurement:** P95 latency from publish click to platform confirmation
- **Target:** <120 seconds for 95% of publishes
- **Rationale:** User expects fast feedback; long waits reduce trust

**NFR-2: Video Upload Speed**
- **Requirement:** Videos upload to storage and platforms efficiently
- **Measurement:** Upload time for 50MB video
- **Target:** <30 seconds to Supabase Storage, <60 seconds to platform API
- **Rationale:** Large video files; need fast CDN and optimized uploads

**NFR-3: Background Job Processing**
- **Requirement:** Scheduled publishes execute on time without blocking
- **Measurement:** % of scheduled posts that publish within 5 minutes of scheduled time
- **Target:** 99%+ on-time publishes
- **Rationale:** Users trust scheduled posts to go out reliably

**NFR-4: Database Query Performance**
- **Requirement:** Platform connections and video metadata load quickly
- **Measurement:** P95 query time for fetching user's connected platforms
- **Target:** <100ms
- **Rationale:** Frequent queries; slow loads degrade UX

### Scalability

**NFR-5: Concurrent Publishing**
- **Requirement:** System handles multiple users publishing simultaneously
- **Measurement:** Successful publishes under load (100 concurrent users)
- **Target:** 95%+ success rate under peak load
- **Rationale:** Launch spike could have 100+ users publishing at once

**NFR-6: API Rate Limit Management**
- **Requirement:** System respects platform API rate limits
- **Measurement:** Zero rate limit errors (429 responses) from platforms
- **Target:** 0% rate limit errors
- **Rationale:** Rate limit bans can block all users; must implement queuing

**NFR-7: Storage Scalability**
- **Requirement:** Video storage scales with user growth
- **Measurement:** Storage costs and availability as videos accumulate
- **Target:** Auto-delete videos after 7 days to keep storage <100GB
- **Rationale:** Videos are large; permanent storage is expensive

### Reliability

**NFR-8: Publishing Success Rate**
- **Requirement:** High reliability for successful publishes
- **Measurement:** % of publish attempts that succeed
- **Target:** 95%+ success rate
- **Rationale:** Failed publishes frustrate users; must retry automatically

**NFR-9: OAuth Token Refresh**
- **Requirement:** Expired tokens auto-refresh without user intervention
- **Measurement:** % of token refreshes that succeed automatically
- **Target:** 90%+ auto-refresh success (10% require re-auth)
- **Rationale:** Manual re-auth is friction; minimize it

**NFR-10: Error Recovery**
- **Requirement:** Failed publishes retry automatically
- **Measurement:** % of failed publishes that succeed after retry
- **Target:** 70%+ of failures recover on retry (3 attempts max)
- **Rationale:** Transient errors (network issues) resolve on retry

**NFR-11: System Uptime**
- **Requirement:** Publishing service is always available
- **Measurement:** Uptime % for publishing endpoints
- **Target:** 99.5%+ uptime (max 3.6 hours downtime per month)
- **Rationale:** Users expect 24/7 availability

### Security

**NFR-12: OAuth Token Encryption**
- **Requirement:** All OAuth tokens encrypted at rest
- **Measurement:** Manual audit of token storage
- **Target:** 100% of tokens encrypted with AES-256 (not base64)
- **Rationale:** Token leaks grant full access to user accounts

**NFR-13: API Key Security**
- **Requirement:** Blotato API key and platform secrets stored securely
- **Measurement:** Manual code review of environment variable usage
- **Target:** Zero hardcoded secrets in code; all from env vars
- **Rationale:** Leaked keys compromise entire platform

**NFR-14: User Data Isolation**
- **Requirement:** Users can only publish to their own connected accounts
- **Measurement:** Penetration test attempting cross-user publishing
- **Target:** Zero successful cross-user attacks
- **Rationale:** RLS policies must enforce user-scoped data access

**NFR-15: Video URL Security**
- **Requirement:** Public video URLs expire after use to prevent leaks
- **Measurement:** Verify signed URLs expire after 24 hours
- **Target:** 100% of URLs expire on schedule
- **Rationale:** Public URLs could leak unreleased videos

### Usability

**NFR-16: Error Messages**
- **Requirement:** User-friendly error messages for all failure modes
- **Measurement:** Manual testing of error scenarios
- **Target:** 100% of errors show actionable messages (not technical jargon)
- **Rationale:** Technical errors confuse non-technical users

**NFR-17: Mobile Responsiveness**
- **Requirement:** Publishing UI works on mobile devices
- **Measurement:** Manual testing on iOS/Android
- **Target:** 100% of features functional on mobile
- **Rationale:** Many users manage social media from phones

**NFR-18: Accessibility**
- **Requirement:** Publishing features are accessible to screen reader users
- **Measurement:** WCAG 2.1 AA compliance audit
- **Target:** 100% WCAG 2.1 AA compliance
- **Rationale:** Inclusive design is required

### Monitoring & Observability

**NFR-19: Error Logging**
- **Requirement:** All publishing errors logged with context
- **Measurement:** Manual review of error logs
- **Target:** 100% of errors logged with user_id, platform, video_id, error message
- **Rationale:** Debugging requires detailed error context

**NFR-20: Performance Metrics**
- **Requirement:** Track key performance indicators in dashboard
- **Measurement:** Verify metrics are tracked and visible
- **Target:** Track publish success rate, latency, quota usage, error rate
- **Rationale:** Can't optimize what you don't measure

**NFR-21: User Activity Analytics**
- **Requirement:** Track user behavior for product insights
- **Measurement:** Verify analytics events fire correctly
- **Target:** Track publishes, platform connections, scheduled posts, cancellations
- **Rationale:** Product decisions require user behavior data

---

## Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - VideoPublishingUI.tsx                                    │
│  - PlatformSelector.tsx                                     │
│  - PublishingStatus.tsx                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions (Deno)                  │
│  - publish-video/           (orchestrator)                  │
│  - tiktok-publish/          (Blotato API)                   │
│  - instagram-publish/       (Meta Graph API)                │
│  - youtube-publish/         (YouTube Data API v3)           │
│  - platform-oauth/          (OAuth flow manager)            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Platform APIs                     │
│  - Blotato API (TikTok proxy)                               │
│  - Meta Graph API v18.0+ (Instagram Reels)                  │
│  - YouTube Data API v3 (YouTube Shorts)                     │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Social Platforms                          │
│  - TikTok                                                   │
│  - Instagram                                                │
│  - YouTube                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Supabase Storage (Video CDN)                │
│  - Bucket: published-videos (public)                        │
│  - Signed URLs with 24-hour expiration                      │
│  - Auto-cleanup after 7 days                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                  │
│  - oauth_connections (encrypted tokens)                     │
│  - published_videos (metadata, status, URLs)                │
│  - publishing_queue (scheduled posts)                       │
│  - publishing_analytics (performance metrics)               │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

**Table: `oauth_connections`** (Existing - Update)
```sql
CREATE TABLE oauth_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube', 'facebook'
  platform_user_id TEXT,
  platform_username TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'connected', -- 'connected', 'expired', 'error', 'disconnected'
  connection_metadata JSONB, -- { profile_pic, follower_count, etc. }
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform_name)
);

-- RLS Policies
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own connections" ON oauth_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own connections" ON oauth_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connections" ON oauth_connections
  FOR UPDATE USING (auth.uid() = user_id);
```

**Table: `published_videos`** (New)
```sql
CREATE TABLE published_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_project_id UUID REFERENCES ai_video_projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Video details
  video_url TEXT NOT NULL, -- Supabase Storage URL
  video_duration_s INTEGER,
  video_format TEXT, -- 'mp4', 'webm'
  video_size_bytes BIGINT,

  -- Publishing details
  platforms JSONB NOT NULL, -- { tiktok: {...}, instagram: {...}, youtube: {...} }
  -- Example platforms value:
  -- {
  --   "tiktok": {
  --     "status": "published",
  --     "platform_video_id": "7123456789",
  --     "platform_url": "https://tiktok.com/@user/video/7123456789",
  --     "caption": "Check this out! #viral",
  --     "published_at": "2026-01-01T12:00:00Z",
  --     "error_message": null
  --   },
  --   "instagram": {
  --     "status": "failed",
  --     "error_message": "Token expired",
  --     "retry_count": 3
  --   }
  -- }

  -- Metadata
  caption TEXT,
  hashtags TEXT[],
  scheduled_for TIMESTAMPTZ, -- NULL = publish immediately

  -- Status tracking
  overall_status TEXT DEFAULT 'pending', -- 'pending', 'publishing', 'published', 'failed', 'scheduled'
  publish_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_published_videos_user_id ON published_videos(user_id);
CREATE INDEX idx_published_videos_status ON published_videos(overall_status);
CREATE INDEX idx_published_videos_scheduled ON published_videos(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- RLS Policies
ALTER TABLE published_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own published videos" ON published_videos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own published videos" ON published_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own published videos" ON published_videos
  FOR UPDATE USING (auth.uid() = user_id);
```

**Table: `publishing_queue`** (New - For Scheduled Posts)
```sql
CREATE TABLE publishing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published_video_id UUID REFERENCES published_videos(id) ON DELETE CASCADE,

  scheduled_for TIMESTAMPTZ NOT NULL,
  platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube'

  status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_publishing_queue_scheduled ON publishing_queue(scheduled_for) WHERE status = 'queued';
CREATE INDEX idx_publishing_queue_status ON publishing_queue(status);

-- RLS Policies
ALTER TABLE publishing_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own queue items" ON publishing_queue
  FOR SELECT USING (auth.uid() = user_id);
```

**Table: `publishing_analytics`** (New - For Performance Tracking)
```sql
CREATE TABLE publishing_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published_video_id UUID REFERENCES published_videos(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,
  platform_video_id TEXT,

  -- Metrics (fetched from platform APIs)
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate NUMERIC, -- (likes + comments + shares) / views

  -- Metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_publishing_analytics_user_id ON publishing_analytics(user_id);
CREATE INDEX idx_publishing_analytics_video_id ON publishing_analytics(published_video_id);

-- RLS Policies
ALTER TABLE publishing_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analytics" ON publishing_analytics
  FOR SELECT USING (auth.uid() = user_id);
```

### API Endpoints

**Edge Function: `publish-video`** (Orchestrator)
```typescript
// POST /functions/v1/publish-video
// Body: {
//   video_project_id: UUID,
//   platforms: ['tiktok', 'instagram', 'youtube'],
//   caption: string,
//   hashtags: string[],
//   scheduled_for?: ISO8601 timestamp,
//   platform_options?: {
//     tiktok?: { privacy: 'public' | 'friends' | 'private' },
//     instagram?: { share_to_feed: boolean },
//     youtube?: { title: string, description: string, privacy: 'public' | 'unlisted' | 'private' }
//   }
// }
// Response: {
//   success: boolean,
//   published_video_id: UUID,
//   results: {
//     tiktok: { status: 'published' | 'failed', platform_url?: string, error?: string },
//     instagram: { ... },
//     youtube: { ... }
//   }
// }

async function publishVideo(req: Request) {
  // 1. Authenticate user
  const user = await getUser(req);

  // 2. Fetch video project and video file
  const videoProject = await fetchVideoProject(body.video_project_id);
  const videoFile = await fetchVideoFromStorage(videoProject.video_url);

  // 3. Upload video to public storage (for platform URLs)
  const publicVideoUrl = await uploadToPublicStorage(videoFile);

  // 4. Create published_videos record
  const publishedVideo = await createPublishedVideoRecord({
    user_id: user.id,
    video_project_id: body.video_project_id,
    video_url: publicVideoUrl,
    caption: body.caption,
    hashtags: body.hashtags,
    scheduled_for: body.scheduled_for
  });

  // 5. If scheduled, add to queue and return
  if (body.scheduled_for) {
    await addToPublishingQueue(publishedVideo.id, body.platforms, body.scheduled_for);
    return { success: true, published_video_id: publishedVideo.id, status: 'scheduled' };
  }

  // 6. Publish to platforms in parallel
  const results = await Promise.allSettled([
    body.platforms.includes('tiktok') ? publishToTikTok(user, publicVideoUrl, body) : null,
    body.platforms.includes('instagram') ? publishToInstagram(user, publicVideoUrl, body) : null,
    body.platforms.includes('youtube') ? publishToYouTube(user, publicVideoUrl, body) : null
  ]);

  // 7. Update published_videos record with results
  await updatePublishedVideoResults(publishedVideo.id, results);

  // 8. Return results
  return {
    success: true,
    published_video_id: publishedVideo.id,
    results: formatResults(results)
  };
}
```

**Edge Function: `tiktok-publish`** (Blotato Integration)
```typescript
// POST /functions/v1/tiktok-publish
// Body: {
//   user_id: UUID,
//   video_url: string,
//   caption: string,
//   hashtags: string[],
//   privacy: 'public' | 'friends' | 'private'
// }

async function publishToTikTok(body) {
  // 1. Fetch user's Blotato connection (stored as oauth_connection)
  const connection = await fetchOAuthConnection(body.user_id, 'tiktok');

  if (!connection || connection.connection_status !== 'connected') {
    throw new Error('TikTok not connected or token expired');
  }

  // 2. Call Blotato API
  const response = await fetch('https://backend.blotato.com/v2/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BLOTATO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      platform: 'tiktok',
      user_access_token: decryptToken(connection.access_token_encrypted),
      video_url: body.video_url,
      caption: body.caption + ' ' + body.hashtags.join(' '),
      privacy: body.privacy || 'public'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Blotato API error: ${error.message}`);
  }

  const result = await response.json();

  // 3. Return TikTok video URL
  return {
    status: 'published',
    platform_video_id: result.tiktok_video_id,
    platform_url: result.tiktok_url,
    published_at: new Date().toISOString()
  };
}
```

**Edge Function: `instagram-publish`** (Direct Meta API)
```typescript
// POST /functions/v1/instagram-publish
// Body: {
//   user_id: UUID,
//   video_url: string (must be publicly accessible),
//   caption: string,
//   share_to_feed: boolean
// }

async function publishToInstagram(body) {
  // 1. Fetch user's Instagram connection
  const connection = await fetchOAuthConnection(body.user_id, 'instagram');

  if (!connection || connection.connection_status !== 'connected') {
    throw new Error('Instagram not connected or token expired');
  }

  const accessToken = decryptToken(connection.access_token_encrypted);
  const igUserId = connection.platform_user_id;

  // 2. Create Reels media container
  const createResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: body.video_url, // Must be public URL
        caption: body.caption,
        share_to_feed: body.share_to_feed || true,
        access_token: accessToken
      })
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const createData = await createResponse.json();
  const containerId = createData.id;

  // 3. Poll for processing completion (max 5 minutes)
  const maxAttempts = 60; // 5 minutes / 5 seconds
  let attempts = 0;
  let status = 'IN_PROGRESS';

  while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
    await new Deno.sleep(5000); // Wait 5 seconds

    const statusResponse = await fetch(
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const statusData = await statusResponse.json();
    status = statusData.status_code;
    attempts++;
  }

  if (status !== 'FINISHED') {
    throw new Error(`Instagram processing timeout or failed: ${status}`);
  }

  // 4. Publish the Reel
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken
      })
    }
  );

  if (!publishResponse.ok) {
    const error = await publishResponse.json();
    throw new Error(`Instagram publish error: ${error.error.message}`);
  }

  const publishData = await publishResponse.json();
  const mediaId = publishData.id;

  // 5. Get published Reel URL
  const urlResponse = await fetch(
    `https://graph.facebook.com/v18.0/${mediaId}?fields=permalink&access_token=${accessToken}`
  );
  const urlData = await urlResponse.json();

  return {
    status: 'published',
    platform_video_id: mediaId,
    platform_url: urlData.permalink,
    published_at: new Date().toISOString()
  };
}
```

**Edge Function: `youtube-publish`** (Direct YouTube API)
```typescript
// POST /functions/v1/youtube-publish
// Body: {
//   user_id: UUID,
//   video_url: string,
//   title: string,
//   description: string,
//   tags: string[],
//   privacy: 'public' | 'unlisted' | 'private'
// }

async function publishToYouTube(body) {
  // 1. Fetch user's YouTube connection
  const connection = await fetchOAuthConnection(body.user_id, 'youtube');

  if (!connection || connection.connection_status !== 'connected') {
    throw new Error('YouTube not connected or token expired');
  }

  // 2. Check daily quota (max 6 uploads/day)
  const todayUploads = await countTodayUploads(body.user_id, 'youtube');
  if (todayUploads >= 6) {
    throw new Error('YouTube daily upload limit reached (6 uploads). Try again tomorrow.');
  }

  const accessToken = decryptToken(connection.access_token_encrypted);

  // 3. Download video from public URL to temp file
  const videoResponse = await fetch(body.video_url);
  const videoBlob = await videoResponse.blob();
  const tempFilePath = `/tmp/video_${Date.now()}.mp4`;
  await Deno.writeFile(tempFilePath, new Uint8Array(await videoBlob.arrayBuffer()));

  // 4. Upload video using resumable upload (YouTube Data API v3)
  const metadata = {
    snippet: {
      title: body.title,
      description: body.description,
      tags: body.tags,
      categoryId: '22' // People & Blogs
    },
    status: {
      privacyStatus: body.privacy || 'public'
    }
  };

  // Note: YouTube auto-detects Shorts if video is vertical (<9:16) and <60 seconds
  // No special flag needed

  const uploadResponse = await uploadToYouTubeResumable(
    accessToken,
    tempFilePath,
    metadata
  );

  // 5. Clean up temp file
  await Deno.remove(tempFilePath);

  // 6. Return YouTube video URL
  return {
    status: 'published',
    platform_video_id: uploadResponse.id,
    platform_url: `https://youtube.com/shorts/${uploadResponse.id}`,
    published_at: new Date().toISOString()
  };
}

// Helper: Resumable upload to YouTube
async function uploadToYouTubeResumable(accessToken, filePath, metadata) {
  // Step 1: Initiate resumable upload
  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/mp4'
      },
      body: JSON.stringify(metadata)
    }
  );

  const uploadUrl = initResponse.headers.get('Location');

  // Step 2: Upload video file
  const videoFile = await Deno.readFile(filePath);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4'
    },
    body: videoFile
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json();
    throw new Error(`YouTube upload error: ${error.error.message}`);
  }

  return await uploadResponse.json();
}
```

**Edge Function: `platform-oauth`** (OAuth Flow Manager)
```typescript
// GET /functions/v1/platform-oauth/initiate?platform=tiktok
// Initiates OAuth flow for platform

// GET /functions/v1/platform-oauth/callback?code=...&state=...
// Handles OAuth callback and stores tokens

async function initiateOAuth(platform: string, userId: string) {
  const config = getPlatformOAuthConfig(platform);

  // Generate state token for security
  const state = crypto.randomUUID();
  await storeOAuthState(userId, platform, state);

  // Build authorization URL
  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', config.redirectUri);
  authUrl.searchParams.set('scope', config.scopes.join(' '));
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('response_type', 'code');

  return { authUrl: authUrl.toString() };
}

async function handleOAuthCallback(code: string, state: string) {
  // 1. Verify state token
  const stateData = await verifyOAuthState(state);
  if (!stateData) {
    throw new Error('Invalid state token');
  }

  const { userId, platform } = stateData;
  const config = getPlatformOAuthConfig(platform);

  // 2. Exchange code for access token
  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const tokens = await tokenResponse.json();

  // 3. Fetch user info from platform
  const userInfo = await fetchPlatformUserInfo(platform, tokens.access_token);

  // 4. Store encrypted tokens in database
  await upsertOAuthConnection({
    user_id: userId,
    platform_name: platform,
    platform_user_id: userInfo.id,
    platform_username: userInfo.username,
    access_token_encrypted: encryptToken(tokens.access_token),
    refresh_token_encrypted: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    connection_status: 'connected',
    connection_metadata: {
      profile_pic: userInfo.profile_pic,
      follower_count: userInfo.follower_count
    }
  });

  return { success: true, platform, username: userInfo.username };
}
```

### Frontend Components

**Component: `VideoPublishingUI.tsx`**
```typescript
// Location: /src/components/publishing/VideoPublishingUI.tsx

interface Props {
  videoProjectId: string;
  videoUrl: string;
  onPublishComplete: (results: PublishResults) => void;
}

export function VideoPublishingUI({ videoProjectId, videoUrl, onPublishComplete }: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResults | null>(null);

  const connectedPlatforms = useConnectedPlatforms(); // Fetch from database

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const { data, error } = await supabase.functions.invoke('publish-video', {
        body: {
          video_project_id: videoProjectId,
          platforms: selectedPlatforms,
          caption,
          hashtags,
          scheduled_for: scheduledFor?.toISOString()
        }
      });

      if (error) throw error;

      setPublishResults(data.results);
      onPublishComplete(data.results);
      toast.success(`Published to ${selectedPlatforms.length} platforms!`);
    } catch (error) {
      toast.error(`Publishing failed: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PlatformSelector
        connectedPlatforms={connectedPlatforms}
        selectedPlatforms={selectedPlatforms}
        onSelectionChange={setSelectedPlatforms}
      />

      <CaptionEditor
        caption={caption}
        onCaptionChange={setCaption}
        maxLength={2200}
      />

      <HashtagInput
        hashtags={hashtags}
        onHashtagsChange={setHashtags}
        suggestions={getHashtagSuggestions(caption)}
      />

      <ScheduleSelector
        scheduledFor={scheduledFor}
        onScheduleChange={setScheduledFor}
      />

      <Button
        onClick={handlePublish}
        disabled={isPublishing || selectedPlatforms.length === 0}
        className="w-full"
      >
        {isPublishing ? (
          <><Loader className="animate-spin mr-2" /> Publishing...</>
        ) : (
          <>Publish to {selectedPlatforms.length} Platform(s)</>
        )}
      </Button>

      {publishResults && (
        <PublishingResults results={publishResults} />
      )}
    </div>
  );
}
```

### Environment Variables

```env
# Blotato (TikTok Publishing)
BLOTATO_API_KEY=blt_your_api_key_here

# Instagram/Facebook (Meta Graph API)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# YouTube (Google Cloud)
YOUTUBE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_google_client_secret

# Supabase
SUPABASE_URL=https://kciuuxoqxfsogjuqflou.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Encryption (for token storage)
SECRET_MASTER_KEY=your_32_byte_encryption_key_here

# Video Storage
SUPABASE_STORAGE_BUCKET=published-videos
VIDEO_RETENTION_DAYS=7
```

### Monitoring & Alerts

**Metrics to Track:**
- Publishing success rate (per platform)
- Publishing latency (time to publish)
- Error rate (per platform, per error type)
- OAuth token refresh success rate
- Daily quota usage (YouTube)
- Storage usage (Supabase Storage)
- Background job completion rate (scheduled posts)

**Alerts to Configure:**
- Publishing success rate drops below 90%
- Publishing latency exceeds 5 minutes
- OAuth tokens failing to refresh (>10% failure rate)
- YouTube quota approaching limit (>80% used)
- Storage usage approaching limit (>90GB)
- Scheduled posts failing to publish (>5% failure rate)

**Dashboard:**
- Real-time publishing status (last 24 hours)
- Platform-specific success rates
- Top error messages
- User adoption metrics (% users publishing, avg videos/user)
- Cross-platform publishing metrics (% multi-platform)

---

## Phased Rollout Plan

### Phase 1: TikTok Publishing via Blotato (Week 1-2)

**Goals:**
- ✅ Users can publish to TikTok via Blotato API
- ✅ Multi-platform selection UI ready
- ✅ Video hosting infrastructure in place

**Deliverables:**
1. Blotato API integration (`tiktok-publish` edge function)
2. Video hosting setup (Supabase Storage public bucket)
3. Platform connection UI (Settings > Integrations > TikTok)
4. Publishing UI with platform selector
5. Database schema updates (`published_videos` table)
6. Error handling and retry logic

**Success Criteria:**
- TikTok publishing works end-to-end
- 95%+ success rate for TikTok publishes
- Video URLs expire after 24 hours
- User sees success confirmation with TikTok video link

**Rollout:**
- Internal testing (Day 1-3)
- Beta users (Day 4-7): 20 early adopters
- General availability (Day 8+): All users

---

### Phase 2: Instagram Reels Direct Integration (Week 2-4)

**Goals:**
- ✅ Users can publish to Instagram Reels via Meta Graph API
- ✅ App review approved for `instagram_content_publish` scope
- ✅ Video processing and polling implemented

**Deliverables:**
1. Submit Facebook App Review (Week 2)
2. Instagram Reels publishing (`instagram-publish` edge function)
3. Video processing polling (wait for Instagram to process)
4. Business account detection and validation
5. Error handling for common failures (token expired, personal account, etc.)
6. Update publishing UI to support Instagram

**Success Criteria:**
- App review approved within 2 weeks
- Instagram Reels publishing works end-to-end
- 95%+ success rate for Instagram publishes
- Video processing completes within 5 minutes

**Rollout:**
- Internal testing (Week 3)
- Beta users (Week 3-4): 50 users with Business accounts
- General availability (Week 4+): All users

---

### Phase 3: YouTube Shorts Direct Integration (Week 3-5)

**Goals:**
- ✅ Users can publish to YouTube Shorts via YouTube Data API v3
- ✅ Quota management prevents exceeding daily limits
- ✅ Auto-detection of Shorts (vertical + <60s)

**Deliverables:**
1. YouTube OAuth flow (`youtube-oauth` edge function)
2. YouTube Shorts publishing (`youtube-publish` edge function)
3. Resumable upload implementation (for large videos)
4. Daily quota tracking (max 6 uploads/day)
5. Queue system for quota exceeded scenarios
6. Update publishing UI to support YouTube

**Success Criteria:**
- YouTube publishing works end-to-end
- 95%+ success rate for YouTube publishes
- Quota limits enforced (no rate limit errors)
- Videos correctly detected as Shorts

**Rollout:**
- Internal testing (Week 4)
- Beta users (Week 4-5): 100 users
- General availability (Week 5+): All users

---

### Phase 4: Scheduled Publishing & Optimization (Week 6-8)

**Goals:**
- ✅ Users can schedule videos to publish at future times
- ✅ Platform-specific caption/hashtag optimization
- ✅ Background job processes scheduled posts

**Deliverables:**
1. Scheduling UI (date/time picker per platform)
2. Publishing queue table and cron job
3. Background job runner (checks every 5 minutes)
4. AI-powered caption optimization (platform-specific tone)
5. Hashtag suggestions based on video content
6. Email notifications for scheduled publishes

**Success Criteria:**
- Scheduled posts publish within 5 minutes of scheduled time
- 99%+ on-time publish rate
- Users can schedule up to 30 days in advance
- AI-generated captions match platform tone

**Rollout:**
- Internal testing (Week 6)
- Beta users (Week 7): 200 users
- General availability (Week 8+): All users

---

### Phase 5: Analytics Dashboard (Week 9-10)

**Goals:**
- ✅ Users can track video performance across platforms
- ✅ Aggregate metrics and platform comparisons

**Deliverables:**
1. Analytics dashboard UI
2. Platform API integrations to fetch metrics (views, likes, comments)
3. Background job to update metrics daily
4. Comparison charts (platform vs platform)
5. Export to CSV functionality
6. Performance insights and recommendations

**Success Criteria:**
- Metrics update every 24 hours
- Dashboard loads in <2 seconds
- Users can compare 2+ platforms side-by-side
- Export works for 1000+ videos

**Rollout:**
- Internal testing (Week 9)
- General availability (Week 10+): All users

---

## Dependencies

### External Dependencies

**Blotato API**
- **Type:** Third-party service (TikTok publishing proxy)
- **Status:** Production-ready
- **Cost:** $29/month per account
- **Risk:** Vendor dependency, service downtime, price changes
- **Mitigation:** Monitor uptime, have direct TikTok integration as backup plan

**Meta Graph API (Instagram/Facebook)**
- **Type:** Official platform API
- **Status:** Stable (v18.0+)
- **Cost:** Free
- **Risk:** App review delays, API changes, rate limits
- **Mitigation:** Submit app review early, monitor API versioning, implement rate limit handling

**YouTube Data API v3**
- **Type:** Official platform API
- **Status:** Stable
- **Cost:** Free (quota-limited to ~6 uploads/day)
- **Risk:** Quota limits restrict scaling, API changes
- **Mitigation:** Implement quota tracking, queue system for exceeded limits, consider paid quota increase

**Supabase Storage**
- **Type:** CDN and storage service
- **Status:** Production-ready
- **Cost:** $0.021/GB storage + $0.09/GB bandwidth
- **Risk:** Storage costs grow with video volume
- **Mitigation:** Auto-delete videos after 7 days, monitor storage usage

### Internal Dependencies

**AI Video Generation System**
- **Status:** Fully implemented (Google Gemini Veo 3)
- **Location:** `/backend/routes/ai_video.py`, `/supabase/migrations/ai_video_system.sql`
- **Dependency:** Publishing requires generated videos to exist
- **Risk:** If video generation fails, nothing to publish
- **Mitigation:** Video generation is already stable; no action needed

**OAuth System**
- **Status:** Partially implemented (Buffer/Hootsuite OAuth exists)
- **Location:** `/supabase/functions/social-oauth-*/`
- **Dependency:** Need to extend OAuth for TikTok, Instagram, YouTube
- **Risk:** OAuth token management bugs could block publishing
- **Mitigation:** Reuse existing OAuth infrastructure, comprehensive testing

**Database (Supabase)**
- **Status:** Production-ready
- **Dependency:** Need new tables (`published_videos`, `publishing_queue`, `publishing_analytics`)
- **Risk:** Schema changes could break existing features
- **Mitigation:** Use migrations, test in staging first

**User Secrets/API Keys**
- **Status:** Implemented (`user_secrets` table)
- **Dependency:** Need to store platform OAuth tokens securely
- **Risk:** Token encryption weakness could expose user accounts
- **Mitigation:** Upgrade to AES-256 encryption (currently base64), security audit

### Team Dependencies

**Design Team**
- **Deliverables:** Publishing UI mockups, platform selector design, error state designs
- **Timeline:** Week 0 (before development starts)
- **Status:** Ready

**Backend Team**
- **Deliverables:** Edge functions, OAuth flows, database migrations
- **Timeline:** Week 1-5
- **Status:** Assigned (3 engineers)

**Frontend Team**
- **Deliverables:** Publishing UI, platform connection UI, analytics dashboard
- **Timeline:** Week 1-5
- **Status:** Assigned (2 engineers)

**QA Team**
- **Deliverables:** Test plan, manual testing, automated tests
- **Timeline:** Week 4-5 (after Phase 3)
- **Status:** Assigned (1 QA engineer)

**Marketing Team**
- **Deliverables:** Launch announcement, user onboarding guide, help docs
- **Timeline:** Week 4 (pre-launch)
- **Status:** In progress

---

## Risk Assessment & Mitigation

### High-Risk Areas

**Risk 1: TikTok App Review Rejection**
- **Probability:** Medium (30%)
- **Impact:** High (blocks direct TikTok integration)
- **Mitigation:**
  - ✅ Use Blotato as primary TikTok integration (bypasses review)
  - ✅ Only pursue direct TikTok if Blotato becomes too expensive at scale
  - ✅ Have demo app ready for TikTok review if needed
- **Contingency:** Continue using Blotato indefinitely if direct integration blocked

**Risk 2: Meta App Review Delays**
- **Probability:** Medium (40%)
- **Impact:** Medium (delays Instagram launch by 1-2 weeks)
- **Mitigation:**
  - ✅ Submit app review in Week 2 (parallel with development)
  - ✅ Provide detailed use case documentation
  - ✅ Have demo video ready showing integration
- **Contingency:** Launch TikTok and YouTube first, add Instagram when approved

**Risk 3: YouTube Quota Limits Restrict Scaling**
- **Probability:** High (60%)
- **Impact:** Medium (limits to 6 uploads/day per user)
- **Mitigation:**
  - ✅ Implement queue system for quota exceeded scenarios
  - ✅ Notify users of quota limits upfront
  - ✅ Consider paid quota increase ($0.50/1000 units) for power users
- **Contingency:** Upgrade to paid quota if user demand exceeds free tier

**Risk 4: OAuth Token Management Bugs**
- **Probability:** Low (20%)
- **Impact:** High (users can't publish, data security risk)
- **Mitigation:**
  - ✅ Reuse existing OAuth infrastructure (proven in production)
  - ✅ Comprehensive token refresh testing
  - ✅ Monitor token expiration and auto-refresh
  - ✅ Security audit of token encryption
- **Contingency:** Rollback feature, fix bugs, re-deploy

**Risk 5: Platform API Changes Break Integration**
- **Probability:** Low (15%)
- **Impact:** High (publishing stops working)
- **Mitigation:**
  - ✅ Monitor platform API versioning and deprecation notices
  - ✅ Use latest stable API versions (Graph API v18.0+, YouTube Data API v3)
  - ✅ Implement graceful degradation for API failures
- **Contingency:** Emergency hotfix, notify users, provide manual upload fallback

**Risk 6: Blotato Service Downtime**
- **Probability:** Low (10%)
- **Impact:** Medium (TikTok publishing unavailable)
- **Mitigation:**
  - ✅ Monitor Blotato uptime with health checks
  - ✅ Implement retry logic with exponential backoff
  - ✅ Notify users of service status
- **Contingency:** Switch to direct TikTok API if Blotato has prolonged outage

**Risk 7: Storage Costs Exceed Budget**
- **Probability:** Medium (35%)
- **Impact:** Low (costs increase but manageable)
- **Mitigation:**
  - ✅ Auto-delete videos after 7 days
  - ✅ Monitor storage usage and set up alerts at 80GB
  - ✅ Compress videos before storage (reduce file size)
- **Contingency:** Reduce retention period to 3 days, or charge users for extended storage

**Risk 8: Publishing Success Rate Below Target**
- **Probability:** Medium (30%)
- **Impact:** Medium (user frustration, low adoption)
- **Mitigation:**
  - ✅ Implement robust error handling and retry logic
  - ✅ Monitor success rates per platform in real-time
  - ✅ Auto-retry failed publishes up to 3 times
  - ✅ Provide clear error messages to users
- **Contingency:** Investigate failures, optimize retry logic, manual intervention for critical issues

---

## Timeline & Milestones

### Development Timeline (5 Weeks)

**Week 1-2: Phase 1 - TikTok via Blotato**
- Day 1-2: Blotato API integration, video hosting setup
- Day 3-4: Platform connection UI, database schema
- Day 5-7: Publishing UI, error handling, testing
- Day 8-10: Beta testing with 20 users, bug fixes
- Milestone: ✅ TikTok publishing works end-to-end

**Week 2-4: Phase 2 - Instagram Reels**
- Day 1-3: Submit Facebook App Review, Instagram Reels edge function
- Day 4-7: Video processing polling, error handling
- Day 8-14: Wait for app review approval (1-2 weeks)
- Day 15-17: Beta testing with 50 users, bug fixes
- Milestone: ✅ Instagram Reels publishing works end-to-end

**Week 3-5: Phase 3 - YouTube Shorts**
- Day 1-3: YouTube OAuth flow, resumable upload
- Day 4-6: Quota tracking, queue system
- Day 7-9: Testing, optimization
- Day 10-14: Beta testing with 100 users, bug fixes
- Milestone: ✅ YouTube Shorts publishing works end-to-end

**Week 5: Pre-Launch**
- Day 1-2: Final QA, load testing
- Day 3-4: Marketing materials, help docs
- Day 5: Launch announcement, enable for all users
- Milestone: ✅ General availability for all 3 platforms

**Week 6-8: Phase 4 - Scheduled Publishing** (Optional)
- Week 6: Scheduling UI, queue system
- Week 7: AI caption optimization, testing
- Week 8: Beta, general availability
- Milestone: ✅ Scheduled publishing live

**Week 9-10: Phase 5 - Analytics Dashboard** (Optional)
- Week 9: Analytics API integrations, dashboard UI
- Week 10: Testing, general availability
- Milestone: ✅ Analytics dashboard live

### Key Milestones

| Milestone | Date | Owner | Status |
|-----------|------|-------|--------|
| Blotato API integration complete | Week 1, Day 3 | Backend Team | Not Started |
| TikTok publishing live (beta) | Week 1, Day 10 | Full Team | Not Started |
| Facebook App Review submitted | Week 2, Day 1 | Product Team | Not Started |
| Instagram Reels live (beta) | Week 3, Day 17 | Full Team | Not Started |
| YouTube Shorts live (beta) | Week 4, Day 14 | Full Team | Not Started |
| General availability (all platforms) | Week 5, Day 5 | Full Team | Not Started |
| Scheduled publishing live | Week 8 | Full Team | Not Started |
| Analytics dashboard live | Week 10 | Full Team | Not Started |

---

## Open Questions

**Q1: Should we support Facebook Reels in Phase 1-3, or defer to future?**
- **Current Decision:** Defer to future (P2 priority)
- **Rationale:** Instagram Reels can cross-post to Facebook; low user demand for Facebook-only Reels
- **Owner:** Product Team

**Q2: How should we handle users who exceed YouTube's 6 uploads/day quota?**
- **Options:**
  - A) Queue videos for next day (current plan)
  - B) Offer paid quota upgrade ($0.50/1000 units)
  - C) Notify user and let them decide
- **Current Decision:** Option A (queue for next day)
- **Owner:** Product Team

**Q3: Should AI-generated captions be mandatory or optional?**
- **Options:**
  - A) Mandatory (auto-generate, user can edit)
  - B) Optional (user can opt in)
- **Current Decision:** Optional for MVP, mandatory in Phase 4
- **Owner:** Product Team

**Q4: How long should we retain published videos in Supabase Storage?**
- **Options:**
  - A) 7 days (current plan, cost-optimized)
  - B) 30 days (better for analytics, higher cost)
  - C) Let user choose (complexity)
- **Current Decision:** 7 days for MVP
- **Owner:** Product Team

**Q5: Should we notify users before OAuth tokens expire?**
- **Options:**
  - A) Yes, email notification 7 days before expiration (current plan)
  - B) Yes, in-app notification
  - C) Auto-refresh silently, only notify on failure
- **Current Decision:** Option A (email 7 days before)
- **Owner:** Product Team

**Q6: What should be the retry strategy for failed publishes?**
- **Current Decision:** Retry 3 times with exponential backoff (1 min, 5 min, 15 min)
- **Owner:** Backend Team

**Q7: Should we support custom video thumbnails in MVP?**
- **Current Decision:** No (P2 priority, defer to Phase 4+)
- **Rationale:** Low user demand, complexity, focus on core publishing first
- **Owner:** Product Team

**Q8: How should we handle platform-specific format requirements (e.g., aspect ratio mismatches)?**
- **Options:**
  - A) Auto-crop/resize videos to fit platform specs
  - B) Show error and ask user to regenerate with correct format
  - C) Support both (auto-crop with override option)
- **Current Decision:** Option B for MVP (enforce correct format at generation)
- **Owner:** Product Team

---

## Appendix

### A. Platform API Documentation

- **Blotato API:** https://docs.blotato.com/api
- **Meta Graph API (Instagram):** https://developers.facebook.com/docs/instagram-api/guides/reels-publishing
- **YouTube Data API v3:** https://developers.google.com/youtube/v3/docs/videos/insert
- **TikTok Open API:** https://developers.tiktok.com/doc/content-posting-api-get-started

### B. Competitor Analysis

| Competitor | TikTok | Instagram Reels | YouTube Shorts | Pricing |
|------------|--------|----------------|----------------|---------|
| Latte Social | ✅ | ✅ | ❌ | $29/mo |
| OpusClip | ✅ | ❌ | ✅ | $99/mo |
| Vidyo.ai | ✅ | ✅ | ✅ | $49/mo |
| Kapwing | ✅ | ✅ | ✅ | $24/mo |
| **Action Insight (Us)** | ✅ | ✅ | ✅ | $29/mo (Blotato) + Free |

### C. User Research Insights

**Pain Points Identified (User Interviews, N=30):**
1. "Manual upload to each platform takes 15+ minutes" (87% of users)
2. "I forget optimal posting times for each platform" (73%)
3. "Remembering platform-specific best practices is hard" (67%)
4. "I can't track performance across platforms in one place" (80%)
5. "I wish I could schedule videos in advance" (93%)

**Feature Requests (By Frequency):**
1. Cross-platform publishing (93%)
2. Scheduled publishing (87%)
3. Platform-specific optimization (73%)
4. Analytics dashboard (80%)
5. Custom thumbnails (47%)
6. A/B testing (33%)

### D. Cost Analysis

**Development Costs:**
- Engineering time: 3 engineers × 5 weeks = 15 engineer-weeks
- Estimated cost: $75,000 (assuming $5,000/engineer-week)

**Recurring Costs (Annual):**
- Blotato API: $29/mo × 12 = $348/year
- Supabase Storage (100GB): ~$252/year ($0.021/GB × 100GB × 12)
- Meta Graph API: Free
- YouTube Data API: Free (under quota)
- **Total Annual Recurring:** ~$600/year

**Break-Even Analysis:**
- If feature drives 10 premium upgrades/month at $50/mo: $500/mo = $6,000/year
- Break-even: After Month 1 (recurring costs covered 10x over)

---

## Approval & Sign-Off

**Product Manager:** ________________ Date: ________

**Engineering Lead:** ________________ Date: ________

**Design Lead:** ________________ Date: ________

**QA Lead:** ________________ Date: ________

**Stakeholder (CEO/CTO):** ________________ Date: ________

---

**Document Status:** ✅ Ready for Review
**Next Steps:** Schedule review meeting, gather feedback, finalize scope, kick off Phase 1 development
