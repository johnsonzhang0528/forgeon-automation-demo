---
name: dual-agent
description: Coordinate single-writer, ticket-sized work between Claude Code and Codex on this project's shared working tree — claim, step tracking, checkpoints, handoff, and sudden-quota-loss recovery.
argument-hint: "<verb> [--agent claude|codex] [other flags — see docs/agents/DUAL_AGENT_PROTOCOL.md]"
disable-model-invocation: true
---

Wraps `python3 scripts/agent_workflow.py`. Full rules live in
`docs/agents/DUAL_AGENT_PROTOCOL.md` — read that before using any verb
below for the first time in a session. Live state lives in
`docs/agents/CURRENT_TASK.md` (generated; never hand-edit
`CURRENT_TASK.json` directly either — always go through this CLI).

This is a different mechanism from the `handoff` skill: that one compacts
a *conversation* into a temp-file summary for a fresh agent; this skill's
`handoff` verb hands off an *active claimed ticket*'s git/task state,
saved into the repo.

## Rules

- Only invoke explicitly (`/dual-agent <verb>` for Claude, `$dual-agent
  <verb>` for Codex, per each tool's own convention) — never infer that a
  verb should run implicitly from context.
- Never `git push`, `git commit`, or run destructive git commands
  (`reset --hard`, `clean -f`, `restore .`, `checkout .`, `branch -D`) as
  part of any verb here — those stay entirely under the calling agent's
  and user's own judgment, outside this skill.
- Stop immediately after `handoff` or `recover` produces its document.
  Do not continue into new edits in the same turn.
- Do not edit, `Write`, or run a mutating `Bash` command anywhere in this
  project without first holding the claim (`claim`) and an active step
  (`step-start`) — `scripts/agent_workflow.py validate` is what Claude's
  own PreToolUse hook checks for this automatically; Codex should call
  `status`/`validate` manually before editing since it has no equivalent
  hook wired up by this project.

## Verbs

| Verb | Command | When |
|---|---|---|
| `status` | `python3 scripts/agent_workflow.py status` | Any time — read-only. Always run first in a session. |
| `doctor` | `python3 scripts/agent_workflow.py doctor` | Sanity-check the tooling itself before relying on it. |
| `claim` | `... claim --agent <a> --stage <s> --ticket <t>` | Before starting any ticket. Fails if the other agent already holds it (add `--human-override --reason "..."` only when the user explicitly authorizes taking over). |
| `step-start` | `... step-start --agent <a> --summary "..." --expected-files "..." --verification "..."` | Immediately before making any edit — this is the breadcrumb that makes sudden-quota-loss recovery possible. |
| `step-complete` | `... step-complete --agent <a> --summary "..." --changed-files "..." --verification-result "..." --next-step "..."` | Right after a step's targeted test passes. |
| `checkpoint` | `... checkpoint` | After every completed ticket, and any time before a risky action. |
| `handoff` | `... handoff --from <a> --to <b> --reason quota\|other` | Quota running low, or user asks to switch agents. Works on a dirty tree too. |
| `resume` | `... resume --agent <a>` | Picking up after a clean handoff — verifies state matches before allowing continuation. |
| `recover` | `... recover --agent <a>` | Picking up after the other agent stopped without a handoff. Produces a report; does not claim. |
| `complete` | `... complete --stage <s>` | Whole stage finished — resets to `paused_ready`. |
| `release` | `... release --agent <a>` | Done for now but not handing off (e.g. user paused you). |

## Agent config

`agents/openai.yaml` in this skill directory sets
`policy.allow_implicit_invocation: false` for Codex, mirroring
`.claude/skills/handoff/agents/openai.yaml`'s convention.
