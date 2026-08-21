# 00 · Baseline

記錄日期：2026-08-21（本文件已於同日修正重寫，見下方「方法論事故」說明）
記錄範圍：`main` 分支 HEAD `ccaa191`（另有未提交的治理文件調整 `CLAUDE.md`、`scripts/agent_guard.py`，與本次 UI/UX 視覺無關）
截圖來源：`pnpm dev`（Astro dev server，**`localhost:4326`** — 見下方事故說明，不是預設的 4321），
Playwright chromium headless
截圖路徑：`docs/screenshots/uiux-baseline/`（`{page}-{viewport}-{fold|full}.png`，涵蓋 zh-tw / en 首頁 × 375 / 768 / 1440 / 1920）

## 方法論事故：先前一版 baseline 觀察對象錯誤（重要，勿刪）

本文件的第一版是針對錯誤網站寫成的，已整份重寫。記錄事故經過以避免重蹈覆轍：

`localhost:4321` 這台機器上長期跑著一個**與本專案完全無關的背景進程**——
`/home/ubuntu/.openclaw/workspaces/telegram_1059505606/leo-projects/side_project/
頁構所/demo-1/`（`astro preview --port 4321`，自 8/5 起持續執行）。本次 UI/UX
任務用 `pnpm dev` 啟動鋒岳自己的 dev server 時，4321-4325 皆已被其他進程占用
（含另一個 `agent/codex` worktree 的 preview 進程），Astro 自動遞增到
**`localhost:4326`**，但終端機日誌裡的這行訊息在第一輪工作時被忽略，導致
後續所有截圖與視覺判斷（包含色彩系統「暖白+銅橘」的結論）都是針對 4321 上
那個無關站點做的。

**如何被發現**：在 Taste 第一輪修改（`home-refinement.css`）後重新截圖驗證時，
`.solution-index` selector 在 Playwright 中一直抓不到元素；追查發現實際渲染
的 HTML 裡對應 class 是 `grid-auto`，這個名稱在本專案原始碼中完全不存在，
才確認截圖對象有誤。修正方式：`ps aux` 找出真正監聽 4326 的 Astro dev
process，改用該 port 重新截圖，並重新檢視 `pnpm dev` 啟動時的完整終端機輸出
確認 port。

**如何避免再犯**：日後任何 `pnpm dev` / `astro dev` 啟動後，**必須先讀取
啟動日誌裡的 `Local http://localhost:XXXX/` 那一行**，不得假設固定是 4321；
若懷疑截圖與預期不符，優先用 `grep` 核對渲染 HTML 中的 class 名稱是否存在於
目前原始碼，而非直接懷疑 CSS 沒生效。

**受影響範圍**：`00-baseline.md`（本文件，已重寫）、首輪截圖（已刪除重拍）。
**不受影響範圍**：`01-reference-lock.md`（純外部網站研究，與本地 dev server
無關）；`src/styles/home-refinement.css` 的實際程式碼修改（直接改磁碟檔案，
不受截圖對象錯誤影響，已用正確 port 重新驗證生效且無破版）。
`02-redesign-diagnosis.md` 的「Section 骨架同質化」核心診斷方向經正確 port
重新核對後**依然成立**（Solutions/Products/Industries 連續三個卡片式區塊
確實存在於真正的鋒岳頁面），但文中部分視覺細節描述已一併核對更新。

## 方法論註記（截圖技術限制）

1. 首頁有多處使用 `loading="lazy"` 的 `<Picture>`，容器有深色底當
   placeholder。單純 `networkidle` + 固定等待不足以觸發載入，截圖前需先
   逐步滾動整頁一次並等待所有 `<img>` 觸發 `load`/`error` 事件，才截
   full-page 圖。
2. `.site-header` 是 `position: sticky`。Playwright `fullPage: true`
   截圖對 sticky 元素有已知的重複渲染 artifact（sticky 元素會在長頁面
   截圖合成時，於滾動經過的每個「stick 點」重複出現一次）。這**不是
   真實瀏覽器行為**，已用 viewport-only 截圖（非 fullPage）交叉驗證排除。
   後續若在 full-page 截圖中看到重複的 header，先假設是這個已知
   artifact，用 `scrollIntoViewIfNeeded()` + 一般 viewport 截圖覆核，
   不要直接當作破版回報。

