# DATUM_ASSET_PLAN_CC02.md

Asset requirements for a future production build of each CC-02 Hero
variant, written from what this round's prototypes actually built (tokens
+ SVG + the six Brand Primitives, zero photography/CGI) toward what each
direction would need if selected. **Higgsfield was not used this round,
anywhere, for any purpose** — this document is a plan for a future stage,
not a generation request. No asset generation was submitted.

## Variant A — Datum Calibration Split

**Is CGI required?** No — this is the variant that works acceptably even
in its current form (tokens + Brand Primitives + a hand-drawn SVG
"technical schematic" placeholder inside `VisionLockFrame`). A production
version could ship as-is or add a light photographic/CGI layer purely as
an enhancement, not a requirement.

- **If enhanced with imagery:** 1 image, the module/workpiece shown inside
  the `VisionLockFrame` slot (currently an SVG placeholder).
- **Ratio:** 4:3 or 1:1 (matches `VisionLockFrame`'s existing aspect
  handling — see `CutawayWindow`/`VisionLockFrame`'s own `aspect-ratio`
  CSS for the exact figures).
- **Viewing angle:** 3/4 top-down, consistent with an inspection-station
  camera viewpoint (matches the "vision positioning" narrative the copy
  makes).
- **Lighting:** Even, cool-white industrial lighting, minimal specular
  highlight — needs to read clearly at both the desktop's larger frame and
  the mobile 4:5 crop.
- **Background:** Near-black/dark-ink, matching `--color-ink-950` so the
  copper corner marks and feature points stay legible against it (same
  contract `VisionLockFrame`'s own file-header comment already documents
  for its typical use case).
- **Text safe zone:** None on the image itself — Hero copy sits entirely
  outside the visual column in this layout, so no overlay-text zone is
  needed.
- **Mobile crop:** 4:5, center-weighted on the module's working area (not
  a uniform shrink of the desktop frame — spec §十三's explicit mobile
  rule).
- **SVG fallback:** Already shipped — the current placeholder SVG
  (concentric circle + crosshair schematic inside the dark frame) is a
  legitimate permanent fallback, not just a stand-in, since
  `CutawayWindow`'s own precedent already treats "no image" as a real,
  designed state rather than a broken one.
- **Prohibited content:** No real company logos/branding on any depicted
  equipment (this is a fictional company — see Demo Mode disclaimer
  convention used sitewide), no visible human faces/identifiable people
  (keeps the image about the equipment, not a stock-photo model), no
  competitor product markings.
- **Estimated generation cap (future stage, not this one):** 1 hero image
  + 2-3 alternate crops for responsive testing = 3-4 images maximum.

## Variant B — Full-width Precision Stage

**Is CGI required?** Yes, for a production-quality version — this is the
variant with the highest future asset dependency of the three. The current
prototype's SVG technical-diagram "module" (a schematic rectangle/circle
composition) reads clearly as a placeholder, not as the "material stage"
the direction's own core idea calls for ("把模組與製程當成舞台主角").
Shipping this direction for real needs either real product photography of
an actual physical module/workstation, or a CGI render built to the same
material-and-lighting language `DESIGN_SYSTEM.md` already establishes
(warm paper / deep ink / copper accent).

