# Claude Code 開發任務書
# 鋒岳自動化 DEMO-1：Precision Datum System 大幅重構


## 專案角色

你是本專案的主開發者與設計實作者。請在現有 Astro 專案內進行大幅重構，不得建立新空白專案。

本輪完成後會交由 Codex 獨立審查。所有完成聲明都要有檔案、測試、截圖或報告證據。

---

## 一、最終目標

將目前「技術完整但像高完成度 Wireframe」的工業 B2B Demo 升級成：

1. 能替虛構品牌鋒岳自動化建立精密、可靠、可導入的品牌印象。
2. 能證明頁構所具備品牌策略、Art Direction、IA、前端工程、Motion、效能、SEO 與 Accessibility 能力。
3. 可作為 NT$98,000～150,000 企業官網服務的代表作品。
4. 不假造真實企業、案例、數據、認證或成果。
5. 保持 Astro Static-first、高效能和可維護性。

最終設計方向：

> **Precision Datum System／製程座標系**

核心概念：

> 將定位、檢測與組裝的工程動作，轉譯成由基準點、座標軸、公差帶、視覺鎖定框和模組組裝軸構成的品牌系統。

---

## 二、不可更動與禁止事項

### 必須保留

- Astro＋TypeScript。
- Content Collections。
- 中英文路由和資料。
- Demo Mode／noindex。
- Canonical、hreflang、Breadcrumb、Schema 架構。
- RFQ Demo Submission。
- Analytics／Data Layer 抽象。
- H1、Links、Locale 自動檢查。
- Playwright、axe、Lighthouse 框架。
- 現有產品、解決方案、產業和文章資料。
- Datasheet 下載。
- Reduced Motion。
- Concept Disclaimer。

### 禁止

- WordPress。
- React、Vue、Next 或大型 UI Framework；除非先提出不可替代理由並等待核准。
- `higgsfield-websites`。
- 假工廠、假員工、假客戶、假認證、假專利。
- 假營收、轉換率、SEO 排名和工程績效。
- 普通科技粒子、六角形、電路板、藍紫 AI 漸層。
- 為每個區塊增加卡片。
- 用動畫掩蓋構圖問題。
- 在付費生成未核准前消耗 Higgsfield 額度。

---

# CC-00：基準、乾淨安裝與名稱統一

## 目的

建立可回復基準，統一「岳峰／鋒岳」名稱，確保乾淨環境可建置。

## 執行

1. 檢查 `git status`，不得覆蓋未提交內容。
2. 建立 Commit／Tag：`baseline/pre-datum-redesign`。
3. 搜尋整個專案的 `岳峰`、`鋒岳`、`Forgeon`。
4. 標準名稱：
   - `鋒岳自動化`
   - `FORGEON AUTOMATION`
5. 品牌資料集中到 `src/config/site.ts`。
6. 不在元件硬編碼品牌。
7. 不提交 `node_modules`、`.env`、Token、Higgsfield 憑證。
8. 確認 `.gitignore`。
9. 在全新目錄測試：
   ```bash
   pnpm install --frozen-lockfile
   pnpm check
   pnpm build
   ```
10. 新增：
    - `docs/DATUM_REDESIGN_PLAN.md`
    - `docs/DATUM_DECISION_LOG.md`
    - `docs/DATUM_QA.md`

## 驗收

- 品牌字串一致。
- Clean install、check、build 成功。
- 無機密資料。
- 有 baseline commit。

## 回報

Commit hash、名稱異動、安裝結果、Build 結果、阻塞。

---

# CC-01：Precision Datum Design System

## 目的

先建立系統，再修改頁面。

## 修改

- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/styles/utilities.css`
- `DESIGN.md`
- `docs/DESIGN_SYSTEM.md`
- 新增 `src/components/brand/`

## 色彩

```css
--color-ink-950: #0b1218;
--color-ink-800: #1b2730;
--color-paper-50: #f7f4ed;
--color-paper-100: #eee9df;
--color-steel-500: #87939b;
--color-steel-200: #cdd3d5;
--color-copper-600: #b84e1d;
--color-copper-500: #d5662b;
--color-signal-green: #34745a;
--color-error: #b4352b;
--color-focus: #1769aa;
```

要求：

- 正常文字 4.5:1。
- 大字／圖形 3:1。
- 更新 `docs/CONTRAST_AUDIT.md`。

## 字體

實際自託管合法 WOFF2：

- Noto Sans TC。
- Space Grotesk。
- IBM Plex Mono。

規則：

- 記錄來源、版本、授權。
- `font-display: swap`。
- 只載入使用字重。
- 首屏必要字型可 preload。
- 無網路時仍有合理 fallback。
- 無法合法取得時停止回報，不得假裝載入。

## Layout

```css
--container-content: 1280px;
--container-wide: 1440px;
--page-gutter-desktop: clamp(32px, 4vw, 64px);
--page-gutter-mobile: 20px;
--section-major: clamp(120px, 12vw, 176px);
--section-standard: clamp(88px, 9vw, 120px);
--section-compact: clamp(56px, 6vw, 72px);
```

- Desktop 12 columns。
- Tablet 8。
- Mobile 4。
- Reading measure 760px。

## Typography

建立 Display、H1–H4、Body L、Body、Caption、Technical Label、Numeric Data。不要所有標題沿用相同比例。

## 品牌元件

新增：

- `DatumOrigin.astro`
- `ToleranceBand.astro`
- `VisionLockFrame.astro`
- `AssemblySpine.astro`
- `ProcessStamp.astro`
- `CutawayWindow.astro`

要求：

- SVG 優先。
- Token 可控。
- 正確 `aria-hidden`／label。
- Reduced Motion。
- 無普通科技裝飾。

## 驗收

建立 Design System Preview Page，輸出 1440、768、390 截圖；Contrast 全通過；字型實際 Network 載入可驗證。

---

# CC-02：Header 與 Hero Design Spike

## 目的

先完成最重要代表畫面，通過審查後才改全站。

## Header

- Desktop 高度約 80px。
- Logo 結合 Datum Origin Mark。
- 導覽 Hover 出現短基準線。
- 捲動後才增加暖白底和細邊界。
- Mobile 只顯示 Logo、語言、Menu。
- 主要 CTA 放 Drawer 底部。
- Focus Trap、Escape、Focus Return、背景鎖定必須保留。

## Hero Desktop

- min-height 720px，目標 86–92svh。
- 12 欄；文案 1–6；視覺 6–13 並跨 Container。
- 文案最大 680px。
- H1：
  > 把定位、檢測與組裝，校準成一套可導入的生產流程。
- Primary：開始專案評估。
- Secondary：先看導入條件。
- Concept 標記放視覺角落，不中斷敘事。

## Hero Visual

建立可替換媒體架構：

- 正式 CGI 用 `<picture>`。
- 未核准生成前用高品質 SVG Design Spike。
- 必須包含 Datum Origin、線性模組、Vision Lock Frame、Assembly Spine。
- 不可沿用原本方形黑底小插圖作最終版。

## 動態

- 基準線出現 480ms。
- 產品對齊 700ms。
- Scroll 僅做定位框對齊。
- Reduced Motion 直接完成。
- 不阻塞 LCP。

## Mobile

- 4:5 專用視覺。
- 文案先、視覺後。
- 最多兩個 CTA。
- 流程帶可 Scroll Snap。
- 360px 無溢位。

## 閘門

輸出 1440×900、768×1024、390×844；執行 Impeccable Critique；建立 `docs/CC02_HERO_REVIEW.md`。若仍像通用科技模板，先修正，不得進 CC-03。

---

# CC-03：首頁核心敘事重構

## 3.1 Process Scan／System Map

取代純文字核心能力：

- 左側四項能力導航。
- 右側同一張 System Map。
- 選取只改變 Highlight。
- Touch、Keyboard 可操作。
- Mobile Accordion。

## 3.2 Solutions Matrix

取代三張 SolutionCard。

維度：

- 定位。
- 檢測。
- 組裝。
- 搬運。
- 既有線升級。

每列顯示：

- 常見問題。
- 推薦方案。
- 需要資料。
- 對應產品。
- 詳細頁連結。

不使用陰影卡片。

## 3.3 Product Assembly Stage

取代三張 ProductCard：

- 深色區段。
- 三產品在同一工作站。
- 選擇產品後 Highlight。
- 每個產品只顯示一個核心用途。
- 圖片鏡位一致。
- Mobile Scroll Snap。

## 3.4 Concept Scenario

把詳細頁的示範情境摘要到首頁：

Problem → Input → Decision → System → Deliverables。

使用一張流程視覺，不使用六張文字卡。

## 3.5 Industry Windows

- 2×2 大型媒體。
- 不同裁切。
- Overlay 顯示製程問題。
- 無真實素材時標示 Concept CGI。
- 不假裝客戶現場。

## 3.6 Engineering Evidence

取代 Why Us，展示概念交付物：

- Requirement Sheet。
- System Architecture。
- Configuration Matrix。
- Acceptance Checklist。

都標示 Concept Sample。

## 3.7 Project Process

五階段都呈現 Input／Decision／Output。

## 3.8 RFQ Preparation

顯示工件圖、目標節拍、現場限制。CTA：

- 開始快速評估。
- 下載準備清單。

## 驗收

- 至少五種不同構圖。
- 不超過兩個真正 Card Grid。
- 有 Hero、Product Assembly、Evidence／Scenario 三個代表畫面。
- 1440、1024、768、390、360 截圖。
- Heading 和閱讀順序正確。

---

# 七、CC-04：Solution 與 Product 詳細頁重構

## 任務目的

把目前「資料欄位逐段向下輸出」的詳細頁，改造成工程師與採購者可以快速判斷的決策工具，同時建立足以放入作品集的內頁代表畫面。

## 4.1 Solution Detail

重構為以下順序：

1. Hero Summary
2. Sticky Section Index
3. Decision Summary
4. Problem／Approach 對照
5. System Architecture
6. Suitability Matrix
7. Workflow：Input／Decision／Output
8. Equipment Compatibility
9. Concept Scenario
10. Related Products Assembly
11. FAQ
12. CTA

### 實作規格

- 1024px 以上顯示 Sticky Section Index。
- 1023px 以下改成原生 Select 或 Accordion 型頁內導覽。
- 不再為每一個 Content Collection 欄位建立同樣的 `container--narrow` Section。
- 每 1.5～2 個 Viewport 至少出現一個視覺型內容：系統圖、矩陣、流程或媒體。
- System Architecture 使用可控制的 SVG，不得用生成圖表示精確工程關係。
- Suitability Matrix 必須包含「適合」「不適合」「需先確認」。
- Concept Scenario 清楚標示為示範情境，不得加入虛構成效百分比。
- 保留 Breadcrumb、Schema、Analytics、雙語與 CTA Intent。

## 4.2 Product Detail

重構順序：

1. Product Hero with CGI／SVG
2. Product Role in System
3. Suitable／Not Suitable
4. Key Features
5. Application Scenarios
6. Specification Table
7. Options Assembly
8. Product Comparison
9. Related Solutions
10. Datasheet
11. CTA

### 實作規格

- Hero 媒體提供桌機與手機不同裁切。
- 規格表在 360px 不得造成頁面橫向溢位。
- 若表格需要水平捲動，必須有可見提示和可鍵盤操作容器。
- Product Comparison 只比較現有三款虛構產品，不新增未定義產品。
- Options Assembly 用 SVG 或一致 CGI 呈現，不再只是文字清單。
- Datasheet 視覺同步新 Design System。
- 移除 Industry／Product Slug 的 `as any`，建立明確 Type Guard 或映射表。
- 不輸出假價格、假庫存、假評分或假認證。

## 禁止事項

- 不得保留長達九個以上外觀相同的 Narrow Section。
- 不得以增加卡片數量取代資訊設計。
- 不得用 AI 圖生成精確規格或機械尺寸。
- 不得犧牲 SEO Heading Structure 來配合外觀。

## 驗收

- Solution Detail 具有可辨識的 System Architecture 代表畫面。
- Product Detail 具有可辨識的 Product Hero 與 Selection／Comparison。
- 每頁正好一個 H1。
- Breadcrumb、Canonical、hreflang、Schema、Analytics 回歸通過。
- 1440、1024、768、390、360 截圖通過。
- 所有雙語內容欄位完整，沒有 Placeholder 或 Lorem ipsum。

## 完成後回報

- 修改檔案。
- 新舊頁面結構對照。
- System Diagram／Product Media 截圖。
- TypeScript 型別修正。
- 測試結果與 Commit Hash。

---

# 八、CC-05：Industries、Engineering Method 與 Resources

## 任務目的

讓內頁各自具有不同用途，而不是首頁卡片的延伸；同時降低虛構 About 對信任建立的錯誤依賴。

## 5.1 Industries Overview

- 不使用四張等寬小卡作為主要呈現。
- 使用 2×2 大型媒體或不對稱 Editorial Layout。
- 每個產業顯示：常見站點、主要風險、推薦方案、需準備資料。
- 各產業素材必須不同，不得只換 Icon。
- 若使用 Concept CGI，必須在資產紀錄中標示，不得暗示是真實客戶現場。

## 5.2 Industry Detail

頁面順序：

1. Industry Context Hero
2. Typical Stations
3. Primary Risks
4. Recommended Solutions
5. Relevant Products
6. Required Inputs
7. Limits／Not Suitable
8. CTA

- 每頁至少一張專屬 Process Diagram 或媒體。
- 不重複完整 Solution 文案，使用摘要與內部連結。

## 5.3 Engineering Method

將目前虛構 About 的主要信任功能改由 Engineering Method 承擔。

內容至少包括：

- 如何釐清問題。
- 如何評估可行性。
- 如何產出系統架構。
- 如何確認輸入資料。
- 如何驗證與交付。
- 哪些案件不適合。
- Concept Sample 文件。

可保留簡短的虛構公司介紹，但不得捏造年份、規模、團隊、廠房、客戶或認證。

## 5.4 Resources

保留 Insights 與 Datasheets，新增：

- RFQ Preparation Checklist。
- Product Selection Guide。
- Solution Readiness Checklist。

每篇 Insight 至少包含：

- Key Takeaways。
- 一張原創工程圖或流程圖。
- Checklist。
- Related Solution／Product。
- 對應 CTA。

## 驗收

- Industries、Method、Resources 三種頁型的構圖有明顯差異。
- About 不再以虛構歷史建立信任。
- 所有下載資產可正常開啟、文字可選取、無 PDF 語法錯誤。
- 內部連結、雙語、Schema、SEO 通過。

---

# 九、CC-06：漸進式 RFQ 與低摩擦轉換

## 任務目的

保留完整 RFQ 的專業度，同時降低陌生訪客第一次接觸就面對長表單的心理負擔。

## 流程

### Step 1：快速評估

只詢問：

1. 想解決的製程問題。
2. 預計導入時間。
3. 是否已有工件／設備資料。

### Step 2：建議入口

依答案顯示：

- 索取技術建議。
- 提交完整專案需求。
- 先下載準備清單。

不得用 AI 自動承諾方案、價格或交期。

### Step 3：完整 RFQ

保留現有完整欄位與 Demo Mode。

## 技術規格

- 不引入 React。
- 使用原生 JavaScript、Astro 或 Web Component。
- 必須 Progressive Enhancement：沒有 JavaScript 時完整 RFQ 仍可使用。
- Step 狀態可鍵盤操作並具正確焦點管理。
- 使用 `aria-current`、`aria-describedby`、Error Summary。
- Demo Mode 不送出、不儲存、不承諾回覆時間。
- Privacy Link 可操作。
- 附件若未有正式 Multipart／Presigned Upload，維持移除狀態，不得假裝支援。

## Analytics

新增或驗證：

- `assessment_start`
- `assessment_complete`
- `checklist_download`
- `rfq_start`
- `rfq_submit`

事件需區分：

- locale
- source page
- intent
- demo／live／failed

## 程式重構

將大型 `ContactForm.astro` 拆分為合理責任：

- `ContactFormShell.astro`
- `AssessmentStep.astro`
- `RFQFields.astro`
- `FormStatus.astro`
- `form-validation.ts`
- `form-demo-submit.ts`

文案仍使用單一雙語資料來源，不得在元件中大量硬編碼。

## 驗收

- 無 JS 時完整表單可完成前端原生驗證。
- 360px 表單無溢位。
- 錯誤摘要可被螢幕閱讀器理解。
- 第一次錯誤聚焦正確。
- Demo Mode 說明清楚。
- Analytics 測試能捕捉每個事件且不重複。

---

# 十、CC-07：Mobile Art Direction

## 任務目的

手機版必須重新設計，而不是把桌機內容單純排列成一欄。

## 必須建立的 Mobile Spec

- Header Drawer。
- Hero 4:5 媒體與文字順序。
- Process Scan Accordion。
- Solutions Matrix List。
- Product Assembly Scroll Snap。
- Industry Full-width Media。
- Process Vertical Datum Axis。
- Solution／Product Detail In-page Navigation。
- Progressive RFQ。
- Footer。

## 主要視口

- 360×800
- 390×844
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- 1920×1080

## 規格

- `documentElement.scrollWidth <= clientWidth`。
- Tap Target 至少 44×44px。
- 不依賴 Hover 顯示必要內容。
- 英文長產品名不得破版。
- 中文標題避免不自然孤行。
- Hero 圖片使用 Mobile 專用 Crop／Art Direction。
- 不在手機執行重型 Scroll Pin 或大幅 Parallax。
- Sticky CTA 不得遮擋 Footer、表單或系統導覽。
- Specification Table 有明確橫向捲動提示或改為 Key-value Layout。

## 驗收

每個視口輸出：

- 全頁 Screenshot。
- Header 開啟狀態。
- Hero。
- Product Assembly。
- Contact Flow。

並附上溢位、Tap Target、文字換行和圖片裁切測試結果。

---

# 十一、CC-08：Motion Direction 與互動

## 任務目的

讓「製程座標系」真正被看見，但不以動畫掩蓋資訊和構圖問題。

## 允許的 Motion

- Datum Line Reveal。
- Vision Lock Frame 對齊。
- Assembly Module Highlight。
- Section Index Active State。
- Product Module Transition。
- Tolerance Band／Numeric Highlight。
- Navigation Hover Axis。
- Form Step Transition。

## 禁止

- 所有 Section 統一 Fade Up。
- 粒子背景。
- 滑鼠光圈。
- 六角形科技背景。
- 無限旋轉或掃描。
- Scroll Hijacking。
- 大量 Parallax。
- 手機重型 Pin。
- 自動播放有聲影片。
- 為 Loading 製造假等待。

## 技術規格

- CSS 優先。
- JS 優先使用 IntersectionObserver。
- 動畫主要修改 `transform` 與 `opacity`。
- 不造成 CLS。
- Micro 160ms。
- UI Transition 260ms。
- Section Reveal 480ms。
- Assembly 700–1000ms。
- 使用 `prefers-reduced-motion`，Reduced Motion 下直接顯示最終狀態。
- 不增加不必要 Runtime Dependency。

## 驗收

- 動畫目的可用一句話對應內容。
- Lighthouse Performance 維持 90+。
- Reduced Motion E2E 通過。
- 手機版無掉幀或阻塞主要互動。

---

# 十二、CC-09：SEO、效能、Accessibility 與跨瀏覽器 QA

## Clean Environment

在乾淨 Clone／目錄中執行：

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm check:h1
pnpm check:links
pnpm check:locale-routes
pnpm test:e2e
pnpm test:axe
```

