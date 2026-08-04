# CC-01 ChatGPT Independent Review — Handoff

## 1. 專案名稱

鋒岳自動化 / FORGEON AUTOMATION — 頁構所市場驗證概念網站（虛構公司，Astro + TypeScript strict，雙語 zh-tw/en）。

## 2. 本階段目的

CC-01（Precision Datum System 設計系統建立）已完成，並經過一輪 Skill-based 治理補強與雙軸 Code Review。本 Bundle 供**使用者本地端 ChatGPT** 做獨立審查——不是 Codex（先前一份文件 `docs/engineering/handoffs/CC-01-codex-handoff.md` 誤植審查者為 Codex，該文件保留作為歷史紀錄，未刪改；本文件是給 ChatGPT 看的正式版本）。

## 3. CC-00 Baseline Commit

`eadf381` — `docs(demo-1): CC-00 baseline — naming audit, clean install verification`（tag: `baseline/pre-datum-redesign`）。

## 4. CC-01 原始完成 Commit

三個 commit，依序：
- `51bc472` — `feat(design-system): establish datum tokens and typography`
- `0152609` — `feat(brand): add precision datum visual primitives`
- `21dd6bc` — `docs(design): document datum system and audit results`

## 5. Post-hoc Review 相關 Commits

- `ebcb361` — `chore(agent): initialize project engineering skills`（治理設定：13 個工程 skill、CLAUDE.md、CONTEXT.md、docs/agents/、git guardrails hook）
- `49d3d90` — `fix(design-system): harden datum primitives`（兩處真實修正，見下方第 12 節）
- `d334c0d` — `docs(design): record cc01 posthoc verification`（審查文件、domain modeling、research、spec、ticket、handoff）

## 6. Review Bundle Tooling Commit

`1ad0cdf` — `chore(tooling): add chatgpt review bundle workflow`（本 Bundle 的產生工具本身）。

## 7. 目前 HEAD

見本 Bundle `metadata/head.txt`（本文件寫成時為 `1ad0cdf`，Bundle 建立時會重新記錄實際 HEAD，若這輪有再新增文件 commit，兩者可能不同，以 `metadata/head.txt` 為準）。

## 8. 主要修改檔案

CC-01 三個 commit 觸及：`src/styles/{tokens,global,utilities}.css`、`src/components/brand/*.astro`（6 個新檔）、`src/pages/internal-preview/design-system.astro`（新）、`src/layouts/BaseLayout.astro`、`public/fonts/**`（新，自託管字型）、`DESIGN.md`、`docs/DESIGN_SYSTEM.md`、`docs/ASSET_LICENSES.md`、`docs/CONTRAST_AUDIT.md`。Post-hoc 修正觸及：`src/components/brand/AssemblySpine.astro`、`src/components/brand/DatumOrigin.astro`（各一處，見第 12 節）。完整清單見 Bundle 內 `metadata/changed-files.txt` 與 `diff/changes.patch`。

## 9. Design System 內容

Precision Datum System／製程座標系——把定位／檢測／組裝的工程概念轉譯成座標系視覺語言。色彩：Ink 950/800、Paper 50/100、Steel 700/600/500/200、Copper 700/600/500、Signal-green、Error、Focus（完整數值與對比見 `docs/CONTRAST_AUDIT.md`）。字體：Noto Sans TC + Space Grotesk + IBM Plex Mono，自託管 WOFF2（見第 10 節）。Container/Grid：12/8/4 欄，`--container-{reading,content,wide}`。完整規則見 `docs/DESIGN_SYSTEM.md` 與 `DESIGN.md`。

## 10. 六個 Brand Primitive

`src/components/brand/`：
1. `DatumOrigin.astro` — 非對稱十字基準點（38%/62% 臂長，刻意不對稱以避免像準心），只有原點帶 Copper。
2. `ToleranceBand.astro` — 雙邊界線 + 半透明可接受區間，非填充式進度條語意。
3. `VisionLockFrame.astro` — 四角 L 形定位框（機器視覺慣例），一次性 lock-on 動畫，非循環掃描。
4. `AssemblySpine.astro` — 主軸 + 3-6 個模組節點（未連接/對齊/已連接三態）。
5. `ProcessStamp.astro` — 矩形晶片流程狀態標記，永久顯示「流程狀態 · PROCESS STATUS」文字避免被誤認正式認證。
6. `CutawayWindow.astro` — `clip-path: polygon()` 非矩形媒體切窗，無圖時有可讀 placeholder。

