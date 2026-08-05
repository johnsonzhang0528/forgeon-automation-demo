---
name: dual-agent
description: Coordinate Claude and Codex across isolated Git worktrees using registered tickets, structured tests, commits, handoffs, and recovery patches.
argument-hint: "<verb> [arguments]"
disable-model-invocation: true
---

Read `docs/agents/DUAL_AGENT_PROTOCOL.md` first. Runtime state is shared through
the Git common directory, not a normal worktree file.

Use only the matching agent worktree. Run `doctor` and `status`; then `claim`,
`step-start`, `test`, `stage-ticket`, `commit-ticket`, and `complete` or
`handoff`. Use `snapshot` for sudden-stop breadcrumbs and `recover` only from
the other agent's clean target worktree. `human-abort` requires explicit human
authority. No force claim or generic release exists.

Never push, rewrite history, use repository-wide staging, or develop in the
integration checkout. CC-02I is unclaimable until ChatGPT supplies its spec and
registered tickets.
