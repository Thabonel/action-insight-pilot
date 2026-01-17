# Handover - AI Boost Campaign (January 17, 2026)

This document summarizes the changes completed in the last iteration, the current state of the codebase, and recommendations for next steps. It is intended for engineers picking up the work and for product/QA to validate.

---

## Recent Changes (January 2026)

### Quick Start Campaign Wizard
**Commit:** `ef7ad29` - feat(quick-start): add Quick Start Campaign wizard with AI planning integration

A streamlined 3-step wizard for creating campaigns without going through full autopilot setup:

1. **Step 1 - Name Campaign**: Enter campaign name (required) and select type (optional, defaults to multi_channel)
2. **Step 2 - Upload Documents**: Drag-drop or file picker for .txt, .md, .json, .csv files
3. **Step 3 - Summary**: Review and click "Start Planning with AI"

**Key Files:**
- `src/components/campaigns/QuickStartWizard.tsx` - The wizard component
- `supabase/functions/quick-start-campaign/index.ts` - Backend Edge Function
- `src/lib/logger.ts` - Structured logging utility

**Backend Behavior:**
- Creates a draft campaign in `campaigns` table
- Auto-creates a linked knowledge bucket in `knowledge_buckets` with `bucket_type: 'campaign'`
- If bucket creation fails, rolls back the campaign creation
- Returns both campaign and bucket IDs for frontend use

**UI Integration:**
- SimpleDashboard welcome screen: Subtle "Start a campaign without autopilot" link below main CTA
- SimpleDashboard header: "Start New Campaign" button when autopilot is configured
- Navigates to `/app/conversational-dashboard?campaignId={id}` on completion

### Dashboard Chat AI Integration
**Commits:** `001d6e8`, `83785df`, `c8f5a3c`

Enhanced the conversational dashboard AI chat with:

1. **Knowledge Management Integration**: AI now has access to user's knowledge buckets and documents
2. **Campaign Context**: Accepts `campaignId` URL parameter to load campaign-specific knowledge
3. **Intelligent Campaign Creation**: AI can create campaigns directly from conversation
4. **Updated AI Models**: Using Claude Opus 4.5 (claude-opus-4-5-20251101) and Gemini 3

**Key Files:**
- `supabase/functions/dashboard-chat/index.ts` - Main chat Edge Function
- `src/components/dashboard/DashboardChatInterface.tsx` - Chat UI component
- `src/pages/ConversationalDashboard.tsx` - Dashboard page with URL param handling
- `src/lib/api-client.ts` - API client updates

**Database Tables Used:**
- `knowledge_buckets` - User's document collections
- `knowledge_documents` - Individual documents with content/summaries
- `conversation_campaigns` - Campaign creation tracking from conversations
- `campaigns` - Main campaigns table

### SimpleDashboard Layout Fix
**Issue:** Welcome screen had side-by-side buttons that looked broken
**Fix:** Reverted to original vertical layout with:
- Single prominent "Get Started" button linking to autopilot setup
- "or" separator text
- Subtle link-style button "Start a campaign without autopilot"

---

## Previous Changes (Earlier January 2026)

### Dark Mode Stability
- Strengthened global dark overrides with `html.dark` specificity
- Rewrote input overrides for light/dark support
- Removed white flashes on navigation
- Key files: `src/styles/color-overrides.css`, `src/styles/input-overrides.css`

### Layout Unification & Sidebar UX
- Collapsible sidebar with persisted state and tooltips
- Header branding: LogoMark as "A" in "AI Boost Campaign"
- Files: `src/components/Layout.tsx`, `src/components/layout/Layout.tsx`

### Knowledge Management Viewer/Editor
- View modal with title/content editor
- Actions: Save, Download, Reprocess, Delete
- Service fallbacks for edge-function-first, then direct table operations
- Files: `src/components/knowledge/DocumentViewerDialog.tsx`, `src/lib/services/knowledge-service.ts`

### Settings - Users & Roles
- Fixed 400 error with embedded relation fallback
- File: `src/components/settings/UserRoleManagement.tsx`

### System Preferences
- Prevented empty Select values crash
- Defaults: theme=auto, language=en, timezone=UTC

---

## Current Architecture

### AI Services
All AI features use user-provided API keys (no platform markup):

| Provider | Default Model | Usage |
|----------|--------------|-------|
| Anthropic Claude | claude-opus-4-5-20251101 | Primary AI for all features |
| Google Gemini | gemini-3-flash | Visual AI, video generation |
| Mistral | mistral-large-latest | Fallback option |

**Fallback Order:** Anthropic -> Google -> Mistral -> Error

