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
  productionImagery: {
    automationIntegration: {
      alt: '封閉式自動化工作站，機械手臂在輸送線、定位治具、感測站與控制櫃之間協同作業',
      caption: '代表性系統整合影像：輸送、定位治具、機械手臂作業、感測與輸出。',
    },
    controlEngineering: {
      alt: '工程師以數位電表檢查自動化控制櫃的端子與配線，櫃內可見 PLC、I/O 模組與驅動器',
      caption: '代表性控制工程影像：控制櫃配線、端子量測、PLC／I/O 與現場調試。',
    },
    machineVisionInspection: {
      alt: '工業相機、鏡頭與環形光源對準治具上的精密金屬工件，形成機器視覺檢測站',
      caption: '代表性機器視覺檢測影像：相機、鏡頭、環形光源、治具與工件的固定檢測關係。',
    },
    visionGuidedAssembly: {
      alt: '封閉式組裝工作站內，工業相機與環形光源對準治具工件，右側機械手臂以夾爪進行定位組裝',
      caption: '代表性視覺導引組裝影像：相機與環形光源取得工件位置，機械手臂依治具關係完成抓取、對位與組裝。',
    },
    precisionHandling: {
      alt: '水平線性軸與 Z 軸帶動平行夾爪，從外徑夾持治具上的中央圓柱工件',
      caption: '代表性精密搬運影像：線性軸、Z 軸、平行夾爪、工件與治具的運動／負載關係。',
    },
    modularWorkstation: {
      alt: '模組化自動化工作站，由左側機械手臂製程模組、中央共用輸送介面與右側垂直製程模組組成',
      caption: '概念展示影像：機械手臂製程模組、共用輸送介面與垂直製程模組整合於同一工作站平台。',
    },
    existingLineRetrofit: {
      alt: '工程人員在仍服役的既有產線旁操作有線手持控制器，舊設備透過實體交接結構銜接新增鋁擠型自動化模組與控制櫃',
      caption: '代表性既有產線升級影像：保留仍可使用的舊設備，透過實體交接結構新增自動化模組、控制架構與現場調試。',
    },
    semiconductorElectronics: {
      alt: '電子組裝自動化站內，工業相機與環形光源對準 PCB 治具，精密製程頭定位於電路板上方，周圍配置元件料盤與載帶',
      caption: '代表性半導體與電子組裝影像：視覺、精密製程頭、PCB 治具與元件供料在同一站點協作。',
    },
    automotiveComponents: {
      alt: '黃色機械手臂將鑄造金屬零件定位在治具上，右側檢測光源與周邊感測結構對準工作區',
      caption: '代表性汽車零組件自動化影像：機械手臂、鑄造件、定位治具與檢測光源構成搬運與檢查站點。',
    },
    metalMachining: {
      alt: '白色機械手臂在 CNC 加工機前夾持精密金屬工件，右側量測探頭對準另一個治具工件',
      caption: '代表性金屬加工自動化影像：機械手臂銜接加工機、工件暫存治具與站外量測位置。',
    },
    packagingLogistics: {
      alt: '紙箱沿多段輸送線分流，左側視覺感測站對準輸送物，右後方機械手臂以吸盤搬運紙箱',
      caption: '代表性包裝與物流自動化影像：輸送、分流、視覺感測與機械手臂搬運形成連續作業流程。',
    },
    fieldCommissioning: {
      alt: '兩名配戴安全帽與護目鏡的工程人員在自動化設備旁協作，一人操作控制面板與有線手持操作器，另一人檢視機台內部',
      caption: '代表性現場調試影像：控制端設定與設備端目視確認，呈現系統驗證與交付準備的協作關係。',
    },
  },
  engineeringDiagrams: {
    visionGuidedAssembly: {
      eyebrow: '系統架構示意',
      title: '從取像、定位到組裝確認的訊號路徑',
      description: '以概念層級說明視覺、控制與執行模組如何交換訊號；實際設備、通訊介面與安全設計仍需依工件及現場條件確認。',
      flowLabel: '視覺導引自動化組裝的主要訊號流程',
      input: {
        label: '工件與站點觸發',
        detail: '工件進站、治具到位與觸發條件',
      },
      stages: [
        { code: 'VIS', title: '視覺取像', detail: '相機、鏡頭與光源取得工件特徵' },
        { code: 'LOC', title: '定位判定', detail: '影像處理取得位置、方向與允收結果' },
        { code: 'MOT', title: '座標與運動', detail: '將定位結果轉成機械手臂或運動模組指令' },
        { code: 'VER', title: '製程確認', detail: '完成組裝或檢測後回寫站點狀態' },
      ],
      output: {
        label: '站點輸出',
        detail: '完成訊號、異常狀態與必要追溯資料',
      },
      support: [
        { title: '控制與同步', detail: 'PLC、運動控制器與站點節拍之間的協調關係。' },
        { title: '安全與互鎖', detail: '防護、門鎖、急停與安全迴路須依現場風險評估。' },
      ],
      disclosure: '概念性系統架構，不代表特定品牌設備、通訊協定、控制程式或已完成的客戶專案。',
    },
    lineUpgrade: {
      eyebrow: '整合邊界示意',
      title: '保留舊設備時，新舊系統的介面邊界',
      description: '局部升級不是單純加裝設備，而是先確認哪些機構、訊號與控制功能保留，再定義新增模組與既有產線的交接方式。',
      flowLabel: '既有產線局部升級的主要整合流程',
      input: {
        label: '保留的既有設備',
        detail: '仍可使用的製程、機構與控制資產',
      },
      stages: [
        { code: 'AUD', title: '現況盤點', detail: '確認機構交接、電氣訊號與控制版本' },
        { code: 'IFC', title: '介面定義', detail: '區分保留、替換與需要轉接的邊界' },
        { code: 'ADD', title: '新增模組', detail: '配置感測、運動、搬運與必要控制功能' },
        { code: 'VAL', title: '聯合驗證', detail: '依約定條件確認流程、互鎖與異常處理' },
      ],
      output: {
        label: '可驗證的整合條件',
        detail: '交接介面、操作順序與驗收項目',
      },
      support: [
        { title: '機構邊界', detail: '工件交接位置、安裝空間與既有治具是否沿用。' },
        { title: '控制邊界', detail: '訊號權責、互鎖條件、異常碼與維護方式。' },
      ],
      disclosure: '概念性整合邊界，不代表任何真實廠區配置、既有設備狀態、改造結果或效能提升。',
    },
  },
  hero: {
    eyebrow: '虛構品牌概念展示 · 工業自動化系統整合',
    headline: '把設備、控制與製程\n整合成可落地的自動化系統。',
    body: '從工件、節拍與現場限制出發，整合機構、電控、感測與站點協作；\n讓方案在導入前可評估，在交付時有明確的驗收條件。',
    ctaPrimary: '討論自動化需求',
    ctaSecondary: '查看導入條件',
    imageAlt: '自動化生產現場，右側為大型設備與黃色安全護欄，一名操作人員正在設備旁工作',
    imageDisclosure: '品牌概念影像',
    ledger: {
      input: { heading: '需求輸入', detail: '工件圖、目標節拍、現場限制' },
      evaluation: { heading: '評估範圍', detail: '定位、檢測、組裝與站點整合' },
      output: { heading: '交付輸出', detail: '系統架構、模組配置、驗收條件' },
    },
    processRail: {
      step1: '需求輸入',
      step2: '方案評估',
      step3: '模組配置',
      step4: '驗證條件',
      railLabel: '流程階段導覽',
      stateLabels: { unconnected: '待處理', aligned: '準備中', connected: '進行中' },
    },
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
