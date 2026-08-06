# CC-02I Specification Revision 2 — ChatGPT Review Handoff

This is the correct, current handoff document for the `WF-CC02I-SPEC-R2`
round. It replaces, for review-bundle purposes, any historical CC-02
prototype-stage handoff a bundle tool's stage-prefix matching may have
picked up in error (the defect this document's creation fixes — see
R2-05 in `docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`).

## 1. Commit chain

| Commit | Role |
|---|---|
| `b92de05bb7dacbfbf595a351330290eb52bfa1d5` | R1 Base Commit — human-adopted CC-02I-PREP specification baseline |
| `25e8586cb8dc89f62a16fe69214acfe8dba4257d` | `WF-CC02I-SPEC-R1` Registration Bootstrap Commit (`TASK_REGISTRY.json` only) |
| `6ab1e8932a9e719aa3eaf28dfcb4e011cc20da11` | R1 Candidate Commit — Revision 1's full spec/registry/ticket revision |
| *(Registration Bootstrap for R2)* | `WF-CC02I-SPEC-R2` Registration Bootstrap Commit (`TASK_REGISTRY.json` only) — see the completion report for the exact SHA |
| *(R2 Candidate Commit)* | This round's full spec/registry/ticket/review/handoff revision — see the completion report for the exact SHA |

## 2. R2 Finding → Fix mapping (summary)

Full detail in `docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`
§1. Summary:

- **R2-01**: Gate-document ambiguity resolved. The single canonical
  Implementation Authorization Gate is now `CC-02I-stage-gate-r2-review.md`
  + `CC-02I-registry-proposal.json`, full filenames only. Both earlier
  review documents are marked Historical/Superseded.
- **R2-02**: Motion Orchestrator's first-frame state model corrected. A
  page load is decided once, at a synchronous Motion Bootstrap, to either
  stay `settled` for its whole lifetime or proceed
  `armed → running → complete` — no code path shows `settled` and then
  leaves it. Selector convention fixed to
  `[data-hero-motion-root][data-motion-state="..."]`; the incorrect
  `:root:not(...)` example removed. Seven new mandatory tests assigned to
  CC-02I-06.
- **R2-03**: Production Acceptance Gate's eighteen-section schema fixed
  now, in the production spec and in Ticket CC-02I-08, rather than left
  for that ticket to invent.
- **R2-04**: CC-02I Implementation Base Commit defined as the Activation
  Commit `WF-CC02I-ACT-01` will produce — the fixed `<base-commit>` for
  CC-02I-08's review bundle and before/after screenshots.
- **R2-05**: This handoff document itself is the fix — a purpose-built R2
  handoff, verified to be what the review bundle actually selects, not a
  stale CC-02 prototype-stage document.
- **R2-06**: `Button.astro`'s modification permission in Ticket CC-02I-02
  scoped down to opt-in-only, with a mandatory call-site inventory and
  no-regression proof, or a Remediation Proposal if opt-in isn't
  achievable.

## 3. Files changed this round

```
docs/engineering/specs/CC-02I-header-hero-production-spec.md
docs/engineering/specs/CC-02I-registry-proposal.json
docs/engineering/reviews/CC-02I-stage-gate-review.md (status annotation only)
docs/engineering/reviews/CC-02I-stage-gate-r1-review.md (status annotation only)
docs/engineering/reviews/CC-02I-stage-gate-r2-review.md (new)
docs/engineering/tickets/CC-02I/02-header-production-implementation.md
docs/engineering/tickets/CC-02I/04-hero-production-structure.md
docs/engineering/tickets/CC-02I/05-brand-primitives-hero-visual.md
docs/engineering/tickets/CC-02I/06-motion-reduced-motion-performance.md
docs/engineering/tickets/CC-02I/07-responsive-locale-accessibility.md
docs/engineering/tickets/CC-02I/08-regression-qa-review-bundle.md
docs/engineering/handoffs/CC-02I-spec-r2-chatgpt-review-handoff.md (new, this file)
```

`docs/engineering/tickets/CC-02I/01-production-contract-locale-api.md` and
`docs/engineering/tickets/CC-02I/03-mobile-navigation.md` are unchanged
from Revision 1 — no R2 finding affects CC-02I-01 or CC-02I-03.

## 4. CC-02I has not been started

No CC-02I ticket (CC-02I-01 through CC-02I-08) has been claimed, started,
or implemented. This round produces specification and planning documents
only, under the separate maintenance stage `WF-CC02I-SPEC-R2`.

## 5. `src/**` / `public/**` — zero change

`git diff --name-only -- src public` is confirmed empty for this entire
round (see the completion report for the exact command output).
`src/components/prototypes/cc02-final/**` and
`src/pages/internal-preview/cc02-final/**` are confirmed untouched.

## 6. CC-02I remains unclaimable

`docs/agents/TASK_REGISTRY.json`'s `CC-02I` entry remains `claimable:
false`, `spec: null`, `tickets: []` throughout this round. The only
`TASK_REGISTRY.json` change this round is the `WF-CC02I-SPEC-R2`
maintenance stage entry itself, added via `register-maintenance` under a
human-issued single-use authorization plus a human-executed Registration
Bootstrap Commit (the same pattern established in Revision 1, since the
workflow does not yet have a dedicated registration-commit primitive —
see the completion report's risk note).

## 7. R2 Review Bundle

Path, size, and file count are recorded in the completion report
accompanying this handoff. The bundle is built in Incremental Mode with
the R1 Candidate Commit (`6ab1e8932a9e719aa3eaf28dfcb4e011cc20da11`) as
its base, per the governing instruction — not the R1 Registration
Bootstrap Commit, to avoid re-including the entire Revision 1 diff.

## 8. What ChatGPT should prioritize reviewing

1. Whether the R2-02 Motion Orchestrator fix (synchronous bootstrap,
   fixed four-state semantics, `[data-hero-motion-root]` selector
   convention, seven mandatory tests) fully closes the first-frame flash
   risk, or whether the bootstrap's DOM-placement requirement needs to be
   even more mechanically precise before implementation starts.
2. Whether the R2-03 eighteen-section Production Acceptance Gate schema
   is complete as specified, or needs additions.
3. Whether the R2-04 Implementation Base Commit rule is sufficient on its
   own, or whether `WF-CC02I-ACT-01`'s own required output shape should
   be specified in this same round rather than deferred.
4. Whether the R2-06 `Button.astro` opt-in constraint is strict enough, or
   whether CC-02I-02 should be barred from touching `Button.astro`
   entirely.
5. Whether the R2-01 gate consolidation leaves any remaining ambiguous
   cross-reference anywhere in the repository outside the files this
   round touched.

## 9. Unique next step

This bundle is provided to the user's local ChatGPT session for the
**final CC-02I Implementation Authorization Stage Gate review**. Claude
does not proceed to `WF-CC02I-ACT-01`, does not claim any CC-02I ticket,
and does not self-determine approval — that decision belongs to ChatGPT
and the user.
