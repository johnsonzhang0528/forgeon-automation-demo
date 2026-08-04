# Design

<!-- impeccable:design-schema 1 -->

## Adaptation Note

This project's Impeccable workflow was run without a live browser session or
image-generation subagents (non-interactive background session, no display).
`new-work.md`'s decision framework (color strategy, face calibration, AI-look
avoidance) was applied by hand rather than through `concept-seed.mjs` /
`serve-question.mjs` / the finish-reviewer subagent chain. See
`docs/SKILL_USAGE_LOG.md` §3 for the full explanation of what ran versus what
was adapted, and why.

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

Calibration check applied: this subject (industrial/engineering) has its own
default-cluster risk — generic "tech mono + Inter" — which was avoided in
favor of faces with more editorial presence while remaining a legitimate fit
for technical content (Operate/Read register inside a Persuade shell for the
spec tables).

- **Display / headings:** **Space Grotesk** — geometric but with enough
  personality to avoid the Inter-default trap; reads as engineered rather
  than generic-corporate. Loaded as self-hosted variable font (no Google
  Fonts CDN at runtime — see Performance).
- **Body & UI text:** **IBM Plex Sans** — a workhorse face with a real
  technical/engineering heritage (IBM's own design system), sets long
  bilingual paragraphs cleanly, and has full latin + reasonable CJK-adjacent
  metrics pairing.
- **Chinese body & headings:** system CJK stack (`"PingFang TC", "Noto Sans
  TC", "Microsoft JhengHei"`) paired against the Latin faces above — no
  webfont CJK subset is shipped (file size), but weight/size scale is tuned
  to visually match the Latin type rhythm.
- **Monospace (spec values, model codes):** **JetBrains Mono** at small
  sizes for spec tables and model numbers (AXM-400, VISION-X2) — gives
  technical data a "measured" feel distinct from prose.
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
