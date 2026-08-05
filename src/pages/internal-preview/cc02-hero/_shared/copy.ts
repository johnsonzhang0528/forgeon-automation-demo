/**
 * CC-02 Hero prototype shared copy — spec §十二.
 *
 * VERBATIM. Every string below is copied character-for-character from the
 * CC-02 task book's §十二 ("三套 Prototype 共用文案"). Do not paraphrase,
 * "improve," retranslate, or otherwise edit this text — the whole point of
 * a shared module is that all three variants score on layout/visual
 * direction, not on which one has better copy. If the copy itself ever
 * needs to change, that is a spec change, not a per-variant judgment call.
 */

export const heroCopy = {
  'zh-tw': {
    eyebrow: '精密自動化整合',
    headline: '把定位、檢測與組裝，\n校準成一套可導入的生產流程。',
    body: '鋒岳整合精密運動模組、視覺定位與自動化工作站，\n依工件、節拍與現場條件，協助工廠評估可執行的自動化方案。',
    ctaPrimary: '開始專案評估',
    ctaSecondary: '先看導入條件',
  },
  en: {
    eyebrow: 'Precision Automation Integration',
    headline: 'Align positioning, inspection and assembly\ninto a production-ready system.',
    body: 'FORGEON combines precision motion, vision positioning and modular workstations\nto evaluate automation solutions around your parts, cycle time and site conditions.',
    ctaPrimary: 'Start a Project Assessment',
    ctaSecondary: 'Review Integration Requirements',
  },
} as const;

export type HeroLocale = keyof typeof heroCopy;

/** Shared process-strip labels (Variant A) — English literals used as-is on both locales, matching the spec's own INPUT/ALIGN/INSPECT/ASSEMBLE literal casing (§十三). */
export const processSteps = ['INPUT', 'ALIGN', 'INSPECT', 'ASSEMBLE'] as const;

/** Shared Header nav labels (spec §十六) — bilingual, not part of the byte-identical Hero copy contract above but kept alongside it so all three variants' Headers stay consistent too. */
export const navCopy = {
  'zh-tw': {
    logo: '鋒岳自動化',
    solutions: '解決方案',
    products: '產品',
    industries: '產業應用',
    engineeringMethod: '工程方法',
    resources: '資源',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    language: 'EN',
  },
  en: {
    logo: 'FORGEON AUTOMATION',
    solutions: 'Solutions',
    products: 'Products',
    industries: 'Industries',
    engineeringMethod: 'Engineering Method',
    resources: 'Resources',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    language: '中文',
  },
} as const;
