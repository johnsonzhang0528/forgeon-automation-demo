#!/usr/bin/env python3
"""Commit/patch based coordination for isolated Claude and Codex worktrees."""

from __future__ import annotations

import argparse
import contextlib
import fnmatch
import hashlib
import json
import os
import re
import signal
import subprocess
import sys
import tempfile
import stat
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / ".agent-project.json"
PACKAGE = ROOT / "package.json"
REGISTRY = ROOT / "docs/agents/TASK_REGISTRY.json"
VERSIONED_STATE = ROOT / "docs/agents/CURRENT_TASK.json"
VERSIONED_MD = ROOT / "docs/agents/CURRENT_TASK.md"
VALID_AGENTS = ("claude", "codex")
EXCLUDED = (
    "node_modules/**", "dist/**", ".astro/**", "test-results/**",
    "playwright-report/**", ".review-bundles/**", ".env", ".env.*",
    "public/fonts/**", "docs/screenshots/**",
)
SECRET_NAMES = (".env", "id_rsa", "id_ed25519", "credentials", "secrets")
SECRET_RE = re.compile(r"(?i)(api[_-]?key|token|password|secret)\s*[:=]\s*['\"]?[A-Za-z0-9_/+=.-]{12,}")
PRIVATE_PATH_RE = re.compile(r"(?:^|[\s'\"])/(?:home|Users)/[^\s'\"]+")
RUNTIME_RULES = (
    ("private-key-header", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("access-token", re.compile(r"(?:gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{12,}|sk-[A-Za-z0-9]{20,})")),
    ("credential-value", re.compile(r"(?i)(?:api[_-]?key|token|password|credential|secret)\s*[:=]\s*['\"]?[^\s'\"]{8,}")),
    ("private-absolute-path", re.compile(r"(?:^|[\s'\"])/(?:home|Users)/[^\s'\"]+")),
)


class WorkflowError(RuntimeError):
    pass


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def run(cmd, *, cwd=ROOT, check=True, text=True, input_data=None):
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=text, input=input_data)
    if check and result.returncode:
        err = result.stderr.strip() if text else result.stderr.decode(errors="replace").strip()
        raise WorkflowError(f"command failed ({result.returncode}): {' '.join(cmd)}: {err}")
    return result


def git(*args, check=True) -> str:
    return run(["git", *args], check=check).stdout.strip()


def git_bytes(*args, check=True) -> bytes:
    return run(["git", *args], check=check, text=False).stdout


def atomic_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(value, f, indent=2, ensure_ascii=False)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    finally:
        with contextlib.suppress(FileNotFoundError):
            os.unlink(tmp)


def fsync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def atomic_bytes(path: Path, value: bytes, mode: int = 0o600) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        os.fchmod(fd, mode)
        with os.fdopen(fd, "wb") as f:
            f.write(value); f.flush(); os.fsync(f.fileno())
        os.replace(tmp, path); fsync_dir(path.parent)
    finally:
        with contextlib.suppress(FileNotFoundError): os.unlink(tmp)


def read_json(path: Path):
    try:
        return json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        raise WorkflowError(f"cannot read valid JSON {path.name}: {exc}") from exc


def common_dir() -> Path:
    raw = git("rev-parse", "--git-common-dir")
    path = Path(raw)
    return (ROOT / path).resolve() if not path.is_absolute() else path.resolve()


def state_dir() -> Path:
    return common_dir() / "agent-state"


def runtime_path() -> Path:
    return state_dir() / "current-task.json"


def lock_path() -> Path:
    return state_dir() / "runtime-lock.json"


def mutex_path() -> Path:
    return state_dir() / ".mutex"


def head() -> str:
    return git("rev-parse", "HEAD")


def branch() -> str:
    return git("branch", "--show-current")


def role() -> str:
    b = branch()
    if b == "main":
        return "integration"
    if b == "agent/claude" or b.startswith("resume/claude/") or b.startswith("recovery/claude/"):
        return "claude"
    if b == "agent/codex" or b.startswith("resume/codex/") or b.startswith("recovery/codex/"):
        return "codex"
    return "unknown"


def worktrees() -> list[dict]:
    records, current = [], {}
    for line in git("worktree", "list", "--porcelain").splitlines() + [""]:
        if not line:
            if current: records.append(current); current = {}
        elif line.startswith("worktree "): current["path"] = line[9:]
        elif line.startswith("HEAD "): current["head"] = line[5:]
        elif line.startswith("branch refs/heads/"): current["branch"] = line[18:]
    return records


def verify_repo() -> dict:
    if Path(git("rev-parse", "--show-toplevel")).resolve() != ROOT:
        raise WorkflowError("not running from the standalone repository root")
    if git("rev-parse", "--show-prefix"):
        raise WorkflowError("project is not at repository root")
    cfg = read_json(CONFIG)
    if read_json(PACKAGE).get("name") != cfg.get("package_name"):
        raise WorkflowError("package/config identity mismatch")
    if cfg.get("repository_layout") != "standalone-worktrees":
        raise WorkflowError("repository is not configured for isolated worktrees")
    return cfg


def canonical_json(value) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def authorization_has_unsafe_value(value) -> bool:
    if isinstance(value, dict):
        return any(authorization_has_unsafe_value(v) for v in value.values())
    if isinstance(value, list):
        return any(authorization_has_unsafe_value(v) for v in value)
    if not isinstance(value, str):
        return False
    return bool(SECRET_RE.search(value) or PRIVATE_PATH_RE.search(value) or "-----BEGIN " in value)


