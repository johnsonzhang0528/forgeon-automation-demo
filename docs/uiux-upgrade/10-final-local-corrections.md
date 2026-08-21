# 10 · Final Local Correction Pass

記錄日期：2026-08-22
觸發原因：Human Visual Acceptance 判定 Full-page Art Direction／Hero／
Product B Moment／Fit-Path／Process／Ending／Header 全部 PASS，Hero 與
Header 額外標記 FREEZE。本輪僅允許三項極窄範圍的局部修正，禁止任何
redesign、新 section、新 UI pattern。**未自行宣告 FINAL ACCEPTED，
等待 Human Final Acceptance。**

## LC-01：Compact Section Heading Calibration

`SectionHeading.astro` 的 `compact` 標題字級從 `var(--fs-lg)`
（clamp 上限 22px）調整為 `clamp(1.25rem, 1.7vw, 1.55rem)`（上限
24.8px，+12.7%），並將 `font-weight` 明確設為 700。落在要求的
10-15% 範圍內，未恢復 48-56px 巨型標題。

## LC-02：Vertical Transition Tightening

僅檢查任務書指定的兩處：
- **Solutions → Products**：實測 gap 為 0px（背景色交替直接銜接），
  無意外留白，未調整。
- **Product plate ending → next section**：實測「比較完整產品規格」
  連結下方到 Products section 結束有 173px（`--section-major` 的
  `padding-bottom`，clamp 上限 176px），對比上方 heading→visual 的
  正常 48px，明顯頭輕腳重。新增 `.product-signature` class 只覆蓋
  這個特定 section 的 `padding-bottom` 為
  `clamp(98px, 9.8vw, 145px)`（較原 clamp 值縮減 17.6-18.3%，同一
  響應式曲線比例）。`utilities.css` 的共用 `.section-major` token
  與其他潛在使用者不受影響。其他 section 間的 whitespace 未動。

## LC-03：Product Anchor Framing

AXM-400 dominant anchor 右側資訊欄沿用 `ProductCard.astro` 預設的
`padding: var(--space-lg)`（四邊），與滿版無邊框的圖片相比顯得像獨立
浮動的白色卡片。未重構 markup，只在 `home-refinement.css` 針對
`.product-plate__anchor .product-card__body` 覆蓋
`padding-inline: 0 var(--space-lg)`（左側貼齊圖片、右側保留邊界）、
`padding-block: var(--space-2xs)`（原 `--space-md`，收斂上下留白），
讓文字資訊欄的左緣與圖片視覺基準對齊，anchor 與 pair 讀成同一個
plate 的延伸而非拼接的獨立卡片。

## 未觸碰範圍

Hero、Header（依 FREEZE 標記，本輪完全未修改任一者的任何檔案）、
Process、Fit/Path 的既有 markup 與 CSS 架構、Solutions/Industries 的
既有結構、CTABanner 的整體佈局（LC-02 未涉及 Ending 區塊本身）。未新增
任何 section、卡片樣式、圓角、陰影、漸層、badge、裝飾性動效。

## 驗證

- `pnpm check`：0 errors，0 warnings。
- `pnpm build`：57 頁面成功。
- `pnpm test:e2e`（完整套件）：**499/499 全數通過**。
- `pnpm test:axe`：15/15，0 Critical/Serious。
- 375/768/1440/1920 四種 viewport 皆確認 `scrollWidth === clientWidth`
  （無水平溢出），視覺巡覽無破版。

## 交付 Screenshot

- `docs/screenshots/uiux-upgrade/fullpage-lc-1440.png`
- `docs/screenshots/uiux-upgrade/fullpage-lc-1920.png`
- `docs/screenshots/uiux-upgrade/fullpage-lc-768.png`
- `docs/screenshots/uiux-upgrade/fullpage-lc-375.png`

## 狀態

**等待 Human Final Acceptance。本文件與程式碼修改不構成 FINAL
ACCEPTED 宣告。**
