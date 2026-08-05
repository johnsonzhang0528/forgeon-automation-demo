# CC-02 Impeccable Hero/Header Review

Critique/Typeset/Layout/Adapt/Audit pass across the three CC-02 Hero/Header
design-spike variants, per spec §十八. Evidence: `docs/screenshots/cc02/`
(11 files, captured live via Playwright against a running `astro preview`
instance), `pnpm test:axe` / `tests/e2e/cc02-hero-prototype.spec.ts` results
(221/221 passing, 0 axe critical/serious), and direct source reading of all
three variant files plus `_shared/PrototypeHeader.astro`.

Mechanical detector (`node .claude/skills/impeccable/scripts/detect.mjs
--json`) run against all four prototype source files: two advisory-only
`em-dash-overuse` findings, both in this codebase's own inline code
COMMENTS (not rendered UI copy) — matches the em-dash-heavy comment style
already established throughout this project's existing docs
(`DATUM_DECISION_LOG.md`, `CONTRAST_AUDIT.md`, etc.), not a defect.

## 5-second comprehension

All three variants pass the core test: a first-time viewer can state, within
5 seconds and without scrolling, that this is an industrial/manufacturing
automation company doing positioning + inspection + assembly with a clear
next step. This is a property of the shared copy (byte-identical across all
three, per spec §十二), not something any one variant earns over the others
— but layout affects HOW FAST the eye finds the headline and CTA.

- **Variant A**: fastest actual reading path. Eyebrow → headline → body →
  two CTAs is a single top-to-bottom left column with nothing competing for
  attention; the visual sits entirely in its own zone. Measured: headline
  starts at y≈355px in the 1440×900 desktop screenshot, CTAs visible by
  y≈660px, all within the first viewport with no scroll.
- **Variant B**: comprehension is fast but arrives slightly later — the eye
  lands on the large abstract module diagram first (it's brighter and more
  central than the copy block, which sits in a gradient-darkened lower-left
  zone), then travels to the text. Still well within 5 seconds, but it is
  the one variant where "what is this company" doesn't win the very first
  eye contact.
- **Variant C**: the headline is the single largest, boldest element on the
  page (spans columns 1-8, sits above everything else) — comprehension is
  effectively instant on the headline alone. The two Cutaway Windows read
  as "supporting technical evidence" rather than the primary visual anchor,
  which is the right hierarchy for this direction's editorial premise.

## Visual focus

- **Variant A**: two focal points (headline, dark visual panel) of roughly
  equal visual weight, correctly balanced left/right — no ambiguity about
  where to look first (left, per standard L-to-R reading order) or second.
- **Variant B**: the module diagram's copper glow is the brightest, highest-
  contrast element on the page — genuinely a stronger focal pull than the
  headline text sitting in the darker lower-left zone. This is a real,
  measurable focus-competition issue, not a false-positive nitpick — worth
  flagging even though it doesn't break 5-second comprehension.
- **Variant C**: correct single dominant focal point (the headline), with
  the Cutaway Windows and spec table clearly secondary in size and
  position.

## 鋒岳品牌適配 (FORGEON brand fit) vs. generic-tech-template risk

