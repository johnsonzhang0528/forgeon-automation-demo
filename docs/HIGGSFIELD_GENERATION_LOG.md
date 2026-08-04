# HIGGSFIELD_GENERATION_LOG.md

## 目前狀態：無生成紀錄

本次專案執行階段**未呼叫任何 Higgsfield 生成 API**，因此本文件目前沒有
任何實際生成紀錄可填寫。原因與完整規劃請見：

- `docs/HIGGSFIELD_ASSET_PLAN.md` — 完整素材計畫、Prompt 建議、預估數量
- `docs/SKILL_USAGE_LOG.md` 第 4 節 — 未執行原因（需要使用者 Higgsfield
  帳號授權，本沙盒環境不可用）

全站目前使用的視覺素材均為原創 SVG／CSS，其來源與授權狀態記錄於
`docs/ASSET_LICENSES.md`，而非本文件。

---

## 未來生成後之紀錄格式（保留供使用者填寫）

當使用者在自己已登入的 Higgsfield 帳號環境完成任一項生成後，
請依下列格式逐筆記錄：

```markdown
### [素材名稱]

- **日期**：YYYY-MM-DD
- **Skill**：higgsfield-generate / higgsfield-brandkit / higgsfield-product-photoshoot
- **模型**：（實際使用的生成模型名稱）
- **Prompt**：（實際送出的完整 Prompt 文字）
- **參考圖**：（若有上傳參考圖，記錄路徑或說明；若無則寫「無」）
- **輸出檔**：（實際輸出檔案路徑，建議存於 public/images/generated/）
- **使用頁面**：（實際套用的頁面路徑）
- **人工修改**：（是否經過裁切、調色、合成等後製，說明修改內容）
- **Demo 標示**：（頁面上是否已加上「概念示意圖」等標示，Y/N）
- **生成成本**：（實際消耗的額度或費用，若已知）
- **授權檢查狀態**：（已確認 Higgsfield 服務條款允許商業使用 / 待確認 / 其他）
```

**重要提醒**：Skill Repository（`.claude/skills/higgsfield-*`）本身的程式碼
授權（如 Apache 2.0）**不等於**該 Skill 生成輸出內容的商業使用授權，兩者
須分別確認，不得混淆（依指令 §15.6 要求）。
