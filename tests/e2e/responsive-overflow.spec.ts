import { test, expect } from '@playwright/test';
import { VIEWPORTS, PAGE_TYPES } from './fixtures';

test.describe('No horizontal overflow at any required viewport (spec P0.1)', () => {
  for (const vp of VIEWPORTS) {
    for (const page_ of PAGE_TYPES) {
      test(`${page_.name} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(page_.path);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth}) on ${page_.path} at ${vp.name}`).toBeLessThanOrEqual(clientWidth);
      });
    }
  }
});

test.describe('Mobile header contents (< 960px)', () => {
  test('mobile header shows only logo, language switcher, and menu toggle — no full-width desktop CTA', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');

    // Desktop nav must be hidden below 960px.
    await expect(page.locator('.desktop-nav')).toBeHidden();

    // The desktop CTA wrapper must be hidden below 960px (this is the
    // exact P0.1 bug: it used to render full-width because the
    // hide-below-960px rule never matched the real DOM node).
    const desktopCtaWrapper = page.locator('.site-header__cta');
    await expect(desktopCtaWrapper).toBeHidden();

    // Toggle must be visible and fully clickable (not clipped offscreen).
    const toggle = page.locator('[data-mobile-nav-toggle]');
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    const viewportSize = page.viewportSize();
    if (box && viewportSize) {
      expect(box.x + box.width).toBeLessThanOrEqual(viewportSize.width + 1); // +1px rounding tolerance
      expect(box.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('desktop CTA is visible at >= 960px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/zh-tw/');
    await expect(page.locator('.site-header__cta')).toBeVisible();
    await expect(page.locator('.desktop-nav')).toBeVisible();
    await expect(page.locator('[data-mobile-nav-toggle]')).toBeHidden();
  });
});
