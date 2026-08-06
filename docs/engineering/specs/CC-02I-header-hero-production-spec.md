# CC-02I Header/Hero Production Implementation Spec

Status: **Draft — Revision 2 — awaiting ChatGPT Stage Gate re-review.**
`CC-02I` remains `claimable: false` in `docs/agents/TASK_REGISTRY.json`
until that review approves this spec and its tickets and an independent
activation workflow (`WF-CC02I-ACT-01`, not created this round) applies
the change. Nothing in this document authorizes implementation to begin.

**The single, canonical Implementation Authorization Gate for CC-02I is
`docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`, together with
`docs/engineering/specs/CC-02I-registry-proposal.json`.** No other review
document is part of that gate — see §17.

## Revision 2 note

This is Revision 2, produced under maintenance stage `WF-CC02I-SPEC-R2` in
response to ChatGPT's **REVISE AND RESUBMIT — Narrow Revision 2** verdict
on the Revision 1 bundle (`20260806-2107-cc02i-spec-r1-stage-gate.zip`).
Variant C ("Engineering Editorial Sheet") is unchanged and not
re-compared against Variant A/B — Revision 2 is a narrow fix pass over six
specific findings (R2-01 through R2-06): gate-document consolidation, the
Motion Orchestrator's first-frame state model, a pre-fixed Production
Acceptance Gate schema, a fixed Implementation Base Commit rule, a
corrected review-bundle handoff, and a scoped-down `Button.astro` change
allowance. Each finding's resolution is called out inline in the relevant
section below with an "**R2:**" marker, and the full finding→fix mapping
is recorded in `docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`.

Revision 1 (`WF-CC02I-SPEC-R1`) resolved thirteen earlier findings
(R1-01 through R1-13) — schema ambiguity, path/dependency inconsistency,
the original JS/no-JS motion contradiction, and several underspecified
acceptance criteria. That history is preserved, unmodified in content, in
`docs/engineering/reviews/CC-02I-stage-gate-r1-review.md`, which is now
superseded by this Revision 2 document for gate purposes only — see §17.

Follows the same flat, checkable-spec convention as `CC-01-verification-
spec.md` / `CC-02-header-hero-design-spike.md` / `CC-02F-final-editorial-
hero.md`.

## 0. Relationship to CC-02F

CC-02F (`docs/engineering/specs/CC-02F-final-editorial-hero.md`) produced a
production-quality-looking prototype ("C+") fully isolated under
`/internal-preview/cc02-final/{locale}/`. It explicitly prohibited touching
`src/pages/{zh-tw,en}/index.astro` or `src/components/layout/Header.astro`
(§19 of that spec). CC-02I is the round that lifts that prohibition under
controlled conditions: it defines how C+'s validated design is rebuilt —
not copy-pasted — onto the real site's production data and component
contracts.

