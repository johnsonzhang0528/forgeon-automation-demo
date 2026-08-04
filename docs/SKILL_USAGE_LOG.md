# Skill Usage Log

本文件記錄本專案（鋒岳自動化 FORGEON AUTOMATION Demo）實際使用之 Claude Skills，
依 Phase 0 Preflight 要求建立。所有紀錄於實際呼叫後即時更新。

---

## 1. 已安裝 Skill 清單（環境實際掃描結果）

於 `.claude/skills/` 實際掃描到以下已安裝 Skill：

| Skill 目錄 | 本專案是否使用 |
|---|---|
| `anti-ai-writing` | 是（Phase 10） |
| `impeccable` | 是（Phase 2, 6, 9） |
| `higgsfield-generate` | 否（詳見下方說明） |
| `higgsfield-brandkit` | 否（詳見下方說明） |
| `higgsfield-product-photoshoot` | 否（詳見下方說明） |
| `higgsfield-websites` | 否（本指令明文禁止呼叫，見 §15.5） |
| `higgsfield-soul-id` | 否（未涉及人物形象需求） |
| `higgsfield-video-explainer` | 否（本案不含影片素材） |
| `higgsfield-youtube-thumbnail` | 否（不適用） |
| `higgsfield-marketplace-cards` | 否（不適用） |
| `higgsfield-game-generation` | 否（不適用） |

---

## 2. anti-ai-writing

- **安裝來源／版本**：`.claude/skills/anti-ai-writing/SKILL.md`，`version: 1.0.0`
- **實際呼叫方式**：非 CLI 型 Skill，為「編輯規則集」型 Skill。直接讀取
  `SKILL.md` 與 `references/banned-list.md`、`references/rewrites.md`、
  `references/examples.md`，依其五步驟工作流程（通讀 → 比對禁用清單 → 建立改寫 →
  朗讀複查 → 附診斷輸出）人工執行於已完成之中英文文案。
- **使用階段**：Phase 10（於商業目標、頁面用途、資料模型、CTA、SEO 意圖、
  中英文初稿、Demo 免責內容全數確定後才執行，符合其 §19.1 時機規則）。
- **修改／產生檔案**：
  - `docs/COPY_STYLE_GUIDE.md`（新建）
  - `docs/COPY_REVIEW_LOG.md`（新建，含逐項修改前後對照）
  - 首頁、解決方案總覽／詳細頁、產品總覽／詳細頁、產業總覽／詳細頁、
    About、Insights 兩篇、Contact 表單文案、404、Meta Description、
    CASE_STUDY.md 之中英文內文（就地修改）
- **主要結果**：移除公式化 AI 語氣詞彙（如「賦能」「無縫」「全方位」「一站式」
  「致力於」「In today's fast-paced world」「unlock the potential」「seamless」
  「leverage」等），保留技術含義、型號、數值、Demo 標示、法律文字與 CTA 承諾不變。
- **已知限制**：純中文語感判斷由 Claude 依規則集人工執行，非自動化程式掃描；
  Skill 本身聲明「不負責審查程式碼、變數、Schema 屬性」，故未觸碰任何 `.astro`
  / `.ts` 檔案的程式邏輯，僅編輯字串內容。
- **是否涉及外部費用**：否。

---

## 3. Impeccable

- **安裝來源／版本**：`.claude/skills/impeccable/SKILL.md`，`version: 4.0.4`
- **實際呼叫方式**：CLI 型 Skill，透過 `node .claude/skills/impeccable/scripts/context.mjs`
  載入專案內容，並依 Setup 指示載入對應 `reference/*.md` playbook
  （`init.md`、`new-work.md`、`critique.md`、`audit.md`、`polish.md`、
  `typeset.md`、`layout.md`、`harden.md`、`adapt.md`、`optimize.md`）。
  本環境未提供互動式瀏覽器 `live` 模式所需之持續連線終端，因此 `live` 子命令
  （視覺即時編輯）未使用；改以靜態程式碼分析與人工審視方式執行對應審查項目
  （Critique / Audit / Polish 之判斷標準仍完整套用，僅省略瀏覽器互動迴圈）。
- **模式設定**：本專案於 PRODUCT.md 中明確標註 Mode = **Persuade**（B2B 行銷／
  品牌官網），對應指令 §2.2「Brand／Marketing／B2B Corporate Website」要求，
  非 Product Dashboard／SaaS Application。
