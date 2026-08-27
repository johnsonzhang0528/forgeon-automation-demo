# 01 · Reference Pool

記錄日期：2026-08-23
研究方式：`WebSearch` + `WebFetch`（無 Refero Pro MCP、無截圖工具、無真人視覺比對）
研究範圍：工業自動化／精密運動控制／機器視覺／半導體設備／機器人／建築事務所／
品牌設計工作室／高階產品品牌／汽車科技／專業儀器／防務科技，共 12 個類別

本文件為 `docs/uiux-upgrade/01-reference-lock.md`（4 個站點的早期小規模研究）的
延伸與擴大版本，方法論相同但廣度與嚴謹度大幅提高。早期文件的結論不被視為
定論——本輪重新檢視全部候選，若結論一致會明確標註「與前次研究一致」，
若不同則說明原因，不會為了維持一致性而扭曲本輪的獨立判斷。

## 研究方法論與限制說明（必讀）

本輪使用 `WebSearch` 探索候選名單，再以 `WebFetch` 實際抓取頁面內容（HTML 轉
文字/Markdown 後由小模型摘要），非真人視覺檢視、非截圖比對、非像素級量測。
以下是本輪明確遇到、且必須誠實揭露的限制：

1. **`WebFetch` 是文字轉譯後的 AI 摘要，不是螢幕截圖**。色彩數值（hex）、
   精確字級（px/rem）、行高、動效的實際質感，本輪一律無法直接驗證，
   只能從頁面結構線索（如 class name、圖片尺寸屬性、CSS 變數名稱、
   文案語氣）**間接推論**。凡本文件描述「色彩克制」「字重驅動層級」等說法，
   均為結構/文字線索推論，非色票比對。
2. **多筆候選 `WebFetch` 失敗或內容過薄**，包含但不限於：
   `pi-usa.us`（內容被截斷，僅剩標題）、`reliablerobotics.com`（重新導向後
   內容仍過薄）、`basler-ag.com`／`www.basler-ai.com`（網域不存在）、
   `cognex.com`（403 Forbidden）、`oma.eu`／`oma.com`（僅抓到導覽列，
   無法評估視覺設計）、`bjarkeingels.com`（網域不存在，正確網域為
   `big.dk`）、`cosentino.com`（307 導向未跟隨）、`zeiss.com/corporate`
   （404，改用 `zeiss.com/microscopy` 成功）、`fosterandpartners.com`
   （回傳 404 頁面而非首頁）、`polestar.com`／`epson.com`（僅抓到地區
   選擇頁，無實質設計內容）、`kilogram.studio`（網域已過期轉售）、
   `b-and-w.com`（連線逾時）、`staubli.com`（403 Forbidden）、`anduril.com`
   （多次嘗試僅取得頁面標題，無法取得真實頁面結構）。**這些站點一律不列入
   候選清單**，即使外部搜尋資料顯示它們可能是優秀案例（例如 Anduril 有
   Awwwards Honorable Mention 佐證、Cognex 是機器視覺產業龍頭），
   也依「未經 WebFetch 實際驗證內容者不得捏造描述」的紅線予以排除，
   不強行湊數到 20 筆。
3. 最終列入候選清單的每一筆，其 Design DNA 描述都來自 `WebFetch` 對該
   頁面的直接摘要結果，或該摘要與獨立 `WebSearch` 結果的交叉印證
   （例如 Path Robotics 的技術棧與配色策略，是透過多筆搜尋結果交叉印證，
   因其官網當時未被直接 WebFetch 但有高度一致的外部第三方報導佐證）。
4. 本輪實際成功取得可用內容並列入候選的站點為 **19 筆**，未達到「盡量
   湊滿 20+」的字面數字，但均為真實驗證過的內容，優於為湊數而納入
   未驗證或內容過薄的候選。這是免費 Web Research 方法論的天花板，
   在此誠實揭露而非隱藏。

---

## 候選清單（19 筆，依產業類別分組）

### 精密運動控制／工業自動化

#### 1. ALIO Industries
- **URL**：https://www.alioindustries.com
- **類別**：精密運動平台製造商
- **入選原因**：與鋒岳「精密線性模組、視覺定位」業務性質直接對應。
- **Design DNA**：H1 大字級陳述句（如 "Best-in-class Ultra-Precise Motion
  Control"）+ 支援性說明文字；模組化卡片 grid，產品卡固定「圖＋簡短標題＋
  Learn more」節奏；圖片混合 SVG 圖解與白底產品照；色彩克制（白／灰／深色
  文字），僅品牌元素少量用色；雙層導覽選單（Products & Systems／
  Applications／Company／Library）組織龐大技術目錄。
