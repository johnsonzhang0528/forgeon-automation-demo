# DESIGN.md v1 — Precision Datum System (SUPERSEDED)

**Status: Archived historical record. Not live guidance.**

This is the full, unedited text of `DESIGN.md` as it existed before Phase 4
(FORGEON Direction B research + Design Contract v2). It documents the
**Precision Datum System** — a copper-accent, coordinate-system-grammar
visual language with six "Brand Primitive" components
(`src/components/brand/*.astro`) that was fully implemented and, per the
most recent commit on `main` at the time (`5c7b99c`, "UI/UX Extreme Polish —
Hero/Header/Product Plate/Ending — Human Final Accepted"), had been reviewed
and accepted by a human as finished production work.

## Why this is archived, not deleted

Phase 3 (Refero Design Research) and Phase 3B (Visual Reference
Verification) independently produced **Direction B — Precision Instrument
Editorial**, informed by real-screenshot evidence from Leica Camera, ZEISS
Microscopy, Teenage Engineering, and Terminal Industries. Neither research
sprint was run with awareness of the Precision Datum System — both started
as if from a blank slate. When Phase 4 surfaced this as a
`CONTEXT_CONFLICT`, the Human/ChatGPT Design Contract Gate ruled:

> **Precision Datum System as a global visual grammar is SUPERSEDED.**
> Direction B — Precision Instrument Editorial is now the only Global Art
> Direction.

See `DESIGN.md` §0 for the current, resolved status. The six Brand
Primitives listed below (`DatumOrigin`, `ToleranceBand`, `VisionLockFrame`,
`AssemblySpine`, `ProcessStamp`, `CutawayWindow`) are **not** carried
forward into Phase 5 mockups by default. If a future need for a technical
overlay (detection box, measurement line, datum, alignment, coordinate,
pass/fail) arises, it must be redesigned from real technical behavior under
`DESIGN.md` Rule 07 — reusing an existing component file because it already
exists is explicitly not sufficient justification.

This file is kept as historical record only, so future readers can
understand what shipped before Direction B and why it changed — not as a
source of active design instruction. Do not read the sections below as
current guidance.

---

## Adaptation Note

This project's Impeccable workflow was run without a live browser session or
image-generation subagents (non-interactive background session, no display).
`new-work.md`'s decision framework (color strategy, face calibration, AI-look
avoidance) was applied by hand rather than through `concept-seed.mjs` /
`serve-question.mjs` / the finish-reviewer subagent chain. See
`docs/SKILL_USAGE_LOG.md` §3 for the full explanation of what ran versus what
was adapted, and why.

## CC-01 Addendum (2026-08-05): Precision Datum System

**The Color Strategy and Typography sections below describe the original
build's world and are kept as historical record — the site's live design
world as of CC-01 is the Precision Datum System, and the values below no
longer match `src/styles/tokens.css`.** This addendum states what
actually shipped; do not treat the sections that follow as current.

Full audit rationale for the redesign is in
`docs/redesign/forgeon_full_audit_and_redesign.md` (§17-19) and
`docs/redesign/forgeon_claude_code_redesign_tasks.md`; token-by-token
implementation detail is in `docs/DESIGN_SYSTEM.md`; every specific
correction made to the redesign spec's literal proposed values (and why)
is in `docs/DATUM_DECISION_LOG.md`'s CC-01 entry; WCAG math for every
color pairing is in `docs/CONTRAST_AUDIT.md`.

**THESIS (unchanged, made more literal):** precision is a process you can
watch, not a claim you take on faith. The Precision Datum System commits
this idea to a specific visual grammar rather than leaving it as a
description: datum origin marks (a horizontal/vertical axis pair with a
copper intersection point — not a crosshair), tolerance bands (parallel
boundary lines with an acceptable-range zone, not a progress bar), vision
lock frames (four-corner registration marks, not a scanning reticle),
assembly spines (a main axis with connectable module nodes), process
stamps (engineering-workflow status markers, deliberately not shaped like
a certification seal), and cutaway windows (angled clip-path reveals of
product/system media). Six components, `src/components/brand/`, each with
its own accessibility semantics and reduced-motion behavior documented in
its own file header.

