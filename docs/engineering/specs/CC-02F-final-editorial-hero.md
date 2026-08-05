# CC-02F Final Editorial Hero — Spec

Follows the same flat, checkable-spec convention as `CC-01-verification-
spec.md` / `CC-02-header-hero-design-spike.md`. This is a *final direction*
build, not another design-spike comparison — see §1.

## 1. Final direction (context, not a decision made here)

The user's local ChatGPT session reviewed the CC-02 bundle
(`docs/engineering/handoffs/CC-02-chatgpt-review-handoff.md`) and picked
**Variant C — Engineering Editorial Sheet** as the final Hero direction,
overriding the internal recommendation (which favored Variant A). This is a
genuine external decision and is not relitigated here. Reasoning recorded by
the external reviewer: Variant A reads too close to a generic corporate
site (left-text/right-image, large panel visual, insufficient portfolio
differentiation); Variant B has visual impact but depends on CGI that
doesn't exist yet and can't prove product quality at this stage — B's
dark-stage language is reserved for a possible future "Product Assembly"
section, not this round's Hero.

**One Variant A element is absorbed into C**: the INPUT → EVALUATE →
CONFIGURE → VERIFY process rail (improves 5-second comprehension,
reinforces "clarify first, then configure" methodology, ties the editorial
composition back to the automation workflow). Variant A's standard
left/right split and its three equal-sized module cards are **not**
reintroduced.

This round (CC-02F) takes Variant C from a design-spike concept to a
production-ready-quality "C+" prototype, per specific fixes the external
reviewer identified (fake data, header weight, route architecture, real
system visual). It produces one more review-bundle submission for a Hero
Stage Gate — it does not integrate into the real site and does not start
CC-03.

## 2. Business purpose

鋒岳自動化 (FORGEON AUTOMATION) needs a Header/Hero pairing that gets a B2B
industrial buyer (plant manager, process engineer, procurement) to a
concrete understanding of the offer — precision positioning + vision
inspection + automated assembly integration, evaluated against the buyer's
own parts/cycle-time/site conditions — without relying on unprovable
performance claims. Same business goal as CC-02's spec, now built to a
quality bar suitable for an actual client-facing Stage Gate decision.

## 3. 5-second comprehension goal

A first-time visitor, without scrolling or reading body copy, should be
able to state: (1) this is an industrial/manufacturing automation company,
(2) it does positioning + inspection + assembly as one integrated system,
(3) there is a clear, concrete next step (start an assessment / review
integration requirements). Verified in the Impeccable review (§18) with
actual screenshots, not just a design intention.

## 4. Final copy (verbatim — see also §9 tickets/01)

**zh-TW**

```
Eyebrow:        精密自動化整合
H1:              把定位、檢測與組裝，
                 校準成可導入的生產流程。
Body:            從工件、節拍到現場限制，鋒岳整合精密運動、視覺定位與模組化工作站，
                 建立可評估、可配置、可驗證的自動化方案。
Primary CTA:     開始專案評估
Secondary CTA:   查看導入條件
```

**English**

```
Eyebrow:        Precision Automation Integration
H1:              Align positioning, inspection and assembly
                 into a production-ready system.
Body:            From parts and cycle time to site constraints, FORGEON combines precision motion,
                 vision positioning and modular workstations into an automation solution that can be
                 evaluated, configured and verified.
Primary CTA:     Start a Project Assessment
Secondary CTA:   Review Integration Requirements
```

Sourced verbatim from `src/data/cc02-final-hero.ts`. No paraphrasing, no
retranslation. zh/en must match in meaning, not word-for-word.

**Copy requirements**: no empty buzzwords ("leading", "seamless",
"cutting-edge", "empower", etc.), no unprovable outcome claims, no promised
conversion/capacity/precision numbers, no SEO keyword stuffing.

## 5. Header spec

- Desktop height: 80px. Mobile height: 64-68px.
- Logo mark ~26-30px, brand wordmark clearly legible (not visually
  subordinate to any other Header element).
- Language control keeps a 44×44px tap area but a visually lighter
  treatment than CC-02's `PrototypeHeader` (thinner border, no heavy box) —
  it must not visually outweigh the brand wordmark.
- Header primary CTA uses `--color-action-primary` /
  `--color-action-primary-hover` (copper-700/copper-800 — see
  `docs/DESIGN_SYSTEM.md`).
- Nav hover keeps the short Datum-line treatment (no large pill buttons, no
  mega menu).
- No dependency on production `Header.astro` or `src/config/nav.ts` — fully
  isolated prototype component (see §11).

## 6. Desktop composition (target viewport 1440×900)

- Header 80px. Hero visible height ~760-820px. First viewport shows,
  simultaneously: brand, H1, primary body copy, CTA, primary visual, at
  least part of the Process Rail.
