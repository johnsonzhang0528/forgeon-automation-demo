# QA_CHECKLIST.md

## 功能

- [x] 全站導覽（Desktop + Mobile）可正常運作，含 Focus Trap 與 Escape 關閉
- [x] 語言切換保留對應頁面（`switchLocalePath` 工具函式；找不到對應頁時
      fallback 至該語言首頁，不導向不存在頁面）
- [x] FAQ Accordion 鍵盤與滑鼠皆可操作，`aria-expanded`／`aria-controls` 正確
- [x] RFQ 表單完整欄位、前端驗證、Demo Mode／Live Mode 雙模式皆已實作
- [x] 分析事件層（`cta_click`／`rfq_start`／`rfq_submit`／`product_view`／
      `solution_view`／`spec_download`／`language_switch`／`contact_click`）
      已建立，`window.dataLayer` 不存在時不報錯（已於程式碼中 try/catch 確認）
- [x] 規格 PDF 下載連結指向真實存在的 placeholder 檔案（非 404）
- [x] 內部連結檢查：48 個頁面、0 個失效連結（見下方「連結檢查」章節）

## 響應式（實際測試方式：CSS 斷點審視 + built HTML 結構檢查，非真實裝置雲測試）

- [x] 360px：行動選單抽屜寬度 `min(88vw, 360px)`，不溢出視窗
- [x] 390px：規格表 `560px` 以下切換為堆疊式讀法，避免橫向捲動
- [x] 768px：卡片網格 `grid-auto` 自動換行（`minmax(min(100%,280px),1fr)`）
- [x] 1024px：桌面導覽於 `960px` 已啟用，此寬度下 Header 顯示完整導覽列
- [x] 1280px：主要容器 `--container-max` 生效，內容不過寬
- [x] 1440px：`--container-wide` 供全出血背景區塊使用
- [x] 1920px：容器最大寬度受控，不會無限延展導致行寬過長
- [x] 長英文字串（如 "Vision-Guided Automated Assembly"）於卡片與麵包屑
      中以 `overflow-wrap: break-word` 處理，不破版
- [x] 中文長標題未見異常斷行（CJK 字體無強制連字號斷行問題）

## SEO

- [x] 每頁唯一 Meta Title／Description（見 `docs/CONTENT_MATRIX.md`）
- [x] Canonical URL（`SEOHead.astro`）
- [x] Open Graph + Twitter Card
- [x] `hreflang`（zh-Hant-TW / en / x-default）
- [x] 語意化 HTML（header/nav/main/footer/article/section）
- [x] Breadcrumb（視覺 + `BreadcrumbList` JSON-LD）
- [x] `sitemap.xml`（動態產生，涵蓋全部 48 個頁面路徑）
- [x] `robots.txt`（允許全站，指向 sitemap）
- [x] 結構化資料：Organization、WebSite（全站）；BreadcrumbList（各內頁）；
      FAQPage（僅視覺定位自動化組裝詳細頁，因為只有該頁真正有 FAQ 內容，
      符合指令 §21「只有內容真正符合時才輸出 Schema」）；Article（2 篇 Insights）
- [x] 未輸出 Product Schema：因產品規格為 Demo 展示資料非真實可購買商品，
      刻意不輸出可能被解讀為電商報價的 Product/Offer Schema，避免誤導搜尋引擎

## 無障礙（基礎檢查，非正式 WCAG 稽核 —— 見下方限制說明）

- [x] Skip Link（可鍵盤 Tab 觸發，`:focus` 顯示）
- [x] 所有互動元素具備可見 `:focus-visible` 外框
- [x] 表單欄位皆有對應 `<label>`，錯誤訊息以 `role="alert"` 宣告並透過
      `aria-describedby` 關聯
- [x] Mobile Nav 具備 `aria-expanded`／`aria-controls`／Focus Trap／Escape 關閉
- [x] FAQ Accordion 具備正確 ARIA（`aria-expanded`、`aria-controls`、
      `role="region"`）
- [x] 所有圖片具備 `alt`；純裝飾 SVG 使用 `aria-hidden="true"`
- [x] 不僅依賴顏色傳達資訊（表單錯誤同時有文字說明，非僅邊框變色）
- [x] `prefers-reduced-motion: reduce` 已於 `tokens.css`／`global.css` 全域套用
- [x] 無自動播放有聲內容（站內無影音元素）
- [ ] **未執行**：真實螢幕閱讀器（NVDA/VoiceOver）人工操作測試、真實鍵盤
      操作端到端走查、色彩對比儀器實測（僅以 Design Token 色值肉眼審視）
