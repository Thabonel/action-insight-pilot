# PageHelpModal Component

## Overview

The `PageHelpModal` component provides a consistent, accessible help system across all application pages. It displays a bottom-right floating help button that opens a modal dialog containing page-specific documentation when clicked.

## Purpose

- Provides context-sensitive help on every page
- Keeps users in their workflow (no navigation required)
- Delivers consistent UX across the entire platform
- Leverages centralized help content from `helpContent.tsx`

## Location

**Component:** `src/components/common/PageHelpModal.tsx`
**Content Source:** `src/config/helpContent.tsx`

## Features

- **Modal Dialog** - Opens help content in a popup (not navigation)
- **Bottom-Right Positioning** - Fixed position (bottom-6, right-6) with high z-index
- **Automatic Content Lookup** - Retrieves content by `helpKey` prop
- **Fallback Content** - Displays friendly message for missing help keys
- **Accessibility** - Full keyboard navigation, ARIA labels, screen reader support
- **Responsive** - Works on mobile, tablet, and desktop
- **Dark Mode** - Supports dark mode styling
- **Scrollable** - Long content handled with ScrollArea component

## Usage

### Basic Implementation

```typescript
import { PageHelpModal } from '@/components/common/PageHelpModal';

const MyPage = () => {
  return (
    <div>
      {/* Your page content */}
      <PageHelpModal helpKey="campaigns" />
    </div>
  );
};
```

### Available Help Keys

The `helpKey` prop must match a key in `src/config/helpContent.tsx`:

- `dashboard` - Dashboard overview
- `conversationalDashboard` - Conversational dashboard
- `campaigns` - Campaign management
- `autopilot` - Marketing autopilot
- `aiVideoStudio` - AI video generation
- `content` - Content creation
- `analytics` - Analytics dashboard
- `leads` - Lead management
- `settings` - Settings page
- `social` - Social media management
- `email` - Email marketing
- `proposals` - Proposal generation
- `workflows` - Workflow automation
- `competitiveIntelligence` - Competitive analysis
- `keywordResearch` - SEO keyword research
- `landingPageBuilder` - Landing page builder
- `leadCaptureForms` - Lead capture forms
- `aiCampaignCopilot` - AI campaign copilot
- `gtmPlanner` - Go-to-market planner
- `customerSegmentation` - Customer segmentation
- `viralVideoMarketing` - Viral video marketing
- `creativeWorkflow` - Creative workflow
- `adminDashboard` - Admin dashboard
- `connectPlatforms` - Platform connections

### Custom Styling

```typescript
<PageHelpModal
  helpKey="campaigns"
  className="custom-class"
/>
```

## Component Structure

### Props Interface

```typescript
interface PageHelpModalProps {
  helpKey: string;        // Required: Key to lookup help content
  className?: string;     // Optional: Additional CSS classes
}
```

### Implementation Details

