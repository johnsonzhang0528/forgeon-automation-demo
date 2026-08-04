# COPY_REVIEW_LOG.md

執行時機：Phase 10（商業目標、頁面用途、資料模型、CTA、SEO 意圖、中英文初稿、
Demo 免責內容均已確定後才執行，符合 anti-ai-writing Skill 與指令 §19.1 的時機規則）。

執行方式：因初稿文案已依 `docs/COPY_STYLE_GUIDE.md` 所列規則（源自指令 §18／§19
與 anti-ai-writing Skill 完整禁用清單）撰寫，系統性掃描（`grep` 全站 `src/content/`、
`src/pages/`、`src/data/locales/`）確認：中文 AI 語感詞彙清單零命中；英文 AI
慣用詞清單僅 1 處合理的技術性使用（見下）；結構性問題（Em dash）發現 8 處
公開文案命中，全數修正。

---

## 發現與修改

### 1. Em dash 於公開文案（結構性違規，anti-ai-writing 明確禁止）

| 檔案 | 修改前 | 修改後 | 原因 |
|---|---|---|---|
| `src/content/solutions/precision-positioning.md` | "Suited to stations requiring stable, repeatable positioning — dispensing, fastening, measurement, or pick-and-place." | "Suited to stations requiring stable, repeatable positioning, such as dispensing, fastening, measurement, or pick-and-place." | Em dash 改為 "such as" 子句，語意不變 |
| `src/content/solutions/vision-inspection.md` | "...feature recognition — replacing selected manual inspection stations." | "...feature recognition, replacing selected manual inspection stations." | Em dash 改為逗號連接分詞子句 |
| `src/content/solutions/assembly-cells.md` | "Combines repetitive assembly actions — pick-and-place, fastening, dispensing, or press-fitting — into a single work cell." | "Combines repetitive assembly actions (pick-and-place, fastening, dispensing, or press-fitting) into a single work cell." | 雙 Em dash 插入語改為括號 |
| `src/content/products/vision-x2.md` | "...barcode/feature recognition — standalone or integrated into an automated assembly system." | "...barcode/feature recognition, deployed standalone or integrated into an automated assembly system." | Em dash 改為動詞子句銜接 |
| `src/content/insights/en/upgrade-vs-rebuild.md`（2 處） | "...shift the bottleneck to the next station — a situation that usually calls for..." / "...aren't mutually exclusive — in most cases..." | 拆成兩個句子（句號分句） | Em dash 拆句，符合 anti-ai-writing 對長句結構的建議處理方式 |
| `src/pages/en/solutions/index.astro` | Meta description 含 "...six solution areas — precision positioning, ... — configured around..." | 改為 "...six solution areas, including precision positioning, ..., configured around..." | Meta description 為公開可見/可索引文字，同樣納入規則 |
| `src/pages/en/index.astro` | "...plant integration engineering — deployed as a single module..." | "...plant integration engineering, deployed as a single module..." | 同上 |
| `src/pages/en/about/index.astro` | "...certification or award here — this site is a portfolio concept case..." | 拆成兩個句子 | 同上 |
| `src/pages/zh-tw/about/index.astro` | "...國際認證或獎項——本網站為作品集概念案例..." | 拆成兩個句子（句號） | 中文全形破折號同樣視為結構性違規處理 |

**修改原因總結**：Em dash 是 anti-ai-writing Skill 明確列為 AI 語氣指紋的結構問題，
即使語意正確，過度使用會讓讀者辨識出制式生成文字的節奏感。全數改為句號分句、
逗號連接子句或括號插入語，皆保留原意與資訊完整度。

### 2. 英文 AI 慣用詞掃描結果

掃描 `delve / unlock / leverage / robust / harness / showcase / navigate /
vibrant / framework / ecosystem / seamless / cutting-edge / empower /
revolutionize / end-to-end / in today's fast-paced / it is worth noting /
furthermore / moreover` 全站文案，僅 1 處命中：

- `src/data/locales/en.ts`：Demo Mode 送出結果文案中使用 "portfolio showcase site"。
  **判定為合理技術性使用**（依 anti-ai-writing Skill Edge Cases 規則：
  "some banned words have legitimate technical uses... Use judgement"），
  此處 "showcase" 用於精確描述網站的實際性質（作品集展示網站），非空泛填充詞，
  **未修改**。

