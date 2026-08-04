import type { Locale } from './site';

export interface NavItem {
  labelKey: 'home' | 'solutions' | 'products' | 'industries' | 'about' | 'insights' | 'contact';
  path: (locale: Locale) => string;
}

export const navItems: NavItem[] = [
  { labelKey: 'solutions', path: (l) => `/${l}/solutions/` },
  { labelKey: 'products', path: (l) => `/${l}/products/` },
  { labelKey: 'industries', path: (l) => `/${l}/industries/` },
  { labelKey: 'about', path: (l) => `/${l}/about/` },
  { labelKey: 'insights', path: (l) => `/${l}/insights/` },
  { labelKey: 'contact', path: (l) => `/${l}/contact/` },
];
