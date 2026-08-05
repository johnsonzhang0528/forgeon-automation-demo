# CC-02F ChatGPT Review — Handoff

## 1. 專案名稱

鋒岳自動化 / FORGEON AUTOMATION — 頁構所市場驗證概念網站（虛構公司，Astro +
TypeScript strict，雙語 zh-tw/en）。

## 2. Base 與 Head

- **CC02F_BASE**：`fbd8513c1350a9728a5754ad6092439df3368c99`
- **HEAD（本文件寫成時）**：`7fca36d377cca2fe98037f06cb5ab249130300cf`
- 三個 Commit：`95c4ff3`（Tooling 隱私修正）、`73d9e2d`（Spec/Tickets 文件）、
  `e273abe`（Final Hero Prototype 實作）、`7fca36d`（E2E 測試）。

## 3. 外部方向決策（context，本輪不重新討論）

使用者本地 ChatGPT 審查 CC-02 Bundle 後選定 **Variant C — Engineering
Editorial Sheet** 為最終方向，推翻內部建議（原偏好 Variant A）。理由：
Variant A 過於接近一般企業網站排版；Variant B 依賴尚未產出的 CGI 素材，
無法在本階段證明產品品質，其暗色舞台語彙保留給未來可能的「Product
Assembly」區塊，不重新引入本輪 Hero。Variant A 的 INPUT→ALIGN→INSPECT→
ASSEMBLE 流程軸則被吸收進 C+（改為 INPUT→EVALUATE→CONFIGURE→VERIFY /
需求輸入→方案評估→模組配置→驗證條件）。

## 4. 文案變更

新檔案 `src/data/cc02-final-hero.ts`，逐字採用 Spec §8 文案（與 CC-02 舊
`_shared/copy.ts` 完全分離，兩份文案並存，互不覆蓋）：

- zh-tw H1：`把定位、檢測與組裝，\n校準成可導入的生產流程。`
- en H1：`Align positioning, inspection and assembly\ninto a
  production-ready system.`
- 完整 Eyebrow/Body/CTA 見該檔案。

## 5. 假數據移除

`±0.01 mm`、`< 180 ms`、`3 型號可組合`（及英文對應）已從 C+ 完全移除，改為
`EvaluationLedger` 元件呈現方法／交付資訊（需求輸入／評估範圍／交付輸出，
zh-tw 與 en 皆有）。`grep -F` 對兩個 build 後 HTML 檔案驗證：0 命中。
`comparison-c-vs-final.png` 直接並排展示新舊差異。

## 6. Header 修正

新 `FinalPrototypeHeader.astro`：語言切換控制項改為真實路由 `<a href>`
（`/internal-preview/cc02-final/{zh-tw,en}/`），移除方框邊框改為純文字＋
Hover 底線，視覺重量明顯低於品牌字標；仍保持 44×44px 最小點擊區（實測
52×61px）。桌機高度 80px、手機 64px（實測）。

## 7. Desktop／Mobile 構圖

12 欄網格：DatumOrigin 於第 1 欄、H1 跨 1-9 欄、Copy 欄改為 1-5（而非字面
1-6，避免與 Visual 欄重疊，詳見 Impeccable Review 第 14 節「已修正問題
#6」）、Primary Visual 5-12 欄並向外溢出 24-48px、Secondary Visual
9-14 欄。Mobile 使用 CSS `order` 讓 Primary Visual 排在 Evaluation
Ledger 之前，確保視覺提前出現。

## 8. PrecisionSystemVisual 說明

全新原創 SVG 元件（`src/components/prototypes/cc02-final/
PrecisionSystemVisual.astro`），描繪三個沿同一組裝軸排列的實體站點（精密
運動模組、視覺定位頭、組裝工作站）並附輸入→輸出方向箭頭。使用線性/放射
漸層、hatching pattern、clip-path 分層，無任何藍紫光暈／霓虹／玻璃擬態
效果。非 Higgsfield 素材（本輪全程未使用），亦非重用 CutawayWindow 的
「NO MEDIA」佔位路徑。

## 9. Process Rail

建於既有 `AssemblySpine.astro` 之上（非四張卡片），第一步驟顯示 Copper
（`connected` 狀態），其餘為 Steel。鍵盤可達（`tabindex="0"` + 真實
`aria-label`），Playwright 測試確認可直接 Focus。

