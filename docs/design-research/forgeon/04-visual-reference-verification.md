# 04 · Visual Reference Verification

記錄日期：2026-08-24
研究方式：`@playwright/test`（Chromium headless，真實截圖）+ 人工圖片檢視（`Read` 工具
逐張開圖比對），非文字摘要、非推測。本文件是 `01-reference-pool.md` /
`02-art-direction-comparison.md` / `03-primary-reference-recommendation.md` 三份
文字研究的視覺驗證延伸——目的是用真實截圖檢驗前三份文件基於 `WebFetch` 文字
摘要所做的判斷是否成立，而非重新做一次方向選擇。

---

## 1. Methodology

- 工具：`@playwright/test` 1.62.1（已安裝於本專案 `node_modules`），Chromium
  headless，桌面視窗 1440×900，行動裝置視窗 390×844。
- 流程：對每個網站先以 `WebSearch`／已知網址嘗試載入首頁 → 處理 cookie/地區
  彈窗 → 依任務書要求捲動或點擊導覽至指定頁面類型 → 截圖存檔 → 用 `Read`
  工具實際開圖檢視（非僅信任截圖腳本回報成功）→ 依「實際觀察到的構圖／
  字級／留白／圖像／元件」寫分析，不臆測色票 hex 值或精確 px 字級。
- 導覽方式：多數頁面直接用 `page.goto()` 網址；當直接猜測網址得到 404 或
  被重新導向回首頁時，改用「先進入首頁→ hover/click 導覽選單→ 蒐集真實
  `href` 清單 → 再導向」的方式取得可驗證的真實網址，過程與失敗記錄見
  第 2 節。
- 所有截圖存放於 `docs/design-research/forgeon/evidence/{leica,zeiss,
  teenage-engineering,terminal-industries}/`，檔名具描述性。

---

## 2. Tool / Evidence Status

### 總覽

| 站點 | 截圖數量（桌面＋行動） | 狀態 |
|---|---|---|
| Leica Camera | 14 | 完整，含桌面 10+、行動 4 |
| ZEISS Microscopy | 14 | 完整，含桌面 10+、行動 4 |
| Teenage Engineering | 12 | 完整（僅限圖像面向），超過原訂 6 張目標 |
| Terminal Industries | 12 | 完整，超過原訂 8 張目標 |
| **合計** | **52 張真實截圖** | — |

### 已知限制與具體 gap（誠實揭露）

1. **Leica 地區判定**：多次嘗試 `leica-camera.com/en-int/` 皆被伺服器判定
   來源地區為 Japan，頁面頂端持續顯示「We noticed you're visiting from
   Japan」提示列（見 `leica-home-desktop-hero.png` 等多張截圖）。內容
   本身為英文國際版（en-int path），非日文版，但地區偵測提示列本身
   無法透過程式化方式關閉（嘗試點擊 X 圖示失敗，DOM 顯示該按鈕
   `hidden` 屬性）。**判定：內容驗證有效，但截圖中會持續看到此提示列，
   已在分析中排除此提示列本身作為 Leica 設計語言的判斷依據**。
2. **Leica 產品頁網址不可直接猜測**：`leica-camera.com/en-int/cameras/
   leica-sl3-p` 等猜測網址回傳 404。改用「首頁 hover Products 選單 →
   蒐集真實 `href`」方式取得 `photography/cameras/sl/sl3-p-black` 等
   可用網址，過程記錄於 scratch log，非猜測性外推。
3. **ZEISS `/microscopy/en/products.html` 重新導向回首頁**：此為該站
   真實行為（非本次工具失敗）——`Products` 導覽項本身在部分互動路徑下
   不指向獨立列表頁，而是純 mega-menu 觸發點。改用 mega-menu 內
   `light-microscopes.html` 等子分類真實連結取得可驗證的 Products
   Taxonomy 證據。
4. **ZEISS 部分產品頁圖片區塊未渲染**：`zeiss-product-desktop-detail.png`
   （ZEISS Blockwise 軟體頁）左側主圖區塊為空白灰底方塊，非截圖失敗，
   而是該頁圖片資源本身在截圖當下未完成載入（`domcontentloaded` 等級
   等待，未等待所有圖片完成 lazy-load）。**已明確標註此為圖片載入 gap，
   不影響本頁作為「Technical IA 結構」證據的有效性**（麵包屑、
   Highlights/Downloads/Related products 分頁、勾選圖示條列清單均正常
   渲染）。
5. **Teenage Engineering `/products/op-1-field` 猜測網址不存在**：回傳
   404（`sorry, we can't find the page you are looking for`），已改用
   mega-menu 內真實連結（`/products/op-xy`）取得等效的「isolated hero
   shot」證據，未影響最終交付的圖像面向分析完整性。
6. **Teenage Engineering 產品頁內嵌影片播放失敗**：`te-product-desktop-
   detail-crop.png` 下半部顯示「No compatible source was found for this
   media」——這是該頁一個影片元件在 headless Chromium 環境下的已知
   限制（缺少對應 codec），非截圖工具錯誤。已在分析中排除此區塊，
   改用同頁其他成功渲染的靜態圖像區塊作為證據。
7. **Terminal Industries 首次首頁截圖為動畫過渡中間幀**：第一次截圖
   （使用 `domcontentloaded` + 固定等待時間）捕捉到 hero 區塊一個裁切
   異常的中間動畫幀（截圖顯示一條扭曲的黑色色塊，非正常畫面）。
   **已重新截圖修正**：改用 `waitUntil: 'networkidle'` + 3 秒額外等待，
   成功取得穩定的最終渲染畫面（`terminal-home-desktop-hero.png`，
   實際顯示的是低角度逆光卡車剪影 + 暖橘色天空）。此為 gap 修正記錄，
   非未解決的缺口。

**結論：無阻斷性視覺證據缺口（no blocking visual evidence gaps）**——上述
7 點均為已排查、已在分析中適當處理或已修正的技術性細節，四個站點的
核心視覺語言（構圖、字級層級、留白、圖像策略、元件行為、行動裝置轉換）
均取得充分且可驗證的截圖證據。

---

## 3. Leica Camera 視覺驗證

**實際載入版本**：`leica-camera.com/en-int/`（國際英文版，內容為英文，
僅地區偵測提示列顯示「visiting from Japan」）。

### 3.1 首頁 Hero（`leica-home-desktop-hero.png`）

- **Composition**：全螢幕滿版攝影照片佔據約 90% 視窗高度，文字錨定於
  左下角約螢幕高度 75-85% 處，形成「大圖為主、文字為輔」的絕對圖像
  優先結構。導覽列（Products／Experience Leica／Company／Service）
  以極簡文字連結形式疊加於圖片頂部，無背景色塊分隔，靠圖片本身的
  深色調提供文字對比。
- **Typography**：主標題「Leica SL3-P」使用大字級、細字重無襯線字體，
  混合大小寫（非全大寫）；副標題「All That Matters」字級明顯縮小
  （約主標題的 35-40%），呈現清楚的兩層級落差。CTA 按鈕「Discover the
  SL3-P」為藥丸形狀，白底黑字，右側點綴一個紅色圓點（呼應品牌識別
  但克制使用，非大面積用色）。
