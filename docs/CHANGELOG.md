# Changelog

All notable changes to the AI Marketing Hub platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-12-28

### Added
- **PageHelpModal Component** - New unified help system component providing context-sensitive help on every page
  - Bottom-right floating help button with modal dialog
  - Automatic content lookup from centralized helpContent.tsx
  - Full accessibility support (keyboard navigation, screen readers, ARIA labels)
  - Dark mode compatible styling
  - Applied consistently across all 26 application pages
- **Component Documentation** - Comprehensive documentation for PageHelpModal in `docs/components/PAGE-HELP-MODAL.md`
  - Usage examples and migration guide
  - Available help keys reference
  - Best practices and troubleshooting
- **Help System Documentation** - Updated user guides to explain in-app help feature
  - `docs/guides/user-guides/getting-started.md`
  - `docs/BIBLE/08-GUIDES/user-guides/getting-started.md`
- **Feature Documentation** - Added help system section to `docs/FEATURES.md`

### Changed
- **Help Center Page** - Cleaned up `/help` page by removing non-functional elements
  - Removed broken "Contact Support" buttons (Live Chat, Email Support, Phone Support)
  - Removed advertised business hours section
  - Streamlined to focus on Getting Started and Documentation tabs
- **Help System UX** - Changed from navigation-based to modal-based pattern
  - Users no longer navigate away from current page for help
  - Help content opens in popup dialog, preserving workflow

### Removed
- **FloatingHelpButton Component** - Deleted obsolete component that used navigation pattern
  - Previously navigated users to `/help` page (breaking workflow)
  - Replaced with PageHelpModal across all pages
- **HelpButton Component** - Deleted redundant modal-based help component
  - Had different positioning and manual content props
  - Consolidated into unified PageHelpModal

### Fixed
- **Help System UX Issue** - Fixed major usability problem where help button navigated users away from their current page
  - Original request: "I need a ? on every page with a popup explaining how to use the page"
  - Resolution: Implemented modal-based help system that opens in-place
- **Broken Buttons** - Removed non-functional buttons from Help Center page
  - Contact Support button had no onClick handler
  - Support contact cards advertised features that don't exist

### Technical Details
- **Files Created**: 1
  - `src/components/common/PageHelpModal.tsx` (65 lines)
- **Files Modified**: 26 pages + 4 documentation files
  - All application pages updated to use PageHelpModal
  - `src/pages/HelpPage.tsx` cleaned up
  - Documentation updated across multiple files
- **Files Deleted**: 2
  - `src/components/common/FloatingHelpButton.tsx`
  - `src/components/common/HelpButton.tsx`
- **Net Code Change**: -153 lines (272 deletions, 119 insertions)
- **Commit**: `21eea7e - Fix Help System - Replace Navigation with Modal Popup`

### Migration Guide

For developers integrating new pages:

**Old Pattern (Deprecated):**
```typescript
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
<FloatingHelpButton helpSection="myPage" />
```

**New Pattern (Current):**
```typescript
import { PageHelpModal } from '@/components/common/PageHelpModal';
<PageHelpModal helpKey="myPage" />
```

**Adding Help Content:**
1. Add entry to `src/config/helpContent.tsx` with your helpKey
2. Add `<PageHelpModal helpKey="yourKey" />` to your page component
3. Test modal opens with correct content

---

## [1.0.0] - 2025-10-08

### Added
- Initial release of AI Marketing Hub platform
- Multi-mode interface (Simple/Autopilot vs Advanced)
- AI Campaign Copilot with 4-agent workflow
- Marketing Autopilot system with daily optimization
- AI Video Generator (Google Veo 3 integration)
- Campaign management system
- Lead management and scoring
- Content generation tools
- Email marketing automation
- Social media management
- Analytics and reporting
- User authentication and authorization
- Role-based access control
- Integration with external platforms
- Comprehensive help content in helpContent.tsx

### Technical Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: FastAPI (Python), Supabase (PostgreSQL)
- AI: OpenAI GPT-5, Google Gemini 2.5, Anthropic Claude
- Deployment: Vercel/Netlify (frontend), Render (backend)

---

[Unreleased]: https://github.com/Thabonel/action-insight-pilot/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Thabonel/action-insight-pilot/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Thabonel/action-insight-pilot/releases/tag/v1.0.0
