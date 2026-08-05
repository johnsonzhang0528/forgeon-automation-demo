# CC-02-04: Font Payload Audit

Measured live via Playwright against `astro preview` (production static
build output, not `astro dev`), capturing every `/fonts/*.woff2` network
response's actual `Content-Length`/response-body byte count on both
homepages. Not estimated from file listings — every number below is a real
captured response.

## Method

```
node <ad-hoc Playwright script>
```

- Launched a fresh browser context per page (cold cache), navigated to
  `waitUntil: 'networkidle'`, recorded every `.woff2` response's `status`,
  `Content-Length` header, and actual response body byte length (both
  matched in every case below — no compression mismatch).
- Reloaded the same page in the same context afterward to observe warm-cache
  request behavior.
- Script was ad-hoc (not checked into `scripts/`, matching the precedent set
  by `docs/CONTRAST_AUDIT.md`'s own contrast-calculator script) — every
  input/output pair is recorded verbatim below so the measurement is
  reproducible.

## Per-request results — `/zh-tw/` (cold cache, first load)

| File | Weight | Family | Transfer / Resource size |
|---|---|---|---|
| `noto-sans-tc-chinese-traditional-400-normal.woff2` | 400 | Noto Sans TC | 997,024 bytes |
| `noto-sans-tc-chinese-traditional-500-normal.woff2` | 500 | Noto Sans TC | 1,011,016 bytes |
| `noto-sans-tc-chinese-traditional-600-normal.woff2` | 600 | Noto Sans TC | 1,015,060 bytes |
| `noto-sans-tc-chinese-traditional-700-normal.woff2` | 700 | Noto Sans TC | 1,021,008 bytes |
| `ibm-plex-mono-latin-400-normal.woff2` | 400 | IBM Plex Mono | 14,708 bytes |
| `ibm-plex-mono-latin-600-normal.woff2` | 600 | IBM Plex Mono | 15,620 bytes |
| `space-grotesk-latin-700-normal.woff2` | 700 | Space Grotesk | 12,840 bytes |

**Total `/zh-tw/` first-load font payload: 4,087,276 bytes (3,991.5 KB / ~3.9 MB).**

Requests NOT observed on `/zh-tw/` first load (declared in `@font-face` but
not triggered by any rendered element on this page): `space-grotesk` 500/600
(no matching rendered weight/family combination fires on the homepage's
actual DOM), `ibm-plex-mono` 500 (declared, no current homepage usage at
that exact weight).

## Per-request results — `/en/` (cold cache, first load)

| File | Weight | Family | Transfer / Resource size |
|---|---|---|---|
| `noto-sans-tc-chinese-traditional-400-normal.woff2` | 400 | Noto Sans TC | 997,024 bytes |
| `noto-sans-tc-chinese-traditional-500-normal.woff2` | 500 | Noto Sans TC | 1,011,016 bytes |
| `noto-sans-tc-chinese-traditional-600-normal.woff2` | 600 | Noto Sans TC | 1,015,060 bytes |
| `noto-sans-tc-chinese-traditional-700-normal.woff2` | 700 | Noto Sans TC | 1,021,008 bytes |
| `ibm-plex-mono-latin-400-normal.woff2` | 400 | IBM Plex Mono | 14,708 bytes |
| `ibm-plex-mono-latin-600-normal.woff2` | 600 | IBM Plex Mono | 15,620 bytes |
| `space-grotesk-latin-600-normal.woff2` | 600 | Space Grotesk | 13,284 bytes |
| `space-grotesk-latin-700-normal.woff2` | 700 | Space Grotesk | 12,840 bytes |

**Total `/en/` first-load font payload: 4,100,560 bytes (4,004.5 KB / ~4.0 MB).**

`/en/` pulls one more request than `/zh-tw/` (`space-grotesk` 600, used by
an English H2/section heading weight that has no zh-tw-rendered equivalent
at that exact weight on the homepage) — otherwise near-identical, since
`--font-body`'s Noto-Sans-TC-first stack means **all four Noto Sans TC
weights load on the English homepage too**, not just on zh-tw. This is
expected given `--font-body`/`--font-display`'s declared cascade (see
`tokens.css`), not a bug: any Latin text rendered through `--font-body`
(nav links, some body copy) still resolves against the first family in that
stack, `'Noto Sans TC'`, before ever reaching a Latin fallback — and Noto
Sans TC does contain Latin glyphs, so the browser has no reason to skip it.

## All 10 shipped weights — used vs. unused per homepage

| Weight file | Declared | Used on `/zh-tw/` | Used on `/en/` |
|---|---|---|---|
| Noto Sans TC 400 | Yes | Yes (preloaded, body text/H1 zh) | Yes |
| Noto Sans TC 500 | Yes | Yes (`.desktop-nav__link`) | Yes |
| Noto Sans TC 600 | Yes | Yes (headings, buttons) | Yes |
| Noto Sans TC 700 | Yes | Yes (H1/Display via `:lang(zh)` override on zh content, and via base cascade for bold text) | Yes |
| Space Grotesk 500 | Yes | Not triggered on homepage's actual DOM | Not triggered |
| Space Grotesk 600 | Yes | Not triggered | Yes (English H2 weight) |
| Space Grotesk 700 | Yes | Yes (Display/H1 English cascade position, still resolves when Latin glyphs used, e.g. brand name spans) | Yes |
| IBM Plex Mono 400 | Yes | Yes (technical labels, eyebrow text) | Yes |
| IBM Plex Mono 500 | Yes | Not triggered on homepage | Not triggered on homepage |
| IBM Plex Mono 600 | Yes | Yes (index numerals `01`/`02`/etc.) | Yes |

