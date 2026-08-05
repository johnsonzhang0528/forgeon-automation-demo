# Isolated Worktree Protocol: Claude Code ↔ Codex

This repository uses three checkouts sharing one Git common directory:

- `main`: integration checkout; AI agents must not develop or claim here.
- `agent/claude`: Claude's worktree.
- `agent/codex`: Codex's worktree.

Runtime Lock is a coordination mechanism. It does not claim to identify or
restrain operating-system processes. The safety boundary is the standalone
repository, separate worktrees, the task registry, commit/patch handoffs, and
the ChatGPT stage gate.

## Sources of truth

- `docs/agents/TASK_REGISTRY.json`: claimable stages, tickets, required tests,
  and permitted file scopes.
- `docs/agents/CURRENT_TASK.json`: versioned, paused baseline and audit schema.
- `<git-common-dir>/agent-state/current-task.json`: live runtime state shared by
  all worktrees.
- `docs/agents/CURRENT_TASK.md`: generated versioned view. Never hand-edit.

Runtime state, autosnapshots, patches, and runtime handoffs are never committed.
They must not contain secrets or absolute paths.

## Claim and development

1. Open the agent's own worktree.
2. Run `pnpm agent:doctor` and `pnpm agent:status`.
3. Claim a registered, claimable ticket from the matching worktree.
4. Start one explicit step before editing.
5. Run tests through `agent:test` so structured evidence is recorded.
6. Stage only through `agent:stage-ticket`.
7. Commit only through `agent:commit-ticket`.
8. Complete, hand off, or human-abort; no ambiguous release is permitted.

Agents must never develop in the integration checkout or the other agent's
worktree. Two worktrees must never check out the same branch.

## Graceful handoff

The source agent runs targeted tests, creates a checkpoint commit, then creates
a structured handoff. The handoff records source/target, stage/ticket/step,
base and checkpoint commits, branch, test evidence, changed files, completed
and remaining work, known failures, exact next step, risk, and timestamp. The
lock is released only after the handoff is durable.

The target validates the commit, creates a new resume branch in its own
worktree from that commit, and continues without modifying the source worktree.

## Sudden-stop recovery

The canonical procedure is in `docs/agents/RECOVERY_PROTOCOL.md`.

The watcher writes `<common>/agent-state/autosnapshots/<agent>-latest.json` and
`patches/<agent>-latest.patch`. Paths come from NUL-delimited Git output. The
patch is `git diff --binary <snapshot-base> -- .` with generated, secret, font,
and screenshot paths excluded.

The target verifies the SHA-256, creates a recovery branch from the snapshot
base, runs `git apply --3way --check`, and only then applies. A conflict stops
without reset, clean, restore, force, or source-worktree modification.

## Git safety

Agents may not use push, reset --hard, clean, checkout/restore overwrites,
amend, rebase, branch deletion, repository-wide add, or commit -a/-am. Use
`stage-ticket` and `commit-ticket`. Runtime files, `.env*`, bundles, generated
outputs, and files outside ticket scope are never staged.

## Stage gate

CC-02I remains unclaimable until ChatGPT supplies a formal spec and tickets,
the registry is updated, and `claimable` becomes true. Completing a full stage
requires an integration review bundle and ChatGPT approval before advancing.
