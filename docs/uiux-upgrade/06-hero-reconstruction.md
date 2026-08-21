# 06 · Hero Art Direction Reconstruction

記錄日期：2026-08-21
觸發原因：Human Visual Acceptance 回報前一輪 Technical QA（96/100、Lighthouse、
axe、Hallmark checklist）通過但 **Visual Art Direction Acceptance FAIL**——
明確指出這些自動化指標不能作為視覺品質已通過的證據。Hero 被判定需要重新構圖，
非微調。本文件記錄這輪 Hero 專項重構的決策依據，等待人工視覺驗收，
**未自行宣告 FINAL ACCEPTED**。

## 問題根因

`src/components/sections/Hero.astro` 檔案內存在兩套互相矛盾的 Hero 設計：

1. 第 74-296 行：原始「Engineering Editorial Sheet」設計——工業攝影滿版
   背景疊圖、漸層遮罩、文字疊加，`z-index: -1` 讓圖片退到文字後方。
2. 第 308-380 行（本輪已移除）：後製的「Commercial navy hero」覆蓋層——
   把整個 Hero 包進 `border-radius` 圓角深藍卡片，工業攝影被壓縮成卡片
   內部一個獨立的裁切矩形，形成「SaaS split hero」的視覺語言。

第二套設計透過重複宣告相同 CSS selector 覆蓋第一套，是本次視覺 FAIL 的
直接來源，與先前 `home-refinement.css` 的 `!important` 覆蓋事故是同一種
「後製商業化覆蓋蓋掉原始 editorial 設計」的模式。

## Grid / Typography / Image-treatment 決策摘要

### 移除巨大 rounded navy card

刪除第 308-380 行整段覆蓋規則，讓工業攝影回到滿版背景疊圖排版（原始設計
本已具備此結構，只是被覆蓋層蓋掉）。桌面版 grid：文字佔 `grid-column: 1/6`
（12 欄制的 5 欄，約 41.7%，向左偏置的 asymmetric 佈局），圖片
`grid-column: 1/13`（滿版）、`z-index: -1`，暖白漸層從左側 98% 不透明
淡出至右側 68% 全透明，讓文字清楚可讀、圖片作為視覺主體而非配圖。

### H1 字級與斷行

- **字級**：從 `var(--fs-h1)`（1440px 下實際渲染約 69px，clamp 上限
  80px）降為 `clamp(2.25rem, 2.6vw, 3rem)`（1440px 下約 37px，1920px 下
  達 clamp 上限 48px），字重從隱含的粗體改為明確 `font-weight: 600`
  （非最粗的 700/900 促銷感），`line-height` 從 1.04（促銷擠壓感）放寬至
  1.28（editorial 呼吸感）。
- **斷行**：文案 `zh-tw.ts` 的手動換行點從逗號後（`把設備、控制與製程，\n
  整合成…`）移除逗號改為純換行控制（`把設備、控制與製程\n整合成可落地的
  自動化系統。`），確保「控制」「系統」等詞語不會被字級壓迫成跨行硬切。
  縮小字級本身也直接解決了 1440px 下「控／制」「系／統」的字元斷裂問題
  （字級縮小後每行可容納完整詞組寬度）。1920px 寬度下因容器變寬、字級達
  clamp 上限，換行點退到「自動化」與「系統」的詞語邊界（非字元內斷裂），
  判定為可接受的 editorial 斷句，非本次要修正的「醜陋拆字」症狀。

### Image placement

工業攝影從「卡片內裁切配圖」改為「滿版背景視覺主體」，`object-position`
維持原有的 64-66%／52% 聚焦設定（保留原始構圖判斷）。桌面版
`min-height: clamp(620px, 52vw, 720px)`，讓圖片有足夠垂直空間承載
「主體」的角色，而非被壓縮進固定比例卡片。

### CTA hierarchy

Secondary CTA 的 `variant` 從 `secondary`（完整邊框按鈕，與 Primary
等重量）改為 `ghost`（`Button.astro` 既有 variant：透明背景、無邊框、
純文字 + hover 底線）。Primary 保留實色按鈕，兩者現在有明確的視覺主次
之分，而非兩顆並列的等重按鈕。

### Disclosure caption

`.hero-root__disclosure`（「品牌概念影像」）從深色背景 pill badge
（`background: rgb(10 16 20 / 78%)`、`border-radius`、`padding`）改為
無背景的低調文字（`color: rgb(255 255 255 / 82%)` + `text-shadow` 確保
在圖片上可讀），維持 `font-family: var(--font-mono)` 的技術標籤感，
但不再是視覺上突出的裝飾徽章。

### Datum hairline

新增 `.hero-root__datum`——一條 2.5rem 寬、2px 高的品牌色 hairline，
置於 eyebrow 上方，呼應 Engineering Editorial Sheet 的座標/基準線語言，
建立輕量的 asymmetry/datum 視覺錨點。取代原本存在但無對應 markup 的死
CSS class `.hero-root__origin`（未新增元件，是既有死代碼的合理復用）。

## 未變更項目（刻意保留）

- Header 未修改。你的問題清單中僅一條提及 Header（「必須減少 generic
  corporate navigation 感」），相對其餘十條具體 Hero 問題更模糊；且
  `Header.astro` 內有大量精心維護的無障礙修復記錄（sticky/backdrop-filter
  containing block bug、zoom-safe height、no-JS fallback），改動風險與
  回報不成比例。判斷本輪聚焦 Hero（你明確定義為「需要重新構圖」的部分），
  Header 留待下一輪視覺驗收後視需要處理。
- 工業攝影素材本身、`object-position` 聚焦點、圖片裁切比例邏輯未變更。
- Body 段落（`hero.body`）字級與斷行未變更，未觀察到你指出的症狀。
- IA、路由、Content Collections、Button/Card 等共用元件的其他 variant
  未變更。

## 檔案變更

- `src/components/sections/Hero.astro`：移除 Commercial navy card 覆蓋層；
  調整 H1 字級/字重/行高（mobile 與 desktop 兩處媒體查詢）；Secondary CTA
  variant 改為 `ghost`；disclosure 樣式從 badge 改為 caption；新增
  `.hero-root__datum` hairline，移除死代碼 `.hero-root__origin`。
- `src/data/locales/zh-tw.ts`：headline 換行點調整（移除逗號後的手動斷行，
  改純換行）。
- 英文版（`en.ts`）headline 未變更文案，僅共用 `Hero.astro` 的字級調整。

## 驗證

- `pnpm check`：0 errors，0 warnings（12 個既有 hint，與本輪修改無關）。
- `pnpm test:e2e`（完整套件，非篩選子集）：**499/499 全數通過**，含
  responsive-overflow（375/768/1440/1920 全部頁面樣板）、axe、seo-meta、
  rfq-form、mobile-nav 等。Hero 重構未造成任何既有功能回歸。

## 狀態

**等待 Human Visual Acceptance。本文件與程式碼修改不構成 FINAL ACCEPTED
宣告。**