**This is a rebuild against production contracts, not a file move.** The
prototype deliberately bypassed the site's locale dictionary, `siteConfig`,
`nav.ts`, and `BaseLayout` (see §7 of the CC-02F spec: "fully isolated
prototype component"). Every ticket in this stage exists because that
isolation has to be undone in a specific, reviewable order.

**R1: The CC-02F prototype route and its components
(`src/pages/internal-preview/cc02-final/**`,
`src/components/prototypes/cc02-final/**`) are never modified, moved, or
deleted by any CC-02I ticket.** They remain a permanent, independent
visual-regression and historical-comparison reference. Production
components are a controlled rewrite informed by the prototype's already-
reviewed design (§8.6 fixes the exact production paths).

## 1. Current-state model

### 1.1 Prototype vs. production — component inventory

| Concern | CC-02F prototype (`/internal-preview/cc02-final/`) | Production today | CC-02I disposition |
|---|---|---|---|
| Page shell | Hand-rolled `<html>` in `[locale].astro`, no `BaseLayout` | `BaseLayout.astro` (skip link, Header, `<main>`, Footer, AnalyticsBridge, SEOHead, StructuredData) | Must render through `BaseLayout`; prototype's hand-rolled shell is not reused |
| Header component | `FinalPrototypeHeader.astro`, self-contained, all links `href="#"` except language switch | `Header.astro`, real routes via `navItems`, real mobile drawer with fixed focus-trap/`backdrop-filter` bug already solved | Production `Header.astro` internals informed by prototype's visual/height/CTA spec, but keep production's routing, focus-trap, and containing-block fixes. `Logo.astro` is never modified (R1 — fixed decision, §4) |
| Hero content component | `FinalEditorialHero.astro` | None — current Hero is the pre-Datum `hero__grid` block in `src/pages/{zh-tw,en}/index.astro` (55/45 split, `HeroIllustration.astro`) | New `src/components/sections/Hero.astro`, built from `FinalEditorialHero.astro`'s grid logic, fixed DOM order (R1, §5) |
| Primary visual | `PrecisionSystemVisual.astro` | `HeroIllustration.astro` (hardcoded hex colors, explicitly a placeholder per its own header comment) | Rebuilt at `src/components/sections/PrecisionSystemVisual.astro` (R1 — fixed path, never `src/components/brand/`, §8.6); retire `HeroIllustration.astro` from the homepage Hero only |
| Process rail | `ProcessRail.astro` (thin wrapper over `AssemblySpine`) | Not present on homepage | Rebuilt at `src/components/sections/ProcessRail.astro`, reusing existing `AssemblySpine` locale API unchanged |
| Evaluation ledger | `EvaluationLedger.astro` | Not present | Rebuilt at `src/components/sections/EvaluationLedger.astro`, largely unchanged from prototype design |
| Copy data source | `src/data/cc02-final-hero.ts` — isolated, duplicates brand name, own `Record<FinalHeroLocale, …>` shape | `src/data/locales/{zh-tw,en}.ts` (`Dictionary` type via `getDictionary()`) + `siteConfig` (`src/config/site.ts`) | Hero/nav copy moves into the fixed, final named-object `hero` schema (R1, §7); `cc02-final-hero.ts` itself is not imported by production code and is not deleted this stage |
| Nav items | 5 prototype-only labels: solutions/products/industries/**engineeringMethod**/**resources** | 6 real routes via `navItems`: solutions/products/industries/about/insights/contact | Production Header uses the real 6-item `navItems` unchanged |
| `<html lang>` / locale routing | Hand-computed ternary, real `getStaticPaths()` per-locale routes | `getHtmlLang()` via `src/utils/i18n.ts`, same per-locale static route pattern | Use `getHtmlLang()`; the per-locale static route pattern is already correct |
| Animation trigger | Two independent `IntersectionObserver`s (one per primitive), three-layer reduced-motion defense | Same per-primitive pattern already used by `DatumOrigin`/`VisionLockFrame` | **Replaced by a single Motion Orchestrator owned by `Hero.astro`** (R1 §10, first-frame model fixed in R2 §10) — one observer, one four-state machine, no per-primitive observer in production, `armed` set synchronously before first paint |
| SEO/indexing | `noindex, nofollow` hardcoded, no `SEOHead`, no `StructuredData` | `SEOHead` + `StructuredData` via `BaseLayout`, indexability gated by Demo Mode (`allowIndexing`) | Homepage keeps its existing `BaseLayout`-driven SEO — no bespoke SEO code in the new Hero component |

### 1.2 What's temporary in the prototype and must not be carried in as-is

- **Duplicated brand name** (`finalNavCopy[locale].logo`) — must resolve to
  `siteConfig.brandNameZh` / `siteConfig.brandNameEn`.
- **`href="#" data-proto-noop` placeholder links** — every nav item, logo
  link, and CTA must resolve to a real route.
- **Prototype-only Header nav labels** (`engineeringMethod`, `resources`) —
  not part of the real 6-item IA; dropped, not translated.
- **`ProcessRail.astro`'s inline aria-label ternary** — fixed by moving the
  string into the locale contract (§7) and making `railLabel` a required
  prop with no in-component fallback.
- **`uid` generated via `Math.random().toString(36)`** — **R1 (§8.6):
  banned in production.** The production `uid` contract is a required
  `uid: string` prop; `Hero.astro` always passes the literal value
  `"homepage-hero-system"`.
- **Two independent `IntersectionObserver` instances** (one in
  `PrecisionSystemVisual`, one implicitly via `AssemblySpine` inside
  `ProcessRail`) — **R1 (§10): replaced by a single Hero-owned Motion
  Orchestrator.**

### 1.3 Design tokens: reused vs. new

No new token is introduced by this spec. Every visual value referenced in
§4/§5 already exists in `src/styles/tokens.css` and is used unchanged from
the CC-02F prototype: color (`--color-ink-*`, `--color-paper-*`,
`--color-steel-*`, `--color-copper-*`, `--color-action-primary(-hover)`),
type (`--font-display`, `--font-body`, `--font-mono`, `--fs-*`,
`--measure`, `--measure-zh`), layout (`--container-wide`,
`--page-gutter-*`, `--grid-gutter-*`), spacing (`--space-*`), radius/
border (`--radius-*`, `--border-*`), motion (`--duration-*`,
`--ease-standard`), z-index (`--z-nav`, `--z-mobile-nav`). If
implementation discovers a genuine gap, the ticket must stop and request a
token addition through the normal design-system process.

### 1.4 Architecture map

| Layer | Owner (file) | Data source | Rendering boundary | Accessibility responsibility |
|---|---|---|---|---|
| Page | `src/pages/{zh-tw,en}/index.astro` | Locale param (route segment) | Server-rendered (SSG) | Provides `locale`/`path`/`otherLocalePath` to `BaseLayout` |
| Layout | `src/layouts/BaseLayout.astro` | `siteConfig`, `getDictionary` | Server-rendered | Skip link, landmark structure, `<html lang>` |
| Header | `src/components/layout/Header.astro` | `navItems`, `getDictionary`, `siteConfig` | Server-rendered + one `<script>` for mobile drawer | Focus trap, Escape, focus return, `aria-current`, `aria-expanded`, No-JS `<noscript>` fallback (R1, §4) |
| Hero | `src/components/sections/Hero.astro` (fixed path), carries `[data-hero-motion-root]` (R2 §10) | `getDictionary(locale).hero` (R1 fixed schema, §7) | Server-rendered + Motion Orchestrator `<script>`, synchronous bootstrap (R1 §10, R2 §10) | Single real `<h1>`, fixed DOM order (R1, §5) |
| Hero visual components | `src/components/sections/{PrecisionSystemVisual,ProcessRail,EvaluationLedger}.astro` (fixed paths, R1 §8.6) | Props only | Server-rendered SVG/markup; motion state driven by Hero's orchestrator via `[data-hero-motion-root][data-motion-state]`, no independent observer | `aria-hidden` + text alternative; `tabindex="0"`+`aria-label` on scrollable rail |
| Brand Primitives | `src/components/brand/*.astro` (six existing, unchanged) | Props only | Server-rendered | Existing `decorative`/`ariaLabel` contract, unmodified |
| Locale Messages | `src/data/locales/{zh-tw,en}.ts`, `src/utils/i18n.ts` | Static TS objects, fixed `hero` schema (R1, §7) | Build-time only | N/A (data layer) |
| CTA | `src/components/ui/Button.astro` | Props | Server-rendered | Focus-visible, `aria-busy`/`aria-disabled` |
| Motion | `Hero.astro`'s single Motion Orchestrator (R1, §10) | N/A | Client, progressive enhancement | Never gates content visibility on JS execution |
| Responsive | CSS only (`clamp()`, media queries at the eight fixed breakpoints, §14) | N/A | CSS | N/A |
| Tests | `tests/e2e/*.spec.ts` | N/A | N/A | Verifies all of the above |

## 2. Final direction (context, not re-decided here)

Variant C — **Engineering Editorial Sheet** — was selected externally
(ChatGPT) during CC-02F, overriding the internal recommendation that had
favored Variant A. Reasoning on record (`CC-02F-final-editorial-hero.md`
§1): Variant A reads too close to a generic corporate site; Variant B
depends on CGI that doesn't exist yet and can't prove product quality at
this stage. One Variant A element — the four-step process rail — was
absorbed into C. **This is not re-litigated in Revision 1** — Variant C
stands, unchanged, per the governing R1 instruction that the design
decision is fixed and not subject to another A/B/C comparison.

Retained from prototype into production: the 12-column editorial grid
logic, the Datum Origin as literal layout anchor (not a decorative icon),
the Primary/Secondary visual size-and-connection relationship, the
Evaluation Ledger's three-group non-card structure, the four-step Process
Rail using `AssemblySpine`, and the single-narrative animation sequence
(now centrally orchestrated, R1 §10).

Retired: the prototype's isolated data file, isolated Header, isolated
page shell, 5-item nav label set, the `Math.random()` `uid` pattern, and
the per-primitive independent `IntersectionObserver` pattern.

Awaiting real material: none. The Primary/Secondary System Visual ships
as hand-authored SVG (§8.8) and stays that way for this stage — real CGI
is explicitly out of scope.

## 3. Design intent, made literal

"Engineering Editorial Sheet" translates to the following concrete rules:

- **Composition logic**: the page reads like an annotated engineering
  drawing, not a marketing hero. The Datum Origin mark is a literal
  coordinate anchor for the layout, not a floating decoration.
- **Information hierarchy**: Eyebrow → H1 → Body → CTA is one uninterrupted
  reading column (columns 1-5 on desktop); the System Visual is a separate,
  simultaneously-visible column.
- **Left/right ratio**: text column occupies roughly 5/12 of the grid width
  (columns 1-5 of 12); the visual system occupies roughly 7/12 (columns
  5-11/12, primary) with a smaller secondary fragment bleeding further
  right (columns 10-13, may exceed the 12-column grid by design, but never
  the viewport — see §5's overflow rule).
- **Editorial layout rules**: H1 breaks at a single, spec-fixed point (not
  CSS-determined wrapping); body copy is capped at ~36-42 Chinese
  characters / a matching English measure; no centered text, no
  photo-behind-text treatment.
- **Engineering data visual**: the Evaluation Ledger presents three
  definition-list-style groups (heading + detail), never a card grid, never
  a fabricated number.
- **Technical evidence presentation**: the Process Rail is an
  Assembly-Spine treatment (axis + nodes), never four equal-weight cards.
- **Brand primitive usage**: Datum Origin marks the anchor; the System
  Visual's own internal layering (foreground/midground/background per §8.8)
  carries the "precision you can watch" thesis from `DESIGN.md`.
- **Motion rhythm**: one linear narrative (origin → axis → modules align →
  vision lock → rail completes), ~800-1100ms, driven by a single Hero-
  owned orchestrator (R1, §10), never looping, never re-triggering.
- **Header/Hero visual relationship**: Header stays visually quiet so the
  Hero's Datum Origin reads as the page's true visual origin.
- **Responsive editorial rules**: desktop keeps the two-column simultaneous
  read; tablet collapses to a single dominant column; mobile (down to
  320px, R1 §5/§14) keeps the same fixed DOM order and demands the Primary
  Visual be substantially visible within the first viewport.

## 4. Header specification

- **Heights (R1 — corrected, §8/R1-08)**: not a fixed block height that
  clips content under zoom. Normal-zoom targets: Desktop 80px, Tablet
  80px, Mobile 64-68px, implemented via `min-block-size`. At 200% browser
  zoom or large text settings, the Header may expand naturally beyond
  this target — it must never clip, truncate, or overlap its own content.
- **Container**: `--container-wide` (1440px), gutters via
  `--page-gutter-{desktop,tablet,mobile}`.
- **Logo composition (R1 — fixed decision, R1-08)**: `DatumOrigin` (size
  ~28px, `decorative` left at default `true`) is composed **directly
  inside `Header.astro`**, placed beside the existing `Logo.astro`
  wordmark output. **`Logo.astro` is never modified.** This avoids
  affecting Footer and the mobile drawer's other `Logo` usage, and limits
  the Header ticket's sitewide risk. Brand name text comes from
  `siteConfig`, never a locally duplicated string.
- **Navigation**: the real 6-item `navItems` (`src/config/nav.ts`),
  unchanged.
- **Language switcher**: reuse `LanguageSwitcher.astro` unchanged;
  visually restyle only if needed to match CC-02F's "thinner border, no
  heavy box" language, keeping the existing ≥44×44px tap target, and
  never overflowing at 320px (R1-07, §14).
- **Primary CTA**: token changes from `--color-accent` to
  `--color-action-primary` / `--color-action-primary-hover`
  (copper-700/800). **R2-06 (fixed constraint):** `Button.astro` is a
  sitewide shared component and is not modified unless the Header CTA's
  `action-primary` token genuinely cannot be expressed through
  `Button.astro`'s existing public API. If a change is unavoidable, it is
  strictly an opt-in addition (a new `variant` value or a new opt-in
  prop) — every existing variant's default output is byte-for-byte
  unchanged, no existing Button call site is affected, and CC-02I-02 must
  inventory every current `Button.astro` call site and add a regression
  test proving a Button that does not pass the new opt-in variant/prop
  renders an identical computed style before and after. If an opt-in
  change is not achievable, CC-02I-02 stops without touching
  `Button.astro` and a separate Remediation Proposal is raised instead —
  it does not modify the component's defaults under this ticket. See
  Ticket CC-02I-02 §8 for the full constraint.
- **Sticky behavior**: unchanged — `position: sticky; top: 0`.
- **Scroll state / transparent-solid**: **not introduced by this stage** —
  out of scope, not a silent gap.
- **Hover**: nav links keep the short Datum-line underline treatment.
- **Focus-visible**: every interactive Header element needs a visible focus
  ring using `--color-focus`.
- **Active state**: `aria-current="page"` logic unchanged.
- **Mobile menu**: reuse production `Header.astro`'s existing drawer
  implementation (sibling-of-`<header>` DOM position, focus trap, Escape,
  focus return, body scroll lock) — already correct, not rebuilt.
- **No-JavaScript baseline (R1 — corrected, R1-08)**: a real `<noscript>`
  block provides a genuinely usable fallback navigation — not proof that
  links exist inside a `hidden` drawer DOM node, which is unusable without
  JavaScript to reveal it. The `<noscript>` fallback independently
  includes: all 6 real nav links, a real locale-switch link, and the
  primary Contact/Project CTA. Tested with Playwright's
  `javaScriptEnabled: false` context option, at 320px and 360px, both
  locales (CC-02I-03, §14).
- **Touch target**: ≥44×44px on every interactive Header control at every
  supported viewport including 320px.
- **Long string handling**: verify the English CTA and nav labels never
  wrap or truncate unexpectedly at any supported viewport, including
  320px.
- **zh-TW / en differences**: nav label count is the same (6) in both
  locales; only string length differs.

## 5. Hero specification

- **DOM order (R1 — fixed, mandatory at every viewport, R1-05)**:

  ```
  Datum Origin
  → Eyebrow
  → H1
  → Supporting Copy
  → Primary CTA
  → Secondary CTA
  → Primary System Visual
  → Evaluation Ledger
  → Process Rail
  ```

  This is the literal source/DOM order. Desktop CSS Grid may visually
  reposition elements (Primary Visual appears beside Copy, not below it),
  but the DOM order above never changes per breakpoint. The earlier
  "H1 before Eyebrow" ordering some draft prose implied is superseded and
  must not appear in shipped markup.

- **Min/max height**: no hardcoded fixed height. Desktop target ~760-820px
  visible height at 1440×900, driven by content + `--section-major`-scale
  vertical rhythm.
- **Desktop grid ratio**: 12-column grid; Datum Origin at column 1; H1
  spans columns 1-9 (max 3 lines); Copy spans columns 1-5 (matching the
  CC-02F prototype's own verified implementation ratio); Primary Visual
  spans columns 5-11, may bleed 24-48px past the grid edge but never past
  the viewport (see overflow rule below); Secondary Visual spans columns
  10-13; Evaluation Ledger spans columns 1-5 below the Copy; Process Rail
  spans the full Hero width at the bottom.
- **Tablet reflow**: single dominant column, DOM order per §5 above.
  Secondary Visual may merge into or sit beside Primary Visual depending
  on available width — verified against a real 768×1024 screenshot.
- **H1 max width**: Chinese visual width target ~850-980px on desktop;
  `clamp(2.35rem, 10.5vw, 3rem)` / `line-height: 1.04` on mobile (starting
  point, re-verified at 360/390/320px).
- **H1 line control**: desktop max 3 lines, mobile max 4 lines. The single
  explicit line break (`\n` in `hero.headline`) is spec-fixed content, not
  CSS-determined wrapping. The final word/character must never be isolated
  alone on its own line at any supported viewport including 320px.
- **Eyebrow**: single line, precedes H1 in DOM order (R1-05).
- **Supporting copy**: max ~36-42 Chinese characters / matching English
  measure, max 5-6 lines on mobile.
- **Primary/Secondary CTA**: distinct DOM elements (`Button.astro`
  `primary`/`secondary` variants), both before the Primary System Visual
  in DOM order (R1-05). Side-by-side at ≥390px if it fits; at 360px and
  320px, stacked primary-then-secondary if crowded, or the English CTA
  text wraps to a second line rather than shrinking below its specified
  size (R1-07). Minimum 44px tap height.
- **Engineering sheet primary visual**: `PrecisionSystemVisual.astro` at
  `src/components/sections/` (fixed path, §8.6).
- **Brand Primitives used**: `DatumOrigin` (layout anchor), `AssemblySpine`
  (via `ProcessRail`) — `ToleranceBand`, `ProcessStamp`, `CutawayWindow`
  are **not** used by this Hero; not added speculatively.
- **Real content vs. demo placeholder boundary**: Eyebrow/H1/Body/CTA
  copy is final, spec-locked text (§7) — not demo/placeholder data
  requiring an `isDemoData` label. The Evaluation Ledger's three groups
  are real process descriptions, not fabricated metrics.
- **Foreground/midground/background**: per §8.8 — foreground: primary
  module + Copper alignment nodes + metal-edge highlights; midground:
  Assembly Spine + Vision Frame + connectors; background:
  hatching/section lines, tolerance bands, faded axes.
- **Crop rules**: Primary Visual is a cutaway/clipped shape (not a
  rectangular card) on desktop; on mobile, a 4:5 or near-1:1 crop.
- **Overflow (R1 — clarified)**: grid bleed (Primary/Secondary Visual
  extending past the 12-column grid edge) is allowed where token-driven
  gutters accommodate it; **viewport overflow is never allowed at any
  supported breakpoint including 320px** — `document.documentElement.
  scrollWidth <= clientWidth` must hold everywhere.
- **320px viewport (R1 — corrected, R1-07)**: **supported.** 320px is no
  longer an excluded target. See §14 for the full breakpoint matrix and
  §5/§4's per-viewport acceptance rules (no overflow, CTAs not clipped,
  no text-shrinking to force a fit, no H1 orphan lines, Primary Visual
  stays within viewport, Mobile Menu operable, Language Switch doesn't
  overflow, touch targets still ≥44×44px).
- **English long strings**: verify longer English H1/Body/CTA strings
  don't overflow or force unwanted wrapping at 360px and 320px.
- **Fallback with no material**: none needed — SVG-only design (§8.8).
- **Motion start timing, Reduced motion, First load / CLS risk**: fully
  specified in §10's Motion Orchestrator and §12's numeric performance
  budget — not repeated here.

## 6. Design tokens

No new tokens. Full reused set:

- **Color**: `--color-ink-950`, `--color-ink-800`, `--color-paper-50`,
  `--color-paper-100`, `--color-steel-700/600/500/200`,
  `--color-copper-600/700/800/500`, `--color-action-primary(-hover)`,
  `--color-focus`.
- **Typography**: `--font-display`, `--font-body`, `--font-mono`,
  `--fs-display/h1/h2/h3/h4/body-lg/body/small/technical`, `--measure`,
  `--measure-zh`.
- **Spacing**: `--space-1` through `--space-32`, `--section-major/standard/compact`.
- **Container/Grid**: `--container-wide`, `--container-content`,
  `--page-gutter-desktop/tablet/mobile`, `--grid-gutter-desktop/tablet/mobile`.
- **Radius/Border**: `--radius-xs/sm/md`, `--border-hairline/technical/datum/ui`.
- **Shadow**: `--shadow-sm/md/lg` (drawer/dropdown-elevation only).
- **Motion**: `--duration-micro/ui/section/assembly`, `--ease-standard`.
- **Z-index**: `--z-nav`, `--z-mobile-nav`.
- **Breakpoints (R1 — corrected, R1-07)**: 320/360/390/768/1024/1280/1440/
  1920px — eight fixed breakpoints, 320px included, not the prior
  seven-breakpoint set. If the shared `tests/e2e/fixtures.ts` `VIEWPORTS`
  array is not modified (extending it is a separate decision, out of this
  stage's allowed paths), CC-02I's own test specs define a local
  CC-02I-specific matrix covering all eight — 320px is never silently
  skipped.

If a ticket's implementer believes a genuinely new token is required, the
ticket must stop and flag it rather than hardcode a value.

## 7. Locale contract

**R1 — fixed, final schema (R1-02).** The Hero and Header's new
locale-varying strings live in `src/data/locales/{zh-tw,en}.ts` under a
`hero` key, following the existing `Dictionary`/`DeepString` pattern. This
schema is final as of Revision 1 — it is not an open question for
CC-02I-01's implementer to resolve.

```ts
hero: {
  eyebrow: string;
  headline: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  visualAlt: string;
  secondaryVisualAlt: string;

  ledger: {
    input: { heading: string; detail: string };
    evaluation: { heading: string; detail: string };
    output: { heading: string; detail: string };
  };

  processRail: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    railLabel: string;
    stateLabels: {
      unconnected: string;
      aligned: string;
      connected: string;
    };
  };
}
```

**Why a fixed named object, not an array**: an array-based `ledger`/
`processRail.steps` shape risks not fitting cleanly inside
`DeepString<typeof zhTW>`'s recursive string-leaf typing without a schema
extension. The fixed named-object shape above is pre-verified to fit
`DeepString` as-is. `Hero.astro`/`ProcessRail.astro` assembles the four
`processRail.step1`–`step4` values into an array in a fixed order
(`[step1, step2, step3, step4]`) **at render time** — the ordering logic
lives in the component, not the data.

zh-TW values (verbatim, from CC-02F spec §4/§9/§11/§12):

```ts
hero: {
  eyebrow: '精密自動化整合',
  headline: '把定位、檢測與組裝，\n校準成可導入的生產流程。',
  body: '從工件、節拍到現場限制，鋒岳整合精密運動、視覺定位與模組化工作站，\n建立可評估、可配置、可驗證的自動化方案。',
  ctaPrimary: '開始專案評估',
  ctaSecondary: '查看導入條件',
  visualAlt: '精密運動模組、視覺定位頭與組裝工作站沿模組組裝軸連接的系統示意圖',
  secondaryVisualAlt: '視覺定位頭近拍與對齊節點細節',
  ledger: {
    input: { heading: '需求輸入', detail: '工件圖、目標節拍、現場限制' },
    evaluation: { heading: '評估範圍', detail: '定位、檢測、組裝與站點整合' },
    output: { heading: '交付輸出', detail: '系統架構、模組配置、驗收條件' },
  },
  processRail: {
    step1: '需求輸入', step2: '方案評估', step3: '模組配置', step4: '驗證條件',
    railLabel: '流程階段導覽',
    stateLabels: { unconnected: '待處理', aligned: '準備中', connected: '進行中' },
  },
},
```

en values (verbatim):

```ts
hero: {
  eyebrow: 'Precision Automation Integration',
  headline: 'Align positioning, inspection and assembly\ninto a production-ready system.',
  body: 'From parts and cycle time to site constraints, FORGEON combines precision motion,\nvision positioning and modular workstations into an automation solution that can be\nevaluated, configured and verified.',
  ctaPrimary: 'Start a Project Assessment',
  ctaSecondary: 'Review Integration Requirements',
  visualAlt: 'System diagram of a precision motion module, vision positioning head and assembly workstation connected along one assembly axis',
  secondaryVisualAlt: 'Close-up of the vision positioning head and its alignment node',
  ledger: {
    input: { heading: 'Project Inputs', detail: 'Part drawings, target cycle time, site constraints' },
    evaluation: { heading: 'Evaluation Scope', detail: 'Positioning, inspection, assembly and station integration' },
    output: { heading: 'Project Outputs', detail: 'System architecture, module configuration, acceptance criteria' },
  },
  processRail: {
    step1: 'INPUT', step2: 'EVALUATE', step3: 'CONFIGURE', step4: 'VERIFY',
    railLabel: 'Process stages',
    stateLabels: { unconnected: 'Pending', aligned: 'Preparing', connected: 'In progress' },
  },
},
```

- **Header navigation key**: unchanged — reuses existing `nav.solutions`,
  `nav.products`, `nav.industries`, `nav.about`, `nav.insights`,
  `nav.contact`, `nav.ctaPrimary`.
- **CTA key**: `hero.ctaPrimary`/`hero.ctaSecondary` (Hero-specific,
  distinct from `nav.ctaPrimary`).
- **Hero Eyebrow / H1 / Supporting Copy**: `hero.eyebrow`, `hero.headline`,
  `hero.body`.
- **Engineering labels**: `hero.ledger.{input,evaluation,output}.
  {heading,detail}`, `hero.processRail.step1`–`step4`.
- **ARIA labels**: `hero.visualAlt`, `hero.secondaryVisualAlt`,
  `hero.processRail.railLabel` — the fix for the CC-02F prototype's
  inline ternary.
- **Mobile menu**: unchanged, existing `nav.menuOpen`/`nav.menuClose`.
- **Language switcher**: unchanged, existing `LanguageSwitcher.astro`
  strings.

**Brand Primitives must not receive ad hoc hardcoded locale/messages
props.** `DatumOrigin`, `AssemblySpine`, and `VisionLockFrame` already
expose the minimal `ariaLabel`/`stateLabels`/`statusLabels` API from
CC-02-02 — the Hero passes dictionary values into these existing props.
`ToleranceBand`, `ProcessStamp`, `CutawayWindow` are out of scope and
receive no API changes.

## 8. Component contracts

### 8.1 `Hero.astro` (`src/components/sections/Hero.astro`)

- **Responsibility**: render the homepage Hero section in the fixed DOM
  order (§5) from locale-resolved data, and own the single Motion
  Orchestrator (§10).
- **Props**: `{ locale: Locale }` — resolves its own copy via
  `getDictionary(locale).hero`.
- **Required/Optional**: `locale` required, no optional props (no variant
  switch).
- **Locale data**: `getDictionary(locale).hero` (§7).
- **ARIA**: no additional landmark; exactly one `<h1>`.
- **State**: owns the Motion Orchestrator's four-state machine (`settled`/
  `armed`/`running`/`complete`, §10) via a `data-motion-state` attribute on
  its root element, which also carries the `data-hero-motion-root`
  selector hook (§10) so descendant CSS never has to guess which ancestor
  is authoritative.
- **Events**: CTA clicks fire the existing `trackEvent="cta_click"`
  analytics pattern via `Button.astro`, unchanged.
- **Slots**: none — content is fully data-driven.
- **Fallback**: none needed.
- **Reduced motion**: a synchronous Motion Bootstrap (§10) checks
  `matchMedia` before the first animated child paints and never creates an
  `IntersectionObserver` if reduced motion is active — root state stays
  `settled`.
- **Server/client rendering**: server-rendered markup; one minimal,
  non-deferred `<script>` for the Motion Bootstrap + Orchestrator, placed
  so it runs before the Hero's animated children are first painted (§10).
- **JavaScript allowed?**: Yes, minimal — exactly one orchestrator script,
  no per-child-component script for motion purposes.
- **Test responsibility**: H1 line-break correctness, DOM order assertion,
  grid column assertions at each of the eight breakpoints, CTA tap
  targets, ledger content-integrity, overall page H1 uniqueness.

### 8.2 `PrecisionSystemVisual.astro` (`src/components/sections/`)

- **Responsibility**: render the primary + secondary system visual
  (layered SVG), with its visual state driven entirely by the Hero root's
  `[data-hero-motion-root][data-motion-state]` via CSS — no independent
  motion trigger of its own.
- **Fixed prop contract (R1, R1-04)**:

  ```ts
  type Props = {
    uid: string;
    alt: string;
    secondaryAlt?: string;
    animated?: boolean;
  };
  ```

  `uid` is **required**. Production usage in `Hero.astro` always passes
  the literal string `"homepage-hero-system"`. `Math.random()` or any
  other runtime-generated ID is **banned**. Every SVG `id` used for a
  gradient, mask, clip-path, or ARIA cross-reference is derived from
  `uid` (e.g. `${uid}-gradient-primary`), so IDs are deterministic and
  reproducible across builds.
- **ARIA**: SVG `aria-hidden="true"`; required text alternative renders as
  visually-hidden text adjacent to the SVG.
- **State**: purely CSS-reactive to the ancestor
  `[data-hero-motion-root][data-motion-state]` attribute — no own
  `IntersectionObserver` (R1, §10).
- **Reduced motion / No-JS default**: renders the fully-settled end state
  by default (i.e. under `[data-hero-motion-root][data-motion-state=
  "settled"]`, or when no `data-hero-motion-root` ancestor exists at all,
  such as with CSS disabled) — never a "not yet drawn" flash, and never a
  state that shows the settled end state first and then animates
  backward into a start position (R2, §10).
- **Server/client rendering**: SVG server-rendered; no own `<script>`.
- **JavaScript allowed?**: No, for this component specifically — motion
  triggering is centralized in `Hero.astro`.
- **Test responsibility**: SVG ID determinism (two-build comparison,
  proves no `Math.random()`), reduced-motion end-state, absence of
  forbidden visual language.

### 8.3 `ProcessRail.astro` (`src/components/sections/`)

- **Responsibility**: render the four-step process rail as an
  `AssemblySpine` usage with Hero-specific labels, CSS-reactive to the
  Hero root's motion state.
- **Fixed prop contract**:

  ```ts
  type Props = {
    steps: [string, string, string, string];
    railLabel: string;
    stateLabels: { unconnected: string; aligned: string; connected: string };
  };
  ```

  All required. `Hero.astro` assembles `steps` from `hero.processRail.
  step1`–`step4` in fixed order.
- **ARIA**: `tabindex="0"` + `aria-label={railLabel}` on the horizontally-
  scrollable mobile container.
- **State**: no own `IntersectionObserver` (R1, §10) — CSS-reactive to
  the Hero root's `data-motion-state` only.
- **Server/client rendering**: server-rendered; no own script.
- **JavaScript allowed?**: No.
- **Test responsibility**: keyboard focus + `aria-label` presence, no
  auto-scroll, correct step-label text per locale.

### 8.4 `EvaluationLedger.astro` (`src/components/sections/`)

- **Responsibility**: render the three-group definition-list-style ledger.
- **Fixed prop contract**:

  ```ts
  type Props = {
    groups: [
      { heading: string; detail: string },
      { heading: string; detail: string },
      { heading: string; detail: string },
    ];
  };
  ```

  `Hero.astro` assembles this as `[hero.ledger.input, hero.ledger.
  evaluation, hero.ledger.output]`.
- **ARIA**: semantic `<dl>`/`<dt>`/`<dd>`.
- **State/Motion**: none — this component has no animation.
- **Server/client rendering**: fully server-rendered, zero JS.
- **JavaScript allowed?**: No.
- **Test responsibility**: content-integrity check, exactly 3 groups
  rendered.

### 8.5 `Header.astro` (modified in place, not replaced)

- Contract is unchanged from today's production component (§4 lists the
  specific visual/token/height deltas). Props (`locale`, `path`,
  `otherLocalePath`) stay the same.
- The Datum Origin mark is composed inside `Header.astro`, beside
  `Logo.astro`'s existing output — `Logo.astro` itself is never modified
  (§4, fixed R1 decision).

### 8.6 Production component location (R1 — fixed, R1-03)

**Fixed, not a per-ticket judgment call.** All three new Hero visual
components live at:

```
src/components/sections/PrecisionSystemVisual.astro
src/components/sections/ProcessRail.astro
src/components/sections/EvaluationLedger.astro
```

They are **Hero-specific production section components**, explicitly
**not** a seventh Brand Primitive — no file under `src/components/
brand/**` is created by this stage, and none of the six existing Brand
Primitives' APIs are modified. `src/components/prototypes/cc02-final/**`
and `src/pages/internal-preview/cc02-final/**` are never modified, moved,
or deleted — the CC-02F preview route keeps its own, fully independent
copy of these components for visual-regression and historical-comparison
purposes. Production versions are a controlled rewrite informed by the
prototype's already-reviewed design, not a shared-import refactor.

### 8.7 Constraints applying to all new components

- No unnecessary React Island — none of the components above need one;
  every interactive behavior (mobile drawer, Motion Orchestrator, focus
  trap) is achievable with vanilla Astro + `<script>`.
- No speculative Brand Primitive API expansion — `ToleranceBand`,
  `ProcessStamp`, `CutawayWindow` get zero changes under this stage.

## 9. Asset plan

- **Usable existing SVG**: none of the current `HeroIllustration.astro`
  content is reused — retired from the homepage Hero specifically.
- **CSS/SVG procedurally generated**: `PrecisionSystemVisual.astro`'s
  entire visual is hand-authored inline SVG using gradients/masks/
  clip-path per §8.8 — this is the asset for this stage, not a
  placeholder awaiting replacement.
- **Requires real FORGEON material**: none, for this stage.
- **Temporary placeholder use**: none — the SVG system visual is the
  real, final asset for this round.
- **Prohibited fake data**: no fabricated precision/cycle-time/capacity
  numbers anywhere.
- **Higgsfield**: not used, not needed, not planned for this stage.
- **AI-generated material**: none.
- **Must wait for customer photos**: no — fully vector/procedural
  composition by design.

### 8.8 Primary Visual — layering and materials

A real, original SVG/CSS asset — not crosshairs, dashed boxes, circles,
grids, "NO MEDIA" text, a generic tech dashboard, or random lines. Must
legibly convey: precision motion module, vision positioning head, assembly
workstation, a physical/process connection between modules, Datum Origin,
Vision Lock, Assembly Spine, and an input-to-output direction.

Visual layering: **Foreground** — primary module, Copper alignment nodes,
subtle metal-edge highlights. **Midground** — Assembly Spine, Vision
Frame, module connectors. **Background** — engineering hatching/section
lines, tolerance bands, faded coordinate axes.

Materials allowed: SVG linear/radial gradient, mask, clip-path, subtle
noise pattern, paper/metal contrast. **Not allowed**: blue-purple glow,
neon, heavy glow effects, glassmorphism, generic 3D spheres, particles.

Technical constraints: SVG-first, no Canvas, no WebGL, no heavy new
dependency, reasonable DOM node count, animation only via transform/
opacity/stroke, must render in a complete/settled state under reduced
motion or before JS runs, decorative graphics get `aria-hidden`.

## 10. Motion Orchestrator (R1 §10 fixed the architecture; R2 §10 fixes the first-frame state model)

**This section replaces the original spec's contradictory "Hero ships no
JS" + "five components animate in sync" language (R1), and then closes a
second contradiction Revision 1 left open (R2-02): `settled` was defined
as both "the SSR initial state" and "the state that never animates,"
while normal JS mode was expected to leave `settled` for `armed`/
`running` — which, without a synchronous bootstrap, risks a real user
seeing the fully-complete visual for one frame and then watching it jump
backward into its animation-start position.** The model below is fixed —
not an implementation choice.

### Selector convention (R2 — corrected)

The Hero's own root element carries **both** `data-hero-motion-root` and
`data-motion-state`:

```html
<section data-hero-motion-root data-motion-state="settled">
```

Every CSS rule that reacts to motion state is scoped through
`[data-hero-motion-root]`, e.g.:

```css
[data-hero-motion-root][data-motion-state="settled"] .some-child { ... }
[data-hero-motion-root]:not([data-motion-state]) .some-child { ... }
```

**A bare `:root:not([data-motion-state])` selector must never appear
anywhere in implementation or documentation** — `:root` matches `<html>`,
not the Hero root, and using it was Revision 1's mistake (R2-02). Every
selector is scoped to the actual Hero root via `[data-hero-motion-root]`.

### Four states — final semantics (R2 — fixed, not left to implementers)

| State | Meaning | When it applies |
|---|---|---|
| `settled` | The complete, final visual state. Once a page instance is in `settled`, it **will not** animate — this is a terminal state for that page load, not a transient starting point that JS is expected to leave. | SSR/initial HTML; No-JS; `prefers-reduced-motion: reduce`; no `IntersectionObserver` support. Any one of these conditions being true means the page stays in `settled` for its entire lifetime. |
| `armed` | Exists **only** on a page load where normal JS is running, reduced motion is NOT active, and `IntersectionObserver` is supported. Must be set **synchronously**, before the Primary Visual's animated sub-elements are first painted — never after a `settled`-looking first frame. Only decorative visual elements (the SVG's own internal animated parts) may be in their animation-start visual state under `armed`; H1, Body, both CTAs, and every accessible/interactive element render their normal, fully-visible, fully-interactive state under `armed` exactly as they do under `settled` — motion state never hides, dims, or displaces content, text, or controls. | Set by the synchronous Motion Bootstrap (below), immediately, before first paint of animated children. |
| `running` | The five-step narrative is actively playing. | Entered when the `IntersectionObserver` fires for the first time (Hero enters/is about to enter the viewport). |
| `complete` | Terminal post-animation state. Visually **equivalent** to `settled`'s end state — a viewer cannot tell the two apart by looking at the page. | ~800-1100ms after `running` begins. Never re-enters `running` afterward. |

