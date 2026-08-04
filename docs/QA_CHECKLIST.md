# QA_CHECKLIST.md

> **2026-08 修正 Pass 更新**：本文件初版建置時的許多「未執行」項目
> （真實瀏覽器測試、Lighthouse、axe-core）在本輪修正中已**實際執行**。
> 舊版聲明保留於各節末尾的「初版建置時的已知限制」供對照，新增結果
> 標註於各節開頭。完整方法論、指令與逐項數字見
> `docs/CODEX_REVIEW_HANDOFF.md`。

## 功能

- [x] 全站導覽（Desktop + Mobile）可正常運作，含 Focus Trap 與 Escape 關閉
      **（本輪已用 Playwright 實際互動驗證，非僅程式碼審視——過程中發現
      並修正 Mobile Nav 背景未真正 Inert 的真實缺陷，見
      `docs/IMPECCABLE_REVIEW_LOG.md`）**
- [x] 語言切換保留對應頁面（`switchLocalePath` 工具函式；找不到對應頁時
      fallback 至該語言首頁，不導向不存在頁面）**（已用
      `scripts/check-locale-routes.mjs` 建置期驗證 141 個 hreflang 連結，
      0 個失效；並用 Playwright 實際點擊語言切換器驗證產品頁與 Insights
      文章頁）**
- [x] FAQ Accordion 鍵盤與滑鼠皆可操作，`aria-expanded`／`aria-controls` 正確
      **（已用 Playwright 實際點擊與鍵盤 Enter 驗證）**
- [x] RFQ 表單完整欄位、前端驗證、Demo Mode／Live Mode 雙模式皆已實作
      **（已用 Playwright 端到端驗證 Text／Email／Select／Radio-group／
      Checkbox 全部錯誤路徑，含 `aria-invalid` 正確設定）**
- [x] 分析事件層（`cta_click`／`rfq_start`／`rfq_submit`／`product_view`／
      `solution_view`／`spec_download`／`language_switch`／`contact_click`）
      **本輪修正前 `product_view`／`solution_view`／`contact_click` 為
      宣告但從未觸發，已修正為真正觸發，完整事件表見
      `docs/ANALYTICS_EVENT_SPEC.md`**
- [x] 規格 PDF 下載連結指向真實、有效、可選取文字的 6 頁 PDF
      （`forgeon-axm-400-datasheet.pdf`，取代先前 899-byte Placeholder，
      已用 `pdfinfo`／`pdftotext` 驗證）
- [x] 內部連結檢查：50 個頁面（含本輪新增 `/privacy/` 雙語頁）、
      **1951 個內部連結、0 個失效連結**（`node scripts/check-links.mjs`）

## 響應式（本輪已用 Playwright 於真實 Chromium 對 7 個必要 Viewport 實測）

- [x] 360×800、390×844、768×1024、1024×768、1280×800、1440×900、
      1920×1080 × 14 種頁面類型（首頁×2 語言、方案總覽、方案詳細頁、
      產品總覽、產品詳細頁、產業總覽、產業詳細頁、About、Insights 總覽、
      文章詳細頁、Contact、Privacy、404）＝ 98 組組合，**全數
      `scrollWidth <= clientWidth`，0 個橫向溢位**（`tests/e2e/responsive-overflow.spec.ts`）
- [x] 390px：手機 Header 僅顯示 Logo／語言／Menu Toggle，桌面 CTA 正確
      隱藏（此為本輪修正前確認存在的真實 Bug——Header Scoped CSS 因
      Astro 元件 Scope 機制而永遠不生效，桌面 CTA 全寬顯示；已修正並
      通過測試）
- [x] 規格表於 560px 以下切換為堆疊式讀法，避免橫向捲動
- [x] 卡片網格自動換行（`minmax(min(100%,280px),1fr)`）
- [x] 1024px 以上：桌面導覽於 960px 已啟用，Header 顯示完整導覽列
- [x] 長英文字串（如 "Vision-Guided Automated Assembly"）於卡片與麵包屑
      中以 `overflow-wrap: break-word` 處理，不破版
