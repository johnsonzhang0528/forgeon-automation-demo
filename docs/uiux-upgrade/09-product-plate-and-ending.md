# 09 · Targeted P1 Pass — Product Plate, Heading Calibration, Rhythm, Ending

記錄日期：2026-08-21
觸發原因：Human Visual Acceptance 判定「整頁 composition 已明顯改善」，
Hero／Capability／Fit-Path／Process／Why-us 架構已接受並禁止重新設計。
本輪範圍嚴格限定在四個 P1，不做逐 section redesign。**未自行宣告 FINAL
ACCEPTED，等待人工視覺驗收。**

## P1-1：Product B Moment

**問題**：即使拿掉圓角卡片，AXM-400（大圖滿版一行）+ VISION-X2/
FLEXCELL-M（兩欄並排在下一行）仍是「featured card + two cards」的
product catalog 結構，三者是三個獨立方塊，中間有明顯的過大留白斷裂
（`.product-showcase` 用 `grid-template-columns: repeat(2, 1fr)`，
AXM-400 `grid-column: 1/-1` 撐滿整行後另起一行）。

**處理**：markup 從「map 三個同等的 ProductCard」改為明確拆分
`productAnchor`（陣列第一項，`data.order` 排序保證恆為 AXM-400）與
`productPair`（其餘兩項）。新增 `ProductCard` 的 `dominant` prop
（opt-in，不影響其他呼叫點），只放大 anchor 的標題/定位語/描述字級
（`--fs-xl`/`--fs-md`/`--fs-md`），不改變元件結構本身。CSS 從
`.product-showcase` 改為 `.product-plate`：
- Anchor 保持「大圖 + 文字」左右並排（`1.3fr / 1fr`），圖片與文字量都
  明顯大於次要組。
- Pair 改為緊湊橫向索引列——小圖（`7-9rem` 寬）+ 標題 + 定位語 + 兩行
  截斷描述（`-webkit-line-clamp: 2`，內容仍在 DOM 中，只是視覺截斷，
  非刪除）並排一行，取代原本的「垂直堆疊卡片」。
- Anchor 與 Pair 之間、Pair 內部各項之間都改為 hairline 分隔（延續
  Solutions/Industries 已建立的語言），不再有大留白斷裂。

三者現在透過**共享的排版規則**（相同字體家族、相同 Demo 標示位置、相同
連結樣式、相同 hairline 分隔）與**明確的比例差異**（anchor 圖片/字級
顯著大於 pair）讀成一個構圖，而非三個可互換的卡片。

## P1-2：Section Heading Calibration

**問題**：上一輪 `compact` 模式把標題壓到 `--fs-md`（~18px）、eyebrow
與標題間距壓到 `0.3em`、拿掉 datum 線，過度收斂導致標題在大圖片旁邊
幾乎沒有存在感，讀不出「這是一個章節入口」。

**處理**：只調整比例，不恢復巨型標題：
- 標題字級 `--fs-md` → `--fs-lg`（~22px，仍遠小於全域 `h2` 的
  `--fs-h2` ~50px）。
- eyebrow-標題間距 `0.3em` → `0.55em`，`margin-bottom` `--space-lg` →
  `--space-xl`，讓標題群組不再與正文黏在一起。
- Datum 線恢復顯示，但縮短為 `1.5rem`（完整版是 `2.25rem`）——輕量但
  可辨識的視覺錨點，不是完全消失。

## P1-3：Vertical Rhythm Audit

逐段量測（Playwright bounding box）而非目測：Capability／Solutions／
Industries／Fit-Path／Process 各 section 的 `padding-block` 均為
`--section-compact`（72px，clamp 上限），section 之間的實際 gap 為
0-1px（背景色交替 + hairline 銜接，符合設計）。內部間距（標題→圖片
48px、圖片→內容 48px）也在合理範圍。**唯一的意外過大留白已在 P1-1
修正**（Products 內部 anchor/pair 之間原本的斷裂感）；Products 本身的
`section-major`（172.8px 上下）是刻意保留的章節分隔，用來標記這是頁面
的中段高潮，不屬於「意外」範疇，未縮減。未做任何全域 spacing 壓縮。

## P1-4：Trust / Conversion Ending

**問題**：`CTABanner` 原本是「標題靠左 + 兩顆完整按鈕靠右」的
`justify-content: space-between` 水平佈局——這是最典型的行銷 CTA
banner 公式。且 `Footer` 有 `margin-top: var(--space-3xl)`，與同樣是
深色背景的 CTA banner 之間留了一段白色斷裂，形成「深色卡片飄在白色
空間裡，後面又接一塊深色」的不連貫觀感。

