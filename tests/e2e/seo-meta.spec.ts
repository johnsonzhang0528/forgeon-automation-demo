import { test, expect } from '@playwright/test';
import { PAGE_TYPES } from './fixtures';

test.describe('SEO meta — H1, title, description, canonical, hreflang', () => {
  for (const page_ of PAGE_TYPES) {
    test(`${page_.name} has exactly one H1 (or is a recognized redirect exception)`, async ({ page }) => {
      await page.goto(page_.path);
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `${page_.path} should have exactly one <h1>`).toBe(1);
    });

    test(`${page_.name} has a non-empty title, description, and canonical`, async ({ page }) => {
      await page.goto(page_.path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description, `${page_.path} missing meta description`).toBeTruthy();
      expect((description || '').length).toBeGreaterThan(0);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, `${page_.path} missing canonical link`).toBeTruthy();
    });

    // The 404 page intentionally does not pass otherLocalePath to
    // BaseLayout (src/pages/{en,zh-tw}/404.astro) — a not-found page has no
    // real "same content, other language" counterpart to link to, so it
    // only emits its own locale's hreflang + x-default, not the other
    // locale's. This is correct SEO behavior, not a bug — assert
    // accordingly rather than requiring all three tags on every page type.
    const expectsFullHreflangSet = page_.name !== '404';
    test(`${page_.name} has ${expectsFullHreflangSet ? 'hreflang alternates for zh-Hant-TW, en, and x-default' : 'its own hreflang + x-default only (no otherLocalePath on 404)'}`, async ({ page }) => {
      await page.goto(page_.path);
      const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
        els.map((el) => el.getAttribute('hreflang'))
      );
      if (expectsFullHreflangSet) {
        expect(hreflangs).toContain('zh-Hant-TW');
        expect(hreflangs).toContain('en');
        expect(hreflangs).toContain('x-default');
      } else {
        expect(hreflangs).toContain('zh-Hant-TW');
        expect(hreflangs).toContain('x-default');
        expect(hreflangs).not.toContain('en');
      }
    });
  }
});

test.describe('Demo Mode indexing gate (spec P0.4)', () => {
  test('homepage ships noindex,nofollow meta robots by default (Demo Mode)', async ({ page }) => {
    await page.goto('/zh-tw/');
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toBe('noindex,nofollow');
  });

  test('robots.txt disallows all crawling by default (Demo Mode)', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('Disallow: /');
  });

  test('footer shows the Concept Project badge', async ({ page }) => {
    await page.goto('/zh-tw/');
    await expect(page.locator('.demo-mode-badge')).toBeVisible();
  });
});
