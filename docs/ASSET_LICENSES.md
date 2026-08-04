# ASSET_LICENSES.md

## 圖片與 SVG

| 資源 | 檔案／元件 | 來源 | 授權 | 原創？ | Placeholder？ | AI 生成？ |
|---|---|---|---|---|---|---|
| Hero 插畫 | `src/components/ui/HeroIllustration.astro` | 本專案手繪 SVG（抽象線性模組＋機械手臂構圖） | 專案自有，隨本 repo 授權 | 是 | 否（正式替代方案，非暫時佔位） | 否 |
| 產品概念線稿 x3 | `src/components/ui/ProductGlyph.astro`（AXM-400／VISION-X2／FLEXCELL-M） | 本專案手繪 SVG 等角線稿 | 專案自有 | 是 | 否 | 否 |
| 產業圖示 x4 | `src/components/ui/IndustryIcon.astro` | 本專案手繪 SVG 幾何圖示 | 專案自有 | 是 | 否 | 否 |
| 解決方案圖示 x6 | `src/components/ui/SolutionIcon.astro` | 本專案手繪 SVG line icon | 專案自有 | 是 | 否 | 否 |
| 站徽 Logo | `src/components/ui/Logo.astro` | 本專案手繪 SVG（幾何 F 形記號） | 專案自有 | 是 | 否 | 否 |
| Favicon | `public/icons/favicon.svg` | 本專案手繪 SVG | 專案自有 | 是 | 否 | 否 |
| OG 預設分享圖 | `public/images/og-default.svg` | 本專案手繪 SVG | 專案自有 | 是 | 否 | 否 |
| 流程圖示（各類 Icon：checkmark、chevron、hamburger、close 等） | 各元件內聯 SVG | 本專案手繪 | 專案自有 | 是 | 否 | 否 |
| 規格 PDF 示範檔 | `public/documents/forgeon-axm-400-datasheet.pdf` | **2026-08 修正**：以 `scripts/datasheet-template.html` 為來源、透過 Playwright `page.pdf()` 產生的真實 6 頁 PDF（取代先前 899-byte 最小 Placeholder） | 專案自有 | 是 | 否（正式、可展示品質，內含明確 Concept/Fictional Data 聲明頁，非最小佔位檔） | 否 |

## 字體

**2026-08 CC-01 修正（Precision Datum System，取代先前的系統字體回退狀態）**：
CC-00／早期修正輪的沙盒環境無 npm registry 網路存取，因此當時誠實記錄為
系統字體堆疊，未宣稱載入不存在的 Web Font。CC-01 執行時重新確認 npm
registry 實際可存取（`npm view @fontsource/noto-sans-tc version` 成功回傳
`5.3.0`），因此依規格 §5 正式安裝並自託管三款合法開源字體。這是真正的
Web Font 載入，不是宣稱。

| 字體 | npm 套件 | 版本 | 授權 | 已載入字重 | 格式 | 來源檔案 |
|---|---|---|---|---|---|---|
| Noto Sans TC | `@fontsource/noto-sans-tc` | 5.3.0 | SIL Open Font License 1.1（Google Inc.） | 400, 500, 600, 700 | WOFF2 | `public/fonts/noto-sans-tc/*.woff2`；授權原文複製於 `public/fonts/noto-sans-tc/LICENSE.txt` |
| Space Grotesk | `@fontsource/space-grotesk` | 5.3.0 | SIL Open Font License 1.1（The Space Grotesk Project Authors） | 500, 600, 700 | WOFF2 | `public/fonts/space-grotesk/*.woff2`；授權原文複製於 `public/fonts/space-grotesk/LICENSE.txt` |
| IBM Plex Mono | `@fontsource/ibm-plex-mono` | 5.3.0 | SIL Open Font License 1.1（IBM Corp.） | 400, 500, 600 | WOFF2 | `public/fonts/ibm-plex-mono/*.woff2`；授權原文複製於 `public/fonts/ibm-plex-mono/LICENSE.txt` |

