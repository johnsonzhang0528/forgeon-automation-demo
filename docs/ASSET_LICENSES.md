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

**2026-08 修正（spec P1.2，選擇方案 B）**：先前版本宣告 Space Grotesk／
IBM Plex Sans／JetBrains Mono 但從未內嵌字體檔，屬於「文件宣稱使用、
實際未載入」的落差。本輪修正改為明確採用系統字體堆疊，移除不存在的
字型宣告，不再有此落差。詳細決策理由見 `docs/REMEDIATION_PLAN.md`
「P1.2 字體決策說明」與 `DESIGN.md` Typography 章節。

| 字體堆疊 | 用途 | 授權狀態 | 備註 |
|---|---|---|---|
| `-apple-system, "Segoe UI", "Century Gothic", "Avenir Next"` + CJK 系統堆疊 | 標題（`--font-display`） | 系統內建字體，無需額外授權 | 已確定生效，非宣稱未載入的狀態 |
| `-apple-system, "Segoe UI", "Helvetica Neue", Roboto` + CJK 系統堆疊 | 內文（`--font-body`） | 系統內建字體，無需額外授權 | 已確定生效 |
| `ui-monospace, "SF Mono", "SFMono-Regular", "Cascadia Code", Consolas, Menlo` | 型號／規格數值（`--font-mono`） | 系統內建字體，無需額外授權 | 已確定生效 |
| 系統 CJK 字體堆疊（PingFang TC / Noto Sans TC / 微軟正黑體） | 中文標題與內文 | 使用作業系統內建字體，無需額外授權 | 依訪客裝置實際安裝字體顯示，未強制下載 Web Font |

**不再有「待辦」項目**：因為系統字體堆疊不依賴外部字型檔案下載，沒有
授權檔案需要確認、沒有需要引入的 `@font-face` 宣告。若未來要改用真正的
Web Font（例如重新導入 Space Grotesk），需要：(1) 取得授權合規的字體檔
（本沙盒環境無網路存取，未執行此步驟）、(2) 加入 `@font-face` 或
Fontsource 套件並設定 `font-display: swap`、(3) 更新本表與 `DESIGN.md`
為方案 A 狀態，屆時才需要重新確認授權條款。

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
