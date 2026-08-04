# IMPECCABLE_REVIEW_LOG.md

## CC-01 — Precision Datum Design System（2026-08-05）

### 使用的指令

依 `.claude/skills/impeccable/SKILL.md` 的 Setup 流程：

1. `node .claude/skills/impeccable/scripts/context.mjs --target
   src/pages/internal-preview/design-system.astro` — 載入 PRODUCT.md、
   DESIGN.md 與對應 Surface Brief。確認本專案為 Persuade 模式的 B2B
   Marketing Website（非 SaaS Dashboard），與任務指示「不得將網站改成
   SaaS Dashboard 或應用程式介面」一致；`context.mjs` 回傳
   `MANUAL_DETECTOR_REQUIRED`（本 Session 無自動 Design Hook）與
   `SUBAGENT_AUTHORIZATION`（此背景執行環境無 Subagent 能力，故以本輪
   Thread 內執行取代，於此揭露）。
2. `node .claude/skills/impeccable/scripts/detect.mjs --json <changed
   files>` — 對本階段實際修改／新增的檔案執行機械式反樣板偵測，涵蓋：
   `src/pages/internal-preview/design-system.astro`、六個
   `src/components/brand/*.astro`、`src/styles/tokens.css`、
   `global.css`、`utilities.css`、`src/components/ui/Button.astro`。
   未對全站所有既有檔案重跑（範圍為本階段修改內容，非全站掃描）。
3. 未執行 `shape`／`live`／`animate` 等完整互動式指令——本階段是
   Design System 建立而非新頁面設計，依 SKILL.md 路由規則屬於「一般設計
   工作」，以 `context.mjs` 提供的既有 DESIGN.md／PRODUCT.md 為依據直接
   審視，未觸發 `new-work.md` 的全新視覺世界決策流程（因為方向已由
   `forgeon_full_audit_and_redesign.md` 定案，非本階段重新決定）。

### 發現（`detect.mjs` 原始輸出，7 筆，全部 warning 等級）

| # | Antipattern | 檔案 | 判定 | 處理 |
|---|---|---|---|---|
| 1 | `em-dash-overuse`（26 個 em-dash） | `design-system.astro` | 誤判／不適用 | 全部出現在 HTML 註解（開發者文件說明），非使用者可見文案；CC-01 明確禁止本階段執行 ANTI-AIWRITING 全站文案重寫，且此偵測器本就設計給「內文」而非程式註解。不修改。 |
| 2 | `broken-image`（`<img>`） | `VisionLockFrame.astro:13` | 誤判 | 該行是 JSDoc 註解中提及「`<img>`/`<picture>`/`<svg>`」作為使用情境說明文字，並非實際渲染的 `<img>` 標籤（元件本身用 `<slot />` 接收內容，不自行輸出 `<img>`）。不修改。 |
| 3 | `side-tab`（左側粗色邊框） | `global.css:329` | 真實但既有、非本階段範圍 | `.demo-disclaimer { border-left: 3px solid ... }` 是初版建置就存在的既有規則，CC-01 本階段只重新指向 Token 值（`--color-accent-light` → `--color-copper-500`），未新增或改變這個邊框樣式本身。記錄於此，留待未來 CC 階段評估是否移除，不在 CC-01 動手改（CC-01 §12 明確要求：現有元件相容策略不可偷偷重做）。 |
| 4-6 | `overused-font`（Space Grotesk ×3） | `global.css:40/48/56` | 真實但為規格明文指定 | CC-01 規格 §5「目標字體」明確指定英文 Display 字體為 Space Grotesk，並在 `forgeon_full_audit_and_redesign.md` §19 設計系統中同樣寫明。這是任務書的直接要求，非本階段自由選字；不採用建議（不換字體），原因記錄於此。 |
| 7 | `layout-transition`（`transition: width`） | `utilities.css:189` | 真實缺陷，已修正 | `.datum-link__axis` 原本對 `width` 做 Transition（觸發 Layout 重排，非 Composite-only）。已改為固定 `width: 32px` + `transform: scaleX()`（GPU 合成、不觸發排版），視覺效果不變（軸線靜止時視覺寬度 20px、Hover 時延伸至 32px，符合規格 §9「Hover 時軸線延伸 8-16px」）。修正後 `箭頭` 偽元素加上反向 `scaleX` 補償，避免箭頭隨軸線縮放而變形。 |