### Key Edge Functions
| Function | Purpose |
|----------|---------|
| `dashboard-chat` | AI chat with knowledge integration |
| `quick-start-campaign` | Create campaign + bucket in one transaction |
| `knowledge-processor` | Document CRUD, search, reprocess |
| `autopilot-orchestrator` | Daily campaign optimization (2 AM UTC) |

### Database Schema (Key Tables)
```
campaigns
  - id, name, type, status, created_by
  - Links to knowledge_buckets via campaign_id

knowledge_buckets
  - id, name, bucket_type, campaign_id, created_by
  - bucket_type: 'general' | 'campaign'

knowledge_documents
  - id, bucket_id, title, content, summary, status

conversation_campaigns
  - Tracks campaigns created from AI conversations
```

---

## Operational Notes

### Running Locally
```bash
# Frontend
npm install && npm run dev

# Quality checks
npm run type-check
npm run lint
npm run test
npm run build
```

### Pre-Push Quality Gate
The repo has a pre-push hook that runs:
1. TypeScript type check
2. ESLint
3. Frontend tests (Vitest)
4. Backend tests (Pytest - requires Python env)
5. Production build

Bypass with `git push --no-verify` if needed (validate locally first).

### Supabase
- Use singleton client from `@/integrations/supabase/client`
- Edge functions require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- User secrets stored in `user_secrets` table (encrypted)

---

## Verification Checklist

### Quick Start Wizard
- [ ] Click "Start a campaign without autopilot" on SimpleDashboard welcome screen
- [ ] Enter campaign name, click Next
- [ ] Upload 1-2 documents (or skip)
- [ ] Click "Start Planning with AI"
- [ ] Verify: AI Chat opens with campaign context
- [ ] Verify: Campaign appears in Campaigns list as "draft"
- [ ] Verify: Knowledge bucket exists linked to campaign

### Dashboard Chat
- [ ] Navigate to `/app/conversational-dashboard`
- [ ] Send a message - AI should respond
- [ ] Ask about uploaded documents - AI should reference them
- [ ] Navigate with `?campaignId=xxx` - AI should know campaign context

### Dark Mode
- [ ] Toggle dark/light without white flashes on:
  - `/app/conversational-dashboard`
  - `/app/autopilot`
  - `/app/settings`
  - `/app/campaigns`

### Sidebar
- [ ] Collapse/expand persists across navigation
- [ ] Tooltips show on collapsed items

---

## Known Issues / Next Steps

### High Priority
1. **Dependabot Alerts**: 13 vulnerabilities flagged on GitHub (1 critical, 2 high)
   - Review at: https://github.com/Thabonel/action-insight-pilot/security/dependabot

2. **ESLint Warnings**: 49 warnings (mostly `react-hooks/exhaustive-deps`)
   - Not blocking but should be addressed for code quality

3. **Backend Tests**: pytest not available in default Python environment
   - Pre-push hook fails on Step 4 - need to configure Python venv

### Medium Priority
4. **Knowledge Editor Polish**: Swap textarea for MDX/Markdown editor with preview

5. **Edge Function Parity**: Ensure `knowledge-processor` implements all CRUD operations

6. **Dark Mode Audit Rule**: Add pre-push lint for missing `dark:` variants

### Low Priority
7. **Icon Audit**: Flag icon names without corresponding assets

8. **Asset Caching**: Add versioning/cache-busting for deployments

---

## File Structure Reference

```
src/
  components/
    campaigns/
      QuickStartWizard.tsx      # New campaign wizard
    dashboard/
      DashboardChatInterface.tsx # AI chat component
    knowledge/                   # Knowledge management UI
    layout/                      # Sidebar, header
  pages/
    SimpleDashboard.tsx          # Main autopilot dashboard
    ConversationalDashboard.tsx  # AI chat page
  lib/
    services/
      knowledge-service.ts       # Knowledge CRUD operations
    logger.ts                    # Structured logging
    api-client.ts                # Backend API client

supabase/
  functions/
    dashboard-chat/              # AI chat Edge Function
    quick-start-campaign/        # Campaign creation Edge Function
    knowledge-processor/         # Document processing
```

---

## Contact & Ownership

- **Frontend**: `src/components`, `src/pages`, `src/styles`
- **Services**: `src/lib/services/*`, `src/integrations/supabase/*`
- **Edge Functions**: `supabase/functions/*`
- **Documentation**: `docs/`, `CLAUDE.md`

Please reach out if you need a pairing session to walk through any part of this handover.

---

*Last Updated: January 17, 2026*
*Latest Commit: ef7ad29*
