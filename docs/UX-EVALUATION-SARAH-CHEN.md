# UX Evaluation Report: Marketing Novice Walkthrough

## Test Persona: Sarah Chen

**Background**: 34-year-old owner of "Sparkle & Stone" handmade jewelry business (Etsy shop, craft fairs). ~$45k annual revenue, solo entrepreneur. Comfortable with email and social media for personal use, but no marketing tools experience. Zero formal marketing training.

**Key Constraints**:
- Will abandon if stuck for more than 2-3 minutes
- Gets frustrated by unexplained technical terms
- Needs visual confirmation that things are working
- Budget: $500-1000/month

---

## Executive Summary

**Overall Usability Score: 62/100 (C)**

The platform shows good intentions with beginner-friendly language in many places, a comprehensive marketing glossary, and helpful tooltips. However, **two critical blockers** would prevent Sarah from completing her first campaign:

1. **API Key Discovery Gap**: The welcome flow promises "5 min setup" but doesn't mention API keys are required. Sarah would hit a complete wall when asked for Claude/Gemini API keys.

2. **Quick Post Prerequisite Maze**: Three separate setup requirements with unclear paths to complete them.

**Time to First Campaign (Realistic Estimate)**: 45-90 minutes (vs. promised 5 minutes)

---

## Phase-by-Phase Evaluation

### Phase 1: Welcome Flow
**File**: `src/components/onboarding/WelcomeFlow.tsx`
**Sarah's Likely Experience**: Positive until discovering hidden requirements

| Criterion | Score | Notes |
|-----------|-------|-------|
| Language Clarity | 4/5 | Good - "no marketing experience needed" is reassuring |
| Step Clarity | 4/5 | Clear path options, good differentiation |
| Error Handling | N/A | No errors at this stage |
| Value Proposition | 4/5 | Clear benefits presented |
| **Blocker Severity** | **CRITICAL** | Hidden API key requirement |

**Specific Findings**:

**Lines 81-82** - "Marketing Command Center"
- **Sarah's thought**: "Command center sounds intimidating, like mission control. Am I supposed to be an expert?"
- **Recommendation**: Consider "Your Marketing Dashboard" or "Marketing Hub"

**Lines 85-88** - "No marketing experience needed"
- **Good**: This directly addresses Sarah's main concern
- **Quote**: "This platform helps you market your business automatically using AI. No marketing experience needed"

**Lines 143-168** - Autopilot vs Quick Start choice
- **Good**: Clear differentiation with badges like "5 min setup", "Hands-free", "AI optimizes daily"
- **Concern**: "5 min setup" may be misleading given API key requirement

**Lines 308-325** - "What you'll need" section
```typescript
// CRITICAL: This section does NOT mention API keys!
<li>A brief description of your business</li>
<li>An idea of who your customers are</li>
<li>Your monthly marketing budget</li>
```
- **Sarah's thought**: "Great, I have all of this. Let's go!"
- **Reality**: She'll be blocked at API key step
- **Recommendation**: Add "API keys from AI providers (we'll help you get these)" with explanation

---

### Phase 2: Autopilot Setup Wizard
**File**: `src/components/autopilot/AutopilotSetupWizard.tsx`
**Sarah's Likely Experience**: Good guidance, some jargon confusion

| Criterion | Score | Notes |
|-----------|-------|-------|
| Language Clarity | 3/5 | Some unexplained jargon |
| Step Clarity | 4/5 | Good step-by-step process |
| Error Handling | 3/5 | Validation exists but messaging unclear |
| Value Proposition | 4/5 | Benefits clear at each step |
| **Blocker Severity** | **Medium** | Confusion but not stuck |

**Specific Findings**:

**Step 1: Business Description (Lines 168-246)**
- **Good**: Excellent inline guidance with expandable tips
- **Good**: Example provided: "We sell ergonomic office chairs..."
- **Good**: Minimum character validation with helpful message

**Step 2: Your Customers (Lines 248-345)**

