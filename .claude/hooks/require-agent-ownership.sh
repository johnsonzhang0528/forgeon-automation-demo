#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.tool_name')
case "$TOOL_NAME" in Edit|Write|NotebookEdit) ;; *) exit 0 ;; esac
exec python3 "$CLAUDE_PROJECT_DIR/scripts/agent_workflow.py" validate \
  --agent claude --require-ownership --require-active-step
