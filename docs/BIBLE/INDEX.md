# Action Insight Platform - Complete Documentation (THE BIBLE)

**Last Updated**: 2025-10-29
**Version**: 1.0.0
**Status**: Comprehensive Reference

---

## Welcome to The Bible

This is the complete, authoritative documentation for the Action Insight Marketing Platform. Every system, feature, function, and AI agent is documented here.

**Navigation**: This folder contains 9 major sections covering 100% of the application.

---

## Quick Navigation

### For New Developers
1. Start with [01-FRONTEND/READ_ME_FIRST.md](01-FRONTEND/READ_ME_FIRST.md)
2. Then read [02-BACKEND/BACKEND_ARCHITECTURE.md](02-BACKEND/BACKEND_ARCHITECTURE.md)
3. Review [03-DATABASE/DATABASE_SUMMARY.md](03-DATABASE/DATABASE_SUMMARY.md)

### For System Understanding
- **Architecture Overview**: [09-REFERENCE/ARCHITECTURE.md](09-REFERENCE/ARCHITECTURE.md)
- **Feature List**: [09-REFERENCE/FEATURES.md](09-REFERENCE/FEATURES.md)
- **API Reference**: [09-REFERENCE/API.md](09-REFERENCE/API.md)

### For Troubleshooting
- **Common Issues**: [08-GUIDES/troubleshooting/common-issues.md](08-GUIDES/troubleshooting/common-issues.md)
- **Debugging Guide**: [08-GUIDES/troubleshooting/debugging-guide.md](08-GUIDES/troubleshooting/debugging-guide.md)
- **API Errors**: [08-GUIDES/troubleshooting/api-errors.md](08-GUIDES/troubleshooting/api-errors.md)

---

## Documentation Sections

### [01-FRONTEND](01-FRONTEND/) - Frontend Architecture (3,196+ lines)

**Complete React 18 + TypeScript frontend documentation**

- **[READ_ME_FIRST.md](01-FRONTEND/READ_ME_FIRST.md)** (302 lines)
  - Quick overview of the frontend
  - Technology stack
  - Project structure
  - Getting started guide

- **[FRONTEND_ARCHITECTURE.md](01-FRONTEND/FRONTEND_ARCHITECTURE.md)** (2,131 lines)
  - Complete component reference (70+ components)
  - React contexts and state management
  - Routing and navigation
  - UI components (Shadcn/ui)
  - Custom hooks
  - Services and utilities

- **[FRONTEND_GUIDE.md](01-FRONTEND/FRONTEND_GUIDE.md)** (415 lines)
  - Quick reference for common tasks
  - Code patterns
  - Best practices
  - Common pitfalls

**Key Topics**:
- React 18 with TypeScript
- Vite build system
- Tailwind CSS + Shadcn/ui
- Supabase client integration
- User mode switching (Simple/Advanced)
- Real-time subscriptions
- Form validation with Zod

---

### [02-BACKEND](02-BACKEND/) - Backend Architecture (2,596+ lines)

**Complete FastAPI Python backend documentation**

- **[BACKEND_ARCHITECTURE.md](02-BACKEND/BACKEND_ARCHITECTURE.md)** (2,232 lines)
  - Complete API endpoint reference (50+ endpoints)
  - FastAPI route handlers
  - Database connections
  - Authentication middleware
  - AI model integrations
  - Video generation system
  - Social media agents
  - Error handling patterns

- **[BACKEND_DOCUMENTATION_INDEX.md](02-BACKEND/BACKEND_DOCUMENTATION_INDEX.md)** (364 lines)
  - Navigation guide for backend docs
  - Quick lookup by feature
  - API endpoint index

**Key Topics**:
- FastAPI framework
- Python 3.11+
- Supabase integration
- AI model services (OpenAI, Anthropic, Gemini, Mistral)
- Video generation with Google Veo 3
- Multi-model fallback system
- Render deployment
- Rate limiting and security

---

### [03-DATABASE](03-DATABASE/) - Database Schema (3,623+ lines)

**Complete PostgreSQL database documentation**

- **[DATABASE_SCHEMA_COMPLETE.md](03-DATABASE/DATABASE_SCHEMA_COMPLETE.md)** (2,358 lines)
  - All 60+ tables documented
  - Column definitions with types
  - Relationships and foreign keys
  - Indexes and constraints
  - Row Level Security (RLS) policies
  - Triggers and functions

