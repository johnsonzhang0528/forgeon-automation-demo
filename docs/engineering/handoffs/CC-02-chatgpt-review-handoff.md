# CC-02 ChatGPT Independent Review — Handoff

## 1. 專案名稱

鋒岳自動化 / FORGEON AUTOMATION — 頁構所市場驗證概念網站（虛構公司，
Astro + TypeScript strict，雙語 zh-tw/en）。

## 2. 本階段目的

CC-01 已由 ChatGPT 獨立審查，最終判定 **PASS WITH REQUIRED PRE-CC02
FIXES** — CC-01 本身不需要重做，但 ChatGPT 在上一份 Bundle 中發現 Review
Bundle 工具本身的六項真實缺陷（詳見第 3 節），必須先修正才能信任本輪
（乃至未來任何一輪）的 Bundle。CC-02 分兩部分：Part 1（CC-02-00 至
CC-02-04）修正工具與已知缺陷；Part 2 建立三套隔離的 Header／Hero Design
Spike Prototype，供本輪外部審查者——**使用者本地端 ChatGPT**（非
Codex）——審查後決定最終方向。本輪結束時停止，不自行選擇最終 Hero、不
整合任何 Prototype 進正式首頁、不進入 CC-03。

## 3. Base 與 Head

- **CC02_BASE**：`1513643d84bdd1aff39f896490fbea5d325e731a`（上一輪工具
  修正 `fix(tooling): match review docs by CC-stage, exclude
  .claude/skills from source/`）。
- **HEAD（本文件寫成時）**：`72ad067d2b6517c156bfb69d74c811cc9852daf7`。
  Bundle 建立時會重新記錄實際 HEAD，以 Bundle 內
  `metadata/head.txt` 為準。

## 4. Tooling 修正（CC-02-00，Hard Gate，已通過）

ChatGPT 上一輪實際審查發現的六項問題與對應修正：

1. `metadata/status.txt` 收入父層 Repo 其他專案狀態 → 改名
   `metadata/project-status.txt`，`git status --short -- .` 專案範圍限定
   （並修正一個過程中發現的真實 Bug：`git status` 輸出路徑本身已是
   cwd-relative，套用 `git diff` 用的 prefix-stripping 邏輯反而會把它
   清空——已修正）。
2. Bundle 未收入 `scripts/create-review-bundle.sh` 本身 → `source/`
   現在明確保證腳本自身與 `package.json` 有變更時一定被收入。
3. `changes.patch` 收入二進位截圖（約 4.2MB）→ 新增
   `docs/screenshots/*` 排除規則。
4. Patch 路徑含完整大型 Repo 前綴 → `git diff` 新增 `--relative`。
5. ChatGPT Bundle 不應收入歷史 Codex Handoff → Handoff 選擇邏輯改為優先
   比對目前階段前綴且排除 `*codex*`，僅在真的找不到時才退回最新檔案。
6. `changed-files.txt` 含大量被排除的 Skill 檔名 → 該清單本身現在也套用
   `EXCLUDE_GLOBS` 過濾，被過濾者改記錄於新增的
   `metadata/excluded-files.txt`。

## 5. Tooling Test（CC-02-00）

新增 `tests/tooling/review-bundle.test.sh`，涵蓋 spec §4.9 全部 12 項
要求（父層 Repo 隔離、中文路徑、空白路徑、腳本自我收錄、Patch 不含截圖／
字型／Skill、Source 含 `.sh` 與 Dotfile、Windows 可解壓縮、Secret Scan
不自我觸發、真實 Secret 會擋下生成）。**20/20 斷言通過**（多項要求各有
多個斷言）。本輪最後於全部 Commit 完成後重新執行一次，確認乾淨
（20/20，見第 18 節）。

## 6. Overflow 根因與修正（CC-02-01）

已知問題：`/en/` 360×800，`scrollWidth: 377px` / `clientWidth: 360px`，
溢位 17px。

