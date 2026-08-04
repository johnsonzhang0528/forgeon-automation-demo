# CC-01 Test Summary — for ChatGPT Independent Review

Compiled from tests actually executed during CC-01 and its post-hoc review
round — no numbers here are re-invented for this document. Source of each
figure is cited so it can be traced back to the original run. Where CC-01
and post-hoc numbers differ (they generally don't — the post-hoc fix was
deliberately narrow), the more recent (post-hoc) number is what's reported,
with the CC-01-era number noted for comparison where relevant.

## Commands run

```bash
pnpm check
pnpm build
pnpm check:h1
pnpm check:links
pnpm check:locale-routes
pnpm test:e2e
pnpm test:axe
```

## Results (most recent run — post-hoc fix commit `49d3d90`)

| Check | Result | Source |
|---|---|---|
| `pnpm check` (astro check) | 85 files, **0 errors, 0 warnings, 11 hints** (all pre-existing `is:inline` script-processing hints — informational, not defects) | `docs/DATUM_QA.md` (CC-01 section), confirmed unchanged in `docs/engineering/reviews/CC-01-posthoc-fix-review.md` |
| `pnpm build` | **51 pages**, 0 errors | Same |
| `pnpm check:h1` | **49/49 pass**, 2 redirect pages excluded from the check | `docs/DATUM_QA.md` |
| `pnpm check:links` | **2049 internal links checked, 0 broken** | `docs/DATUM_QA.md` |
| `pnpm check:locale-routes` | **141 hreflang links checked, 0 broken**; insights slug parity 2 zh-tw / 2 en, both present | `docs/DATUM_QA.md` |
| `pnpm test:e2e` | **197 passed, 1 failed** — see "Known failure" below. Re-run after the post-hoc fix produced the identical 197/1 split (not re-tested as 198/0) | `docs/engineering/reviews/CC-01-posthoc-fix-review.md` |
| `pnpm test:axe` | **15 passed, 0 critical, 0 serious** — 14 page types + Mobile Nav open state | `docs/DATUM_QA.md`, confirmed unchanged post-fix |

**This is deliberately not reported as all-green.** The one E2E failure is
real, reproducible, and documented below — not omitted or reframed.

## Font requests (real Network capture, not code inspection)

Captured via Playwright against the production preview server on `/zh-tw/`:

```
Network requests (all HTTP 200):
  /fonts/ibm-plex-mono/ibm-plex-mono-latin-400-normal.woff2
  /fonts/ibm-plex-mono/ibm-plex-mono-latin-600-normal.woff2
  /fonts/noto-sans-tc/noto-sans-tc-chinese-traditional-{400,500,600,700}-normal.woff2
  /fonts/space-grotesk/space-grotesk-latin-700-normal.woff2
```

`document.fonts` (FontFace API) status on `/zh-tw/`: Noto Sans TC
400/500/600/700 — **loaded**; Space Grotesk 700 — **loaded**; Space
Grotesk 500/600 — unloaded (not used by any element on that specific page
— browsers only fetch a declared `@font-face` when an element actually
needs it; these weights load on states like the preview page's
Button hover/secondary variants); IBM Plex Mono 400/600 — **loaded**; IBM
Plex Mono 500 — unloaded (same reason).

Source: `docs/DATUM_QA.md` CC-01 section, "Font load verification".

## Console errors

Zero across all pages checked in the CC-01 real-browser QA pass: 7 pages ×
3 breakpoints (21 page-loads) plus the 3 required design-system screenshot
viewports (1440×900 / 768×1024 / 390×844) — 24 total console-error checks,
all clean. Re-confirmed with zero new console errors on the post-hoc fix's
live Playwright verification of both `AssemblySpine` render paths.

## Noindex / Sitemap exclusion

`src/pages/internal-preview/design-system.astro` confirmed (via direct
code read in the post-hoc two-axis review, not just documentation trust)
to emit `noindex,nofollow` meta, contain exactly one real `<h1>`, and be
absent from both the site navigation and the generated sitemap. Source:
`docs/engineering/reviews/CC-01-two-axis-review.md`.

## Reduced motion

`prefers-reduced-motion` handling verified present and correct in every
animated brand primitive (`VisionLockFrame`'s one-time lock-on sequence,
`AssemblySpine`'s state transitions, `Button`'s loading spinner) — code-read
confirmed in the two-axis review, not just doc-claim trust. Source:
`docs/engineering/reviews/CC-01-two-axis-review.md`.

## Known failure (the one non-green result)

```
URL:          /en/
Viewport:     360 × 800
scrollWidth:  377px
clientWidth:  360px
Overflow:     17px
```

**When first observed:** During CC-01's real-browser QA pass (Playwright
overflow check across 7 sample pages at 360/390/768px).

**Is it a CC-00 baseline issue:** Yes, confirmed by direct A/B test — CC-01
changes were `git stash`-ed, the site rebuilt from the CC-00 baseline
commit (`eadf381`) alone, and the same overflow check re-run. Result:
identical `scrollWidth: 377` / `clientWidth: 360` with zero CC-01 code
present. This proves the defect predates CC-01 and predates the Precision
Datum System entirely — it is a homepage-content-level issue, not a
design-token or brand-primitive issue.

**Re-confirmed unchanged after the post-hoc fix:** The post-hoc round's
`fix(design-system): harden datum primitives` commit (`49d3d90`) touched
only `AssemblySpine.astro` and `DatumOrigin.astro` — neither is used on
`/en/`'s homepage — so the 197/1 split was expected to reproduce exactly,
and did.

**Planned fix stage:** CC-02 — the first stage in the redesign plan
(`docs/DATUM_REDESIGN_PLAN.md`) that is permitted to touch homepage
structure. CC-01 and this post-hoc/handoff round are both explicitly
scoped to forbid homepage content changes, so fixing it here would itself
be a scope violation, not a fix.

Source: `docs/engineering/reviews/CC-01-posthoc-fix-review.md`,
`docs/engineering/reviews/CC-01-seven-dispositions.md` (disposition #6).