- **狀態**：Keep（Secondary 候選——技術頁面可信度處理參考）

#### 2. Terminal Industries
- **URL**：https://www.terminal-industries.com
- **類別**：工業物流自動化（Awwwards Site of the Month 2025-10）
- **入選原因**：工業自動化業務語境 + 有實證的「section 骨架刻意變化」證據。
- **Design DNA**：大字級陳述句主標題 + 漸層縮小的次標題／內文；模組化
  section 但骨架彼此不同（hero 陳述句 → logo 跑馬燈 → 三欄價值卡 →
  互動式 ROI 計算機 → 分頁籤式平台展示 → FAQ 手風琴）；紀實攝影（實際
  gate/yard/dock 場景）混合介面截圖風格圖像；客戶 logo 灰階去彩處理；
  互動元素（計算機、分頁籤）服務於功能性狀態切換，非裝飾性動效。
- **狀態**：Keep（本輪 Primary 候選之一）

#### 3. Vention
- **URL**：https://vention.com
- **類別**：自動化平台／機器人整合軟硬體
- **入選原因**：業務語境與鋒岳高度重疊（模組化自動化硬體＋軟體平台）。
- **Design DNA**：大字級口語化標題（"The Floor Runs on Us"）+ 極簡內文；
  模組化卡片 section（Design／Program／Deploy／Operate 重複「on Us」句型）；
  圖像混合 3D 產品渲染圖（controller、extrusion、conveyor）與寫實產線
  攝影；客戶 logo 灰階；技術規格以量化條列呈現（"Up to 20 daisy-chain
  motors"）。品牌調性偏「親和降低門檻」而非「精密工程權威感」。
- **狀態**：Maybe（業務對應度高，但調性偏平易近人的 SaaS 化，與鋒岳
  「精密工程」定位有落差，可作反例參考）

#### 4. Universal Robots
- **URL**：https://www.universal-robots.com
- **類別**：協作型機器人製造商
- **入選原因**：機器人／自動化產業代表性品牌，業務與 FLEXCELL-M 相關。
- **Design DNA**：客戶證言式 hero 標題（"It paid itself back within three
  months"）；三欄價值主張（Productivity／Flexibility／Quality）；產品卡
  混合寫實攝影與 3D 渲染圖；規格條列精簡（payload/reach/footprint/weight）；
  白底克制配色，客戶 logo 灰階。
- **狀態**：Maybe（規格條列呈現方式可參考，但整體版面偏保守 B2B 模板，
  三欄卡片重複度高，non-transferable 之處與 baseline 診斷風險相同）

#### 5. Moog Inc.
- **URL**：https://www.moog.com
- **類別**：航太／精密運動控制系統製造商（75 年歷史老牌）
- **入選原因**：老牌工業集團官網作為「過度保守」的對照組。
- **Design DNA**：企業標語式主標題（"Shaping the way our world moves™"）；
  模組化卡片＋多層導覽選單；圖像偏 icon 化而非攝影主導；白／深藏青／黑
  配色；資訊density中等但視覺呈現明顯老派（新聞輪播、分頁式列表）。
- **狀態**：Reject（作為「不要長成這樣」的對照組保留於本文件，但不進入
  finalist shortlist——過於陳舊的企業官網範式，對鋒岳的「頁構所作品集」
  目標無正面參考價值）

#### 6. Trimble
- **URL**：https://www.trimble.com
- **類別**：地理空間／建築科技／精密定位技術
- **入選原因**：精密定位技術業務語境接近，且有明確品牌橘色系統可參考。
- **Design DNA**：大字級標語主標題（"Confidence at every turn™"）+ 全大寫
  section 標頭（"BUILDING THE WORLD"）；全寬空拍/高視角紀實攝影（工地、
  公路、城市），風格偏紀錄片而非商業擺拍；品牌橘/金色（推論值，非色票
  驗證）作為強調色，其餘維持白／炭灰；產品依應用領域分類（3D Modeling
  & BIM／Field Systems 等），每類 8-12 個子產品附簡短說明。
- **狀態**：Keep（Secondary 候選——強調色使用方式、規模感攝影參考）