The critical correction from Revision 1: **`settled` is never a state
that JS is expected to leave.** A page load either qualifies for
animation (goes `armed` → `running` → `complete`, synchronously bootstrapped
so `armed` is set before the first relevant paint) or it does not
(stays `settled` for its whole lifetime, decided once, at bootstrap time).
There is no code path where a page starts in `settled`, paints the
settled visual, and only then decides to animate — that path is exactly
what produced the flash/backward-jump defect R2-02 targets.

### Motion Bootstrap (R2 — new, mandatory)

`Hero.astro` ships a **minimal, synchronous, non-deferred** inline
`<script>` — not a `type="module"` script, not `defer`, not appended
after other Hero content — placed immediately after the Hero root's
opening markup and before the Primary Visual's animated sub-elements in
document order, so it executes and sets `data-motion-state` before the
browser paints those elements. The bootstrap:

1. Reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
2. Checks `typeof IntersectionObserver === 'function'`.
3. If reduced motion is active, **or** `IntersectionObserver` is
   unsupported: leaves/sets `data-motion-state="settled"` and does not
   create an observer at all — not created-then-disconnected, never
   instantiated.
4. Otherwise: sets `data-motion-state="armed"` synchronously, then creates
   exactly one `IntersectionObserver` on the Hero root.
