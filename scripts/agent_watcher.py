#!/usr/bin/env python3
"""Background watcher: keeps .agent-state/autosnapshot.json fresh while an
agent holds the dual-agent claim, so a sudden quota loss still leaves a
recent breadcrumb for `agent_workflow.py recover` to read.

Stdlib only. Does not commit, stash, or touch CURRENT_TASK's semantic
fields — it only calls agent_workflow.cmd_snapshot when the project's git
status (scoped to this project path) has changed since the last poll.
Exits quietly if no agent currently holds the runtime lock; a stopped
watcher process does not invalidate or corrupt the lock file.

Usage: python3 scripts/agent_watcher.py [--interval-seconds N]
"""

import argparse
import os
import signal
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
import agent_workflow as aw  # noqa: E402

DEFAULT_INTERVAL = 25  # seconds, within the 20-30s window from the spec

_should_stop = False


def _handle_signal(signum, frame):
    global _should_stop
    _should_stop = True


def write_pid():
    aw.AGENT_STATE_DIR.mkdir(exist_ok=True)
    aw.WATCHER_PID.write_text(str(os.getpid()) + "\n")


def clear_pid():
    if aw.WATCHER_PID.is_file():
        try:
            aw.WATCHER_PID.unlink()
        except OSError:
            pass


def poll_once(last_status):
    lock = aw.load_lock()
    if not lock:
        return last_status, False

    agent = lock.get("agent")
    try:
        current_status = aw.git_status_short()
    except aw.WorkflowError:
        return last_status, False

    if current_status != last_status:
        aw.cmd_snapshot(argparse.Namespace(agent=agent))
        return current_status, True

    return last_status, False


def main(argv=None):
    parser = argparse.ArgumentParser(prog="agent_watcher.py")
    parser.add_argument("--interval-seconds", type=int, default=DEFAULT_INTERVAL)
    args = parser.parse_args(argv)

    aw.verify_project_root()

    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)

    write_pid()
    print(f"agent_watcher: watching (interval={args.interval_seconds}s, "
          f"pid={os.getpid()})")

    last_status = None
    try:
        while not _should_stop:
            lock = aw.load_lock()
            if lock:
                last_status, updated = poll_once(last_status)
                if updated:
                    print(f"agent_watcher: autosnapshot updated "
                          f"(agent={lock.get('agent')})")
            else:
                last_status = None
            time.sleep(args.interval_seconds)
    finally:
        clear_pid()
        print("agent_watcher: stopped")

    return 0


if __name__ == "__main__":
    sys.exit(main())
