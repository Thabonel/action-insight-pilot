# Frontend Architecture Quick Reference Guide

## Document Location
`/Users/thabonel/Code/action-insight-pilot/FRONTEND_ARCHITECTURE.md` (2131 lines, comprehensive)

---

## Quick Navigation

### Core Architecture Files
- **main.tsx**: Entry point with provider hierarchy
- **App.tsx**: Root component with routing structure
- **AppRouter.tsx**: Protected app routes (38 routes total)
- **Layout.tsx**: Main sidebar layout with mode-aware navigation
- **ProtectedRoute.tsx**: Authentication guard

### Pages Directory (`src/pages/` - 38 pages total)

#### Authentication & Public
- `Index.tsx` - Redirect logic (authenticated → dashboard, public → homepage)
- `auth/AuthPage.tsx` - Sign in/up form with password validation
- `PublicHomepage.tsx` - Marketing homepage

#### Autopilot (Simple Mode)
- `SimpleDashboard.tsx` - Main autopilot dashboard with stats and activities
- `AutopilotSetup.tsx` - Configuration wizard wrapper

#### Advanced Mode (Full Platform)
- `ConversationalDashboard.tsx` - AI chat interface
- `Campaigns.tsx` - Campaign list view
- `CampaignManagement.tsx` - Campaign management tools
- `CampaignDetails.tsx` - Campaign create/edit form
- `Leads.tsx` - Lead dashboard
- `Content.tsx` - Content creation suite
- `Social.tsx` - Social media management
- `Email.tsx` - Email campaign builder
- `Analytics.tsx` - Analytics dashboards
- `ViralVideoMarketing.tsx` - Viral video tools
- `Proposals.tsx` - Proposal generation
- `Settings.tsx` - System settings
- And 20+ more specialized pages

### Component Directories (`src/components/` - 227 components total)

#### Core Layout
- `layout/Layout.tsx` - Main app layout
- `layout/ModeSwitcher.tsx` - Mode switching UI

#### Dashboards (19 components)
- `dashboard/DashboardChatInterface.tsx` - Main AI chat
- `dashboard/ChatHistory.tsx`, `ChatInput.tsx`, `ChatMessage.tsx`
- `dashboard/InsightsCards.tsx`, `PerformanceChart.tsx`

#### Autopilot (3 components)
- `autopilot/AutopilotSetupWizard.tsx` - 4-step setup
- `autopilot/LeadInbox.tsx` - Lead management
- `autopilot/ActivityFeed.tsx` - Activity log

#### Campaigns (13 components)
- `campaigns/IntelligentCampaignCreator.tsx` - AI-assisted creation
- `campaigns/CampaignPerformanceDashboard.tsx` - Metrics
- `campaigns/CampaignCard.tsx` - List item component

#### Content (13 components)
- `content/IntelligentContentGenerator.tsx` - AI generator
- `content/ContentLibrary.tsx` - Content browser
- `content/ContentPerformanceDashboard.tsx` - Metrics

#### Social (14 components)
- `social/EnhancedSocialDashboard.tsx` - Main interface
- `social/IntelligentPostScheduler.tsx` - Smart scheduler
- `social/SocialAIAssistant.tsx` - Content copilot

#### Settings (12 components)
- `settings/AccountSettings.tsx` - Profile management
- `settings/IntegrationSettings.tsx` - Third-party integrations
- `settings/UserApiKeysSettings.tsx` - API key management
- `settings/AdminDashboard.tsx` - Admin panel (admin-only)

#### UI Components (52 shadcn/ui components)
- Form: input, textarea, select, checkbox, radio-group, toggle, switch, label
- Layout: card, dialog, alert-dialog, sheet, drawer, tabs, accordion, separator
- Navigation: breadcrumb, pagination, menubar, dropdown-menu, navigation-menu
- Data: table, badge, avatar, progress, slider, carousel
- Feedback: alert, toast, tooltip, popover, hover-card
- Other: button, scroll-area, resizable, skeleton, aspect-ratio, error-boundary

---

## State Management

### Context Providers (4 total)
1. **AuthContext** - User authentication state
   - Methods: signIn, signUp, signOut
   - Properties: user, session, isAuthenticated, loading

2. **UserModeContext** - Interface mode (simple vs advanced)
   - Methods: setMode, toggleMode
   - Persists to `user_preferences.interface_mode`

3. **OnboardingContext** - Guided tour system
   - Methods: nextStep, prevStep, skipOnboarding, completeOnboarding

