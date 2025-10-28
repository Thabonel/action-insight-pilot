# Frontend Architecture Documentation Index

Welcome! This directory contains comprehensive documentation of the frontend architecture for the Action Insight Marketing Platform.

## Quick Start

**New to the project?** Start here:

1. **FRONTEND_GUIDE.md** - Quick reference guide (best for overview)
2. **FRONTEND_ARCHITECTURE.md** - Complete detailed documentation (2131 lines)
3. **DOCUMENTATION_SUMMARY.txt** - Statistics and metrics

## File Overview

### 1. FRONTEND_GUIDE.md
**What it is**: Quick reference guide with navigation tips
**Best for**: Quick lookups, getting oriented, development tips
**Length**: ~415 lines
**Includes**:
- Quick navigation to key files
- Component directory structure overview
- State management summary
- Services and APIs quick reference
- Routing structure
- Development tips and checklists
- Code quality standards

**Read time**: 15-20 minutes

---

### 2. FRONTEND_ARCHITECTURE.md
**What it is**: Complete, comprehensive documentation
**Best for**: Deep understanding, detailed reference, feature explanation
**Length**: 2131 lines
**Includes**:
- Application overview and entry points
- All 38 pages fully documented
- All 227 components documented
- All 4 context providers explained
- All 40+ custom hooks documented
- All services and libraries explained
- Strategic marketing prompts (10 prompts)
- 10 key features fully documented
- Database integration details
- Integration points (backend, third-party)
- Data flow diagrams
- Best practices and patterns
- Deployment guide
- Testing setup

**Sections**:
- Table of contents (easy navigation)
- File paths for every component
- Props interfaces
- Dependencies
- Usage examples
- Related components

**Read time**: 1-2 hours (or use as reference)

---

### 3. DOCUMENTATION_SUMMARY.txt
**What it is**: High-level overview with statistics
**Best for**: Understanding scope and coverage
**Length**: ~348 lines
**Includes**:
- Coverage statistics (227 components, 38 pages, etc.)
- Feature summary
- Architecture highlights
- Key metrics
- File locations
- How to use the documentation
- Maintenance guidelines

**Read time**: 5-10 minutes

---

## Documentation Statistics

| Metric | Count |
|--------|-------|
| Pages Documented | 38 |
| Components Documented | 227 |
| Custom Hooks Documented | 40+ |
| Context Providers | 4 |
| Services Documented | 12+ |
| Routes Documented | 58+ |
| Database Tables | 14+ |
| Third-party Integrations | 25+ |
| **Total Documentation Lines** | **2,894** |

---

## How to Use This Documentation

### I'm new to the project
1. Read **FRONTEND_GUIDE.md** (overview section)
2. Understand the routing in **AppRouter.tsx** section
3. Learn about state management from **State Management** section
4. Explore components as needed in **FRONTEND_ARCHITECTURE.md**

### I need to add a new feature
1. Find similar feature in **FRONTEND_ARCHITECTURE.md**
2. Check routing structure
3. Review state management approach
4. Follow existing patterns
5. Add to navigation in **Layout.tsx**

### I need to understand a specific component
1. Use Ctrl+F to search **FRONTEND_ARCHITECTURE.md**
2. Find the component section with:
   - File path
   - Purpose
   - Props interface
   - Dependencies
   - Usage examples
   - Related components

### I need to understand API integration
1. Search for "Integration Points" in **FRONTEND_ARCHITECTURE.md**
2. Review backend API endpoints
3. Check Supabase integration
4. Review third-party integrations

### I need to fix a bug
1. Use **FRONTEND_ARCHITECTURE.md** to understand component
2. Check dependencies and related components
3. Review error handling patterns in "Best Practices" section
4. Check "Data Flow" section for integration issues

---

## Key Sections to Know

### In FRONTEND_ARCHITECTURE.md

