# 鋒岳自動化企業形象網站
# 全面專業審查、案例研究與重構決策報告


> 審查對象：`demo-1(1).rar`  
> 專案程式實際使用：**鋒岳自動化 / FORGEON AUTOMATION**  
> 本輪文字多次使用「岳峰自動化」，但程式與既有規劃均使用「鋒岳自動化」。正式發布前必須統一，否則會影響品牌、網址、SEO、合約與作品集命名。  
> 審查日期：2026-08-04

---

## 1. 一句話總結目前網站的核心問題

**它已經是一個技術紀律良好、內容完整、可用性合格的工業 B2B 概念網站，但視覺仍主要靠「暖白背景＋工業線稿＋標題＋卡片」組成，缺少能貫穿全站的專屬創意概念、具材料感的核心素材與真實信任證據，因此更像完成度很高的 Wireframe／Design System Demo，而不是足以讓企業願意支付高價、也足以成為頁構所代表作的高階品牌網站。**

---

## 2. 整體評分與所在水準

| 評估面向 | 得分 | 做得好的地方 | 主要扣分原因 | 升到下一級需完成 |
|---|---:|---|---|---|
| 品牌辨識度 | 5.8/10 | 暖白、墨黑、銅橘與工程標記形成一致氣質 | 同樣語言可套用到許多工業品牌；沒有鋒岳專屬符號 | 建立「製程座標系」專屬視覺資產 |
| 視覺成熟度 | 6.0/10 | 清楚、穩定、沒有廉價特效 | 插圖與產品 Glyph 太像佔位圖，缺材料、尺度與攝影層次 | 高品質 Hero CGI／真實照片與產品渲染 |
| 版面構圖 | 6.2/10 | Container、對齊、間距穩定 | 大量標準容器與三欄卡片；缺非對稱和視覺高潮 | 重做 Hero、產品、證據與案例構圖 |
| 資訊層級 | 8.1/10 | 雙語、產品、方案、產業與 RFQ 關係清楚 | 詳細頁切段太多，視覺重量接近 | 頁內導航、System Map、決策摘要 |
| 內容說服力 | 6.8/10 | 有適合／不適合、流程、規格與準備資料 | 缺真實成果、機台、工程案例、認證 | 真實資料；概念案則強調規劃方法 |
| 圖片與素材品質 | 4.7/10 | SVG 一致、授權乾淨、效能很好 | 核心畫面仍是簡單線稿和 Icon | 主視覺、產品 CGI、應用場景 |
| 動態與互動 | 4.3/10 | 選單、表單、FAQ 正常，Reduced Motion 完整 | 幾乎沒有品牌敘事型動態 | 座標定位、模組組裝、路徑追蹤 |
| 響應式與細節 | 8.2/10 | 已修正溢位；測試與 a11y 基礎完整 | 手機多為桌機單欄堆疊 | 手機 Hero、產品、流程獨立重組 |
| 商業轉換能力 | 6.6/10 | CTA、意圖分流、RFQ 與 Demo Mode 完整 | 缺信任證據；表單入口摩擦偏高 | 技術資料包、快速評估、案例證據 |
| 作品集競爭力 | 5.9/10 | 可證明 Astro、雙語、SEO、QA 與工程紀律 | 無法第一眼證明 Art Direction 與素材統籌 | 公開 Case Study，呈現決策與證據 |
| **總分** | **66.6/100** | **技術和資訊架構高於一般接案者** | **視覺概念、素材與證據低於高價定位** | **保留技術底座，進行大幅重構** |

目前層級：

> **2.5：優於一般接案者作品，但尚未穩定達到中階網頁設計公司代表案例。**

升到中階公司代表作，需要一個可命名的創意母題、三個代表畫面、高品質工業素材、非卡片式構圖、視覺化內頁和公開 Case Study。升到台灣一線案例，還需要真實品牌資料、攝影、Motion Direction、跨渠道資產與真實成果。

---

## 3. 現有設計策略與程式架構摘要

### 設計策略

專案文件提出「Precision is a process you can watch, not a claim」，把網站視為工程圖。實際落地為暖白紙張背景、墨黑文字、銅橘重點、Mono 編號、線稿產品、細邊框、規格表和整齊卡片。

方向本身可保留，但目前只做到「工程圖的外觀」，尚未讓訪客真的看見定位、檢測、組裝、校準與驗證如何發生。

### 首頁敘事

Hero → 核心能力 → 解決方案 → 產品 → 產業 → 適合／不適合 → 角色路徑 → 流程 → 合作理由 → CTA。

內容完整，但更像把網站應有項目逐項列完；視覺語法沒有隨內容增加而變化。

### 技術架構與實際檢查

- Astro 4＋TypeScript、Static-first、Content Collections。
- 完整中英文路由、Canonical、hreflang、Breadcrumb、Schema。
- Demo Mode、noindex、RFQ Demo Submission。
- 既有建置產物包含 50 個 HTML；其中 48 個正式內容頁、2 個重導頁。
- 本次重跑：48 個正式頁面 H1 全數通過。
- 本次重跑：1,951 個內部連結無失效。
- 本次重跑：141 個 hreflang 對應無失效。
- 現有五份 Lighthouse 報告：Performance、Accessibility、Best Practices 均為 100；Demo Mode SEO 為 66，主因刻意 noindex。
- 現有 QA 文件記錄 198 個 Playwright 測試通過、axe Critical／Serious 為 0。

環境限制：壓縮檔包含 pnpm `node_modules`，RAR 解壓破壞套件 symlink／權限，本次無法完整重跑 `astro check && astro build`；現有 `dist` 可正常啟動瀏覽，H1／連結／語系腳本已獨立重跑。後續交付不應包含 `node_modules`，應以 lockfile 乾淨安裝。

### AI 多輪堆疊跡象

- 首頁新增需求多用 `SectionHeading＋Container＋Grid/List`。
- 每個局部合理，但缺共同視覺事件。
- 詳細頁把資料欄位直接映射成一個個 Section。
- 全站約有 80 次 `SectionHeading`、94 個 `<section>`；首頁多處使用 `.grid-auto`。
- `ContactForm.astro` 約 477 行、`Header.astro` 約 323 行，部分元件職責偏大。
- 中英文頁面有不少重複 markup。
- Industry slug 有多處 `as any`。

---

## 4. 最嚴重的五個問題

### S-01：沒有真正屬於鋒岳的核心創意母題

