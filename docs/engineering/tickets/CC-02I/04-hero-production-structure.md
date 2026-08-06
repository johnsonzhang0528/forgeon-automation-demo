# CC-02I-04 — Hero Production Structure

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: the original ticket depended on CC-02I-05 for the visual
components while also implying a "build a placeholder skeleton first"
approach — this created a real contradiction (CC-02I-05 was listed as a
dependency of this ticket, yet this ticket used to be sequenced *before*
it in the stage). R1-09 fixes the sequencing: CC-02I-05 now runs before
this ticket, so Hero assembly always has real, finished production visual
components to integrate — no placeholder skeleton is built or allowed.
Mobile DOM order is now fixed and unambiguous (R1-05): Eyebrow comes
before H1 in DOM order (not after, as an earlier draft's prose
implied) — CTA is now split into distinct Primary/Secondary DOM
positions, both before the Primary System Visual.

## 1. Ticket ID

CC-02I-04

## 2. Title

New production `Hero.astro`: 12-column editorial grid, fixed DOM order, real routes

## 3. Purpose

Build the new Hero section component and wire it into
`src/pages/{zh-tw,en}/index.astro`, replacing the current pre-Datum
55/45-split Hero. This ticket assembles the already-finished production
visual components from CC-02I-05 (`PrecisionSystemVisual`, `ProcessRail`,
`EvaluationLedger`) into the fixed grid/DOM structure below — it does not
design or build those components itself.

## 4. Dependencies

CC-02I-01 (locale data), CC-02I-05 (production visual components — now a
hard predecessor per the corrected stage order, R1-09; no placeholder
skeleton is built while waiting, because nothing is waited on: CC-02I-05
runs first).

## 5. Allowed paths

- `src/components/sections/Hero.astro` (new)
- `src/pages/zh-tw/index.astro`
- `src/pages/en/index.astro`
- `tests/e2e/cc02i-hero.spec.ts` (new)

## 6. Forbidden paths

- `src/components/layout/Header.astro` (CC-02I-02/03's scope, not this
  ticket's)
- `src/data/locales/**` (already landed by CC-02I-01; read-only here)
- `src/components/sections/PrecisionSystemVisual.astro`,
  `ProcessRail.astro`, `EvaluationLedger.astro` (owned and finished by
  CC-02I-05; consumed here, not modified)
- Any page other than the two homepage routes.
- `public/**`

## 7. Expected files

- New: `src/components/sections/Hero.astro`
- Modified: `src/pages/zh-tw/index.astro`, `src/pages/en/index.astro`
  (Hero section replaced; rest of page content unchanged)
- New: `tests/e2e/cc02i-hero.spec.ts`

## 8. Implementation requirements

### Desktop grid (visual layout via CSS)

12-column desktop grid: Datum Origin col 1, H1 cols 1-9, Copy cols 1-5,
Primary Visual cols 5-11, Secondary Visual cols 10-13, Evaluation Ledger
cols 1-5 below Copy, Process Rail full-width at bottom. CSS Grid may
reorder the *visual* position of elements on desktop; it must not require
a DOM order different from §8's fixed order below (CSS `order`/grid
placement handles the visual rearrangement, not DOM reshuffling).

### Fixed DOM order (R1-05 — mandatory at every viewport)

```
Datum Origin
→ Eyebrow
→ H1
→ Supporting Copy
→ Primary CTA
→ Secondary CTA
→ Primary System Visual
→ Evaluation Ledger
→ Process Rail
```

This is the literal DOM/source order, not merely the mobile visual order.
Desktop CSS Grid may visually reposition elements (e.g. Primary Visual
appears beside Copy, not below it, at desktop widths) but the underlying
DOM order above is never changed per breakpoint. Do not implement "H1
before Eyebrow" — that ordering from an earlier draft of this spec is
superseded and must not appear in the shipped markup or in comments/docs
describing it.

### Content