## 技術棧確認（取代任何假設）

- **Package manager**：pnpm（`pnpm-lock.yaml` lockfileVersion 9.0），無 npm/yarn/bun lock 檔。
- **Astro**：`^4.16.0`，`astro.config.mjs` 無任何 integrations（無 React/Tailwind/sitemap
  integration），`output` 為預設 static，`build.format: 'directory'`。無 SSR adapter。
- **TypeScript**：`extends: astro/tsconfigs/strict` + `noUncheckedIndexedAccess`，
  path alias `@/* → src/*`（多數既有程式碼仍用相對路徑）。
- **CSS**：純原生 CSS，無 SCSS、無 Tailwind、無 CSS-in-JS。`src/styles/` 下
  `tokens.css`（design tokens）、`global.css`（reset/typography/字型，
  內含 `@import` `brand-refresh.css`）、`utilities.css`、以及頁面層級
  `home-refinement.css` / `catalog-refinement.css`。
- **Motion**：無 GSAP/Framer Motion/AOS 等函式庫，純 CSS transition/transform +
  少量 `IntersectionObserver` vanilla JS。`prefers-reduced-motion: reduce` 已在
  `tokens.css` 統一歸零所有 `--duration-*`。
- **Dependencies 總量**：4 個 runtime（Astro + 3 個 `@fontsource/*` 自架字型）、
  6 個 dev（`@astrojs/check`、`@axe-core/playwright`、`@playwright/test`、
  `@types/node`、`sharp`、`typescript`）。刻意極簡、無框架。
- **Lint/Test**：無 ESLint、無 Prettier。型別檢查（`astro check` + `tsc --noEmit`）
  是唯一靜態分析關卡。Playwright E2E + `@axe-core/playwright`（`pnpm test:e2e`、
  `pnpm test:axe`）。另有自訂 Node 腳本 `check-h1.mjs` / `check-links.mjs` /
  `check-locale-routes.mjs`。
- **Routing**：雙語為手動平行資料夾（`src/pages/zh-tw/**`、`src/pages/en/**`），
  非 Astro 內建 i18n router。內容資料經 Content Collections + Zod schema。
- **Assets**：圖片皆為 PNG「final-master」命名慣例，經 Astro `<Picture>`
  自動輸出 avif/webp/png 多尺寸。字型為 3 組自架 WOFF2（IBM Plex Mono / Noto Sans TC /
  Space Grotesk）。

## 設計方向確認（已用正確 port 核實）

`tokens.css` 記載的色彩系統與 `brand-refresh.css` 註解（"navy, white, generous
rounding, no datum ornament"）在正確截圖下**確實一致**：整站是深藏青海軍藍
（Hero 全滿版深藍背景、footer 深藍）+ 白色頁面背景 + 藍色 CTA 按鈕，圓角卡片
風格貫穿全站。左上角並**沒有**先前誤判提到的銅色十字準星裝飾——那是看錯站
點時的誤讀。

`DESIGN.md`、`docs/DESIGN_SYSTEM.md`、`docs/DATUM_DECISION_LOG.md` 記載的是
更早一版「Precision Datum System」（銅色主色、六個 Brand Primitive 元件），
這些文件確認與目前 `tokens.css` 實際數值不同步（`--color-copper-600` 現在
數值是 `#1769c2`，是藍色不是銅色，變數名稱保留舊稱但語意已改），六個 Brand
Primitive 元件與 `ProcessRail.astro` 已不再被任何正式頁面引用。

**依使用者本輪明確決定**：以目前實際上線的海軍藍畫面為設計基準（KEEP 的對象），
舊 Precision Datum 文件與六個 Brand Primitive 元件列為歷史參考，不強制回歸。

## Layout

