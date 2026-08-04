export const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

/** One representative page per "page type" the spec asks to cover. */
export const PAGE_TYPES: { name: string; path: string }[] = [
  { name: 'home', path: '/zh-tw/' },
  { name: 'home-en', path: '/en/' },
  { name: 'solutions-listing', path: '/zh-tw/solutions/' },
  { name: 'solution-detail', path: '/zh-tw/solutions/vision-guided-assembly/' },
  { name: 'products-listing', path: '/zh-tw/products/' },
  { name: 'product-detail', path: '/zh-tw/products/axm-400/' },
  { name: 'industries-listing', path: '/zh-tw/industries/' },
  { name: 'industry-detail', path: '/zh-tw/industries/semiconductor-electronics/' },
  { name: 'about', path: '/zh-tw/about/' },
  { name: 'insights-listing', path: '/zh-tw/insights/' },
  { name: 'insight-detail', path: '/zh-tw/insights/automation-readiness-checklist/' },
  { name: 'contact', path: '/zh-tw/contact/' },
  { name: 'privacy', path: '/zh-tw/privacy/' },
  { name: '404', path: '/zh-tw/404/' },
];
