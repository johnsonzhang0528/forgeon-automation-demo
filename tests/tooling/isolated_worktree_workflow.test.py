#!/usr/bin/env python3
"""Adversarial tests for the standalone, isolated-worktree workflow."""

import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[2]


def proc(cmd, cwd, env=None):
    return subprocess.run(cmd, cwd=cwd, text=True, capture_output=True,
                          env={**os.environ, **(env or {})})


class Fixture:
    def __init__(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="forgeon-isolated-test-"))
        self.repo = self.tmp / "repo"; self.repo.mkdir()
        proc(["git", "init", "-q", "-b", "main"], self.repo)
        proc(["git", "config", "user.email", "test@example.invalid"], self.repo)
        proc(["git", "config", "user.name", "Test"], self.repo)
        for rel in ("scripts/agent_workflow.py", "scripts/agent_watcher.py", "scripts/agent_guard.py"):
            dest = self.repo / rel; dest.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(SOURCE / rel, dest)
        (self.repo / "docs/agents").mkdir(parents=True)
        shutil.copy2(SOURCE / "docs/agents/DUAL_AGENT_PROTOCOL.md", self.repo / "docs/agents/DUAL_AGENT_PROTOCOL.md")
        (self.repo / ".agent-project.json").write_text(json.dumps({"schema_version":2,"project_id":"fixture","package_name":"fixture","repository_layout":"standalone-worktrees","integration_branch":"main","agent_branches":{"claude":"agent/claude","codex":"agent/codex"}}))
        (self.repo / "package.json").write_text(json.dumps({"name":"fixture"}))
        self.registry = {"schema_version":1,"stages":{"S1":{"title":"Stage","claimable":True,"spec":"spec.md","tickets":[{"id":"T1","status":"ready","allowed_files":["work.txt","頁面.txt","quoted name.txt"],"required_tests":["true"]},{"id":"T2","status":"ready","allowed_files":["other.txt"],"required_tests":[]},{"id":"DONE","status":"complete","allowed_files":[]}]},"BLOCKED":{"title":"No","claimable":False,"spec":None,"tickets":[]}}}
        (self.repo / "docs/agents/TASK_REGISTRY.json").write_text(json.dumps(self.registry))
        state = {"schema_version":2,"project_id":"fixture","last_completed_stage":"S0","current_stage":"S1","current_stage_title":"Stage","status":"paused_ready","active_agent":None,"current_ticket":None,"current_step":None,"claimable":True,"external_reviewer":"ChatGPT","repository_base_commit":"0"*40,"last_verified_commit":"0"*40,"updated_at":"2026-01-01T00:00:00Z"}
        (self.repo / "docs/agents/CURRENT_TASK.json").write_text(json.dumps(state))
        spec = importlib.util.spec_from_file_location("fixture_aw", self.repo / "scripts/agent_workflow.py")
        module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
        (self.repo / "docs/agents/CURRENT_TASK.md").write_text(module.render_versioned(state))
        (self.repo / "work.txt").write_text("base\n")
        proc(["git", "add", "--", ".agent-project.json", "package.json", "docs", "scripts", "work.txt"], self.repo)
        proc(["git", "commit", "-qm", "fixture"], self.repo)
        self.claude = self.tmp / "claude"; self.codex = self.tmp / "codex"
        proc(["git", "worktree", "add", "-q", "-b", "agent/claude", str(self.claude), "main"], self.repo)
        proc(["git", "worktree", "add", "-q", "-b", "agent/codex", str(self.codex), "main"], self.repo)
        self.run(self.repo, "init-runtime", ok=True)

    def run(self, cwd, *args, ok=None, env=None):
        result = proc([sys.executable, "scripts/agent_workflow.py", *args], cwd, env)
        if ok is True and result.returncode: raise AssertionError(result.stdout + result.stderr)
        if ok is False and not result.returncode: raise AssertionError("unexpected success: " + result.stdout)
        return result

    def claim_step(self, agent="codex"):
        wt = getattr(self, agent)
        self.run(wt, "claim", "--agent", agent, "--stage", "S1", "--ticket", "T1", ok=True)
        self.run(wt, "step-start", "--agent", agent, "--summary", "edit", ok=True)
        return wt

    def common(self, worktree):
        raw = Path(proc(["git","rev-parse","--git-common-dir"], worktree).stdout.strip())
        return raw if raw.is_absolute() else (worktree / raw).resolve()

    def close(self): shutil.rmtree(self.tmp, ignore_errors=True)


