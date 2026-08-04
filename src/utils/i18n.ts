import { zhTW } from '../data/locales/zh-tw';
import { en } from '../data/locales/en';
import type { Locale } from '../config/site';

export const dictionaries = {
  'zh-tw': zhTW,
  en,
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/** Maps a locale to the BCP-47 lang attribute used in <html lang="">. */
export function getHtmlLang(locale: Locale): string {
  return locale === 'zh-tw' ? 'zh-Hant-TW' : 'en';
}

/**
 * Given the current pathname (e.g. /zh-tw/products/axm-400) and the target
 * locale, returns the equivalent path in that locale. Falls back to that
 * locale's homepage when no direct mapping exists (spec §8.10: never route
 * to a non-existent page when a translation is missing).
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return `/${target}/`;

  const [, ...rest] = segments; // drop existing locale segment
  const candidate = `/${target}/${rest.join('/')}`;
  return candidate.endsWith('/') ? candidate : `${candidate}/`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'zh-tw' ? 'en' : 'zh-tw';
}
