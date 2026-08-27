# 05 · Signature Image Production Sprint（Phase 5A-R2）

記錄日期：2026-08-24
基礎資料：`04-visual-reference-verification.md`、Phase 5A-R Visual Direction Studies（已 REJECT/REVISE/CONDITIONAL PASS）

---

## 0. CAPABILITY GATE — 必須先誠實揭露

依任務書 §16 明確要求：如果目前環境**沒有**已授權的圖像生成/編輯能力，
不得假裝已生成圖像，必須改為產出 Art Direction Sheet 並停下等待人類製作。

**本環境檢查結果**：

- 已檢查 `higgsfield` CLI（頁構所可用的圖像生成技能之一）：`command not found`，
  未安裝、未授權。
- 未發現任何其他已連接的圖像生成或圖像編輯 MCP 工具。
- 上一輪（Phase 5A-R）使用的方法是 `sharp`（Node 圖片處理函式庫）對既有素材
  做 crop／色階調整／暈影合成——這正是任務書 §0 與 §14 明確指出**已經觸頂
  的方法**（"cropping / darkening / grading ... cannot solve this ceiling"），
  不能重複使用同一方法並宣稱是新的 Art Direction。

**結論：本 Sprint 不產出任何「Master Candidate」圖像檔案。**

以下依 R2.1–R2.4 完成所有可以誠實完成的部分（素材盤點、產品識別規格書、
Art Direction Sheet、生成/編輯指令草稿、負向約束、預期輸出描述、Responsive
Crop 需求），交由人類使用實際圖像生成/攝影製作工具（例如 Higgsfield 帳號
授權後、或委託真實攝影/3D 算圖）產出後，再回來完成 R2.4 的 Quality Gate
評分與 Comparison Board。

**Blocking dependency**：需要人類完成以下任一項，Sprint 才能真正產出
Master Candidate：
1. 於本機或帳號授權 Higgsfield（或其他圖像生成工具）存取權限，或
2. 提供委外攝影/3D 算圖產出的實際檔案，交回本專案 `docs/design-research/forgeon/evidence/master-imaging/` 供評分。

---

## R2.1 — Source Asset Audit

檢視 `src/assets/images/` 下全部 13 張現有素材（`.png`，約 1447–1536px 寬，
無 alpha、srgb、非漸進式編碼，元資料顯示無 EXIF/生成器標記可供進一步溯源）。

| 檔案 | 主題 | 解析度 | 分級 | 理由 |
|---|---|---|---|---|
| `solutions/precision-motion-handling-final-master.png` | 線性致動器下探至機械底座 | 1536×1024 | **B** | 機構合理、材質可讀、光線中性偏文件感；可作構圖/材質參考，但需要重新打光才能當 Hero campaign 素材，非直接可用來源 |
| `solutions/machine-vision-inspection-final-master.png` | 鏡頭＋環形光源總成特寫 | 1447×1087 | **B** | 目前 Sprint 中唯一具備「光學儀器」主體潛力的素材；環形光源本身造型精良、機構可信，但周邊環境雜訊多、原始打光平淡（無邊緣光/控制暗部），需要重新算圖或重新棚拍才能達到 Image 02 標準 |
| `home/forgeon-automation-hero-final-master.png` | 工廠內部全景 + 人員操作 | 1448×1086 | **C** | 紀實感強、可信度高，適合 Industrial Context 類用途；不具備 Hero campaign 所需的「前景/主體/縱深/負空間」構圖意圖，主體太小且分散 |
| `industries/metal-machining-final-master.png` | CNC 內艙 + 機械手臂 + 量測站 | 1536×1024 | **C** | 已用於 Study C，機構複雜但可信；作為 Industrial Context 素材足夠（Study C 維持 CONDITIONAL PASS 不需重做），不適合作 Hero 或 VISION-X2 素材 |
| `solutions/vision-guided-assembly-final-master.png` | 機械手臂 + 視覺鏡頭 + 齒輪治具 | 1536×1024 | **B** | 鏡頭+環形光組合与 machine-vision-inspection 是同一類型元件但視角不同；可作為驗證 VISION-X2 產品幾何一致性的第二參考角度，不可直接使用（環境雜訊、無主體分離） |
| `products/modular-assembly-workstation-final-master.png` | 完整組裝站（含機械手臂、治具、控制櫃） | 1536×1024 | **C** | FLEXCELL-M 相關，非本輪 VISION-X2/Hero 範圍內，僅供產業真實感佐證 |
| `solutions/automation-integration-final-master.png` | 機械手臂整合站 + 控制箱 | 1536×1024 | **C** | 同上，工業真實感佐證用，非本輪主體來源 |
| `industries/semiconductor-electronics-final-master.png` | 桌上型點膠/貼片機構 + 料盤 | 1536×1024 | **C** | 精密感強，但主體是電子貼片而非光學辨識，與 VISION-X2 身分不直接對應 |
| `industries/automotive-components-final-master.png` | （汽車零組件產線情境） | 1536×1024 | **C** | 產業真實感佐證用，非本輪主體 |
| `industries/packaging-logistics-final-master.png` | （包裝物流情境） | 1536×1024 | **D** | 與精密光學/運動控制主題無關，本輪不適用 |
| `services/control-engineering-final-master.png` | （控制工程情境） | 1535×1024 | **C** | 產業真實感佐證用，非本輪主體 |
| `solutions/existing-line-retrofit-final-master.png` | （產線改造情境） | 1536×1024 | **D** | 與本輪三張 Master Image 主題無直接關聯 |
| `solutions/field-commissioning-collaboration-final-master.png` | （現場調試協作情境） | 1536×1024 | **D** | 與本輪三張 Master Image 主題無直接關聯 |

