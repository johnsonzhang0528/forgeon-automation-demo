#!/bin/bash
# PreToolUse hook: blocks Edit/Write/NotebookEdit unless Claude currently
# holds the dual-agent claim with an active step. See
# docs/agents/DUAL_AGENT_PROTOCOL.md.
#
# Deliberately does NOT try to gate Bash by pattern-matching the command
# string. An earlier version tried to allow-list "read-only" prefixes and
# always-allow agent_workflow.py invocations by matching literal command
# text — but the exact text of a Bash tool_input.command varies by how the
# calling agent phrases it (relative path, $CLAUDE_PROJECT_DIR-prefixed,
# fully resolved absolute path, compound with &&, etc.), and a mismatch
# there caused this hook to block the very `agent_workflow.py claim` /
# `step-start` calls needed to satisfy it — a self-lockout with no
# tool-based way out (see docs/agents/DUAL_AGENT_PROTOCOL.md's note on
# this incident). Destructive Bash is separately handled by the existing
# block-dangerous-git.sh hook, which matches a small fixed set of
# genuinely dangerous git subcommands rather than trying to classify all
# of Bash as read-only-or-not.
#
# Edit/Write/NotebookEdit are unambiguous — the tool_name alone is enough
# to gate them, no command-string guessing required — so only those three
# are enforced here.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

case "$TOOL_NAME" in
  Edit|Write|NotebookEdit)
    ;;
  *)
    exit 0
    ;;
esac

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
OUTPUT=$(python3 "$PROJECT_DIR/scripts/agent_workflow.py" validate --agent claude --require-ownership --require-active-step 2>&1)
STATUS=$?

if [ $STATUS -ne 0 ]; then
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
