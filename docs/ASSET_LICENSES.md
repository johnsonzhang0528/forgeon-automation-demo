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
| 規格 PDF 示範檔 | `public/documents/axm-400-datasheet-demo.pdf` | 本專案以純文字內容產生的最小 PDF | 專案自有 | 是 | **是，明確標示為 Demo Placeholder** | 否 |

## 字體

| 字體 | 用途 | 授權狀態 | 備註 |
|---|---|---|---|
| Space Grotesk | 標題（拉丁字） | Open Font License（Google Fonts 開源字體） | **本次建置未內嵌實際字體檔**，`tokens.css` 中以 `font-family` 宣告 fallback 至系統字體；正式上線前需自行引入字體檔或 `@font-face`／Google Fonts 連結，並確認授權條款 |
| IBM Plex Sans | 內文（拉丁字） | IBM Plex 為 SIL Open Font License 開源字體 | 同上，未內嵌字體檔 |
| JetBrains Mono | 型號／規格數值 | JetBrains Mono 為 SIL Open Font License 開源字體 | 同上，未內嵌字體檔 |
| 系統 CJK 字體堆疊（PingFang TC / Noto Sans TC / 微軟正黑體） | 中文標題與內文 | 使用作業系統內建字體，無需額外授權 | 依訪客裝置實際安裝字體顯示，未強制下載 Web Font |

**待辦（正式上線前）**：目前 `tokens.css` 僅宣告字體名稱，瀏覽器會 fallback
至系統字體或最接近的替代字體。若要讓 Space Grotesk / IBM Plex Sans /
JetBrains Mono 實際生效，需在 `BaseLayout.astro` 加入 `@font-face` 或
Google Fonts 連結，並在正式上線前確認該字體檔案的散布授權（上述三款字體
本身皆為開源授權，可合法商用，但需要實際引入檔案）。

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