不得以壓縮檔內附的 `node_modules` 作為成功證據。

## 瀏覽器

至少：

- Chromium／Chrome。
- Firefox。
- Edge。
- WebKit／Safari 等效測試。

## Accessibility

- axe Critical：0。
- axe Serious：0。
- 完成鍵盤流程。
- 完成 Focus Order。
- Mobile Dialog 背景管理正確。
- 至少使用 NVDA 或 VoiceOver 進行一次人工流程。
- 200% Zoom。
- Windows High Contrast／Forced Colors 基礎檢查。
- 色彩對比符合一般文字 4.5:1、大字 3:1。

## Lighthouse

至少執行：

- 中文首頁 Desktop。
- 中文首頁 Mobile。
- 英文首頁 Mobile。
- Solution Detail。
- Product Detail。
- Contact。

目標：

- Performance 90+。
- Accessibility 95+。
- Best Practices 95+。
- Production Mode SEO 95+。
- Demo Mode SEO 因 Noindex 下降時，報告中清楚說明，不將其誤判為錯誤。

## 圖片

- AVIF／WebP。
- Responsive `srcset`／`sizes`。
- 明確 Width／Height。
- LCP Image 合理 Preload 或 `fetchpriority`。
- 非首屏 Lazy Load。
- 不使用超大 PNG 作網站主媒體。