5. That single observer's callback, on first intersection, sets
   `data-motion-state="running"`; a timer (matching the narrative's actual
   staggered `animation-delay` total) sets `data-motion-state="complete"`
   once the five-step sequence finishes, then disconnects the observer.

No module script, no deferred script, and no post-first-paint code path
may perform step 3 or step 4 — the state must be correct at first paint,
not corrected after it.

### Other fixed rules (carried from R1, restated for clarity)

- **Child selector / delay / duration**: child components read
  `[data-hero-motion-root][data-motion-state="running"]` via CSS to time
  their own sub-steps with `animation-delay`, using existing
  `--duration-section`/`--duration-ui` tokens and the CC-02F prototype's
  proven stagger values — no new duration/easing token.
- **Trigger**: fires once; the observer disconnects after first firing (or
  is never created at all under reduced motion / no support) — the
  narrative never re-triggers on repeated scroll-into-view.
- **Prohibited**: looping, re-triggering, blocking H1/Body/CTA
  interactivity or focus during `running` or `armed`, staggered fade-up
  per line of text, mouse-follow effects, parallax, particles,
  scroll-hijacking, heavy blur.
- **Numeric duration tolerance**: 800-1100ms target, 750-1150ms accepted
  measured range (§12).

### Required test coverage (R2 — mandatory, assigned to CC-02I-06)