def json_strings(value):
    if isinstance(value, dict):
        for item in value.values(): yield from json_strings(item)
    elif isinstance(value, list):
        for item in value: yield from json_strings(item)
    elif isinstance(value, str):
        yield value


def json_field_findings(value) -> bool:
    if isinstance(value, dict):
        for key, item in value.items():
            normalized = re.sub(r"[^a-z0-9]", "", str(key).lower())
            ignored = normalized.endswith(("status", "rule", "check", "enabled"))
            sensitive = any(name in normalized for name in ("password", "credential", "apikey", "accesstoken", "secret"))
            if sensitive and not ignored and item not in (None, "", False, [], {}): return True
            if json_field_findings(item): return True
    elif isinstance(value, list):
        return any(json_field_findings(item) for item in value)
    return False


def runtime_json_files() -> list[Path]:
    base = state_dir()
    files = [base / "current-task.json", base / "runtime-lock.json"]
    for name in ("autosnapshots", "handoffs", "recoveries"):
        files.extend(sorted((base / name).glob("**/*.json")))
    return [p for p in files if p.is_file()]


def runtime_value_findings() -> list[tuple[str, str]]:
    findings = []
    for path in runtime_json_files():
        value = read_json(path)
        matched = set()
        if json_field_findings(value): matched.add("credential-value")
        for text_value in json_strings(value):
            for rule, pattern in RUNTIME_RULES:
                if pattern.search(text_value): matched.add(rule)
        rel = str(path.relative_to(state_dir()))
        findings.extend((rel, rule) for rule in sorted(matched))
    return findings


def validate_authorized_paths(allowed, forbidden) -> tuple[list[str], list[str]]:
    if not isinstance(allowed, list) or not allowed:
        raise WorkflowError("authorization allowed paths must be a non-empty array")
    if not isinstance(forbidden, list):
        raise WorkflowError("authorization forbidden paths must be an array")
    dangerous = re.compile(r"(?:^|/)(?:\.git|agent-state|\.env(?:\..*)?)(?:/|$)")
    for label, paths in (("allowed", allowed), ("forbidden", forbidden)):
        for pattern in paths:
            if (not isinstance(pattern, str) or not pattern or pattern == "**" or
                    Path(pattern).is_absolute() or "\\" in pattern or
                    any(part == ".." for part in pattern.split("/"))):
                raise WorkflowError(f"authorization {label} path is unsafe")
            if label == "allowed" and dangerous.search(pattern):
                raise WorkflowError("authorization allowed path targets protected state")
            literal_prefix = pattern.split("*", 1)[0].rstrip("/")
            candidate = ROOT / literal_prefix if literal_prefix else ROOT
            if candidate.exists() and candidate.resolve() != ROOT and not candidate.resolve().is_relative_to(ROOT):
                raise WorkflowError("authorization path escapes repository through a symlink")
    return list(allowed), list(forbidden)


def validate_maintenance_stage(stage, tickets, allowed_files, registry) -> tuple[dict, list[dict]]:
    if not isinstance(stage, dict):
        raise WorkflowError("authorization stage must be an object")
    stage_id = stage.get("id")
    if not isinstance(stage_id, str) or not re.fullmatch(r"WF-[A-Z0-9]+(?:-[A-Z0-9]+)*", stage_id):
        raise WorkflowError("authorization stage ID is invalid")
    if not isinstance(stage.get("title"), str) or not stage["title"].strip():
        raise WorkflowError("authorization stage title is invalid")
    if not isinstance(stage.get("external_reviewer"), str) or not stage["external_reviewer"].strip():
        raise WorkflowError("authorization external reviewer is invalid")
    if stage.get("claimable") is not True:
        raise WorkflowError("authorized maintenance stage must be explicitly claimable")
    stages = registry.get("stages")
    if not isinstance(stages, dict):
        raise WorkflowError("registry stages are invalid")
    existing_tickets = {
        ticket.get("id") for existing in stages.values() if isinstance(existing, dict)
        for ticket in existing.get("tickets", []) if isinstance(ticket, dict)
    }
    if stage_id in stages or stage_id in existing_tickets:
        raise WorkflowError("maintenance stage already exists or conflicts with a ticket")
    if not isinstance(tickets, list) or not tickets:
        raise WorkflowError("authorization tickets must be a non-empty array")
    ticket_ids, normalized = set(), []
    for ticket in tickets:
        if not isinstance(ticket, dict):
            raise WorkflowError("authorization ticket must be an object")
        ticket_id = ticket.get("id")
        if (not isinstance(ticket_id, str) or
                not re.fullmatch(re.escape(stage_id) + r"-[A-Z0-9]+(?:-[A-Z0-9]+)*", ticket_id)):
            raise WorkflowError("authorization ticket ID is outside the stage namespace")
        if ticket_id in ticket_ids:
            raise WorkflowError("authorization contains duplicate ticket IDs")
        if ticket_id in stages or ticket_id in existing_tickets:
            raise WorkflowError("maintenance ticket already exists or conflicts with a stage")
        if not isinstance(ticket.get("title"), str) or not ticket["title"].strip():
            raise WorkflowError("authorization ticket title is invalid")
        ticket_ids.add(ticket_id)
        normalized.append({"id": ticket_id, "title": ticket["title"], "status": "ready",
                           "allowed_files": list(allowed_files), "required_tests": []})
    normalized_stage = {"title": stage["title"], "type": "maintenance", "claimable": True,
                        "external_reviewer": stage["external_reviewer"], "tickets": normalized}
    return normalized_stage, normalized


