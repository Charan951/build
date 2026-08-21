---
name: Build Your Thoughts
description: Enterprise app & web development agency — ship a complete MVP (web, admin, iOS, Android) in 5 days.
colors:
  signal-lime: "#CDFB47"
  circuit-black: "#0F1412"
  paper-white: "#FFFFFF"
  neutral-slate: "#737373"
  operate-canvas: "#F5F6F4"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(2.75rem, 2rem + 3.2vw, 5.25rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(2.25rem, 1.7rem + 2.2vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.02em"
  mono:
    fontFamily: "\"JetBrains Mono\", ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  operate-sm: "8px"
  operate-md: "12px"
  operate-lg: "16px"
  form: "18px"
  button: "20px"
  card: "32px"
  dialog: "36px"
  hero: "40px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.circuit-black}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.button}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.circuit-black}"
  button-lime:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.circuit-black}"
    rounded: "{rounded.button}"
    padding: "14px 28px"
  button-lime-hover:
    backgroundColor: "{colors.circuit-black}"
    textColor: "{colors.paper-white}"
  card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
    padding: "32px"
  badge-lime:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.circuit-black}"
    rounded: "{rounded.full}"
    padding: "4px 14px"
---

# Design System: Build Your Thoughts

**Scope: this project has two coherent, deliberately different visual systems.** The marketing site (home, about, services, projects, blog, contact — the public-facing agency site) runs in **Persuade mode**: expressive, dark-forward, the language described below. The admin/CRM dashboard and client portal (`/dashboard/*`, `/portal/*`) run in **Operate mode**: a calmer, denser, task-focused system that shares the same two core tokens (Signal Lime, Circuit Black) but applies them functionally rather than atmospherically. Both are documented here; assume **Persuade** unless a section is explicitly marked **Operate**.

## Overview

**Creative North Star: "The Build Signal"**

