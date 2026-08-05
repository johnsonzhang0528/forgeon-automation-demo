# VS Code Remote SSH Worktree Setup

Open two separate Remote SSH windows:

- Claude: `$HOME/projects/forgeon-worktrees/claude`
- Codex: `$HOME/projects/forgeon-worktrees/codex`

The integration checkout is `$HOME/projects/forgeon-automation-demo`. Use it
only for reviewed integration, ChatGPT stage gates, and releases. Do not open it
as an AI development workspace.

Each window must run `pnpm agent:doctor` before claiming. Claude may claim only
from the Claude worktree; Codex may claim only from the Codex worktree.