**Color: five roles, not one accent.** Paper (55% target, primary
background), Ink (25%, primary text/dark sections), Steel (12%, technical
lines/secondary text — now three role-specific steps,
`--color-steel-700`/`600`/`500`, after WCAG verification found the
redesign spec's single steel value failed as light-background text/border),
Copper (6%, restricted to Datum Origin/primary CTA/active states — now
including `--color-copper-700` for the paper-100/higher-margin case), plus
2% functional colors (signal-green, error, focus). Copper is deliberately
NOT used for all headings, all icons, all card borders, large backgrounds,
or decorative gradients — the redesign task book's own explicit
constraint, carried forward from the original build's "one saturated
accent" principle but now role-scoped rather than universal.

**Typography: real self-hosted webfonts, not the system-stack fallback
this file previously documented.** The original Typography section below
(and the "2026-08 revision" addendum inside it) accurately describes why
CC-00-era passes fell back to system fonts — no verified network access to
fetch real font binaries. CC-01 re-verified npm registry access worked and
installed Noto Sans TC / Space Grotesk / IBM Plex Mono via `@fontsource/*`
(all SIL OFL 1.1), self-hosted as WOFF2 with `font-display: swap`, only
the weights actually used. Chinese headings/body force Noto Sans TC ahead
of the Latin-first `--font-display` stack via a `:lang(zh)` CSS override,
so Traditional Chinese never shapes against a Latin-only Space Grotesk
first and never inherits its negative Latin display tracking. Full detail
in `docs/ASSET_LICENSES.md` and `docs/DESIGN_SYSTEM.md`.

**Explicit avoidances carried forward and reinforced this stage:** no
purple/blue AI gradients, no hexagon/circuit-board backgrounds, no glowing
lines as primary visual language, no uniform large-radius cards (radius
caps at 12px, same as before), no reducing "industrial feel" to plain
black+grid. New avoidances specific to the six brand components: no
persistent/looping scan animation on VisionLockFrame (lock-on plays once),
no certification-seal silhouette on ProcessStamp (rectangular chip with a
datum-notch, not a circular/shield seal), no SVG-mask-only implementation
on CutawayWindow (uses `clip-path: polygon()`, verified cross-browser safe
per the file's own header comment, with an `@supports` fallback to a plain
rounded-rect crop).

**What this stage did NOT touch:** homepage information architecture,
Hero, any page-level content — those are CC-02/CC-03 territory per the
task book, and CC-01's own dispatch brief names them as explicit
hard-stops.

## Mode

**Persuade.** This is a B2B marketing/corporate site (spec §2.2: explicitly
NOT a Product Dashboard / SaaS Application). The visitor decides and acts;
design is doing sales work, not task-completion work.

## THESIS

The site owns one idea: **precision is a process you can watch, not a claim
you take on faith.** It refuses the two category defaults — glossy "Industry
4.0" tech-startup gradients, and dated, cluttered Taiwanese B2B-manufacturer
template sites (dense top nav, stock photo hero, everything centered). This
build instead treats the page itself like an engineering drawing: ordered,
gridded, annotated, restrained.

## Color Strategy

**Restrained** (neutrals plus one accent) — the correct choice per
`new-work.md`'s own framework for a B2B technical-buyer surface where trust
and scanability outrank spectacle, while still allowing the accent to carry
real weight at CTA moments.

- **Ink / primary text & structure:** deep graphite-navy `#12181f` — not
  pure black (spec explicitly bans pure-black/pure-white harshness).
- **Surface (light):** warm-white `#f7f5f1` for page background — avoids the
  cold blue-white "SaaS dashboard" default while staying legible and printable.
- **Surface (elevated/cards):** `#ffffff` with a 1px hairline border in
  `#e2e0da`, never a floating shadow-heavy card — shadows are used sparingly
  and only at true elevation (nav on scroll, modals).
- **Metallic gray (secondary structure, rules, muted text):** `#5b6470`.
- **Accent — CTA / interactive color:** copper-bronze `#c1622b`. This is the
  ONE saturated color in the system, deliberately chosen over the more
  expected "electric blue" or "safety orange" B2B defaults, and over any
  purple/violet (explicitly banned as an AI-gradient tell). Used only for
  primary CTAs, active states, key data points, and link hover — never as a
  background wash.
- **Dark mode / inverted sections (footer, stat bands):** `#12181f`
  background, `#f7f5f1` text, copper accent unchanged for contrast
  consistency.

No gradients are used anywhere except a single, very restrained radial
falloff behind the homepage hero SVG (a machined-metal vignette, not a
color-transition gradient).

## Typography

**2026-08 revision (spec P1.2, option B — see `docs/REMEDIATION_PLAN.md`):**
the original build declared Space Grotesk / IBM Plex Sans / JetBrains Mono
by name in `tokens.css` but never actually loaded any font file, CDN link,
or Fontsource package — every visitor's browser was silently falling
through to whatever the next name in the stack resolved to. That is a real
"documentation says X, code does Y" gap, not a cosmetic one. This sandbox
has no network access to fetch and verify real font binaries, so rather
than leave the mismatch in place, the token declarations were replaced with
deliberately-chosen system font stacks that keep the calibration intent
below (not Inter-default, some engineering-grade personality) without
claiming a webfont that isn't actually shipped. The calibration reasoning
this section originally documented is preserved below as the *intent*
that the current system-stack tokens now honestly deliver on.

Calibration check applied: this subject (industrial/engineering) has its own
default-cluster risk — generic "tech mono + Inter" — which was avoided in
favor of faces with more editorial presence while remaining a legitimate fit
for technical content (Operate/Read register inside a Persuade shell for the
spec tables).

- **Display / headings:** system sans-serif stack led by `-apple-system,
  "Segoe UI", "Century Gothic", "Avenir Next"` — geometric-leaning options
  that read as engineered rather than generic-corporate, without the
  Inter-default trap. See `--font-display` in `src/styles/tokens.css`.
- **Body & UI text:** system sans-serif stack led by `-apple-system,
  "Segoe UI", "Helvetica Neue", Roboto` — sets long bilingual paragraphs
  cleanly across platforms. See `--font-body`.
- **Chinese body & headings:** system CJK stack (`"PingFang TC", "Noto Sans
  TC", "Microsoft JhengHei"`) paired against the Latin stacks above — no
  webfont CJK subset is shipped (file size), but weight/size scale is tuned
  to visually match the Latin type rhythm.
- **Monospace (spec values, model codes):** system monospace stack led by
  `ui-monospace, "SF Mono", "SFMono-Regular", "Cascadia Code"` at small
  sizes for spec tables and model numbers (AXM-400, VISION-X2) — gives
  technical data a "measured" feel distinct from prose. See `--font-mono`.
- **Scale:** modular scale ~1.25, base 16px/1rem. Headings never exceed
  line-length-appropriate widths (`max-width: 62ch` on body copy blocks).

## Layout & Grid

- 12-column fluid grid, `max-width: 1280px` content container, `1440px` for
  full-bleed section backgrounds.
- Section rhythm: generous vertical spacing (`clamp(4rem, 8vw, 7rem)`
  between major sections) — the "engineering drawing" feel comes from
  whitespace discipline, not decoration.
- Hero is NOT centered-text-over-photo (category default). It uses an
  asymmetric split: headline + CTA left-aligned in a fixed text-safe column,
  original SVG technical illustration right, on a subtle grid/blueprint
  background pattern (CSS, not image).
- Cards use a consistent but non-rigid rhythm: solution/product/industry
  cards share a hairline-border, no-shadow-until-hover system — explicitly
  avoiding "cards inside cards" and glassmorphism (both banned in spec §13.2).
- Spec tables use a horizontal-rule row system (engineering datasheet
  convention), not zebra-striped SaaS tables.

## Motion

Minimal and purposeful only: fade/slide-up on scroll-into-view for section
headers (CSS `@starting-style`/IntersectionObserver-driven class toggle,
~200ms), underline-draw on nav/link hover, accordion expand/collapse.
Everything respects `prefers-reduced-motion: reduce` (motion removed
entirely, not just shortened). No parallax, no autoplay, no decorative
looping animation.

## Iconography & Imagery

All iconography is original inline SVG (stroke-based, 1.5px stroke,
consistent corner radius) — no icon font, no third-party icon library. All
photographic/CGI imagery in this build is either original SVG illustration
or a clearly labeled concept/placeholder panel (see
`docs/HIGGSFIELD_ASSET_PLAN.md` — paid photorealistic generation was planned
but not executed this session).

## Explicit Avoidances (per spec §13.2 and calibration check)

Confirmed NOT used anywhere in this build: Inter/system-default as the only
face; purple-blue AI gradients; three-card generic feature grids as the
default pattern (cards vary count intentionally — solutions ships 6, not a
forced 3); cards-inside-cards; glassmorphism; purposeless glow effects;
all-centered layouts; excessive border-radius (`--radius` tokens cap at 12px
on cards, 8px on inputs/buttons — no pill-shaped buttons, no bubble UI);
generic SaaS template look; floating decorative micro-icons; motion used to
substitute for actual content; low-contrast gray-on-color text.

## Spacing, Radius, Shadow, Button, Form, Card tokens

Full token values are implemented in `src/styles/tokens.css` and mirrored in
`docs/DESIGN_SYSTEM.md` for the portfolio deliverable (colors, spacing
scale, radius scale, shadow levels, button variants, form field states, card
anatomy, responsive breakpoints).

## FINISH

Unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, and DESIGN.md. Finish review for this project was
conducted as a manual Impeccable Critique/Audit/Polish pass (Phase 6 and
Phase 9 in `docs/PROJECT_BRIEF.md`'s execution order) rather than the
subagent `impeccable-finish-reviewer` chain, because this session has no
browser/screenshot capability. Findings and resolutions are logged in
`docs/QA_CHECKLIST.md`.

**2026-08 real-browser finish review addendum**: a follow-up remediation
pass ran Impeccable with an actual Playwright/Chromium browser for the
first time (see `docs/IMPECCABLE_REVIEW_LOG.md`). It confirmed the design
direction above still holds under real rendering, but surfaced three
rendering-level defects static code review could not have caught: the
mobile nav overlay's `backdrop-filter`-induced containing-block bug (left
background content clickable while the menu was "open"), a footer logo
text color hardcoded for light backgrounds showing at 2.97:1 contrast on
the dark footer, and a CTABanner secondary button whose text color matched
its own background (completely invisible). All three are fixed; none
required revisiting the color/type/layout decisions recorded above.
