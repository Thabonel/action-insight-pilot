# Frontend Architecture Documentation

## Complete React Application Architecture for Action Insight Marketing Platform

**Project**: AI-powered marketing automation platform with autopilot features
**Framework**: React 18 + TypeScript + Vite
**UI Library**: Tailwind CSS + Shadcn/ui
**State Management**: React Context API + Custom Hooks
**Backend**: FastAPI (Python) on Render
**Database**: PostgreSQL via Supabase
**Auth**: Supabase Authentication

---

## Table of Contents

1. [Application Architecture Overview](#application-architecture-overview)
2. [Pages & Routing](#pages--routing)
3. [React Components](#react-components)
4. [State Management](#state-management)
5. [Services & Libraries](#services--libraries)
6. [Key Features](#key-features)
7. [Integration Points](#integration-points)
8. [Data Flow](#data-flow)

---

## Application Architecture Overview

### Entry Point Architecture

**File**: `/Users/thabonel/Code/action-insight-pilot/src/main.tsx`

```typescript
// Provider hierarchy from innermost to outermost:
// 1. BrowserRouter (routing)
// 2. AuthProvider (authentication context)
// 3. ThemeProvider (dark/light mode)
// 4. App.tsx (nested providers)
//    - OnboardingProvider
//    - ContentIdeasProvider
//    - UserModeProvider
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/App.tsx`

**Purpose**: Root application component that sets up routing structure

**Key Props/Configuration**:
- Routes public pages (Index, Auth, Legal)
- Routes protected app routes (AppRouter)
- Initializes onboarding overlay
- Sets up toast notification system

**Integration Points**:
- Supabase client (`@/integrations/supabase/client`)
- Auth context for authentication state
- User mode context for interface switching
- Onboarding context for guided tours

**Component Hierarchy**:
```
App.tsx
├── Routes (React Router)
│   ├── Public Routes
│   │   ├── "/" → Index.tsx
│   │   ├── "/auth" → AuthPage.tsx
│   │   ├── "/oauth/callback" → OAuthCallback.tsx
│   │   ├── "/help" → HelpPage.tsx
│   │   └── Legal Pages (Privacy, Terms, Cookies, AUP)
│   ├── Protected Routes (/app/*)
│   │   └── AppRouter.tsx
├── OnboardingOverlay.tsx
└── Toaster (Sonner toast notifications)
```

---

## Pages & Routing

### Routing Structure

**Primary Router**: `src/components/AppRouter.tsx`

**Route Configuration**:

```typescript
// Home/Default
GET /app/
  └── Redirects to /app/autopilot

// Autopilot (Simple Mode)
GET /app/autopilot
  → SimpleDashboard.tsx (main dashboard for autopilot mode)
GET /app/autopilot/setup
  → AutopilotSetup.tsx (setup wizard)

// Advanced Mode Routes
GET /app/conversational-dashboard
  → ConversationalDashboard.tsx (AI chat interface)
GET /app/getting-started
  → ActionInsightQuickStart.tsx (onboarding)

// Campaign Management
GET /app/campaigns
  → Campaigns.tsx (list view)
GET /app/campaign-management
  → CampaignManagement.tsx (management interface)
GET /app/campaigns/ai-generator
  → CampaignBriefGenerator.tsx
GET /app/campaigns/copilot
  → AICampaignCopilotPage.tsx
GET /app/campaigns/new
GET /app/campaigns/:id
  → CampaignDetails.tsx (create/edit)

// Lead Management
GET /app/leads
  → Leads.tsx (lead dashboard)
GET /app/lead-capture-forms
  → LeadCaptureForms.tsx

// Content Management
GET /app/content
  → Content.tsx (content creation)
GET /app/social
  → Social.tsx (social media)
GET /app/email
  → Email.tsx (email campaigns)

// Analytics & Reporting
GET /app/analytics
  → Analytics.tsx (analytics dashboard)
GET /app/viral-video-marketing
  → ViralVideoMarketing.tsx

// Supporting Features
GET /app/proposals
  → Proposals.tsx (proposal generation)
GET /app/knowledge
  → KnowledgeManagement.tsx (knowledge base)
GET /app/settings
  → Settings.tsx (system configuration)
GET /app/user-manual
  → UserManual.tsx (documentation)
GET /app/connect-platforms
  → ConnectPlatforms.tsx (integrations)
GET /app/landing-page-builder
  → LandingPageBuilder.tsx
GET /app/keyword-research
  → KeywordResearch.tsx
```

### Public Pages

**File**: `/Users/thabonel/Code/action-insight-pilot/src/pages/Index.tsx`

**Purpose**: Landing page logic (redirect authenticated users)

**Logic**:
- If authenticated: Redirect to conversational dashboard
- If not authenticated: Show public homepage

**File**: `/Users/thabonel/Code/action-insight-pilot/src/pages/PublicHomepage.tsx`

**Purpose**: Marketing homepage for unauthenticated users

**Features**:
- Hero section with call-to-action
- Feature highlights (campaigns, leads, content, email, analytics, autopilot)
- Social proof and statistics
- FAQ section
- Support ticket form integration

**File**: `/Users/thabonel/Code/action-insight-pilot/src/pages/auth/AuthPage.tsx`

**Purpose**: Authentication (login/signup) form

**Features**:
- Email/password sign-in
- Account creation with password strength validation
- Form validation using Zod
- Error handling with toast notifications
- Integration with AuthContext

**Related Components**:
- `PasswordStrengthIndicator.tsx` - Password validation UI

---

## Protected Routes

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/ProtectedRoute.tsx`

**Purpose**: Route guard for authenticated-only pages

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Behavior**:
- Checks if user is authenticated via useAuth()
- Shows loading spinner if auth is still loading
- Redirects to /auth if not authenticated
- Renders children if authenticated

---

## Main Layout

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/Layout.tsx`

**Purpose**: Main application layout with sidebar navigation

**Key Features**:
- Sidebar with mode-aware navigation
- User info display (email)
- Mode switcher dropdown
- Logout confirmation dialog
- Icon-based navigation with descriptions

**Navigation Structure**:

**Simple Mode** (2 items):
```
- Autopilot Dashboard (main)
- Autopilot Settings (configuration)
```

**Advanced Mode** (14+ items):
```
- AI Dashboard (conversational)
- Campaigns
- Campaign Management
- Leads
- Content
- Social
- Email
- Analytics
- Viral Video Marketing
- Proposals
- Knowledge
- Settings
- User Manual
- Connect Platforms
```

**Layout Components**:
- Sidebar (navigation)
- Main content area (Outlet for nested routes)
- User section (profile, logout)

**Related Component**: `ModeSwitcher.tsx`
- Allows switching between Simple and Advanced modes
- Updates user preferences in Supabase
- Provides visual indicators for current mode

---

## React Components

### Component Directory Structure

```
src/components/
├── ui/                          # Shadcn/ui components (52 files)
├── layout/                      # Layout components
│   ├── Layout.tsx              # Main layout with sidebar
│   └── ModeSwitcher.tsx        # Mode switching UI
├── dashboard/                   # Dashboard components (19 files)
│   ├── DashboardChatInterface.tsx
│   ├── ChatHistory.tsx
│   ├── ChatInput.tsx
│   ├── ChatMessage.tsx
│   ├── ChatResponse.tsx
│   ├── EnhancedChatInterface.tsx
│   ├── InsightsCards.tsx
│   ├── PerformanceChart.tsx
│   ├── MetricCard.tsx
│   └── ...
├── autopilot/                   # Autopilot feature components (3 files)
│   ├── AutopilotSetupWizard.tsx
│   ├── LeadInbox.tsx
│   └── ActivityFeed.tsx
├── campaigns/                   # Campaign components (13 files)
│   ├── CampaignCreator.tsx
│   ├── CampaignCard.tsx
│   ├── CampaignPerformanceDashboard.tsx
│   └── ...
├── social/                      # Social media components (14 files)
│   ├── SocialAIAssistant.tsx
│   ├── IntelligentPostScheduler.tsx
│   ├── SocialPerformanceDashboard.tsx
│   └── ...
├── content/                     # Content creation components (13 files)
│   ├── IntelligentContentGenerator.tsx
│   ├── ContentAIAssistant.tsx
│   ├── ContentLibrary.tsx
│   └── ...
├── analytics/                   # Analytics components (with predictive)
├── leads/                       # Lead management components
├── settings/                    # Settings components (12 files)
│   ├── AccountSettings.tsx
│   ├── WorkspaceSettings.tsx
│   ├── IntegrationSettings.tsx
│   ├── AdminDashboard.tsx
│   ├── api-keys/             # API key management
│   └── integrations/         # Integration settings
├── knowledge/                   # Knowledge base components
├── auth/                        # Auth-related components
├── onboarding/                  # Onboarding flow
├── proposals/                   # Proposal generation
├── competitive/                 # Competitive intelligence
├── email/                       # Email campaign components
├── admin/                       # Admin dashboard
├── support/                     # Support components
└── ...
```

### Key Component Categories

#### Dashboard Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/dashboard/DashboardChatInterface.tsx`

**Purpose**: Main AI chat interface for conversational dashboard

**Props**:
```typescript
interface DashboardChatInterfaceProps {
  onChatUpdate?: (chatHistory: ChatMessage[]) => void;
}
```

**Key Features**:
- Chat history display
- Message input with form submission
- Typing indicator
- Real-time conversation with AI agents
- Message formatting and display

**Sub-Components Used**:
- `ChatHistory.tsx` - Displays previous messages
- `ChatInput.tsx` - Message input form
- `ChatMessage.tsx` - Individual message display
- `ChatResponse.tsx` - AI response formatting

**Dependencies**:
- `useChatLogic` hook for chat state management
- `apiClient.queryAgent()` for backend communication
- Supabase client for persistence

#### Autopilot Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/autopilot/AutopilotSetupWizard.tsx`

**Purpose**: Multi-step wizard for configuring marketing autopilot

**Stages**:
1. Business Information (description, target audience, budget)
2. Goals Selection (lead generation, revenue, conversions, etc.)
3. AI Strategy Generation (calls backend AI)
4. Configuration Review and Activation

**Key Props**:
```typescript
interface AutopilotSetupWizardProps {
  onComplete: () => void;
}
```

**Features**:
- Multi-step form with navigation
- AI-powered strategy generation
- Budget configuration ($0-50,000+)
- Target audience profiling
- Integration with Supabase for config storage
- User preference update to switch to simple mode

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/autopilot/ActivityFeed.tsx`

**Purpose**: Real-time activity log for autopilot actions

**Features**:
- Displays autopilot-generated activities
- Real-time updates via Supabase subscriptions
- Activity type icons and badges
- Impact metrics display
- Activity metadata (campaigns, videos, budget, etc.)

**Database Table**: `autopilot_activity_log`

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/autopilot/LeadInbox.tsx`

**Purpose**: Simplified lead inbox for autopilot mode users

**Features**:
- Incoming leads display
- Lead scoring visualization
- Quick engagement actions
- Lead details modal

#### Campaign Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/campaigns/IntelligentCampaignCreator.tsx`

**Purpose**: AI-assisted campaign creation interface

**Features**:
- Campaign type selection (social, email, content, paid ads, etc.)
- AI suggestion engine
- Form field auto-completion
- Real-time validation
- Draft saving

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/campaigns/CampaignPerformanceDashboard.tsx`

**Purpose**: Campaign performance metrics and analytics

**Metrics Displayed**:
- Reach and impressions
- Click-through rates
- Conversion rates
- ROI calculations
- Budget spent vs. allocated
- Historical trend charts

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/campaigns/CampaignCard.tsx`

**Purpose**: Card component for campaign list display

**Props**:
```typescript
interface CampaignCardProps {
  campaign: Campaign;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

#### Content Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/content/IntelligentContentGenerator.tsx`

**Purpose**: AI-powered content creation tool

**Supported Content Types**:
- Blog posts
- Social media captions
- Email copy
- Landing page copy
- Product descriptions
- Ad headlines and copy

**Features**:
- Template selection
- AI generation with customizable tone
- Content optimization recommendations
- Multi-language support
- Plagiarism checking
- SEO optimization suggestions

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/content/ContentLibrary.tsx`

**Purpose**: Browse and manage created content

**Features**:
- Content filtering and search
- Bulk actions (publish, archive, delete)
- Performance metrics per content
- Content scheduling
- Repurposing to multiple channels

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/content/ContentPerformanceDashboard.tsx`

**Purpose**: Content performance analytics

**Metrics**:
- Engagement rates
- Reach and impressions
- Click-through rates
- Conversion attribution
- A/B test results

#### Social Media Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/social/EnhancedSocialDashboard.tsx`

**Purpose**: Main social media management interface

**Key Sections**:
- Performance dashboard
- Intelligent post scheduler
- Engagement pattern analysis
- Workflow automation
- Platform optimization

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/social/IntelligentPostScheduler.tsx`

**Purpose**: Smart scheduling for social media posts

**Features**:
- Optimal posting time prediction
- Multi-platform scheduling
- Bulk scheduling
- Calendar view
- Draft management
- Schedule preview

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/social/SocialAIAssistant.tsx`

**Purpose**: AI copilot for social media content

**Features**:
- Content suggestions based on trends
- Caption generation and optimization
- Hashtag recommendations
- Engagement boosting tips
- Competitor analysis insights

#### Analytics Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/analytics/IntelligentDashboards.tsx`

**Purpose**: Customizable analytics dashboards

**Dashboard Types**:
- Campaign performance
- Channel performance
- Lead source analysis
- Revenue attribution
- ROI tracking

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/analytics/PredictiveAnalytics.tsx`

**Purpose**: AI-powered predictive analytics

**Predictions**:
- Lead conversion probability
- Campaign performance forecasting
- Budget optimization recommendations
- Churn risk identification
- Growth opportunity identification

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/analytics/AnalyticsAIAssistant.tsx`

**Purpose**: Conversational analytics assistant

**Features**:
- Natural language query processing
- Automated insight generation
- Anomaly detection alerts
- Recommendation engine

#### Settings Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/settings/AccountSettings.tsx`

**Purpose**: User account management

**Features**:
- Profile information editing
- Email management
- Password change
- Account deletion
- Session management

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/settings/WorkspaceSettings.tsx`

**Purpose**: Workspace/organization configuration

**Features**:
- Workspace name and branding
- Member management
- Role and permission assignment
- Billing information
- API credentials

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/settings/IntegrationSettings.tsx`

**Purpose**: Third-party integrations management

**Integrations Supported**:
- Social platforms (Facebook, Instagram, Twitter, LinkedIn, TikTok)
- Email services (Gmail, Outlook, Custom SMTP)
- CRM systems
- Analytics platforms
- E-commerce platforms

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/settings/UserApiKeysSettings.tsx`

**Purpose**: Manage user-provided API keys securely

**Supported Keys**:
- Google Gemini API key
- OpenAI API key
- Anthropic Claude API key
- Custom integration keys

**Security Features**:
- Encrypted storage in `user_secrets` table
- Key masking in UI (showing only last 4 chars)
- Edge Function-based management (`manage-user-secrets`)
- Last used timestamp tracking

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/settings/AdminDashboard.tsx`

**Purpose**: System administration interface (admin-only)

**Features**:
- User management
- System health monitoring
- Error tracking
- Performance metrics
- Support ticket management
- Feature flags management

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/settings/SupportTickets.tsx`

**Purpose**: Support ticket system for users

**Features**:
- Create support tickets
- View ticket history
- Track ticket status
- Live chat support integration
- Knowledge base articles

#### Knowledge Management

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/knowledge/KnowledgeManagement.tsx`

**Purpose**: Manage knowledge base for AI agents

**Features**:
- Knowledge bucket creation (campaign-specific and general)
- Document upload and management
- Knowledge search interface
- Document categorization
- Usage analytics per bucket

**Sub-Components**:
- `CreateBucketDialog.tsx` - Create new knowledge buckets
- `BucketCard.tsx` - Display bucket information
- `DocumentUploadDialog.tsx` - Upload documents
- `KnowledgeSearch.tsx` - Search knowledge base

#### Authentication Components

**File**: `/Users/thabonel/Code/action-insight-pilot/src/components/auth/PasswordStrengthIndicator.tsx`

**Purpose**: Display password strength requirements and validation

**Props**:
```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange: (isValid: boolean) => void;
}
```

**Requirements Checked**:
- Minimum length (8+ characters)
- Uppercase letters (A-Z)
- Lowercase letters (a-z)
- Numbers (0-9)
- Special characters (!@#$%^&*)

### UI Components (Shadcn/ui)

All shadcn/ui components are available in `/src/components/ui/`:

**Form Components**:
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line text
- `select.tsx` - Dropdown select
- `checkbox.tsx` - Checkbox input
- `radio-group.tsx` - Radio button group
- `toggle.tsx` - Toggle switch
- `switch.tsx` - Toggle switch variant
- `label.tsx` - Form label
- `form.tsx` - Form wrapper with React Hook Form integration

**Layout Components**:
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialog
- `alert-dialog.tsx` - Confirmation dialog
- `sheet.tsx` - Side panel
- `drawer.tsx` - Drawer panel
- `tabs.tsx` - Tabbed interface
- `accordion.tsx` - Accordion/collapse
- `collapsible.tsx` - Collapsible section
- `separator.tsx` - Divider line

**Navigation Components**:
- `navigation-menu.tsx` - Navigation menu
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Pagination controls
- `menubar.tsx` - Menu bar
- `dropdown-menu.tsx` - Dropdown menu
- `context-menu.tsx` - Right-click context menu

**Data Display Components**:
- `table.tsx` - Table display
- `badge.tsx` - Badge/tag
- `avatar.tsx` - User avatar
- `progress.tsx` - Progress bar
- `slider.tsx` - Range slider
- `carousel.tsx` - Image carousel

**Feedback Components**:
- `alert.tsx` - Alert message
- `toast.tsx` - Toast notification
- `toaster.tsx` - Toast container
- `sonner.tsx` - Toast library wrapper
- `hover-card.tsx` - Hover popover
- `popover.tsx` - Click popover
- `tooltip.tsx` - Tooltip

**Other Components**:
- `button.tsx` - Button styles
- `aspect-ratio.tsx` - Aspect ratio container
- `skeleton.tsx` - Loading skeleton
- `scroll-area.tsx` - Scrollable area
- `resizable.tsx` - Resizable panes
- `chart.tsx` - Chart utilities
- `loading-spinner.tsx` - Loading spinner
- `error-boundary.tsx` - Error boundary
- `input-otp.tsx` - OTP input

---

## State Management

### Context Providers

#### 1. AuthContext

**File**: `/Users/thabonel/Code/action-insight-pilot/src/contexts/AuthContext.tsx`

**Purpose**: Global authentication state management

**Interface**:
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
```

**Key Features**:
- User session management
- Sign in/up/out functionality
- Password strength validation on signup
- Real-time auth state listener
- Session persistence

**Usage**:
```typescript
const { user, loading, signIn, signUp, signOut, isAuthenticated } = useAuth();
```

**Database Integration**:
- Supabase authentication
- User table in Supabase

#### 2. UserModeContext

**File**: `/Users/thabonel/Code/action-insight-pilot/src/contexts/UserModeContext.tsx`

**Purpose**: Manage simple vs advanced interface mode

**Interface**:
```typescript
interface UserModeContextType {
  mode: UserMode; // 'simple' | 'advanced'
  isLoading: boolean;
  setMode: (mode: UserMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}
```

**Key Features**:
- Mode persistence in database
- Real-time mode change subscriptions
- Optimistic UI updates
- Auto-revert on errors

**Usage**:
```typescript
const { mode, isLoading, setMode, toggleMode } = useUserMode();
```

**Database Integration**:
- Stores in `user_preferences` table
- Column: `interface_mode` ('simple' | 'advanced')
- Supabase real-time subscriptions for sync

**Navigation Impact**:
- **Simple Mode**: 2 navigation items (Autopilot only)
- **Advanced Mode**: 14+ navigation items (full platform)

#### 3. OnboardingContext

**File**: `/Users/thabonel/Code/action-insight-pilot/src/contexts/OnboardingContext.tsx`

**Purpose**: Manage onboarding tutorial flow

**Interface**:
```typescript
interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (steps: OnboardingStep[]) => void;
  startDefaultOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}
```

**Features**:
- Step-by-step guided tours
- Persists completion state to localStorage
- Default onboarding on first visit
- Customizable step actions

**Default Steps**:
1. Welcome
2. Navigation overview
3. Campaign creation
4. Lead management
5. Help resources

#### 4. ContentIdeasContext

**File**: `/Users/thabonel/Code/action-insight-pilot/src/contexts/ContentIdeasContext.tsx`

**Purpose**: Manage content ideas across the application

**Interface**:
```typescript
interface ContentIdeasContextType {
  contentIdeas: ContentIdea[];
  setContentIdeas: (ideas: ContentIdea[]) => void;
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  removeContentIdea: (id: string) => void;
  getRecentIdeas: (days?: number) => ContentIdea[];
}

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  source: string;
  trending: number;
  tags: string[];
  createdAt: Date;
}
```

**Features**:
- In-memory content idea storage
- Recent ideas filtering
- Idea creation and deletion
- Trending score tracking

### Custom Hooks

#### Core Hooks

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useUserMode.ts`

**Purpose**: Access user interface mode

**Returns**:
```typescript
{
  mode: 'simple' | 'advanced',
  isLoading: boolean,
  setMode: (mode) => Promise<void>,
  toggleMode: () => Promise<void>
}
```

#### Data Fetching Hooks

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useCampaigns.ts`

**Purpose**: Campaign CRUD and listing operations

**Returns**:
```typescript
{
  campaigns: Campaign[],
  isLoading: boolean,
  error: string | null,
  loadCampaigns: () => Promise<void>,
  createCampaign: (data) => Promise<Campaign>,
  updateCampaign: (id, updates) => Promise<Campaign>,
  deleteCampaign: (id) => Promise<void>
}
```

**Database Integration**:
- Maps database types to interface types
- Parses JSONB fields from Supabase
- Real-time subscriptions for campaign updates

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useAnalytics.ts`

**Purpose**: Track user analytics and form interactions

**Returns**:
```typescript
{
  trackEvent: (eventType, eventData) => Promise<void>,
  trackFieldFocus: (fieldName) => Promise<void>,
  trackFieldBlur: (fieldName, isEmpty, timeSpent) => Promise<void>,
  trackAIAssistanceUsed: (assistanceType, fieldName) => Promise<void>,
  trackFormSubmit: (success, errorMessage) => Promise<void>
}
```

**Database Integration**:
- Stores in `user_analytics_events` table
- Only persists critical events to avoid noise

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useChatLogic.tsx`

**Purpose**: Manage conversational dashboard chat state

**Returns**:
```typescript
{
  chatMessage: string,
  setChatMessage: (msg) => void,
  chatHistory: ChatMessage[],
  isTyping: boolean,
  handleChatSubmit: (e) => Promise<void>,
  sendMessage: (message, agentType) => Promise<void>,
  user: { id: string, name: string }
}
```

**Features**:
- Message history management
- Typing state
- Agent response integration
- Error handling with toasts

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useProposals.ts`

**Purpose**: Proposal management CRUD

**Returns**:
```typescript
{
  proposals: Proposal[],
  isLoading: boolean,
  error: string | null,
  createProposal: (data) => Promise<Proposal>,
  updateProposal: (id, updates) => Promise<Proposal>,
  deleteProposal: (id) => Promise<void>,
  generateFromCampaign: (campaignId) => Promise<Proposal>
}
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useIntegrations.ts`

**Purpose**: Manage third-party integrations

**Returns**:
```typescript
{
  integrations: IntegrationConnection[],
  isLoading: boolean,
  addIntegration: (type, credentials) => Promise<void>,
  removeIntegration: (id) => Promise<void>,
  testConnection: (id) => Promise<boolean>,
  syncData: (id) => Promise<void>
}
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useKeywordResearch.ts`

**Purpose**: Keyword research and SEO tools

**Returns**:
```typescript
{
  keywords: KeywordData[],
  isLoading: boolean,
  searchKeywords: (query) => Promise<void>,
  analyzeCompetition: (keyword) => Promise<CompetitionData>,
  generateContentIdeas: (keywords) => Promise<string[]>
}
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useKnowledge.ts`

**Purpose**: Knowledge base bucket management

**Returns**:
```typescript
{
  buckets: KnowledgeBucket[],
  isLoading: boolean,
  createBucket: (name, type) => Promise<KnowledgeBucket>,
  uploadDocument: (bucketId, file) => Promise<void>,
  searchKnowledge: (query) => Promise<KnowledgeDocument[]>
}
```

#### UI State Hooks

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useToast.tsx` (shadcn/ui)

**Purpose**: Toast notification management

**Returns**:
```typescript
{
  toast: (options) => void
}
```

**Usage**:
```typescript
const { toast } = useToast();
toast({
  title: "Success",
  description: "Operation completed",
  variant: "default" | "destructive"
});
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/use-mobile.tsx`

**Purpose**: Detect mobile screen size

**Returns**:
```typescript
boolean // true if screen width < 768px
```

#### Advanced Hooks

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useEnhancedChat.tsx`

**Purpose**: Advanced chat with streaming and real-time updates

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useDataPrivacy.ts`

**Purpose**: Handle data privacy and GDPR compliance

**Returns**:
```typescript
{
  exportUserData: () => Promise<void>,
  deleteAllUserData: () => Promise<void>,
  requestDataPortability: () => Promise<Blob>,
  updateConsentPreferences: (prefs) => Promise<void>,
  getConsentStatus: () => Promise<ConsentData>
}
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useSecureOAuth.ts`

**Purpose**: Secure OAuth integration with social platforms

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useUserRole.ts`

**Purpose**: Manage user role and permissions

**Returns**:
```typescript
{
  role: 'user' | 'admin' | 'organization_owner',
  loading: boolean,
  hasPermission: (permission: string) => boolean,
  updateRole: (role) => Promise<void>
}
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useRateLimiter.ts`

**Purpose**: Client-side rate limiting for API calls

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useRetry.tsx`

**Purpose**: Automatic retry logic with exponential backoff

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useErrorHandler.tsx`

**Purpose**: Global error handling and recovery

**File**: `/Users/thabonel/Code/action-insight-pilot/src/hooks/useSystemMetrics.ts`

**Purpose**: Monitor system health and performance

---

## Services & Libraries

### API Client Architecture

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/api-client.ts`

**Purpose**: Main API client for backend communication

**Key Methods**:
```typescript
// Campaign operations
apiClient.getCampaigns(): Promise<ApiResponse<Campaign[]>>
apiClient.getCampaignById(id: string): Promise<ApiResponse<Campaign>>
apiClient.createCampaign(data: Campaign): Promise<ApiResponse<Campaign>>
apiClient.updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>>
apiClient.deleteCampaign(id: string): Promise<ApiResponse<void>>

// Agent queries
apiClient.queryAgent(query: string, context?: any): Promise<ApiResponse<any>>

// Analytics
apiClient.getAnalytics(filters: any): Promise<ApiResponse<AnalyticsData>>

// Content
apiClient.generateContent(prompt: string, type: string): Promise<ApiResponse<string>>

// Social
apiClient.postToSocial(platforms: string[], content: any): Promise<ApiResponse<any>>

// User preferences
apiClient.getUserPreferences(): Promise<ApiResponse<UserPreferences>>
apiClient.updateUserPreferences(prefs: UserPreferences): Promise<ApiResponse<UserPreferences>>
```

**Features**:
- Automatic token retrieval from Supabase auth
- Request/response interceptors
- Error handling
- Type-safe responses with ApiResponse wrapper
- Database type-to-interface mapping
- JSONB field parsing

**Architecture**:
```
api-client.ts (main client)
├── api/
│   ├── campaigns-service.ts
│   ├── analytics-service.ts
│   ├── social-service.ts
│   ├── content-service.ts
│   ├── leads-service.ts
│   └── ... (domain-specific services)
├── http-client.ts (low-level HTTP wrapper)
└── api-client-interface.ts (TypeScript interfaces)
```

### Service Files

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/secrets-service.ts`

**Purpose**: Secure API key management

**Methods**:
```typescript
SecretsService.saveSecret(serviceName: string, value: string): Promise<void>
SecretsService.getSecret(serviceName: string): Promise<string>
SecretsService.deleteSecret(serviceName: string): Promise<void>
SecretsService.listSecrets(): Promise<SecretMetadata[]>
SecretsService.hasSecret(serviceName: string): Promise<boolean>
```

**Supported Services**:
- `gemini_api_key_encrypted`
- `openai_api_key_encrypted`
- `anthropic_api_key_encrypted`
- Custom integration keys

**Backend Integration**:
- Uses Supabase Edge Function: `manage-user-secrets`
- Encrypted storage in `user_secrets` table
- Service name based on key pattern

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/user-preferences-service.ts`

**Purpose**: User preference management

**Methods**:
```typescript
userPreferencesService.getUserPreferences(category?: string)
userPreferencesService.updateUserPreferences(category: string, data: Partial<UserPreferences>)
userPreferencesService.getGeneralPreferences()
userPreferencesService.updateGeneralPreferences(data)
userPreferencesService.resetPreferences()
```

**Preference Categories**:
- `general` - General preferences
- `notifications` - Notification settings
- `interface` - UI preferences
- Custom categories per domain

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/chat-agent-router.ts`

**Purpose**: Route chat queries to appropriate AI agents

**Query Types**:
```typescript
enum QueryType {
  'daily_focus',           // Daily focus briefing
  'campaign_analysis',     // Campaign performance analysis
  'lead_analysis',        // Lead insights
  'content_strategy',     // Content recommendations
  'performance_metrics',  // Key metrics
  // ... more types
}
```

**Routing Logic**:
```typescript
ChatAgentRouter.routeQuery(query: string, userId: string, context?: any)
  └── Determines query type using QueryProcessor
      └── Routes to appropriate agent
          ├── DailyFocusAgent (daily_focus)
          └── GeneralCampaignAgent (all others)
```

**Error Handling**:
- Server sleeping detection (503 errors)
- Network error recovery
- Graceful fallback responses
- Health check before routing

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/conversational-service.ts`

**Purpose**: Process conversational queries

**Methods**:
```typescript
ConversationalService.processQuery(query: ConversationalQuery): Promise<ConversationalResponse>
ConversationalService.generateSuggestions(context: any): Promise<string[]>
ConversationalService.fetchCampaignData(): Promise<any[]>
```

**Response Format**:
```typescript
interface ConversationalResponse {
  response: string;
  suggestions?: string[];
  followUp?: string[];
  metadata?: any;
}
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/knowledge-service.ts`

**Purpose**: Knowledge base management for AI agents

**Methods**:
```typescript
KnowledgeService.createBucket(name: string, type: 'campaign' | 'general'): Promise<KnowledgeBucket>
KnowledgeService.uploadDocument(bucketId: string, file: File): Promise<void>
KnowledgeService.searchKnowledge(query: string, bucketId?: string): Promise<KnowledgeDocument[]>
```

**Database Tables**:
- `knowledge_buckets` - Buckets for organizing knowledge
- `knowledge_documents` - Uploaded documents

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/content-scheduling-service.ts`

**Purpose**: Schedule content publication across channels

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/mcp-service.ts`

**Purpose**: Model Context Protocol integration

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/profile-service.ts`

**Purpose**: User profile management

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/services/system-metrics-service.ts`

**Purpose**: Monitor system health and performance

### Utilities & Helpers

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/strategic-marketing-prompts.ts`

**Purpose**: Core strategic marketing framework with 10 prompts

**Prompts Included**:

1. **strategy-001**: Brand Positioning (3Cs Analysis)
   - Company, Customer, Competition analysis
   - Outputs positioning statement, differentiators, brand tone

2. **strategy-002**: Customer Persona Builder
   - Generates 2-3 detailed personas
   - Includes demographics, motivations, pain points, preferences

3. **strategy-003**: Message Crafting (3-Tier Framework)
   - Emotional hook, practical value, credibility proof
   - Tone-aligned messaging

4. **strategy-004**: Offer & Funnel Design
   - Awareness → Engagement → Conversion → Retention stages
   - Stage-appropriate offers and automation

5. **strategy-005**: 30-Day Content Strategy
   - Authenticity and storytelling focus
   - Day-by-day content plan

6. **strategy-006**: Full Campaign Generator
   - Complete campaign assets in one go
   - Headline, tagline, ad copy, CTA, landing page

7. **strategy-007**: SEO & Keyword Framework
   - Awareness/Consideration/Purchase keywords
   - Content titles per keyword group

8. **strategy-008**: Competitor Gap Analyzer
   - Identify gaps in messaging, channels, audience
   - Ownable differentiator recommendations

9. **strategy-009**: Performance Tracker Framework
   - Non-marketer-friendly KPI framework
   - Automation suggestions

10. **strategy-010**: Marketing Review & Pivot
    - What's working/not working analysis
    - Quick wins, experiments, long-term shifts

**Usage**:
```typescript
import { getPromptById, parsePromptTemplate, validatePromptInputs } from '@/lib/strategic-marketing-prompts';

const prompt = getPromptById('strategy-001');
const validation = validatePromptInputs(prompt, inputs);
const parsed = parsePromptTemplate(prompt.userPromptTemplate, inputs);
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/campaign-questions.ts`

**Purpose**: Guided campaign creation questions

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/campaign-templates.ts`

**Purpose**: Pre-built campaign templates

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/campaign-brief-generator.ts`

**Purpose**: Auto-generate campaign briefs

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/campaign-parser.ts`

**Purpose**: Parse campaign data structures

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/behavior-tracker.ts`

**Purpose**: Track user behavior and feature usage

**Methods**:
```typescript
behaviorTracker.trackFeatureStart(featureName: string): string
behaviorTracker.trackFeatureComplete(featureName: string, trackingId: string): void
behaviorTracker.trackAction(category: string, action: string, metadata?: any): void
behaviorTracker.trackError(error: Error, context?: any): void
```

**Usage**: Frequently used in pages for feature analytics

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/viral-prompts-library.ts`

**Purpose**: Prompts for viral content generation

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/utils.ts`

**Purpose**: General utility functions

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/utils/query-processor.ts`

**Purpose**: Process and categorize user queries

**Methods**:
```typescript
QueryProcessor.determineQueryType(query: string): QueryType
QueryProcessor.formatAgentResponse(response: any, queryType: QueryType, context: any): FormattedResponse
QueryProcessor.extractKeywords(query: string): string[]
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/validation/input-sanitizer.ts`

**Purpose**: Input validation and sanitization

**Methods**:
```typescript
validatePasswordStrength(password: string): ValidationResult
sanitizeInput(input: string): string
validateEmail(email: string): boolean
```

### Supabase Integration

**File**: `/Users/thabonel/Code/action-insight-pilot/src/integrations/supabase/client.ts`

**Purpose**: Supabase client initialization and OAuth helpers

**Features**:
```typescript
// OAuth service
oauthService.initiateOAuth(platform: string)
oauthService.getConnections()
oauthService.disconnectPlatform(platform: string)
oauthService.postToSocial(platforms: string[], content: any)
```

**Configuration**:
```
SUPABASE_URL: https://kciuuxoqxfsogjuqflou.supabase.co
SUPABASE_ANON_KEY: [provided in client.ts]
```

**File**: `/Users/thabonel/Code/action-insight-pilot/src/lib/supabase.ts`

**Purpose**: Supabase auth service and utilities

**Methods**:
```typescript
AuthService.signUp(email: string, password: string)
AuthService.signIn(email: string, password: string)
AuthService.signOut()
AuthService.resetPassword(email: string)
AuthService.getCurrentUser()
AuthService.onAuthStateChange(callback)
```

---

## Key Features

### 1. Marketing Autopilot System

**Location**: `/app/autopilot` (simple mode)

**Pages**:
- `/app/autopilot` - SimpleDashboard.tsx (main autopilot view)
- `/app/autopilot/setup` - AutopilotSetup.tsx (configuration wizard)

**Key Components**:
- `AutopilotSetupWizard.tsx` - 4-step setup
- `LeadInbox.tsx` - Lead management
- `ActivityFeed.tsx` - Activity log

**Database Tables**:
- `marketing_autopilot_config` - Configuration per user
- `autopilot_activity_log` - Activity history
- `autopilot_weekly_reports` - Generated reports

**Cron Jobs**:
- Daily at 2 AM UTC - Supabase Edge Function

**Features**:
- AI-generated marketing strategy
- Automatic campaign optimization
- Budget management
- Video ad generation for low-engagement campaigns
- Weekly performance reports
- Real-time activity feed

### 2. AI Video Generator

**Location**: `/app/studio/ai-video` (via pages/AIVideoStudio.tsx)

**Features**:
- Video goal specification
- Platform selection (YouTube Short, TikTok, Reels, Landscape)
- Duration configuration
- Brand kit customization
- Scene-based video planning
- AI image generation
- Video export

**Models Used**:
- Google Veo 3 (video generation)
- Nano Banana (image generation)

**Pricing**:
- Veo 3 Fast: $0.40/second
- Veo 3 Standard: $0.75/second
- Nano Banana: $0.039/image

**Database Tables**:
- `ai_video_projects` - Project storage
- `ai_video_jobs` - Job queue tracking

### 3. Conversational Dashboard

**Location**: `/app/conversational-dashboard`

**Component**: `DashboardChatInterface.tsx`

**Features**:
- AI chat with natural language queries
- Campaign performance analysis
- Lead insights
- Content recommendations
- Real-time agent responses
- Chat history persistence
- Context-aware suggestions

**Chat Agent Routing**:
- Daily focus agent
- Campaign analysis agent
- Lead analysis agent
- Content strategy agent
- Performance metrics agent

### 4. Campaign Management Suite

**Location**: `/app/campaigns` and related routes

**Pages**:
- `/app/campaigns` - Campaign list
- `/app/campaigns/new` - Create campaign
- `/app/campaigns/:id` - Edit campaign
- `/app/campaign-management` - Management interface
- `/app/campaigns/ai-generator` - AI brief generator
- `/app/campaigns/copilot` - AI copilot

**Features**:
- Campaign CRUD operations
- AI-assisted campaign creation
- Performance dashboards
- Multi-channel campaign support
- Budget tracking and allocation
- A/B testing support
- Compliance checklist

**Campaign Types**:
- Social media
- Email
- Content
- Paid ads
- SEO
- Partnership

**Database Table**: `campaigns`

### 5. Lead Management

**Location**: `/app/leads`

**Pages**:
- `/app/leads` - Lead dashboard
- `/app/lead-capture-forms` - Form builder

**Components**:
- Lead scoring dashboard
- Adaptive lead search
- Conversion pattern analysis
- Smart lead lists
- Lead workflow automation
- AI lead assistant

**Features**:
- Automated lead scoring
- Lead segmentation
- Conversion probability prediction
- Lead activity tracking
- Export to CSV
- Lead nurturing workflows

**Database Table**: `leads`

### 6. Content Management & AI Generation

**Location**: `/app/content`

**Components**:
- Intelligent content generator
- Content library
- Performance dashboard
- Optimization panel
- Repurposing engine
- Scheduling dialog
- Content ideas manager

**Content Types**:
- Blog posts
- Social media captions
- Email campaigns
- Landing pages
- Ad copy
- Product descriptions

**Features**:
- Multi-format generation
- Tone customization
- SEO optimization
- Plagiarism checking
- Scheduling across channels
- Performance tracking

**Database Table**: `content`

### 7. Social Media Management

**Location**: `/app/social`

**Components**:
- Social dashboard
- Intelligent post scheduler
- Engagement pattern analysis
- Workflow automation
- Platform optimization
- Real-time metrics
- AI assistant

**Features**:
- Multi-platform scheduling
- Optimal posting time prediction
- Engagement tracking
- Competitor analysis
- Platform-specific optimization
- Bulk scheduling
- Draft management

**Supported Platforms**:
- Facebook
- Instagram
- Twitter/X
- LinkedIn
- TikTok
- Pinterest
- YouTube

**Database Table**: `social_posts`

### 8. Analytics & Insights

**Location**: `/app/analytics`

**Components**:
- Intelligent dashboards
- Performance insights
- Predictive analytics
- Reporting features
- AI analytics assistant

**Metrics Tracked**:
- Reach and impressions
- Engagement rates
- Click-through rates
- Conversion rates
- ROI
- Customer acquisition cost
- Lifetime value

**Predictions**:
- Lead conversion probability
- Campaign performance forecasting
- Revenue attribution
- Churn risk identification

**Database Tables**:
- `analytics_events` - Raw events
- `campaign_metrics` - Aggregated metrics

### 9. Proposals & Contracts

**Location**: `/app/proposals`

**Features**:
- AI proposal generation
- Template library
- E-signature integration
- Tracking and analytics
- Client portal

**Database Table**: `proposals`

### 10. Settings & Administration

**Location**: `/app/settings`

**Tabs**:
- Workspace settings
- Account & Privacy
- Users & Roles
- AI Behavior customization
- Integrations
- Export & Backup
- Admin Dashboard

**Features**:
- User management
- Role-based access control
- API key management (encrypted)
- Integration configuration
- Data export/import
- System health monitoring
- Support ticket management

---

## Integration Points

### Backend API Integration

**Backend URL**: `import.meta.env.VITE_BACKEND_URL` (from env)

**Authentication**:
- Supabase JWT tokens in Authorization header
- Automatic token refresh
- Session management

**API Endpoints** (via FastAPI):
```
POST /api/campaigns
GET /api/campaigns
GET /api/campaigns/{id}
PUT /api/campaigns/{id}
DELETE /api/campaigns/{id}

POST /api/content/generate
POST /api/social/post
POST /api/leads/score
POST /api/ai-video/plan
POST /api/ai-video/generate-images
POST /api/ai-video/generate-video
```

### Supabase Integration

**Database**:
- PostgreSQL backend
- Real-time subscriptions for collaborative features
- Row-level security policies
- Edge Functions for complex operations

**Key Tables**:
```
users
campaigns
content
leads
social_posts
proposals
user_preferences
user_secrets (encrypted API keys)
marketing_autopilot_config
autopilot_activity_log
knowledge_buckets
knowledge_documents
ai_video_projects
ai_video_jobs
```

**Real-time Features**:
- User mode changes
- Autopilot activities
- Chat messages
- Lead updates
- Campaign status changes

**Edge Functions**:
- `manage-user-secrets` - API key management
- `ai-campaign-assistant` - Campaign AI
- `autopilot-orchestrator` - Autopilot automation
- `social-post` - Social media posting
- `brand-positioning-agent` - Brand analysis
- `funnel-design-agent` - Funnel creation
- `competitor-gap-agent` - Competitive analysis
- `performance-tracker-agent` - KPI setup

### Third-Party Integrations

**Social Platforms**:
- Facebook/Instagram (OAuth)
- Twitter/X (API v2)
- LinkedIn (OAuth)
- TikTok (OAuth)
- Pinterest (API)
- YouTube (OAuth)

**Email Services**:
- Gmail (OAuth)
- Outlook (OAuth)
- Custom SMTP

**Analytics**:
- Google Analytics (OAuth)
- Mixpanel
- Segment

**CRM**:
- HubSpot
- Salesforce
- Pipedrive

**E-Commerce**:
- Shopify
- WooCommerce
- BigCommerce

**AI Models**:
- OpenAI (GPT-4, GPT-5)
- Anthropic Claude (Opus, Sonnet)
- Google Gemini (Veo 3, Nano Banana)
- Mistral AI

---

## Data Flow

### Campaign Creation Flow

```
User Input (CampaignCreator.tsx)
    ↓
AI Enhancement (optional)
    ↓
API Call (apiClient.createCampaign)
    ↓
Backend FastAPI Route (/api/campaigns)
    ↓
Database Insert (campaigns table)
    ↓
Real-time Update (Supabase subscription)
    ↓
UI Update (campaigns list refreshed)
    ↓
Activity Log (autopilot_activity_log)
```

### Content Generation Flow

```
User Input (IntelligentContentGenerator.tsx)
    ↓
Format Selection + Parameters
    ↓
API Call (apiClient.generateContent)
    ↓
Backend Routes to AI Service
    ↓
AI Model Processing (OpenAI/Claude/Gemini)
    ↓
Response Processing
    ↓
Database Storage (content table)
    ↓
UI Display + Editing Options
    ↓
Scheduling or Publishing
```

### Chat/Conversational Flow

```
User Message (ChatInput.tsx)
    ↓
useChatLogic Hook
    ↓
ChatAgentRouter (determine query type)
    ↓
Route to Appropriate Agent
    ↓
Backend Processing (FastAPI)
    ↓
Context Fetching (campaigns, leads, etc.)
    ↓
AI Agent Processing
    ↓
Response Formatting
    ↓
UI Display (ChatHistory.tsx)
    ↓
Suggestion Generation
```

### Autopilot Setup Flow

```
AutopilotSetupWizard (Step 1-3: Collect Config)
    ↓
AI Strategy Generation (Step 4)
    ↓
Backend Edge Function (ai-campaign-assistant)
    ↓
Strategy Processing by AI
    ↓
Response Formatting
    ↓
Review Display
    ↓
Database Storage (marketing_autopilot_config)
    ↓
User Mode Switch (simple)
    ↓
Redirect to SimpleDashboard
```

### Video Generation Flow

```
AIVideoStudio.tsx (Plan Input)
    ↓
Generate Video Plan (AI planning)
    ↓
Collect Plan Data
    ↓
Scene Board Planning
    ↓
Generate Images (Nano Banana)
    ↓
Generate Video (Veo 3)
    ↓
Project Storage (ai_video_projects)
    ↓
Job Tracking (ai_video_jobs)
    ↓
Download/Export
```

---

## Best Practices

### Component Organization

1. **File Structure**:
   - One component per file
   - Related types in same file or types/ directory
   - Tests in __tests__ subdirectory

2. **Props**:
   - Define explicit interface for props
   - Export interfaces for external use
   - Use discriminated unions for complex props

3. **State Management**:
   - Prefer Context for global state
   - Use hooks for local state
   - Consider custom hooks for complex logic

### Error Handling

1. **API Calls**:
   - Always wrap in try/catch
   - Use ApiResponse wrapper
   - Provide user-friendly error messages

2. **User Feedback**:
   - Use toast notifications for non-critical errors
   - Use dialog for critical errors
   - Provide recovery actions when possible

3. **Logging**:
   - Console errors for debugging
   - Database logging for critical events
   - Analytics tracking for feature usage

### Performance

1. **Code Splitting**:
   - Use lazy loading for pages
   - Implement route-based code splitting
   - Load heavy components on demand

2. **Optimization**:
   - Memoize expensive components with React.memo
   - Use useCallback for event handlers
   - Implement virtual scrolling for large lists

3. **Database**:
   - Use indexes on frequently queried columns
   - Implement pagination for large datasets
   - Cache frequently accessed data

### Security

1. **Authentication**:
   - Validate tokens on every request
   - Refresh tokens before expiration
   - Clear sensitive data on logout

2. **API Keys**:
   - Store user API keys encrypted
   - Never commit keys to repository
   - Use environment variables for service keys

3. **Input Validation**:
   - Validate all user inputs
   - Sanitize before storing
   - Use TypeScript for type safety

---

## Configuration & Environment

### Environment Variables

**Frontend** (`.env`):
```
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Build Configuration

**Vite Config** (`vite.config.ts`):
- React plugin enabled
- Path aliases configured (@/*)
- Environment variable handling

### TypeScript Configuration

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Deployment

### Frontend Deployment

**Platforms**: Vercel / Netlify

**Build Command**: `npm run build`

**Output Directory**: `dist/`

**Environment Variables**: Set in platform dashboard

### Backend Deployment

**Platform**: Render

**Build Command**: `pip install -r requirements.txt`

**Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Testing

### Test Setup

**Location**: `src/test/`

**Files**:
- `setup.ts` - Test configuration
- `utils/test-utils.tsx` - Testing utilities

**Framework**: Jest / Vitest

**Library**: React Testing Library

### Test Examples

**Campaign Form Test**: `src/components/forms/__tests__/CampaignForm.test.tsx`

---

## Documentation & Resources

- **CLAUDE.md**: Project instructions and context
- **FRONTEND_ARCHITECTURE.md**: This file
- **API.md**: Backend API reference
- **KNIP.md**: Code cleanup tool guide
- **APPLY_MIGRATIONS.md**: Database migration guide
- **AI-VIDEO-GENERATOR.md**: Video generation guide
- **CONVERSATION.md**: Development history

---

## Summary

This frontend application implements a comprehensive AI-powered marketing platform with:

- **Dual-mode interface** (Simple autopilot vs Advanced full platform)
- **Real-time collaboration** via Supabase
- **AI-powered features** across all domains
- **Modular architecture** with reusable components
- **Type-safe implementation** using TypeScript
- **Secure authentication** via Supabase Auth
- **Encrypted API key management**
- **Analytics and tracking** for insights
- **Responsive design** with Tailwind CSS
- **Comprehensive error handling** and user feedback

The architecture supports rapid feature development while maintaining code quality and user experience standards.

