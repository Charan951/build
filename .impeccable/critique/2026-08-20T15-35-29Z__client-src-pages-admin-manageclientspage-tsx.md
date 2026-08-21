---
target: Admin CRM dashboard
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-20T15-35-29Z
slug: client-src-pages-admin-manageclientspage-tsx
---
Method: dual-agent (A: a0722fc4265b11d58 · B: a6e13535689be2165)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Save/delete give no success confirmation; list silently refetches |
| 2 | Match System / Real World | 3 | Field is `companyName` but labeled "Client Name" with placeholder "John Doe" |
| 3 | User Control and Freedom | 2 | Delete is permanent with no undo; bulk delete has no per-item preview |
| 4 | Consistency and Standards | 2 | Three different lime-hover recipes across ManageClientsPage/ClientDetailPage/Button |
| 5 | Error Prevention | 2 | Bulk delete uses `Promise.all` — one failure loses partial-success visibility |
| 6 | Recognition Rather Than Recall | 3 | Good `/`-hint kbd; nothing signals Select mode disables card navigation |
| 7 | Flexibility and Efficiency | 2 | `/` focus + bulk delete exist, but no Select All, no Esc-to-exit, no debounce |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, but 5 competing top-bar controls before any client is visible |
| 9 | Error Recovery | 3 | List/delete errors now surface with Retry; ClientDetailPage's own fetch still has no `.catch`, and upload still uses `alert()` |
| 10 | Help and Documentation | 3 | Great currency/email hints; nothing explains what deleting a client does to its projects |
| **Total** | | **26/40** | **Acceptable — up from 22/40** |

## Design Specificity Verdict

**LLM assessment**: Specific at the card and detail level, generic at the page level. The client card does real agency-specific work — project count, most-recent-project name/stage inline, an inline "New Project" shortcut — and `ClientDetailPage.tsx`'s portal-invite card sells the actual feature in the agency's voice. But the page header above it is stock: four global stat tiles that don't respond to search and answer a question nobody asks ("how many clients exist" instead of "who owes money, who's gone quiet, what's overdue"). Money exists on the detail page but never on the list, so surfacing an overdue client means opening every card one at a time.

**Deterministic scan**: One finding, same as the prior run — a `gray-on-color` warning at `AdminLayout.tsx:264` pairing idle `text-gray-600` with `bg-rose-500/10`. Independently re-verified as a false positive: the rose background and the `rose-600` text both only apply on `hover:`, so the flagged gray-on-rose combination never actually co-renders. Net deterministic signal: clean.

**Visual overlays**: Skipped — no browser automation tool available in this environment.

## Overall Impression

Real progress since the last run (22 → 26/40): every P0 and P1 from that pass is verified fixed, plus most of the P2/minor list. But the bulk-delete feature added to close the "no power-user affordances" gap introduced two new issues of its own — a `Promise.all` that loses partial-failure visibility, and an unlabeled `role="checkbox"` — and the underlying error-swallowing pattern that was fixed on `ManageClientsPage.tsx` is still live one page over, on `ClientDetailPage.tsx`'s own fetch and on two other admin pages entirely (`InvoiceManagerPage.tsx`, `ReportsAnalyticsPage.tsx`). The fix pattern worked; it just needs to finish propagating.

## What's Working

1. **`ManageClientsPage.tsx:97-107`** — the `/`-to-focus shortcut correctly bails out of inputs/contenteditable and pairs with a visible `kbd` hint. Real power-user craft, not a token gesture.
2. **`ManageClientsPage.tsx:416-422`** — the keydown guard (`if (e.target !== e.currentTarget) return`) correctly prevents nested buttons from double-firing card activation, the right fix rather than a hack.
3. **`ClientDetailPage.tsx:370-384`** — the portal-invite empty state sells the feature in-voice and disables itself with an explanatory `title` when there's no email on file.

## Priority Issues