### 3. 中文 AI 語感詞彙掃描結果

掃描「在現今快速變化的產業環境中／致力於／賦能／無縫／全方位／一站式／卓越／
創新領先／滿足多元需求／引領產業未來／開啟無限可能／值得信賴的合作夥伴」，
**全站零命中**。初稿撰寫階段已直接依 `docs/COPY_STYLE_GUIDE.md` 規則避開，
故此次審查未發現需要修改的中文 AI 慣用語。

### 4. 結構性檢查：Rule of Three

檢查全站清單型內容（解決方案、產業、CTA 分組）是否有制式三項一組樣板：

- 解決方案總覽刻意採用 **6 項**（超過制式三張卡），符合指令 §13.2「制式三張
  功能卡」的禁止規定。
- 產業應用採用 **4 項**。
- 首頁「合作理由」區塊採用 **4 項**。
- 產品線維持 **3 項**（AXM-400 / VISION-X2 / FLEXCELL-M），但這是指令 §9.4
  明確要求的產品數量（"至少三個虛構產品"），屬於商業事實而非文風選擇，
  **不視為 Rule of Three 違規，未修改**。

---

## 技術與事實回歸檢查

修改範圍嚴格限制在文字措辭，比對修改前後確認：

- **技術含義**：未變更。所有修改僅調整標點與句子連接方式，未新增或刪除
  任何技術敘述。
- **型號與數值**：未觸碰。AXM-400 / VISION-X2 / FLEXCELL-M 型號字串、
  `src/content/products/*.md` 中的 `specs` 陣列數值完全未修改。
- **Demo 標示**：未變更。`demoData: true` 欄位與頁尾／規格頁的中英文法律
  免責聲明文字（`legalNoticeZh/En`、`demoDataNoticeZh/En`，位於
  `src/config/site.ts`）本次審查完全未觸碰，保持指令 §3、§20 規定的原文。
- **CTA 承諾**：未變更。「提交專案需求」「索取技術建議」等 CTA 文字與其
  連結目標（`/contact/`）未修改。
- **SEO 搜尋意圖**：未變更。所有修改僅發生在 meta description 的標點與連接詞，
  關鍵字與資訊涵蓋範圍保持一致。
- **雙語一致性**：修改後的英文語句與對應中文版本的資訊內容仍一致
  （逐頁比對，見上表對照的中文版本未受影響，因中文版本本來就未使用全形破折號
  於同一位置，除了 `about/index.astro` 一處中文全形破折號同步修正）。
- **頁面商業目的**：未變更。所有頁面的 CTA 結構、資訊架構與轉換路徑不受
  本次文字調整影響。

---

## 結論（初版審查）

本次 anti-ai-writing 審查範圍涵蓋首頁、解決方案（總覽＋6 個方案）、產品
（總覽＋3 個產品）、產業應用（總覽＋4 個產業）、About、Insights（2 篇）、
Contact 表單文案、404、Meta Description。共發現 8 處結構性違規（Em dash）
並全數修正；英文慣用詞掃描 1 處合理技術性使用予以保留；中文 AI 語感詞彙
零違規。所有修改均為文風調整，未影響任何技術事實、型號數值、Demo 標示、
法律文字、CTA 承諾或 SEO 意圖。

---

## 第二輪審查（本次全面修正 Pass，新增文案）

執行時機：P1 決策型內容（首頁適合／不適合、雙路徑入口、產品選型與比較表、
方案適合／不適合、Concept Scenario）與新增頁面（`/privacy/` 雙語頁）撰寫
完成後，回歸檢查 §3.4／§7 要求的「文案完成後再次使用 anti-ai-writing」。

### 掃描範圍

`src/pages/zh-tw/index.astro`、`src/pages/en/index.astro`、
`src/pages/zh-tw/products/index.astro`、`src/pages/en/products/index.astro`、
`src/pages/zh-tw/solutions/[slug]/index.astro`、
`src/pages/en/solutions/[slug]/index.astro`、
`src/pages/zh-tw/privacy/index.astro`、`src/pages/en/privacy/index.astro`、
`src/data/locales/zh-tw.ts`、`src/data/locales/en.ts`（Demo Mode 送出結果
文案修改處）。

### 發現與修改