## SEO

- 每頁正好一個 H1。
- Title／Description 唯一。
- Canonical 正確。
- hreflang 對應存在。
- Schema 只輸出實際內容。
- Demo Mode 不輸出可能誤導的假企業證據。
- 不承諾排名。

## 報告

更新：

- `docs/DATUM_QA.md`
- `docs/QA_CHECKLIST.md`
- `docs/FINAL_REPORT.md`
- `docs/CONTRAST_AUDIT.md`

所有分數附 JSON／HTML 報告路徑，不得只寫在 Markdown 中。

---

# 十三、CC-10：Public Case Study 與 Codex Handoff

## Public Case Study

建立供頁構所官網使用的完整案例內容：

1. 概念專案背景。
2. 原始網站問題。
3. 目標客群。
4. 研究與洞察。
5. 資訊架構。
6. 初版的不足。
7. Precision Datum System。
8. Design Tokens。
9. 三個代表畫面。
10. Mobile Art Direction。
11. Progressive RFQ。
12. SEO／Performance／Accessibility。
13. Concept Project 聲明。
14. Demo Link。
15. 未使用的真實成效項目。

不得編造：

- 營收。
- 詢價成長。
- 客戶推薦。
- SEO 排名。
- 真實使用者數據。

## Screenshot／Media

