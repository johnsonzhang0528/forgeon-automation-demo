#!/usr/bin/env python3
"""Singleton watcher for the active isolated agent worktree."""

import argparse
import os
import signal
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import agent_workflow as aw

stop = False


def on_signal(_signum, _frame):
    global stop
    stop = True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", required=True, choices=aw.VALID_AGENTS)
    ap.add_argument("--interval-seconds", type=float, default=25)
    args = ap.parse_args()
    aw.verify_repo(); aw.require_claim(args.agent)
    pidfile = aw.state_dir() / "watcher.pid"
    pidfile.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(pidfile, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        try:
            pid = int(pidfile.read_text().strip())
        except (OSError, ValueError):
            pid = -1
        if aw.pid_is_watcher(pid):
            print("error: watcher already running", file=sys.stderr)
            return 1
        print("error: stale watcher PID; run doctor and request human abort", file=sys.stderr)
        return 1
    with os.fdopen(fd, "w") as f:
        f.write(f"{os.getpid()}\n")
    signal.signal(signal.SIGINT, on_signal); signal.signal(signal.SIGTERM, on_signal)
    last = None
    try:
        while not stop:
            try:
                task, _ = aw.require_claim(args.agent, step=True)
            except aw.WorkflowError:
                break
            marker = (aw.head(), tuple(aw.changed_paths()), task.get("current_step"))
            if marker != last:
                aw.cmd_snapshot(argparse.Namespace(agent=args.agent))
                last = marker
            time.sleep(max(args.interval_seconds, 0.1))
    finally:
        try:
            if pidfile.read_text().strip() == str(os.getpid()): pidfile.unlink()
        except OSError:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