- **Whitespace**：頁面本身留白極少（圖片佔滿），但文字區塊與圖片邊緣
  保持穩定的內縮邊界（約 90px 左邊界），未貼齊視窗邊緣。
- **Imagery**：敘事型攝影（攝影師在戶外雨衣情境中操作相機），非去
  脈絡化棚拍——這與 `03-primary-reference-recommendation.md` 描述的
  「70-80% 棚拍 + 20-30% 敘事型照片」比例分配在首頁 Hero 呈現的是
  敘事型照片，暖色調自然光打光。
- **Component behavior**：導覽列無邊框無底色，純文字疊加於圖片上。

### 3.2 首頁編輯式段落（`leica-home-desktop-editorial-section.png`）

- **Composition**：左右對半分割的兩張全出血圖片（各佔視窗寬度 50%），
  左圖為深色調品牌歷史插畫（1914—2025 時間軸），右圖為敘事型人像
  攝影，兩者以純白窄縫分隔，無外框裝飾。
- **Typography**：左圖內超大數字「1914」「2025」（字級遠超一般標題，
  近乎視覺圖形化處理），中間以短橫線連接；下方小標題「Century Time
  Travel」與副標題「Become a Witness to a Century」字級對比明顯。
- **Whitespace**：兩張圖片緊鄰導覽列下方，無額外留白緩衝，形成
  「圖片即內容」的編輯雜誌感。
- **Imagery**：這是唯一一個非產品攝影、而是「品牌歷史敘事」的圖像
  區塊，證實 Leica 首頁確實混合「產品／歷史敘事／人物」三種圖像
  類型，而非純粹型錄式產品陳列。

### 3.3 首頁產品輪播（`leica-home-desktop-product-section.png`）

- **Composition**：三欄等寬產品卡片，每欄佔視窗寬度約 33%，卡片內
  產品去背置中、灰階背景（非純白，帶淺灰漸層），下方僅有「Discover」
  文字連結（無按鈕外框），搭配輪播圓點指示器。
- **Imagery**：這是本次截圖中最典型的「去脈絡化棚拍」證據——相機
  機身/鏡頭置中、無情境干擾、乾淨灰底、精準工作室打光可見鏡頭
  金屬反光細節。
- **Component behavior**：卡片本身無邊框無陰影，僅靠背景色微差
  （灰 vs 白）與窄縫分隔區分卡片邊界，符合 Direction B 描述的
  「無多餘裝飾」原則。

### 3.4 導覽 Mega-menu（`leica-home-desktop-nav-megamenu.png`）

- **Composition**：Mega-menu 展開後佔據視窗下方約 75% 高度，左側為
  兩層式文字導覽清單（Cameras／Sport Optics／Home Cinema／Watches／
  Mobile／Eyecare／Brand Collection 一級 tab，Explore Cameras／Camera
  Portfolio／Camera Types／Photographic Styles／Lenses／Accessories／
  Pre-Owned／Apps 二級清單），右側為 4 個等比例縮圖卡片（含 1 個
  「Explore Cameras」情境照 + 1 個「METAL GRAY FINISH」產品陳列照 +
  2 個具體型號卡片）。
- **技術分類階層**：一級 tab（產品線）→ 二級清單（用途/類型）→
  右側精選卡片，三層資訊在同一畫面內可見，證實 `03-primary-reference-
  recommendation.md` 所述「mega-menu 承載龐大技術目錄」屬實。

### 3.5 產品分類列表頁（`leica-category-desktop-listing.png` /
`leica-category-desktop-grid.png`）

- **Composition**：頁面標題「Products」以極大字級（估計視窗寬度
  15-20%）左對齊呈現，正下方緊接一張全寬情境攝影（相機置於玻璃展示
  台，深色背景漸層打光），無分類篩選器或排序控制項可見於首屏。
- 捲動後出現「Camera」分類標頭，下方為三欄不等寬圖片（一張器材俯拍
  棚拍照、兩張使用者實拍情境照），這確認 Leica 分類頁並非純粹的
  「產品網格」，而是混合情境敘事與產品陳列的編輯式呈現。

### 3.6 產品詳情頁（`leica-product-desktop-hero.png` 起連續 4 張）

這是本次驗證中對 FORGEON／VISION-X2 最關鍵的證據組。

- **Hero（`leica-product-desktop-hero.png`）**：近乎滿版特寫——鏡頭
  轉環與操作者手指的巨觀特寫，畫面切去大半機身，僅露出「LEICA」
  字樣與部分螢幕。這是「精度細節特寫」的直接證據：構圖刻意不完整
  呈現產品全貌，用局部放大建立「這是精密儀器」的第一印象。頁面
  次導覽（Discover／Technical Specification／Downloads）以純文字
  tab 呈現於頂部，無背景色塊。
- **中段（`leica-product-desktop-midsection.png`）**：畫面轉為純白
  背景，產品完整輪廓置中呈現（相機+鏡頭側面 45 度角），上方搭配一段
  斜體引言式文字（"...one thing matters above all else: trust. In your
  camera, and in yourself..."）——這正是 `02-art-direction-comparison.md`
  描述的「職人敘事段落」的實際呈現形式：非規格條列，而是第一人稱
  設計哲學短文。
- **材質特寫（`leica-product-desktop-material-crop.png`）**：轉為
  情境影片截圖（賽車運動場景，非產品本身），下方標題「The Leica
  SL3-P – Developed Precisely for This Purpose」+ 內文段落。**這裡
  出現一個與預期不同的觀察**：並非單純的產品材質特寫，而是「用戶
  拍攝出的內容範例」，用照片成果本身佐證相機性能——這是一個 Leica
  特有的敘事手法（相機品牌可以展示「拍出來的照片」，但 VISION-X2
  作為視覺辨識模組沒有對應的「使用者創作內容」可展示，此手法
  **不可直接移植**，需在 KEEP 清單中註明此限制。
- **規格區（`leica-product-desktop-specs-section.png`）**：深藍色
  背景區塊，產品名稱「SL3-P」以極大字級（近乎全螢幕高度的 60-70%）
  半透明疊加於背景紋理上，中央疊加白色標語「All That Matters」。
  這是全頁面中唯一大面積使用飽和背景色（深藍）的區塊，其餘皆為
  白／灰／黑中性色。

### 3.7 行動裝置轉換（`leica-home-mobile-hero.png` /
`leica-home-mobile-product-section.png` / `leica-product-mobile-hero.png`
/ `leica-product-mobile-detail.png`）

- **Hero 轉換**：桌面版導覽列橫向展開四個一級項目，行動版收合為
  「☰ Menu」漢堡選單圖示，品牌 logo 置中；地區提示列從桌面版單行
  橫幅變為三行堆疊（因文字換行）。圖片裁切從「橫幅全景」改為「直幅
  人像式裁切」，主體（手持相機的手部特寫）保持置中但可見範圍縮小，
  裁切邏輯是「保留核心主體、犧牲環境脈絡」而非簡單縮放。
- **產品頁轉換**：桌面版三欄式次導覽 tab（Discover／Technical
  Specification／Downloads）在行動版收合為單一「Discover ⌄」下拉
  選單，這是桌面到行動的關鍵資訊架構簡化模式——**橫向並列的分頁籤
  在窄螢幕上優先收合為下拉選單，而非改為可橫向滑動的 tab 列**。
