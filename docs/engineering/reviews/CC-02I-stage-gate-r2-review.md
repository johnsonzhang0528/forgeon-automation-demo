# CC-02I Stage Gate Review — Revision 2

Status: **Awaiting ChatGPT Stage Gate Review — Revision 2.**

**This is the single, canonical CC-02I Implementation Authorization Gate
document**, together with `docs/engineering/specs/CC-02I-registry-
proposal.json`. No other review document (`CC-02I-stage-gate-review.md`,
`CC-02I-stage-gate-r1-review.md`) carries current gate authority — both
are explicitly marked Historical/Superseded and point back to this file.

This document does not itself approve or reject CC-02I. It records what
changed in Revision 2 (`WF-CC02I-SPEC-R2`) in response to ChatGPT's
**REVISE AND RESUBMIT — Narrow Revision 2** verdict on the Revision 1
bundle (`20260806-2107-cc02i-spec-r1-stage-gate.zip`), and maps every
finding to its exact resolution location. Nothing in this round unlocked
`CC-02I`, modified `src/**`/`public/**`, or advanced the project past the
planning stage — see §5 for full confirmation.

## 1. Finding → Fix mapping

| # | ChatGPT finding | Resolution | Location |
|---|---|---|---|
| R2-01 | Three documents disagreed about which Stage Gate Review was current: the original said "superseded by Revision 1," the R1 review called itself current, and the production spec/Ticket 08/R1 mapping still cited the original as the gate | Single canonical gate fixed: `CC-02I-stage-gate-r2-review.md` (this file) + `CC-02I-registry-proposal.json`, full filenames only, no "as revised"/"current revision's" indirection anywhere. Both older review documents rewritten to unambiguous Historical/Superseded status pointing at this file | Production spec §17.1; `CC-02I-stage-gate-review.md` header; `CC-02I-stage-gate-r1-review.md` header; this file |
| R2-02 | Motion Orchestrator's `settled` state was defined as both "the SSR/terminal non-animating state" and "the state normal JS mode starts in and immediately leaves," risking a real settled-then-backward-jump flash; the `:root:not([data-motion-state])` selector example didn't match the Hero root's actual position in the DOM | Four-state model redefined with fixed semantics: a page load is decided once, at a synchronous Motion Bootstrap, to either stay `settled` for its whole lifetime or proceed `armed → running → complete` — there is no code path that shows `settled` and then leaves it. Selector convention fixed to `[data-hero-motion-root][data-motion-state="..."]`, the bare `:root:not(...)` example removed and explicitly prohibited. Seven new mandatory test requirements assigned to CC-02I-06 | Production spec §10 (fully rewritten), §1.4, §8.1, §8.2, §15; Ticket CC-02I-04 §8; Ticket CC-02I-05 §8; Ticket CC-02I-06 §8/§13/§14; Ticket CC-02I-07 §8 |
| R2-03 | Ticket 08 was free to author the Production Acceptance Gate document with no fixed structure, risking an inconsistent or incomplete acceptance record | Eighteen-section fixed schema specified now, in the production spec (§17.2) and in Ticket CC-02I-08 directly — Ticket 08 references the schema rather than inventing one. Section 18 (External Reviewer Verdict) is explicitly a placeholder only — neither agent may write PASS/FAIL/APPROVED into it | Production spec §17.2; Ticket CC-02I-08 §7/§8 |
| R2-04 | No document defined what "the base commit" means for CC-02I-08's review bundle or before/after screenshots, risking Ticket 08 guessing or improvising a base | Fixed rule: the CC-02I Implementation Base Commit is, by definition, the Activation Commit `WF-CC02I-ACT-01` produces when it writes the approved `activation_target` into the live registry. It precedes every CC-02I-01–08 commit, is the mandatory `<base-commit>` for `pnpm review:bundle`, is the "Before" screenshot state, and is recorded by exact SHA in the Production Acceptance Gate's §2/§3. `WF-CC02I-ACT-01` itself is not created or executed this round — only the rule is defined | Production spec §17.3; Ticket CC-02I-08 §8 |
| R2-05 | The R1 review bundle's `handoff/` folder contained `CC-02-chatgpt-review-handoff.md` — a leftover CC-02 prototype-stage document, not a real Revision 1 handoff, because the bundle tool's stage-prefix matching (`cc02` extracted from `cc02i-...` labels) picked the wrong historical file | New, purpose-built handoff created at `docs/engineering/handoffs/CC-02I-spec-r2-chatgpt-review-handoff.md`, containing the R1/R2 commit chain, finding→fix mapping, zero-website-change proof, and explicit next-step instruction. The R2 review bundle is built so this file — not any historical CC-02 document — is the handoff a reviewer actually receives | `docs/engineering/handoffs/CC-02I-spec-r2-chatgpt-review-handoff.md`; Ticket CC-02I-08 §8 (bundle verification step) |
| R2-06 | Ticket CC-02I-02 allowed modifying `Button.astro`, a sitewide shared component, verified only by Header-local tests — a real risk of silently changing every button on the site | Constraint tightened: `Button.astro` is not modified unless the Header CTA token genuinely cannot be expressed through its existing API; any unavoidable change must be a strictly opt-in variant/prop that leaves every existing variant's default output byte-for-byte unchanged, requires an inventory of every existing call site, requires a regression proving unmodified call sites are pixel-identical, and is re-verified in CC-02I-08's sitewide screenshots. If opt-in isn't achievable, CC-02I-02 stops and a separate Remediation Proposal is raised instead of touching the shared default | Production spec §4; Ticket CC-02I-02 §5/§8/§14/§17 |