- **因此本站不對外宣稱完全符合 WCAG 2.2 AA**（符合指令 §24 規定：
  「沒有完整人工稽核時，不得公開宣稱完全符合 WCAG 2.2 AA」），
  站內與文件皆未做此宣稱。

## 效能

- [x] 全站靜態 HTML（Astro 預設輸出，無 SSR runtime）
- [x] 最少 JavaScript：僅 Header／FAQAccordion／ContactForm／LanguageSwitcher／
      AnalyticsBridge 少量原生 `<script>`，無前端框架 Bundle
- [x] 圖片皆為向量 SVG（無點陣圖，無需響應式多尺寸圖檔），皆設定明確尺寸避免 CLS
- [x] 無第三方阻塞腳本（GTM/GA4 僅在環境變數提供 ID 時才注入，且以
      `is:inline` 方式延後而非阻塞渲染）
- [ ] **未執行**：真實 Lighthouse CLI 執行（本沙盒環境無 Chrome/Playwright
      可用瀏覽器，見下方「已知限制」）。以架構特性（純靜態 HTML、零框架
      JS、向量圖形、零阻塞第三方腳本）合理預期可達成 §23 目標區間，
      但**未經實測數字驗證，不對外宣稱具體 Lighthouse 分數**。

## 表單

- [x] 必填欄位前端驗證（公司名稱、姓名、Email、國家、產業、專案類型、需求說明）
- [x] Email 格式驗證（正則）
- [x] 需求說明最小字數驗證（20 字）
- [x] 隱私權同意為必填，未勾選會擋下送出並提示
- [x] 送出中／成功／失敗三種狀態皆有對應 UI（`role="status"`／`aria-live`）
- [x] 防止重複送出（`isSubmitting` 旗標鎖定按鈕）
- [x] Demo Mode 明確標示，且验证通过后不假裝「已送出成功」，而是清楚說明
      「示範模式已模擬驗證流程，資料未實際送出」
- [x] 鍵盤可完整操作全部欄位（原生 `<input>`/`<select>`/`<textarea>`，
      無自訂元件破壞原生 Tab 順序）

## 語言

- [x] `<html lang="">` 正確設定（zh-Hant-TW / en）
- [x] 語言切換器保留對應頁面路徑
- [x] 中英文各自獨立 Meta Title／Description（無共用）
- [x] 英文非逐字直譯，依英文語感重新組織句子結構

## 部署前檢查

- [x] `pnpm astro build` 成功，0 錯誤
- [x] `pnpm astro check`（TypeScript strict）成功，0 錯誤（2 個 `is:inline`
      資訊性 hint，非錯誤，為預期行為）
- [x] 內部連結檢查（自製腳本掃描 48 個 HTML 檔案）：0 個失效連結
- [x] 無 Lorem ipsum（已 grep 全站確認）
- [x] 無遺留 TODO/FIXME（已 grep 全站確認）
- [x] 所有假資料皆有 `demoData: true` 標記與頁面可見揭露文字
- [ ] Console Error 檢查：**未執行真實瀏覽器 Console 檢查**（沙盒環境無
      瀏覽器可用），已改以靜態程式碼審視方式確認無明顯執行期錯誤來源
      （無未定義變數存取、無假設不存在 DOM 節點的直接操作——皆有 null 檢查）

## 已知限制（誠實揭露，非隱藏）

本次建置在無圖形化瀏覽器、無 Playwright/Chrome、無使用者 Higgsfield 帳號
登入的沙盒背景執行環境完成。以下項目**未能實測**，記錄於此以利未來使用者
在有瀏覽器的環境中補測：

1. 真實 Lighthouse Performance/Accessibility/Best Practices/SEO 分數
2. 真實螢幕閱讀器操作驗證
3. 真實 Chrome/Edge/Firefox/Safari 渲染差異比對（僅以標準 CSS 特性
   相容性認知撰寫，例如 `color-mix()` 屬較新 CSS 特性，主流瀏覽器
   已支援，但未實測舊版本 fallback 行為）
4. Higgsfield 付費素材生成（計畫性未執行，見 `docs/HIGGSFIELD_ASSET_PLAN.md`）

建議使用者在部署前於本機或 CI 環境執行：
`pnpm build && pnpm preview`，並使用真實瀏覽器搭配 Lighthouse／axe DevTools
補完上述測試項目。
