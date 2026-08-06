# CC-02I-05 — Brand Primitives and Hero Visual

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: component destination is now fixed (R1-03 — always
`src/components/sections/`, never `src/components/brand/`, no longer left
to the ticket owner's judgment). The `uid` contract is now fixed (R1-04 —
a required `uid: string` prop, `Hero.astro` always passes the literal
value `"homepage-hero-system"`, `Math.random()` is banned in production).
This ticket now runs *before* CC-02I-04 in the stage sequence (R1-09), not
after — Hero assembly always has a finished, real component to integrate,
never a placeholder.

## Revision note (R2)

Revision 2 per finding R2-02: the CSS motion-state selector convention is
corrected from a bare `data-motion-state` reference to the fully-scoped
`[data-hero-motion-root][data-motion-state="..."]` form, so these
components' CSS never accidentally matches an unrelated ancestor. No
change to the `uid` contract, component paths, or prop contracts from
Revision 1.

## 1. Ticket ID

CC-02I-05

## 2. Title

Production PrecisionSystemVisual, ProcessRail, EvaluationLedger at fixed paths

## 3. Purpose

Build the three production-ready visual components
(`PrecisionSystemVisual.astro`, `ProcessRail.astro`,
`EvaluationLedger.astro`) at their fixed, final location under
`src/components/sections/`, based on the CC-02F prototype's already-
reviewed design, fixing the one known locale gap
(`ProcessRail`'s inline aria-label ternary) and replacing
`Math.random()`-based SVG IDs with the fixed `uid` contract. This ticket
runs before CC-02I-04 (R1-09) so Hero assembly always has finished
components to consume.

## 4. Dependencies

CC-02I-01 (locale data — `ProcessRail`'s `railLabel`/`stateLabels` and
`PrecisionSystemVisual`'s `alt`/`secondaryAlt` values come from the new
`hero.*` dictionary keys).

## 5. Allowed paths

- `src/components/sections/PrecisionSystemVisual.astro` (new — fixed path,
  R1-03)
- `src/components/sections/ProcessRail.astro` (new — fixed path)
- `src/components/sections/EvaluationLedger.astro` (new — fixed path)

## 6. Forbidden paths

- `src/components/brand/**` — **no new file is created here.** The three
  components above are Hero-specific production section components, not a
  seventh Brand Primitive (R1-03, fixed decision, not a per-ticket
  judgment call).
- `src/components/brand/AssemblySpine.astro`, `DatumOrigin.astro`,
  `VisionLockFrame.astro`, `ToleranceBand.astro`, `ProcessStamp.astro`,
  `CutawayWindow.astro` — none of the six existing Brand Primitives'
  APIs are modified under this ticket.
- `src/pages/internal-preview/cc02-final/**`,
  `src/components/prototypes/cc02-final/**` — the CC-02F prototype route
  and its components are **never modified, never deleted, and never
  re-pointed to import from the new production location.** They remain a
  fully independent historical/visual-regression reference. Production
  components under this ticket are a controlled rewrite informed by the
  prototype's reviewed design — not a move, not a shared-import
  refactor.
- `src/pages/**` (CC-02I-04's scope)
- `src/data/locales/**` (already landed by CC-02I-01)

## 7. Expected files

- New: `src/components/sections/PrecisionSystemVisual.astro`
- New: `src/components/sections/ProcessRail.astro`
- New: `src/components/sections/EvaluationLedger.astro`

No file under `src/components/prototypes/cc02-final/` or
`src/pages/internal-preview/cc02-final/` is modified, moved, or deleted.

## 8. Implementation requirements

### PrecisionSystemVisual.astro

- Rebuilt at the fixed production path, informed by the CC-02F prototype's
  reviewed visual design (layered SVG: foreground module + Copper
  alignment nodes, midground Assembly Spine + Vision Frame + connectors,
  background hatching/tolerance bands/faded axes) — not copy-pasted
  verbatim, since the `uid` contract changes (below).
- **Fixed prop contract (R1-04)**:

  ```ts
  type Props = {
    uid: string;
    alt: string;
    secondaryAlt?: string;
    animated?: boolean;
  };
  ```

  `uid` is **required**, provided by the caller. Production usage in
  `Hero.astro` always passes the literal string `"homepage-hero-system"`.
  `Math.random().toString(36)` or any other runtime-generated ID is
  **banned** in this production component.
- Every SVG `id` used for a gradient, mask, clip-path, or ARIA
  cross-reference (`aria-labelledby`, `href="#..."`) is derived from
  `uid` — e.g. `${uid}-gradient-primary`, `${uid}-mask-vision-lock` — so
  IDs are deterministic and reproducible across builds, not random per
  render.
- SVG marked `aria-hidden="true"`; the required text alternative (`alt`/
  `secondaryAlt`) renders as visually-hidden text adjacent to the SVG.
- Reduced motion: full three-layer defense (tokens.css global duration-
  zero + component-local override setting animated elements' initial
  state to their settled end-state + no independent
  `IntersectionObserver` — see §8's Motion Orchestrator note below).
- **Motion Orchestrator integration (R1-06, selector fixed R2-02)**: this
  component does **not** create its own `IntersectionObserver`. It
  exposes CSS hooks that react to the ancestor Hero root's
  `[data-hero-motion-root][data-motion-state="settled|armed|running|
  complete"]` — never a bare `:root:not(...)` selector, which incorrectly
  targets `<html>` instead of the Hero root. `Hero.astro`'s single Motion
  Orchestrator (built in CC-02I-06) sets the attribute; this ticket
  implements only the CSS that responds to it. Default rendering (no JS,
  reduced motion, or before the bootstrap runs) is the fully settled end
  state — never a "not yet drawn" flash, and only decorative sub-elements
  of the SVG may differ between `settled` and `armed`; nothing
  accessibility-relevant changes.

### ProcessRail.astro

- Rebuilt at the fixed production path, wrapping the existing
  `AssemblySpine` Brand Primitive (unchanged API) with Hero-specific
  labels.
- **Fixed prop contract**:

  ```ts
  type Props = {
    steps: [string, string, string, string];
    railLabel: string;
    stateLabels: { unconnected: string; aligned: string; connected: string };
  };
  ```

  All required — no default English fallback inside the component (this
  is the fix for the CC-02F prototype's inline ternary). `Hero.astro`
  assembles `steps` from `hero.processRail.step1`–`step4` in that fixed
  order (R1-02's rendering contract) and passes `railLabel`/`stateLabels`
  straight from `hero.processRail`.
- `tabindex="0"` + `aria-label={railLabel}` on the horizontally-scrollable
  mobile container.
- Does **not** create its own `IntersectionObserver` — same Motion
  Orchestrator contract as `PrecisionSystemVisual` above (R1-06). Exposes
  the same `[data-hero-motion-root][data-motion-state]` hook pattern
  (R2-02); `AssemblySpine`'s own existing reveal behavior (if any) is left
  as static/non-interactive under Hero usage, matching the "current step
  may use Copper, other steps use Steel" static framing.

### EvaluationLedger.astro

- Rebuilt at the fixed production path, semantically identical to the
  CC-02F prototype's clean `<dl>`/`<dt>`/`<dd>` structure.
- **Fixed prop contract**:

  ```ts
  type Props = {
    groups: [
      { heading: string; detail: string },
      { heading: string; detail: string },
      { heading: string; detail: string },
    ];
  };
  ```

  `Hero.astro` assembles this as `[hero.ledger.input, hero.ledger.
  evaluation, hero.ledger.output]` in that fixed order.
- No client script, no animation, no `data-motion-state` hook needed —
  this component has no motion of its own.

## 9. Design requirements

- No new tokens. Reuses the exact CC-02F visual treatment as its design
  reference — this ticket is a controlled rebuild at a new location with
  a corrected prop/ID contract, not a redesign.
- Visual output (where locale copy is unchanged) should match the CC-02F
  prototype screenshots in `docs/screenshots/cc02-final/visual-detail.png`
  as the baseline reference.

## 10. Accessibility requirements

- `PrecisionSystemVisual`: SVG `aria-hidden="true"` + visible text
  alternative sourced from `alt`/`secondaryAlt` props.
- `ProcessRail`: `tabindex="0"` + `aria-label={railLabel}`, locale-correct
  in both routes (this is the fix this ticket delivers for the known
  CC-02F gap).
- `EvaluationLedger`: semantic `<dl>`/`<dt>`/`<dd>`.
- Full three-layer reduced-motion defense on `PrecisionSystemVisual` and
  `ProcessRail`'s CSS response to `[data-hero-motion-root][data-motion-
  state]` (R2-02 selector fix) — default/no-JS state is always the fully
  settled end state, never requiring JS execution to become visible or
  complete (this satisfies the Motion Orchestrator's "settled by default"
  contract from CC-02I-06's spec even though the orchestrator script
  itself is built there).

## 11. Performance requirements

- No client script in any of the three components themselves (motion
  triggering is centralized in `Hero.astro`'s orchestrator, built in
  CC-02I-06 — these three components are orchestrator-driven via CSS
  state selectors only).
- Record actual inline SVG byte size for `PrecisionSystemVisual` in
  completion evidence.

## 12. Locale requirements

- `ProcessRail`'s `railLabel` and `stateLabels` must render correctly in
  both zh-TW ("流程階段導覽" / 待處理·準備中·進行中) and en ("Process
  stages" / Pending·Preparing·In progress) — verify both.
- `PrecisionSystemVisual`'s `alt`/`secondaryAlt` verified in both locales.

## 13. Tests

- Reduced-motion end-state assertion (Playwright `reducedMotion: 'reduce'`
  context) for `PrecisionSystemVisual` and `ProcessRail`'s default
  rendering (no JS execution required to reach settled state).
- `ProcessRail` keyboard-focus + `aria-label` correctness in both locales.
- SVG ID uniqueness/determinism check: render the page twice (two builds
  or two SSR passes) and assert `PrecisionSystemVisual`'s SVG IDs are
  identical both times (proves no `Math.random()` — R1-04's acceptance
  bar).
- Content-integrity check: no forbidden visual language readings (no
  crosshair, no "NO MEDIA" text) — visual/manual check, documented with
  screenshot.
- Runtime visual/DOM tests that require the assembled Hero (not just the
  isolated component) are explicitly **deferred to CC-02I-04/06/07** — this
  ticket verifies the three components in isolation, not integrated.

## 14. Acceptance criteria

- [ ] All three components exist at `src/components/sections/` with the
      fixed prop contracts in §8 — no component under `src/components/
      brand/`.
- [ ] No `Math.random()` anywhere in any of the three components.
- [ ] All SVG/mask/clip-path/ARIA-reference IDs are derived from the
      `uid` prop, verified deterministic across two separate builds.
- [ ] `ProcessRail`'s `aria-label` ternary is gone — `railLabel` is a
      required prop with no in-component fallback.
- [ ] Reduced motion / no-JS default state is the fully-settled end state
      for both `PrecisionSystemVisual` and `ProcessRail`, verified via
      Playwright context.
- [ ] `src/components/prototypes/cc02-final/**` and
      `src/pages/internal-preview/cc02-final/**` have zero diff.
- [ ] `pnpm check` 0 errors/0 warnings.
- [ ] `pnpm typecheck` 0 errors.
- [ ] `pnpm build` succeeds (components exist but are not yet imported
      anywhere until CC-02I-04 — build must not fail on unused files).
- [ ] No change to any of the six existing Brand Primitives.

## 15. Completion evidence

- Diff showing the `railLabel` ternary removal (relative to the CC-02F
  prototype's `ProcessRail.astro`, as a design reference, not a file
  diff — since this is a new file at a new path).
- SVG ID determinism test output (two-build comparison).
- Reduced-motion screenshot/test output.
- Confirmation (`git diff --stat` or equivalent) that
  `prototypes/cc02-final/**` and `internal-preview/cc02-final/**` are
  untouched.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) confirms the fixed
`sections/` path was used (not `brand/`), confirms the `uid` contract
replaced `Math.random()`, and confirms the prototype route was left fully
untouched.

## 17. Rollback/failure conditions

If deriving every SVG sub-ID from `uid` produces an unreasonably long or
fragile ID scheme, use a short deterministic hash of `uid` (e.g. first 8
hex characters of a stable non-cryptographic hash) as the ID prefix
instead of the raw string — but the hash must still be a pure function of
`uid` (no randomness, no timestamp), and this substitution must be
recorded in completion evidence as a specific, deliberate implementation
detail, not silently done.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend coordinating with whichever agent takes CC-02I-04
given the tight integration seam between the two tickets (CC-02I-04 now
depends on this ticket's finished output, not a placeholder).

## 20. Estimated risk

Medium. This ticket is now a genuine rebuild (fixed path, fixed `uid`
contract) rather than a straight relocation, which is somewhat more
implementation work than the original version of this ticket, but the
CC-02F prototype provides a fully reviewed visual reference to rebuild
against, and the prototype route itself is completely insulated from any
risk this ticket introduces.
