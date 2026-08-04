# COPY_STYLE_GUIDE.md

適用範圍：鋒岳自動化 FORGEON AUTOMATION 全站中英文文案。
本指南整合指令 §18（文案初稿規則）、§19.3（中文附加規則）、§19.4（英文附加規則）
與 `anti-ai-writing` Skill 的禁用清單，作為未來新增或修改頁面文案時的檢查依據。

## 語氣總則

- 專業、清楚、工程導向。
- 不誇大、不空泛，少用形容詞。
- 先說問題，再說解法（每個解決方案／產業頁的結構都遵循「常見問題 → 解決方式」）。
- 明確說明適用條件，不做無條件的承諾。
- 提供明確下一步（CTA），不用空洞的結尾句收尾。

## 禁止宣稱（中英文皆適用同一原則）

不得使用：世界領先、業界第一、最先進、頂尖團隊、保證提升產能、零故障、
絕對精準、全球知名客戶、百分之百滿意，及其英文對應說法
（world-leading, industry-first, cutting-edge, guaranteed, zero-failure,
absolutely precise 等）。

可使用的替代語彙：依專案條件評估、可整合、適用於、協助降低、支援、
依設備與製程需求配置、實際規格需經工程確認。

## 中文禁用詞彙／句型（依指令 §19.3）

在現今快速變化的產業環境中、致力於、賦能、無縫、全方位、一站式、卓越、
創新領先、滿足多元需求、不僅……更……、從……到……引領產業未來、
開啟無限可能、值得信賴的合作夥伴。

範例：

> ❌ 我們致力於提供全方位且無縫整合的自動化解決方案，賦能企業開創智慧製造新未來。
> ✅ 我們整合運動模組、視覺定位與組裝工作站，協助工廠處理定位、檢測與重複組裝流程。

## 英文禁用詞彙／句型（依指令 §19.4，並疊加 anti-ai-writing Skill 完整清單）

In today's fast-paced world、Unlock the potential、Cutting-edge、Seamless、
Robust solutions、Empower your business、Transform your operations、
Leverage、Revolutionize、End-to-end excellence，以及 anti-ai-writing 清單中的
delve、harness、showcase（作為填充詞時）、navigate（作為填充詞時）、vibrant、
framework（作為填充詞時）、ecosystem 等。

## 結構性規則（anti-ai-writing）

- **不使用 Em dash（—）於公開文案。** 改用句號分句、括號，或改寫句子結構。
  程式碼註解不受此規則限制（Skill 明文排除程式碼審查範圍）。
- **不強制三項一組（rule of three）。** 清單長度依實際內容決定，本站解決方案
  刻意採用 6 項而非制式 3 項卡片，產業採用 4 項，避免「制式三張功能卡」樣板感
  （亦呼應指令 §13.2 設計禁止事項）。
- **避免公式化轉折詞**：Furthermore、Moreover、Additionally、Subsequently
  等機械式轉折，改用具體的因果或對比句。
- **弱動詞替換**：避免 "serves as a"、"acts as a"、"utilize"、"facilitate"，
  改用具體動詞（例如 "X bridges A and B" 而非 "X serves as a bridge"）。

## 雙語一致性規則

- 中英文版本必須傳達相同的商業事實、CTA 承諾與 SEO 搜尋意圖，但英文不是
  逐字直譯——句子結構依英文語感重新組織（見指令 §8.2）。
- 型號（AXM-400 / VISION-X2 / FLEXCELL-M）、Demo 標示文字、法律免責聲明的
  「事實內容」在中英文版本間必須對應一致，即使措辭不同。

## Demo 資料揭露規則（不可被文風修改觸碰）

以下文字為固定法律／誠信內容，任何文風調整都不得改變其實質意義：

- 頁尾：「本網站為作品集概念案例，品牌、產品、規格及專案資料均為虛構內容。」
  / "Concept website created for portfolio demonstration..."
- 產品／規格頁：「本頁技術規格為概念展示資料，實際產品需依工程條件確認。」
  / "Specifications shown on this page are fictional demonstration data..."
