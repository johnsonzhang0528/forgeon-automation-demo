# CC-02F-03 — Final prototype Header

## Goal

Fix `PrototypeHeader.astro`'s over-weighted Language button and build a
locale-aware Header for the C+ route, isolated from both the CC-02 spike's
`PrototypeHeader` and the real production `Header.astro`.

## Scope

New component: `src/components/prototypes/cc02-final/
FinalPrototypeHeader.astro`.

- Desktop height 80px, Mobile height 64-68px.
- Logo mark ~26-30px, brand wordmark clearly legible — must not be
  visually subordinate to the language control.
- Language control: keeps a 44×44px tap area, but a visually lighter
  treatment than CC-02's `.proto-header__lang` (thinner border, no heavy
  box) — reduced visual weight relative to the wordmark, verified by
  screenshot comparison, not just asserted.
- Header CTA uses `--color-action-primary` / `--color-action-primary-
  hover` (already the correct tokens per CC-02-03 — carried forward, not
  re-derived).
- Nav hover: short Datum-line treatment (reused from CC-02's proven
  `::after` scaleX pattern).
- No large pill buttons, no mega menu.
- Receives `locale` as a prop from the page (real route data), not a
  client-side toggle — the language link is a real `<a href>` to the
  sibling locale route.
- Does not import `src/config/nav.ts` or link into real production
  routes (same isolation contract as CC-02's `PrototypeHeader`) — nav
  items are prototype-only labels, links are `href="#"` / `data-proto-
  noop` except the language switch, which is the one real link this
  Header has.

## Acceptance criteria

- [ ] Desktop header height measures 80px, mobile 64-68px (Playwright
      `getBoundingClientRect()`).
- [ ] Language control's bounding box is ≥44×44px at all viewports.
- [ ] Language control visually reads as smaller/lighter than the
      wordmark in a side-by-side screenshot comparison against CC-02's
      `PrototypeHeader`.
- [ ] `src/components/layout/Header.astro` has zero diff from
      `CC02F_BASE`.