**Line 273-274** - "demographics" label
```typescript
<span className="text-xs text-gray-500 font-normal">(demographics)</span>
```
- **Issue**: "Demographics" is partially explained but could be clearer
- **Sarah's thought**: "Demographics? Like age and stuff?"
- **Recommendation**: Change to "(age, job, location - who are they?)"

**Line 292-293** - "pain points" label
- **Issue**: Marketing jargon not fully explained
- **Sarah's thought**: "Pain points? Like physical pain? My jewelry doesn't hurt..."
- **Recommendation**: Change to "(problems they have - what frustrates them?)"

**Step 3: Budget & Goals (Lines 347-436)**
- **Good**: DecisionHelper with clear budget options
- **Good**: Expected outcomes like "5-15 leads"
- **Issue**: Term "leads" used without inline explanation (though glossary exists)

**Step 4: AI Strategy (Lines 438-571)**

**Lines 506-523** - Results display with "leads" and "ROI"
```typescript
<TermTooltip term="leads">
  <HelpCircle className="h-3 w-3 text-gray-400" />
</TermTooltip>
```
- **Good**: TermTooltip exists for "leads" and "roi"
- **Issue**: Tooltips require hover - mobile users may not discover them
- **Concern**: "2.5x ROI" notation may still confuse (even with tooltip)

---

### Phase 3: API Key Setup (CRITICAL BLOCKER)
**File**: `src/components/settings/api-keys/ApiKeyConfig.ts`
**Sarah's Likely Experience**: Complete confusion and likely abandonment

| Criterion | Score | Notes |
|-----------|-------|-------|
| Language Clarity | 1/5 | Heavy technical jargon |
| Step Clarity | 2/5 | Unclear what to do or why |
| Error Handling | 2/5 | Validation exists but unhelpful |
| Value Proposition | 2/5 | No explanation of what these enable |
| **Blocker Severity** | **CRITICAL** | Would cause abandonment |

**Specific Findings**:

**Lines 14-20** - Claude API key configuration
```typescript
{
  id: 'anthropic_api_key',
  name: 'Anthropic Claude API Key',
  description: 'Required for AI content generation, analytics, and advanced reasoning. Primary AI provider.',
  placeholder: 'sk-ant-...',
}
```

**Sarah's thought process**:
1. "API key? What's an API? Is that like a password?"
2. "Anthropic? Claude? I thought this was the marketing platform..."
3. "sk-ant-...? Where do I get this? Am I supposed to already have one?"
4. "This looks like something for developers, not me. Maybe I should leave."

**Lines 22-30** - Gemini API key
```typescript
{
  description: 'Required for visual AI tasks, AI video generation, and image generation. Get your key from https://aistudio.google.com/apikey',
}
```

**Positive**: Link to where to get key is provided
**Negative**: Still doesn't explain WHAT an API key is or WHY she needs one

**Recommendations**:
1. Add a "What is this?" expandable section explaining API keys in plain English
2. Add video walkthrough showing exact steps
3. Consider offering a guided flow that opens the provider site and walks through
4. Add time estimate: "This takes about 2 minutes per key"

---

### Phase 4: Simple Dashboard
**File**: `src/pages/SimpleDashboard.tsx`
**Sarah's Likely Experience**: Generally good if she gets here

| Criterion | Score | Notes |
|-----------|-------|-------|
| Language Clarity | 4/5 | Good tooltips on metrics |
| Step Clarity | 4/5 | Clear what to do next |
| Error Handling | 3/5 | Loading states good, error states unclear |
| Value Proposition | 5/5 | Clear value when seeing leads/ROI |
| **Blocker Severity** | **Low** | No major blockers |

**Specific Findings**:

**Lines 244-264** - Leads tooltip
```typescript
<TooltipContent className="max-w-xs p-3">
  <p className="font-medium text-sm mb-1">Leads Generated</p>
  <p className="text-xs text-gray-500">
    People who showed interest in your business - they filled out a form, downloaded something, or signed up. These are potential customers worth following up with.
  </p>
</TooltipContent>
```
- **Excellent**: This is exactly what Sarah needs to understand the term
- **Recommendation**: Make tooltips more discoverable (add "?" icon or "What's this?" text)