1. **No-JS**: root stays `settled`; full content visible (Playwright
   `javaScriptEnabled: false`).
2. **Reduced motion**: root stays `settled`; `IntersectionObserver`
   constructor call count is 0 (verified via an injected spy/counter, not
   source inspection alone).
3. **Normal JS**: at the first frame where the Primary Visual's animated
   sub-elements are observable, `data-motion-state` is already `armed` or
   `running` — never observably `settled` for even one frame before
   transitioning. No settled-then-backward-jump sequence is observable.
4. **All states**: H1, Body, Primary CTA, and Secondary CTA's computed
   `opacity`, `visibility`, and `transform` do not change across
   `settled`/`armed`/`running`/`complete`.
5. **Complete**: never re-triggers after reaching `complete`; the final
   visual state is equivalent to `settled`'s.
6. **Observer count**: exactly 1 Hero-owned motion `IntersectionObserver`
   per page; 0 child-component-owned observers.
7. **First-frame flash**: automated evidence (a frame-by-frame or
   screenshot-diff test) proving no flash/backward-jump — source-code
   inspection alone does not satisfy this requirement.

## 11. Accessibility

- **Landmarks**: Hero has no bespoke landmark — plain content inside
  `BaseLayout`'s `<main id="main-content">`.
- **H1**: exactly one per page, Hero's headline is that H1.
- **Navigation label**: unchanged existing pattern.
- **Focus order**: matches the fixed DOM order (§5) — Skip Link → Header
  → Hero (Primary CTA, Secondary CTA, Process Rail scroll container) →
  rest of page.