- **Container**：`--container-content: 1280px`／`--container-wide: 1440px`，
  內距 `--page-gutter-desktop: clamp(32px, 4vw, 64px)`。
- **Section 節奏（Taste 修改前的原始狀態）**：Hero → Capability（icon-index
  四欄）→ Solutions（圓角卡片網格，改前）→ Products（不對稱大圖卡+雙欄）→
  Industries（圓角卡片網格，改前）→ Fit/not-fit（頂部色條雙欄卡片）→
  角色路徑（hover 陰影雙卡）→ Process（visual + timeline）→ Why us（四項
  置中文字）→ CTA banner → Footer。
- **1920 桌面版**首屏呈現扎實：深藍 Hero 滿版、圖片對比清楚、CTA 對比度足夠。
- **768 版**已切換為漢堡選單，Industries 卡片折為單欄雙欄圖文列。
- **英文 CTA 按鈕**（正確 port 覆核後）：`Review Integration Requirements`
  在 1440/768 寬度下皆為單行顯示，未觀察到先前誤判的換行問題；375 寬度下
  仍需個別確認，留待 Responsive QA 階段。

## Typography

- 中文顯示字級：H1 clamp 顯示偏大且加粗，數字/技術標籤走 `--font-mono`
  （IBM Plex Mono）。
- 中英文對照：Hero 下方「需求輸入／評估範圍／交付輸出」技術中繼資料區塊排版
  一致，中英文皆維持相同層級關係。

## Imagery

- 首頁圖片皆為真實產線/設備攝影（非佔位圖、非 AI 生成痕跡明顯的圖），質感偏高：
  Hero 工廠實景、機械手臂工作站特寫、四張產業別實景、現場人員操作實景。
- 圖片全部走 Astro `<Picture>` 自動 avif/webp/png 多格式輸出 + `srcset`，
  多數非首屏圖片使用 `loading="lazy"`（見上方方法論註記 1）。
- 產品卡片（模組化產品線區）第一項（AXM-400）採大圖不對稱佈局，其餘兩項
  （VISION-X2、FLEXCELL-M）並排小圖，圖片本身皆為實景攝影，非色塊或插畫——
  與先前誤判記錄的「色塊佔位圖」不同，這點需要修正認知。

## Content

- Hero 文案（zh）：「把設備、控制與製程，整合成可落地的自動化系統。」+ eyebrow
  「虛構品牌概念展示 · 工業自動化系統整合」+ 雙 CTA（「討論自動化需求」／
  「查看導入條件」）。文案語氣工程導向、無空泛形容詞。
- 全站帶有明確 Demo Mode 揭露（footer badge、eyebrow 標註「虛構品牌概念展示」），
  非本輪修改對象。

## Interaction / Responsive（初步觀察，QA 階段需正式驗證）

- 本輪 baseline 未執行鍵盤/axe/Lighthouse 測試，僅為視覺截圖巡覽。正式
  keyboard/a11y/performance 驗證留待 Phase F QA Gate，屆時如無法測將標示
  `Not verified`，不得捏造結果。

## 已知風險與待辦（帶入 02-redesign-diagnosis.md，已依正確畫面覆核）

1. Solutions / Products / Industries 三個連續 section 皆為「標題 + 卡片列」
   節奏，此問題在正確畫面下依然成立，已於 Taste 第一輪（見
   `03-polish-log.md`）針對 Solutions/Industries 做骨架調整。
2. 產品卡片圖片品質其實與其餘 section 一致（皆為實景攝影），**先前誤判
   「產品卡片是色塊佔位圖」已更正**，不再視為 IMPROVE 候選。
3. 多處 section 使用 lazy-load + 深色 placeholder 底色，快速滾動時使用者
   可能短暫看到深色色塊，需在正式瀏覽器中確認是否構成真實體感問題。
4. `DESIGN.md` 系文件與實際上線畫面的色彩系統描述不一致，已依使用者指示
   以實際渲染（海軍藍）為準；文件本身是否要同步更新超出本輪 UI/UX 視覺
   升級範圍，僅記錄於此供後續參考。