六個元件的完整 API、Accessibility、Reduced Motion、Fallback 細節見 `docs/engineering/reviews/CC-01-codebase-design-review.md`。

## 11. Post-hoc Review 發現

雙軸審查（Standards + Spec，分開報告不合併分數）主要發現：
- 六個 Brand Primitive**全部硬編碼繁體中文字串**，無 `locale`/`messages` prop（見第 13 節，已延後決策，非本輪修正）。
- `AssemblySpine` 靜態模式（`interactive=false`，預設值）誤輸出真正的 `<button disabled>`——語意錯誤，本輪已修正。
- `DatumOrigin` 有一個宣告後從未被讀取的死碼 `Math.random()` UID——本輪已修正（刪除）。
- `VisionLockFrame`/`AssemblySpine` 的其他 UID 使用是真的有功能性用途（inline script 定位用），評估後判定不需修正，避免過度工程化。
- Git Hygiene 良好（三個原子 commit），無 `as any`，無 Speculative Generality，無過度註解。

完整報告：`docs/engineering/reviews/CC-01-two-axis-review.md`、`docs/engineering/reviews/CC-01-codebase-design-review.md`。

## 12. 已修正問題

Commit `49d3d90`，兩處：
1. `AssemblySpine.astro` — 靜態模式改用 `<span>`；互動模式的真 `<button>` 與點擊循環邏輯不變。經 Playwright 現場驗證：互動實例仍為 `<button>`，點擊循環正常（connected→unconnected）；靜態實例確認改為 `<span>`。**兩者視覺輸出完全相同**（同一個 `.assembly-spine__marker` class，同樣的內部 dot span），純語意修正，無視覺差異——這是本輪未重新截圖的理由，見第 16 節。
2. `DatumOrigin.astro` — 刪除死碼 UID 與對應的 `define:vars`，無視覺或行為改變。

對應 Ticket：`docs/engineering/tickets/CC-01-posthoc/01-static-semantics-assembly-spine.md`、`02-datumorigin-dead-uid.md`。

## 13. 延後決策

七項指定結論中，兩項明確延後、一項需使用者決策：
- **Locale／Messages API**（延後至 CC-02）——目前六個元件零實際多語系使用場景，等 CC-02 把 DatumOrigin 放進 Header 時再依真實需求設計 API，而非預先臆測介面。
- **`/en/` 首頁 360px 溢位**（延後至 CC-02）——見第 15 節，CC-02 是第一個合法能動首頁結構的階段。
- **Primary Copper 對比餘裕拉高到 5:1**（需使用者決策）——目前 4.61:1 已通過 WCAG AA 但餘裕薄，調整會牽動全站主要 CTA 色，屬品牌視覺取捨，非程式缺陷，故不由 Agent 片面決定。

完整七項結論見 `docs/engineering/reviews/CC-01-seven-dispositions.md`。

## 14. 實際測試結果

完整數字見 `docs/engineering/reviews/CC-01-chatgpt-test-summary.md`（本輪新建，只整理已實際執行過的結果）。摘要：`pnpm check` 0 errors；`pnpm build` 51 頁 0 errors；H1 檢查 49/49；連結檢查 2049/2049 無失效；hreflang 141/141 無失效；**E2E 197 passed / 1 failed**（唯一失敗見第 15 節）；axe 15/15，0 Critical/0 Serious。

## 15. 唯一已知失敗

```
URL: /en/
Viewport: 360×800
scrollWidth: 377px
clientWidth: 360px
溢位: 17px
```

證據鏈：此問題在 CC-00 baseline（commit `eadf381`，尚未有任何 CC-01 程式碼）即已存在——Post-hoc review 執行過 `git stash` 隔離測試，將 CC-01 全部變更暫時移除、重新 build，同一 360px 溢位仍以完全相同數值重現（`scrollWidth: 377` / `clientWidth: 360`），證明非 CC-01 或 post-hoc 修正引入的回歸。屬首頁內容結構問題（不是 Design System token 問題），CC-01 明確禁止修改首頁結構，故延後至 CC-02（第一個合法可以動首頁的階段）。**本輪同樣不修正此問題**，如實保留為已知失敗，未寫成全綠。

## 16. 截圖位置

`docs/screenshots/`：
- `cc01-design-system-desktop.png`（1440×900）
- `cc01-design-system-tablet.png`（768×1024）
- `cc01-design-system-mobile.png`（390×844）
- `cc01-compat-homepage-desktop.png`（1440×900，首頁與新 token 相容性驗證）
- `cc01-compat-mobile-nav-open.png`（390×844，手機導覽開啟狀態）

