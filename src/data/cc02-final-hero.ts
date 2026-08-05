/**
 * CC-02F final editorial hero — copy and content source of truth.
 * See docs/engineering/specs/CC-02F-final-editorial-hero.md §4/§8/§9/§12.
 *
 * VERBATIM. Every eyebrow/H1/body/CTA string below is copied
 * character-for-character from the CC-02F spec's §8 ("最終文案"). Do not
 * paraphrase, "improve," or retranslate — a spec change is required before
 * this text changes, not a per-component judgment call.
 *
 * This is a DIFFERENT, separate copy module from
 * src/pages/internal-preview/cc02-hero/_shared/copy.ts, which stays
 * untouched as the historical CC-02 design-spike's own copy contract.
 * CC-02F's copy is the final direction's copy — genuinely different text
 * (longer H1, restructured body, different secondary CTA), not a rename of
 * the same strings.
 *
 * H1 line-break contract (spec §6/§8): the zh-tw H1 has ONE explicit line
 * break, between "組裝，" and "校準" — encoded here as a literal "\n" and
 * rendered with `white-space: pre-line` by the consuming component,
 * matching the pattern CC-02's variant-c.astro already uses. The en H1 has
 * one explicit line break between "assembly" and "into a production-ready
 * system." Do not add or remove line breaks — the exact break points are
 * spec-authoritative, verified against real screenlayouts in the
 * Impeccable review, not chosen freely by CSS wrapping.
 */

export const finalHeroCopy = {
  'zh-tw': {
    eyebrow: '精密自動化整合',
    headline: '把定位、檢測與組裝，\n校準成可導入的生產流程。',
    body: '從工件、節拍到現場限制，鋒岳整合精密運動、視覺定位與模組化工作站，\n建立可評估、可配置、可驗證的自動化方案。',
    ctaPrimary: '開始專案評估',
    ctaSecondary: '查看導入條件',
  },
  en: {
    eyebrow: 'Precision Automation Integration',
    headline: 'Align positioning, inspection and assembly\ninto a production-ready system.',
    body: 'From parts and cycle time to site constraints, FORGEON combines precision motion,\nvision positioning and modular workstations into an automation solution that can be\nevaluated, configured and verified.',
    ctaPrimary: 'Start a Project Assessment',
    ctaSecondary: 'Review Integration Requirements',
  },
} as const;

export type FinalHeroLocale = keyof typeof finalHeroCopy;

/**
 * Evaluation Ledger content (spec §9/§12) — method/deliverable information,
 * explicitly NOT fabricated performance numbers. Replaces CC-02 variant-c's
 * `specRowsByLocale` (±0.01mm / <180ms / 3 型號可組合), which must not
 * appear anywhere in this file or any CC-02F component.
 */
export const evaluationLedger: Record<
  FinalHeroLocale,
  Array<{ heading: string; detail: string }>
> = {
  'zh-tw': [
    { heading: '需求輸入', detail: '工件圖、目標節拍、現場限制' },
    { heading: '評估範圍', detail: '定位、檢測、組裝與站點整合' },
    { heading: '交付輸出', detail: '系統架構、模組配置、驗收條件' },
  ],
  en: [
    { heading: 'Project Inputs', detail: 'Part drawings, target cycle time, site constraints' },
    { heading: 'Evaluation Scope', detail: 'Positioning, inspection, assembly and station integration' },
    { heading: 'Project Outputs', detail: 'System architecture, module configuration, acceptance criteria' },
  ],
};

/**
 * Process Rail labels (spec §1/§11) — the one Variant A element absorbed
 * into C+. English casing is literal per spec (all-caps INPUT/EVALUATE/
 * CONFIGURE/VERIFY), matching the existing processSteps convention in
 * cc02-hero/_shared/copy.ts for the English side, but zh-tw gets its own
 * real four-word labels (not a transliteration of the English).
 */
export const processRailSteps: Record<FinalHeroLocale, readonly string[]> = {
  'zh-tw': ['需求輸入', '方案評估', '模組配置', '驗證條件'],
  en: ['INPUT', 'EVALUATE', 'CONFIGURE', 'VERIFY'],
};

/** Locale-aware AssemblySpine state-tag text for the Process Rail (reuses AssemblySpine's existing stateLabels API — see src/components/brand/AssemblySpine.astro). */
export const processRailStateLabels: Record<
  FinalHeroLocale,
  { unconnected: string; aligned: string; connected: string }
> = {
  'zh-tw': { unconnected: '待處理', aligned: '準備中', connected: '進行中' },
  en: { unconnected: 'Pending', aligned: 'Preparing', connected: 'In progress' },
};

/** Accessible text alternative for PrecisionSystemVisual (spec §9: "provide an understandable text alternative" — the SVG itself is aria-hidden). */
export const precisionVisualAlt: Record<FinalHeroLocale, string> = {
  'zh-tw': '精密運動模組、視覺定位頭與組裝工作站沿模組組裝軸連接的系統示意圖',
  en: 'System diagram of a precision motion module, vision positioning head and assembly workstation connected along one assembly axis',
};

/** Accessible text alternative for the smaller Secondary Detail visual. */
export const secondaryVisualAlt: Record<FinalHeroLocale, string> = {
  'zh-tw': '視覺定位頭近拍與對齊節點細節',
  en: 'Close-up of the vision positioning head and its alignment node',
};

/** Header nav labels for the CC-02F final prototype Header — a locale-keyed variant of cc02-hero's navCopy, kept local to this file so cc02-final never imports the historical cc02-hero _shared module (full isolation per CC-02F-03). */
export const finalNavCopy: Record<
  FinalHeroLocale,
  {
    logo: string;
    solutions: string;
    products: string;
    industries: string;
    engineeringMethod: string;
    resources: string;
    menuOpen: string;
    menuClose: string;
    languageSwitchLabel: string;
    languageSwitchTo: string;
  }
> = {
  'zh-tw': {
    logo: '鋒岳自動化',
    solutions: '解決方案',
    products: '產品',
    industries: '產業應用',
    engineeringMethod: '工程方法',
    resources: '資源',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    languageSwitchLabel: '切換語言',
    languageSwitchTo: 'EN',
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
    languageSwitchLabel: 'Switch language',
    languageSwitchTo: '中文',
  },
};
