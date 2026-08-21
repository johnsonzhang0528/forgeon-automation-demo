# 02 · Design Decision Ledger + Redesign Diagnosis

記錄日期：2026-08-21（2026-08-21 二次修正：見 `00-baseline.md` 開頭「方法論
事故」說明——第一版診斷部分依據錯誤 port 的截圖寫成，本文件已核對正確畫面
更新，修正處標註「〔已修正〕」）
依據：`00-baseline.md` 觀察 + `01-reference-lock.md` 方向決定
角色定位：Taste Redesign（Existing-site Surgeon）動工前的最後一份方向文件——
本文件完成後才允許修改 code。

---

## Design Decision Ledger

### KEEP（現有做得好，必須保留）

1. **文案語域**：Hero 與各 section 文案工程導向、具體、無空泛形容詞（例如
   「從工件、節拍與現場限制出發」），已符合任務書「更像工程/自動化公司、
   降低 AI 文案感」的目標，不需要重寫，只在後續個別段落做精修。
2. **真實產線攝影**：Hero、Capability、Industries、Process 區塊使用的實景
   攝影品質高、無明顯 AI 生成痕跡，符合 Secondary A（Snøhetta）「紀實攝影
   優先於插畫」的方向，是本站最大的既有資產，必須保留且加強呈現方式。
3. **雙語內容結構**：zh-tw / en 平行路由與內容對稱性良好，Hero 文案在兩種
   語言下語氣一致、專業度相當，不需要在本輪調整資訊架構。
4. **Demo Mode 揭露機制**：footer badge、eyebrow「虛構品牌概念展示」標註清楚，
   不在 UI/UX 視覺升級範圍內，保持原樣。
5. **技術中繼資料排版**（Hero 下方「需求輸入／評估範圍／交付輸出」區塊）：
   中英文層級關係一致，是全站少數已經具備「工程文件感」而非「行銷頁感」的
   區塊，做為後續其他區塊精修的內部參考基準。
6. **零依賴技術棧**：不引入 GSAP/Tailwind/React，符合任務書技術限制，本輪
   維持現狀。

### IMPROVE（方向正確，但工藝不夠）

1. **Section 骨架同質化**（P1，〔已修正〕範圍縮小）：Solutions（三卡）與
   Industries（四卡）是純粹的「標題 + 多欄卡片」重複骨架，沒有其他獨立
   視覺語意，是本項真正的處理對象。Products（不對稱大圖卡+雙欄）、
   Fit/not-fit（頂部色條區分適合/不適合）、Path（hover 陰影可點擊卡片）
   三者各自已有獨立於「重複卡片網格」的視覺語意，**不納入本項**——強行
   拉平會破壞它們原有的、有意義的設計決策（見下方執行紀錄）。依 Primary
   Reference（Terminal Industries）方向，Solutions／Industries 改為
   hairline-divider 列表骨架，與其餘三個保留原生設計的 section 交錯，
   達成「section 骨架彼此不同」的效果。
2. ~~產品卡片圖片處理~~〔已修正：誤判撤銷〕。第一版診斷誤以為
   `ProductCard` 用色塊/簡易圖形，這是基於錯誤 port 截圖的誤讀——正確畫面
   確認產品卡片（AXM-400／VISION-X2／FLEXCELL-M）本身就是高品質實景攝影，
   與其餘 section 一致，不存在此問題，故從 IMPROVE 清單移除。
3. **Lazy-load 深色 placeholder 觀感**（P2，見 baseline 方法論註記 1）：多個
   section 共用深色底作為圖片載入前 placeholder，快速滾動時可能造成短暫的
   視覺跳動感，需要在 Impeccable 階段檢查是否有更平滑的呈現方式。
4. **英文 CTA 按鈕換行**（P2，〔已修正〕未在正確畫面重現）：第一版診斷記錄
   375 寬度下換行，正確 port 覆核後在 1440/768 寬度下未觀察到換行；375
   寬度尚未在正確 port 下逐一覆核，留待 Responsive QA 階段確認是否仍是
   真實問題，暫降級為待驗證而非確定的 P2。
5. **色彩系統論述與實際渲染的落差**：如 baseline 已記載，`tokens.css` 內的
   `--color-copper-600` 變數名稱與其藍色數值不符，屬於技術債而非視覺問題，
   本輪不強制修正變數命名（超出 UI/UX 視覺升級範圍），但若在調整任何顏色相關
   CSS 時順手處理，不視為 scope creep。

### REMOVE（有 template 感／AI slop／層級或留白問題）

1. **暫無明確判定為「必須整個移除」的元件或區塊**。目前首頁沒有發現任務書
   明確警告的常見 AI slop 症狀（無意義 Bento Grid、Glassmorphism、Neon Glow、
   過度 Pill Button、無意義 floating cards、假 Dashboard mockup、藍紫科技
   漸層）。這一項會在 Hallmark Audit 階段（Phase E）重新覆核，若發現遺漏
   會回填本節。
