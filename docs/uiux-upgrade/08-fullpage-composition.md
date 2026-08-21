# 08 · Full-page Art Direction Composition Pass

記錄日期：2026-08-21
觸發原因：Human Visual Acceptance 回報 Full-page 判定 FAIL——前一輪
craftsmanship polish 逐區塊移除卡片後，整頁仍讀成「相同的 eyebrow → giant
heading → description → whitespace → hairline grid 節奏重複十次」，只是
把「卡片重複」換成「hairline 重複」，本質上是同一種病。本輪不再逐區優化，
而是重新分配全頁視覺權重，建立三個真正的 page moment，其餘 section 降級為
服務性內容。**未自行宣告 FINAL ACCEPTED，等待人工視覺驗收。**

## 診斷：問題不在骨架，在節奏

前兩輪把 Solutions/Industries/Products/Fit/Path 從卡片網格改成各種
hairline 分隔的列表，技術上每個 section 的骨架確實不同。但每個 section
仍然共用同一個 `SectionHeading` 元件、同一個全域 `h2 { font-size:
var(--fs-h2) }`（1440px 下約 50px），十個 section 標題全部一樣大、
一樣的 eyebrow → 巨大標題 → description → 大留白節奏。人眼感知的是
節奏差異，不是骨架差異——十個「不同骨架但同節奏」的 section 讀起來
仍然像同一個模板複製十次。

## 三個 Page Moment

- **A. Hero**（已於上一輪驗收 PASS，本輪僅檢視未修改）
- **B. Mid-page Signature Composition = 模組化產品線（Products）**
  ——公司實際販售的產品、全站最好的實景攝影素材、已有不對稱大圖骨架。
  升級為全頁除 Hero 外唯一保留完整 `SectionHeading`（無 compact）+
  `section-major`（`clamp(120px, 12vw, 176px)`，全站最寬鬆的節奏 token）
  的區塊，讓它在視覺上明顯是「抵達點」。
- **C. Trust / Conversion Ending = Final CTA**（維持上一輪已建立的
  full-width 深色無圓角處理），並把它前面的 Why us 大幅降級，避免
  在真正的結尾前又放一個假高潮稀釋力道。

其餘七個 section（Capability、Solutions、Industries、Fit+Path、Process、
Why us）全部重新定位為「服務 A/B/C 三個高潮的支撐性內容」，不再各自
喊出同等音量的宣言。

## 具體改動

### 建立 `compact` 標題模式（`SectionHeading.astro`）

新增 `compact` prop（預設 `false`，向後相容，其他 17 個頁面的既有呼叫
不受影響）：拿掉 datum `::before` 線、標題字級從全域 `--fs-h2`（~50px）
降到 `--fs-md`（~18px）、留白大幅收斂。用於所有支撐性 section 的標題，
使它們讀起來像章節小標而非另一次宣言。

### Capability、Solutions、Industries：壓縮

`section--tight`（`clamp(64px, 7vw, 96px)`）→ `section-compact`
（`clamp(56px, 6vw, 72px)`，全站既有 token，先前首頁從未用過）；
`SectionHeading` 全部加上 `compact`。內容、圖片、資料完全未變更。

### Fit + Path：合併重構，而非換皮膚

**問題**：即使拿掉卡片外殼，「兩欄對稱、各自一個大標題」的構圖本身仍是
generic two-item pattern；Path 的「兩條路徑」也是同樣的 generic
two-card 思路，只是換成 hairline list。

**處理**：把兩個獨立 section 合併成一個 `assess-block`——960px 以上用
`minmax(0, 1.6fr) minmax(0, 1fr)` 非對稱雙欄：左側（大欄）是 Fit 的
適合/不適合判斷（原本兩欄對稱的內部結構也同步壓縮為更緊的字級），右側
（小欄，用左邊框分隔）是 Path 的兩條路徑，從「大卡片+大標題+CTA 文字」
降級為純文字連結列表（`path-link`，label + desc 兩行，無邊框無底色）。
兩個原本各自完整的 section 現在讀成「一塊決策輔助資訊」而非「兩個平行
的宣言」。標題本身也從 `SectionHeading`（全域 h2）換成內建的
`assess-block__title`（`--fs-md`），因為這個合併區塊本身就是支撐性
內容，不需要獨立的巨大標題。

