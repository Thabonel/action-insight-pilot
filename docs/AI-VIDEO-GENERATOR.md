# AI Video Generator - Complete Documentation

## Overview

The AI Video Generator is a powerful feature that allows users to create professional marketing videos using **Google's Veo 3** (video generation) and **Nano Banana** (image generation) AI models. The system supports both **manual creation** for advanced users and **automated generation** through the Marketing Autopilot.

---

## 🎯 Key Features

### 1. **Manual Video Studio** (`/app/studio/ai-video`)
- 3-panel interface for full creative control
- AI-powered scene planning with Gemini
- Custom brand kit support (colors, logo, fonts)
- Platform-specific optimizations (YouTube Shorts, TikTok, Reels, Landscape)
- Real-time generation status tracking

### 2. **Autopilot Integration**
- Automatic video ad generation for low-engagement campaigns
- Zero user intervention required
- Budget-aware generation (won't exceed campaign budgets)
- Rate limiting (max 5 videos per campaign per week)
- Activity logging for transparency

### 3. **Cost Management**
- User-provided Gemini API keys (no platform markup)
- Cost tracking per video project
- Estimated costs shown before generation
- Budget guardrails in autopilot mode

---

## 🚀 Getting Started

### Step 1: Add Your Gemini API Key

1. Go to **Settings** → **Integrations**
2. Find "Google Gemini API Key" under AI Services
3. Get your API key from https://aistudio.google.com/apikey
4. Paste and save

**✅ You're now ready to generate AI videos!**

---

## 📖 Usage Guide

### Manual Video Creation (Advanced Users)

#### **Panel 1: Prompt & Brand**

1. Enter your video goal
   Example: `"Promote Unimog recovery tips for off-road enthusiasts"`

2. Select platform:
   - **YouTube Shorts** (9:16 vertical)
   - **TikTok** (9:16 vertical)
   - **Instagram Reels** (9:16 vertical)
   - **Landscape** (16:9 horizontal)

3. Set duration (8-120 seconds)
   *Note: Veo 3 works best with 8-second clips*

4. Configure brand kit:
   - Primary color
   - Secondary color
   - Logo URL (optional)

5. Click **"Generate Video Plan"**

#### **Panel 2: Scene Board**

1. Review AI-generated scene breakdown
2. Edit scenes as needed:
   - Visual description
   - Text overlay
   - Duration per scene

3. (Optional) Click **"Generate Images"** to create custom b-roll with Nano Banana
   *Cost: $0.039 per image*

4. Continue to video generation

#### **Panel 3: Preview & Export**

1. Click **"Generate Video with Veo 3"**
2. Wait 2-6 minutes for generation
3. Preview the video
4. Download or regenerate

**Cost Example:**
- 8-second video with Veo 3 Fast: **$3.20**
- 8-second video with Veo 3 Standard: **$6.00**

---

### Autopilot Video Generation (Zero-Touch)

**How It Works:**

1. Enable Marketing Autopilot in Setup
2. Add Gemini API key in Settings
3. AI automatically generates video ads when:
   - Campaign engagement drops below 2%
   - Campaign budget allows (≥$3.20 remaining)
   - Campaign type is video-friendly (LinkedIn, Facebook, TikTok, etc.)
   - Less than 5 videos generated this week

4. Check Activity Feed to see generated videos
5. Videos are automatically linked to campaigns

**Example Activity Feed Entry:**
```
🎬 Auto-generating video ad for LinkedIn Ads - Autopilot
   To boost engagement
   Cost: $3.20
   5 hours ago
```

---

## 💰 Pricing & Costs

### Video Generation (Veo 3)

| Model | Cost/Second | 8-Second Video | 60-Second Video |
|-------|-------------|----------------|-----------------|
| **Veo 3 Fast** | $0.40 | $3.20 | $24.00 |
| **Veo 3 Standard** | $0.75 | $6.00 | $45.00 |

### Image Generation (Nano Banana)

| Service | Cost/Image | Example (3 images) |
|---------|------------|--------------------|
| **Nano Banana** | $0.039 | $0.12 |

### Monthly Cost Examples

**Scenario 1: Manual User (10 videos/month)**
- 10 × 8-second videos @ Veo 3 Fast = **$32/month**

**Scenario 2: Autopilot User (3 campaigns, 15 videos/month)**
- 15 × 8-second videos @ Veo 3 Fast = **$48/month**

**Scenario 3: Heavy User (50 videos/month)**
- 50 × 8-second videos @ Veo 3 Fast = **$160/month**

> 💡 **Tip:** You only pay Google directly through your API key. No platform markup!

---

## 🛠️ Technical Architecture

### Backend (FastAPI)

**Routes** (`backend/routes/ai_video.py`):

```python
POST /ai-video/plan                   # Generate scene plan with Gemini
POST /ai-video/generate-images        # Create images with Nano Banana
POST /ai-video/generate-video         # Generate video with Veo 3
GET  /ai-video/status/{project_id}    # Poll generation status
POST /ai-video/save                   # Save project
POST /ai-video/autopilot-generate     # Autopilot generation endpoint
GET  /ai-video/projects               # List user projects
DELETE /ai-video/projects/{id}        # Delete project
```

### Frontend (React + TypeScript)

**Pages:**
- `src/pages/AIVideoStudio.tsx` - Manual creation interface

**Components:**
- 3-panel tabbed interface (Prompt, Scenes, Preview)
- Real-time status polling
- Brand kit configurator
- Scene editor with drag-to-reorder

### Database (Supabase)

**Tables:**

```sql
ai_video_projects        # Video project metadata
├─ user_id              # Owner
├─ campaign_id          # Linked campaign (for autopilot)
├─ goal                 # Video goal/description
├─ platform             # Target platform
├─ scene_plan           # JSONB scene breakdown
├─ video_url            # Final video URL
├─ status               # draft | planning | generating_video | completed
├─ cost_usd             # Actual cost
└─ auto_generated       # Is this from autopilot?

ai_video_jobs           # Background job tracking
├─ project_id
├─ veo_operation_id
└─ status

user_api_keys           # Extended with gemini_api_key_encrypted
```

### Autopilot Integration

**File:** `supabase/functions/autopilot-orchestrator/index.ts`

**Logic:**
```typescript
Daily at 2 AM UTC:
1. For each active campaign:
   - Calculate avg_engagement from last 7 days
   - IF avg_engagement < 2.0%:
     - Check if video-friendly channel (LinkedIn, Facebook, etc.)
     - Check if user has Gemini API key
     - Check if budget allows ($3.20 minimum)
     - Check if under rate limit (5 videos/week)
     - IF all checks pass:
       - Call /ai-video/autopilot-generate
       - Log activity to autopilot_activity_log
```

---

## 📊 Monitoring & Analytics

### Video Stats View

```sql
SELECT * FROM ai_video_stats;
-- Returns per-user metrics:
-- total_videos, autopilot_videos, manual_videos
-- completed_videos, failed_videos
-- total_cost_usd, avg_cost_per_video
```

### Activity Logging

All autopilot video generation is logged:

```sql
SELECT * FROM autopilot_activity_log
WHERE activity_type = 'video_generation'
ORDER BY created_at DESC;
```

### Project Status Tracking

```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(cost_usd) as total_cost
FROM ai_video_projects
WHERE user_id = 'user-id'
GROUP BY status;
```

---

## 🚨 Limitations & Constraints

### Veo 3 Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| **8-second max** | Can't generate 30-120s videos natively | Chain multiple 8s clips |
| **2-day storage** | Videos deleted after 48h | Auto-download to Supabase |
| **6min generation time** | Slow user experience | Background jobs + polling |
| **SynthID watermark** | All videos watermarked | Accept or pay for enterprise |
| **Regional restrictions** | Person generation limited in some regions | Use objects/scenes instead |

### Rate Limits

- **Autopilot:** Max 5 videos per campaign per week
- **Budget:** Won't generate if campaign budget < $3.20
- **API:** Subject to Google Gemini API rate limits

---

## 🔧 Configuration

### Environment Variables (Backend)

```bash
# No changes needed! Uses user-provided Gemini API keys
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
BACKEND_URL=https://your-backend.onrender.com  # For autopilot callbacks
```

### Frontend Environment

```bash
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=your_supabase_url
```

---

## 🐛 Troubleshooting

### "Please add your Gemini API key in Settings"

**Problem:** User hasn't added their Gemini API key

**Solution:**
1. Go to Settings → Integrations
2. Find "Google Gemini API Key"
3. Get key from https://aistudio.google.com/apikey
4. Save

### Video generation stuck at "Generating..."

**Problem:** Veo 3 job taking longer than expected

**Solution:**
- Wait up to 6 minutes
- Check browser console for errors
- Verify Gemini API key is valid
- Check project status: `SELECT * FROM ai_video_projects WHERE id = 'project-id'`

### Autopilot not generating videos

**Possible Causes:**

1. **No Gemini API key** → Add in Settings
2. **Engagement above threshold** → Only triggers when < 2%
3. **Not video-friendly channel** → Only works for social media campaigns
4. **Rate limit reached** → Max 5 videos/week per campaign
5. **Insufficient budget** → Needs ≥$3.20 remaining

**Debug:**
```sql
-- Check autopilot activity log
SELECT * FROM autopilot_activity_log
WHERE user_id = 'user-id'
ORDER BY created_at DESC
LIMIT 20;
```

### Video generation fails

**Problem:** Backend returns error

**Common Causes:**
- Invalid Gemini API key
- API quota exceeded
- Prompt violates content policy
- Network timeout

**Solution:**
```sql
-- Check error message
SELECT error_message FROM ai_video_projects
WHERE id = 'project-id';
```

---

## 🎓 Best Practices

### 1. **Write Specific Prompts**

❌ **Bad:** "Make a video about cars"

✅ **Good:** "Create a 8-second YouTube Short showcasing a Mercedes Unimog recovering a stuck vehicle in muddy off-road terrain. Show dramatic rescue, professional winch technique, and successful drive-away. Target off-road enthusiasts."

### 2. **Optimize for Platform**

- **YouTube Shorts / TikTok / Reels:** Use 9:16 vertical format
- **LinkedIn / Facebook:** Can use vertical or landscape
- **Blog / Website:** Use 16:9 landscape

### 3. **Keep Videos Short**

- Veo 3 optimized for **8-second clips**
- For longer videos, generate multiple 8s clips and chain them
- Higher quality with shorter duration

### 4. **Brand Consistency**

- Always fill in brand kit (colors, logo)
- Use same brand kit across all videos
- Store brand kit in autopilot config for automatic use

### 5. **Monitor Costs**

```sql
-- Check monthly spend
SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(cost_usd) as total_spent,
  COUNT(*) as video_count
FROM ai_video_projects
WHERE user_id = 'user-id'
  AND status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

---

## 📈 Roadmap

### Planned Features

- [ ] **Email notifications** when videos complete
- [ ] **Video templates** for common use cases
- [ ] **A/B testing** - generate multiple variants
- [ ] **Multi-clip stitching** - combine 8s clips into longer videos
- [ ] **Voice-over support** - add narration with Google TTS
- [ ] **Music integration** - add royalty-free background music
- [ ] **Direct publishing** - post to YouTube/TikTok automatically
- [ ] **Video analytics** - track views, engagement, conversions

---

## 🤝 Support

### Getting Help

1. **Documentation:** Read this file and [CONVERSATION.md](./CONVERSATION.md)
2. **Activity Feed:** Check autopilot activity log for errors
3. **Database Logs:** Query `ai_video_projects` for error messages
4. **Backend Logs:** Check FastAPI logs on Render

### Common Questions

**Q: Do I need to pay Anthropic for video generation?**
A: No! You use your own Gemini API key and pay Google directly.

**Q: Can I generate videos without autopilot?**
A: Yes! Use the manual Studio at `/app/studio/ai-video`

**Q: How long does generation take?**
A: 2-6 minutes for Veo 3. Veo 3 Fast is typically 2-3 minutes.

**Q: Can I generate videos longer than 8 seconds?**
A: Yes, but you'll need to generate multiple 8s clips. Full multi-clip support coming soon.

**Q: Are videos watermarked?**
A: Yes, all Veo 3 videos include Google's SynthID watermark.

---

## 📄 License

This feature is part of the Action Insight Marketing Platform and follows the same license terms.

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Status:** Production Ready ✅