Build Your Thoughts reads as a dark, focused engineering console rather than a conventional marketing site. Deep near-black (#0F1412) is the resting state of every major surface — nav, hero, CTA banners — and Signal Lime (#CDFB47) exists to mean exactly one thing wherever it appears: *this is active, this is happening now*. It's the terminal cursor, the build-success indicator, the status light — never decoration for its own sake. The hero's live WebGL shader backdrop and the code-preview card ("Live Build Succeeded (14ms)") aren't incidental flourishes; they're the thesis made literal.

Against that dark, technical foundation sits a warm counterweight: Fraunces, a high-contrast display serif, carries every headline. The pairing — engineering-console color language with editorial serif type — is the system's core tension and its signature. This is a 5-day-MVP agency that wants to be read as both fast/technical and confident/considered, not generic SaaS-blue-gradient territory.

**Key Characteristics:**
- Near-black is the default surface; white is the content canvas; lime is a rare, meaningful signal — never a background wash.
- Fraunces serif for all display/headline type; Inter for body and UI; JetBrains Mono only for actual code/data.
- Soft, large-blur ambient shadows and glassmorphism (never hard-offset or neobrutalist).
- Generous pill/rounded-full shapes for interactive chrome (nav, badges, buttons) against softer large-radius rounding (32–40px) for content surfaces.

## Colors

Two-color core (near-black + signal lime) against a white canvas, with a single neutral for body copy. Deliberately restrained — this is not a multi-hue palette.

### Primary
- **Signal Lime** (#CDFB47): The system's only accent, used sparingly — primary CTA fills, active nav-link chip, active states, hero glow, stat numbers, underline accents. If lime is on screen, it marks the thing the visitor should notice or act on.

### Neutral
- **Circuit Black** (#0F1412): Default surface color for nav, hero, footer-weight CTA panels, and primary button fills. Also the default body-heading text color on white surfaces.
- **Paper White** (#FFFFFF): The content canvas — card backgrounds, page background, primary button text on dark.
- **Neutral Slate** (#737373): Body copy and secondary text on white surfaces (~4.7:1 contrast on white — treat this as the floor, not a starting point; anything lighter fails AA).
- **Operate Canvas** (#F5F6F4) — *Operate mode only*: the dashboard's page background, replacing Paper White as the resting canvas so white sidebar/content panels read as distinct surfaces on top of it. Not used anywhere in Persuade.

### Named Rules
**The Signal Rule.** Lime never appears as a passive background fill or large color block — only as a small, meaningful mark (text, icon, thin accent line, active-state fill) that says "this is live." A full-bleed lime panel would break the rule.

**The Two-Surface Rule.** Every section is either Circuit Black or Paper White at rest — no mid-tone gray section backgrounds. Contrast between sections *is* the rhythm.

## Typography

**Display Font:** Fraunces (serif) — every H1–H3 and hero headline, always at a black/extrabold weight (800–900).
**Body Font:** Inter (sans-serif) — paragraph copy, nav, buttons, labels, UI chrome.
**Mono Font:** JetBrains Mono — reserved for literal code/data (the hero's live code-preview card, tech-stack tags), never used as a "technical" costume elsewhere.

**Character:** A confident editorial serif carrying all display weight against a quiet, highly legible grotesque for everything functional — the pairing signals "considered design" without softening the console/tech register the color system sets up.

### Hierarchy
- **Display** (900, `clamp(2.75rem, 2rem + 3.2vw, 5.25rem)`, 0.98 line-height): Hero headline only, one per page.
- **Headline** (800, `clamp(2.25rem, 1.7rem + 2.2vw, 3.75rem)`, 1.04): Section H2s.
- **Title** (800, `clamp(1.375rem, 1.2rem + 0.7vw, 1.875rem)`, 1.15): Card/component titles (H3).
- **Body** (400, 1rem, 1.65): Paragraph copy; keep to a readable measure, don't stretch full-width on wide screens.
- **Label** (700, 0.75rem, uppercase, 0.02em tracking): Badges, eyebrow tags, stat labels.

### Named Rules
**The Serif-Only-Display Rule.** Fraunces never appears below Title size, and Inter never carries a headline. The split is absolute — it's what makes the pairing read as a deliberate choice rather than inconsistency.

## Layout

Marketing pages run on a `max-w-7xl` centered container (narrower `max-w-4xl`/`max-w-5xl` for text-heavy sections like FAQ and the hero's centered copy block). Section rhythm is generous — `space-y-20` to `space-y-28` between major sections at the page level, with sections themselves owning their internal padding (`px-6`, generous vertical padding on dark CTA/carousel panels).

Grids are content-driven and responsive: 2-column mobile → 3–6 column desktop for card grids (industries, "why choose us"), collapsing to a single dedicated mobile pattern (sticky-stacked cards, auto-advancing carousel) rather than just shrinking the desktop grid. The hero is a full-viewport (`min-h-screen`) centered composition, not a fixed-height banner.

## Elevation & Depth

Hybrid: soft ambient shadows for white-surface cards, glassmorphism for dark/translucent surfaces (nav, hero overlays). No hard-offset or flat-block shadows anywhere — depth is always a diffuse, large-blur halo, never a crisp offset.

### Shadow Vocabulary
- **Soft** (`0 20px 50px rgba(0,0,0,0.06)`): Resting-state card elevation.
- **Hover** (`0 35px 80px rgba(0,0,0,0.12)`): Card/button hover escalation — paired with a `-8px` translateY lift.
- **Glass** (`0 15px 40px rgba(0,0,0,0.05)`): Glassmorphic surfaces (nav pill, glass panels) — a tighter, quieter shadow since the surface itself already carries blur.

### Named Rules
**The Lift-On-Hover Rule.** Interactive cards are flat-ish at rest and gain both a translateY lift and a shadow escalation on hover — depth is a response to interaction, not a static decoration.

## Shapes

Two registers, deliberately: interactive chrome (nav, buttons, badges, indicator dots) is full pill (`rounded-full`/20px button radius) — tactile, pressable. Content containers (cards, dialogs, the hero code panel) use large, soft radii (32–40px) that feel architectural rather than "rounded-corner default." No sharp corners anywhere in the marketing surface; no neobrutalist hard edges.

**Operate mode** uses a visibly tighter scale — 8/12/16px (`operate-sm`/`operate-md`/`operate-lg`) on sidebar items, table cells, inputs, buttons, and status pills. This isn't an oversight: a 32px-radius data table would read as a landing-page component wandering into a tool, breaking the "this is a workspace" signal Operate mode depends on. Never apply Persuade's 32–40px card radii inside `/dashboard` or `/portal`.

## Components

Buttons, cards, and nav all commit to the same voice: **tactile and confident.** Generous padding, obvious hover states (color inversion, lift, or lime-swap), spring-based micro-motion (Framer `whileHover`/`whileTap`) rather than static color-only feedback.

### Buttons
- **Shape:** Full pill via 20px radius (`rounded-button`), `px-7 py-3.5` default sizing.
- **Primary:** Circuit Black fill, white text → inverts to Signal Lime fill, black text on hover.
- **Lime (CTA):** Signal Lime fill, black text, bold weight → inverts to Circuit Black fill, white text on hover. This is the "start a project" voice — reserve it for the single primary action per view.
- **Secondary:** White fill (or translucent white on dark surfaces) with a soft border → lime fill on hover.
- **Ghost:** Transparent, text-only, lime on hover with underline.
- **Hover / Focus:** `whileHover={{ scale: 1.03 }}` / `whileTap={{ scale: 0.97 }}` spring physics on every variant; keyboard focus gets a visible lime ring (`focus-visible:ring-2 ring-primary`).

### Cards
- **Corner Style:** 32px (`rounded-card`).
- **Background:** Glassmorphic white (`bg-white/80` + 20px backdrop-blur) by default; solid `bg-white` or `bg-dark` when a consumer opts out via its own `bg-*` class.
- **Shadow Strategy:** Soft at rest → Hover escalation on interaction (see Elevation).
- **Interactive cards:** When a card carries an `onClick`, it's a real keyboard target (`role="button"`, focus ring, Enter/Space activation) — never a mouse-only click zone.

### Navigation
Floating pill nav, not a fixed full-width bar at rest on desktop scroll: starts as a wide dark bar, morphs into a condensed glass pill (`glass-nav`: translucent dark + 16px backdrop-blur) once scrolled. Active link gets a spring-animated (`layoutId`) lime-tinted pill indicator that slides between links rather than just toggling color. Mobile collapses to a hamburger-triggered dark drawer sliding down from the header.

### Operate Mode Components (dashboard / client portal)
Same two core tokens (Signal Lime, Circuit Black), applied with restraint — motion is fast and functional (`FadeIn`, not `Reveal`/`Stagger`), never scroll-hijacking.

- **Sidebar Nav:** White panel (`bg-white`) floating on the Operate Canvas, `border-r border-black/10`. Active item is a solid Signal Lime fill with dark text (`bg-primary text-dark`) — the *only* place lime is used as a fill this large, because it's marking "your current location," not decoration. Inactive items are transparent with a subtle `hover:bg-black/5`.
- **Data Table:** Flat, borderless-except-rules — header row gets `border-b border-dark/10` with uppercase `slateText` labels; body rows have no individual borders, relying on row hover (`hover:bg-dark/5`) for scanability over decoration.
- **Form Input:** `operate-md` radius (12–16px), `bg-background` fill, thin `border-dark/10`, focus state is a border-color shift to Circuit Black (`focus:border-dark`) — no glow, no ring, deliberately quieter than the marketing button's lime focus ring.
- **Status Pill:** Small `operate-md`-radius chip with a semantic color pair (emerald for success/active, rose for error/inactive, gray for neutral) — the one place this system uses color beyond the two-tone core, because status communication overrides the "lime is the only accent" rule inside a workspace.

### Signature Component: Lightfall Hero Backdrop
A full-bleed WebGL shader (OGL-based, `Lightfall`) rendering slow lime/dark light-streak trails behind the hero copy, with subtle mouse-reactive glow. This is the strongest expression of "The Build Signal" — literal light/signal motion on the system's two core colors. Capped device-pixel-ratio and gated by `IntersectionObserver`/tab-visibility so it only renders while actually on screen.

## Do's and Don'ts

### Do:
- **Do** treat Signal Lime as a rare mark of "this is active" — CTA fills, active states, live indicators — never a large background field (The Signal Rule).
- **Do** keep every section's resting background either Circuit Black or Paper White — no mid-tone gray sections.
- **Do** pair large soft-blur shadows with a hover lift on any interactive card or button; nothing gets a hard-offset shadow.
- **Do** give every clickable card/row a real keyboard path (`role`, `tabIndex`, visible focus ring) — this system has a `Card` primitive that does this automatically when `onClick` is passed; use it rather than a bare `onClick` div.
- **Do** hide duplicate/looping marquee content from assistive tech (`aria-hidden` on the repeated copy) — this system runs several infinite-scroll marquees.

### Don't:
- **Don't** carry Persuade-mode expression (32–40px card radii, glassmorphism, scroll-hijacking `Reveal`/`Stagger` entrances, the full-bleed hero treatment) into `/dashboard` or `/portal`. Operate mode is a deliberately different, calmer system, not an unfinished version of the marketing site.
- **Don't** introduce a second "accent" hex outside `#CDFB47` (Signal Lime). One isolated instance of `#65A30D` currently exists in the "Why Choose Us" eyebrow badge — treat it as a bug to consolidate to the `primary` token, not a precedent for a secondary accent.
- **Don't** use `text-gray-400`/`text-slate-400` (or lighter) for body text on a white surface — both fall below the 4.5:1 AA contrast floor. `gray-500`/`slate-500` is the lightest acceptable gray on white.
- **Don't** run a continuous JS-driven animation (marquees, shaders) without gating it behind `IntersectionObserver` — several components in this system pause off-screen for exactly this reason; new ones should too.
- **Don't** use Fraunces below Title size, or Inter for a headline — the serif/sans split is absolute, not a suggestion.
