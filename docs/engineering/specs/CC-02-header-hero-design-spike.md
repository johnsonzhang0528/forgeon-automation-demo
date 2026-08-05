# CC-02 Header/Hero Design Spike — Spec

This synthesizes the CC-02 task book (the verbatim spec dispatched for this
round) into a flat, checkable spec for the prototype phase (§十一 onward),
the same way `CC-01-verification-spec.md` did for CC-01. Part 1
(CC-02-00..04) is tooling/bugfix/token/audit work already committed —
this doc covers Part 2: three isolated Header/Hero design-spike prototypes.

## 商業目標 (Business goal)

鋒岳自動化 (FORGEON AUTOMATION) needs a Header/Hero pairing that gets a
B2B industrial buyer (plant manager, process engineer, procurement) to
understand — within about 5 seconds — that this company does precision
positioning + vision inspection + automated assembly integration, evaluated
against the buyer's own parts/cycle-time/site conditions, not a generic
"we do automation" claim. The Header must carry real navigation (Solutions/
Products/Industries/Engineering Method/Resources), a working locale switch,
and a primary CTA, on both zh-tw and en, at every required viewport.

## 5 秒理解目標 (5-second comprehension target)

A first-time visitor, without scrolling or reading body copy, should be
able to state: (1) this is an industrial/manufacturing automation company,
(2) it does positioning + inspection + assembly as one integrated offering,
(3) there is a clear next step (start an assessment / review requirements).
This is the primary axis of the internal scoring rubric's largest category
(§十九, 20/100 points).

## Header 功能 (shared across all three variants — spec §十六)

- Logo / Datum Mark
- Nav items: Solutions, Products, Industries, Engineering Method, Resources
  (Engineering Method and Resources are new nav labels for this spike —
  they do not need to resolve to real routes inside the prototype; the
  spike is about Header/Hero visual/interaction design, not IA expansion)
- Language switch
- Primary CTA
- Mobile menu (drawer)

Desktop: 76–84px header height, no full mega-menu, hover state is a short
Datum Line (not an underline/highlight box), no large pill-shaped nav,
scrolled state shows a clear background (for contrast against page
content scrolling underneath, especially relevant to Variant B's
image-heavy Hero).

Mobile: 64–72px header height, Logo + Language + Menu toggle visible, CTA
lives at the bottom of the drawer, 44×44px minimum tap targets, Escape
closes the drawer, focus trap while open, focus returns to the toggle on
close, background content is inert (not just visually dimmed) while the
drawer is open — same contract `Header.astro`'s real mobile nav already
implements (see its own inline comment on why the overlay must be a
sibling of `<header>`, not nested inside it, given `backdrop-filter`'s
containing-block behavior).

## Hero 共用文案 (shared copy — verbatim, all three variants)

See spec's own §十二, reproduced byte-identical in
`src/pages/internal-preview/cc02-hero/_shared/copy.ts` and consumed by
all three variant pages — not paraphrased or "improved" per variant.

## CTA

Two CTAs, shared verbatim copy:
- zh-tw: 開始專案評估 (primary) / 先看導入條件 (secondary)
- en: Start a Project Assessment (primary) / Review Integration
  Requirements (secondary)

Primary CTA uses the new `--color-action-primary` / `--color-action-
primary-hover` tokens (CC-02-03) — this is the one required place across
all three variants where the new token must actually render, not just
exist in `tokens.css`.

## Precision Datum 視覺語言

All three variants must use the CC-01 Brand Primitives
(`src/components/brand/*.astro`) as their actual visual vocabulary, not
just as passing references in prose — which primitives, in what
combination, differs per variant (§十三/十四/十五 below).

## 三個構圖方向

- **Variant A — Datum Calibration Split**: text-left/visual-right 12-column
  split, visual crosses the container edge, DatumOrigin + module axis +
  VisionLockFrame + AssemblySpine compose the visual, four-step process
  strip below (INPUT/ALIGN/INSPECT/ASSEMBLE).
- **Variant B — Full-width Precision Stage**: near-full-width visual stage,
  copy in a lower-left/lower-center safe zone, Datum Axis spans the full
  Hero width, Header can overlay the Hero with a stable-contrast
  treatment.
- **Variant C — Engineering Editorial Sheet**: asymmetric editorial layout
  (headline spans columns 1–8, not a centered/split layout), two irregular
  Cutaway Windows, DatumOrigin as the layout's literal typographic origin
  point, technical data as a secondary information layer.

Full detail per variant in §十三/十四/十五 of the original task book —
restated in the per-variant tickets (`docs/engineering/tickets/CC-02/06`,
`07`, `08`).

