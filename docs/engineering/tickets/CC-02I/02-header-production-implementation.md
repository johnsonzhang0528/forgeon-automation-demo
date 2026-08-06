# CC-02I-02 — Header Production Implementation

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: Header height is no longer a fixed block height that clips
content under zoom (R1-08) — it now uses `min-block-size` with a normal
target and explicit large-zoom/large-text allowance. The Datum Origin
integration decision is now fixed (composed in `Header.astro` beside
`Logo.astro`, `Logo.astro` itself is never modified) rather than left to
the ticket owner. Allowed paths now explicitly include
`LanguageSwitcher.astro` and a dedicated `tests/e2e/header.spec.ts`, and
explicitly exclude `Logo.astro`.

## 1. Ticket ID

CC-02I-02

## 2. Title

Desktop Header visual update: Datum mark, CTA token, nav hover, zoom-safe height

## 3. Purpose

Bring the production `Header.astro`'s visual language in line with the
CC-02F-validated design (Datum Origin beside the logo, `--color-action-
primary` CTA, short Datum-line nav hover, lighter language-switch
treatment) while keeping every piece of real routing, focus management,
and the documented `backdrop-filter` containing-block fix completely
intact. This is a styling/composition change to an existing, working
component — not a rebuild.

## 4. Dependencies

CC-02I-01 (locale contract), CC-02I-05 (production visual components must
land first per the corrected dependency order — R1-09; Header itself does
not consume `PrecisionSystemVisual` but the stage's build sequence places
Header after the production visual components so the dual-agent workflow
has a stable, already-verified component set to style consistently
against).

## 5. Allowed paths

- `src/components/layout/Header.astro`
- `src/components/ui/Button.astro`
- `src/components/ui/LanguageSwitcher.astro`
- `tests/e2e/header.spec.ts` (new)

## 6. Forbidden paths

- `src/components/ui/Logo.astro` — **not modified under this ticket.**
  The Datum Origin mark is composed directly inside `Header.astro`, placed
  beside the existing `Logo.astro` output, not by changing `Logo.astro`'s
  own props or internals. This is a deliberate R1 decision (not left to
  the ticket owner) to avoid touching a component with other consumers
  (Footer, the mobile nav panel) and to keep this ticket's blast radius
  contained to Header-only risk.
- `src/pages/**`
- `src/components/sections/**` (Hero work is CC-02I-04, not this ticket)
- `src/config/nav.ts` (real 6-item nav is reused unmodified, not edited)
- `src/data/locales/**` (already landed by CC-02I-01; this ticket only
  reads `dict.nav.*`, does not add new keys)
- `public/**`

## 7. Expected files

- Modified: `src/components/layout/Header.astro`
- Possibly modified: `src/components/ui/Button.astro`,
  `src/components/ui/LanguageSwitcher.astro` (only if a new token mapping
  or visual-weight adjustment is genuinely needed)
- New: `tests/e2e/header.spec.ts`

## 8. Implementation requirements

- **Height (R1-08 — corrected)**: not a fixed block height that clips
  content under zoom. Use `min-block-size` with these normal-zoom targets:
  Desktop 80px, Mobile 64–68px. At 200% browser zoom or large text
  settings, the Header may expand naturally beyond this target — it must
  never clip, truncate, or overlap its own content. Test both the 100%-
  zoom normal height and the 200%-zoom no-clipping behavior.
- Compose `DatumOrigin` (size ~28px, `decorative` default `true`) beside
  the existing `Logo.astro` wordmark **inside `Header.astro`**, sourcing
  brand name from `siteConfig` — never a locally duplicated string. Do not
  modify `Logo.astro` itself (§6).
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
  wiring — those are CC-02I-03's scope.
- No scroll-triggered background/transparency state — explicitly out of
  scope.

## 9. Design requirements

- Reuses only existing tokens — no new hex value, no new magic-number
  spacing.
