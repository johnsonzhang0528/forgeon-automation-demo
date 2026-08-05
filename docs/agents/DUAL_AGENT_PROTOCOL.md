# Dual-Agent Protocol: Claude Code ↔ Codex

Coordination rules for Claude Code and a Codex extension working the same
`demo-1` working tree, in the same VS Code window, on the same host. This
protocol governs the coordination layer only — CC-stage design/spec/review
artifacts still live under `docs/engineering/` as before; this document and
`docs/agents/` are purely about who is allowed to touch the working tree
right now and how to hand that off safely.

Enforced by `scripts/agent_workflow.py` (see `pnpm agent:*` in
`package.json`) and, for Claude, by hooks in `.claude/settings.json`.

**Design note**: `.claude/hooks/require-agent-ownership.sh` only gates the
`Edit`/`Write`/`NotebookEdit` tools by `tool_name` — it deliberately does
not try to pattern-match Bash command strings to distinguish "read-only"
from "mutating." An earlier version attempted that and, because the exact
text of a Bash `tool_input.command` varies by phrasing (relative path vs.
`$CLAUDE_PROJECT_DIR`-prefixed vs. resolved absolute path, compound with
`&&`, etc.), a prefix mismatch caused the hook to block the very
`agent_workflow.py claim` / `step-start` calls needed to satisfy it — a
self-lockout with no tool-based way out, recovered only by a human
renaming `.claude/settings.json` aside. Bash is always allowed through
this hook; destructive git operations are handled separately by
`block-dangerous-git.sh`, which matches a small fixed set of dangerous git
subcommands rather than trying to classify all of Bash.

## Naming note: this is not the `handoff` skill

`.claude/skills/handoff/` compacts the current **conversation** into a
summary for a fresh agent, saved to OS temp. The `handoff` verb described
below is a different thing: a structured **git/task-state** snapshot,
written into this repo at `docs/agents/handoffs/`, produced by
`scripts/agent_workflow.py handoff`. Use the conversation-summary skill
when you want to hand off *context*; use this protocol's handoff when you
want to hand off an *active claimed ticket*. They can be used together but
neither replaces the other.

## Single writer

- At any moment, only one agent — Claude or Codex — may hold the claim on
  this working tree.
- An agent must not use `Edit`, `Write`, or any working-tree-mutating shell
  command unless it currently holds the claim (`scripts/agent_workflow.py
  claim`) **and** has an active step (`step-start`). Read-only inspection
  (status, diff, log, grep, cat) is always allowed regardless of claim
  state.
- The non-active agent may read and review but must not edit concurrently.
- Parallel work on this working tree is not supported. If parallel work is
  ever needed, it requires a separate `git worktree` and explicit user
  approval — not a default assumption of this protocol.

## Ticket granularity

- One ticket at a time. A ticket must be small enough to implement, test,
  and commit in one sitting — CC-02I as a whole is not a ticket; it is a
  stage made of many tickets.
- Close-out loop for every completed ticket, in order:
  1. Run the ticket's targeted test/verification command.
  2. Run a code review pass.
  3. Create one atomic commit for the ticket.
  4. `scripts/agent_workflow.py checkpoint`.
  5. Update `docs/agents/CURRENT_TASK.json` (via `step-complete` /
     `complete`) so `CURRENT_TASK.md` regenerates in sync.

## Quota running low (graceful)

When an agent or its interface signals quota is about to run out:

- Do not start a new ticket.
- Do not widen the scope of the current change.
- Finish the smallest safely-stoppable increment of the current step.
- Save all files.
- Run whatever targeted test is currently possible.
- Create a checkpoint (`scripts/agent_workflow.py checkpoint`).
- Create a handoff (`scripts/agent_workflow.py handoff --from <agent> --to
  <other> --reason quota`).
- Release the runtime lock (handoff does this automatically).
- Stop.

## Quota running out suddenly (no handoff possible)

The incoming agent must:

- Not assume the previous agent finished cleanly.
- Not rely on chat history — it may not exist for this agent/session.
- Not `reset`, `restore`, `clean`, or `stash` anything.
- Not auto-commit whatever is sitting in the working tree.
- Read, in order: `docs/agents/CURRENT_TASK.json`,
  `.agent-state/autosnapshot.json` (if present), the most recent file under
  `docs/agents/checkpoints/<stage>/` (if present).
- Check live git status, diff, recent log, and any available test output —
  scoped to this project path, never the parent repo.
- Produce a Recovery Report (`scripts/agent_workflow.py recover`) before
  touching any code.
- Only after the Recovery Report exists, run `claim` and begin work.

## ChatGPT stage gate

When a full CC stage (not a single ticket) completes:

- Produce a ChatGPT handoff document (see `docs/engineering/handoffs/` for
  the existing convention this predates and continues).
- Produce a review bundle (`pnpm review:bundle`, per
  `docs/engineering/REVIEW_BUNDLE_GUIDE.md`).
- Wait for ChatGPT's review.
- Do not start the next CC stage automatically, regardless of which agent
  is active or how much quota remains.

## Directory map

```
docs/agents/
├── DUAL_AGENT_PROTOCOL.md   (this file)
├── CURRENT_TASK.json        (source of truth)
├── CURRENT_TASK.md          (generated — do not hand-edit)
├── checkpoints/<stage>/<timestamp>-<agent>.md
├── handoffs/<timestamp>-<from>-to-<to>.md
└── recoveries/<timestamp>-<agent>.md

.agent-state/                (git-ignored runtime state, not committed)
├── runtime-lock.json
├── autosnapshot.json
└── watcher.pid
```