- 12-column grid:
  - **Datum Origin**: column 1, above H1, not a generic icon — the literal
    layout origin point.
  - **H1**: columns 1-9, max 3 lines, "流程。" (or English's final word)
    never isolated alone on its own line, Chinese visual width target
    ~850-980px, font size not inflated beyond commercial readability.
  - **Copy**: columns 1-5, below H1, body max ~36-42 Chinese characters,
    CTA immediately follows body.
  - **Primary System Visual**: columns 5-11, dominant visual, noticeably
    larger than Secondary Visual, may bleed 24-48px outside the grid, a
    cutaway/clipped shape (not a plain rectangular card), never shows
    literal "NO MEDIA" placeholder text.
  - **Secondary Detail**: columns 10-13, ~35-50% smaller than Primary
    Visual, partial overlap or axis-line connection with Primary Visual
    (not a second equal-sized cutaway) — vision-positioning head,
    connector node, or local module detail.
  - **Evaluation Ledger**: columns 1-5, below Copy or at the Hero's bottom
    edge, three text groups, no cards, no fake numbers (content per §9).
  - **Process Rail**: spans the Hero's bottom, INPUT→EVALUATE→CONFIGURE→
    VERIFY (English literal) / 需求輸入→方案評估→模組配置→驗證條件
    (zh-tw), Assembly-Spine/Datum-Axis visual treatment (not four cards),
    current step may use Copper, other steps use Steel.

## 7. Tablet composition (768×1024)

Same grid logic collapsed to a single-column-dominant flow: Datum Origin →
H1 → Body → CTA → Primary Visual → Evaluation Ledger → Process Rail.
Secondary Visual may merge into or sit beside the Primary Visual depending
on available width — verified via screenshot, not assumed.

## 8. Mobile composition (390×844 and 360×800)

- Header: 64-68px, logo is the primary visual element, language-switch tap
  target ≥44×44px (not an oversized 60px box), menu control 44×44px, no
  overflow.
- Hero content order: Datum Origin, H1, Eyebrow, Body, CTA, Primary Visual.
- H1: max 4 lines, must not split "組裝" (or English equivalent) across a
  line break, must not leave an isolated punctuation mark alone on a line.
  Reference sizing (verified via screenshot, not trusted blindly):
  `font-size: clamp(2.35rem, 10.5vw, 3rem); line-height: 1.04;`
- Body: shorter vertical height than CC-02's variant-c, ≤5-6 lines.
- CTA: side-by-side at 390px if it fits; stacked primary-then-secondary at
  360px if crowded; minimum 44px tap height; text is not shrunk to solve a
  spacing problem.
- Primary Visual: ≥30-40% visible within the first 844px of vertical
  scroll, does not start later than ~590-630px from top, 4:5 or near-1:1
  crop (not a shrunk full desktop image). Secondary Detail may be hidden or
  merged into the primary visual on mobile.
- Evaluation Ledger: moves below the fold.
- Process Rail: may scroll horizontally, `tabindex="0"`, correct
  `aria-label`, keyboard operable, no auto-scroll.

## 9. Primary Visual — PrecisionSystemVisual

A real, original SVG/CSS asset — not crosshairs, dashed boxes, circles,
grids, "NO MEDIA" text, a generic tech dashboard, or random lines. Must
legibly convey: precision motion module, vision positioning head, assembly
workstation, a physical/process connection between modules, Datum Origin,
Vision Lock, Assembly Spine, and an input-to-output direction.

Visual layering:
- **Foreground**: primary module, Copper alignment nodes, subtle metal-edge
  highlights.
- **Midground**: Assembly Spine, Vision Frame, module connectors.
- **Background**: engineering hatching/section lines, tolerance bands,
  faded coordinate axes.

Materials allowed: SVG linear/radial gradient, mask, clip-path, subtle
noise pattern, paper/metal contrast. **Not allowed**: blue-purple glow,
neon, heavy glow effects, glassmorphism, generic 3D spheres, particles.

Technical constraints: SVG-first, no Canvas, no WebGL, no heavy new
dependency, reasonable DOM node count, animation only via
transform/opacity/stroke, must render in a complete/settled state under
reduced motion, decorative graphics get `aria-hidden`, provide an
understandable text alternative.

## 10. Secondary Visual

35-50% smaller than the Primary Visual, connected to it via partial overlap
or an axis-line connector (not a second, equal-sized Cutaway Window).
Shows a vision-positioning head, a connector node, or a local module
detail — a fragment, not a second full scene.

## 11. Process Rail

Four steps, spec-exact labels (§4). Rendered as an Assembly-Spine/
Datum-Axis visual treatment, not four cards. Current step may use the
Copper accent token; other steps use Steel. Keyboard operable
(`tabindex="0"` on the horizontally-scrollable mobile container, correct
`aria-label`, no auto-scroll).

## 12. Content-integrity rules (no fake data)

Current Variant C prototype (`src/pages/internal-preview/cc02-hero/
variant-c.astro`) contains fabricated engineering numbers: `±0.01 mm`,
`< 180 ms`, `3 型號可組合` (and English equivalents). These must not exist
anywhere in C+. No fake precision, cycle time, capacity, success rate,
model performance, customer outcome, or acceptance numbers anywhere.

Replacement content (Evaluation Ledger, method/deliverable info — see
`src/data/cc02-final-hero.ts` for the source of truth):

zh-TW: 需求輸入 (工件圖、目標節拍、現場限制) / 評估範圍 (定位、檢測、組裝與
站點整合) / 交付輸出 (系統架構、模組配置、驗收條件).

en: Project Inputs (Part drawings, target cycle time, site constraints) /
Evaluation Scope (Positioning, inspection, assembly and station
integration) / Project Outputs (System architecture, module configuration,
acceptance criteria).

## 13. Animation

Single clear narrative, ~800-1100ms total: (1) Datum Origin appears, (2)
axis expands, (3) three modules align along the Assembly Spine, (4) Vision
Frame locks, (5) Process Rail completes. Must not block H1/Body/CTA
interactivity or delay usability.

Forbidden: staggered fade-up per line of text, infinite loops,
mouse-follow effects, parallax, particles, scroll-hijacking, heavy blur.

Reduced motion: show the fully-completed end state immediately, no
displacement, no continuous animation, stable state within 100ms.

## 14. Accessibility

- Header keyboard operable (Tab order, Escape closes mobile drawer, focus
  trap while open, focus returns to the toggle on close).
- Exactly one real `<h1>` per page, correct `<html lang>` per locale route.
- Every Brand Primitive usage sets `decorative` correctly or supplies a
  real `ariaLabel`/`statusLabels`/`stateLabels` — no hardcoded Chinese
  string leaking into the English route.
- Process Rail: `tabindex="0"` + `aria-label` on any horizontally
  scrollable container, keyboard-operable.
- Axe scan: 0 Critical / 0 Serious across both locale routes, desktop +
  mobile.
- Focus-visible states on every interactive element.

## 15. Performance

- First-paint motion completes within ~1-1.1s.
- Motion uses `transform`/`opacity`/`stroke` only.
- No new runtime dependency, no new large framework.
- Does not block LCP.
- No analytics firing on preview routes.

## 16. Screenshot requirements

`docs/screenshots/cc02-final/` — 11 files exactly:
`zh-desktop.png`, `zh-tablet.png`, `zh-mobile-390.png`, `zh-mobile-360.png`,
`en-desktop.png`, `en-tablet.png`, `en-mobile-390.png`, `en-mobile-360.png`,
`visual-detail.png`, `reduced-motion.png`, `comparison-c-vs-final.png`.
Real `astro preview` (build first), no DevTools chrome, no loading states,
full-viewport captures. Desktop 1440×900, Tablet 768×1024, Mobile 390×844
and 360×800.

## 17. Impeccable review requirement

`docs/engineering/reviews/CC-02F-impeccable-review.md` — evidence-based
(measured contrast ratios, actual line counts, actual pixel values), not
adjective-only claims. Covers: 5-second comprehension, genuine brand
distinctiveness vs Variant A, absence of generic-tech-template feel, H1
line breaks, H1-vs-primary-visual weight balance, Primary/Secondary visual
hierarchy, absence of two equal-sized media frames, absence of fake specs,
absence of placeholder text, checks at 1440×900/1024px/768×1024/390×844/
360×800, both locales, Header, CTA, reduced motion, focus states, contrast,
first-viewport image visibility.

## 18. ChatGPT Stage Gate

This round produces a review bundle
(`npx --yes pnpm review:bundle <CC02F_BASE> cc02-final-hero`) for one more
external ChatGPT review — a Hero Stage Gate decision on whether C+ is
launch-ready, needs another iteration, or should be reconsidered. This
round does not make that decision itself.

## 19. Explicit prohibitions (binding for this round)

- **No production integration.** No part of C+ is copied into
  `src/pages/{zh-tw,en}/index.astro` or the production
  `src/components/layout/Header.astro`. Those files are not touched at
  all this round.
- **No Higgsfield.** No Higgsfield tool of any kind, for any asset,
  including preview. `docs/DATUM_ASSET_PLAN_CC02F.md` is a plan document
  only — no generation request is submitted.
- **No CC-03.** This round ends once the review bundle is built and
  verified. No CC-03-labeled work starts this round.
- **No push.** Nothing in this round is pushed to any remote.
