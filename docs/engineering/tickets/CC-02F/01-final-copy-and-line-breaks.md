# CC-02F-01 — Final copy and line breaks

## Goal

Replace CC-02's shared design-spike copy with the spec-exact CC-02F final
copy (spec §4/§8), centralized in `src/data/cc02-final-hero.ts`, and verify
the mandated line-break behavior at every required viewport.

## Scope

- New copy source: `src/data/cc02-final-hero.ts` — exact zh-tw/en strings
  for eyebrow/H1/body/ctaPrimary/ctaSecondary, plus the Evaluation Ledger's
  three groups (§9/§12 of the spec) and the Process Rail's four step
  labels.
- Do **not** edit `src/pages/internal-preview/cc02-hero/_shared/copy.ts` —
  that file remains the historical CC-02 spike's byte-identical copy
  contract, untouched.
- H1 line-break requirements: zh desktop max 3 lines, mobile max 4 lines;
  "流程。" (or English's final word) never isolated alone on a line; no
  isolated punctuation mark alone on a line; "組裝" (or English equivalent)
  never split across a line break.

## Verification

- Screenshot-measured line counts at 1440×900, 1024px, 768×1024, 390×844,
  360×800, both locales (recorded in the Impeccable review, §17 of the
  spec doc).
- No literal `\n` rendering as a visible character (uses `white-space:
  pre-line` the same way CC-02's variant-c already does).

## Acceptance criteria

- [ ] Every string in `cc02-final-hero.ts` matches the spec's §8 text
      exactly, character for character.
- [ ] H1 desktop ≤3 lines, mobile ≤4 lines, at all four required
      viewports.
- [ ] No isolated final word/punctuation on its own line at any required
      viewport.