文件說「Precision is a process you can watch」，但實際只有靜態線條、編號和表格。這讓客戶看到專業，卻看不到差異。應保留精密策略，重新定義成 **Precision Datum System／製程座標系**。

### S-02：核心素材仍是 Placeholder 級

`src/components/ui/HeroIllustration.astro:13–99` 是簡單的線性模組、機械臂和視覺節點；註解也承認它是預定生成素材前的替代。產品 Glyph 與產業 Icon 同樣缺材料、尺度、環境和光影。Hero、產品媒體和產業素材需整區重做。

### A-01：首頁大量重複標準卡片與區段

`src/pages/zh-tw/index.astro:98–168`、`201–252` 反覆出現 Eyebrow、標題、說明、Grid、按鈕。第一次整齊，長頁面則可預測，手機變成連續卡片。Solutions、Products、Industries 至少兩區必須改成非卡片構圖。

### A-02：詳細頁是資料欄位垂直輸出，不是決策工具

`solutions/[slug]/index.astro:54–235` 把 Background、Scenarios、Components、Workflow、Benefits、Equipment 等逐段輸出。內容完整，但視覺重量相近、大量空白，缺 Sticky Index、System Map、Decision Summary 和 Input／Output Matrix。

### A-03：虛構資料形成商業信任硬上限

概念網站不能提供真實歷史、客戶、認證、工廠、案例和績效。這不是 CSS 能解決。它應被定位為「頁構所如何為工業企業規劃網站的 Concept Case」，而不是假裝能證明鋒岳本身已有真實工程實績。

---

## 5. 值得保留的部分

1. Astro、Content Collections、路由與資料模型。
2. 中英文、hreflang、SEO 元件。
3. Demo Mode、noindex 與誠信標示。
4. RFQ 意圖分流和表單狀態。
5. 產品、方案、產業關聯。
6. H1、Links、Locale、Playwright、axe、Lighthouse 基礎。
7. Accessibility、Reduced Motion。
8. 暖白＋墨黑基底與銅橘 Signal。
9. 適合／不適合、導入資料、流程、Concept Scenario。
10. PDF Datasheet 和下載架構。
11. 極少 JavaScript 與優秀效能。

---

## 6. 逐頁面與逐區塊審查

### Header

檔案：`src/components/layout/Header.astro`。  
優點：導覽、語言、CTA、手機選單功能完整，先前 Scoped CSS 問題已修。  
問題：Logo 太小且沒有專屬符號；整體更像功能導覽。  
調整：建立 Datum Origin Mark；Desktop 76–84px；Hover 只出現短基準線；手機只留 Logo、語言、Menu，CTA 放 Drawer 底部。  
等級：A，局部重構。

### Hero

檔案：`index.astro:43–63`、`264–308`、`HeroIllustration.astro`。  
問題：標準 55/45 兩欄；主標通用；方形黑底線稿像 Widget；沒有尺度與材料。  
調整：Desktop 720–820px／86–92svh；12 欄，文案 1–6、視覺 6–13 並跨 Container；主標改為「把定位、檢測與組裝，校準成一套可導入的生產流程。」；主視覺採產品模組＋座標＋鎖定框；下方加入 INPUT→ALIGN→INSPECT→ASSEMBLE 流程帶。  
手機：4:5 專用裁切，不縮小桌機整圖。  
等級：S/A，整區重做。

### 核心能力

`index.astro:65–96`。四個文字條目比卡片好，但仍缺視覺。改為左側能力導航＋右側同一張 System Map，Highlight 不同站點；手機 Accordion。  
等級：A。

### Solutions

`index.astro:98–121`。三張卡片無法表現「依製程問題配置」。改成 Problem Matrix：定位、檢測、組裝、搬運、升級 × 工件、節拍、精度、環境。  
等級：A，整區重做。

### Products

`index.astro:123–146`。產品卡資料完整，Glyph 像 Placeholder。改成 Assembly Stage：三產品在同一工作站中，選取後顯示角色與對應方案。  
等級：A，需要素材。

### Industries

`index.astro:148–168`。Icon＋文字太通用。改成 2×2 大型場景，每張顯示產業製程問題；沒有真實照片時使用明確 Concept CGI，不假裝客戶現場。  
等級：A。

### Fit／Not Fit

`index.astro:170–199`。內容很好，呈現仍是兩張 UI 卡。改成工程評估閘門：資料是否完整→問題是否明確→是否需整合→時程是否合理；最後分流至詢價或準備清單。  
等級：A，保留內容、重做呈現。

### 角色路徑

`index.astro:201–225`。策略正確，但兩張卡與前段重複。併入 Hero 下方或導覽，以採購／管理者、工程師兩條入口呈現。  
等級：B。

### 導入流程

`index.astro:227–237`。清楚但普通。每階段改成 Input／Decision／Output，讓流程本身成為專業證據。  
等級：A。

### Why Us

`index.astro:239–252`。抽象主張且全部置中。改成 Evidence Ledger，展示 Requirement Sheet、System Architecture、Configuration Matrix、Acceptance Checklist 的概念樣張。  
等級：A。

### Final CTA

`index.astro:254–261`。深色 Banner 有效，但文案泛用。CTA 前先列工件圖、目標節拍、現場限制三項資料；主要「開始專案評估」、次要「下載需求準備清單」。  
等級：A。

### Solution Detail

`src/pages/zh-tw/solutions/[slug]/index.astro:54–235`。連續 Narrow Sections、大量空白。重構為 Hero Summary、Sticky Index、Decision Summary、Problem/Approach、System Architecture、Suitability Matrix、Workflow、Compatibility、Scenario、FAQ、CTA。  
等級：A，大幅重構。

### Product Detail

`products/[slug]/index.astro:41–118`。資料與 PDF 功能可保留；產品媒體、特性、應用和關聯方案呈現需重做。加入產品在系統中的角色、適合／不適合、選型圖、比較表、模組化選配。  
等級：A，視覺大幅重構。

### Industries Detail

每頁需不同場景與製程圖，內容聚焦 Station／Risk／Solution／Input，不應只換 Icon 和文字。  
等級：A。

### About

虛構品牌無法提供歷史、團隊、工廠和認證。概念案中應降低 About 權重，改成 Engineering Method；真實專案才恢復公司證據。  
等級：S/A，內容重定位。

### Insights

架構可留。每篇增加 Key Takeaways、原創工程圖、Checklist 和 Related Solution。  
等級：B。

