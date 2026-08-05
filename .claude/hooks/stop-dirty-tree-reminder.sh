#!/bin/bash
# Stop hook: if the working tree is dirty and no checkpoint has been
# written recently, remind (stdout only) instead of blocking. Must NEVER
# exit 2 here — that would force Claude Code to keep going and could loop.
# No auto-commit, no auto-handoff — see docs/agents/DUAL_AGENT_PROTOCOL.md.

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
cd "$PROJECT_DIR" || exit 0

STATUS=$(git status --short -- . 2>/dev/null)
if [ -z "$STATUS" ]; then
  exit 0
fi

CURRENT_TASK="docs/agents/CURRENT_TASK.json"
if [ ! -f "$CURRENT_TASK" ]; then
  exit 0
fi

LAST_CHECKPOINT=$(python3 -c "
import json
try:
    with open('$CURRENT_TASK') as f:
        print(json.load(f).get('last_checkpoint') or '')
except Exception:
    print('')
" 2>/dev/null)

RECENT_CHECKPOINT_WINDOW_MIN=30
IS_RECENT=false
if [ -n "$LAST_CHECKPOINT" ] && [ -f "$LAST_CHECKPOINT" ]; then
  AGE_MIN=$(( ( $(date +%s) - $(date -r "$LAST_CHECKPOINT" +%s 2>/dev/null || echo 0) ) / 60 ))
  if [ "$AGE_MIN" -le "$RECENT_CHECKPOINT_WINDOW_MIN" ]; then
    IS_RECENT=true
  fi
fi

if [ "$IS_RECENT" = false ]; then
  echo "[dual-agent] Working tree is dirty and no recent checkpoint exists." >&2
  echo "[dual-agent] Consider: pnpm agent:checkpoint (or agent:handoff if quota is low)." >&2
fi

exit 0
