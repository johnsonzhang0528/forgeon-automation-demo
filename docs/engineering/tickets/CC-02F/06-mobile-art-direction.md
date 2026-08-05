# CC-02F-06 — Mobile art direction

## Goal

Build the mobile composition per spec §8 at 390×844 and 360×800 — a real
art-direction pass, not a uniform shrink of the desktop layout.

## Scope

- Content order: Datum Origin, H1, Eyebrow, Body, CTA, Primary Visual.
- H1: max 4 lines, no split "組裝"/equivalent, no isolated punctuation.
  Reference sizing (verify via screenshot): `clamp(2.35rem, 10.5vw, 3rem)`,
  `line-height: 1.04`.
- Body: shorter than CC-02 variant-c's mobile body block, ≤5-6 lines.
- CTA: side-by-side at 390px if it fits, stacked at 360px if crowded,
  ≥44px tap height, no text shrinking to solve spacing.
- Primary Visual: ≥30-40% visible within the first 844px scroll, starts no
  later than ~590-630px from top, 4:5 or near-1:1 crop (a distinct crop,
  not `transform: scale()` on the desktop artwork). Secondary Detail may
  be hidden or merged into the primary visual.
- Evaluation Ledger: below the fold.
- Process Rail: horizontally scrollable, `tabindex="0"`, `aria-label`, no
  auto-scroll.

## Acceptance criteria

- [ ] Zero horizontal overflow at 360px (`document.documentElement.
      scrollWidth <= clientWidth`).
- [ ] H1 line count ≤4 at both 390px and 360px.
- [ ] Primary Visual's visible fraction within the first 844px of scroll
      measured via Playwright bounding-box intersection ≥30%.
- [ ] Primary CTA tap target ≥44px height at both mobile widths.