### Contact／RFQ

`contact/index.astro`、`ContactForm.astro`。功能是全案優點，但完整表單初次摩擦偏高，元件約 477 行。改成 3 題快速評估→推薦入口→完整 RFQ；拆分 Validation、Status、Demo Submit。  
等級：A/B。

### Footer

資訊完整但虛構聯絡資料可能被誤解。加強 Concept Project 標示；頁構所正式作品集另提供「查看設計過程」。  
等級：B。

---

## 7. S／A／B／C 問題總表

### S 級

- 岳峰／鋒岳命名不一致。
- 創意母題未真正落地。
- 虛構資料無法支撐企業信任。
- Hero 不足以代表高價品牌案。

### A 級

- 卡片與 Section 重複。
- 產品／產業素材太弱。
- Solution Detail 欄位式垂直輸出。
- 手機主要為單欄堆疊。
- 缺 Evidence Ledger。
- Motion Direction 缺失。
- 系統字型缺專屬辨識。
- 完整 RFQ 初次負擔偏高。

### B 級

- Header 品牌感。
- CTA 文案。
- Footer 標示。
- 中英文頁面程式重複。
- 多處 `as any`。
- Hover 多為 Border／Shadow。
- 缺 Firefox／Safari／Edge 本輪獨立重跑。
- 缺 NVDA／VoiceOver 真實測試。
- 壓縮交付包含 `node_modules`。

### C 級

- 頁面切換微動態。
- 互動式 360 Product。
- 進階 WebGL 材料。
- 展覽 Kiosk 模式。

---

## 8. 台灣網頁設計公司研究方法

1. 優先採用設計公司官方作品頁，不依賴推薦排行。
2. 優先工業、製造、科技 B2B、工程顧問與傳產品牌升級案例。
3. 加入少量非工業但具有強 Art Direction 的案例作為創意上限。
4. 不把獎項視為商業效果證明。
5. 案例頁的專案目標與成果屬廠商官方自述；沒有後台資料的成效不視為獨立驗證。
6. 比較品牌策略、素材、構圖、資訊理解、信任、CTA、手機與維護，不只比較顏色和動畫。

研究公司：

- Block Studio 版塊設計。
- WDD 威德網頁設計。
- Polaris 普拉瑞斯創意整合。
- Cadiis 凱士數位。
- Choice 喬義司。
- Apple Web 蘋果網頁設計。
- JDDT 杰鼎。
- WebGene 網路基因。

---

## 9. 研究公司與案例清單

| 公司 | 案例 | 類型 | 選擇理由 |
|---|---|---|---|
| Block Studio | FENC 遠東新世紀 | 材料／製造企業 | 把材料特性轉成數位品牌語言 |
| Block Studio | Wisecure | B2B 資訊安全 | 把抽象服務轉成專屬動態符號 |
| Block Studio | HIIARCHITECTS | 建築專業服務 | 網格成為品牌與內容結構 |
| WDD | KAFO 高鋒工業 | CNC／航太設備 | 傳產轉型與國際化呈現 |
| WDD | Macroblock 聚積科技 | B2B 半導體／科技 | 不規則編排和 B2C 行銷導入 B2B |
| Polaris | POLYSTAR 世林機械 | 回收機械 | 長期品牌、攝影、3D、展覽與網站整合 |
| Polaris | BSG 百象機械 | 齒輪箱／機械 | 白皮書、VI、機台色彩、網站整體一致 |
| Cadiis | GlobalTek 時碩工業 | 精密加工／航太／車用 | 3D 主視覺、產業分流、多語、ESG |
| Cadiis | 大同鋁業 | 建材製造 | 真實影像、專利、實績、流程、FAQ |
| Choice | 萊峰電機 | 工程／能源顧問 | 複雜服務分類與實績數據 |
| Apple Web | 台灣微現科技 | 工業檢測設備 | 真實設備照片和標準企業資訊 |
| JDDT | 鼎盛精密 | 沖壓／連接器 | 一般量產型工業網站市場基準 |
| WebGene | 夢幻香港等互動案 | 體驗型數位專案 | 用一個明確互動概念形成記憶點 |

---

## 10. 類似案例深度分析

### 10.1 FENC 遠東新世紀 — Block Studio

1. 產業：材料、化纖、企業集團。
2. 目標：把龐大資訊重構為未來感數位介面。
3. 定位：理性、國際、材料科技。
4. Hero：3D 材料形體是主角。
5. 視覺概念：材料延展、光影、透明度、形變。
6. 色彩：企業藍紅以材質呈現，不是平面色塊。
7. 字體：理性節制，讓 3D 主導。
8. 構圖：大尺度、留白、物件跨區域。
9. 素材：專案級 3D，不是圖庫。
10. 節奏：精簡結構和流暢互動。
11. 動態：形體與事業意義直接對應。
12. 技術視覺化：三事業體各有象徵形體。
13. 信任：企業真實規模與資料。
14. CTA：企業資訊探索。
15. 手機：需降低 3D 負載但保留形體。
16. 記憶點：材料即網站。
17. 缺點：成本高，適合大型企業。
18. 可學：找出鋒岳的動作／材料語言。
19. 不可抄：直接套抽象 3D 球體。
20. 啟示：主視覺必須來自定位、檢測、組裝本身。

### 10.2 Wisecure — Block Studio

1. 產業：資訊安全。
2. 目標：擺脫資訊公司單調印象並支援國際市場。
3. 定位：防護、敏捷、安全。
4. Hero：圓點交織屏障。
5. 概念：屏障抵禦攻擊。
6. 色彩：高對比科技語言。
7. 字體：服務動態主視覺。
8. 構圖：中心防護場。
9. 素材：原創動態圖形。
10. 節奏：持續動態形成世界觀。
11. 動態：是服務隱喻，不是裝飾。
12. 技術表達：抽象資安轉為防護機制。
13. 信任：品牌識別與服務一致。
14. CTA：產品與服務理解。
15. 手機：需簡化粒子。
16. 記憶點：點陣屏障。
17. 缺點：過量會偏娛樂和耗能。
18. 可學：建立一個可動的鋒岳符號。
19. 不可抄：粒子防護罩不屬於自動化。
20. 啟示：座標校準和視覺鎖定可成為母題。

### 10.3 HIIARCHITECTS — Block Studio