- **圖片輪播轉換**：桌面版「三欄等寬產品卡」在行動版變為「單一大圖
  + 底部縮圖橫向捲動列」（`leica-product-mobile-hero.png` 底部可見
  4 個小縮圖），這證實桌面的多欄網格在行動裝置上收斂為「主圖+縮圖
  導覽」模式，而非簡單地將三欄堆疊為三列（後者會造成過長的單頁
  捲動負擔）。

---

## 4. ZEISS Microscopy 視覺驗證

### 4.1 首頁（`zeiss-home-desktop-hero.png` / `-mid.png` / `-lower.png`）

- **Composition**：Hero 為滿版人像攝影（實驗室情境，女性研究員
  近距離特寫），畫面右下角有一個白色圓形「暫停」按鈕圖示，證實
  此為自動播放的影片/動態背景（Leica 與 Terminal 的 hero 未見此
  暫停控制項，這是 ZEISS 特有的元件）。畫面左下角有一個小標籤
  「AI generated」——**這是一個重要的誠實揭露**：ZEISS 官網的
  Hero 影像本身標註為 AI 生成，而非真實攝影棚拍或紀實照片。
- **Typography**：導覽列包含 6 個一級項目（Applications／Products／
  Customer Stories／Service & Support／About us，其中兩個帶下拉
  箭頭），比 Leica 的 4 項與 Teenage Engineering 的 3 項都多，
  視覺上導覽列本身即傳達「資訊量更大」的第一印象。
- **中段（`zeiss-home-desktop-mid.png`）**：「Explore your field」
  五欄等寬卡片（Life Sciences／Biotech-Pharma／Semiconductor and
  Electronics／Materials Research／Natural...），每張卡片為方形
  顯微影像縮圖（非產品照，而是「顯微鏡下的實際影像成果」），
  這與 Leica 用「相機拍出的照片」佐證性能是同一種手法邏輯，但
  ZEISS 用此手法組織「依應用領域分類」的首頁一級入口，而非產品
  展示——這正是 `03-primary-reference-recommendation.md` 描述的
  「依應用場景分類」在首頁的具體實作。
- **下段（`zeiss-home-desktop-lower.png`）**：「Discover the latest」
  新聞區塊，三個篩選標籤（Press releases／Customer stories／Product
  launches）+ 不等大的新聞卡片網格（一張大圖 + 一張中圖 + 多張小圖
  混排），實際證實 `01-reference-pool.md` 所述「新聞與活動列表豐富」
  的資訊密度描述成立。

### 4.2 Applications Hub（`zeiss-applications-desktop-taxonomy.png` /
`-filter.png`）

- **Composition**：頁首為「Applications Hub / Find the Solution for
  Your Application」大標題，搭配三條條列式提問句（"Are you addressing
  a specific application?" / "Are you working with a special sample?"
  / 說明文字）——這是雙軌分類系統在視覺上的直接呈現：用問句引導
  訪客判斷自己屬於哪一種分類軸線。
- **篩選頁（`-filter.png`）**：左側為 6 個可展開篩選面板（Application
  ／Technology／Sample／Place of work／Product／Software），右側
  顯示「We found 136 articles」+ 六欄卡片網格結果。**這是本次驗證中
  資訊密度最高的單一畫面**——6 個獨立篩選維度同時存在，證實
  `03-primary-reference-recommendation.md` 對 ZEISS「不應被引入的
  高資訊密度」警告是基於真實截圖成立的判斷，非文字推測。

### 4.3 Products Taxonomy（`zeiss-products-desktop-taxonomy.png` /
`-listing.png`）

- **關鍵發現**：直接訪問 `/products.html` 會重新導向回首頁，真正的
  Products Taxonomy 進入點是透過導覽 mega-menu 觸發、指向
  `products/light-microscopes.html` 等子分類頁。此頁 Hero 為「Light
  Microscopes / For Scientific Research and Routine」+ 全寬人物操作
  顯微鏡的紀實攝影（非棚拍去背產品照）。
- **列表區（`-listing.png`）**：三欄產品線卡片（Widefield/Stereo and
  Zoom/Digital Microscopes 等），每張卡片圖片為**實際產品置於棚拍
  背景中的完整設備照**（顯微鏡機身+螢幕+鍵盤完整陳列），這與 Leica
  的「去背精簡陳列」形成鮮明對比——ZEISS 的產品攝影保留完整工作站
  情境（顯示器、控制面板、電腦），暗示「這是一整套工作系統」而非
  單一去脈絡化物件。

### 4.4 技術產品詳情頁（`zeiss-product-desktop-detail.png` /
`-specs.png`，及更完整的 `Confocal Microscopes` 分類頁）

- **麵包屑導覽**：Home › Products › Light Microscopes › Confocal
  Microscopes，三層麵包屑清楚可見且可點擊回溯，這是四個站點中唯一
  完整呈現三層麵包屑的站點（Leica 為兩層，Teenage Engineering 無
  麵包屑）。
- **平台選擇 tab**：「Choose your platform / LSM for life sciences /
  LSM for materials」——依應用領域再次分流，證實雙軌分類系統延伸到
  產品詳情頁層級，不僅止於首頁。
- **規格呈現元件（`-specs.png`）**：Highlights／Downloads／Related
  products 三分頁，Highlights 內容以「勾選圖示 + 粗體小標題 + 說明
  文字」三段式重複呈現（AI-powered feature detection at scale／
  Advanced image analysis and measurement／Python for advanced
  extensions），右上角固定「Get in touch」藍色按鈕（sticky 定位，
  捲動時持續可見）。

### 4.5 行動裝置轉換（`zeiss-home-mobile-hero.png` / `-nav.png` /
`zeiss-product-mobile-hero.png` / `-technical-section.png`）

- **導覽轉換**：桌面版 6 項橫向導覽在行動版收合為漢堡選單展開後的
  「純文字清單」（Applications／Products／Customer Stories／Service
  & Support／About us，帶右側箭頭圖示表示可展開子選單），下方額外
  堆疊 MyZEISS／Contact／Online Shop／Related ZEISS Websites 等
  次要連結——這是四站點中行動導覽層級最深的一個，符合其資訊密度
  在桌面版已經最高的特徵。
- **技術頁轉換**：桌面版「Highlights/Downloads/Related products」
  橫向 tab，在行動版收合為單一「Content ⌄」下拉選單（與 Leica 的
  「Discover ⌄」收合邏輯相同），且畫面右上角新增一個藍色圓形聊天
  按鈕（浮動客服入口），此為桌面版未見的行動裝置專屬元件。
- **平台選擇卡片**：桌面版橫向並列的「Choose your platform」選項，
  行動版改為垂直堆疊的全寬卡片（見 `zeiss-product-mobile-technical-
  section.png` 下方「LSM 910」卡片），確認多欄選擇器在窄螢幕上
  一律轉為垂直堆疊而非保留橫向捲動。

---

## 5. Teenage Engineering 視覺驗證（僅限圖像面向，不分析其 IA/字體/UI）

### 5.1 產品分類頁（`te-products-desktop-category.png`）