def cmd_register_maintenance(args):
    cfg = verify_repo()
    actual_role = role()
    if actual_role not in VALID_AGENTS:
        raise WorkflowError("maintenance registration requires an agent worktree")
    if changed_paths():
        raise WorkflowError("maintenance registration requires a clean worktree")
    supplied = Path(args.authorization_file)
    expected_parent = (state_dir() / "human-authorizations").resolve()
    if supplied.is_symlink() or supplied.parent.resolve() != expected_parent:
        raise WorkflowError("authorization file must be a direct runtime authorization file")
    try:
        info = supplied.stat()
    except OSError as exc:
        raise WorkflowError("authorization is missing or unreadable") from exc
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o600:
        raise WorkflowError("authorization permissions must be 0600")
    auth = read_json(supplied)
    required = {"authorization_id", "authorization_type", "authorized_agent", "authorized_base_head",
                "authorized_branch", "bootstrap_allowed_paths", "forbidden_paths", "project_id",
                "single_use", "consumed", "expires_at", "stage", "tickets"}
    if not required.issubset(auth):
        raise WorkflowError("authorization schema is incomplete")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,127}", str(auth["authorization_id"])):
        raise WorkflowError("authorization ID is invalid")
    if authorization_has_unsafe_value(auth):
        raise WorkflowError("authorization contains a secret-shaped or private absolute-path value")
    if auth["authorization_type"] != "maintenance-bootstrap" or not auth["single_use"] or auth["consumed"]:
        raise WorkflowError("authorization is not an unused single-use maintenance authorization")
    try:
        expiry = datetime.fromisoformat(auth["expires_at"].replace("Z", "+00:00"))
    except (TypeError, ValueError) as exc:
        raise WorkflowError("authorization expiry is invalid") from exc
    if expiry <= datetime.now(timezone.utc):
        raise WorkflowError("authorization has expired")
    if auth["project_id"] != cfg.get("project_id") or auth["authorized_agent"] != actual_role:
        raise WorkflowError("authorization project or agent mismatch")
    if auth["authorized_branch"] != branch():
        raise WorkflowError("authorization branch mismatch")
    base = auth["authorized_base_head"]
    if run(["git", "merge-base", "--is-ancestor", base, head()], check=False).returncode:
        raise WorkflowError("authorization base HEAD is not an ancestor")
    changed = git("diff", "--name-only", base, head(), "--", ".").splitlines()
    allowed, forbidden = validate_authorized_paths(auth["bootstrap_allowed_paths"], auth["forbidden_paths"])
    if any(not any(fnmatch.fnmatch(p, pattern) for pattern in allowed) for p in changed):
        raise WorkflowError("bootstrap commit contains a path outside the authorization")
    if any(any(fnmatch.fnmatch(p, pattern) for pattern in forbidden) for p in changed):
        raise WorkflowError("bootstrap commit contains a forbidden path")
    task = load_runtime()
    if get_lock() or task.get("active_agent") is not None:
        raise WorkflowError("runtime must be fully released before registration")
    stage_auth = auth["stage"]

    with critical():
        registry_bytes = REGISTRY.read_bytes()
        registry = read_json(REGISTRY)
        before_cc = canonical_json(registry.get("stages", {}).get("CC-02I"))
        stages = registry.setdefault("stages", {})
        normalized_stage, _ = validate_maintenance_stage(stage_auth, auth["tickets"], allowed, registry)
        stages[stage_auth["id"]] = normalized_stage
        if canonical_json(stages.get("CC-02I")) != before_cc:
            raise WorkflowError("CC-02I changed during registration")
        consumed = dict(auth)
        consumed.update(consumed=True, consumed_at=now(), consumed_by=actual_role,
                        registered_stage=stage_auth["id"], bootstrap_commit=head(),
                        registry_digest=hashlib.sha256(canonical_json(registry)).hexdigest())
        consumed_dir = expected_parent / "consumed"
        consumed_path = consumed_dir / f"{auth['authorization_id']}.json"
        audit_dir = state_dir() / "maintenance-audits"
        audit_path = audit_dir / f"{auth['authorization_id']}.json"
        audit = {"authorization_id": auth["authorization_id"], "stage": stage_auth["id"],
                 "agent": actual_role, "branch": branch(), "bootstrap_commit": head(),
                 "registry_digest": consumed["registry_digest"], "registered_at": now()}
        if consumed_path.exists() or audit_path.exists():
            raise WorkflowError("authorization was already consumed")
        auth_bytes = supplied.read_bytes()
        registry_written = auth_moved = audit_written = False
        try:
            atomic_bytes(REGISTRY, json.dumps(registry, indent=2, ensure_ascii=False).encode() + b"\n", 0o644)
            registry_written = True
            if os.environ.get("AGENT_TEST_FAIL_REGISTRY_WRITE") == "1": raise WorkflowError("injected registry failure")
            consumed_dir.mkdir(parents=True, exist_ok=True)
            atomic_bytes(consumed_path, json.dumps(consumed, indent=2, ensure_ascii=False).encode() + b"\n")
            os.unlink(supplied); fsync_dir(expected_parent); auth_moved = True
            if os.environ.get("AGENT_TEST_FAIL_AUTH_MOVE") == "1": raise WorkflowError("injected authorization failure")
            atomic_json(audit_path, audit); audit_written = True; fsync_dir(audit_dir)
            if os.environ.get("AGENT_TEST_FAIL_AUDIT_WRITE") == "1": raise WorkflowError("injected audit failure")
        except Exception:
            if audit_written:
                with contextlib.suppress(FileNotFoundError): audit_path.unlink()
            if auth_moved:
                atomic_bytes(supplied, auth_bytes)
            with contextlib.suppress(FileNotFoundError): consumed_path.unlink()
            if registry_written: atomic_bytes(REGISTRY, registry_bytes, 0o644)
            raise
    print(f"registered maintenance stage {stage_auth['id']}; authorization consumed")