**本輪未重新截圖**：確認過 post-hoc 修正commit（`49d3d90`）只改變 DOM 元素語意（`<button>`→`<span>`、刪除未使用的 CSS 變數綁定），未改變任何可見樣式或版面——已直接比對 diff 確認兩處改動前後使用同一 CSS class、同樣的內部結構，純語意修正。現有截圖仍準確反映目前 HEAD 的實際畫面。

## 17. 重要文件位置

- 設計決策：`docs/DATUM_DECISION_LOG.md`、`DESIGN.md`、`docs/DESIGN_SYSTEM.md`
- 對比稽核：`docs/CONTRAST_AUDIT.md`
- Domain 詞彙：`CONTEXT.md`（Precision Datum System 詞彙表章節）
- Verification Spec：`docs/engineering/specs/CC-01-verification-spec.md`
- Codebase Design Review：`docs/engineering/reviews/CC-01-codebase-design-review.md`
- 雙軸 Code Review：`docs/engineering/reviews/CC-01-two-axis-review.md`
- 七項結論：`docs/engineering/reviews/CC-01-seven-dispositions.md`
- Post-hoc 修正紀錄：`docs/engineering/reviews/CC-01-posthoc-fix-review.md`
- Font/CSS 相容性研究：`docs/engineering/research/CC-01-font-and-css-support.md`
- 測試摘要：`docs/engineering/reviews/CC-01-chatgpt-test-summary.md`
- Review Bundle 使用說明：`docs/engineering/REVIEW_BUNDLE_GUIDE.md`

## 18. ChatGPT 應優先審查的項目

### A. 設計策略
Precision Datum System 是否真正具有鋒岳專屬性，還是通用科技裝飾套皮；六個 Brand Primitive 的視覺語言是否經得起放大檢視；色彩/字體/Grid/Spacing 是否足以支撐後續高品質重構；CC-01 是否只是增加文件、還是真的改變了實際渲染的設計系統（建議直接看 `internal-preview/design-system.astro` 的原始碼與截圖對照）。

### B. Brand Primitive
六個元件逐一檢查 API 合理性、Static/Interactive 語意正確性、ARIA 語意、Reduced Motion 完整性、是否過度抽象、是否真的可用於中英文正式頁面；並評估「Locale API 延後至 CC-02」這個判斷是否合理，還是應該提前處理。

### C. 字體
自託管與載入是否為真（不是宣稱）；字重選擇是否合理；首屏負擔評估；授權完整性；中英文字體搭配的實際觀感是否成熟。

### D. 色彩與對比
24/24 對比組合的計算是否可信；Primary Copper 4.61:1 的餘裕是否過低，是否應在 CC-02 使用更深的 Token；Copper 使用比例是否被濫用。

### E. 技術品質
Astro/TypeScript 架構；CSS Token 設計；CSS Scope 是否洩漏；Sitemap/Noindex 機制；Internal Preview Route 是否真的被排除在外部可見範圍；Accessibility；Build 可重現性；測試證據鏈是否可信（不是只看結論，要看是否有實際指令輸出佐證）。

### F. 已知失敗
`/en/` 360px 溢位——第 15 節的證據鏈（`git stash` A/B 對照）是否足以證明非 CC-01 回歸；延後至 CC-02 是否合理。

### G. Review Bundle Tooling
Bundle 本身的完整性、安全性、上下文是否足夠；是否確實排除 Secret/字型/node_modules/dist/.git；此工具日後取代完整專案壓縮檔的可行性評估。

## 19. 本輪禁止進入 CC-02 的說明

本輪（CC-01 ChatGPT Review Bundle 準備）範圍僅止於整理審查資料——不修改 Header、Hero、首頁、Design System，不修正已知的 `/en/` 360px 問題，不使用 Prototype 或 Higgsfield，不重新執行整套 CC-01。ChatGPT 審查完成後，若有需要修正的項目，應在**下一輪**（可能是 CC-01 的進一步小範圍修正，或正式進入 CC-02）處理，不在本次 Bundle 準備範圍內自動執行。

---

## Suggested skills for the next session

- `/code-review` — if ChatGPT's review surfaces concrete findings that need re-verification against the actual diff.
- `/to-tickets` — only if ChatGPT finds genuine new P0/P1 issues (same discipline as the post-hoc round: don't manufacture tickets for stylistic preferences).
- `/domain-modeling` — if ChatGPT's review of the Precision Datum vocabulary suggests a term is missing or misdefined in `CONTEXT.md`.