- **Composition**：導覽列本身極簡（teenage engineering／products／
  store／latest／finder 五個圖示化項目，每個搭配一個線條 icon），
  下方緊接「EP SERIES / UPDATE」小標籤，再下方是**跨產品裁切拼接
  的全寬圖片**——三台不同型號的取樣機（RIDDIM／K.O. II／未命名深色
  款）以相同視角、相同裁切高度並排，形成「產品家族視覺一致性」的
  直接證據：即使是不同型號、不同配色，取景角度（俯視 45 度）、
  裁切比例、螢幕/按鈕的相對位置在畫面中完全對齊。

### 5.2 圖像家族一致性延伸（`te-products-desktop-category-grid.png`）

- 捲動後可見同樣的「跨產品裁切拼接」手法延續（不同機身顏色的特寫
  局部拼接成一整排），且色彩不刻意統一（米色／灰白／深棕橄欖綠
  並陳），證實 Teenage Engineering 的「一致性」來自**構圖與裁切
  邏輯的統一**，而非透過限制色彩調色盤達成——這與純黑白極簡策略
  的品牌（如 Path Robotics）不同，值得在 KEEP 清單中精確區分。

### 5.3 孤立產品棚拍（`te-product-desktop-isolated-shot.png`，OP-XY）

- **Composition**：純黑背景，產品置於畫面中央偏下，一隻手指從畫面
  頂部伸入畫面即將觸碰產品頂部——這不是完全靜態的「產品平躺棚拍」，
  而是加入了一個動態懸疑感的敘事瞬間（手指懸停未觸碰）。文案「OP XY
  / liebe auf den ersten blick.」（德文：一見鍾情）以極簡置中文字
  呈現於產品上方，字級不大、行距寬鬆。
- **細部特寫（`te-product-desktop-detail-crop2.png`）**：產品完整
  輪廓在純黑背景中呈現，打光為**側光+邊緣輪廓光**（可見機身邊緣
  有明顯的高光描邊，機身正面按鍵區域則相對暗部），營造出接近
  「精品鐘錶攝影」等級的立體感與材質辨識度——按鍵的白色/淺灰漸層
  質感、金屬邊框的反光都清晰可辨。這是四個站點中打光最戲劇化、
  最偏離「均勻白底棚拍」的產品攝影範例。

### 5.4 產品詳情頁的敘事型影像（`te-product-desktop-hero.png`，
K.O. II）

- **重要修正發現**：此頁 Hero 並非去脈絡化棚拍，而是使用了一張
  拳王阿里（Muhammad Ali）的經典授權新聞攝影照片（畫面標註
  "PHOTOS BY NEIL LEIFER © ABG-SI LLC"）作為背景，產品名稱「K.O. II」
  以粗體線框字體大字級疊加其上。**這證實 Teenage Engineering 並非
  100% 去脈絡化棚拍策略**，在特定產品的品牌敘事需要（此處呼應
  "K.O." 拳擊語意雙關）時，會混用高衝擊力的文化/歷史影像。**此手法
  對 FORGEON 完全不適用**——工業自動化品牌不具備借用此類流行文化
  資產的敘事正當性，必須在 REJECT 清單中明確排除。

### 5.5 行動裝置轉換（`te-product-mobile-isolated.png` /
`-scroll.png`）

- **Composition 轉換**：桌面版的「文字疊加大圖」Hero，在行動版
  變為「全螢幕直幅裁切圖片 + 底部橫向跑馬燈文字條」（`ONLY $329
  BUY NOW! EP-133 K.O. II...` 無限捲動文字），這是一個桌面版
  未出現的行動裝置專屬元件（促購跑馬燈）。畫面左上角固定顯示
  購物車圖示與「0」計數，右上角為漢堡選單「⋮」圖示。
- **產品特寫捲動（`-scroll.png`）**：手機版將產品特寫裁切為
  更緊湊的正方形/直幅比例（見 SAMPLE/TIMING 按鍵特寫），字級與
  留白同步縮小，但打光與材質細節的清晰度未打折扣，證實此站的
  「精細棚拍」策略在行動裝置上未被簡化犧牲。

---

## 6. Terminal Industries 視覺驗證（工業現實／結構檢查參照，非視覺 Primary）

### 6.1 首頁 Hero（`terminal-home-desktop-hero.png`，經修正後的穩定幀）

- **Composition**：低角度、逆光剪影構圖——一輛卡車側面剪影佔據畫面
  水平約 75% 寬度，背景為暖橘色漸層天空（近黃昏／黎明色調），畫面
  上方 1/4 疊加半透明白色導覽列（帶輕微毛玻璃模糊效果，可透視
  背後的天空漸層色）。這是四個站點中唯一採用「剪影攝影美學」的
  Hero，色彩飽和度明顯高於 Leica/ZEISS/Teenage Engineering 的
  中性色系。
- **重要修正記錄**：第一次截圖（`domcontentloaded` + 固定等待）捕捉
  到一個扭曲的動畫過渡中間幀（見第 2 節 gap 7），這證實此 Hero
  確實存在進場動畫效果（很可能是卡車剪影淡入或位移動畫），非靜態
  圖片，重新截圖後才取得穩定終態畫面。

### 6.2 工業情境圖像（`terminal-home-desktop-industrial-context.png`）

- **Composition**：夜間貨櫃場空拍視角，實體貨櫃/卡車與**藍色線框
  3D 疊加圖層**（車輛的線框透視模型精確疊合於實體卡車位置）並存，
  背景散布類似 LiDAR 掃描點雲的白色光點特效。這是「AI-native
  technology」品牌敘事的直接視覺化：用真實工業場景 + 資料視覺化
  疊加層，證明其「電腦視覺辨識能力」而非用抽象科技感插畫代替。
  導覽列右側有 3 個功能性按鈕（EXPLORE PRODUCT 螢光綠底黑字／
  REQUEST DEMO／CONTACT US 灰底），色彩對比強烈，B2B 轉換路徑
  清晰可見於首屏。

### 6.3 三欄客戶旅程卡片（`terminal-home-desktop-section-tabs.png` /
`terminal-home-desktop-section5-narrative.png`）

- **Composition**：三張等寬卡片對應三種客戶成熟度（01 FAST START／
  02 SINGLE SITE & GROWING／03 ENTERPRISE NETWORK），每張卡片內含
  一張**真實空拍照**（不同構圖：第一張為斜角俯瞰貨櫃場，第二張為
  正俯視碼頭卸貨區，第三張為正俯視大型停車場），三張照片刻意採用
  不同拍攝角度與構圖，而非統一裁切比例——這與 Snøhetta/Leica 的
  「統一長寬比維持節奏一致性」原則相反，Terminal Industries 選擇
  用「照片內容的真實差異性」本身來區分三種客戶情境，是刻意的
  設計選擇而非疏漏。
- 每張卡片標題用左對齊小型 eyebrow 文字（"01 FAST START"）+ 中字級
  標題 + 說明段落 + 全寬淺灰按鈕（FIX NOW／LEARN MORE／ONE SYSTEM
  FOR ALL），三個按鈕文案刻意不同（非重複的「Learn More」樣板）。

### 6.4 互動式 ROI 計算機（`terminal-home-desktop-section-narrative2.png`）

