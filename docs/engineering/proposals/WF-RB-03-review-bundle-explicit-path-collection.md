# WF-RB-03 — Review Bundle Explicit Path Collection (Proposal)

Status: **Proposal only. Not registered. Not authorized. Not claimable
until a human issues a single-use maintenance authorization and
`register-maintenance` is run against it.**

This document does not claim, register, or execute anything. It exists so
a human (or ChatGPT) can review and authorize the fix before any agent
touches `scripts/create-review-bundle.sh`.

## 1. Problem

`scripts/create-review-bundle.sh`'s `copy_label_scoped_dir()` function
decides which spec/ticket/review documents to include in a bundle by
testing whether a file's **basename** contains the bundle's label (or the
label's `ccNN`/similar stage-prefix) as a substring:

```bash
find "$src" -type f -iname "*${LABEL}*" -print0
find "$src" -type f -iname "*${STAGE_PREFIX}*" -print0
```

This works when every file in a stage's ticket directory happens to carry
the stage ID in its own filename. It silently fails when a ticket's
filename is topic-named instead (e.g.
`docs/engineering/tickets/CC-02I/01-production-contract-locale-api.md`
contains no substring matching `cc02i`) even though the file's **directory
path** (`docs/engineering/tickets/CC-02I/`) makes its stage membership
unambiguous.

**Concrete failure observed**: building the `WF-CC02I-SPEC-R2` Stage Gate
bundle (`pnpm review:bundle 6ab1e8932a9e719aa3eaf28dfcb4e011cc20da11
cc02i-spec-r2-stage-gate`) produced a bundle missing
`docs/engineering/tickets/CC-02I/01-production-contract-locale-api.md`
and `docs/engineering/tickets/CC-02I/03-mobile-navigation.md` — both
current, unmodified-this-round, and required by the reviewing process to
be present. Incremental Mode's separate `changed source files` mechanism
(which does work by directory-independent git diff) doesn't help either,
since those two files carry no diff against any base commit that doesn't
also reimport the entire prior revision's changeset.

This is a structural gap in the file-collection model, not a defect in
any specific stage's content.

## 2. Proposed fix — explicit directory-scoped collection

Replace basename-substring matching with a two-tier, explicit model:

1. **Ticket files**: collect **every file** under the stage's own ticket
   directory (`docs/engineering/tickets/<STAGE-OR-PRODUCT-ID>/**`),
   independent of individual filenames — directory membership, not
   basename matching, is the source of truth for "this file belongs to
   this stage's ticket set."
2. **Spec/Review files**: collect via an explicit input (a small
   manifest, or the registry proposal's own file paths) rather than
   filename-substring inference — the registry proposal
   (`docs/engineering/specs/<STAGE>-registry-proposal.json`) already
   lists every ticket's exact file path; the bundle script should be able
   to read that as its source of truth for what belongs in a bundle,
   rather than re-deriving it from filenames.

## 3. Constraints on the fix (binding on whichever ticket implements this)

- Must support tracked, staged, and untracked files uniformly — a file's
  git status must not determine whether it's collected.
- Must use NUL-delimited path handling throughout (already partially true
  in the existing script) so paths containing spaces, quotes, or CJK
  characters are never mis-split.
- Must fail closed:
  - If an expected ticket count is known (e.g. from the registry
    proposal) and fewer files are found, refuse to produce a ZIP.
  - If a manifest references a file that doesn't exist, refuse.
  - If two tickets resolve to the same ID, refuse.
  - If any collected path resolves outside the project root (path
    escape, symlink escape), refuse.
  - Secret scan continues to run before any ZIP is written, unchanged.
- Must not regress Incremental Mode's `diff/changes.patch` or Full Mode's
  `git archive` behavior — this fix is scoped to the label-scoped
  doc-copying step only.
- Must not weaken any existing exclusion (`node_modules`, `dist`, fonts,
  screenshots-are-handled-separately, etc.).

## 4. Proposed Stage and Tickets

```
Stage ID: WF-RB-03
Title: Review Bundle Explicit Path Collection
Type: maintenance
External Reviewer: ChatGPT
Claimable: true (once authorized)
```

This stage's authorization must **not** touch `CC-02I`'s `claimable`
value in any way — it is a tooling fix, fully orthogonal to the CC-02I
product stage gate.

### WF-RB-03-01 — Fix the review bundle's file-collection model

**Purpose**: implement §2/§3 above in `scripts/create-review-bundle.sh`.

**Allowed paths** (proposed):
```
scripts/create-review-bundle.sh
docs/engineering/REVIEW_BUNDLE_GUIDE.md
```

**Forbidden paths**: `src/**`, `public/**`, `tests/**` (test additions are
WF-RB-03-02's scope, not this ticket's), `docs/agents/TASK_REGISTRY.json`.

**Acceptance criteria** (draft, to be finalized when this ticket is
actually authorized):
- A stage whose ticket filenames do not contain the stage label is fully
  collected (all files under its ticket directory present in the
  bundle).
- A stage with all 8 (or however many) tickets in its subdirectory is
  collected completely, regardless of individual filenames.
- Fail-closed conditions in §3 are each independently verified.
- Existing Incremental/Full Mode behavior for already-passing scenarios
  is unchanged (no regression against the current 27-ish existing
  `tests/tooling/review-bundle.test.sh` cases — exact current count to be
  confirmed against the file at authorization time, not assumed).

### WF-RB-03-02 — Adversarial and regression test coverage

**Purpose**: prove WF-RB-03-01's fix against the exact failure mode found
in R2, plus adjacent edge cases, via `tests/tooling/review-bundle.test.sh`
(the project's existing shell-based tooling test harness for this
script).

**Allowed paths** (proposed):
```
tests/tooling/review-bundle.test.sh
```

**Required test cases** (minimum set, per the governing instruction):
1. Stage label absent from every ticket filename — still fully collected.
2. All 8 tickets present in a stage subdirectory — full collection
   verified.
3. Mixed tracked/untracked files in the same ticket directory.
4. Paths containing CJK characters, spaces, or quotes.
5. Two files that would produce the same ticket ID — rejected.
6. A ticket deliberately removed from disk before running — bundle
   creation refuses (fail-closed, not a silent partial bundle).
7. An extra, unauthorized file placed in the ticket directory — not
   collected unless it's actually part of the stage's real file set.
8. Path traversal attempt (`../`) — rejected.
9. Symlink pointing outside the project root — rejected.
10. A secret-shaped value planted in a collected file — bundle refuses
    (existing secret-scan behavior, verified still wired to the new
    collection path).
11. Existing Incremental Mode scenarios — no regression.
12. Existing Full Mode scenarios — no regression.
13. All pre-existing `tests/tooling/review-bundle.test.sh` cases continue
    to pass (exact count confirmed at authorization time).

### WF-RB-03-03 — Rebuild and verify the CC-02I R2 Stage Gate bundle

**Purpose**: once WF-RB-03-01/02 land, rebuild
`cc02i-spec-r2-stage-gate` using the fixed tool and verify completeness
before it goes to ChatGPT.

**Allowed paths** (proposed): none under `src/**`/`docs/**` — this ticket
only runs the (by-then-fixed) `pnpm review:bundle` command and inspects
its output; if it needs to write anything, it's limited to
`.review-bundles/**` (already `.gitignore`-excluded, not a tracked path).

**Acceptance criteria**:
- Bundle contains exactly 1 Production Spec, 1 Registry Proposal, 1 R2
  Stage Gate Review, and 8 tickets (CC-02I-01 through CC-02I-08).
- Bundle contains required metadata/manifest (existing
  `metadata/*.txt` set) with correct SHA/commit references.
- Bundle excludes `node_modules`, `dist`, `.git`, `agent-state`,
  authorization files, secrets, font binaries, and any non-essential
  production asset — same exclusion contract as today.
- Old invalid bundle
  (`20260806-2242-cc02i-spec-r2-stage-gate.zip` /
  `.INVALID.txt` marker) is superseded, not silently deleted — leave both
  for audit trail unless a human says otherwise.

## 5. Sequencing back to CC-02I

Per the governing instruction's expected flow: once WF-RB-03 is fixed and
independently reviewed, fast-forward to Integration, sync both worktrees,
return to `WF-CC02I-SPEC-R2`, rebuild the complete bundle, verify all 8
tickets, hand the ZIP to ChatGPT for the actual CC-02I Implementation
Authorization Stage Gate review. `CC-02I` remains `claimable: false`
until ChatGPT explicitly passes that review — this proposal does not
change that in any way.

## 6. What this proposal does not do

- Does not register `WF-RB-03` in `docs/agents/TASK_REGISTRY.json`.
- Does not create or request a Human Authorization file.
- Does not modify `scripts/create-review-bundle.sh` or any test file.
- Does not touch `CC-02I`'s claimability.
- Does not start any CC-02I implementation ticket.
