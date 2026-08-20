# CC-02I Stage Gate Review — Revision 1

Status: **Superseded by Revision 2.**

ChatGPT reviewed the Revision 1 bundle this document accompanied
(`20260806-2107-cc02i-spec-r1-stage-gate.zip`) and returned **REVISE AND
RESUBMIT — Narrow Revision 2**. This document's R1-01 through R1-13
finding→fix history is preserved below, unmodified, as a historical
record — it remains an accurate account of what Revision 1 changed. It
carries **no current gate authority** — it is not part of, and must not
be cited as, the CC-02I Implementation Authorization Gate.

**The single, canonical Implementation Authorization Gate for CC-02I is
`docs/engineering/reviews/CC-02I-stage-gate-r2-review.md`, together with
`docs/engineering/specs/CC-02I-registry-proposal.json`.** Read that
document, not this one, for the current state of CC-02I's planning
package.

---

This document does not itself approve or reject CC-02I. It records what
changed in Revision 1 (`WF-CC02I-SPEC-R1`) in response to ChatGPT's
**REVISE AND RESUBMIT** verdict on the CC-02I-PREP Stage Gate bundle
(`20260806-085203-cc02i-prep-explicit-stage-gate.zip`), and maps every
finding to its exact resolution location. Nothing in this round unlocked
`CC-02I`, modified `src/**`/`public/**`, or advanced the project past the
planning stage.

## 1. Finding → Fix mapping