## Responsive

All three variants: real content (not a scaled-down desktop screenshot) at
1440×900 (desktop), 768×1024 (tablet), 390×844 (mobile), plus an explicit
360px check (no horizontal overflow — reusing the same zero-overflow bar
CC-02-01 just fixed on the real homepage). Mobile-specific composition
rules are specified per variant (§十三/十四/十五) — none of the three is
allowed to just shrink its desktop layout uniformly.

## Accessibility

- Header keyboard operable (Tab order, Escape closes mobile drawer, focus
  trap while open, focus returns to the toggle on close) — same contract
  as the real site's Header.
- Every Brand Primitive usage in every variant either sets `decorative`
  correctly or supplies a real `ariaLabel`/`label`/`statusLabels` per the
  CC-02-02 API — no bare hardcoded-Chinese instance sneaks into an English
  variant page.
- Axe scan (0 Critical/0 Serious) on all three variant pages plus the
  index page, both viewport classes tested (desktop + mobile).

## Reduced Motion

`prefers-reduced-motion: reduce` must collapse every animated Brand
Primitive usage to its finished state with no flash of the pre-animation
state — this is already how each primitive implements it (see each
component's own `@media (prefers-reduced-motion: reduce)` block); the
prototypes must not disable or work around that, and must not add new
motion outside what each primitive already offers (spec §十七's explicit
motion allow/deny list — no particle effects, no cursor-follow glow, no
infinite rotation, no scroll hijacking, no per-character fly-in, no
per-element fade-up-everything).

## Performance

- First-paint motion completes within ~1s.
- Motion uses `transform`/`opacity` only (already true of every Brand
  Primitive's own animation implementation).
- No new runtime dependency, no new large framework — Astro + the existing
  Brand Primitives + plain CSS/vanilla JS only.
- Does not block LCP.

## Preview Route

`src/pages/internal-preview/cc02-hero/{index,variant-a,variant-b,variant-c}.astro`.
Every page: `<meta name="robots" content="noindex, nofollow">`, excluded
from `sitemap.xml`, not linked from any real nav, no analytics event
wiring (`AnalyticsBridge`/GTM not included), CSS scoped per-page (no shared
global stylesheet edits beyond what the real site's tokens/Brand Primitives
already provide).

## Screenshot

`docs/screenshots/cc02/` — 11 files exactly as named in spec §二十一:
3 variants × 3 viewports (desktop/tablet/mobile) + 2 comparison composites
(desktop, mobile). Full-viewport captures, no DevTools chrome, no loading
state, Header not cropped out.

## Impeccable

`docs/engineering/reviews/CC-02-impeccable-hero-review.md` — Critique/
Typeset/Layout/Adapt/Audit pass across all three variants, covering the
checklist in spec §十八 (5-second comprehension, visual focus, brand
recognition vs. generic-tech-template risk, CTA clarity, both locales, all
three viewport classes, Header, contrast, motion, reduced motion, image
safe zones, long-English-text wrapping).

## Internal Code Review

`code-review`-style pass comparing `CC02_BASE...HEAD`, split into Standards
(prototype isolation, CSS scope, runtime JS, i18n, accessibility,
performance, component boundaries, bundle-tooling privacy, parent-repo path
leakage, git hygiene) and Spec (are the three variants substantively
different, same shared copy, all three sizes done, Impeccable done, 360px
handled, Locale API done, Action Token done, font payload measured, no
Higgsfield, no accidental prod-homepage edit, no CC-03 entry).

## ChatGPT Final Review

This round's external reviewer is the user's local ChatGPT session (not
Codex) — see `docs/engineering/handoffs/CC-02-chatgpt-review-handoff.md`
and the review bundle built from it. ChatGPT reviews the bundle and picks a
direction (or asks for changes) in a future session; this round does not
wait for that answer.

## 禁止事項 (explicit prohibitions, all binding for this round)

- **禁止 Higgsfield**: no Higgsfield tool of any kind used at any point this
  round, for any asset.
- **禁止正式首頁整合**: no variant, or any part of a variant, is copied
  into `src/pages/{zh-tw,en}/index.astro`. Those two files are touched only
  for the one narrow CC-02-01 overflow fix (which did not touch Hero
  content/structure — see the CC-02-01 commit and
  `tests/e2e/responsive-overflow.spec.ts`'s CC-02-01 test block).
- **禁止進入 CC-03**: this round ends once the review bundle is produced
  and verified. No CC-03-labeled work of any kind starts this round,
  regardless of remaining time budget.
