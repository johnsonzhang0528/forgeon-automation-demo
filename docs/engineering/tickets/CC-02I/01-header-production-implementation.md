# CC-02I-02 — Header Production Implementation

## 1. Ticket ID

CC-02I-02

## 2. Title

Desktop Header visual update: Datum mark, CTA token, nav hover — real routes preserved

## 3. Purpose

Bring the production `Header.astro`'s visual language in line with the
CC-02F-validated design (Datum Origin beside the logo, `--color-action-
primary` CTA, short Datum-line nav hover, lighter language-switch
treatment) while keeping every piece of real routing, focus management, and
the documented `backdrop-filter` containing-block fix completely intact.
This is a styling/composition change to an existing, working component —
not a rebuild.

## 4. Dependencies

CC-02I-01 (locale API — Header itself doesn't consume new Hero keys, but
this ticket should land after the dictionary pattern is confirmed stable,
per stage sequencing).

## 5. Allowed paths

- `src/components/layout/Header.astro`
- `src/components/ui/Logo.astro` (only if the Datum mark is integrated
  inside Logo rather than composed alongside it in Header — ticket owner's
  call, see spec §8.5)
- `src/components/ui/Button.astro` (only if a new variant/token mapping is
  needed for `--color-action-primary`; prefer a minimal addition over a
  new component)

## 6. Forbidden paths

- `src/pages/**` (except reading, not editing, to verify no regression)
- `src/components/sections/**` (Hero work is CC-02I-04, not this ticket)
- `src/config/nav.ts` (real 6-item nav is reused unmodified, not edited)
- `src/data/locales/**` (already landed by CC-02I-01; this ticket only
  reads `dict.nav.*`, does not add new keys)
- `public/**`

## 7. Expected files

- Modified: `src/components/layout/Header.astro`
- Possibly modified: `src/components/ui/Logo.astro`,
  `src/components/ui/Button.astro` (only if justified per §5)

## 8. Implementation requirements

- Desktop height 80px, Mobile height 64-68px (explicit, not implicit via
  padding — spec §4).
- Compose `DatumOrigin` (size ~28px, `decorative` default `true`) beside
  the existing `Logo.astro` wordmark, sourcing brand name from
  `siteConfig` — never a locally duplicated string.
- Swap Header primary CTA token from `--color-accent` to
  `--color-action-primary` / `--color-action-primary-hover`.
- Nav hover keeps a short Datum-line treatment — either the existing
  `border-bottom-color` swap or an equivalent `::after` scaleX animation
  using `--duration-ui`/`--ease-standard` (no new duration/easing token).
- Language switcher: restyle only if needed to match the "thinner border,
  no heavy box" language from CC-02F §5 — `LanguageSwitcher.astro`'s
  props/behavior/analytics dispatch are unchanged.
- Do **not** touch: `navItems` (real 6-item IA stays), mobile drawer DOM
  position (sibling of `<header>`, per the documented containing-block
  fix), focus trap logic, Escape handling, focus-return logic,
  `document.body.style.overflow` lock, `aria-current`/`aria-expanded`
  wiring.
- No scroll-triggered background/transparency state — explicitly out of
  scope (spec §4, §16).

## 9. Design requirements

- Reuses only existing tokens (§6 of the spec) — no new hex value, no new
  magic-number spacing.
- Language control visually reads as lighter/smaller than the wordmark
  (verified by screenshot, not just asserted) while keeping ≥44×44px tap
  area.
- CTA hover uses the existing `Button.astro` `translateY(-1.5px)` +
  color-deepen pattern (via the new token), not a hand-rolled hover effect.

## 10. Accessibility requirements

- Every interactive Header element keeps a visible focus-visible ring.
- Touch targets ≥44×44px unchanged for language switch and mobile toggle.
- `aria-current="page"` logic unchanged and still correct after markup
  changes.
- No-JavaScript baseline preserved: mobile toggle button and drawer link
  list remain in the DOM and usable without `<script>` executing (verify by
  disabling JS in a manual or Playwright check).

## 11. Performance requirements

- No new client script. Any new CSS is additive to the existing stylesheet
  budget, not a new bundle.
- No CLS introduced by the Datum mark's addition (reserve its footprint in
  layout from first paint, not injected after mount).

## 12. Locale requirements

- zh-TW and en both verified — Datum mark placement and CTA token change
  are locale-independent, but nav label lengths differ; verify no wrap/
  truncation regression in either locale at 360px.

## 13. Tests

- Extend or add to `tests/e2e/mobile-nav.spec.ts` / a new Header-focused
  spec: desktop height = 80px, mobile height = 64-68px
  (`getBoundingClientRect()`), language control tap target ≥44×44px,
  keyboard operability of mobile drawer unchanged (regression check against
  existing passing assertions).
- Run full existing `mobile-nav.spec.ts` suite — must still pass 100%
  (this ticket must not regress the documented `backdrop-filter` fix).
- `pnpm test:axe` — 0 Critical/Serious on all 14 page types (Header
  appears on every page, so a regression here is sitewide).

## 14. Acceptance criteria

- [ ] Desktop header height measures 80px, mobile 64-68px.
- [ ] Datum Origin renders beside the logo, brand name sourced from
      `siteConfig` (grep confirms no duplicated brand string).
- [ ] Header CTA uses `--color-action-primary`/`-hover` (computed style
      check, not just source inspection).
- [ ] All 6 real nav items still present, all still route to real pages
      (`pnpm check:links` passes).
- [ ] Existing `mobile-nav.spec.ts` suite passes unchanged (0 regressions).
- [ ] `pnpm test:axe` 0 Critical/Serious across all 14 page types.
- [ ] No horizontal overflow at 360px in either locale.
- [ ] No scroll-triggered background state was added (explicitly verify
      absence, not just default-off).

## 15. Completion evidence

- Before/after screenshots at 1440px, 768px, 390px, 360px, both locales.
- `mobile-nav.spec.ts` and `axe.spec.ts` run output.
- `check:links` output.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) must state whether the Datum
mark was integrated inside `Logo.astro` or composed in `Header.astro`, and
why.

## 17. Rollback/failure conditions

If integrating the Datum mark into `Logo.astro` breaks Footer or mobile-nav
panel's existing `Logo` usage, back out to the Header-side composition
approach instead of patching every `Logo` call site under time pressure —
record the attempted approach and the reason it was abandoned.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — this is CSS/markup work with clear visual acceptance criteria,
well-suited to either agent.

## 20. Estimated risk

Medium. Header renders on every page — a regression here is sitewide, not
contained to the homepage. The documented `backdrop-filter` containing-
block fix must survive this ticket untouched.