4. **ContentIdeasContext** - Content idea management
   - Methods: addContentIdea, removeContentIdea, getRecentIdeas

### Custom Hooks (40+ total)

**Core Hooks**:
- `useAuth()` - Authentication
- `useUserMode()` - Mode switching
- `useToast()` - Toast notifications
- `useUserRole()` - Role & permissions

**Data Hooks**:
- `useCampaigns()` - Campaign CRUD
- `useAnalytics()` - Event tracking
- `useChatLogic()` - Chat state
- `useProposals()` - Proposal management
- `useIntegrations()` - Integration config
- `useKeywordResearch()` - SEO tools
- `useKnowledge()` - Knowledge base
- `useLeadActions()` - Lead operations
- `useSocialPlatforms()` - Social platforms
- `useRealTimeMetrics()` - Real-time data

**Utility Hooks**:
- `useRateLimiter()` - API rate limiting
- `useRetry()` - Retry logic
- `useErrorHandler()` - Error handling
- `useSystemMetrics()` - System health
- `useDataPrivacy()` - GDPR compliance
- `useSecureOAuth()` - OAuth flows

---

## Services & APIs

### Main API Client (`src/lib/api-client.ts`)
```typescript
// Campaign operations
apiClient.getCampaigns()
apiClient.getCampaignById(id)
apiClient.createCampaign(data)
apiClient.updateCampaign(id, updates)
apiClient.deleteCampaign(id)

// Agent/Chat
apiClient.queryAgent(query, context)

// Content, Social, Analytics, etc.
```

### Key Services (`src/lib/services/`)

1. **SecretsService** - Encrypted API key management
   - Methods: saveSecret, getSecret, deleteSecret, listSecrets, hasSecret
   - Supported: Gemini, OpenAI, Anthropic, custom keys

2. **UserPreferencesService** - User preference management
   - Methods: getUserPreferences, updateUserPreferences, resetPreferences

3. **ChatAgentRouter** - Route queries to appropriate agents
   - Query types: daily_focus, campaign_analysis, lead_analysis, content_strategy, performance_metrics

4. **ConversationalService** - Process conversational queries
   - Methods: processQuery, generateSuggestions, fetchCampaignData

5. **KnowledgeService** - Knowledge base management
   - Methods: createBucket, uploadDocument, searchKnowledge

---

## Key Features

### 1. Marketing Autopilot
- Location: `/app/autopilot`
- Setup wizard with AI strategy generation
- Real-time activity feed
- Weekly reports
- Automatic optimization

### 2. AI Video Generator
- Location: Integrated in content/studio
- Veo 3 for video generation
- Nano Banana for image generation
- Scene-based planning

### 3. Conversational Dashboard
- Location: `/app/conversational-dashboard`
- Natural language queries
- Agent-based routing
- Chat history persistence

### 4. Campaign Management
- Multi-channel campaigns
- AI-assisted creation
- Performance tracking
- Budget management

### 5. Lead Management
- Automated scoring
- Conversion prediction
- Lead segmentation
- Activity tracking

### 6. Content Generation
- Multiple content types
- AI writing assistant
- Performance tracking
- Multi-channel scheduling

### 7. Social Media
- Multi-platform posting
- Optimal timing prediction
- Engagement tracking
- Bulk scheduling

### 8. Analytics
- Real-time dashboards
- Predictive analytics
- ROI tracking
- Trend analysis

---

## Database Integration (Supabase)

### Key Tables
```
users                          // Auth users
campaigns                      // Campaign data
content                        // Generated content
leads                         // Lead data
social_posts                  // Social media posts
proposals                     // Proposal documents
user_preferences              // User settings (interface_mode)
user_secrets                  // Encrypted API keys
marketing_autopilot_config    // Autopilot configuration
autopilot_activity_log        // Autopilot activities
knowledge_buckets             // Knowledge base buckets
knowledge_documents           // Uploaded documents
ai_video_projects             // Video projects
ai_video_jobs                 // Video generation jobs
```

### Real-time Features
- User mode changes
- Autopilot activities
- Campaign updates
- Chat messages
- Lead status changes

### Edge Functions
- `manage-user-secrets` - API key encryption/decryption
- `ai-campaign-assistant` - Campaign AI
- `autopilot-orchestrator` - Automation engine
- `brand-positioning-agent` - Brand analysis
- `funnel-design-agent` - Funnel optimization
- And 5+ more

---

## Routing Structure

