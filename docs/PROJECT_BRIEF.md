# PROJECT_BRIEF.md

## 專案目的

本專案是「頁構所」（Yegou Studio）市場驗證用的主要作品集案例：一個完整、可瀏覽、
可測試的工業 B2B 雙語（繁體中文／英文）企業官網 Demo，用以證明頁構所具備處理
B2B 企業資訊架構、工業產品呈現、海外市場內容、詢價轉換流程、雙語網站、響應式
設計、網站效能、技術 SEO、結構化內容、可維護純代碼架構與正式測試交付品質的能力。

本專案為**完全虛構的作品集概念案例**，品牌「鋒岳自動化 FORGEON AUTOMATION」
不是真實公司，所有客戶、認證、產能數據、財務數字均為示範用途，並於全站頁尾與
相關頁面明確標示。

## 客群

| 路徑 | 使用者 | 目標 |
|---|---|---|
| A | 海外採購人員 | 從搜尋／展覽名單／業務信件進站 → 確認公司能力 → 查看英文方案與產品 → 提交 RFQ |
| B | 自動化／製程工程師 | 進入產品或解決方案頁 → 查看特性規格 → 下載規格資料 → 提交技術問題 |
| C | 企業決策者 | 首頁 → 理解定位 → 查看服務能力與導入流程 → 判斷是否合作 → 提交需求 |

目標客戶輪廓：海外設備採購人員、工廠管理者、自動化工程師、製程工程師、
機械設備商、系統整合商、海外代理商與經銷商。

應用產業：半導體與電子組裝、精密金屬加工、汽車零組件、包裝與物流、光電設備、
一般工業自動化。

## 商業目標

網站主要目標不是線上購物，而是讓企業買主：

1. 快速理解公司解決的製造問題
2. 找到適合的設備、產品或解決方案
3. 確認公司具備技術整合能力
4. 願意提交專案需求或詢價
5. 查看或下載基礎技術資料
6. 與業務或工程窗口聯絡

## CTA

- **第一主要 CTA**：提交專案需求 / Discuss Your Project
- **第二主要 CTA**：索取技術建議 / Request Technical Advice
- **次要行動**：查看解決方案、查看產品規格、下載規格資料、聯絡技術團隊

## 網站架構（Sitemap）

| # | 頁面群組 | zh-TW | en |
|---|---|---|---|
| 1 | 首頁 | `/zh-tw/` | `/en/` |
| 2 | 解決方案總覽 | `/zh-tw/solutions/` | `/en/solutions/` |
| 3 | 解決方案詳細（視覺定位自動化組裝） | `/zh-tw/solutions/vision-guided-assembly/` | `/en/solutions/vision-guided-assembly/` |
| 4 | 產品總覽 | `/zh-tw/products/` | `/en/products/` |
| 5 | 產品詳細（AXM-400，並含 VISION-X2／FLEXCELL-M 個別頁） | `/zh-tw/products/axm-400/` 等 | `/en/products/axm-400/` 等 |
| 6 | 產業應用總覽＋詳細（半導體） | `/zh-tw/industries/` `/zh-tw/industries/semiconductor-electronics/` | 對應 `/en/` |
| 7 | 關於我們 | `/zh-tw/about/` | `/en/about/` |
| 8 | 技術資源 Insights（2 篇） | `/zh-tw/insights/` + 2 文章 | `/en/insights/` + 2 文章 |
| 9 | 聯絡與 RFQ | `/zh-tw/contact/` | `/en/contact/` |
| 10 | 404 | `/zh-tw/404` | `/en/404` |

根路徑 `/` 依瀏覽器語言或預設 `zh-TW` 轉向對應語言首頁。

## 技術決策摘要

- **框架**：Astro（靜態生成優先）＋ TypeScript Strict
- **套件管理**：pnpm（環境無既有 lockfile，依 §11 規則採用；透過 corepack 啟用）
- **樣式**：原生 CSS + CSS Custom Properties（Design Tokens）＋ Scoped `<style>`，
  不使用 Tailwind／UI Framework
- **內容管理**：Astro Content Collections（`products`、`solutions`、`industries`、`insights`）
  ＋ Zod Schema 驗證，含 `demoData: true` 標記欄位
- **互動**：原生 JavaScript（`<script>` 模組），無需引入前端框架；FAQ Accordion、
  Mobile Nav、表單驗證、語言切換均以原生 DOM API 完成
- **i18n**：檔案系統路由分流 `/zh-tw/` `/en/`，共用 `src/data/locales/*.ts` 字典 +
  `src/utils/i18n.ts` 工具
- **SEO**：每頁 Astro `<SEOHead>` 元件產生 Title／Description／Canonical／OG／
  Twitter Card／hreflang／JSON-LD
- **表單**：雙模式（正式 API / Demo Mode），前端以 `fetch` 呼叫 `PUBLIC_RFQ_ENDPOINT`
  環境變數；未設定時進入 Demo Mode，明確標示且不寄送假成功訊息

## 不做範圍（Out of Scope）

- 不做真實金流／電商購物車
- 不做會員系統／登入
- 不做多國貨幣或報價計算引擎
- 不做即時聊天（僅提供聯絡方式與表單）
- 不做 CMS 後台（內容以 Astro Content Collections 檔案管理）
- 不執行付費 Higgsfield 圖像生成（見 `docs/HIGGSFIELD_ASSET_PLAN.md` 與
  `docs/SKILL_USAGE_LOG.md` 說明）
- 不串接真實 GA4／GTM 帳號 ID
- 不建立真實網域 DNS／部署
