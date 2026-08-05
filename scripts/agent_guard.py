#!/usr/bin/env python3
"""Claude Bash hook: narrowly allow project verification and read-only Git."""

from __future__ import annotations

import json
import os
import re
import shlex
import sys
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR", Path(__file__).resolve().parent.parent)).resolve()
TMP_PREFIXES = ("forgeon-agent-test-", "forgeon-review-test-")
READ_ONLY_GIT = {"status", "diff", "log", "show", "rev-parse", "cat-file", "merge-base", "ls-files", "ls-tree"}
SIMPLE_PROGRAMS = {"pwd", "rg", "head", "tail", "wc", "readlink", "sha256sum"}
PNPM_COMMANDS = {"agent:status", "agent:doctor", "agent:validate", "agent:claim", "agent:step-start",
                 "agent:step-complete", "agent:test", "agent:stage-ticket", "agent:commit-ticket",
                 "agent:checkpoint", "agent:handoff", "agent:complete", "agent:human-abort", "agent:snapshot",
                 "agent:recover", "agent:watch", "check", "typecheck", "build", "check:h1", "check:links",
                 "check:locale-routes", "test:e2e", "test:axe", "review:bundle"}


def allowed_tmp(path: Path, *, may_not_exist: bool = False) -> bool:
    try:
        resolved = path.resolve(strict=not may_not_exist)
    except OSError:
        return False
    return resolved.parent == Path("/tmp") and any(resolved.name.startswith(x) for x in TMP_PREFIXES)


def owned_tmp(path: Path) -> bool:
    marker = path / ".forgeon-fixture-owner"
    try:
        value = json.loads(marker.read_text())
        pid = int(value["creator_pid"])
        os.kill(pid, 0)
        nonce = os.environ.get("FORGEON_FIXTURE_NONCE", "")
        return (bool(re.fullmatch(r"[a-f0-9]{32}", nonce))
                and value.get("nonce") == nonce
                and allowed_tmp(path) and marker.stat().st_uid == os.getuid()
                and value.get("owner_uid") == os.getuid()
                and Path(value.get("project_root", "")).resolve() == ROOT)
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError):
        return False


def repo_test(words: list[str]) -> bool:
    if Path.cwd().resolve() != ROOT:
        return False
    exact = {
        ("python3", "tests/tooling/agent_workflow.test.py"),
        ("python3", "tests/tooling/agent_workflow.test.py", "-v"),
        ("bash", "tests/tooling/review-bundle.test.sh"),
    }
    if tuple(words) not in exact:
        return False
    script = (ROOT / words[1]).resolve()
    return script.is_file() and script.is_relative_to(ROOT / "tests/tooling") and not (ROOT / words[1]).is_symlink()


def unwrap_git(words: list[str]) -> list[str] | None:
    if words[:1] == ["env"]:
        words = words[1:]
    if words[:1] == ["command"]:
        words = words[1:]
    if not words or words[0] not in ("git", "/usr/bin/git"):
        return None
    return words[1:]


def allowed_git(words: list[str]) -> bool:
    args = unwrap_git(words)
    if args is None or not args:
        return False
    cwd = ROOT
    if args[:1] == ["-C"]:
        if len(args) < 3:
            return False
        candidate = Path(args[1])
        candidate = candidate if candidate.is_absolute() else Path.cwd() / candidate
        if candidate.is_symlink():
            return False
        try:
            cwd = candidate.resolve(strict=True)
        except OSError:
            return False
        if cwd != ROOT and not owned_tmp(cwd):
            return False
        args = args[2:]
    command, rest = args[0], args[1:]
    if command in READ_ONLY_GIT:
        unsafe = ("--output", "--ext-diff", "--textconv", "--no-index")
        return not any(any(item == flag or item.startswith(flag + "=") for flag in unsafe) for item in rest)
    if command == "branch":
        return rest == ["--show-current"]
    if command == "worktree":
        return bool(rest) and rest[0] == "list"
    if command == "remote":
        return rest in ([], ["-v"]) or (len(rest) in (2, 3) and rest[0] == "get-url" and (len(rest) == 2 or rest[1] == "--all"))
    if command == "init":
        if cwd != ROOT or len(rest) != 1:
            return False
        target = Path(rest[0]); target = target if target.is_absolute() else Path.cwd() / target
        return not target.exists() and allowed_tmp(target, may_not_exist=True)
    if command == "clone":
        if len(rest) != 3 or rest[0] != "--no-hardlinks":
            return False
        source = Path(rest[1]); source = source if source.is_absolute() else Path.cwd() / source
        target = Path(rest[2]); target = target if target.is_absolute() else Path.cwd() / target
        try:
            source = source.resolve(strict=True)
        except OSError:
            return False
        source_ok = source == ROOT or owned_tmp(source)
        return source_ok and not target.exists() and allowed_tmp(target, may_not_exist=True)
    return False


def allowed_segment(words: list[str]) -> bool:
    if not words:
        return False
    if repo_test(words) or allowed_git(words):
        return True
    if words[0] == "rg":
        return not any(x in ("--pre", "--pre-glob") or x.startswith(("--pre=", "--pre-glob=")) for x in words[1:])
    if words[0] in SIMPLE_PROGRAMS:
        return True
    if words[0] == "pnpm" and len(words) > 1 and words[1] in PNPM_COMMANDS:
        if words[1] != "agent:test":
            return True
        if "--" not in words[2:]:
            return False
        split = words.index("--", 2)
        payload = words[split + 1:]
        return bool(payload) and payload[:2] != ["pnpm", "agent:test"] and allowed_segment(payload)
    if words[:2] in (["python3", "scripts/agent_workflow.py"], ["python3", "scripts/agent_watcher.py"]):
        return True
    return False


def parse_segments(command: str) -> list[list[str]] | None:
    if any(x in command for x in ("`", "$(`", "$(", "\n", ">", "<", "&>")):
        return None
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|")
        lexer.whitespace_split = True
        tokens = list(lexer)
    except ValueError:
        return None
    segments, current = [], []
    for token in tokens:
        if token in (";", "&&", "||"):
            if not current: return None
            segments.append(current); current = []
        elif token in ("&", "|", ";;", "&&&", "|||"):
            return None
        else:
            current.append(token)
    if not current: return None
    segments.append(current)
    return segments


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 2
    command = data.get("tool_input", {}).get("command", "")
    segments = parse_segments(command) if isinstance(command, str) else None
    if not segments or not all(allowed_segment(x) for x in segments):
        print("BLOCKED: Bash command is not on the project allowlist", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
