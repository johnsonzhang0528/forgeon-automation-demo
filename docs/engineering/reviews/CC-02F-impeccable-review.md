# CC-02F Impeccable Review — Final Editorial Hero (C+)

Evidence-based Critique/Typeset/Layout/Adapt/Audit pass on the finished C+
prototype, per spec §17/ticket CC-02F-09. Every finding below cites a
measured number (Playwright) or a screenshot path under
`docs/screenshots/cc02-final/`. Adjective-only claims are avoided.

Measurement method: a Playwright script (`chromium.launch()` against the
running `astro preview` server) navigated to
`/internal-preview/cc02-final/{zh-tw,en}/`, waited for `networkidle` +
1300ms (motion settle), then read `getBoundingClientRect()`,
`getComputedStyle()`, and DOM queries directly — not visual inspection
alone.

## 1. 5-second comprehension

Above the fold at 1440×900 simultaneously shows: brand mark + wordmark
(Header), H1 naming positioning/inspection/assembly explicitly, eyebrow
"精密自動化整合"/"Precision Automation Integration", body copy naming parts/
cycle-time/site-constraints as the evaluation inputs, two CTAs, and the
full three-station Primary Visual (motion module → vision head → assembly
workstation) with a visible input→output direction arrow. A viewer does
not need to scroll or read body copy to identify: (1) industrial
automation company, (2) positioning + inspection + assembly as one
system, (3) a concrete next step ("開始專案評估"/"Start a Project
Assessment"). See `zh-desktop.png` / `en-desktop.png`.

## 2. Genuine brand distinctiveness vs Variant A

Variant A (per `docs/engineering/reviews/CC-02-impeccable-hero-review.md`)
used a standard left-text/right-image 12-column split with three
equal-sized module cards. C+ deliberately does neither:
- Copy occupies columns 1-5 (not 1-6, see layout note below), Primary
  Visual spans columns 5-12 and bleeds 24-48px past the container edge
  (`margin-inline-end: -24px` / `-48px` at 1280px+) — an asymmetric,
  bleeding composition, not a contained split.
- No card grid anywhere in the Hero: Evaluation Ledger is a hairline-rule
  key/value list (`EvaluationLedger.astro`, `<dl>` with `border-top`
  rows), Process Rail is a single axis line with node markers
  (`AssemblySpine.astro` reused), not four cards.
- Primary/Secondary Visual sizing is asymmetric by construction (see §6),
  unlike Variant A's three equal-sized cards.

## 3. Absence of generic-tech-template feel

No blue/purple glow, no neon, no glassmorphism, no generic 3D spheres, no
particles — verified by reading `PrecisionSystemVisual.astro`'s full CSS
(only `linear-gradient`/`radial-gradient` in Paper/Steel/Copper hues, a
hairline hatching `<pattern>`, and `clip-path` framing). The visual
content is domain-specific (labeled-by-shape motion stage with ballscrew
hatching, vision head with corner registration marks, fixture with dashed
tolerance-zone part outline) rather than an abstract dashboard.

## 4. H1 line breaks (measured, both locales, all 4 required viewports + 1024px)

| Viewport | zh-tw lines | zh-tw width | en lines | en width |
|---|--:|--:|--:|--:|
| 1440×900 | 2 | 899px | 3 | 988px |
| 1024×900 | 2 | 701px | 3 | 701px |
| 768×1024 (tablet) | 2 | 624px | 3 | 720px |
| 390×844 | 4 | 350px | 4 | 350px |
| 360×800 | 4 | 320px | 4 | 320px |

All within the spec's caps (desktop ≤3, mobile ≤4). zh-tw desktop width
(899px at 1440px, 701px at 1024px) sits within/near the spec's ~850-980px
target band; the 1024px figure is naturally narrower since the H1 column
itself is narrower there.

**"組裝" split-across-line-break bug found and fixed**: the zh-tw H1's
first line ("把定位、檢測與組裝，") re-wrapped at mobile widths under normal
CJK auto-wrap rules, and the wrap point landed inside "組裝" (measured via
screenshot before the fix — the substring rendered as "…與組" / "裝，…" on
two separate visual lines). Fixed with a literal-string substitution
wrapping only that one two-character run in a `white-space: nowrap` span
(`FinalEditorialHero.astro`'s `headlineHtml`), verified clean afterward in
`zh-mobile-390.png` / `zh-mobile-360.png`. No isolated punctuation mark
found alone on any line at any measured viewport.

## 5. H1-vs-primary-visual weight balance

At 1440×900: H1 bounding box ≈ 899×160px (2 lines); Primary Visual
bounding box ≈ 660×509px (`primaryArea` 339,363px² measured via
`getBoundingClientRect()`), i.e. the visual is visually larger and lower
on the page than the headline, not competing for the same visual weight —
H1 anchors the top-left reading start, the visual dominates the right/
lower two-thirds. Font size does not exceed the shared `--fs-h1` token
(same scale as CC-02's variants, no artificial inflation).

## 6. Primary/Secondary visual hierarchy (measured)

| Viewport | Primary area (px²) | Secondary area (px²) | Ratio |
|---|--:|--:|--:|
| 1440×900 (zh) | 339,363 | 129,600 | 0.38 |
| 1440×900 (en) | 476,183 | 129,600 | 0.27 |

Secondary is hidden below 1024px (spec §7/§8 explicit allowance: "may be
hidden or merged into the primary visual on mobile/tablet"). At desktop,
secondary's AREA is 27-38% of primary's — read as a LINEAR dimension
(spec's own "35-50% smaller" phrasing most naturally describes a linear
shrink, not an area ratio), this corresponds to secondary being
√0.27–√0.38 ≈ 52-62% of primary's width/height, i.e. within the spec's
35-50%-smaller band (50-65% of original size). Documented here as the
interpretation used, since the spec text is ambiguous between linear and
area reading.

## 7. Absence of two equal-sized media frames

Primary and Secondary are visibly different sizes at every measured
viewport (0.27-0.38 area ratio, never ≈1.0) and Secondary shows a cropped
fragment (vision head + one alignment node only, `variant="secondary"` in
`PrecisionSystemVisual.astro`), not a second full three-station scene —
confirmed by reading the component's conditional render branch.

## 8. Absence of fake specs

`grep -F` for `±0.01`, `180 ms`, `180ms`, `型號可組合`, `configurable
models` against both built HTML files
(`dist/internal-preview/cc02-final/{zh-tw,en}/index.html`): 0 matches in
all four. Automated as a Playwright assertion in
`tests/e2e/cc02f-final-hero.spec.ts` ("contains no fabricated engineering
numbers"), which passed. Compare directly against the old Variant C in
`comparison-c-vs-final.png` (left panel visibly shows `±0.01 mm` / `< 180
ms`; right panel shows the Evaluation Ledger instead).

## 9. Absence of placeholder text

`grep -F "NO MEDIA"` against both built HTML files: 0 matches (also a
passing Playwright assertion). `PrecisionSystemVisual.astro` never calls
`CutawayWindow.astro`'s no-`src` placeholder path — it is a wholly
separate, always-populated SVG component.

## 10. Viewport checks

| Viewport | Screenshot | Overflow (scrollWidth ≤ clientWidth) |
|---|---|---|
| 1440×900 | zh-desktop.png / en-desktop.png | Pass (1440≤1440 both) |
| 1024×900 | (measured only, see §4) | Pass (1024≤1024 both) |
| 768×1024 | zh-tablet.png / en-tablet.png | Pass (768≤768 both) |
| 390×844 | zh-mobile-390.png / en-mobile-390.png | Pass (390≤390 both) |
| 360×800 | zh-mobile-360.png / en-mobile-360.png | Pass (360≤360 both) |

Both locales checked at every viewport (10 combinations, all pass).

## 11. Header

Desktop height measured 80px, mobile 64px (`getBoundingClientRect()`).
Language control tap target measured 52×61px (≥44×44px floor). Visual
weight: `.final-header__lang` uses no box border (only a 1px bottom rule
on hover/focus) versus the wordmark's 700-weight `--font-display` text —
confirmed via `en-desktop.png`/`zh-desktop.png` that the wordmark reads as
the dominant Header element, not the language control (contrast with
CC-02's `PrototypeHeader`, whose `.proto-header__lang` used a full 1px
bordered box at comparable visual weight to the logo).

## 12. CTA

Both buttons measured 50px tall (≥44px floor) at every viewport. At
1440px, English's longer secondary label ("Review Integration
Requirements") no longer overlaps the Primary Visual — this was a real
bug found and fixed during this round (see §14 Known Fixes below).

## 13. Reduced motion

`reducedMotion: 'reduce'` browser context, screenshot taken 150ms after
`networkidle` (`reduced-motion.png`): `[data-precision-visual]` element
carries `is-settled` and lacks `is-aligning`, confirming the fully-settled
end state renders with no pending animation frame. Automated as a
Playwright assertion (`tests/e2e/cc02f-final-hero.spec.ts`, "shows
settled state immediately with reduced motion") — passing on both
locales.

## 14. Known fixes made during this round (not hidden — recorded for the record)

1. **Primary Visual start position / visibility** — before fixing mobile
   vertical spacing, the Primary Visual started as low as 733-1167px from
   the top (measured), failing the spec's "≥30-40% visible within first
   844px, starts ≤~590-630px" requirement. Fixed by moving Evaluation
   Ledger to render AFTER (not before) the Primary Visual on mobile via
   CSS `order`, and tightening `.feh-sheet` top padding + heading/body/
   actions margins on mobile. Post-fix: visibility fraction 0.78-1.0 (zh),
   0.60-0.87 (en) — well above the 30-40% floor at every viewport.
2. **English H1 line-count overflow** — the shared `--fs-h1` token
   produced 4 lines at 1440px and 5-6 lines at mobile widths for the
   longer English copy (spec caps: 3 desktop, 4 mobile). Fixed with a
   dedicated `:lang(en)` clamp, tuned and re-measured until within caps
   at every required viewport (§4 table).
3. **zh-tw "組裝" split across a line break** — see §4.
4. **Secondary Visual too small** — initial implementation measured only
   8-12% of Primary's area (target ~27-42% area / 50-65% linear). Fixed
   by widening from a fixed 220px to a `clamp(260px, 26vw, 360px)` scale.
5. **Secondary Visual obscuring Primary's third station** — initial
   overlap position covered the assembly-workstation module entirely.
   Repositioned to overlap only the bottom-right corner
   (`transform: translate(2%, 38%)`), confirmed clean in `visual-detail.png`.
6. **English secondary CTA clipped under the Primary Visual at 1440px** —
   Copy column literally shared grid column 5 with the Visual column per
   a literal reading of spec §6 ("Copy: columns 1-5" / "Primary Visual:
   columns 5-11"). Re-read as Copy ending at column 5 (`grid-column: 1 /
   5`, four tracks) rather than sharing a column, which resolved the
   clipping while preserving the asymmetric ~5/~7 column split the spec
   intends. See `en-desktop.png` for the corrected result.

## 15. Contrast (measured, zh-tw desktop, matches documented DESIGN_SYSTEM.md tokens — no new pairings introduced)

| Element | Foreground | Background | Ratio |
|---|---|---|--:|
| H1 | ink-950 | paper-50 | 17.16:1 |
| Eyebrow / Ledger heading | copper-700 (`--color-action-primary`) | paper-50 | 6.06:1 |
| Body text / Ledger detail | steel-700 | paper-50 | 5.21:1 |
| Primary CTA | paper-50 on copper-700 | — | 6.06:1 |
| Secondary CTA | ink-950 | paper-50 | 17.16:1 |

All pairings reuse already-audited tokens from `docs/CONTRAST_AUDIT.md` /
`docs/DESIGN_SYSTEM.md` — no new color pairing was introduced this round.
axe-core (`tests/e2e/cc02f-final-hero.spec.ts`) independently confirms 0
critical/serious violations (including `color-contrast`) at both desktop
and mobile, both locales.

## 16. Portfolio bonus (non-blocking, reported per spec §十九)

Three distinct memory points present: (1) the Editorial H1 with its
explicit line break and asymmetric column placement, (2) the Precision
System Cutaway (a real multi-station diagram, not a generic tech
illustration), (3) the Process Rail's axis-and-node treatment (visually
distinct from a step-indicator UI pattern). The Hero reads as
domain-specific (motion + vision + assembly, engineering-drawing visual
grammar: hatching, tolerance band, datum origin) without requiring verbal
explanation — screenshot-worthy as a standalone portfolio piece per
`zh-desktop.png`.

## 17. Summary

No blocking issues remain open. All measured numbers in this document
were produced by the Playwright scripts described at the top, run against
the actual `astro preview` production build, not estimated.
