---
target: admin dashboard all pages (re-run)
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-25T06-13-18Z
slug: client-src-pages-admin
---
Method: dual-agent (A: aace33538fa3ff132 · B: a3bb45d7a34353ca4)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Autosave indicators exist; kanban drag/bulk-select toggles have no announced state |
| 2 | Match System / Real World | 3 | CRM terminology (Leads, Proposals, GST) matches domain fluently |
| 3 | User Control and Freedom | 2 | Modal Esc/focus-trap solid; kanban stage-change has no cancel/undo beyond the drop itself |
| 4 | Consistency and Standards | 1 | Card/Modal fixed, but Button and shared Input/Select/Textarea weren't |
| 5 | Error Prevention | 2 | Bulk-delete likely gated by ConfirmDialog; drag stage-changes have no confirmation |
| 6 | Recognition Rather Than Recall | 3 | Sidebar always shows active section, text labels throughout |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts found; pipeline stage-change is drag-only |
| 8 | Aesthetic and Minimalist Design | 2 | Flat Operate surfaces sit next to hardcoded rounded-card/shadow-glass remnants on the same pages |
| 9 | Error Recovery | 2 | Good error+retry pattern on Leads; not confirmed consistent elsewhere |
| 10 | Help and Documentation | 1 | No contextual help/tooltips anywhere in the dashboard |
| **Total** | | **20/40** | **Acceptable, low end** |

## Design Specificity Verdict

Mixed. IA, StatusPill semantic map, and kanban pipeline are authored for this product. Interactive chrome (Button, shared form inputs) still largely Persuade-mode after this fix round. Deterministic scan: 2 warnings, both pre-existing and out of admin-page scope (ReviewsSection.tsx purple gradient, AdminLayout.tsx:266 gray-on-rose logout hover).

## Priority Issues

[P0] Button.tsx never got the Operate treatment - no useOperateMode() import, hardcoded rounded-button/shadow-glass across every admin page's most-used control.
[P0] Shared Input/Textarea/Select (FormField.tsx) paint a Signal Lime focus glow (.focus-ring in index.css) in Operate mode, contradicting DESIGN.md's "no glow, no ring" spec - only AdminLoginPage's hand-rolled inputs were fixed, not the shared primitives every other form uses.
[P1] Hand-rolled rounded-card/shadow-glass containers bypass Card entirely: ManagePricingPlansPage.tsx:247, ManagePlatformSolutionsPage.tsx:239, ProjectDetailPage.tsx:1069, ClientProjectsPage.tsx:202, ManageLeadsPage.tsx:574,613.
[P1] Kanban lead-stage change (ManageLeadsPage.tsx:684-685) is drag-and-drop only, no keyboard path - blocks a core admin task for keyboard/screen-reader users.
[P2] AdminLayout.tsx:276 header still uses Persuade glassmorphism (backdrop-blur-glass) despite being the file that establishes the Operate boundary.

## Persona Red Flags

Alex (Power User): no keyboard shortcuts anywhere; pipeline stage-change is mouse-only drag; bulk-select pattern not visibly consistent across pages.
Sam (Accessibility-dependent): cannot complete the primary pipeline task at all (drag-only, no role/keyboard equivalent); kanban drop feedback is visual-only; the lime focus-glow bug ironically gives Sam the dashboard's only reliable focus cue right now.

## Minor Observations

- Card.tsx:21-23 custom-class detection is regex-based, misses arbitrary-value classes like p-[18px].
- font-display (Fraunces) appears below Title size in 3 Operate contexts (AdminLayout.tsx:284, ManageLeadsPage.tsx:626, Modal.tsx:147), violating DESIGN.md's absolute rule.
- ManageProposalsPage.tsx:162 hardcodes hover:bg-[#bce63b], a third lime-adjacent value outside the token system.
- AdminLayout.tsx:250-259 sidebar Client Portal link uses stock text-lime-600 instead of the primary token.

## Questions to Consider

- If Card and Modal got fixed but Button didn't, was Button reviewed at all, or did the fix stop at the first primitive named?
- Is drag-and-drop meant to be the only way to move a lead through the pipeline?
- Was the .focus-ring/Operate "quiet focus" tension ever noticed before this pass?