- **Focus-visible**: every interactive element shows a visible focus ring
  using `--color-focus`.
- **Skip link**: unchanged, existing `BaseLayout` skip-to-`#main-content`
  link.
- **Mobile Menu pattern**: unchanged existing disclosure-style drawer,
  plus the new `<noscript>` fallback (§4).
- **ESC / Focus return**: unchanged behavior.
- **Contrast**: every text/background pairing reuses already-audited
  token pairings from `docs/CONTRAST_AUDIT.md`.
- **Touch target**: ≥44×44px, every interactive Hero/Header element, at
  every breakpoint including 320px.
- **Screen reader text**: `PrecisionSystemVisual`'s text alternative,
  `ProcessRail`'s `aria-label`.
- **Reduced motion**: §10.
- **Keyboard**: full Header + Hero operability without a mouse.
- **200% zoom**: Hero and Header must reflow without content loss or
  overlap.
- **320px reflow (R1 — corrected, R1-07)**: now a **supported, verified**
  target — no longer excluded. See §5/§14.
- **Language attribute**: `<html lang>` via `getHtmlLang()`.
- **CTA accessible name**: both Primary and Secondary CTA have their full
  visible text as their accessible name.

## 12. Performance budget (R1 — numeric, fixed, R1-11)

Vague language ("small enough," "does not regress," "0 CLS,"
"meaningfully") is replaced by fixed, reproducible numeric thresholds.