- [x] 中文長標題未見異常斷行（CJK 字體無強制連字號斷行問題）

## SEO

- [x] 每頁唯一 Meta Title／Description（見 `docs/CONTENT_MATRIX.md`）
      **（已用 Playwright 對 14 種頁面類型逐一驗證非空值）**
- [x] Canonical URL（`SEOHead.astro`）**（已驗證）**
- [x] Open Graph + Twitter Card
- [x] `hreflang`（zh-Hant-TW / en / x-default）**（已建置期驗證 141 個
      連結全數指向實際存在的頁面，0 個失效；404 頁刻意不含 en
      hreflang，因無對應語言版本，經測試確認為正確行為而非缺陷）**
- [x] 語意化 HTML（header/nav/main/footer/article/section）
- [x] Breadcrumb（視覺 + `BreadcrumbList` JSON-LD）
- [x] `sitemap.xml`（動態產生，涵蓋全部頁面路徑，含本輪新增 `/privacy/`）
- [x] `robots.txt`（**本輪修正：Demo Mode 下改為 `Disallow: /`，見下方
      「Demo Mode 索引安全機制」；先前版本一律 `Allow: /`，已修正**）
- [x] 結構化資料：Organization、WebSite（全站，Demo Mode 下標示為
      Concept Project）；BreadcrumbList（各內頁）；FAQPage（僅視覺定位
      自動化組裝詳細頁）；Article（2 篇 Insights）；**Product（本輪新增，
      產品詳細頁，無 Offer／AggregateRating，見下）**
- [x] Product Schema：**本輪新增**（先前版本刻意不輸出）。決策調整為
      輸出但明確標示 `disambiguatingDescription` 為 Concept Project，
      不輸出價格／評價／庫存欄位，理由見 `docs/REMEDIATION_PLAN.md`
      §4.1

### Demo Mode 索引安全機制（本輪新增，先前版本不存在）

- [x] `PUBLIC_DEMO_MODE`（預設 `true`）／`PUBLIC_ALLOW_INDEXING`（預設
      `false`）環境變數已加入
- [x] Demo Mode 下全站輸出 `<meta name="robots" content="noindex,nofollow">`
      （已用 Playwright 驗證首頁）
- [x] Demo Mode 下 `robots.txt` 輸出 `Disallow: /`（已用 Playwright 驗證）
- [x] 頁尾顯示「概念專案 · 未開放搜尋索引」徽章（已用 Playwright 驗證可見）
- [x] Production Mode（`PUBLIC_DEMO_MODE=false` + `PUBLIC_ALLOW_INDEXING=true`）
      已實際切換測試：`noindex` 消失、`robots.txt` 恢復
      `Allow: /`、Lighthouse SEO 分數由 66 恢復至 100（見下方 Lighthouse 章節）

## 無障礙（本輪已用 axe-core 對真實瀏覽器渲染結果掃描，非僅肉眼審視）

- [x] Skip Link（可鍵盤 Tab 觸發，`:focus` 顯示）
- [x] 所有互動元素具備可見 `:focus-visible` 外框
- [x] 表單欄位皆有對應 `<label>`，錯誤訊息以 `role="alert"` 宣告並透過
      `aria-describedby` 關聯；**本輪修正：`aria-invalid` 先前只設定在
      Wrapper 的 `data-invalid`，未設定在實際控制項上，已修正並涵蓋
      Radio-group 與 Checkbox 錯誤路徑**
- [x] Mobile Nav 具備 `aria-expanded`／`aria-controls`／Focus Trap／Escape 關閉
      **（本輪修正：背景內容先前並非真正 Inert，見上方說明；已修正並
      用 Playwright 驗證背景點擊不再觸發，鍵盤 Tab 循環正確困在 Panel 內）**
- [x] FAQ Accordion 具備正確 ARIA（`aria-expanded`、`aria-controls`、
      `role="region"`）
- [x] 所有圖片具備 `alt`；純裝飾 SVG 使用 `aria-hidden="true"`
- [x] 不僅依賴顏色傳達資訊（表單錯誤同時有文字說明，非僅邊框變色）
- [x] `prefers-reduced-motion: reduce` 已於 `tokens.css`／`global.css` 全域套用
      **（已用 Playwright `emulateMedia` 驗證 `--duration-fast` 確實變為 0ms）**