### Public Routes
- `/` → Index (redirect or homepage)
- `/auth` → Authentication
- `/help`, `/privacy`, `/terms`, `/cookies`, `/acceptable-use`

### Protected Routes (all under `/app/*`)
- `/app/autopilot` - Main dashboard (simple mode)
- `/app/conversational-dashboard` - AI dashboard (advanced)
- `/app/campaigns*` - Campaign management (5 routes)
- `/app/leads*` - Lead management (2 routes)
- `/app/content` - Content creation
- `/app/social` - Social media
- `/app/email` - Email campaigns
- `/app/analytics` - Analytics dashboards
- `/app/viral-video-marketing` - Video tools
- `/app/proposals` - Proposals
- `/app/knowledge` - Knowledge base
- `/app/settings` - System settings
- `/app/user-manual` - Documentation
- `/app/connect-platforms` - Integrations
- `/app/landing-page-builder` - Landing pages
- `/app/keyword-research` - SEO research

Total: 38 main routes + 20+ sub-routes

---

## Integration Points

### Backend (FastAPI on Render)
- Campaign CRUD endpoints
- AI agent routes
- Analytics endpoints
- Video generation
- OAuth handlers
- WebSocket for real-time updates

### Third-Party APIs
- **Social**: Facebook, Instagram, Twitter, LinkedIn, TikTok, Pinterest, YouTube
- **Email**: Gmail, Outlook, custom SMTP
- **Analytics**: Google Analytics, Mixpanel, Segment
- **CRM**: HubSpot, Salesforce, Pipedrive
- **E-Commerce**: Shopify, WooCommerce
- **AI Models**: OpenAI, Anthropic, Google, Mistral

---

## Development Tips

### Add a New Page
1. Create file in `src/pages/PageName.tsx`
2. Add route in `AppRouter.tsx`
3. Add navigation item in `Layout.tsx`
4. Import and use components

### Add a New Component
1. Create in appropriate subdirectory (`src/components/feature/`)
2. Define TypeScript interface for props
3. Import and use in pages/other components
4. Add tests in `__tests__` subdirectory

### Add a New Hook
1. Create in `src/hooks/useName.ts` or `.tsx`
2. Export from component or service
3. Document props and return type
4. Use in components with proper error handling

### Add a New Service
1. Create in `src/lib/services/name-service.ts`
2. Implement methods with proper error handling
3. Add TypeScript interfaces for data types
4. Export singleton instance
5. Use in hooks or components

---

## Code Quality Standards

### Anti-AI-Slop Rules (CRITICAL)
- NO emojis in code/comments (UI strings only)
- NO em-dashes (—), use hyphens (-)
- NO obvious comments, only explain WHY
- Proper error handling with context
- Variable names match their content
- No hardcoded mock data in production
- No repeated code blocks (DRY principle)
- All imports must exist in package.json
- New features must be wired into app
- Consistent formatting (see .prettierrc)

### Before Committing
```bash
npm run quality:check:full
npm run type-check
npm run lint
npm run knip  # Check for unused code
```

---

## File Structure Summary

```
src/
├── pages/                  # 38 page components
├── components/            # 227 UI components
│   ├── ui/               # 52 shadcn/ui components
│   ├── layout/           # Main layout
│   ├── dashboard/        # Dashboard components
│   ├── autopilot/        # Autopilot feature
│   ├── campaigns/        # Campaign management
│   ├── social/           # Social media
│   ├── content/          # Content creation
│   ├── settings/         # Settings panels
│   └── ... (16 more categories)
├── contexts/             # 4 React Contexts
├── hooks/                # 40+ custom hooks
├── lib/                  # Services, utilities, APIs
│   ├── services/         # Business logic
│   ├── api/             # API clients
│   └── utils/           # Helper functions
├── integrations/         # Supabase setup
├── types/               # TypeScript interfaces
├── styles/              # Global styles
└── test/                # Test setup
```

---

## Quick Start Checklist

- [ ] Review architecture overview
- [ ] Understand routing structure
- [ ] Learn context providers
- [ ] Explore key components
- [ ] Study API client
- [ ] Review integration points
- [ ] Check code quality standards
- [ ] Read CLAUDE.md for project context

---

## Additional Resources

- **FRONTEND_ARCHITECTURE.md** - Detailed (2131 lines)
- **CLAUDE.md** - Project context and rules
- **docs/API.md** - Backend API reference
- **docs/KNIP.md** - Code cleanup guide
- **docs/ARCHITECTURE.md** - System design

