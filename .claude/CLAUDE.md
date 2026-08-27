# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Design tokens and visual rules live in `DESIGN.md`. Product context, users, and positioning live in `PRODUCT.md`. Current state, decision history, and known issues live in `MEMORY.md`. A chronological, append-only record of shipped features lives in `log.md` — after every feature or fix lands (verified and committed), add one entry to `log.md`; keep it a running log, not a curated summary (that's `MEMORY.md`'s job). This file holds only what's permanent and not already covered there: commands, the code map, and structural rules a session needs before making changes.

**Before starting any new task, skim `log.md` first.** It's the fastest way to check whether something similar was already built, already fixed, or already tried and rejected, without re-reading the source files or re-deriving context from scratch — cheaper in tokens and avoids redoing settled work. Cross-check against the actual code before relying on it for anything that affects current behavior (the log records what shipped, not necessarily what's still true if something changed since) — treat it as a lead to verify, not a fact to assume.

## Commands

Two-app monorepo (`client/`, `server/`); root `package.json` only has passthrough scripts:

```bash
npm run dev:client      # Vite dev server (client/)
npm run dev:server      # ts-node-dev with hot reload (server/)
npm run build:client    # tsc && vite build (client/)
npm run build:server    # installs Puppeteer's Chrome, then tsc (server/) - see Build below
npm run check:client    # tsc --noEmit (client/)
npm run test:server     # vitest run (server/)
```

Run these from inside `client/` or `server/` directly when iterating. Always run `npx tsc --noEmit -p .` and `npm run build` from `client/` before considering a frontend change done — there is no separate lint step.

## Code Map

- `client/src/pages/` — routed pages. `pages/admin/` and `pages/client/` are the two Operate-mode surfaces (see DESIGN.md); everything else at the top level is Persuade (marketing).
- `client/src/components/ui/` — shared primitives (Button, Card, Modal, FormField, StatusPill). Check here before hand-rolling a new button/input/card.
- `client/src/components/crm/` — composite components used by `pages/admin/`.
- `client/src/hooks/useHotkey.ts` — shared keyboard-shortcut hook, used across admin list pages for `/` (focus search) and `n` (primary create action), and by `AdminLayout.tsx` for the global `?` shortcuts modal.
- `client/src/App.tsx` — all routing. `/dashboard/*` nests under `<AdminLayout>`; `/portal/*` does not currently share a layout wrapper with it (see Known Issues in MEMORY.md).
- `client/middleware.ts` — Vercel Edge Middleware serving bot/crawler requests only; real visitors always get `next()` passthrough to the SPA.
- `server/src/app.ts` — single Express assembly point; every API route mounts under `/api/v1/*`, `seoRoutes` mounts at `/` (unprefixed, for `/sitemap.xml`/`/robots.txt`).
- `server/src/{routes,controllers,models}` — standard request path. `server/src/services/` holds cross-cutting logic (email, PDF generation, AI content generation) invoked from controllers.

## Structural Rules

**Operate-mode compliance is enforced by code, not convention.** `client/src/components/ui/OperateModeContext.tsx` exposes `useOperateMode()`; `AdminLayout.tsx` wraps its routed content in `<OperateModeProvider>` and stamps `data-operate-mode="true"` on its root DOM node. Shared primitives read this hook to switch styling, and some rules (the focus-ring color) are additionally scoped in `index.css` under the `[data-operate-mode]` attribute selector. When fixing a Persuade-style leak into `/dashboard`, extend this mechanism (add the hook to the offending shared primitive, or widen the CSS scope) rather than adding a one-off override at the call site — per-call-site fixes have repeatedly missed sibling components with the same defect.

**Auth is split, not unified.** `server/src/middleware/authMiddleware.ts` exports `authenticateAdmin` and `authenticateClient` as independent JWT-verification middlewares for the admin/team routes and the client-portal routes respectively. `rbacGuard.ts` layers role/permission checks on top of `authenticateAdmin` only.

**Puppeteer's Chrome must be present at build time, not assumed.** `server/.puppeteerrc.cjs` redirects Puppeteer's Chrome cache into the project directory, and `server/package.json`'s build script explicitly runs `npx puppeteer browsers install chrome` before `tsc`. A bare `tsc` build ships without Chrome at runtime on Render.

**Never auto-create a document on an unauthenticated read.** Public GET endpoints (e.g. `getServiceBySlug`) must 404 on no match, never create a placeholder record — this was the root cause of a real junk-page-in-search-results incident.

**AI content-generation provider order is Gemini → Groq → OpenRouter**, defined in `server/src/services/aiContentService.ts`. Don't reorder or swap providers without reading that file's fallback/timeout logic and `MEMORY.md`'s Engineering Decisions — each provider's handling was tuned against a specific real failure.

## Deployment

Frontend on Vercel (`www.buildyourthougths.in`), backend on Render (`build-4tdz.onrender.com`, free tier — cold starts can transiently misbehave). Root `vercel.json` and `client/vercel.json` both proxy `/sitemap.xml` and `/robots.txt` to the Render backend ahead of the SPA catch-all rewrite — keep both files in sync if either changes.