**盤點結論**：

- 沒有任何一張素材可以直接歸類為 **A（可直接作為量產來源）**——這正是
  Gate 診斷「documentation photography, not campaign photography」的具體
  證據：所有素材都是合格的紀實/型錄攝影，但沒有一張具備刻意保留負空間、
  單一光學主體、控制式打光的 campaign 構圖意圖。
- `machine-vision-inspection` 與 `vision-guided-assembly` 兩張都拍到了
  同一類「鏡頭＋環形光源」總成，可作為 **VISION-X2 Product Identity Sheet**
  的機構參考基礎（見下），但兩張的環形光源尺寸比例、殼體顏色、線材走向
  略有差異——這也印證了任務書 §7 的擔憂：目前素材庫並沒有「同一個產品」
  的一致性視角，需要在新產出時明確鎖定單一產品識別規格，而非直接混用
  這兩張的機構細節。
- `precision-motion-handling` 是 Hero 構圖參考的最佳起點（B 級），因為
  其機構張力（致動器下探動作）與畫面縱深已經存在，缺的是打光重製與
  構圖裁切，而非整個場景重拍。

---

## VISION-X2 Product Identity Sheet

在產出任何新 VISION-X2 影像前，先鎖定以下識別規格，確保 Image 02（Macro）
與 Image 03（Whole Product）呈現的是「同一個物理產品」，而非兩台無關的
AI 生成相機。規格基於 `src/content/products/vision-x2.md` 既有 Canonical
Project Truth（辨識類型、光源選配、通訊介面）與素材庫中兩張最相關來源
（`machine-vision-inspection`、`vision-guided-assembly`）的機構共同點推導：

| 項目 | 規格定義 |
|---|---|
| **主體感測器/相機本體** | 深灰／近黑陽極處理鋁合金機身，方形截面，頂部與側面各一組線材出口（電源＋資料各一，非單一混合線） |
| **光學鏡頭總成** | 圓柱形鏡頭鏡筒，鏡身可見至少一圈手動對焦滾花環，鏡頭前緣露出藍紫色鍍膜反光（真實鏡頭鍍膜特徵，非發光效果） |
| **環形光源架構** | 扁平圓環，內緣為均勻白色/暖白 LED 發光面，外緣黑色塑料或陽極鋁殼，中心開孔直徑略大於鏡頭外徑，與鏡頭同軸安裝、非偏心 |
| **安裝支架幾何** | L 型或直角轉接鋁件，透過至少 2 顆內六角螺絲固定於鋁擠型架或機械手臂末端法蘭，支架表面有陽極處理痕跡與 CNC 加工圓角 |
| **線材／接頭邏輯** | 相機本體後方或側面接出一條資料線（建議 M12 或類似工業圓形接頭，非消費性 USB 外觀）與一條環形光源電源線，兩者分開走線，不共用同一出口 |
| **調整機構** | 支架與相機本體之間至少保留一個可見的角度微調滑槽或旋鈕，暗示現場校正能力（呼應 `vision-x2.md` 光源依材質選配的產品事實） |
| **材質色票** | 主體：石墨黑陽極鋁；細節：不鏽鋼螺絲（银色）；環形光源外殼：與主體同色或略深；**不得**出現藍色/彩色塗裝件——品牌 accent 色不得强行套用於物理產品上（依任務書 §14） |
| **主要比例** | 相機本體長邊約為環形光源直徑的 1.1–1.3 倍（避免頭重腳輕或比例失真） |
| **相對工件方向** | 鏡頭光軸垂直或接近垂直於下方工件平面，暗示由上往下的定位/檢測邏輯，與 `vision-x2.md` 「工件定位」「瑕疵檢測」的應用場景一致 |