#### 7. KUKA
- **URL**：https://www.kuka.com/en-us
- **類別**：工業機器人製造商
- **入選原因**：機器人產業指標品牌，FLEXCELL-M 直接對標對象。
- **Design DNA**：Section 標頭清楚分層（Robot Systems／Production
  Machines／Production Systems）；模組化 grid，全寬 hero + 多欄產品卡 +
  新聞 grid；產品攝影強調「機器人於實際產線運作中」的應用情境而非棚拍
  抽象美學；白／灰／黑克制配色；技術分類階層清楚（大類目 → 應用場景，
  如焊接、搬運、品質檢測），並提供 Robot Guide 篩選工具輔助決策。
- **狀態**：Keep（Secondary 候選——技術分類資訊架構參考）

#### 8. Mazak（Yamazaki Mazak）
- **URL**：https://www.mazak.com
- **類別**：CNC 工具機製造商（日系，官網含日文版本）
- **入選原因**：日系精密機械品牌，且官網本身即為日文/多語情境下的實際
  案例，對鋒岳的中英雙語需求有直接參考價值。
- **Design DNA**：多層級標題（產品類別如「複合加工機」「5軸加工機」+
  支援性次標題）；模組化卡片 grid，主打產品用橫向 carousel；高品質產品
  攝影，強調機械細節與加工精度感；白／灰／炭灰為主，藍色作為品牌強調色
  （推論值）；技術分類清楚（車床／加工中心／雷射，各自可深入子頁）。
- **狀態**：Maybe（日文情境下的層級處理可參考，但整體視覺仍偏傳統
  B2B 官網範式，未達到「頁構所作品集」等級的精緻感）

### 機器人／機器視覺／新創科技

#### 9. Figure AI
- **URL**：https://www.figure.ai
- **類別**：人形機器人新創
- **入選原因**：新一代機器人科技公司的高階視覺語言代表。
- **Design DNA**：大字級主標題（"The future of home help is here"）+
  漸層縮小次標題；單欄置中版面，各 section 間留白充足；圖像以 CGI
  渲染為主（非寫實攝影），強調未來感產品定位；配色極簡（白底深色文字，
  footer 轉深色背景形成對比）；資訊密度刻意稀疏，短句文案搭配明確 CTA。
- **狀態**：Maybe（CGI 渲染策略對鋒岳有一定啟發性，但「居家科技」調性
  與「工業精密工程」定位有落差，過度稀疏的資訊密度也不符合 B2B
  技術規格需求）

#### 10. KEYENCE
- **URL**：https://www.keyence.com
- **類別**：感測器／機器視覺系統製造商（VISION-X2 直接對標對象）
- **入選原因**：機器視覺產業龍頭，業務對應度最高的候選之一。
- **Design DNA**：多層級 mega-menu 導覽（含二三層子選單）；全寬 hero +
  四欄產品 grid + 三欄新聞/資源區；產品攝影乾淨、棚拍風格，強調工業
  精密感；黑／白／灰克制配色；資訊密度高但透過 mega-menu 分層有效
  控制認知負擔；技術分類階層清楚（Sensors／Vision Systems／Controls
  → 產業別應用）。
- **狀態**：Keep（Secondary 候選——VISION-X2 產品頁的資訊架構直接參考
  對象，機器視覺業務語境完全對應）

#### 11. ZEISS Microscopy
- **URL**：https://www.zeiss.com/microscopy/en/home.html
- **類別**：精密光學／顯微鏡儀器製造商
- **入選原因**：百年精密儀器品牌，「科學權威感」與「精密工程」調性參考。
- **Design DNA**：情感式主標題（"From curiosity to lasting impact"）+
  多欄卡片（依應用領域分類，如 Life Sciences／BioPharma）；資訊密度高，
  新聞與活動列表豐富；配色克制，無強烈品牌色彩痕跡（推論為白底為主）；
  雙軌分類系統（依應用領域 + 依內容類型），兼顧專業使用者與一般探索者。
- **狀態**：Keep（Secondary 候選——「百年權威感 + 現代編輯式呈現」的
  語氣參考，適合鋒岳品牌信任感建立）

#### 12. Path Robotics
- **URL**：https://www.awwwards.com/sites/path-robotics（原站已缺乏可
  直接 WebFetch 的完整內容，本筆資料以 Awwwards 頁面資訊與多筆獨立
  WebSearch 交叉印證取得，非直接 WebFetch 官網首頁）
- **類別**：焊接機器人新創（Awwwards Site of the Day，Studio Freight
  操刀）
