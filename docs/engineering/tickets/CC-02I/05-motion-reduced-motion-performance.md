# CC-02I-06 — Motion, Reduced Motion, and Performance Verification

## 1. Ticket ID

CC-02I-06

## 2. Title

End-to-end motion narrative verification and performance budget check

## 3. Purpose

CC-02I-04/05 wire the Hero's components together; this ticket verifies the
*combined* motion narrative (Datum Origin → axis → modules align → vision
lock → rail completes, per spec §10) actually reads as one coherent
sequence once all pieces are assembled in the real Hero — not just that
each component's own animation works in isolation — and confirms the
Hero meets its performance budget (spec §12) in the real production page,
not the isolated prototype route.

## 4. Dependencies

CC-02I-04, CC-02I-05 (both must be complete — this ticket verifies the
assembled result, it does not build new components).

## 5. Allowed paths

- `src/components/sections/Hero.astro` (only for a genuine motion-timing
  fix discovered during verification, e.g. an `animation-delay` that
  doesn't compose correctly once components are combined)
- `src/components/sections/PrecisionSystemVisual.astro` (same — timing
  fix only, not redesign)
- `tests/e2e/` (new or extended spec for motion/performance assertions)

## 6. Forbidden paths

- `src/data/locales/**`
- `src/config/**`
- `src/pages/**` (structural changes belong to CC-02I-04, not this ticket)
- `public/**`

## 7. Expected files

- Possibly modified: `Hero.astro`, `PrecisionSystemVisual.astro` (timing
  fixes only)
- New/extended: a motion + performance Playwright spec

## 8. Implementation requirements

- Verify the full five-step narrative total duration is ~800-1100ms as
  specified, measured on the real assembled Hero (not the isolated
  prototype).
- Verify the sequence doesn't block H1/Body/CTA interactivity — CTAs must
  be clickable and focusable immediately on page load, even before the
  animation completes.
- Verify the animation fires via `IntersectionObserver` and does not
  re-trigger on repeated scroll-into-view.
- Verify no looping animation exists anywhere in the assembled Hero.
- If `ProcessRail`'s own reveal animation conflicts with or duplicates the
  Hero-level narrative timing, resolve by adjusting delay values only —
  not by adding a new animation system.

## 9. Design requirements

None beyond what CC-02I-04/05 already specified — this ticket verifies,
adjusts timing only if broken.

## 10. Accessibility requirements

- Full three-layer reduced-motion defense verified on the *assembled*
  Hero: `tokens.css` global duration-zero, each component's local
  override, and JS `matchMedia` check — test via Playwright
  `browser.newContext({ reducedMotion: 'reduce' })`, confirming the
  end-settled state renders within 100ms with no flash.
- Verify no animation blocks keyboard focus from reaching the CTAs or
  Process Rail during the ~1s narrative window.

## 11. Performance requirements

- Run Lighthouse (or Playwright-based equivalent) mobile + desktop, before
  vs. after CC-02I-04/05's changes, on the real homepage — record both
  scores.
- Confirm animation only touches `transform`/`opacity`/`stroke` (no
  layout-triggering property) via a DevTools/Playwright performance trace
  or manual CSS audit.
- Confirm 0 CLS attributable to the Hero.
- Confirm and record the actual LCP element post-change (spec §12 flags
  this as something to verify, not assume).
- Confirm total added JS payload from the Hero subtree is minimal (record
  actual bytes).

## 12. Locale requirements

Run all motion/performance checks on both `/zh-tw/` and `/en/` — text
length differences can affect layout timing/CLS differently per locale.

## 13. Tests

- New Playwright spec (or extension of the CC-02I-04 spec) asserting:
  total narrative duration bounds, CTA interactivity during animation,
  no re-trigger on re-scroll, reduced-motion end-state.
- Lighthouse CI run (or manual `pnpm` equivalent if no CI integration
  exists yet) — record scores in completion evidence.

## 14. Acceptance criteria

- [ ] Assembled Hero's motion narrative completes within ~800-1100ms,
      verified by timing measurement, not eyeballing.
- [ ] CTAs are clickable/focusable from first paint, animation never
      blocks interactivity.
- [ ] Reduced motion: full settled state within 100ms, verified via
      Playwright context, both locales.
- [ ] No animation re-triggers on repeated scroll-into-view.
- [ ] 0 CLS attributable to the Hero (measured, not assumed).
- [ ] Mobile Lighthouse performance score does not regress versus the
      pre-CC-02I baseline (or regression is explained and accepted with
      reasoning recorded).
- [ ] Animation confirmed `transform`/`opacity`/`stroke`-only.

## 15. Completion evidence

- Before/after Lighthouse scores (mobile + desktop).
- Motion timing measurement output.
- Reduced-motion Playwright test output.
- LCP element identification.
- Total Hero-subtree JS payload size.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) reports actual measured
timing/performance numbers, not just pass/fail.

## 17. Rollback/failure conditions

If the assembled narrative's total duration exceeds ~1100ms and cannot be
brought back into spec range without touching a shared token
(`--duration-section`/`--duration-ui`, which other components also rely
on), do not change the shared token under this ticket — instead adjust
this Hero's component-local `animation-delay` values, and if that's
insufficient, flag the spec's ~800-1100ms bound as needing Stage Gate
reconsideration rather than silently exceeding it.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend the agent with Playwright/performance-tooling
familiarity if there's a meaningful difference in tooling access between
the two worktrees at ticket-claim time.

## 20. Estimated risk

Medium. Mostly verification, but performance regressions are easy to
introduce invisibly (e.g. an SVG that grew during CC-02I-05, or a CLS
source not caught by earlier tickets' narrower checks) and this is the
ticket responsible for catching them before Stage Gate.
