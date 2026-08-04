# DESIGN_SYSTEM.md

完整設計決策脈絡見 `DESIGN.md`（Impeccable 產出的品牌視覺世界紀錄）。
本文件是給頁構所作品集交付使用的技術規格摘要，對應 `src/styles/tokens.css`
的實際實作值。

## 色彩

**2026-08 修正（P0.3）**：以下為修正後數值。修正前後完整對比與 WCAG
計算過程見 `docs/CONTRAST_AUDIT.md`——`--color-accent`／
`--color-accent-dark`／`--color-accent-light`／`--color-muted-soft`
皆因未達 WCAG AA 門檻而調深，色相家族（銅橘／金屬灰）維持不變。

| Token | 值 | 用途 |
|---|---|---|
| `--color-ink` | `#12181f` | 主要文字、深色結構（非純黑） |
| `--color-surface` | `#f7f5f1` | 頁面背景（暖白，非冷藍白） |
| `--color-card` | `#ffffff` | 卡片背景 |
| `--color-border` | `#e2e0da` | 一般分隔線 |
| `--color-muted` | `#5b6470` | 次要文字（金屬灰），5.51:1 on surface |
| `--color-muted-soft` | `#636b75`（**修正前 `#838c96`，3.13:1 未達標**） | 次要裝飾文字，修正後 4.96:1 on surface |
| `--color-accent` | `#a34c1f`（**修正前 `#c1622b`，3.82:1 未達標**） | 唯一強調色（銅橘），修正後 5.34:1 on surface，僅用於 CTA、互動狀態、關鍵數據 |
| `--color-accent-dark` | `#873e18`（修正前 `#9c4d21`） | Hover 狀態，7.06:1 on surface |
| `--color-accent-light` | `#c06f39`（**修正前 `#e79a68`，2.09:1 未達 3:1 UI 邊界門檻**） | 邊框／深色背景文字，修正後 3.46:1（邊框）／4.74:1（深色背景文字） |
| `--color-invert-bg` | `#12181f` | 頁尾與反轉區塊背景 |
| `--color-focus` | `#1d6fbf` | 鍵盤 Focus 外框（電光藍，與 CTA 色區隔避免混淆），4.73:1 on surface |

**色彩策略**：Restrained（中性色為主 + 單一強調色），刻意避開 AI 紫藍漸層、
賭場黑金與多重科技強調色（見指令 §14「避免」清單）。

## 字體

**2026-08 修正（P1.2，選擇方案 B）**：先前宣告的 Space Grotesk／IBM Plex
Sans／JetBrains Mono 從未實際載入（無字體檔、無 CDN 連結），已改為系統
字體堆疊，確保「文件宣稱＝實際生效」。理由見 `docs/REMEDIATION_PLAN.md`。

| 角色 | 字體堆疊 | 備註 |
|---|---|---|
| 標題（英文/數字） | `-apple-system, "Segoe UI", "Century Gothic", "Avenir Next"` | 避免 Inter 預設樣板感，系統字體確定生效 |
| 內文（英文） | `-apple-system, "Segoe UI", "Helvetica Neue", Roboto` | 長段落易讀，系統字體確定生效 |
| 中文（標題與內文） | 系統 CJK 堆疊（PingFang TC / Noto Sans TC / 微軟正黑體） | 未內嵌 CJK Web Font（檔案體積考量） |
| 規格數值／型號 | `ui-monospace, "SF Mono", "SFMono-Regular", "Cascadia Code", Consolas, Menlo` | 型號與規格表數值使用等寬字體，強化「量測感」，系統字體確定生效 |

比例尺度約 1.25，基準 16px。內文區塊 `max-width: 62ch` 控制行寬。

## 間距

`--space-3xs`(4px) 到 `--space-3xl`(clamp 64–112px) 共 9 階，區塊級間距使用
`clamp()` 依視窗寬度浮動，避免大螢幕留白不足、小螢幕留白過度。

## 圓角

| Token | 值 | 用途 |
|---|---|---|
| `--radius-sm` | 4px | Input、Badge |
| `--radius-md` | 8px | Button |
| `--radius-lg` | 12px | Card、CTA Banner |

刻意設定上限（12px），避免指令 §13.2 提到的「過多圓角」樣板感；不使用
藥丸狀按鈕。

## 陰影

僅 3 階（`--shadow-sm/md/lg`），預設狀態不使用陰影，只在互動（卡片 Hover）
或真實層級（行動選單抽屜）時套用，避免「無目的發光」與過度玻璃擬態。

## 按鈕

三種變體：`primary`（銅橘實心）、`secondary`（描邊）、`ghost`（純文字連結樣式）。
兩種尺寸：`md`、`lg`。統一 8px 圓角，無藥丸狀。

## 表單

Input／Select／Textarea 統一使用 1.5px 邊框、8px 圓角；錯誤狀態邊框變色為
`--color-error` 並顯示 `role="alert"` 錯誤文字；Focus 狀態使用獨立
`--color-focus` 顏色與 `:focus-visible`，與滑鼠點擊區隔。

## 卡片

單層卡片（不使用卡片內嵌卡片），預設 1px hairline 邊框、無陰影；Hover 時
邊框轉為強調色並套用中階陰影 + 2px 位移。Solution / Product / Industry
三種卡片共用 `Card.astro` 基底元件。

## 響應式規則

- 斷點：360 / 390 / 768 / 1024 / 1280 / 1440 / 1920px 皆已測試（見
  `docs/QA_CHECKLIST.md`）。
- 桌面導覽於 `960px` 以上顯示，以下改為全螢幕抽屜式行動選單。
- 規格表於 `560px` 以下由橫向表格轉為堆疊式讀法，避免橫向捲動。
- 表單欄位於 `720px` 以上採雙欄網格，以下單欄堆疊。
- 所有容器寬度受控於 `--container-max`(1280px) / `--container-wide`(1440px)。
