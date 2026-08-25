---
target: admin dashboard all pages (run 5)
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-25T07-41-01Z
slug: client-src-pages-admin
---
Method: dual-agent (A: a063c68801f2c9b48 · B: aa5b701c83b5a70b4)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Toast confirms every move with lead/project name and target stage |
| 2 | Match System / Real World | 3 | Unchanged, fine |
| 3 | User Control and Freedom | 4 | Real undo/redo chain, correctly engineered |
| 4 | Consistency and Standards | 4 | Icon-select, toast, hotkeys identical across both kanban pages |
| 5 | Error Prevention | 3 | No confirm-before-drag, acceptable given Undo exists |
| 6 | Recognition Rather Than Recall | 3 | Help icon + search hint exist; no persistent N cue |
| 7 | Flexibility and Efficiency | 3 | Real accelerators exist but coverage thin, hook re-render churn |
| 8 | Aesthetic and Minimalist Design | 3 | 2-3 icon controls now on an already dense lead card |
| 9 | Error Recovery | 3 | Reverts and shows a toast but doesn't reconcile with server - rapid-move race |
| 10 | Help and Documentation | 3 | Accurate shortcuts modal exists, weak discoverability, one omission |
| **Total** | | **33/40** | **Good** |

## Design Specificity Verdict

Solid and non-generic. Icon-overlay select pattern applied consistently across both kanban surfaces. Undo-as-redo mechanism is real engineering, traced correctly - no stale closures, single-toast-timer discipline holds up.

## Priority Issues

[P1] Same-card rapid-move race can silently desync client from server - ClientProjectsPage.tsx:119-144 and ManageLeadsPage.tsx:380-417 revert to a captured previousStatus without checking current state, so a failed request that resolves after a second successful one can stomp the correct server state with no error shown.
[P2] The "?" help entry point (AdminLayout.tsx:291-298) is a small unlabeled ghost icon, easy to miss for the persona (Sam) who most needs it.
[P2] KeyboardShortcutsModal omits the new Enter/Space card-activation behavior added to both kanban pages.
[P3] "N" documented capitalized but bound to lowercase 'n' - works for a plain keypress, silently no-ops on Shift+N.
[P3] useHotkey consumers re-subscribe the listener every render via inline handlers - not a leak, just avoidable churn.

## Persona Red Flags

Alex (Power User): N and drag both work smoothly. Rapid back-to-back drags on the same card would trip the P1 race with no visible signal.
Sam (Accessibility-dependent): Undo safety net works exactly as needed. Least likely to find the small "?" icon unprompted.

## Minor Observations

- Toast uses aria-live="assertive" for both success and error; polite would be gentler for routine success confirmations.
- handleStageChange's options? param is now only ever called from moveLead - worth confirming nothing else calls it differently.

## Questions to Consider

- Should the icon-select become the primary control with drag as the enhancement, given it's strictly safer (undo-backed, no race) as currently implemented?
- Is 6 seconds long enough for a cautious, read-before-acting user to notice and act on Undo?
