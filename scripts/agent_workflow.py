#!/usr/bin/env python3
"""Dual-agent (Claude Code / Codex) coordination CLI for this project.

Stdlib only. See docs/agents/DUAL_AGENT_PROTOCOL.md for the rules this
tool enforces, and docs/agents/CURRENT_TASK.md for the live state it
maintains.

Project-root detection deliberately mirrors scripts/create-review-bundle.sh:
this project is nested inside an unrelated parent git repository, so the
git toplevel is *not* the project root. Root is derived from this file's
own location and confirmed via .agent-project.json + package.json, never
via `git rev-parse --show-toplevel`. Every git call scopes its pathspec to
"." after chdir'ing to the project root, matching the bash script's
approach, so nothing outside this project is ever inspected or reported.
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

AGENT_PROJECT_FILE = PROJECT_ROOT / ".agent-project.json"
PACKAGE_JSON = PROJECT_ROOT / "package.json"
CURRENT_TASK_JSON = PROJECT_ROOT / "docs/agents/CURRENT_TASK.json"
CURRENT_TASK_MD = PROJECT_ROOT / "docs/agents/CURRENT_TASK.md"
CHECKPOINTS_DIR = PROJECT_ROOT / "docs/agents/checkpoints"
HANDOFFS_DIR = PROJECT_ROOT / "docs/agents/handoffs"
RECOVERIES_DIR = PROJECT_ROOT / "docs/agents/recoveries"
AGENT_STATE_DIR = PROJECT_ROOT / ".agent-state"
RUNTIME_LOCK = AGENT_STATE_DIR / "runtime-lock.json"
AUTOSNAPSHOT = AGENT_STATE_DIR / "autosnapshot.json"
WATCHER_PID = AGENT_STATE_DIR / "watcher.pid"

VALID_AGENTS = ("claude", "codex")


class WorkflowError(Exception):
    pass


def utc_now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def utc_now_stamp():
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


# ---------------------------------------------------------------------------
# Project-root / git scoping
# ---------------------------------------------------------------------------

def verify_project_root():
    """Refuse to run unless cwd resolution lands exactly on this project's
    root, with .agent-project.json and package.json agreeing with each
    other. Mirrors create-review-bundle.sh's PROJECT_ROOT/package.json
    check so callers can never accidentally operate one level too high
    (e.g. from the parent `leo-projects` tree)."""
    if not AGENT_PROJECT_FILE.is_file():
        raise WorkflowError(
            f".agent-project.json not found at {PROJECT_ROOT} — refusing to run. "
            "This script must live in the project's scripts/ directory."
        )
    if not PACKAGE_JSON.is_file():
        raise WorkflowError(
            f"package.json not found at {PROJECT_ROOT} — this is not the project root."
        )
    try:
        agent_project = json.loads(AGENT_PROJECT_FILE.read_text())
    except json.JSONDecodeError as e:
        raise WorkflowError(f".agent-project.json is not valid JSON: {e}")
    try:
        package_json = json.loads(PACKAGE_JSON.read_text())
    except json.JSONDecodeError as e:
        raise WorkflowError(f"package.json is not valid JSON: {e}")

    expected_name = agent_project.get("package_name")
    actual_name = package_json.get("name")
    if expected_name != actual_name:
        raise WorkflowError(
            f"package.json name '{actual_name}' does not match "
            f".agent-project.json package_name '{expected_name}'."
        )
    return agent_project


def run_git(args, check=True):
    """Run git scoped to PROJECT_ROOT with pathspec '.' — never inspects
    the parent repo's other projects. Caller is responsible for adding a
    trailing `--` `.` pathspec on commands that accept one (status, diff,
    log); commands like rev-parse don't need it."""
    result = subprocess.run(
        ["git"] + args,
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
    )
    if check and result.returncode != 0:
        raise WorkflowError(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout.strip()


def git_status_short():
    return run_git(["status", "--short", "--", "."])


def git_head():
    return run_git(["rev-parse", "HEAD"], check=False) or "unknown"


def git_branch():
    return run_git(["rev-parse", "--abbrev-ref", "HEAD"], check=False) or "unknown"


def git_diff_stat():
    return run_git(["diff", "--stat", "--", "."], check=False)


def git_changed_files():
    status = git_status_short()
    files = []
    for line in status.splitlines():
        if not line.strip():
            continue
        # porcelain short format: XY <path> (path may be quoted if it has
        # unusual chars — good enough for a human-readable report here)
        files.append(line[3:].strip())
    return files


def git_recent_log(n=5):
    return run_git(["log", f"-{n}", "--oneline", "--", "."], check=False)


# ---------------------------------------------------------------------------
# CURRENT_TASK state
# ---------------------------------------------------------------------------

def load_current_task():
    if not CURRENT_TASK_JSON.is_file():
        raise WorkflowError(f"{CURRENT_TASK_JSON} not found.")
    return json.loads(CURRENT_TASK_JSON.read_text())


def save_current_task(task):
    task["updated_at"] = utc_now_iso()
    CURRENT_TASK_JSON.write_text(json.dumps(task, indent=2, ensure_ascii=False) + "\n")
    CURRENT_TASK_MD.write_text(render_current_task_md(task))


def render_current_task_md(task):
    def v(key):
        val = task.get(key)
        return "—" if val is None else val

    def fmt_list(items):
        if not items:
            return "- (none)\n"
        return "".join(f"- {item}\n" for item in items)

    lines = []
    lines.append("# Current Task\n")
    lines.append(
        "Generated from `docs/agents/CURRENT_TASK.json` by "
        "`scripts/agent_workflow.py` — do not hand-edit this file.\n"
    )
    lines.append(f"\n- **Project**: {v('project_id')}")
    lines.append(f"\n- **Branch**: {v('branch')}")
    lines.append(f"\n- **Last completed stage**: {v('last_completed_stage')}")
    lines.append(f"\n- **Current stage**: {v('current_stage')} — "
                  f"{v('current_stage_title')}")
    lines.append(f"\n- **Status**: {v('status')}")
    lines.append(f"\n- **Active agent**: {v('active_agent')}")
    lines.append(f"\n- **Preferred / fallback agent**: "
                  f"{v('preferred_agent')} / {v('fallback_agent')}")
    lines.append(f"\n- **External reviewer**: {v('external_reviewer')}")
    lines.append(f"\n- **Current ticket**: {v('current_ticket')}")
    lines.append(f"\n- **Current step**: {v('current_step')} "
                  f"(status: {v('step_status')})")
    lines.append(f"\n- **Base / head / last verified commit**: "
                  f"{v('base_commit')} / {v('head_commit')} / "
                  f"{v('last_verified_commit')}")
    lines.append(f"\n- **Last checkpoint**: {v('last_checkpoint')}")
    lines.append(f"\n- **Last handoff**: {v('last_handoff')}")
    lines.append(f"\n- **Last recovery**: {v('last_recovery')}")
    lines.append(f"\n- **Updated at**: {v('updated_at')}")

    lines.append("\n\n## Completed\n\n")
    lines.append(fmt_list(task.get("completed", [])))
    lines.append("\n## Next actions\n\n")
    lines.append(fmt_list(task.get("next_actions", [])))
    lines.append("\n## Blocked by\n\n")
    lines.append(fmt_list(task.get("blocked_by", [])))
    lines.append("\n## Do not change\n\n")
    lines.append(fmt_list(task.get("do_not_change", [])))
    lines.append("\n## Last tests\n\n")
    lines.append(fmt_list(task.get("last_tests", [])))

    return "".join(lines)


# ---------------------------------------------------------------------------
# Runtime lock
# ---------------------------------------------------------------------------

def load_lock():
    if not RUNTIME_LOCK.is_file():
        return None
    try:
        return json.loads(RUNTIME_LOCK.read_text())
    except json.JSONDecodeError:
        return None


def save_lock(lock):
    AGENT_STATE_DIR.mkdir(exist_ok=True)
    RUNTIME_LOCK.write_text(json.dumps(lock, indent=2, ensure_ascii=False) + "\n")


def clear_lock():
    if RUNTIME_LOCK.is_file():
        RUNTIME_LOCK.unlink()


# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------

def cmd_doctor(args):
    problems = []
    try:
        verify_project_root()
    except WorkflowError as e:
        problems.append(str(e))

    for required in (CURRENT_TASK_JSON, PROJECT_ROOT / "docs/agents/DUAL_AGENT_PROTOCOL.md"):
        if not required.is_file():
            problems.append(f"Missing required file: {required.relative_to(PROJECT_ROOT)}")

    try:
        run_git(["rev-parse", "--is-inside-work-tree"])
    except WorkflowError as e:
        problems.append(f"git not usable from project root: {e}")

    # Note: the lock's `pid` field is NOT used as a liveness signal here.
    # Claude Code (and likely Codex) invoke each Bash command in its own
    # short-lived subprocess, so the pid recorded by `claim` is expected
    # to be gone moments later even though the claim itself is still
    # perfectly valid — pid_alive() would report every claim as "stale"
    # within seconds, which is not useful. `pid` is kept only as a
    # debugging breadcrumb (e.g. useful for agent_watcher.py's own pid in
    # watcher.pid, which *does* stay alive for the process's lifetime).
    # Staleness of a claim is a human/protocol judgment call — use
    # `release --human-override` when the claim is confirmed abandoned.

    if problems:
        print("doctor: problems found:")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("doctor: OK")
    return 0


def cmd_status(args):
    verify_project_root()
    task = load_current_task()
    lock = load_lock()
    print(f"Stage: {task.get('current_stage')} ({task.get('current_stage_title')})")
    print(f"Status: {task.get('status')}")
    print(f"Active agent (CURRENT_TASK): {task.get('active_agent')}")
    print(f"Runtime lock: {lock if lock else '(none)'}")
    print(f"Current ticket: {task.get('current_ticket')}")
    print(f"Current step: {task.get('current_step')} ({task.get('step_status')})")
    print(f"Last checkpoint: {task.get('last_checkpoint')}")
    print(f"Last handoff: {task.get('last_handoff')}")
    print(f"Last recovery: {task.get('last_recovery')}")
    print(f"HEAD: {git_head()}  Branch: {git_branch()}")
    return 0


def cmd_claim(args):
    verify_project_root()
    if args.agent not in VALID_AGENTS:
        raise WorkflowError(f"--agent must be one of {VALID_AGENTS}")

    lock = load_lock()
    if lock and lock.get("agent") != args.agent:
        if not (args.human_override and args.reason):
            raise WorkflowError(
                f"Agent '{lock.get('agent')}' already holds the claim "
                f"(stage={lock.get('stage')!r}, ticket={lock.get('ticket')!r}). "
                "Refusing to claim. A human may force this with "
                "--human-override --reason \"...\"."
            )
        print(f"HUMAN OVERRIDE: reclaiming from '{lock.get('agent')}'. "
              f"Reason: {args.reason}")

    new_lock = {
        "agent": args.agent,
        "stage": args.stage,
        "ticket": args.ticket,
        "pid": os.getpid(),
        "claimed_at": utc_now_iso(),
    }
    save_lock(new_lock)

    task = load_current_task()
    task["active_agent"] = args.agent
    task["current_stage"] = args.stage
    task["current_ticket"] = args.ticket
    task["current_step"] = None
    task["step_status"] = None
    task["status"] = "in_progress"
    save_current_task(task)

    print(f"Claimed by {args.agent}: stage={args.stage} ticket={args.ticket}")
    return 0


def _require_claim(agent):
    lock = load_lock()
    if not lock or lock.get("agent") != agent:
        raise WorkflowError(
            f"'{agent}' does not hold the current claim. Run `claim` first."
        )
    return lock


def cmd_step_start(args):
    verify_project_root()
    lock = _require_claim(args.agent)

    task = load_current_task()
    if task.get("current_step") and task.get("step_status") == "active":
        raise WorkflowError(
            f"A step is already active: {task.get('current_step')!r}. "
            "Complete it with step-complete before starting another."
        )

    task["current_step"] = args.summary
    task["step_status"] = "active"
    task["active_agent"] = args.agent
    task.setdefault("_step_meta", {})
    task["_step_meta"] = {
        "expected_files": args.expected_files,
        "verification": args.verification,
        "started_at": utc_now_iso(),
    }
    save_current_task(task)
    print(f"Step started by {args.agent}: {args.summary}")
    return 0


def cmd_step_complete(args):
    verify_project_root()
    _require_claim(args.agent)

    task = load_current_task()
    if task.get("step_status") != "active":
        raise WorkflowError("No active step to complete.")

    task["step_status"] = "complete"
    task["last_tests"] = [args.verification_result] if args.verification_result else task.get("last_tests", [])
    completed = task.setdefault("completed", [])
    completed.append(
        f"{task.get('current_step')} — changed: {args.changed_files or '(none listed)'}"
    )
    task["current_step"] = None
    if args.next_step:
        task["next_actions"] = [args.next_step]
    task.pop("_step_meta", None)
    save_current_task(task)
    print(f"Step completed by {args.agent}. Summary: {args.summary}")
    return 0


def _write_checkpoint_body(agent, task):
    stage = task.get("current_stage") or "unstaged"
    status = git_status_short()
    dirty = bool(status.strip())
    body = []
    body.append(f"# Checkpoint — {stage} — {agent}\n\n")
    body.append(f"- Timestamp: {utc_now_iso()}\n")
    body.append(f"- Agent: {agent}\n")
    body.append(f"- Stage: {stage}\n")
    body.append(f"- Ticket: {task.get('current_ticket')}\n")
    body.append(f"- Step: {task.get('current_step')} ({task.get('step_status')})\n")
    body.append(f"- HEAD: {git_head()}\n")
    body.append(f"- Branch: {git_branch()}\n")
    body.append(f"- Working tree: {'DIRTY' if dirty else 'clean'}\n\n")
    body.append("## Changed files\n\n")
    files = git_changed_files()
    if files:
        for f in files:
            body.append(f"- {f}\n")
    else:
        body.append("(none)\n")
    body.append("\n## Diff stat\n\n```\n")
    body.append(git_diff_stat() or "(no diff)")
    body.append("\n```\n\n")
    body.append("## Completed\n\n")
    for c in task.get("completed", []):
        body.append(f"- {c}\n")
    body.append("\n## Remaining / next step\n\n")
    for n in task.get("next_actions", []):
        body.append(f"- {n}\n")
    body.append("\n## Tests\n\n")
    for t in task.get("last_tests", []):
        body.append(f"- {t}\n")
    body.append("\n## Known failures\n\n(none recorded)\n")
    return "".join(body)


def cmd_checkpoint(args):
    verify_project_root()
    task = load_current_task()
    agent = args.agent or task.get("active_agent") or "unknown"
    stage = task.get("current_stage") or "unstaged"

    stage_dir = CHECKPOINTS_DIR / stage
    stage_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{utc_now_stamp()}-{agent}.md"
    path = stage_dir / filename
    path.write_text(_write_checkpoint_body(agent, task))

    task["last_checkpoint"] = str(path.relative_to(PROJECT_ROOT))
    save_current_task(task)
    print(f"Checkpoint written: {path.relative_to(PROJECT_ROOT)}")
    return 0


def cmd_handoff(args):
    verify_project_root()
    if args.frm not in VALID_AGENTS or args.to not in VALID_AGENTS:
        raise WorkflowError(f"--from/--to must be one of {VALID_AGENTS}")
    lock = _require_claim(args.frm)

    cmd_snapshot(argparse.Namespace(agent=args.frm))

    task = load_current_task()
    status = git_status_short()
    dirty = bool(status.strip())
    files = git_changed_files()

    HANDOFFS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{utc_now_stamp()}-{args.frm}-to-{args.to}.md"
    path = HANDOFFS_DIR / filename

    body = []
    body.append(f"# Handoff — {args.frm} → {args.to}\n\n")
    body.append(f"- Timestamp: {utc_now_iso()}\n")
    body.append(f"- Reason: {args.reason}\n")
    body.append(f"- Stage: {task.get('current_stage')}\n")
    body.append(f"- Ticket: {task.get('current_ticket')}\n")
    body.append(f"- Step: {task.get('current_step')} ({task.get('step_status')})\n")
    body.append(f"- HEAD: {git_head()}\n")
    body.append(f"- Branch: {git_branch()}\n")
    body.append(f"- Working tree: {'DIRTY' if dirty else 'clean'}\n\n")
    body.append("## Changed files\n\n")
    if files:
        for f in files:
            body.append(f"- {f}\n")
    else:
        body.append("(none — clean tree)\n")
    body.append("\n## Completed so far\n\n")
    for c in task.get("completed", []):
        body.append(f"- {c}\n")
    body.append("\n## Next step for the incoming agent\n\n")
    for n in task.get("next_actions", []):
        body.append(f"- {n}\n")
    body.append(f"\n## Last checkpoint\n\n{task.get('last_checkpoint')}\n")
    path.write_text("".join(body))

    task["status"] = "handoff_ready"
    task["last_handoff"] = str(path.relative_to(PROJECT_ROOT))
    task["active_agent"] = None
    save_current_task(task)
    clear_lock()

    print(f"Handoff written: {path.relative_to(PROJECT_ROOT)}")
    print("Runtime lock released.")
    return 0


def _latest_file(directory):
    if not directory.is_dir():
        return None
    candidates = sorted(
        (p for p in directory.glob("*.md") if p.is_file()),
        key=lambda p: p.name,
    )
    return candidates[-1] if candidates else None


def cmd_resume(args):
    verify_project_root()
    latest = _latest_file(HANDOFFS_DIR)
    if latest is None:
        raise WorkflowError("No handoff document found. Use `recover` instead.")

    content = latest.read_text()
    expected_head = None
    expected_branch = None
    expected_dirty = None
    for line in content.splitlines():
        if line.startswith("- HEAD:"):
            expected_head = line.split(":", 1)[1].strip()
        elif line.startswith("- Branch:"):
            expected_branch = line.split(":", 1)[1].strip()
        elif line.startswith("- Working tree:"):
            expected_dirty = line.split(":", 1)[1].strip()

    actual_head = git_head()
    actual_branch = git_branch()
    actual_dirty = "DIRTY" if git_status_short().strip() else "clean"

    mismatches = []
    if expected_head != actual_head:
        mismatches.append(f"HEAD: handoff={expected_head} actual={actual_head}")
    if expected_branch != actual_branch:
        mismatches.append(f"Branch: handoff={expected_branch} actual={actual_branch}")
    if expected_dirty != actual_dirty:
        mismatches.append(f"Working tree: handoff={expected_dirty} actual={actual_dirty}")

    if mismatches:
        print("resume: state does NOT match latest handoff. Refusing to resume.")
        for m in mismatches:
            print(f"  - {m}")
        print("Use `recover` instead.")
        return 1

    print(f"resume: state matches latest handoff ({latest.relative_to(PROJECT_ROOT)}). "
          f"Safe to `claim` and continue.")
    return 0


def cmd_recover(args):
    verify_project_root()
    task = load_current_task()

    autosnapshot = None
    if AUTOSNAPSHOT.is_file():
        try:
            autosnapshot = json.loads(AUTOSNAPSHOT.read_text())
        except json.JSONDecodeError:
            autosnapshot = {"_error": "autosnapshot.json present but not valid JSON"}

    stage = task.get("current_stage") or "unstaged"
    latest_checkpoint = _latest_file(CHECKPOINTS_DIR / stage)
    status = git_status_short()
    dirty = bool(status.strip())

    known_facts = []
    known_facts.append(f"CURRENT_TASK.json: stage={task.get('current_stage')} "
                        f"ticket={task.get('current_ticket')} "
                        f"step={task.get('current_step')!r} "
                        f"status={task.get('status')}")
    known_facts.append(f"Live HEAD: {git_head()}  Branch: {git_branch()}")
    known_facts.append(f"Live working tree: {'DIRTY' if dirty else 'clean'}")
    known_facts.append(f"Recent commits:\n{git_recent_log()}")
    if autosnapshot:
        known_facts.append(f"Autosnapshot present: {json.dumps(autosnapshot, ensure_ascii=False)}")
    else:
        known_facts.append("No autosnapshot found.")
    if latest_checkpoint:
        known_facts.append(f"Latest checkpoint: {latest_checkpoint.relative_to(PROJECT_ROOT)}")
    else:
        known_facts.append("No checkpoint found for current stage.")

    unconfirmed = []
    if dirty:
        unconfirmed.append(
            "Working tree is dirty with no accompanying handoff — cannot "
            "confirm whether the previous agent considered this change complete."
        )
    if task.get("step_status") == "active":
        unconfirmed.append(
            f"CURRENT_TASK reports an active step ({task.get('current_step')!r}) "
            "with no step-complete recorded — unknown whether it finished."
        )
    if not latest_checkpoint:
        unconfirmed.append("No checkpoint exists for the current stage.")

    safest_next_step = (
        "Review the changed files and diff manually, compare against the "
        "current step's stated intent, then run the project's targeted "
        "verification before claiming and continuing."
        if dirty or task.get("step_status") == "active"
        else "Working tree is clean and no step is marked active — safe to "
             "`claim` and start the next queued action."
    )

    RECOVERIES_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{utc_now_stamp()}-{args.agent}.md"
    path = RECOVERIES_DIR / filename

    body = []
    body.append(f"# Recovery Report — {args.agent}\n\n")
    body.append(f"- Timestamp: {utc_now_iso()}\n\n")
    body.append("## Known facts\n\n")
    for f in known_facts:
        body.append(f"- {f}\n")
    body.append("\n## Unable to confirm\n\n")
    if unconfirmed:
        for u in unconfirmed:
            body.append(f"- {u}\n")
    else:
        body.append("(nothing outstanding)\n")
    body.append("\n## Safest next step\n\n")
    body.append(f"{safest_next_step}\n")
    path.write_text("".join(body))

    task["last_recovery"] = str(path.relative_to(PROJECT_ROOT))
    save_current_task(task)

    print(f"Recovery report written: {path.relative_to(PROJECT_ROOT)}")
    print("No claim taken. Run `claim` explicitly to proceed.")
    return 0


def cmd_complete(args):
    verify_project_root()
    task = load_current_task()
    task["status"] = "paused_ready"
    task["active_agent"] = None
    task["current_ticket"] = None
    task["current_step"] = None
    task["step_status"] = None
    if args.stage:
        task["last_completed_stage"] = args.stage
    save_current_task(task)
    clear_lock()
    print("Marked complete. Runtime lock released.")
    return 0


def cmd_release(args):
    verify_project_root()
    lock = load_lock()
    if lock and lock.get("agent") != args.agent and not args.human_override:
        raise WorkflowError(
            f"'{args.agent}' does not hold the claim (held by "
            f"'{lock.get('agent')}'). Use --human-override to force release."
        )
    clear_lock()
    task = load_current_task()
    task["active_agent"] = None
    save_current_task(task)
    print("Runtime lock released.")
    return 0


def cmd_validate(args):
    verify_project_root()
    lock = load_lock()
    if args.require_ownership:
        if not lock or lock.get("agent") != args.agent:
            print(
                f"BLOCKED: '{args.agent}' does not hold the claim. "
                "Run `python3 scripts/agent_workflow.py claim --agent "
                f"{args.agent} --stage <stage> --ticket <ticket>` first.",
                file=sys.stderr,
            )
            return 2
    if args.require_active_step:
        task = load_current_task()
        if task.get("step_status") != "active" or task.get("active_agent") != args.agent:
            print(
                "BLOCKED: no active step for this agent. Run "
                "`python3 scripts/agent_workflow.py step-start ...` before editing.",
                file=sys.stderr,
            )
            return 2
    print("validate: OK")
    return 0


def cmd_context(args):
    verify_project_root()
    task = load_current_task()
    print(f"[dual-agent] stage={task.get('current_stage')} "
          f"ticket={task.get('current_ticket')} "
          f"step={task.get('current_step')!r} "
          f"active_agent={task.get('active_agent')}")
    print(f"[dual-agent] last_checkpoint={task.get('last_checkpoint')}")
    print(f"[dual-agent] last_handoff={task.get('last_handoff')}")
    print("[dual-agent] do_not_change:")
    for item in task.get("do_not_change", []):
        print(f"  - {item}")
    return 0


def cmd_snapshot(args):
    verify_project_root()
    task = load_current_task()
    status = git_status_short()
    snapshot = {
        "active_agent": args.agent or task.get("active_agent"),
        "current_stage": task.get("current_stage"),
        "current_ticket": task.get("current_ticket"),
        "current_step": task.get("current_step"),
        "head": git_head(),
        "branch": git_branch(),
        "git_status": status.splitlines(),
        "changed_files": git_changed_files(),
        "diff_stat": git_diff_stat(),
        "last_checkpoint": task.get("last_checkpoint"),
        "timestamp": utc_now_iso(),
    }
    AGENT_STATE_DIR.mkdir(exist_ok=True)
    AUTOSNAPSHOT.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n")
    return 0


# ---------------------------------------------------------------------------
# CLI wiring
# ---------------------------------------------------------------------------

def build_parser():
    p = argparse.ArgumentParser(prog="agent_workflow.py")
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("doctor")
    sub.add_parser("status")

    claim = sub.add_parser("claim")
    claim.add_argument("--agent", required=True)
    claim.add_argument("--stage", required=True)
    claim.add_argument("--ticket", required=True)
    claim.add_argument("--human-override", action="store_true")
    claim.add_argument("--reason", default=None)

    step_start = sub.add_parser("step-start")
    step_start.add_argument("--agent", required=True)
    step_start.add_argument("--summary", required=True)
    step_start.add_argument("--expected-files", default="")
    step_start.add_argument("--verification", default="")

    step_complete = sub.add_parser("step-complete")
    step_complete.add_argument("--agent", required=True)
    step_complete.add_argument("--summary", default="")
    step_complete.add_argument("--changed-files", default="")
    step_complete.add_argument("--verification-result", default="")
    step_complete.add_argument("--next-step", default="")

    checkpoint = sub.add_parser("checkpoint")
    checkpoint.add_argument("--agent", default=None)

    handoff = sub.add_parser("handoff")
    handoff.add_argument("--from", dest="frm", required=True)
    handoff.add_argument("--to", required=True)
    handoff.add_argument("--reason", required=True)

    resume = sub.add_parser("resume")
    resume.add_argument("--agent", required=True)

    recover = sub.add_parser("recover")
    recover.add_argument("--agent", required=True)

    complete = sub.add_parser("complete")
    complete.add_argument("--stage", default=None)

    release = sub.add_parser("release")
    release.add_argument("--agent", required=True)
    release.add_argument("--human-override", action="store_true")

    validate = sub.add_parser("validate")
    validate.add_argument("--agent", required=True)
    validate.add_argument("--require-ownership", action="store_true")
    validate.add_argument("--require-active-step", action="store_true")

    context = sub.add_parser("context")
    context.add_argument("--agent", default=None)

    snapshot = sub.add_parser("snapshot")
    snapshot.add_argument("--agent", default=None)

    return p


DISPATCH = {
    "doctor": cmd_doctor,
    "status": cmd_status,
    "claim": cmd_claim,
    "step-start": cmd_step_start,
    "step-complete": cmd_step_complete,
    "checkpoint": cmd_checkpoint,
    "handoff": cmd_handoff,
    "resume": cmd_resume,
    "recover": cmd_recover,
    "complete": cmd_complete,
    "release": cmd_release,
    "validate": cmd_validate,
    "context": cmd_context,
    "snapshot": cmd_snapshot,
}


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    handler = DISPATCH[args.command]
    try:
        return handler(args) or 0
    except WorkflowError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
