# DESIGN_SYSTEM.md

完整設計決策脈絡見 `DESIGN.md`（Impeccable 產出的品牌視覺世界紀錄）。
本文件是給頁構所作品集交付使用的技術規格摘要，對應 `src/styles/tokens.css`
的實際實作值。

**2026-08 CC-01 修正**：以下為 Precision Datum System 重構後的完整數值。
本輪修正取代先前的「Restrained 色彩策略（單一銅橘強調色）＋系統字體堆疊」
版本，改為「製程座標系」設計語言：Paper／Ink／Steel／Copper／功能色五組
角色化色彩，加上真正自託管的 Noto Sans TC／Space Grotesk／IBM Plex Mono
三款字體。完整對比計算與規格值修正過程見 `docs/CONTRAST_AUDIT.md`；設計
決策與被拒絕方案見 `docs/DATUM_DECISION_LOG.md` CC-01 章節。

## 色彩

| Token | 值 | 用途 |
|---|---|---|
| `--color-ink-950` | `#0b1218` | 主要文字、深色結構、Footer、產品組裝舞台 |
| `--color-ink-800` | `#1b2730` | 次深色文字 |
| `--color-paper-50` | `#f7f4ed` | 主背景（暖白） |
| `--color-paper-100` | `#eee9df` | 次背景 |
| `--color-steel-700`（新增） | `#5c6870` | 次要文字（淺底），5.21:1 on paper-50 |
| `--color-steel-600`（新增） | `#78838b` | 技術線、規格分隔線、淺底邊框，3.53:1 on paper-50 |
| `--color-steel-500`（規格值，角色限定） | `#87939b` | 僅用於深底文字／裝飾，不可用於淺底文字或邊框（5.99:1 on ink-950；僅 2.86:1 on paper-50，不通過） |
| `--color-steel-200`（規格值，角色限定） | `#cdd3d5` | 僅用於深底邊框，不可用於淺底邊框（12.46:1 on ink-950；僅 1.38:1 on paper-50，不通過） |
| `--color-copper-600` | `#b84e1d` | Datum Origin、主要 CTA、淺底文字/連結，4.61:1 on paper-50（餘裕最小的 Token，見下方警示） |
| `--color-copper-700`（新增） | `#9c4014` | 較深銅橘，用於 paper-100 背景或需要更多對比餘裕處，6.06:1 on paper-50／5.50:1 on paper-100 |
| `--color-copper-500`（規格值，角色限定） | `#d5662b` | 僅用於淺底非文字裝飾／邊框（3.32:1，達 3:1 UI 邊界門檻但未達 4.5:1 文字門檻）或深底強調文字（5.18:1 on ink-950） |
| `--color-signal-green` | `#34745a` | 成功／可導入狀態，5.04:1 on paper-50 |
| `--color-error` | `#b4352b` | 錯誤狀態，5.49:1 on paper-50 |
| `--color-focus` | `#1769aa` | Focus 外框，5.26:1 on paper-50／3.27:1 on ink-950 |

**色彩使用比例**（設計原則，非程式精確計算）：Paper 55%、Ink 25%、
Steel 12%、Copper 6%、功能色 2%。Copper 刻意限定只用於 Datum Origin、
主要 CTA、Active State 與必要重點，不得大量用於標題、Icon、卡片邊框或
大面積背景／裝飾漸層。

**⚠️ `--color-copper-600` 對比餘裕警示**：4.61:1 是全部 24 組已驗證配對中
餘裕最小的一組（僅高於 4.5:1 門檻 0.11），其餘配對餘裕介於 3.2–17.2:1。
未來任何調整 `--color-paper-50` 或 `--color-copper-600` 的階段都必須重新
執行 `docs/CONTRAST_AUDIT.md` 的計算。

**相容別名**：既有 10 個元件（Header、Button、SectionHeading、
ProductCard、SolutionCard、IndustryCard、ContactForm、Footer、
SpecificationTable、CTABanner）使用的舊 Token 名稱
（`--color-accent`、`--color-muted`、`--color-surface` 等）全部重新指向
對應的新 Datum Token 值，未刪除、未產生兩套衝突系統。完整對照見
`src/styles/tokens.css` 的 Compat Alias 區塊。

## 字體

**2026-08 CC-01 修正**：先前版本因沙盒無網路存取而使用系統字體堆疊，本輪
重新確認 npm registry 可存取後，正式安裝並自託管三款合法開源字體。

| 角色 | 字體 | 授權 | 已載入字重 |
|---|---|---|---|
| 標題（英文 Display，`--font-display`） | Space Grotesk（`@fontsource/space-grotesk` 5.3.0） | SIL OFL 1.1 | 500, 600, 700 |
| 中文（標題與內文，`:lang(zh)` 覆寫優先） | Noto Sans TC（`@fontsource/noto-sans-tc` 5.3.0） | SIL OFL 1.1 | 400, 500, 600, 700 |
| 規格數值／型號／技術標記（`--font-mono`） | IBM Plex Mono（`@fontsource/ibm-plex-mono` 5.3.0） | SIL OFL 1.1 | 400, 500, 600 |

三款字體皆為自託管 WOFF2（`public/fonts/`），`font-display: swap`，只 Preload
Noto Sans TC 400（zh-tw 頁面首屏必要字重）。中文標題透過 `:lang(zh)`
CSS 選擇器強制優先使用 Noto Sans TC（而非 Space Grotesk 開頭的
`--font-display` 堆疊），避免中文字距被英文 Display 字體的負字距壓縮。
完整授權與載入細節見 `docs/ASSET_LICENSES.md`。