**Critical Sections**:
- [Application Architecture Overview](#application-architecture-overview)
- [Pages & Routing](#pages--routing)
- [React Components](#react-components)
- [State Management](#state-management)
- [Services & Libraries](#services--libraries)
- [Key Features](#key-features)
- [Integration Points](#integration-points)
- [Data Flow](#data-flow)

**Additional Resources**:
- Best Practices (code standards)
- Deployment (build and deploy)
- Testing (test setup)

### In FRONTEND_GUIDE.md

**Quick Reference**:
- Core Architecture Files (main entry points)
- Pages Directory (all 38 pages)
- Component Directories (all categories)
- State Management (contexts and hooks)
- Services & APIs (all services)
- Key Features (10 main features)

---

## Project Architecture Summary

**Frontend Framework**: React 18 + TypeScript
**Build Tool**: Vite
**Styling**: Tailwind CSS + Shadcn/ui (52 components)
**State Management**: React Context + Custom Hooks
**Routing**: React Router (38 main routes)
**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Authentication
**Backend**: FastAPI (Python) on Render

---

## Core Features Documented

1. **Marketing Autopilot** - AI-powered automated marketing
2. **AI Video Generator** - Veo 3 video + Nano Banana images
3. **Conversational Dashboard** - Chat with AI assistants
4. **Campaign Management** - Multi-channel campaigns
5. **Lead Management** - Scoring and automation
6. **Content Generation** - Multiple content types
7. **Social Media** - Multi-platform management
8. **Analytics** - Dashboards and predictions
9. **Settings** - User and admin management
10. **Knowledge Base** - AI knowledge management

---

## Code Quality Standards

**CRITICAL RULES** (from CLAUDE.md):
- No emojis in code/comments (UI strings only)
- No em-dashes (—), use hyphens (-)
- No obvious comments, explain WHY not WHAT
- Proper error handling with context
- Variable names match content
- No mock data in production
- No repeated code (DRY principle)
- All imports must exist
- Features must be wired into app
- Consistent formatting

**Before Committing**:
```bash
npm run quality:check:full
npm run type-check
npm run lint
npm run knip  # Check for unused code
```

---

## Related Documentation

**In Project**:
- `CLAUDE.md` - Project context and rules
- `docs/API.md` - Backend API reference
- `docs/KNIP.md` - Code cleanup tool guide
- `docs/ARCHITECTURE.md` - System design

---

## Quick Links to Most-Viewed Sections

### Architecture Overview
See: FRONTEND_ARCHITECTURE.md → Application Architecture Overview

### All Pages
See: FRONTEND_ARCHITECTURE.md → Pages & Routing

### All Components
See: FRONTEND_ARCHITECTURE.md → React Components

### State Management
See: FRONTEND_ARCHITECTURE.md → State Management

### API Integration
See: FRONTEND_ARCHITECTURE.md → Services & Libraries

### Feature Docs
See: FRONTEND_ARCHITECTURE.md → Key Features

### Database
See: FRONTEND_ARCHITECTURE.md → Integration Points

---

## Getting Help

### For specific questions:
- **Routing**: Search "AppRouter" in FRONTEND_ARCHITECTURE.md
- **Components**: Search component name in FRONTEND_ARCHITECTURE.md
- **State**: Search context name in State Management section
- **APIs**: Search service name in Services & Libraries section
- **Database**: Search table name in Integration Points section

### Search tips:
- Use Ctrl+F (Cmd+F on Mac) to search documentation
- Search for file paths to find component docs
- Search for component names to find usage examples
- Search for "interface" or "Props" to find type definitions

---

## Document Maintenance

This documentation is kept up-to-date with these practices:

1. **When adding a new page**: Update FRONTEND_ARCHITECTURE.md routing section
2. **When adding a new component**: Add to component section
3. **When adding a new service**: Add to services section
4. **When changing routing**: Update routing structure
5. **When adding a feature**: Document in key features section

---

## Summary

You now have access to **2,894 lines of comprehensive documentation** covering:
- Complete component inventory (227 components)
- All pages (38 pages)
- State management (4 contexts, 40+ hooks)
- All services and APIs
- Database integration
- Third-party integrations
- Best practices and standards

**Start with FRONTEND_GUIDE.md for a quick overview, then dive into FRONTEND_ARCHITECTURE.md for details.**

Good luck with your development!

---

Generated: 2025-10-28
Status: Complete and comprehensive
Last Updated: 2025-10-28
