# 07 · Full-page Craftsmanship Polish

記錄日期：2026-08-21
觸發原因：Human Visual Acceptance 回報 Hero Art Direction Reconstruction PASS，
但 Full-page Visual Acceptance 為 POLISH REQUIRED——Hero 以下的 section 尚未與
已接受的 Hero 屬於同一套視覺系統。本文件記錄唯一一次 Full-page Craftsmanship
Polish 的決策依據，等待人工最終視覺驗收，**未自行宣告 FINAL ACCEPTED**。

## Hero 微調（僅限授權的兩項）

未重新 redesign、未改文案、未改 composition：

1. 未再調整 white image wash 強度——這次驗收已 PASS 的 1440/1920/375 版本
   觀察後，判斷目前的漸層強度已能清楚呈現工業攝影質感，不需額外調整。
2. 未再調整 H1 換行——先前一輪已將 1920px 下的換行點退到「自動化」與
   「系統」的詞語邊界（非字元硬切），本輪覆核維持現狀，未發現需要進一步
   收斂的斷行問題。

## P1 修正逐項對照

### 模組化產品線（Products）

- **移除的語言**：`.product-showcase .card` 的 `border-radius: var(--radius-md)`
  圓角、`box-shadow` 陰影懸浮感。
- **改為**：`border-radius: 0 !important` 直角、`border-bottom` hairline
  分隔（呼應 Solutions/Industries 已建立的列表分隔線語言），hover 狀態
  改為背景色變化而非陰影浮起。
- **Demo 標示**：`ProductCard.astro` 移除 `Badge` 元件（`variant="demo"`
  藍色 pill），改為 `.product-card__demo-notice`——`var(--color-muted)`
  灰階、`var(--fs-xs)` 小字級、`font-family: var(--font-mono)` 技術標籤
  字體的低權重 metadata 文字。
- **未變更**：不對稱佈局骨架（第一張大圖 + 兩張並排）、產品內容、圖片、
  hierarchy、IA。

### 適合什麼情況／不適合什麼情況（Fit）

- **移除的語言**：`.fit-card` 的 `background: var(--color-card)`、
  `border-radius: var(--radius-lg)` 白色圓角卡片。
- **改為**：頂部 `border-top: 2px` hairline（保留原本 success/muted 的
  色彩區分語意，只是從整塊卡片背景收斂為一條 datum 線），桌面版兩欄之間
  加入 `border-right` 垂直分隔線，形成 editorial columns。
- **未新增**：任何裝飾性 icon 或 badge。

### 依您的角色選擇瀏覽路徑（Path）

- **移除的語言**：`.path-card` 的完整邊框（`border: 1px solid`）、
  `border-radius: var(--radius-lg)`、hover 時的 `box-shadow` 浮起效果。
- **改為**：`border-bottom` hairline 列表 + 桌面版欄間 `border-right`
  分隔線，hover 改為背景色變化。保留 `.path-card__label` 的 mono 技術
  標籤語言（原本就是好的 datum 元素）。
- **保留**：兩條瀏覽路徑的完整內容與連結目標，未改 IA。

### 為什麼與鋒岳自動化合作（Why us）

- **問題根因**：`.principles-list` 完全沒有 `display: grid` 定義（先前
  Taste 階段清理 `home-refinement.css` 覆蓋層時，這條規則一併被移除但未
  補上原生版本），導致四個項目退化為單欄垂直堆疊、置中對齊、大量留白但
  無結構關係。
- **修正方式**：直接複製同頁面已存在、效果良好的 `capability-grid`／
  `capability-item` 視覺語言（hairline 分隔線 + 編號 + 標題 + 說明的
  4-column grid，720px 兩欄、960px 四欄），應用到 `.principles-list`／
  `.why-item`，兩者現在共用同一套 4-item editorial grid/datum system。
- **未採用**：單純縮小 spacing——因為根本問題是缺少 grid 結構而非間距
  數值，縮小間距無法建立你要求的 structural relationship。

### Final CTA

- **移除的語言**：`.cta-banner` 的 `border-radius: var(--radius-md)`
  圓角、`overflow: hidden`（配合圓角的必要屬性）。外層 `index.astro`
  的 `<div class="container">` wrapper（僅首頁移除，見下方說明）。