```typescript
export function PageHelpModal({ helpKey, className = '' }: PageHelpModalProps) {
  // 1. Content lookup from helpContent.tsx
  const content = helpContent[helpKey] || {
    title: 'Help',
    content: (
      <div>
        <p>Help content for this page is not available yet.</p>
        <p>For assistance, please visit the <a href="/help">Help Center</a>.</p>
      </div>
    )
  };

  return (
    <Dialog>
      {/* Floating help button with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full
                  shadow-lg hover:shadow-xl transition-all bg-primary
                  text-primary-foreground hover:bg-primary/90 ${className}`}
                title="Help - Learn how to use this page"
              >
                <HelpCircle className="h-6 w-6" />
                <span className="sr-only">Help - Learn how to use this page</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Need help? Click for documentation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Modal dialog with scrollable content */}
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{content.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Help documentation for {content.title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {typeof content.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            ) : (
              content.content
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

## Dependencies

- **lucide-react** - HelpCircle icon
- **@/components/ui/dialog** - Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
- **@/components/ui/button** - Button component
- **@/components/ui/scroll-area** - ScrollArea for long content
- **@/components/ui/tooltip** - Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
- **@/config/helpContent** - Centralized help content configuration

## Accessibility Features

### Keyboard Navigation
- **Tab** - Focus help button
- **Enter/Space** - Open modal
- **Escape** - Close modal
- **Tab/Shift+Tab** - Navigate within modal

### Screen Reader Support
- Button has descriptive `title` attribute
- Screen reader-only text: "Help - Learn how to use this page"
- DialogDescription for context
- Semantic HTML structure

### ARIA Labels
- Button role and label
- Dialog role and labeling
- Focus management

## Design System Integration

### Colors
- Uses semantic color tokens from Tailwind CSS
- `bg-primary` - Primary brand color
- `text-primary-foreground` - Contrast text
- `prose` classes for content styling

### Spacing
- `bottom-6 right-6` - Bottom-right positioning
- `z-50` - High z-index to stay above content
- `h-12 w-12` - Consistent button size

### Transitions
- `transition-all` - Smooth hover effects
- `shadow-lg hover:shadow-xl` - Elevation on hover

## Migration from Old Components

This component replaces two legacy components:

### 1. FloatingHelpButton (Deleted)
- **Old behavior:** Navigated to `/help` page
- **New behavior:** Opens modal dialog
- **Migration:** Replace `<FloatingHelpButton helpSection="X" />` with `<PageHelpModal helpKey="X" />`

### 2. HelpButton (Deleted)
- **Old behavior:** Top-positioned modal with manual content props
- **New behavior:** Bottom-right modal with automatic content lookup
- **Migration:** Replace `<HelpButton title={...} content={...} />` with `<PageHelpModal helpKey="X" />`

### Migration Example

**Before (Old Components):**
```typescript
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
import { HelpButton } from '@/components/common/HelpButton';
import { helpContent } from '@/config/helpContent';

// Some pages had both:
<HelpButton title={helpContent.campaigns.title} content={helpContent.campaigns.content} />
<FloatingHelpButton helpSection="campaigns" />
```

**After (Unified Component):**
```typescript
import { PageHelpModal } from '@/components/common/PageHelpModal';

// Single unified component:
<PageHelpModal helpKey="campaigns" />
```

## Adding New Help Content

### Step 1: Update helpContent.tsx

Add a new entry to `src/config/helpContent.tsx`:

```typescript
export const helpContent: Record<string, { title: string; content: React.ReactNode }> = {
  // ... existing entries

  myNewPage: {
    title: 'My New Feature',
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <p>Description of the feature...</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Step one</li>
            <li>Step two</li>
          </ol>
        </section>
      </div>
    )
  }
};
```

### Step 2: Add to Page

```typescript
import { PageHelpModal } from '@/components/common/PageHelpModal';

const MyNewPage = () => {
  return (
    <div>
      {/* Page content */}
      <PageHelpModal helpKey="myNewPage" />
    </div>
  );
};
```

## Best Practices

### Content Guidelines
- **Clear Headings** - Use semantic HTML headings (h3, h4)
- **Structured Layout** - Use sections for logical grouping
- **Actionable Steps** - Provide clear, numbered instructions
- **Visual Hierarchy** - Use spacing and typography for readability
- **Concise Text** - Keep help content focused and scannable

### Technical Guidelines
- **Always use helpKey prop** - Never hard-code content
- **One modal per page** - Don't add multiple PageHelpModal instances
- **Place at end of JSX** - Add before closing div of page container
- **Update helpContent.tsx** - Don't create custom content props

### Performance
- **No rerenders** - Component only rerenders when helpKey changes
- **Lazy content** - Help content only loaded when modal opens
- **Lightweight** - Minimal bundle impact (reuses existing shadcn components)

## Troubleshooting

### Help content not showing
**Issue:** Modal opens but shows fallback content
**Cause:** `helpKey` doesn't match any key in helpContent.tsx
**Fix:** Check spelling of helpKey and ensure it exists in helpContent.tsx

### Button not visible
**Issue:** Help button is hidden or covered
**Cause:** Z-index conflict or CSS override
**Fix:** Verify no elements have `z-index > 50` in page layout

### Modal doesn't close
**Issue:** Modal stays open when clicking overlay
**Cause:** Event propagation issue
**Fix:** Ensure no parent elements are preventing click events

## Related Documentation

- **Help Content Configuration** - `src/config/helpContent.tsx`
- **shadcn/ui Dialog** - https://ui.shadcn.com/docs/components/dialog
- **shadcn/ui Tooltip** - https://ui.shadcn.com/docs/components/tooltip
- **Help Center Page** - `/src/pages/HelpPage.tsx`

## Changelog

### Version 1.0.0 (2025-12-28)
- Initial release
- Replaces FloatingHelpButton and HelpButton components
- Unified modal-based help system across all pages
- Applied to 26 application pages

## Future Enhancements

- **Search functionality** - Search within help content
- **Video tutorials** - Embed video walkthroughs
- **Interactive tours** - Step-by-step guided tours
- **Feedback mechanism** - "Was this helpful?" ratings
- **Analytics** - Track which help topics are most viewed