- Language control visually reads as lighter/smaller than the wordmark
  (verified by screenshot, not just asserted) while keeping ≥44×44px tap
  area.
- CTA hover uses the existing `Button.astro` `translateY(-1.5px)` +
  color-deepen pattern (via the new token), not a hand-rolled hover
  effect.

## 10. Accessibility requirements

- Every interactive Header element keeps a visible focus-visible ring.
- Touch targets ≥44×44px unchanged for language switch and mobile toggle.
- `aria-current="page"` logic unchanged and still correct after markup
  changes.
- 200% zoom: no clipped, truncated, or overlapping Header content (R1-08).

## 11. Performance requirements

- No new client script. Any new CSS is additive to the existing stylesheet
  budget, not a new bundle.
- No CLS introduced by the Datum mark's addition (reserve its footprint in
  layout from first paint, not injected after mount).

## 12. Locale requirements

- zh-TW and en both verified — Datum mark placement and CTA token change
  are locale-independent, but nav label lengths differ; verify no wrap/
  truncation regression in either locale at 360px and 320px (R1-07).

## 13. Tests

- New `tests/e2e/header.spec.ts`: desktop height ≈80px, mobile height
  ≈64–68px at 100% zoom (`getBoundingClientRect()`); 200% zoom produces no
  clipped/overlapping content; language control tap target ≥44×44px;
  keyboard operability of visible Header controls.
- Run full existing `tests/e2e/mobile-nav.spec.ts` suite — must still pass
  100% (this ticket must not regress the documented `backdrop-filter`
  fix, even though the drawer internals are CC-02I-03's scope).
- `pnpm test:axe` — 0 Critical/Serious on all 14 page types (Header
  appears on every page, so a regression here is sitewide).

## 14. Acceptance criteria

- [ ] Desktop header height ≈80px, mobile ≈64–68px at 100% zoom.
- [ ] 200% zoom produces no clipped, truncated, or overlapping Header
      content, either locale.
- [ ] Datum Origin renders beside the logo, brand name sourced from
      `siteConfig` (grep confirms no duplicated brand string).
- [ ] `Logo.astro` has zero diff.
- [ ] Header CTA uses `--color-action-primary`/`-hover` (computed style
      check, not just source inspection).
- [ ] All 6 real nav items still present, all still route to real pages
      (`pnpm check:links` passes).
- [ ] Existing `mobile-nav.spec.ts` suite passes unchanged (0 regressions).
- [ ] `pnpm test:axe` 0 Critical/Serious across all 14 page types.
- [ ] No horizontal overflow at 360px or 320px in either locale.
- [ ] No scroll-triggered background state was added.

## 15. Completion evidence

- Before/after screenshots at 1440px, 768px, 390px, 360px, 320px, both
  locales, at 100% and 200% zoom.
- `header.spec.ts`, `mobile-nav.spec.ts`, and `axe.spec.ts` run output.
- `check:links` output.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) must confirm `Logo.astro`
was not touched and state the actual measured Header heights at 100% and
200% zoom.

## 17. Rollback/failure conditions

If `min-block-size` alone cannot prevent clipping at 200% zoom without
also adjusting internal padding/gap tokens, adjust those using existing
`--space-*` tokens only (no new magic number) and record the exact
adjustment in completion evidence. If keeping the Datum mark composed in
`Header.astro` (rather than inside `Logo.astro`) produces a visual result
that genuinely cannot achieve the CC-02F reference composition, stop and
flag for Stage Gate — do not fall back to modifying `Logo.astro` without a
new authorization, since that path is explicitly forbidden by R1.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — this is CSS/markup work with clear visual acceptance criteria,
well-suited to either agent.

## 20. Estimated risk

Medium. Header renders on every page — a regression here is sitewide, not
contained to the homepage. The documented `backdrop-filter` containing-
block fix must survive this ticket untouched, and the new zoom-safety
requirement (R1-08) is a genuinely new constraint not present in the
original ticket.