**[P1] Bulk delete loses partial-failure visibility and can leave the grid stale**
Why it matters: `ManageClientsPage.tsx:190-201` uses `Promise.all` for bulk delete — if client 3 of 5 fails, the other 4 are already gone, the dialog just shows a generic error, and `fetchClients()` never runs because the `.then()` chain short-circuits, so the grid keeps showing clients that no longer exist.
Fix: switch to `Promise.allSettled`, always refetch regardless of outcome, and report which specific clients failed ("3 of 5 deleted — 2 failed").
Suggested command: `/impeccable harden`

**[P1] Unlabeled `role="checkbox"` from the new bulk-select work**
Why it matters: `ManageClientsPage.tsx:412-413` puts `role="checkbox"` on a `<div>` with no accessible name — a screen reader announces "checkbox, not checked" and then reads the entire card body with no indication which client the checkbox belongs to.
Fix: add `aria-label={\`Select ${client.companyName}\`}` when in select mode.
Suggested command: `/impeccable harden`

**[P2] Error swallowing fixed on Clients, still live next door**
Why it matters: `ClientDetailPage.tsx`'s own `fetchClient` (`:90-104`) still has no `.catch`, so a network failure renders the exact false-empty "Client not found" state the last critique flagged — just on the sibling page this time. Upload failures there still use `alert()` (`:146,148`). The same silent-swallow pattern also survives untouched on `InvoiceManagerPage.tsx:29` and `ReportsAnalyticsPage.tsx:18`.
Fix: apply the same load-error/Retry pattern already shipped on `ManageClientsPage.tsx` to these four spots.
Suggested command: `/impeccable harden`

**[P2] Stat tiles are page-global and inert on a filtered list**
Why it matters: `ManageClientsPage.tsx:259-295` counts all projects regardless of the active search filter, isn't clickable, and shows nothing staff actually chase (outstanding balance, clients gone quiet).
Fix: either make the tiles reflect the current filter or replace them with actionable figures (total outstanding balance, clients with no project in 30 days).
Suggested command: `/impeccable clarify`

**[P3] Lime hover color forked three ways**
Why it matters: `ClientDetailPage.tsx:284,380,416,550` hardcode `#bce63b`; `ManageClientsPage.tsx:271` uses `bg-primary/90`; the `lime` Button variant does neither — one brand hover state, three implementations.
Fix: route every lime hover through the `Button` `lime` variant or a single shared token.
Suggested command: `/impeccable polish`

## Persona Red Flags

**Sam (Accessibility-Dependent)**: The new `role="checkbox"` (`ManageClientsPage.tsx:412`) has no accessible name, and the selected-count bar (`:356`) isn't a live region, so checking a box announces nothing about the running total. `Modal.tsx:57` auto-focuses the first focusable element, which for the delete dialog is Cancel (safe) but for the edit-client form is the modal's own close button, so the first real field is always two tabs away.

**Alex (Power User)**: No Select All, no shift-click range select, and no Escape to leave select mode (`ManageClientsPage.tsx:174-183`). Search filters `clients` client-side with no debounce, and `clientProjects()` re-filters and re-sorts the full `projects` array per card on every render (`:404`) — an O(clients × projects) cost on every keystroke that will visibly lag past a few hundred records.

## Minor Observations

- The two CSV/JSON export buttons on Clients should collapse into one dropdown, matching the pattern Leads already uses.
- `deleteError` (`:158`) is shared between the single-delete and bulk-delete dialogs and isn't cleared on `requestDelete`, so a stale error from a previous bulk attempt can appear in a fresh single-delete dialog.
- `CheckSquare` is used both as the toolbar Select-mode toggle icon and as the checkmark glyph inside a selected card (`:350` and `:437`) — two different meanings sharing one icon; the inner one should be `Check`.

## Questions to Consider

1. This page currently answers "how many clients exist." Is that ever actually the question a BYT staffer opens this page to answer, or is it always "who owes me money" or "who's gone dark"?
2. Bulk delete just shipped — is deleting five clients at once a real agency workflow, or did select-mode get built because bulk-select is what CRM reference screenshots have? Bulk export-selected or bulk-tag might earn the feature more honestly.
3. Deleting a client silently orphans its projects, invoices, files, and portal login with no explanation in the confirm dialog. Should this stay a hard delete-with-confirmation, or become an archive-with-undo?
