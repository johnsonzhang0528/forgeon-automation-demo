# CC-02I-03 — Mobile Navigation Verification and Hardening

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: adds a mandatory 320px viewport case (R1-07 — 320px is no longer
an unsupported width for Header/Hero) and a mandatory No-JS fallback
requirement (R1-08) — a real `<noscript>` navigation block, not just proof
that links exist inside a `hidden` drawer DOM node (which is not usable
without JavaScript to un-hide it).

## 1. Ticket ID

CC-02I-03

## 2. Title

Mobile Navigation regression verification, 320px support, and No-JS fallback

## 3. Purpose

Production `Header.astro`'s mobile drawer is already correctly implemented
(disclosure-style panel, sibling-of-`<header>` DOM position, focus trap,
Escape, focus return, body scroll lock, documented `backdrop-filter`
containing-block fix). This ticket verifies that behavior survives
CC-02I-02's visual changes, extends coverage down to 320px, and closes a
real accessibility gap: without JavaScript, the current drawer's link list
sits inside a `hidden` panel that no user can reveal, which is not a
working fallback navigation, just markup that happens to contain links.

## 4. Dependencies

CC-02I-02 (Header visual changes must land first — this ticket verifies
against the post-CC-02I-02 Header, not the pre-change one).

## 5. Allowed paths

- `src/components/layout/Header.astro`
- `tests/e2e/mobile-nav.spec.ts`

## 6. Forbidden paths

- `src/components/ui/Logo.astro`
- `src/components/sections/**`
- `src/data/locales/**`
- `src/config/**`
- `public/**`

## 7. Expected files

- Modified: `src/components/layout/Header.astro`
- Modified: `tests/e2e/mobile-nav.spec.ts`

## 8. Implementation requirements

### Drawer regression verification

Re-verify, against the CC-02I-02 Header, at 320×800, 360×800, and 390×844:

- Drawer opens/closes via toggle button.
- `Escape` closes the drawer.
- Focus trap cycles correctly both directions (Tab and Shift+Tab).
- Focus returns to the toggle button on close.
- `document.body.style.overflow` locks while open, restores on close.
- Background content is genuinely inert while the drawer is open (not
  just visually dimmed) — click-through test on background content.
- All 6 real nav items are present and link correctly.
- Language switcher works inside the drawer.
- Language switch tap target does not overflow at 320px.

If any of the above regressed because of CC-02I-02's visual changes, fix
it in `Header.astro` directly — the fix scope stays limited to restoring
already-specified behavior, not adding new behavior.

### No-JS fallback (R1-08 — new requirement)

Add a real `<noscript>` block to `Header.astro` containing a genuine,
usable mobile navigation fallback — not the existing `hidden`-attribute
drawer markup (which stays hidden with no way to reveal it when
JavaScript is unavailable, since the toggle button's `click` handler is
itself JavaScript). The `<noscript>` fallback must independently include:

- All 6 real navigation links (`navItems`, real routes, real labels via
  `dict.nav.*`).
- A working locale switch link (real `<a href>` via
  `switchLocalePath`/`otherLocale`, same as `LanguageSwitcher.astro`
  already produces — reuse its link-generation logic rather than
  duplicating it by hand).
- The primary Contact/Project CTA (`/{locale}/contact/?intent=project`).

This fallback renders unconditionally in the HTML (inside `<noscript>`) —
it does not depend on any client script to become visible or usable. It
does not need to visually match the JS-enabled drawer; it needs to be
genuinely operable with plain HTML.

## 9. Design requirements

- No new visual treatment introduced for the JS-enabled drawer by this
  ticket beyond what verification requires — it inherits CC-02I-02's
  Header styling as-is.
- The `<noscript>` fallback may use plain, unstyled or minimally styled
  markup — it is a functional fallback, not a design deliverable.

## 10. Accessibility requirements

- Full keyboard operability (Tab, Shift+Tab, Escape, Enter/Space to
  activate toggle) verified at 320px, 360px, and 390px.
- Screen-reader-relevant attributes (`aria-expanded`, `aria-controls`,
  `aria-label` on toggle) verified unchanged and correct.
- No-JS fallback: all links have real accessible names, no `aria-hidden`
  on any No-JS-fallback link.

## 11. Performance requirements

None beyond not regressing existing behavior. The `<noscript>` block adds
a small, fixed amount of static HTML — no client script, no runtime cost.

## 12. Locale requirements

Verify drawer behavior identically in zh-TW and en routes at all three
viewports — nav label length differences must not break the layout or
focus order. Verify the No-JS fallback independently in both locales
(zh-TW and en routes each render their own real fallback links, not a
shared/hardcoded one).

## 13. Tests

- Extend `tests/e2e/mobile-nav.spec.ts` with explicit 320×800, 360×800,
  and 390×844 viewport cases.
- New test case(s) with `javaScriptEnabled: false` (Playwright browser
  context option), at 320px and 360px, both zh-TW and en: assert the
  `<noscript>` fallback's 6 nav links, locale switch link, and CTA are all
  present in the rendered DOM and have real, non-empty `href` attributes
  pointing to real routes — not merely that some link exists inside the
  hidden drawer.
- Full existing suite must pass with 0 regressions.

## 14. Acceptance criteria

- [ ] All drawer-regression items in §8 verified true at 320×800, 360×800,
      and 390×844, both locales.
- [ ] `tests/e2e/mobile-nav.spec.ts` passes 100%, including all newly
      added cases.
- [ ] `pnpm test:axe` mobile-nav-open state check passes 0 Critical/
      Serious.
- [ ] A real `<noscript>` fallback exists in `Header.astro`'s rendered
      HTML with 6 real nav links, a real locale switch link, and a real
      CTA link, verified with `javaScriptEnabled: false` — not just
      inspected in source.
- [ ] No-JS fallback verified independently in zh-TW and en.
- [ ] If a drawer fix was required, it's the minimum change that restores
      specified behavior — no unrelated refactor bundled in.

## 15. Completion evidence

- Test run output for `mobile-nav.spec.ts` (before/after if a fix was
  needed), including the new 320px and No-JS cases.
- Screenshot of drawer open state at 320px, both locales.
- Screenshot or DOM dump of the No-JS fallback rendering with JavaScript
  disabled.

## 16. Handoff requirements

Standard checkpoint/handoff. Handoff narrative states explicitly whether a
drawer fix was needed (versus a clean verification pass) and confirms the
No-JS fallback was tested with `javaScriptEnabled: false`, not just
visually inspected in markup.

## 17. Rollback/failure conditions

If a regression is found that requires touching the documented
`backdrop-filter` containing-block fix itself (not just cosmetic styling
around it), stop and escalate rather than modifying that fix under this
ticket's scope. If the No-JS fallback's link-generation logic cannot
cleanly reuse `LanguageSwitcher.astro`'s existing path logic, duplicate
the minimum necessary `switchLocalePath`/`otherLocale` calls directly
rather than introducing a new shared utility — record the duplication and
the reason in completion evidence rather than expanding this ticket's
scope into a refactor.

## 18. Agent eligibility

Either Claude or Codex.

## 19. Suggested primary agent

Whichever agent completed CC-02I-02, for context continuity — not a hard
requirement.

## 20. Estimated risk

Medium. The drawer-regression portion is low risk (underlying
implementation is already correct and well-tested); the No-JS fallback is
a genuinely new piece of markup and its own source of risk — it must be
verified to actually work with JavaScript off, not merely assumed correct
from reading the template.
