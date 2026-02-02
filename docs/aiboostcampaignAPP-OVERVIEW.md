# Action Insight Marketing Platform - Complete Overview

**Version**: 1.0.0
**Last Updated**: January 28, 2026
**Status**: Production-Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Core Value Proposition](#core-value-proposition)
4. [User Personas](#user-personas)
5. [Complete Feature Breakdown](#complete-feature-breakdown)
6. [Technical Architecture](#technical-architecture)
7. [AI Intelligence Layer](#ai-intelligence-layer)
8. [User Workflows](#user-workflows)
9. [Module Architecture](#module-architecture)
10. [Data Model](#data-model)
11. [Security & Privacy](#security--privacy)
12. [Deployment Architecture](#deployment-architecture)
13. [Performance Metrics](#performance-metrics)
14. [Product Roadmap](#product-roadmap)

---

## Executive Summary

**Action Insight** is an AI-powered marketing automation platform that democratizes sophisticated marketing capabilities for businesses of all sizes. By combining cutting-edge AI (Claude Opus 4.5, Gemini 3), intelligent automation, and user-friendly interfaces, the platform enables marketing teams to plan, create, execute, and optimize campaigns with unprecedented efficiency.

### Key Statistics

- **AI Models**: 3 flagship models (Claude Opus 4.5, Gemini 3 Flash, Mistral Large)
- **Automation Capabilities**: 10+ strategic marketing agents
- **Integrations**: 15+ platform connections (social media, email, analytics)
- **User Modes**: Simple (2 nav items) and Advanced (14+ nav items)
- **Campaign Types**: Social, Email, Paid Ads, Organic, Video, Multi-channel
- **Video Generation**: AI-powered video creation with Google Veo 3

### Quick Facts

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: FastAPI (Python) + Supabase (PostgreSQL)
- **Deployment**: Vercel/Netlify (Frontend), Render (Backend), Supabase (Database)
- **Performance**: <1.5s load times, 60fps animations, <200ms API responses
- **Accessibility**: WCAG 2.1 AA compliant

---

## Product Vision

### Mission Statement

*"To empower every business with enterprise-grade marketing intelligence, making sophisticated campaign planning, creation, and optimization accessible to teams of any size."*

### Core Philosophy

1. **AI-First, Human-Centered**: AI handles repetitive tasks; humans make strategic decisions
2. **Autopilot with Oversight**: Automated execution with transparent activity logging
3. **User-Owned AI Keys**: No platform markup on AI costs; users bring their own API keys
4. **Progressive Disclosure**: Simple mode for beginners, advanced mode for power users
5. **Evidence-Based Marketing**: Data-driven decisions with real-time analytics

---

## Core Value Proposition

### For Small Business Owners

- **Simple Mode**: 2-click access to essential marketing tools (campaigns, content)
- **Conversational Campaign Creation**: AI-guided campaign setup through natural dialogue
- **Quick Post**: One-click content publishing across all connected platforms
- **Autopilot Marketing**: Set business goals once; AI optimizes daily

### For Marketing Professionals

- **Advanced Mode**: Full suite of 14+ specialized tools
- **Strategic Marketing Prompts**: 10 frameworks for foundational strategy work
- **Multi-Channel Orchestration**: Unified campaign management across all channels
- **AI Video Studio**: Professional video generation with Remotion and AI
- **Performance Analytics**: Deep insights with predictive forecasting

### For Agencies

- **Knowledge Management**: Centralized brand assets and guidelines
- **Proposal Generator**: AI-powered proposal creation and templating
- **Client Collaboration**: Shareable assessment links and campaign previews
- **White-Label Ready**: Customizable branding and reporting

---

## User Personas

### 1. Sarah - Small Business Owner

**Profile**: Runs a local bakery, limited marketing experience
**Needs**: Easy content posting, basic analytics, affordable automation
**Mode**: Simple
**Key Features**: Quick Post, Conversational Campaigns, Autopilot

### 2. Marcus - Marketing Manager

**Profile**: Mid-sized B2B company, manages 3-person team
**Needs**: Strategic planning, multi-channel campaigns, team coordination
**Mode**: Advanced
**Key Features**: Campaign Management, Strategic Prompts, Analytics

### 3. Elena - Agency Account Manager

**Profile**: Handles 10+ client accounts, needs efficiency
**Needs**: Scalable workflows, client presentations, brand management
**Mode**: Advanced
**Key Features**: Knowledge Management, Proposals, Multi-user Access

### 4. David - Growth Hacker

**Profile**: SaaS startup, focused on rapid user acquisition
**Needs**: A/B testing, viral loops, conversion optimization
**Mode**: Advanced
**Key Features**: Performance Analytics, Competitive Intelligence, Autopilot

---

## Complete Feature Breakdown

### 1. Campaign Management

**Location**: `/app/campaigns`
**Purpose**: Central hub for all marketing campaigns

**Capabilities**:
- Create multi-channel campaigns (social, email, paid ads, organic)
- AI-powered campaign brief generation
- Budget tracking and allocation
- Performance monitoring across all channels
- Campaign templates and duplication
- A/B testing framework

**Key Components**:
- `CampaignCard.tsx` - Campaign list view
- `CampaignDetails.tsx` - Detailed campaign view with analytics
- `CampaignForm.tsx` - Campaign creation/editing form
- `CampaignPerformanceDashboard.tsx` - Real-time metrics

**Database Tables**: `campaigns`, `campaign_metrics`, `campaign_content`

---

### 2. Conversational Campaign Creation

**Location**: `/app/conversational-campaigns`
**Purpose**: AI-guided campaign setup through natural conversation

**Workflow**:
1. User describes business/campaign goals in natural language
2. AI asks clarifying questions about audience, budget, timeline
3. System generates complete campaign brief with targeting, messaging, channels
4. User reviews and approves; campaign auto-created in system

**AI Agent**: `conversational-campaign-agent` (Supabase Edge Function)
**Model**: Claude Opus 4.5 (flagship reasoning model)

**Database Tables**: `conversation_campaigns`, `conversation_messages`

**Example Conversation**:
```
User: "I want to promote my new coffee blend to millennials"
AI: "Great! Let me help you create a campaign. What's your budget range?"
User: "$2000 for the first month"
AI: "Perfect. Which platforms do your target customers use most?"
User: "Instagram and TikTok"
AI: "Excellent. Let me create a campaign strategy..."
```

---

### 3. Quick Post

**Location**: Omnipresent button in navigation (Advanced mode)
**Purpose**: One-click content publishing across all connected platforms

**Features**:
- Single composition window for multi-platform posting
- Platform-specific optimizations (character limits, hashtags, media formats)
- AI content suggestions and enhancements
- Schedule or publish immediately
- Preview for each platform before posting
- Golden Hour detection (optimal posting times)

**Platforms Supported**:
- Facebook, Instagram, Twitter/X, LinkedIn, TikTok
- YouTube Community Posts, Pinterest
- Blog platforms (WordPress, Medium)

**Backend**: `quick-post-publisher` Edge Function

---

### 4. Marketing Autopilot

**Location**: `/app/autopilot`
**Purpose**: Autonomous campaign optimization and content generation

**How It Works**:
1. User configures business description, goals, budget constraints
2. System analyzes campaign performance daily (2 AM UTC cron)
3. AI identifies underperforming campaigns
4. Automatically generates video ads for low-engagement campaigns (Veo 3)
5. Adjusts targeting, budgets, and messaging
6. Logs all actions to transparent activity feed

**AI Models Used**:
- Claude Opus 4.5 - Strategic decision-making
- Gemini 3 Flash - Visual content analysis
- Veo 3 - Video generation

**Database Tables**: `marketing_autopilot_config`, `autopilot_activity_log`, `autopilot_weekly_reports`

**Edge Functions**: `autopilot-orchestrator` (daily cron)

**Activity Feed**: Real-time log of all autopilot actions with justifications

---

### 5. AI Video Generation

**Location**: `/app/studio/ai-video` (manual), integrated into Autopilot (automatic)
**Purpose**: Professional video ad creation powered by Google AI

**Capabilities**:
- **Scene Planning**: Gemini 3 Flash analyzes campaign brief and generates 3-6 scene descriptions
- **Image Generation**: Nano Banana creates custom visuals for each scene
- **Video Rendering**: Veo 3 transforms scenes into video segments
- **Composition**: Automatic editing, transitions, and effects
- **Multi-Format**: 16:9 (YouTube), 9:16 (Stories/Reels), 1:1 (Feed posts)

**Workflow**:
1. Upload campaign brief or write custom prompt
2. AI generates scene-by-scene storyboard
3. Review and edit scenes
4. Generate video (2-3 minutes processing)
5. Download or publish directly to campaigns

**Cost Structure**:
- Veo 3 Fast: $0.40/second
- Veo 3 Standard: $0.75/second
- Nano Banana: $0.039/image

**Database Tables**: `ai_video_projects`, `ai_video_jobs`, `ai_video_scenes`

**Documentation**: `docs/AI-VIDEO-GENERATOR.md`

---

### 6. Remotion Video Studio

**Location**: `/app/studio/remotion`
**Purpose**: Code-based animated video creation with React

**Features**:
- React-based video composition
- Programmatic animations and effects
- Real-time preview with Remotion Player
- Export to MP4, WebM, GIF
- Template library for common video types
- Timeline editor with keyframe control

**Use Cases**:
- Explainer videos
- Product demos
- Animated social media posts
- Data visualization videos
- Logo animations

**Tech Stack**: Remotion 4.0, React 18, FFmpeg

**Templates Included**:
- Marketing announcement
- Product showcase
- Testimonial carousel
- Stats/metrics highlight
- Event promotion

---

### 7. Strategic Marketing Prompts

**Location**: `/app/prompts` or integrated into Campaign Creation
**Purpose**: 10 foundational marketing frameworks for strategic planning

**Core Prompts**:

1. **Brand Positioning (3Cs Analysis)** - `strategy-001`
   - Company, Customer, Competition analysis
   - Output: Positioning statement, differentiators, brand tone

2. **Customer Persona Builder** - `strategy-002`
   - 2-3 detailed buyer personas
   - Demographics, motivations, pain points, emotional triggers

3. **Message Crafting (3-Tier)** - `strategy-003`
   - Emotional hook, practical value, credibility proof
   - Platform-specific variations

4. **Offer & Funnel Design** - `strategy-004`
   - Awareness → Engagement → Conversion → Retention
   - Stage-appropriate offers with automation tasks

5. **30-Day Content Strategy** - `strategy-005`
   - Content calendar with themes and formats
   - Authenticity and storytelling focus

6. **Full Campaign Generator** - `strategy-006`
   - Headline, tagline, ad copy, CTA, landing page
   - Viral variant generation

7. **SEO & Keyword Framework** - `strategy-007`
   - Keywords grouped by buyer stage
   - 3 content titles per group

8. **Competitor Gap Analyzer** - `strategy-008`
   - Gaps in messaging, channels, audience, content
   - Ownable differentiator recommendation

9. **Performance Tracker Framework** - `strategy-009`
   - KPI framework for non-marketers
   - Automation suggestions

10. **Marketing Review & Pivot** - `strategy-010`
    - What's working / not working analysis
    - Quick win, experiment, long-term shift

**Implementation**: `src/lib/strategic-marketing-prompts.ts`

**Edge Functions**: `brand-positioning-agent`, `funnel-design-agent`, `competitor-gap-agent`, `performance-tracker-agent`

---

### 8. Content Studio

**Location**: `/app/content`
**Purpose**: AI-assisted content creation and management

**Features**:
- Multi-format content generation (blog posts, social posts, email copy)
- SEO optimization with keyword suggestions
- Content calendar with scheduling
- Brand voice consistency checking
- Content performance analytics
- Bulk content generation (10+ posts at once)

**AI Capabilities**:
- Blog post generation (up to 2000 words)
- Social media caption writing
- Email subject line testing
- Hashtag suggestions
- Content repurposing (blog → social, etc.)

**Database Tables**: `content_ideas`, `content_calendar`, `content_versions`

---

### 9. Email Marketing

**Location**: `/app/email`
**Purpose**: Professional email campaign creation and automation

**Features**:
- Drag-and-drop email builder
- Mobile-responsive templates
- A/B testing for subject lines and content
- Segmentation and personalization
- Automated drip campaigns
- Real-time metrics (open rate, click rate, conversions)

**Integrations**: Mailchimp, SendGrid, Mailgun, AWS SES

**Database Tables**: `email_campaigns`, `email_templates`, `email_metrics`

---

### 10. Social Media Management

**Location**: `/app/social`
**Purpose**: Multi-platform social media publishing and monitoring

**Capabilities**:
- Unified content calendar across platforms
- Platform-specific post optimizations
- Engagement tracking and response management
- Hashtag performance analytics
- Competitor monitoring
- Golden Hour scheduling (optimal posting times)

**Supported Platforms**:
- Facebook (posts, stories, reels)
- Instagram (feed, stories, reels)
- Twitter/X (tweets, threads)
- LinkedIn (posts, articles)
- TikTok (videos)
- YouTube (shorts, community posts)
- Pinterest (pins)

**Real-Time Features**:
- Mention monitoring
- Engagement alerts
- Comment sentiment analysis
- Competitor activity tracking

**Database Tables**: `social_posts`, `social_accounts`, `social_metrics`, `engagement_data`

---

### 11. Lead Management

**Location**: `/app/leads`
**Purpose**: Lead capture, scoring, and nurturing automation

**Features**:
- Customizable lead capture forms
- AI-powered lead scoring (0-100)
- Lead segmentation and tagging
- Automated nurture sequences
- Conversion tracking
- CRM integrations (Salesforce, HubSpot, Pipedrive)

**Lead Scoring Factors**:
- Engagement level (website visits, content downloads)
- Demographics (company size, industry, role)
- Behavioral signals (email opens, link clicks)
- Social media interactions
- Form submissions

**Database Tables**: `leads`, `lead_scores`, `lead_activities`, `lead_segments`

---

### 12. Analytics Dashboard

**Location**: `/app/analytics`
**Purpose**: Comprehensive performance tracking and insights

**Metrics Tracked**:
- Campaign ROI and ROAS
- Channel performance comparison
- Conversion funnels
- Engagement rates
- Audience demographics
- Traffic sources
- Revenue attribution

**Visualization Types**:
- Line charts (time-series trends)
- Pie charts (channel distribution)
- Bar charts (comparative analysis)
- Heatmaps (engagement patterns)
- Funnel diagrams (conversion paths)

**AI-Powered Insights**:
- Anomaly detection (unusual spikes/drops)
- Predictive forecasting (30/60/90 day projections)
- Optimization recommendations
- Competitor benchmarking

**Library**: Recharts 2.12 (React charting library)

---

### 13. Knowledge Management

**Location**: `/app/knowledge`
**Purpose**: Centralized brand asset and guideline repository

**Content Types**:
- Brand guidelines (voice, tone, visual identity)
- Logo and image assets
- Product documentation
- Competitive intelligence
- Market research
- Campaign templates

**Features**:
- Folder-based organization ("buckets")
- Full-text search across all documents
- Version control for documents
- AI-powered document summarization
- Collaborative editing
- Access control (public/private)

**Database Tables**: `knowledge_buckets`, `knowledge_documents`, `document_versions`

---

### 14. Proposals

**Location**: `/app/proposals`
**Purpose**: AI-assisted marketing proposal generation for clients

**Features**:
- Template library (agency, in-house, freelance)
- AI-powered proposal writing
- Budget calculators
- Timeline generation
- PDF export with branding
- Client-shareable links
- E-signature integration

**Proposal Sections**:
- Executive Summary
- Situation Analysis
- Strategy & Approach
- Deliverables & Timeline
- Budget Breakdown
- Terms & Conditions

**Database Tables**: `proposals`, `proposal_templates`, `proposal_sections`

---

### 15. Settings & Integrations

**Location**: `/app/settings`
**Purpose**: Platform configuration and third-party connections

**Settings Categories**:

1. **Profile**: User info, avatar, email preferences
2. **Integrations**: API key management for all platforms
3. **Team**: User management, roles, permissions (coming soon)
4. **Billing**: Subscription management (coming soon)
5. **Preferences**: UI mode (Simple/Advanced), theme, language
6. **Security**: 2FA, session management, API tokens

**API Key Management**:
- User provides own keys (no platform markup)
- Encrypted storage in `user_secrets` table
- Required keys:
  - **Anthropic Claude** (required)
  - **Google Gemini** (required for visual AI)
  - **Mistral** (optional fallback)
  - Social platform keys (Facebook, Twitter, etc.)
  - Email service keys (Mailchimp, SendGrid, etc.)

**Database Tables**: `user_secrets`, `user_preferences`, `integration_connections`

---

## Technical Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
**Build Tool**: Vite 5.4
**Styling**: Tailwind CSS 3.4 + Shadcn/ui components
**State Management**: React Context API + Tanstack Query
**Routing**: React Router 6
**Forms**: React Hook Form + Zod validation

**Key Patterns**:
- Component composition with Shadcn/ui primitives
- Custom hooks for shared logic (`useUserMode`, `useCampaigns`, etc.)
- Context providers for global state (Auth, Theme, UserMode)
- Lazy loading for code splitting
- Optimistic UI updates with Tanstack Query

**Performance Optimizations**:
- Manual chunking for optimal bundle splitting
- Dynamic imports for heavy libraries (PDF, charts)
- Image optimization with lazy loading
- Service worker for offline support (PWA)
- Memoization of expensive computations

**File Structure**:
```
src/
├── components/          # UI components organized by feature
│   ├── campaigns/       # Campaign-related components
│   ├── content/         # Content creation components
│   ├── dashboard/       # Dashboard widgets
│   ├── settings/        # Settings UI
│   └── ui/              # Shadcn/ui base components
├── contexts/            # React contexts (Auth, Theme, etc.)
├── hooks/               # Custom hooks
├── lib/                 # Utilities and services
│   ├── api-client.ts    # Backend API wrapper
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
├── pages/               # Route components
└── types/               # TypeScript definitions
```

---

### Backend Architecture

**Framework**: FastAPI (Python 3.11)
**Database**: PostgreSQL via Supabase
**Real-Time**: Supabase Realtime (WebSocket)
**Serverless**: Supabase Edge Functions (Deno)
**File Storage**: Supabase Storage

**Backend Services**:

1. **FastAPI Backend** (`backend/`)
   - Custom business logic
   - AI agent orchestration
   - Complex data processing
   - External API integrations
   - Deployed on Render

2. **Supabase Edge Functions** (`supabase/functions/`)
   - Lightweight serverless endpoints
   - Real-time data processing
   - Cron jobs (autopilot, model updates)
   - Deployed on Supabase infrastructure

**File Structure**:
```
backend/
├── agents/              # AI agent implementations
│   ├── campaign_agent.py
│   ├── content_agent.py
│   └── analytics_agent.py
├── routes/              # API route handlers
│   ├── campaigns.py
│   ├── content.py
│   ├── ai_video.py
│   └── analytics.py
├── services/            # Business logic services
│   ├── ai_model_service.py
│   ├── secrets_service.py
│   └── analytics_service.py
├── database.py          # Supabase connection
├── auth.py              # Auth middleware
└── main.py              # FastAPI app entry
```

---

### Database Schema

**Database**: PostgreSQL 15 (Supabase)
**ORM**: Supabase SDK (TypeScript), Direct SQL (Python)

**Core Tables**:

1. **users** (managed by Supabase Auth)
   - `id` (UUID, PK)
   - `email`, `created_at`, `updated_at`

2. **user_preferences**
   - `user_id` (UUID, FK → users.id)
   - `preference_category` (TEXT) - 'general', 'ai_behavior', 'workspace'
   - `preference_data` (JSONB)
   - `interface_mode` (TEXT) - 'simple' or 'advanced'
   - UNIQUE constraint on (user_id, preference_category)

3. **user_secrets**
   - `user_id` (UUID, FK → users.id)
   - `service_name` (TEXT) - 'anthropic_api_key', 'gemini_api_key_encrypted', etc.
   - `encrypted_value` (TEXT)
   - `created_at`, `updated_at`

4. **campaigns**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users.id)
   - `name` (TEXT)
   - `type` (TEXT) - 'social', 'email', 'paid_ads', 'organic', 'video'
   - `status` (TEXT) - 'draft', 'active', 'paused', 'completed'
   - `budget` (NUMERIC)
   - `start_date`, `end_date`
   - `created_at`, `updated_at`

5. **content_ideas**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users.id)
   - `title` (TEXT)
   - `content` (TEXT)
   - `platform` (TEXT)
   - `status` (TEXT)
   - `scheduled_for` (TIMESTAMP)

6. **ai_video_projects**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users.id)
   - `campaign_id` (UUID, FK → campaigns.id, nullable)
   - `title` (TEXT)
   - `prompt` (TEXT)
   - `status` (TEXT) - 'planning', 'generating', 'completed', 'failed'
   - `video_url` (TEXT)
   - `auto_generated` (BOOLEAN)
   - `cost` (NUMERIC)
   - `created_at`, `updated_at`

7. **marketing_autopilot_config**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users.id, UNIQUE)
   - `enabled` (BOOLEAN)
   - `business_description` (TEXT)
   - `target_audience` (TEXT)
   - `monthly_budget` (NUMERIC)
   - `optimization_goals` (JSONB)
   - `created_at`, `updated_at`

8. **autopilot_activity_log**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users.id)
   - `config_id` (UUID, FK → marketing_autopilot_config.id)
   - `activity_type` (TEXT) - 'optimization', 'video_generation', 'budget_adjustment'
   - `description` (TEXT)
   - `entity_type` (TEXT) - 'campaign', 'video', 'budget'
   - `entity_id` (UUID)
   - `created_at` (TIMESTAMP)

9. **conversation_campaigns**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users.id)
   - `campaign_id` (UUID, FK → campaigns.id, nullable)
   - `status` (TEXT) - 'active', 'completed', 'abandoned'
   - `summary` (TEXT)
   - `created_at`, `updated_at`

10. **conversation_messages**
    - `id` (UUID, PK)
    - `conversation_id` (UUID, FK → conversation_campaigns.id)
    - `role` (TEXT) - 'user' or 'assistant'
    - `content` (TEXT)
    - `created_at` (TIMESTAMP)

**Migrations**: Located in `supabase/migrations/`
**Documentation**: `docs/DATABASE.md`

---

## AI Intelligence Layer

### AI Model Management System

**Auto-Discovery**: Monthly cron job (`ai-model-updater`) fetches latest models from all providers
**Auto-Update**: System automatically switches to newest flagship models
**Admin UI**: `/app/admin` → AI Models tab for monitoring and manual triggers

**Documentation**: `docs/AI-MODEL-MANAGEMENT.md`

---

### Current AI Models (January 2026)

#### Anthropic Claude (Primary - Required)

**Latest Models**:
- `claude-opus-4.5` - Flagship model, industry-leading performance (Nov 24, 2025)
- `claude-sonnet-4.5` - Best coding model, fast and efficient (Sep 29, 2025)
- `claude-haiku-4.5` - Fast and cost-effective (Oct 15, 2025)

**Default Model**: `claude-opus-4.5` (auto-updated monthly)

**Pricing**: $5/million input tokens, $25/million output tokens

**Use Cases**:
- Primary AI for all content generation
- Campaign brief creation
- Strategic marketing analysis
- Blog post and email writing
- Conversational campaign creation
- Performance optimization recommendations

---

#### Google Gemini (Required for Visual AI)

**Latest Models**:
- `gemini-3-pro` - Flagship with advanced multimodal reasoning
- `gemini-3-flash` - 3x faster, recommended default (81.2% MMMU-Pro)
- `gemini-2.5-pro` - State-of-the-art (1M token context)
- `veo-3` / `veo-3-fast` - Video generation
- `nano-banana` - Image generation

**Default Model**: `gemini-3-flash` (auto-updated monthly)

**Use Cases**:
- AI video generation (Veo 3)
- Image creation (Nano Banana)
- Visual content analysis
- Scene planning for videos
- Image optimization suggestions

---

#### Mistral AI (Optional Fallback)

**Latest Models**:
- `mistral-large-latest` - Current flagship
- `mistral-medium-latest` - Balanced performance

**Default Model**: `mistral-large-latest` (auto-updated monthly)

**Use Case**: Third fallback option if Anthropic and Google fail

---

### AI Agent Architecture

**Pattern**: Each major feature has a dedicated AI agent (Edge Function or FastAPI route)

**Core Agents**:

1. **Campaign Assistant** (`ai-campaign-assistant`)
   - Generates campaign briefs from user goals
   - Model: Claude Opus 4.5

2. **Content Generator** (`content-generator`)
   - Creates blog posts, social posts, email copy
   - Model: Claude Opus 4.5

3. **Audience Insight Agent** (`audience-insight-agent`)
   - Builds customer personas
   - Model: Claude Opus 4.5

4. **Messaging Agent** (`messaging-agent`)
   - Crafts 3-tier messaging frameworks
   - Model: Claude Opus 4.5

5. **Conversational Campaign Agent** (`conversational-campaign-agent`)
   - Guides users through campaign creation via chat
   - Model: Claude Opus 4.5

6. **Brand Positioning Agent** (`brand-positioning-agent`)
   - Performs 3Cs analysis (Company, Customer, Competition)
   - Model: Claude Opus 4.5

7. **Funnel Design Agent** (`funnel-design-agent`)
   - Creates complete marketing funnels with automation
   - Model: Claude Opus 4.5

8. **Competitor Gap Agent** (`competitor-gap-agent`)
   - Identifies competitive advantages
   - Model: Claude Opus 4.5

9. **Performance Tracker Agent** (`performance-tracker-agent`)
   - Sets up KPI frameworks
   - Model: Claude Opus 4.5

10. **Video Generation Pipeline** (`ai-video-generator`)
    - Scene planning: Gemini 3 Flash
    - Image generation: Nano Banana
    - Video rendering: Veo 3

11. **Autopilot Orchestrator** (`autopilot-orchestrator`)
    - Daily campaign optimization
    - Models: Claude Opus 4.5 (decisions), Gemini 3 Flash (visual), Veo 3 (video)

**Model Fallback Chain**: Anthropic → Google → Mistral → Error

---

### API Key Management

**User-Owned Keys**: Users provide their own API keys (no platform markup)
**Encryption**: All keys stored encrypted in `user_secrets` table
**Required Keys**:
- Anthropic Claude API key (required)
- Google Gemini API key (required for visual features)
- Mistral API key (optional)

**Frontend Service**: `SecretsService` (`src/lib/services/secrets-service.ts`)
**Backend Service**: Direct query to `user_secrets` table

**Getting Keys**:
- Claude: https://console.anthropic.com
- Gemini: https://aistudio.google.com/apikey
- Mistral: https://console.mistral.ai

---

## User Workflows

### Workflow 1: First-Time User Onboarding

1. **Landing Page** → Sign up (email/password or OAuth)
2. **Welcome Survey** → Business type, industry, team size
3. **Mode Selection** → Choose Simple (default) or Advanced
4. **API Key Setup** → Add Claude API key (required)
5. **Quick Tour** → 5-step interactive tutorial
6. **First Campaign** → Conversational campaign creation OR Quick Post

**Time to First Value**: <5 minutes

---

### Workflow 2: Creating a Campaign (Simple Mode)

1. **Dashboard** → Click "New Campaign" button
2. **Conversational Interface** → Describe campaign goal in natural language
3. **AI Questions** → Answer 3-5 clarifying questions (audience, budget, timeline)
4. **Review Brief** → AI generates complete campaign brief
5. **Approve & Launch** → Campaign auto-created in system
6. **Monitor** → Dashboard shows performance metrics

**Steps**: 5 clicks + natural language input
**Time**: 3-5 minutes

---

### Workflow 3: Creating a Campaign (Advanced Mode)

1. **Campaigns Page** → Click "Create Campaign"
2. **Campaign Type** → Select social, email, paid ads, organic, or video
3. **Campaign Details** → Fill form (name, budget, dates, goals)
4. **Audience Targeting** → Define demographics, interests, behaviors
5. **Content Creation** → Write copy OR generate with AI
6. **Channel Selection** → Choose platforms (Facebook, Instagram, etc.)
7. **Review & Launch** → Preview and publish
8. **Monitor & Optimize** → Track performance and adjust

**Steps**: 7 form pages + content creation
**Time**: 10-20 minutes

---

### Workflow 4: Publishing with Quick Post

1. **Click Quick Post Button** (anywhere in app)
2. **Compose Message** → Write post content
3. **Select Platforms** → Check boxes for Facebook, Instagram, Twitter, etc.
4. **AI Enhancements** (optional) → Click "Enhance with AI" for suggestions
5. **Add Media** → Upload images/videos
6. **Schedule or Publish** → Choose immediate or scheduled
7. **Confirm** → Post goes live on all selected platforms

**Steps**: 4 clicks + text input
**Time**: 1-2 minutes

---

### Workflow 5: Generating AI Video

1. **Video Studio** → `/app/studio/ai-video`
2. **Upload Brief** → Provide campaign brief OR write custom prompt
3. **AI Scene Planning** → Gemini generates 3-6 scene descriptions
4. **Review Scenes** → Edit scene descriptions if needed
5. **Generate Video** → Click "Generate" (2-3 minutes processing)
6. **Download/Publish** → Save MP4 OR add directly to campaign

**Steps**: 5 clicks + brief upload
**Time**: 5-10 minutes (including video generation)

---

### Workflow 6: Setting Up Autopilot

1. **Autopilot Setup** → `/app/autopilot`
2. **Business Description** → Describe products/services, target audience
3. **Goals & Budget** → Set monthly budget and optimization goals
4. **Review Settings** → Confirm autopilot parameters
5. **Enable Autopilot** → Toggle switch to activate
6. **Monitor Activity** → Check activity feed for daily actions

**Steps**: 4 form pages
**Time**: 5-10 minutes
**Result**: Autopilot runs daily at 2 AM UTC

---

## Module Architecture

### Frontend Modules

**Design System** (`src/components/ui/`)
- Shadcn/ui base components
- Custom themed variants
- Accessibility primitives (ARIA, keyboard navigation)

**Feature Modules** (`src/components/[feature]/`)
- Self-contained feature folders
- Components, hooks, types, tests co-located
- Example: `components/campaigns/` contains all campaign-related UI

**Pages** (`src/pages/`)
- Route-level components
- Lazy-loaded for code splitting
- Layout composition

**Contexts** (`src/contexts/`)
- Global state providers
- Auth, Theme, UserMode, Onboarding, ContentIdeas

**Hooks** (`src/hooks/`)
- Reusable logic abstractions
- Data fetching, form handling, UI state

**Services** (`src/lib/services/`)
- API clients and wrappers
- Business logic layer
- Supabase client, secrets management

---

### Backend Modules

**API Routes** (`backend/routes/`)
- RESTful endpoint handlers
- Request validation
- Response formatting

**AI Agents** (`backend/agents/`)
- AI-powered services
- Prompt engineering
- Model orchestration

**Database Layer** (`backend/database.py`)
- Supabase connection
- Query builders
- Transaction management

**Services** (`backend/services/`)
- Reusable business logic
- External integrations
- Data processing

---

### Edge Functions (Supabase)

**Cron Jobs**:
- `ai-model-updater` - Monthly model discovery (1st of month, 00:00 UTC)
- `autopilot-orchestrator` - Daily campaign optimization (02:00 UTC)

**API Endpoints**:
- `ai-model-config` - Get current model configuration
- `conversational-campaign-agent` - Conversational campaign creation
- `brand-positioning-agent` - 3Cs analysis
- `funnel-design-agent` - Funnel design
- `competitor-gap-agent` - Competitive analysis
- `performance-tracker-agent` - KPI setup
- `quick-post-publisher` - Multi-platform publishing
- `manage-user-secrets` - API key management

---

## Data Model

### User Data Flow

```
User Input → Frontend Validation → Supabase SDK → PostgreSQL
                                 ↓
                           Row Level Security (RLS)
                                 ↓
                           Backend Processing (if needed)
                                 ↓
                           AI Agent (if applicable)
                                 ↓
                           Database Write
                                 ↓
                           Real-Time Subscription Update
                                 ↓
                           Frontend UI Refresh
```

---

### Campaign Creation Flow

```
1. User submits campaign details (form OR conversation)
2. Frontend validates input (Zod schema)
3. If AI-assisted:
   a. Send to AI agent (Claude Opus 4.5)
   b. Generate campaign brief
   c. Return structured data
4. Insert into `campaigns` table
5. Create related records (content_ideas, campaign_metrics)
6. Subscribe to real-time updates
7. Redirect to campaign details page
```

---

### Video Generation Flow

```
1. User uploads brief/prompt
2. Send to Gemini 3 Flash for scene planning
3. Gemini generates 3-6 scene descriptions
4. For each scene:
   a. Generate image with Nano Banana
   b. Store in Supabase Storage
   c. Generate video segment with Veo 3
5. Compose final video (FFmpeg)
6. Store in Supabase Storage
7. Create record in `ai_video_projects` table
8. Return download URL
```

---

### Autopilot Optimization Flow

```
Daily at 02:00 UTC:

1. Fetch all enabled autopilot configs
2. For each user:
   a. Query campaign performance (last 7 days)
   b. Identify underperforming campaigns (engagement < 2%)
   c. Send to Claude Opus 4.5 for analysis
   d. Claude recommends actions (video ad, budget adjustment, etc.)
   e. If video recommended:
      i. Generate video with AI Video Pipeline
      ii. Add to campaign
   f. Execute optimizations
   g. Log to `autopilot_activity_log`
   h. Send email summary (weekly)
```

---

## Security & Privacy

### Authentication

**Provider**: Supabase Auth
**Methods**: Email/password, OAuth (Google, LinkedIn)
**Session Management**: JWT tokens with automatic refresh
**Password Policy**: Min 8 characters, strength meter

---

### Authorization

**Row Level Security (RLS)**: All tables have policies enforcing `user_id` checks
**API Middleware**: FastAPI routes verify JWT tokens
**Role-Based Access**: Planned feature for team accounts

**Example RLS Policy**:
```sql
CREATE POLICY "Users can only access their own campaigns"
ON campaigns FOR SELECT
USING (auth.uid() = user_id);
```

---

### Data Encryption

**At Rest**: PostgreSQL encryption (Supabase managed)
**In Transit**: HTTPS/TLS 1.3 required
**API Keys**: Encrypted before storage in `user_secrets` table
**Secrets**: Master encryption key stored in Supabase secrets (never in code)

---

### Privacy Compliance

**GDPR**: Right to access, rectify, erase, export data
**CCPA**: Opt-out of data selling (we don't sell data)
**Data Retention**: User data deleted within 30 days of account deletion
**Audit Logs**: All data access logged for compliance

**Privacy Policy**: `/privacy`
**Terms of Service**: `/terms`
**Cookie Policy**: `/cookies`
**Acceptable Use**: `/acceptable-use`

---

## Deployment Architecture

### Production Environment

**Frontend**:
- **Platform**: Vercel OR Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Auto-Deploy**: Push to `main` branch
- **Environment Variables**: Set via platform dashboard

**Backend**:
- **Platform**: Render
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Auto-Deploy**: Push to `main` branch
- **Environment Variables**: Set via Render dashboard

**Database**:
- **Provider**: Supabase (PostgreSQL 15)
- **Region**: US East (configurable)
- **Backups**: Automatic daily backups
- **Scaling**: Automatic with Pro plan

**File Storage**:
- **Provider**: Supabase Storage
- **Buckets**: `ai-videos`, `user-uploads`, `brand-assets`
- **CDN**: Automatic CDN for global delivery

---

### Deployment Checklist

**Pre-Deployment**:
- [ ] Run `npm run quality:check:full` (type-check, lint, tests)
- [ ] Run `npm run backend:test` (backend tests)
- [ ] Review CHANGELOG.md
- [ ] Update version number

**Deployment**:
- [ ] Merge feature branch to `main`
- [ ] Verify CI/CD pipeline passes
- [ ] Monitor deployment logs
- [ ] Smoke test production (login, create campaign, etc.)

**Post-Deployment**:
- [ ] Check error monitoring (Sentry, if configured)
- [ ] Verify analytics tracking
- [ ] Monitor performance metrics
- [ ] Announce in changelog

**Rollback Procedure**:
```bash
# Option 1: Git revert
git revert <bad-commit-hash>
git push origin main --no-verify

# Option 2: Platform rollback
# Vercel/Netlify/Render: Dashboard → Deployments → Rollback
```

---

### Environment Variables

**Frontend** (`.env`):
```bash
VITE_SUPABASE_PROJECT_ID=kciuuxoqxfsogjuqflou
VITE_SUPABASE_URL=https://kciuuxoqxfsogjuqflou.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_BACKEND_URL=https://wheels-wins-orchestrator.onrender.com
```

**Backend** (`backend/.env`):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ANTHROPIC_API_KEY=sk-ant-xxx  # Platform key for backend operations
GEMINI_API_KEY=AIzaXXX         # Platform key for backend operations
```

**Note**: User API keys are stored in `user_secrets` table, NOT in environment variables.

---

## Performance Metrics

### Target Metrics

**Frontend**:
- First Contentful Paint (FCP): <1.2s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms
- Lighthouse Score: 90+ (Performance, Accessibility, Best Practices, SEO)

**Backend**:
- API Response Time (p50): <100ms
- API Response Time (p95): <200ms
- Database Query Time: <50ms
- Error Rate: <0.1%
- Uptime: 99.9%+

**AI Services**:
- Claude Opus 4.5 Response: <3s (average)
- Gemini 3 Flash Response: <2s (average)
- Video Generation: 2-3 minutes for 15-30s video
- Image Generation: <5s per image

---

### Current Performance (as of Jan 2026)

**Bundle Sizes**:
- Main bundle: 165 kB (gzipped)
- Vendor React: 166 kB (gzipped)
- Vendor Supabase: 173 kB (gzipped)
- Vendor UI: 159 kB (gzipped)
- Total initial load: ~660 kB (gzipped)

**Code Splitting**:
- Charts loaded on-demand: 316 kB (LineChart)
- PDF generator loaded on-demand: 742 kB
- Remotion Studio loaded on-demand: 187 kB

**Lighthouse Scores** (Production):
- Performance: 92
- Accessibility: 95
- Best Practices: 100
- SEO: 100

---

## Product Roadmap

### Q1 2026 (Completed)

- ✅ Conversational campaign creation
- ✅ Quick Post multi-platform publishing
- ✅ AI video generation with Veo 3
- ✅ Marketing Autopilot with daily optimization
- ✅ Remotion Video Studio
- ✅ AI Model Management System
- ✅ Strategic Marketing Prompts (10 frameworks)

---

### Q2 2026 (In Progress)

**High Priority**:
- [ ] Team collaboration features (user roles, permissions)
- [ ] Advanced A/B testing framework
- [ ] Predictive analytics with ML models
- [ ] White-label agency mode
- [ ] Mobile app (React Native)

**Medium Priority**:
- [ ] Workflow automation builder (Zapier-style)
- [ ] Advanced lead scoring with custom rules
- [ ] Email sequence builder with visual editor
- [ ] Competitor monitoring dashboard
- [ ] Content performance prediction

**Low Priority**:
- [ ] Chrome extension for quick posting
- [ ] Slack/Discord integrations
- [ ] Voice input for content creation
- [ ] Multi-language support (i18n)

---

### Q3 2026 (Planned)

**AI Enhancements**:
- [ ] Fine-tuned models for specific industries
- [ ] Custom AI agent builder (no-code)
- [ ] AI voice generation for videos
- [ ] Image upscaling and enhancement
- [ ] Real-time video editing with AI

**Platform Expansions**:
- [ ] Marketplace for templates and agents
- [ ] API for third-party integrations
- [ ] Webhooks for event notifications
- [ ] Advanced reporting with custom dashboards
- [ ] Billing and subscription management

---

### Q4 2026 (Visionary)

**Enterprise Features**:
- [ ] SSO (Single Sign-On) with SAML
- [ ] Custom data retention policies
- [ ] Dedicated infrastructure (VPC)
- [ ] SLA guarantees (99.99% uptime)
- [ ] Professional services and training

**Innovation**:
- [ ] AR filters for social media
- [ ] Blockchain-based content verification
- [ ] Quantum-resistant encryption
- [ ] Edge computing for real-time processing
- [ ] AI-powered voice assistants

---

## Conclusion

**Action Insight** represents the future of marketing automation - where AI handles the heavy lifting, humans make strategic decisions, and businesses of all sizes can compete with enterprise-level marketing capabilities.

### Key Differentiators

1. **User-Owned AI Keys**: No platform markup; transparent pricing
2. **Progressive Disclosure**: Simple mode for beginners, advanced mode for pros
3. **Autopilot Intelligence**: Autonomous optimization with transparent logging
4. **Conversational Campaigns**: Natural language campaign creation
5. **AI Video Generation**: Professional videos in minutes, not days
6. **Strategic Frameworks**: 10 battle-tested marketing playbooks

### Getting Started

1. Sign up at [app URL]
2. Add your Claude API key (required)
3. Choose Simple or Advanced mode
4. Create your first campaign in 3 minutes
5. Enable Autopilot and watch your marketing optimize itself

### Documentation Index

- **Architecture**: `docs/ARCHITECTURE.md`
- **Features**: `docs/FEATURES.md`
- **API**: `docs/API.md`
- **Database**: `docs/DATABASE.md`
- **Development**: `docs/DEVELOPMENT.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **AI Video**: `docs/AI-VIDEO-GENERATOR.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **User Manual**: `docs/USER-MANUAL.md`

### Support & Community

- **GitHub Issues**: [Repository URL]/issues
- **Documentation**: [Docs URL]
- **Email**: support@actioninsight.io
- **Community**: [Discord/Slack URL]

---

**Built with ❤️ by the Action Insight team**

**Last Updated**: January 28, 2026
**Version**: 1.0.0
**Status**: Production-Ready
