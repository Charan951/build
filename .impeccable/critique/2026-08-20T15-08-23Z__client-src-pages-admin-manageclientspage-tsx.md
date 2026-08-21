---
target: Admin CRM dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-20T15-08-23Z
slug: client-src-pages-admin-manageclientspage-tsx
---
Method: dual-agent (A: ab15e11dbda66846c · B: a48f8e9faa953e9c0)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live socket status pill is excellent, but three incompatible loading treatments coexist (`Spinner.tsx` exists, unused on ClientDetailPage) |
| 2 | Match System / Real World | 3 | `projectStage()` silently collapses on_hold/cancelled into "ongoing" |
| 3 | User Control and Freedom | 2 | Deletes are now confirmed via `ConfirmDialog`, but no undo anywhere; bulk lead delete is irreversible |
| 4 | Consistency and Standards | 2 | Shared primitives (`EmptyState`, `StatusPill`, `Spinner`) exist but the primary CRUD page hand-rolls its own empty state and status pill instead of importing them |
| 5 | Error Prevention | 2 | 5+ blocking `alert()` calls remain (ManageLeadsPage, ClientDetailPage, InvoiceManagerPage, ManageStagesModal) |
| 6 | Recognition Rather Than Recall | 3 | Auto-expanding active nav group is good; collapsed icon rail has no tooltips |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, no saved filters/sort, search state not URL-persisted, no bulk actions outside the leads board |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained overall; 7-item nav group and 6-button leads toolbar dilute it |
| 9 | Error Recovery | 1 | Fetch failures are swallowed (`.catch(() => {})`) and render as an empty state indistinguishable from "no data" |
| 10 | Help and Documentation | 2 | Good inline field hints; no onboarding or terminology help ("stage", "Platform Card") |
| **Total** | | **22/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**LLM assessment**: The admin surface is a competent but largely generic admin-CRUD shell with a thin agency veneer. The tell is structural: the dashboard and the Clients page both lead with vanity count tiles (Total clients / Total projects / Ongoing / Completed) that answer no question BYT staff actually have day-to-day — nobody opens this tool wondering how many clients exist; they wonder who's unpaid, whose proposal is stale, or what's due today. The one screen that is genuinely domain-shaped is the Leads kanban (`ManageLeadsPage.tsx`): deal value, follow-up date, a stage-gated "Send Proposal" action, and hand-tuned wheel/pan interaction on the board itself. That screen knows what business it's in. Nothing else does — Clients, Projects, and the Dashboard could be relabeled for an unrelated CRUD product with a find-and-replace, and the lead→proposal→quotation→project→invoice pipeline that *is* the business is never rendered as a connected flow anywhere; it's five disconnected sidebar destinations.

**Deterministic scan**: `detect.mjs --json` run across `client/src/pages/admin`, `client/src/components/crm`, `AdminLayout.tsx`, and the shared `ui/` primitives returned exit code 2 with exactly **one finding**: a `gray-on-color` warning at `AdminLayout.tsx:261` (`text-gray-600` paired with `bg-rose-500`). On inspection this is a **false positive** — `bg-rose-500/10` is a 10%-opacity `hover:` background paired with a `hover:text-rose-600` state; the flagged `text-gray-600` is the idle-state color, never rendered against a solid rose fill. The detector's static class-pairing heuristic can't distinguish hover-state pairs from a rendered base state. Net deterministic signal: effectively clean, and it should be read as *narrow coverage* (static contrast/pairing rules), not *low risk* — the real issues here (keyboard-only navigation gaps, silent error swallowing, unadopted design-system primitives) are structural and behavioral, exactly the class of bug this detector doesn't check for. The qualitative review surfaced all of the real findings; the detector's role in this run was to rule out class-pairing contrast bugs, which it did.

**Visual overlays**: Not available — no browser automation tool was exposed in this environment, so the live-server/injection overlay step was skipped. This is a fallback signal, not a finding.

## Overall Impression

The visual language is disciplined and the newest layer of work (Modal's focus trap, FormField's `aria-invalid`/`useId` wiring, ConfirmDialog replacing `window.confirm`) is genuinely above the bar for an internal tool. But the design system landed as *files*, not as *adoption*: the primary CRUD page (`ManageClientsPage.tsx`) hand-rolls the exact empty state and status pill that `EmptyState.tsx` and `StatusPill.tsx` already solve, correctly, elsewhere in the same commit. The single biggest opportunity is closing that gap — finish the adoption sweep on the pages that get daily use — paired with fixing the two flat-out broken things: white-on-lime CTA text (~1.4:1 contrast) on the most-clicked button in the app, and client cards that are completely unreachable by keyboard.

## What's Working

1. **`Modal.tsx`** is properly hardened — real Tab focus trap, focus restored to the previously-focused element on close, `aria-labelledby` wired via `useId`. This is a legitimate a11y upgrade, not just markup.
2. **The Leads kanban** (`ManageLeadsPage.tsx`) is the one screen with real product character: drag handle, deal value, source badge, a follow-up-date chip, and a stage-gated "Send Proposal" action that only appears once a lead reaches that stage. This is what "designed for this business" looks like — the rest of the surface should aim here.
3. **`FormField.tsx`** bakes in `aria-invalid`, `aria-describedby`, and auto-paired `id`/`htmlFor` via `useId`, so every form built on it is accessible by default going forward.

## Priority Issues

**[P0] White/lime text is unreadable on the primary CTA**
Why it matters: `ManageClientsPage.tsx:636` renders "Add Client" — the single most-clicked button on the highest-traffic admin page — as `text-white` on `bg-primary` (`#CDFB47`, ~1.4:1 contrast). The same bug hits a link at `:787` (`text-primary` lime-on-white). Both fail WCAG at any size, and it's inconsistent with `AdminDashboardPage.tsx:408` and `ManageLeadsPage.tsx:490`, which already use `text-dark` on the same lime correctly elsewhere in the app.
Fix: swap to `text-dark` in both spots — this is a straight copy-paste inconsistency, not a design decision to relitigate.
Suggested command: `/impeccable harden`

