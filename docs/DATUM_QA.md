# Precision Datum System — QA Log

Running QA record for the CC-00 → CC-10 redesign pass. Each stage appends its own
section with commands actually run and actual output — not restated claims.
Full historical QA prior to this redesign lives in `docs/QA_CHECKLIST.md` and
`docs/CODEX_REVIEW_HANDOFF.md` (P0/P1 remediation pass).

## CC-00 — Clean environment verification

**Date:** 2026-08-05
**Environment:** `node_modules`, `.astro`, `dist` deleted and rebuilt from
`pnpm-lock.yaml` — not the pre-existing install carried over from the prior pass.

```
$ pnpm install --frozen-lockfile
Lockfile is up to date, resolution step is skipped
Packages: +401
Done in 1.7s using pnpm v11.20.0

$ pnpm check
Result (78 files):
- 0 errors
- 0 warnings
- 9 hints        # all `is:inline` script-processing hints, pre-existing/cosmetic

$ pnpm build
[build] 50 page(s) built in 3.35s
[build] Complete!

$ pnpm check:h1
H1 check: 50 HTML files scanned, 2 excluded (redirect pages), 48 pass, 0 fail.

$ pnpm check:links
Link check: 50 HTML files scanned, 1951 internal links checked, 0 broken.

$ pnpm check:locale-routes
Insights entrySlug parity: 2 zh-tw slugs, 2 en slugs.
  OK — every insights slug has both locale versions built.
hreflang target check: 141 hreflang links checked across 50 pages, 0 broken.
```

No `pnpm test:e2e` / `pnpm test:axe` run this stage — CC-00 scope is baseline and
naming only, per the task book's explicit instruction not to touch page content or
run the full browser QA suite until CC-09. Those suites already passed in the prior
remediation round (198/198 Playwright, axe 0 critical/0 serious) against the
pre-redesign UI; they will be re-run against the new UI starting once CC-02
(Header/Hero spike) produces the first user-facing change.

**Not yet run this stage (deferred to CC-09 per task book):** Firefox/Edge/WebKit
cross-browser, Lighthouse, NVDA/VoiceOver manual pass, 200% zoom, forced-colors
check. Listing them here so their absence isn't mistaken for an oversight.

## CC-01 — Precision Datum Design System

**Date:** 2026-08-05
**Environment:** Continued from the same clean install as CC-00 (401
packages), plus three new dependencies added this stage:
`@fontsource/noto-sans-tc`, `@fontsource/space-grotesk`,
`@fontsource/ibm-plex-mono` (404 packages total post-install).

```
$ npx --yes pnpm add @fontsource/noto-sans-tc @fontsource/space-grotesk @fontsource/ibm-plex-mono
Packages: +3
Done in 4.1s using pnpm v11.20.0

$ npx --yes pnpm run check
Result (85 files):
- 0 errors
- 0 warnings
- 11 hints        # same 9 pre-existing is:inline hints as CC-00, +2 new
                   # identical is:inline hints from this stage's own
                   # VisionLockFrame.astro/AssemblySpine.astro inline
                   # scripts using define:vars — same established pattern
                   # already used across the pre-existing codebase

$ npx --yes pnpm run build
[build] 51 page(s) built in 3.6-4.3s   # 50 content pages (unchanged from
                                          CC-00) + 1 new internal preview page
[build] Complete!

$ npx --yes pnpm run check:h1
H1 check: 51 HTML files scanned, 2 excluded (redirect pages), 49 pass, 0 fail.
# 48 content pages (unchanged) + 1 new preview page, all pass exactly-one-H1

$ npx --yes pnpm run check:links
Link check: 51 HTML files scanned, 2049 internal links checked, 0 broken.

$ npx --yes pnpm run check:locale-routes
Insights entrySlug parity: 2 zh-tw slugs, 2 en slugs. OK.
hreflang target check: 141 hreflang links checked across 51 pages, 0 broken.
```

### Real-browser QA (Playwright + Chromium, production preview server)

Ran against `astro preview` serving the production build (not `astro dev`),
per the same methodology as the P0/P1 remediation round's
`IMPECCABLE_REVIEW_LOG.md`.

**Screenshots** (`docs/screenshots/`):
- `cc01-design-system-desktop.png` — 1440×900, full page, internal preview page
- `cc01-design-system-tablet.png` — 768×1024, full page
- `cc01-design-system-mobile.png` — 390×844, full page
- `cc01-compat-homepage-desktop.png` — 1440×900, zh-tw homepage (compatibility check)
- `cc01-compat-mobile-nav-open.png` — 390×844, mobile nav drawer open (compatibility check)

**Horizontal overflow check** (`document.documentElement.scrollWidth` vs
`clientWidth`) at 360/390/768px across 7 pages (internal preview page + 6
sample content pages spanning zh-tw and en, homepage, solution detail,
product detail, contact, industries):

| Page | 360px | 390px | 768px |
|---|---|---|---|
| `/internal-preview/design-system/` | PASS (after fix — see below) | PASS | PASS |
| `/zh-tw/` | PASS | PASS | PASS |
| `/zh-tw/solutions/vision-guided-assembly/` | PASS | PASS | PASS |
| `/zh-tw/products/axm-400/` | PASS | PASS | PASS |
| `/zh-tw/contact/` | PASS | PASS | PASS |
| `/zh-tw/industries/` | PASS | PASS | PASS |
| `/en/` | **FAIL — pre-existing, confirmed present in CC-00 baseline (17px), not a CC-01 regression** | PASS | PASS |

**Two real overflow defects found and fixed on the new preview page** (not
present on any pre-existing page — introduced by this stage's own new
markup, fully resolved before commit):