1. 產業：建築。
2. 目標：整體品牌延伸官網。
3. 定位：建築本質、工具、匠師。
4. Hero：格狀構成與鏡射 Logo。
5. 概念：切格是資訊系統，不只是背景。
6. 色彩：克制，凸顯材質。
7. 字體：與建築網格一致。
8. 構圖：大圖與細節瀏覽模式。
9. 素材：建築材質攝影。
10. 節奏：大尺度和細部切換。
11. 動態：鏡射和瀏覽模式。
12. 內容視覺化：Project 瀏覽方式反映專業。
13. 信任：作品影像。
14. CTA：專案探索。
15. 手機：網格重新組合。
16. 記憶點：名片比例 Contact 格。
17. 缺點：素材弱時概念會失效。
18. 可學：座標網格控制全站。
19. 不可抄：完全套建築黑白極簡。
20. 啟示：Design System 要源自工作方法。

### 10.4 KAFO 高鋒 — WDD

1. 產業：CNC、航太設備。
2. 目標：傳產轉型，年輕、創新、專業。
3. 定位：加工設備跨入航太市場。
4. Hero：設備和轉型訊息。
5. 概念：B2B 使用更具行銷性的呈現。
6. 色彩：工業品牌色。
7. 字體：專業與新世代。
8. 構圖：產品影像和入口清楚。
9. 素材：真實設備。
10. 節奏：產品／應用導向。
11. 動態：服務產品理解。
12. 技術表達：機台和應用。
13. 信任：真實產品和公司背景。
14. CTA：產品／詢價。
15. 手機：官方案例有 RWD 展示。
16. 記憶點：傳產轉型整體感。
17. 缺點：案例年代較早，不是最新上限。
18. 可學：產品影像比抽象 Icon 有說服力。
19. 不可抄：傳統大 Banner。
20. 啟示：真實機台本身能建立可信度。

### 10.5 Macroblock 聚積 — WDD

1. 產業：LED 驅動 IC、B2B 科技。
2. 目標：兼顧快速操作和行銷。
3. 定位：科技創新、人文時尚。
4. Hero：產品與品牌影像。
5. 概念：B2B 導入 B2C 行銷機制。
6. 色彩：科技但非純模板藍。
7. 字體：時尚化。
8. 構圖：不規則、交錯。
9. 素材：專業人物和科技影像。
10. 節奏：不規則段落降低制式感。
11. 動態：配合行銷資訊。
12. 技術內容：仍可快速查詢。
13. 信任：產品和企業內容。
14. CTA：產品搜尋和聯絡。
15. 手機：複雜構圖需簡化。
16. 記憶點：不規則 B2B Editorial。
17. 缺點：過度會降低掃讀。
18. 可學：打破等寬卡片。
19. 不可抄：沒有內容邏輯的錯位。
20. 啟示：構圖張力能服務 B2B。

### 10.6 POLYSTAR 世林 — Polaris

1. 產業：塑料回收機械。
2. 目標：OEM 轉國際自有品牌。
3. 定位：簡單、穩定、高效。
4. Hero：機台、應用和品牌主張。
5. 概念：長期品牌進化。
6. 色彩：延伸機台和 VI。
7. 字體：國際 B2B。
8. 構圖：產品和市場內容並重。
9. 素材：攝影、3D、展況影片。
10. 節奏：網站、型錄、影片、展覽一致。
11. 動態：機台運作和 3D 說明。
12. 技術表達：設備流程和完整方案。
13. 信任：真實全球市場資料。
14. CTA：詢價、代理、產品。
15. 手機：多國市場可用性。
16. 記憶點：品牌跨媒介一致。
17. 缺點：投入資源遠高於概念案。
18. 可學：素材可延伸提案和展覽。
19. 不可抄：其品牌數據與視覺。
20. 啟示：頁構所可出售網站＋延伸資產。

### 10.7 BSG 百象機械 — Polaris

1. 產業：齒輪箱、橡塑膠和能源設備。
2. 目標：國際品牌再生。
3. 定位：高性能、德系工藝、整合製造。
4. Hero：品牌和機台形象。
5. 概念：品牌白皮書先行。
6. 色彩：連動機台視覺配色。
7. 字體：國際工業。
8. 構圖：品牌系統一致。
9. 素材：攝影、Icons、型錄。
10. 節奏：多媒介接觸點。
11. 動態：設備與影片。
12. 技術內容：產品與應用。
13. 信任：標準、設備和製造資料。
14. CTA：官網和產業平台。
15. 手機：多語產品資訊。
16. 記憶點：機台色彩也是品牌資產。
17. 缺點：網站本身未必最前衛。
18. 可學：產品模組顏色變成全站 Signal。
19. 不可抄：一般國際藍。
20. 啟示：品牌需進入產品、文件和展覽。

### 10.8 GlobalTek 時碩 — Cadiis

1. 產業：精密加工、航太、車用、醫療。
2. 目標：呈現全球化和多領域高度。
3. 定位：做專、做精、做強。
4. Hero：無限循環 3D 動態。
5. 概念：全球連結和持續動能。
6. 色彩：科技藍。
7. 字體：大型企業感。
8. 構圖：三大應用領域分流。
9. 素材：3D 和產業內容。
10. 節奏：主張、應用、ESG、創辦人。
11. 動態：主視覺承擔品牌象徵。
12. 技術表達：產業分流。
13. 信任：上市櫃、多語、ESG。
14. CTA：領域和公司資訊。
15. 手機：官方案例有專門展示。
16. 記憶點：3D 無限循環。
17. 缺點：科技藍和循環符號可能流行化。
18. 可學：一個主視覺統整多業務。
19. 不可抄：藍色無限符號。
20. 啟示：鋒岳需要自己的座標校準符號。

### 10.9 大同鋁業 — Cadiis

1. 產業：鋁門窗。
2. 目標：把功能產品轉成安心、舒適價值。
3. 定位：工藝＋家庭信任。
4. Hero：真實質感影像。
5. 概念：光與風、家的呼吸。
6. 色彩：材料與空間。
7. 字體：製造和生活平衡。
8. 構圖：清晰分區。
9. 素材：產品、空間、實績。
10. 節奏：故事、產品、FAQ、流程。
11. 動態：視覺圖像。
12. 技術內容：專利、認證、功能。
13. 信任：歷史、實績、認證。
14. CTA：產品和諮詢。
15. 手機：RWD。
16. 記憶點：材料轉譯成生活感受。
17. 缺點：較偏 B2C 建材。
18. 可學：技術要翻譯成客戶結果。
19. 不可抄：家庭生活攝影。
20. 啟示：精度應翻譯成穩定導入和風險降低。

