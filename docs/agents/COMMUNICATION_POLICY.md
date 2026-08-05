# Communication Policy

This is the canonical, single source of truth for the human-readable
language policy shared by Claude Code and Codex in this repository. Other
files (`CLAUDE.md`, `AGENTS.md`, `docs/agents/DUAL_AGENT_PROTOCOL.md`,
`.claude/skills/dual-agent/SKILL.md`, templates) may only reference this
file — they must not copy or fork the policy text.

## 7.1 預設語言

Claude Code 與 Codex 對使用者的所有人類可讀回覆，預設使用：

```text
台灣繁體中文（zh-TW）
```

適用於：

- 聊天回覆
- 工作開始摘要
- 進度回報
- 完成報告
- 驗證報告
- Code Review
- Findings
- Checkpoint 敘述
- Handoff 敘述
- Recovery Report
- Stage Gate
- 錯誤說明
- 阻塞原因
- 下一步說明

## 7.2 保留原文

以下內容維持原文，不強制翻譯：

- 程式碼
- CLI 指令
- 檔案路徑
- Git Hash
- Branch 名稱
- Stage／Ticket ID
- 函式名稱
- Class 名稱
- 變數名稱
- API 名稱
- 套件名稱
- Framework 名稱
- JSON／YAML Key
- HTML Attribute
- CSS Selector
- 測試名稱
- 原始錯誤訊息
- 原始 Log
- 第三方工具輸出
- Repository 既有的英文 Commit Message 格式

原始工具輸出後，應提供繁體中文摘要與判定。

## 7.3 機器 Schema

Machine-readable Key 維持既有英文 Schema。

例如：

```text
summary
completed
remaining
known_failure
exact_next_step
risk
tests
changed_files
```

其人類可讀 Value 在不破壞 Parser 的情況下，應使用繁體中文。

## 7.4 台灣用語

優先使用台灣常用詞，例如：

```text
程式碼
伺服器
資料夾
網路
介面
元件
設定
專案
品質
效能
影片
回覆
```

預設不得：

- 使用簡體中文。
- 使用整段英文作為完成報告。
- 無必要地頻繁切換語言。
- 翻譯程式碼、路徑或識別字。
- 因翻譯改變技術含義。

## 7.5 語言例外

只有以下情況可使用其他語言：

1. 使用者在當次任務明確要求其他語言。
2. 來源原文必須保留以確保準確性。
3. 程式碼、Schema 或技術格式不可翻譯。
4. 第三方工具輸出無法控制。

單次例外結束後，恢復繁體中文預設。

## 7.6 優先順序

```text
系統與安全規則
→ 使用者當次明確要求
→ COMMUNICATION_POLICY.md
→ Agent 個別偏好
```

語言政策不得覆蓋安全規則。
