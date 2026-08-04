# CODEX_REVIEW_HANDOFF.md

交付對象：Codex（獨立審查）。本文件是本輪全面 QA／缺陷修復／內容深化
修正 Pass 的唯一權威入口——若其他文件與本文件有數字或結論衝突，以本文件
為準（其他文件可能反映修正過程中某個中間狀態）。

---

## 1. 最終 Commit Hash

修正前基準：`cb23949`（`feat(demo-1): initial FORGEON AUTOMATION bilingual B2B site build`）

本輪修正提交序列（`side_project/頁構所/demo-1/` 範圍內，最新在最上）：

```
afb6a17 docs(demo-1): update all delivery docs with real remediation-pass results
d1977c6 feat(demo-1): P1.4 decision content — fit checks, buyer paths, comparison table, Concept Scenario
5cd1d8a fix(demo-1): Impeccable browser review finds and fixes CTABanner invisible text
42eba14 test(demo-1): real Lighthouse runs on all 5 required pages
edcb90e fix(demo-1): real browser QA finds 2 more bugs + full Playwright/axe suite
2d15f58 feat(demo-1): fonts, analytics events, link/locale-route check scripts
3e00f4c feat(demo-1): P0.6 real 6-page AXM-400 datasheet PDF + Playwright/axe deps
7539ae1 feat(demo-1): P0.5 RFQ form overhaul — copy, privacy pages, a11y, CTA intent
1a2ba51 feat(demo-1): P0.4 Demo Mode indexing gate + Product schema
0b9e416 fix(demo-1): P0 mobile header overflow + missing H1 + contrast
b4cc569 docs(demo-1): add REMEDIATION_PLAN.md cataloguing P0/P1/SEO/QA fix pass
```

**最終 Commit（本文件撰寫時）**：`afb6a17`。若後續有額外收尾 Commit
（例如本文件自身的 Commit），以 `git log --oneline -- "side_project/頁構所/demo-1/"`
的最新一筆為準。

## 2. 安裝與建置指令（已於本輪實際執行並驗證）

```bash
cd side_project/頁構所/demo-1

# 乾淨安裝（本輪已實測：刪除 node_modules/dist/.astro 後重新安裝成功）
rm -rf node_modules dist .astro
npx --yes pnpm install

# TypeScript／Astro 型別檢查
npx --yes pnpm run check
# 結果：0 errors, 0 warnings, 9 hints（is:inline 資訊性提示，非錯誤）

# Production Build
npx --yes pnpm run build:noCheck
# 結果：50 個頁面成功產生

# 本機預覽（測試與 Lighthouse 皆對此伺服器執行）
npx astro preview --port 4321
```

## 3. 測試指令與真實結果

```bash
# 建置後靜態檢查（皆已於乾淨安裝後重新驗證）
node scripts/check-h1.mjs
# → H1 check: 50 HTML files scanned, 2 excluded (redirect pages), 48 pass, 0 fail.

node scripts/check-links.mjs
# → Link check: 50 HTML files scanned, 1951 internal links checked, 0 broken.

node scripts/check-locale-routes.mjs
# → Insights entrySlug parity: 2 zh-tw slugs, 2 en slugs. OK.
# → hreflang target check: 141 hreflang links checked across 50 pages, 0 broken.

# Playwright 端到端測試（需先 build:noCheck，會自動啟動/使用 preview server）
npx playwright test --reporter=list
# → 198 passed (0 failed)

# axe-core 無障礙掃描（涵蓋於上方 198 個測試中，也可單獨執行）
npx playwright test tests/e2e/axe.spec.ts --reporter=list
# → 15 passed — 0 Critical, 0 Serious violations across all 14 page types + open mobile nav

# PDF 規格書驗證
pdfinfo public/documents/forgeon-axm-400-datasheet.pdf
# → Pages: 6, PDF version: 1.4, Encrypted: no
pdftotext public/documents/forgeon-axm-400-datasheet.pdf - | head -20
# → 確認中英文文字皆可正常擷取（真實可選取文字，非點陣圖）
```

## 4. Lighthouse 指令與真實分數

