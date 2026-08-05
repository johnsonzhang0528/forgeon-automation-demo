#!/usr/bin/env python3
"""Claude Bash hook: fail closed and block unsafe Git spellings."""

import json
import re
import shlex
import sys

data = json.load(sys.stdin)
command = data.get("tool_input", {}).get("command", "")
if any(x in command for x in (";", "&&", "||", "`", "$(", "\n", ">", "<")):
    print("BLOCKED: compound or redirected Bash is not allowlisted", file=sys.stderr)
    raise SystemExit(2)
try:
    words = shlex.split(command)
except ValueError:
    raise SystemExit(2)

blocked = [
    r"\bgit\s+push\b", r"\bgit\s+reset\s+--hard\b", r"\bgit\s+clean\b",
    r"\bgit\s+checkout\s+(?:--\s+)?\.\b", r"\bgit\s+restore\b",
    r"\bgit\s+commit\s+.*(?:--amend|-a\b|-am\b)", r"\bgit\s+rebase\b",
    r"\bgit\s+branch\s+-(?:D|d)\b", r"\bgit\s+add\s+(?:-A|\.)\b",
]
if any(re.search(pattern, command) for pattern in blocked):
    print(f"BLOCKED dangerous Git command: {command}", file=sys.stderr)
    raise SystemExit(2)

read_only_git = {"status", "diff", "log", "show", "rev-parse", "branch", "worktree", "ls-files", "ls-tree", "cat-file", "merge-base"}
allowed_programs = {"pwd", "rg", "sed", "head", "tail", "wc", "find", "readlink", "sha256sum"}
allowed_pnpm = {"agent:status", "agent:doctor", "agent:validate", "agent:claim", "agent:step-start", "agent:step-complete", "agent:test", "agent:stage-ticket", "agent:commit-ticket", "agent:handoff", "agent:complete", "agent:human-abort", "agent:snapshot", "agent:recover", "agent:watch", "check", "typecheck", "build", "check:h1", "check:links", "check:locale-routes", "test:e2e", "test:axe", "review:bundle"}
allowed = False
if words:
    if words[0] in allowed_programs: allowed = True
    elif words[0] == "git" and len(words) > 1 and words[1] in read_only_git: allowed = True
    elif words[0] == "pnpm" and len(words) > 1 and words[1] in allowed_pnpm: allowed = True
    elif words[:2] == ["python3", "scripts/agent_workflow.py"]: allowed = True
    elif words[:2] == ["python3", "scripts/agent_watcher.py"]: allowed = True
if not allowed:
    print(f"BLOCKED: Bash command is not on the project allowlist: {command}", file=sys.stderr)
    raise SystemExit(2)