**Lines 302-334** - ROI display
- **Good**: Color-coded badges (Strong/Good/Building) provide at-a-glance understanding
- **Good**: Tooltip explains "For every $1 you spend, how much you get back"
- **Issue**: "2.5x" notation may still be confusing; consider "You made $2.50 back for every $1 spent"

**Lines 337-343** - Expectation setting
```typescript
{stats.this_week_leads === 0 && autopilotConfig.is_active && (
  <p className="text-sm text-blue-900">
    Your AI is setting up campaigns and optimizing targeting. Leads should start coming in within 24-48 hours.
  </p>
)}
```
- **Excellent**: Proactive expectation management when no leads yet

**Line 189** - Glossary access
```typescript
<GlossaryDialog />
```
- **Good**: "Marketing Terms" button is visible and helpful
- **Issue**: Button might not be noticed; consider adding "New to marketing?" callout

---

### Phase 5: Quick Post (SIGNIFICANT BLOCKER)
**File**: `src/components/organic/QuickPost.tsx`
**Sarah's Likely Experience**: Stuck with unclear path forward

| Criterion | Score | Notes |
|-----------|-------|-------|
| Language Clarity | 3/5 | Prerequisites use jargon |
| Step Clarity | 2/5 | Unclear how to complete prerequisites |
| Error Handling | 3/5 | Shows what's missing but not how to fix |
| Value Proposition | 4/5 | Feature sounds useful once unlocked |
| **Blocker Severity** | **HIGH** | Would cause frustration |

**Specific Findings**:

**Lines 366-416** - Prerequisite check display
```typescript
<div className="flex items-center gap-3">
  <span className={setupStatus.hasPositioning ? '' : 'text-muted-foreground'}>
    Brand Positioning
  </span>
</div>
<div className="flex items-center gap-3">
  <span className={setupStatus.hasAudienceResearch ? '' : 'text-muted-foreground'}>
    Audience Research
  </span>
</div>
<div className="flex items-center gap-3">
  <span className={setupStatus.hasConfig ? '' : 'text-muted-foreground'}>
    Organic Marketing Setup
  </span>
</div>
```

**Sarah's thought process**:
1. "Brand Positioning? What's that? Is that like... where my brand is positioned? In the market?"
2. "Audience Research? Did I do that? I described my customers..."
3. "Organic Marketing Setup? I thought I already set up autopilot..."
4. "It says go to 'the Setup tab' but there are multiple setup things. Which one?"

**Line 410-411** - Vague direction
```typescript
<p className="text-sm text-muted-foreground mt-4">
  Go to the Setup tab to complete your marketing context configuration.
</p>
```

**Issues**:
1. "Setup tab" is vague - which setup tab?
2. "Marketing context configuration" is jargon
3. No direct links to complete each prerequisite
4. Terms not explained inline

**Recommendations**:
1. Change labels to plain English:
   - "Brand Positioning" -> "Your Brand Story (who you are and what makes you special)"
   - "Audience Research" -> "Customer Profiles (who buys from you)"
   - "Organic Marketing Setup" -> "Social Media Settings"
2. Add clickable links to complete each step
3. Consider combining these into the initial onboarding flow

---

## Jargon Audit Table