**根因**（Playwright `getBoundingClientRect()` 實測找出，非猜測）：
`CTABanner.astro` 的 `.cta-banner`（深色卡片）套用自己的
`margin-inline`，同時其內層 `.cta-banner__inner`（`.container` class）
又套用一次 `padding-inline`——兩者用同一個 Token，在 360px 下疊加成
64px×2 的內縮，只剩 232px 可用寬度，加上 Button 全站的
`white-space: nowrap`，導致「Request Technical Advice」按鈕溢位整整
17px。**與 Hero 完全無關**——確認 `git diff --stat` 顯示
`src/pages/{zh-tw,en}/index.astro` 在本輪 Diff 中完全未被觸及。

**修正**：`.cta-banner` 外層 margin 改為隨斷點漸進
（`--page-gutter-{mobile,tablet,desktop}`），並讓
`.cta-banner__actions` 內的按鈕文字在極窄寬度下允許換行——兩處修正皆
限定在 `CTABanner.astro` 檔案內。

**驗證**：360px 溢位 0px（原 17px）；56/56 人工掃描（360/390/768/1024/
1280/1440/1920 × zh-tw/en × 8 頁型）全數乾淨；完整 Playwright 套件
201→221（本輪新增 CC-02 Prototype 測試後）全數通過（原本已知的唯一失敗
現已修正）；axe 15/15，0 Critical/0 Serious。

## 7. Brand Primitive 語系與語意（CC-02-02）

只修改三個 Prototype 實際使用的元件（非全部六個，依 CC-01 post-hoc
review 的既定判斷：延後至真實需求出現時再設計介面）：

- **DatumOrigin**：新增 `ariaLabel?: string`，`decorative=true` 時忽略；
  `decorative=false` 時未提供會有 Dev-only Console 警告。可見座標
  `label` 與 Accessible Name 完全分離。
- **VisionLockFrame**：新增可選 `statusLabels?: {locking, locked}`，該
  Span 本身即為 `aria-hidden`（純裝飾），此為顯示文字覆寫、非
  Accessibility 修正。
- **AssemblySpine**：靜態模式 Marker 改為 `aria-hidden="true"`（原本是
  `<span aria-label>`，並非所有螢幕閱讀器都可靠公開），語意改由已可見的
  Label ＋ State Tag 文字提供。互動模式真 `<button>` 保留完整
  `aria-label`，並改讀取同一個由 `define:vars` 注入的 `stateLabels`
  字典（原本 Inline Script 內還有第二份寫死中文的字典，現已移除，避免
  英文頁點擊後又跳回中文狀態文字的風險）。

全部為新增可選 Prop，唯一既有呼叫點（`internal-preview/design-system
.astro`，僅 zh-tw）未需任何修改，並以 Playwright 現場驗證互動循環後
`aria-label` 正確更新。

## 8. Copper 決策（CC-02-03）

新增 `--color-action-primary` / `--color-action-primary-hover`，**不**
直接重新映射 `--color-copper-600`（`DATUM_DECISION_LOG.md` 已明確鎖定
其 4.61:1 餘裕極薄，不可再調整）：

- `--color-action-primary` → `--color-copper-700`，對 `--color-paper-50`
  **6.06:1**（達成 spec 要求的約 5:1 目標，且有實質餘裕）。
- `--color-action-primary-hover` → 新增 `--color-copper-800`
  (`#84340f`)，對 `--color-paper-50` **7.71:1**——與 copper-600/700 同一
  19° 色相，Hover 狀態餘裕大於預設狀態（符合本檔案既有慣例）。
- `--color-copper-600` 完全未變動，仍為 Datum Origin／既有元件文字連結
  用色。
- 三個 Prototype 皆實際使用新 Token 於 Primary CTA（非僅定義未使用，已用
  `grep -c` 驗證 3 個檔案皆非零）。
- `docs/CONTRAST_AUDIT.md` 已更新完整驗證表格與色相檢查。

## 9. Font Payload（CC-02-04）

真實量測（Playwright 網路攔截，針對正在執行的 `astro preview` Production
Build，非檔案大小估算）：

- `/zh-tw/` 冷快取首次載入：**4,087,276 bytes**（約 3.9MB），7 個字型
  請求。
- `/en/` 冷快取首次載入：**4,100,560 bytes**（約 4.0MB），8 個請求（多
  一個 Space Grotesk 600，英文 H2 觸發）。