**Methodology**:

- Baseline captured immediately before CC-02I-06's changes are applied,
  same machine/browser/build as the "after" measurement.
- `astro build && astro preview`, Chromium, no network throttling beyond
  Lighthouse's default mobile/desktop presets.
- 3 Lighthouse runs per condition (before/after × mobile/desktop), using
  the **median** of 3 — never a single-run number.

**Thresholds**:

| Metric | Threshold |
|---|---|
| Performance Score delta | After-median ≥ Before-median − 5 points, mobile and desktop |
| LCP | After-median ≤ 2.5s, mobile preset |
| CLS | After-median ≤ 0.02 |
| Motion narrative duration | 750–1150ms measured (target 800–1100ms ±50ms tolerance) |
| New JS bytes (orchestrator) | Recorded (raw + gzip); no fixed cap, mandatory evidence |
| Inline SVG bytes | Recorded (raw + gzip); flag if >20% larger than the CC-02F prototype's reference size |
| HTML payload delta | Recorded (raw + gzip), both locales |

- **LCP element**: confirmed and recorded, not assumed — if it becomes the
  inline SVG rather than the H1 text, the same 2.5s threshold still
  applies.
- **Animation thread**: `transform`/`opacity`/`stroke` only — no
  layout-triggering property is animated.
- **Non-essential client script**: none added beyond the single Motion
  Orchestrator.
- **Lazy/eager loading**: the Hero is above the fold — nothing in it is
  lazy-loaded.
- **Preload**: no new preload directive needed.
- **Mobile network**: total added payload recorded per the table above; a
  Performance Score delta exceeding the threshold is a stop-and-flag
  condition (CC-02I-06 §17), not silently accepted.

## 13. SEO

- **Unique H1**: Hero's headline is the page's one and only `<h1>`.
- **H1 semantics**: matches the page's actual offering (positioning +
  inspection + assembly automation).
- **First-viewport copy vs. metadata consistency**: reviewed for
  consistency with `SEOHead`'s title/description once implemented.
- **Internal Preview noindex**: unaffected — this stage doesn't touch
  `/internal-preview/` routes.
- **Production homepage indexability**: unaffected — existing Demo Mode
  gating via `BaseLayout` is unchanged.
- **zh-TW/en hreflang**: unaffected — existing `switchLocalePath`/
  `getHtmlLang` mechanism.
- **CTA link**: both Hero CTAs resolve to real `/{locale}/contact/`
  routes with the existing `?intent=` query param pattern.
- **Logo link**: resolves to `/{locale}/`, unchanged.
- **Navigation link**: unchanged, real routes via `navItems`.

## 14. Browser/viewport matrix (R1 — 320px added, R1-07)

- Chromium, Firefox, WebKit (per the project's actual Playwright
  configuration).
- **Eight fixed breakpoints**:

  ```
  320×800
  360×800
  390×844
  768×1024
  1024×768
  1280×800
  1440×900
  1920×1080
  ```

  320px is now mandatory — no viewport is excluded from this stage's
  scope. If the shared `tests/e2e/fixtures.ts` `VIEWPORTS` fixture is not
  extended (extending it is a separate decision, outside this stage's
  allowed paths), CC-02I's own specs define a local matrix covering all
  eight.

## 15. Acceptance criteria

**Must (blocking):**

- A first-time visitor can state, without scrolling, that this is an
  industrial automation company doing positioning + inspection + assembly
  as one system, with a clear next step.
- Header and Hero are visibly one brand system.
- No fabricated precision/cycle-time/capacity/success numbers anywhere.
- zh-TW and en routes both pass every check in this list independently.
- No horizontal overflow at any of the eight breakpoints, **including
  320px**.
- Full keyboard operability: Header nav, mobile drawer, both Hero CTAs,
  Process Rail scroll container.
- No-JS fallback (Header `<noscript>` block) is genuinely usable with
  `javaScriptEnabled: false`, verified by Playwright, not merely present
  in hidden markup.
- Reduced motion renders the fully-settled end state with no flash,
  verified via Playwright `reducedMotion: 'reduce'` context, and the
  Motion Orchestrator's `IntersectionObserver` is never created under
  that condition.