def render_versioned(task: dict) -> str:
    dash = lambda value: "—" if value is None else str(value)
    return (
        "# Current Task\n\nGenerated from `docs/agents/CURRENT_TASK.json`; do not hand-edit.\n\n"
        f"- **Project**: {task['project_id']}\n"
        f"- **Last completed stage**: {task['last_completed_stage']}\n"
        f"- **Current stage**: {task['current_stage']} — {task['current_stage_title']}\n"
        f"- **Status**: {task['status']}\n"
        f"- **Active agent**: {dash(task['active_agent'])}\n"
        f"- **Current ticket**: {dash(task['current_ticket'])}\n"
        f"- **Current step**: {dash(task['current_step'])}\n"
        f"- **Claimable**: {str(task['claimable']).lower()}\n"
        f"- **External reviewer**: {task['external_reviewer']}\n"
        f"- **Repository base commit**: {task['repository_base_commit']}\n"
        f"- **Last verified commit**: {task['last_verified_commit']}\n\n"
        "CC-02I has not started. It remains blocked until ChatGPT supplies a formal spec\n"
        "and registered tickets.\n"
    )


def initial_runtime() -> dict:
    v = read_json(VERSIONED_STATE)
    return {
        "schema_version": 2, "project_id": v["project_id"],
        "last_completed_stage": v["last_completed_stage"],
        "current_stage": v["current_stage"], "status": "paused_ready",
        "active_agent": None, "current_ticket": None, "current_step": None,
        "step_status": None, "branch": None, "ticket_base": None,
        "last_checkpoint_commit": None, "test_evidence": [],
        "head": None,
        "last_handoff": None, "last_recovery": None, "updated_at": now(),
    }


def load_runtime() -> dict:
    if not runtime_path().is_file():
        raise WorkflowError("common runtime state is missing; run init-runtime from integration")
    return read_json(runtime_path())


def save_runtime(value: dict) -> None:
    value["updated_at"] = now()
    atomic_json(runtime_path(), value)


@contextlib.contextmanager
def critical():
    state_dir().mkdir(parents=True, exist_ok=True)
    try:
        mutex_path().mkdir()
    except FileExistsError as exc:
        raise WorkflowError("runtime state is busy; refusing concurrent mutation") from exc
    try:
        yield
    finally:
        with contextlib.suppress(OSError):
            mutex_path().rmdir()


def get_lock():
    return read_json(lock_path()) if lock_path().is_file() else None


def require_agent_worktree(agent: str) -> None:
    if agent not in VALID_AGENTS:
        raise WorkflowError(f"invalid agent: {agent}")
    actual = role()
    if actual == "integration":
        raise WorkflowError("integration checkout cannot be claimed")
    if actual != agent:
        raise WorkflowError(f"{agent} may operate only from its own worktree (actual={actual})")


def find_ticket(stage_name: str, ticket_name: str):
    stages = read_json(REGISTRY).get("stages", {})
    if stage_name not in stages:
        raise WorkflowError(f"stage is not registered: {stage_name}")
    stage = stages[stage_name]
    if not stage.get("claimable"):
        raise WorkflowError(f"stage is not claimable: {stage_name}")
    for ticket in stage.get("tickets", []):
        if ticket.get("id") == ticket_name:
            if ticket.get("status") == "complete":
                raise WorkflowError(f"ticket is complete: {ticket_name}")
            return stage, ticket
    raise WorkflowError(f"ticket is not registered: {ticket_name}")


def require_claim(agent: str, *, step=False):
    require_agent_worktree(agent)
    lock = get_lock()
    task = load_runtime()
    if not lock or lock.get("agent") != agent:
        raise WorkflowError("agent does not hold the runtime claim")
    if task.get("active_agent") != agent or task.get("current_ticket") != lock.get("ticket"):
        raise WorkflowError("runtime lock/state drift")
    if task.get("branch") != branch():
        raise WorkflowError("runtime branch drift")
    if step and (task.get("step_status") != "active" or not task.get("current_step")):
        raise WorkflowError("an active step is required")
    return task, lock


def changed_paths() -> list[str]:
    values = set()
    for args in (("diff", "--name-only", "-z", "--", "."),
                 ("diff", "--cached", "--name-only", "-z", "--", "."),
                 ("ls-files", "--others", "--exclude-standard", "-z", "--", ".")):
        raw = git_bytes(*args)
        values.update(x.decode("utf-8", "surrogateescape") for x in raw.split(b"\0") if x)
    return sorted(values)


