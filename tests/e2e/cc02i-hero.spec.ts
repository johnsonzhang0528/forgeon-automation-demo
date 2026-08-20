import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  {
    path: '/zh-tw/',
    headline: '把設備、控制與製程，\n整合成可落地的自動化系統。',
    primary: '討論自動化需求',
    secondary: '查看導入條件',
    disclosure: '品牌概念影像',
  },
  {
    path: '/en/',
    headline: 'Integrate equipment, controls and process needs\ninto an automation system built to run.',
    primary: 'Discuss an Automation Project',
    secondary: 'Review Integration Requirements',
    disclosure: 'Concept brand imagery',
  },
] as const;

const DOM_ORDER_SELECTORS = [
  '.hero-root__origin',
  '.hero-root__eyebrow',
  '.hero-root__headline',
  '.hero-root__body',
  '.hero-root__ctas',
  '.hero-root__media',
  '.hero-root__ledger',
  '.hero-root__rail',
];

test.describe('Homepage Hero content and image contract', () => {
  for (const route of ROUTES) {
    test(`${route.path} keeps localized copy in semantic HTML`, async ({ page }) => {
      await page.goto(route.path);

      const hero = page.locator('.hero-root');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(hero.locator('h1')).toHaveText(route.headline);
      await expect(hero.locator('.hero-root__body')).not.toBeEmpty();

      const ctas = hero.locator('.hero-root__ctas a');
      await expect(ctas).toHaveCount(2);
      await expect(ctas.nth(0)).toHaveText(route.primary);
      await expect(ctas.nth(0)).toHaveAttribute('href', new RegExp(`^${route.path}contact/\\?intent=project`));
      await expect(ctas.nth(1)).toHaveText(route.secondary);
      await expect(ctas.nth(1)).toHaveAttribute('href', new RegExp(`^${route.path}contact/\\?intent=technical-advice`));

      await expect(hero.locator('.hero-root__disclosure')).toHaveText(route.disclosure);
    });

    test(`${route.path} emits an optimized, eager LCP image`, async ({ page }) => {
      await page.goto(route.path);

      const media = page.locator('[data-hero-image="final-master"]');
      const image = media.locator('img');
      await expect(media.locator('picture')).toHaveCount(1);
      await expect(media.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(media.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('loading', 'eager');
      await expect(image).toHaveAttribute('fetchpriority', 'high');
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(image).toHaveAttribute('width', '1448');
      await expect(image).toHaveAttribute('height', '1086');
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });

    test(`${route.path} preserves content order and accessible structure`, async ({ page }) => {
      await page.goto(route.path);

      const positions = await page.evaluate((selectors) => {
        const root = document.querySelector('.hero-root');
        if (!root) return [];
        const descendants = Array.from(root.querySelectorAll('*'));
        return selectors.map((selector) => {
          const element = root.querySelector(selector);
          return element ? descendants.indexOf(element) : -1;
        });
      }, DOM_ORDER_SELECTORS);

      expect(positions).toHaveLength(DOM_ORDER_SELECTORS.length);
      expect(positions.every((position) => position >= 0)).toBe(true);
      for (let index = 1; index < positions.length; index += 1) {
        expect(positions[index]).toBeGreaterThan(positions[index - 1]);
      }

      await expect(page.locator('.hero-root__ledger .eval-ledger__row')).toHaveCount(3);
      await expect(page.locator('.hero-root__rail .process-rail')).toHaveAttribute('aria-label', /.+/);

      const results = await new AxeBuilder({ page }).include('.hero-root').analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('Homepage Hero responsive composition', () => {
  for (const width of [1024, 1280, 1440, 1920]) {
    test(`desktop ${width}px overlays copy on the left of the Final Master`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/');

      const layout = await page.locator('.hero-root').evaluate((root) => {
        const styles = getComputedStyle(root);
        const media = root.querySelector('.hero-root__media')!.getBoundingClientRect();
        const headline = root.querySelector('.hero-root__headline')!.getBoundingClientRect();
        return {
          columns: styles.gridTemplateColumns.split(' ').filter(Boolean).length,
          media: { left: media.left, right: media.right, top: media.top, bottom: media.bottom },
          headline: { left: headline.left, right: headline.right, top: headline.top, bottom: headline.bottom },
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      expect(layout.columns).toBe(12);
      expect(layout.headline.left).toBeGreaterThanOrEqual(layout.media.left);
      expect(layout.headline.right).toBeLessThan(layout.media.left + (layout.media.right - layout.media.left) * 0.5);
      expect(layout.headline.top).toBeGreaterThanOrEqual(layout.media.top);
      expect(layout.headline.bottom).toBeLessThan(layout.media.bottom);
      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    });
  }

  for (const width of [320, 390, 768]) {
    test(`${width}px stacks copy above the photograph without overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/');

      const layout = await page.locator('.hero-root').evaluate((root) => {
        const ctas = root.querySelector('.hero-root__ctas')!.getBoundingClientRect();
        const media = root.querySelector('.hero-root__media')!.getBoundingClientRect();
        return {
          ctaBottom: ctas.bottom,
          mediaTop: media.top,
          mediaWidth: media.width,
          rootWidth: root.getBoundingClientRect().width,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      expect(layout.mediaTop).toBeGreaterThanOrEqual(layout.ctaBottom);
      expect(layout.mediaWidth).toBeLessThanOrEqual(layout.rootWidth);
      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    });
  }
});
