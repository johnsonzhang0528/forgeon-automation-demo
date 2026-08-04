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
  // PUBLIC_GA4_ID was removed (spec 4.2): it was declared end-to-end
  // (config, env.d.ts, .env.example, README) but never actually consumed
  // by any script-injection code path — only gtmId is. An unused env var
  // that looks wired up is misleading, so it's gone rather than kept as
  // dead config. GTM is the one documented, working analytics path; wire a
  // GA4 tag inside GTM, or reintroduce a real GA4 gtag.js injection block
  // in BaseLayout.astro alongside a real ga4Id if a direct (non-GTM) GA4
  // integration is ever needed.
  gtmId: import.meta.env.PUBLIC_GTM_ID || '',
} as const;

/**
 * Demo Mode gate (spec P0.4 / §12 "建立 Demo 索引安全機制").
 *
 * This is a fictional portfolio concept site, not a real company. Left
 * indexable, it risks being treated by search engines (and by anyone who
 * stumbles onto it) as a real business called FORGEON AUTOMATION. Demo Mode
 * defaults ON so that every environment this code is deployed to — unless
 * someone deliberately opts in to Production Mode with a real domain — ships
 * noindex, Disallow: /, and a visible "Concept Project" badge.
 *
 * - `PUBLIC_DEMO_MODE` defaults to `true` when unset (fail-safe: an empty
 *   env var must never accidentally make the site indexable).
 * - `PUBLIC_ALLOW_INDEXING` defaults to `false` and is a second, explicit
 *   gate: even outside Demo Mode, indexing is opt-in, not opt-out.
 *
 * Production Mode (real client site) = set BOTH
 * `PUBLIC_DEMO_MODE=false` AND `PUBLIC_ALLOW_INDEXING=true`.
 */
export const isDemoMode: boolean = import.meta.env.PUBLIC_DEMO_MODE !== 'false';
export const allowIndexing: boolean =
  !isDemoMode && import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';

export const legalNoticeZh =
  '本網站為作品集概念案例，品牌、產品、規格及專案資料均為虛構內容。';
export const legalNoticeEn =
  'Concept website created for portfolio demonstration. All company names, products, specifications and project information are fictional.';

export const demoDataNoticeZh =
  '本頁技術規格為概念展示資料，實際產品需依工程條件確認。';
export const demoDataNoticeEn =
  'Specifications shown on this page are fictional demonstration data. Actual configurations require engineering review.';