**處理**：
- **Typography／button placement**：CTA 內部改為單欄垂直堆疊、左對齊
  ——datum 標籤 → 標題 → 說明 → 按鈕群依序往下，不再是左右對齊的兩欄
  公式。標題字重明確設為 600（非最粗)、`line-height: 1.2`。
- **Datum**：新增 `.cta-banner__datum`（「從這裡開始 · 提交需求」，
  copper 色 mono 字），呼應全站已建立的 eyebrow/datum 語言，並保留原有
  頂部 copper 色 `border-top` 細線。
- **按鈕層級**：Secondary 按鈕（`secondary-invert` variant 的
  call-site override）從完整白邊框按鈕改為透明底、無邊框，只在 hover
  時加底線——與 Primary 的實色按鈕形成明確主次，呼應 Hero 已建立的
  「一顆實色 + 一顆文字連結」語言。
- **Why-us / Footer transition**：`CTABanner` 移除底部 `margin-block`
  （改為只有 `margin-top`），並透過 `BaseLayout` 既有的 `bodyClass` 
  prop 機制，只在首頁（`bodyClass="home-dark-ending"`）用
  `:global(body.home-dark-ending .site-footer) { margin-top: 0; }`
  移除 Footer 的預設頂部間距——**只影響首頁**，其他 17 個共用
  `CTABanner`/`Footer` 的頁面維持原本的正常間距，不受影響。CTA 與
  Footer 現在同色無縫銜接，讀成一個連貫的深色收尾段落。

## Header

依授權範圍「僅允許 alignment / spacing / interaction micro-adjustment」
——本輪對 Header **完全未做任何新修改**（上一輪已將右側 CTA 從藍色圓角
pill 改為直角邊框按鈕，本輪核實該改動本身只動了顏色/圓角 token，未涉及
layout/spacing/尺寸，判斷已符合本輪 Header 授權邊界，不重複處理）。

## 重要缺口揭露：中英文版本已不同步

在處理 P1-4 時發現：**`src/pages/en/index.astro` 從未被本輪或前幾輪
的任何 Hero／Products／Fit-Path／Why-us／CTA 重構觸碰過**，目前仍是
最原始的 `product-showcase`／`fit-grid`／`path-grid`（圓角卡片）結構，
`SectionHeading` 呼叫也都沒有 `compact`。`home-refinement.css` 裡
`.product-showcase`／`.fit-grid` 等舊選擇器的規則因此被刻意保留未刪除
——它們現在是英文版首頁唯一還在用的樣式來源，移除會直接讓英文版破版。

這不是本輪引入的新問題，是過去幾輪工作範圍从未涵蓋 `en/index.astro`
的既有缺口。所有截圖驗收指令都明確指向 `zh-tw` 首頁，本輪判斷不擅自
擴大範圍去同步英文版（那是未經授權的額外大改動），但在此如實記錄，
供你决定是否需要另外安排一輪處理。元件層級的改動（`Hero.astro`、
`CTABanner.astro`、`ProductCard.astro`、`SectionHeading.astro`、
`Header.astro`）**會**自動套用到英文版（因為是共用元件），只有
page-level 的 markup 重構（Fit+Path 合併、Why-strip、Product Plate 的
wrapper markup）不會反映到英文版。

## 驗證

- `pnpm check`：發現並修正了 4 個 TypeScript 錯誤（`products[0]`
  在 `noUncheckedIndexedAccess` 下型別為 `Product | undefined`），改用
  陣列解構 + 執行期 `if (!productAnchor) throw` 讓型別正確窄化。修正後
  0 errors，0 warnings。
- `pnpm build`：57 頁面成功。
- `pnpm test:e2e`（完整套件）：**499/499 全數通過**。
- `pnpm test:axe`：15/15，0 Critical/Serious。

Technical QA 通過不取代 Human Visual Acceptance。

## 交付 Screenshot

- `docs/screenshots/uiux-upgrade/fullpage-p1-1440.png`（1440 full-page）
- `docs/screenshots/uiux-upgrade/section-product-plate.png`（Product B
  Moment 局部）
- `docs/screenshots/uiux-upgrade/section-ending.png`（Why-us → CTA →
  Footer 收尾局部）

## 狀態

**等待 Human Visual Acceptance。本文件與程式碼修改不構成 FINAL
ACCEPTED 宣告。**