```bash
export CHROME_PATH=/home/ubuntu/.cache/ms-playwright/chromium-1234/chrome-linux/chrome
npx astro preview --port 4321 &
npx lighthouse http://localhost:4321/zh-tw/ \
  --output=json,html --output-path=docs/lighthouse/zh-home-desktop \
  --chrome-flags="--headless --no-sandbox" --preset=desktop --quiet
```

| 頁面 | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| 中文首頁（Desktop） | 100 | 100 | 100 | 66 |
| 中文首頁（Mobile） | 100 | 100 | 100 | 66 |
| 英文首頁（Mobile） | 100 | 100 | 100 | 66 |
| 產品詳細頁（AXM-400） | 100 | 100 | 100 | 66 |
| 聯絡頁（RFQ 表單） | 100 | 100 | 100 | 66 |

**SEO 66 分診斷**：五頁的唯一失分稽核項目皆是 `is-crawlable`（"Page is
blocked from indexing"）——這是 Demo Mode 刻意輸出 `noindex,nofollow`
造成的**預期結果**，不是缺陷。驗證方式：以
`PUBLIC_DEMO_MODE=false PUBLIC_ALLOW_INDEXING=true` 重新建置同一頁面
（中文首頁）並重跑 Lighthouse，SEO 分數恢復 **100 分，0 個失敗稽核項**。
完整 JSON／HTML 報告存於 `docs/lighthouse/`。

## 5. 修正項目總表

### P0（全部完成）

| # | 項目 | 驗收方法 | 結果 |
|---|---|---|---|
| P0.1 | 手機 Header Scoped CSS Bug（含另外發現的 ProductCard／IndustryIcon 同類問題） | Playwright `scrollWidth<=clientWidth` @ 7 Viewport × 14 頁面類型 | 104/104 通過 |
| P0.2 | 缺少 H1（12 頁） | `scripts/check-h1.mjs` | 48/48 內容頁恰有 1 個 H1 |
| P0.3 | 色彩對比未達 WCAG AA | WCAG 公式計算，`docs/CONTRAST_AUDIT.md` | 全部 Token Pair 達標（4.5:1 一般文字／3:1 UI 邊界） |
| P0.4 | Demo 索引安全機制不存在 | Playwright 驗證 `noindex`／`robots.txt`／徽章；Lighthouse 驗證切換 Production Mode | 全部通過，Production Mode SEO 恢復 100 |
| P0.5 | RFQ 表單（承諾矛盾／無隱私權連結／附件 Bug／aria-invalid／CTA intent） | Playwright 表單全欄位驗證測試 | 34/34（rfq-form.spec.ts）通過 |
| P0.6 | PDF Placeholder | `pdfinfo`／`pdftotext` | 6 頁、PDF 1.4、文字可選取 |

### 真實瀏覽器 QA 額外發現（初版 Remediation Plan 未列出）

1. Mobile Nav 背景非真正 Inert（`backdrop-filter` Containing Block 問題）——已修正
2. Footer Logo 對比 2.97:1（axe Serious）——已修正為 6.99:1
3. CTABanner 次要按鈕文字不可見（文字色＝背景色）——已修正

### P1／SEO／Analytics（全部完成）

- 字體決策：方案 B（系統字體堆疊），理由見 `docs/REMEDIATION_PLAN.md`
- Higgsfield 素材計畫已裁切至第一輪核准上限（最多 13 張），**本次會話
  未執行任何生成呼叫**
- 首頁／產品／方案決策型內容（適合／不適合、雙路徑、比較表、
  Concept Scenario）已完成，`anti-ai-writing` 二輪審查完成
- Product Schema 新增（Demo Mode 條件輸出，無 Offer／AggregateRating）
- Analytics 事件表完整記錄於 `docs/ANALYTICS_EVENT_SPEC.md`
  （`product_view`／`solution_view`／`contact_click` 由未觸發修正為
  真正觸發；`PUBLIC_GA4_ID` 移除死配置）
- Locale Route Map／hreflang 驗證：`scripts/check-locale-routes.mjs`，
  141 個連結 0 個失效

## 6. 未修正項目 / 已知限制

1. **Higgsfield 付費素材生成**：計畫但未執行——需要使用者本人的
   Higgsfield 帳號憑證，本沙盒背景執行階段無法完成
   `higgsfield auth login`。詳細計畫見 `docs/HIGGSFIELD_ASSET_PLAN.md`。
