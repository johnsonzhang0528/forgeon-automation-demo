#!/usr/bin/env python3
"""Claude Bash hook: block only materially dangerous Git operations."""

from __future__ import annotations

import json
import shlex
import sys


def parse_segments(command: str) -> list[list[str]] | None:
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|")
        lexer.whitespace_split = True
        tokens = list(lexer)
    except ValueError:
        return None

    segments: list[list[str]] = []
    current: list[str] = []

    for token in tokens:
        if token in (";", "&&", "||"):
            if current:
                segments.append(current)
                current = []
        elif token in ("&", "|", ";;", "&&&", "|||"):
            # Let Claude Code's normal permission system handle complex shell usage.
            if current:
                segments.append(current)
                current = []
        else:
            current.append(token)

    if current:
        segments.append(current)

    return segments


def unwrap_git(words: list[str]) -> list[str] | None:
    if words[:1] == ["env"]:
        words = words[1:]

    if words[:1] == ["command"]:
        words = words[1:]

    if not words or words[0] not in ("git", "/usr/bin/git"):
        return None

    return words[1:]


def dangerous_git(words: list[str]) -> str | None:
    args = unwrap_git(words)

    # Non-Git commands are not controlled by this hook.
    if args is None or not args:
        return None

    # Support git -C <path> ...
    if args[:1] == ["-C"] and len(args) >= 3:
        args = args[2:]

    if not args:
        return None

    command = args[0]
    rest = args[1:]

    # History / working-tree destructive operations.
    if command == "reset" and "--hard" in rest:
        return "git reset --hard is blocked"

    if command == "clean":
        return "git clean is blocked"

    if command == "rebase":
        return "git rebase is blocked"

    if command == "merge":
        return "git merge is blocked"

    # Project policy: pushing requires explicit human handling.
    if command == "push":
        return "git push is blocked"

    # Destructive branch deletion.
    if command == "branch" and any(
        arg == "-D" or arg.startswith("-D") for arg in rest
    ):
        return "git branch -D is blocked"

    # Destructive worktree removal.
    if command == "worktree" and rest[:1] in (["remove"], ["prune"]):
        return "destructive git worktree operations are blocked"

    # Prevent mass overwrite of working-tree changes.
    if command == "checkout" and any(arg in (".", "--") for arg in rest):
        return "bulk git checkout overwrite is blocked"

    if command == "restore":
        if "." in rest or "--worktree" in rest or "--staged" in rest:
            return "bulk/destructive git restore is blocked"

    # History rewriting.
    if command == "commit" and "--amend" in rest:
        return "git commit --amend is blocked"

    # Destructive stash deletion.
    if command == "stash" and rest[:1] in (["drop"], ["clear"]):
        return "destructive git stash deletion is blocked"

    return None


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 2

    command = data.get("tool_input", {}).get("command", "")

    if not isinstance(command, str):
        return 0

    segments = parse_segments(command)

    if not segments:
        return 0

    for segment in segments:
        reason = dangerous_git(segment)
        if reason:
            print(f"BLOCKED: {reason}", file=sys.stderr)
            return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())