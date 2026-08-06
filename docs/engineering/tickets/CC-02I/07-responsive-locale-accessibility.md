# CC-02I-07 — Responsive, Locale, and Accessibility Verification

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: 320px is no longer excluded (R1-07) — it is now a mandatory
verified viewport with specific acceptance criteria (no horizontal
overflow, CTAs not clipped, English CTA text wraps/stacks rather than
shrinking, no orphaned single characters in the H1, Primary Visual stays
within viewport, Mobile Menu operable, Language Switch doesn't overflow,
touch targets still meet the bar). If the project's global
`tests/e2e/fixtures.ts` `VIEWPORTS` fixture is not modified, this ticket
uses a CC-02I-specific matrix instead — it does not silently skip 320px.

## Revision note (R2)

Revision 2 per finding R2-02: this ticket's cross-cutting verification
scope now explicitly includes confirming that no implementation or test
file anywhere in the CC-02I surface uses the incorrect
`:root:not([data-motion-state])` selector (a Revision 1 defect) — only
`[data-hero-motion-root][data-motion-state="..."]`-scoped selectors are
allowed. This is a targeted grep-and-verify addition to this ticket's
existing accessibility/motion-adjacent checks, not new scope beyond what
CC-02I-06 already implements.

## 1. Ticket ID

CC-02I-07

## 2. Title

Full breakpoint (including 320px) × locale × accessibility matrix verification

## 3. Purpose

Every earlier ticket verifies its own slice at a handful of viewports.
This ticket runs the complete matrix — eight breakpoints (320×800 through
1920×1080, per §8 below) × both locales × keyboard × screen-reader-
relevant attributes × axe — against the fully assembled Header + Hero,
catching interaction effects between tickets that no single ticket's
narrower scope would surface.

## 4. Dependencies

CC-02I-02, CC-02I-03, CC-02I-04, CC-02I-05, CC-02I-06 (all prior
implementation tickets — this is a verification-and-fix ticket over the
complete assembled result).

## 5. Allowed paths

- `src/components/layout/Header.astro` (fix-only)
- `src/components/sections/Hero.astro` (fix-only)
- `src/components/sections/PrecisionSystemVisual.astro`,
  `ProcessRail.astro`, `EvaluationLedger.astro` (fix-only)
- `tests/e2e/cc02i-hero.spec.ts`, `tests/e2e/cc02i-motion.spec.ts`,
  `tests/e2e/mobile-nav.spec.ts`, `tests/e2e/responsive-overflow.spec.ts`,
  `tests/e2e/axe.spec.ts` (extend as needed)

## 6. Forbidden paths

- `src/data/locales/**` (content is fixed by CC-02I-01; this ticket fixes
  layout/behavior, not copy)
- `src/config/**`
- `src/components/brand/**`
- `public/**`
- Any page/component outside the Header/Hero surface.

## 7. Expected files

- Possibly modified: `Header.astro`, `Hero.astro`,
  `PrecisionSystemVisual.astro`, `ProcessRail.astro`,
  `EvaluationLedger.astro` (fix-only)
- Modified/extended: the five test files in §5

## 8. Implementation requirements

### Breakpoint matrix (R1-07 — 320px now mandatory)

```
320×800
360×800
390×844
768×1024
1024×768
1280×800
1440×900
1920×1080
```

If the shared `tests/e2e/fixtures.ts` `VIEWPORTS` array is not modified by
this ticket (it is outside this ticket's allowed paths — extending the
global fixture is a separate decision, not made here), use a CC-02I-
specific matrix defined locally inside `cc02i-hero.spec.ts`/
`cc02i-motion.spec.ts` covering all eight breakpoints above. 320px is
never silently skipped or left untested.

### 320px acceptance requirements (mandatory, per breakpoint)

- No horizontal overflow (`document.documentElement.scrollWidth <=
  clientWidth`).
- Primary and Secondary CTA are not clipped or cut off.
- English CTA text wraps onto a second line or the two CTAs stack
  vertically — text is never shrunk below its specified size to force a
  fit.
- H1 produces no single-word or single-character orphan line (verify both
  zh-TW's 4-line max and en's equivalent wrap behavior at this narrowest
  width).
- Primary System Visual stays fully within the viewport width — no
  horizontal bleed past the viewport edge, even though the design spec
  allows the visual to bleed past the *grid* at wider breakpoints (grid
  bleed and viewport overflow are different things; grid bleed is allowed
  where token-driven gutters accommodate it, viewport overflow is never
  allowed).
- Mobile Menu (drawer toggle, open/close, focus trap, Escape, links) is
  fully operable.