def untracked_paths() -> list[str]:
    return sorted(x.decode("utf-8", "surrogateescape") for x in
                  git_bytes("ls-files", "--others", "--exclude-standard", "-z", "--", ".").split(b"\0") if x)


def excluded(path: str) -> bool:
    return any(fnmatch.fnmatch(path, pattern) for pattern in EXCLUDED)


def secret_scan(paths: list[str]) -> None:
    for rel in paths:
        low = rel.lower()
        if any(part in low for part in SECRET_NAMES) and rel != ".env.example":
            raise WorkflowError(f"secret-shaped filename refused: {rel}")
        path = ROOT / rel
        if path.is_symlink() and not path.resolve().is_relative_to(ROOT):
            raise WorkflowError(f"symlink escapes repository: {rel}")
        if path.is_file() and path.stat().st_size < 1_000_000:
            with contextlib.suppress(UnicodeDecodeError):
                if SECRET_RE.search(path.read_text(errors="strict")):
                    raise WorkflowError(f"secret-shaped content refused: {rel}")


def cmd_init_runtime(_):
    verify_repo()
    if role() != "integration":
        raise WorkflowError("init-runtime must run from integration checkout")
    state_dir().mkdir(parents=True, exist_ok=True)
    for name in ("autosnapshots", "checkpoints", "handoffs", "recoveries", "patches"):
        (state_dir() / name).mkdir(exist_ok=True)
    if runtime_path().exists() or lock_path().exists():
        raise WorkflowError("runtime state already exists; refusing overwrite")
    atomic_json(runtime_path(), initial_runtime())
    print("common runtime initialized")


def cmd_status(_):
    verify_repo()
    task = load_runtime()
    print(f"Role: {role()}  Branch: {branch()}  HEAD: {head()}")
    print(f"Stage: {task.get('current_stage')}  Status: {task.get('status')}")
    print(f"Active agent: {task.get('active_agent')}  Ticket: {task.get('current_ticket')}")
    print(f"Step: {task.get('current_step')} ({task.get('step_status')})")
    print(f"Runtime lock: {get_lock() or '(none)'}")


def cmd_claim(args):
    verify_repo(); require_agent_worktree(args.agent)
    find_ticket(args.stage, args.ticket)
    with critical():
        if get_lock():
            raise WorkflowError("a claim already exists; complete, handoff, or human-abort first")
        task = load_runtime()
        if task.get("active_agent") or task.get("current_ticket") or task.get("current_step"):
            raise WorkflowError("runtime state is not released")
        old = dict(task)
        lock = {"agent": args.agent, "stage": args.stage, "ticket": args.ticket,
                "branch": branch(), "base_commit": head(), "claimed_at": now()}
        task.update(status="in_progress", active_agent=args.agent,
                    current_stage=args.stage, current_ticket=args.ticket,
                    current_step=None, step_status=None, branch=branch(),
                    ticket_base=head(), head=head(), test_evidence=[])
        try:
            atomic_json(lock_path(), lock)
            if os.environ.get("AGENT_TEST_FAIL_STATE_WRITE") == "1":
                raise WorkflowError("injected state write failure")
            save_runtime(task)
        except Exception:
            with contextlib.suppress(FileNotFoundError): lock_path().unlink()
            save_runtime(old)
            raise
    print(f"claimed {args.stage}/{args.ticket} by {args.agent}")


def cmd_step_start(args):
    verify_repo(); task, _ = require_claim(args.agent)
    if task.get("current_step"):
        raise WorkflowError("a step is already active")
    task.update(current_step=args.summary, step_status="active",
                expected_files=args.expected_files, verification=args.verification)
    save_runtime(task)
    print("step started")


def cmd_step_complete(args):
    verify_repo(); task, _ = require_claim(args.agent, step=True)
    if not task.get("test_evidence"):
        raise WorkflowError("structured test evidence is required")
    task.update(current_step=None, step_status="complete")
    save_runtime(task); print("step complete")


def cmd_test(args):
    verify_repo(); task, _ = require_claim(args.agent, step=True)
    command = list(args.command)
    if command and command[0] == "--":
        command.pop(0)
    if not command:
        raise WorkflowError("test command is required after --")
    started = now(); result = run(command, check=False)
    digest = hashlib.sha256((result.stdout + result.stderr).encode()).hexdigest()
    evidence = {"command": " ".join(command), "exit_code": result.returncode,
                "started_at": started, "finished_at": now(), "head": head(),
                "output_digest": digest}
    task.setdefault("test_evidence", []).append(evidence); save_runtime(task)
    sys.stdout.write(result.stdout); sys.stderr.write(result.stderr)
    print(json.dumps(evidence)); return result.returncode


def ticket_scope(task: dict) -> list[str]:
    _, ticket = find_ticket(task["current_stage"], task["current_ticket"])
    return ticket.get("allowed_files", [])


def cmd_stage(args):
    verify_repo(); task, _ = require_claim(args.agent, step=True)
    paths = changed_paths()
    if not paths:
        raise WorkflowError("no ticket changes to stage")
    scope = ticket_scope(task)
    refused = [p for p in paths if excluded(p) or not any(fnmatch.fnmatch(p, x) for x in scope)]
    if refused:
        raise WorkflowError("files outside ticket scope: " + ", ".join(refused))
    secret_scan(paths)
    run(["git", "add", "--", *paths])
    print("staged:\n" + "\n".join(paths))


