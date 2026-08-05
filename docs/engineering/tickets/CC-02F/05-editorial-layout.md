# CC-02F-05 — Editorial layout (desktop/tablet composition)

## Goal

Build the desktop/tablet 12-column editorial composition per spec §6/§7:
Datum Origin at column 1 above H1, H1 spanning columns 1-9, Copy spanning
columns 1-5, Primary Visual spanning columns 5-11 (may bleed 24-48px
outside the grid), Secondary Detail spanning columns 10-13, Evaluation
Ledger spanning columns 1-5 below Copy, Process Rail spanning the Hero's
full width at the bottom.

## Scope

New component: `src/components/prototypes/cc02-final/
FinalEditorialHero.astro`, composing `PrecisionSystemVisual`,
`EvaluationLedger`, `ProcessRail`, and the copy/CTA block. Keeps Variant
C's asymmetric editorial DNA (not a left/right split, not three
equal-sized cards) while fixing CC-02's fake-data spec table and adding
the Process Rail absorbed from Variant A.

## Acceptance criteria

- [ ] At 1440×900: H1 measures within the spec's ~850-980px Chinese
      visual-width target, ≤3 lines.
- [ ] Primary Visual is visibly larger than Secondary Visual (bounding-box
      area comparison).
- [ ] Above-the-fold (first ~760-820px) shows brand + H1 + body + CTA +
      primary visual + at least part of the Process Rail simultaneously.
- [ ] At 768×1024 (tablet): no horizontal overflow, content order matches
      spec §7.
