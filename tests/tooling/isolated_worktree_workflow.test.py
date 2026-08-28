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
        (self.repo / "tests/tooling").mkdir(parents=True)
        (self.repo / "tests/tooling/agent_workflow.test.py").write_text("# fixture entry\n")
        (self.repo / "tests/tooling/review-bundle.test.sh").write_text("#!/bin/bash\n")
        shutil.copy2(SOURCE / "docs/agents/DUAL_AGENT_PROTOCOL.md", self.repo / "docs/agents/DUAL_AGENT_PROTOCOL.md")
        (self.repo / ".agent-project.json").write_text(json.dumps({"schema_version":2,"project_id":"fixture","package_name":"fixture","repository_layout":"standalone-worktrees","integration_branch":"main","agent_branches":{"claude":"agent/claude","codex":"agent/codex"}}))
        (self.repo / "package.json").write_text(json.dumps({"name":"fixture"}))
        self.registry = {"schema_version":1,"stages":{"S1":{"title":"Stage","claimable":True,"spec":"spec.md","tickets":[{"id":"T1","status":"ready","allowed_files":["work.txt","頁面.txt","quoted name.txt"],"required_tests":["true"]},{"id":"T2","status":"ready","allowed_files":["other.txt"],"required_tests":[]},{"id":"DONE","status":"complete","allowed_files":[]}]},"BLOCKED":{"title":"No","claimable":False,"spec":None,"tickets":[]}}}
        (self.repo / "docs/agents/TASK_REGISTRY.json").write_text(json.dumps(self.registry))
        state = {"schema_version":2,"project_id":"fixture","last_completed_stage":"S0","current_stage":"S1","current_stage_title":"Stage","status":"paused_ready","active_agent":None,"current_ticket":None,"current_step":None,"claimable":True,"external_reviewer":"ChatGPT","repository_base_commit":"0"*40,"last_verified_commit":"0"*40,"updated_at":"2026-01-01T00:00:00Z"}
        (self.repo / "docs/agents/CURRENT_TASK.json").write_text(json.dumps(state))
        spec = importlib.util.spec_from_file_location("fixture_aw", self.repo / "scripts/agent_workflow.py")
        module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
        self.module = module
        (self.repo / "docs/agents/CURRENT_TASK.md").write_text(module.render_versioned(state))
        (self.repo / "work.txt").write_text("base\n")
        (self.repo / "docs/engineering/specs").mkdir(parents=True)
        (self.repo / "docs/engineering/specs/blocked-spec.md").write_text("# Spec\n")
        self.proposal = {
            "activation_target": {
                "stage": {"id": "BLOCKED", "title": "Activated Stage", "external_reviewer": "ChatGPT",
                           "claimable": True, "spec": "docs/engineering/specs/blocked-spec.md"},
                "tickets": [
                    {"id": "BLOCKED-01", "title": "First", "status": "ready",
                     "allowed_files": ["src/a.ts"], "required_tests": ["pnpm check"], "depends_on": []},
                    {"id": "BLOCKED-02", "title": "Second", "status": "ready",
                     "allowed_files": ["src/b.ts"], "required_tests": [], "depends_on": ["BLOCKED-01"]},
                ],
            }
        }
        (self.repo / "docs/engineering/specs/blocked-registry-proposal.json").write_text(json.dumps(self.proposal))
        proc(["git", "add", "--", ".agent-project.json", "package.json", "docs", "scripts", "tests", "work.txt"], self.repo)
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

    def maintenance_auth(self, *, overrides=None, stage_id="WF-SEC-04", ticket_count=3):
        base = proc(["git", "rev-parse", "HEAD"], self.codex).stdout.strip()
        titles = {
            "WF-SEC-04": ["Allow safe project tests and temporary fixtures",
                           "Add recovery documentation and runtime secret doctor checks",
                           "Execute live workflow and website verification"],
            "WF-COMM-01": ["建立繁體中文共用溝通規則", "驗證 Claude 與 Codex 指令入口"],
        }
        stage_titles = {"WF-SEC-04": "Verification Capability Hardening",
                        "WF-COMM-01": "Traditional Chinese Communication Policy"}
        ticket_titles = titles.get(stage_id, [f"Fixture ticket {i}" for i in range(1, ticket_count + 1)])
        value = {
            "schema_version": 1, "authorization_id": "auth-" + stage_id.lower(), "authorization_type": "maintenance-bootstrap",
            "issued_by": "human-user", "issued_at": "2026-01-01T00:00:00+00:00",
            "expires_at": "2099-01-01T00:00:00+00:00", "single_use": True, "consumed": False,
            "project_id": "fixture", "authorized_agent": "codex", "authorized_branch": "agent/codex",
            "authorized_base_head": base,
            "bootstrap_allowed_paths": ["scripts/agent_workflow.py", "tests/tooling/**"],
            "forbidden_paths": ["src/**", "public/**"],
            "stage": {"id":stage_id, "title": stage_titles.get(stage_id, f"{stage_id} Maintenance"),
                      "external_reviewer":"ChatGPT", "claimable":True},
            "tickets": [{"id":f"{stage_id}-{i:02d}", "title": title}
                        for i, title in enumerate(ticket_titles, 1)], "constraints": [],
        }
        value.update(overrides or {})
        path = self.common(self.codex) / f"agent-state/human-authorizations/{stage_id}.json"
        path.parent.mkdir(parents=True, exist_ok=True); path.write_text(json.dumps(value)); path.chmod(0o600)
        return path, value

    def activation_auth(self, *, overrides=None, proposal_overrides=None, stage_id="BLOCKED"):
        base = proc(["git", "rev-parse", "HEAD"], self.codex).stdout.strip()
        proposal_path = self.codex / "docs/engineering/specs/blocked-registry-proposal.json"
        if proposal_overrides is not None:
            proposal = json.loads(proposal_path.read_text())
            proposal["activation_target"].update(proposal_overrides)
            proposal_path.write_text(json.dumps(proposal))
            proc(["git", "add", "--", "docs/engineering/specs/blocked-registry-proposal.json"], self.codex)
            proc(["git", "commit", "-qm", "revise proposal"], self.codex)
        target = json.loads(proposal_path.read_text())["activation_target"]
        value = {
            "schema_version": 1, "authorization_id": "auth-activate-" + stage_id.lower(),
            "authorization_type": "product-stage-activation",
            "issued_by": "human-user", "issued_at": "2026-01-01T00:00:00+00:00",
            "expires_at": "2099-01-01T00:00:00+00:00", "single_use": True, "consumed": False,
            "project_id": "fixture", "authorized_agent": "codex", "authorized_branch": "agent/codex",
            "authorized_base_head": base, "stage_id": stage_id,
            "activation_source": "docs/engineering/specs/blocked-registry-proposal.json",
            "activation_target": target,
        }
        value.update(overrides or {})
        path = self.common(self.codex) / f"agent-state/human-authorizations/activate-{stage_id}.json"
        path.parent.mkdir(parents=True, exist_ok=True); path.write_text(json.dumps(value)); path.chmod(0o600)
        return path, value

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

    def test_exact_command_latest_evidence_and_explicit_adjudication(self):
        def evidence(command, exit_code, sequence):
            return {
                "command": command, "exit_code": exit_code,
                "started_at": f"2026-01-01T00:00:{sequence:02d}Z",
                "finished_at": f"2026-01-01T00:00:{sequence + 1:02d}Z",
                "head": f"{sequence:040x}", "output_digest": f"{sequence:064x}",
            }
        def passes(records, adjudications=()):
            effective = self.f.module.latest_effective_test_evidence(records, list(adjudications))
            return bool(effective) and all(item["exit_code"] == 0 for item in effective)

        fail = evidence("same validation", 1, 1)
        passed = evidence("same validation", 0, 3)
        later_fail = evidence("same validation", 1, 5)
        other_pass = evidence("other validation", 0, 7)
        malformed = evidence("malformed command\\", 1, 9)
        nonmatching = {**malformed, "output_digest": "f" * 64}

        cases = (
            ("fail then identical pass", [fail, passed], [], True),
            ("pass then identical fail", [passed, later_fail], [], False),
            ("unrelated fail remains", [fail, other_pass], [], False),
            ("multiple successful reruns", [fail, passed, evidence("same validation", 0, 11)], [], True),
            ("malformed without adjudication", [malformed, other_pass], [], False),
            ("exact malformed adjudication", [malformed, other_pass], [malformed], True),
            ("nonmatching adjudication", [malformed, other_pass], [nonmatching], False),
            ("historical B then identical C", [fail, passed], [], True),
            ("A adjudicated and B to C resolved", [malformed, fail, passed], [malformed], True),
        )
        for name, records, adjudications, expected in cases:
            with self.subTest(name=name):
                before = json.loads(json.dumps(records))
                self.assertEqual(passes(records, adjudications), expected)
                self.assertEqual(records, before)

    def test_complete_uses_tracked_exact_record_adjudication_without_rewriting_history(self):
        def evidence(command, exit_code, sequence):
            return {
                "command": command, "exit_code": exit_code,
                "started_at": f"2026-01-01T00:00:{sequence:02d}Z",
                "finished_at": f"2026-01-01T00:00:{sequence + 1:02d}Z",
                "head": f"{sequence:040x}", "output_digest": f"{sequence:064x}",
            }
        malformed = evidence("malformed command\\", 1, 1)
        historical_fail = evidence("canonical validation", 1, 3)
        latest_pass = evidence("canonical validation", 0, 5)
        sidecar = self.f.codex / "docs/agents/evidence-adjudications/S1-T1.json"
        sidecar.parent.mkdir(parents=True)
        sidecar.write_text(json.dumps({
            "schema_version": 1, "stage": "S1", "ticket": "T1",
            "classification": "NON_VALIDATION_COMMAND_ERROR",
            "reason": "fixture command construction failure",
            "authorization": "fixture human authorization", "record": malformed,
        }))
        proc(["git", "add", "--", str(sidecar.relative_to(self.f.codex))], self.f.codex)
        proc(["git", "commit", "-qm", "test: adjudication"], self.f.codex)

        wt = self.f.claim_step(); (wt / "work.txt").write_text("done\n")
        self.f.run(wt, "test", "--agent", "codex", "--", "true", ok=True)
        self.f.run(wt, "stage-ticket", "--agent", "codex", ok=True)
        self.f.run(wt, "commit-ticket", "--agent", "codex", "--message", "test: ticket", ok=True)
        self.f.run(wt, "checkpoint", "--agent", "codex", "--next-step", "finish", ok=True)
        state_path = self.f.common(wt) / "agent-state/current-task.json"
        state = json.loads(state_path.read_text()); history = [malformed, historical_fail, latest_pass]
        state["test_evidence"] = history; state_path.write_text(json.dumps(state))
        self.f.run(wt, "step-complete", "--agent", "codex", ok=True)
        self.f.run(wt, "complete", "--agent", "codex", ok=True)
        completed = json.loads(state_path.read_text())
        self.assertEqual(completed["test_evidence"], history)
        self.assertEqual((completed["status"], completed["active_agent"]), ("paused_ready", None))

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
        denied=("git add -A","git add .","git commit -am x","git commit --amend","git rebase main","git checkout -- .","git restore --worktree .","git push","git branch -d old","git clean -fd","git reset --hard", "/usr/bin/git push", "env git push", "command git push", "git 'push' origin main", "git    push", "sh -c 'git push'", "bash -c 'git push'", "git remote add origin x", "git remote remove origin", "git remote rename a b", "git remote set-url origin x", "git remote prune origin", "git remote update", "git clone https://example.invalid/x /tmp/forgeon-agent-test-x", "git clone git@example.invalid:x /tmp/forgeon-agent-test-x", "python3 -c 'print(1)'", "python3 /tmp/arbitrary.py", "bash /tmp/arbitrary.sh", "python3 tests/tooling/agent_workflow.test.py && git push", "pnpm agent:test --agent codex -- git push", "pnpm agent:test --agent codex -- rm -rf /tmp/x", "sed -i x file", "find . -delete", "find . -exec git push ;", "git diff --output=/tmp/x", "git diff --ext-diff", "git show --textconv", "rg --pre 'git push' x .", "pnpm agent:test --agent codex -- rg --pre=evil x .")
        for command in denied:
            r=subprocess.run([sys.executable,str(guard)],input=json.dumps({"tool_input":{"command":command}}),text=True,capture_output=True); self.assertEqual(r.returncode,2,command)
        allowed=("git status --short", "/usr/bin/git status", "env git status", "git remote", "git remote -v", "git remote get-url origin", "git branch --show-current", "git worktree list --porcelain", "python3 tests/tooling/agent_workflow.test.py", "python3 tests/tooling/agent_workflow.test.py -v", "bash tests/tooling/review-bundle.test.sh", "git status && git remote -v")
        for command in allowed:
            r=subprocess.run([sys.executable,str(guard)],input=json.dumps({"tool_input":{"command":command}}),text=True,capture_output=True,cwd=self.f.repo,env={**os.environ,"CLAUDE_PROJECT_DIR":str(self.f.repo)}); self.assertEqual(r.returncode,0,(command,r.stderr))

    def test_guard_tmp_fixture_boundary_and_symlink_escape(self):
        guard=self.f.repo/"scripts/agent_guard.py"
        def check(command):
            return subprocess.run([sys.executable,str(guard)],input=json.dumps({"tool_input":{"command":command}}),text=True,capture_output=True,cwd=self.f.repo,env={**os.environ,"CLAUDE_PROJECT_DIR":str(self.f.repo),"FORGEON_FIXTURE_NONCE":"a"*32}).returncode
        target=Path("/tmp/forgeon-agent-test-guard")
        shutil.rmtree(target,ignore_errors=True)
        try:
            self.assertEqual(check(f"git init {target}"),0)
            self.assertEqual(check(f"git clone --no-hardlinks {self.f.repo} {target}"),0)
            target.mkdir(); (target/".forgeon-fixture-owner").write_text(json.dumps({"creator_pid":os.getpid(),"owner_uid":os.getuid(),"project_root":str(self.f.repo),"nonce":"a"*32}))
            self.assertEqual(check(f"git -C {target} status"),0)
            self.assertEqual(check(f"git -C {target} push"),2)
            self.assertEqual(check("git init /tmp/unapproved-fixture"),2)
            self.assertEqual(check(f"git init {self.f.repo}"),2)
            (target/".forgeon-fixture-owner").write_text("forged")
            self.assertEqual(check(f"git -C {target} status"),2)
            (target/".forgeon-fixture-owner").write_text(json.dumps({"creator_pid":os.getpid(),"owner_uid":os.getuid(),"project_root":str(self.f.repo),"nonce":"b"*32}))
            self.assertEqual(check(f"git -C {target} status"),2)
            link=Path("/tmp/forgeon-review-test-link"); link.unlink(missing_ok=True); link.symlink_to(self.f.repo)
            self.assertEqual(check(f"git -C {link} status"),2); link.unlink()
        finally:
            shutil.rmtree(target,ignore_errors=True)

    def test_symlink_escape_and_runtime_path_leak_detected(self):
        (self.f.repo/"escape").symlink_to("/tmp")
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)
        (self.f.repo/"escape").unlink(); common=self.f.common(self.f.repo); state=json.loads((common/"agent-state/current-task.json").read_text()); state["bad"]="/home/person/private"; (common/"agent-state/current-task.json").write_text(json.dumps(state))
        self.assertNotEqual(self.f.run(self.f.repo,"doctor").returncode,0)

    def test_doctor_scans_runtime_values_without_disclosing_them(self):
        common=self.f.common(self.f.repo); state_path=common/"agent-state/current-task.json"
        baseline=json.loads(state_path.read_text())
        cases=(
            ("credential-value", "password=" + "not-a-real-password"),
            ("private-key-header", "-----BEGIN PRIVATE KEY-----\nnot-real"),
            ("access-token", "ghp_" + "A"*24),
            ("private-absolute-path", "/home/person/private/file"),
        )
        for rule, secret_value in cases:
            with self.subTest(rule=rule):
                value=dict(baseline); value["fixture_value"]=secret_value; state_path.write_text(json.dumps(value))
                result=self.f.run(self.f.repo,"doctor")
                self.assertNotEqual(result.returncode,0); self.assertIn(rule,result.stdout)
                self.assertIn("current-task.json",result.stdout); self.assertNotIn(secret_value,result.stdout+result.stderr)
        state_path.write_text(json.dumps({**baseline,"secret_scan_status":"documented secret token password api key"}))
        self.assertEqual(self.f.run(self.f.repo,"doctor").returncode,0)
        for key in ("password", "credential", "api_key", "access_token"):
            state_path.write_text(json.dumps({**baseline,key:"not-a-real-value"}))
            result=self.f.run(self.f.repo,"doctor")
            self.assertNotEqual(result.returncode,0); self.assertIn("credential-value",result.stdout)
            self.assertNotIn("not-a-real-value",result.stdout+result.stderr)

    def test_doctor_scans_nested_runtime_collections(self):
        common=self.f.common(self.f.repo)
        for folder in ("autosnapshots","handoffs","recoveries"):
            path=common/"agent-state"/folder/"nested"/"finding.json"; path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(json.dumps({"value":"credential=" + "not-a-real-value"}))
            result=self.f.run(self.f.repo,"doctor")
            self.assertNotEqual(result.returncode,0); self.assertIn(f"{folder}/nested/finding.json",result.stdout)
            path.unlink()
    def test_secret_scan_rejects_ticket_content(self):
        wt=self.f.claim_step(); (wt/"work.txt").write_text("api_" + "key=" + "abcdefghijklmnop\n")
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

    def test_register_maintenance_consumes_single_use_authorization_and_preserves_blocked_stage(self):
        path, auth = self.f.maintenance_auth()
        before = json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())["stages"]["BLOCKED"]
        self.f.run(self.f.codex, "register-maintenance", "--authorization-file", str(path), ok=True)
        registry = json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())
        self.assertEqual(registry["stages"]["BLOCKED"], before)
        self.assertTrue(registry["stages"]["WF-SEC-04"]["claimable"])
        self.assertEqual([x["status"] for x in registry["stages"]["WF-SEC-04"]["tickets"]], ["ready"]*3)
        self.assertFalse(path.exists())
        consumed = path.parent/"consumed"/f"{auth['authorization_id']}.json"
        self.assertTrue(json.loads(consumed.read_text())["consumed"])
        self.assertNotEqual(self.f.run(self.f.codex, "register-maintenance", "--authorization-file", str(path)).returncode, 0)

    def test_register_maintenance_accepts_communication_and_arbitrary_stages(self):
        for stage_id, count in (("WF-COMM-01", 2), ("WF-TEST-99", 1)):
            with self.subTest(stage_id=stage_id):
                self.f.close(); self.f = Fixture()
                blocked_before = json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())["stages"]["BLOCKED"]
                path, auth = self.f.maintenance_auth(stage_id=stage_id, ticket_count=count)
                self.f.run(self.f.codex, "register-maintenance", "--authorization-file", str(path), ok=True)
                registry = json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())
                stage = registry["stages"][stage_id]
                self.assertEqual([x["id"] for x in stage["tickets"]], [x["id"] for x in auth["tickets"]])
                self.assertEqual([x["allowed_files"] for x in stage["tickets"]],
                                 [auth["bootstrap_allowed_paths"]] * count)
                self.assertEqual(registry["stages"]["BLOCKED"], blocked_before)
                self.assertFalse(path.exists())
                self.assertTrue((path.parent/"consumed"/f"{auth['authorization_id']}.json").exists())
                self.assertNotEqual(self.f.run(self.f.codex, "register-maintenance",
                                               "--authorization-file", str(path)).returncode, 0)

    def test_register_maintenance_rejects_invalid_authorizations(self):
        cases = [
            {"expires_at":"2000-01-01T00:00:00+00:00"}, {"authorized_agent":"claude"},
            {"authorized_branch":"agent/other"}, {"project_id":"other"},
            {"authorized_base_head":"0"*40}, {"consumed":True},
            {"constraints":["api_" + "key=" + "abcdefghijklmnop"]},
            {"authorization_id":"../escape"},
            {"constraints":None}, {"constraints":[""]},
            {"stage":{"id":"WF-SEC-04","title":"Wrong","external_reviewer":"ChatGPT","claimable":False}},
        ]
        for override in cases:
            with self.subTest(override=override):
                path, _ = self.f.maintenance_auth(overrides=override)
                self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)
                path.unlink(missing_ok=True)
        path, _ = self.f.maintenance_auth(); path.chmod(0o644)
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)

    def test_register_maintenance_rejects_invalid_stage_and_ticket_schemas(self):
        cases = (
            {"stage":{"id":"", "title":"Title", "external_reviewer":"ChatGPT", "claimable":True}},
            {"stage":{"id":"WF-bad", "title":"Title", "external_reviewer":"ChatGPT", "claimable":True}},
            {"stage":{"id":"WF-TEST-01", "title":" ", "external_reviewer":"ChatGPT", "claimable":True}},
            {"stage":{"id":"WF-TEST-01", "title":"Title", "external_reviewer":"", "claimable":True}},
            {"tickets":[]},
            {"tickets":[{"id":"WF-SEC-04-01","title":"One"},{"id":"WF-SEC-04-01","title":"Two"}]},
            {"tickets":[{"id":"WF-OTHER-01","title":"Wrong namespace"}]},
            {"tickets":[{"id":"WF-SEC-04-01","title":" "}]},
        )
        for override in cases:
            with self.subTest(override=override):
                path, _ = self.f.maintenance_auth(overrides=override)
                self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)
                path.unlink(missing_ok=True)

    def test_register_maintenance_rejects_unsafe_authorized_paths(self):
        for allowed in ([], [""], ["**"], ["*/**"], ["[.]env"], [".en[v]"], [".g[it]/**"],
                        ["/tmp/outside"], ["../outside"], [".git/**"], ["agent-state/**"],
                        [".env"], [".env.*"]):
            with self.subTest(allowed=allowed):
                path, _ = self.f.maintenance_auth(overrides={"bootstrap_allowed_paths":allowed})
                self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)
                path.unlink(missing_ok=True)
        (self.f.codex/"escape").symlink_to(self.f.tmp)
        path, _ = self.f.maintenance_auth(overrides={"bootstrap_allowed_paths":["escape/**"]})
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)

    def test_register_maintenance_rejects_integration_symlink_lock_and_active_state(self):
        path, _ = self.f.maintenance_auth()
        self.assertNotEqual(self.f.run(self.f.repo,"register-maintenance","--authorization-file",str(path)).returncode,0)
        link = path.parent/"link.json"; link.symlink_to(path)
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(link)).returncode,0)
        common=self.f.common(self.f.codex); (common/"agent-state/runtime-lock.json").write_text(json.dumps({"agent":"codex"}))
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)
        (common/"agent-state/runtime-lock.json").unlink(); state= json.loads((common/"agent-state/current-task.json").read_text())
        state["active_agent"]="codex"; (common/"agent-state/current-task.json").write_text(json.dumps(state))
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)

    def test_register_maintenance_transaction_failures_roll_back(self):
        for injection in ("AGENT_TEST_FAIL_REGISTRY_WRITE", "AGENT_TEST_FAIL_AUTH_MOVE", "AGENT_TEST_FAIL_AUDIT_WRITE"):
            with self.subTest(injection=injection):
                path, auth = self.f.maintenance_auth()
                before=(self.f.codex/"docs/agents/TASK_REGISTRY.json").read_bytes()
                result=self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path),env={injection:"1"})
                self.assertNotEqual(result.returncode,0); self.assertEqual((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_bytes(),before)
                self.assertTrue(path.exists())
                self.assertFalse((path.parent/"consumed"/f"{auth['authorization_id']}.json").exists())
                self.assertFalse((self.f.common(self.f.codex)/"agent-state/.mutex").exists())

    def test_register_maintenance_rejects_existing_stage_ticket_and_forbidden_diff(self):
        registry=json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())
        registry["stages"]["WF-SEC-04"]={"claimable":True,"tickets":[]}
        (self.f.codex/"docs/agents/TASK_REGISTRY.json").write_text(json.dumps(registry))
        proc(["git","add","--","docs/agents/TASK_REGISTRY.json"],self.f.codex)
        proc(["git","commit","-qm","existing stage"],self.f.codex)
        path, _ = self.f.maintenance_auth()
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)

        self.f.close(); self.f=Fixture()
        registry=json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())
        registry["stages"]["S1"]["tickets"].append({"id":"WF-TEST-99-01","status":"ready"})
        (self.f.codex/"docs/agents/TASK_REGISTRY.json").write_text(json.dumps(registry))
        proc(["git","add","--","docs/agents/TASK_REGISTRY.json"],self.f.codex)
        proc(["git","commit","-qm","existing ticket"],self.f.codex)
        path, _ = self.f.maintenance_auth(stage_id="WF-TEST-99", ticket_count=1)
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)

        self.f.close(); self.f=Fixture(); path, value=self.f.maintenance_auth()
        (self.f.codex/"src").mkdir(); (self.f.codex/"src/forbidden.txt").write_text("no\n")
        proc(["git","add","--","src/forbidden.txt"],self.f.codex); proc(["git","commit","-qm","forbidden"],self.f.codex)
        self.assertNotEqual(self.f.run(self.f.codex,"register-maintenance","--authorization-file",str(path)).returncode,0)

    def activate(self, path, ok=None, stage="BLOCKED"):
        return self.f.run(self.f.codex, "activate-product-stage", "--agent", "codex", "--stage", stage,
                          "--proposal", "docs/engineering/specs/blocked-registry-proposal.json",
                          "--authorization-file", str(path), ok=ok)

    def test_activate_product_stage_success_and_other_stages_untouched(self):
        path, auth = self.f.activation_auth()
        before_s1 = json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())["stages"]["S1"]
        self.activate(path, ok=True)
        registry = json.loads((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_text())
        self.assertEqual(registry["stages"]["S1"], before_s1)
        blocked = registry["stages"]["BLOCKED"]
        self.assertTrue(blocked["claimable"])
        self.assertEqual(blocked["spec"], "docs/engineering/specs/blocked-spec.md")
        self.assertEqual([t["id"] for t in blocked["tickets"]], ["BLOCKED-01", "BLOCKED-02"])
        self.assertEqual([t["status"] for t in blocked["tickets"]], ["ready", "ready"])
        self.assertFalse(path.exists())
        consumed = path.parent/"consumed"/f"{auth['authorization_id']}.json"
        self.assertTrue(json.loads(consumed.read_text())["consumed"])
        audit = self.f.common(self.f.codex)/"agent-state/activation-audits"/f"{auth['authorization_id']}.json"
        self.assertTrue(audit.exists())

    def test_activate_product_stage_rejects_replay(self):
        path, _ = self.f.activation_auth()
        self.activate(path, ok=True)
        self.assertNotEqual(self.activate(path).returncode, 0)

    def test_activate_product_stage_first_ticket_becomes_claimable(self):
        path, _ = self.f.activation_auth()
        self.activate(path, ok=True)
        self.f.run(self.f.codex, "claim", "--agent", "codex", "--stage", "BLOCKED", "--ticket", "BLOCKED-01", ok=True)

    def test_activate_product_stage_rejects_missing_stage(self):
        path, _ = self.f.activation_auth(overrides={"stage_id": "NO-SUCH-STAGE"})
        self.assertNotEqual(self.activate(path, stage="NO-SUCH-STAGE").returncode, 0)

    def test_activate_product_stage_rejects_already_claimable_stage(self):
        path, _ = self.f.activation_auth(overrides={"stage_id": "S1"},
                                          proposal_overrides={"stage": {"id": "S1", "title": "x",
                                                                         "external_reviewer": "ChatGPT",
                                                                         "claimable": True,
                                                                         "spec": "docs/engineering/specs/blocked-spec.md"}})
        self.assertNotEqual(self.activate(path, stage="S1").returncode, 0)

    def test_activate_product_stage_rejects_ticket_id_collision_with_other_stage(self):
        path, _ = self.f.activation_auth(proposal_overrides={"tickets": [
            {"id": "T1", "title": "Collides with S1's ticket", "status": "ready",
             "allowed_files": ["x"], "required_tests": [], "depends_on": []}]})
        self.assertNotEqual(self.activate(path).returncode, 0)

    def test_activate_product_stage_rejects_invalid_dependency(self):
        path, _ = self.f.activation_auth(proposal_overrides={"tickets": [
            {"id": "BLOCKED-01", "title": "First", "status": "ready",
             "allowed_files": ["x"], "required_tests": [], "depends_on": ["BLOCKED-99"]}]})
        self.assertNotEqual(self.activate(path).returncode, 0)

    def test_activate_product_stage_rejects_dependency_cycle(self):
        path, _ = self.f.activation_auth(proposal_overrides={"tickets": [
            {"id": "BLOCKED-01", "title": "First", "status": "ready",
             "allowed_files": ["x"], "required_tests": [], "depends_on": ["BLOCKED-02"]},
            {"id": "BLOCKED-02", "title": "Second", "status": "ready",
             "allowed_files": ["y"], "required_tests": [], "depends_on": ["BLOCKED-01"]}]})
        self.assertNotEqual(self.activate(path).returncode, 0)

    def test_activate_product_stage_rejects_authorization_mismatches(self):
        cases = [
            {"authorized_agent": "claude"}, {"authorized_branch": "agent/other"},
            {"project_id": "other"}, {"authorized_base_head": "0"*40},
            {"consumed": True}, {"single_use": False},
            {"authorization_type": "maintenance-bootstrap"},
            {"expires_at": "2000-01-01T00:00:00+00:00"},
            {"stage_id": "OTHER"}, {"activation_source": "docs/engineering/specs/other.json"},
            {"activation_source": "../escape.json"}, {"activation_source": "/etc/passwd"},
        ]
        for override in cases:
            with self.subTest(override=override):
                path, _ = self.f.activation_auth(overrides=override)
                self.assertNotEqual(self.activate(path).returncode, 0)
                path.unlink(missing_ok=True)

    def test_activate_product_stage_rejects_target_tampering_after_authorization(self):
        path, _ = self.f.activation_auth()
        proposal_path = self.f.codex/"docs/engineering/specs/blocked-registry-proposal.json"
        proposal = json.loads(proposal_path.read_text())
        proposal["activation_target"]["tickets"][0]["allowed_files"] = ["src/tampered.ts"]
        proposal_path.write_text(json.dumps(proposal))
        proc(["git","add","--","docs/engineering/specs/blocked-registry-proposal.json"],self.f.codex)
        proc(["git","commit","-qm","tamper"],self.f.codex)
        self.assertNotEqual(self.activate(path).returncode, 0)

    def test_activate_product_stage_rejects_malformed_activation_target(self):
        cases = [
            {"tickets": []},
            {"tickets": [{"id": "BLOCKED-01", "title": "x", "status": "ready", "allowed_files": [], "required_tests": []}]},
            {"tickets": [{"id": "WRONG-NS-01", "title": "x", "status": "ready", "allowed_files": ["a"], "required_tests": []}]},
            {"tickets": [{"id": "BLOCKED-01", "title": "x", "status": "ready", "allowed_files": ["a"], "required_tests": []},
                         {"id": "BLOCKED-01", "title": "y", "status": "ready", "allowed_files": ["b"], "required_tests": []}]},
            {"stage": {"id": "BLOCKED", "title": "x", "external_reviewer": "ChatGPT", "claimable": False,
                        "spec": "docs/engineering/specs/blocked-spec.md"}},
            {"stage": {"id": "BLOCKED", "title": "x", "external_reviewer": "ChatGPT", "claimable": True,
                        "spec": "does/not/exist.md"}},
            {"stage": {"id": "BLOCKED", "title": "x", "external_reviewer": "ChatGPT", "claimable": True,
                        "spec": "../escape.md"}},
        ]
        for override in cases:
            with self.subTest(override=override):
                path, _ = self.f.activation_auth(proposal_overrides=override)
                self.assertNotEqual(self.activate(path).returncode, 0)
                path.unlink(missing_ok=True)

    def test_activate_product_stage_rejects_dirty_tree_lock_and_active_state(self):
        path, _ = self.f.activation_auth()
        (self.f.codex/"work.txt").write_text("dirty\n")
        self.assertNotEqual(self.activate(path).returncode, 0)
        proc(["git","checkout","--","work.txt"],self.f.codex)
        common=self.f.common(self.f.codex); (common/"agent-state/runtime-lock.json").write_text(json.dumps({"agent":"codex"}))
        self.assertNotEqual(self.activate(path).returncode, 0)
        (common/"agent-state/runtime-lock.json").unlink()
        state = json.loads((common/"agent-state/current-task.json").read_text())
        state["active_agent"]="codex"; (common/"agent-state/current-task.json").write_text(json.dumps(state))
        self.assertNotEqual(self.activate(path).returncode, 0)

    def test_activate_product_stage_rejects_wrong_worktree(self):
        path, _ = self.f.activation_auth()
        self.assertNotEqual(self.f.run(self.f.repo, "activate-product-stage", "--agent", "codex", "--stage", "BLOCKED",
                                       "--proposal", "docs/engineering/specs/blocked-registry-proposal.json",
                                       "--authorization-file", str(path)).returncode, 0)

    def test_activate_product_stage_transaction_failures_roll_back(self):
        for injection in ("AGENT_TEST_FAIL_REGISTRY_WRITE", "AGENT_TEST_FAIL_AUTH_MOVE", "AGENT_TEST_FAIL_AUDIT_WRITE"):
            with self.subTest(injection=injection):
                path, auth = self.f.activation_auth()
                before=(self.f.codex/"docs/agents/TASK_REGISTRY.json").read_bytes()
                result=self.f.run(self.f.codex,"activate-product-stage","--agent","codex","--stage","BLOCKED",
                                  "--proposal","docs/engineering/specs/blocked-registry-proposal.json",
                                  "--authorization-file",str(path),env={injection:"1"})
                self.assertNotEqual(result.returncode,0)
                self.assertEqual((self.f.codex/"docs/agents/TASK_REGISTRY.json").read_bytes(),before)
                self.assertTrue(path.exists())
                self.assertFalse((path.parent/"consumed"/f"{auth['authorization_id']}.json").exists())
                self.assertFalse((self.f.common(self.f.codex)/"agent-state/.mutex").exists())
                self.f.close(); self.f=Fixture()


if __name__ == "__main__": unittest.main(verbosity=2)