def cmd_commit(args):
    verify_repo(); task, lock = require_claim(args.agent)
    staged = [x.decode("utf-8", "surrogateescape") for x in
              git_bytes("diff", "--cached", "--name-only", "-z").split(b"\0") if x]
    if not staged:
        raise WorkflowError("nothing staged")
    scope = ticket_scope(task)
    if any(excluded(p) or not any(fnmatch.fnmatch(p, x) for x in scope) for p in staged):
        raise WorkflowError("staged set is outside ticket scope")
    secret_scan(staged)
    print(git("diff", "--cached", "--stat")); print("files:\n" + "\n".join(staged))
    run(["git", "commit", "-m", args.message, "--", *staged])
    commit = head(); task["last_checkpoint_commit"] = commit; task["head"] = commit
    save_runtime(task)
    print(f"ticket commit: {commit}")


def cmd_checkpoint(args):
    verify_repo(); task, lock = require_claim(args.agent, step=True)
    if not task.get("test_evidence"):
        raise WorkflowError("checkpoint requires structured test evidence")
    if changed_paths():
        raise WorkflowError("checkpoint requires a clean committed worktree")
    commit = head()
    if commit == lock["base_commit"]:
        raise WorkflowError("checkpoint commit is missing")
    payload = {"agent": args.agent, "stage": task["current_stage"],
               "ticket": task["current_ticket"], "step": task["current_step"],
               "base_commit": lock["base_commit"], "checkpoint_commit": commit,
               "branch": branch(), "tests": task["test_evidence"],
               "changed_files": git("diff", "--name-only", lock["base_commit"], commit, "--", ".").splitlines(),
               "next_step": args.next_step, "timestamp": now()}
    dest = state_dir() / "checkpoints" / f"{stamp()}-{args.agent}.json"
    atomic_json(dest, payload); task["last_checkpoint_commit"] = commit; task["head"] = commit; save_runtime(task)
    print(f"checkpoint: {commit}")


def write_handoff(task, lock, args) -> Path:
    dest = state_dir() / "handoffs" / f"{stamp()}-{args.frm}-to-{args.to}.json"
    payload = {
        "source_agent": args.frm, "target_agent": args.to,
        "stage": task["current_stage"], "ticket": task["current_ticket"],
        "step": task.get("current_step"), "base_commit": lock["base_commit"],
        "checkpoint_commit": task.get("last_checkpoint_commit"),
        "branch": branch(), "tests": task.get("test_evidence", []),
        "changed_files": changed_paths(), "completed": args.completed,
        "remaining": args.remaining, "known_failure": args.known_failure,
        "exact_next_step": args.next_step, "risk": args.risk, "timestamp": now(),
    }
    if not payload["checkpoint_commit"] or run(
        ["git", "cat-file", "-e", f"{payload['checkpoint_commit']}^{{commit}}"],
        check=False,
    ).returncode:
        raise WorkflowError("checkpoint commit does not exist")
    atomic_json(dest, payload); return dest


def release_state(task: dict, status: str, handoff=None):
    task.update(status=status, active_agent=None, current_ticket=None,
                current_step=None, step_status=None, branch=None,
                ticket_base=None, head=None, last_handoff=handoff)
    save_runtime(task)
    with contextlib.suppress(FileNotFoundError): lock_path().unlink()


def cmd_handoff(args):
    verify_repo(); task, lock = require_claim(args.frm)
    if args.to not in VALID_AGENTS or args.to == args.frm:
        raise WorkflowError("target agent must be the other valid agent")
    if changed_paths():
        raise WorkflowError("graceful handoff requires a clean checkpoint commit")
    if not task.get("test_evidence"):
        raise WorkflowError("handoff requires test evidence")
    with critical():
        dest = write_handoff(task, lock, args)
        release_state(task, "handoff_ready", str(dest.relative_to(common_dir())))
    print(f"handoff ready: {dest.name}")


def cmd_resume(args):
    verify_repo(); require_agent_worktree(args.agent)
    if get_lock():
        raise WorkflowError("cannot resume while a claim exists")
    candidates = sorted((state_dir() / "handoffs").glob(f"*-to-{args.agent}.json"))
    if not candidates:
        raise WorkflowError("no handoff targets this agent")
    item = read_json(candidates[-1]); commit = item.get("checkpoint_commit")
    if run(["git", "cat-file", "-e", f"{commit}^{{commit}}"], check=False).returncode:
        raise WorkflowError("handoff checkpoint commit is missing")
    if changed_paths():
        raise WorkflowError("target worktree must be clean")
    name = f"resume/{args.agent}/{stamp()}"
    run(["git", "switch", "-c", name, commit])
    print(f"resume branch created: {name} from {commit}")


def cmd_complete(args):
    verify_repo(); task, lock = require_claim(args.agent)
    if task.get("current_step") or task.get("step_status") != "complete":
        raise WorkflowError("step must be completed")
    if not task.get("test_evidence") or any(x["exit_code"] for x in task["test_evidence"]):
        raise WorkflowError("all required tests must have passing structured evidence")
    commit = task.get("last_checkpoint_commit")
    if not commit or run(["git", "merge-base", "--is-ancestor", lock["base_commit"], commit], check=False).returncode:
        raise WorkflowError("ticket commit is missing or not reachable from base")
    if changed_paths():
        raise WorkflowError("working tree must be clean")
    with critical(): release_state(task, "paused_ready")
    print("ticket complete; lock released")


