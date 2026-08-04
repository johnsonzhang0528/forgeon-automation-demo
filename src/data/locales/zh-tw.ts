/**
 * zh-TW UI string dictionary. Shared chrome copy (nav, footer, form labels,
 * CTAs, states). Page body content lives in src/content/* collections.
 */
export const zhTW = {
  nav: {
    home: '首頁',
    solutions: '解決方案',
    products: '產品',
    industries: '產業應用',
    about: '關於我們',
    insights: '技術資源',
    contact: '聯絡我們',
    ctaPrimary: '提交專案需求',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    skipToContent: '跳到主要內容',
  },
  cta: {
    primary: '提交專案需求',
    secondary: '索取技術建議',
    viewSolutions: '查看解決方案',
    viewProducts: '查看產品規格',
    downloadSpec: '下載規格資料',
    contactEngineering: '聯絡技術團隊',
    learnMore: '進一步了解',
    viewDetail: '查看詳細內容',
    backHome: '返回首頁',
    backSolutions: '查看解決方案',
    relatedSolutions: '相關解決方案',
    relatedProducts: '可搭配產品',
    downloadDatasheet: '下載規格 PDF（示範檔案）',
  },
  footer: {
    solutionsHeading: '解決方案',
    productsHeading: '產品',
    companyHeading: '公司',
    resourcesHeading: '技術資源',
    contactHeading: '聯絡窗口',
    legalNotice: '本網站為作品集概念案例，品牌、產品、規格及專案資料均為虛構內容。',
    rights: '版權所有',
    langSwitch: 'English',
  },
  breadcrumb: {
    home: '首頁',
  },
  form: {
    companyName: '公司名稱',
    contactName: '姓名',
    jobTitle: '職稱',
    email: 'Email',
    phone: '電話',
    country: '國家／地區',
    industry: '產業',
    projectType: '專案類型',
    requirement: '需求說明',
    timeline: '預計導入時間',
    budget: '預算區間',
    hasSpec: '是否已有技術規格',
    needNda: '是否需要保密協議',
    attachmentNote: '若有圖面、規格書或產線照片，請於送出後以 Email 附件方式提供，我們會在下方留下聯絡信箱。',
    privacyConsent: '我已閱讀並同意{privacyLink}，同意鋒岳自動化以此資料與我聯絡。',
    privacyLinkLabel: '隱私權政策',
    submit: '送出需求',
    submitting: '送出中…',
    yes: '是',
    no: '否',
    selectPlaceholder: '請選擇',
    requiredMark: '必填',
    errors: {
      required: '此欄位為必填',
      email: '請輸入有效的 Email 格式',
      phone: '請輸入有效的電話號碼',
      consent: '請先閱讀並同意隱私權政策',
      minLength: '請提供更詳細的需求說明（至少 20 字）',
    },
    successTitle: '需求已送出',
    successBody: '感謝您的詢問，我們的技術團隊將於 2 個工作天內與您聯繫。',
    demoModeNotice:
      '示範模式：此頁展示 RFQ 表單的完整驗證流程。資料不會被送出或儲存，也沒有實際回覆承諾。實際上線時將串接真實 API，詳見 README。',
    demoModeSubmitTitle: '驗證流程示範完成',
    demoModeSubmitBody:
      '表單驗證已通過，這示範了完整的 RFQ 驗證體驗。因目前為 Demo Mode，資料並未實際送出或儲存，也不會有人與您聯繫。這是作品集展示網站的預期行為，非系統錯誤。',
    errorTitle: '送出失敗',
    errorBody: '請稍後再試，或直接以 Email 聯絡我們的技術團隊。',
  },
  states: {
    loading: '載入中…',
    empty: '目前尚無相關內容',
    error: '發生錯誤，請稍後再試',
  },
  demoNotice: {
    specLabel: '概念展示資料',
    specBody: '本頁技術規格為概念展示資料，實際產品需依工程條件確認。',
  },
  misc: {
    faqHeading: '常見問題',
    processHeading: '導入流程',
    specTableHeading: '技術規格',
    optionsHeading: '可選配項目',
    relatedHeading: '相關內容',
    readMore: '閱讀全文',
    publishedOn: '發布日期',
    demoDataBadge: 'Demo 資料',
    conceptImageBadge: '概念示意圖',
  },
  contactIntent: {
    projectHeading: '提交您的專案需求',
    projectBody: '填寫下方表單，說明您的製程背景與需求。本頁展示 RFQ 表單的完整驗證流程；此為作品集 Demo，表單資料不會被送出或儲存，也沒有實際回覆承諾。',
    technicalHeading: '索取技術建議',
    technicalBody: '若您尚未準備好完整專案需求，也可以先說明遇到的技術問題，我們會協助評估初步方向。本頁為 RFQ 表單驗證流程的展示，資料不會被送出或儲存。',
  },
};

/**
 * Deep-widens the dictionary shape to `string` leaves so translations don't
 * need to match zh-TW's literal string values, only its key structure.
 */
type DeepString<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepString<T[K]> }
    : T;

export type Dictionary = DeepString<typeof zhTW>;
