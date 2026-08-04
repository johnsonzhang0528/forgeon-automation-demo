/**
 * Central brand / site configuration.
 * All brand names, taglines, and contact placeholders live here so that no
 * component hardcodes brand strings directly (spec §5).
 */

export type Locale = 'zh-tw' | 'en';

export const locales: Locale[] = ['zh-tw', 'en'];
export const defaultLocale: Locale = 'zh-tw';

export const siteConfig = {
  brandNameZh: '鋒岳自動化',
  brandNameEn: 'FORGEON AUTOMATION',

  taglineZh: '精準驅動，更有效率的生產流程。',
  taglineEn: 'Precision in motion. Efficiency in production.',

  // Placeholder contact details — fictional demo data, replace before go-live.
  contact: {
    emailZh: 'contact@forgeon-demo.example',
    emailEn: 'contact@forgeon-demo.example',
    phone: '+886-4-0000-0000',
    addressZh: '台灣中部（示範用地址，非真實廠址）',
    addressEn: 'Central Taiwan (demo address, not a real facility)',
  },

  social: {
    linkedin: '',
    youtube: '',
  },

  // Base URL is resolved from the PUBLIC_SITE_URL env var at build time.
  // See astro.config.mjs and .env.example.
  siteUrl: import.meta.env.PUBLIC_SITE_URL || 'https://forgeon-demo.yegou.studio',

  rfqEndpoint: import.meta.env.PUBLIC_RFQ_ENDPOINT || '',
  ga4Id: import.meta.env.PUBLIC_GA4_ID || '',
  gtmId: import.meta.env.PUBLIC_GTM_ID || '',
} as const;

export const legalNoticeZh =
  '本網站為作品集概念案例，品牌、產品、規格及專案資料均為虛構內容。';
export const legalNoticeEn =
  'Concept website created for portfolio demonstration. All company names, products, specifications and project information are fictional.';

export const demoDataNoticeZh =
  '本頁技術規格為概念展示資料，實際產品需依工程條件確認。';
export const demoDataNoticeEn =
  'Specifications shown on this page are fictional demonstration data. Actual configurations require engineering review.';