## 2. Relationship to Revision 1

Revision 1 (`docs/engineering/reviews/CC-02I-stage-gate-r1-review.md`)
resolved thirteen earlier findings (R1-01 through R1-13): schema
ambiguity, path/dependency inconsistency, the original JS/no-JS motion
contradiction, and several underspecified acceptance criteria. None of
those resolutions are reopened or reversed by Revision 2 — R2-02 refines
R1-06's Motion Orchestrator architecture (the single-observer,
single-state-machine design stands; only the first-frame semantics and
selector convention are corrected), and R2-01 completes R1-13's gate
separation (the two-gate split stands; only which specific file is
canonical is now unambiguous).

## 3. Variant C — explicitly not reopened

No section of this revision compares Variant A, B, or C, or revisits any
external ChatGPT decision made during CC-02F or Revision 1. Every fixed
decision in this revision (gate document identity, motion state
semantics, acceptance gate schema, base commit rule, handoff correction,
Button.astro scope) operates strictly *within* Variant C's already-
approved design language — none of them changes what Variant C visually
is.

## 4. Allowed Paths cross-check

Every ticket touched by this revision (CC-02I-02, CC-02I-04, CC-02I-05,
CC-02I-06, CC-02I-07, CC-02I-08) was checked to confirm its Allowed Paths
in `docs/engineering/specs/CC-02I-registry-proposal.json` still match its
own ticket document's §5 "Allowed paths" section after the R2 edits —
confirmed identical for all six. CC-02I-01 and CC-02I-03 are unaffected by
Revision 2's findings and are unchanged from Revision 1.

## 5. `src/**` / `public/**` — zero change confirmation

This revision modifies only:

```
docs/engineering/specs/CC-02I-header-hero-production-spec.md
docs/engineering/specs/CC-02I-registry-proposal.json
docs/engineering/reviews/CC-02I-stage-gate-review.md (status annotation only)
docs/engineering/reviews/CC-02I-stage-gate-r1-review.md (status annotation only)
docs/engineering/reviews/CC-02I-stage-gate-r2-review.md (new, this file)
docs/engineering/tickets/CC-02I/02-header-production-implementation.md
docs/engineering/tickets/CC-02I/04-hero-production-structure.md
docs/engineering/tickets/CC-02I/05-brand-primitives-hero-visual.md
docs/engineering/tickets/CC-02I/06-motion-reduced-motion-performance.md
docs/engineering/tickets/CC-02I/07-responsive-locale-accessibility.md
docs/engineering/tickets/CC-02I/08-regression-qa-review-bundle.md
docs/engineering/handoffs/CC-02I-spec-r2-chatgpt-review-handoff.md
```

`git diff --name-only -- src public` is confirmed empty at the time this
document was written (see the completion report for the exact command
output at time of writing). `src/components/prototypes/cc02-final/**` and
`src/pages/internal-preview/cc02-final/**` are confirmed untouched.

## 6. CC-02I claimability — unchanged

`docs/agents/TASK_REGISTRY.json`'s `CC-02I` entry remains `claimable:
false`, `spec: null`, `tickets: []` throughout this revision. The only
change made to `TASK_REGISTRY.json` during `WF-CC02I-SPEC-R2` is the
addition of the `WF-CC02I-SPEC-R2` maintenance stage entry itself (via
`register-maintenance` plus a human-executed Registration Bootstrap
Commit, following the same pattern established in Revision 1) — the
`CC-02I` entry is untouched.

## 7. Activation Workflow — still not created

`WF-CC02I-ACT-01` is not created, claimed, or executed as part of this
revision, consistent with the governing authorization's explicit
constraint. §17.3's Implementation Base Commit rule defines what
`WF-CC02I-ACT-01` must produce when it eventually runs, but does not run
it.

## 8. What ChatGPT should focus review on for Revision 2

1. Whether the fixed four-state Motion Orchestrator model (R2-02) fully
   eliminates the first-frame flash risk, or whether the synchronous
   Motion Bootstrap's placement requirement needs to be even more
   specific (e.g. an exact `<script>` position relative to specific DOM
   nodes) before implementation starts.
2. Whether the eighteen-section Production Acceptance Gate schema
   (R2-03) is complete, or whether additional sections (e.g. a dedicated
   rollback plan) should be added before CC-02I-08 is claimable.
3. Whether the Implementation Base Commit rule (R2-04) is sufficient
   without also specifying now what `WF-CC02I-ACT-01`'s own spec must
   contain — or whether that should be drafted in this same round rather
   than deferred.
4. Whether the `Button.astro` opt-in constraint (R2-06) is strict enough,
   or whether CC-02I-02 should be barred from modifying `Button.astro` at
   all, with the action-primary token expressed some other way (e.g. a
   CSS custom property override at the call site) instead.
5. Whether the gate-consolidation fix (R2-01) leaves any remaining
   ambiguous reference anywhere else in the repository outside the files
   this revision touched.

## 9. Recommendation

**This document does not recommend unlocking CC-02I.** It confirms all
six R2 findings have a specific, traceable resolution (§1), that no
website code was touched, and that the gate-document ambiguity from
Revision 1 is fully resolved. Whether these resolutions are sufficient for
approval remains ChatGPT's determination.
