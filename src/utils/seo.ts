import { siteConfig, type Locale } from '../config/site';

export interface PageSeoInput {
  locale: Locale;
  path: string; // e.g. "/zh-tw/products/axm-400/"
  title: string;
  description: string;
  otherLocalePath?: string; // equivalent path in the other locale, if it exists
}

export function absoluteUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  return `${base}${path}`;
}

export function buildHreflangs(locale: Locale, path: string, otherLocalePath?: string) {
  const zhPath = locale === 'zh-tw' ? path : otherLocalePath;
  const enPath = locale === 'en' ? path : otherLocalePath;
  const links: { hreflang: string; href: string }[] = [];
  if (zhPath) links.push({ hreflang: 'zh-Hant-TW', href: absoluteUrl(zhPath) });
  if (enPath) links.push({ hreflang: 'en', href: absoluteUrl(enPath) });
  if (zhPath) links.push({ hreflang: 'x-default', href: absoluteUrl(zhPath) });
  return links;
}