## 10. Motion

Datum Origin 展開 → 模組沿軸線對齊 → Vision Lock 完成，皆使用既有 Brand
Primitive 的 transform/opacity/stroke 動畫，總時長落於既有 Token
（`--duration-section` 480ms + 分階段 delay）組成的 ~800-1000ms 區間內。
Reduced Motion 下 150ms 內達到 `is-settled` 完成態，`reduced-motion.png`
為證據截圖。

## 11. Tests（pass/fail 與實際數字）

- `pnpm check`：0 errors / 0 warnings / 12 hints（既有已知 hint）。
- `pnpm build`：57 頁，0 errors。
- `check:h1`：57 個 HTML、2 個排除、**55/55 pass**。
- `check:links`：**2072/2072** 內部連結無失效。
- `check:locale-routes`：**141/141** hreflang 無失效；Insights Slug
  對稱 2/2。
- `pnpm test:e2e`：**253/253 passed**（含新增 31 項 CC-02F 測試）。
- `pnpm test:axe`：**15/15 passed**（正式頁面套件；CC-02F 專屬 axe
  測試另計於 test:e2e 中，desktop+mobile×2 locale 皆 0 Critical/0
  Serious）。
- `bash tests/tooling/review-bundle.test.sh`：**29/29 passed**（原
  20/20，CC-02F-00 新增 9 項）。

## 12. Impeccable 摘要

完整內容見 `docs/engineering/reviews/CC-02F-impeccable-review.md`。關鍵
數字：H1 行數 zh 2-4 行／en 3-4 行（皆在上限內）；Primary/Secondary
Visual 面積比 0.27-0.38（讀作線性尺寸則落在 spec「小 35-50%」區間）；
Header 語言控制 52×61px；對比：H1 17.16:1、Eyebrow/CTA 6.06:1、內文
5.21:1（皆為既有已驗證 Token，無新配對）。過程中發現並修正 6 項真實排版
缺陷（詳見該文件第 14 節），包含 Primary Visual 起始位置過低、英文 H1
換行過多、「組裝」被斷字、Secondary Visual 過小且遮蔽第三站、英文次要
CTA 被 Visual 遮蔽。

## 13. Screenshots

`docs/screenshots/cc02-final/`，共 11 張，皆由 Playwright 對執行中的
`astro preview` 即時擷取：

```
zh-desktop.png / zh-tablet.png / zh-mobile-390.png / zh-mobile-360.png
en-desktop.png / en-tablet.png / en-mobile-390.png / en-mobile-360.png
visual-detail.png / reduced-motion.png / comparison-c-vs-final.png
```

尺寸：1440×900 / 768×1024 / 390×844 / 360×800。

## 14. Known Limits

- Secondary Visual 面積比的「35-50% smaller」解讀為線性尺寸縮小（非
  面積），因 Spec 原文對此有歧義，已在 Impeccable Review 明確記錄採用
  的解讀方式。
- PrecisionSystemVisual 目前為 SVG／CSS 構成，非攝影或 CGI 素材 —— 見
  `docs/DATUM_ASSET_PLAN_CC02F.md` 對應的未來（非本輪）強化計畫，本輪
  未提交任何生成請求。
- `railLabel`（Process Rail 的 `aria-label`）以行內三元運算子而非集中於
  `cc02-final-hero.ts` 撰寫（規模過小，未特別抽取），為已知、非阻斷性的
  風格差異。
- Contrast 量測腳本對 Header 半透明背景色的偵測邏輯有已知限制（誤判為
  低對比），但 axe-core 針對同一頁面已獨立確認 0 Critical/0 Serious，
  含 `color-contrast` 規則，故該量測腳本限制不影響實際結論。

## 15. 正式整合前尚待決定事項

- ChatGPT 是否核准 C+ 作為最終上線方向，或要求再一輪調整。
- Secondary Visual 面積比的線性 vs. 面積解讀是否需要進一步收斂數值。
- 是否／何時執行 `docs/DATUM_ASSET_PLAN_CC02F.md` 的未來 CGI 強化計畫
  （本輪明確不執行）。
- 本輪未整合任何內容進正式首頁／正式 Header，亦未執行 CC-03——這些決定
  仍完全保留給使用者。
