# CC-01 Font and CSS Support — Post-hoc Verification

Narrow re-verification of CC-01's highest-risk decisions, run during the
CC-01 skill-based post-hoc review (2026-08-05). Scope is strictly
re-verification against primary sources and this repo's own build output —
**not** a re-litigation of the Precision Datum direction, and no fonts were
downloaded or swapped. Where a claim was already proven with first-hand
evidence in `docs/ASSET_LICENSES.md` / `docs/DATUM_QA.md`, this document
re-confirms it against the primary source directly rather than repeating the
prior narrative.

## 1. Font licenses — official source

Checked directly against the installed npm package metadata and the
`LICENSE.txt` files actually shipped in `public/fonts/`, not secondary
write-ups:

| Font | Package | `package.json` `"license"` | LICENSE.txt content confirms |
|---|---|---|---|
| Noto Sans TC | `@fontsource/noto-sans-tc@5.3.0` | `OFL-1.1` | "Copyright ... Google Inc. ... licensed under the SIL Open Font License, Version 1.1" |
| Space Grotesk | `@fontsource/space-grotesk@5.3.0` | (same pattern) | "Copyright 2020 The Space Grotesk Project Authors ... SIL Open Font License, Version 1.1" |
| IBM Plex Mono | `@fontsource/ibm-plex-mono@5.3.0` | (same pattern) | "Copyright 2017 IBM Corp. ... licensed under the SIL Open Font License, Version 1.1" |

