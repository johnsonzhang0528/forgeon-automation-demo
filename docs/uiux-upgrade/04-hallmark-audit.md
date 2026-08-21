# 04 · Hallmark Audit（Anti-AI-slop Reviewer）

記錄日期：2026-08-21
角色：Audit only。禁止 redesign、禁止選新 theme、禁止改 IA、禁止推翻
Reference Lock。本文件只輸出問題清單與 P0/P1/P2/Reject 分級，不在此文件內
直接動手修改 code（修改動作與結果記錄在文件末尾「修正紀錄」區）。
稽核對象：`docs/screenshots/uiux-baseline/` 全套截圖（zh-tw/en × 375/768/
1440/1920，Taste 修改後的正確版本）。

依任務書 §27 逐項核對常見 AI slop 症狀：

| 症狀 | 是否出現 | 說明 |
|---|---|---|
| Generic hero（Hero + 三張 Feature Card + CTA 模板節奏） | 否 | Hero 是滿版深藍背景 + 左文右圖 + 雙 CTA + 下方技術中繼資料清單，非三卡模板 |
| Excessive cards / 無意義卡片氾濫 | 部分曾出現，已由 Taste 修正 | Solutions/Industries 原本是卡片網格，已改為 hairline-list；Products/Fit/Path 保留卡片但各有獨立語意（不對稱大圖、色條、hover），非無意義重複 |
| Excessive pills / 過度 Pill Button | 否 | CTA 按鈕是 `border-radius: var(--radius-md)`（中等圓角矩形），非全圓角 pill 形狀 |
| Floating blobs / 無意義 floating cards | 否 | 未發現任何裝飾性浮動色塊或卡片 |
| Unnecessary badge / 無意義 Badge | 否，僅一個功能性 Demo Mode badge | footer 的「概念專案 · 未開放搜尋索引」badge 是功能性揭露（見 CONTEXT.md Demo Mode），非裝飾 |
| Fake dashboard mockup | 否 | 沒有任何假數據儀表板/圖表 mockup |
| Excessive gradient / 過度漸層 | 否 | 未觀察到大面積漸層背景 |
| Glassmorphism | 否 | 未觀察到毛玻璃/半透明模糊效果 |
| Neon glow | 否 | 未觀察到發光效果 |
| 藍紫科技漸層（AI 常見色） | 否，是實色海軍藍非漸層 | 色彩是純色深藏青（`--color-ink-950`）+ 藍色 CTA，非漸層，且藍色是既有品牌色非「AI 感」藍紫漸層 |
| 過度裝飾（為科技感堆砌無意義元素） | 否 | 未發現無資訊功能的裝飾性圖案 |
| 所有 Section 都長一樣 | 部分曾出現，已由 Taste 修正 | 見 `02-redesign-diagnosis.md` IMPROVE 1 / `03-polish-log.md` P1-1 |
| 每區都是標題+三欄卡片 | 否（Taste 修正後） | 目前骨架序列：Hero／Capability（四欄清單）／Solutions（列表）／Products（不對稱大圖+雙欄）／Industries（列表）／Fit（雙欄色條卡）／Path（雙卡 hover）／Process（圖+timeline）／Why us（雙欄文字）／CTA banner，無連續三個以上相同骨架 |
| 大量沒有資訊功能的 icon | 否 | Capability 區塊用數字索引（01-04）取代 icon 堆砌；Solutions 列表用小型功能性 icon（`SolutionIcon`），非裝飾性 icon 牆 |
| 過度動畫 | 否 | 全站無 GSAP/scroll-hijack，僅原生 CSS transition/hover，`prefers-reduced-motion` 有支援 |
| 與品牌語言衝突的 Design System | 否 | 全站色彩/字級/圓角/間距皆透過 `tokens.css` 統一管理，無外部 Design System 混入 |

## 稽核結論

**未發現任何未處理的 P0 或 P1 等級 AI slop 症狀。**

本站的視覺基礎在本輪 UI/UX 任務開始前就已經相當扎實——沒有陷入常見的
「Hero + 三卡 Feature + CTA」SaaS 模板節奏，圖片是真實工業攝影而非插畫/
icon 堆砌，色彩克制（單一品牌藍 + 中性色階，非漸層或多彩裝飾）。Taste
階段診斷並修正的唯一實質問題（Solutions/Industries 卡片網格同質化）已經
是這次稽核清單裡最貼近「所有 Section 都長一樣」症狀的項目，修正後不再
成立。

## P0（必修）

無。

## P1（高度值得修）

無。

## P2（可考慮，非必要）

1. **Capability 區塊的四欄清單與 Why us 區塊的雙欄清單，兩者在視覺上都是
   「數字/索引 + 標題 + 說明」的重複列表結構**，雖然不是卡片網格、不違反
   Reference Lock 的骨架變化原則（兩者中間隔著 Solutions/Products/
   Industries/Fit/Path 五個結構迥異的 section，不構成連續同質化），但若
   要吹毛求疵，這兩處在資訊呈現手法上確實相似。這是風格上的觀察而非
   缺陷，**不建議修改**——理由見下方 Reject。

## Reject（Hallmark 建議但與 Reference Lock 或品牌 DNA 衝突，不採納）

1. 若有進一步壓力要求「讓 Capability 與 Why us 的清單樣式也彼此不同」：
   拒絕。這兩個區塊分別在頁面最上段（能力總覽）與最下段（合作理由），
   相隔九個結構不同的 section，使用者不會在同一視野內同時看到兩者、
   不構成「連續重複」的視覺疲勞。任務書 §41 明確要求「不要為了 1-2px
   無止境修改」「不要陷入無限 polish loop」，勉強拆解這兩處只會製造
   Reference Averaging 風險（見 `01-reference-lock.md` §16），不採納。

## 修正紀錄

本輪 Hallmark Audit 未發現需要修正的 P0/P1 項目，**未執行任何程式碼修改**。
