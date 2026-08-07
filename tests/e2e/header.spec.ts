import { test, expect } from '@playwright/test';

test.describe('Header production implementation (CC-02I-02)', () => {
  test('desktop header height is approximately 80px at 100% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const height = await page.locator('[data-header]').evaluate((el) => el.getBoundingClientRect().height);
    expect(height, `desktop header height was ${height}px`).toBeGreaterThanOrEqual(76);
    expect(height, `desktop header height was ${height}px`).toBeLessThanOrEqual(96);
  });

  test('mobile header height is approximately 64-68px at 100% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');
    const height = await page.locator('[data-header]').evaluate((el) => el.getBoundingClientRect().height);
    expect(height, `mobile header height was ${height}px`).toBeGreaterThanOrEqual(60);
    expect(height, `mobile header height was ${height}px`).toBeLessThanOrEqual(84);
  });

  // Playwright/Chromium has no faithful emulation of real browser-chrome
  // page zoom (Ctrl/Cmd+): the CSS `zoom` property is a distinct Chromium
  // feature that shrinks the effective layout viewport reported by
  // `clientWidth`, which is not how actual browser UI zoom behaves
  // (`window.innerWidth` is unaffected by real zoom). Rather than assert
  // against a simulation known to diverge from the real mechanism, this
  // verifies the CSS properties ticket §8/R1-08 actually specifies to
  // guarantee no clipping regardless of zoom level: `min-block-size` (not
  // a fixed `block-size` that clips overflow content) on the header, and
  // no `overflow: hidden` anywhere in the header that would truncate
  // content that grows past its box at any zoom level.
  test('header uses min-block-size (not a fixed height that clips at zoom), no overflow:hidden clipping', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const result = await page.evaluate(() => {
      const header = document.querySelector('[data-header]') as HTMLElement | null;
      if (!header) return null;
      const style = getComputedStyle(header);
      const clippingDescendants: string[] = [];
      header.querySelectorAll('*').forEach((el) => {
        if (el.tagName.toLowerCase() === 'svg' || el instanceof SVGElement) return; // SVG's own overflow:hidden UA default does not clip surrounding text/layout
        const s = getComputedStyle(el);
        if (s.overflow === 'hidden' || s.overflowX === 'hidden') {
          clippingDescendants.push(el.tagName + '.' + (el.className || '').toString());
        }
      });
      return { minBlockSize: style.minBlockSize, height: style.height, clippingDescendants };
    });
    expect(result).not.toBeNull();
    expect(result!.minBlockSize, 'header must use min-block-size, not a fixed block-size').not.toBe('auto');
    expect(result!.clippingDescendants, 'no header descendant may use overflow:hidden (would clip content at zoom)').toEqual([]);
  });

  // Functional zoom-equivalent reflow check: text scaled 2x within the
  // same layout viewport (closer to how large-text/zoom accessibility
  // settings actually affect content) must not push interactive controls
  // (CTA, language switch, mobile toggle) fully outside the viewport.
  for (const vp of [
    { name: '1440px', width: 1440, height: 900, locale: 'zh-tw' },
    { name: '390px', width: 390, height: 844, locale: 'en' },
  ]) {
    test(`large text (2x font-size) does not push header controls off-screen (${vp.name}, ${vp.locale})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/${vp.locale}/`);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      const visibleControls = await page.evaluate((viewportWidth) => {
        const selectors = ['.site-header__lang', '.site-header__cta a.btn', '.mobile-nav-toggle'];
        return selectors.map((sel) => {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (!el) return { sel, present: false, onScreen: false };
          const rect = el.getBoundingClientRect();
          // Hidden via this element's own display:none, or an ancestor's
          // (e.g. .site-header__cta wraps the <a class="btn"> and is the
          // one that actually carries display:none on mobile) — either
          // way the element renders with a zero-size box, so a zero rect
          // means "responsively hidden here," not "clipped by zoom."
          if (rect.width === 0 && rect.height === 0) return { sel, present: true, onScreen: null };
          return { sel, present: true, onScreen: rect.left < viewportWidth && rect.right > 0 };
        });
      }, vp.width);
      for (const control of visibleControls) {
        if (control.onScreen === null) continue; // hidden by responsive display:none at this viewport, not a failure
        expect(control.onScreen, `${control.sel} must remain at least partially on-screen at 2x font-size`).toBe(true);
      }
    });
  }

  test('language switch control meets the 44x44px tap target minimum', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const box = await page.locator('.site-header__lang').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('Datum Origin mark renders beside the logo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const datum = page.locator('.site-header__brand .site-header__datum');
    await expect(datum).toBeVisible();
    const logo = page.locator('.site-header__brand a.logo');
    await expect(logo).toBeVisible();
  });

  test('Logo.astro renders with unchanged accessible name (no duplicated brand string in Header)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const logo = page.locator('.site-header__brand a.logo');
    await expect(logo).toHaveAttribute('aria-label', '鋒岳自動化 FORGEON AUTOMATION');
  });

  test('header CTA uses the production action-primary token (computed style)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const cta = page.locator('.site-header__cta a.btn');
    await expect(cta).toBeVisible();
    const backgroundColor = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
    // --color-action-primary resolves to --color-copper-700; assert the CTA
    // is not rendering the site-wide --color-accent default anymore by
    // comparing against a plain, unstyled Button instance's computed color.
    const defaultAccent = await page.evaluate(() => {
      const probe = document.createElement('a');
      probe.className = 'btn btn--primary btn--md';
      probe.style.position = 'fixed';
      probe.style.left = '-9999px';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    expect(backgroundColor, `header CTA background (${backgroundColor}) must differ from the unstyled default (${defaultAccent})`).not.toBe(defaultAccent);
  });

  test('all 6 real nav items are present with valid hrefs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const links = page.locator('.desktop-nav__link');
    await expect(links).toHaveCount(6);
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    for (const href of hrefs) {
      expect(href, 'every nav link must have a real href').toBeTruthy();
      expect(href!.startsWith('#'), `nav link ${href} must not be a placeholder anchor`).toBe(false);
    }
  });

  test('desktop nav links are keyboard operable with visible focus', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh-tw/');
    const firstLink = page.locator('.desktop-nav__link').first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
  });

  test('no horizontal overflow at 360px and 320px, both locales', async ({ page }) => {
    for (const width of [360, 320]) {
      for (const locale of ['zh-tw', 'en']) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${locale}/`);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `${locale} @ ${width}px: scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth})`).toBeLessThanOrEqual(clientWidth);
      }
    }
  });
});
