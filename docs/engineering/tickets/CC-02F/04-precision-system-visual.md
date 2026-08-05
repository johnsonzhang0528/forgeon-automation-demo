# CC-02F-04 — PrecisionSystemVisual (real original asset)

## Goal

Build a real, original SVG/CSS Primary Visual that stands on its own —
Higgsfield is not an excuse for lower quality now (see
`docs/DATUM_ASSET_PLAN_CC02F.md` for the optional future CGI plan, not
built this round).

## Scope

New component: `src/components/prototypes/cc02-final/
PrecisionSystemVisual.astro`.

Must legibly convey: precision motion module, vision positioning head,
assembly workstation, a physical/process connection between modules, Datum
Origin, Vision Lock, Assembly Spine, an input-to-output direction.

Layering: foreground (primary module, Copper alignment nodes, metal-edge
highlights), midground (Assembly Spine, Vision Frame, module connectors),
background (engineering hatching/section lines, tolerance bands, faded
coordinate axes).

Not just crosshairs/dashed boxes/circles/grids/"NO MEDIA"/a generic
dashboard/random lines — and specifically does NOT reuse
`CutawayWindow.astro`'s no-`src` placeholder path (which renders the
literal text "CUTAWAY · NO MEDIA" — banned by spec §十九).

Allowed: SVG gradient/mask/clip-path, subtle noise pattern, paper/metal
contrast. Forbidden: blue-purple glow, neon, glassmorphism, generic 3D
spheres, particles.

SVG-first, no Canvas/WebGL, animation via transform/opacity/stroke only,
settles fully under reduced motion, `aria-hidden` on the decorative graphic
with a real text alternative provided by the caller.

## Secondary Visual

Same component family, smaller instance (35-50% smaller), connected via
partial overlap or an axis-line connector — not a second, equal-sized
Cutaway Window.

## Acceptance criteria

- [ ] No literal "NO MEDIA" (or any placeholder) text anywhere in the
      rendered output.
- [ ] No blue/purple glow, neon, or glassmorphism in the computed styles.
- [ ] Renders in a fully-settled state with zero animation frames pending
      under `prefers-reduced-motion: reduce`.
- [ ] `aria-hidden="true"` on the SVG, with a sibling text alternative.
