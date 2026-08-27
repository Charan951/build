---
target: whole client app
total_score: 26
max_score: 32
na_heuristics: 7,10 (Persuade only)
p0_count: 1
p1_count: 1
timestamp: 2026-08-27T05-24-05Z
slug: whole-client-app
---
Method: dual-agent (A: a771e181cb396996a · B: a5297780a05ec9c6d)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good on Operate; Persuade mostly static |
| 2 | Match System / Real World | 2 | FAQ's "6 to 10 weeks" contradicts hero's "in Just 5 Days" |
| 3 | User Control and Freedom | 3 | Modal focus-trap/Escape, mobile drawer focus management above-average |
| 4 | Consistency and Standards | 2 | Client Portal falls back to raw alert() while every other surface uses styled banners |
| 5 | Error Prevention | 2 | Category filters can produce a silent empty grid |
| 6 | Recognition Rather Than Recall | 3 | Labeled nav throughout |
| 7 | Flexibility and Efficiency | Persuade n/a, Operate 3 | /, n, ? hotkeys plus discoverable shortcuts modal |
| 8 | Aesthetic and Minimalist Design | 3 | Homepage's 12+ section count undercuts an otherwise clean system |
| 9 | Error Recovery | 2 | Portal alert() gives zero recovery guidance |
| 10 | Help and Documentation | Persuade n/a, Operate 3 | Shortcuts modal is a genuine, uncommon help affordance |
| **Total** | | **26/32** | **Good** |

## Design Specificity Verdict

Mixed. Persuade has real authored identity (Lightfall shader, Fraunces/Inter split, domain-specific copy) but the homepage's 12+ section long-scroll structure is the generic dev-agency pattern. Operate mode is intentionally admin-shaped by brief and succeeds at that goal. Deterministic scan: 0 findings across client/src, consistent with the just-completed audit fixes.

## Priority Issues

[P0] Hero's "5 Days" claim (HomePage.tsx:373,402,490) directly contradicts the FAQ's "6 to 10 weeks" (HomePage.tsx:330) - PRODUCT.md states the 5-day claim is load-bearing and literal. This is a factual/business question requiring user input on which number is correct or how they relate, not something to silently edit.
[P1] Client Portal falls back to native alert() for upload/delete failures (ClientPortalDashboardPage.tsx:123,125) - the highest-stakes client-facing surface abandons the app's own visual system exactly where reassurance matters most.
[P2] Leads kanban toolbar (ManageLeadsPage.tsx) stacks 6+ top-level actions (New Lead, Manage Stages, Import, Export, Select-mode, Search) exceeding the cognitive-load 4-choice guideline.
[P2] Homepage decision density - 12+ sections, three separate lime CTAs, no single obvious primary action for a first-time visitor.
[P3] ProjectsPage category filter likely has no defined empty-result state.

## Persona Red Flags

Jordan (First-Timer): hits the FAQ contradiction with no help affordance to resolve it on Persuade.
Alex (Power User): well served by hotkeys and kanban gesture handling; toolbar density is the one miss.
Sam (Accessibility-dependent): no red flags found; portal's alert() is an accidental screen-reader bright spot in an otherwise inconsistent error path.

## Minor Observations

- HomePage.tsx:351's Lightfall shader gradient includes #65A30D, which DESIGN.md documents as "an isolated instance" elsewhere - it's not actually isolated, so DESIGN.md's own documentation is now inaccurate either way.
- AboutPage.tsx, ServiceDetailPage.tsx, TermsOfServicePage.tsx weren't read this pass - flagged unreviewed, not assumed clean.

## Questions to Consider

- Is "6 to 10 weeks" describing a different offering than the "5 days" hero claim, or is it stale copy?
- Does the portal's alert() reflect an unrevisited shortcut, or was it missed during the Operate-mode migration?
- With three lime CTAs plus a lime shader plus a lime stat number on one hero, is DESIGN.md's own "lime = rare signal" rule being diluted on the page meant to model it best?