任何後續生成/算圖/棚拍，都必須先比對此表，確保 Macro 與 Whole Product
兩張圖看起來是同一顆鏡頭、同一個環形光源、同一種支架語言。

---

## R2.2 — Image Art Direction Sheets

以下三份 Sheet 是本 Sprint 的核心交付——可直接交給人類攝影師/3D 算圖師，
或在取得圖像生成工具授權後作為 prompt 基礎。

### IMAGE 01 — HERO MASTER

**Intent**：品牌第一印象，Homepage 首屏 campaign image，非型錄照片。

**構圖基礎來源**：`precision-motion-handling-final-master.png`（B 級來源，
機構張力與縱深已存在，需要重新打光與裁切意圖）。

**Production method（規劃中，尚未執行）**：優先順序為
(1) 委託真實棚拍/現場攝影重拍同一類線性致動器機構，或
(2) 以現有來源為構圖參考，透過 3D 算圖重建同一機構並重新打光，或
(3) 若兩者皆不可行，以現有來源做**最小限度**的重新棚拍等級後製（非
Phase 5A-R 那種「crop 更深＋加暈影」的疊代）。**不會**單純重複上一輪
的 sharp 色階/暈影方法並宣稱是新產出。

**Composition brief**：
- 前景：部分虛焦的鋁擠型架结构邊緣，建立縱深層次
- 主體：線性致動器下探向機械底座的瞬間動作，置於畫面左三分之一至中央，
  避免正中央對稱
- 右側／右上保留至少 40% 畫面寬度的低資訊量負空間（暗背景或虛焦背景），
  供 Homepage H1 文案疊加，但這個負空間本身也必須是「刻意的攝影構圖」，
  不是後製加黑
- 光線方向：主光源從左上方以中等硬度打在致動器金屬面，製造清楚的
  受光面/背光面對比；背景以暗部細節保留為原則（暗部不等於全黑，需保留
  可辨識的機構輪廓）

**Lighting model**：邊緣分離光 + 控制式金屬高光反射，暗部必須保留形體
資訊（明確對應任務書 §10「black must reveal form, not erase form」的
教訓——上一輪 Study A 的暈影處理讓部分機構直接消失於黑色，此為需要
避免重蹈的具體錯誤）。

**Material priorities**：鋁擠型材質（需可讀出髮絲紋理）、陽極黑金屬
致動器外殼、不鏽鋼螺絲群、至少一段外露電纜的霧面黑塑料質感。

**Forbidden**：藍色霓虹、發光網格、浮動數據、裝飾性 HUD、假座標、
戲劇性煙霧、科幻粒子、電影感火花、假全息投影。

**Negative constraints for generation/edit prompt（若使用生成工具）**：
`no neon glow, no floating UI, no holographic overlay, no sci-fi particles,
no lens flare abuse, no duplicated mechanical parts, no impossible cable
routing, no visible brand logo, no text, no watermark`

**Responsive crop safety**：
- Desktop 16:9：主體致動器維持在畫面水平 30–45% 處，右側負空間比例維持
- Tablet 4:3：需驗證主體不被裁切出畫面上緣（致動器頂部連接處常見裁切
  風險點）
- Mobile 4:5（直幅）：需驗證是否需要改為「致動器+底座」局部裁切而非
  全景，構圖來源檔案需保留足夠像素供直幅重新裁切，不可僅靠原始 16:9
  構圖硬轉

---

### IMAGE 02 — VISION-X2 MACRO / OPTICAL DETAIL

**Intent**：本 Sprint 最關鍵一張——建立「值得端詳的精密儀器」渴望感。
此圖需要證明 VISION-X2 能撐起 Precision Instrument Editorial 方向。

**構圖基礎來源**：`machine-vision-inspection-final-master.png` 的
鏡頭/環形光總成區域（B 級來源，機構元件本身造型優秀，但原始打光不足以
支撐 macro 級別的材質可信度，需要重新算圖或重新棚拍）。

**Production method（規劃中，尚未執行）**：同 Image 01 優先順序。特別
注意：Phase 5A-R Study B 被 REJECT 的根本原因是「用 sharp 對現有中景
素材做極端裁切＋加深色階」，導致鏡頭本體在暗部中細節流失、材質不可信。
本次不得重複同一手法，必須是真正的 macro 級別重新拍攝或算圖。