- Noto Sans TC 500 專案調查：全站唯一使用點為 `Header.astro` 的
  `.desktop-nav__link`；直接截圖比對 500 vs. 強制 600 的實際渲染差異，
  確認有真實可見的加粗差異——**未移除**，因 spec §8 要求「有明確證據
  且不破壞設計」才可移除，本案證據指向相反方向。若移除可省
  987KB／次造訪，已記錄但未執行。
- 另記錄一項獨立發現：`astro preview` 對字型回應送出
  `Cache-Control: no-cache`，且 `public/fonts/**` 路徑未雜湊——留給未來
  部署設定階段處理，非本輪範圍。

## 10. 三個 Variant

全部使用 `src/pages/internal-preview/cc02-hero/_shared/copy.ts` 提供的
逐字文案（zh-tw／en 皆與 Spec §十二原文一致，未改寫）。

- **Variant A — Datum Calibration Split**
  (`variant-a.astro`)：文字左／視覺右 12 欄分割，視覺跨出 Container，
  DatumOrigin ＋ 模組軸線 ＋ VisionLockFrame ＋ AssemblySpine 組成，下方
  INPUT/ALIGN/INSPECT/ASSEMBLE 四步驟流程（Mobile 水平 Snap 捲動）。
- **Variant B — Full-width Precision Stage**
  (`variant-b.astro`)：近全寬視覺舞台（目前為 Token＋SVG 構成，未使用
  任何 CGI／攝影——Higgsfield 本輪全程禁用），Header 疊在 Hero 上並有
  對比穩定的漸層背板，Datum Axis 橫跨全寬，Mobile 改為局部模組裁切。
- **Variant C — Engineering Editorial Sheet**
  (`variant-c.astro`)：非對稱排版，主標跨 12 欄中的 1-8 欄，兩個
  CutawayWindow（Mobile 僅保留一個），DatumOrigin 作為排版視覺原點，
  技術規格表以獨立資訊層呈現（非卡片網格）。

三者皆通過 360px 零溢位、axe 0 Critical/0 Serious（Desktop＋Mobile）、
Header 鍵盤操作（Escape／Focus Trap／Focus Return／語言切換）、
Reduced Motion（VisionLockFrame 一次性動畫在 Reduced Motion 下
100ms 內即達 `is-locked`，非預設 620ms）測試。

## 11. Impeccable 摘要

完整內容見 `docs/engineering/reviews/CC-02-impeccable-hero-review.md`。
每個檢查項目皆附證據（截圖路徑、實測像素值、對比數值），非形容詞堆疊。
過程中發現並修正的真實缺陷：AssemblySpine 在 Mobile 4:5 視覺框內與
VisionLockFrame 疊放導致框體被壓縮成一條細縫（已移除 Mobile 版
AssemblySpine，流程資訊改由下方 Process Strip 承擔）、英文版
AssemblySpine 節點標籤過長換行不佳（已縮短，非 §十二 逐字文案範圍）、
桌機與手機標題在較窄欄位下的中文換行落在奇怪的斷點（已調整 clamp 兩輪
並以截圖確認修正）、Process Strip 有真實的 WCAG 2.1.1「可捲動區域必須
可鍵盤操作」axe 違規（已加 `tabindex="0"` + `aria-label` 修正）。

## 12. Internal Scores

| 項目 | 配分 | A | B | C |
|---|--:|--:|--:|--:|
| 5 秒商業理解 | 20 | 19 | 16 | 18 |
| 鋒岳品牌適配 | 20 | 18 | 13 | 17 |
| 原創性與記憶點 | 20 | 14 | 17 | 18 |
| Desktop／Mobile 完整度 | 15 | 15 | 14 | 14 |
| 效能與 Accessibility | 15 | 14 | 14 | 13 |
| 可維護性 | 10 | 9 | 7 | 7 |
| **Total** | **100** | **89** | **81** | **87** |

