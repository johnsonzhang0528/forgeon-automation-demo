# 01 · Reference Lock

記錄日期：2026-08-21
研究方式：免費 Web Search + WebFetch（無 Refero Pro MCP，無付費工具）
研究範圍：Industrial / Architecture / Editorial / Premium B2B 四個方向

## 研究方法論與限制說明

本輪 Reference Research 使用 `WebSearch` + `WebFetch`（AI 摘要式抓取，非真人視覺檢視、
非截圖比對）。凡是 `WebFetch` 回報中**明確承認「基於頁面標題推測、未實際檢視內容」**
的結果，已被排除、不列入候選（例如對 `anduril.com` 的第一次查詢，模型誠實回報是
「educated assumptions」而非實際觀察，因此不採用，未強行湊數）。以下列入候選的每一筆，
其設計描述都來自 WebFetch 對該站點頁面內容的直接摘要，或多個獨立搜尋結果的交叉印證。

**已知限制**：WebFetch 是文字轉譯後的 AI 摘要，無法取代真人視覺比對或截圖並排比較，
色彩數值、精確字級等細節可能有摘要誤差。這是免費 Web Research 方法論的天花板，
在最終報告第 10 節會評估是否構成需要升級 Refero Pro 的瓶頸。

---

## 候選方向一：ALIO Industries（精密運動平台製造商）

**Reference**：ALIO Industries — https://www.alioindustries.com
**產業對應**：精密運動控制／定位平台製造商，是四個候選中與鋒岳「精密運動模組、
視覺定位檢測、自動化組裝整合」產品線**業務性質最直接對應**的一個。

- **Typography DNA**：乾淨的無襯線層級系統，主標題用粗體大字級（如
  "Delivering speed without compromise"），內文維持寬鬆行距以承載技術規格說明。
- **Grid DNA**：卡片式模組化 grid，直向堆疊 section（導覽 → hero banner →
  三欄產品卡 → 應用場景 tile → 部落格文章），每個產品卡固定「圖片 + Learn more」
  配對，形成可預期的視覺節奏。
- **Image DNA**：混合策略——部分產品用乾淨 SVG 圖解/白底去背產品照（技術清晰），
  部分用實際應用場景的紀實攝影（花崗岩底座運動系統、RTS stages，暗示工業應用
  情境）。裁切節制，多以完整產品輪廓呈現，非過度特寫。
- **Whitespace DNA**：大量留白分隔主要 section 與產品卡片周圍，避免資訊過載，
  呼應「精密工程」品牌調性——不擁擠、不倉促。
- **可移植元素**：白底 + 深藏青/炭色文字的極簡色彩克制策略；產品卡片的
  「圖 + 簡短技術標題 + Learn more」固定配對節奏；技術規格與品牌調性並存
  不互相犧牲的做法。
- **不應模仿元素**：三欄卡片重複出現在多個 section，若鋒岳也採用會強化
  baseline 診斷已標記的「Solutions/Products/Industries 三個連續 section 都長一樣」
  風險，須警惕不要照搬這個節奏。
- **與鋒岳相容程度**：高（業務性質對應度最高），但版面節奏本身偏保守/傳統
  B2B，不足以單獨撐起「高階設計工作室作品集」的目標質感，適合當 Secondary
  而非 Primary。

---

## 候選方向二：Terminal Industries（工業物流自動化，Awwwards SOTM）

**Reference**：Terminal Industries — https://www.terminal-industries.com
（Awwwards Site of the Month, 2025-10；Developer Award + Business & Services
Honors, 2025-08）

- **Typography DNA**：層級落差明顯的無襯線系統。主標題用粗體全大寫 + 寬字距
  （如 "FAST START"、"EXPLORE PRODUCT"），次標題轉為中等字重的正常大小寫，
  內文維持標準字重。Hero 大字級與輔助文字之間有戲劇性的尺寸跳躍，層級極清楚。
- **Grid DNA**：**Section 之間刻意結構不同**——Hero 用不對稱佈局（大圖對文字
  區塊）；Feature section 交替使用全寬文字與圖文配對；「Fast Start」用重複的
  三欄卡片結構；產品展示區用 carousel。這種「同一頁面內故意變化 section 骨架」
  的做法，正是任務書要求的「A/B/A/C 而非 Card/Card/Card/Card」範例。
- **Image DNA**：大幅全寬紀實攝影（工業場站、倉儲作業、基礎設施實景），
  非插畫。客戶品牌 logo 統一去彩化（灰階）處理，維持視覺克制同時建立信任感。
