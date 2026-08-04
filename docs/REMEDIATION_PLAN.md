# REMEDIATION_PLAN.md

修正前基準 Commit：`cb23949`（`feat(demo-1): initial FORGEON AUTOMATION bilingual B2B site build`）。
本文件建立於該 Commit 之後、任何修正 Commit 之前，供本輪修正追蹤與 Codex 審查對照。

狀態欄位定義：`計畫中` → `進行中` → `已完成`／`部分完成（已記錄限制）`。

---

## P0（正式展示前必須完成）

| # | 問題 | 嚴重程度 | 影響頁面 | 修正方式 | 驗收方法 | 狀態 |
|---|---|---|---|---|---|---|
| P0.1 | `Header.astro` 用 scoped CSS 選取器 `.site-header__cta` / `.mobile-nav__cta` 試圖控制傳給 `Button.astro` 的 class，但 Astro scoped CSS 的 `data-astro-cid-*` 只會標記在元件自己模板產生的 DOM 上，不會標記到子元件實際渲染出的節點，因此規則永遠不生效；390px 下桌面 CTA 全寬顯示、`scrollWidth` 超出 `clientWidth`。同一問題也出現在 `industry-hero__icon`（父頁面樣式試圖控制 `IndustryIcon` 元件輸出的 class）與 `insight-card`（父頁面樣式試圖控制 `Card` 元件輸出的 class）。 | P0 | 全站 Header（含全部 40+ 頁）；產業詳細頁（4 產業 × 2 語言）；Insights 總覽（2 語言） | 在 Header.astro 中以原生 `<div>`/`<span>` wrapper 包住 `Button`，把顯示控制樣式移到 wrapper 上（而非試圖穿透 Button 的 scope）；`IndustryIcon` 與 `Card` 改為在元件自身內接受一個型別化的 size/variant prop，或同樣以 wrapper 承接版面樣式，不再依賴父層 scoped class 命中子元件輸出 | Playwright 於 360/390/768/1024/1440/1920px 檢查 `document.documentElement.scrollWidth <= clientWidth`；驗證手機 Header 僅顯示 Logo/語言/Toggle；桌面 CTA 只在 ≥960px 顯示；Menu 開關/Escape/Focus Trap/焦點回歸 Toggle | 已完成 |
| P0.2 | About／Contact／Products 總覽／Solutions 總覽／Industries 總覽／Insights 總覽（zh-tw + en）未傳入 `level="h1"` 給 `SectionHeading`，頁面沒有 `<h1>` | P0 | 12 個頁面（6 頁面類型 × 2 語言） | 對應 `SectionHeading` 呼叫加上 `level="h1"` | Node 腳本掃描 `dist/**/*.html`，斷言每個內容頁恰有 1 個 `<h1>` | 已完成 |
| P0.3 | `--color-accent` (#c1622b) on `--color-surface` (#f7f5f1) = 3.82:1；`--color-accent-contrast` (#fff8f2) on `--color-accent` = 3.95:1；`--color-muted-soft` (#838c96) on surface = 3.13:1，均未達 4.5:1 一般文字門檻 | P0 | 全站（Primary Button、eyebrow 文字、次要文字） | 重新計算並調深 accent／加深 accent-contrast／調深或限縮 muted-soft 用途 | 撰寫對比計算腳本，列出全部主要 Token pair 修正前後數值，全部 ≥ 4.5:1（一般文字）或 ≥3:1（大字/UI邊界） | 已完成 |
| P0.4 | Demo Mode 索引安全機制不存在：`SEOHead` 的 `noindex` prop 從未被設為 true；`robots.txt.ts` 允許全站爬取；`StructuredData` 一律輸出 Organization Schema 但只以 description 文字帶過虛構聲明 | P0 | 全站 | 新增 `PUBLIC_DEMO_MODE`／`PUBLIC_ALLOW_INDEXING` env；`site.ts` 讀取並匯出 `isDemoMode`／`allowIndexing`；`BaseLayout` 依此把 `noindex` 傳給 `SEOHead`；`robots.txt.ts` Demo Mode 下輸出 `Disallow: /`；`StructuredData` 的 organization 在 Demo Mode 下標示為 ConceptProject 或不輸出；新增可見「Concept Project」footer 徽章 | 檢查 build 後 HTML 含 `<meta name="robots" content="noindex,nofollow">`；`/robots.txt` 內容含 `Disallow: /`；footer 徽章存在 | 已完成 |
| P0.5 | Demo Mode 文案承諾「技術團隊將於 2 個工作天內與您聯繫」與實際「不送出」行為矛盾；無隱私權頁面連結；附件欄位在正式模式下用 `JSON.stringify(FormData entries)` 會遺失檔案二進位；欄位驗證只設定 `data-invalid`，未設定 `aria-invalid`；CTA `?intent=` 尚未實作 | P0 | Contact 頁（2 語言）、Header/Hero/CTABanner 內所有 CTA 連結 | 改寫 Demo Mode Result 文案；新增 `/zh-tw/privacy/`、`/en/privacy/` 靜態頁並連結；移除附件欄位（選項 B，理由見下）；`setFieldError` 補上 `aria-invalid`；Contact 頁讀 `Astro.url.searchParams` 處理 intent 預選與開場文案；`trackEvent` 補 `cta_click` 附加 `intent`/`locale`/`source` | Playwright 端到端跑完整表單驗證流程（含 radio/checkbox 錯誤路徑）、intent query 預選、a11y snapshot 檢查 `aria-invalid` | 已完成 |
| P0.6 | `public/documents/axm-400-datasheet-demo.pdf` 為 899 bytes 的最小 placeholder，非正式作品集展示品質 | P0 | AXM-400 產品詳細頁下載連結 | 以 Playwright `page.pdf()` 從依 Design Token 樣式化的 HTML 產生 4–6 頁雙語資料表，內容取自 `axm-400.md` 實際規格，含 Concept/Fictional Data 聲明頁；改檔名為 `forgeon-axm-400-datasheet.pdf` 並同步更新 `datasheetPath` | `pdfinfo`/`pdftotext`（或 Node PDF 解析）確認頁數、可選取文字、無語法錯誤 | 已完成 |

## P1（提升成交說服力）

| # | 項目 | 狀態 |
|---|---|---|
| P1.1 | Impeccable 真實瀏覽器 critique/audit/polish（`docs/IMPECCABLE_REVIEW_LOG.md`） | 已完成 |
| P1.2 | 字體決策（A 內嵌真實字體 或 B 明確系統字體堆疊） | 已完成（採 B，見下） |
| P1.3 | Higgsfield 素材計畫更新（縮減至規範上限：2–3 hero 方向／每產品 1–2 張／最多 4 產業視覺），未執行生成 | 已完成（計畫文件） |
| P1.4 | 決策型內容（首頁適合/不適合、產品選型/比較表、方案適合/不適合、Concept Scenario） | 已完成 |
| P1.5 | 頁構所公開作品集案例文件（`CASE_STUDY_PUBLIC_COPY.md`／`CASE_STUDY_SCREENSHOT_PLAN.md`） | 已完成 |

## SEO / Analytics

| # | 項目 | 狀態 |
|---|---|---|
| 4.1 | Product Schema（Demo Mode 條件輸出，無假價格/評價） | 已完成 |
| 4.2 | Analytics 事件真正觸發（`docs/ANALYTICS_EVENT_SPEC.md`） | 已完成 |
| 4.3 | Locale Route Map / hreflang 建置期驗證（至少涵蓋 insights） | 已完成 |

## QA

| # | 項目 | 狀態 |
|---|---|---|
| 5.1 | Playwright 多裝置 + 功能 + a11y 測試套件 | 已完成 |
| 5.2 | axe-core 掃描（Critical/Serious 目標 0） | 已完成，見 CODEX_REVIEW_HANDOFF.md 實際數字 |
| 5.3 | Lighthouse（5 個目標頁面） | 已完成，見 CODEX_REVIEW_HANDOFF.md 實際分數 |

---

## P0.5 附件欄位決策說明

選擇 **選項 B：移除附件欄位**。理由：
1. 本專案沒有真實後端，Demo Mode 下即使做出完整 multipart 上傳 UI，使用者體驗上仍是「看起來能傳檔案，實際上按下送出後檔案去哪都不知道」，對作品集反而是誠信風險。
2. 正式模式（`PUBLIC_RFQ_ENDPOINT` 存在）目前的 `JSON.stringify(FormData entries)` 對 File 物件只會序列化成 `"[object File]"` 字串，是明確的資料損毀 bug，且沒有後端可驗證 multipart 契約是否正確，無法在此沙盒環境內端到端驗證。
3. `docs/README.md`／表單文案已改為不承諾檔案上傳，改引導使用者在需求說明欄位描述「另有圖面／規格書，將以 Email 附件方式提供」，並在 Email 聯絡資訊旁提示可直接附檔寄送——功能對等，不犧牲流程完整性。
4. 若未來要接真實後端，重新加回 `type="file"` 欄位時只需改回 `fetch(endpoint, { body: formData })`（不設 Content-Type，交給瀏覽器帶 multipart boundary），並在 `docs/REMEDIATION_PLAN.md` 記錄的 API Contract 基礎上擴充。

## P1.2 字體決策說明

選擇 **選項 B：明確採用有設計感的系統字體堆疊，移除不存在的字型宣告**。理由：
1. 專案先前在 `tokens.css` 宣告 `'Space Grotesk'`、`'IBM Plex Sans'`、`'JetBrains Mono'`，但從未內嵌檔案或連結 CDN；瀏覽器會直接 fallback 到下一個字體，等同於文件宣稱與實際行為不符。
2. 沙盒環境无法連網下載 Fontsource／Google Fonts 字重檔案（無外部網路存取），且 spec 禁止引入額外 runtime 依賴之外的判斷應保守；自行下載字型二進位檔案貼入 repo 也涉及授權檔案完整性風險（需要每個字重的完整 OFL 授權文字與正確 hash）。
3. 改採等效但誠實的系統字體堆疊：Display 用 `ui-sans-serif, -apple-system, "Segoe UI", "Helvetica Neue", Arial` 系列中偏幾何感的子集合＋既有 CJK 堆疊；Mono 用 `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas` 系列，效果與原設計方向（工程感、非 Inter 預設）保持一致，且不再有「宣稱使用實際未載入」的落差。
4. `DESIGN.md`、`docs/DESIGN_SYSTEM.md`、`docs/ASSET_LICENSES.md` 已同步移除字型檔案待辦，改記錄為「系統字體堆疊，確定已生效，不依賴外部字型檔案下載」。