### 10.10 萊峰電機 — Choice

1. 產業：機電、能源顧問。
2. 目標：整理複雜服務。
3. 定位：完整工程專業。
4. Hero：大型工程圖片。
5. 概念：清楚、專業、穩定。
6. 色彩：工程企業感。
7. 字體：可讀性優先。
8. 構圖：服務分類明確。
9. 素材：大型工程照片。
10. 節奏：服務、實績、數據、招募。
11. 動態：非主要差異。
12. 技術表達：分類和數據。
13. 信任：工程面積和容量數據。
14. CTA：聯絡。
15. 手機：RWD。
16. 記憶點：真實工程量化。
17. 缺點：創意視覺未必一線。
18. 可學：證據比 Why Us 形容詞有效。
19. 不可抄：大型工程圖模板。
20. 啟示：缺真實數據會限制鋒岳信任。

### 10.11 台灣微現科技 — Apple Web

1. 產業：X 光和金屬檢測。
2. 目標：設備品牌網站。
3. 定位：工業檢測專業。
4. Hero：設備／檢測畫面。
5. 概念：直接展示產品。
6. 色彩：白、深藍、灰、橘。
7. 字體：標準企業。
8. 構圖：傳統但清晰。
9. 素材：真實設備。
10. 節奏：資訊導向。
11. 動態：有限。
12. 技術表達：設備分類。
13. 信任：真實產品照片。
14. CTA：快速聯絡。
15. 手機：官方案例有展示。
16. 記憶點：不強但可信。
17. 缺點：容易模板化。
18. 可學：鋒岳的 IA 可高於此基準。
19. 不可抄：Banner＋產品清單。
20. 啟示：鋒岳資訊較好，輸在真實性。

### 10.12 鼎盛精密 — JDDT

1. 產業：沖壓、端子、連接器。
2. 目標：公司和產品展示。
3. 定位：製程專業和成本改善。
4. Hero：標準工業網站。
5. 概念：資訊型。
6. 色彩：傳統企業。
7. 字體：功能優先。
8. 構圖：標準 RWD。
9. 素材：企業和產品。
10. 節奏：產品、公司、詢價。
11. 動態：有限。
12. 技術表達：製程和產品。
13. 信任：成立時間和背景。
14. CTA：快速詢價。
15. 手機：RWD。
16. 記憶點：有限。
17. 缺點：作品集創意價值低。
18. 可學：市場最低功能期待。
19. 不可抄：資訊直接堆疊。
20. 啟示：鋒岳已高於一般基準，但未達一線。

### 10.13 WebGene 夢幻香港／互動案例

1. 產業：城市行銷／活動。
2. 目標：吸引參與和分享。
3. 定位：即時、個人化、體驗。
4. Hero：活動場景本身。
5. 概念：使用者創作祝福。
6. 色彩：夜景。
7. 字體：服務體驗。
8. 構圖：互動中心。
9. 素材：投影和城市夜景。
10. 節奏：輸入、生成、即時呈現。
11. 動態：核心產品。
12. 技術表達：互動機制。
13. 信任：現場參與和獎項。
14. CTA：立即創作。
15. 手機：控制／輸入端。
16. 記憶點：使用者改變畫面。
17. 缺點：不是直接 B2B 範例。
18. 可學：一個互動概念勝過很多小動畫。
19. 不可抄：遊戲化和大型特效。
20. 啟示：鋒岳只需一個校準／組裝互動。

---

## 11. 橫向比較

| 面向 | 鋒岳目前 | 一般工業網站 | 中高階案例 | 判定 |
|---|---|---|---|---|
| 首屏衝擊 | 中低 | 低至中 | 高 | 落後 FENC、GlobalTek、Wisecure |
| 品牌辨識 | 中 | 低 | 高 | 優於模板站，低於 Block／Polaris |
| 原創概念 | 中低 | 低 | 高 | 文件有概念，畫面未完全落地 |
| 構圖 | 中 | 中低 | 高 | 優於一般量產站，低於 Macroblock／HII |
| 素材 | 低 | 中 | 高 | 最大差距 |
| 資訊層級 | 高 | 中 | 高 | 接近中階公司 |
| 頁面節奏 | 中低 | 中低 | 高 | 長頁面可預測 |
| 動態 | 低 | 低 | 中高 | 和一線差距明顯 |
| 技術內容 | 高 | 中 | 高 | 明顯優勢 |
| 商業說服 | 中 | 中 | 高 | 缺證據 |
| CTA | 中高 | 中 | 高 | RFQ 做得好 |
| 手機 | 高可用／中設計 | 中 | 高 | 功能高，Art Direction 中 |
| 作品集價值 | 中 | 低 | 高 | 需要公開 Case Study |

做得比較好：

- 優於多數傳統工業模板站的清楚度、雙語、SEO、效能與 RFQ。
- 比一般作品更誠實地呈現適合／不適合和準備資料。
- 技術 QA 和文件是少見優勢。

接近：

- 接近 Choice 萊峰電機這類清楚、專業、實用的中階企業網站；但缺真實照片和實績。

落後：

- FENC 的概念轉譯和 3D。
- Wisecure 的專屬動態符號。
- HII 的品牌本質和網格一致性。
- GlobalTek 的素材和代表畫面。
- Polaris 的跨媒介品牌資產。

差距來源估算：

- 素材 40%。
- Art Direction 25%。
- 真實資料 15%。
- 頁面節奏 10%。
- 動態 5%。
- 細節實作 5%。

---

## 12. 從研究得到的具體改善機會

1. 把定位、校準、檢測、組裝轉成品牌動作。
2. 讓座標、公差和基準點進入構圖與互動，而非背景裝飾。
3. 一個強概念取代十個小裝飾。
4. Hero 素材先行；素材未達標時不要宣稱 Hero 完成。
5. 真實證據優先於 Why Us 形容詞。
6. 技術內容要做 System Map 和 Decision Tool。
7. 產品要在完整系統中被理解。
8. 網站資產需延伸到 PDF、提案、展覽和社群。
9. 手機版需保留概念。
10. Concept Case 的價值在設計決策和 QA，不在假品牌績效。

---

## 13. 鋒岳當初可能委託你的購買理由

### 顯性需求

- 重做企業形象網站。
- 整理產品和方案。
- 中英文。
- 手機版。
- SEO。
- 詢價流程。
- 效能與維護。