- **Composition**：左側為表單輸入區（Number of gates／Shifts per
  day／Operating days per week／Spotters per shift／Check-ins per
  day／Blended hourly wage 六個數字輸入框 + 一個滑桿 "How significant
  are your annual detention and demurrage costs?"），右側為深綠色
  背景的即時結果卡片（"With Terminal your yard saves $641,626 /
  Est. Savings: 23%"），下方分類條列 Labor Savings／Spotter Savings／
  Detention & Demurrage Savings 三項數字，最下方是 email 擷取表單
  （"Want to know more?"）。
- **這是全部四個站點中唯一的真實功能性互動元件**，證實
  `01-reference-lock.md` 與 `02-art-direction-comparison.md` 對
  Terminal Industries「功能性互動元件取代裝飾性動效」的描述完全
  成立，且其「深綠色結果卡片 vs 白底輸入表單」的左右分色手法，是
  一個具體可轉譯的視覺模式（結果/數據用深色高對比背景凸顯，輸入
  區維持中性淺色）。

### 6.5 結構骨架變化驗證（跨 6 張桌面截圖）

實際比對 hero／工業情境圖／三欄卡片／計算機／YOS 介紹段落／footer
CTA 六個區塊，證實六種截然不同的版面骨架：
1. Hero：不對稱疊加文字於全寬攝影背景（無卡片、無網格）
2. 工業情境：全寬敘事型攝影 + 資料視覺化疊加
3. 三欄客戶旅程：對稱三欄卡片 + 各自獨立圖片
4. 計算機：左右二分割（表單 vs 結果卡）
5. YOS 介紹：置中單欄純文字段落（無圖片、無卡片）
6. Footer CTA：深色背景置中大字標語 + 四欄連結列

六個區塊確實六種不同骨架，直接驗證 `01-reference-lock.md` 標記的
「Section 骨架刻意變化」核心論點成立，非文字摘要臆測。

### 6.6 行動裝置轉換（`terminal-home-mobile-hero.png` /
`-industrial-context.png`）

- **Hero 轉換**：桌面版橫向全寬卡車剪影，行動版裁切為近乎正方形
  比例、卡車主體佔滿畫面寬度但可見範圍大幅縮減（僅見半輛卡車頭部
  + 部分拖車），暖橘色天空背景保留但比例壓縮。導覽列從桌面版
  展開式選單+3 按鈕，收合為單一漢堡選單圖示。
- **客戶 Logo 網格轉換**：桌面版 8 欄一列的灰階客戶 logo（DSV／
  Lineage／Goodyear／MDH／Honda／NFI／Ryder／HP／TJ Maxx），行動版
  收合為 2 欄堆疊網格，證實多欄 logo 陣列在窄螢幕上的標準收合模式
  是「等比例縮減欄數」而非「橫向捲動」。

---

## 7. Desktop / Mobile Comparison Across All Four Sites

綜合 52 張截圖的跨站觀察：

| 轉換模式 | Leica | ZEISS | Teenage Engineering | Terminal |
|---|---|---|---|---|
| 橫向多層導覽 → 行動裝置 | 收合為漢堡選單，二級清單維持文字列表 | 收合為漢堡選單，帶展開箭頭的多層清單（層級最深） | 收合為漢堡選單（本次未展開內部，圖像面向不分析） | 收合為單一漢堡圖示（無二級預覽） |
| 橫向分頁籤（tab） → 行動裝置 | 收合為單一下拉選單（"Discover ⌄"） | 收合為單一下拉選單（"Content ⌄"） | 不適用 | 不適用（首頁無 tab 元件） |
| 多欄產品卡 → 行動裝置 | 「三欄卡」→「單圖+底部縮圖橫捲列」 | 「多欄選項」→「垂直堆疊全寬卡」 | 「跨產品拼接寬圖」→「單一直幅裁切圖」 | 不適用 |
| 多欄 logo/客戶牆 → 行動裝置 | 不適用 | 不適用 | 不適用 | 「8 欄一列」→「2 欄堆疊網格」（等比例縮欄，非橫捲） |
| 圖片裁切邏輯 | 橫幅裁切 → 人像直幅（保留主體犧牲環境） | 維持全寬但降低視覺高度佔比 | 全寬裁切 → 更緊縮的方形特寫 | 保留主體但可見範圍大幅縮減 |
| 行動裝置專屬新增元件 | 無新增，僅收合 | 浮動客服聊天按鈕（桌面版無） | 底部無限捲動促購跑馬燈（桌面版無） | 無新增，僅收合 |

**跨站共通結論（Design DNA 存活於行動裝置轉換）**：
1. **橫向 tab 一律收合為單一下拉選單**，而非改為可橫向滑動的 tab
   列——Leica 與 ZEISS 兩個獨立站點採用完全相同的收合邏輯，這是
   高度可信的行動裝置轉換模式，值得 FORGEON 直接採用於 VISION-X2
   詳情頁（若有分頁式規格/亮點/下載區）。
2. **多欄網格一律垂直堆疊或等比例縮欄，沒有任何站點使用「保留
   多欄但橫向捲動」的手法**處理原本的網格內容（唯一橫向捲動的
   案例是 Leica 的縮圖導覽列，性質是「輔助導覽」而非「主要內容
   網格」）。
3. **不應成為核心語言的桌面限定手法**：ZEISS 的浮動客服按鈕、
   Teenage Engineering 的促購跑馬燈，都是各自站點行動裝置版本
   「新增」而非「延續」的元件，屬於各品牌自身商業模式的需求
   （客服密集度／促銷轉換），與 FORGEON 的 B2B 技術可信度定位
   無關，不應被視為必須複製的「行動裝置最佳實踐」。

---

## 8. Traditional Chinese Adaptability（基於實際觀察的視覺結構評估）

| 站點 | 適應性 | 判斷依據（基於實際截圖觀察，非文字推測） |
|---|---|---|
| **Leica Camera** | **高** | Hero 與產品頁標題均為混合大小寫（非全大寫依賴），字級層級靠「大字級主標題 vs 小字級副標題」的相對尺寸對比達成，此邏輯對中文完全適用（中文字級對比一樣可建立層級）。唯一需注意的是 `leica-product-desktop-specs-section.png` 出現的超大字級英文型號名稱（"SL3-P"，佔螢幕高度 60-70%）疊加背景紋理的手法，中文字符在相同超大字級下的筆畫密度會造成可讀性下降，此手法需要調整字級比例而非直接套用。 |
| **ZEISS Microscopy** | **高** | 篩選面板標籤（Application/Technology/Sample 等）與麵包屑導覽均為短詞組，翻譯為中文後不影響版面結構；唯一風險是 `zeiss-applications-desktop-filter.png` 顯示的 6 欄篩選面板在中文語境下標籤文字長度可能增加（例如"Place of work"譯為「工作場域」字元數變化），需保留足夠彈性寬度，但不構成結構性障礙。 |
| **Teenage Engineering** | 中（圖像本身無語言相依性，但文案風格需注意） | 圖像面向本身無中文適應性問題（不涉及文字排版）。若 FORGEON 借用其攝影手法，文案部分需注意：`te-product-desktop-isolated-shot.png` 使用德文短句「liebe auf den ersten blick」呈現品牌調性的手法，若換成中文短語需重新設計字級與行距比例（拉丁字母與中文字符的視覺密度不同），不能直接照搬字級數值。 |
| **Terminal Industries** | **高** | 首頁六個 section 的標題（"AI-native technology that turns the space between your gate and..."／"Fix one yard problem today. Expand on your timetable."）均為長句直述型標題，非全大寫依賴、非依賴字距特效，中文長句標題可直接對應此排版邏輯，換行位置需重新調整但字級/字重系統可直接沿用。三欄卡片的 eyebrow 文字（"01 FAST START"）為少量全大寫英文技術標籤，此手法應限縮在英文短詞使用（符合 `01-reference-lock.md` 既有結論），不擴大套用到中文標題。 |