- **入選原因**：純黑白配色 + 精緻 scroll 動效的機器人品牌代表案例，
  與鋒岳現有零依賴技術棧形成明確對照。
- **Design DNA**：技術棧含 GSAP + Locomotive Scroll，暗示 scroll-triggered
  精緻轉場；配色策略極端克制（純黑 #000 + 白），依賴字重與留白建立層級，
  不靠色彩豐富度；Awwwards 評分細項顯示 Design 40%／Usability 30%／
  Creativity 20%／Content 10% 的加權，本站在 Design 與 Creativity
  項目評價突出。
- **狀態**：Maybe（僅作為「排版層級可脫離色彩單獨成立」的抽象思路
  參考；純黑白配色與 GSAP 動效依賴，均與鋒岳品牌識別與零依賴技術棧
  現況不相容，不適合作為視覺依據）

### 建築事務所／設計工作室（editorial 美學參考）

#### 13. Snøhetta
- **URL**：https://snohetta.com
- **類別**：建築事務所
- **入選原因**：editorial 攝影哲學與統一比例作品卡片的代表案例。
- **Design DNA**：作品/新聞卡片採統一長寬比（約 3:2，頁面結構顯示
  500×333px 佔位比例）；全出血無外框圖片呈現；主標題粗體混合大小寫
  （非全大寫），全大寫僅保留給少數 section 標頭（如 "Disciplines"）；
  大量垂直留白分隔 Latest News／Upcoming Events／Highlighted Projects
  各自獨立區塊；支援 Dark mode 切換。
- **狀態**：Keep（本輪 Secondary 候選——圖片統一比例、無框呈現原則）

#### 14. BIG（Bjarke Ingels Group）
- **URL**：https://big.dk
- **類別**：建築事務所
- **入選原因**：大型建築事務所的作品集資訊架構，測試「數百件作品如何
  保持可瀏覽性」的解法。
- **Design DNA**：作品採統一卡片容器呈現，圖片＋icon 疊加的視覺處理；
  導覽依類型分類（Architecture／Interiors／Landscape／Planning／
  Products），可展開次分類；大量留白分隔卡片，維持視覺呼吸感；配色
  中性，讓每個專案的攝影本身主導色彩。
- **狀態**：Maybe（分類導覽的規模化解法可參考，但整體視覺與鋒岳所需
  的「技術規格 + CTA」商業轉換強度不同調）

#### 15. Pentagram
- **URL**：https://www.pentagram.com
- **類別**:品牌設計工作室（全球最大獨立設計顧問公司之一）
- **入選原因**：「設計工作室如何呈現自身專業高度」的直接參考——與
  頁構所作品集定位有相似之處。
- **Design DNA**：大字級主標題（"We design everything for everyone"）
  搭配合夥人語錄以斜體大字呈現，強調思想領導地位；彈性多欄 grid，
  作品採 responsive 圖片尺寸（如 imgix 參數顯示 1500×2250）；retrospective
  區塊以年份輪播呈現長期客戶關係（如與 SNL、倫敦設計節的多年合作）；
  雙軌導覽（主導覽 + 依產業/類型篩選的進階選單）；配色推論為中性
  黑白灰，讓作品攝影主導視覺。
- **狀態**：Keep（Secondary 候選——「用語錄/思想領導建立專業高度」
  以及作品呈現的彈性 grid 系統，適合頁構所自身定位思考，但需注意
  Pentagram 本質是純作品集不含 B2B 轉換路徑，需謹慎轉譯）

### 高階產品品牌／消費精密工程

#### 16. Teenage Engineering
- **URL**：https://www.teenage.engineering
- **類別**：音樂/電子產品設計品牌（工程美學代表品牌）
- **入選原因**：「工程感 + 極簡消費品牌」的成功案例，常被引用為
  precision engineering aesthetic 的消費品牌典範。
- **Design DNA**：產品名稱作為主要錨點（非情感式標語），克制字級層級；
  模組化卡片 grid，重複的「圖 + 產品名 + buy now」節奏；產品攝影乾淨
  置中構圖，去脈絡化（無情境攝影），強調產品本身工業設計；配色近乎
  純黑白灰，彩色變體（如紅色）僅作為點綴而非主導；整體語彙偏「工程師
  導向」而非「消費玩樂導向」。
- **狀態**：Keep（Secondary 候選——「去脈絡化棚拍 + 工程感文案語氣」
  對鋒岳的產品攝影方向有直接啟發，證明「工程感」與「高階質感」
  可以並存不衝突）