def cmd_abort(args):
    verify_repo(); task, _ = require_claim(args.agent)
    if not args.reason:
        raise WorkflowError("human abort requires a reason")
    with critical():
        task["abort_reason"] = args.reason; release_state(task, "paused_ready")
    print("human abort recorded; lock released")


def cmd_snapshot(args):
    verify_repo(); task, lock = require_claim(args.agent, step=True)
    base = lock["base_commit"]
    patch = state_dir() / "patches" / f"{args.agent}-latest.patch"
    snap = state_dir() / "autosnapshots" / f"{args.agent}-latest.json"
    pathspec = ["."] + [f":(exclude){p}" for p in EXCLUDED]
    result = run(["git", "diff", "--binary", base, "--", *pathspec], text=False)
    patch_data = bytearray(result.stdout)
    for rel in untracked_paths():
        if excluded(rel):
            continue
        extra = run(["git", "diff", "--binary", "--no-index", "--", "/dev/null", rel],
                    check=False, text=False)
        if extra.returncode not in (0, 1):
            raise WorkflowError(f"cannot snapshot untracked path: {rel}")
        patch_data.extend(extra.stdout)
    patch.parent.mkdir(parents=True, exist_ok=True); patch.write_bytes(patch_data)
    digest = hashlib.sha256(patch_data).hexdigest()
    payload = {"agent": args.agent, "worktree_identity": role(),
               "stage": task["current_stage"], "ticket": task["current_ticket"],
               "step": task["current_step"], "base_commit": base, "head": head(),
               "branch": branch(), "changed_files": changed_paths(),
               "diff_stat": git("diff", "--stat", base, "--", "."),
               "patch_sha256": digest, "timestamp": now()}
    atomic_json(snap, payload); print(f"snapshot {digest}")


def cmd_recover(args):
    verify_repo(); require_agent_worktree(args.agent)
    source = "claude" if args.agent == "codex" else "codex"
    snap_path = state_dir() / "autosnapshots" / f"{source}-latest.json"
    patch_path = state_dir() / "patches" / f"{source}-latest.patch"
    snap = read_json(snap_path); data = patch_path.read_bytes()
    if hashlib.sha256(data).hexdigest() != snap.get("patch_sha256"):
        raise WorkflowError("snapshot patch hash mismatch")
    if run(["git", "cat-file", "-e", f"{snap['base_commit']}^{{commit}}"], check=False).returncode:
        raise WorkflowError("snapshot base commit does not exist")
    if changed_paths():
        raise WorkflowError("target worktree must be clean")
    name = f"recovery/{args.agent}/{stamp()}"
    run(["git", "switch", "-c", name, snap["base_commit"]])
    check = run(["git", "apply", "--3way", "--check", str(patch_path)], check=False)
    report = {"agent": args.agent, "source_agent": source, "snapshot": snap_path.name,
              "patch_sha256": snap["patch_sha256"], "branch": name,
              "apply_check_exit": check.returncode, "timestamp": now()}
    dest = state_dir() / "recoveries" / f"{stamp()}-{args.agent}.json"; atomic_json(dest, report)
    if check.returncode:
        raise WorkflowError("patch apply check failed; recovery stopped without applying")
    run(["git", "apply", "--3way", str(patch_path)])
    task = load_runtime(); task["last_recovery"] = str(dest.relative_to(common_dir())); save_runtime(task)
    print(f"recovery patch applied on {name}; review and test before claiming")


def pid_is_watcher(pid: int) -> bool:
    try:
        cmdline = Path(f"/proc/{pid}/cmdline").read_bytes().replace(b"\0", b" ").decode()
        os.kill(pid, 0)
        return "agent_watcher.py" in cmdline
    except (OSError, ValueError):
        return False