**結論**：四個參考站點的視覺結構均具備中高至高的繁體中文適應性，
與 `02-art-direction-comparison.md` 先前的文字推論結論一致，本輪
截圖驗證未發現需要推翻該結論的新證據。

---

## 9. KEEP List

```
KEEP-LEICA-01
> 精度細節特寫優先於完整產品輪廓的 Hero 構圖策略
Evidence: leica-product-desktop-hero.png
Why FORGEON: VISION-X2 的鏡頭結構、光源模組本身具備光學儀器的精密
質感，可直接採用「鏡頭轉環/感測器局部特寫」作為產品頁 Hero，取代
單純的完整設備側拍，建立「這是精密儀器」的第一印象。
```

```
KEEP-LEICA-02
> 職人敘事引言段落取代冰冷規格表的中段呈現手法
Evidence: leica-product-desktop-midsection.png
Why FORGEON: VISION-X2 規格中「依材質選配光源模組」等技術決策，
可轉譯為簡短的工程師觀點引言（例如說明為何某材質需要同軸光而非
環形光），取代純數據條列，呼應 03-primary-reference-recommendation.md
既有的職人敘事建議。
```

```
KEEP-LEICA-03
> 橫向分頁籤在行動裝置上收合為單一下拉選單，而非橫向捲動 tab
Evidence: leica-product-mobile-hero.png
Why FORGEON: VISION-X2／AXM-400 詳情頁若採用「Discover / Technical
Specification / Downloads」式分頁結構，行動版應直接收合為下拉選單，
此為 Leica 與 ZEISS 跨站一致驗證的模式，非單一站點特例。
```

```
KEEP-LEICA-04
> Mega-menu 承載多層技術分類，一級 tab + 二級清單 + 精選卡片三層並存
Evidence: leica-home-desktop-nav-megamenu.png
Why FORGEON: 若鋒岳未來產品線擴充（AXM-400/VISION-X2/FLEXCELL-M
之外的更多型號），此三層式 mega-menu 組織方式可直接支撐擴充後的
技術目錄，避免導覽列本身過度扁平化。
```

```
KEEP-ZEISS-01
> 依應用場景 + 依內容類型的雙軌分類系統
Evidence: zeiss-applications-desktop-taxonomy.png
Why FORGEON: VISION-X2 的四大應用場景（定位/瑕疵檢測/條碼辨識/
特徵辨識）可仿照 ZEISS Applications Hub 的「你是在解決特定應用，
還是在處理特定樣品/工件類型」雙軌提問式入口，幫助不同背景的訪客
（技術採購 vs 一般探索者）快速找到相關內容。
```

```
KEEP-ZEISS-02
> 產品詳情頁的三層麵包屑導覽（Home › Products › 大類 › 子類）
Evidence: zeiss-product-desktop-detail.png
Why FORGEON: FORGEON 產品線若持續擴充分類（如按精密運動控制/
機器視覺/組裝工作站分類），三層麵包屑可讓訪客清楚定位當前頁面
在整體技術目錄中的位置，此為四站點中最完整的麵包屑實作範例。
```

```
KEEP-ZEISS-03
> Highlights 區塊的「勾選圖示 + 粗體小標題 + 說明文字」三段式重複呈現
Evidence: zeiss-product-desktop-specs.png
Why FORGEON: VISION-X2 的五項 features（工件定位/瑕疵檢測/條碼辨識/
光源選配/資料匯出）可用此三段式格式逐項呈現，比純條列更容易在
視覺上建立「已驗證的能力清單」的專業感。
```

```
KEEP-TE-01
> 產品家族視覺一致性來自構圖/裁切邏輯統一，而非色彩統一
Evidence: te-products-desktop-category.png
Why FORGEON: FORGEON 的 AXM-400／VISION-X2／FLEXCELL-M 三款產品
外觀差異大（線性模組/視覺模組/工作站），難以用統一色彩建立系列感，
但可透過統一的拍攝角度、裁切比例、光源方向建立「同一品牌」的
視覺辨識度，此手法比強迫統一色彩更適合鋒岳現有產品組合的異質性。
```

```
KEEP-TE-02
> 側光+邊緣輪廓光打法，在暗背景中凸顯產品材質與立體感
Evidence: te-product-desktop-detail-crop2.png
Why FORGEON: VISION-X2 的鏡頭鏡片、金屬機身邊緣若採用此打光策略
（側光製造陰影對比 + 邊緣輪廓光描邊），可在不依賴高飽和度色彩的
前提下，讓產品攝影具備更強的立體感與精品質感，比純均勻白底棚拍
更具視覺記憶點。
```

```
KEEP-TERMINAL-01
> Section 骨架刻意變化——六個區塊六種不同版面結構
Evidence: terminal-home-desktop-hero.png, terminal-home-desktop-industrial-context.png, terminal-home-desktop-section-tabs.png, terminal-home-desktop-section-narrative2.png
Why FORGEON: 直接對應 CLAUDE.md 與既有研究文件反覆強調的「避免
Solutions/Products/Industries 三個連續卡片區長得一樣」問題，
FORGEON 首頁可仿照此六種骨架交替出現的邏輯（不對稱疊字 Hero →
情境攝影+資料疊加 → 對稱多欄卡片 → 功能性互動元件 → 純文字段落
→ 深色 CTA），避免樣板疲勞感。
```

```
KEEP-TERMINAL-02
> 真實工業空拍/現場照片 + 資料視覺化疊加層，證明技術能力而非用插畫代替
Evidence: terminal-home-desktop-industrial-context.png
Why FORGEON: FORGEON 的「視覺定位」「瑕疵檢測」等技術能力，可仿照
此手法在產線實景照片上疊加辨識框/角度偏移標示等視覺化圖層，比
抽象科技感插畫更具工業可信度，同時比純粹的規格數字更容易讓訪客
「看懂」技術在做什麼。
```

```
KEEP-TERMINAL-03
> 多欄 logo/客戶牆網格在行動裝置上等比例縮欄而非橫向捲動
Evidence: terminal-home-mobile-hero.png (对比 terminal-home-desktop-section3.png 的 logo 網格)
Why FORGEON: 若 FORGEON 未來加入客戶/合作夥伴 logo 牆，行動裝置版
應遵循此驗證過的收合邏輯（8 欄→2 欄），而非採用容易被使用者忽略
的橫向捲動列表。
```

---

## 10. REJECT List

```
REJECT-LEICA-01
> 用「相機拍出的照片成果」佐證產品性能的敘事手法
Evidence: leica-product-desktop-material-crop.png
Reason: VISION-X2 作為視覺辨識模組沒有對應的「使用者創作內容」可
展示（它不像相機一樣產出可供欣賞的攝影作品），此手法結構性地
不適用於工業感測/辨識類產品，強行移植會顯得牽強。
```

