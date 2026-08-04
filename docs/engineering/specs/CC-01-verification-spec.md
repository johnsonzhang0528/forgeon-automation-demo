# CC-01 Verification Spec

This is not a new requirements document. It synthesizes what
`docs/redesign/forgeon_claude_code_redesign_tasks.md` §CC-01,
`docs/DATUM_DECISION_LOG.md`, `docs/DATUM_QA.md`, `docs/CONTRAST_AUDIT.md`,
and `docs/ASSET_LICENSES.md` already committed CC-01 to, restated as a flat
acceptance checklist so `/code-review`'s Spec axis has one file to check
the `eadf381..21dd6bc` diff against instead of five. Every line below is
traceable to an existing doc; nothing here is invented.

## Color and contrast

- [ ] All on-page color pairings pass WCAG AA: 4.5:1 normal text, 3:1
      large text (≥24px / ≥19px bold) and non-text UI (borders, focus
      rings). Source: `docs/CONTRAST_AUDIT.md`.
- [ ] `--color-steel-500` / `--color-copper-500` / `--color-steel-200` are
      role-restricted (dark-bg text/decoration or non-text UI only) and no
      component uses them as light-bg text/border. Source:
      `DATUM_DECISION_LOG.md` "Constraint for CC-02+".
- [ ] `--color-copper-600` on `--color-paper-50` (4.61:1) is not
      re-lightened/darkened without re-running the contrast calculator.
      Source: `CONTRAST_AUDIT.md` margin note.

## Fonts and loading

- [ ] Noto Sans TC, Space Grotesk, IBM Plex Mono are self-hosted WOFF2 via
      `@fontsource/*`, SIL OFL 1.1, only actually-used weights shipped (10
      files total). Source: `docs/ASSET_LICENSES.md`.
- [ ] `font-display: swap` set on every `@font-face` rule.
- [ ] Only the actual first-paint-critical weight (Noto Sans TC 400) is
      preloaded.
- [ ] Chinese headings/body resolve Noto Sans TC ahead of the Latin-first
      `--font-display` stack via `:lang(zh)`.

## Typography

- [ ] Display / H1-H4 / Body Large / Body / Small / Technical Label scale
      exists and is not one uniform ratio applied to every level. Source:
      redesign spec §CC-01 "Typography".

## Grid / Container

- [ ] `--container-reading` (760px) / `--container-content` (1280px) /
      `--container-wide` (1440px) exist and legacy `--container-max` /
      `--container-padding` resolve to them (no parallel second system).

## Spacing

- [ ] `--space-1`..`--space-32` single scale exists; legacy
      `--space-3xs`..`--space-3xl` names resolve to it via alias, not
      independently redefined.

## Radius / Border / Shadow

- [ ] Radius caps at `--radius-md` (12px); legacy `--radius-lg` aliases to
      it (value-identical, not a behavior change).
- [ ] Shadow tokens (`--shadow-sm/md/lg`) used only for dropdown/dialog/
      drawer/hover states, not default card state.

## Button states

- [ ] Six states implemented: Default / Hover / Focus Visible / Active /
      Disabled / Loading, with `aria-disabled` / `aria-busy` exposed
      programmatically on Loading/Disabled.

## Six Brand Primitives

- [ ] `DatumOrigin`, `ToleranceBand`, `VisionLockFrame`, `AssemblySpine`,
      `ProcessStamp`, `CutawayWindow` exist under `src/components/brand/`.
- [ ] SVG-first implementation, token-controlled colors (no hardcoded hex
      inside component files).
- [ ] Correct `aria-hidden` vs. labeled semantics depending on whether the
      primitive is decorative or conveys meaning.
- [ ] `prefers-reduced-motion` respected by every primitive that animates.
- [ ] Datum Origin is not a crosshair (asymmetric arms, steel axes, only
      the origin point colored).
- [ ] Tolerance Band is not a progress bar (static range width is the
      message, no fill-from-zero animation).
- [ ] Vision Lock Frame is not a looping scan effect (one-shot
      align→lock→complete only).
- [ ] Process Stamp is not a certification/compliance mark (rectangular
      chip + corner notch, permanent "流程狀態 · PROCESS STATUS" label, no
      seal/wreath/ribbon shape).
- [ ] `CutawayWindow` uses `clip-path: polygon()` with an `@supports`
      fallback, not an unfallbackable SVG mask.

## Bilingual reusability

- [ ] Whether the six Brand Primitives can be reused on both zh-tw and en
      pages without a locale/messages API, or whether they hardcode
      Chinese strings — open question this review must answer explicitly
      (see §八 disposition #1 in the two-axis review).

## Accessibility

- [ ] axe-core: 0 Critical, 0 Serious across all page types plus mobile
      nav open state.
- [ ] Keyboard/focus semantics correct on interactive Brand Primitive
      usages (Assembly Spine node buttons).

## Reduced Motion

- [ ] Verified live (not just code-read) that `prefers-reduced-motion:
      reduce` collapses animated Brand Primitives to their finished state
      with no flash of the pre-animation state.

## Internal Preview

- [ ] `/internal-preview/design-system/` not in main nav, not in
      `sitemap.xml`, `<meta name="robots" content="noindex, nofollow">`
      present.
- [ ] Passes the same `check:h1` (exactly one real H1) and overflow checks
      as every other page — no exemption.

## Sitemap / Noindex

- [ ] Demo Mode noindex/nofollow gate unaffected by CC-01 changes.

## Legacy component compatibility

- [ ] The ten pre-CC-01 components (Header, Button, SectionHeading,
      ProductCard, SolutionCard, IndustryCard, ContactForm, Footer,
      SpecificationTable, CTABanner) render correctly through compat
      aliases with zero required markup/structure changes, except the two
      documented token-substitution fixes (SectionHeading eyebrow,
      ProcessTimeline index — copper-600 → copper-700 on paper-100).

## Build / E2E / axe

- [ ] `pnpm check`, `pnpm build`, `check:h1`, `check:links`,
      `check:locale-routes` all pass with 0 errors.
- [ ] `pnpm test:e2e`: 197/198 pass — the one known failure is the
      pre-existing `/en/` 360px homepage overflow, confirmed present in
      the CC-00 baseline (not a CC-01 regression).
- [ ] `pnpm test:axe`: 15/15 pass, 0 critical/0 serious.

## Must not enter CC-02

- [ ] No changes to Header, Hero, or homepage information architecture.
- [ ] The known `/en/` 360px overflow is recorded as a known, ticketed
      failure — not fixed by touching homepage content structure this
      round, and never reported as if the suite were all-green.