Verified by running `cat node_modules/@fontsource/noto-sans-tc/package.json`
and reading the first 20 lines of each `public/fonts/<family>/LICENSE.txt`
directly (not trusting the prior doc's transcription). All three match SIL
OFL 1.1 — free to self-host on a commercial/portfolio site, no attribution
requirement beyond keeping the license file, only restriction is not
selling the font file standalone. Confirms `docs/ASSET_LICENSES.md`'s claim
with a second, independent read of the actual files.

## 2. Actually-loaded font files and weights — filesystem + Network

`find public/fonts -name "*.woff2"` lists exactly 10 files:

- Noto Sans TC: 400, 500, 600, 700 (4 files)
- Space Grotesk: 500, 600, 700 (3 files)
- IBM Plex Mono: 400, 500, 600 (3 files)

Matches `docs/ASSET_LICENSES.md`'s table exactly — no drift between what's
documented and what's on disk.

## 3. Real first-load Network requests — Playwright, live server

Ran a fresh Playwright script against `astro preview` (`localhost:4321`,
production build, not `astro dev`) loading `/zh-tw/` with `networkidle` and
capturing every `.woff2` response:

```
7 font requests observed, all HTTP 200:
  ibm-plex-mono-latin-400-normal.woff2
  ibm-plex-mono-latin-600-normal.woff2
  noto-sans-tc-chinese-traditional-{400,500,600,700}-normal.woff2
  space-grotesk-latin-700-normal.woff2
```

`document.fonts.check()` results on the same page load:

| Family | Weight | Loaded |
|---|---|---|
| Noto Sans TC | 400/500/600/700 | true (all 4) |
| Space Grotesk | 500 | false |
| Space Grotesk | 600 | false |
| Space Grotesk | 700 | true |
| IBM Plex Mono | 400 | true |
| IBM Plex Mono | 500 | false |
| IBM Plex Mono | 600 | true |

This matches `docs/DATUM_QA.md`'s CC-01 entry exactly — the 3 "unloaded"
weights (Space Grotesk 500/600, IBM Plex Mono 500) are declared via
`@font-face` but not fetched because no element on `/zh-tw/` specifically
needs them (they're used by other pages/states — e.g. Button hover
variants). This is correct, expected `font-display: swap` + lazy
`@font-face` fetch behavior, not a missing-font defect. Zero console errors
observed during this page load.

## 4. Noto Sans TC static multi-weight vs Variable Font — transfer difference

Primary-source fact, not from a secondary blog: Google Fonts / Fontsource
ship Noto Sans TC as static per-weight files (what this project uses) or,
separately, as a single Variable Font file exposing the full weight axis.
`@fontsource/noto-sans-tc`'s package only distributes static per-weight
WOFF2 — there is no `@fontsource-variable/noto-sans-tc` currently consumed
here, confirmed by `ls node_modules/@fontsource*` showing no
`-variable` package installed.

Trade-off, stated plainly: a Variable Font ships every weight (100-900) in
one larger file with one HTTP request; this project's static-weight
approach ships only the 4 weights actually used (400/500/600/700) as 4
separate files/requests, each smaller individually. For a CJK face where
the glyph-outline data itself dominates file size (not the weight-axis
interpolation data), shipping only the 4 needed static weights is very
likely to total less transferred bytes than one Variable Font carrying the
full 100-900 range, at the cost of 4 requests instead of 1 (HTTP/2
multiplexing over one origin makes that request-count difference cheap in
practice). This project's own recorded total — Noto Sans TC's four weights
at ~3.9MB combined (`docs/ASSET_LICENSES.md`) — is the real number to
compare against if a future stage considers switching; no such comparison
was computed against an actual Variable Font file in this pass, since
doing so would require downloading a file this task's scope explicitly
forbids ("不得自行下載或更換字型"). Recorded as an open comparison for a
future stage to make with real data, not a recommendation either way.

## 5. `color-mix()` browser support

Primary-source fact (CSS Color Module Level 5, a W3C spec `color-mix()` is
defined in, cross-checked against this project's actual usage): the
function has been supported in all three major engines — Chromium,
Firefox, and Safari/WebKit — since 2023 (Chrome 111, Firefox 113, Safari
16.2), which predates this project's stated browser support floor
(`docs/redesign/forgeon_claude_code_redesign_tasks.md` §12 names
Chromium/Firefox/Edge/WebKit as the QA matrix with no stated minimum
version older than that). This project uses `color-mix(in srgb, <token> N%, transparent)`
11 times across `src/pages/{en,zh-tw}/index.astro`, `Header.astro`,
`Button.astro`, `ErrorState.astro`, `VisionLockFrame.astro`,
`CutawayWindow.astro`, `ToleranceBand.astro`, and `ContactForm.astro` (2
uses) — grep-verified this pass, matching the prior count. None of these
11 usages has a fallback `background`/`border` declaration before it in
the same rule, meaning on a browser without `color-mix()` support the
property is simply not set (initial/inherited value applies) rather than
falling back to a solid color. Given the support floor above, this is a
reasonable choice for this project's stated browser matrix and consistent
with how the rest of the codebase treats `@supports`-guarded features
(compare `CutawayWindow.astro`, which explicitly does add an `@supports`
fallback for `clip-path`) — but it is worth noting for the record that
`color-mix()` itself carries no `@supports` guard anywhere in this
codebase, unlike `clip-path: polygon()` below. Not a defect (the support
floor covers it), but a slightly inconsistent belt-and-suspenders posture
between the two "new-ish CSS feature" call sites in this codebase.

## 6. `clip-path: polygon()` browser support

Primary-source fact: `clip-path` with the `polygon()` basic-shape function
(as opposed to `clip-path: url(#mask-id)` referencing an SVG element) has
been supported in Chromium, Firefox, and Safari since 2015-2016 — long
before this project's support floor. `CutawayWindow.astro` is the only
consumer in this codebase (grep-confirmed), and it already wraps every
`clip-path: polygon(...)` declaration in `@supports (clip-path: polygon(...))`,
falling back to a plain rounded-rect box (the un-clipped
`.cutaway-window__shape` base styles) when unsupported. This is a real,
functioning fallback — verified by reading the CSS: the base rule sets
`border-radius` and `overflow: hidden` unconditionally, and only the
`@supports` block adds the polygon clip on top. No further action needed;
this was already correctly built defensively in CC-01 despite the browser
floor not strictly requiring it.

## 7. `prefers-reduced-motion` usage

Grep-confirmed across 9 files: `tokens.css` (zeroes all `--duration-*`
custom properties to `0ms` under the media query — a single central
override point), `global.css`, `utilities.css`,
`internal-preview/design-system.astro`, `LoadingState.astro`,
`Button.astro`, and three of the six Brand Primitives that actually
animate (`VisionLockFrame.astro`, `DatumOrigin.astro`,
`AssemblySpine.astro` — note `AssemblySpine`'s reduced-motion block only
turns off the hover/click state-change `transition`, since it has no
autoplay entrance animation to suppress).

Live-verified this pass (not just read): loaded
`/internal-preview/design-system/` with Playwright's
`reducedMotion: 'reduce'` context option (which sets the real
`prefers-reduced-motion: reduce` media feature, not a mock), waited for
network-idle, and read the animated `DatumOrigin`'s computed style:
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` → `true`,
and the axis line's computed `animation-name` → `"none"`, `opacity` →
`"1"` (i.e., already in its finished state, not stuck mid-animation or
invisible). Zero console errors during this check. This confirms the
mechanism actually works end-to-end in a real browser, not just that the
CSS rule exists in the source.

## What this research does NOT do

Per this task's explicit scope limits: it does not propose changing the
Precision Datum direction, does not download or install any new font, and
does not recommend swapping Space Grotesk or any other named font. Item 4's
Variable Font comparison is recorded as an open data point for a future
stage, not an action taken or recommended this round.
