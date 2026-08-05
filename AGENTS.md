# Codex isolated-worktree rules

Read `docs/agents/DUAL_AGENT_PROTOCOL.md`, `docs/agents/CURRENT_TASK.md`,
`docs/agents/RECOVERY_PROTOCOL.md`, `docs/agents/TASK_REGISTRY.json`,
`docs/agents/COMMUNICATION_POLICY.md`, and `CONTEXT.md` every session, then
run `pnpm agent:doctor` and `pnpm agent:status`.

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
- Human-readable replies to the user default to `zh-TW` (台灣繁體中文), per
  `docs/agents/COMMUNICATION_POLICY.md`. This applies to chat replies,
  handoff narratives (`completed`/`remaining`/`known_failure`/
  `exact_next_step`/`risk` values), and recovery reports. Machine-readable
  schema keys, code, commands, paths, and raw tool/log output stay in their
  original form. A user's explicit request for another language in that
  turn temporarily overrides the default; a new session or quota rollover
  does not — resume defaulting to `zh-TW` immediately.
