# 01 — Fix `/en/` 360px horizontal overflow

**What to build:** Resolve the long-known `/en/` homepage 360×800 overflow
(`scrollWidth: 377px` vs. `clientWidth: 360px`, a 17px defect first
recorded in CC-01's post-hoc review and explicitly deferred to CC-02 as the
first legitimate stage allowed to touch homepage structure). Find the real
overflowing element via Playwright DOM measurement — do not paper over it
with `overflow-x: hidden`, a global `clip`, or content hiding.

**File scope:** `src/components/sections/CTABanner.astro`,
`tests/e2e/responsive-overflow.spec.ts`. Explicitly NOT
`src/pages/{zh-tw,en}/index.astro`'s Hero content/structure.

**Blocked by:** None.

**Status:** done

- [x] Root cause identified via Playwright `getBoundingClientRect()` sweep,
      not guessed: `CTABanner.astro`'s `.cta-banner` applied its own
      `margin-inline` using the same token its inner `.container` ALSO
      applies as `padding-inline` — a double gutter unique to this
      component (confirmed no other component stacks a second
      `margin-inline` outside a `.container`'s own padding).
- [x] Fix scoped entirely to `CTABanner.astro`: responsive outer margin
      (`--page-gutter-{mobile,tablet,desktop}` instead of a flat
      desktop-sized clamp) + a component-scoped allowance for the CTA
      button label to wrap at very narrow widths.
- [x] `/en/` at 360px: `scrollWidth <= clientWidth`, verified 0px overflow
      (was 17px).
- [x] Hero content/structure on `src/pages/{zh-tw,en}/index.astro` not
      touched.
- [x] No regression: 56/56 manual sweep checks (7 viewports × 8 pages ×
      2 locales representative set) clean; full Playwright suite 201/201
      (was 197/198 — the one prior known failure is now fixed, not hidden);
      axe 15/15, 0 critical/0 serious.
- [x] New dedicated regression tests in `responsive-overflow.spec.ts`
      (`CC-02-01` describe block): scrollWidth check, no-element-past-edge
      sweep, CTA banner buttons within bounds.
