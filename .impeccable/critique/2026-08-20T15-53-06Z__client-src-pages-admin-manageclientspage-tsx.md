---
target: Admin CRM dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-20T15-53-06Z
slug: client-src-pages-admin-manageclientspage-tsx
---
Method: dual-agent (A: a9a90c3d11c22b7b6 · B: ab9695d42e2a014df)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons/retry states solid; bulk delete showed no per-item spinner |
| 2 | Match System / Real World | 3 | "Case Studies"/"Active Workspaces"/"Platform Cards" — three vocabularies for adjacent things |
| 3 | User Control and Freedom | 2 | Deletes permanent, no undo anywhere |
| 4 | Consistency and Standards | 2 | `Button` component bypassed by hand-rolled classes on nearly every admin page |
| 5 | Error Prevention | 1 | Payment amount unbounded, no double-submit guard |
| 6 | Recognition Rather Than Recall | 3 | Sidebar groups solid; select-mode had no persistent hint |
| 7 | Flexibility and Efficiency | 1 | `/` + Escape is the entire power-user surface; no select-all, no shift-range, export ignored filter |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, restrained |
| 9 | Error Recovery | 2 | Fixed on 3 pages, absent on the busiest one (Leads) |
| 10 | Help and Documentation | 2 | Good field hints; zero onboarding for select mode/import format |
| **Total** | | **22/40** | **Acceptable — round scope expanded to catch prior gaps** |

**Trend (last 3 runs): 22 → 26 → 22 (out of 40)** — the drop reflects deeper coverage (Modal focus bug, ManageLeadsPage), not regression on previously-fixed surfaces.

## Priority Issues (all fixed same session)

**[P0] Modal steals focus on every keystroke** — `Modal.tsx`'s effect depended on `[isOpen, onClose]`; every inline `onClose` arrow (nearly every caller) re-ran the effect on every parent re-render, re-focusing the close button mid-typing. Fixed: `onClose` moved to a ref via `useLatest`, lifecycle effect now depends only on `[isOpen]`, initial focus now prefers the first field inside the content area over the header close button.

**[P1] Round-2 fixes never reached `ManageLeadsPage.tsx`** — bulk delete was still `Promise.all` over raw `fetch` (never rejects on 4xx/5xx); drag-drop had no revert-on-failure; `fetchPipelineData` had no load-error/Retry state. Fixed: ported the `allSettled` + `res.ok` + partial-failure pattern; failed drag-drop now reverts the optimistic move and shows a toast; added `loadError` + Retry to the board.

**[P1] `alert()` survived in the busiest flows** — `ManageLeadsPage.tsx` (export/import) and `ManageStagesModal.tsx`. Fixed: replaced with an inline toast system on Leads and inline form errors on the Stages modal.

**[P2] Export ignored the active filter** — `ManageClientsPage.tsx` CSV/JSON export mapped over all `clients` while the stat tiles above already scoped to `filtered`. Fixed: both exports now use `filtered`, buttons show the filtered count when searching.

**[P2] `.catch(() => {})` still live in `MeetingsPanel.tsx`** — meetings load failure was invisible. Fixed: added `loadError` + Retry on the agenda view; secondary background fetches (Google status, client picker) documented as intentionally non-blocking.

**[P3] Currency hardcoded to ₹ regardless of client's actual currency** — `InvoiceManagerPage.tsx` and `ClientDetailPage.tsx` rendered every amount in rupees even though both collect a per-client `currency` field. Fixed: added a shared `formatMoney(amount, currencyCode)` helper in `utils/format.ts` and applied it everywhere client/invoice/project money renders on both pages.

## Persona Red Flags (fixed)

**Sam**: could not complete the Add Client form — Modal's focus-steal bug (see P0) yanked focus to the close button on every keystroke. Fixed by the Modal fix above.

## Minor Observations (fixed)

- `CheckSquare` used for two different meanings (toolbar toggle vs. selected-checkbox glyph) — split into `CheckSquare`/`Check` in a prior round, still holding.
