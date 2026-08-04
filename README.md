# FORGEON AUTOMATION（鋒岳自動化）— 頁構所作品集 Demo

雙語（繁體中文／英文）工業 B2B 企業官網概念案例，使用 Astro + TypeScript
Strict 建置。**本網站為作品集概念案例，品牌、產品、規格及專案資料均為
虛構內容**（詳見 `docs/CASE_STUDY.md` 與全站頁尾聲明）。

## 專案介紹

本專案由頁構所（Yegou Studio）開發，用於市場驗證作品集，展示處理 B2B
企業資訊架構、工業產品呈現、雙語內容、詢價轉換流程、技術 SEO 與正式
測試交付品質的能力。完整專案背景見 `docs/PROJECT_BRIEF.md`，開發過程與
決策記錄見 `docs/FINAL_REPORT.md`。

## 安裝

需求：Node.js 18+（本專案使用 Node 22 開發）、pnpm。

```bash
# 若尚未安裝 pnpm，可透過 corepack 啟用（Node 16.9+ 內建）
corepack enable

# 安裝相依套件
pnpm install
```

## 開發

```bash
pnpm dev
```

預設於 `http://localhost:4321` 啟動開發伺服器，根路徑會自動導向
`/zh-tw/`（依瀏覽器語言可能導向 `/en/`）。

## Build

```bash
pnpm build
```

`build` 指令會先執行 `astro check`（TypeScript Strict 型別檢查），
通過後才執行 `astro build` 產生靜態輸出至 `dist/`。若只需要建置不需要
型別檢查，可使用：

```bash
pnpm build:noCheck
```

## Preview

```bash
pnpm preview
```

於本機預覽 `dist/` 建置後的靜態輸出（模擬正式環境的靜態檔案伺服器行為）。

## 環境變數

複製 `.env.example` 為 `.env` 並依需要填入：

| 變數 | 用途 | 未設定時的行為 |
|---|---|---|
| `PUBLIC_SITE_URL` | Canonical URL／Sitemap／OG 標籤的網站來源 | Fallback 至 `https://forgeon-demo.yegou.studio` 佔位網址 |
| `PUBLIC_RFQ_ENDPOINT` | RFQ 表單送出端點 | 表單進入 **Demo Mode**：完整前端驗證但不送出真實資料，UI 明確標示為示範模式 |
| `PUBLIC_GA4_ID` | Google Analytics 4 Measurement ID | 不載入任何 Analytics 腳本 |
| `PUBLIC_GTM_ID` | Google Tag Manager Container ID | 不載入 GTM 腳本 |

## 表單整合（RFQ / 聯絡表單串接正式 API）

`src/components/forms/ContactForm.astro` 目前依 `PUBLIC_RFQ_ENDPOINT`
是否設定決定運作模式：

- **未設定（預設 / Demo Mode）**：表單完整執行前端驗證（必填欄位、Email
  格式、需求說明最小字數、隱私權同意），驗證通過後顯示「示範模式已模擬
  驗證流程，資料未實際送出」，**不會**呼叫任何網路請求，也不會假裝
  送出成功。
- **已設定（正式 API 模式）**：驗證通過後會以 `fetch()` 對
  `PUBLIC_RFQ_ENDPOINT` 送出 `POST` 請求，`Content-Type: application/json`，
  Body 為表單所有欄位的 JSON 物件（欄位名稱見
  `src/components/forms/ContactForm.astro` 中各 `FormField` 的 `id`）。

**串接正式 API 的步驟**：

1. 準備一個可接受 JSON POST 的端點（例如 Serverless Function、
   Formspree、CRM Webhook）。
2. 在 `.env` 設定 `PUBLIC_RFQ_ENDPOINT=https://your-real-endpoint.example/api/rfq`。
3. 若該端點回傳非 2xx 狀態碼，前端會顯示「送出失敗」錯誤狀態
   （`dict.form.errorTitle` / `errorBody`），不會誤報成功。
4. 檔案上傳欄位（`attachment`）目前僅為 UI（`<input type="file">`），
   實際檔案二進位傳輸需另行擴充 `FormData` 提交邏輯（目前示範送出邏輯
   使用 `JSON.stringify`，不含檔案二進位）。

## Analytics（GA4／GTM 串接）

`src/utils/analytics.ts` 提供帳號無關的事件層，透過
`window.dataLayer.push(...)` 送出以下事件：`cta_click`、`rfq_start`、
`rfq_submit`、`product_view`、`solution_view`、`spec_download`、
`language_switch`、`contact_click`。