- **[DATABASE_SUMMARY.md](03-DATABASE/DATABASE_SUMMARY.md)** (527 lines)
  - Quick overview of database structure
  - Table categories
  - Important relationships
  - Common queries

- **[DATABASE_INDEX.md](03-DATABASE/DATABASE_INDEX.md)** (738 lines)
  - Alphabetical table index
  - Quick lookup by feature
  - Migration history

**Key Topics**:
- PostgreSQL via Supabase
- Row Level Security (RLS)
- User preferences and settings
- Campaign management
- Content calendar
- AI video projects
- Marketing autopilot
- User secrets (encrypted API keys)
- Strategic marketing analyses
- Performance metrics

---

### [04-EDGE-FUNCTIONS](04-EDGE-FUNCTIONS/) - Supabase Edge Functions (2,324+ lines)

**Complete Edge Functions (serverless) documentation**

- **[SUPABASE_EDGE_FUNCTIONS.md](04-EDGE-FUNCTIONS/SUPABASE_EDGE_FUNCTIONS.md)** (1,741 lines)
  - All 34 Edge Functions documented
  - Input/output schemas
  - Error handling
  - Authentication requirements
  - Cron schedules
  - Usage examples

- **[EDGE_FUNCTIONS_SUMMARY.md](04-EDGE-FUNCTIONS/EDGE_FUNCTIONS_SUMMARY.md)** (269 lines)
  - Quick overview of all functions
  - Purpose and triggers
  - Dependencies

- **[EDGE_FUNCTIONS_INDEX.md](04-EDGE-FUNCTIONS/EDGE_FUNCTIONS_INDEX.md)** (314 lines)
  - Alphabetical function index
  - Quick lookup by category
  - Deployment commands

**Key Topics**:
- Deno runtime
- AI model management (monthly cron)
- Campaign assistants
- Content generation
- Autopilot orchestrator (daily cron)
- User secrets management
- Strategic marketing agents
- Competitor analysis
- Performance tracking
- Keyword research

---

### [05-SECURITY](05-SECURITY/) - Security & Integrations (1,970+ lines)

**Complete security and integration documentation**

- **[README_SECURITY.md](05-SECURITY/README_SECURITY.md)** (364 lines)
  - Security overview
  - Authentication flow
  - API key management
  - Encryption standards

- **[SECURITY_AND_INTEGRATIONS.md](05-SECURITY/SECURITY_AND_INTEGRATIONS.md)** (1,305 lines)
  - Complete security reference
  - Row Level Security (RLS) policies
  - Encryption implementation (AES-256-GCM)
  - Integration patterns
  - OAuth flows
  - Rate limiting
  - CORS configuration
  - Environment variables

- **[SECURITY_QUICK_REFERENCE.md](05-SECURITY/SECURITY_QUICK_REFERENCE.md)** (301 lines)
  - Quick security checklist
  - Common security patterns
  - Troubleshooting security issues

**Key Topics**:
- Supabase Auth (JWT)
- Row Level Security (RLS)
- AES-256-GCM encryption for API keys
- OAuth integrations (Google, Facebook, LinkedIn)
- API key rotation
- CORS and CSP
- Rate limiting
- Audit logging

---

### [06-AI-SYSTEMS](06-AI-SYSTEMS/) - AI Systems & Models

**Complete AI and machine learning documentation**

- **[AI-MODEL-MANAGEMENT.md](06-AI-SYSTEMS/AI-MODEL-MANAGEMENT.md)**
  - Automated AI model discovery system
  - Monthly cron for model updates
  - Flagship model selection
  - Provider comparison (OpenAI, Anthropic, Google, Mistral)
  - Config API documentation
  - Admin UI guide

- **[AI-MODEL-SYSTEM-IMPLEMENTATION-SUMMARY.md](06-AI-SYSTEMS/AI-MODEL-SYSTEM-IMPLEMENTATION-SUMMARY.md)**
  - Implementation guide for AI model management
  - Deployment steps
  - Testing procedures
  - Monitoring and troubleshooting