2. **真實螢幕閱讀器人工測試**（NVDA／VoiceOver）：axe-core 自動化掃描
   （0 Critical／0 Serious）與 Playwright 鍵盤自動化測試提供了強驗證，
   但無法完全取代真人操作體驗。
3. **真實跨瀏覽器渲染比對**（Firefox／Safari／Edge）：本輪測試僅涵蓋
   Chromium；未實測其他引擎對 `color-mix()` 等較新 CSS 特性的支援情況。
4. **字體方案 B（系統字體）而非方案 A（真實 Web Font）**：因沙盒環境
   無網路存取，無法下載並驗證字體檔案授權。

## 7. 螢幕截圖路徑

- `docs/screenshots/site-*.png`（11 張）：首頁桌面／手機、產品詳細頁
  桌面／手機、方案詳細頁、聯絡表單桌面／手機、Mobile Nav 開啟狀態、
  RFQ 表單驗證錯誤／Demo 完成狀態。
- `docs/screenshots/datasheet-page-{1..6}.png`：AXM-400 PDF 規格書
  六頁截圖。

## 8. 測試報告路徑

- `docs/lighthouse/*.report.json` 與 `*.report.html`（5 個必要頁面）
- `docs/IMPECCABLE_REVIEW_LOG.md`：真實瀏覽器 Impeccable 審查紀錄
- `docs/CONTRAST_AUDIT.md`：色彩對比計算過程與數值
- `docs/ANALYTICS_EVENT_SPEC.md`：分析事件表
- `docs/COPY_REVIEW_LOG.md`：anti-ai-writing 兩輪審查紀錄
- Playwright 測試碼：`tests/e2e/*.spec.ts`（198 個測試，可用
  `npx playwright test --reporter=html` 產生互動式報告至
  `playwright-report/`，該目錄已加入 `.gitignore` 不隨 Commit 提交）

## 9. Codex 應優先重新檢查的項目

依風險與變更幅度排序：

1. **P0.1 的架構修正是否有遺漏個案**：本輪已用 `grep` 全面掃描
   `src/pages`／`src/layouts` 確認無其他父元件對子元件 Class 的
   Scoped CSS 穿透問題，但建議 Codex 獨立重新掃描一次
   （`grep -rn '<[A-Z][A-Za-z]*[^>]*\bclass="[^"]*"' src/pages src/layouts`）
   確認結論一致。
2. **RFQ 表單附件欄位移除的決策**（選項 B）：這是本輪唯一一項「移除
   既有 UI 功能」而非「修正」的決策，建議 Codex 檢查
   `docs/REMEDIATION_PLAN.md` 的理由陳述是否站得住腳，以及使用者是否
   認同此決策方向（另見第 10 節待使用者決定事項）。
3. **對比計算的獨立覆核**：`docs/CONTRAST_AUDIT.md` 的 WCAG 公式計算
   結果建議用第三方工具（例如 WebAIM Contrast Checker）獨立覆核至少
   3–5 組數值，確認計算無誤。
4. **Demo Mode 預設值的安全性**：`isDemoMode = import.meta.env.PUBLIC_DEMO_MODE
   !== 'false'` 的邏輯（未設定時預設為 `true`）是否真的無法被意外繞過，
   建議 Codex 檢查是否有任何程式碼路徑可能讓此值在未預期情況下變成
   `false`。
5. **Higgsfield 素材計畫的張數上限是否確實符合本輪指令要求**（2–3／
   1–2×3／最多 4，見 `docs/HIGGSFIELD_ASSET_PLAN.md`）。
6. **測試套件本身的覆蓋率是否有邏輯漏洞**：例如 `axe.spec.ts` 是否應該
   涵蓋更多互動狀態（目前僅涵蓋 Mobile Nav 開啟狀態，未涵蓋 RFQ 表單
   顯示錯誤狀態時的 axe 掃描）。

---

**誠實聲明**：本文件所有數字皆為本次會話實際執行對應指令後的真實輸出，
非估算或推測。若任何數字與程式碼實際行為不符，請以重新執行本文件第
2–4 節指令的結果為準。
