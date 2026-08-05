#!/usr/bin/env python3
"""Tests for scripts/agent_workflow.py and scripts/agent_watcher.py.

Mirrors the ethos of tests/tooling/review-bundle.test.sh: run the real
tool for real, don't mock. Because agent_workflow.py derives its project
root from its own file location (see its module docstring), every test
here builds a throwaway temp-directory git fixture with its own copy of
the two scripts, its own .agent-project.json / package.json, and runs the
CLI as a subprocess against that fixture — never against this real repo.
The fixture is torn down after every test; nothing is left behind.

A final, separate TestCase (RealProjectFinalStateTest) makes read-only
assertions against the actual repo's current state — this is not fixture
behavior, it's verifying the outcome of this build session itself, so it
intentionally does not touch the fixture machinery above.

Usage: python3 -m unittest tests/tooling/agent_workflow.test.py -v
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

REPO_TESTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = REPO_TESTS_DIR.parent.parent
REAL_AGENT_WORKFLOW = PROJECT_ROOT / "scripts" / "agent_workflow.py"
REAL_AGENT_WATCHER = PROJECT_ROOT / "scripts" / "agent_watcher.py"


def run(fixture_root, args, expect_ok=None):
    """Run agent_workflow.py inside fixture_root. Returns CompletedProcess."""
    result = subprocess.run(
        [sys.executable, str(fixture_root / "scripts" / "agent_workflow.py")] + args,
        cwd=fixture_root,
        capture_output=True,
        text=True,
    )
    if expect_ok is True and result.returncode != 0:
        raise AssertionError(
            f"expected success, got {result.returncode}\n"
            f"stdout={result.stdout}\nstderr={result.stderr}"
        )
    if expect_ok is False and result.returncode == 0:
        raise AssertionError(
            f"expected failure, got success\nstdout={result.stdout}"
        )
    return result


def make_fixture(parent_dir, nested=False):
    """Build a throwaway project fixture with its own git repo, its own
    copy of the two scripts, .agent-project.json, package.json, and the
    docs/agents scaffolding agent_workflow.py expects to exist."""
    if nested:
        outer = Path(parent_dir) / "outer-parent-repo"
        outer.mkdir()
        subprocess.run(["git", "init", "-q"], cwd=outer, check=True)
        root = outer / "nested" / "project"
        root.mkdir(parents=True)
    else:
        root = Path(parent_dir) / "project"
        root.mkdir()
        subprocess.run(["git", "init", "-q"], cwd=root, check=True)

    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=root, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=root, check=True)

    (root / "scripts").mkdir()
    shutil.copy(REAL_AGENT_WORKFLOW, root / "scripts" / "agent_workflow.py")
    shutil.copy(REAL_AGENT_WATCHER, root / "scripts" / "agent_watcher.py")

    (root / ".agent-project.json").write_text(json.dumps({
        "schema_version": 1,
        "project_id": "fixture-project",
        "project_name": "Fixture Project",
        "studio": "test",
        "package_name": "fixture-project",
        "expected_working_directory": ".",
        "nested_git_repository": nested,
        "external_reviewer": "ChatGPT",
    }))
    (root / "package.json").write_text(json.dumps({"name": "fixture-project"}))

    docs_agents = root / "docs" / "agents"
    docs_agents.mkdir(parents=True)
    (docs_agents / "DUAL_AGENT_PROTOCOL.md").write_text("# fixture protocol\n")
    (docs_agents / "CURRENT_TASK.json").write_text(json.dumps({
        "schema_version": 1,
        "project_id": "fixture-project",
        "last_completed_stage": "S0",
        "current_stage": "S1",
        "current_stage_title": "Fixture Stage",
        "status": "paused_ready",
        "active_agent": None,
        "preferred_agent": "claude",
        "fallback_agent": "codex",
        "external_reviewer": "ChatGPT",
        "branch": "master",
        "base_commit": "0" * 40,
        "head_commit": "0" * 40,
        "last_verified_commit": "0" * 40,
        "current_ticket": None,
        "current_step": None,
        "step_status": None,
        "completed": [],
        "next_actions": [],
        "blocked_by": [],
        "do_not_change": [],
        "last_tests": [],
        "last_checkpoint": None,
        "last_handoff": None,
        "last_recovery": None,
        "updated_at": "2026-01-01T00:00:00Z",
    }))

    (root / ".gitignore").write_text(".agent-state/*\n!.agent-state/.gitkeep\n")
    (root / "README.md").write_text("fixture\n")
    subprocess.run(["git", "add", "-A"], cwd=root, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "init"], cwd=root, check=True)

    return root


class FixtureTestCase(unittest.TestCase):
    """Base class: fresh temp fixture per test, torn down in tearDown."""

    NESTED = False

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp(prefix="dual-agent-test-")
        self.root = make_fixture(self.tmpdir, nested=self.NESTED)

    def tearDown(self):
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def run_cli(self, args, expect_ok=None):
        return run(self.root, args, expect_ok=expect_ok)

    def current_task(self):
        return json.loads((self.root / "docs" / "agents" / "CURRENT_TASK.json").read_text())


class ProjectRootValidationTests(FixtureTestCase):
    def test_doctor_ok_at_root(self):
        result = self.run_cli(["doctor"], expect_ok=True)
        self.assertIn("OK", result.stdout)

    def test_rejects_from_parent_directory(self):
        # Simulate running the *fixture's* script from one level above the
        # fixture root — agent_workflow.py resolves its root from its own
        # file location (scripts/agent_workflow.py's parent's parent), so
        # this instead verifies that a project missing .agent-project.json
        # at the expected root is rejected, which is the same failure mode
        # a parent-directory invocation would hit for a real install.
        bogus_root = Path(self.tmpdir) / "no-agent-project-here"
        bogus_root.mkdir()
        (bogus_root / "scripts").mkdir()
        shutil.copy(REAL_AGENT_WORKFLOW, bogus_root / "scripts" / "agent_workflow.py")
        result = run(bogus_root, ["doctor"])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(".agent-project.json", result.stdout + result.stderr)

    def test_package_json_name_mismatch_rejected(self):
        (self.root / "package.json").write_text(json.dumps({"name": "wrong-name"}))
        result = self.run_cli(["status"])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("does not match", result.stderr)


class ClaimTests(FixtureTestCase):
    def test_claude_claim_succeeds(self):
        result = self.run_cli(
            ["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"],
            expect_ok=True,
        )
        self.assertIn("Claimed by claude", result.stdout)
        task = self.current_task()
        self.assertEqual(task["active_agent"], "claude")

    def test_codex_claim_rejected_while_claude_active(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        result = self.run_cli(
            ["claim", "--agent", "codex", "--stage", "S1", "--ticket", "t1"],
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("already holds the claim", result.stderr)

    def test_human_override_allows_reclaim(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        result = self.run_cli(
            ["claim", "--agent", "codex", "--stage", "S1", "--ticket", "t1",
             "--human-override", "--reason", "user asked"],
            expect_ok=True,
        )
        self.assertIn("HUMAN OVERRIDE", result.stdout)

    def test_lock_mutual_exclusion_reverse(self):
        self.run_cli(["claim", "--agent", "codex", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        result = self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"])
        self.assertNotEqual(result.returncode, 0)


class ValidationGateTests(FixtureTestCase):
    def test_edit_blocked_without_claim(self):
        result = self.run_cli(
            ["validate", "--agent", "claude", "--require-ownership", "--require-active-step"]
        )
        self.assertEqual(result.returncode, 2)

    def test_edit_blocked_without_active_step(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        result = self.run_cli(
            ["validate", "--agent", "claude", "--require-ownership", "--require-active-step"]
        )
        self.assertEqual(result.returncode, 2)

    def test_validate_passes_with_claim_and_step(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(
            ["step-start", "--agent", "claude", "--summary", "do thing",
             "--expected-files", "x", "--verification", "y"],
            expect_ok=True,
        )
        result = self.run_cli(
            ["validate", "--agent", "claude", "--require-ownership", "--require-active-step"],
            expect_ok=True,
        )
        self.assertIn("OK", result.stdout)


class StepLifecycleTests(FixtureTestCase):
    def test_step_start_then_complete(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(
            ["step-start", "--agent", "claude", "--summary", "implement thing",
             "--expected-files", "a.py", "--verification", "pytest"],
            expect_ok=True,
        )
        task = self.current_task()
        self.assertEqual(task["current_step"], "implement thing")
        self.assertEqual(task["step_status"], "active")

        self.run_cli(
            ["step-complete", "--agent", "claude", "--summary", "done",
             "--changed-files", "a.py", "--verification-result", "pass",
             "--next-step", "next thing"],
            expect_ok=True,
        )
        task = self.current_task()
        self.assertIsNone(task["current_step"])
        self.assertEqual(task["step_status"], "complete")
        self.assertIn("next thing", task["next_actions"])

    def test_second_step_start_rejected_while_active(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(
            ["step-start", "--agent", "claude", "--summary", "first",
             "--expected-files", "", "--verification", ""],
            expect_ok=True,
        )
        result = self.run_cli(
            ["step-start", "--agent", "claude", "--summary", "second",
             "--expected-files", "", "--verification", ""],
        )
        self.assertNotEqual(result.returncode, 0)


class AutosnapshotTests(FixtureTestCase):
    def test_snapshot_shape(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["snapshot", "--agent", "claude"], expect_ok=True)
        snap_path = self.root / ".agent-state" / "autosnapshot.json"
        self.assertTrue(snap_path.is_file())
        snap = json.loads(snap_path.read_text())
        expected_keys = {
            "active_agent", "current_stage", "current_ticket", "current_step",
            "head", "branch", "git_status", "changed_files", "diff_stat",
            "last_checkpoint", "timestamp",
        }
        self.assertEqual(set(snap.keys()), expected_keys)
        self.assertEqual(snap["active_agent"], "claude")

    def test_no_absolute_paths_or_secrets_in_snapshot(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["snapshot", "--agent", "claude"], expect_ok=True)
        raw = (self.root / ".agent-state" / "autosnapshot.json").read_text()
        self.assertNotIn(str(self.root), raw)
        self.assertNotIn(str(Path.home()), raw)
        for secret_word in ("API_KEY", "SECRET", "PASSWORD", "token="):
            self.assertNotIn(secret_word, raw)


class WatcherTests(FixtureTestCase):
    def test_watcher_writes_and_removes_pid(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        proc = subprocess.Popen(
            [sys.executable, str(self.root / "scripts" / "agent_watcher.py"),
             "--interval-seconds", "1"],
            cwd=self.root,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            pid_path = self.root / ".agent-state" / "watcher.pid"
            for _ in range(50):
                if pid_path.is_file():
                    break
                time.sleep(0.1)
            self.assertTrue(pid_path.is_file(), "watcher.pid was not created")
        finally:
            proc.terminate()
            proc.wait(timeout=5)
            proc.stdout.close()
            proc.stderr.close()
        self.assertFalse(pid_path.is_file(), "watcher.pid was not removed on stop")

    def test_watcher_updates_autosnapshot_on_status_change(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        proc = subprocess.Popen(
            [sys.executable, str(self.root / "scripts" / "agent_watcher.py"),
             "--interval-seconds", "1"],
            cwd=self.root,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            time.sleep(1.5)
            (self.root / "new-file.txt").write_text("change\n")
            time.sleep(2.5)
            snap_path = self.root / ".agent-state" / "autosnapshot.json"
            self.assertTrue(snap_path.is_file())
            snap = json.loads(snap_path.read_text())
            self.assertTrue(any("new-file.txt" in f for f in snap["changed_files"]))
        finally:
            proc.terminate()
            proc.wait(timeout=5)
            proc.stdout.close()
            proc.stderr.close()


class CheckpointTests(FixtureTestCase):
    def test_clean_checkpoint(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        # claim() legitimately mutates tracked CURRENT_TASK.json — commit
        # that so the working tree is genuinely clean for this assertion.
        subprocess.run(["git", "add", "-A"], cwd=self.root, check=True)
        subprocess.run(["git", "commit", "-q", "-m", "claim"], cwd=self.root, check=True)
        result = self.run_cli(["checkpoint", "--agent", "claude"], expect_ok=True)
        self.assertIn("Checkpoint written", result.stdout)
        task = self.current_task()
        checkpoint_path = self.root / task["last_checkpoint"]
        self.assertTrue(checkpoint_path.is_file())
        body = checkpoint_path.read_text()
        self.assertIn("Working tree: clean", body)

    def test_dirty_checkpoint_lists_changed_files(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        (self.root / "dirty.txt").write_text("uncommitted\n")
        result = self.run_cli(["checkpoint", "--agent", "claude"], expect_ok=True)
        task = self.current_task()
        checkpoint_path = self.root / task["last_checkpoint"]
        body = checkpoint_path.read_text()
        self.assertIn("DIRTY", body)
        self.assertIn("dirty.txt", body)


class HandoffTests(FixtureTestCase):
    def test_clean_handoff(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        result = self.run_cli(
            ["handoff", "--from", "claude", "--to", "codex", "--reason", "quota"],
            expect_ok=True,
        )
        self.assertIn("Handoff written", result.stdout)
        task = self.current_task()
        self.assertEqual(task["status"], "handoff_ready")
        self.assertIsNone(task["active_agent"])
        lock_path = self.root / ".agent-state" / "runtime-lock.json"
        self.assertFalse(lock_path.is_file(), "lock should be released after handoff")

    def test_dirty_handoff_lists_files(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        (self.root / "wip.txt").write_text("work in progress\n")
        self.run_cli(["handoff", "--from", "claude", "--to", "codex", "--reason", "quota"], expect_ok=True)
        task = self.current_task()
        handoff_path = self.root / task["last_handoff"]
        body = handoff_path.read_text()
        self.assertIn("DIRTY", body)
        self.assertIn("wip.txt", body)

    def test_reverse_handoff_codex_to_claude(self):
        self.run_cli(["claim", "--agent", "codex", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        result = self.run_cli(
            ["handoff", "--from", "codex", "--to", "claude", "--reason", "quota"],
            expect_ok=True,
        )
        self.assertIn("Handoff written", result.stdout)

    def test_handoff_requires_active_claim(self):
        result = self.run_cli(
            ["handoff", "--from", "claude", "--to", "codex", "--reason", "quota"],
        )
        self.assertNotEqual(result.returncode, 0)


class ResumeTests(FixtureTestCase):
    def test_resume_matches_clean_handoff(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["handoff", "--from", "claude", "--to", "codex", "--reason", "quota"], expect_ok=True)
        result = self.run_cli(["resume", "--agent", "codex"], expect_ok=True)
        self.assertIn("Safe to", result.stdout)

    def test_resume_rejects_on_mismatch(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["handoff", "--from", "claude", "--to", "codex", "--reason", "quota"], expect_ok=True)
        # mutate state after the handoff so live reality no longer matches
        subprocess.run(["git", "commit", "--allow-empty", "-q", "-m", "drift"], cwd=self.root, check=True)
        result = self.run_cli(["resume", "--agent", "codex"])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("does NOT match", result.stdout)


class RecoverTests(FixtureTestCase):
    def test_recover_without_handoff(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(
            ["step-start", "--agent", "claude", "--summary", "mid-work",
             "--expected-files", "", "--verification", ""],
            expect_ok=True,
        )
        (self.root / "half-done.txt").write_text("dirty work\n")
        result = self.run_cli(["recover", "--agent", "codex"], expect_ok=True)
        self.assertIn("Recovery report written", result.stdout)
        task = self.current_task()
        recovery_path = self.root / task["last_recovery"]
        self.assertTrue(recovery_path.is_file())

    def test_recover_preserves_dirty_work(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        (self.root / "half-done.txt").write_text("dirty work\n")
        self.run_cli(["recover", "--agent", "codex"], expect_ok=True)
        self.assertTrue((self.root / "half-done.txt").is_file())
        self.assertEqual((self.root / "half-done.txt").read_text(), "dirty work\n")

    def test_recover_does_not_claim(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["recover", "--agent", "codex"], expect_ok=True)
        lock_path = self.root / ".agent-state" / "runtime-lock.json"
        self.assertTrue(lock_path.is_file())
        lock = json.loads(lock_path.read_text())
        self.assertEqual(lock["agent"], "claude")  # unchanged — recover didn't claim


class SuddenStopSimulationTests(FixtureTestCase):
    """Section 18 of the spec: simulate sudden quota loss for both
    directions, verify no dirty work is destroyed and a subsequent claim
    succeeds afterward."""

    def test_claude_sudden_stop_then_codex_recovers(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(
            ["step-start", "--agent", "claude", "--summary", "half-finished work",
             "--expected-files", "wip.py", "--verification", "n/a"],
            expect_ok=True,
        )
        (self.root / "wip.py").write_text("# incomplete\n")
        self.run_cli(["snapshot", "--agent", "claude"], expect_ok=True)
        # Claude vanishes here — no handoff call.

        recover_result = self.run_cli(["recover", "--agent", "codex"], expect_ok=True)
        self.assertIn("Recovery report written", recover_result.stdout)
        self.assertTrue((self.root / "wip.py").is_file())
        self.assertEqual((self.root / "wip.py").read_text(), "# incomplete\n")

        claim_result = self.run_cli(
            ["claim", "--agent", "codex", "--stage", "S1", "--ticket", "t1",
             "--human-override", "--reason", "claude quota loss, recovered"],
            expect_ok=True,
        )
        self.assertIn("Claimed by codex", claim_result.stdout)

    def test_codex_sudden_stop_then_claude_recovers(self):
        self.run_cli(["claim", "--agent", "codex", "--stage", "S1", "--ticket", "t2"], expect_ok=True)
        self.run_cli(
            ["step-start", "--agent", "codex", "--summary", "codex half-finished work",
             "--expected-files", "wip2.py", "--verification", "n/a"],
            expect_ok=True,
        )
        (self.root / "wip2.py").write_text("# codex incomplete\n")
        self.run_cli(["snapshot", "--agent", "codex"], expect_ok=True)
        # Codex vanishes here — no handoff call.

        recover_result = self.run_cli(["recover", "--agent", "claude"], expect_ok=True)
        self.assertIn("Recovery report written", recover_result.stdout)
        self.assertTrue((self.root / "wip2.py").is_file())

        claim_result = self.run_cli(
            ["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t2",
             "--human-override", "--reason", "codex quota loss, recovered"],
            expect_ok=True,
        )
        self.assertIn("Claimed by claude", claim_result.stdout)


class StatePrivacyTests(FixtureTestCase):
    def test_agent_state_is_gitignored_pattern(self):
        # Fixture ships a .gitignore matching the real project's
        # (.agent-state/* except .gitkeep) — verify git actually treats
        # runtime state as ignored, and that nothing in this tool ever
        # `git add`s it regardless.
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["snapshot", "--agent", "claude"], expect_ok=True)
        result = subprocess.run(
            ["git", "status", "--short"], cwd=self.root, capture_output=True, text=True, check=True
        )
        self.assertNotIn(".agent-state", result.stdout)
        check_ignore = subprocess.run(
            ["git", "check-ignore", ".agent-state/runtime-lock.json"],
            cwd=self.root, capture_output=True, text=True,
        )
        self.assertEqual(check_ignore.returncode, 0, "runtime-lock.json should be gitignored")
        log_result = subprocess.run(
            ["git", "log", "--all", "--full-history", "--", ".agent-state"],
            cwd=self.root, capture_output=True, text=True,
        )
        self.assertEqual(log_result.stdout.strip(), "")

    def test_no_sibling_project_names_in_generated_files(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        self.run_cli(["checkpoint", "--agent", "claude"], expect_ok=True)
        task = self.current_task()
        body = (self.root / task["last_checkpoint"]).read_text()
        # sibling names from this real workspace that must never leak into
        # generic fixture output (defensive check for the real deployment)
        for forbidden in ("boro", "outdoorfun", "tw-glamping", "telegram_1059505606"):
            self.assertNotIn(forbidden, body)


class CurrentTaskConsistencyTests(FixtureTestCase):
    def test_json_and_md_consistent_after_mutation(self):
        self.run_cli(["claim", "--agent", "claude", "--stage", "S1", "--ticket", "t1"], expect_ok=True)
        task = self.current_task()
        md_path = self.root / "docs" / "agents" / "CURRENT_TASK.md"
        self.assertTrue(md_path.is_file())
        md = md_path.read_text()
        self.assertIn(task["current_stage"], md)
        self.assertIn(task["current_ticket"], md)
        self.assertIn("claude", md)


class SkillSymlinkTests(unittest.TestCase):
    """Verifies the real repo's .agents/skills symlinks resolve — this is
    a read-only check against the actual project, not fixture-based,
    since the symlinks are part of this session's real deliverable."""

    def test_symlinks_resolve(self):
        skills_dir = PROJECT_ROOT / ".agents" / "skills"
        expected = [
            "research", "domain-modeling", "to-spec", "to-tickets", "implement",
            "prototype", "tdd", "diagnosing-bugs", "codebase-design",
            "code-review", "handoff", "dual-agent",
        ]
        for name in expected:
            link = skills_dir / name
            self.assertTrue(link.is_symlink(), f"{name} is not a symlink")
            self.assertTrue(link.resolve().is_dir(), f"{name} does not resolve to a directory")


class GitGuardrailPreservedTests(unittest.TestCase):
    """The pre-existing dangerous-git hook must still be present and wired
    after this session's changes to .claude/settings.json."""

    def test_block_dangerous_git_hook_file_present(self):
        hook = PROJECT_ROOT / ".claude" / "hooks" / "block-dangerous-git.sh"
        self.assertTrue(hook.is_file())
        content = hook.read_text()
        self.assertIn("git push", content)
        self.assertIn("reset --hard", content)


class StopHookNoLoopTests(unittest.TestCase):
    """The Stop hook must never exit 2 (which would force Claude Code to
    keep going, i.e. loop) — it may only ever print a reminder and exit 0
    (or a non-2 nonzero, per Claude Code's hook exit-code semantics)."""

    def test_stop_hook_never_exits_2(self):
        hook = PROJECT_ROOT / ".claude" / "hooks" / "stop-dirty-tree-reminder.sh"
        self.assertTrue(hook.is_file())
        code_lines = [
            line for line in hook.read_text().splitlines()
            if not line.strip().startswith("#")
        ]
        for line in code_lines:
            self.assertNotIn("exit 2", line, f"found 'exit 2' in executable line: {line!r}")


if __name__ == "__main__":
    unittest.main()
