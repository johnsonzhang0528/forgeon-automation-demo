# CC-02F-09 — Impeccable review

## Goal

Evidence-based Critique/Typeset/Layout/Adapt/Audit pass on the finished
C+ prototype, per spec §17.

## Scope

`docs/engineering/reviews/CC-02F-impeccable-review.md`, covering (with
real screenshots and concrete numbers, not adjectives):

- 5-second comprehension of positioning/inspection/assembly/integration.
- Genuine brand distinctiveness vs Variant A.
- Absence of generic-tech-template feel.
- H1 line breaks (actual line counts per viewport).
- H1-vs-primary-visual weight balance.
- Primary/Secondary visual hierarchy (bounding-box size comparison).
- Absence of two equal-sized media frames.
- Absence of fake specs (grep confirmation).
- Absence of placeholder text (grep confirmation, incl. "NO MEDIA").
- Checks at 1440×900, 1024px, 768×1024, 390×844, 360×800, both locales.
- Header, CTA, reduced motion, focus states, contrast (measured ratios),
  first-viewport image visibility.

## Acceptance criteria

- [ ] Every finding cites a screenshot path and/or a measured number.
- [ ] No claim of the form "looks better"/"feels more premium" without a
      backing measurement or screenshot reference.