**Em dash（結構性違規）**：`grep -n "—"` 掃描上述檔案，發現 11 處新增
英文公開文案使用 Em dash，另發現 1 處中文全形破折號（`——`）於
`src/data/locales/zh-tw.ts` 的 Demo Mode 送出結果文案。全數修正，改為
句號分句或逗號／分號連接子句：

| 檔案 | 位置 | 修改方式 |
|---|---|---|
| `src/pages/en/products/index.astro` | Selection criteria 區塊 description | Em dash 改為句號分句 |
| `src/pages/en/products/index.astro` | 系統相容關係段落 | Em dash 改為逗號連接子句 |
| `src/pages/en/products/index.astro` | 比較表 caption | Em dash 改為分號 |
| `src/pages/en/solutions/[slug]/index.astro` | Fit-card 不適合清單一項 | Em dash 改為分號 |
| `src/pages/en/solutions/[slug]/index.astro` | Concept Scenario 交付物段落 | Em dash 改為分號 |
| `src/pages/en/solutions/[slug]/index.astro` | Concept Scenario 免責聲明 | Em dash 改為句號分句 |
| `src/pages/en/privacy/index.astro`（3 處） | Concept 聲明、資料類型段落、Cookie 段落 | Em dash 改為逗號子句、句號分句或分號 |
| `src/pages/en/index.astro` | Fit-card 不適合清單一項 | Em dash 改為分號 |
| `src/data/locales/en.ts` | Demo Mode 送出結果文案 | Em dash 改為句號分句 |
| `src/data/locales/zh-tw.ts` | Demo Mode 送出結果文案（全形破折號） | 全形破折號改為句號分句 |

程式碼註解內的 Em dash（例如各頁面 `<script>` 區塊中解釋 `product_view`／
`solution_view` 事件觸發原因的註解）**未修改**，依 anti-ai-writing Skill
Edge Cases 規則：「Code and code comments: Do not touch code... Code is
governed by different conventions」——程式碼註解非公開文案，不適用禁用清單。

**英文慣用詞掃描**：`delve / unlock / leverage / robust / streamline /
elevate / foster / harness / holistic / synergy / cutting-edge /
game-changing / empower / revolutionize / paradigm / utilize / facilitate /
showcase / navigate / vibrant / ecosystem / tapestry / realm / landscape`
掃描新增文案，**零命中**。

**中文 AI 語感詞彙掃描**：新增中文文案（首頁適合／不適合、雙路徑入口、
產品選型、方案適合／不適合、Concept Scenario、隱私權頁）**零命中**。

**Rule of Three 檢查**：新增清單型內容刻意變化數量而非制式三項——首頁
適合／不適合各 4 項、產品選型條件 3 個判斷步驟（依實際決策邏輯需要，非
樣板選擇）、方案適合／不適合各 4 項、Concept Scenario 6 個子區塊
（問題背景／使用者角色／資料輸入／方案選擇／交付物／驗收方式，對應
spec §3.4 要求的完整結構，非文風選擇）。

### 技術與事實回歸檢查（第二輪）

- 所有修改僅調整標點與句子連接方式，未變更任何技術敘述、型號、規格數值。
- 產品比較表數值與 `src/content/products/*.md` 之 `specs` 陣列保持一致
  （比較表本身不含規格數字，僅比較「解決的問題／部署方式／典型應用／
  是否可單獨採用」等定性欄位，避免與規格表數字重複或衝突）。
- Concept Scenario 明確標示「虛構」且不含任何真實成果百分比、營收數字
  或客戶推薦內容，符合指令 §3.4「不得加入虛假成果百分比、營收或客戶
  推薦」規定。
- 隱私權頁文案修改後，仍準確描述 Demo Mode／Live Mode 兩種模式的實際
  資料處理行為，未新增任何未經確認的法遵承諾。

### 結論（第二輪）

新增文案共發現 12 處 Em dash／全形破折號結構性違規（11 處英文 Em dash＋
1 處中文全形破折號），全數修正；英文慣用詞與中文 AI 語感詞彙掃描皆為
零命中，代表本輪新增文案在撰寫階段已直接依 `docs/COPY_STYLE_GUIDE.md`
規則書寫，僅 Em dash 這類「語意正確但屬於 AI 語氣指紋」的結構性問題
需要事後修正，與第一輪結果的模式一致。