| Term | Location | Has Tooltip/Explanation? | Suggested Plain-English Alternative |
|------|----------|-------------------------|-------------------------------------|
| API key | ApiKeyConfig.ts:14-30 | No | "Access code for AI features (like a special password)" |
| Demographics | AutopilotSetupWizard.tsx:273 | Partial | "Who your customers are (age, job, location)" |
| Pain points | AutopilotSetupWizard.tsx:292 | Partial | "Problems your customers have" |
| Leads | Multiple files | Yes (tooltip) | Keep but ensure tooltip visible |
| ROI | Multiple files | Yes (tooltip) | "Money back per dollar spent" |
| Campaign | AutopilotSetupWizard.tsx:461 | Yes (tooltip) | Keep with tooltip |
| Value proposition | AutopilotSetupWizard.tsx:488 | No | "Main reason customers should choose you" |
| Brand Positioning | QuickPost.tsx:387 | No | "Your brand story" |
| Audience Research | QuickPost.tsx:396 | No | "Customer profiles" |
| Organic Marketing | QuickPost.tsx:406 | No | "Free social media posting (not ads)" |
| Command Center | WelcomeFlow.tsx:82 | No | "Dashboard" or "Hub" |
| Funnel | MarketingGlossary | Yes | (in glossary, good) |
| CTR | MarketingGlossary | Yes | (in glossary, good) |
| CPA | MarketingGlossary | Yes | (in glossary, good) |

---

## Blocker Analysis

### Critical Blockers (Would cause abandonment)

1. **API Key Discovery Gap**
   - **Location**: WelcomeFlow.tsx:308-325 + ApiKeyConfig.ts
   - **Problem**: User promised "5 min setup" then hits unexpected API key requirement
   - **Impact**: ~80% abandonment rate likely
   - **Fix Effort**: Medium (add to welcome flow, improve API key guidance)

2. **API Key Terminology**
   - **Location**: ApiKeyConfig.ts:14-30
   - **Problem**: Technical jargon with no explanation for non-technical users
   - **Impact**: Users don't understand what they're being asked for
   - **Fix Effort**: Low (add explanatory text)

### High Blockers (Would cause significant frustration)

3. **Quick Post Prerequisites**
   - **Location**: QuickPost.tsx:366-416
   - **Problem**: Three jargon-heavy requirements with vague path to completion
   - **Impact**: Feature appears broken/inaccessible
   - **Fix Effort**: Medium (add direct links, rename in plain English)

### Medium Blockers (Would cause confusion but not stuck)

4. **Demographics/Pain Points Jargon**
   - **Location**: AutopilotSetupWizard.tsx:273, 292
   - **Problem**: Marketing terms partially explained but still confusing
   - **Impact**: User might enter wrong information
   - **Fix Effort**: Low (expand inline labels)

5. **Tooltip Discoverability**
   - **Location**: SimpleDashboard.tsx
   - **Problem**: Tooltips require hover, mobile users may miss them
   - **Impact**: Metrics may remain confusing
   - **Fix Effort**: Low (add visible "?" icons or "What's this?" text)

---

## Prioritized Recommendations

### Critical (Do immediately)

1. **Add API Key Warning to Welcome Flow**
   - File: `src/components/onboarding/WelcomeFlow.tsx`
   - Lines: 308-325
   - Change: Add fourth item to "What you'll need" list:
   ```tsx
   <li className="flex items-center gap-2">
     <CheckCircle2 className="h-4 w-4 text-yellow-500" />
     AI service accounts (free to create - we'll help you)
   </li>
   ```

2. **Add API Key Explainer**
   - File: `src/components/settings/api-keys/ApiKeyConfig.ts` or parent component
   - Add expandable "What are API keys?" section with plain-English explanation:
   ```
   "API keys are like special passwords that connect this app to AI services.
   You'll need to create free accounts with Claude (Anthropic) and Google
   to get these keys. It takes about 2 minutes per service, and we'll walk
   you through each step."
   ```

3. **Revise "5 min setup" Claim**
   - File: `src/components/onboarding/WelcomeFlow.tsx`
   - Line: 158
   - Change: "5 min setup" to "Quick setup" or "Easy setup"
   - Or: Add API key setup to onboarding so it truly is included

### High (Do this week)

4. **Fix Quick Post Prerequisites**
   - File: `src/components/organic/QuickPost.tsx`
   - Lines: 386-412
   - Changes:
     - Rename "Brand Positioning" to "Your Brand Story"
     - Rename "Audience Research" to "Customer Profiles"
     - Rename "Organic Marketing Setup" to "Social Media Settings"
     - Make each item a clickable link to the setup page
     - Replace "Go to the Setup tab" with specific navigation buttons