```
REJECT-LEICA-02
> 超大字級型號名稱疊加深色背景紋理的規格區塊視覺處理
Evidence: leica-product-desktop-specs-section.png
Reason: 此區塊是全頁面中唯一大面積使用飽和深藍背景色的區塊，與
Direction B 強調的「極度克制中性色」原則本身就存在內部矛盾（Leica
自己也只在單一區塊破例）；且超大字級英文字母（佔螢幕 60-70% 高度）
的手法在中文語境下會因筆畫密度造成可讀性问题，不建議移植。
```

```
REJECT-ZEISS-01
> 六維同時展開的篩選面板 + 高密度新聞列表首頁資訊架構
Evidence: zeiss-applications-desktop-filter.png, zeiss-home-desktop-lower.png
Reason: 與 Leica 主導的克制留白原則直接衝突，且 FORGEON 現階段
產品線僅三款（AXM-400/VISION-X2/FLEXCELL-M），完全不需要六維
篩選系統這種為「136 篇文章」規模設計的資訊架構，過度工程化。
```

```
REJECT-ZEISS-02
> Hero 使用 AI 生成影像且標註「AI generated」
Evidence: zeiss-home-desktop-hero.png
Reason: 對於強調「精密工程可信度」與「真實工業能力」的 FORGEON
而言，Hero 主視覺標註 AI 生成會直接削弱工業可信度敘事，即使
FORGEON 本身可能需要用 AI 生成/優化素材，也不應該在畫面上明示
此標籤，這與目標 C（真實工業公司感）直接衝突。
```

```
REJECT-TE-01
> 借用流行文化/歷史人物授權影像建立產品敘事張力
Evidence: te-product-desktop-hero.png
Reason: 工業自動化品牌不具備借用拳王阿里等流行文化資產的敘事
正當性，這類手法適合消費性電子/文化商品品牌，用於 B2B 精密工程
品牌會顯得不協調甚至不專業，必須排除。
```

```
REJECT-TE-02
> 底部無限捲動促購跑馬燈（行動裝置專屬）
Evidence: te-product-mobile-isolated.png
Reason: 此為零售導向的促銷轉換元件（"ONLY $329 BUY NOW!"），與
FORGEON 的 B2B 詢價導向（非線上零售）商業模式不符，強行加入會
讓工業自動化網站顯得像消費性電商，違反品牌定位。
```

```
REJECT-TERMINAL-01
> 三張客戶旅程卡片刻意使用不同拍攝角度與構圖比例
Evidence: terminal-home-desktop-section5-narrative.png
Reason: 雖然此為 Terminal 的刻意設計選擇，但與 Leica 主導的「統一
長寬比維持 gallery 節奏一致性」原則衝突。FORGEON 若同時採用兩種
邏輯（部分區塊統一比例、部分區塊刻意不統一）需要非常謹慎的版面
分區規劃，否則容易顯得不一致而非「刻意的設計選擇」，本次不建議
在同一改版中同時引入兩種相衝突的圖片比例哲學。
```

---

## 11. Top 10 FORGEON Visual Rule Candidates

```
Rule 1
Evidence source: Leica Camera
Evidence screenshot: leica-product-desktop-hero.png
Rule: 產品詳情頁 Hero 使用精度細節局部特寫，而非完整產品側拍
Why FORGEON: 建立「精密儀器」第一印象，VISION-X2 鏡頭/感測器結構
天然適合此手法
Risk: 若產品本身缺乏可辨識的精密細節（如 FLEXCELL-M 的整體工作站
外觀較不具備「特寫感」），此規則需要針對不同產品線調整適用範圍
```

```
Rule 2
Evidence source: Leica Camera + ZEISS Microscopy
Evidence screenshot: leica-product-mobile-hero.png, zeiss-product-mobile-hero.png
Rule: 桌面版橫向分頁籤在行動裝置上一律收合為單一下拉選單
Why FORGEON: 兩個獨立站點跨站一致驗證的行動裝置轉換模式，可信度高
Risk: 低——此為結構性規則而非美學品味，執行風險小
```

```
Rule 3
Evidence source: ZEISS Microscopy
Evidence screenshot: zeiss-product-desktop-detail.png
Rule: 產品詳情頁採用三層麵包屑導覽（Home › 大類 › 子類）
Why FORGEON: 支撐 FORGEON 產品線擴充後的技術目錄可瀏覽性，強化
目標 B（技術資訊架構專業度）
Risk: 現階段僅三款產品，過早導入三層分類可能顯得「為了架構而架構」，
建議先以兩層（Home › 產品）起步，保留未來擴充彈性
```

```
Rule 4
Evidence source: ZEISS Microscopy
Evidence screenshot: zeiss-product-desktop-specs.png
Rule: 產品 Highlights 用「勾選圖示+粗體標題+說明文字」三段式呈現
取代純規格條列
Why FORGEON: 讓 VISION-X2 的五項核心能力更易被快速掃描理解，兼顧
視覺化與資訊密度
Risk: 若每項說明文字過短會顯得單薄，需要職人敘事的文案深度支撐
（呼應 02-art-direction-comparison.md 對 Direction B 的既有風險提示）
```

```
Rule 5
Evidence source: Teenage Engineering
Evidence screenshot: te-products-desktop-category.png
Rule: 產品家族一致性由統一拍攝角度/裁切邏輯建立，不強迫統一色彩
Why FORGEON: FORGEON 三款產品外觀異質性高，此規則比色彩統一更可行
Risk: 需要建立明確的拍攝規範文件（角度、光源方向、裁切比例數值）
供未來新產品拍攝時遵循，否則規則容易在執行中流失一致性
```

```
Rule 6
Evidence source: Teenage Engineering
Evidence screenshot: te-product-desktop-detail-crop2.png
Rule: 產品攝影採用側光+邊緣輪廓光，在暗背景中建立立體感與材質辨識度
Why FORGEON: 比均勻白底棚拍更具視覺記憶點，適合作為 VISION-X2
「精度細節特寫」簽名時刻的具體打光參考
Risk: 純黑背景與 FORGEON 現有品牌白/暖白基調有落差，需要測試改用
深灰或深藏青背景是否能達到同等立體感效果而不偏離品牌現有色彩系統
```

```
Rule 7
Evidence source: Terminal Industries
Evidence screenshot: terminal-home-desktop-hero.png, terminal-home-desktop-section-narrative2.png, terminal-home-desktop-section-tabs.png
Rule: 首頁至少 4-6 個 section 採用彼此不同的版面骨架，避免連續
卡片式重複
Why FORGEON: 直接解決現有樣板疲勞問題，且此規則與 Direction B
的克制美學不衝突——骨架變化是結構層面，克制留白是視覺層面，
兩者可並存
Risk: 若團隊技術資源有限，維護多種不同骨架的成本高於統一卡片式
版面，需要評估頁構所的實作能力是否能負擔
```

```
Rule 8
Evidence source: Terminal Industries
Evidence screenshot: terminal-home-desktop-industrial-context.png
Rule: 真實工業場景照片 + 技術能力視覺化疊加層（如辨識框/角度標示），
取代抽象科技插畫
Why FORGEON: 直接服務目標 C（真實工業公司感），VISION-X2 的辨識/
定位能力可用類似手法在實際工件照片上疊加視覺化標示
Risk: 需要真實產線或高擬真度合成素材支撐，若素材品質不足會比
純白底棚拍更容易顯得廉價（呼應 02-art-direction-comparison.md
對 Direction A 攝影素材風險的既有警告）
```

