---
target: Admin CRM dashboard
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-20T15-56-58Z
slug: client-src-pages-admin-manageclientspage-tsx
---
Method: dual-agent (A: a1f500193ce026a97 · B: a6b4376361548680b)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | ManageProjectsPage's "On Home Page" toggle swallows failures silently |
| 2 | Match System / Real World | 2 | `partially_paid` rendered verbatim; `formatMoney` adoption stalled on several pages |
| 3 | User Control and Freedom | 3 | ConfirmDialog well-adopted, but nested Modal+ConfirmDialog both bind window Escape |
| 4 | Consistency and Standards | 2 | Leads/Stages/EditLead/NewLead subsystem calls raw `fetch()` bypassing the shared API helper |
| 5 | Error Prevention | 3 | Bulk-delete partial-failure and stage-minimum guard solid |
| 6 | Recognition Rather Than Recall | 3 | Kanban strong; Invoices has no filters |
| 7 | Flexibility and Efficiency | 1 | Zero keyboard shortcuts app-wide beyond Clients; export dropdown lacks menu semantics |
| 8 | Aesthetic and Minimalist Design | 3 | Consistent and calm |
| 9 | Error Recovery | 3 | Retry now widespread; ManageStagesModal still swallows |
| 10 | Help and Documentation | 2 | No onboarding on Invoices/Reports |
| **Total** | | **25/40** | **Acceptable** |

**Trend (last 4 runs): 22 → 26 → 22 → 25 (out of 40)**

## Design Specificity Verdict

Leads pipeline and MeetingsPanel are genuinely purpose-built (drag-to-pan kanban, per-stage color, proposal badges, real Google Calendar OAuth states). But Invoices — the screen for "who owes me money" — is an unsearchable, unsortable card stream with `partially_paid` rendered as a raw enum. Reports is four static tiles with no trend or period selector on a page titled "executive analytics." The money screens are the weakest ones, which is backwards for an agency's own CRM.

**Deterministic scan**: 2 findings, both re-confirmed as prior verdicts hold — `AdminLayout.tsx` gray-on-rose (false positive, mutually exclusive hover states) and `ReviewsSection.tsx` purple gradient (technically flagged correctly but a low-priority per-avatar accent, not a theme choice).

## Priority Issues (fixed same session)

**[P0] Kanban lead cards are keyboard-unreachable** — `ManageLeadsPage.tsx:668-687`, a bare `<div onClick>` with no `tabIndex`/`role`/`onKeyDown`. The same defect class fixed in Round 1 on Clients never propagated to the pipeline's central object — the busiest screen in the app was keyboard-inaccessible for editing a lead.

**[P1] `ManageStagesModal.tsx` silently swallows rename/recolor/reorder failures** — no `response.ok` checks on the reorder/save-item/delete calls; a 500 renders as success, the rename appears to work, and reverts on next reload with no explanation.

**[P1] Leads export ignores the active filter** — `ManageLeadsPage.tsx` export maps `leads`, not `filteredLeads` — the exact bug fixed on Clients in Round 3, not propagated to its sibling.

**[P2] `formatMoney` adoption stalled** — still hardcoded ₹ in `ProjectDetailPage.tsx` (18 sites), `ClientProjectsPage.tsx`, `ReportsAnalyticsPage.tsx`, `AdminDashboardPage.tsx`.

**[P3] Escape closes two stacked dialogs at once** — `Modal.tsx` binds Escape on `window`; a `ConfirmDialog` opened from inside a `Modal` closes both on one Escape press.

## Persona Red Flags (fixed)

**Sam**: Leads per-card select checkbox has no `aria-label` (Round 2 fixed exactly this on Clients, never propagated to Leads); `ManageProjectsPage.tsx` search input and category select are unlabeled with no focus-ring.

## Minor Observations (fixed where practical)

- `Button.tsx` has no `focus-visible` ring in its base classes, inconsistent with `FormField`'s `focus-ring`.
- `AdminLayout.tsx` socket toast auto-dismisses with no `aria-live` region.
- `ManageProjectsPage.tsx`'s "featured" toggle needs `aria-pressed`.
