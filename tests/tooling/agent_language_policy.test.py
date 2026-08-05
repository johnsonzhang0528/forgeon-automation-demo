#!/usr/bin/env python3
"""Static checks for the Traditional Chinese communication policy and its
entry points. Verifies the policy and its references exist and are wired
up correctly; it does not and cannot assert that any generated reply is
actually in Chinese."""

import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
POLICY = ROOT / "docs/agents/COMMUNICATION_POLICY.md"
CLAUDE_MD = ROOT / "CLAUDE.md"
AGENTS_MD = ROOT / "AGENTS.md"
DUAL_AGENT_PROTOCOL = ROOT / "docs/agents/DUAL_AGENT_PROTOCOL.md"
DUAL_AGENT_SKILL = ROOT / ".claude/skills/dual-agent/SKILL.md"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class CommunicationPolicyTests(unittest.TestCase):
    def test_policy_file_exists(self):
        self.assertTrue(POLICY.is_file())

    def test_policy_declares_zh_tw(self):
        self.assertIn("zh-TW", read(POLICY))

    def test_policy_declares_traditional_chinese(self):
        self.assertIn("繁體中文", read(POLICY))

    def test_claude_md_references_policy(self):
        text = read(CLAUDE_MD)
        self.assertIn("docs/agents/COMMUNICATION_POLICY.md", text)
        self.assertIn("zh-TW", text)

    def test_agents_md_references_policy(self):
        text = read(AGENTS_MD)
        self.assertIn("docs/agents/COMMUNICATION_POLICY.md", text)
        self.assertIn("zh-TW", text)

    def test_dual_agent_protocol_references_policy(self):
        self.assertIn("docs/agents/COMMUNICATION_POLICY.md", read(DUAL_AGENT_PROTOCOL))

    def test_dual_agent_skill_references_policy(self):
        self.assertIn("docs/agents/COMMUNICATION_POLICY.md", read(DUAL_AGENT_SKILL))

    def test_policy_preserves_code_and_cli_originals(self):
        text = read(POLICY)
        for marker in ("保留原文", "程式碼", "CLI"):
            self.assertIn(marker, text)

    def test_policy_has_user_requested_language_exception(self):
        text = read(POLICY)
        self.assertIn("語言例外", text)
        self.assertIn("使用者", text)

    def test_policy_preserves_machine_schema_keys(self):
        text = read(POLICY)
        self.assertIn("機器 Schema", text)
        self.assertIn("Machine-readable Key", text)

    def test_no_src_changes(self):
        result = subprocess.run(
            ["git", "diff", "--name-only", "--", "src"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        )
        self.assertEqual(result.stdout.strip(), "")

    def test_no_public_changes(self):
        result = subprocess.run(
            ["git", "diff", "--name-only", "--", "public"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        )
        self.assertEqual(result.stdout.strip(), "")


if __name__ == "__main__":
    unittest.main(verbosity=2)
