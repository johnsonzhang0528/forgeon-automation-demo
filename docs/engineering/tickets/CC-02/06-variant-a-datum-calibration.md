# 06 — Variant A: Datum Calibration Split

**What to build:** Text-left/visual-right split Hero built around
"calibration" as the first-glance legible action — 12-column desktop grid
(copy in columns 1–6, visual in columns 6–13, visual crossing the
container edge), DatumOrigin + module axis + VisionLockFrame + Assembly
Spine composing the visual, a 4-step process strip (INPUT/ALIGN/INSPECT/
ASSEMBLE) below the fold line. Mobile: text-first, 4:5 visual (not a
scaled-down desktop image), horizontally snapping process strip, max 2
CTAs.

**File scope:**
`src/pages/internal-preview/cc02-hero/variant-a.astro` only (plus the
shared copy module from ticket 05, read-only).

**Blocked by:** Ticket 05.

**Status:** done

- [x] Uses `src/components/brand/DatumOrigin.astro`,
      `VisionLockFrame.astro`, `AssemblySpine.astro` as the actual visual
      composition, not just referenced in prose.
- [x] Uses the shared bilingual copy verbatim (zh-tw and en both render
      from the page via `?lang=` or locale toggle within the prototype —
      see ticket 05's shared module).
- [x] Primary CTA renders `--color-action-primary` /
      `--color-action-primary-hover`.
- [x] No square/boxed Hero widget as the final visual centerpiece.
- [x] Desktop/tablet/mobile all implemented per spec §十三's own layout
      rules (not one uniform scale-down).
- [x] No Higgsfield asset used or referenced as required.
- [x] Reduced-motion respected (delegates to each Brand Primitive's own
      handling).