- [x] 無自動播放有聲內容（站內無影音元素）
- [x] **本輪已執行**：axe-core 自動化掃描，涵蓋 14 種頁面類型 +
      Mobile Nav 開啟狀態，**0 個 Critical、0 個 Serious 違規**
      （`tests/e2e/axe.spec.ts`，15/15 測試通過）。過程中實際發現並
      修正 2 個真實 Serious 缺陷：Footer Logo 英文字重在深色背景對比
      僅 2.97:1（未達 WCAG AA 4.5:1）；已調整為 6.99:1。
- [x] **本輪已執行**：真實鍵盤操作端到端走查（Tab／Shift+Tab／Enter／
      Escape），透過 Playwright `page.keyboard.press()` 系列測試完成，
      涵蓋 Mobile Nav Focus Trap、FAQ Accordion、RFQ 表單全欄位 Tab 順序
- [x] **本輪已執行**：色彩對比計算，非僅肉眼審視。`docs/CONTRAST_AUDIT.md`
      記錄每個主要 Token Pair 的 WCAG 公式計算結果（修正前後對照）。
      發現並修正 3 組未達標 Token（Accent／Accent-contrast／Muted-soft）。
- [ ] **仍未執行**：真實螢幕閱讀器（NVDA/VoiceOver）人工操作測試——
      axe-core 與鍵盤自動化測試可以驗證 ARIA 屬性正確性與焦點順序，
      但無法完全取代真人使用真實螢幕閱讀器軟體的操作體驗驗證，此項目
      仍記錄為已知限制。
- **因此本站仍不對外宣稱完全符合 WCAG 2.2 AA**（螢幕閱讀器人工測試
  未執行）；但本輪已完成的 axe-core 自動化掃描（0 Critical/0 Serious）
  與鍵盤操作端到端測試提供了遠高於初版的驗證強度。

## 效能

- [x] 全站靜態 HTML（Astro 預設輸出，無 SSR runtime）
- [x] 最少 JavaScript：僅 Header／FAQAccordion／ContactForm／LanguageSwitcher／
      AnalyticsBridge／少數頁面的 Analytics 事件觸發腳本，無前端框架 Bundle
- [x] 圖片皆為向量 SVG（無點陣圖，無需響應式多尺寸圖檔），皆設定明確尺寸避免 CLS
- [x] 無第三方阻塞腳本（GTM 僅在環境變數提供 ID 時才注入，且以
      `is:inline` 方式延後而非阻塞渲染；`PUBLIC_GA4_ID` 已移除，見
      `docs/ANALYTICS_EVENT_SPEC.md`）
- [x] **本輪已執行**：真實 Lighthouse CLI 執行，於 5 個必要頁面
      （中文首頁桌面／手機、英文首頁手機、產品詳細頁、聯絡頁）取得
      **Performance 100 / Accessibility 100 / Best Practices 100**（全部
      5 頁一致），達成並超越 §23 目標區間（90+/95+/95+）。完整 JSON／HTML
      報告見 `docs/lighthouse/`。

## 表單

- [x] 必填欄位前端驗證（公司名稱、姓名、Email、國家、產業、專案類型、需求說明）
- [x] Email 格式驗證（正則）
- [x] 需求說明最小字數驗證（20 字）
- [x] 隱私權同意為必填，未勾選會擋下送出並提示，**本輪新增：同意文字
      連結至真實的 `/zh-tw/privacy/`／`/en/privacy/` 頁面**（先前版本
      僅為純文字，無可操作連結）
- [x] 送出中／成功／失敗三種狀態皆有對應 UI（`role="status"`／`aria-live"`）
      **本輪修正：Result Panel 先前只有 JS 動態設定屬性，現於 Markup
      直接宣告 `role="status"` `aria-live="polite"`；`showResult()` 會先
      清空 Submitting 狀態文字再寫入結果，避免兩個 Live Region 同時
      更新造成重複播報**
