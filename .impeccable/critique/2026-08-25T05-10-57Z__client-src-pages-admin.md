---
target: admin dashboard all pages
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-25T05-10-57Z
slug: client-src-pages-admin
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good live-socket indicator + retry banners; `AdminDashboardPage` stat tiles show a bare "—" on load instead of the `Spinner.Skeleton` already used elsewhere |
| 2 | Match Between System and Real World | 4 | Terminology matches the domain precisely (Pipeline, Stages, GST Invoice, Kanban), no unexplained jargon |
| 3 | User Control and Freedom | 3 | Real focus-trap/Escape/stack-aware Modal; one native `window.confirm()` in ProposalTemplateEditorPage instead of the app's own ConfirmDialog |
| 4 | Consistency and Standards | 2 | Three different radius/focus conventions competing (Card's 32px, Settings' 24px override, FormField's correct 12-16px); detector independently caught a contrast miss in AdminLayout.tsx:264 |
| 5 | Error Prevention | 3 | ConfirmDialog gates destructive actions; canvas editors (Quotation/Proposal) have Undo/Redo but no visible autosave/save-status signal |
| 6 | Recognition Rather Than Recall | 3 | Sidebar labels every icon at full width; collapsed rail relies on `title`-only tooltips |
| 7 | Flexibility and Efficiency of Use | 2 | Bulk actions exist only on Leads; zero keyboard shortcuts anywhere across the dashboard |
| 8 | Aesthetic and Minimalist Design | 3 | Individual pages are clean; token drift between pages is the deduction |
| 9 | Error Recovery | 3 | Plain-language errors with working Retry actions, consistently |
| 10 | Help and Documentation | 1 | No searchable help/contextual guidance beyond basic copy - acceptable for an internal tool, but thin |
| **Total** | | **27/40** | **Acceptable** |

## Design Specificity Verdict

**Mixed — specific at the domain level, generic at the chrome level.**

**LLM assessment**: The actual product logic is unmistakably built for this agency: a real kanban lead pipeline with drag-and-drop stages, a canvas-based proposal/quotation editor with undo/redo, GST-aware invoicing, and a live-socket "new lead" toast tied to the real sales workflow. This isn't template content.

But the shared `Card` primitive — used on essentially every one of the ~20 admin pages — is the unmodified Persuade-mode marketing card: 32px radius, glass blur, 8px hover lift. DESIGN.md names this exact pattern as a bug category ("a 32px-radius data table would read as a landing-page component wandering into a tool"), and it's not an isolated slip, it's the default behavior of the one component every page reaches for. Swap the copy and the chrome could belong to any generic SaaS admin.

**Deterministic scan**: `client/src/pages/admin` itself: 0 findings. Shared components: 1 finding — `gray-on-color` contrast issue in `AdminLayout.tsx:264` (`text-gray-600` on `bg-rose-500`). This corroborates Assessment A's Consistency (#4) finding rather than contradicting it — the detector caught a concrete instance of the same token-discipline gap the design review flagged structurally.

**Visual overlays**: Not available this run — no browser automation tool was exposed in this session, so live rendering/injection was skipped per the critique skill's fallback rule. All findings are from source inspection; a live-render pass would strengthen confidence on the visual-hierarchy and cognitive-load findings marked "needs live verification" below.

## Overall Impression

The dashboard's bones are good — real accessibility groundwork in shared primitives, honest error handling, domain-authentic interactions. What's holding it back isn't missing functionality, it's that Operate mode's own documented rules (tight 8/12/16px radius scale, no glass/blur, quiet focus states) aren't actually enforced by the primitives every page depends on. The single biggest opportunity: make `Card` and `Modal` structurally incapable of reaching for Persuade-mode geometry inside `/dashboard`, rather than relying on every page author to remember not to.

## What's Working

1. **Accessible-by-default primitives.** `Card.tsx` gives every `onClick` card a real keyboard path (role, tabIndex, Enter/Space) centrally, so every page benefits automatically. `Modal.tsx` implements a genuine focus trap, focus restore, and modal-stack-aware Escape handling — not the common "any Escape closes everything" bug.
2. **Error handling that respects the user.** Every fetch-failure path reviewed pairs plain-language copy with a working Retry action, consistently across Leads, Dashboard stats, and Reports — not a one-off nicety.
3. **Domain-authentic interaction design.** The lead kanban's native drag-and-drop (with a genuine keyboard/screen-reader fallback via the Edit modal), the live-socket new-lead toast, and the deliberately-not-hijacked horizontal wheel-pan on the kanban board show real product thinking.

## Priority Issues

**[P0] The shared `Card` primitive silently imports Persuade-mode geometry into every Operate-mode page**
- **Why it matters**: DESIGN.md treats 32-40px card radii inside `/dashboard` as a named bug, not a style preference — it's the exact signal that breaks the "this is a workspace" read the whole system depends on. Every admin page inherits this by default just by using the shared `Card`.
- **Fix**: Give `Card` an Operate variant (16px radius, no glass/blur, quieter hover) and migrate admin pages to it, or split into `Card` (Persuade) / `PanelCard` (Operate) so the wrong one can't be reached for by accident.
- **Suggested command**: `/impeccable harden`

**[P1] `Modal.tsx` hardcodes a 36px dialog radius for every CRM modal**
- **Why it matters**: Same violation as Card, at higher visual prominence — a modal is the most attention-grabbing surface in any workflow, so an oversized radius here is maximally visible exactly where the Operate identity most needs to hold.
- **Fix**: Route the dialog radius down to 16px under `/dashboard` and `/portal`, or give `Modal` a mode prop.
- **Suggested command**: `/impeccable harden`

**[P1] Inconsistent focus treatment on the front door itself**
- **Why it matters**: `AdminLoginPage.tsx` hand-rolls its own inputs (`focus:border-primary`, lime) instead of reusing the shared `Input`, which correctly implements DESIGN.md's spec (`focus:border-dark`, no ring). A user sees lime-on-focus at login, then black-on-focus everywhere else in the dashboard they just entered.
- **Fix**: Replace the hand-rolled inputs in `AdminLoginPage.tsx` with the shared `Input` component.
- **Suggested command**: `/impeccable harden`

**[P2] A third accent color has crept into the quotation canvas**
- **Why it matters**: `QuotationEditorPage.tsx` defaults a divider element to `#e8622c` (orange) — outside both the lime/black core and the semantic status palette. DESIGN.md already flags one stray accent elsewhere as "a bug to consolidate, not a precedent" — a second makes that erosion easier to justify next time.
- **Fix**: Default dividers to Circuit Black or a neutral slate; reserve color for status-pill semantics only.
- **Suggested command**: `/impeccable colorize`

**[P2] No visible autosave/save-status signal on the canvas editors**
- **Why it matters**: A canvas-based proposal/quotation editor is exactly where a lost tab or refresh is most punishing — multi-element layout work, not a single form field, and the output is client-facing. Undo/Redo exists but no save-status indicator was visible in the reviewed code.
- **Fix**: Verify whether autosave already exists elsewhere in these files; if not, add it plus a visible "Saved/Saving" indicator near the Undo/Redo cluster.
- **Suggested command**: `/impeccable audit` (verify first), then `/impeccable harden`

## Persona Red Flags

**Alex (Power User)**: Zero keyboard shortcuts anywhere in the dashboard — every action, including Undo/Redo in the canvas editors, requires a mouse click. The QuotationEditorPage toolbar exposes 10+ flat icon actions with no command palette or shortcut hints. Bulk actions exist only on the Leads page — managing 50 blog posts has no bulk-delete/bulk-publish path.

**Sam (Accessibility-Dependent User)**: `AdminLoginPage`'s hand-rolled inputs drop the app's `focus-ring` utility for a weaker border-color-only cue. Kanban drag-and-drop has no `aria-grabbed`/`aria-dropeffect` or live-region announcement — the Edit modal's `<select>` gives a real fallback path, but Sam can't discover the drag interaction exists from the board itself. The collapsed sidebar rail relies on `title`-only tooltips rather than `aria-label`, which screen readers expose inconsistently.

## Minor Observations

- `ManageSettingsPage.tsx` default email has a typo (`buildyourthougths` vs `buildyourthoughts`) that ships into a form real staff may resave.
- `AdminDashboardPage` renders a bare "—" for loading stats instead of the `Spinner.Skeleton` primitive already used on `InvoiceManagerPage`.
- `ManageLeadsPage` hardcodes `rounded-card` explicitly in a couple of places rather than relying on `Card`'s default — a sign the pattern is typed by habit, which will make the P0 cleanup pass larger than a single component swap.
- `FormField.tsx`'s "form" radius token (18px) itself sits slightly outside the documented 8/12/16px Operate scale — worth reconciling either direction.
- `StatusPill.tsx`'s single-source-of-truth tone map (explicitly replacing three previously-duplicated implementations, per its own code comment) is exactly the kind of consolidation the Card/Modal fixes should follow.

## Questions to Consider

- If the Operate radius scale is load-bearing enough to be a named rule in DESIGN.md, why doesn't the one primitive every page depends on (`Card`) enforce it itself?
- The dashboard already has real "system is alive" infrastructure (sockets, retry, connection status) on the list pages — what would it look like to extend that same feeling into the editors via autosave status or edit-presence?
- Given Alex (internal staff) is the only audience here, is the missing keyboard-shortcut layer actually costing daily productivity, or acceptable debt relative to the token-consistency fixes?