**Subject priority**：單一明確光學焦點——建議鎖定「鏡頭前緣鍍膜反光 +
環形光源內緣發光面交界處」作為視覺焦點，機身其餘部分可虛化或退為
次要資訊，但不可完全消失。

**Crop**：Macro／near-macro，不需要展示完整系統，讓觀者在一眼之內理解
「這是精密光學儀器」。

**Lighting model**：學習 Teenage Engineering 的「controlled darkness +
strong surface legibility」原則——邊緣光勾勒鏡筒滾花環輪廓、柔和主光
建立鏡片反光層次、暗部維持材質可讀性（黑色機身在黑色背景前仍需可分辨
邊界，不可完全融入背景）。

**Glass rendering**：鏡片必須呈現真實玻璃光學特性——多層鍍膜的淡紫/
淡綠反光、輕微色散、非平面完美反射；明確禁止：發光藍色鏡片、魔幻虹彩
效果、假科幻光學元件、完全平坦無反射的塑膠感鏡片、反光邏輯前後不一致。

**Depth of field**：可淺景深，但關鍵光學/機構幾何（鏡筒對焦環刻度、
環形光源內緣、至少一顆對焦環固定螺絲）必須維持可讀，不可虛化到失去
工程資訊。

**Branding**：圖片本身不需要放大版 FORGEON logo，識別度應該來自影像
本身的打光與構圖語言，而非品牌標記。

**Forbidden**：同 Image 01 的森林清單，額外禁止：黑色物體完全消失於
黑色背景（Study B 的具體失敗模式）。

**Responsive crop safety**：
- Desktop 16:9：焦點區域（鏡片/環形光交界）建議置於畫面右側 55–70%
  位置，左側保留可用於文案疊加的較暗負空間
- Tablet 4:3：需確認裁切後鏡片反光焦點不被邊界切斷
- Mobile 4:5：需要驗證是否需要更緊的裁切版本（僅鏡片+部分環形光），
  原始素材需保留足夠解析度支援更緊裁切而不明顯降質

---

### IMAGE 03 — VISION-X2 WHOLE PRODUCT / ASSEMBLY PORTRAIT

**Intent**：回答「VISION-X2 作為實體產品到底是什麼」，解決 Study B
「只看到裝在機構上的相機」的问题——這張必須讓觀者在數秒內理解主體
本體、光學總成、光源、支架、線材、與工件的關係。

**構圖基礎來源**：需要**新拍攝或新算圖**，現有素材（
`machine-vision-inspection`、`vision-guided-assembly`）均因環境雜訊
過多、非產品肖像式構圖，只能作為機構比例的參考，不可直接裁切使用。

**Production method（規劃中，尚未執行）**：同上，優先真實棚拍或
3D 算圖，需嚴格對照上方 Product Identity Sheet 確保與 Image 02 是
同一產品。

**Framing**：Product portrait 優先於 factory context——環境可以存在
但不可搶戲。建議中距離肖像式構圖：完整相機本體 + 環形光 + 支架 +
局部工件（作為比例與應用場景暗示），非完整產線環境。

**Background**：中性技術環境，建議石墨灰影棚背景或克制的工業背景
（例如虛化的鋁擠型架輪廓），避免使用純白電商去背風格，除非後續驗證
證明其效果明顯更優。

**Lighting model**：與 Image 02 同一打光家族——兩張圖必須看起來是
同一場攝影 campaign 的產物，光源方向、色溫、對比策略需一致。

**Forbidden**：同上清單。

**Responsive crop safety**：
- Desktop 16:9：完整產品置中偏左，右側保留說明文字/規格摘要空間
- Tablet 4:3：需確認裁切後仍可見「本體＋鏡頭＋環形光＋支架」四個
  識別元素中至少三個
- Mobile 4:5：可能需要改為更緊的直幅裁切（本體+鏡頭+環形光，支架
  可部分裁切），需在原始構圖階段預留這個裁切彈性，不要把四個識別
  元素排成無法直幅裁切的水平長條

---

## FORGEON Imaging Baseline v1

三張完成後應共同遵守的規則（供未來新增產品照片時延續使用，非完整
Design System，僅為 Imaging Baseline）：

