import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * CC-02 Hero/Header design-spike prototype tests (spec §二十二).
 * Covers: noindex/nofollow, sitemap exclusion, no horizontal overflow at
 * 360px, axe accessibility, Header keyboard operability, and
 * prefers-reduced-motion collapsing the one-shot VisionLockFrame animation
 * to its finished state.
 */

const VARIANT_PATHS = [
  '/internal-preview/cc02-hero/',
  '/internal-preview/cc02-hero/variant-a/',
  '/internal-preview/cc02-hero/variant-b/',
  '/internal-preview/cc02-hero/variant-c/',
];

test.describe('CC-02 prototype routes are excluded from indexing', () => {
  for (const path of VARIANT_PATHS) {
    test(`${path} has noindex,nofollow meta robots`, async ({ page }) => {
      await page.goto(path);
      const content = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(content).toBe('noindex, nofollow');
    });
  }

  test('sitemap.xml does not contain any cc02-hero URL', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).not.toContain('cc02-hero');
  });
});

test.describe('CC-02 variant pages: no horizontal overflow at 360px', () => {
  for (const path of ['/internal-preview/cc02-hero/variant-a/', '/internal-preview/cc02-hero/variant-b/', '/internal-preview/cc02-hero/variant-c/']) {
    test(`${path} @ 360x800`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth}) on ${path}`).toBeLessThanOrEqual(clientWidth);
    });
  }
});

test.describe('CC-02 variant pages: axe accessibility (0 Critical, 0 Serious)', () => {
  for (const path of ['/internal-preview/cc02-hero/variant-a/', '/internal-preview/cc02-hero/variant-b/', '/internal-preview/cc02-hero/variant-c/']) {
    test(`${path} desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const criticalOrSerious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      if (criticalOrSerious.length > 0) {
        console.log(`axe violations on ${path}:\n${criticalOrSerious.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n')}`);
      }
      expect(criticalOrSerious).toEqual([]);
    });

    test(`${path} mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const criticalOrSerious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(criticalOrSerious).toEqual([]);
    });
  }
});

test.describe('CC-02 Header keyboard operability', () => {
  test('mobile drawer: opens, traps focus, Escape closes, focus returns to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/internal-preview/cc02-hero/variant-a/');

    const toggle = page.locator('[data-proto-menu-toggle]');
    await toggle.click();
    await expect(page.locator('[data-proto-mobile-nav]')).not.toHaveAttribute('hidden', '');

    const firstFocusable = page.locator('[data-proto-mobile-nav] a, [data-proto-mobile-nav] button').first();
    await expect(firstFocusable).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-proto-mobile-nav]')).toHaveAttribute('hidden', '');
    await expect(toggle).toBeFocused();
  });

  test('language toggle switches locale and is keyboard-activatable', async ({ page }) => {
    await page.goto('/internal-preview/cc02-hero/variant-a/');
    const langBtn = page.locator('[data-proto-lang-toggle]').first();
    await langBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-locale', 'en');
    await expect(page.locator('[data-locale-block="en"]')).toBeVisible();
    await expect(page.locator('[data-locale-block="zh-tw"]')).toBeHidden();
  });
});

test.describe('CC-02 reduced motion', () => {
  test('variant-a VisionLockFrame shows locked state immediately with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/internal-preview/cc02-hero/variant-a/');
    // The one-shot lock animation should resolve to "is-locked" essentially
    // immediately (no 620ms delay) under reduced motion, per each Brand
    // Primitive's own @media (prefers-reduced-motion: reduce) handling.
    await page.waitForTimeout(100);
    const isLocked = await page.locator('.vision-lock').first().evaluate((el) => el.classList.contains('is-locked'));
    expect(isLocked).toBe(true);
    await context.close();
  });
});

test.describe('CC-02 no console errors', () => {
  for (const path of ['/internal-preview/cc02-hero/variant-a/', '/internal-preview/cc02-hero/variant-b/', '/internal-preview/cc02-hero/variant-c/']) {
    test(`${path} has no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(errors).toEqual([]);
    });
  }
});
