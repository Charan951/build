---
target: admin dashboard all pages (run 3)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-25T06-56-30Z
slug: client-src-pages-admin
---
Method: dual-agent (A: a57de82a82747aaf8 · B: a36315ef0d40f3bb9)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Optimistic stage-change updates instantly; no post-change confirmation |
| 2 | Match System / Real World | 3 | CRM terminology consistent and domain-appropriate |
| 3 | User Control and Freedom | 2 | No undo on a stage change |
| 4 | Consistency and Standards | 2 | Focus treatment inconsistent: quiet border-shift on 3 shared form primitives, loud lime glow elsewhere (154 raw focus-ring occurrences across 18 admin files, including Button.tsx) |
| 5 | Error Prevention | 3 | Confirm dialogs on destructive actions |
| 6 | Recognition Rather Than Recall | 3 | Icon buttons carry title/aria-label |
| 7 | Flexibility and Efficiency | 2 | New keyboard path exists but cramped and slower than drag |
| 8 | Aesthetic and Minimalist Design | 2 | Kanban drag-over state is a Persuade-weight escalation inconsistent with Card.tsx's own quiet-hover language |
| 9 | Error Recovery | 2 | Generic error+retry exists; no confirmed per-action recovery on failed stage-change |
| 10 | Help and Documentation | 2 | Tooltips serve as micro-help; no onboarding |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

High intent, leaky enforcement. Real load-bearing tokens and a purpose-built useOperateMode() context exist, but compliance is re-litigated component-by-component across three runs instead of enforced structurally. Deterministic scan: 0 findings in client/src/pages/admin across all three runs - drift is invisible to pattern matching. Only the same two pre-existing out-of-scope findings recur (ReviewsSection.tsx purple gradient, AdminLayout.tsx:266 gray-on-rose).

## Priority Issues

[P1] .focus-ring Signal Lime glow still unconditional in ~154 places across 18 admin files, including Button.tsx itself - the same primitive re-audited last run for radius/shadow but not focus-ring three lines above.
[P1] Button.tsx's Operate branch incomplete - radius/shadow fixed, focus-ring not.
[P2] Modal.tsx:131 backdrop-blur-md unconditional regardless of mode - only dialog radius was audited, not backdrop material.
[P2] Kanban drag-over state (ManageLeadsPage.tsx:613-617) uses shadow-2xl scale-[1.02] ring-4, a Persuade-weight escalation inconsistent with Card.tsx's own quiet-hover language a few hundred lines away.
[P3] New stage-select is functionally correct but max-w-[72px] truncate clips most real stage names to illegibility.

## Persona Red Flags

Alex (Power User): new select is a net win for keyboard access but slower than drag for volume work; lime glow on every tab-stop is friction against the "fast and functional" motion promise.
Sam (Accessibility-dependent): select substantively delivers on the core blocker from the prior run. Gaps: truncated label clips visible stage names for low-vision users; no aria-live announcement after a successful move.

## Minor Observations

- AdminLayout.tsx sidebar nav uses raw rounded-xl/rounded-lg rather than named operate tokens (numerically identical, vocabulary drift only).
- ManageLeadsPage.tsx:698 lead card uses rounded-2xl rather than the named token.
- ProposalContentEditor.tsx:320 floating AI-refine toolbar uses focus:border-primary, same bug class as the original AdminLoginPage finding, in a component neither prior run touched - possibly intentional (dark floating panel) but undocumented.
- All 5 previously-fixed hand-rolled rounded-card/shadow-glass spots remain clean, no regression.

## Questions to Consider

- At what point does "audit and patch the named component" stop being the fix, and "make the wrong class structurally unreachable inside OperateModeProvider" become the actual fix?
- Would a single CSS-scoping change close the focus-ring leak permanently rather than another N-file patch?
- Is drag-and-drop the right primary interaction for pipeline-stage changes, given it needed a bolt-on accessibility escape hatch?
