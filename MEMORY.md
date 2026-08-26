# Project Memory

## 1. Project Snapshot
- Name: Build Your Thoughts — enterprise app/web dev agency site + self-built headless CMS/CRM
- Monorepo: `client/` (React 18.3 + TypeScript + Vite) and `server/` (Node/Express + TypeScript + MongoDB/Mongoose), root `package.json` has passthrough scripts only
- Frontend: React Router v6, Tailwind, Framer Motion + GSAP + Three.js/R3F/OGL (marketing-site visuals), react-helmet-async for SEO
- Backend: Mongoose, JWT auth (separate admin vs. client-portal middlewares), Cloudinary, Nodemailer, Puppeteer (PDF generation), Socket.IO
- Deployed cross-platform: frontend on Vercel (`www.buildyourthougths.in` — actual domain spelling is missing a letter), backend API on Render (`build-4tdz.onrender.com`, free tier — cold starts can transiently misbehave)
- See `.claude/CLAUDE.md` (moved here from the repo root 2026-08-26 per the user's preferred project layout — `.claude/commands/`, `.claude/skills/`, `.claude/agents/` also scaffolded as empty dirs for future project-local additions; global `~/.claude/` config is untouched) for full architecture/command reference — don't duplicate that content here.

## 2. Architecture
See `.claude/CLAUDE.md`. Key point not to relitigate: Operate-mode (`/dashboard`, `/portal`) design-system compliance is enforced via `OperateModeContext` + a `data-operate-mode` DOM attribute + CSS-attribute-scoped rules, not per-component props alone — this was arrived at after per-component fixes repeatedly missed instances across several review rounds.

## 3. Design System
Persuade (marketing) vs. Operate (`/dashboard`, `/portal`) — full token spec in root `DESIGN.md`. Two shared core tokens: Signal Lime `#CDFB47`, Circuit Black `#0F1412`. Operate uses a tight radius scale (`operateSm/Md/Lg` = 8/12/16px), no glass/blur, quiet `focus:border-dark`, semantic status-pill colors as the one color exception.

## 4. Engineering Decisions
- **Decision**: Operate-mode compliance is enforced structurally (React context + `[data-operate-mode]` CSS attribute scoping), not via a prop threaded through every component. **Reason**: three consecutive design-critique rounds found the same Persuade-styling leak recurring in a new component each time a prior round's fix only patched the specific component named — a structural fix closes the leak for every consumer at once, including hand-rolled elements outside the shared primitives. **Date**: 2026-08-25.
- **Decision**: Stage/status-change "undo" and error-recovery on optimistic UI updates (lead pipeline, client-projects kanban) use a per-entity monotonic request-sequence counter (`moveSeqRef`), not a status-string equality check, to decide whether a resolving request is still allowed to mutate state. **Reason**: a status-string guard can't distinguish two different requests that happen to target the same value (e.g. an impatient double-click) — a stale failure could silently revert a newer, server-confirmed success. **Date**: 2026-08-25.
- **Decision**: `getServiceBySlug` never auto-creates a `Service` document for an unmatched slug. **Reason**: the prior behavior let any unauthenticated GET to an unmatched slug permanently create a fake, publicly-visible service page with fabricated content — root cause of a junk `/services/eg` page appearing in search results. **Date**: earlier this engagement (pre-2026-08-25).
- **Decision**: AI proposal-content generation provider order is Gemini → Groq → OpenRouter (not alphabetical/arbitrary). **Reason**: user's explicit priority order, and each provider has had a specific real failure mode fixed (Groq's model was retired/404, wrong token budget caused 413s, Gemini's 503 "high demand" needed a retry-once wrapper) — don't reorder without re-verifying these fixes still apply per-provider. **Date**: earlier this engagement.

## 5. Completed Major Work
- **Puppeteer/PDF generation on Render**: fixed Chrome-not-found-at-runtime via `.puppeteerrc.cjs` cache redirect + explicit `npx puppeteer browsers install chrome` in the build script.
- **AI proposal generation reliability**: Gemini-first provider chain with Groq/OpenRouter fallback, non-hardcoded/non-template AI output (CSS classes presented as an optional toolkit, not a mandatory structure).
- **Proposal editor**: converted from a modal to a full-page route (`ProposalTemplateEditorPage.tsx`) with two render modes — polished "Document" mode (default, AI-styled HTML) and a manual freeform "Canvas" mode (same `QElement`/`QPage` model as `QuotationEditorPage.tsx`), with a document→canvas sync path.
- **SEO overhaul**: fixed sitemap/robots.txt unreachability (Vercel rewrite ordering), wrong canonical domain across ~12 files, missing bot-visible OG/schema tags (added `client/middleware.ts` Vercel Edge Middleware), missing H1s, unlazy images, render-blocking fonts, the `/services/eg` junk-page auto-creation bug, robots.txt gaps, missing real 404 handling (both a `NotFoundPage.tsx` React route and the edge middleware's bot-facing 404). GSC verified live; new-domain ranking still pending (time-dependent, not a code issue).
- **Content**: expanded two thin blog posts into full articles; created Privacy Policy and Terms of Service pages with real business details.
- **Mail integration**: configured GoDaddy SMTP (`smtpout.secureserver.net:465`), verified with a real test send.
- **Admin dashboard Operate-mode design-system compliance** (6 critique/fix rounds, `.impeccable/critique/` snapshots track score trend 27→20→24→33→34ish→...): structural focus-ring CSS scoping, Modal backdrop-blur gating, kanban drag-over flattening, Card/Modal/Button/FormField Operate branching, undo-on-move toasts with a proper per-entity request-sequence guard (not a status-string guard — see Engineering Decisions), keyboard shortcuts (`/`, `n`, `?`) rolled out across nearly all admin list pages via a shared `useHotkey` hook, a global `KeyboardShortcutsModal`.

## 6. Current Work
As of 2026-08-26: admin-dashboard Operate-mode critique/fix cycle is in a stable, low-severity state — last fix addressed a same-target race condition in the undo/revert logic (`ManageLeadsPage.tsx`, `ClientProjectsPage.tsx`) plus a P3 responsive collapse of the help button's label. No open uncommitted work; all fixes through this point are committed and pushed to `main`. `CLAUDE.md` and this `MEMORY.md` were just (re)created/updated in this session per the user's request — first real commit of both, not previously tracked in git. `CLAUDE.md` was subsequently moved to `.claude/CLAUDE.md` per the user's preferred layout; note that this path is not Claude Code's documented auto-load convention (that's `<repo>/CLAUDE.md`), so verify it's actually being read at the start of a future session rather than assuming.

## 7. Known Issues
- `/portal/*` routes are Operate-mode per `DESIGN.md` but don't currently share `AdminLayout`'s `OperateModeProvider`/`data-operate-mode` wrapper the way `/dashboard/*` does — flagged as a scope question, not yet actioned.
- `ManageServicesPage.tsx` has two independent "Add" actions (category vs. service) so the `n` keyboard shortcut is deliberately left unbound there (only `/` is wired) — a documented exception, not a bug, but the one page that breaks the otherwise-universal shortcut pattern with no in-page visual cue.
- No test files exist yet in `server/` despite `vitest` being wired via `npm test` — don't assume coverage exists for a given module.
- `AdminLayout.tsx`'s logout button has a `text-gray-600` on `bg-rose-500` hover state (low contrast) — a known, repeatedly-flagged-but-explicitly-out-of-scope finding across multiple design-critique passes; still unfixed as of 2026-08-26.

## 8. Important Constraints
- `client/dist/` is `.gitignore`d going forward but was already tracked in git history before the ignore rule existed — it will keep showing as modified after every client build; don't force-remove it from tracking without checking with the user.
- Never reintroduce auto-creation-on-read for any public/unauthenticated GET endpoint (see `getServiceBySlug` decision above) — this class of bug is specifically what created the SEO junk-page incident.
- Puppeteer's Chrome must be explicitly installed at build time on Render (see `.puppeteerrc.cjs` + `server/package.json`'s build script) — a bare `tsc` build alone will ship without Chrome present at runtime.

## 9. Important APIs / Integrations
- Gemini / Groq / OpenRouter — AI proposal-content generation, Gemini-first fallback chain (see Engineering Decisions).
- Google Search Console (via MCP tools, read-only) — used to verify sitemap/indexing status; cannot submit/verify ownership or fix DNS from this session, those require the user's own Google/registrar account access.
- GoDaddy SMTP via Nodemailer — transactional email (contact form, etc.).
- Cloudinary — media storage/hosting for uploaded content.

## 10. Future Work
- Continue `seo-audit` skill's remaining categories (schema markup depth, Core Web Vitals, image optimization, content/E-E-A-T) if the user wants to resume that track.
- Backlink acquisition — only preparable as content/drafts from this session; execution on external sites (e.g. Clutch.co) requires the user directly.
- Legal review of the Privacy Policy / Terms of Service pages — explicitly flagged as needed, not done.
- Consider extending `OperateModeProvider` to `/portal/*` routes to close the known-issue gap above.

## 11. Do Not Repeat
- Patching a design-system-drift finding at only the specific component a critique named, without checking whether the same defect exists in sibling/shared components — this exact mistake recurred across at least 3 consecutive critique rounds (Card → Button → FormField → raw hand-rolled elements) before the fix was made structural. Default to asking "does this same defect exist in any other primitive with similar responsibility?" before considering a design-drift fix complete.
- Using a status/value-equality check as a proxy for "is this still the latest request" in optimistic-UI revert logic — two different requests can share the same target value. Use a monotonic per-entity sequence/generation counter instead.

## 12. Last Updated
2026-08-26
