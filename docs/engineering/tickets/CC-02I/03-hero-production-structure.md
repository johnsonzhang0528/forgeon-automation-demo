# CC-02I-04 — Hero Production Structure

## 1. Ticket ID

CC-02I-04

## 2. Title

New production `Hero.astro`: 12-column editorial grid, real locale data, real routes

## 3. Purpose

Build the new Hero section component and wire it into
`src/pages/{zh-tw,en}/index.astro`, replacing the current pre-Datum
55/45-split Hero. This is the ticket that actually changes what visitors
see — it depends on CC-02I-01's locale data and CC-02I-05's promoted visual
components, and produces the structural/layout half of the new Hero
(grid, copy placement, CTA wiring); CC-02I-05 owns the System Visual asset
itself.

## 4. Dependencies

CC-02I-01 (locale data), CC-02I-05 (Primary/Secondary System Visual and
Process Rail/Evaluation Ledger components must exist before this ticket
assembles them into the Hero — coordinate order with CC-02I-05, or land
this ticket's grid/copy skeleton first with placeholder slots and wire the
real visuals in as CC-02I-05 completes, whichever the implementing agent
finds cleaner).

## 5. Allowed paths

- `src/components/sections/Hero.astro` (new)
- `src/pages/zh-tw/index.astro`
- `src/pages/en/index.astro`

## 6. Forbidden paths

- `src/components/layout/Header.astro` (CC-02I-02/03's scope, not this
  ticket's)
- `src/data/locales/**` (already landed by CC-02I-01; read-only here)
- `src/components/brand/**` (existing Brand Primitives are consumed, not
  modified, by this ticket)
- Any page other than the two homepage routes.
- `public/**`

## 7. Expected files

- New: `src/components/sections/Hero.astro`
- Modified: `src/pages/zh-tw/index.astro`, `src/pages/en/index.astro`
  (Hero section replaced; rest of page content unchanged)

## 8. Implementation requirements

- Per spec §5/§8.1: 12-column desktop grid (Datum Origin col 1, H1 cols
  1-9, Copy cols 1-5, Primary Visual cols 5-11, Secondary Visual cols
  10-13, Evaluation Ledger cols 1-5 below Copy, Process Rail full-width at
  bottom).
- Tablet: single dominant column, fixed order (verify against real 768px
  screenshot, not assumed).
- Mobile: Datum Origin, H1, Eyebrow, Body, CTA, Primary Visual, then
  (below fold) Evaluation Ledger, then Process Rail.
- H1 renders the spec-fixed single line break via the same
  `white-space: pre-line` pattern CC-02F used — verify the break point is
  data-driven (from `hero.headline`'s embedded `\n`), not re-derived by a
  new component-local string.
- Both CTAs use `Button.astro`, real `/{locale}/contact/?intent=project`
  and `?intent=technical-advice` routes (or spec-appropriate intents —
  confirm against `hero.ctaPrimary`/`ctaSecondary` copy intent).
- `Hero.astro` resolves its own copy via `getDictionary(locale).hero` —
  the page passes only `locale`, not individual strings.
- Retire the current `hero__grid` block and `HeroIllustration` usage from
  both homepage files — do not delete `HeroIllustration.astro` itself
  (other potential call sites must be checked first; if none exist, note
  that finding but leave the file removal to a separate cleanup decision,
  not bundled into this ticket).

## 9. Design requirements

- Only existing tokens (spec §6) — no new color/spacing/radius value.
- Grid ratios match spec §5/§8.1 exactly; any deviation (like CC-02F's own
  verified 1-5 vs. spec-literal 1-6 Copy column correction) must be
  recorded in the ticket's completion evidence as a deliberate, verified
  choice, not silently diverge.
- No shadow on the Hero itself (per `DESIGN.md`'s "never a floating
  shadow-heavy card" rule).

## 10. Accessibility requirements

- Exactly one `<h1>` on the page (the Hero's headline) — verify no other
  `<h1>` remains elsewhere on the homepage.
- Skip link still lands on `#main-content` correctly with the new Hero as
  the first content inside it.
- Focus order: Header → Hero CTAs → Process Rail scroll container → rest
  of page, in that DOM order.
- 200% zoom reflow check (manual or Playwright zoom emulation).

## 11. Performance requirements

- No new client script owned by `Hero.astro` itself (children's scripts
  are CC-02I-05's concern).
- CLS check: before/after Lighthouse or Playwright CLS measurement,
  recorded in completion evidence.
- LCP element check: confirm and record what the LCP element is after this
  change.

## 12. Locale requirements

- Both `/zh-tw/` and `/en/` routes updated in the same ticket — do not
  ship one locale ahead of the other.
- Verify English H1/Body string lengths don't overflow at 360px (longer
  than zh-TW per spec §5).

## 13. Tests

- New or extended Playwright spec covering: H1 uniqueness and line-break
  correctness, grid column placement (computed style assertions) at
  1440/1024/768/390/360px, CTA presence and real `href` targets, content-
  integrity check (no fabricated numbers — grep-style assertion matching
  `cc02f-final-hero.spec.ts`'s existing pattern).
- Full existing `responsive-overflow.spec.ts` for `home`/`home-en` page
  types must pass.
- Full existing `axe.spec.ts` for `home`/`home-en` must pass 0
  Critical/Serious.

## 14. Acceptance criteria

- [ ] Homepage (both locales) renders the new 12-column Hero matching spec
      §5/§8.1's grid ratios.
- [ ] Exactly one `<h1>` per homepage route.
- [ ] H1 line break matches spec-fixed point, verified at 1440/768/390/
      360px.
- [ ] Both CTAs link to real, working `/{locale}/contact/` routes.
- [ ] No fabricated numeric claims anywhere in the rendered Hero (grep
      check for spec §12-prohibited strings, matching CC-02F's own test
      pattern).
- [ ] `responsive-overflow.spec.ts` passes for `home`/`home-en`.
- [ ] `axe.spec.ts` passes 0 Critical/Serious for `home`/`home-en`.
- [ ] `pnpm check:h1` passes site-wide (not just homepage).
- [ ] `pnpm build` succeeds, same total page count as before this ticket.

## 15. Completion evidence

- Screenshots at 1440/1024/768/390/360px, both locales.
- Playwright test run output for the new/extended spec plus the two
  regression suites above.
- CLS/LCP measurement.
- Note on any spec-ratio deviation (per §9).

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) states final `Hero.astro`
location, whether `HeroIllustration.astro` had other call sites, and the
actual verified grid column values if they deviated from the spec's
literal numbers.

## 17. Rollback/failure conditions

If the 12-column grid cannot render correctly at tablet width without a
composition the spec didn't anticipate (spec §5 already flags this as
"verify via screenshot, not assumed"), implement the best-fit reflow,
document the actual behavior with a screenshot, and flag it for the Stage
Gate review rather than blocking the whole ticket on a perfect tablet
match.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend the same agent that completes CC-02I-05 for continuity
on the grid/visual integration seam, if scheduling allows.

## 20. Estimated risk

High. This is the ticket that actually changes the live homepage's most
visible section, in both locales, and touches the site's primary
conversion surface (RFQ CTAs). Regression here is maximally visible.