| 維度 | 規則 |
|---|---|
| **Exposure（黑位）** | 暗部維持可辨識形體資訊，不可死黑；建議暗部最低維持約 5–8% 灰階資訊而非 0% |
| **Contrast** | 中高對比，金屬高光與陰影落差明顯，但不做 HDR 式過度銳化 |
| **Metallic highlights** | 銳利但不過曝——高光邊緣清楚，避免大面積死白反光 |
| **Glass rendering** | 多層次、多色相反光（呼應真實鍍膜），嚴禁單一飽和色發光鏡片 |
| **Background** | Hero／Whole Product 可保留低資訊量環境線索；Macro 可近乎純虛化，但暗部仍需形體資訊 |
| **Depth of field** | Macro（Image 02）可用淺景深製造焦點；Hero／Whole Product（Image 01／03）維持中等景深，確保機構關係可讀 |
| **Color temperature** | 中性偏冷（不刻意暖色調），呼應「儀器面板」而非「人像棚拍」的溫度感 |
| **Accent（品牌色是否出現在實體產品上）** | 不強制出現；若未來需要，僅能以「工業可信的功能性顏色」形式出現（例如狀態指示燈的既有綠/紅/黃），不得為了呼應網站 accent 而替產品上色 |
| **Crop logic** | 主體可貼近畫面邊緣製造張力，但關鍵識別特徵（鏡頭、環形光、致動器動作點）不可被邊界切斷 |
| **Negative space** | 必須是拍攝/算圖階段的構圖決策，非後製加黑或加暈影補救 |

---

## R2.3 — Master Image Production

**狀態：未執行。**

依 §0 揭露的能力缺口，本階段无法產出任何檔案。以上 R2.2 的三份 Art
Direction Sheet 即为本階段可交付的全部內容，供人類使用實際圖像生成/
攝影工具製作。

**Iteration rule 提醒（供實際製作時遵守）**：每張圖需要 Candidate →
Review → Refine → Master Candidate 的迭代流程，Image 02 應接受最嚴格
審查。不應一次生成三張互不相關的圖片後「矮子裡拔將軍」。

---

## R2.4 — Image Quality Gate + Comparison Board

**狀態：無法執行**——Quality Gate 與 Comparison Board 都需要對照真實
Master Candidate 圖檔評分，本輪沒有圖檔可評。

保留評分表格式，供 Master Candidate 產出後直接使用：

| 項目 | 配分 | Image 01 | Image 02 | Image 03 |
|---|---:|---|---|---|
| A. Art Direction | 20 | — | — | — |
| B. Photography / Rendering | 20 | — | — | — |
| C. Material Fidelity | 15 | — | — | — |
| D. Industrial Authenticity | 15 | — | — | — |
| E. Product Identity | 10 | — | — | — |
| F. Brand Distinctiveness | 10 | — | — | — |
| G. Website Fit | 5 | — | — | — |
| H. Artifact Risk | 5 | — | — | — |
| **Total** | **100** | — | — | — |

Fail-regardless-of-total 條件（供評分時對照）：Art Direction < 16、
Photography < 16、或 Industrial Authenticity < 12。

Comparison Board（Reference vs Rejected vs Master Candidate）待圖檔
產出後另行建立，格式沿用 Phase 5A-R 的「畫面優先、少文字」原則。

---

## Responsive Crop Proofs

同樣待圖檔產出後執行——R2.2 每張 Sheet 已預先寫入 Desktop 16:9 /
Tablet 4:3 / Mobile 4:5 的構圖安全邊界要求，供產出時直接對照，避免
產出後才發現主體無法安全裁切。

---

## Summary — What This Sprint Actually Delivered

1. 完整誠實揭露：本環境無圖像生成/編輯能力，未假裝生成任何 Master
   Candidate。
2. R2.1 Source Asset Audit：13 張現有素材全數分級（0 張 A、5 張 B、
   6 張 C、2 張 D），確認素材庫的天花板正是 Gate 診斷的「文件式攝影」
   問題。
3. VISION-X2 Product Identity Sheet：鎖定單一產品識別規格，避免未來
   產出的 Macro 與 Whole Product 圖看起來像兩台不相關的相機。
4. 三份完整 Image Art Direction Sheet（Hero／Macro／Whole Product），
   含構圖、打光模型、材質優先序、負向約束、Responsive Crop 安全邊界，
   可直接交給人類攝影師/算圖師或授權後的生成工具使用。
5. FORGEON Imaging Baseline v1：跨三張圖的共同攝影規則草案。
6. Quality Gate 評分表與 Comparison Board 格式已備妥，待圖檔到位即可
   使用，本輪不虛構分數。

**Blocking dependency（需要人類處理才能繼續）**：授權圖像生成工具，
或提供委外攝影/算圖產出的實際檔案。

依任務書 §25 STOP 條件，在此停止，等待 **HUMAN / CHATGPT SIGNATURE
IMAGE PRODUCTION GATE**。未重建 Homepage、未做 Mobile、未動 Astro/CSS/
Study C。