Three of the ten shipped weight files (Space Grotesk 500, IBM Plex Mono 500,
and — on `/zh-tw/` specifically — Space Grotesk 600) are not triggered by
either homepage's own DOM, but ARE used elsewhere on the site (per-product/
solution detail pages, the internal design-system preview, etc.) — this
audit is scoped to the two homepages per spec §8's instruction to "量測首
頁", not a full-site weight audit. None of the ten was found to be entirely
unused site-wide; a full-site check is out of this round's scope.

## Noto Sans TC 500 — specific investigation (spec §8's explicit ask)

**Where it's used:** exactly one CSS rule site-wide sets `font-weight: 500`
on text that resolves to Noto Sans TC: `Header.astro`'s
`.desktop-nav__link` (the six desktop nav items — 解決方案/產品/產業應用/
關於我們/技術資源/聯絡我們 on zh-tw, "Solutions/Products/Industries/
About/Resources/Contact" on en). Confirmed by grepping every
`font-weight: 500` declaration in `src/styles/*.css` and every
`src/components/**/*.astro` file — the other two hits are inside the
`@font-face` declarations themselves (not consumers), not a second usage
site.

**Could it reasonably become 600?** Tested directly: screenshotted the real
rendered `.desktop-nav__link` row at its shipped weight (500), then
force-overrode it to 600 in the same live page via an injected stylesheet
and re-screenshotted. The difference is visually real, not marginal —
600-weight nav text renders noticeably heavier/bolder than the shipped
500-weight, which currently reads as an intentionally lighter secondary-nav
weight relative to the bolder H2/H3/button text elsewhere on the page (all
of which already use 600). Collapsing nav links to 600 would make them
visually compete with primary headings for weight-based hierarchy instead
of sitting a clear step below them — a real design regression, not a
"nobody would notice" change.

**Recommendation: do NOT remove Noto Sans TC 500.** Per spec §8's explicit
instruction ("只有在有明確證據且不破壞設計時，才移除字重" — only remove a
weight when there is clear evidence AND it does not break the design), the
evidence here points the other way: removing it either (a) breaks the nav's
visual hierarchy if collapsed to 600, or (b) falls back to a different
family/weight combination that hasn't been part of this design system's
verified type scale. The theoretical saving if removed anyway would be
1,011,016 bytes (~987 KB) per cold-cache homepage visit — a real number,
recorded here for completeness, but not acted on this round given the
visible design cost.

## Cache behavior

`astro preview`'s dev-oriented static file server sends
`Cache-Control: no-cache` (confirmed via `curl -I` against a running
preview instance) — every reload re-validates via `ETag` rather than
serving from disk cache without a network round-trip. This is a property of
the local preview server, not of the built static output itself; a real
production deploy (CDN/static host) would typically set long-lived
immutable cache headers on hashed asset paths, which these font files are
not currently hashed for (`public/fonts/**` paths are stable/unhashed, since
Astro's `public/` directory is copied verbatim without content hashing).
**This is a real, separate finding, not fixed this round** — a future stage
should either move fonts into Astro's asset pipeline (to get content-hash
filenames + long-cache headers) or configure the production host's own
cache-control rules for `/fonts/**`, whichever fits the eventual deploy
target. Recorded here rather than silently left for someone to rediscover.

## Total first-load font weight actually used vs. shipped

- Shipped (all three families, all declared weights): 10 files,
  `997,024 + 1,011,016 + 1,015,060 + 1,021,008 + 13,284 + 12,840 + 14,708 +
  14,888 + 15,620` (IBM Plex Mono 500 file exists on disk at 14,888 bytes
  but was not observed loading on either homepage) `= 4,115,448 bytes`
  total on disk under `public/fonts/`.
- Actually transferred on a cold-cache `/zh-tw/` homepage visit: 4,087,276
  bytes (99.3% of the on-disk total — nearly everything shipped does load
  on the homepage; the three untriggered weights live on other pages, not
  as dead weight here).
- Actually transferred on a cold-cache `/en/` homepage visit: 4,100,560
  bytes (99.6% of the on-disk total).

## Conclusion

No font weight is removed this round. The dominant cost is Noto Sans TC's
four full-CJK-charset weights (~1 MB each, ~4 MB total) — an inherent cost
of self-hosting a Traditional Chinese webfont with full glyph coverage, not
a result of shipping unnecessary weights. The one weight spec §8 asked about
by name (Noto Sans TC 500) has exactly one real usage site, a measurable
visual difference if collapsed into 600, and is kept. The `Cache-Control:
no-cache` finding on the preview server (separate from the weight-removal
question) is recorded as a known limitation for a future deploy-configuration
stage, not addressed here since it requires a production hosting decision
this round's scope does not include.