### 隱性需求與決策壓力

- 公司實力不能被舊網站低估。
- 海外買主不能因官網降低信任。
- 業務需要可直接寄給客戶的工具。
- 複雜工程需讓非工程採購看懂。
- 決策者需向老闆證明改版費值得。
- 擔心個人接案者消失、品質不穩或無售後。
- 擔心設計公司只會漂亮、不懂產業。
- 擔心網站上線後仍沒有詢問。
- 預算必須能對應具體交付物。

### 合理購買理由

1. 你能把製程問題轉成資訊架構。
2. 你不只排版，也處理文案、SEO、追蹤和轉換。
3. 你能建立完整雙語。
4. 純代碼能提供效能、穩定和較低不必要維護。
5. 你能建立適合／不適合條件，提高詢問品質。
6. 你能建立 RFQ。
7. 你有正式 QA 和交付紀錄。
8. 比大型公司更直接靈活。
9. 比低價接案者更完整。
10. 能建立可延伸的品牌資產。

---

## 14. 購買理由驗證表

| 購買理由 | 客戶期待 | 目前網站證據 | 強度 | 缺口 | 改善方式 | 優先 |
|---|---|---|---:|---|---|---:|
| 理解工業產業 | 不是通用文案 | 適合／不適合、規格、流程 | 中高 | 無真實訪談／案例 | 公開研究和決策過程 | A |
| 整理複雜內容 | 快速找到方案 | IA、角色路徑、詳細頁 | 高 | 詳細頁太長 | System Map＋Sticky Index | A |
| 品牌策略 | 不像普通同業 | 色彩、工程圖概念 | 中 | 概念未充分可見 | Precision Datum System | S |
| 視覺設計 | 高價畫面 | 排版一致 | 中低 | 素材和 Hero 弱 | 三個代表畫面 | S |
| 技術能力 | 快、穩、可維護 | Astro、測試、效能 | 高 | 客戶看不到文件 | Case Study 展示 QA | A |
| 雙語 | 國際買主可用 | 完整 zh/en | 高 | 英文需專業校閱 | 工業英文 Review | B |
| SEO | 可搜尋和分享 | Meta、Schema、hreflang | 高 | Demo noindex 無實際排名 | 展示 Checklist，不承諾排名 | B |
| 提高詢價品質 | 收集有效資料 | RFQ 和 intent | 高 | 初次表單太長 | 快速評估＋完整 RFQ | A |
| 手機品質 | 手機不是縮小版 | 無溢位和測試 | 中高 | 缺手機構圖 | Mobile Art Direction | A |
| 值得高價 | 明顯不同於低價 | 文件和流程 | 中 | 第一眼看不出差距 | Hero、素材、證據、案例頁 | S |

---

## 15. 目前成品可能造成的失望與疑慮

從鋒岳負責人角度：

1. 提案可能承諾品牌升級，畫面卻仍保守。
2. 可能質問為何沒有設備、工廠或工程現場。
3. 首頁內容多，但沒有一個記得住的品牌畫面。
4. 文案專業卻沒有真實數據時仍像模擬資料。
5. 多個區塊排列相似，幾天後容易覺得普通。
6. 詳細頁大量文字，業務未必主動使用。
7. 完整 RFQ 對早期客戶負擔大。
8. 系統字體跨裝置不一致。
9. 部分畫面可由成熟模板完成，難證明費用。
10. 頁構所的研究、策略與 QA 都藏在專案文件中。

從未來網站客戶角度：

- 能看到你會做完整網站。
- 能看到工程和架構能力。
- 但不一定能看到你具備高階 Art Direction 和影像統籌。
- 若價格 10–15 萬，會與有真實攝影、3D 和品牌案例的公司比較。

---

## 16. 如何提高服務價值

### 基本應交付

RWD、雙語、SEO 基礎、表單、效能、基本無障礙、部署與文件。

### 高品質服務

商業目標、使用者旅程、IA、內容重組、Design System、素材規格、轉換事件、QA、SEO Matrix、維護方式。

### 超額價值

- 專屬品牌視覺母題。
- SVG／Motion 資產。
- Datasheet 模板。
- 提案／展覽／社群可沿用系統。
- RFQ 準備清單。
- Case Study。
- 前後差異和決策紀錄。

### 應另行報價

攝影、3D、影片、完整 VI、專業英文、SEO 持續內容、CRM、多語 CMS、真實案例採訪、展覽頁和廣告 Landing Page。

---

## 17. 三套不同設計方向

### 方向一：Precision Datum System／製程座標系 — 推薦

核心印象：精密、可校準、可驗證、工程感但不冰冷。  
概念：Datum 基準點、機械座標、公差帶、視覺定位框、模組組裝軸。  
色彩：暖白、深墨、鋼灰，銅橘只作基準點和 CTA。  
構圖：不對稱 12 欄、跨 Container、座標線串接區塊。  
素材：真實／CGI 產品置於座標系。  
動態：校準線、鎖定框、模組沿軸接合。  
手機：保留 4:5 局部視覺和單一 Datum 軸。  
優點：可延續現有基礎、有專屬性、效能可控、商業與作品集平衡。  
風險：線條過多會像普通科技 UI；需要高品質產品素材。  
難度：中高。作品集潛力：高。商業適配：高。

### 方向二：Assembly Stage／模組組裝劇場

核心印象：系統整合、模組化、動態組裝。  
概念：三產品逐步組成完整工作站。  
色彩：深墨、金屬銀、銅橘。  
構圖：滿版產品、深淺切換、大幅裁切。  
動態：Scroll 組裝和 Exploded View。  
優點：記憶度極高。  
風險：3D 成本高；假產品做不好會廉價；手機和效能難度高。  
難度：高。素材需求：非常高。商業適配：中高。

### 方向三：Industrial Evidence Editorial／現場證據編輯式

核心印象：真實、穩定、有經驗、值得採購。  
概念：工廠、設備、工程師、文件、測試和案例證據。  
構圖：大型真實攝影、Editorial Typography、數據和 Case Evidence。  
動態：少量。  
優點：最具商業信任，維護容易。  
風險：概念案沒有真實素材；AI 假工廠會破壞誠信。  
難度：中。素材需求：必須真實。商業適配：最高，但目前無法完整執行。

---

## 18. 最終推薦方向

採用：

> **Precision Datum System／製程座標系**

吸收 Evidence Editorial 的證據導向，但不假造資料。

