# HIGGSFIELD_ASSET_PLAN.md

## 執行狀態聲明（先讀這段）

**本專案本次執行「未呼叫」任何 Higgsfield 生成 API**
（`higgsfield-generate`、`higgsfield-brandkit`、`higgsfield-product-photoshoot`
均未執行實際生成）。原因：

1. 這些 Skill 的生成動作需要使用者以 `higgsfield auth login` 完成帳號授權，
   本沙盒背景執行階段沒有使用者本人的 Higgsfield 帳號登入狀態，也沒有可
   互動的視窗完成 OAuth／CLI 登入流程。
2. 依本指令 §15.2「付費核准」規則：生成前必須先整理清單、說明數量與用途，
   **等待使用者核准後才提交**；且「不得因等待圖片而停止整個專案」。
3. 因此本文件是「若使用者日後在自己已登入的 Higgsfield 帳號環境執行，
   應該生成什麼」的完整規劃書，而非已完成的生成紀錄。全站目前以原創
   SVG／CSS 圖形與明確標示的 Placeholder 完成所有視覺需求（見
   `docs/ASSET_LICENSES.md`）。
4. 對應紀錄另見 `docs/SKILL_USAGE_LOG.md` 第 4 節、`docs/HIGGSFIELD_GENERATION_LOG.md`
   （目前為空紀錄聲明）。

以下為完整素材計畫，依 §15.1 要求逐項記錄。

---

## 1. 品牌 Moodboard（Higgsfield Brandkit）

- **使用頁面**：內部設計參考（不直接上線），可能影響 `DESIGN.md` 色彩/材質微調。
- **商業目的**：驗證色彩方向（深海軍藍＋銅橘）與工業影像語言是否協調一致，
  作為前期方向確認用，非最終商標。
- **類型**：Moodboard 拼貼（4–6 張參考影像＋色票）。
- **尺寸與比例**：單張 1600×1600px 方形，供拼貼板使用。
- **視覺方向**：精密機械特寫、金屬材質、線性軌道／滾珠螺桿局部、
  中性冷光工業攝影棚打光，禁止任何品牌標誌或可辨識廠牌。
- **文字安全區**：不適用（僅供內部參考，不會疊加文字）。
- **是否透明背景**：否。
- **是否屬於事實性內容**：否（材質與氛圍參考，非精確工程圖）。
- **建議 Skill**：`higgsfield-brandkit`。
- **預估輸出數**：4–6 張。
- **是否消耗額度**：是。
- **SVG／Placeholder 替代方案**：目前以 `DESIGN.md` 中文字描述的色彩／材質決策
  取代視覺 Moodboard；`src/styles/tokens.css` 已依此決策實作。

---

## 2. 首頁 Hero 視覺

- **使用頁面**：`/zh-tw/`、`/en/` 首頁第一屏。
- **商業目的**：在 3 秒內傳達「精密＋工程＋國際 B2B」定位，建立品牌辨識度，
  同時保留左側文字安全區供標題與 CTA。
- **類型**：非事實性抽象工業自動化概念視覺（CGI 風格渲染）。
- **尺寸與比例**：
  - 桌面裁切：2400×1600px（3:2），右側留白供文字若版面調整時使用
  - 手機裁切：1200×1500px（4:5），構圖需可裁切成直式而不失去主體
- **視覺方向**：精密線性模組／機械手臂局部特寫的抽象化演繹，深海軍藍與
  暖灰背景，單一銅橘光源／強調線條呼應品牌 CTA 色，成熟冷靜的 B2B 質感，
  避免任何科幻感、螢光感或賭場感。
- **文字安全區**：左側 40% 寬度須保持低對比、無複雜細節，供標題文字疊加。
- **是否透明背景**：否（含背景合成）。
- **是否屬於事實性內容**：否，明確標示為概念圖，不得暗示為真實產線或客戶現場。
- **建議 Skill**：`higgsfield-generate`（Image，工業概念風格 Prompt）。
- **預估輸出數**：桌面＋手機各 3 個變體供選，共 6 張。
- **是否消耗額度**：是。
- **SVG／Placeholder 替代方案**：目前已實作 `src/components/ui/HeroIllustration.astro`，
  以原創 SVG 繪製線性模組＋機械手臂＋光源漸層的抽象組合圖，並標註
  「概念示意圖」徽章，作為正式生成前的完整可用替代方案。

### 建議 Prompt（供使用者日後執行參考）

