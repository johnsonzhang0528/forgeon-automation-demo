import { test, expect } from '@playwright/test';
import { PAGE_TYPES } from './fixtures';

test.describe('404 handling', () => {
  test('zh-tw 404 page renders with an H1 and noindex', async ({ page }) => {
    // astro preview's static file server 404s on genuinely unmatched
    // routes rather than rewriting to a custom 404 page (that behavior is
    // host-specific, e.g. Netlify/Vercel rewrite rules) — so this
    // asserts on the actual built 404 page content directly rather than
    // relying on unmatched-route routing behavior this test harness
    // doesn't control.
    await page.goto('/zh-tw/404/');
    await expect(page.locator('h1')).toHaveCount(1);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toBe('noindex,nofollow');
  });

  test('en 404 page renders with an H1 and noindex', async ({ page }) => {
    await page.goto('/en/404/');
    await expect(page.locator('h1')).toHaveCount(1);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toBe('noindex,nofollow');
  });
});

test.describe('No console errors on any page type', () => {
  for (const page_ of PAGE_TYPES) {
    test(`${page_.name} has zero console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(page_.path);
      await page.waitForLoadState('networkidle');
      expect(errors, `Console errors on ${page_.path}: ${errors.join('; ')}`).toEqual([]);
    });
  }
});

test.describe('PDF datasheet download link', () => {
  test('AXM-400 product page datasheet link resolves to a real PDF', async ({ page, request }) => {
    await page.goto('/zh-tw/products/axm-400/');
    const link = page.locator('a[href$=".pdf"]').first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('/documents/forgeon-axm-400-datasheet.pdf');
    const res = await request.get(href!);
    expect(res.ok()).toBeTruthy();
    const contentType = res.headers()['content-type'];
    expect(contentType).toContain('pdf');
    const body = await res.body();
    // A valid PDF starts with the %PDF- magic bytes.
    expect(body.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });
});

test.describe('Language switch', () => {
  test('switching from zh-tw product detail lands on the equivalent en page, not a 404 or homepage fallback', async ({ page }) => {
    await page.goto('/zh-tw/products/axm-400/');
    const switcher = page.locator('a[hreflang="en"]').first();
    await switcher.click();
    await expect(page).toHaveURL(/\/en\/products\/axm-400\/?$/);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('switching from zh-tw insights detail lands on the equivalent en article', async ({ page }) => {
    await page.goto('/zh-tw/insights/automation-readiness-checklist/');
    const switcher = page.locator('a[hreflang="en"]').first();
    await switcher.click();
    await expect(page).toHaveURL(/\/en\/insights\/automation-readiness-checklist\/?$/);
    await expect(page.locator('h1')).toHaveCount(1);
  });
});

test.describe('FAQ accordion', () => {
  test('FAQ items expand/collapse with correct aria-expanded state and keyboard operability', async ({ page }) => {
    // vision-guided-assembly is the one solution with a full FAQ section
    // per docs/CONTENT_MATRIX.md.
    await page.goto('/zh-tw/solutions/vision-guided-assembly/');
    const toggle = page.locator('.faq-item__trigger').first();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const panelId = await toggle.getAttribute('aria-controls');
    const panel = page.locator(`#${panelId}`);
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('role', 'region');

    // Keyboard: Enter/Space on a focused button should also toggle (native
    // <button> behavior, verified rather than assumed).
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('prefers-reduced-motion', () => {
  test('motion durations collapse to 0ms when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/zh-tw/');
    const duration = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--duration-fast').trim()
    );
    expect(duration).toBe('0ms');
  });
});
