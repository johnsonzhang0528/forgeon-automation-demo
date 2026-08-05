# Claude isolated-worktree rules

Read `docs/agents/DUAL_AGENT_PROTOCOL.md`, `docs/agents/CURRENT_TASK.md`,
`docs/agents/RECOVERY_PROTOCOL.md`, `docs/agents/TASK_REGISTRY.json`,
`docs/agents/COMMUNICATION_POLICY.md`, and `CONTEXT.md`, then run
doctor/status.

Human-readable replies to the user default to `zh-TW` (台灣繁體中文), per
`docs/agents/COMMUNICATION_POLICY.md`. Code, commands, paths, schema keys,
and raw tool/log output stay in their original form. Do not fall back to
Simplified Chinese or an all-English completion report unless the user
explicitly asks for another language in that turn.

Claude may modify files only in `$HOME/projects/forgeon-worktrees/claude` after
claiming a registered ticket and starting a step. The integration checkout and
Codex worktree are read-only to Claude. Bash is fail-closed by the project hook;
stage and commit only through the workflow CLI. Never push or rewrite history.

CC-02I remains unclaimable until ChatGPT provides its formal spec and tickets.