**[P0] Client cards are keyboard-unreachable**
Why it matters: `ManageClientsPage.tsx:709-712` navigates via `<div onClick>` with no `role`, `tabIndex`, or `onKeyDown` — the primary way into a client record on the primary CRUD page cannot be reached by keyboard or screen reader. The Edit/Delete buttons nested inside only reveal on `group-hover`/`group-focus-within`, so a keyboard user tabs into controls attached to a card they can never activate in the first place.
Fix: make the card body a real `<Link>`/`<button>` wrapper, or add `role="link" tabIndex={0}` + Enter/Space handling; keep Edit/Delete as sibling elements outside the click target, not nested inside it.
Suggested command: `/impeccable harden`

**[P1] Failures render as false emptiness**
Why it matters: `ManageClientsPage.tsx:506` swallows fetch failures with `.catch(() => {})`, so a dead API renders the same "No client accounts registered yet" empty state as a genuinely empty database. Staff will attempt to re-add a client that already exists. The same pattern silently zeroes out revenue on `AdminDashboardPage.tsx:353`.
Fix: introduce a distinct `error` state (separate from `empty`) with a visible message and a Retry action, on both screens.
Suggested command: `/impeccable harden`

**[P1] Design-system primitives exist but aren't adopted on the pages that matter most**
Why it matters: `EmptyState.tsx`, `StatusPill.tsx`, and `Spinner.tsx` were built this session specifically to kill duplicated, drifting patterns — but `ManageClientsPage.tsx` (`:697-700` empty state, `:763-773` status pill) and `ClientDetailPage.tsx` (three separate ad-hoc "Loading…" strings) still hand-roll the exact things the primitives solve. Every day this gap stays open, the two versions drift further apart and the "shared" component stops being a source of truth.
Fix: finish the adoption sweep on `ManageClientsPage.tsx` and `ClientDetailPage.tsx` specifically — the two highest-traffic screens — before adding any new primitive.
Suggested command: `/impeccable polish`

**[P2] Zero power-user affordances on a tool used all day, every day**
Why it matters: no keyboard shortcuts anywhere, no sort, no saved filters, and search state lives in local component state (`ManageClientsPage.tsx:485`) rather than the URL — so back-navigation or a refresh silently discards it. This is a daily-use internal tool for a small number of expert staff; heuristic 7 scored 1/4 specifically because of this.
Fix: sync search/filter to `useSearchParams`; add a `/`-to-focus-search convention and bulk-select to the Clients/Projects list to match what Leads already has.
Suggested command: `/impeccable optimize`

## Persona Red Flags

**Alex (Power User)**: Types into the Clients search box (`ManageClientsPage.tsx:485`), opens a client, hits browser Back — search term and scroll position are both gone, must retype from scratch; this happens dozens of times a day for someone triaging accounts. With 200+ clients rendered as an unpaginated 2-column card grid with no sort, finding one specific account means scrolling or an exact-string match — `filtered` has no fuzzy matching, so a trailing space breaks the search. Bulk delete exists only on the Leads board; deleting five stale clients means five separate hover-reveals and five native confirm dialogs.

**Sam (Accessibility-Dependent)**: Cannot open a client record at all via keyboard — `ManageClientsPage.tsx:709` is a non-focusable `<div onClick>`, so the primary navigation affordance on the primary page is invisible to Tab and to a screen reader. On `ClientDetailPage.tsx:325-341`, the four-way view switcher is a row of plain `<button>`s with no `role="tablist"`/`aria-selected`, so a screen reader announces four unrelated buttons with no indication which is active — the only signal is a border-color change. `alert()` calls (e.g. `ClientDetailPage.tsx:144`) interrupt with an OS-level modal mid-upload, seizing focus away from the task.

## Minor Observations

- `ConfirmDialog.tsx:161-165` sets `variant={destructive ? 'primary' : 'lime'}` and then overrides it entirely with four `!important` classes — the variant prop is dead code; worth a real `danger` variant on `Button` instead.
- `AdminLayout.tsx:277` shows an X icon in the header when the sidebar is expanded — conventionally "close this page," not "collapse the rail." A dedicated collapse icon reads more accurately.
- `ManageClientsPage.tsx:707`: `const latest = cp[0]` is labeled "latest" but is just array-order-first; if the API response isn't sorted, the card can show an arbitrary project as the newest one.
- Export dropdown (`ManageLeadsPage.tsx:447`) has no click-outside-to-close handler and no `aria-expanded`.
- Nested interactive elements: `ClientDetailPage.tsx:510-518` places a clickable "Open" span inside an accordion `<button>` — invalid HTML and a confused screen-reader announcement.

## Questions to Consider

1. If the admin dashboard were deleted and staff landed directly on the Leads pipeline after login, would anyone notice? If not, what would need to be on the dashboard — today's meetings, overdue invoices, leads gone quiet for 7+ days — to make it earn its position as the first thing staff see?
2. Ten shared primitives were built this session specifically to stop duplication, and the primary CRUD page still hand-rolls the empty state and status pill they were built to replace. Is the design system a contract the team enforces going forward, or a one-time snapshot that starts drifting again next sprint?
3. Lead → Proposal → Quotation → Project → Invoice is one continuous process but lives as five disconnected sidebar destinations with no "what's next" affordance anywhere except the stage-gated Send Proposal button on one kanban card. What would it look like for that chain to be the actual information architecture instead of a metaphor confined to one screen?