- Normal-JS page loads never observably render a `settled` first frame
  before transitioning to `armed`/`running` — the Motion Bootstrap (§10)
  sets `armed` synchronously before the Primary Visual's animated
  sub-elements first paint, verified with automated first-frame evidence,
  not source inspection alone (R2-02).
- DOM order matches §5's fixed sequence exactly, at every breakpoint.
- No child Hero component creates its own `IntersectionObserver`; exactly
  one Hero-owned observer exists per page.
- No `Math.random()`-derived ID anywhere in production Hero components.
- Zero Critical/Serious axe violations, both locales, desktop + mobile.
- Numeric performance thresholds in §12 are met, or any miss is
  documented and escalated per CC-02I-06 §17 — never silently accepted.
- `pnpm build` succeeds and produces the expected page count; `pnpm
  check:h1`, `pnpm check:links`, `pnpm check:locale-routes` all pass.
- The other pages of the site are unaffected — full `responsive-
  overflow.spec.ts` and `axe.spec.ts` suites still pass across all 14 page
  types.

**Should (strongly expected, not individually blocking if one slips with a
documented reason):**

- Primary System Visual is substantially visible (30-40%+) within the
  first mobile viewport without scrolling.
- LCP element remains the H1 text (or, if it becomes the SVG, this is
  called out and separately budget-checked).

**Portfolio-grade (aspirational, evaluated qualitatively):**

- At least one first-viewport composition memorable enough to serve as the
  agency's own portfolio representative image.
- Does not read as a generic B2B/SaaS template at a glance.

## 16. Explicit non-goals for CC-02I

- No copy/content changes anywhere outside the Header/Hero.
- No new Brand Primitive component.
- No change to `ToleranceBand`/`ProcessStamp`/`CutawayWindow`.
- No scroll-triggered Header transparency/solid state.
- No real photography/CGI, no Higgsfield.
- No change to Footer, Contact, or any non-Header/Hero page section.
- No modification of `Logo.astro` (R1, §4).
- No modification of `src/components/prototypes/cc02-final/**` or
  `src/pages/internal-preview/cc02-final/**` (R1, §0).
- No per-primitive independent `IntersectionObserver` (R1, §10).
- No production integration happens as part of *this document* — this
  document is the spec; production integration happens only after both
  Stage Gates in §17 are passed and each ticket below is claimed and
  completed individually.

## 17. Two distinct Stage Gates (R1 fixed the split; R2-01/R2-03/R2-04 fix the remaining ambiguity)

This stage has two separate, never-merged gate documents. Revision 1
introduced the split but left a naming ambiguity — `CC-02I-stage-gate-
review.md` said it was superseded while other documents still cited it as
current, and the finding-mapping document (`CC-02I-stage-gate-r1-review.md`)
was itself ambiguous about whether it or the original review was
authoritative. **Revision 2 (R2-01) removes that ambiguity completely: the
gate documents named below are the only correct references, full
filenames, no "as revised" or "current revision's" indirection anywhere.**

### 17.1 CC-02I Implementation Authorization Gate (canonical, R2)

Composed of **exactly two files**:

1. `docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`
2. `docs/engineering/specs/CC-02I-registry-proposal.json`

Decides only whether the eight tickets below may **start**. Evaluated
entirely before any ticket touches `src/**` or `public/**`. Does not
declare its own approval — that remains ChatGPT's/the user's decision.

**Historical documents, not part of the gate:**

- `docs/engineering/reviews/CC-02I-stage-gate-review.md` — the original
  CC-02I-PREP submission. Status: **Historical / Superseded.** Kept only
  as a record of what was originally submitted; carries no current gate
  authority.
- `docs/engineering/reviews/CC-02I-stage-gate-r1-review.md` — the
  Revision 1 finding→fix mapping. Status: **Superseded by Revision 2.**
  Its R1-01 through R1-13 finding history is preserved unmodified as a
  historical record; it is not consulted to determine current gate
  status — only `CC-02I-stage-gate-r2-review.md` is.

Every other document in this stage that references "the Implementation
Authorization Gate" — the production spec itself, every ticket, the
registry proposal, and this stage's handoff — names
`CC-02I-stage-gate-r2-review.md` explicitly, by full filename. No
document may use an indirect phrase ("the current review," "as revised
this round," "the latest stage-gate-review") that could resolve to more
than one file.

### 17.2 CC-02I Production Acceptance Gate (fixed schema, R2-03)

A **new** document, `docs/engineering/reviews/CC-02I-production-
acceptance-gate.md`, created by CC-02I-08 only after all eight
implementation tickets are complete and the finished implementation
exists. Judges the **shipped result** — never reused as, or merged with,
the Implementation Authorization Gate documents in §17.1.

**Its structure is fixed now, not left for CC-02I-08 to invent.** It must
contain exactly these eighteen sections, in this order:

1. Gate identity and purpose.
2. Implementation Base Commit (§17.3 — the exact SHA `WF-CC02I-ACT-01`
   produced).
3. Candidate / Final Checkpoint Commit (the exact SHA CC-02I-08 finishes
   at).
4. CC-02I-01 through CC-02I-08 commit map (one SHA per ticket, showing the
   implementation's actual commit history).
5. Actual changed files and scope diff (relative to the Implementation
   Base Commit).
6. Variant C visual consistency.
7. Header acceptance.
8. Hero structure and DOM order acceptance.
9. Locale and real-route acceptance.
10. No-JS, reduced motion, and Motion State acceptance (per §10's fixed
    four-state model and its required test coverage).
11. Responsive, 320px, and 200% zoom acceptance.
12. Accessibility and keyboard acceptance.
13. Performance data table (per §12's numeric thresholds).
14. Full regression test results.
15. Screenshot and review bundle paths.
16. Known deviations, failures, and risks.
17. Integration readiness.
18. External Reviewer Verdict — **placeholder only.** Neither Claude nor
    Codex fills this section with PASS/FAIL/APPROVED. It contains exactly
    the literal text `Awaiting ChatGPT / User External Review` until a
    human or ChatGPT writes a real verdict into it.

Ticket CC-02I-08 (§CC-02I-08 in the ticket set) is updated to reference
this exact eighteen-section structure rather than free-authoring its own.

### 17.3 CC-02I Implementation Base Commit (fixed rule, R2-04)

**Definition**: the Activation Commit that `WF-CC02I-ACT-01` produces when
it writes the ChatGPT-approved `activation_target` (from the registry
proposal) into the live `TASK_REGISTRY.json` is, by definition, the **CC-
02I Implementation Base Commit**. It is the single fixed point that:

- Precedes every CC-02I-01 through CC-02I-08 implementation commit.
- Is the `<base-commit>` argument CC-02I-08 uses when it runs `pnpm
  review:bundle <base-commit> ...` to build the Production Acceptance
  Gate's review bundle.
- Is the "Before" state for CC-02I-08's before/after screenshot pairs —
  "After" is CC-02I-08's own final checkpoint commit.
- Is listed, by exact SHA, in the Production Acceptance Gate's §2, next to
  the Final Checkpoint Commit's SHA in §3 (§17.2 above).

**CC-02I-08 does not guess, derive, or search for this commit** — it is
handed the SHA directly, because `WF-CC02I-ACT-01`'s own spec and handoff
are required to output it explicitly when that workflow completes. This
round (`WF-CC02I-SPEC-R2`) only defines this rule — `WF-CC02I-ACT-01`
itself is not created or executed this round (§ii of the governing
authorization's constraints).