- **改為**：`width: 100vw` + `margin-inline-start: 50%` +
  `transform: translateX(-50%)` 的標準 break-out-of-container 技巧，讓
  `.cta-banner` 自己撐滿 viewport，不依賴外層是否有 container 限制。
  頂部保留 `border-top: var(--border-datum) solid var(--color-copper-500)`
  細線（原本是 `::before` 絕對定位色塊，改為真實 border，避免圓角裁切
  相關的視覺複雜度）。內部 `.cta-banner__inner` 用
  `max-width: var(--container-content)` + `margin-inline: auto` 維持文字
  對齊全站 container 寬度。
- **範圍決定**：修改了 `zh-tw/index.astro` 首頁的 wrapper（移除外層
  `<div class="container">`）與 `CTABanner.astro` 元件本身。元件 CSS
  用 `width: 100vw` + `transform: translateX(-50%)` 的 break-out 技巧，
  不依賴外層是否有 `container` 限制即可撐滿 viewport；因為
  `CTABanner.astro` 被 18 個頁面共用，這個技巧讓其餘 17 個仍包著
  `container` wrapper 的頁面（Products/Solutions/Industries/About 等
  listing 與 detail 頁）**同樣**呈現 full-width、無圓角的效果，不需要
  逐一移除它們的 wrapper。已用 Playwright 實測 `/zh-tw/about/` 頁面的
  `.cta-banner` bounding box（`x: 0, width: 1440` @ 1440px viewport），
  確認確實撐滿全寬，非推測。其餘 16 個頁面未逐一截圖比對，但共用同一段
  CSS、同一種 wrapper 模式，判斷有一致的高信心，若驗收後仍需逐頁視覺
  確認可另外處理。

## 已知的 CSS 特殊性防呆

`global.css` 透過 `brand-refresh.css` 對 `.card, .fit-card, .path-card,
.why-item` 等選擇器有全站 `!important` 圓角規則。本輪對 Products/Fit/
Path/Why-us 的直角化，皆需要用對應的 `border-radius: 0 !important` 明確
覆蓋，否則即使移除 `background`，`border-top`/`border-bottom` 的線條末端
仍會因繼承的圓角裁切而呈現弧形（實際測試中 Fit 區塊曾出現此問題，已修正）。

## 未變更項目（依授權範圍嚴格遵守）

- IA、Page sequence、核心 copy、工業影像、已驗收的 Hero composition、
  Astro 架構、Header IA 均未變更。
- Solutions（`SolutionCard.astro`／`solution-index`）與 Industries
  （`IndustryCard.astro`／`industry-index`）完全未觸碰——這兩者在先前
  Taste 階段已建立 editorial list，本輪視為「已成立」，不重複處理。
- Process 區塊（`FieldCommissioningVisual` + `ProcessTimeline`）未變更。

## 驗證結果

- `pnpm check`：0 errors，0 warnings（12 個既有 hint，與本輪修改無關）。
- `pnpm build`：57 頁面全部建置成功，exit code 0。
- `pnpm test:e2e`（完整套件，非篩選子集）：**499/499 全數通過**，包含
  歷史上曾記錄過 CTABanner 360px overflow 回歸的專項測試
  （`CC-02-01: /en/ 360px overflow regression`）——本輪的 `100vw`
  full-width 技巧未重蹈該事故。
- `pnpm test:axe`：**15/15 通過**，0 Critical、0 Serious。
- **Keyboard**：Tab 巡覽 Products（3 連結）、Path（2 連結）、CTA（2
  按鈕）皆可正常聚焦，`outline: solid 2px` 可見；Fit／Why-us 為純文字
  內容無可聚焦元素，非缺陷。
- **Lighthouse**（production build，`--throttling-method=provided` 避免
  節流失真，方法論見 `05-qa-report.md`）：Performance 100、Accessibility
  100、Best Practices 100、SEO 69（Demo Mode 既有設計，非本輪引入）、
  LCP 0.3s、CLS 0.001。與先前基準一致，無退化。

**Technical QA 通過不取代 Human Visual Acceptance——以下交付四張正式
screenshot，等待人工最終視覺驗收。**

## 交付 Screenshot

- `docs/screenshots/uiux-upgrade/fullpage-after-1440.png`
- `docs/screenshots/uiux-upgrade/fullpage-after-1920.png`
- `docs/screenshots/uiux-upgrade/fullpage-after-768.png`
- `docs/screenshots/uiux-upgrade/fullpage-after-375.png`

以及五個目標區塊各自的 before/after 對照：
`section-{products,fit,paths,whyus,cta}-{before,after}.png`

## 狀態

**等待 Human Visual Acceptance。本文件與程式碼修改不構成 FINAL ACCEPTED
宣告。**