- **Motion DNA**：分頁籤式狀態切換（"AT THE GATE / IN THE YARD / AT THE DOCK"）
  搭配動態內容過渡；計算機/互動元件暗示即時狀態變化。整體動效克制、服務於
  資訊功能（狀態切換的回饋），非裝飾性。
- **可移植元素**：**Section 骨架刻意變化**這個原則是本次候選中最值得直接移植
  給鋒岳的一點——目前鋒岳首頁 Solutions/Products/Industries 三個連續卡片區，
  正是 Terminal Industries 這種做法要避免的反例。
- **不應模仿元素**：全大寫寬字距標題若過度套用在中文語境會出問題（中文沒有
  大小寫概念，全形寬字距在中文字級下觀感生硬），需限縮在英文/技術標籤/mono
  字級使用，不可直接套用到中文 H1。
- **與鋒岳相容程度**：中高。Section 節奏變化原則可直接借用；全大寫寬字距的
  英文標題語言只能局部借用（技術標籤、eyebrow、mono 字級），不能整段套用中文
  H1。

---

## 候選方向三：Snøhetta（建築事務所，editorial 攝影哲學）

**Reference**：Snøhetta — https://snohetta.com

- **Typography DNA**：無襯線清晰層級，主標題粗體混合大小寫（非全大寫），
  次標題同字族但字重較輕，內文標準字級、寬鬆行距。**全大寫僅保留給少數
  section 標頭**（如 "Disciplines"、"Latest News"），克制使用，不濫用。
- **Grid DNA**：多欄模組化 grid，可容納單欄長文字區塊與多卡片作品集 gallery
  並存；作品卡片維持統一長寬比（約 3:2），排列成穩定視覺節奏；導覽靠左對齊，
  搜尋功能右上；footer 重複導覽架構、分欄組織。
- **Image DNA**：作品圖以**無外框全出血卡片**呈現，非嵌框裝飾；統一長寬比
  維持 gallery 區塊的視覺節奏一致性；漸進式載入（lazy load placeholder）。
- **Whitespace DNA**：大量垂直留白分隔內容區（Latest News / Upcoming Events /
  作品集各自獨立呼吸空間）；水平對齊維持一致邊界，強調模組性、避免視覺壅塞。
- **可移植元素**：「全出血、無外框、統一長寬比的作品圖卡片」這個處理方式，
  適合鋒岳的產業別/方案案例呈現——目前鋒岳的部分卡片圖片明顯偏「插畫/色塊」，
  Snøhetta 這種「紀實攝影 + 統一比例 + 無多餘裝飾框」的做法可以直接借用於
  Industries/Solutions 卡片圖片處理原則。
- **不應模仿元素**：Snøhetta 是純粹的作品集導向站點（其商業模式就是展示案例），
  鋒岳需要保留明確的技術規格/CTA/轉換路徑，不能照搬「安靜到底、CTA 極弱」
  的建築事務所節奏——鋒岳的 CTA 可辨識度必須維持（任務書 §37 明確要求）。
- **與鋒岳相容程度**：中。Typography 克制與圖片處理原則高度可借用，但整體
  「作品集式極簡」的商業轉換強度不足以直接套用在 B2B 詢價導向的鋒岳。

---

## 候選方向四：Path Robotics（機器人公司，Awwwards SOTD，黑白極簡+動效）

**Reference**：Path Robotics — https://www.awwwards.com/sites/path-robotics
（Awwwards Site of the Day）

- **Typography DNA**：受限資訊有限，但排版策略明確依賴字重差異（而非色彩）
  建立層級，因為色彩被限制在純黑白之內。
- **Color DNA**：極端克制——單一黑白（#000）配色策略，最大化對比、依賴
  排版與留白建立精緻感，不靠色彩豐富度。
- **Motion DNA**：技術棧含 GSAP + Locomotive Scroll，暗示精緻的 scroll-triggered
  動效與轉場，動效在此扮演「補償單色調帶來的視覺單一性」的角色。
- **可移植元素**：「用字重/留白/動效建立層級，而非依賴色彩」這個原則，
  可以作為鋒岳在**內頁技術規格頁面**（Products/Solutions detail）的層級處理
  參考——尤其鋒岳目前色彩系統本身還在分歧狀態（見 baseline 文件），優先把
  排版層級做扎實，比色彩調整更立即見效。
- **不應模仿元素**：純黑白對鋒岳不適用——鋒岳需要維持品牌辨識度（銅橘/暖白
  現況），且過度依賴精緻 scroll 動效需要 GSAP 等額外 dependency，與任務書
  §26「如果現有專案沒有 GSAP，不要只是為了『高級』就加入 GSAP」的原則衝突。