| # | ChatGPT finding | Resolution | Location |
|---|---|---|---|
| R1-01 | Registry Proposal's `claimable:false`/`status:proposed` conflates "not yet approved" with the post-approval target state, with no clear activation path | Split into `current_live_state` (mirrors the real, current `TASK_REGISTRY.json` entry) and `activation_target` (the proposed post-approval state); explicit `activation_workflow_prerequisites` list states a separate `WF-CC02I-ACT-01` is required and that `register-maintenance` cannot itself unlock a Product Stage | `docs/engineering/specs/CC-02I-registry-proposal.json` |
| R1-02 | Locale schema left "if DeepString doesn't support this, stop at implementation time" as an open question | Fixed, final named-object schema (no array-based `ledger`/`processRail`) specified in full, with verbatim zh-TW/en values, before any ticket starts | Production spec §7; Ticket CC-02I-01 §8 |
| R1-03 | Production component directory (`brand/` vs `sections/`) left to the ticket owner's judgment | Fixed to `src/components/sections/` for all three Hero visual components; explicitly not a seventh Brand Primitive; CC-02F prototype route/components explicitly never modified | Production spec §0, §8.6; Ticket CC-02I-05 §6 |
| R1-04 | `Math.random().toString(36)` SVG UID pattern flagged as unsafe for production | Replaced with a required `uid: string` prop; `Hero.astro` always passes `"homepage-hero-system"`; every SVG sub-ID derives from `uid`; acceptance criteria require a two-build determinism test | Production spec §8.2, §8.6; Ticket CC-02I-05 §8, §13, §14 |
| R1-05 | Conflicting mobile DOM order prose ("H1 → Eyebrow" vs. Eyebrow-first) | Single fixed DOM order specified once, applies at every viewport; desktop CSS Grid may reposition visually but never changes DOM order | Production spec §5; Ticket CC-02I-04 §8 |
| R1-06 | Contradiction between "Hero ships no JS" and "five components animate in a synchronized narrative" | Single Motion Orchestrator owned by `Hero.astro`: one `IntersectionObserver`, one four-state machine (`settled`/`armed`/`running`/`complete`), child components are CSS-reactive only, no per-primitive observer in production | Production spec §10; Ticket CC-02I-06 §8 |
| R1-07 | 320px explicitly listed as unsupported | 320px added as a mandatory, verified breakpoint with specific acceptance rules (no overflow, CTA not clipped, no text-shrink-to-fit, no H1 orphan lines, Primary Visual within viewport, Mobile Menu operable, Language Switch no-overflow, touch targets held) | Production spec §5, §6, §14; Ticket CC-02I-07 §8 |
| R1-08 | Header used a fixed block height that could clip content under zoom; No-JS mobile nav only proved links existed inside `hidden` drawer markup | `min-block-size` with normal-zoom targets, explicit 200%-zoom no-clip requirement; real `<noscript>` fallback with 6 nav links + locale switch + CTA, tested with `javaScriptEnabled: false`; Datum Origin composed in `Header.astro`, `Logo.astro` never modified | Production spec §4; Ticket CC-02I-02 §8, CC-02I-03 §8 |
| R1-09 | CC-02I-04 depended on CC-02I-05 while also being sequenced to run first, implying a placeholder-skeleton approach | Corrected build sequence: CC-02I-01 → CC-02I-05 → CC-02I-02 → CC-02I-03 → CC-02I-04 → CC-02I-06 → CC-02I-07 → CC-02I-08; no placeholder skeleton anywhere | Registry proposal `build_sequence_note`; Ticket CC-02I-04 §4, CC-02I-05 §4 |
| R1-10 | Registry Proposal's Allowed Files didn't match ticket documents; CC-02I-08 risked implicit source-repair permission | Every ticket's Allowed Paths cross-checked against its Registry Proposal entry (§2 below); CC-02I-08's Allowed Paths reduced to only `docs/screenshots/**`, `docs/engineering/handoffs/**`, `docs/engineering/reviews/**` — `src/**`/`public/**` explicitly and permanently forbidden, even for "small" fixes | Registry proposal `activation_target.tickets`; Ticket CC-02I-08 §5, §6, §16 |
| R1-11 | Performance criteria used unmeasurable language ("small enough," "does not regress," "0 CLS," "meaningfully"); "Lighthouic" typo | Fixed numeric thresholds: ≤5-point Performance Score delta (median-of-3), LCP ≤2.5s, CLS ≤0.02, motion duration 750–1150ms, JS/SVG/HTML byte deltas mandatory evidence; typo fixed | Production spec §12; Ticket CC-02I-06 §8 |
| R1-12 | Ticket filenames didn't match the `01`–`08` numbering the spec referenced; 20-field completeness needed re-verification | All 8 tickets renamed to `01-production-contract-locale-api.md` through `08-regression-qa-review-bundle.md`; old `00`–`07` files deleted (human-executed, per WF-CC02I-SPEC-R1's authorization); every ticket re-verified to carry all 20 required fields | `docs/engineering/tickets/CC-02I/01-*.md` through `08-*.md` |
| R1-13 | Pre-work authorization and post-work acceptance were at risk of being judged by the same document | Two explicitly separate, never-merged gate documents defined: Implementation Authorization Gate (this revision's stage-gate-review.md + registry proposal, decides only whether tickets may start) vs. Production Acceptance Gate (built by CC-02I-08 after implementation, judges the shipped result) | Production spec §17; Ticket CC-02I-08 §7, §20 |

## 2. Allowed Paths cross-check (R1-10 verification)

Every `activation_target.tickets[].allowed_files` entry in
`docs/engineering/specs/CC-02I-registry-proposal.json` was checked against
the corresponding ticket document's §5 "Allowed paths" section — confirmed
identical for all 8 tickets (CC-02I-01 through CC-02I-08). No ticket's
Registry Proposal entry lists a path its own ticket document doesn't also
list, and vice versa.

## 3. Variant C — explicitly not reopened

No section of this revision compares Variant A, B, or C, or revisits the
external ChatGPT decision made during CC-02F. Every fixed decision in this
revision (component paths, DOM order, motion architecture, locale schema)
operates strictly *within* Variant C's already-approved design language —
none of them changes what Variant C visually is.

## 4. `src/**` / `public/**` — zero change confirmation

This revision modifies only:

```
docs/engineering/specs/CC-02I-header-hero-production-spec.md
docs/engineering/specs/CC-02I-registry-proposal.json
docs/engineering/reviews/CC-02I-stage-gate-review.md (status annotation only)
docs/engineering/reviews/CC-02I-stage-gate-r1-review.md (new, this file)
docs/engineering/tickets/CC-02I/01-*.md through 08-*.md (renamed + revised)
```

`git diff --name-only -- src public` is confirmed empty at the time this
document was written (see the completion report for the exact command
output at time of writing).

## 5. CC-02I claimability — unchanged

`docs/agents/TASK_REGISTRY.json`'s `CC-02I` entry remains `claimable:
false`, `spec: null`, `tickets: []` throughout this revision. The only
change made to `TASK_REGISTRY.json` during `WF-CC02I-SPEC-R1` is the
addition of the `WF-CC02I-SPEC-R1` maintenance stage entry itself (via
`register-maintenance`, under the human-issued single-use authorization)
— the `CC-02I` entry is untouched, and the workflow tool itself refuses
to register a maintenance stage if the `CC-02I` entry would change during
that operation.

## 6. Activation Workflow — still not implemented (R1-01/R1-13)

Per the registry proposal's `activation_workflow_prerequisites`, moving
from `current_live_state` to `activation_target` requires a separate,
independently-authorized `WF-CC02I-ACT-01` workflow that is **not**
created, claimed, or executed as part of this revision. This revision
produces documents only.

## 7. Open questions carried forward from CC-02I-PREP, now resolved

The original Stage Gate Review (`CC-02I-stage-gate-review.md` §12) listed
four open questions. Their Revision 1 status:

1. Component directory (`brand/` vs `sections/`) — **resolved**, fixed to
   `sections/` (R1-03).
2. Datum mark integration (`Logo.astro` vs. composed in `Header.astro`) —
   **resolved**, fixed to composed in `Header.astro`, `Logo.astro` never
   modified (R1-08).
3. Whether `cc02f-final-hero.spec.ts`'s import paths need updating when
   components relocate — **resolved by removing the relocation itself**:
   production components are now a controlled rewrite at a new path, not
   a move, so the prototype's existing imports and tests are never
   touched (R1-03).
4. Whether `HeroIllustration.astro` has other call sites — **still open**,
   unchanged from the original review; CC-02I-04's implementer checks and
   reports; the file is not deleted regardless of the answer.

## 8. What ChatGPT should focus review on for Revision 1

1. Whether the fixed Motion Orchestrator architecture (R1-06) fully
   resolves the original JS/no-JS contradiction, or introduces a new gap.
2. Whether the numeric performance thresholds (R1-11) are appropriately
   conservative given this is a fictional-company portfolio site with no
   real production traffic history to calibrate against.
3. Whether the two-gate separation (R1-13) is sufficient, or whether the
   Production Acceptance Gate needs its own pre-defined structure now
   rather than being freely authored by CC-02I-08.
4. Whether the corrected ticket build sequence (R1-09) still correctly
   supports the dual-agent one-ticket-at-a-time claim model without
   introducing an idle-wait bottleneck.
5. Whether `activation_workflow_prerequisites`' description of
   `WF-CC02I-ACT-01` as a yet-to-be-created, separately-authorized
   workflow is an acceptable placeholder for this revision, or whether
   ChatGPT wants that workflow's own shape specified now.

## 9. Recommendation

**This document does not recommend unlocking CC-02I.** It confirms all
thirteen R1 findings have a specific, traceable resolution (§1), that no
website code was touched, and that the two-gate separation and activation
workflow prerequisite are now explicit. Whether these resolutions are
sufficient for approval remains ChatGPT's determination.
