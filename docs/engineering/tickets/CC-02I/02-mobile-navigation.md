# CC-02I-03 — Mobile Navigation Verification and Hardening

## 1. Ticket ID

CC-02I-03

## 2. Title

Mobile Navigation regression verification after Header visual changes

## 3. Purpose

Production `Header.astro`'s mobile drawer is already correctly implemented
(disclosure-style panel, sibling-of-`<header>` DOM position, focus trap,
Escape, focus return, body scroll lock, documented `backdrop-filter`
containing-block fix). This ticket does not rebuild that — it exists to
verify, under the new visual treatment from CC-02I-02, that none of it
regressed, and to close the one known small gap (confirming behavior at
360px specifically, since CC-02F's mobile work surfaced viewport-specific
issues that a purely desktop-focused Header ticket could miss).

## 4. Dependencies

CC-02I-02 (Header visual changes must land first — this ticket verifies
against the post-CC-02I-02 Header, not the pre-change one).

## 5. Allowed paths

- `src/components/layout/Header.astro` (only for a genuine bug fix
  discovered during verification — not for new features)
- `tests/e2e/mobile-nav.spec.ts`

## 6. Forbidden paths

- `src/components/sections/**`
- `src/data/locales/**`
- `src/config/**`
- `public/**`

## 7. Expected files

- Possibly modified: `src/components/layout/Header.astro` (bug fix only)
- Modified/extended: `tests/e2e/mobile-nav.spec.ts`

## 8. Implementation requirements

- Re-verify, against the CC-02I-02 Header, at 360×800 and 390×844
  specifically:
  - Drawer opens/closes via toggle button.
  - `Escape` closes the drawer.
  - Focus trap cycles correctly both directions (Tab and Shift+Tab).
  - Focus returns to the toggle button on close.
  - `document.body.style.overflow` locks while open, restores on close.
  - Background content is genuinely inert while the drawer is open (not
    just visually dimmed) — click-through test on background content.
  - All 6 real nav items are present and link correctly.
  - Language switcher works inside the drawer.
- If any of the above regressed because of CC-02I-02's visual changes, fix
  it in `Header.astro` directly — this is a hardening ticket, not a
  read-only verification ticket, but the fix scope stays limited to
  restoring already-specified behavior, not adding new behavior.

## 9. Design requirements

- No new visual treatment introduced by this ticket — it inherits
  CC-02I-02's Header styling as-is.

## 10. Accessibility requirements

- Full keyboard operability (Tab, Shift+Tab, Escape, Enter/Space to
  activate toggle) verified at 360px and 390px.
- Screen-reader-relevant attributes (`aria-expanded`, `aria-controls`,
  `aria-label` on toggle) verified unchanged and correct.

## 11. Performance requirements

None beyond not regressing existing behavior.

## 12. Locale requirements

Verify drawer behavior identically in zh-TW and en routes — nav label
length differences must not break the layout or focus order.

## 13. Tests

- Extend `tests/e2e/mobile-nav.spec.ts` with explicit 360×800 and 390×844
  viewport cases if not already present at that granularity.
- Full existing suite must pass with 0 regressions.

## 14. Acceptance criteria

- [ ] All items in §8 verified true at both 360×800 and 390×844, both
      locales.
- [ ] `tests/e2e/mobile-nav.spec.ts` passes 100%, including any newly added
      cases.
- [ ] `pnpm test:axe` mobile-nav-open state check passes 0 Critical/
      Serious.
- [ ] If a fix was required, it's the minimum change that restores
      specified behavior — no unrelated refactor bundled in.

## 15. Completion evidence

- Test run output for `mobile-nav.spec.ts` (before/after if a fix was
  needed).
- Screenshot of drawer open state at 360px, both locales.

## 16. Handoff requirements

Standard checkpoint/handoff. If no fix was needed, the handoff narrative
states that explicitly (verification-only ticket, zero `Header.astro`
diff) — this is a valid, complete outcome for this ticket, not a
non-finding.

## 17. Rollback/failure conditions

If a regression is found that requires touching the documented
`backdrop-filter` containing-block fix itself (not just cosmetic styling
around it), stop and escalate rather than modifying that fix under this
ticket's scope — that fix has its own history (`Header.astro:66-80`
comment) and any change to it deserves its own reviewed ticket.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Whichever agent completed CC-02I-02, for context continuity — not a hard
requirement.

## 20. Estimated risk

Low-medium. Likely a clean verification pass since the underlying
implementation is already correct and well-tested; risk is contained to
whatever CC-02I-02 changed.
