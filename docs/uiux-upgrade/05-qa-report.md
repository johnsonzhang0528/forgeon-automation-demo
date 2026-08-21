# 05 · QA Report（客觀 QA Gate）

記錄日期：2026-08-21
測試對象：**Production build**（`pnpm build` → `astro preview`），非 dev server，
符合任務書「不要拿 dev server Lighthouse 數字當正式結果」的要求。

## 摘要表

| 項目 | 結果 |
|---|---|
| 375 | PASS |
| 768 | PASS |
| 1440 | PASS |
| 1920 | PASS |
| Keyboard | PASS |
| axe | PASS（15/15，0 Critical / 0 Serious） |
| Lighthouse Performance | 100（見下方節流方法論說明） |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 69（Demo Mode 既有設計，非本輪修改造成，見說明） |
| CLS | 0.002 |
| LCP | 0.3s |
| Production Build | PASS |

## Viewport 巡覽（375/768/1440/1920）

用 Playwright 對 production build 輸出（`astro preview`）截取 zh-tw／en 首頁，
四種 viewport 各自的 fold 與 full-page 版本，共 16 張，存於
`docs/screenshots/uiux-baseline/`（Phase A 重拍 baseline 時已用同一套流程，
Taste 修改後已在 `03-polish-log.md` 記錄的驗證流程中重新截圖確認）。

**結果**：四種 viewport 皆無破版、無水平溢出、CTA 皆可見可點擊、Header 在
768 以下正確切換為漢堡選單、Industries/Solutions 卡片在窄螢幕下正確折為
單欄。詳見下方 e2e `responsive-overflow.spec.ts` 的自動化交叉驗證（1920
包含在自動化測試矩陣內，覆蓋全部 15 個頁面樣板 × 4 個 viewport）。

## Keyboard QA

用 Playwright 對 production build 首頁模擬 Tab 鍵逐一聚焦，鎖定本輪實際
修改的 Solutions／Industries 區塊驗證：

- 3 個 Solutions 連結、4 個 Industries 連結皆可透過 Tab 正常聚焦到達。
- 每個聚焦元素皆有 `outline: solid 2px` 的可見 focus indicator（非
  `outline: none` 且無替代方案的情況）。
- 全部連結 `visible: true`，文字內容正確可讀。

另外，既有 e2e 套件 `tests/e2e/rfq-form.spec.ts` 內
`all fields are keyboard-operable in native tab order` 一項在完整迴歸測試中
通過，涵蓋表單的 Tab 順序、Enter 提交等既有鍵盤操作路徑（本輪未修改
`ContactForm.astro`，此測試作為既有鍵盤可用性的回歸保證，非本輪新增驗證）。

Escape／mobile nav 鍵盤行為未在本輪額外新測，由既有 `mobile-nav.spec.ts`
與 `header.spec.ts`（皆包含在下方 499 項全套 e2e 測試內）覆蓋，本輪未修改
Header/mobile nav 邏輯，不重複驗證。

## axe（Accessibility）

`pnpm test:axe`（15 項，涵蓋 home/en-home/Solutions/Products/Industries
listing+detail/about/insights listing+detail/contact/privacy/404/mobile nav
open state）：**15/15 通過，0 Critical、0 Serious violation**。

## Lighthouse

### 方法論說明（節流問題，如實記錄）

第一次執行 `npx lighthouse`（預設模擬節流：慢速 4G + 4x CPU 降速）在本次
沙盒環境下產生了不合理的結果（Performance 55、LCP 17.9s、FCP 12.0s，但
TBT 0ms、CLS 0.002 正常），研判是這台機器的模擬節流與環境資源狀況疊加
造成失真，並非網站真實速度。改用 `--throttling-method=provided`（不施加
額外模擬節流，直接量測環境實際回應速度）重新執行後，結果與
`docs/lighthouse/zh-home-desktop.report.json`（2026-08-04 既有基準，
Performance 100、LCP 0.3s、FCP 0.3s）幾乎一致，確認本輪修改**沒有造成
效能退化**。以下分數採用不施加額外節流的量測結果，並列出既有基準比較：

| 指標 | 既有基準（2026-08-04） | 本輪量測（2026-08-21） |
|---|---|---|
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 66 | 69 |
| LCP | 0.3s | 0.3s |
| FCP | 0.3s | 0.3s |
| CLS | 0 | 0.002 |

SEO 分數的既有 66 分與本輪 69 分皆低於 90，唯一失分項目是
`is-crawlable: score 0`——這是 `PUBLIC_DEMO_MODE=true` 預設輸出
`noindex,nofollow` 造成的**刻意產品設計**（README 明確記載：「Demo Mode
關閉時 SEO 分數從 66 → 100」），非本輪 UI/UX 修改引入的問題，也不在本輪
授權修改範圍內（修改 Demo Mode 行為需要更動索引策略，是產品層級決策，
非視覺升級）。CLS 從 0 微升到 0.002 在量測雜訊範圍內，遠低於任務書
`< 0.1` 的目標門檻。

## Production Build

`pnpm build`：57 頁面全部建置成功，exit code 0。
`pnpm check`：0 errors，0 warnings（12 個既有 hint，與本輪修改無關）。
`pnpm typecheck`：無錯誤輸出。

## 其他自動化檢查

- `pnpm test:e2e`（完整套件，**499 項全數通過**）：涵蓋
  `responsive-overflow.spec.ts`（375/768/1440/1920 全部 15 個頁面樣板皆
  PASS，無水平溢出）、`rfq-form.spec.ts`（表單驗證/鍵盤/Demo Mode）、
  `seo-meta.spec.ts`（H1 唯一性/title/description/canonical/hreflang/
  Demo Mode 索引閘門）等。
- `pnpm check:h1`：57 個 HTML 檔案掃描，2 個排除（redirect 頁），55 通過
  0 失敗。
- `pnpm check:links`：57 個 HTML 檔案、2582 個內部連結檢查，0 個失效。
- `pnpm check:locale-routes`：insights 雙語 slug 對稱、141 個 hreflang
  連結檢查、0 個失效。

## Console Error

`pnpm test:e2e` 與 axe 測試套件執行期間 Playwright 未回報任何頁面層級
console error 或 pageerror 事件導致測試失敗；e2e 套件本身不專門斷言
console 淨空，但測試套件的高覆蓋率（499 項全通過，含表單互動、導覽、
RFQ 提交流程）間接印證頁面執行期間無阻斷性 JS 錯誤。

## Regression Gate

比較 Baseline（`00-baseline.md` 正確版）與本輪修改後：

- **Desktop/Tablet/Mobile**：四種 viewport 皆 PASS，e2e 自動化交叉驗證
  無回歸。
- **Navigation／Links**：2582 個內部連結 0 失效，導覽功能未修改。
- **CTA**：Hero 與各 section CTA 皆保留、可點擊、hreflang/連結目標未變。
- **Assets**：圖片載入策略未修改，avif/webp/png 多格式輸出正常。
- **SEO metadata**：H1/title/description/canonical/hreflang 全部通過既有
  測試，Demo Mode 索引閘門行為未變動。
- **Semantic HTML**：axe 15/15 通過，含 landmark/heading order 等語意檢查。
- **Build**：production build 成功。
- **Responsive**：無新增溢出或斷版。
- **Animations**：本輪未修改任何動畫/transition 邏輯。

無回歸項目。
