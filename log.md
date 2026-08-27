# Log

Append-only, reverse-chronological record of shipped features and fixes. Each entry is `YYYY-MM-DD HH:MM (timezone) — Task/Feature Name`, one entry per feature — updated after every feature lands. For current state, engineering decisions, and known issues, see `MEMORY.md` instead; this file is the chronological trail, not the curated summary.

## 2026-08-27 12:28 IST — Set up standard 3-tier CLAUDE.md structure

Moved `CLAUDE.md` from `.claude/CLAUDE.md` back to the repo root (Claude Code's documented auto-load convention), and added an empty, gitignored `CLAUDE.local.md` at the root for personal/machine-local overrides. Completes the standard tier: `~/.claude/CLAUDE.md` (global, untouched) → `./CLAUDE.md` (project) → `./CLAUDE.local.md` (personal). Updated `MEMORY.md`'s cross-references to match.

## 2026-08-27 12:21 IST — Reformat log.md to date+time+task-name entries

Restructured this file's entries from date-grouped bullet lists to individual `date time — task name` headers, per user request. Also updated `.claude/CLAUDE.md`'s log.md rule to specify this format for future entries.

## 2026-08-27 05:24 IST — Fix all findings from whole-app `/impeccable critique`

Score 26/32 (Good). Corrected the hero-vs-FAQ delivery-time contradiction ("5 days" vs "6 to 10 weeks") after confirming 5 days is correct; replaced `ClientPortalDashboardPage`'s raw `alert()`/silently-failing delete with a proper toast pattern; consolidated the leads-pipeline toolbar's Import/Export into one "Data" menu to cut top-level choices from 6+ to 4; fixed `ProjectsPage`'s empty-category-filter case silently falling back to unrelated sample project data.

## 2026-08-27 04:00 IST — Fix all findings from whole-app `/impeccable audit`

Score 14/20 → clean. Brought the Client Portal into the Operate-mode system (`OperateModeProvider`, `data-operate-mode`, named radius tokens) which had been running outside it entirely; added `prefers-reduced-motion` handling to marquees and the `Lightfall` shader; added `role`/`aria-live` to `LeadForm`'s result banners; fixed Footer's social icons falling back to bare platform domains; swapped raw Tailwind radius classes for named Operate tokens across ~20 admin pages; added mobile-nav-drawer accessibility (`aria-expanded`, focus management, Escape-to-close); added a shadow separator to sticky admin-table Actions columns; resolved (not just re-deferred) the AdminLayout logout-hover and ReviewsSection purple-gradient findings from prior sessions.

## 2026-08-25 — Close admin-dashboard Operate-mode design-drift cycle

6 critique/fix rounds (`.impeccable/critique/` tracks the score trend). Made the lime-focus-ring fix structural (CSS scoped under a `data-operate-mode` attribute) after three rounds of per-component patches kept missing sibling components; fixed a same-target race condition in the lead/project stage-move undo logic (status-string comparison couldn't tell two requests apart when they shared a target value — replaced with a per-entity request-sequence counter); added undo-on-move toasts, error-recovery with proper revert, and keyboard shortcuts (`/`, `n`, `?`) via a shared `useHotkey` hook across nearly all admin list pages.

## 2026-08-26 — Add project CLAUDE.md and MEMORY.md

Then moved `CLAUDE.md` into `.claude/CLAUDE.md` per the user's preferred layout (global `~/.claude/` config untouched); scaffolded empty `.claude/commands/`, `.claude/skills/`, `.claude/agents/` for future project-local additions.

## 2026-08-27 05:24 IST — Start this log file

Seeded with a backfill of major milestones from earlier in this engagement (see below), then switched to per-entry format shortly after (see top entry).

## Earlier (dates approximate, backfilled from `MEMORY.md`)

- Fixed Puppeteer/Chrome not being present at runtime on Render (`.puppeteerrc.cjs` cache redirect + explicit install in the build script).
- Made AI proposal-content generation reliable: Gemini-first provider chain with Groq/OpenRouter fallback; non-templated AI output.
- Rebuilt the proposal editor as a full-page route with Document mode (default, AI-styled) and a manual Canvas mode sharing `QuotationEditorPage`'s `QElement`/`QPage` model.
- SEO overhaul: sitemap/robots.txt reachability, canonical-domain fixes, bot-visible OG/schema via `client/middleware.ts`, real 404 handling, and the `getServiceBySlug` auto-creation bug that had produced a junk indexed page.
- Expanded two thin blog posts; added Privacy Policy and Terms of Service pages.
- Configured GoDaddy SMTP mail integration and verified with a real test send.
