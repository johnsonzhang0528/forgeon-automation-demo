# CASE_STUDY_SCREENSHOT_PLAN.md

供頁構所正式官網案例頁使用的截圖與圖表規劃。實際截圖檔案已產出於
`docs/screenshots/`（本次會話以 Playwright 對 `astro preview` production
build 實際擷取，非設計稿模擬），可直接授權使用或依此清單重新截取
最新版本。

## 已產出截圖（`docs/screenshots/`）

| 檔名 | 內容 | 用途建議 |
|---|---|---|
| `site-home-desktop-zh.png` | 中文首頁，1440×900，Full Page | 案例頁主視覺 Hero |
| `site-home-mobile-zh.png` | 中文首頁，390×844，Full Page | 響應式對照（桌面／手機並排展示） |
| `site-home-desktop-en.png` | 英文首頁，1440×900，Full Page | 雙語能力展示 |
| `site-product-detail-desktop-zh.png` | AXM-400 產品詳細頁，1440×900 | 資訊密度／規格表排版展示 |
| `site-product-detail-mobile-zh.png` | 同上，390×844 | 響應式對照 |
| `site-solution-detail-desktop-zh.png` | 視覺定位自動化組裝完整深度頁，1440×900 | 資訊架構完整度展示（本站密度最高頁面） |
| `site-contact-form-desktop-zh.png` | 聯絡與 RFQ 表單，1440×900 | 轉換流程展示 |
| `site-contact-form-mobile-zh.png` | 同上，390×844 | 響應式表單展示 |
| `site-mobile-nav-open.png` | Mobile Nav 開啟狀態，390×844，Viewport-only | 無障礙／互動細節展示 |
| `site-rfq-form-validation-errors.png` | RFQ 表單驗證錯誤狀態，1440×900 | 表單 UX／錯誤處理展示 |
| `site-rfq-form-demo-result.png` | RFQ 表單 Demo Mode 完成狀態，1440×900 | 誠信原則展示（不假裝送出成功） |
| `datasheet-page-1.png` ～ `datasheet-page-6.png` | AXM-400 規格 PDF 六頁截圖 | 印刷品／文件設計展示 |

## 建議新增截圖（案例頁正式製作時可補充）

1. **Design Tokens 色卡**：直接從 `src/styles/tokens.css` 產生色票／
   字級／間距視覺化圖表（非本次會話產出，建議用 Figma 或簡單 HTML/
   Canvas 腳本重新產生，比純文字 Token 列表更適合案例頁閱讀）。
2. **資訊架構圖**：十個頁面群組的樹狀圖，可用 `docs/CONTENT_MATRIX.md`
   的頁面清單直接轉換為視覺化圖表（Mermaid 或設計工具皆可）。
3. **Before/After 對比**（若頁構所想強調本輪修正的價值）：可用
   `docs/screenshots/site-*.png`（本輪修正後）對比初版建置時的截圖
   （若初版建置階段有留存截圖）；若無初版截圖，可省略此類對比，
   不建議為了對比效果而重新製作「刻意較差」的初版畫面。
4. **Lighthouse 分數卡**：`docs/lighthouse/*.report.html` 可直接在
   瀏覽器開啟並截圖其分數摘要區塊（四個圓形分數指標），比引用 JSON
   數字更適合案例頁的視覺呈現。
5. **axe-core 掃描結果摘要**：可用簡單表格視覺化「14 種頁面類型 ×
   0 Critical ／ 0 Serious」，強調無障礙不是事後補測，而是有实际
   掃描報告支撐。

## 截圖規格慣例（供未來重新截取時參考）

- 桌面：1440×900（符合 `DESIGN.md` 的 `--container-max: 1280px` 內容
  容器寬度，兩側留白適中）。
- 手機：390×844（iPhone 12/13/14 標準尺寸，與 Playwright 測試套件的
  P0.1 驗證 Viewport 一致）。
- Full Page 截圖用於呈現完整頁面資訊架構；Viewport-only 截圖用於呈現
  互動狀態（Mobile Nav 開啟、表單錯誤狀態）避免 `position: sticky`
  元素在 Full Page 截圖中因瀏覽器合成方式而重複出現的視覺假象
  （見 `docs/IMPECCABLE_REVIEW_LOG.md` 方法章節的說明）。
- 所有截圖使用 Demo Mode（預設模式）下的實際渲染結果，畫面中可見
  頁尾「概念專案 · 未開放搜尋索引」徽章與各頁 Demo 資料徽章——案例頁
  使用時建議保留這些徽章可見，作為誠信原則的視覺佐證，而非裁切移除。

## 重新產生截圖的指令

```bash
cd side_project/頁構所/demo-1
pnpm build:noCheck
npx astro preview --port 4321 &
# 於另一個終端機視窗執行客製截圖腳本（範例邏輯見本次會話產生的
# scripts/_tmp_screenshots.mjs，該檔案已於工作階段結束前清除，
# 如需重建可參考 docs/screenshots/ 現有檔名對照表自行撰寫）
```
