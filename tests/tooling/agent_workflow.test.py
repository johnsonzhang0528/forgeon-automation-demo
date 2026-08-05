#!/usr/bin/env python3
"""Compatibility entrypoint for the isolated-worktree workflow suite."""

import runpy
from pathlib import Path

runpy.run_path(
    str(Path(__file__).with_name("isolated_worktree_workflow.test.py")),
    run_name="__main__",
)
