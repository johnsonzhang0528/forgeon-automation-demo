# Codex isolated-worktree rules

Read `docs/agents/DUAL_AGENT_PROTOCOL.md`, `docs/agents/CURRENT_TASK.md`,
`docs/agents/TASK_REGISTRY.json`, and `CONTEXT.md`, then run
`pnpm agent:doctor` and `pnpm agent:status`.

- Codex may modify files only in `$HOME/projects/forgeon-worktrees/codex`.
- Never develop in the integration checkout or Claude worktree.
- Worktree separation, the workflow CLI, and this protocol constrain Codex;
  Claude hooks do not constrain the Codex extension.
- Claim a registered ticket and start a step before edits.
- Record tests with `pnpm agent:test --agent codex -- <command>`.
- Stage only with `pnpm agent:stage-ticket --agent codex`.
- Commit only with `pnpm agent:commit-ticket --agent codex --message "..."`.
- Never push, reset --hard, clean, restore, rebase, amend, delete branches,
  use repo-wide add, or use commit `-a`/`-am`.
- On quota pressure, snapshot, create a checkpoint commit, make a structured
  handoff, and stop. Do not rely on chat history.
- CC-02I is not claimable until ChatGPT supplies its formal spec and tickets.