選擇理由：

1. 可保留現有 Astro 和工程圖基礎。
2. 能把定位、檢測、組裝直接轉成品牌語言。
3. 比普通藍色科技、網格、粒子更具產業關聯。
4. SVG、CSS 和少量 JS 即可完成。
5. 能延伸 Datasheet、簡報、社群和提案。
6. 沒有真實攝影時仍可用高品質 CGI＋工程圖完成。
7. 能同時證明策略、視覺和工程能力。

---

## 19. 完整設計系統

### 色彩

| Token | 建議值 | 用途 |
|---|---|---|
| `--color-ink-950` | `#0B1218` | Hero 局部、Footer、深底 |
| `--color-ink-800` | `#1B2730` | 次深色 |
| `--color-paper-50` | `#F7F4ED` | 主背景 |
| `--color-paper-100` | `#EEE9DF` | 次背景 |
| `--color-steel-500` | `#87939B` | 材料／次資訊 |
| `--color-steel-200` | `#CDD3D5` | 線、邊界 |
| `--color-copper-600` | `#B84E1D` | 文字、CTA |
| `--color-copper-500` | `#D5662B` | 圖形基準點 |
| `--color-signal-green` | `#34745A` | 成功／可導入 |
| `--color-error` | `#B4352B` | 錯誤 |
| `--color-focus` | `#1769AA` | Focus |

比例：Paper 55%、Ink 25%、Steel 12%、Copper 6%、功能色 2%。

### 字體

建議自託管合法開源 WOFF2：

- 中文：Noto Sans TC。
- 英文 Display：Space Grotesk。
- 技術數字：IBM Plex Mono。

只載入需要字重，`font-display: swap`，記錄版本、來源、授權。

### 字級

| 層級 | Desktop | Mobile |
|---|---|---|
| Display | `clamp(3.75rem,6vw,6.75rem)` | `clamp(2.65rem,12vw,4rem)` |
| H1 | `clamp(3rem,4.8vw,5rem)` | `2.5–3.25rem` |
| H2 | `clamp(2.25rem,3.5vw,3.75rem)` | `2–2.5rem` |
| H3 | `1.5–2rem` | `1.375–1.625rem` |
| Body L | `1.125rem` | `1.0625rem` |
| Body | `1rem` | `1rem` |
| Technical | `0.75rem` | `0.75rem` |

中文行高 1.75；英文 1.6；標題字距 -0.03em 至 -0.015em。

### Layout

- Wide 1440px。
- Content 1280px。
- Reading 760px。
- Desktop 12 columns、Tablet 8、Mobile 4。
- Gutter：Desktop 24–32px、Tablet 20–24px、Mobile 16px。
- Section：Major 120–176px、Standard 88–120px、Compact 56–72px。

### 元件規則

- Radius 2／6／12px，禁止所有東西同一圓角。
- Card 只用於真正可點擊、比較或分組內容。
- Shadow 只用於浮層和 Hover。
- Primary Button：Copper solid。
- Secondary：Ink outline。
- Tertiary：文字＋軸線箭頭。
- Focus：2px Focus Blue＋3px offset。
- Badge 只用資料狀態。
- 數據用單位、範圍、對齊線和註解呈現。

### 圖片

- Hero：16:10 Desktop、4:5 Mobile。
- Product：4:3 或 1:1，統一鏡位。
- Industry：3:2。
- 技術細節：16:9／2:1。
- 每張設定 Object Position。
- CGI 不生成文字。
- 不使用廉價科技藍濾鏡。

### Motion

- Micro 160ms。
- UI 260ms。
- Section 480ms。
- Assembly 700–1000ms。
- 優先 transform／opacity。
- 禁止每區 Fade Up、粒子、鼠標光圈、無限旋轉、大量 Parallax、Scroll Hijack。

---

## 20. 新網站資訊架構

1. Home。
2. Solutions。
3. Products。
4. Industries。
5. Engineering Method。
6. Resources：Insights、Datasheets、RFQ Checklist。
7. Concept Scenario／Applications。
8. Contact／Project Assessment。
9. Privacy。

概念案降低虛構 About 的權重；真實客戶版本再加入 Team、Factory、Certifications、Cases。

---

## 21. 首頁與內頁新規劃

首頁：

1. Hero：問題和價值。
2. Process Scan：常見製程問題。
3. System Map：能力如何介入。
4. Solutions Matrix：問題到方案。
5. Product Assembly：三產品形成系統。
6. Concept Scenario：Input→Decision→Output。
7. Industry Windows。
8. Engineering Evidence。
9. Project Process。
10. RFQ Preparation。
11. Final CTA。

內頁：

- Solution = Decision Page。
- Product = Selection Page。
- Industry = Problem Context Page。
- Method = Trust Page。
- Resource = Education／SEO Page。
- Contact = Progressive Qualification Page。

---

## 22. 文字版 Wireframe

### Header

12 欄；Logo 1–3、導覽 5–9、語系與 CTA 10–12。下緣 1px Datum Line；Hover 顯示短橘色基準線。手機保留 Logo、語言簡碼、Menu，CTA 放 Drawer 底部。

### Hero

高度 `min(900px,92svh)`，最低 720px。文案 1–6 欄、最大 680px；視覺 6–13 欄，跨出 Container 80–140px。前景產品模組，中景定位框，背景產線節點。下方流程帶跨全寬。手機順序：文案、CTA、4:5 主視覺、流程帶。

### System Map

左 4 欄能力列表，右 8 欄同一張系統圖。選取能力只改 Highlight。高度 680–760px。手機 Accordion。

### Solutions Matrix

左側製程問題，右側方案、資料需求、產品。無陰影卡片；每列可點擊。手機為三層列表。

### Product Assembly

深色整區；三產品沿 X 軸排列，中央完整工作站輪廓。選擇產品亮起。手機橫向 Snap，不做重型 Scroll Pin。

### Industry Windows

2×2 大圖，不同裁切；文字不置中。Hover 顯示常見站點、挑戰、推薦方案。手機一張一屏。

### Evidence

左大標，右四份文件樣張疊放。展示方法，不是假認證。

### Process

橫向五階段，每階段 Input／Decision／Output。手機垂直但保留同一 Datum 軸。

### Contact

先三題快速評估，再顯示技術建議、完整 RFQ、下載清單。Desktop 左側 Sticky；手機不使用雙欄。

---

## 23. 鋒岳專屬品牌視覺資產

