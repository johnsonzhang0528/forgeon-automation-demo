# Agent instructions (Codex)

Before doing anything else this session, read:

1. `docs/agents/DUAL_AGENT_PROTOCOL.md` — the full coordination rules.
2. `docs/agents/CURRENT_TASK.md` — live stage/ticket/step state.
3. `CONTEXT.md` — project domain vocabulary.

Then run `pnpm agent:status`.

## Rules

- Do not `Edit`/`Write`/run a mutating command until you hold the claim
  (`pnpm agent:claim -- --agent codex --stage <s> --ticket <t>`) and have
  an active step (`pnpm agent:step-start -- ...`).
- Before claiming, start or confirm the watcher is running
  (`pnpm agent:watch`) — it's what keeps a recovery breadcrumb warm if you
  lose quota mid-edit.
- If Claude Code stopped mid-task without a handoff, use
  `pnpm agent:recover -- --agent codex` before touching anything — don't
  assume, don't rely on any chat history (you have none for Claude's
  session), don't `reset`/`restore`/`clean`/`stash`.
- Before every ticket: `pnpm agent:step-start`. After every meaningful
  sub-step: update the step or write a checkpoint
  (`pnpm agent:checkpoint`).
- Every ticket ends with its own test run and one atomic commit.
- Never `git push`.
- Never change a design direction ChatGPT has already approved (see
  `docs/engineering/handoffs/` for what's been approved so far).
- After a full CC stage completes, build the review bundle
  (`pnpm review:bundle`) and wait for ChatGPT — do not start the next
  stage automatically.

Skills available to you are symlinked at `.agents/skills/` (sourced from
`.claude/skills/`) — in particular `.agents/skills/dual-agent` documents
every verb referenced above. If a skill you expect isn't visible, restart
the Codex extension.