#### 17. Leica Camera
- **URL**：https://www.leica-camera.com（實際抓取為日本站）
- **類別**：精密光學儀器／相機製造商
- **入選原因**：「精密工程 + 職人工藝」品牌敘事的百年品牌代表。
- **Design DNA**：多層 mega-menu 導覽（Products／Experience Leica／
  Company／Service）；產品縮圖統一尺寸比例（頁面結構顯示 548×438）；
  攝影風格兼具「棚拍產品照的清晰感」與「真實使用情境的敘事感」
  （如攝影師實際使用產品的照片）；配色推論為克制中性，搭配專業攝影
  的暖色調打光；語言強調專業權威（"Leica Akademie"、"Speak to an
  Expert"）而非大眾親和。
- **狀態**：Keep（Secondary 候選——「精密工藝 + 職人敘事」的品牌語氣，
  適合鋒岳強調製造精度與工程可信度的敘事需求）

#### 18. Herman Miller
- **URL**：https://www.hermanmiller.com（實際抓取為日本站）
- **類別**：高階辦公家具／工業設計品牌
- **入選原因**：百年工業設計品牌如何處理「產品情境攝影 + 品牌敘事」
  的參考案例。
- **Design DNA**：大字級情感標語主標題（"Aeron never stops supporting
  you"）；模組化四欄產品分類 grid；產品攝影偏「情境式」（家具置於真實
  辦公環境）而非純棚拍去脈絡化，與 Teenage Engineering 形成對照；
  配色中性（黑白灰為結構色），編輯內容區塊（如設計師訪談）引入更飽和
  色彩形成對比；資訊密度控制得宜，避免視覺壅塞。
- **狀態**：Maybe（情境攝影策略可參考，但與 Teenage Engineering 的
  去脈絡化棚拍策略路線相反，兩者不宜同時作為 Primary 依據，需要
  取捨——本文件傾向鋒岳更適合去脈絡化棚拍以強調工程精度）

#### 19. Mujjo
- **URL**：https://www.mujjo.com
- **類別**：皮革科技配件品牌（精品材質敘事）
- **入選原因**：「材質敘事 + 職人工藝語氣」的中小型高階品牌案例，
  規模與鋒岳網站專案更接近（非跨國巨頭級別的官網規模）。
- **Design DNA**：創辦人語錄以斜體強調工藝細節重視；統一縮圖卡片
  grid，依裝置類型與產品類型雙軌分類；產品攝影強調皮革材質紋理與
  色彩變化（專業棚拍）；配色沉穩中性（黑／棕褐／深藍），季節性系列
  引入低飽和度大地色與墨綠；語氣強調工藝與永續意識而非浮誇行銷。
- **狀態**：Maybe（材質敘事語氣可參考，但皮革配件品牌的「柔軟精品感」
  與鋒岳「工業硬派精密感」調性有本質差異，需謹慎篩選可轉譯元素）

---

## 未通過驗證、不列入候選的站點

以下站點在 `WebSearch` 階段看似高度相關，但 `WebFetch` 失敗或內容過薄，
依方法論紅線予以排除，不納入候選清單或評分：

- **Anduril**（`anduril.com`）：多次 `WebFetch` 僅取得頁面標題，無法取得
  實際頁面結構。外部報導（Awwwards Honorable Mention、head of design
  Jen Bucci 主導的黑白極簡美學）具參考價值，但因無法直接驗證頁面內容，
  不列入候選——這與 `01-reference-lock.md` 排除 Anduril 的紅線判斷一致。
- **Cognex**（機器視覺產業龍頭，`cognex.com`）：403 Forbidden，無法驗證。
- **OMA**（`oma.eu`／`oma.com`）：僅取得導覽列文字，無足夠內容評估視覺
  設計，予以排除。
- **Foster + Partners**（`fosterandpartners.com`）：回傳 404 頁面而非
  首頁內容，無法評估。
- **Zaha Hadid Architects / Herzog & de Meuron**：`WebSearch` 未能取得
  其官網設計相關的具體資訊（搜尋結果集中在建築專案報導），未進行
  `WebFetch` 驗證，不列入候選。
- **Polestar、Epson**：`WebFetch` 僅取得地區選擇頁（gateway page），
  非實際首頁設計內容，予以排除。
