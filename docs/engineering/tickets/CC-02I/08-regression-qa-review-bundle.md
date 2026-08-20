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

## Revision note (R2)

Revision 2 per findings R2-01, R2-03, R2-04, and R2-05:

- **R2-01**: this ticket's references to "the Implementation Authorization
  Gate" now name `docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`
  explicitly — the original `CC-02I-stage-gate-review.md` reference from
  Revision 1 is stale (that file is now Historical/Superseded).
- **R2-03**: the Production Acceptance Gate document this ticket creates
  no longer has a free-form structure — its eighteen fixed sections are
  specified below and in the production spec §17.2. Section 18 is a
  placeholder only.
- **R2-04**: the review bundle's `<base-commit>` is no longer this
  ticket's choice — it is fixed to the CC-02I Implementation Base Commit
  (the Activation Commit `WF-CC02I-ACT-01` produces), handed to this
  ticket, not derived or guessed.
- **R2-05**: this ticket's bundle-build step must verify the correct
  Revision 2 handoff document is selected as the bundle's `handoff/`
  content, not a stale historical CC-02 prototype-stage document (a real
  defect found in the Revision 1 bundle).

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
  a reduced-motion screenshot and a before/after comparison pair.
- Build the review bundle via `pnpm review:bundle <base-commit>
  cc02i-header-hero`, where **`<base-commit>` is the CC-02I Implementation
  Base Commit (§7.2 below, R2-04) — never a value this ticket derives,
  guesses, or picks from the local git log.**
- Produce a CC-02I ChatGPT handoff document under
  `docs/engineering/handoffs/`, and verify it — not any historical
  document — is what the review bundle actually selects as its `handoff/`
  content (§7.3, R2-05).
- Produce the **CC-02I Production Acceptance Gate** review under
  `docs/engineering/reviews/CC-02I-production-acceptance-gate.md`, using
  the fixed eighteen-section schema in §7.1 below (R2-03) — not a
  free-authored structure.

### 7.1 Production Acceptance Gate — fixed eighteen-section schema (R2-03)

`docs/engineering/reviews/CC-02I-production-acceptance-gate.md` must
contain exactly these sections, in this order — this schema is fixed by
the production spec (§17.2) and by this ticket; it is not invented at
ticket-execution time:

1. Gate identity and purpose.
2. Implementation Base Commit (exact SHA, §7.2 below).
3. Candidate / Final Checkpoint Commit (exact SHA, this ticket's own final
   commit).
4. CC-02I-01 through CC-02I-08 commit map (one SHA per ticket).
5. Actual changed files and scope diff (relative to the Implementation
   Base Commit).
6. Variant C visual consistency.
7. Header acceptance.
8. Hero structure and DOM order acceptance.
9. Locale and real-route acceptance.
10. No-JS, reduced motion, and Motion State acceptance (per the production
    spec §10's four-state model and CC-02I-06's required test coverage).
11. Responsive, 320px, and 200% zoom acceptance.
12. Accessibility and keyboard acceptance.
13. Performance data table (per the production spec §12's numeric
    thresholds).
14. Full regression test results.
15. Screenshot and review bundle paths.
16. Known deviations, failures, and risks.
17. Integration readiness.
18. External Reviewer Verdict — **placeholder only.** This ticket writes
    exactly the literal text `Awaiting ChatGPT / User External Review`
    into this section. Neither Claude nor Codex writes PASS, FAIL,
    APPROVED, or any other verdict here, under any circumstance.

### 7.2 Implementation Base Commit (fixed rule, R2-04)

The CC-02I Implementation Base Commit is, by definition, the Activation
Commit `WF-CC02I-ACT-01` produces when it writes the ChatGPT-approved
`activation_target` into the live `TASK_REGISTRY.json`. This ticket:

- Receives that SHA as a known input (from `WF-CC02I-ACT-01`'s own spec/
  handoff output) — it does not search git history or infer it.
- Uses it as the `<base-commit>` argument to `pnpm review:bundle`.
- Uses it as the "Before" state for the before/after screenshot pair —
  "After" is this ticket's own final checkpoint commit.
- Records both SHAs explicitly in the Production Acceptance Gate's §2 and
  §3 (§7.1 above).

`WF-CC02I-ACT-01` is not created or executed as part of this stage
(`WF-CC02I-SPEC-R2`) — this rule only defines what this ticket must do
once that workflow exists and hands it a real SHA.

### 7.3 Handoff correctness (R2-05)

A defect found in the Revision 1 review bundle: its `handoff/` folder
contained `docs/engineering/handoffs/CC-02-chatgpt-review-handoff.md` — a
leftover CC-02 prototype-stage document, not a real Revision 1 handoff,
because the bundle tool's stage-prefix matching picked the wrong
historical file. Before finalizing the bundle, this ticket verifies
`metadata/bundle-summary.txt` (or the bundle tool's equivalent output)
names the actual CC-02I completion handoff this ticket produces — not any
older CC-02-prefixed document — and corrects the bundle label or handoff
file naming if the mismatch recurs.

### 7.4 Two distinct gates (R1-13 fixed the split; R2-01 fixes which file is canonical)

This stage has two separate gate documents, never merged into one:

1. **CC-02I Implementation Authorization Gate** —
   `docs/engineering/reviews/CC-02I-stage-gate-r2-review.md` (the
   canonical, current review — **not** `CC-02I-stage-gate-review.md`,
   which is Historical/Superseded, and **not**
   `CC-02I-stage-gate-r1-review.md`, which is Superseded by Revision 2)
   plus `docs/engineering/specs/CC-02I-registry-proposal.json`. This gate
   decides only whether the eight tickets may **start**. It does not, and
   must not, attempt to judge the finished implementation — it is a
   pre-work authorization gate, evaluated before any ticket touches
   `src/**`.
2. **CC-02I Production Acceptance Gate** — the document this ticket
   creates per §7.1's fixed eighteen-section schema, built only after
   CC-02I-08 completes. It judges the **finished, implemented** result:
   whether the shipped Header/Hero actually matches Variant C, whether
   regression passed, whether it's ready to integrate/merge, whether any
   rework is needed. It must not reuse or extend the Implementation
   Authorization Gate documents — distinct file, distinct purpose,
   distinct point in the timeline.

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
- [ ] Review bundle built successfully via `pnpm review:bundle
      <Implementation Base Commit SHA> cc02i-header-hero` — base commit
      is the value received from `WF-CC02I-ACT-01`, not derived or
      guessed (R2-04).
- [ ] ChatGPT handoff document complete, and confirmed (not assumed) to
      be the document the review bundle actually selects as its
      `handoff/` content — no stale CC-02-prefixed document present
      (R2-05).
- [ ] **CC-02I Production Acceptance Gate** document created at
      `docs/engineering/reviews/CC-02I-production-acceptance-gate.md`
      with all eighteen fixed sections present in order (R2-03), clearly
      separate from the Implementation Authorization Gate documents
      (`CC-02I-stage-gate-r2-review.md` + registry proposal), and section
      18 contains exactly the placeholder text `Awaiting ChatGPT / User
      External Review` — no PASS/FAIL/APPROVED verdict written by either
      agent.
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
(built by this ticket per §7.1's fixed eighteen-section schema, R2-03)
reports against — a document distinct from the **CC-02I Implementation
Authorization Gate** (`CC-02I-stage-gate-r2-review.md` + registry
proposal, R2-01) that governed whether the eight tickets could start in
the first place. Neither gate document decides its own outcome — both
remain ChatGPT's/the user's call, per
`docs/agents/DUAL_AGENT_PROTOCOL.md`'s stage gate rule.
