# CC-02I-08 — Regression, QA, and Review Bundle

## 1. Ticket ID

CC-02I-08

## 2. Title

Full sitewide regression suite, screenshot set, and ChatGPT Stage Gate bundle

## 3. Purpose

Every earlier ticket verifies its own slice; none of them re-runs the
*entire* site's existing test suite (all 14 page types, not just home) or
produces the review-bundle artifact the external ChatGPT reviewer needs to
make the CC-02I Stage Gate decision. This ticket is the stage's closing
gate: it proves the new Header/Hero didn't regress anything else on the
site, and packages the evidence.

## 4. Dependencies

CC-02I-01 through CC-02I-07 (all prior tickets — this is the final ticket
in the stage, run only once everything else is complete).

## 5. Allowed paths

- `docs/screenshots/` (new homepage screenshots)
- `docs/engineering/handoffs/` (new CC-02I ChatGPT handoff document)
- `docs/engineering/reviews/` (new CC-02I review document, if the
  Impeccable-style evidence-based review from spec §17-equivalent is
  produced as part of this ticket rather than a separate one)
- Any file under `src/**`/`public/**` **only** for a genuine regression fix
  discovered during this ticket's full-suite run — not new feature work.

## 6. Forbidden paths

- No new component, no new page, no new locale key — this ticket verifies
  and packages; it does not build.
- `docs/agents/TASK_REGISTRY.json` (never hand-edited by either agent per
  `DUAL_AGENT_PROTOCOL.md` — registry updates happen through the workflow
  CLI under human/ChatGPT authorization, not this ticket).

## 7. Implementation requirements

- Run the **complete** existing suites, not a Header/Hero subset:
  - `pnpm test:e2e` (full suite, all 14 page types, not just home).
  - `pnpm test:axe` (full suite).
  - `pnpm check:h1`, `pnpm check:links`, `pnpm check:locale-routes`.
  - `pnpm check`, `pnpm typecheck`, `pnpm build`.
- Capture the full CC-02F-style screenshot set for the *production*
  homepage (not `/internal-preview/`): desktop 1440×900, tablet 768×1024,
  mobile 390×844 and 360×800, both locales — plus a reduced-motion
  screenshot and a before/after comparison against the pre-CC-02I
  homepage.
- Build the review bundle via `pnpm review:bundle <base-commit>
  cc02i-header-hero` (per `docs/engineering/REVIEW_BUNDLE_GUIDE.md`'s
  existing convention).
- Produce a CC-02I ChatGPT handoff document under
  `docs/engineering/handoffs/`, following the same structure as
  `docs/engineering/handoffs/CC-02F-chatgpt-review-handoff.md`.

## 8. Design requirements

None — this ticket verifies and documents, it does not design.

## 9. Accessibility requirements

Full-suite `pnpm test:axe` must pass 0 Critical/Serious across all 14 page
types (not just home) — confirms the Header change (which appears on every
page) didn't regress any other page's accessibility.

## 10. Performance requirements

Sitewide Lighthouse spot-check on at least 2-3 non-homepage page types, to
confirm the Header change didn't regress performance elsewhere (the Header
renders on every page, so its change has sitewide reach even though the
Hero change is homepage-only).

## 11. Locale requirements

Every check in §7 covers both locale trees in full, not a sample.

## 12. Tests

This ticket's entire content *is* the test run — see §7.

## 13. Acceptance criteria

- [ ] `pnpm test:e2e` passes 100%, full suite, all page types.
- [ ] `pnpm test:axe` 0 Critical/Serious, full suite, all page types.
- [ ] `pnpm check:h1` — every page has exactly one `<h1>`.
- [ ] `pnpm check:links` — 0 broken internal links.
- [ ] `pnpm check:locale-routes` — 0 broken hreflang, slug parity intact.
- [ ] `pnpm check` — 0 errors, 0 warnings.
- [ ] `pnpm typecheck` — 0 errors.
- [ ] `pnpm build` — succeeds, expected page count (no accidental page
      loss or duplication).
- [ ] Full CC-02F-style screenshot set captured for the production
      homepage, both locales.
- [ ] Review bundle built successfully via `pnpm review:bundle`.
- [ ] ChatGPT handoff document complete, following the established
      handoff structure.
- [ ] `git diff --name-only -- src public` reviewed and every changed file
      is traceable to a specific CC-02I ticket — no stray/unexplained
      change.

## 14. Completion evidence

- Full output logs for every command in §7.
- Screenshot set (file listing).
- Review bundle manifest.
- Handoff document itself.

## 15. Handoff requirements

This ticket's own output *is* a handoff document — see §7's last bullet.
Additionally, standard `agent:checkpoint`/`agent:handoff` per
`DUAL_AGENT_PROTOCOL.md` for the ticket's own completion record, narrated
in zh-TW.

## 16. Rollback/failure conditions

If the full-suite run surfaces a regression outside the Header/Hero
surface (e.g. an unrelated page broke), fix it only if the fix is small,
obviously correct, and squarely caused by this stage's changes (e.g. a
shared component's prop contract shifted). If the regression's cause is
unclear or the fix is non-trivial, stop, document the failure precisely,
and do not mark this ticket — or the stage — complete. A CC-02I Stage Gate
bundle with a known, undocumented regression must not be submitted.

## 17. Agent eligibility

Either Claude or Codex — though whichever agent runs this ticket should not
be the sole author of every prior ticket, since an independent full-suite
run catches more than a self-check by the same agent that wrote the code.

## 18. Suggested primary agent

Whichever agent did **not** do the majority of CC-02I-04/05 (the Hero
structure/visual tickets), for an independent verification pass.

## 19. Estimated risk

Low for the ticket's own actions (verification/packaging), but this is the
ticket most likely to *reveal* accumulated risk from every earlier ticket
— treat any full-suite failure here as a real, stage-blocking signal, not
noise.

## 20. Stage Gate note

This ticket's completion is what CC-02I's Stage Gate review
(`docs/engineering/reviews/CC-02I-stage-gate-review.md`) reports against.
It does not itself decide whether CC-02I is approved — that decision stays
with ChatGPT/the user, per `docs/agents/DUAL_AGENT_PROTOCOL.md`'s stage
gate rule.