- **[AI-VIDEO-GENERATOR.md](06-AI-SYSTEMS/AI-VIDEO-GENERATOR.md)**
  - Google Veo 3 video generation
  - Scene planning and image generation
  - Autopilot video creation
  - Cost analysis
  - Usage examples

**Key Topics**:
- OpenAI GPT-5 (flagship, August 2025)
- Anthropic Claude Sonnet 4-5 (best coding model, September 2025)
- Google Gemini 2.5 Pro (adaptive thinking)
- Mistral Large Latest
- Google Veo 3 video generation
- Multi-model fallback system
- Automated monthly model discovery
- User-provided API keys (no markup)

---

### [07-FEATURES](07-FEATURES/) - Feature Documentation

**Detailed feature-by-feature documentation**

#### Analytics
- **[performance-insights.md](07-FEATURES/analytics/performance-insights.md)** - AI-powered performance insights
- **[predictive-analytics.md](07-FEATURES/analytics/predictive-analytics.md)** - Predictive campaign analytics
- **[reporting.md](07-FEATURES/analytics/reporting.md)** - Custom reporting and dashboards

#### Campaigns
- **[campaign-management.md](07-FEATURES/campaigns/campaign-management.md)** - Campaign creation and management
- **[campaign-automation.md](07-FEATURES/campaigns/campaign-automation.md)** - Marketing autopilot system
- **[campaign-analytics.md](07-FEATURES/campaigns/campaign-analytics.md)** - Campaign performance tracking

#### Content
- **[content-generation.md](07-FEATURES/content/content-generation.md)** - AI content generation
- **[content-scheduling.md](07-FEATURES/content/content-scheduling.md)** - Content calendar
- **[content-optimization.md](07-FEATURES/content/content-optimization.md)** - AI optimization

#### Email
- **[email-campaigns.md](07-FEATURES/email/email-campaigns.md)** - Email campaign management
- **[email-automation.md](07-FEATURES/email/email-automation.md)** - Email automation workflows
- **[email-metrics.md](07-FEATURES/email/email-metrics.md)** - Email performance metrics

#### Leads
- **[lead-generation.md](07-FEATURES/leads/lead-generation.md)** - Lead capture and generation
- **[lead-scoring.md](07-FEATURES/leads/lead-scoring.md)** - AI lead scoring
- **[lead-workflows.md](07-FEATURES/leads/lead-workflows.md)** - Lead nurturing workflows

#### Social Media
- **[social-automation.md](07-FEATURES/social-media/social-automation.md)** - Social media automation
- **[platform-connections.md](07-FEATURES/social-media/platform-connections.md)** - Platform integrations
- **[social-analytics.md](07-FEATURES/social-media/social-analytics.md)** - Social media analytics

#### Workflows
- **[workflow-builder.md](07-FEATURES/workflows/workflow-builder.md)** - Visual workflow builder
- **[automation-rules.md](07-FEATURES/workflows/automation-rules.md)** - Automation rule engine
- **[workflow-templates.md](07-FEATURES/workflows/workflow-templates.md)** - Pre-built workflow templates

---

### [08-GUIDES](08-GUIDES/) - Developer & User Guides

**Step-by-step guides for common tasks**

#### Development Guides
- **[adding-new-features.md](08-GUIDES/development/adding-new-features.md)** - How to add new features
- **[architecture-overview.md](08-GUIDES/development/architecture-overview.md)** - System architecture guide
- **[code-structure.md](08-GUIDES/development/code-structure.md)** - Codebase structure explained

#### Setup Guides
- **[initial-setup.md](08-GUIDES/setup/initial-setup.md)** - Initial project setup
- **[api-configuration.md](08-GUIDES/setup/api-configuration.md)** - API key configuration
- **[platform-integrations.md](08-GUIDES/setup/platform-integrations.md)** - Third-party integrations

#### Troubleshooting Guides
- **[common-issues.md](08-GUIDES/troubleshooting/common-issues.md)** - Common issues and solutions
- **[debugging-guide.md](08-GUIDES/troubleshooting/debugging-guide.md)** - Debugging techniques
- **[api-errors.md](08-GUIDES/troubleshooting/api-errors.md)** - API error reference
- **[input-field-styling-fixes.md](08-GUIDES/troubleshooting/input-field-styling-fixes.md)** - UI styling fixes