比例尺度約 1.25，基準 16px。中文內文區塊約 34–42 字寬（`--measure-zh:
40em`），英文約 58–68ch（`--measure: 62ch`）。

## 字級（Type Scale）

| 層級 | Desktop | Mobile |
|---|---|---|
| Display | `clamp(3.75rem, 6vw, 6.75rem)` | `clamp(2.65rem, 12vw, 4rem)` |
| H1 | `clamp(3rem, 4.8vw, 5rem)` | `clamp(2.5rem, 10vw, 3.25rem)` |
| H2 | `clamp(2.25rem, 3.5vw, 3.75rem)` | 同 Desktop（clamp 自適應） |
| H3 | `clamp(1.5rem, 2vw, 2rem)` | 同 Desktop |
| H4 | `clamp(1.125rem, 1.5vw, 1.375rem)` | 同 Desktop |
| Body Large | `1.125rem` | 同 |
| Body | `1rem` | 同 |
| Small | `0.875rem` | 同 |
| Technical Label | `0.75rem`（Mono、大寫、letter-spacing 0.08em） | 同 |

## Container、Grid、Spacing

- Container：`--container-reading` 760px、`--container-content` 1280px、
  `--container-wide` 1440px。
- Page Gutter：Desktop `clamp(32px,4vw,64px)`、Tablet `clamp(24px,3vw,40px)`、
  Mobile 20px。
- Grid：Desktop 12 欄、Tablet 8 欄、Mobile 4 欄（`.datum-grid` utility，
  各斷點皆用 `minmax(0, 1fr)` 軌道＋子項目 `min-width: 0`，避免長文字
  內容撐開版面）。
- Section 節奏：Major `clamp(120px,12vw,176px)`、Standard
  `clamp(88px,9vw,120px)`、Compact `clamp(56px,6vw,72px)`。
- Spacing：`--space-1`(4px) 到 `--space-32`(128px) 共 13 階單一數列，舊版
  `--space-3xs`…`--space-3xl` 命名全部改為指向新數列的別名，不是兩套
  互相獨立的系統。

## 圓角

| Token | 值 | 用途 |
|---|---|---|
| `--radius-xs` | 2px | 技術標記、細節裝飾 |
| `--radius-sm` | 6px | Input、Badge |
| `--radius-md` | 12px | Button、Card、CTA Banner |

上限 12px，不使用藥丸狀按鈕，不是所有元件都套用相同圓角。

## 邊框

- Hairline（一般分隔線）：`--border-hairline` 1px，以 Steel Token 為主。
- Technical（技術線）：`--border-technical` 1px。
- Datum（Active／軸線強調）：`--border-datum` 2px，Copper Token。
- UI（表單／按鈕）：`--border-ui` 1.5px。

## 陰影

僅 3 階（`--shadow-sm/md/lg`），只用於 Dropdown、Dialog、Mobile Drawer 與
Hover 時的可點擊元件，不用於預設卡片狀態。

## 按鈕

三種變體：`primary`（Copper 實心，Hover 有 1.5px 軸線位移＋加深）、
`secondary`（Ink 描邊）、`ghost`（純文字連結樣式，Tertiary）。另有
`secondary-invert`（深底專用）。六種狀態：Default／Hover／Focus
Visible／Active／Disabled／Loading（CC-01 新增 Loading 狀態與
`aria-busy`／`aria-disabled` 屬性）。Focus 外框：`2px solid
var(--color-focus)`，`outline-offset: 3px`。統一 12px 圓角，無藥丸狀。

## 品牌視覺元件（CC-01 新增，`src/components/brand/`）

六個 Precision Datum System 元件：`DatumOrigin`（基準原點標記）、
`ToleranceBand`（公差帶）、`VisionLockFrame`（視覺定位框）、
`AssemblySpine`（模組組裝軸）、`ProcessStamp`（工程流程標記）、
`CutawayWindow`（模組剖面視窗）。逐一的實作方式、Props、Accessibility、
Reduced Motion、Fallback 說明見 CC-01 執行報告第四節，或直接閱讀各
`.astro` 檔案開頭的 JSDoc 註解（每個元件都在檔案內完整記錄設計限制與
理由）。

## 表單

Input／Select／Textarea 統一使用 1.5px 邊框、`--radius-sm`(6px) 圓角；
錯誤狀態邊框變色為 `--color-error` 並顯示 `role="alert"` 錯誤文字；
Focus 狀態使用獨立 `--color-focus` 顏色與 `:focus-visible`。

## 卡片

單層卡片（不使用卡片內嵌卡片），預設 1px hairline 邊框、無陰影；Hover
時邊框轉為 `--color-copper-600` 並套用中階陰影 + 2px 位移。Solution /
Product / Industry 三種卡片共用 `Card.astro` 基底元件（CC-01 未修改此
元件結構，僅新 Token 值透過 Compat Alias 生效）。

## 響應式規則

- 斷點：360 / 390 / 768 / 1024 / 1280 / 1440 / 1920px。
- 桌面導覽於 `960px` 以上顯示，以下改為全螢幕抽屜式行動選單。
- 規格表於 `560px` 以下由橫向表格轉為堆疊式讀法。
- 表單欄位於 `720px` 以上採雙欄網格，以下單欄堆疊。
- 內部設計系統預覽頁（`/internal-preview/design-system/`）與全部既有
  頁面在 CC-01 完成後皆於 360／390／768px 通過零橫向溢位檢查（詳見
  `docs/DATUM_QA.md`）。
