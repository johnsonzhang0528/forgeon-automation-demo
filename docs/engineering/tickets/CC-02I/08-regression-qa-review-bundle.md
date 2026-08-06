# CC-02I-08 — Regression, QA, and Review Bundle

## Revision note (R1)

Revision 1 per ChatGPT's REVISE AND RESUBMIT finding. Changes from the
original: this ticket's Allowed Paths now **explicitly and only** cover
documentation/evidence directories — no `src/**` or `public/**` path is
ever allowed under this ticket, even for a "small" fix. If final
regression finds a source-level problem, this ticket fails immediately;
the fix happens in a separate, newly-authorized Remediation Ticket, then
this ticket re-runs from a clean state. This ticket also now produces the
CC-02I **Production Acceptance Gate** review (distinct from the
Implementation Authorization Gate that governs whether the eight tickets
may start — R1-13).

## 1. Ticket ID

CC-02I-08

## 2. Title

Full sitewide regression suite, screenshot set, and Production Acceptance Gate bundle

## 3. Purpose

Every earlier ticket verifies its own slice; none of them re-runs the
*entire* site's existing test suite (all 14 page types, not just home) or
produces the review-bundle artifact and Production Acceptance Gate review
the external ChatGPT reviewer needs to decide whether the finished CC-02I
implementation is launch-ready. This ticket is the stage's closing gate.
It never touches source — a source-level regression found here is this
ticket's failure condition, not something it fixes in place.

## 4. Dependencies

CC-02I-01 through CC-02I-07 (all prior tickets — this is the final ticket
in the stage, run only once everything else is complete).

## 5. Allowed paths

**Only** the following — no exceptions, no "just this once" additions:

```
docs/screenshots/**
docs/engineering/handoffs/**
docs/engineering/reviews/**
```

## 6. Forbidden paths

**Explicitly, absolutely forbidden — no source fix of any size under this
ticket:**

```
src/**
public/**
```

Also forbidden: any new component, any new page, any new locale key,
`docs/agents/TASK_REGISTRY.json` (never hand-edited by either agent per
`DUAL_AGENT_PROTOCOL.md`).

## 7. Implementation requirements

- Run the **complete** existing suites, not a Header/Hero subset:
  - `pnpm test:e2e` (full suite, all 14 page types, not just home).
  - `pnpm test:axe` (full suite).
  - `pnpm check:h1`, `pnpm check:links`, `pnpm check:locale-routes`.
  - `pnpm check`, `pnpm typecheck`, `pnpm build`.
- Capture the full CC-02F-style screenshot set for the *production*
  homepage (not `/internal-preview/`): 320×800, 360×800, 390×844,
  768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, both locales — plus
  a reduced-motion screenshot and a before/after comparison against the
  pre-CC-02I homepage.
- Build the review bundle via `pnpm review:bundle <base-commit>
  cc02i-header-hero` (per `docs/engineering/REVIEW_BUNDLE_GUIDE.md`'s
  existing convention).
- Produce a CC-02I ChatGPT handoff document under
  `docs/engineering/handoffs/`.
- Produce the **CC-02I Production Acceptance Gate** review under
  `docs/engineering/reviews/` (R1-13 — see §8 below for what this
  document must and must not contain).

### Two distinct gates (R1-13 — mandatory separation)

This stage now has two separate gate documents, never merged into one:

1. **CC-02I Implementation Authorization Gate** — the *existing*
   `docs/engineering/specs/CC-02I-registry-proposal.json` plus
   `docs/engineering/reviews/CC-02I-stage-gate-review.md` (as revised
   under CC-02I-01 in this same R1 pass). This gate decides only whether
   the eight tickets may **start**. It does not, and must not, attempt to
   judge the finished implementation — it is a pre-work authorization
   gate, evaluated before any ticket touches `src/**`.
2. **CC-02I Production Acceptance Gate** — a **new** document this ticket
   creates (`docs/engineering/reviews/CC-02I-production-acceptance-gate.
   md` or an equivalent clearly-named file under `docs/engineering/
   reviews/`), built only after CC-02I-08 completes. It judges the
   **finished, implemented** result: whether the shipped Header/Hero
   actually matches Variant C, whether regression passed, whether it's
   ready to integrate/merge, whether any rework is needed. It must not
   reuse or extend the Implementation Authorization Gate document —
   distinct file, distinct purpose, distinct point in the timeline.