- H1 renders the spec-fixed single line break via the same
  `white-space: pre-line` pattern CC-02F used — the break point is
  data-driven (from `hero.headline`'s embedded `\n`), not re-derived by a
  new component-local string.
- Primary CTA and Secondary CTA are distinct DOM elements (both using
  `Button.astro`), in that order, both before the Primary System Visual —
  not merged into a single CTA group component that obscures their
  individual DOM position.
- Both CTAs use real `/{locale}/contact/?intent=project` and
  `?intent=technical-advice` routes, matching `hero.ctaPrimary`/
  `ctaSecondary` copy intent.
- `Hero.astro` resolves its own copy via `getDictionary(locale).hero` —
  the page passes only `locale`, not individual strings.
- `Hero.astro` renders `PrecisionSystemVisual`, `ProcessRail`, and
  `EvaluationLedger` (from CC-02I-05, already production-ready) using
  their finished prop contracts — see CC-02I-05's ticket for those
  contracts, including the fixed `uid="homepage-hero-system"` value
  (R1-04).
- Retire the current `hero__grid` block and `HeroIllustration` usage from
  both homepage files — do not delete `HeroIllustration.astro` itself
  (other potential call sites must be checked first; if none exist, note
  that finding but leave file removal to a separate cleanup decision, not
  bundled into this ticket).

## 9. Design requirements

- Only existing tokens — no new color/spacing/radius value.
- Grid ratios match the production spec's §5/§8.1 exactly; any deviation
  must be recorded in completion evidence as a deliberate, verified
  choice.
- No shadow on the Hero itself (per `DESIGN.md`'s "never a floating
  shadow-heavy card" rule).

## 10. Accessibility requirements

- Exactly one `<h1>` on the page (the Hero's headline) — verify no other
  `<h1>` remains elsewhere on the homepage.
- Skip link still lands on `#main-content` correctly with the new Hero as
  the first content inside it.
- Focus order matches the fixed DOM order in §8: Header → Datum Origin
  (non-focusable, decorative) → Primary CTA → Secondary CTA → Process
  Rail scroll container → rest of page.
- 200% zoom reflow check (manual or Playwright zoom emulation).
- 320px reflow check (R1-07 — see §12).

## 11. Performance requirements

- No new client script owned by `Hero.astro` itself — the Motion
  Orchestrator (R1-06) lives in `Hero.astro` per CC-02I-06's contract, but
  the orchestrator script itself is CC-02I-06's implementation scope; this
  ticket wires the DOM structure the orchestrator will attach to, without
  implementing the orchestrator's animation logic.
- CLS check: before/after Lighthouse or Playwright CLS measurement,
  recorded in completion evidence.
- LCP element check: confirm and record what the LCP element is after
  this change.

## 12. Locale requirements

- Both `/zh-tw/` and `/en/` routes updated in the same ticket — do not
  ship one locale ahead of the other.
- Verify English H1/Body string lengths don't overflow at 360px or 320px
  (R1-07; longer than zh-TW per the production spec).

## 13. Tests

- New `tests/e2e/cc02i-hero.spec.ts` covering: H1 uniqueness and
  line-break correctness; fixed DOM order assertion (query all nine
  landmark elements in §8's order and assert document position); grid
  column placement (computed style assertions) at
  1920/1440/1280/1024/768/390/360/320px; CTA presence, distinct DOM
  positions, and real `href` targets; content-integrity check (no
  fabricated numbers).
- Full existing `responsive-overflow.spec.ts` for `home`/`home-en` page
  types must pass, extended to include 320px (R1-07; may use a CC-02I-
  specific matrix if the global fixture is not modified — see CC-02I-07).
- Full existing `axe.spec.ts` for `home`/`home-en` must pass 0
  Critical/Serious.

## 14. Acceptance criteria

- [ ] Homepage (both locales) renders the new 12-column Hero.
- [ ] DOM order matches §8's fixed sequence exactly, verified
      programmatically, at every tested viewport.
- [ ] Exactly one `<h1>` per homepage route.
- [ ] H1 line break matches spec-fixed point, verified at
      1440/768/390/360/320px.
- [ ] Both CTAs are distinct DOM elements, in Primary-then-Secondary
      order, both before the Primary Visual, both linking to real
      `/{locale}/contact/` routes.
- [ ] No fabricated numeric claims anywhere in the rendered Hero.
- [ ] `responsive-overflow.spec.ts` passes for `home`/`home-en`, including
      320px.
- [ ] `axe.spec.ts` passes 0 Critical/Serious for `home`/`home-en`.
- [ ] `pnpm check:h1` passes site-wide.
- [ ] `pnpm build` succeeds, same total page count as before this ticket.

## 15. Completion evidence

- Screenshots at 1920/1440/1024/768/390/360/320px, both locales.
- DOM-order test output.
- Playwright test run output for the new/extended spec plus the two
  regression suites above.
- CLS/LCP measurement.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) states final `Hero.astro`
location, confirms the fixed DOM order was implemented exactly as
specified, and notes whether `HeroIllustration.astro` had other call
sites.

## 17. Rollback/failure conditions

If the 12-column grid cannot render correctly at tablet width without a
composition not yet verified by screenshot, implement the best-fit
reflow, document the actual behavior with a screenshot, and flag it for
the Stage Gate review rather than blocking the whole ticket. The fixed DOM
order itself (§8) is not open to a per-viewport exception — if a
particular breakpoint seems to need a different DOM order, that is a
stop-and-flag condition, not a silent deviation.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend the same agent that completed CC-02I-05 for continuity
on the grid/visual integration seam, if scheduling allows.

## 20. Estimated risk

High. This is the ticket that actually changes the live homepage's most
visible section, in both locales, and touches the site's primary
conversion surface (RFQ CTAs). Regression here is maximally visible.
