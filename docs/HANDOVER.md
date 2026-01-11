# Handover – AI Boost Campaign (Jan 2026)

This document summarizes the changes completed in the last iteration, the current state of the codebase, and recommendations for next steps. It is intended for engineers picking up the work and for product/QA to validate.

## Scope Completed

- Dark mode stability and contrast
  - Strengthened global dark overrides with `html.dark` specificity.
  - Rewrote input overrides to support both light/dark without media-query conflicts.
  - Removed white flashes on navigation by adding explicit `dark:` classes to main wrappers and cards across priority pages.
  - Tuned text colors (`text-blue-800/900`) in dark and normalized `*-50` tinted backgrounds to elevated slate.
  - Key files: `src/styles/color-overrides.css`, `src/styles/input-overrides.css`, page files in `src/pages/*`.

- Layout unification & sidebar UX
  - Legacy layout now re-exports the canonical layout to guarantee uniform behavior.
  - Added collapsible sidebar with persisted state and tooltips for names/descriptions.
  - Header branding: LogoMark used as the “A” in “AI Boost Campaign”, baseline-aligned; subtitle set to “Smart Campaigns”.
  - Moved collapse toggle to the sidebar footer to prevent truncation/shift of the header.
  - Files: `src/components/Layout.tsx`, `src/components/layout/Layout.tsx` (re-export only).

- Icons
  - Differentiated Campaigns (campaigns) vs Campaign Management (workflows).
  - Viral Video Marketing now maps to `video` icon (prefers PNG; has SVG fallback).
  - Files: `src/components/ui/NeuralFlowIcon.tsx`, `src/components/Layout.tsx`.

- Knowledge management – viewer/editor
  - “View” opens a modal dialog with title/content editor and actions: Save, Download, Reprocess, Delete.
  - Added service fallbacks for `updateDocument` and `deleteDocument` (edge-function first, then direct table update/delete).
  - Files: `src/components/knowledge/DocumentViewerDialog.tsx`, `src/components/knowledge/DocumentsList.tsx`, `src/components/knowledge/KnowledgeManagement.tsx`, `src/lib/services/knowledge-service.ts`.

- Settings – Users & Roles
  - Fixed 400 error when embedded relation `profiles(...)` is not available; falls back to 2-step fetch (roles + profiles `.in()`), merges client-side.
  - File: `src/components/settings/UserRoleManagement.tsx`.

- Supabase client de-duplication
  - Removed duplicate client creation to avoid multiple GoTrue instances and undefined auth behavior.
  - File: `src/lib/supabase.ts` (re-exports the singleton from `src/integrations/supabase/client.ts`).

- System Preferences Select crash
  - Prevented empty Select values on reset (Radix Select requires non-empty `value`).
  - Defaults: theme=auto, language=en, timezone=UTC.
  - File: `src/components/settings/SystemPreferences.tsx`.

## Operational Notes

- Build & quality gate
  - The repo has a pre-push quality gate that runs type-check, lint, tests, and a production build. If needed, you can bypass with `git push --no-verify`, but only after validating locally.

- Running locally
  - Frontend: `npm install && npm run dev`
  - Type-check: `npm run type-check`
  - Lint: `npm run lint`
  - Tests: `npm run test`
  - Production build: `npm run build`

- Supabase
  - Use the singleton client from `@/integrations/supabase/client` everywhere to avoid multiple auth clients.
  - Edge functions used: `knowledge-processor` (create/get/upload/update/delete documents; search; reprocess). All critical actions include table fallbacks.

## Configuration & Assets

- Viral Video icon
  - Preferred asset path: `public/icons/neural-flow/video.png` (24×24 transparent PNG). If absent, an inline SVG fallback is used automatically.

- Dark theme palette (reference)
  - Background: `#0B0D10`
  - Surface/Card: `#151A21`
  - Elevated: `#1C2430`
  - Borders: `#273140`
  - Primary text: `#E9EEF5`
  - Secondary text: `#94A3B8`
  - Muted text: `#64748B`

## Verification Checklist

- Toggle dark/light on these routes without white flashes:
  - `/app/conversational-dashboard`, `/app/autopilot`, `/app/user-manual`, `/app/settings`, `/app/campaigns`, `/app/analytics`.
- Sidebar
  - Collapse/expand persists; tooltips show names+descriptions; branding renders “A” + full name correctly.
- Knowledge
  - Select a bucket → Documents list appears.
  - View opens modal; Edit/Save/Download/Reprocess/Delete work; state refreshes.
- Users & Roles
  - Loads without 400; if no relation exists, profiles are merged client-side.
- System Preferences
  - Reset All does not crash any Select.

## Known Items / Next Steps

1) Icon audit
   - Optional: add a tiny script to flag icon names without corresponding assets/mappings; consider adding a dedicated `knowledge.png` to replace LogoMark if desired.

2) Dark-mode audit rule
   - Add a pre-push “dark lint” that flags `bg-white/bg-gray-50/100/text-black/gray-900/text-blue-800/900` without `dark:` variants.

3) Knowledge editor polish
   - Swap textarea for MDX/Markdown editor with preview and print.
   - Expose chunk-level view/edit if product requires.

4) Edge function parity
   - Ensure `knowledge-processor` implements `update_document` and `delete_document`. Table fallbacks work now, but parity is recommended.

5) Caching
   - Consider adding asset versioning or cache-busting to reduce stale bundle issues after deployments.

## Contact & Ownership

- Frontend: `src/components`, `src/pages`, `src/styles`.
- Data & services: `src/lib/services/*`, `src/integrations/supabase/*`.
- Edge functions (backend-managed): `knowledge-processor` (deployed in Supabase).

Please reach out if you need a quick pairing session to walk through any part of this handover.