### 採用的修改

- `src/styles/utilities.css` `.datum-link__axis`／`.datum-link__axis::after`：
  `width` Transition 改為 `transform: scaleX()` Transition（見上表 #7）。
  重新執行 `detect.mjs --json src/styles/utilities.css` 確認该檔案
  Finding 數量歸零。

### 未採用建議及原因

- 不移除 `.demo-disclaimer` 的側邊色條（#3）——不在本階段修改範圍內，
  且該規則不是 CC-01 新增的。
- 不更換 Space Grotesk（#4-6）——規格明文指定，若要更換需回到
  `docs/redesign/forgeon_full_audit_and_redesign.md` 層級重新決策，非
  CC-01 executor 可片面決定的字體選擇。
- 不清理 HTML 註解中的 em-dash／`<img>` 字樣（#1-2）——兩者皆為誤判
  （偵測器把開發文件註解當作使用者可見內容或真實標籤解析）。

### 是否影響 CC-02

不影響。上述 7 筆發現中唯一的真實修正（`.datum-link__axis` Transition
機制）是本階段新增的 Utility Class 內部實作細節，CC-02（Header／Hero
Design Spike）若使用 `.datum-link`，行為與視覺結果不變，只是效能更好。
其餘 6 筆為誤判或非本階段範圍，均不構成 CC-02 的前置阻塞。

---

本輪修正首次在有真實瀏覽器（Playwright + Chromium）的環境中執行 Impeccable
Critique / Audit / Polish，取代前一版僅能以程式碼審視完成的適應性作法（見
`DESIGN.md`「Adaptation Note」與 `docs/SKILL_USAGE_LOG.md` 第 3 節，該紀錄
保留不變，作為歷史過程紀錄）。本文件記錄本輪實際發現與修正。

## 方法

1. `pnpm build:noCheck` + `astro preview`，以 Playwright 對 production build
   實際截圖（`docs/screenshots/site-*.png`），涵蓋桌面 1440px、手機 390px、
   Mobile Nav 開啟狀態、RFQ 表單驗證錯誤狀態、RFQ 表單 Demo Mode 完成狀態。
2. 逐張人工審視截圖，比對 `DESIGN.md` 契約（Restrained 色彩策略、避免
   AI 樣板、卡片節奏、CTA 層級）。
3. 針對可疑區塊（例如按鈕文字消失）以 Playwright 局部截圖（`.screenshot()`
   on locator）放大確認，區分「真實渲染 Bug」與「fullPage 截圖時 sticky
   元素造成的擷取假象」（後者發生於 `site-rfq-form-*.png`：`fullPage: true`
   截圖時瀏覽器對 `position: sticky` Header 的合成方式會讓 Header 圖像
   在頁面中段重複出現一次，這是 Playwright fullPage 截圖已知行為，非
   實際渲染問題——已用一般 viewport 截圖交叉驗證確認）。
4. 同一輪也用 Playwright 端到端測試（`tests/e2e/`）與 axe-core 掃描做
   系統性覆蓋，三者交叉發現問題（見下方「發現與修正」）。

## 發現與修正（本輪新發現，非既有 spec 已列出項目）

### 1. Mobile Nav 背景未真正 inert（Critical，透過 Playwright 互動測試發現）

`Header.astro` 的 `.site-header { backdrop-filter: blur(8px); }`
會為子元素的 `position: fixed` 建立新的 containing block（CSS 規格行為，
等同 `transform`／`filter`／`contain`）。`#mobile-nav`（含遮罩與抽屜）
巢狀在 `<header>` 內，導致其 `position: fixed; inset: 0` 實際上是相對
Header 自己的 ~72px 高度框，而非整個 Viewport——選單「開啟」時，
Header 下方的頁面內容其實完全可見、可點擊、鍵盤與螢幕閱讀器皆可到達，
違反 §8「背景內容在選單開啟時不可被鍵盤或螢幕閱讀器誤操作」的要求。

**修正**：將 `#mobile-nav` 移出 `<header>`，改為其同層級的 Sibling，
使其不再受 Header 的 `backdrop-filter` Containing Block 影響。
驗證：`tests/e2e/mobile-nav.spec.ts`「background content is inert」測試
（點擊左上角座標確認不再命中背景內容並改為關閉選單）。

