# Precision Datum System — Decision Log

Append-only log of decisions made during the CC-00 → CC-10 redesign. Each entry:
stage, decision, reasoning, alternatives considered where relevant.

## CC-00 — Baseline, clean install, naming unification

**Date:** 2026-08-05

**Git baseline.** Repo state before this stage: working tree clean for
`side_project/頁構所/demo-1/` except the two new redesign spec docs under
`docs/redesign/` (untracked, pre-existing from the prior conversation turn — these
are the instruction inputs for this pass, not stage output). No uncommitted work was
at risk of being overwritten. Prior history already has 12 commits from the initial
build and the P0/P1 remediation pass (baseline `cb23949` → `40d8c5a`). This stage
adds on top rather than resetting.

**Naming audit.** Searched the full project (excluding `node_modules`, `dist`,
`docs/redesign/` — the audit document itself intentionally discusses the naming risk
in prose) for `岳峰` (the incorrect name flagged in the audit report). Zero
occurrences in source, config, or content. The audit report's warning was about risk
in its own drafting process, not an actual defect in the codebase — the initial
build (see prior `SKILL_USAGE_LOG.md`) already used `鋒岳自動化` / `FORGEON
AUTOMATION` consistently throughout. No rename was necessary.

**Brand centralization check.** `src/config/site.ts` already holds
`siteConfig.brandNameZh` / `siteConfig.brandNameEn` as the single source for
brand-name-as-data (nav logo, footer, structured data, meta defaults). The ~20
files with the literal strings `鋒岳自動化` / `FORGEON AUTOMATION` found by grep are
page-level SEO copy (meta titles/descriptions), alt text, and body prose that
*mentions* the brand — not structural duplication of a config value. This is
expected: prose repeats the brand name the way any website's copy does; it is not
the kind of hardcoding the task book's "不在元件硬編碼品牌" rule is aimed at (that
rule targets components pulling brand name as a variable, which they already do via
`siteConfig`). No change made here; flagging so this isn't re-investigated in a
later stage.

**Clean install verification.** `node_modules`, `.astro`, and `dist` were removed
and rebuilt from scratch against the committed `pnpm-lock.yaml`:

- `pnpm install --frozen-lockfile` — 401 packages, resolved entirely from lockfile,
  no re-resolution needed.
- `pnpm check` (`astro check`) — 78 files, 0 errors, 0 warnings, 9 informational
  hints (all the same known `is:inline` script-processing hint on
  `define:vars` scripts in product/solution detail pages — cosmetic, not an error).
- `pnpm build` — 50 static pages built in ~3.3s, 0 errors.
- `pnpm check:h1` — 50 HTML files scanned, 2 redirect pages excluded, 48/48 content
  pages pass (exactly one H1 each).
- `pnpm check:links` — 1,951 internal links checked, 0 broken.
- `pnpm check:locale-routes` — 141 hreflang links checked across 50 pages, 0 broken;
  insights slug parity confirmed 2/2 across both locales.

**Secrets hygiene.** `.gitignore` already excludes `.env`, `.env.production`,
`node_modules/`, `dist/`, `.astro/`, and test-artifact directories
(`playwright-report/`, `test-results/`, `lighthouse-reports/`). `git ls-files`
confirms no `.env` or credential-shaped file has ever been committed under
`demo-1/`.

**Baseline tag.** Created `baseline/pre-datum-redesign` at the commit that adds
this CC-00 output, per the task book's instruction to establish a recoverable
baseline before CC-01 begins touching the design system.

**Outcome:** No functional changes to site code this stage. Three planning docs
added (`DATUM_REDESIGN_PLAN.md`, this file, `DATUM_QA.md`). Ready for CC-01.

## CC-01 — Precision Datum Design System

**Date:** 2026-08-05

**Color palette: 5 of the spec's 11 literal values needed correction.**
The spec's own proposed hex values (§4/§19) came with an explicit
instruction to verify before finalizing. Running the same WCAG
relative-luminance calculator this project already used in the P0.3
remediation pass surfaced real failures: `--color-steel-500` as light-bg
text (2.86:1, needs 4.5:1), `--color-steel-200` as light-bg border (1.38:1,
needs 3:1), `--color-copper-600` on `--color-paper-100` (4.19:1) and on
`--color-ink-950` (3.72:1), and `--color-copper-500` as light-bg body text
(3.32:1). Full numbers in `docs/CONTRAST_AUDIT.md`. Fix approach: same
precedent as the P0.3 pass — deepen within the same hue family rather than
introduce a new accent. Added `--color-steel-700` (muted text, light bg),
`--color-steel-600` (technical/border lines, light bg), `--color-copper-700`
(deeper copper for `--color-paper-100` and other higher-margin needs). The
spec's original values are kept unchanged for the roles where they already
passed (steel-500/steel-200 on dark backgrounds only, copper-600 as the
primary light-bg CTA/text color, copper-500 as light-bg non-text UI and
dark-bg accent text). Result: 24/24 final pairings pass WCAG AA. One token
(`--color-copper-600` at 4.61:1) has a real but thin margin above the 4.5:1
floor — recorded as a hard constraint below.

