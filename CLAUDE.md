# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a two-app monorepo (`client/`, `server/`) with passthrough scripts at the root:

```bash
npm run dev:client      # Vite dev server (client/)
npm run dev:server      # ts-node-dev with hot reload (server/)
npm run build:client    # tsc && vite build (client/)
npm run build:server    # installs Puppeteer's Chrome, then tsc (server/)
npm run check:client    # tsc --noEmit (client/) - typecheck without emitting
npm run test:server     # vitest run (server/)
```

Run these from `server/` or `client/` directly when iterating (`cd client && npm run check` is faster than round-tripping through the root passthrough). There is no root-level lint script; each app manages its own TypeScript strictness via `tsc`.

**Testing**: `server/package.json` wires `vitest`, but no test files exist yet in the repo — `npm run test:server` will currently report zero tests. Don't assume test coverage exists for a given module; check before relying on it.

**Client-only single-file typecheck**: `npx tsc --noEmit -p .` from `client/` after any edit — this is the fastest way to catch a mistake before a full build. Always run this (and `npm run build`) before considering a client-side change done.

## Architecture

### Two structurally distinct frontend surfaces, one design system

`DESIGN.md` at the repo root documents two deliberately different visual modes sharing two core tokens (Signal Lime `#CDFB47`, Circuit Black `#0F1412`):

- **Persuade** — the public marketing site (`/`, `/about`, `/services`, `/projects`, `/blogs`, `/contact`). Expressive, dark-forward, glassmorphism, large radii (`rounded-card` 32px, `rounded-dialog` 36px), y-lift hover.
- **Operate** — the admin dashboard (`/dashboard/*`) and client portal (`/portal/*`). Calmer, denser, task-focused: tight radius scale (`rounded-operateSm` 8px / `operateMd` 12px / `operateLg` 16px), no glass/blur, quiet `focus:border-dark` inputs (never the marketing lime focus glow), semantic status-pill colors as the one color exception.

`PRODUCT.md` documents the product context (users, positioning, constraints) behind these decisions — read it before making product-facing copy or scope decisions.