## 8. Design requirements

None — this ticket verifies and documents, it does not design.

## 9. Accessibility requirements

Full-suite `pnpm test:axe` must pass 0 Critical/Serious across all 14 page
types (not just home) — confirms the Header change (which appears on every
page) didn't regress any other page's accessibility.

## 10. Performance requirements

Sitewide Lighthouse spot-check on at least 2-3 non-homepage page types, to
confirm the Header change didn't regress performance elsewhere.

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
- [ ] `pnpm build` — succeeds, expected page count.
- [ ] Full 8-breakpoint × 2-locale screenshot set captured for the
      production homepage.
- [ ] Review bundle built successfully via `pnpm review:bundle`.
- [ ] ChatGPT handoff document complete.
- [ ] **CC-02I Production Acceptance Gate** document created, clearly
      separate from the Implementation Authorization Gate document, and
      does not itself declare final approval (that remains ChatGPT's/the
      user's decision, same as the Implementation Authorization Gate
      never self-approves).
- [ ] `git diff --name-only -- src public` is **empty** for this ticket's
      own changes (this ticket adds zero lines to `src/**`/`public/**` —
      if the command shows anything, that reflects earlier tickets'
      already-committed work, not this ticket, and must be confirmed as
      such, not silently attributed to this ticket).
- [ ] If any regression is found anywhere in `src/**`/`public/**`, this
      ticket **fails** — see §17.

## 14. Completion evidence

- Full output logs for every command in §7.
- Screenshot set (file listing).
- Review bundle manifest.
- Handoff document itself.
- Production Acceptance Gate document itself.

## 15. Handoff requirements

This ticket's own output *is* a handoff document. Additionally, standard
`agent:checkpoint`/`agent:handoff` per `DUAL_AGENT_PROTOCOL.md` for the
ticket's own completion record, narrated in zh-TW.

## 16. Rollback/failure conditions

**If the full-suite run surfaces any regression inside `src/**` or
`public/**`** — no matter how small, no matter how "obviously correct" the
fix would be — this ticket **fails immediately**. It does not fix the
regression itself, under any circumstance. The correct next step is:

1. Document the failure precisely (which test, which file, what broke).
2. Do not mark this ticket, or the stage, complete.
3. A separate, newly-authorized Remediation Ticket (its own Human
   Authorization, its own claim/step/commit cycle) fixes the regression.
4. Once the Remediation Ticket lands, CC-02I-08 re-runs from a clean
   state — the full suite, screenshots, and bundle are all regenerated,
   not patched.

This is a stricter rule than the original version of this ticket, which
allowed "small, obviously correct" fixes directly inside CC-02I-08 — R1
removes that allowance entirely, per the explicit R1-10 instruction that
Ticket 08 must never carry `src/**`/`public/**` repair permission.

## 17. Agent eligibility

Either Claude or Codex — though whichever agent runs this ticket should not
be the sole author of every prior ticket, since an independent full-suite
run catches more than a self-check by the same agent that wrote the code.

## 18. Suggested primary agent

Whichever agent did **not** do the majority of CC-02I-04/05 (the Hero
structure/visual tickets), for an independent verification pass.

## 19. Estimated risk

Low for the ticket's own actions (verification/packaging only, zero
source-write permission), but this is the ticket most likely to *reveal*
accumulated risk from every earlier ticket — treat any full-suite failure
here as a real, stage-blocking signal that requires a separate
Remediation Ticket, never a same-ticket patch.

## 20. Stage Gate note

This ticket's completion is what the **CC-02I Production Acceptance Gate**
(built by this ticket, per R1-13) reports against — a document distinct
from the **CC-02I Implementation Authorization Gate**
(`CC-02I-stage-gate-review.md`, revised under CC-02I-01) that governed
whether the eight tickets could start in the first place. Neither gate
document decides its own outcome — both remain ChatGPT's/the user's call,
per `docs/agents/DUAL_AGENT_PROTOCOL.md`'s stage gate rule.