- Language Switch control does not overflow its container or the
  viewport.
- All touch targets remain ≥44×44px.

### Other verification requirements

- Zero horizontal overflow at all eight breakpoints, both locales.
- 200% browser zoom reflow (manual or Playwright zoom emulation) verified
  at least one desktop and one mobile viewport, both locales — no content
  loss or overlap.
- Full keyboard walkthrough: Skip link → Header (logo, nav ×6, language
  switch, CTA, mobile toggle on narrow viewports) → Hero (Primary CTA,
  Secondary CTA, Process Rail scroll container) → rest of page, tab order
  matches DOM order (per CC-02I-04's fixed DOM order, R1-05), no keyboard
  trap outside the intentional mobile-drawer focus trap.
- Full axe run: `home`/`home-en`, desktop + mobile, `wcag2a`/`wcag2aa`/
  `wcag21a`/`wcag21aa` tags, 0 Critical/Serious.
- Contrast spot-check: every new/changed text-on-background pairing
  cross-referenced against `docs/CONTRAST_AUDIT.md` — flag, don't
  silently accept, any new pairing not already audited.
- **Motion selector audit (R2-02)**: grep the entire CC-02I implementation
  surface (`src/components/sections/**`, `src/components/layout/
  Header.astro`) for the literal string `:root:not` — zero matches
  expected. Confirm every motion-state-reactive CSS rule uses the
  `[data-hero-motion-root][data-motion-state="..."]` scoped form.

## 9. Design requirements

None — this ticket verifies and minimally fixes, it does not introduce new
visual design.

## 10. Accessibility requirements

This entire ticket *is* the accessibility requirement — see §8's
keyboard/axe/zoom/contrast items, all mandatory.

## 11. Performance requirements

None beyond what CC-02I-06 already verified — this ticket does not repeat
the Lighthouse pass, only the interaction/accessibility/responsive
matrix.

## 12. Locale requirements

Every check in §8 runs against both `/zh-tw/` and `/en/` independently —
a pass in one locale does not imply a pass in the other.

## 13. Tests

- Extended breakpoint matrix coverage (local to CC-02I's own specs if the
  global fixture is not extended).
- New/extended 320px-specific assertions per §8.
- New keyboard-walkthrough coverage for the assembled Header+Hero.
- Full `axe.spec.ts` run for `home`/`home-en`.
- 200% zoom check (documented, automated if feasible, manual with
  screenshot evidence if not).

## 14. Acceptance criteria

- [ ] Zero horizontal overflow at all eight breakpoints (including
      320px), both locales.
- [ ] All 320px-specific acceptance requirements in §8 verified true,
      both locales.
- [ ] 200% zoom reflow verified with no content loss/overlap, at least
      one desktop and one mobile viewport, both locales.
- [ ] Full keyboard walkthrough completes with no trap and correct tab
      order (matching CC-02I-04's fixed DOM order), both locales.
- [ ] `axe.spec.ts` 0 Critical/Serious, `home`/`home-en`, desktop + mobile.
- [ ] Every new text/background color pairing is confirmed present in
      `docs/CONTRAST_AUDIT.md` or flagged as a gap for follow-up.

## 15. Completion evidence

- Full breakpoint × locale overflow test matrix results (16 combinations:
  8 breakpoints × 2 locales).
- 320px-specific screenshot set, both locales.
- Keyboard walkthrough recording/notes.
- `axe.spec.ts` full output.
- Contrast cross-reference notes.

## 16. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) reports the full matrix
pass/fail state including explicit 320px results, and any fixes applied,
distinguishing "fixed" from "flagged for Stage Gate" for anything not
resolved within this ticket's scope.

## 17. Rollback/failure conditions

If a tablet-width (768–1024px) or 320px composition issue is found that
requires a structural change to the Hero grid itself (not just a CSS
tweak), do not redesign the grid under this verification ticket —
document the issue with a screenshot, apply the least invasive fix that
removes overflow/inaccessibility, and flag the deeper structural question
for Stage Gate review. 320px support itself (R1-07) is not optional to
drop under this rollback clause — if 320px genuinely cannot be made to
work without a Hero redesign, that is a Critical finding to escalate
immediately, not a condition to quietly relax.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend whichever agent has not yet worked on this stage, for a
fresher eye on cross-ticket interaction bugs.

## 20. Estimated risk

Medium-high. This is the ticket most likely to surface bugs that only
exist because of how CC-02I-02 through CC-02I-06's independent changes
combine, and the newly-mandatory 320px requirement (R1-07) is real new
scope versus the original ticket, not merely a re-verification of
already-covered ground.