class IsolatedWorkflowTests(unittest.TestCase):
    def setUp(self): self.f = Fixture()
    def tearDown(self): self.f.close()

    def test_standalone_root_and_common_git_dir(self):
        self.assertEqual(proc(["git","rev-parse","--show-prefix"], self.f.repo).stdout.strip(), "")
        commons = {proc(["git","rev-parse","--git-common-dir"], p).stdout.strip().replace(str(p), "") for p in (self.f.claude,self.f.codex)}
        self.assertEqual(len(commons), 1)

    def test_integration_and_wrong_worktree_claims_rejected(self):
        self.assertNotEqual(self.f.run(self.f.repo,"claim","--agent","codex","--stage","S1","--ticket","T1").returncode,0)
        self.assertNotEqual(self.f.run(self.f.claude,"claim","--agent","codex","--stage","S1","--ticket","T1").returncode,0)
        self.f.run(self.f.claude,"claim","--agent","claude","--stage","S1","--ticket","T1",ok=True)

    def test_registry_rejections(self):
        for args in (("NO","T1"),("BLOCKED","T1"),("S1","NO"),("S1","DONE")):
            self.assertNotEqual(self.f.run(self.f.codex,"claim","--agent","codex","--stage",args[0],"--ticket",args[1]).returncode,0)

    def test_claim_collision_and_same_agent_ticket_switch_rejected(self):
        self.f.run(self.f.codex,"claim","--agent","codex","--stage","S1","--ticket","T1",ok=True)
        self.assertNotEqual(self.f.run(self.f.codex,"claim","--agent","codex","--stage","S1","--ticket","T2").returncode,0)
        self.assertNotEqual(self.f.run(self.f.claude,"claim","--agent","claude","--stage","S1","--ticket","T1").returncode,0)

    def test_claim_failure_rolls_back_lock_and_state(self):
        result=self.f.run(self.f.codex,"claim","--agent","codex","--stage","S1","--ticket","T1",env={"AGENT_TEST_FAIL_STATE_WRITE":"1"})
        self.assertNotEqual(result.returncode,0)
        common=self.f.common(self.f.repo)
        self.assertFalse((common/"agent-state/runtime-lock.json").exists())
        self.assertIsNone(json.loads((common/"agent-state/current-task.json").read_text())["active_agent"])

    def test_step_checkpoint_complete_require_claim(self):
        for verb in (("step-start","--summary","x"),("checkpoint","--next-step","x"),("complete",)):
            self.assertNotEqual(self.f.run(self.f.codex,verb[0],"--agent","codex",*verb[1:]).returncode,0)

    def test_stage_scope_and_structured_test_commit_checkpoint_complete(self):
        wt=self.f.claim_step(); (wt/"other.txt").write_text("bad\n")
        self.assertNotEqual(self.f.run(wt,"stage-ticket","--agent","codex").returncode,0)
        (wt/"other.txt").unlink(); (wt/"work.txt").write_text("done\n")
        self.f.run(wt,"test","--agent","codex","--", "true",ok=True)
        self.f.run(wt,"stage-ticket","--agent","codex",ok=True)
        self.f.run(wt,"commit-ticket","--agent","codex","--message","test: ticket",ok=True)
        self.f.run(wt,"checkpoint","--agent","codex","--next-step","finish",ok=True)
        self.f.run(wt,"step-complete","--agent","codex",ok=True)
        self.f.run(wt,"complete","--agent","codex",ok=True)
        state=json.loads((self.f.common(wt)/"agent-state/current-task.json").read_text())
        self.assertEqual((state["status"],state["active_agent"],state["current_ticket"]),("paused_ready",None,None))

    def test_checkpoint_rejects_free_text_and_dirty_tree(self):
        wt=self.f.claim_step(); (wt/"work.txt").write_text("dirty\n")
        self.assertNotEqual(self.f.run(wt,"checkpoint","--agent","codex","--next-step","x").returncode,0)

    def test_human_abort_is_only_generic_release(self):
        wt=self.f.claim_step(); self.f.run(wt,"human-abort","--agent","codex","--reason","human test",ok=True)
        self.assertIn("paused_ready",self.f.run(self.f.repo,"status").stdout)

    def test_json_markdown_and_stale_pid_drift(self):
        (self.f.repo/"docs/agents/CURRENT_TASK.md").write_text("DRIFT\n")
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)
        proc(["git","checkout","--","docs/agents/CURRENT_TASK.md"],self.f.repo)
        common=self.f.common(self.f.repo); (common/"agent-state/watcher.pid").write_text("999999\n")
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)

    def test_snapshot_cjk_quoted_and_patch_hash(self):
        wt=self.f.claim_step(); (wt/"頁面.txt").write_text("內容\n"); (wt/"quoted name.txt").write_text("space\n")
        self.f.run(wt,"snapshot","--agent","codex",ok=True)
        common=self.f.common(wt); snap=json.loads((common/"agent-state/autosnapshots/codex-latest.json").read_text()); patch=(common/"agent-state/patches/codex-latest.patch").read_bytes()
        self.assertIn("頁面.txt",snap["changed_files"]); self.assertIn("quoted name.txt",snap["changed_files"])
        self.assertEqual(hashlib.sha256(patch).hexdigest(),snap["patch_sha256"])

    def test_duplicate_watcher_rejected_and_pid_removed(self):
        wt=self.f.claim_step(); first=subprocess.Popen([sys.executable,"scripts/agent_watcher.py","--agent","codex","--interval-seconds","0.1"],cwd=wt,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        time.sleep(.3); second=proc([sys.executable,"scripts/agent_watcher.py","--agent","codex","--interval-seconds","0.1"],wt)
        self.assertNotEqual(second.returncode,0); first.terminate(); first.communicate(timeout=5)
        common=self.f.common(wt); self.assertFalse((common/"agent-state/watcher.pid").exists())

    def test_guard_blocks_dangerous_and_allows_read_only(self):
        guard=self.f.repo/"scripts/agent_guard.py"
        denied=("git add -A","git add .","git commit -am x","git commit --amend","git rebase main","git checkout -- .","git restore --worktree .","git push","git branch -d old","git clean -fd","git reset --hard")
        for command in denied:
            r=subprocess.run([sys.executable,str(guard)],input=json.dumps({"tool_input":{"command":command}}),text=True,capture_output=True); self.assertEqual(r.returncode,2,command)
        r=subprocess.run([sys.executable,str(guard)],input=json.dumps({"tool_input":{"command":"git status --short"}}),text=True,capture_output=True); self.assertEqual(r.returncode,0)

    def test_symlink_escape_and_runtime_path_leak_detected(self):
        (self.f.repo/"escape").symlink_to("/tmp")
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)
        (self.f.repo/"escape").unlink(); common=self.f.common(self.f.repo); state=json.loads((common/"agent-state/current-task.json").read_text()); state["bad"]="/home/person/private"; (common/"agent-state/current-task.json").write_text(json.dumps(state))
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)

    def test_secret_scan_rejects_ticket_content(self):
        wt=self.f.claim_step(); (wt/"work.txt").write_text("api_key=abcdefghijklmnop\n")
        self.assertNotEqual(self.f.run(wt,"stage-ticket","--agent","codex").returncode,0)

    def test_source_dirty_unchanged_when_recovery_patch_conflicts(self):
        source=self.f.claim_step("claude"); (source/"work.txt").write_text("source dirty\n"); self.f.run(source,"snapshot","--agent","claude",ok=True)
        before=(source/"work.txt").read_bytes(); (self.f.codex/"work.txt").write_text("target dirty\n")
        self.assertNotEqual(self.f.run(self.f.codex,"recover","--agent","codex").returncode,0)
        self.assertEqual((source/"work.txt").read_bytes(),before)

    def test_graceful_codex_to_claude_handoff_and_resume_branch(self):
        wt=self.f.claim_step(); (wt/"work.txt").write_text("handoff\n")
        self.f.run(wt,"test","--agent","codex","--","true",ok=True)
        self.f.run(wt,"stage-ticket","--agent","codex",ok=True)
        self.f.run(wt,"commit-ticket","--agent","codex","--message","test: handoff",ok=True)
        self.f.run(wt,"checkpoint","--agent","codex","--next-step","continue",ok=True)
        source_commit=proc(["git","rev-parse","HEAD"],wt).stdout.strip()
        self.f.run(wt,"handoff","--from","codex","--to","claude","--completed","unit","--remaining","review","--next-step","review commit","--risk","none",ok=True)
        self.f.run(self.f.claude,"resume","--agent","claude",ok=True)
        self.assertEqual(proc(["git","rev-parse","HEAD"],self.f.claude).stdout.strip(),source_commit)
        self.assertTrue(proc(["git","branch","--show-current"],self.f.claude).stdout.strip().startswith("resume/claude/"))

    def test_graceful_claude_to_codex_handoff(self):
        wt=self.f.claim_step("claude"); (wt/"work.txt").write_text("claude\n")
        self.f.run(wt,"test","--agent","claude","--","true",ok=True)
        self.f.run(wt,"stage-ticket","--agent","claude",ok=True)
        self.f.run(wt,"commit-ticket","--agent","claude","--message","test: claude handoff",ok=True)
        self.f.run(wt,"checkpoint","--agent","claude","--next-step","continue",ok=True)
        self.f.run(wt,"handoff","--from","claude","--to","codex","--completed","unit","--remaining","review","--next-step","review commit",ok=True)
        self.assertIn("handoff_ready",self.f.run(self.f.repo,"status").stdout)

    def test_sudden_recovery_applies_patch_on_target_branch_without_integration_change(self):
        integration=proc(["git","rev-parse","HEAD"],self.f.repo).stdout.strip()
        source=self.f.claim_step("claude"); (source/"頁面.txt").write_text("recovered\n"); self.f.run(source,"snapshot","--agent","claude",ok=True)
        before=(source/"頁面.txt").read_bytes(); self.f.run(self.f.codex,"recover","--agent","codex",ok=True)
        self.assertEqual((self.f.codex/"頁面.txt").read_text(),"recovered\n")
        self.assertEqual((source/"頁面.txt").read_bytes(),before)
        self.assertEqual(proc(["git","rev-parse","HEAD"],self.f.repo).stdout.strip(),integration)
        self.assertTrue(proc(["git","branch","--show-current"],self.f.codex).stdout.strip().startswith("recovery/codex/"))

    def test_recovery_patch_hash_and_apply_conflict_fail_closed(self):
        source=self.f.claim_step("claude"); (source/"work.txt").write_text("patch\n"); self.f.run(source,"snapshot","--agent","claude",ok=True)
        common=self.f.common(source); patch=common/"agent-state/patches/claude-latest.patch"; patch.write_text("not a patch\n")
        self.assertNotEqual(self.f.run(self.f.codex,"recover","--agent","codex").returncode,0)
        snap=json.loads((common/"agent-state/autosnapshots/claude-latest.json").read_text()); snap["patch_sha256"]=hashlib.sha256(patch.read_bytes()).hexdigest(); (common/"agent-state/autosnapshots/claude-latest.json").write_text(json.dumps(snap))
        self.assertNotEqual(self.f.run(self.f.codex,"recover","--agent","codex").returncode,0)

    def test_doctor_head_branch_patch_and_handoff_commit_drift(self):
        wt=self.f.claim_step(); common=self.f.common(wt); state_path=common/"agent-state/current-task.json"
        state=json.loads(state_path.read_text()); state["branch"]="agent/claude"; state_path.write_text(json.dumps(state))
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)
        state["branch"]="agent/codex"; state["head"]="0"*40; state_path.write_text(json.dumps(state))
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)
        handoffs=common/"agent-state/handoffs"; handoffs.mkdir(exist_ok=True); (handoffs/"bad.json").write_text(json.dumps({"checkpoint_commit":"0"*40}))
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)


if __name__ == "__main__": unittest.main(verbosity=2)
