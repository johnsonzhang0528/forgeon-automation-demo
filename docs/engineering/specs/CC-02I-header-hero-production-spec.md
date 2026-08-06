# CC-02I Header/Hero Production Implementation Spec

Status: **Draft — awaiting ChatGPT Stage Gate review.** `CC-02I` remains
`claimable: false` in `docs/agents/TASK_REGISTRY.json` until that review
approves this spec and its tickets. Nothing in this document authorizes
implementation to begin.

Follows the same flat, checkable-spec convention as `CC-01-verification-
spec.md` / `CC-02-header-hero-design-spike.md` / `CC-02F-final-editorial-
hero.md`. This spec does not re-litigate the Variant A/B/C decision — that
decision was made externally (ChatGPT) during CC-02F and is treated as
fixed input here (see §2).

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

## 1. Current-state model

### 1.1 Prototype vs. production — component inventory

| Concern | CC-02F prototype (`/internal-preview/cc02-final/`) | Production today | CC-02I disposition |
|---|---|---|---|
| Page shell | Hand-rolled `<html>` in `[locale].astro`, no `BaseLayout` | `BaseLayout.astro` (skip link, Header, `<main>`, Footer, AnalyticsBridge, SEOHead, StructuredData) | Must render through `BaseLayout`; prototype's hand-rolled shell is not reused |
| Header component | `FinalPrototypeHeader.astro`, self-contained, all links `href="#"` except language switch | `Header.astro`, real routes via `navItems`, real mobile drawer with fixed focus-trap/`backdrop-filter` bug already solved | New `Header.astro` internals informed by prototype's visual/height/CTA spec, but keep production's routing, focus-trap, and containing-block fixes |
| Hero content component | `FinalEditorialHero.astro` | None — current Hero is the pre-Datum `hero__grid` block in `src/pages/{zh-tw,en}/index.astro` (55/45 split, `HeroIllustration.astro`) | New component under `src/components/sections/` (not `prototypes/`), built from `FinalEditorialHero.astro`'s grid logic |
| Primary visual | `PrecisionSystemVisual.astro` | `HeroIllustration.astro` (hardcoded hex colors, explicitly a placeholder per its own header comment) | Promote `PrecisionSystemVisual.astro` to a production component (new home under `src/components/brand/` or `src/components/sections/`, see §8.6); retire `HeroIllustration.astro` from the homepage Hero only — do not delete the file without checking other call sites |
| Process rail | `ProcessRail.astro` (thin wrapper over `AssemblySpine`) | Not present on homepage | Promote to production, reusing existing `AssemblySpine` locale API unchanged |
| Evaluation ledger | `EvaluationLedger.astro` | Not present | Promote to production largely as-is (cleanest of the five new components per research findings — no hardcoded text, no client JS) |
| Copy data source | `src/data/cc02-final-hero.ts` — isolated, duplicates brand name, own `Record<FinalHeroLocale, …>` shape | `src/data/locales/{zh-tw,en}.ts` (`Dictionary` type via `getDictionary()`) + `siteConfig` (`src/config/site.ts`) | Hero/nav copy must move into a locale-contract-compliant source (§7); `cc02-final-hero.ts` itself is not imported by production code and is not deleted this stage (still referenced by CC-02F's own tests/screenshots) |
| Nav items | 5 prototype-only labels: solutions/products/industries/**engineeringMethod**/**resources** | 6 real routes via `navItems`: solutions/products/industries/about/insights/contact | Production Header uses the real 6-item `navItems` — the prototype's 5-item set was a design-spike label set, not an IA decision, and is not carried forward |
| `<html lang>` / locale routing | Hand-computed ternary, real `getStaticPaths()` per-locale routes (a genuine improvement over CC-02's single-page-with-JS-toggle) | `getHtmlLang()` via `src/utils/i18n.ts`, same per-locale static route pattern | Use `getHtmlLang()`; the per-locale static route pattern is already correct and matches production |
| Animation trigger | `IntersectionObserver`-driven, three-layer reduced-motion defense (tokens.css global + component-local override + JS `matchMedia` check) | Same pattern already used by `DatumOrigin`/`VisionLockFrame` | No change needed — reuse the existing pattern verbatim |
| SEO/indexing | `noindex, nofollow` hardcoded, no `SEOHead`, no `StructuredData` | `SEOHead` + `StructuredData` via `BaseLayout`, indexability gated by Demo Mode (`allowIndexing`) | Homepage keeps its existing `BaseLayout`-driven SEO — no bespoke SEO code in the new Hero component |

### 1.2 What's temporary in the prototype and must not be carried in as-is

- **Duplicated brand name** (`finalNavCopy[locale].logo`) — must resolve to
  `siteConfig.brandNameZh` / `siteConfig.brandNameEn`, per `PRODUCT.md`'s
  "Centralized in `src/config/site.ts`; never hardcoded elsewhere."
- **`href="#" data-proto-noop` placeholder links** — every nav item, logo
  link, and CTA must resolve to a real route.
- **Prototype-only Header nav labels** (`engineeringMethod`, `resources`) —
  not part of the real 6-item IA; dropped, not translated.
- **`ProcessRail.astro`'s inline aria-label ternary** (`locale === 'zh-tw' ?
  '流程階段導覽' : 'Process stages'`) — flagged in the CC-02F handoff as a
  known, small, non-blocking gap. CC-02I fixes it by moving the string into
  the locale contract (§7) rather than carrying the ternary into production.
- **`uid` generated via `Math.random().toString(36)`** in
  `PrecisionSystemVisual.astro` — fine at prototype scale (one instance per
  page); production must confirm the Hero renders the component at most
  once per page before reusing this pattern unchanged, since a second
  instance on the same page is a real (if unlikely) ID-collision risk.

### 1.3 Design tokens: reused vs. new

No new token is introduced by this spec. Every visual value referenced in
§8/§9 already exists in `src/styles/tokens.css` and is used unchanged from
the CC-02F prototype: color (`--color-ink-*`, `--color-paper-*`,
`--color-steel-*`, `--color-copper-*`, `--color-action-primary(-hover)`),
type (`--font-display`, `--font-body`, `--font-mono`, `--fs-*`, `--measure`,
`--measure-zh`), layout (`--container-wide`, `--page-gutter-*`,
`--grid-gutter-*`), spacing (`--space-*`), radius/border
(`--radius-*`, `--border-*`), motion (`--duration-*`, `--ease-standard`),
z-index (`--z-nav`, `--z-mobile-nav`). If implementation discovers a genuine
gap, the ticket must stop and request a token addition through the normal
design-system process — it must not invent a local magic number.

### 1.4 Architecture map

| Layer | Owner (file) | Data source | Rendering boundary | Accessibility responsibility |
|---|---|---|---|---|
| Page | `src/pages/{zh-tw,en}/index.astro` | Locale param (route segment) | Server-rendered (SSG) | Provides `locale`/`path`/`otherLocalePath` to `BaseLayout` |
| Layout | `src/layouts/BaseLayout.astro` | `siteConfig`, `getDictionary` | Server-rendered | Skip link, landmark structure, `<html lang>` |
| Header | `src/components/layout/Header.astro` | `navItems`, `getDictionary`, `siteConfig` | Server-rendered + one `<script>` for mobile drawer | Focus trap, Escape, focus return, `aria-current`, `aria-expanded` |
| Hero (new) | `src/components/sections/Hero.astro` (proposed name — ticket CC-02I-04 confirms) | New Hero locale contract (§7) | Server-rendered, no client JS of its own | Single real `<h1>`, landmark-free (Hero is content inside `<main>`, not its own landmark) |
| Brand Primitives | `src/components/brand/*.astro` | Props only (no data fetching) | Server-rendered SVG + optional `<script>` for `DatumOrigin`/`VisionLockFrame`/`AssemblySpine`-driven pieces | `decorative`/`ariaLabel` contract already established (§8.6) |
| Locale Messages | `src/data/locales/{zh-tw,en}.ts`, `src/utils/i18n.ts` | Static TS objects | Build-time only | N/A (data layer) |
| CTA | `src/components/ui/Button.astro` | Props | Server-rendered | Focus-visible, `aria-busy`/`aria-disabled` |
| Asset | Inline SVG inside `PrecisionSystemVisual.astro` (promoted) | None (procedural/hand-authored SVG) | Server-rendered | `aria-hidden` + external text alternative |
| Motion | Component-local `<script>` + CSS, reusing `tokens.css`'s reduced-motion cascade | N/A | Client, progressive enhancement | Must not gate content visibility on JS execution |
| Responsive | CSS only (`clamp()`, media queries at existing breakpoints) | N/A | CSS | N/A |
| Tests | `tests/e2e/*.spec.ts` | N/A | N/A | Verifies all of the above |

## 2. Final direction (context, not re-decided here)

Variant C — **Engineering Editorial Sheet** — was selected externally
(ChatGPT) during CC-02F, overriding the internal recommendation that had
favored Variant A. Reasoning on record (`CC-02F-final-editorial-hero.md`
§1): Variant A reads too close to a generic corporate site; Variant B
depends on CGI that doesn't exist yet and can't prove product quality at
this stage. One Variant A element — the four-step process rail — was
absorbed into C. This is not re-voted in CC-02I. Per the governing prompt,
CC-02I may only reopen this decision if production reveals it is
literally unbuildable, creates a critical architecture conflict, clearly
violates accessibility, is clearly performance-unacceptable, or is
incompatible with the locale routing system — none of which the current-
state model above found. **No such blocker was found; Variant C proceeds.**

Retained from prototype into production: the 12-column editorial grid
logic, the Datum Origin as literal layout anchor (not a decorative icon),
the Primary/Secondary visual size-and-connection relationship, the
Evaluation Ledger's three-group non-card structure, the four-step Process
Rail using `AssemblySpine`, and the single-narrative animation sequence.

Retired: the prototype's isolated data file, isolated Header, isolated page
shell, 5-item nav label set, and the `Math.random()` `uid` pattern beyond
single-instance use.

Awaiting real material: the Primary/Secondary System Visual currently ships
as hand-authored SVG per CC-02F §9 and stays that way for this stage — see
§8.8 for why real CGI is explicitly out of scope.

## 3. Design intent, made literal

"Engineering Editorial Sheet" translates to the following concrete rules —
not to be treated as a style adjective:

- **Composition logic**: the page reads like an annotated engineering
  drawing, not a marketing hero. The Datum Origin mark is a literal
  coordinate anchor for the layout, not a floating decoration — everything
  else's position is describable relative to it.
- **Information hierarchy**: Eyebrow → H1 → Body → CTA is one uninterrupted
  reading column (columns 1-5 on desktop); the System Visual is a separate,
  simultaneously-visible column, not something the eye reaches only after
  finishing the text.
- **Left/right ratio**: text column occupies roughly 5/12 of the grid width
  (columns 1-5 of 12); the visual system occupies roughly 7/12 (columns
  5-11/12, primary) with a smaller secondary fragment bleeding further
  right (columns 10-13, may exceed the 12-column grid by design).
- **Editorial layout rules**: H1 breaks at a single, spec-fixed point (not
  CSS-determined wrapping); body copy is capped at ~36-42 Chinese
  characters / a matching English measure; no centered text, no
  photo-behind-text treatment.
- **Engineering data visual**: the Evaluation Ledger presents three
  definition-list-style groups (heading + detail), never a card grid, never
  a fabricated number.
- **Technical evidence presentation**: the Process Rail is an
  Assembly-Spine treatment (axis + nodes), never four equal-weight cards —
  reinforcing that this is one connected process, not four independent
  features.
- **Brand primitive usage**: Datum Origin marks the anchor; the System
  Visual's own internal layering (foreground/midground/background per
  CC-02F §9) carries the "precision you can watch" thesis from `DESIGN.md`.
- **Motion rhythm**: one linear narrative (origin → axis → modules align →
  vision lock → rail completes), ~800-1100ms, never looping, never
  re-triggering on scroll re-entry.
- **Header/Hero visual relationship**: Header stays visually quiet (thin
  border, no heavy box language) so the Hero's Datum Origin reads as the
  page's true visual origin, not competing with a second strong mark in the
  Header.
- **Responsive editorial rules**: desktop keeps the two-column simultaneous
  read; tablet collapses to a single dominant column in a fixed order
  (Datum → H1 → Body → CTA → Primary Visual → Ledger → Rail); mobile keeps
  the same order but demands the Primary Visual be substantially visible
  within the first viewport (§8.4).

## 4. Header specification

- **Heights**: Desktop 80px, Tablet 80px (same breakpoint behavior as
  desktop — the existing `960px` nav breakpoint in `Header.astro` is
  reused, not redefined), Mobile 64-68px.
- **Container**: `--container-wide` (1440px), gutters via
  `--page-gutter-{desktop,tablet,mobile}` — same container system the rest
  of the site uses, not a Hero-specific container.
- **Logo composition**: `DatumOrigin` (size ~28px, `decorative` left at
  default `true` since the wordmark beside it already carries the
  accessible name via the logo link's text) placed beside the existing
  `Logo.astro` wordmark, OR `Logo.astro` extended to render its own datum
  mark internally — ticket CC-02I-02 decides between these two integration
  shapes based on which keeps `Logo.astro`'s existing consumers (Footer,
  mobile nav panel) unaffected. Either way, brand name text comes from
  `siteConfig`, never a locally duplicated string.
- **Navigation**: the real 6-item `navItems` (`src/config/nav.ts`), unchanged.
- **Language switcher**: reuse `LanguageSwitcher.astro` unchanged; visually
  restyle only if needed to match CC-02F's "thinner border, no heavy box"
  language, keeping the existing ≥44×44px tap target.
  `LanguageSwitcher.astro`'s existing analytics dispatch is preserved.
- **Primary CTA**: token changes from `--color-accent` to
  `--color-action-primary` / `--color-action-primary-hover`
  (copper-700/800) per CC-02F §5 — this is a token substitution inside the
  existing `Button.astro` call, not a new button implementation. If
  `Button.astro` doesn't yet expose a variant that resolves to these
  tokens, ticket CC-02I-02 adds one rather than hand-rolling a new CTA
  element (§8.6: don't build outside the existing component when it can be
  extended).
- **Sticky behavior**: unchanged — `position: sticky; top: 0` as today.
- **Scroll state / transparent-solid**: **not introduced by this stage.**
  Neither the current production Header nor the CC-02F prototype
  implements a scroll-triggered background change (both are static
  translucency). CC-02I does not add one — it is out of scope, not a silent
  gap. A future stage may propose it separately.
- **Hover**: nav links keep the short Datum-line underline treatment
  (already implemented in production as `border-bottom-color` swap;
  CC-02F's `::after` scaleX animation is an acceptable equivalent — ticket
  decides based on `--duration-ui`/`--ease-standard` token reuse).
- **Focus-visible**: every interactive Header element needs a visible focus
  ring meeting the existing site's focus-visible pattern (see
  `--color-focus` token) — this is not new, just must not regress.
- **Active state**: `aria-current="page"` logic in `Header.astro` is
  unchanged.
- **Mobile menu**: reuse production `Header.astro`'s existing drawer
  implementation (sibling-of-`<header>` DOM position, focus trap, Escape,
  focus return, `document.body.style.overflow = 'hidden'`) — this is
  already correct and already has a documented bug fix behind it
  (`backdrop-filter` containing-block issue, see `Header.astro:66-80`
  comment). Do not reintroduce the prototype's separate drawer
  implementation.
- **ESC / focus trap / body scroll lock**: unchanged, already implemented.
- **Reduced motion**: any new hover/underline animation must respect the
  existing three-layer reduced-motion pattern (§1.3/§9 of this spec).
- **Z-index**: `--z-nav` / `--z-mobile-nav`, unchanged.
- **Touch target**: ≥44×44px on every interactive Header control, including
  the language switcher and mobile menu toggle — matches CC-02F §5's
  explicit requirement and the site's existing baseline.
- **Long string handling**: the English CTA (`Discuss Your Project` per
  `PRODUCT.md`'s two-tier CTA framing, or `dict.nav.ctaPrimary`'s actual
  string) must not wrap or truncate at any supported viewport; verify at
  360px specifically.
- **zh-TW / en differences**: nav label count is the same (6) in both
  locales; only string length differs. No locale-specific layout branching
  is expected — if implementation finds one is needed, it must be recorded
  as a spec gap, not silently patched.
- **No-JavaScript baseline**: with `<script>` disabled, the mobile toggle
  button must still be present and the nav links usable (no menu means no
  navigation is not acceptable) — production `Header.astro` already
  satisfies this by rendering `mobile-nav__list` real links inside the
  (hidden-by-CSS-attribute, not JS-only) drawer markup; ticket CC-02I-02
  verifies this baseline is not broken by the visual changes.

## 5. Hero specification

- **Min/max height**: no hardcoded fixed height (per CC-02F's own tablet
  note: "verified via screenshot, not assumed"). Desktop target ~760-820px
  visible height at 1440×900, driven by content + `--section-major`-scale
  vertical rhythm, not a magic-number `min-height`.
- **Desktop grid ratio**: 12-column grid; Datum Origin at column 1; H1
  spans columns 1-9 (max 3 lines); Copy spans columns 1-5 (matching the
  verified implementation ratio, not the spec's literal "1-6" — CC-02F's
  own code comment records this correction and CC-02I inherits the
  verified value); Primary Visual spans columns 5-11, may bleed 24-48px
  past the grid edge; Secondary Visual spans columns 10-13 (i.e. is allowed
  to extend past the 12-column grid); Evaluation Ledger spans columns 1-5
  below the Copy; Process Rail spans the full Hero width at the bottom.
- **Tablet reflow**: single dominant column, fixed order Datum Origin → H1
  → Body → CTA → Primary Visual → Evaluation Ledger → Process Rail.
  Secondary Visual may merge into or sit beside Primary Visual depending on
  available width — this must be verified against a real 768×1024
  screenshot during implementation, not assumed from the desktop ratio.
- **Mobile order**: Datum Origin, H1, Eyebrow, Body, CTA, Primary Visual,
  then (below the fold) Evaluation Ledger, then Process Rail.
  (Note: CC-02F §8 lists Eyebrow after H1 in its "content order" prose but
  the Eyebrow is visually above the H1 in every screenshot and in
  `FinalEditorialHero.astro`'s DOM order — the DOM/visual order, Eyebrow
  first, is authoritative; the prose order in the older spec is not.)
- **H1 max width**: Chinese visual width target ~850-980px on desktop;
  `clamp(2.35rem, 10.5vw, 3rem)` / `line-height: 1.04` on mobile (value
  verified via CC-02F screenshot, reused as the production starting point
  — implementation re-verifies at 360/390px rather than trusting it
  blindly, matching CC-02F's own stated caveat).
- **H1 line control**: desktop max 3 lines, mobile max 4 lines. The single
  explicit line break (`\n` between "組裝，" and "校準…" in zh-TW, between
  "assembly" and "into a production-ready system." in en) is spec-fixed
  content, not CSS-determined wrapping — same `white-space: pre-line`
  pattern as the prototype. The final word/character must never be isolated
  alone on its own line at any supported viewport; "組裝" (or its English
  equivalent) must never be split across a line break.
- **Eyebrow**: single line, small-caps or mono treatment consistent with
  existing `.hero__eyebrow`-equivalent styling elsewhere on the site.
- **Supporting copy**: max ~36-42 Chinese characters / matching English
  measure (`--measure-zh` / `--measure` tokens), max 5-6 lines on mobile
  (tighter than the retired `variant-c.astro` prototype).
- **Primary/Secondary CTA**: reuse `Button.astro` (`primary`/`secondary`
  variants), side-by-side at ≥390px if it fits, stacked
  primary-then-secondary at 360px if crowded, minimum 44px tap height,
  text never shrunk to solve a spacing problem.
- **Engineering Sheet primary visual**: `PrecisionSystemVisual.astro`,
  promoted from prototype largely unchanged (§8.8 details the asset
  boundary).
- **Brand Primitives used**: `DatumOrigin` (layout anchor),
  `AssemblySpine` (via `ProcessRail`) — `ToleranceBand`, `ProcessStamp`,
  `CutawayWindow` are **not** used by this Hero; do not add them
  speculatively (§8.6 makes this explicit).
- **Real content vs. demo placeholder boundary**: Eyebrow/H1/Body/CTA
  copy is final, spec-locked text (§4 of CC-02F spec, reproduced in §7
  below) — not demo/placeholder data requiring an `isDemoData` label. The
  Evaluation Ledger's three groups are real descriptions of the (fictional)
  company's process, also not numeric demo data requiring a badge. Nothing
  in the Hero needs a `demoData: true` disclaimer per `PRODUCT.md`'s
  definition, because nothing in it is a fabricated metric — this was the
  entire point of CC-02F §12's content-integrity rule.
- **Foreground/midground/background**: per CC-02F §9 — foreground: primary
  module + Copper alignment nodes + metal-edge highlights; midground:
  Assembly Spine + Vision Frame + connectors; background: hatching/section
  lines, tolerance bands, faded axes.
- **Crop rules**: Primary Visual is a cutaway/clipped shape (not a
  rectangular card) on desktop; on mobile, a 4:5 or near-1:1 crop, not a
  shrunk desktop image.
- **Overflow**: no horizontal scroll at any supported viewport, including
  where the Primary/Secondary Visual is allowed to bleed past the grid —
  the bleed must stay within the viewport, not cause `scrollWidth >
  clientWidth`.
- **360px viewport**: supported, verified (matches `tests/e2e/fixtures.ts`
  `VIEWPORTS` — 360×800 is one of the seven standard breakpoints already in
  use, not a new one CC-02I invents).
- **320px viewport**: **not a supported target.** The project's existing
  breakpoint matrix (`tests/e2e/fixtures.ts`) starts at 360px; CC-02I does
  not add 320px support, consistent with every prior CC-stage.
- **English long strings**: verify the longer English H1/Body/CTA strings
  (visibly longer than zh-TW in §7) do not overflow or force unwanted
  wrapping at 360px specifically.
- **Fallback with no material**: none needed — the Primary/Secondary Visual
  is hand-authored SVG, not a photo/CGI asset with a missing-asset case
  (§8.8).
- **Motion start timing**: triggered on Hero entering the viewport via
  `IntersectionObserver` (same pattern as `VisionLockFrame`/CC-02F), not on
  page load — this matters because the Hero is above the fold, so in
  practice it fires immediately on first paint for most viewports, but the
  implementation must not assume "above the fold" and skip the
  IntersectionObserver check.
- **Reduced motion**: full three-layer defense (§1.3), end state rendered
  immediately, stable within 100ms.
- **First load / CLS risk**: Header/Hero must not shift layout once fonts
  or the SVG visual finish loading — `font-display: swap` is already global
  policy; the SVG is inline (not an `<img>` with intrinsic-size-driven
  reflow), so CLS risk is low by construction, but implementation must
  verify with a real Lighthouse or Playwright CLS check before calling this
  ticket done (§8.11).

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
- **Shadow**: `--shadow-sm/md/lg` (drawer/dropdown-elevation only — the Hero
  itself uses no shadow, per `DESIGN.md`'s "never a floating shadow-heavy
  card" rule).
- **Motion**: `--duration-micro/ui/section/assembly`, `--ease-standard`.
- **Z-index**: `--z-nav`, `--z-mobile-nav`.
- **Breakpoints**: 360/390/768/1024/1280/1440/1920px (matches
  `tests/e2e/fixtures.ts` `VIEWPORTS` exactly — implementation must not
  introduce a different breakpoint set for the Hero alone).

If a ticket's implementer believes a genuinely new token is required, the
ticket must stop and flag it rather than hardcode a value — see §12
Standards Review checklist.

## 7. Locale contract

The Hero and Header's new locale-varying strings must live in
`src/data/locales/{zh-tw,en}.ts` under a new `hero` key (and additions to
the existing `nav` key), following the existing `Dictionary`/`DeepString`
pattern — not in a new isolated file like `cc02-final-hero.ts`.

Proposed dictionary additions (exact final key names are ticket
CC-02I-01's responsibility; this is the content contract, not the schema):

```ts
// src/data/locales/zh-tw.ts — additions
hero: {
  eyebrow: '精密自動化整合',
  headline: '把定位、檢測與組裝，\n校準成可導入的生產流程。',
  body: '從工件、節拍到現場限制，鋒岳整合精密運動、視覺定位與模組化工作站，\n建立可評估、可配置、可驗證的自動化方案。',
  ctaPrimary: '開始專案評估',
  ctaSecondary: '查看導入條件',
  visualAlt: '精密運動模組、視覺定位頭與組裝工作站沿模組組裝軸連接的系統示意圖',
  secondaryVisualAlt: '視覺定位頭近拍與對齊節點細節',
  ledger: [
    { heading: '需求輸入', detail: '工件圖、目標節拍、現場限制' },
    { heading: '評估範圍', detail: '定位、檢測、組裝與站點整合' },
    { heading: '交付輸出', detail: '系統架構、模組配置、驗收條件' },
  ],
  processRail: {
    steps: ['需求輸入', '方案評估', '模組配置', '驗證條件'],
    railLabel: '流程階段導覽',
    stateLabels: { unconnected: '待處理', aligned: '準備中', connected: '進行中' },
  },
},
```

(English mirrors the structure with CC-02F's verbatim English copy — see
§0's cross-reference to `cc02-final-hero.ts` for exact strings, reproduced
in full in ticket CC-02I-01.)

- **zh-TW / en message keys**: as above, under `hero.*`.
- **Header navigation key**: unchanged — reuses existing `nav.solutions`,
  `nav.products`, `nav.industries`, `nav.about`, `nav.insights`,
  `nav.contact`, `nav.ctaPrimary`.
- **CTA key**: `hero.ctaPrimary`/`hero.ctaSecondary` (Hero-specific,
  distinct from `nav.ctaPrimary` since the Hero's primary CTA copy — "開始
  專案評估" / "Start a Project Assessment" — is deliberately different text
  from the Header's "提交專案需求" / existing `cta.primary`).
- **Hero Eyebrow / H1 / Supporting Copy**: `hero.eyebrow`, `hero.headline`,
  `hero.body`.
- **Engineering labels**: `hero.ledger[].heading/detail`,
  `hero.processRail.steps`.
- **ARIA labels**: `hero.visualAlt`, `hero.secondaryVisualAlt`,
  `hero.processRail.railLabel` — this is the fix for the CC-02F prototype's
  inline ternary (§1.2).
- **Mobile menu**: unchanged, existing `nav.menuOpen`/`nav.menuClose`.
- **Language switcher**: unchanged, existing `LanguageSwitcher.astro`
  strings.

**Brand Primitives must not receive ad hoc hardcoded locale/messages
props.** `DatumOrigin`, `AssemblySpine`, and `VisionLockFrame` already
expose the minimal `ariaLabel`/`stateLabels`/`statusLabels` API established
in CC-02-02 — the Hero passes dictionary values into these existing props;
it does not invent a new prop shape or a new "locale" prop on the
primitives themselves (CONTEXT.md's "Locale Message" glossary entry and the
CC-01 post-hoc review's stated principle: expand primitive APIs only when a
real usage needs it, and only by the minimum needed). `ToleranceBand`,
`ProcessStamp`, `CutawayWindow` are out of scope for this Hero (§5) and
receive no API changes under this stage.

## 8. Component contracts

### 8.1 `Hero.astro` (new — proposed path `src/components/sections/Hero.astro`)

- **Responsibility**: render the homepage Hero section (Datum Origin, H1,
  Eyebrow, Body, CTAs, Primary/Secondary Visual, Evaluation Ledger, Process
  Rail) from locale-resolved data.
- **Props**: `{ locale: Locale }` — resolves its own copy via
  `getDictionary(locale).hero`, mirroring how `Header.astro` resolves
  `dict.nav`. No prop drilling of individual strings from the page.
- **Required/Optional**: `locale` required, no optional props at this
  stage (no variant switch — there is exactly one Hero design now).
- **Locale data**: `getDictionary(locale).hero` (§7).
- **ARIA**: no additional landmark (Hero lives inside `BaseLayout`'s
  `<main>`); exactly one `<h1>`.
- **State**: none (fully static markup; the only stateful behavior is the
  child `PrecisionSystemVisual`'s animation, encapsulated there).
- **Events**: CTA clicks fire the existing `trackEvent="cta_click"`
  analytics pattern via `Button.astro`, unchanged.
- **Slots**: none — content is fully data-driven, not slot-composed (matches
  the rest of the site's component style; no ticket should introduce slots
  here without cause).
- **Fallback**: none needed (§5's "no material" note).
- **Reduced motion**: delegates entirely to `PrecisionSystemVisual`'s
  existing handling; `Hero.astro` itself has no animation of its own beyond
  what its children already implement.
- **Server/client rendering**: fully server-rendered; no client
  JavaScript in `Hero.astro` itself.
- **JavaScript allowed?**: No, for this component. Its children
  (`PrecisionSystemVisual`, `ProcessRail` → `AssemblySpine`) already carry
  their own minimal, justified `<script>` blocks — `Hero.astro` does not
  add another.
- **Test responsibility**: H1 line-break correctness, grid column
  assertions (via computed style or DOM order at each breakpoint), CTA tap
  targets, ledger content-integrity (no fabricated numbers), overall page
  H1 uniqueness.

### 8.2 `PrecisionSystemVisual.astro` (promoted from `src/components/prototypes/cc02-final/`)

- **New home**: `src/components/brand/PrecisionSystemVisual.astro` (joins
  the six existing Brand Primitives — it is visually and conceptually one,
  even though CC-01 didn't originally name a seventh) OR
  `src/components/sections/` if the team judges it too Hero-specific to be
  a general primitive. Ticket CC-02I-05 makes this call explicitly and
  records the reasoning — this spec does not force a specific directory,
  only forbids leaving it under `prototypes/`.
- **Responsibility**: render the primary + secondary system visual (layered
  SVG) with its one-time align/lock/complete animation.
- **Props**: `{ alt: string; secondaryAlt?: string; animated?: boolean }` —
  same shape as the prototype version, `alt` values sourced from
  `hero.visualAlt`/`hero.secondaryVisualAlt`.
- **Required/Optional**: `alt` required (text alternative is not optional
  per CC-02F §9's "provide an understandable text alternative").
- **Locale data**: none directly — receives resolved strings via props,
  same pattern as `DatumOrigin`.
- **ARIA**: SVG marked `aria-hidden="true"`; the required text alternative
  renders as visually-hidden text adjacent to the SVG (not solely an `alt`
  attribute on a non-existent `<img>`, since this is inline SVG).
- **State**: `is-aligning` → `is-settled` CSS classes, driven by
  IntersectionObserver.
- **Event**: none dispatched; internal only.
- **Slots**: none.
- **Fallback**: none (§5).
- **Reduced motion**: three-layer defense per §1.3, unchanged from
  prototype.
- **Server/client rendering**: SVG server-rendered; one `<script>` for the
  IntersectionObserver hookup, with a `matchMedia` reduced-motion check and
  a no-`IntersectionObserver`-available fallback (already implemented in
  the prototype — reused, not rewritten).
- **JavaScript allowed?**: Yes, minimal, already justified and audited in
  CC-02F.
- **Test responsibility**: reduced-motion end-state screenshot/class
  assertion, absence of forbidden visual language (no crosshair reading, no
  "NO MEDIA" text), single-instance `uid` uniqueness if the Hero ever
  renders it twice on one page (§1.2).

### 8.3 `ProcessRail.astro` (promoted from `src/components/prototypes/cc02-final/`)

- **New home**: `src/components/sections/ProcessRail.astro` (thin wrapper,
  stays a wrapper — not merged into `AssemblySpine.astro` itself).
- **Responsibility**: render the four-step process rail as an `AssemblySpine`
  usage with Hero-specific labels.
- **Props**: `{ steps: string[]; railLabel: string; stateLabels: {
  unconnected: string; aligned: string; connected: string } }` — all
  locale-resolved, passed straight through to `AssemblySpine`.
- **Required/Optional**: all required (no default English fallback inside
  the component — the CC-02F ternary bug this fixes, §1.2).
- **Locale data**: none directly (receives resolved props).
- **ARIA**: `tabindex="0"` + `aria-label={railLabel}` on the horizontally-
  scrollable mobile container.
- **State**: delegates to `AssemblySpine`'s existing node-state model.
- **Event**: none beyond what `AssemblySpine` already implements
  (`interactive` click-to-cycle, if enabled — Hero usage keeps it
  non-interactive/static per CC-02F §11's "current step may use Copper"
  static framing, not a click-driven cycle).
- **Slots**: none.
- **Fallback**: none.
- **Reduced motion**: delegates to `AssemblySpine`.
- **Server/client rendering**: server-rendered; no own script.
- **JavaScript allowed?**: No, for this wrapper (all JS lives in
  `AssemblySpine`).
- **Test responsibility**: keyboard focus + `aria-label` presence, no
  auto-scroll, correct step-label text per locale.

### 8.4 `EvaluationLedger.astro` (promoted from `src/components/prototypes/cc02-final/`)

- **New home**: `src/components/sections/EvaluationLedger.astro`.
- **Responsibility**: render the three-group definition-list-style ledger.
- **Props**: `{ groups: Array<{ heading: string; detail: string }> }`.
- **Required/Optional**: `groups` required, exactly 3 entries expected (not
  enforced by a type-level tuple unless the ticket judges that worth the
  added rigidity — minimum viable typing is `Array<{...}>`).
- **Locale data**: none directly.
- **ARIA**: semantic `<dl>`/`<dt>`/`<dd>` (already correct in the
  prototype).
- **State**: none.
- **Event**: none.
- **Slots**: none.
- **Fallback**: none.
- **Reduced motion**: N/A (no animation in this component).
- **Server/client rendering**: fully server-rendered, zero JS.
- **JavaScript allowed?**: No.
- **Test responsibility**: content-integrity check (no fabricated numeric
  claims), exactly 3 groups rendered.

### 8.5 `Header.astro` (modified in place, not replaced)

- Contract is unchanged from today's production component (§4 lists the
  specific visual/token deltas). Props (`locale`, `path`,
  `otherLocalePath`) stay the same. No new required props are introduced.
- The only structural addition under consideration is the Datum Origin
  mark beside the Logo (§4) — ticket CC-02I-02 decides whether that lives
  inside `Logo.astro` or is composed alongside it in `Header.astro`, and
  must not change `Logo.astro`'s existing props contract for its other
  consumers (Footer, mobile nav panel) without updating those call sites
  too.

### 8.6 Constraints applying to all new components

- No unnecessary React Island — none of the components above need one;
  every interactive behavior (mobile drawer, IntersectionObserver
  animation, focus trap) is already proven achievable with vanilla
  Astro + `<script>`, matching `PRODUCT.md`'s "No React/Vue/Svelte island
  framework is needed anywhere in this build."
  If a ticket implementer believes one is genuinely needed, that is a stop-
  and-flag condition, not a silent addition.
- No speculative Brand Primitive API expansion — `ToleranceBand`,
  `ProcessStamp`, `CutawayWindow` get zero changes under this stage (§5,
  §7).

## 9. Asset plan

- **Usable existing SVG**: none of the current `HeroIllustration.astro`
  content is reused (it's explicitly a stand-in for a future Higgsfield
  render, hardcoded hex colors, not Token-driven — retired from the
  homepage Hero specifically, per §1.1).
- **CSS/SVG procedurally generated**: `PrecisionSystemVisual.astro`'s
  entire visual is hand-authored inline SVG using gradients/masks/
  clip-path per CC-02F §9 — this is the asset for this stage, not a
  placeholder awaiting replacement.
- **Requires real FORGEON material**: none, for this stage. The Hero's
  core composition does not depend on external material to be complete
  (per the governing prompt's own principle, §8.8 of the assignment: "Header/
  Hero 的核心構圖不得依賴尚不存在的外部素材才能成立" — already satisfied by
  CC-02F's SVG-only approach).
- **Temporary placeholder use**: none — there is no placeholder state in
  this Hero; the SVG system visual is the real, final asset for this
  round.
- **Prohibited fake data**: no fabricated precision/cycle-time/capacity
  numbers anywhere (§12 of CC-02F spec, carried forward unchanged as a hard
  constraint on the Evaluation Ledger and any future content near the
  Hero).
- **Higgsfield**: not used, not needed, not planned for this stage.
  `docs/DATUM_ASSET_PLAN_CC02F.md` remains a future-only plan document; no
  generation request happens as part of CC-02I.
- **AI-generated material**: none.
- **Must wait for customer photos**: no — this Hero design does not depend
  on photography at all; it is a fully vector/procedural composition by
  design (this was one of the deciding factors against Variant B during
  the CC-02F external review).

## 10. Motion plan

- **Elements that animate**: `DatumOrigin` (axis draw + point light-up),
  `PrecisionSystemVisual` (module alignment, vision lock), `AssemblySpine`
  (via `ProcessRail`, if its own reveal animation is enabled — ticket
  decides based on whether it should play as part of the Hero's single
  narrative or render already-settled).
- **Motion purpose**: reinforce the "precision is a process you can watch"
  thesis (`DESIGN.md` THESIS) — a one-time demonstration of the assembly
  process the copy describes, not decoration.
- **Duration**: total narrative ~800-1100ms (`--duration-section` /
  `--duration-ui` combinations, per existing component internals — no new
  duration token).
- **Easing**: `--ease-standard` throughout, no new easing curve.
- **Delay**: staggered per CC-02F §13's five-step sequence (origin → axis →
  modules align → vision lock → rail completes); exact per-step delays are
  implementation detail already proven in the prototype's CSS
  `animation-delay` values.
- **Scroll trigger**: `IntersectionObserver`, fires once, does not
  re-trigger on repeated scroll into view.
- **Hover motion**: Header nav underline only (§4); CTA hover uses
  `Button.astro`'s existing `translateY(-1.5px)` + color-deepen pattern,
  unchanged.
- **Mobile degradation**: same animation plays on mobile (no separate
  reduced set) — the CC-02F prototype did not define a mobile-specific
  motion reduction beyond the standard reduced-motion handling, and this
  spec does not introduce one.
- **Reduced motion**: three-layer defense (§1.3) is mandatory for every
  animated element listed above.
- **First-screen load burden**: motion must not delay H1/Body/CTA
  interactivity or paint (CC-02F §13's explicit requirement, carried
  forward).
- **Prohibited**: looping animation anywhere in the Hero/Header, purely
  decorative animation with non-trivial performance cost (parallax,
  mouse-follow, particles, scroll-hijacking, heavy blur) — same prohibited
  list as CC-02F §13, unchanged.

## 11. Accessibility

- **Landmarks**: Hero has no bespoke landmark — it's plain content inside
  `BaseLayout`'s `<main id="main-content">`.
- **H1**: exactly one per page, Hero's headline is that H1.
- **Navigation label**: unchanged existing pattern (`aria-label={locale ===
  'zh-tw' ? '主要導覽' : 'Main navigation'}`).
- **Focus order**: Datum Origin (if focusable — it should not be, it's
  decorative) is skipped; logical DOM order is Skip Link → Header (logo,
  nav, language switch, CTA, mobile toggle) → Hero (CTAs are the only
  focusable Hero elements besides the Process Rail's scroll container) →
  rest of page.
- **Focus-visible**: every interactive element (Header nav links, CTAs,
  language switcher, mobile toggle, Process Rail scroll container) shows a
  visible focus ring using the existing `--color-focus` token treatment.
- **Skip link**: unchanged, existing `BaseLayout` skip-to-`#main-content`
  link.
- **Mobile Menu pattern**: unchanged — existing disclosure-style drawer
  (not a native `<dialog>`), already correctly implemented with focus trap.
- **ESC**: closes mobile drawer, unchanged behavior.
- **Focus return**: to the toggle button on drawer close, unchanged.
- **Contrast**: every text/background pairing in the new Hero must reuse
  already-audited token pairings from `docs/CONTRAST_AUDIT.md` — no new
  pairing is introduced without a contrast check (particularly relevant for
  Copper-on-Paper usages given the documented thin margin on
  `--color-copper-600`).
- **Touch target**: ≥44×44px, every interactive Hero/Header element.
- **Screen reader text**: `PrecisionSystemVisual`'s text alternative (§8.2),
  `ProcessRail`'s `aria-label` (§8.3).
- **Reduced motion**: §1.3/§10.
- **Keyboard**: full Header + Hero operability without a mouse, including
  the Process Rail's scrollable container.
- **200% zoom**: Hero and Header must reflow without content loss or
  overlap at 200% browser zoom — verified manually or via Playwright zoom
  emulation during CC-02I-07.
- **320px reflow**: not a supported target (§5) — the site's floor is
  360px; this is an explicit, not accidental, scope boundary.
- **Language attribute**: `<html lang>` via `getHtmlLang()`, unchanged
  mechanism, now also correctly driving the Hero (which the prototype
  didn't use — §1's core "must adopt production i18n API" finding).
- **CTA accessible name**: both Primary and Secondary CTA have their full
  visible text as their accessible name (via `Button.astro`, already
  correct).

## 12. Performance budget

- **Hero initial JS**: the only JS shipped by the Hero subtree is
  `PrecisionSystemVisual`'s existing IntersectionObserver script
  (already-measured, already-minimal in the prototype) — no new client
  bundle, no framework runtime.
- **SVG size**: `PrecisionSystemVisual`'s inline SVG must not regress
  meaningfully from its CC-02F prototype size — implementer records actual
  byte size in the ticket's completion evidence.
- **Image size**: N/A — no raster image in the Hero (§9).
- **Font**: no new font weight or family introduced; continues to rely on
  the already-preloaded Noto Sans TC 400 + existing `font-display: swap`
  policy.
- **LCP element**: the Hero H1 (text) is expected to remain the LCP
  element, as on most text-forward hero designs — implementer verifies
  this is still true after the redesign (a large inline SVG could
  theoretically become the LCP candidate instead, which would need
  separate budget scrutiny) and records the actual LCP element in
  completion evidence.
- **CLS**: 0 layout shift attributable to the Hero/Header change,
  verified via Playwright or Lighthouse (§5's CLS note).
- **Animation thread**: `transform`/`opacity`/`stroke` only — no
  layout-triggering property is animated (CC-02F §9/§13's existing
  constraint, unchanged).
- **Non-essential client script**: none added beyond what's already
  justified in §8.
- **Lazy/eager loading**: the Hero is above the fold — nothing in it is
  lazy-loaded; this is consistent with existing site behavior for
  above-fold content.
- **Preload**: no new preload directive needed (no new font, no LCP image).
- **Mobile network**: total added payload (HTML + inline SVG + the one
  script) must stay small enough not to regress the site's existing mobile
  Lighthouic performance baseline — implementer runs a before/after
  Lighthouse mobile pass and records both scores in ticket CC-02I-08's
  completion evidence.

## 13. SEO

- **Unique H1**: Hero's headline is the page's one and only `<h1>`.
- **H1 semantics**: matches the page's actual offering (positioning +
  inspection + assembly automation), not a generic tagline — this is a
  content improvement over the current "精準驅動，更有效率的生產流程。"
  tagline-as-H1 pattern, since the new H1 is more specific per CC-02F's
  copy rationale.
- **First-viewport copy vs. metadata consistency**: `SEOHead`'s
  title/description (already set per-page in `BaseLayout` props) should be
  reviewed for consistency with the new H1/Body once implemented — not
  necessarily rewritten, but checked for contradiction.
- **Internal Preview noindex**: unaffected — this stage doesn't touch
  `/internal-preview/` routes.
- **Production homepage indexability**: unaffected — continues to follow
  existing Demo Mode gating (`allowIndexing`) via `BaseLayout`; the Hero
  redesign does not change this gate's logic.
- **zh-TW/en hreflang**: unaffected — existing `switchLocalePath`/
  `getHtmlLang` mechanism, now correctly driving the Hero too.
- **CTA link**: both Hero CTAs resolve to real `/{locale}/contact/` routes
  with the existing `?intent=` query param pattern (`project` /
  `technical-advice`), matching `Header.astro`'s existing CTA convention.
- **Logo link**: resolves to `/{locale}/`, unchanged.
- **Navigation link**: unchanged, real routes via `navItems`.

## 14. Browser/viewport matrix

- Chromium, Firefox, WebKit (matches existing Playwright project
  configuration — implementer confirms current `playwright.config.ts`
  project list rather than assuming all three are already configured, and
  flags a gap if e.g. only Chromium currently runs in CI).
- Desktop: 1440px, 1280px.
- Tablet: 1024px, 768px.
- Mobile: 430px is not in the existing fixture set — matrix uses the
  project's actual seven breakpoints instead: 390px, 360px (mobile),
  768px, 1024px (tablet), 1280px, 1440px, 1920px (desktop). 320px:
  explicitly not supported (§5, §11).

## 15. Acceptance criteria

**Must (blocking):**

- A first-time visitor can state, without scrolling, that this is an
  industrial automation company doing positioning + inspection + assembly
  as one system, with a clear next step (5-second comprehension goal,
  carried from CC-02F §3).
- Header and Hero are visibly one brand system (shared Datum/Copper/Steel
  language), not a template-feeling mismatch between old Header and new
  Hero.
- No fabricated precision/cycle-time/capacity/success numbers anywhere in
  the shipped Hero.
- zh-TW and en routes both pass every check in this list independently.
- No horizontal overflow at 360px (or any of the seven standard
  breakpoints).
- Full keyboard operability: Header nav, mobile drawer (open/close/focus
  trap/Escape/focus return), both Hero CTAs, Process Rail scroll container.
- Reduced motion renders the fully-settled end state with no flash,
  verified via Playwright `reducedMotion: 'reduce'` context (matching
  existing `cc02f-final-hero.spec.ts` methodology).
- Zero Critical/Serious axe violations, both locales, desktop + mobile
  (matching the project's existing axe threshold convention — not a
  stricter zero-everything bar).
- Zero layout shift attributable to the Hero.
- `pnpm build` succeeds and produces the expected page count; `pnpm
  check:h1`, `pnpm check:links`, `pnpm check:locale-routes` all pass.
- The other pages of the site are unaffected — full `responsive-
  overflow.spec.ts` and `axe.spec.ts` suites still pass across all 14 page
  types, not just home.

**Should (strongly expected, not individually blocking if one slips with a
documented reason):**

- Primary System Visual is substantially visible (30-40%+) within the
  first mobile viewport without scrolling.
- LCP element remains the H1 text (or, if it becomes the SVG, this is
  called out and separately budget-checked rather than silently accepted).
- Mobile Lighthouse performance score does not regress versus the
  pre-CC-02I baseline.

**Portfolio-grade (aspirational, evaluated qualitatively in the Impeccable-
style review, not a pass/fail gate):**

- At least one first-viewport composition memorable enough to serve as the
  agency's own portfolio representative image.
- Does not read as a generic B2B/SaaS template at a glance.

## 16. Explicit non-goals for CC-02I

- No copy/content changes anywhere outside the Header/Hero (homepage
  sections below the Hero, other pages, translations) — scope is Header +
  Hero only.
- No new Brand Primitive component.
- No change to `ToleranceBand`/`ProcessStamp`/`CutawayWindow`.
- No scroll-triggered Header transparency/solid state (§4).
- No 320px support (§5, §11, §14).
- No real photography/CGI, no Higgsfield (§9).
- No change to Footer, Contact, or any non-Header/Hero page section.
- No production integration happens as part of *this document* — this
  document is the spec; production integration happens only after the
  Stage Gate unlocks `CC-02I` and each ticket below is claimed and
  completed individually.