```
Rule 9
Evidence source: Leica Camera + Terminal Industries
Evidence screenshot: leica-home-desktop-nav-megamenu.png, terminal-home-desktop-section4-functional.png
Rule: 客戶/合作夥伴 logo 一律灰階去彩處理，維持視覺克制
Why FORGEON: Terminal 的灰階 logo 牆截圖證實此手法確實存在且效果
克制，若 FORGEON 未來展示合作夥伴或應用產業別 logo，應遵循此
去彩原則而非直接使用彩色品牌 logo，避免視覺雜訊
Risk: 低，此為成熟且風險可控的既有做法
```

```
Rule 10
Evidence source: ZEISS Microscopy
Evidence screenshot: zeiss-applications-desktop-taxonomy.png
Rule: 用「你是在解決 X 應用，還是在處理 Y 樣品/工件類型」雙軌提問
式入口取代單一分類導覽
Why FORGEON: VISION-X2 的應用場景（定位確認/外觀檢測/條碼掃描/
視覺引導組裝）與工件材質特性（依材質選配光源）本身就是兩個獨立
分類軸線，適合用此手法幫助不同動機的訪客快速找到相關內容
Risk: 現階段內容量小（單一產品的 useCases），雙軌入口可能顯得
「為了架構而架構」，建議在產品線擴充到 5-6 款以上時再考慮導入，
現階段可用單一 useCases 條列取代
```

---

## 12. Reference Responsibility Matrix

| Design Domain | Governing Reference |
|---|---|
| Overall premium composition | **Leica Camera**（Primary） |
| Typography attitude | **Leica Camera**（Primary）—— 字重對比建立層級，混合大小寫 |
| Whitespace | **Leica Camera**（Primary） |
| Product photography | **Leica Camera + Teenage Engineering**（Primary + Constraint：Leica 主導「精度特寫/完整輪廓交替」節奏，Teenage Engineering 補強「側光/邊緣輪廓光」的具體打光技法） |
| Product detail crops | **Teenage Engineering**（Secondary－Imaging，狹窄範圍：僅限打光與裁切手法，不含文案語氣） |
| Technical IA | **ZEISS Microscopy**（Secondary－Technical IA） |
| Specification presentation | **ZEISS Microscopy**（Secondary－Technical IA） |
| Industrial context | **Terminal Industries**（Industrial Reality Check，非視覺 Primary，但此域由其獨家主導） |
| Section structural variety | **Terminal Industries**（Industrial Reality Check，此域由其獨家主導，Leica/ZEISS 均未展現此原則的證據） |
| Motion attitude | **Leica Camera**（Primary，克制/幾乎無裝飾性動效）+ **Terminal Industries**（Constraint：唯一例外是功能性互動元件如計算機，允許動態回饋但僅限服務資訊功能） |
| Mobile transformation | **Leica Camera + ZEISS Microscopy**（Primary + Constraint：兩站跨站一致驗證「tab 收合為下拉選單」「多欄堆疊」的轉換邏輯，具高可信度） |

**說明**：本表刻意避免任何「mix of all」答案，每個設計領域指定
單一主導參考，Primary + Constraint 的組合僅在有明確截圖證據支持
「兩個參考在該領域互補而非衝突」時使用（例如產品攝影領域，Leica
提供整體節奏、Teenage Engineering 提供具體打光技法，兩者未見衝突
證據）。

---

## 13. Leica Primary 裁定

# **裁定：APPROVE**

基於本輪 52 張真實截圖的觀察，Leica Camera 作為 Direction B（精密
儀器編輯感）Primary Reference 的判斷予以核可，理由如下：

1. **`leica-product-desktop-hero.png` 到 `leica-product-desktop-specs-
   section.png` 的連續 4 張截圖**，證實 Leica 產品詳情頁確實具備
   `03-primary-reference-recommendation.md` 所描述的「精度細節特寫
   +完整輪廓+職人敘事引言」三段式節奏，此節奏具體可觀察、可轉譯，
   非文字摘要的臆測。
2. **`leica-home-desktop-nav-megamenu.png`** 證實其 mega-menu 確實
   具備三層資訊架構承載能力，足以支撐 FORGEON 未來產品線擴充需求。
3. **`leica-product-mobile-hero.png` 系列**證實其行動裝置轉換邏輯
   （tab 收合為下拉選單、多欄縮圖收斂為主圖+橫捲列）具體可執行、
   且與 ZEISS 的獨立驗證結果一致，顯示此非單一站點特例而是可信賴
   的通用模式。
4. **唯一需要留意的落差**：`leica-product-desktop-material-crop.png`
   揭露 Leica 部分敘事手法（用「拍出的照片」佐證性能）不可直接
   移植給 VISION-X2，以及 `leica-product-desktop-specs-section.png`
   的超大字級深色背景區塊與其自身「克制留白」原則存在內部張力
   ——這些已在 REJECT 清單中明確標註，不影響 Primary 裁定本身，
   但後續 DESIGN.md 階段執行時必須遵守這些排除項。

**裁定不是「Leica 完美無缺」，而是「基於實際截圖證據，Leica 提供
的可轉譯視覺原則數量與品質，足以支撐其作為 Primary Reference 的
角色，且其局限已被明確界定與排除」**。

---

## 14. Final Reference Lock Recommendation

延續 `03-primary-reference-recommendation.md` 的推薦，本輪視覺驗證
未發現任何需要推翻該推薦的證據，予以完整維持：

- **Direction**：B — 精密儀器編輯感（Precision Instrument Editorial）
- **Primary**：Leica Camera（APPROVE，見第 13 節）
- **Secondary－Technical IA**：ZEISS Microscopy（狹窄範圍：雙軌分類
  系統、三層麵包屑、Highlights 三段式呈現）
- **Secondary－Imaging**：Teenage Engineering（狹窄範圍：側光/邊緣
  輪廓光打光技法、統一裁切邏輯建立產品家族一致性；明確排除其
  流行文化敘事手法與促購型行動裝置元件）
- **Industrial Reality Check**：Terminal Industries（狹窄範圍：
  section 骨架變化原則、真實工業場景+技術視覺化疊加層、灰階
  客戶 logo 處理；不作為視覺 Primary，不引入其「刻意不統一圖片
  比例」的手法以免與 Leica 主導原則衝突）
- **Showcase Product**：VISION-X2

本輪新增的具體執行細節（第 11 節 Top 10 Rules）與明確排除項
（第 10 節 REJECT List）應作為下一階段 DESIGN.md 制定時的直接輸入，
避免重新從文字摘要臆測視覺細節。

---

## 15. Human Decision View

```
# FINAL VISUAL REFERENCE GATE RECOMMENDATION
Direction: B — 精密儀器編輯感 Precision Instrument Editorial
Primary: Leica Camera
Secondary — Technical IA: ZEISS Microscopy
Secondary — Imaging: Teenage Engineering
Industrial Reality Check: Terminal Industries
Showcase Product: VISION-X2
Primary verdict: APPROVE
Confidence: High
Blocking visual evidence gaps: None
Recommended next stage: DESIGN.md
```
