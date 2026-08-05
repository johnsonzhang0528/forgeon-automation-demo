## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature-slug>/` — no GitHub Issues, no external tracker. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` at the repo root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Dual-agent failover workflow

This project's working tree may also be edited by a Codex extension in the
same VS Code window. Full rules: `docs/agents/DUAL_AGENT_PROTOCOL.md`. Live
state: `docs/agents/CURRENT_TASK.md`. External stage-gate reviewer is
ChatGPT, not Claude — never start the next CC stage automatically.

- Start of session: read `docs/agents/CURRENT_TASK.md`, then run `pnpm
  agent:status`.
- Do not `Edit`/`Write`/run a mutating command without first holding the
  claim and an active step — see the `dual-agent` skill
  (`.claude/skills/dual-agent/SKILL.md`) for the exact verbs
  (`claim`, `step-start`, `step-complete`, `checkpoint`, `handoff`,
  `resume`, `recover`, `release`).
- Quota running low: checkpoint and hand off immediately
  (`/dual-agent handoff --to codex --reason quota`) rather than trying to
  finish more first.
- Picking up work Codex left mid-task: use `resume` if a clean handoff
  exists and its recorded HEAD/branch/status matches reality; otherwise
  use `recover` — never assume, never rely on chat memory alone.
- Don't confuse this with the `handoff` skill: that one compacts a
  *conversation* for a fresh agent; `dual-agent handoff` hands off an
  *active claimed ticket*'s git/task state.