- [x] 防止重複送出（`isSubmitting` 旗標鎖定按鈕）
- [x] Demo Mode 明確標示，**本輪修正措辭**：先前版本承諾「技術團隊將於
      2 個工作天內與您聯繫」與實際「不送出」行為矛盾，已改為清楚說明
      「這示範了完整的 RFQ 驗證體驗，因目前為 Demo Mode，資料並未實際
      送出或儲存，也不會有人與您聯繫」
- [x] 鍵盤可完整操作全部欄位（原生 `<input>`/`<select>`/`<textarea>`，
      無自訂元件破壞原生 Tab 順序）**（已用 Playwright 驗證 Tab 順序）**
- [x] **本輪新增**：`?intent=project` / `?intent=technical-advice` CTA
      意圖參數，Contact 頁會依此預選 `projectType` 並切換開場文案，
      並透過 `cta_click` 事件記錄 intent／locale／source
- [x] **本輪修正**：附件欄位（`<input type="file">`）已移除——正式模式下
      原本會用 `JSON.stringify(FormData entries)` 序列化，導致 File
      物件的二進位內容遺失，且無真實後端可驗證正確的 Multipart 實作。
      決策與理由見 `docs/REMEDIATION_PLAN.md` P0.5。

## 語言

- [x] `<html lang="">` 正確設定（zh-Hant-TW / en）
- [x] 語言切換器保留對應頁面路徑（已建置期＋端到端雙重驗證，見上）
- [x] 中英文各自獨立 Meta Title／Description（無共用）
- [x] 英文非逐字直譯，依英文語感重新組織句子結構

## 部署前檢查

- [x] `pnpm astro build` 成功，0 錯誤（78 個型別檢查檔案，50 個輸出頁面）
- [x] `pnpm astro check`（TypeScript strict）成功，0 錯誤（9 個 `is:inline`
      資訊性 hint，非錯誤，為預期行為；`tsconfig.json` 已排除 `tests/`
      與 `playwright.config.ts`，因其屬於測試工具鏈而非網站本身）
- [x] 內部連結檢查：50 個頁面、**1951 個連結、0 個失效連結**
- [x] 無 Lorem ipsum（已 grep 全站確認）
- [x] 無遺留 TODO/FIXME（已 grep 全站確認）
- [x] 所有假資料皆有 `demoData: true` 標記與頁面可見揭露文字
- [x] **本輪已執行**：Console Error 檢查，透過 Playwright 對 14 種頁面
      類型逐一收集 `console` 與 `pageerror` 事件，**全數 0 個 Console
      Error**（`tests/e2e/misc-functional.spec.ts`）

## 已知限制（誠實揭露，非隱藏——本輪更新）

本輪修正在有真實瀏覽器（Playwright + Chromium）環境下執行，已補齊初版
建置時大部分「未能實測」項目。仍然存在的限制：

1. 真實螢幕閱讀器（NVDA/VoiceOver）人工操作測試——axe-core 與鍵盤自動化
   測試涵蓋 ARIA 正確性與焦點順序，但無法完全取代真人操作體驗驗證。
2. 真實跨瀏覽器（Firefox／Safari／Edge）渲染差異比對——本輪測試僅涵蓋
   Chromium；標準 CSS 特性（Grid、Custom Properties、`color-mix()`）
   已考量相容性但未實測其他引擎的實際渲染。
3. Higgsfield 付費素材生成（計畫性未執行，見
   `docs/HIGGSFIELD_ASSET_PLAN.md`，本輪已裁切至第一輪核准上限）。
4. Demo Mode 下 Lighthouse SEO 分數為 66（因刻意的 `is-crawlable` 稽核
   失敗），這是設計行為非缺陷，已用 Production Mode 重新測試驗證同一
   頁面 SEO 恢復 100 分（見 `docs/lighthouse/`）。

建議使用者在正式部署前於本機或 CI 環境執行：
`pnpm build && pnpm preview`，並使用真實螢幕閱讀器與多瀏覽器人工複驗
上述兩項限制。完整測試方法論與可重現指令見 `docs/CODEX_REVIEW_HANDOFF.md`。