- **Image count:** 1 primary full-width hero image (desktop) + 1
  cropped/reframed version for mobile (per spec §十四's explicit "改為局部
  模組裁切" mobile rule — not the same image scaled down).
- **Ratio:** Desktop ~21:9 to 16:9 (near-full-viewport-width Hero,
  `min-height: 640-820px` per the current CSS) / Mobile ~4:3 (cropped
  detail, current prototype uses a 260px-tall band).
- **Viewing angle:** 3/4 hero angle showing the module as a "product on a
  stage" — not a flat catalog product shot, closer to an automotive/tech
  launch hero image convention, consistent with the direction's own
  "Full-width Precision Stage" name.
- **Lighting:** Directional, single dominant light source with a visible
  falloff toward the frame edges (motivates the existing radial-gradient
  "material layering" the CSS already fakes with
  `radial-gradient(...copper-700...)`) — a real photographed/rendered
  version should replicate this falloff so the Header's overlay treatment
  (`.proto-header--overlay`) still reads with stable contrast on top of
  it, not just on the current flat gradient.
- **Background:** Deep ink (`--color-ink-950`/`--color-ink-800` range),
  matching the current CSS gradient exactly, so a swapped-in image doesn't
  visually clash with the surrounding page chrome.
- **Text safe zone:** Lower-left to lower-center quadrant must stay
  low-detail/low-contrast-variance — that's where Hero copy sits
  (`.vb-hero__copy`'s `linear-gradient(to top, ...)` backing already
  assumes this and would need the real image to cooperate, not fight it,
  the way a busy or bright lower-left region would).
- **Mobile crop:** A genuine close-up detail crop of the module (not the
  full stage shrunk) — roughly the module's central mechanical
  detail/circular feature, matching what the current SVG's `circle`
  element occupies proportionally.
- **SVG fallback:** The current prototype's SVG technical diagram is
  already a legitimate no-JS, no-image fallback (works with images
  disabled, loads instantly, zero additional requests) — a production
  build should keep it as the `<noscript>`/slow-connection fallback even
  after adding real imagery, not replace it outright.
- **Prohibited content:** No real company branding, no identifiable
  people, no depiction of an unsafe operating condition (exposed moving
  parts without guarding, missing PPE on any depicted person if a person
  is ever added later) — this is a portfolio/demo site for a fictional
  industrial company and must not imply real regulatory claims.
- **Estimated generation cap (future stage):** 1 hero composition + 1
  mobile crop + up to 2 lighting/angle variants for internal selection = 4
  images maximum.

## Variant C — Engineering Editorial Sheet

**Is CGI required?** No — this direction's own design language is built
around `CutawayWindow`'s "no media" placeholder as a legitimate permanent
aesthetic choice (a labeled technical cutaway diagram, not a photo), and
the copy/spec-table layer is entirely typographic. This is the variant
LEAST dependent on future CGI/photography of the three.

- **If enhanced with imagery:** 2 images, one per `CutawayWindow` slot
  (desktop shows both; mobile shows only the first — spec §十五's explicit
  "保留一個主要 Cutaway" rule).
- **Ratio:** 4:3 (matches `CutawayWindow`'s own `aspect-ratio: 4/3` CSS
  exactly — no new ratio to source against).
- **Viewing angle:** True cutaway/cross-section framing (an actual
  mechanical cross-section view, matching the component's name and its
  existing angled-polygon `clip-path` treatment) — this is the one variant
  where the visual convention itself (engineering cutaway) is more
  specific than a generic product photo, so any future imagery needs to be
  purpose-built for this, not a repurposed catalog shot.
- **Lighting:** Even technical-diagram lighting (flat, minimal shadow) —
  matches an engineering-drawing convention rather than a dramatic product
  shot, consistent with this direction's whole "engineering-drawing +
  editorial" premise.
- **Background:** Dark ink, matching the current placeholder's
  `repeating-linear-gradient` hatching treatment.
- **Text safe zone:** None on the image — captions sit below each
  `CutawayWindow` as separate DOM text, not overlaid.
- **Mobile crop:** Not applicable to the single retained Cutaway's image
  itself (same 4:3 ratio, no separate mobile crop needed) — the layout
  change on mobile is which Cutaway is shown/hidden, not how the image
  itself is cropped.
- **SVG fallback:** Already shipped and, per this direction's own design
  premise, arguably the PREFERRED permanent state rather than a fallback
  — the "CUTAWAY · NO MEDIA" labeled placeholder reads as an intentional
  technical-document convention (an engineering drawing that hasn't had
  its photo insert added yet), not as a broken/incomplete page the way a
  generic missing-image icon would.
- **Prohibited content:** Same as the other two variants (no real
  branding, no identifiable people, no unsafe-condition depictions) plus:
  no fabricated precision/performance claims baked into the image itself
  (e.g. burned-in spec numbers that don't match the adjacent real spec
  table) — the spec table already carries that information as real,
  editable text; an image should not duplicate it as unmaintainable
  pixels.
- **Estimated generation cap (future stage):** 2 cutaway images (one per
  window) + 1 alternate angle per window for selection = up to 6 images
  maximum.

## Cross-variant notes

- All three variants' current placeholder/schematic visuals were built
  entirely from `tokens.css` values, plain SVG, and CSS gradients — zero
  external image assets, zero Higgsfield calls, zero third-party stock
  imagery. This plan describes what a LATER stage would need if a
  direction is chosen and taken to production; it is not a request queued
  for this round.
- Every "prohibited content" list above independently repeats the
  no-real-branding / no-identifiable-people / no-unsafe-depiction rules
  because each variant's image sourcing could plausibly happen on a
  different future timeline — a reviewer picking up only one variant's
  section later should not have to cross-reference this file's other
  sections to find the same constraints.
- None of the three variants' current prototype pages calls, imports, or
  depends on Higgsfield in any way. A grep for the literal string
  "higgsfield" (case-insensitive) across
  `src/pages/internal-preview/cc02-hero/` finds exactly one hit, in
  `variant-b.astro`'s own file-header comment — the sentence "No
  CGI/photography exists yet (Higgsfield is banned this round)," a
  compliance note explaining why the visual is SVG/CSS only, not a
  reference to any Higgsfield call, import, or dependency.