#### User Guides
- **[getting-started.md](08-GUIDES/user-guides/getting-started.md)** - User getting started guide
- **[best-practices.md](08-GUIDES/user-guides/best-practices.md)** - Best practices
- **[advanced-usage.md](08-GUIDES/user-guides/advanced-usage.md)** - Advanced features

---

### [09-REFERENCE](09-REFERENCE/) - Additional Reference Materials

**Supplementary documentation and references**

#### Core References
- **[ARCHITECTURE.md](09-REFERENCE/ARCHITECTURE.md)** - System architecture overview
- **[API.md](09-REFERENCE/API.md)** - Complete API reference
- **[DATABASE.md](09-REFERENCE/DATABASE.md)** - Database documentation
- **[BACKEND.md](09-REFERENCE/BACKEND.md)** - Backend reference
- **[AGENTS.md](09-REFERENCE/AGENTS.md)** - AI agents overview
- **[FEATURES.md](09-REFERENCE/FEATURES.md)** - Features overview
- **[INTEGRATIONS.md](09-REFERENCE/INTEGRATIONS.md)** - Integration reference
- **[AUTHENTICATION.md](09-REFERENCE/AUTHENTICATION.md)** - Auth reference
- **[DEPLOYMENT.md](09-REFERENCE/DEPLOYMENT.md)** - Deployment guide
- **[DEVELOPMENT.md](09-REFERENCE/DEVELOPMENT.md)** - Development reference
- **[TROUBLESHOOTING.md](09-REFERENCE/TROUBLESHOOTING.md)** - Troubleshooting reference

#### Implementation Summaries
- **[AUTOPILOT-ERROR-FIX-SUMMARY.md](09-REFERENCE/AUTOPILOT-ERROR-FIX-SUMMARY.md)** - Autopilot bug fix documentation
- **[AUTOPILOT-FIX-SUMMARY.md](09-REFERENCE/AUTOPILOT-FIX-SUMMARY.md)** - Additional autopilot fixes
- **[DOCUMENTATION_SUMMARY.md](09-REFERENCE/DOCUMENTATION_SUMMARY.md)** - Documentation overview

#### Project Management
- **[3-DAY-LAUNCH-PLAN.md](09-REFERENCE/3-DAY-LAUNCH-PLAN.md)** - Product launch plan
- **[COMPREHENSIVE-ANALYSIS.md](09-REFERENCE/COMPREHENSIVE-ANALYSIS.md)** - System analysis
- **[APPLY_MIGRATIONS.md](09-REFERENCE/APPLY_MIGRATIONS.md)** - Database migration guide
- **[KNIP.md](09-REFERENCE/KNIP.md)** - Code cleanup tool guide

---

## Documentation Statistics

**Total Documentation**:
- **18+ major documentation files**
- **15,137+ lines of documentation**
- **60+ database tables documented**
- **34 Edge Functions documented**
- **70+ React components documented**
- **50+ API endpoints documented**
- **11 AI agents documented**
- **30+ feature guides**

**Coverage**:
- Frontend: 100%
- Backend: 100%
- Database: 100%
- Edge Functions: 100%
- AI Systems: 100%
- Security: 100%
- Features: 100%

---

## How to Use This Documentation

### For New Team Members
1. Start with [01-FRONTEND/READ_ME_FIRST.md](01-FRONTEND/READ_ME_FIRST.md)
2. Read [08-GUIDES/setup/initial-setup.md](08-GUIDES/setup/initial-setup.md)
3. Review [09-REFERENCE/ARCHITECTURE.md](09-REFERENCE/ARCHITECTURE.md)
4. Explore features in [07-FEATURES/](07-FEATURES/)

### For Feature Development
1. Check if feature exists in [07-FEATURES/](07-FEATURES/)
2. Review [08-GUIDES/development/adding-new-features.md](08-GUIDES/development/adding-new-features.md)
3. Study similar features in [01-FRONTEND/FRONTEND_ARCHITECTURE.md](01-FRONTEND/FRONTEND_ARCHITECTURE.md)
4. Check database schema in [03-DATABASE/DATABASE_SCHEMA_COMPLETE.md](03-DATABASE/DATABASE_SCHEMA_COMPLETE.md)