輸出：

- Home 1440。
- Home 390。
- Hero Close-up。
- Product Assembly。
- Solution System Map。
- Product Detail。
- Progressive RFQ。
- Design Tokens。
- Lighthouse。
- Before／After。
- 視需要產生 15–30 秒無聲 Motion Reel。

## Codex Handoff

建立：

`docs/CODEX_DATUM_REVIEW_HANDOFF.md`

包含：

- 最終 Commit Hash。
- Install／Build／Test 指令。
- Changed Files。
- Design Decisions。
- Known Limits。
- Paid Asset Status。
- Screenshot Paths。
- QA Report Paths。
- Codex 應優先重驗項目。
- 尚未取得的真實企業資料。

---

# 十四、Higgsfield 素材核准規則

開始任何生成前建立：

`docs/DATUM_ASSET_PLAN.md`

第一輪素材上限：

- Hero：最多 3 張。
- 三款產品：每款最多 2 張，共 6 張。
- 四個產業：共 4 張。
- 第一輪總數最多 13 張。

每張必須列出：

- 使用頁面。
- Prompt。
- Aspect Ratio。
- Text Safe Area。
- Fictional／Concept 標示方式。
- 預估 Credit／費用。
- SVG／Placeholder 替代方案。

**任何會消耗付費額度的生成工作，必須先停止並等待使用者核准。**