**Font acquisition: real self-hosted WOFF2, not system fallback.** Unlike
the P1.2 decision in the earlier remediation pass (which found no network
access and honestly fell back to system fonts), this sandbox's npm
registry access was re-verified working (`npm view @fontsource/noto-sans-tc
version` succeeded) and the three spec-named fonts were installed via
`@fontsource/noto-sans-tc` / `@fontsource/space-grotesk` /
`@fontsource/ibm-plex-mono` (all SIL OFL 1.1). Only the actually-used
weights (400/500/600/700 Noto Sans TC, 500/600/700 Space Grotesk,
400/500/600 IBM Plex Mono — 10 total, not the full weight sets each
package ships) were copied to `public/fonts/` and declared via hand-written
`@font-face` rules with `font-display: swap`, rather than importing
Fontsource's own CSS (which would pull every weight). Only Noto Sans TC 400
is preloaded (the actual zh-tw first-paint font for body+H1 via the
`:lang(zh)` override); Space Grotesk/IBM Plex Mono are not preloaded since
neither is the LCP element on any current page. Full detail in
`docs/ASSET_LICENSES.md`.

**Font-family cascade order is Chinese-first for CJK content, not
Latin-first.** `--font-display` declares `'Space Grotesk', ..., 'Noto Sans
TC', ...` (Latin-first, matching the spec's own English-Display framing),
but `global.css`'s `:lang(zh) h1/h2/h3/h4` and `.text-display` rules
override to `'Noto Sans TC', var(--font-display)` for any element inside a
`lang="zh-*"` subtree. This was a deliberate correction, not an oversight:
without it, Traditional Chinese H1 text would attempt to shape against
Space Grotesk first (a Latin-only face with no CJK glyphs), which browsers
handle by falling through per-character to the next font in the stack —
usually fine visually but inconsistent metrics/kerning across a mixed
zh/Latin heading, and it risks Space Grotesk's tighter Latin
letter-spacing bleeding into the CJK fallback in some browsers. The
`:lang(zh)` override also zeroes `letter-spacing` for CJK, since the
spec's negative Latin display tracking (`-0.04em` / `-0.035em`) is
explicitly banned for Chinese by spec §6 ("中文標題不可出現過度壓縮字距").

**Grid: `--container-content`/`--container-max` reused for the compat
alias, not duplicated.** Rather than run two parallel container-width
concepts, `--container-max` (the name ten existing components' `.container`
class already consumes via `utilities.css`) is a straight alias for
`--container-content` (1280px, the spec's own name). Same treatment for
`--container-padding` → `--page-gutter-desktop`. This satisfies spec §7's
explicit instruction not to keep two conflicting spacing/container systems
side by side.

**Spacing: single 13-step scale, old names re-pointed, not two scales.**
The pre-existing `--space-3xs` … `--space-3xl` naming (used throughout
existing components) and the spec's `--space-1` … `--space-32` naming now
resolve to the exact same underlying values via a one-directional alias
chain (`--space-3xs: var(--space-1)`, etc.) — never independently
redefined. `--space-2xl` and `--space-3xl` (the two `clamp()`-based legacy
steps) are the only two NOT expressed as a plain multiple of the base
scale, since they encode responsive section rhythm the spec's flat
`--space-N` scale doesn't cover; `--space-3xl` is aliased to
`--section-standard` specifically (the closest match to its prior
clamp-88-120px value).

**Radius: legacy `--radius-lg` (12px) mapped to new `--radius-md` (12px),
not dropped.** The spec caps radius at `--radius-md: 12px` (no separate
`lg` step) — since the pre-CC-01 `--radius-lg` was also 12px, the alias is
value-identical, not a behavior change for any existing component using
`var(--radius-lg)` (Card, CTABanner, form-mode-notice, etc.).

**Rejected: literal `--color-steel-300` as a light-bg border color.**
First attempt at correcting the steel border-on-paper failure used a
lighter `#9aa4ab` (steel-300-style value) — verified at only 2.31:1,
still failing 3:1. Replaced with the darker `--color-steel-600 (#78838b)`,
which clears 3.53:1. Not used in the shipped tokens; recorded here so a
future stage doesn't re-attempt the same failing value.

**Rejected: `inline-block` and `flex-basis`/`align-self` tricks for the
preview page's dark-panel width-on-flex-item overflow bug.** A real 360px
horizontal-overflow defect (13.8px) was found via Playwright measurement
on the internal design-system preview page, traced to `.preview-dark-panel`
(originally `display: inline-block`) inside a `<main>` that is itself a
flex item of `<body>` (site-wide `body { display: flex; flex-direction:
column }` from `global.css`, not introduced by this page). `min-width: 0`
on `.preview-main` alone did not resolve it in testing, nor did
`inline-block` + `max-width: 100%`, nor `display: block; width:
fit-content`, nor forcing `flex-basis`/`flex-grow`/`flex-shrink`/
`align-self` values directly. What worked: explicit `width: 100%` +
`min-width: 0` together on `.preview-main`, giving the flex item a
definite cross-axis size the layout engine has no remaining discretion to
grow past. Documented as a known CSS-flex-sizing gotcha for anyone
building further pages inside this `body`-is-flex layout (CC-02+
Header/Hero work included) — if a similar "why is this wider than its
container" symptom appears again, try the explicit `width: 100%` fix
directly rather than re-deriving the diagnosis from scratch.

**Rejected: `transition: width` on `.datum-link` Tertiary Link's axis
line.** Flagged by Impeccable's mechanical detector (`layout-transition`
antipattern) as a real performance issue, not just a lint nitpick —
animating `width` forces layout recalculation every frame. Replaced with a
fixed-width element (`width: 32px`) animated via `transform: scaleX()`
(0.625 at rest = 20px visual width, 1 on hover = 32px), which is
GPU-composited and produces the identical visual result the spec asks for
("Hover 時軸線延伸 8-16px"). Full detail in `docs/IMPECCABLE_REVIEW_LOG.md`.

**Rejected: `src/pages/__preview/design-system.astro` as the literal
path.** Astro's router silently excludes any `src/pages` path segment
starting with `_` from routing by design (not a bug) — the page built with
0 errors but emitted no route at all. Moved to
`src/pages/internal-preview/design-system.astro` per this stage's own
allowance to adjust the file name ("可依現有架構調整檔名"). All three
"not a production page" properties (no nav entry, not in sitemap.xml's
hand-built URL list, noindex/nofollow meta) hold at the new path exactly as
they would have at the old one.

**Constraint for CC-02+: do not lighten `--color-paper-50` or
`--color-copper-600`.** The copper-600-on-paper-50 pairing (the primary CTA
fill/text color on the primary background) sits at 4.61:1 — a real pass,
but only 0.11 above the 4.5:1 floor, the thinnest margin in the whole
palette. Any future stage that adjusts either token must rerun the
`docs/CONTRAST_AUDIT.md` calculation before shipping.

**Constraint for CC-02+: `--color-steel-500` and `--color-copper-500` are
role-restricted, not general-purpose.** Per spec §4's own color-role
section, `--color-steel-500` is valid only as muted text/decoration on
`--color-ink-950` (dark backgrounds) — using it as light-background text or
a light-background border will fail contrast (see `CONTRAST_AUDIT.md`).
`--color-copper-500` is valid only as light-background non-text UI
(borders/decoration, 3:1 floor) or dark-background accent text — using it
as light-background body text will fail 4.5:1. Use `--color-steel-700` /
`--color-steel-600` / `--color-copper-700` for the light-background text/
border roles instead.

**Two real token-compatibility regressions found by axe-core and fixed
with a token substitution (not a shim, not a redesign).** Running the full
`pnpm test:e2e` suite (not just visual inspection) against the initial
token rebuild caught what static reading of the components' `<style>`
blocks did not: `SectionHeading.astro`'s `.section-heading__eyebrow` and
`ProcessTimeline.astro`'s `.process-timeline__index` both use
`--color-accent` (copper-600) as text color, and both regularly render
inside a `.section--alt` block whose background is `--color-surface-alt` =
`--color-paper-100`. `docs/CONTRAST_AUDIT.md` had already calculated that
exact pairing (copper-600 on paper-100 = 4.19:1, below the 4.5:1 text
floor) as one of the 5 spec values needing correction — this is that
calculated failure showing up in real rendered components. Fixed both by
switching to `--color-accent-dark` (= `--color-copper-700`, verified
5.50:1 on paper-100, 6.06:1 on paper-50, 6.65:1 on white — passes
everywhere the eyebrow/index actually renders, not just the alt-background
case that surfaced it). This is a straight token substitution within the
same hue family, not a compatibility shim (no parallel legacy CSS path
kept around) and not a component redesign (no structural/markup change).

**No compatibility shim was needed for the remaining eight of the ten
audited components.** Header, Button, ProductCard, SolutionCard,
IndustryCard, ContactForm, Footer, SpecificationTable, CTABanner all
consume tokens via `var(--color-*)` / `var(--fs-*)` / `var(--space-*)` /
`var(--radius-*)` exclusively (confirmed by reading every one of their
`<style>` blocks before touching `tokens.css`) — none hardcodes a literal
color/size value, and none hit a failing token pairing the way
SectionHeading/ProcessTimeline did. All rendered correctly with zero
component-level edits beyond the two fixes above, verified via real
Playwright screenshots (`docs/screenshots/cc01-compat-homepage-desktop.png`,
`cc01-compat-mobile-nav-open.png`), a scripted contrast/overflow/
console-error sweep, and the full 198-test Playwright suite (197 pass, the
1 failure being the pre-existing `/en/` overflow documented above — not a
token-compatibility issue). `Button.astro` itself was also edited (loading
state, primary-hover axis-shift, aria-disabled/aria-busy) — that is
in-scope CC-01 work per spec §9 (Button states), not a compatibility fix.