**啟用 GA4／GTM 的步驟**：

1. 在 `.env` 設定 `PUBLIC_GTM_ID`（建議透過 GTM 統一管理 GA4，而非直接
   埋 GA4 Script）。
2. 設定後，`src/layouts/BaseLayout.astro` 會自動注入 GTM 容器腳本，並在
   `window.dataLayer` 存在的情況下開始接收上述事件。
3. 於 GTM 內建立對應的 GA4 Event Tag，觸發條件設為
   `Custom Event` 等於各事件名稱。
4. 若不使用 GTM，也可直接手動在 `BaseLayout.astro` 的 `<head>` 加入
   GA4 `gtag.js` 腳本並初始化 `window.dataLayer = window.dataLayer || []`，
   本專案的事件呼叫方式（`trackEvent()`）不需修改即可相容。

**注意**：本專案原始碼中**未**填入任何真實 GA4／GTM ID，`PUBLIC_GA4_ID`／
`PUBLIC_GTM_ID` 於 `.env.example` 中留空。

## 網域

`astro.config.mjs` 的 `site` 設定讀取 `PUBLIC_SITE_URL` 環境變數，
預設 fallback 為佔位網址 `https://forgeon-demo.yegou.studio`。
**正式部署前務必設定真實網域**，否則 Canonical／Sitemap／OG 標籤會指向
佔位網址。

## 部署

本專案為純靜態輸出（`astro.config.mjs` 未設定 SSR adapter），可部署至
任何靜態託管服務，例如：

```bash
pnpm build
# 將 dist/ 目錄上傳至 Netlify / Vercel / Cloudflare Pages / GitHub Pages 等
```

若使用 Netlify／Vercel，可直接連接 Git Repository 並設定：
- Build command: `pnpm build`
- Publish directory: `dist`
- Node version: 18 以上

## 內容更新方式

所有結構化內容（產品、解決方案、產業、技術資源文章）位於
`src/content/` 下的 Astro Content Collections，以 Markdown + Frontmatter
管理，並由 `src/content/config.ts` 的 Zod Schema 驗證格式：

- `src/content/solutions/*.md` — 解決方案（中英文欄位皆在同一檔案的
  Frontmatter 中，如 `name: { zh-tw: ..., en: ... }`）
- `src/content/products/*.md` — 產品規格
- `src/content/industries/*.md` — 產業應用
- `src/content/insights/zh-tw/*.md` 與 `src/content/insights/en/*.md` —
  技術資源文章（因文章內文為完整段落而非短字串，中英文分別存放於獨立
  檔案，透過相同的 `entrySlug` 對應同一篇文章的兩個語言版本）

新增內容時，於對應資料夾新增 `.md` 檔案並填入符合 Schema 的 Frontmatter
即可；Astro 會在下次 `pnpm dev` 或 `pnpm build` 時自動產生對應的靜態頁面
（透過各 `[slug]/index.astro` 的 `getStaticPaths()`）。所有虛構規格請務必
加上 `demoData: true` 標記，並確認頁面上有對應的示範資料揭露文字
（見 `src/config/site.ts` 的 `demoDataNoticeZh`／`demoDataNoticeEn`）。

## 專案文件

完整交付文件位於 `docs/`：

- `PROJECT_BRIEF.md` — 專案目的、客群、商業目標、架構、CTA、技術決策
- `CONTENT_MATRIX.md` — 頁面／標題／CTA／SEO／內容狀態總表
- `DESIGN_SYSTEM.md` — 色彩、字體、間距、圓角、陰影、按鈕、表單、卡片規則
- `ASSET_LICENSES.md` — 圖片／圖示／字型授權與來源紀錄
- `QA_CHECKLIST.md` — 功能／響應式／SEO／無障礙／效能／表單／語言檢查清單
- `CASE_STUDY.md` — 頁構所作品集案例說明
- `SKILL_USAGE_LOG.md` — Claude Skills 使用紀錄
- `HIGGSFIELD_ASSET_PLAN.md` — Higgsfield 素材規劃（未執行生成）
- `HIGGSFIELD_GENERATION_LOG.md` — Higgsfield 生成紀錄（目前為空）
- `COPY_STYLE_GUIDE.md` — 文案風格規則
- `COPY_REVIEW_LOG.md` — anti-ai-writing 審查紀錄
- `FINAL_REPORT.md` — 完整專案交付報告

以及專案根目錄的 `PRODUCT.md`（Impeccable 產品事實記錄）與
`DESIGN.md`（Impeccable 視覺世界決策記錄）。