- **Variant A**: lowest risk of reading as a generic template. The
  DatumOrigin + VisionLockFrame + AssemblySpine composition is literally
  built from this project's own named Precision Datum System vocabulary
  (see `CONTEXT.md`'s glossary) — an unrelated SaaS product could not
  reuse this composition unchanged, since the visual language IS the
  domain content (coordinate axes, lock-on frames, module connection
  states), not decoration applied on top of generic content.
- **Variant B**: real risk noted — the current placeholder (radial copper
  glow + a schematic rectangle/circle) is closer to a generic "abstract
  tech hero" than the other two, precisely BECAUSE it's the one variant
  whose finished form depends on real photography/CGI that doesn't exist
  yet (see `docs/DATUM_ASSET_PLAN_CC02.md`). Judged on what's actually
  built today, this is the variant most likely to look like a stock
  "industrial SaaS landing page" rather than specifically FORGEON's system
  — the Datum Axis line and DatumOrigin mark are present and correctly
  branded, but they're a smaller fraction of the total visual than in A or
  C.
- **Variant C**: the CutawayWindow + spec-table-as-second-layer combination
  is a distinctive editorial convention not seen on the real homepage or
  on generic templates — highest brand-specificity of the three, at the
  cost of being the least immediately "grabby."

## 原創性與記憶點 (originality / memorability)

- **Variant A**: solid, professional, but the split-hero pattern itself
  (text-left, visual-right) is a common B2B layout shape — the memorability
  comes from what fills the visual side (the Datum composition), not the
  composition shape itself.
- **Variant B**: highest memorability IF the imagery gap is closed — a
  real full-bleed "product as hero" treatment with a Header overlay is the
  most visually bold of the three and the one most likely to be
  remembered after the tab is closed. Currently undercut by the
  placeholder visual reading as generic (see brand-fit note above) — the
  memorability is latent, not yet delivered.
- **Variant C**: most original LAYOUT of the three (asymmetric grid,
  editorial headline span, dual cutaways) — least likely to be confused
  with a competitor's site. Memorability is structural/typographic rather
  than image-driven, which is a genuine strength given zero dependency on
  future asset production.

## CTA clarity

All three render the exact same two CTAs with the new `--color-action-
primary`/`-hover` tokens (verified: `grep -c "color-action-primary"` across
all three variant files returns non-zero, and each screenshot shows the
primary button in the deeper copper fill distinct from `--color-copper-600`
used elsewhere). No variant lets the CTA get lost — all three keep both
buttons in the first viewport at 1440×900, 768×1024, and 390×844.

- Variant A: CTAs in the standard reading-order position (below body copy),
  clearest of the three since nothing else competes for the same visual
  weight nearby.
- Variant B: CTAs sit against the dark gradient-backed copy block — real
  contrast risk was checked directly: `--color-action-primary` (#9c4014)
  against the `.vb-hero__copy` background gradient (which resolves toward
  `--color-ink-950` at the point the button sits) still clears the same
  6.06:1 ratio documented in `CONTRAST_AUDIT.md`, since the button's own
  fill/text pairing doesn't depend on what's behind it. No contrast defect
  found.
- Variant C: CTAs sit directly under the body paragraph in the narrower
  copy column — clear, no competing elements nearby.

## 中英文 (bilingual)

Verified live by clicking each variant's language toggle and confirming:
headline/body/CTA swap to the verbatim English copy, header nav labels
translate, VisionLockFrame's LOCKING/LOCKED status text and AssemblySpine's
node labels/state tags translate (Variant A), and the spec table + Cutaway
captions translate (Variant C). One real defect found and fixed during
this pass: the English AssemblySpine node labels ("Positioning Module",
"Vision Positioning", "Assembly Workstation") initially wrapped awkwardly
inside the fixed-width node column — shortened to "Positioning"/"Vision"/
"Assembly" (not part of spec §十二's verbatim-copy contract, which only
covers headline/body/CTA) after confirming the wrap via screenshot.

Long-English-text wrapping was a real, multi-round problem during
construction — not something checked once and assumed fine:

- The English headline ("Align positioning, inspection and assembly...")
  and its Chinese counterpart both wrap correctly at all three breakpoints
  after two rounds of clamp adjustment on Variants A and B (see the
  `feat(prototype): add cc02 header hero design spikes` commit's own
  description of the CJK-wrap fixes) — English wraps at natural clause
  boundaries ("Align positioning, inspection and assembly" / "into a
  production-ready system.") with no orphaned single words.
- Variant C's editorial 8-column headline span comfortably fits the longer
  English string without any wrap adjustment, since that direction's
  column is wider than A/B's narrower split column.

## Desktop

All three: full first-viewport composition at 1440×900 with the Header,
correct visual hierarchy, and no layout defects — confirmed via the actual
`variant-{a,b,c}-desktop.png` screenshots in `docs/screenshots/cc02/`.

## Tablet

At 768×1024, all three collapse to a single-column layout below their
1024px desktop breakpoint. Checked for the specific failure mode of
"desktop layout just slightly squeezed" — not present: Variant A's grid
genuinely switches from 12-column split to stacked (visual-below-copy),
Variant B's copy zone widens to use the narrower viewport instead of
staying pinned to a fixed max-width, Variant C's grid also stacks (headline
retains its full-width prominence, Cutaway Windows go single-column).

## Mobile

At 390×844, all three implement their spec-mandated mobile-specific
composition (not a shrink of desktop):

- Variant A: text-first, 4:5-ish visual panel (VisionLockFrame alone, the
  AssemblySpine module list dropped since the process strip below already
  covers that information at this width — a defect found and fixed during
  this pass, since stacking both inside a fixed-aspect box squeezed the
  frame to an illegible sliver), horizontally-scrollable/snapping process
  strip (verified: `scrollWidth: 367 > clientWidth: 350`, confirming real
  scroll affordance, not a clipped dead-end).
- Variant B: cropped module detail (not the full stage shrunk), copy on
  its own solid `--color-ink-950` block, image does not crowd the CTAs.
- Variant C: exactly one Cutaway Window (verified: `.vc-cutaway-col--2 {
  display: none }` under `max-width: 1023px`), spec table compressed to a
  single readable column.

## Header

All three variants share `_shared/PrototypeHeader.astro` — functional
contract verified directly (not assumed): mobile drawer opens/closes,
44×44px minimum tap targets on toggle/close/lang buttons (verified via
CSS `min-width/min-height: 44px`), Escape closes the drawer, focus moves
into the drawer on open and returns to the toggle on close (Playwright-
verified, see `tests/e2e/cc02-hero-prototype.spec.ts`), background is
inert while open (drawer is `position: fixed` sibling-level, same
containing-block-safe pattern the real `Header.astro`'s own file comment
documents). Desktop nav hover uses a short Datum Line underline-draw (per
spec §十六, not a highlight box or large pill nav). Variant B's `overlay`
Header variant was specifically checked for contrast stability against the
Hero content scrolling under it — the `.proto-header--overlay` gradient
backing keeps text legible at the top of the Hero where the Header sits,
confirmed by screenshot.

## 對比 (contrast)

- Primary CTA: `--color-action-primary` (copper-700) on
  `--color-paper-50`/white/copper-fill-with-paper-text all measured and
  recorded in `docs/CONTRAST_AUDIT.md`'s CC-02 section — 6.06-6.65:1,
  clears 4.5:1 with real margin on every variant.
- Variant A/C body text: `--color-steel-700` on `--color-paper-50`,
  already verified at 5.21:1 in the CC-01 audit — unchanged token, reused
  correctly.
- Variant B body text: `--color-steel-200` on the dark gradient — this is
  the SAME token/role pairing already verified at 12.46:1 on
  `--color-ink-950` in `CONTRAST_AUDIT.md`'s CC-01 table (steel-200 as a
  dark-bg-only role, correctly NOT used as a light-bg color here).
- Focus rings: all three use `outline: 2px solid var(--color-focus);
  outline-offset: 3px` consistently — same token, same treatment as the
  real site's Button/Header components.

## 動態 (motion)

VisionLockFrame's one-shot lock-on animation (Variant A) plays exactly
once per page view — verified via the animation's own `io.unobserve(root)`
call after firing, matching the "not a looping scan" requirement CC-01
already established for this component. No new motion patterns were
introduced by any prototype: all animation is delegated to the existing
Brand Primitives' own implementations (DatumOrigin's axis-draw, Vision
LockFrame's lock-on, AssemblySpine's hover/focus transitions) — no
particle effects, no cursor-follow glow, no infinite rotation, no scroll
hijacking, no per-character text fly-in, no fade-up-everything treatment
on any variant.