1. `.datum-grid` items with no explicit `min-width: 0` let unbroken content
   force grid-track growth below the 1024px breakpoint (where span
   utilities don't yet apply). Fixed: `grid-template-columns: repeat(N,
   minmax(0, 1fr))` + `.datum-grid > * { min-width: 0 }` at all three
   breakpoints.
2. `.preview-main` (a flex item of `<body>`, which is `display: flex;
   flex-direction: column` site-wide per `global.css`) rendered 13.8px
   wider than `<body>`'s own 360px content box at the 360px viewport.
   Traced through extensive isolation testing (documented in
   `DATUM_DECISION_LOG.md`) to the `.preview-dark-panel` element
   (originally `inline-block`, sizing to shrink-to-fit/max-content of its
   two side-by-side buttons). `min-width: 0` alone did not resolve it in
   testing; the fix that worked was explicit `width: 100%` + `min-width: 0`
   together on `.preview-main`.

**Confirmed pre-existing, NOT a CC-01 regression:** `/en/` homepage
overflows by 17px at 360px viewport. Verified by `git stash`-ing all CC-01
changes, rebuilding, and re-running the same Playwright overflow check
against the CC-00 baseline commit's build — the 17px overflow reproduces
identically (`scrollWidth: 377, clientWidth: 360`) with zero CC-01 code
present. This is homepage-content-level (out of CC-01 scope — CC-01 must
not touch `index.astro` structure per the dispatch brief's explicit
hard-stop). Recorded as a known limitation for CC-02/CC-03 to address when
homepage content is in scope.

**Console errors:** Zero across all 7 pages × 3 breakpoints (21
page-loads) plus the 3 required design-system screenshots at their exact
CC-01-spec viewports (1440×900 / 768×1024 / 390×844) — 24 total
console-error checks, all clean (`page.on('console', type==='error')` and
`page.on('pageerror')` both wired).

**Font load verification** (real Network + FontFace API, not inspection):

```
Network requests (all HTTP 200):
  /fonts/ibm-plex-mono/ibm-plex-mono-latin-400-normal.woff2
  /fonts/ibm-plex-mono/ibm-plex-mono-latin-600-normal.woff2
  /fonts/noto-sans-tc/noto-sans-tc-chinese-traditional-{400,500,600,700}-normal.woff2
  /fonts/space-grotesk/space-grotesk-latin-700-normal.woff2

document.fonts (FontFace API) status on /zh-tw/:
  Noto Sans TC 400/500/600/700 — loaded
  Space Grotesk 700 — loaded
  Space Grotesk 500/600 — unloaded (not used by any element on this
    specific page — browsers only fetch a declared @font-face when an
    element actually needs it; these weights load on pages/states that use
    them, e.g. this preview page's Button hover/secondary states)
  IBM Plex Mono 400/600 — loaded
  IBM Plex Mono 500 — unloaded (same reason)
```

**Computed-style spot check** on `/zh-tw/` (proves tokens actually apply,
not just declared): `body { color: rgb(11,18,24) }` (= `--color-ink-950`),
`html { background: rgb(247,244,237) }` (= `--color-paper-50`), `h1 {
font-family: "Noto Sans TC", "Space Grotesk", ... }` (CJK-first order
confirmed applying via the `:lang(zh)` override), `.btn--primary {
background: rgb(184,78,29) }` (= `--color-copper-600`, `color:
rgb(247,244,237)` = `--color-paper-50`), `.site-footer { background:
rgb(11,18,24) }` (= `--color-ink-950`).

### `pnpm test:e2e` (full Playwright suite, 198 tests)

First run against the initial token rebuild surfaced 2 real axe-core
`color-contrast` regressions (not present before CC-01): `--color-accent`
(copper-600) used as text color in `ProcessTimeline.astro`'s
`.process-timeline__index` and `SectionHeading.astro`'s
`.section-heading__eyebrow`, both measuring 4.18-4.19:1 when rendered on a
`.section--alt` block's `--color-surface-alt` (= `--color-paper-100`)
background — exactly the failure `docs/CONTRAST_AUDIT.md` had already
calculated and flagged as a known copper-600-on-paper-100 gap, now located
in the actual rendered components that hit it. Both fixed by switching to
`--color-accent-dark` (= `--color-copper-700`, verified 5.50:1 on
paper-100, 6.06:1 on paper-50, 6.65:1 on white) — same hue family, token
substitution only, no component redesign.

```
$ npx --yes pnpm run test:e2e
197 passed, 1 failed
```

The 1 failure is `responsive-overflow.spec.ts`'s `home-en @ 360x800` check
— the same pre-existing `/en/` homepage overflow (17px) confirmed present
in the CC-00 baseline via `git stash` A/B testing (see the earlier section
of this document and `DATUM_DECISION_LOG.md`). Not a CC-01 regression, not
fixed this stage (homepage structure is explicitly out of CC-01 scope).

### `pnpm test:axe` (axe-core, 15 tests — dedicated subset of the above)

```
$ npx --yes pnpm run test:axe
15 passed (16.3s)
```

0 critical, 0 serious axe violations across all 14 page types (home,
home-en, solutions-listing, solution-detail, products-listing,
product-detail, industries-listing, industry-detail, about,
insights-listing, insight-detail, contact, privacy, 404) plus the mobile
nav open state — full pass after the two token-compatibility fixes above.

### Not run this stage

Firefox/Edge/WebKit cross-browser, Lighthouse, NVDA/VoiceOver, 200% zoom,
and forced-colors remain deferred to CC-09 per the task book, consistent
with CC-00.