**Enforcing Operate mode structurally, not per-component**: `client/src/components/ui/OperateModeContext.tsx` provides a `useOperateMode()` hook. `AdminLayout.tsx` wraps its routed content in `<OperateModeProvider>` and stamps `data-operate-mode="true"` on its root DOM node. Shared primitives (`Card.tsx`, `Modal.tsx`, `FormField.tsx`'s Input/Textarea/Select, `Button.tsx`) read `useOperateMode()` to branch their styling. Some concerns (like the lime focus-ring glow) are additionally scoped in `index.css` under the `[data-operate-mode]` attribute selector rather than as a per-component prop, because per-component branching alone has repeatedly missed instances (hand-rolled elements outside the shared primitives) across several rounds of design review — prefer extending the CSS-scoped/context-based approach over adding another one-off `isOperate` check when fixing a new instance of Persuade-styling leaking into `/dashboard`.

Use `node .claude/skills/impeccable/scripts/detect.mjs --json <paths>` (or `/impeccable audit`/`/impeccable critique`) to check for this drift after touching admin UI — it's a recurring category of regression in this codebase, not a one-time cleanup.

### Client structure (`client/src/`)

- `pages/` — top-level routed pages. `pages/admin/` (the Operate-mode CRM/dashboard) and `pages/client/` (the client portal) are the two Operate surfaces; everything else at `pages/` top level is Persuade (marketing).
- `components/ui/` — shared primitives (Button, Card, Modal, FormField, StatusPill, etc.) — check here before hand-rolling a new button/input/card.
- `components/crm/` — CRM-specific composite components (modals, forms) used by `pages/admin/`.
- `components/seo/` — `SEOHead` (react-helmet-async wrapper) used on every page for title/description/OG/schema.
- `components/3d/`, `components/backgrounds/`, `components/originkit/` — WebGL/Three.js and motion-heavy marketing-site visuals (Persuade mode only).
- `hooks/useHotkey.ts` — shared keyboard-shortcut hook (ignores keypresses while focus is in an editable element, ref-based internally so callers don't need `useCallback`). Used across most admin list pages for `/` (focus search) and `n` (open primary create action); `AdminLayout.tsx` uses it for the global `?` shortcuts-help modal.
- `App.tsx` — all routing lives here. The catch-all `<Route path="*">` must stay last (React Router ranks it below exact/param routes regardless of position, but keep it last for clarity). `/dashboard/*` routes nest under `<AdminLayout>`; `/portal/*` routes do not currently share a layout wrapper with `/dashboard` despite both being Operate-mode per `DESIGN.md` — this is a known gap, not an intentional decision.
- `middleware.ts` (Vercel Edge Middleware) — intercepts requests from social-link-preview/SEO bots only (matched via user-agent regex) and serves a minimal server-rendered HTML document with correct `<title>`/OG/JSON-LD for dynamic routes (services/projects/blogs), since this is otherwise a client-only SPA with no real SSR. Real visitors always get `next()` passthrough to the normal React app. Returns a real 404 (not a silent 200) for unresolved dynamic slugs.
- Canvas/freeform-editor pattern: `QuotationEditorPage.tsx` and `ProposalTemplateEditorPage.tsx` share a `QElement`/`QPage`-shaped model (absolutely-positioned text/table/image elements on an A4-sized page, drag/resize via pointer events, undo/redo history stack). If extending one editor's element model (e.g. adding a new `QElement` field like `bg` or `borderLeftColor`), keep both editors' types and PDF-rendering code in sync — they're intentionally parallel, not shared via a common component yet.

### Server structure (`server/src/`)

- `app.ts` — single Express app assembly point: security middleware (helmet with CSP disabled — required for the client's R3F Canvas/WebSockets/Cloudinary media — cors, mongo-sanitize), then every route mounted under `/api/v1/*`, plus `seoRoutes` mounted at `/` (serves `/sitemap.xml`, `/robots.txt` unprefixed).
- `routes/` → `controllers/` → `models/` (Mongoose) is the standard request path; `services/` holds cross-cutting logic invoked from controllers (email, PDF generation, AI content generation, SEO metadata).
- `middleware/authMiddleware.ts` exports `authenticateAdmin` and `authenticateClient` as two separate JWT-verification middlewares — admin/team routes and the client-portal routes are authenticated independently, not through one unified "user" concept. `rbacGuard.ts` layers role/permission checks on top for admin routes.
- `services/aiContentService.ts` — the AI proposal-content generation provider chain, in priority order: Gemini → Groq → OpenRouter, with automatic fallthrough on failure/rate-limit and a retry-once-on-503 wrapper for Gemini specifically (`callGemini`/`callGeminiOnce`). If Gemini's model, Groq's model name, or token budgets need changing again, check this file's fallback ordering and per-provider timeout logic together — they were tuned in response to specific real failures (retired Groq model, wrong token budget, Gemini transient 503s), not arbitrary defaults.
- `services/pdfService.ts` — Puppeteer-based PDF rendering for quotations/proposals. `server/.puppeteerrc.cjs` redirects Puppeteer's Chrome cache into the project directory so it survives Render's build→runtime handoff; `npm run build` explicitly runs `npx puppeteer browsers install chrome` before `tsc` for the same reason — don't remove either without understanding why (a bare `tsc` build alone previously shipped without Chrome present at runtime).
- `services/emailSystem.ts` — Nodemailer wrapper; SMTP `secure` is derived from `Number(process.env.SMTP_PORT) === 465`, not a separate boolean config value.
- `models/ProposalTemplate.ts`'s `renderMode: 'document' | 'canvas'` field controls which renderer (`proposalController.ts`'s `getTemplatePdf`/`previewPdf`) is used for a given template — branch on `renderMode`, not on `pages.length` or other proxies, when adding new PDF-generation logic.
- `controllers/serviceController.ts`'s `getServiceBySlug` returns a real 404 for an unmatched slug — it previously auto-created a permanent fake `Service` document on any unauthenticated GET to an unmatched slug (the root cause of a junk `/services/eg`-style page appearing in search results). Never reintroduce auto-creation-on-read for any public GET endpoint.

### Deployment topology

- Frontend: Vercel (`www.buildyourthougths.in` — note the domain's actual spelling is missing a letter vs. "buildyourthoughts.in"). Root `vercel.json` and `client/vercel.json` both proxy `/sitemap.xml` and `/robots.txt` to the Render backend before the SPA catch-all rewrite — keep these two files in sync if either changes.
- Backend: Render (`build-4tdz.onrender.com`), free tier — cold starts can transiently misbehave (e.g. `robots.txt` briefly serving `Disallow: /` was traced to a cold-start blip, not a code bug).
- `client/dist/` is listed in `.gitignore` (`**/dist/`) but is already tracked in git history from before the ignore rule was added — `git status` will show it as modified after every client build. This is a pre-existing repo state, not something to "fix" by force-removing it without checking with the user first.

## Design/product workflow tools already set up in this repo

- `DESIGN.md` / `PRODUCT.md` at the root, plus `.impeccable/critique/` (design-review snapshot history) — this project uses the `impeccable` skill's `critique`/`audit`/`polish` commands as its established design-QA workflow. Prefer these over ad-hoc visual review when asked to evaluate or improve UI.