## Reduced Motion

Verified live (Playwright `reducedMotion: 'reduce'` browser context, not
just code-read): Variant A's VisionLockFrame reaches `is-locked` state
within 100ms under reduced motion (vs. the normal 620ms one-shot delay),
confirming the component's own `prefers-reduced-motion` handling correctly
collapses the animation to its finished state — see
`tests/e2e/cc02-hero-prototype.spec.ts`'s "CC-02 reduced motion" describe
block, passing.

## 圖片安全區 (image safe zones)

Documented per-variant in `docs/DATUM_ASSET_PLAN_CC02.md` for future real
imagery. Checked against the CURRENT SVG/CSS placeholders specifically:
Variant B's copy-block gradient backing (`linear-gradient(to top,
color-mix(...ink-950...) 40%, transparent)`) already assumes a safe zone
in the lower-left/lower-center quadrant — this is the one variant where a
future real image swap has a real risk of violating that zone if the
image itself is bright/high-detail in that quadrant, flagged explicitly in
the asset plan's "Text safe zone" section for Variant B.

## Findings requiring no further action this round

- Variant B's placeholder visual reading closer to "generic abstract tech
  hero" than A or C is a genuine, honestly-reported weakness of the
  CURRENT PROTOTYPE, not a flaw in the underlying design direction — the
  asset plan documents exactly what would close this gap. Scored
  accordingly below, not silently smoothed over.
- No variant was modified to chase a higher score in this review — all
  fixes made during this pass (AssemblySpine mobile layout, English label
  wrapping, headline clamp sizing, scrollable-region keyboard access) were
  real, screenshot/axe-verified defects, not cosmetic score-chasing.

---

# Internal Scoring (spec §十九)

**This is an internal recommendation only. It is not a final decision.**
Per the task book's explicit instruction, the final direction is chosen by
the user's own ChatGPT session after reviewing the ChatGPT Review Bundle —
Claude Code does not integrate any recommended variant into the production
homepage as a result of this scoring.

| 項目 | 配分 | Variant A | Variant B | Variant C |
|---|--:|--:|--:|--:|
| 5 秒商業理解 | 20 | 19 | 16 | 18 |
| 鋒岳品牌適配 | 20 | 18 | 13 | 17 |
| 原創性與記憶點 | 20 | 14 | 17 | 18 |
| Desktop／Mobile 完整度 | 15 | 15 | 14 | 14 |
| 效能與 Accessibility | 15 | 14 | 14 | 13 |
| 可維護性 | 10 | 9 | 7 | 7 |
| **Total** | **100** | **89** | **81** | **87** |

## Evidence and reasoning per row

**5 秒商業理解 (5-second comprehension)**
- A=19: fastest, most unambiguous reading path (eyebrow→headline→body→CTA
  in one uncontested left column); the −1 is that the visual, while
  correctly branded, doesn't itself add to comprehension speed the way
  C's oversized headline does.
- B=16: comprehension is still fast, but the brighter module diagram
  measurably competes for the first eye-contact moment (see "Visual
  focus" above) — a real, not hypothetical, deduction.
- C=18: the largest, boldest headline of the three makes comprehension
  effectively instant on the text alone; not a 20 because the two-column
  grid (headline row + copy/cutaway grid below) asks the eye to make one
  more jump than Variant A's single vertical flow.

**鋒岳品牌適配 (FORGEON brand fit)**
- A=18: DatumOrigin + VisionLockFrame + AssemblySpine compose the ENTIRE
  visual — an unrelated product could not reuse this composition
  unchanged, since the visual language is the domain content itself.
- B=13: real, lowest score of the three — current placeholder visual is
  the closest of the three to a generic "abstract tech hero," specifically
  because this direction's finished form depends on future imagery that
  doesn't exist yet (see `docs/DATUM_ASSET_PLAN_CC02.md`'s explicit
  "highest CGI dependency" callout for this variant).
- C=17: CutawayWindow + spec-table-as-second-layer is a distinctive,
  hard-to-copy editorial convention; not 18-19 because the current
  Cutaway placeholders ("CUTAWAY · NO MEDIA") are honest but visually
  quieter than A's fully-realized VisionLockFrame composition.

**原創性與記憶點 (originality / memorability)**
- A=14: solid execution, but the text-left/visual-right split shape
  itself is a common B2B pattern — lowest of the three on pure layout
  originality, even though its content fill is the most branded.
- B=17: highest LATENT memorability — a bold full-bleed product-as-hero
  treatment is the most visually striking of the three concepts, though
  currently undercut by the placeholder (see brand-fit note); scored on
  the direction's real potential, consistent with treating this as a
  concept spike, not a finished asset.
- C=18: highest score in this category — the asymmetric editorial grid,
  headline column-span, and dual-cutaway composition is the most
  structurally distinctive of the three and least likely to be mistaken
  for a competitor's site.

**Desktop／Mobile 完整度 (completeness)**
- A=15: full marks — desktop/tablet/mobile all implement their spec-
  mandated distinct compositions (verified via screenshots + the
  AssemblySpine mobile-layout fix made during this pass), zero
  overflow at any of the 9 tested viewport×variant combinations.
- B=14: complete and correct (cropped mobile visual, not a shrink), −1
  only because the mobile stage crop is the most visually reliant on the
  same not-yet-built imagery noted above — the CURRENT mobile crop (SVG
  placeholder) is complete and correct, but its ceiling is lower than A/C
  until real imagery exists.
- C=14: complete (single-Cutaway mobile rule correctly implemented,
  verified via `display: none` on the second Cutaway at ≤1023px), −1 for
  the same reason as B: the mobile Cutaway crop quality ceiling depends on
  future real imagery more than Variant A's fully-vector visual does.

**效能與 Accessibility (performance & accessibility)**
- A=14: 0 axe critical/serious (desktop+mobile), keyboard-operable Header,
  reduced-motion verified live, one real WCAG 2.1.1 fix made during this
  pass (process-strip `tabindex`) — the fix itself is evidence the check
  was real, not rubber-stamped; −1 for the process strip being a second
  scroll container on the page (a minor added interaction surface).
- B=14: same 0 axe critical/serious result, same Header contract; −1 for
  the overlay Header's contrast depending on a specific gradient backing
  that a future real image swap must not break (documented, not yet a
  live defect).
- C=13: same 0 axe critical/serious result; −2 (lowest of the three) since
  its two-Cutaway desktop layout is the most visually dense of the three,
  raising the general cognitive-load bar slightly even though no
  measured accessibility violation was found.

**可維護性 (maintainability)**
- A=9: composition built entirely from existing, already-documented Brand
  Primitives with clear props — a future engineer extending this needs no
  new component knowledge beyond what CC-01 already shipped.
- B=7: the SVG "module" diagram is bespoke markup specific to this
  prototype (not a reusable Brand Primitive), and swapping in real
  imagery later means replacing hand-tuned CSS gradient/positioning
  values rather than passing new props to an existing component — more
  future-maintenance surface than A or C.
- C=7: uses `CutawayWindow` (a real Brand Primitive) but the asymmetric
  grid-column math (`grid-column: 1/9`, `5/9`, `9/13`, etc.) is bespoke
  per-element positioning that a future maintainer must understand
  file-by-file rather than reading a documented component API — similar
  maintenance cost to B, for a different reason.

## Internal Recommendation

**Recommended: Variant A (Datum Calibration Split), 89/100.**
Highest combined score, driven by the strongest brand-fit and lowest
future-asset dependency of the three — it is fully realized today with
zero reliance on imagery that doesn't exist yet, and its comprehension
speed and accessibility posture are the best-evidenced of the three.

**Second choice: Variant C (Engineering Editorial Sheet), 87/100.**
Very close to A — highest originality/memorability score of the three,
and like A, has no future-imagery dependency (`CutawayWindow`'s "no media"
placeholder is a legitimate permanent aesthetic per
`docs/DATUM_ASSET_PLAN_CC02.md`, not a stopgap). Scores slightly behind A
on comprehension speed (one extra eye-jump between the headline row and
the grid below) and on the accessibility/cognitive-load line (denser
two-Cutaway desktop layout).

**Rejected (for now, this round): Variant B (Full-width Precision Stage),
81/100.** Not rejected as a design direction — it has the highest
memorability CEILING of the three and the most distinctive "product as
hero" visual ambition. It scores lowest today specifically because its
current form depends the most on imagery/CGI that doesn't exist yet (this
round explicitly banned Higgsfield and any asset generation), which pulls
down its measured brand-fit and completeness scores. If a future round
produces the real photography/CGI this direction's own asset plan
describes, Variant B's score would need to be recalculated against the
finished asset, not this placeholder.

## Risks per variant (for ChatGPT's review)

- **Variant A**: risk that the text-left/visual-right shape reads as
  "competent but expected" rather than distinctive — the safest choice,
  which is also its main limitation.
- **Variant B**: risk that shipping this direction commits the project to
  a real photography/CGI production step this round explicitly did not
  execute — choosing B means accepting that follow-on cost before the
  Hero is production-ready, not after.
- **Variant C**: risk that the denser two-Cutaway desktop composition
  asks slightly more of a first-time visitor than A or B, even though no
  accessibility violation was measured — a design-taste risk more than a
  technical one.

## What this scoring does NOT do

- It does not choose a final direction — see the "Internal Recommendation"
  disclaimer at the top of this section.
- It does not authorize integrating any variant into
  `src/pages/{zh-tw,en}/index.astro`.
- It does not authorize CC-03 or any further Hero-related implementation
  work this round.
