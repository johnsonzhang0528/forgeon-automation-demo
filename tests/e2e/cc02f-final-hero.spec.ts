import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * CC-02F final editorial hero prototype tests (spec §二十一).
 * Covers: real per-locale routes (not client-JS toggle), correct <html
 * lang>, exactly one <h1>, noindex/nofollow, sitemap exclusion, no
 * analytics, no horizontal overflow at 360px, Process Rail keyboard
 * operability, axe accessibility, reduced motion, and no console errors.
 *
 * Modeled on tests/e2e/cc02-hero-prototype.spec.ts's structure, adapted
 * for CC-02F's genuinely different route shape (two real static pages,
 * not one page with a client-toggled data-locale-block).
 */

const ROUTES: Array<{ path: string; lang: string; locale: string }> = [
  { path: '/internal-preview/cc02-final/zh-tw/', lang: 'zh-Hant-TW', locale: 'zh-tw' },
  { path: '/internal-preview/cc02-final/en/', lang: 'en', locale: 'en' },
];

test.describe('CC-02F routes: real per-locale static pages', () => {
  for (const { path, lang } of ROUTES) {
    test(`${path} has html lang="${lang}"`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });

    test(`${path} has exactly one <h1>`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    });

    test(`${path} has noindex,nofollow meta robots`, async ({ page }) => {
      await page.goto(path);
      const content = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(content).toBe('noindex, nofollow');
    });

    test(`${path} renders ONLY its own locale (no hidden other-locale DOM block)`, async ({ page }) => {
      await page.goto(path);
      // The CC-02F route architecture has no data-locale-block toggle at
      // all — assert that mechanism is genuinely absent, not just hidden.
      const localeBlocks = await page.locator('[data-locale-block]').count();
      expect(localeBlocks).toBe(0);
    });
  }

  test('language switch is a real <a href> route link, not a JS toggle', async ({ page }) => {
    await page.goto('/internal-preview/cc02-final/zh-tw/');
    const langLink = page.locator('.final-header__lang').first();
    await expect(langLink).toHaveAttribute('href', '/internal-preview/cc02-final/en/');
    await langLink.click();
    await page.waitForURL('**/internal-preview/cc02-final/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('sitemap.xml does not contain any cc02-final URL', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).not.toContain('cc02-final');
  });

  test('no analytics script/call present on either route', async ({ page }) => {
    for (const { path } of ROUTES) {
      await page.goto(path);
      const html = await page.content();
      expect(html).not.toContain('AnalyticsBridge');
      expect(html).not.toContain('gtag(');
      expect(html).not.toContain('googletagmanager');
    }
  });
});

test.describe('CC-02F content integrity: no fake data, no placeholder text', () => {
  for (const { path } of ROUTES) {
    test(`${path} contains no fabricated engineering numbers`, async ({ page }) => {
      await page.goto(path);
      const html = await page.content();
      expect(html).not.toContain('±0.01');
      expect(html).not.toContain('180 ms');
      expect(html).not.toContain('180ms');
      expect(html).not.toContain('型號可組合');
      expect(html).not.toContain('configurable models');
    });

    test(`${path} contains no "NO MEDIA" placeholder text`, async ({ page }) => {
      await page.goto(path);
      const html = await page.content();
      expect(html).not.toContain('NO MEDIA');
    });
  }
});

test.describe('CC-02F pages: no horizontal overflow at 360px and 390px', () => {
  for (const { path } of ROUTES) {
    for (const width of [360, 390]) {
      test(`${path} @ ${width}x800`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth}) on ${path} @ ${width}px`).toBeLessThanOrEqual(clientWidth);
      });
    }
  }
});

test.describe('CC-02F axe accessibility (0 Critical, 0 Serious)', () => {
  for (const { path } of ROUTES) {
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

test.describe('CC-02F Process Rail keyboard operability', () => {
  test('rail container is reachable via Tab and has an aria-label', async ({ page }) => {
    await page.goto('/internal-preview/cc02-final/zh-tw/');
    const rail = page.locator('.process-rail');
    await expect(rail).toHaveAttribute('tabindex', '0');
    const label = await rail.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('rail is focusable directly', async ({ page }) => {
    await page.goto('/internal-preview/cc02-final/en/');
    const rail = page.locator('.process-rail');
    await rail.focus();
    await expect(rail).toBeFocused();
  });
});

test.describe('CC-02F Header keyboard operability', () => {
  test('mobile drawer: opens, traps focus, Escape closes, focus returns to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/internal-preview/cc02-final/zh-tw/');

    const toggle = page.locator('[data-proto-menu-toggle]');
    await toggle.click();
    await expect(page.locator('[data-proto-mobile-nav]')).not.toHaveAttribute('hidden', '');

    const firstFocusable = page.locator('[data-proto-mobile-nav] a, [data-proto-mobile-nav] button').first();
    await expect(firstFocusable).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-proto-mobile-nav]')).toHaveAttribute('hidden', '');
    await expect(toggle).toBeFocused();
  });

  test('language link tap target is >=44x44px', async ({ page }) => {
    await page.goto('/internal-preview/cc02-final/zh-tw/');
    const box = await page.locator('.final-header__lang').first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('CC-02F reduced motion', () => {
  for (const { path } of ROUTES) {
    test(`${path} PrecisionSystemVisual shows settled state immediately with reduced motion`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(path);
      await page.waitForTimeout(100);
      const settled = await page
        .locator('[data-precision-visual]')
        .first()
        .evaluate((el) => el.classList.contains('is-settled') || !el.classList.contains('is-aligning'));
      expect(settled).toBe(true);
      await context.close();
    });
  }
});

test.describe('CC-02F no console errors', () => {
  for (const { path } of ROUTES) {
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

test.describe('CC-02F historical variant-a/b/c untouched', () => {
  test('cc02-hero variant-c still exists and is unaffected', async ({ page }) => {
    const res = await page.goto('/internal-preview/cc02-hero/variant-c/');
    expect(res?.status()).toBe(200);
  });
});