- **與鋒岳相容程度**：低-中。僅作為「排版層級可以不靠色彩」的思路參考，
  不適合作為 Primary 或 Secondary 的具體視覺依據。

---

## 比較與決策

| 面向 | ALIO | Terminal | Snøhetta | Path Robotics |
|---|---|---|---|---|
| 業務對應度 | 最高 | 中 | 低（純作品集） | 低（防務科技） |
| Section 節奏參考價值 | 低（重複三欄） | **高** | 中 | 低（資訊不足） |
| 圖片處理參考價值 | 中 | 高（紀實攝影） | **高**（統一比例無框） | 低 |
| Typography 層級參考價值 | 中 | 高 | **高**（克制大寫） | 中（字重驅動） |
| 動效參考價值 | 低 | 中（功能性狀態切換） | 低 | 高但需額外 dependency |
| 與現有零依賴技術棧相容度 | 高 | 高 | 高 | **低**（需 GSAP） |

**Primary 與 Secondary 的選擇邏輯**：鋒岳需要的不是「作品集感」（Snøhetta 太純粹）、
不是「防務科技感」（Path Robotics 色彩策略不合品牌），而是「B2B 工業自動化網站
如何避免看起來像 SaaS 模板」的具體解法。Terminal Industries 是四者中**唯一同時
具備工業自動化業務語境 + 明確反-模板 section 節奏證據 + 零額外 dependency 相容性**
的候選，故列為 Primary。

## Primary Reference

**Terminal Industries** — https://www.terminal-industries.com

**採用原因**：
1. 業務語境最接近（工業自動化/物流），非防務科技或純建築作品集。
2. 有具體、可驗證的「section 骨架故意變化」證據，直接對應 baseline 診斷中
   「Solutions/Products/Industries 三連續卡片區」的風險。
3. 動效克制且服務於功能（狀態切換回饋），不需要引入 GSAP 等新 dependency，
   符合任務書零成本、零新依賴的硬限制。
4. 已獲 Awwwards Site of the Month 與 Developer Award 雙重外部驗證，非主觀選擇。

**決定的整體 art direction**：以「主標題大字級 + 內文適度層級落差」建立清楚
hierarchy；**至少讓 Solutions/Products/Industries 三個連續 section 之中有一個
改用不同的骨架**（例如其中一區改為不對稱圖文配對，而非三欄卡片重複）；圖片
維持紀實攝影優先於插畫/色塊。

## Secondary References

**Secondary A — Snøhetta**（補足圖片呈現的具體做法）
- 採用元素：作品/案例圖片改為「全出血、無多餘裝飾外框、統一長寬比」的呈現
  方式，套用在鋒岳 Industries/Solutions 卡片圖，取代目前偏插畫/色塊的產品卡片
  圖片。
- 採用元素：全大寫僅保留給極少數 section 標頭（呼應鋒岳既有的 eyebrow 用法），
  不擴大使用範圍。

**Secondary B — ALIO Industries**（補足技術規格頁面的可信度處理）
- 採用元素：白底 + 深色文字的克制配色策略、產品卡片「圖 + 簡短技術標題 +
  Learn more」的固定配對節奏，適合鋒岳的 Products 列表頁面微調參考。
- 明確不採用：ALIO 首頁本身三欄卡片重複的節奏，不作為 section 骨架的示範對象
  （這正是 Primary Reference 要避免的模式）。

## 不進入 Reference Lock 的候選

- **Path Robotics**：色彩策略（純黑白）與動效技術（需 GSAP）皆與鋒岳現有
  品牌與零依賴技術棧不相容，僅作為「排版層級可脫離色彩單獨成立」的抽象思路
  參考，不列入具體視覺依據。
- **Anduril**：第一次 WebFetch 結果為模型明確承認的推測性內容，未通過本輪
  「不得捏造 reference 已研究」的紅線，予以排除。

## Reference Averaging 防呆聲明

本文件依任務書 §16 要求，Primary Reference（Terminal Industries）在後續
Taste／Impeccable／Hallmark 階段對整體 art direction、typography attitude、
layout rhythm、image philosophy 擁有最高權重。Secondary A／B 僅補強 Primary
不足之處（圖片呈現細節、技術頁面可信度細節），不得在後續階段被拿來推翻或
稀釋 Primary 的方向決定。Hallmark 的 stylistic preference 若與本文件衝突，
依任務書 §28／§43 優先順序處理：Reference Lock 優先於 Hallmark 建議。