5. **Expand Jargon Labels in Wizard**
   - File: `src/components/autopilot/AutopilotSetupWizard.tsx`
   - Line 273: Change "(demographics)" to "(age, job, location)"
   - Line 292: Change "(pain points)" to "(problems they struggle with)"

### Medium (Do this sprint)

6. **Add API Key Video Walkthrough**
   - Create short video showing exact steps to get Claude and Gemini keys
   - Embed in settings page or link from ApiKeyConfig

7. **Improve Tooltip Discoverability**
   - Add visible "?" icons next to metrics
   - Consider adding "New to marketing? Click on any ? for help" banner

8. **Add First-Time Dashboard Tour**
   - When user first lands on SimpleDashboard, show brief tour of key metrics
   - Explain what each number means without requiring hover

### Low (Nice to have)

9. **Consolidate Prerequisites into Onboarding**
   - Consider moving Brand Positioning and Audience Research into AutopilotSetupWizard
   - Eliminates separate steps that confuse users

10. **Add Progress Indicator Across All Setup**
    - Show "Step 2 of 5" across the entire onboarding (including API keys)
    - Helps set realistic time expectations

---

## Path to First Campaign: Timeline Analysis

### Current State (Sarah's Realistic Experience)

| Step | Promised Time | Actual Time | Notes |
|------|---------------|-------------|-------|
| Welcome Flow | 1 min | 2 min | Good experience |
| Path Selection | 1 min | 1 min | Good experience |
| Business Description | 2 min | 5 min | Needs thought but good |
| Customer Description | 2 min | 5 min | Jargon slows down |
| Budget & Goals | 1 min | 2 min | Good experience |
| **API Key Discovery** | **0 min (not shown)** | **20-30 min** | **BLOCKER** |
| AI Strategy Review | 2 min | 3 min | Good experience |
| Dashboard Check | 1 min | 1 min | Good experience |
| **TOTAL** | **~5 min** | **45-60 min** | **9-12x longer** |

### After Fixes

| Step | Expected Time | Notes |
|------|---------------|-------|
| Welcome Flow + API Key Warning | 2 min | Set expectations |
| API Key Setup (with guidance) | 8 min | 4 min per key |
| Business Description | 5 min | Unchanged |
| Customer Description | 3 min | Clearer labels |
| Budget & Goals | 2 min | Unchanged |
| AI Strategy Review | 3 min | Unchanged |
| Dashboard Check | 1 min | Unchanged |
| **TOTAL** | **~25 min** | Realistic, no surprises |

---

## Verification Checklist

After implementing fixes, verify:

- [ ] Welcome flow mentions API keys in "What you'll need" section
- [ ] API key page has plain-English explanation of what API keys are
- [ ] API key page has link to step-by-step guide or video
- [ ] AutopilotSetupWizard uses plain-English labels (not "demographics", "pain points")
- [ ] Quick Post prerequisites have clickable links and plain-English names
- [ ] SimpleDashboard has visible help indicators (not just hover tooltips)
- [ ] "5 min setup" claim is removed or API keys are included in onboarding
- [ ] Test with actual marketing novice user before launching

---

## Appendix: Positive Findings

Despite the blockers, several things are done well:

1. **Marketing Glossary** (`MarketingGlossary.tsx`): Comprehensive with 26+ terms, plain-English definitions
2. **InlineGuidance Component**: Expandable tips with examples
3. **DecisionHelper Component**: Budget selection is excellent with outcomes and recommendations
4. **SimpleDashboard Tooltips**: When discovered, they explain metrics clearly
5. **Expectation Setting**: "24-48 hours" message for new campaigns is proactive
6. **"No marketing experience needed"**: Welcoming message sets right tone

---

**Report Generated**: January 18, 2026
**Test Persona**: Sarah Chen (Marketing Novice)
**Overall Score**: 62/100 (C)
**Primary Blockers**: API Key Discovery Gap, Quick Post Prerequisites