### 2. Footer Logo 英文字重在深色背景對比不足（Serious，axe-core 發現）

`Logo.astro` 的 `.logo__en` 色彩寫死 `var(--color-muted)`
（`#5b6470`，專為淺色背景設計），未依 `variant` prop 切換。Footer 使用
`variant="invert"`，深色背景（`#12181f`）下造成 2.97:1 對比，未達
WCAG AA 4.5:1，axe-core 標記為 `serious`，且因 Footer 全站共用，此問題
存在於「每一頁」。

**修正**：新增 `subtleColor` 變數，`variant="invert"` 時改用
`--color-invert-muted`（`#9aa3ad`，對比 6.99:1）。驗證：
`tests/e2e/axe.spec.ts` 全部 14 個頁面類型＋Mobile Nav 開啟狀態，
0 Critical／0 Serious。

### 3. CTABanner 次要按鈕文字在深色背景完全不可見（Serious，Impeccable 截圖審視發現）

`CTABanner.astro` 一律在 `--color-ink`（深色）背景上使用
`<Button variant="secondary">`，但 `.btn--secondary` 的文字色寫死
`var(--color-ink)`——文字色與背景色相同，視覺上按鈕看起來像「只有邊框
的空白方塊」，實際上文字完全不可讀。此問題出現在全站每一個內容頁下方
的 CTABanner（首頁除外，因首頁不使用 CTABanner 元件）。此問題純屬視覺
渲染缺陷，程式碼靜態審視無法發現，只有實際截圖比對才能看出「按鈕內
沒有文字」。

**修正**：新增 `Button` 的 `secondary-invert` Variant（文字
`--color-invert-text` 16.40:1、邊框 `--color-invert-muted` 6.99:1，
皆通過 WCAG AA），`CTABanner.astro` 改用此 Variant。同時修正時機順便
補上 CTABanner 兩顆按鈕的 `?intent=` Query Param 與 `data-source`
（spec P0.5 CTA 意圖要求，CTABanner 先前未涵蓋）。

## 中期審視（首頁、產業/解決方案總覽、產品詳細頁）

- 首頁：不對稱 Hero（非置中樣板）、6 項解決方案卡（非制式 3 張）、
  4 項核心能力、4 個產業卡、5 階段流程時間軸、4 項合作理由——資訊層級
  清楚，未見樣板感。
- 手機首頁（390px）：確認無橫向溢位、Header 精簡、卡片單欄堆疊、
  間距節奏維持。
- 產品詳細頁：Badge（Concept 資料標示）→型號→定位語句→描述→雙 CTA→
  特性→適用場景→規格表→選配→相容方案→CTABanner，資訊密度足夠，
  非 Wireframe 感；規格表使用水平線系統（工程圖紙慣例），非 SaaS
  斑馬紋表格，符合 `DESIGN.md` 承諾。
- 解決方案詳細頁（視覺定位自動化組裝，完整深度頁）：問題／解法並列
  雙欄開場、背景說明、適用情境、系統組成、4 步驟作業流程、優勢／
  適用產業雙欄、相容設備、開始前準備、相關產品卡、FAQ、CTABanner——
  資訊架構完整，是本站資訊密度最高的頁面型態，可作為其他方案頁的
  參考基準。

## 最終 Polish 結果

- 三項本輪新發現的問題（Mobile Nav inert、Footer Logo 對比、CTABanner
  按鈕消失）皆已修正並重新截圖確認。
- 未發現需要「推翻重建」的方向性問題——`DESIGN.md` 的視覺契約
  （深海軍藍＋暖白＋銅橘、避免 AI 樣板、卡片節奏、CTA 雙層次）在實際
  瀏覽器渲染下仍然成立，此輪修正屬於「執行層級的渲染/對比缺陷」，
  非「設計方向錯誤」。

## 已知限制

未使用 Impeccable 內建的 `concept-seed.mjs`／`serve-question.mjs` 互動
比稿流程（本次會話仍為背景執行，無法即時呈現視覺選項供使用者當場核可），
以人工截圖審視＋Playwright 自動化測試的組合取代，並如實記錄於本文件與
`docs/SKILL_USAGE_LOG.md`。