```
Abstract industrial automation concept render, precision linear motion
module and robotic arm detail, deep navy and warm graphite tones, single
copper-bronze accent light, matte brushed metal texture, clean studio
background, no visible logos, no text, no real factory environment,
professional B2B corporate aesthetic, cinematic but restrained lighting,
negative space on left third of frame for headline text overlay
```

---

## 3. 產品概念渲染（AXM-400 / VISION-X2 / FLEXCELL-M）

- **使用頁面**：產品總覽、各產品詳細頁。
- **商業目的**：讓虛構產品具備一致、可信的視覺形象，同時明確不得暗示為
  已量產或已認證商品。
- **類型**：虛構產品 CGI，三款產品採統一渲染風格（同一光源、同一背景色調）
  以建立產品線視覺一致性。
- **尺寸與比例**：每款產品 1600×1200px（4:3）主圖＋1:1 縮圖裁切版本。
- **視覺方向**：簡潔工作室背景（淺灰或暖白），單一柔和方向光，金屬與
  工程塑料材質對比，不得附加任何精確標尺、認證貼紙或錯誤操作示意。
- **文字安全區**：底部 15% 保留簡潔留白供型號字卡疊加（型號本身以
  HTML 文字疊加，不燒入圖片，避免生成圖出現錯字）。
- **是否透明背景**：主圖背景合成；另需一版透明背景 PNG 供卡片縮圖靈活使用。
- **是否屬於事實性內容**：否，圖片下方須固定顯示「概念產品圖，非實際外觀」。
- **建議 Skill**：`higgsfield-product-photoshoot`。
- **預估輸出數**：每款產品 2 個角度 × 3 款 = 6 張主圖 + 3 張透明背景縮圖 = 9 張。
- **是否消耗額度**：是。
- **SVG／Placeholder 替代方案**：`src/components/ui/ProductGlyph.astro` 已為
  三款產品各自建立原創等角（isometric）線稿 SVG（線性模組結構、相機／光源
  模組結構、模組化工作站結構），搭配「概念產品圖」徽章使用。

---

## 4. 產業抽象視覺

- **使用頁面**：產業應用總覽卡片、產業詳細頁 Hero。
- **商業目的**：以抽象方式暗示各產業製程情境，避免任何真實客戶現場聯想。
- **類型**：抽象工業視覺（材質／色調／構圖示意，非具體場景寫實照片）。
- **尺寸與比例**：每產業 1200×800px（3:2），供卡片與詳細頁 Hero 共用裁切。
- **視覺方向**：
  - 半導體與電子組裝：潔淨室色調、微小元件質感抽象化
  - 汽車零組件：金屬沖壓／組裝結構抽象化
  - 精密金屬加工：切削屑、金屬光澤紋理抽象化
  - 包裝與物流：輸送帶／堆疊結構抽象化
- **文字安全區**：不需要（僅作背景圖塊，文字另以 HTML 疊加於卡片內）。
- **是否透明背景**：否。
- **是否屬於事實性內容**：否，須避免任何可被誤認為鋒岳自動化真實客戶現場的
  具體廠房或可辨識標誌。
- **建議 Skill**：`higgsfield-generate`。
- **預估輸出數**：4 產業 × 1 張 = 4 張。
- **是否消耗額度**：是。
- **SVG／Placeholder 替代方案**：`src/components/ui/IndustryIcon.astro` 已為
  四個產業建立幾何圖示（非寫實場景），搭配色塊背景區隔，作為目前上線版本。

---

## 5. 總覽：預估生成成本與優先順序

| 素材類型 | 預估張數 | 額度消耗 | 優先順序 | 目前替代方案 |
|---|---|---|---|---|
| 品牌 Moodboard | 4–6 | 是 | 低（僅供內部參考） | DESIGN.md 文字化決策，已生效 |
| 首頁 Hero | 6 | 是 | 高（首屏第一印象） | 原創 SVG HeroIllustration，已上線 |
| 產品概念渲染 | 9 | 是 | 中 | 原創 SVG 等角線稿 ProductGlyph，已上線 |
| 產業抽象視覺 | 4 | 是 | 中 | 原創 SVG 幾何圖示 IndustryIcon，已上線 |

**總預估**：約 23–25 張輸出，全數需消耗 Higgsfield 付費額度。

**核准流程**：使用者於自己的環境完成 `higgsfield auth login` 後，
可依上述清單與 Prompt 方向逐項核准生成；核准後請將生成結果連同
Prompt、模型、參考圖、授權檢查狀態回填至
`docs/HIGGSFIELD_GENERATION_LOG.md` 與 `docs/ASSET_LICENSES.md`。
