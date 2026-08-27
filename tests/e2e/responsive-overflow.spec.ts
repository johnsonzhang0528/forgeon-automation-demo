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

test.describe('CC-02-01: /en/ 360px overflow regression', () => {
  // Root cause (see docs/DATUM_DECISION_LOG.md CC-02 entry and
  // CTABanner.astro's own inline comments): CTABanner.astro applied
  // margin-inline on its outer .cta-banner card using the same
  // --container-padding token that .container ALSO applies as
  // padding-inline on .cta-banner__inner — a double gutter that shrank
  // the CTA banner's actual content width and, combined with Button's
  // white-space: nowrap, overflowed the "Request Technical Advice" label
  // by exactly 17px at 360px. Fixed with a responsive outer margin AND a
  // component-scoped allowance for CTA button labels to wrap. Both fixes
  // are entirely inside CTABanner.astro — the Hero content/structure on
  // either locale's homepage was not touched.
  test('/en/ at 360px: scrollWidth <= clientWidth (no horizontal overflow)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/en/');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth})`).toBeLessThanOrEqual(clientWidth);
  });

  test('/en/ at 360px: no element extends past the viewport edge', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/en/');
    const offenders = await page.evaluate(() => {
      const clientWidth = document.documentElement.clientWidth;
      const hits: string[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return; // display:none etc.
        if (rect.right > clientWidth + 0.5 || rect.left < -0.5) {
          hits.push(`${el.tagName}.${(el.className || '').toString().split(' ').join('.')}`);
        }
      });
      return hits;
    });
    expect(offenders, `Elements extending past the 360px viewport: ${offenders.join(', ')}`).toEqual([]);
  });

  test('/en/ Final CTA buttons remain visible and within bounds at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/en/');
    // Phase 5G: the Homepage's Final CTA is now HomeFinalCTA.astro (.hfc),
    // not the shared CTABanner.astro (.cta-banner) — CTABanner itself is
    // untouched and still used verbatim on 13+ inner pages, so this
    // selector update is scoped to the homepage-only regression this test
    // actually checks (buttons fit within the 360px viewport).
    const banner = page.locator('.hfc');
    await banner.scrollIntoViewIfNeeded();
    const buttons = banner.locator('.btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(360 + 1);
      }
    }
  });
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
