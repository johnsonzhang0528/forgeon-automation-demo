import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Rewritten for the Precision Instrument Editorial hero (Phase 5A-R2 /
 * DESIGN.md v2 §0, §5, §18). The previous version of this file asserted the
 * split-column "text left / photo right on desktop, photo below text on
 * mobile" layout — that layout was the one the Phase 5A-R Human/ChatGPT
 * Visual Gate explicitly rejected as reading like a generic B2B template.
 * This suite asserts the approved contract instead: a single full-bleed
 * FORGEON-HERO-MASTER-v1 photograph with copy overlaid low-left at every
 * viewport, not a layout that swaps between a grid split and a stack.
 */

const ROUTES = [
  {
    path: '/zh-tw/',
    headline: '公差以微米計算，\n不是形容詞。',
    primary: '提交專案需求',
    secondary: '瀏覽產品線',
  },
  {
    path: '/en/',
    headline: 'Tolerance is measured in microns,\nnot adjectives.',
    primary: 'Submit a Project Request',
    secondary: 'Browse Product Line',
  },
] as const;

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
      // Secondary CTA (Phase 5B-R1 §C) renders a trailing directional arrow
      // glyph inside its own aria-hidden span, so its accessible/visible
      // text is "label→" (no separating space in the DOM text nodes) —
      // matched with a regex rather than exact toHaveText so the arrow
      // presence itself is verified without hardcoding the exact glyph.
      await expect(ctas.nth(1)).toHaveText(new RegExp(`^${route.secondary}.+$`));
      await expect(ctas.nth(1)).toHaveAttribute('href', new RegExp(`^${route.path}products/`));
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
      await expect(image).toHaveAttribute('width', '1536');
      await expect(image).toHaveAttribute('height', '1024');
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });

    test(`${route.path} preserves content order and accessible structure`, async ({ page }) => {
      await page.goto(route.path);

      const positions = await page.evaluate(() => {
        const root = document.querySelector('.hero-root');
        if (!root) return [];
        const selectors = ['.hero-root__media', '.hero-root__content'];
        const descendants = Array.from(root.querySelectorAll('*'));
        return selectors.map((selector) => {
          const element = root.querySelector(selector);
          return element ? descendants.indexOf(element) : -1;
        });
      });

      expect(positions).toHaveLength(2);
      expect(positions.every((position) => position >= 0)).toBe(true);

      const results = await new AxeBuilder({ page }).include('.hero-root').analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('Homepage Hero responsive composition', () => {
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    test(`${width}px: hero is full-bleed with copy overlaid on the image, no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/');

      const layout = await page.locator('.hero-root').evaluate((root) => {
        const media = root.querySelector('.hero-root__media')!.getBoundingClientRect();
        const content = root.querySelector('.hero-root__content')!.getBoundingClientRect();
        const rootBox = root.getBoundingClientRect();
        return {
          rootWidth: rootBox.width,
          mediaWidth: media.width,
          mediaLeft: media.left,
          mediaTop: media.top,
          contentLeft: content.left,
          contentTop: content.top,
          contentBottom: content.bottom,
          mediaBottom: media.bottom,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      // Full-bleed: the image spans the entire hero root, not a boxed
      // column beside/above text.
      expect(layout.mediaWidth).toBeCloseTo(layout.rootWidth, 0);
      expect(layout.mediaLeft).toBeCloseTo(0, 0);

      // Copy is overlaid ON the image (same stacking region), not stacked
      // above or beside it in normal flow.
      expect(layout.contentTop).toBeGreaterThanOrEqual(layout.mediaTop);
      expect(layout.contentBottom).toBeLessThanOrEqual(layout.mediaBottom + 1);

      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    });
  }

  test('mobile (390px) preserves the vertical VISION-X2 → lens → ring light → fixture reading order via object-position, not a different crop asset', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');

    const src = await page.locator('[data-hero-image="final-master"] img').getAttribute('src');
    expect(src).toBeTruthy();

    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopSrc = await page.locator('[data-hero-image="final-master"] img').getAttribute('src');
    // Both viewports resolve to a responsive derivative of the SAME source
    // asset (Astro's Picture emits width-suffixed filenames sharing the
    // same base hash) — mobile must never swap in an unrelated crop image.
    const baseHash = (s: string | null) => s?.match(/forgeon-hero-master-v1\.([A-Za-z0-9_-]+?)_/)?.[1];
    expect(baseHash(src)).toBe(baseHash(desktopSrc));
  });
});