**Internal Recommendation：Variant A**（品牌適配與可維護性最高，且目前
版本零未來素材依賴）。**Second Choice：Variant C**（原創性最高，同樣
零未來素材依賴，僅 5 秒理解與資訊密度略遜於 A）。**Variant B**
目前分數最低——非設計方向被否定，而是其現有視覺高度依賴尚未產出的
攝影／CGI 素材（本輪禁用 Higgsfield，未提交任何生成），若未來真的產出
對應素材，應重新評分而非沿用此分數。**完整評分理由、風險與證據見
`docs/engineering/reviews/CC-02-impeccable-hero-review.md` 的
「Internal Scoring」章節——此為內部建議，最終方向由 ChatGPT 審查 Bundle
後決定，本輪未自行整合任何推薦版本進正式首頁。**

## 13. Screenshots

`docs/screenshots/cc02/`，共 11 張，皆由 Playwright 對執行中的
`astro preview` 即時擷取：

```
variant-a-desktop.png / variant-a-tablet.png / variant-a-mobile.png
variant-b-desktop.png / variant-b-tablet.png / variant-b-mobile.png
variant-c-desktop.png / variant-c-tablet.png / variant-c-mobile.png
comparison-desktop.png / comparison-mobile.png
```

尺寸：1440×900 / 768×1024 / 390×844。另以 Playwright 對 360px 做零溢位
專項驗證（非截圖，數值驗證）。

## 14. Tests

- `pnpm check`：0 errors / 0 warnings / 11 hints（既有已知 `is:inline`
  Hint，非本輪新增）。
- `pnpm build`：55 頁（含 4 個新 Prototype 路由）0 errors。
- `check:h1`：53/53（2 個 Redirect 頁排除）。
- `check:links`：2062/2062 無失效。
- `check:locale-routes`：141/141 hreflang 無失效。
- `pnpm test:e2e`：**221/221 passed**（含本輪新增
  `tests/e2e/cc02-hero-prototype.spec.ts` 與
  `responsive-overflow.spec.ts` 的 CC-02-01 新增區塊）。
- `pnpm test:axe`：15/15，0 Critical/0 Serious。
- Tooling Test（`tests/tooling/review-bundle.test.sh`）：20/20，本輪
  結束前重新執行確認乾淨。

## 15. Known Limits

- Variant B 目前視覺為 Token＋SVG 構成的示意圖，非最終素材品質——見
  `docs/DATUM_ASSET_PLAN_CC02.md` 對應章節，此為該方向已知、已記錄的
  限制，非隱藏缺陷。
- Prototype 的語系切換使用 Client-side 雙區塊渲染（非正式站台的
  Locale-as-Path 慣例），原因是本輪必須使用 Spec 指定的確切檔名
  （`variant-a.astro` 等），純 Static Build 下無法用 `?lang=` Query
  String 做伺服器端切換——已在 `PrototypeHeader.astro` 檔頭完整記錄，
  僅限 Prototype 範圍，未影響正式站台路由慣例。
- Noto Sans TC 500 的實際生產環境 Cache-Control／雜湊檔名問題留待未來
  部署設定階段處理（見第 9 節）。
- `astro preview` 的字型回應快取行為不代表真正生產環境設定。

## 16. ChatGPT 優先審查項目

### A. 三個方向的商業與品牌判斷
5 秒理解與品牌辨識度是否與 Claude Code 的內部評分一致；Variant B
目前素材不足是否影響對其設計方向本身（而非目前呈現）的判斷；是否有
第四種方向 Claude Code 未考慮到。

### B. Copper Token 決策
`--color-action-primary` 指向 copper-700（非重新調整 copper-600）是否
合理；6.06:1／7.71:1 的計算是否可信。

### C. Tooling 修正是否真的解決 ChatGPT 上一輪的六項發現
建議直接比對 Bundle 內 `metadata/project-status.txt`、
`source/scripts/create-review-bundle.sh`、`diff/changes.patch` 的路徑
格式，逐項核對第 4 節的六個問題。

### D. Overflow 修正的根因鏈是否站得住腳
`CTABanner.astro` 雙重 Gutter 的推理過程（見第 6 節）是否有遺漏的其他
可能成因。

### E. Prototype 是否真的隔離
`noindex`／Sitemap 排除／無 Analytics／無正式路由連結是否確實，是否有
任何一絲滲入正式頁面的痕跡。

## 17. 禁止事項（本輪回報範圍內）

本輪未：整合任何 Variant 進正式首頁；執行 CC-03；使用 Higgsfield；
自行決定最終 Hero 方向；Push 到遠端。