**授權條款摘要**：SIL Open Font License 1.1 允許自由使用、研究、修改、
重新散布，唯一限制是不得單獨販售字體檔本身（Bundled 於本網站程式碼中
散布不受此限）。三款字體皆可合法自託管於商業／作品集網站，無需另行付費
或標註來源（雖然本文件仍保留完整來源紀錄以利稽核）。完整授權原文已隨
每個字體家族的 WOFF2 檔案一併複製到 `public/fonts/<family>/LICENSE.txt`，
建置時會被 Astro 原樣輸出到 `dist/fonts/<family>/LICENSE.txt`。

**安裝與載入方式**：

1. 透過 `npx --yes pnpm add @fontsource/noto-sans-tc @fontsource/space-grotesk
   @fontsource/ibm-plex-mono` 安裝（見 `package.json` dependencies）。
2. 只複製實際使用的字重 WOFF2 檔案到 `public/fonts/`（未複製 Noto Sans TC
   的 100/200/300/800/900 等未使用字重，避免無意義下載——規格 §5「請依
   實際頁面需求減少，不得無意義載入全部字重」）。
3. `src/styles/global.css` 以手寫 `@font-face` 宣告（非直接 `@import
   '@fontsource/.../index.css'`，因為 Fontsource 套件的 CSS 預設會宣告
   全部字重，手寫 `@font-face` 才能精確控制只宣告上表 10 個字重），每條
   都設 `font-display: swap`。
4. `src/layouts/BaseLayout.astro` 只 Preload 一個檔案：Noto Sans TC 400
   （zh-tw 頁面 Body 與 H1 的首屏必要字重），Space Grotesk 與 IBM Plex
   Mono 不 Preload，因為它們只影響非首屏關鍵的英文 Display 與技術標記文字
   （規格 §5「首屏真正需要的字型才可 Preload」）。

**實際驗證**（見 `docs/DATUM_QA.md` CC-01 章節）：Playwright 對
`http://localhost:4325/zh-tw/` 的真實 Network 請求記錄確認 7 個 WOFF2
檔案以 HTTP 200 載入；`document.fonts` FontFace API 檢查確認
`Noto Sans TC 400/500/600/700`／`Space Grotesk 700`／`IBM Plex Mono
400/600` 狀態為 `loaded`（`Space Grotesk 500/600`／`IBM Plex Mono 500`
在該次測試頁面未被實際使用到而顯示 `unloaded`——這是瀏覽器 Lazy 載入
未觸發使用的字重的正常行為，不是載入失敗；其餘頁面若使用到這些字重時
會依 `@font-face` 規則正常觸發載入）。

**檔案大小**：`public/fonts/` 總計約 4.0MB（Noto Sans TC 四個字重合計約
3.9MB，因完整繁體中文字符集無法再壓縮；Space Grotesk／IBM Plex Mono 三個
字重合計約 96KB）。記錄於 `docs/DATUM_DECISION_LOG.md` 作為已知取捨，非
遺漏優化。

## 圖片來源與授權檢查狀態總結

- 本專案**未從 Google 搜尋下載任何圖片**，符合指令 §16 規則。
- 本專案**未使用任何 Higgsfield 生成素材**（計畫但未執行，見
  `docs/HIGGSFIELD_ASSET_PLAN.md` 與 `docs/HIGGSFIELD_GENERATION_LOG.md`）。
- 全部視覺素材為本專案於本次建置階段原創繪製的 SVG，隨專案程式碼一併交付，
  無第三方版權疑慮。
- 所有圖片皆設定明確的 `width`／`height`（或 `viewBox` 等比例），避免 CLS。
- 所有圖片皆具備符合內容的中文或雙語 `alt` 文字（純裝飾性 SVG 使用
  `aria-hidden="true"`）。

## 重要提醒

Skill Repository（如 `.claude/skills/higgsfield-*`、`.claude/skills/impeccable`）
本身的程式碼授權（Apache 2.0 等）**不等於**任何透過該 Skill 生成內容的商業
使用授權——這兩者是分開的概念，本專案未混淆兩者，且因未執行任何生成，
不涉及此授權判斷。
