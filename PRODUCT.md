# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Prospective clients (marketing site visitors):** startup founders and business owners who need a complete, working application fast — evaluating whether to hire Build Your Thoughts for their next project. Their job on the marketing site is to understand what's delivered, see evidence it's real, and start a project.
- **BYT's internal team (admin/CRM dashboard, `/dashboard`):** staff managing the agency's own sales pipeline and delivery — leads, proposals, quotations, client projects, invoices, meetings, and service/blog content via the headless CMS.
- **BYT's clients (client portal, `/portal`):** clients with an active engagement tracking their own project's status and deliverables.

## Product Purpose

Build Your Thoughts is an app & web development agency that delivers a complete, end-to-end application — website, admin panel, and Android & iOS apps — within 5 days. The 5-day delivery is a **literal, standard commitment**, not illustrative marketing framing: the promise is "A to Z" completeness (full web + admin + mobile stack) delivered on that timeline, not a partial or best-case scope.

The product also includes a self-built headless CMS/CRM (Node/Express + MongoDB) that runs the agency's own operations: managing leads, proposals, client projects, invoices, meetings, and publishing services/blog content — so the same team that promises fast delivery also runs its business on infrastructure it built itself.

## Positioning

The differentiator is delivery speed combined with completeness: most agencies scope an MVP down to fit a timeline; BYT's claim is the full stack (web + admin + native mobile) in 5 days, without cutting the admin panel or mobile apps to "phase 2." The agency also runs on its own custom-built CRM/CMS rather than a third-party tool — a credibility signal that the team ships what it sells.

## Operating Context

- **Sales pipeline:** lead capture → proposal → quotation → client conversion, managed through the admin CRM.
- **Delivery tracking:** client projects, project detail pages, and status visible to both the internal team (admin) and the client (portal).
- **Business operations:** invoicing, meeting scheduling, and reporting/analytics, all inside the same dashboard.
- **Content operations:** services, blog posts, platform solutions, and pricing plans are managed through the headless CMS rather than hardcoded, so the marketing site's content can change without a code deploy.

## Capabilities and Constraints

- Existing codebase (not greenfield): React 19 + TypeScript + Vite client, Node/Express + MongoDB Atlas server, Framer Motion + GSAP + Three.js/OGL for motion and WebGL, Tailwind for styling.
- Two structurally distinct surfaces sharing one codebase: the public marketing site (Persuade) and the admin/CRM + client portal (Operate) — see DESIGN.md for how the visual system splits between them.
- Lenis-driven smooth scroll on marketing routes only; explicitly disabled on admin/portal routes because it conflicts with the dashboard's sticky/fixed panel layout.

## Evidence on Hand

- The marketing site currently shows real-shaped but **not-yet-final** proof content: testimonials (e.g. Rohit Mehta, Sanjay Patel, Priya Sharma), stats (150+ projects delivered, 75+ enterprise clients, 12+ countries, 99% client satisfaction / 169 happy clients, 178 projects, 4.6 avg rating in `ReviewsSection`), and example case studies in `FeaturedProjectsSection`'s fallback data. Treat these as **directionally real but unverified** — safe to keep displaying as-is, but future work must not invent additional testimonials, client names, or stats beyond what's already shown, and should flag to the user before treating any of these numbers as a hard claim to defend or extend.
- No case-study photography/screenshots are currently rendered on project cards (`heroImage` field exists in data but isn't used in the UI) — note this as a known gap, not an oversight to silently fix.

## Product Principles

1. **The 5-day claim is load-bearing and literal.** Every surface that states or implies delivery speed should treat "5 days, full stack" as a real commitment, not softened marketing language.
2. **Completeness over scoping-down.** The "A to Z" positioning (web + admin + mobile, not a subset) is the actual differentiator — don't let future feature copy imply a partial/MVP-only delivery.
3. **The agency runs on its own product.** The admin CRM isn't a generic backend — it's proof the team ships what it sells. Treat its quality bar (Operate mode) as seriously as the marketing site's.
4. **Don't let unverified proof content calcify into fact.** Testimonials/stats are real-but-not-final; don't build new claims on top of them without checking with the user first.

## Accessibility & Inclusion

No confirmed compliance mandate. Apply WCAG AA as general best practice (contrast, keyboard access, focus visibility, touch targets) rather than treating it as a contractual requirement — consistent with the fixes already made this session.