禁止：

- `higgsfield-websites`。
- 假工廠紀實照。
- 假員工／團隊。
- 假客戶現場。
- 假認證或獎項。
- 圖片內正式文字。
- 精確工程尺寸圖。
- 可能誤導為已量產的產品攝影。

所有採用素材更新：

- `docs/HIGGSFIELD_GENERATION_LOG.md`
- `docs/ASSET_LICENSES.md`

---

# 十五、ANTI-AIWRITING 最終文案審查

只在內容、技術、SEO 意圖與 Demo Disclaimer 定稿後執行。

重點檢查：

- 致力於。
- 全方位。
- 賦能。
- 無縫。
- 卓越。
- 值得信賴的合作夥伴。
- 重複的「依需求評估」。
- 每段相同句型。
- 英文生硬直譯。
- CTA 全部指向相同語意。

不得修改：

- 產品型號。
- 技術規格。
- Demo Disclaimer。
- 法律／隱私文字實質含義。
- SEO Search Intent。
- Schema Key。
- Analytics Event Name。

更新：

- `docs/COPY_STYLE_GUIDE.md`
- `docs/COPY_REVIEW_LOG.md`

並完成前後版本、SEO、技術與雙語一致性回歸檢查。

---

# 十六、最終完成標準

只有以下全部達成才能宣布完成：

