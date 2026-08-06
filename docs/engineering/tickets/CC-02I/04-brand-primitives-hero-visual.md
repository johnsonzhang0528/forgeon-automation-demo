# CC-02I-05 — Brand Primitives and Hero Visual

## 1. Ticket ID

CC-02I-05

## 2. Title

Promote PrecisionSystemVisual, ProcessRail, EvaluationLedger to production

## 3. Purpose

Move the three CC-02F prototype-only visual components
(`PrecisionSystemVisual.astro`, `ProcessRail.astro`,
`EvaluationLedger.astro`) out of `src/components/prototypes/cc02-final/`
into a production location, fix the one known locale gap
(`ProcessRail`'s inline aria-label ternary), and give each a clean prop
contract that `Hero.astro` (CC-02I-04) can consume. This ticket owns the
System Visual asset itself — CC-02I-04 owns the grid/copy it sits inside.

## 4. Dependencies

CC-02I-01 (locale data — `ProcessRail`'s `railLabel`/`stateLabels` and
`PrecisionSystemVisual`'s `alt`/`secondaryAlt` values come from the new
`hero.*` dictionary keys).

## 5. Allowed paths

- `src/components/sections/PrecisionSystemVisual.astro` (new location —
  or `src/components/brand/`, per spec §8.2's either/or; ticket owner
  decides and records the reasoning)
- `src/components/sections/ProcessRail.astro` (new location)
- `src/components/sections/EvaluationLedger.astro` (new location)

## 6. Forbidden paths

- `src/components/brand/AssemblySpine.astro`,
  `DatumOrigin.astro`, `VisionLockFrame.astro` (consumed unchanged — no
  API expansion on any existing Brand Primitive under this ticket)
- `src/components/brand/ToleranceBand.astro`,
  `ProcessStamp.astro`, `CutawayWindow.astro` (explicitly out of scope —
  zero changes, per spec §5/§7)
- `src/pages/**` (CC-02I-04's scope)
- `src/data/locales/**` (already landed by CC-02I-01)

## 7. Expected files

- New: the three promoted components at their new location.
- Deleted (old location, prototype-only path): the three original files
  under `src/components/prototypes/cc02-final/` — **only if** nothing
  else references them (verify `docs/engineering/tickets/CC-02F/**`'s
  associated tests still work, since `cc02f-final-hero.spec.ts` and the
  `/internal-preview/cc02-final/` route currently render these exact
  files). If the prototype route must keep working, keep the old files in
  place and have the prototype route import from the new production
  location instead — ticket owner decides based on whether the
  `internal-preview` route needs to keep existing untouched.

## 8. Implementation requirements

- `PrecisionSystemVisual.astro`: promote with its existing `alt`/
  `secondaryAlt`/`animated` prop contract unchanged; only the file
  location and (if applicable) the `internal-preview` route's import path
  change.
- `ProcessRail.astro`: promote, and fix the inline `railLabel` ternary
  (§1.2 of the spec) — `railLabel` becomes a required prop, sourced by the
  caller (`Hero.astro`) from `hero.processRail.railLabel`, not computed
  inside `ProcessRail` itself.
- `EvaluationLedger.astro`: promote as-is (already clean — no hardcoded
  text, no client JS).
- Confirm the `uid` generation in `PrecisionSystemVisual` (currently
  `Math.random().toString(36)`) is safe given the Hero renders it at most
  once per page — if `Hero.astro` ever needs two instances on the same
  page, that's a stop-and-flag condition for this ticket, not a silent
  fix.
- Do not touch `AssemblySpine.astro`'s own implementation — `ProcessRail`
  remains a thin wrapper.

## 9. Design requirements

- No new tokens (spec §6). Reuses the exact CC-02F visual treatment —
  this ticket is a promotion/relocation + one API fix, not a redesign.
- Visual output (pixel-for-pixel where locale copy is unchanged) should
  match the CC-02F prototype screenshots in
  `docs/screenshots/cc02-final/visual-detail.png` as the baseline
  reference.

## 10. Accessibility requirements

- `PrecisionSystemVisual`: SVG `aria-hidden="true"` + visible text
  alternative sourced from `alt`/`secondaryAlt` props, unchanged contract.
- `ProcessRail`: `tabindex="0"` + `aria-label={railLabel}` on the
  horizontally-scrollable mobile container — now locale-correct in both
  routes (this is the fix this ticket delivers).
- `EvaluationLedger`: semantic `<dl>`/`<dt>`/`<dd>`, unchanged.
- Full three-layer reduced-motion defense preserved on
  `PrecisionSystemVisual` (tokens.css global + component-local override +
  JS `matchMedia` check) — verify all three still fire after relocation.

## 11. Performance requirements

- No new client script beyond what `PrecisionSystemVisual` already ships.
- Record actual inline SVG byte size in completion evidence (spec §12).

## 12. Locale requirements

- `ProcessRail`'s `railLabel` and `stateLabels` must render correctly in
  both zh-TW ("流程階段導覽" / 待處理·準備中·進行中) and en ("Process
  stages" / Pending·Preparing·In progress) — verify both, not just one.

## 13. Tests

- Reduced-motion end-state assertion (Playwright `reducedMotion: 'reduce'`
  context) for `PrecisionSystemVisual`, matching
  `cc02f-final-hero.spec.ts`'s existing methodology.
- `ProcessRail` keyboard-focus + `aria-label` correctness in both locales.
- Content-integrity check: no forbidden visual language readings (no
  crosshair, no "NO MEDIA" text) — visual/manual check, documented with
  screenshot.
- If the `internal-preview/cc02-final` route's import paths changed,
  re-run `tests/e2e/cc02f-final-hero.spec.ts` in full — it must still pass
  100% (this ticket must not break the CC-02F prototype route that's still
  live for reference).

## 14. Acceptance criteria

- [ ] All three components exist at their new production-appropriate
      location with clean prop contracts (no hardcoded locale text
      remaining in any of the three).
- [ ] `ProcessRail`'s `aria-label` ternary is gone — `railLabel` is a
      required prop.
- [ ] Reduced motion produces the fully-settled end state with no flash,
      verified via Playwright context, both locales.
- [ ] `tests/e2e/cc02f-final-hero.spec.ts` still passes 100% (whether or
      not its import paths changed).
- [ ] `pnpm check` 0 errors/0 warnings.
- [ ] No change to `AssemblySpine`/`DatumOrigin`/`VisionLockFrame`/
      `ToleranceBand`/`ProcessStamp`/`CutawayWindow`.

## 15. Completion evidence

- Diff showing the `railLabel` ternary removal.
- Reduced-motion screenshot/test output.
- `cc02f-final-hero.spec.ts` full run output.
- Note on final component location (`brand/` vs `sections/`) and reasoning.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) states final component
paths and whether the `internal-preview/cc02-final` route's imports were
updated or left pointing at retained original files.

## 17. Rollback/failure conditions

If relocating the three components breaks the `internal-preview/
cc02-final` route's own test suite in a way that can't be cleanly fixed by
updating its imports, keep the original prototype files in place
untouched, and have the new production components be independent copies
rather than moved files — record this as a deliberate divergence (some
duplication) rather than leaving the prototype route broken.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend coordinating with whichever agent takes CC-02I-04 given
the tight integration seam between the two tickets.

## 20. Estimated risk

Medium. Touches the CC-02F prototype's existing, already-reviewed
components — risk is mostly in the relocation/import-path mechanics and
in not silently breaking the still-live `internal-preview` route, not in
new visual design work.
