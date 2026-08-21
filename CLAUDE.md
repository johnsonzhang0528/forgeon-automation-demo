# Claude Code Project Rules

## Development model

Claude Code is the sole development agent for this repository.

The previous dual-agent Claude/Codex workflow is retired for this project.

Do not require or use:

- Ticket
- Claim
- Lock
- TASK_REGISTRY
- CURRENT_TASK
- DUAL_AGENT_PROTOCOL
- agent workflow commands
- Claude/Codex worktree ownership
- ChatGPT authorization for normal development work

Work directly in the current repository and current working branch unless the user explicitly requests otherwise.

## Before modifying files

Always:

1. Run `git status`.
2. Inspect the relevant existing implementation.
3. Preserve any user-created or uncommitted changes.
4. Avoid unrelated modifications.

## Git safety

Do not perform without explicit user authorization:

- git push
- git merge
- git rebase
- force push
- git reset --hard
- git clean
- destructive branch deletion
- destructive worktree removal
- destructive bulk checkout / restore
- history rewriting

Normal local development operations are allowed, including:

- inspect files
- edit files
- install dependencies when required
- run dev server
- run tests
- run lint / typecheck
- run production build
- git status
- git diff
- git add
- local git commit when appropriate

## Engineering principles

Preserve the existing project architecture unless there is a concrete reason to change it.

Do not introduce unnecessary frameworks, dependencies, migrations, or architectural rewrites.

For the current UI/UX work, preserve the existing Engineering Editorial Sheet direction and avoid generic SaaS / AI-startup design patterns.

## Communication

User-facing explanations should default to Traditional Chinese (zh-TW).

Report:

- what was changed
- why it was changed
- tests performed
- remaining risks or limitations

Do not claim tests or validation passed unless they were actually executed.