### For Debugging
1. Check [08-GUIDES/troubleshooting/common-issues.md](08-GUIDES/troubleshooting/common-issues.md)
2. Review [08-GUIDES/troubleshooting/debugging-guide.md](08-GUIDES/troubleshooting/debugging-guide.md)
3. Check API errors in [08-GUIDES/troubleshooting/api-errors.md](08-GUIDES/troubleshooting/api-errors.md)
4. Review Edge Function logs in [04-EDGE-FUNCTIONS/SUPABASE_EDGE_FUNCTIONS.md](04-EDGE-FUNCTIONS/SUPABASE_EDGE_FUNCTIONS.md)

### For API Integration
1. Start with [09-REFERENCE/API.md](09-REFERENCE/API.md)
2. Review authentication in [05-SECURITY/SECURITY_AND_INTEGRATIONS.md](05-SECURITY/SECURITY_AND_INTEGRATIONS.md)
3. Check backend endpoints in [02-BACKEND/BACKEND_ARCHITECTURE.md](02-BACKEND/BACKEND_ARCHITECTURE.md)
4. Review Edge Functions in [04-EDGE-FUNCTIONS/SUPABASE_EDGE_FUNCTIONS.md](04-EDGE-FUNCTIONS/SUPABASE_EDGE_FUNCTIONS.md)

### For Database Work
1. Start with [03-DATABASE/DATABASE_SUMMARY.md](03-DATABASE/DATABASE_SUMMARY.md)
2. Use [03-DATABASE/DATABASE_INDEX.md](03-DATABASE/DATABASE_INDEX.md) for quick lookup
3. Review complete schema in [03-DATABASE/DATABASE_SCHEMA_COMPLETE.md](03-DATABASE/DATABASE_SCHEMA_COMPLETE.md)
4. Check migrations in [09-REFERENCE/APPLY_MIGRATIONS.md](09-REFERENCE/APPLY_MIGRATIONS.md)

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase client (real-time subscriptions)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL via Supabase
- **Serverless**: Supabase Edge Functions (Deno)
- **Authentication**: Supabase Auth (JWT)
- **Deployment**: Render (backend), Vercel/Netlify (frontend)

### AI Services
- **OpenAI**: GPT-5, GPT-5-Mini, GPT-4.1 series
- **Anthropic**: Claude Sonnet 4-5, Claude Opus 4-1
- **Google**: Gemini 2.5 Pro, Veo 3 (video), Nano Banana (images)
- **Mistral**: Mistral Large Latest

### Infrastructure
- **Database**: Supabase PostgreSQL (60+ tables, RLS enabled)
- **Storage**: Supabase Storage (videos, images)
- **Edge Functions**: 34 Supabase Edge Functions (Deno runtime)
- **Cron Jobs**: 2 scheduled tasks (autopilot, model discovery)
- **Encryption**: AES-256-GCM for API keys

---

## Key Features

1. **Marketing Autopilot** - Automated campaign optimization
2. **AI Video Generation** - Google Veo 3 video creation
3. **Strategic Marketing Prompts** - 10 core marketing frameworks
4. **Multi-Model AI System** - 4 AI providers with fallback
5. **User Mode Switching** - Simple (2 items) vs Advanced (14+ items)
6. **Content Generation** - AI-powered content creation
7. **Campaign Management** - Complete campaign lifecycle
8. **Performance Analytics** - AI-driven insights
9. **Social Media Automation** - Multi-platform posting
10. **Email Campaigns** - Email automation and tracking

---

## Important Files Not in BIBLE

These files remain at the root level:
- **CLAUDE.md** - Project instructions for AI assistants (stays at root)
- **README.md** - Project readme (stays at root)
- **package.json** - Project dependencies

---

## Maintenance

This documentation was last updated: **2025-10-29**

**To update**:
1. Update the specific section files
2. Update this INDEX.md with changes
3. Update statistics if significant changes
4. Keep CLAUDE.md in sync with major changes

---

## Questions or Issues?

- Check [08-GUIDES/troubleshooting/](08-GUIDES/troubleshooting/) first
- Review [09-REFERENCE/TROUBLESHOOTING.md](09-REFERENCE/TROUBLESHOOTING.md)
- Search this INDEX.md for keywords
- Check relevant section documentation

---

**Welcome to The Bible. Everything you need to know about Action Insight is documented here.**
