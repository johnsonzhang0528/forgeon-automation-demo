# CC-02F-10 — ChatGPT Stage Gate handoff

## Goal

Prepare the review bundle and handoff doc for one more external ChatGPT
Hero Stage Gate review, per spec §18.

## Scope

- `docs/engineering/handoffs/CC-02F-chatgpt-review-handoff.md` — Base,
  Head, external direction decision, copy changes, fake-data removal,
  header refinement, desktop/mobile composition, PrecisionSystemVisual
  description, Process Rail, Motion, Tests (pass/fail counts), Impeccable
  summary, Screenshots (list + paths), Known Limits, decisions still
  pending before real integration.
- `npx --yes pnpm review:bundle <CC02F_BASE> cc02-final-hero` — verify the
  resulting zip's contents (no absolute paths, no parent-repo name, no
  font/screenshot binaries in the patch, includes all 11 screenshots, the
  spec/tickets/reviews/handoff docs, prototype source, tooling script +
  test).

## Explicit scope boundary

This ticket produces a Stage Gate **submission**, not a decision. It does
not decide whether C+ ships. It does not start CC-03.

## Acceptance criteria

- [ ] Handoff doc exists and covers every section listed above.
- [ ] Review bundle built, verified (grep/zip_list spot checks), size
      recorded.
- [ ] No push performed.
