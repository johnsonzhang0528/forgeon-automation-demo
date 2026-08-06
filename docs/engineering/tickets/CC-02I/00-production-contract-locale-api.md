# CC-02I-01 — Production Contract and Locale API

## 1. Ticket ID

CC-02I-01

## 2. Title

Production data contract and Locale API for Hero/Header — no visual change

## 3. Purpose

Establish the production-side data contract this whole stage depends on
before any visual component work starts: the Hero/Header copy moves out of
the prototype-only `src/data/cc02-final-hero.ts` shape and into the real
`Dictionary` (`src/data/locales/{zh-tw,en}.ts`) that `getDictionary()`
already serves. This ticket produces no visible change to the live site —
it only adds new, unused-until-CC-02I-02/04 dictionary keys and confirms
the typing compiles. Doing this first means every later ticket in this
stage consumes one real API instead of each re-deriving its own.

## 4. Dependencies

None — this is the first ticket in the stage and the dependency root for
CC-02I-02 through CC-02I-05.

## 5. Allowed paths

- `src/data/locales/zh-tw.ts`
- `src/data/locales/en.ts`
- `src/utils/i18n.ts` (only if a new helper is genuinely needed — prefer
  not touching it)
- `docs/engineering/specs/CC-02I-header-hero-production-spec.md` (doc
  updates only, e.g. correcting a key name discovered during
  implementation)

## 6. Forbidden paths

- `src/pages/**`
- `src/components/**`
- `src/config/**` (site.ts / nav.ts are read-only inputs, not edited here)
- `public/**`

## 7. Expected files

- Modified: `src/data/locales/zh-tw.ts`, `src/data/locales/en.ts`
- No new files expected unless the ticket owner finds the dictionary
  pattern insufficient (see §17 rollback condition).

## 8. Implementation requirements

- Add a `hero` key to both locale dictionaries per spec §7's proposed
  shape: `eyebrow`, `headline` (with embedded `\n` at the spec-fixed break
  point), `body`, `ctaPrimary`, `ctaSecondary`, `visualAlt`,
  `secondaryVisualAlt`, `ledger` (array of `{ heading, detail }`, exactly 3
  entries), `processRail.steps` (4-string array), `processRail.railLabel`,
  `processRail.stateLabels` (`{ unconnected, aligned, connected }`).
- Copy the verbatim strings from `src/data/cc02-final-hero.ts` (spec §7 /
  §4 of the CC-02F spec) — no paraphrasing, no retranslation.
- Confirm `Dictionary` (the `DeepString<typeof zhTW>` type) still resolves
  correctly against `en.ts`'s shape — `pnpm check` must pass with zero new
  errors.
- Do not import or reference `src/data/cc02-final-hero.ts` from production
  code — it stays untouched, still used only by CC-02F's own prototype
  route and tests.

## 9. Design requirements

None — this ticket is data-only, no CSS/visual work.

## 10. Accessibility requirements

- `visualAlt`/`secondaryVisualAlt`/`processRail.railLabel` strings must be
  real, descriptive text (not empty strings, not placeholder text) since
  CC-02I-05/CC-02I-03 will wire them directly into `aria-label`s.

## 11. Performance requirements

None (static data, zero runtime cost either way).

## 12. Locale requirements

This ticket *is* the locale requirement — see §8. Both `zh-tw` and `en`
must be added in the same commit; do not ship one locale without the
other.

## 13. Tests

- `pnpm check` (TypeScript strict — must stay 0 errors/0 warnings).
- No new Playwright test required by this ticket alone (nothing renders
  yet); CC-02I-08 covers end-to-end verification once the data is
  consumed.

## 14. Acceptance criteria

- [ ] `hero` key present in both `zh-tw.ts` and `en.ts` with identical key
      structure (verified by `Dictionary` type-check, not just eyeballing).
- [ ] All string values match the CC-02F spec's verbatim copy exactly
      (character-for-character diff against `docs/engineering/specs/
      CC-02F-final-editorial-hero.md` §4 and `src/data/cc02-final-hero.ts`).
- [ ] `pnpm check` passes with 0 errors, 0 warnings.
- [ ] `pnpm build` still succeeds (data addition alone must not break the
      build — nothing consumes the new keys yet, so this mainly confirms no
      syntax/type regression).
- [ ] No file outside §5's allowed paths is modified.

## 15. Completion evidence

- `pnpm check` output (0/0).
- `pnpm build` output (unchanged page count).
- Diff of both locale files for reviewer verbatim-copy verification.

## 16. Handoff requirements

Standard `agent:checkpoint` / `agent:handoff` per
`docs/agents/DUAL_AGENT_PROTOCOL.md`. Handoff narrative must state which
dictionary keys were added, in Traditional Chinese, per
`docs/agents/COMMUNICATION_POLICY.md`.

## 17. Rollback/failure conditions

If the `Dictionary`/`DeepString` pattern cannot cleanly express the
`ledger`/`processRail` nested-array shape (e.g. a real TypeScript
limitation is hit), stop and flag rather than inventing a parallel data
file — this is the one condition under which the ticket may propose a
schema change, and it must be recorded as a spec deviation for the next
Stage Gate review, not silently resolved.

## 18. Agent eligibility

Either Claude or Codex may claim and complete this ticket — it is pure
data/typing work with no UI judgment calls.

## 19. Suggested primary agent

Either (no strong preference — recommend whichever agent is idle first).

## 20. Estimated risk

Low. Additive-only data change, fully reversible, no visual surface, no
production route touched.