- **PI (Physik Instrumente)**、**Basler**（機器視覺正確網域未能定位）、
  **Stäubli**、**B&W**、**Cosentino**、**Reliable Robotics**、
  **Kilogram Studio**：技術性錯誤（403／逾時／證書不符／網域已轉售／
  內容截斷）導致無法取得可用內容，予以排除。

---

## Shortlist：8-12 個 Finalist

依「與鋒岳業務對應度」「視覺語言可轉譯性」「非重複視覺策略」三個條件，
從 19 筆候選中篩選出 **10 個 finalist** 進入評分矩陣：

1. Terminal Industries
2. ALIO Industries
3. Snøhetta
4. KUKA
5. KEYENCE
6. Trimble
7. Teenage Engineering
8. Leica Camera
9. Pentagram
10. ZEISS Microscopy

**未進入 finalist 但保留為背景參考的候選**：Vention、Universal Robots、
Moog（反例）、Mazak、Figure AI、Path Robotics、BIG、Herman Miller、
Mujjo——原因已在各自條目的「狀態」欄位說明，主要是調性落差（過度平易
近人的 SaaS 化、情境攝影路線相反、純黑白配色與現有品牌不相容、
或作品集導向過強缺乏 B2B 轉換路徑）。

---

## Finalist 評分矩陣

評分為 1-10 分，依下列權重計算加權總分。**此分數為決策輔助工具，
不是自動選擇的依據**——第二份文件（Art Direction 分群）與第三份文件
（最終推薦）會納入分數之外的質化判斷，包括業務語境貼合度、中文
排版相容性、與鋒岳品牌現況的銜接成本等分數矩陣無法完整捕捉的因素。

| 面向 | 權重 |
|---|---|
| Premium／質感 | 20% |
| Precision Industrial Engineering 契合度 | 20% |
| Typography 品質 | 10% |
| Grid／構圖 | 10% |
| 圖像藝術指導 | 10% |
| 資訊層級 | 10% |
| 品牌獨特性 | 10% |
| 動效品質 | 5% |
| 對鋒岳可轉譯性 | 5% |

| Finalist | Premium 20% | 工業精密契合 20% | Typo 10% | Grid 10% | 圖像 10% | 資訊層級 10% | 品牌獨特性 10% | 動效 5% | 可轉譯性 5% | **加權總分** |
|---|---|---|---|---|---|---|---|---|---|---|
| Terminal Industries | 8 | 9 | 8 | 9 | 8 | 8 | 7 | 7 | 9 | **8.15** |
| ALIO Industries | 6 | 9 | 6 | 6 | 6 | 7 | 5 | 4 | 8 | **6.65** |
| Snøhetta | 8 | 5 | 9 | 8 | 9 | 7 | 8 | 5 | 6 | **7.35** |
| KUKA | 6 | 8 | 6 | 6 | 6 | 7 | 5 | 4 | 8 | **6.60** |
| KEYENCE | 6 | 9 | 6 | 7 | 6 | 8 | 5 | 4 | 8 | **6.85** |
| Trimble | 7 | 7 | 7 | 7 | 8 | 7 | 6 | 5 | 7 | **7.05** |
| Teenage Engineering | 9 | 6 | 8 | 8 | 9 | 7 | 9 | 6 | 6 | **7.85** |
| Leica Camera | 9 | 6 | 8 | 7 | 9 | 7 | 9 | 5 | 6 | **7.70** |
| Pentagram | 9 | 4 | 9 | 8 | 9 | 7 | 9 | 6 | 5 | **7.55** |
| ZEISS Microscopy | 7 | 7 | 6 | 6 | 6 | 7 | 6 | 4 | 7 | **6.50** |

**評分解讀重點**：
- Terminal Industries 分數最高，主因是在「工業精密契合」「Grid／構圖」
  「可轉譯性」三項同時取得高分，是唯一一個同時具備工業自動化業務語境
  與明確反樣板 section 節奏證據的候選。
- Teenage Engineering、Leica Camera、Pentagram 的 Premium 與品牌獨特性
  分數最高，但工業精密契合度中等——它們的價值在於「精緻感的做法」，
  而非「工業自動化業務語境的直接對應」。
- ALIO Industries、KUKA、KEYENCE 業務語境對應度最高（9 分），但視覺
  執行本身偏保守 B2B 官網範式，Premium 與品牌獨特性分數受限。
- **分數不代表自動選擇 Terminal Industries 為 Primary**——第三份文件
  會納入「單一參考主導 + 少量次要參考補強」的質化判斷邏輯，分數僅是
  決策輸入之一。