### Process：從「圖 + 文件清單」改為並排敘事

**問題**：原本是「大圖在上、五步驟編號清單在下」，兩者是分離的兩塊，
讀起來像技術文件附圖，缺乏敘事感。

**處理**：桌面版（900px+）改為並排——圖片在左並用 `position: sticky`
固定在 viewport 內，五步驟清單在右側；使用者往下讀每個階段時，那張
「控制端設定與設備端目視確認」的現場照片始終陪伴在側，建立「這是同一場
真實交付過程」的敘事連續感，而非「先看一張圖，再讀一份文件」的兩段式
資訊架構。未修改 `ProcessTimeline.astro`／`FieldCommissioningVisual.astro`
元件本身（兩者被其他頁面共用），只在首頁這個特定使用場景調整了外層
markup 與 grid 佈局。

### Why us：從獨立宣言降級為收尾前的安靜過渡

**問題**：原本用置中對齊的 `SectionHeading`（無 compact）+ 四欄 hairline
grid，音量與 Hero、Products 相當，形成收尾前的「第三個假高潮」，稀釋
Final CTA 的結尾力道。

**處理**：完全拿掉 `SectionHeading`，改為極簡的 `<p class="mono">`
eyebrow 標籤 + 四欄極小字級（`--fs-xs` 標題、`--fs-xs` 內文）清單，
`padding-block: var(--space-2xl)` 是全頁除 Hero/Products/CTA 外最克制
的留白。內容（四項合作理由的標題與說明文字）完全未變更。

### Header：CTA 從 SaaS pill 降級為工程文件動作按鈕

**問題**：右側藍色實心圓角 `Button` 讀起來是典型 SaaS 行銷按鈕語言，
與 body 已建立的 hairline/直角/克制配色不統一。

**處理**：只在 `.site-header__cta > :global(.btn--primary)` 這個已存在
的 scoped call-site override 上，把 `background`/`border-radius` 改為
透明背景 + 深色邊框 + 直角，hover 才填滿深色。**完全沒有觸碰**
`Header.astro` 裡任何 layout、spacing、尺寸邏輯（min-block-size、
touch-target、zoom-safe height 等——這些都是過去實測回歸修復過的區域，
本輪刻意不動）。`Button.astro` 本身、其他呼叫點（Hero、CTABanner）的
primary 按鈕不受影響。

## 未新增的裝飾

依任務書明確禁止清單逐項確認未違反：無新增 card-heavy layout、無 bento、
無 decorative pill/badge（Why us 移除了 pill、Products 的 Demo 標示上輪
已改為文字）、無漸層裝飾、無 glass/neon、無假 dashboard、無新增動畫。
唯一的「新東西」是 Process 的 `position: sticky` 圖片，這是功能性的
敘事手法（讓圖片在使用者閱讀清單時保持可見），不是裝飾性 UI gimmick。

## 驗證

- `pnpm check`：0 errors，0 warnings（12 個既有 hint，與本輪無關）。
- `pnpm test:e2e`（完整套件）：**499/499 全數通過**，含 header 與
  responsive-overflow 相關測試——確認 Header CTA 視覺調整、Process
  並排佈局、Fit/Path 合併等較大幅度的結構改動皆未引入回歸。
- `pnpm test:axe`：15/15 通過，0 Critical/Serious。

Technical QA 通過不取代 Human Visual Acceptance——以下交付四張正式
screenshot，等待人工最終視覺驗收。

## 交付 Screenshot

- `docs/screenshots/uiux-upgrade/fullpage-composition-1440.png`
- `docs/screenshots/uiux-upgrade/fullpage-composition-1920.png`
- `docs/screenshots/uiux-upgrade/fullpage-composition-768.png`
- `docs/screenshots/uiux-upgrade/fullpage-composition-375.png`

頁面總高度對照（1440px，供參考節奏壓縮幅度，非驗收標準）：上一輪
craftsmanship polish 後約 10274px，本輪約 8322px。

## 狀態

**等待 Human Visual Acceptance。本文件與程式碼修改不構成 FINAL
ACCEPTED 宣告。**