1. **Datum Origin Mark**：十字基準＋橘色原點；用於 Logo、Hero、Focus。SVG/CSS，低成本。
2. **Tolerance Band**：兩平行線和透明區間；用於適合範圍、規格、流程。CSS/SVG。
3. **Vision Lock Frame**：四角定位框和特徵點；用於圖片、產業場景和 Hover。
4. **Assembly Spine**：連接模組的主軸；用於產品、流程和頁面轉場。
5. **Process Stamp**：需求確認、方案評估、測試完成等狀態章；不可模仿正式認證。
6. **Module Cutaway Window**：切窗揭示設備局部；用於產品 Hero、Datasheet，CSS clip-path／SVG mask。

這些元素可延伸名片、簡報、提案、社群、型錄和展覽。

---

## 24. 分階段改善清單

### 第一階段：方向和核心問題

- 統一名稱。
- 定案 Precision Datum。
- 重做 Hero。
- 定義三個代表畫面。
- 定義素材清單。
- 重寫首頁敘事。
- 重定位 Concept Case。

### 第二階段：高品質設計

- 字體和 Grid。
- Solutions Matrix。
- Product Assembly。
- Industry Windows。
- Evidence Ledger。
- Solution／Product Detail。
- Mobile Wireframe。
- 新素材。

### 第三階段：精緻和作品集

- Motion。
- Hover／Focus。
- 跨瀏覽器。
- Screen Reader。
- Lighthouse。
- 圖片最佳化。
- Public Case Study。
- Before／After。
- Codex Review。

---

## 25. Claude Code 完整任務書

完整獨立任務書見：

`forgeon_claude_code_redesign_tasks.md`

核心規則：

- 不建立空白專案。
- 保留 Astro、資料、路由、SEO、RFQ、測試和 Demo Mode。
- 先建立 Baseline Commit。
- 先做 Hero Design Spike，再改全站。
- 付費生成前等待核准。
- 每階段提供桌機／手機截圖、測試和 Commit。
- 不以動畫掩蓋構圖。
- 禁止藍紫漸層、粒子、六角形和大量卡片。

---

## 26. Claude Code 任務拆分

| ID | 目的 |
|---|---|
| CC-00 | 基準、乾淨安裝、名稱統一 |
| CC-01 | Precision Datum Design System |
| CC-02 | Header＋Hero Design Spike |
| CC-03 | 首頁核心敘事和代表畫面 |
| CC-04 | Solution／Product 詳細頁 |
| CC-05 | Industries／Method／Resources |
| CC-06 | 漸進式 RFQ |
| CC-07 | Mobile Art Direction |
| CC-08 | Motion 和互動 |
| CC-09 | QA、SEO、效能、Accessibility |
| CC-10 | Public Case Study／Codex Handoff |

---

## 27. 客觀驗收清單

### 必須通過

- [ ] 名稱統一。
- [ ] 5 秒內知道品牌、服務和下一步。
- [ ] 有可命名的鋒岳專屬視覺語言。
- [ ] 至少三個可截圖記住的畫面。
- [ ] 首頁不再有三個以上連續 Card Grid。
- [ ] Hero 不使用 Placeholder 線稿。
- [ ] 產品有高品質媒體。
- [ ] Solution Detail 有 System Map 和 Decision Summary。
- [ ] 手機獨立重組。
- [ ] CTA 有低摩擦和完整 RFQ 兩層。
- [ ] 不假造資料。
- [ ] Clean install、check、build 成功。
- [ ] Links、H1、hreflang 通過。
- [ ] axe Critical／Serious 0。
- [ ] Lighthouse Performance 90+、Accessibility 95+、Best Practices 95+。
- [ ] Reduced Motion。
- [ ] 圖片有尺寸、srcset、WebP／AVIF。
- [ ] 字體實際載入和授權記錄。
- [ ] Public Case Study 不需口頭補充。

### 建議通過

- [ ] Firefox、Edge、Safari／WebKit。
- [ ] NVDA 或 VoiceOver。
- [ ] 工業英文校閱。
- [ ] 每產業獨立素材。
- [ ] Datasheet 同步新系統。
- [ ] Analytics 規格和實際一致。

### 作品集級加分

- [ ] 15–30 秒 Motion Reel。
- [ ] Before／After。
- [ ] IA／Wireframe 展示。
- [ ] 品牌 SVG 資產包。
- [ ] 產品 360。
- [ ] 真實訪談回饋。
- [ ] 網站健檢下載資產。

---

## 28. 最終明確結論

目前應該：

> **大幅重構，而不是整體重新建站。**

技術、資料、雙語、SEO、表單、測試和效能值得保留；品牌創意、素材、構圖、節奏、詳細頁視覺化和作品集呈現需大幅重做。合理策略是保留約 65–75% 的工程底座，重做約 60–70% 的前台構圖和核心視覺。

重構目標不是模仿 Block Studio，而是先達到中階設計公司代表作水準，並在工業內容結構、效能、無障礙與 RFQ 流程上形成頁構所自己的優勢。

---

## 主要官方資料來源

- Block Studio — HIIARCHITECTS  
  https://blockstudio.tw/project/hiiarchitects-website
- Block Studio — Wisecure  
  https://blockstudio.tw/project/wisecure-website/
- Block Studio — FENC  
  https://blockstudio.tw/project/fenc
- WDD — KAFO  
  https://www.wddgroup.com/webdesign/kafo/
- WDD — Macroblock  
  https://www.wddgroup.com/webdesign/macroblock/
- Polaris — POLYSTAR  
  https://www.polaris.net.tw/tw/collection/detail/Polystar/P2016121300010.html
- Polaris — BSG  
  https://www.polaris.net.tw/tw/collection/detail/Bsg.html
- Cadiis — GlobalTek  
  https://www.cadiis.com.tw/portfolio/globaltek
- Cadiis — 大同鋁業  
  https://www.cadiis.com.tw/portfolio/ta-tung
- Choice — 萊峰電機  
  https://www.choice-design.com.tw/works/web-design/0/469
- Apple Web — 台灣微現科技  
  https://www.i-web.com.tw/seo-834.html
- JDDT — 鼎盛精密  
  https://www.jddt.tw/works/detail/202
- WebGene — 夢幻香港  
  https://www.webgene.com.tw/lg/

案例頁的目標和執行項目主要來自設計公司官方自述；未取得客戶分析資料的項目不視為獨立驗證的商業成效。
