# 03 · Polish Log（Taste Redesign 執行紀錄）

記錄日期：2026-08-21
角色：Taste Redesign（Existing-site Surgeon）—— Scan → Diagnose → Fix，
依 P0 → P1 → P2 順序執行，禁止整站推翻/換 framework/改 IA。

## 執行摘要

| 項目 | 優先級 | 狀態 | 說明 |
|---|---|---|---|
| Section 骨架同質化（Solutions/Industries） | P1 | ✅ 已修正 | 見下方詳述 |
| 產品卡片圖片色塊佔位 | P1 | ❌ 誤判撤銷 | 見 `02-redesign-diagnosis.md` IMPROVE 2 修正紀錄 |
| Lazy-load 深色 placeholder 觀感 | P2 | ⏸ 暫不處理 | 見下方「未處理項目」 |
| 英文 CTA 按鈕換行（375） | P2 | ✅ 已覆核，非缺陷 | 見下方「已覆核非缺陷」 |

## P1-1：Section 骨架同質化（已修正）

**問題**：`src/styles/home-refinement.css` 原本存在一段有意義的 editorial
列表版面設計（分隔線、無圓角），但被檔案末尾一段「Rounded category blocks
for the navy/white commercial direction」的 `!important` 覆蓋整個蓋掉，導致
Solutions/Products/Industries/Fit/Path 五個連續 section 全部呈現為同一種
圓角配色卡片網格，違反 Reference Lock（Terminal Industries）「section 骨架
刻意變化」的方向。

**處理過程**（含一次自我修正）：
1. 第一輪嘗試：移除整段覆蓋，讓底層 editorial 列表樣式對五個 section 全部
   生效。
2. 截圖驗證時發現 Fit-card（頂部色條區分適合/不適合）與 Path-card（hover
   陰影可點擊卡片）在 `index.astro` 的 scoped `<style>` 裡各自有明確的原生
   設計語意，全部拉平會抹除這些設計決策，是不必要的破壞。
3. 修正範圍：只保留 Solutions 與 Industries 改為 hairline-divider 列表
   （兩者原本就是純重複卡片網格、無獨立語意），撤銷對 Fit-card/Path-card/
   Why-item 的覆蓋，讓它們的原生設計繼續生效。

**最終改動**：`src/styles/home-refinement.css`
- 移除檔案末尾整段「Rounded category blocks」`!important` 覆蓋。
- 為 `.solution-index .card` 與 `.industry-index .card` 加上針對性的
  `border-radius: 0 !important`，以對抗 `global.css` → `brand-refresh.css`
  的全站 `.card { border-radius: var(--radius-md) !important }` 規則。
- 清理因此變成無意義的 media query 殘留規則（`main .fit-grid`、
  `main .path-card` 相關的響應式覆蓋，因為底層樣式已還原不再需要）。
- `.product-showcase .card` 的圓角保留（純視覺美化，不影響骨架多樣性，
  且該區塊本身已有不對稱大圖卡的獨立骨架）。

**結果**：首頁 section 骨架序列變為 Hero → Capability → **Solutions（列表）**
→ Products（不對稱大圖卡）→ **Industries（列表）** → Fit（色條卡片）→
Path（hover 卡片）→ Process → Why us → CTA，五種不同骨架交錯出現。

**驗證**：
- `pnpm check`：0 errors，0 warnings（12 個既有 hint，與本次修改無關）。
- `pnpm build`：57 頁面全部建置成功，exit code 0。
- Desktop（1440）與 mobile（375）皆用正確 dev server port（4326）與
  production preview（4400）重新截圖確認，無破版、無 overflow。

## P1-2：產品卡片圖片色塊佔位（誤判撤銷）

第一版診斷基於錯誤 dev server port（4321，指向無關站點）誤判產品卡片使用
色塊/簡易圖形。用正確 port 重新截圖後確認 AXM-400／VISION-X2／FLEXCELL-M
三張產品卡片本身就是高品質實景攝影，與其餘 section 一致，不存在此問題。
未做任何程式碼修改。詳見 `00-baseline.md`「方法論事故」與
`02-redesign-diagnosis.md` IMPROVE 2 的修正紀錄。

## P2 項目

### 已覆核，非缺陷：英文 CTA 按鈕換行

375 寬度下 Hero 的兩個英文 CTA 按鈕確實換行成兩行。追查發現這是
`Hero.astro` 內刻意的 `@media (max-width: 400px)` 降級規則（按鈕撐滿寬度、
允許換行，避免文字被壓縮），中文文案短不會觸發、英文文案長仍可能換行，
屬既有設計決策與文案長度的自然結果，按鈕完整可讀可點擊，不列入修改範圍。

### 已驗證，確認不需處理：Lazy-load 深色 placeholder 觀感

六個 section 級圖片元件（`AutomationIntegrationVisual`、
`FieldCommissioningVisual`、`ControlEngineeringVisual`、
`MachineVisionInspectionVisual`、`PrecisionHandlingVisual` 及 Hero 本身）
共用 `background: var(--color-steel-900, #151a1e)` 作為圖片載入前的深色
placeholder。

**驗證方式**：用 Playwright 模擬真實使用者的滾輪滾動節奏（每 60ms 滾動
150px，非程式化瞬間跳轉），在圖片區塊剛進入 viewport 的當下立即檢查
`<img>` 狀態。

**結果**：`{"complete":true,"naturalWidth":1180}`——圖片在到達該區塊時
已完成載入，深色 placeholder 從未在正常滾動速度下被使用者看見。先前
在方法論註記中觀察到的深色色塊，只在程式化快速跳轉截圖（`scrollTo` 瞬移）
情境下才會出現，不是真實使用者會遇到的體感問題。

**結論**：確認不修改，不列入 Impeccable 階段工作項目。

## 未動到的範圍（刻意保留）

- Products／Fit-grid／Path-grid／Why-item 的原生卡片設計（圓角、hover
  陰影、色條語意）——各自有獨立於「重複卡片網格」的設計價值，不在
  P1-1 範圍內。
- 六個 Brand Primitive 元件與 `ProcessRail.astro`——維持 orphaned 狀態，
  不重新引入正式頁面。
- 色彩 token 命名（`--color-copper-600` 實際是藍色）——技術債，非本輪
  UI/UX 視覺升級範圍。