- **使用階段**：
  - Phase 2：`init`（建立 `PRODUCT.md`）＋ 建立 `DESIGN.md`（依 new-work 邏輯，
    因專案為全新品牌視覺世界，記錄色彩／字體／網格／Hero 方向決策）
  - Phase 6：首頁中期審查，套用 Critique / Typeset / Layout 檢查清單
  - Phase 9：最終審查，套用 Audit / Harden / Adapt / Optimize / Polish 檢查清單
- **修改／產生檔案**：
  - `PRODUCT.md`（新建）
  - `DESIGN.md`（新建）
  - `docs/DESIGN_SYSTEM.md`（新建，供作品集交付使用）
  - `src/styles/tokens.css`、`src/styles/global.css`、`src/styles/utilities.css`
  - 各頁面／元件之排版、間距、對比、響應式修正（依審查結果就地修改）
- **主要結果**：確立深海軍藍＋暖白＋銅橘 CTA 之視覺系統；避免 AI 漸層、玻璃擬態、
  過度圓角、SaaS 模板感；建立一致但非僵化的卡片節奏；長英文與規格表於行動裝置
  之排版問題於審查中修正。
- **採用建議**：色彩降低飽和度、CTA 對比強化、規格表窄螢幕改為堆疊式讀法、
  Hero 保留文字安全區、行動導覽採全螢幕抽屜。
- **未採用建議**：略。
- **已知限制**：無法執行需要真實瀏覽器渲染截圖的 `live` 迭代模式（此沙盒環境
  無持續互動瀏覽器工作階段）；設計判斷以程式碼審視、CSS 計算與 Lighthouse
  / axe 風格的靜態檢查為主，未使用 Impeccable 內建的螢幕截圖比對功能。
- **是否涉及外部費用**：否（`generate-image.mjs` 等會呼叫外部生圖 API 的腳本
  本專案未使用；所有影像為原創 SVG／CSS）。

---

## 4. higgsfield-generate / higgsfield-brandkit / higgsfield-product-photoshoot

- **安裝來源／版本**：均已安裝於 `.claude/skills/`，`SKILL.md` 已讀取確認存在。
- **本專案是否呼叫**：**否，計畫性不執行（planned but not executed）。**
- **未使用原因**：
  1. 這三個 Skill 的實際生成動作皆會呼叫 Higgsfield 付費 API，且需要
     `higgsfield auth login` 完成帳號授權後才能提交生成請求。
  2. 本沙盒執行環境沒有使用者的 Higgsfield 帳號登入狀態，也沒有互動視窗
     可讓使用者即時完成 OAuth／CLI 登入流程。
  3. 依本指令 §15.2「付費核准」規則：生成前必須先整理清單、說明數量與用途、
     **等待使用者核准後才提交**，且「不得因等待圖片而停止整個專案」。
  4. 因此，本專案依規則走「未核准前使用 Placeholder 或原創 SVG 繼續開發」路徑，
     完整以原創 SVG／CSS 圖像／清楚標示的 Placeholder 完成全站視覺，
     同時完整撰寫 `docs/HIGGSFIELD_ASSET_PLAN.md` 供使用者日後在自己環境
     完成 `higgsfield auth login` 後即可依計畫提交生成。
- **使用階段**：Phase 3（僅完成規劃文件，未執行生成）。
- **修改／產生檔案**：`docs/HIGGSFIELD_ASSET_PLAN.md`（完整素材計畫）。
  `docs/HIGGSFIELD_GENERATION_LOG.md` 建立但內容為「本次執行未產生任何生成紀錄」
  之明確聲明，保留欄位格式供未來使用者實際生成後填寫。
- **主要結果**：無實際生成輸出。全站圖像改以 `src/components/ui/` 下的
  原創 SVG 元件與 CSS 漸層／幾何圖形取代。
- **已知限制**：需要使用者本人 Higgsfield 帳號憑證與互動 CLI 登入，
  在此背景執行的沙盒工作階段中不可用。
- **是否涉及外部費用**：是（若日後執行）——正因涉及外部費用且需帳號授權，
  本次會話依規則不予執行，等待使用者核准與登入。

---

## 5. higgsfield-websites

- **是否使用**：**明確禁止使用**，依本指令 §15.5 規定，即使已安裝也不得呼叫。
- **原因**：本專案技術架構固定為 Astro，不得另建 React 或 TanStack 網站。
- **驗證**：全程未讀取其 `reference/*.md` 實作細節、未執行任何其 CLI 或腳本、
  未產生任何檔案。僅於 Phase 0 掃描目錄結構以確認其存在並記錄於本文件第 1 節。
