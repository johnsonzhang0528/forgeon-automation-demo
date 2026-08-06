# CC-02I-07 — Responsive, Locale, and Accessibility Verification

## 1. Ticket ID

CC-02I-07

## 2. Title

Full breakpoint × locale × accessibility matrix verification

## 3. Purpose

Every earlier ticket verifies its own slice at a handful of viewports.
This ticket runs the complete matrix — all seven standard breakpoints
(`tests/e2e/fixtures.ts` `VIEWPORTS`) × both locales × keyboard × screen-
reader-relevant attributes × axe — against the fully assembled Header +
Hero, catching interaction effects between tickets that no single ticket's
narrower scope would surface (e.g. a tablet-width composition issue that
only appears once the real Header height from CC-02I-02 combines with the
real Hero grid from CC-02I-04).

## 4. Dependencies

CC-02I-02, CC-02I-03, CC-02I-04, CC-02I-05, CC-02I-06 (all prior
implementation tickets — this is a verification-and-fix ticket over the
complete assembled result).

## 5. Allowed paths

- `src/components/layout/Header.astro` (fix-only)
- `src/components/sections/Hero.astro` (fix-only)
- `src/components/sections/PrecisionSystemVisual.astro`,
  `ProcessRail.astro`, `EvaluationLedger.astro` (fix-only)
- `tests/e2e/` (new/extended specs)

## 6. Forbidden paths

- `src/data/locales/**` (content is fixed by CC-02I-01; this ticket fixes
  layout/behavior, not copy)
- `src/config/**`
- `public/**`
- Any page/component outside the Header/Hero surface — a bug found
  elsewhere is out of this ticket's scope and gets reported, not fixed
  here.

## 7. Implementation requirements

- Run `responsive-overflow.spec.ts`'s methodology (or extend it) against
  `home`/`home-en` at all seven `VIEWPORTS`: 360×800, 390×844, 768×1024,
  1024×768, 1280×800, 1440×900, 1920×1080. Zero horizontal overflow at
  every one.
- Verify 320px is genuinely out of scope (confirm no assertion or user-
  facing claim implies 320px support, per spec §5/§11/§14).
- Verify 200% browser zoom reflow (manual or Playwright zoom emulation) at
  at least one desktop and one mobile viewport.
- Full keyboard walkthrough: Skip link → Header (logo, nav ×6, language
  switch, CTA, mobile toggle on narrow viewports) → Hero (Primary CTA,
  Secondary CTA, Process Rail scroll container) → rest of page, tab order
  matches DOM order, no keyboard trap outside the intentional mobile-drawer
  focus trap.
- Full axe run: `home`/`home-en`, desktop + mobile, `wcag2a`/`wcag2aa`/
  `wcag21a`/`wcag21aa` tags, 0 Critical/Serious (matching the project's
  existing threshold convention, not a stricter bar).
- Contrast spot-check: every new/changed text-on-background pairing
  (especially Copper-on-Paper usages given the documented thin margin on
  `--color-copper-600`) cross-referenced against `docs/CONTRAST_AUDIT.md`
  — flag, don't silently accept, if a new pairing wasn't already audited.

## 8. Design requirements

None — this ticket verifies and minimally fixes, it does not introduce new
visual design.

## 9. Accessibility requirements

This entire ticket *is* the accessibility requirement — see §7's keyboard/
axe/zoom/contrast items, all mandatory.

## 10. Performance requirements

None beyond what CC-02I-06 already verified — this ticket does not repeat
the Lighthouse pass, only the interaction/accessibility matrix.

## 11. Locale requirements

Every check in §7 runs against both `/zh-tw/` and `/en/` independently —
a pass in one locale does not imply a pass in the other (English string
lengths are longer per spec §5, which is exactly the kind of thing that
can break only in one locale).

## 12. Tests

- Extended `responsive-overflow.spec.ts` coverage (if gaps found).
- New keyboard-walkthrough Playwright spec for the assembled Header+Hero.
- Full `axe.spec.ts` run for `home`/`home-en`.
- 200% zoom check (documented, automated if feasible, manual with
  screenshot evidence if not).

## 13. Acceptance criteria

- [ ] Zero horizontal overflow at all seven standard breakpoints, both
      locales.
- [ ] 200% zoom reflow verified with no content loss/overlap, at least one
      desktop and one mobile viewport, both locales.
- [ ] Full keyboard walkthrough completes with no trap and correct tab
      order, both locales.
- [ ] `axe.spec.ts` 0 Critical/Serious, `home`/`home-en`, desktop + mobile.
- [ ] Every new text/background color pairing is confirmed present in
      `docs/CONTRAST_AUDIT.md` or flagged as a gap for follow-up.
- [ ] 320px is confirmed genuinely unsupported and not silently broken in
      a way that looks like a bug rather than a stated boundary.

## 14. Completion evidence

- Full breakpoint × locale overflow test matrix results (14 combinations).
- Keyboard walkthrough recording/notes.
- `axe.spec.ts` full output.
- Contrast cross-reference notes.

## 15. Handoff requirements

Standard checkpoint/handoff. Narrative (zh-TW) reports the full matrix
pass/fail state and any fixes applied, distinguishing "fixed" from "flagged
for Stage Gate" for anything not resolved within this ticket's scope.

## 16. Rollback/failure conditions

If a tablet-width (768-1024px) composition issue is found that requires a
structural change to the Hero grid itself (not just a CSS tweak), do not
redesign the grid under this verification ticket — document the issue with
a screenshot, apply the least invasive fix that removes overflow/
inaccessibility, and flag the deeper structural question for Stage Gate
review.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Either — recommend whichever agent has not yet worked on this stage, for a
fresher eye on cross-ticket interaction bugs.

## 20. Estimated risk

Medium-high. This is the ticket most likely to surface bugs that only
exist because of how CC-02I-02 through CC-02I-06's independent changes
combine — by design, since no single earlier ticket owns the full matrix.