2. 六個 Brand Primitive 元件（`DatumOrigin` 等）與 `ProcessRail.astro` 已經
   自然地從正式頁面移除（見 baseline），本輪不重新引入，維持 orphaned 狀態
   不變動——不屬於本輪 REMOVE 範圍的主動動作，只是確認不回收。

### ADD（僅在對資訊理解或品牌品質有明確幫助時新增）

1. 本輪**不新增**任何裝飾性元件、badge、icon 集合、假數據卡片。任務書
   §17 明確要求「避免因為設計看起來空，所以塞東西」，目前診斷未發現需要
   靠新增元素填補的資訊真空。IMPROVE 1 的骨架調整是移除既有的過度統一化
   （拿掉不必要的 `!important` 圓角/配色覆蓋，讓底層已存在的
   hairline-list 設計生效），不是新增元素，故不計入本節。

---

## Ranked Diagnosis（Taste 第一輪：只診斷，不動工）

### P0（破版／可用性／accessibility／responsive 問題）

**目前 baseline 巡覽未發現 P0 等級問題**——無破版、無明顯 overflow、無不可
點擊的 CTA、無色彩對比明顯不足的區塊（實際 axe/keyboard 驗證留待 Phase F
QA Gate 正式跑，本節僅為視覺巡覽層級的初步判斷，若正式 QA 發現 P0
會回填本節並優先處理）。

### P1（嚴重拉低品牌質感）

1. Section 骨架同質化，範圍限定 Solutions + Industries（〔已修正〕縮小範圍，
   見 IMPROVE 1）——對應 Design Decision Ledger IMPROVE 1。

### P2（Polish）

1. Lazy-load 深色 placeholder 的滾動觀感——對應 IMPROVE 3。
2. ~~英文 CTA 按鈕文案換行~~〔已覆核，結案非缺陷〕：375 寬度下 Hero 的兩個
   英文 CTA 按鈕確實換行成兩行。追查 `src/components/sections/Hero.astro`
   （約行 178-184）發現這是刻意的 `@media (max-width: 400px)` 降級規則
   （`flex: 1 1 100%; white-space: normal;`）——窄螢幕下按鈕主動撐滿寬度、
   允許換行，避免文字被壓縮到不可讀。中文文案短不會觸發換行，英文文案較長
   在撐滿寬度後仍可能換行成兩行，這是文案長度與既有響應式策略共同作用的
   自然結果，按鈕本身完整可讀、可點擊、置中對齊，無破版或不可用性問題。
   不列入本輪修改範圍，僅記錄於此供 Responsive QA 覆核時參考。

---

## 執行順序聲明

依任務書 §19-20 要求，Taste 第二輪執行將依 P0 → P1 → P2 順序處理，每完成一個
重要視覺區塊會檢查 desktop + mobile 兩種尺寸，不會一次性改完整站才第一次看畫面。
本輪 P0 為空，故執行順序為：P1-1（Solutions/Industries 骨架調整）→
P2-1（placeholder 觀感）→ P2-2（375 按鈕換行覆核）。

## 執行紀錄（Taste 第一輪實作，2026-08-21）

P1-1 執行時，原計畫是把 Solutions/Products/Industries/Fit/Path 全部拉平成
hairline-list（沿用 `home-refinement.css` 中一段已存在但被後續 `!important`
覆蓋掉的舊版列表樣式）。實作過程中發現 Fit-card（頂部色條區分適合/不適合）
與 Path-card（hover 陰影可點擊卡片）在 `index.astro` 的 scoped `<style>`
裡各自有明確、有意義的原生設計，若一併拉平會抹除這些語意，屬於「為改而改」。
因此**縮小實際修改範圍為只調整 Solutions 與 Industries**——這兩者在原生
設計中就是純重複卡片網格、沒有獨立語意，改為 hairline-list 後，全頁 section
骨架變化為：Hero → Capability → **Solutions（列表）** → Products（不對稱
大圖卡）→ **Industries（列表）** → Fit（色條卡片）→ Path（hover 卡片）→
Process → Why us → CTA，五種不同骨架交錯，符合 Reference Lock 的「section
骨架刻意變化」原則，且未動到任何有獨立設計語意的區塊。變更檔案：
`src/styles/home-refinement.css`（移除 `!important` 覆蓋層，改為精準的
`border-radius: 0 !important` 只套用在 Solutions/Industries 的 `.card`，
並清理連帶失效的 media query 殘留規則）。已用正確 port（4326）截圖驗證
desktop（1440）與 mobile（375）皆無破版。