def cmd_doctor(_):
    problems = []
    try: verify_repo()
    except WorkflowError as exc: problems.append(str(exc))
    try:
        versioned = read_json(VERSIONED_STATE)
        if VERSIONED_MD.read_text() != render_versioned(versioned): problems.append("JSON/Markdown drift")
        runtime = load_runtime(); lock = get_lock()
        if bool(lock) != bool(runtime.get("active_agent")): problems.append("runtime lock/state drift")
        if lock and (lock.get("agent") != runtime.get("active_agent") or lock.get("ticket") != runtime.get("current_ticket")):
            problems.append("runtime lock/state identity drift")
        if lock:
            if lock.get("branch") != runtime.get("branch"):
                problems.append("runtime branch drift")
            matches = [w for w in worktrees() if w.get("branch") == lock.get("branch")]
            if len(matches) != 1:
                problems.append("active branch is not checked out in exactly one worktree")
            else:
                expected_role = lock.get("agent")
                b = matches[0].get("branch", "")
                if not (b == f"agent/{expected_role}" or b.startswith(f"resume/{expected_role}/") or b.startswith(f"recovery/{expected_role}/")):
                    problems.append("active agent/worktree identity drift")
                if runtime.get("head") and matches[0].get("head") != runtime.get("head"):
                    problems.append("active HEAD drift")
        pidfile = state_dir() / "watcher.pid"
        if pidfile.exists() and not pid_is_watcher(int(pidfile.read_text().strip())): problems.append("stale or foreign watcher PID")
        for snap in (state_dir() / "autosnapshots").glob("*-latest.json"):
            item = read_json(snap); patch = state_dir() / "patches" / snap.name.replace(".json", ".patch")
            if run(["git", "cat-file", "-e", f"{item.get('base_commit')}^{{commit}}"], check=False).returncode: problems.append(f"missing snapshot base: {snap.name}")
            if not patch.exists() or hashlib.sha256(patch.read_bytes()).hexdigest() != item.get("patch_sha256"): problems.append(f"patch hash drift: {snap.name}")
        for checkpoint in (state_dir() / "checkpoints").glob("*.json"):
            item = read_json(checkpoint); commit = item.get("checkpoint_commit"); base = item.get("base_commit")
            if run(["git", "cat-file", "-e", f"{commit}^{{commit}}"], check=False).returncode:
                problems.append(f"checkpoint commit missing: {checkpoint.name}")
            elif run(["git", "merge-base", "--is-ancestor", base, commit], check=False).returncode:
                problems.append(f"checkpoint commit unreachable: {checkpoint.name}")
        for handoff in (state_dir() / "handoffs").glob("*.json"):
            item = read_json(handoff); commit = item.get("checkpoint_commit")
            if run(["git", "cat-file", "-e", f"{commit}^{{commit}}"], check=False).returncode:
                problems.append(f"handoff commit missing: {handoff.name}")
        for path in ROOT.rglob("*"):
            if ".git" in path.parts: continue
            if path.is_symlink() and not path.resolve().is_relative_to(ROOT): problems.append(f"symlink escape: {path.relative_to(ROOT)}")
        for rel, rule in runtime_value_findings():
            problems.append(f"runtime value finding: {rel}: {rule}")
    except (WorkflowError, OSError, ValueError) as exc: problems.append(str(exc))
    if problems:
        print("doctor: problems found:")
        for p in sorted(set(problems)): print(f"  - {p}")
        return 1
    print("doctor: OK"); return 0


def cmd_validate(args):
    verify_repo()
    if args.agent: require_agent_worktree(args.agent)
    if args.require_ownership: require_claim(args.agent, step=args.require_active_step)
    print("validate: OK")


def parser():
    p = argparse.ArgumentParser(); sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init-runtime"); sub.add_parser("status"); sub.add_parser("doctor")
    q = sub.add_parser("register-maintenance"); q.add_argument("--authorization-file", required=True)
    q = sub.add_parser("claim"); q.add_argument("--agent", required=True); q.add_argument("--stage", required=True); q.add_argument("--ticket", required=True)
    q = sub.add_parser("step-start"); q.add_argument("--agent", required=True); q.add_argument("--summary", required=True); q.add_argument("--expected-files", default=""); q.add_argument("--verification", default="")
    q = sub.add_parser("step-complete"); q.add_argument("--agent", required=True)
    q = sub.add_parser("test"); q.add_argument("--agent", required=True); q.add_argument("command", nargs=argparse.REMAINDER)
    q = sub.add_parser("stage-ticket"); q.add_argument("--agent", required=True)
    q = sub.add_parser("commit-ticket"); q.add_argument("--agent", required=True); q.add_argument("--message", required=True)
    q = sub.add_parser("checkpoint"); q.add_argument("--agent", required=True); q.add_argument("--next-step", required=True)
    q = sub.add_parser("handoff"); q.add_argument("--from", dest="frm", required=True); q.add_argument("--to", required=True); q.add_argument("--completed", required=True); q.add_argument("--remaining", required=True); q.add_argument("--known-failure", default="none"); q.add_argument("--next-step", required=True); q.add_argument("--risk", default="none")
    q = sub.add_parser("resume"); q.add_argument("--agent", required=True)
    q = sub.add_parser("complete"); q.add_argument("--agent", required=True)
    q = sub.add_parser("human-abort"); q.add_argument("--agent", required=True); q.add_argument("--reason", required=True)
    q = sub.add_parser("snapshot"); q.add_argument("--agent", required=True)
    q = sub.add_parser("recover"); q.add_argument("--agent", required=True)
    q = sub.add_parser("validate"); q.add_argument("--agent"); q.add_argument("--require-ownership", action="store_true"); q.add_argument("--require-active-step", action="store_true")
    return p


COMMANDS = {"init-runtime": cmd_init_runtime, "status": cmd_status, "doctor": cmd_doctor,
            "register-maintenance": cmd_register_maintenance,
            "claim": cmd_claim, "step-start": cmd_step_start, "step-complete": cmd_step_complete,
            "test": cmd_test, "stage-ticket": cmd_stage, "commit-ticket": cmd_commit, "checkpoint": cmd_checkpoint,
            "handoff": cmd_handoff, "resume": cmd_resume, "complete": cmd_complete, "human-abort": cmd_abort,
            "snapshot": cmd_snapshot, "recover": cmd_recover, "validate": cmd_validate}


def main(argv=None):
    args = parser().parse_args(argv)
    try: return COMMANDS[args.cmd](args) or 0
    except WorkflowError as exc: print(f"error: {exc}", file=sys.stderr); return 1


if __name__ == "__main__":
    raise SystemExit(main())
