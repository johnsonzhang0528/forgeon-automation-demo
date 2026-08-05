#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" || exit 0
if [ -n "$(git status --short -- . 2>/dev/null)" ]; then
  echo "[isolated-agent] Dirty worktree: record a test, snapshot, and commit/handoff before stopping." >&2
fi
exit 0