- [ ] 品牌名稱全站統一為鋒岳自動化。
- [ ] Precision Datum System 已落地於畫面，而不只存在文件。
- [ ] Hero、Product Assembly、System／Evidence 至少三個代表畫面完成。
- [ ] Hero 不再使用舊版方形 Placeholder 線稿作最終主視覺。
- [ ] 首頁不存在三個以上連續相同卡片 Grid。
- [ ] 產品具有高品質概念媒體。
- [ ] Solution Detail 有 System Architecture 與 Decision Summary。
- [ ] Product Detail 有 Selection／Comparison。
- [ ] Industries 各自具有內容和素材差異。
- [ ] Mobile 經獨立重組。
- [ ] Progressive RFQ 完成。
- [ ] Clean Install／Check／Build 成功。
- [ ] H1／Links／Locale Routes 通過。
- [ ] axe Critical／Serious 0。
- [ ] Lighthouse 達標。
- [ ] Firefox／Edge／WebKit 通過。
- [ ] 至少一套 Screen Reader 人工測試。
- [ ] 字型實際載入且授權有紀錄。
- [ ] Demo 誠信標示完整。
- [ ] Public Case Study 完成。
- [ ] Codex Handoff 完成。

不得用以下理由宣稱完成：

- 「看起來更有科技感」。
- 「已增加動畫」。
- 「已更換顏色與字型」。
- 「測試文件寫著通過」但無法提供報告或重跑指令。

---

# 十七、每階段回報格式

每完成一項 CC 任務，必須回報：

1. 本階段目的。
2. 修改檔案。
3. 主要設計決策。
4. Before／After 差異。
5. Desktop／Tablet／Mobile 截圖。
6. 執行過的命令。
7. 實際測試數字。
8. 未完成事項。
9. 已知風險。
10. 是否使用付費素材。
11. Commit Hash。
12. 下一階段依賴。

現在只執行 **CC-00**。完成基準、品牌名稱統一、乾淨安裝驗證與重構文件後停止，回報結果，等待進入 CC-01。不得一次修改整個網站。
