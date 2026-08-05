# DATUM_ASSET_PLAN_CC02F.md

Optional future-enhancement plan for the C+ Primary System Visual, written
from what this round actually built (a real, original SVG/CSS asset — see
`src/components/prototypes/cc02-final/PrecisionSystemVisual.astro`) toward
what a future stage COULD add if the direction is approved for
production. **Higgsfield was not used this round, anywhere, for any
purpose, not even preview.** This document is a plan for a possible future
stage — it is not, and must not be read as, a generation request. No asset
generation was submitted this round or any prior round.

The SVG version built this round (`PrecisionSystemVisual.astro`, described
in `docs/engineering/reviews/CC-02F-impeccable-review.md` §3/§6/§9) stands
on its own and does not depend on this plan ever being executed —
Higgsfield is not an excuse for lower quality now (spec §十四's explicit
instruction), and the current SVG has already passed the "no NO MEDIA
placeholder, no generic-tech-dashboard" bar the Impeccable review checked.

## What a future CGI enhancement would replace

Only the Primary System Visual's main mechanical module content (the
three-station scene: motion module, vision head, assembly workstation)
would be replaced by one concept CGI image. The SVG Datum Origin, Vision
Lock corner-mark overlay, and Assembly Spine axis/node line would remain
as frontend-rendered overlays on TOP of the CGI image, not replaced by
it — same layered-composition principle
`docs/DATUM_ASSET_PLAN_CC02.md`'s Variant A section already established
(SVG brand-language elements stay code-driven; only the photographic/CGI
"module" content itself would be swapped in).

## Image count cap — 4 maximum, per spec §十四

| # | Purpose | Notes |
|---|---|---|
| 1 | Desktop Hero CGI (Primary Visual main scene) | Replaces the SVG's foreground/midground module content only; background hatching/tolerance-band/axis layer stays SVG. |
| 2 | Mobile crop | A distinct 4:5/near-1:1 crop of the same scene's central module (per spec §十五's "distinct crop, not a shrunk desktop image" rule) — not a second independent composition. |
| 3 | Candidate angle A | For internal selection only, never shipped alongside the chosen image. |
| 4 | Candidate angle B | Same as above. |

No more than these 4 images would ever be requested for this specific
enhancement, even across multiple candidate rounds — this is a hard cap,
not a starting estimate.

## Specification (for whenever this plan is actually executed)

- **Ratio:** Desktop ~4:3 (matches `PrecisionSystemVisual`'s current `640
  x 480` viewBox proportions exactly, so the CGI layer drops into the same
  aspect the SVG overlay already assumes). Mobile crop ~4:5 or near-1:1
  per spec §十五.
- **Viewing angle:** 3/4 elevated angle along the assembly-line axis (left
  to right = input to output), matching the SVG version's own left-to-right
  station arrangement and the explicit "input-to-output direction"
  requirement (spec §9/§13) — a future CGI render should preserve this
  reading direction, not introduce a different one.
- **Lighting:** Even, cool industrial lighting with a soft falloff at the
  frame edges — consistent with the current SVG's Paper/Steel gradient
  treatment (`--color-steel-200` highlight to `--color-ink-800` shadow),
  so the CGI layer doesn't visually clash with the SVG overlay elements
  still rendered on top of it.
- **Background:** Warm paper tone (`--color-paper-50`/`--color-paper-100`
  range) with visible engineering hatching, matching the SVG background
  layer that would remain — NOT a dark-ink stage backdrop (that visual
  language is reserved for Variant B's dark-stage direction per §一,
  explicitly not to be reintroduced into this Hero).
- **Text safe zone:** None required on the image itself — Hero copy sits
  entirely in the Copy column (columns 1-5), outside the visual area, in
  the current layout.
- **Materials/finish:** Machined aluminum/steel finish, Copper-toned
  alignment markers matching `--color-copper-500`/`--color-copper-600` —
  no chrome/glass/glossy-plastic finish that would read as consumer
  electronics rather than industrial equipment.
- **SVG fallback:** The current `PrecisionSystemVisual.astro` component
  IS the permanent fallback — it must continue to render (unchanged) for
  any build/deploy path that doesn't have the future CGI asset, per the
  same "no broken/incomplete state" principle
  `docs/DATUM_ASSET_PLAN_CC02.md` established for the CC-02 variants.
- **Prohibited content:** No real company logos/branding on any depicted
  equipment (fictional company — see Demo Mode disclaimer convention),
  no identifiable people, no unsafe-condition depictions (exposed moving
  parts without guarding), no burned-in spec numbers/text baked into the
  pixels (the Evaluation Ledger already carries real, editable text — an
  image must not duplicate or contradict it with unmaintainable numbers).

## Confirmation this round did not use Higgsfield

A grep for the literal string "higgsfield" (case-insensitive) across
`src/components/prototypes/cc02-final/`,
`src/pages/internal-preview/cc02-final/`, and `src/data/cc02-final-
hero.ts` finds exactly one hit, in `PrecisionSystemVisual.astro`'s own
file-header comment ("Not a Higgsfield asset (none used this round..."), a
compliance note explaining why the visual is SVG/CSS only — the same
pattern `docs/DATUM_ASSET_PLAN_CC02.md`'s own closing note documents for
`variant-b.astro`'s equivalent comment. It is not a reference to any
Higgsfield call, import, or dependency. No Higgsfield skill/tool was
invoked at any point during this round, for preview or otherwise. This
document itself is prose only — writing it did not constitute or require
any generation call.
