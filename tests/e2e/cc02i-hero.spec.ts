import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * CC-02I-04 production Hero tests. Covers: H1 uniqueness and line-break
 * correctness, fixed DOM order (ticket §8, at every required viewport),
 * grid column placement, CTA presence/order/real hrefs, content-integrity,
 * motion-root bootstrap attributes, and rendered-DOM SVG ID presence/
 * uniqueness for the CC-02I-05 primitives now integrated on a real page
 * (CC-02I-R2-FIX-01 cross-reference).
 *
 * Local viewport matrix per spec §14 (eight fixed breakpoints, 320px
 * mandatory) — tests/e2e/fixtures.ts's shared VIEWPORTS array does not
 * include 320px and extending it is outside this ticket's allowed paths,
 * so this spec defines its own matrix per the ticket's explicit allowance.
 */

const ROUTES: Array<{ path: string; lang: string; locale: 'zh-tw' | 'en' }> = [
  { path: '/zh-tw/', lang: 'zh-Hant-TW', locale: 'zh-tw' },
  { path: '/en/', lang: 'en', locale: 'en' },
];

const HERO_VIEWPORTS = [
  { name: '320x800', width: 320, height: 800 },
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

const DOM_ORDER_SELECTORS = [
  '.hero-root__origin',
  '.hero-root__eyebrow',
  '.hero-root__headline',
  '.hero-root__body',
  '.hero-root__ctas',
  '.hero-root__visual',
  '.hero-root__ledger',
  '.hero-root__rail',
];

test.describe('CC-02I-04 Hero: exactly one H1 per homepage route', () => {
  for (const { path } of ROUTES) {
    test(`${path} has exactly one <h1>`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    });

    test(`${path} <h1> is the Hero headline`, async ({ page }) => {
      await page.goto(path);
      const h1 = page.locator('h1');
      await expect(h1).toHaveClass(/hero-root__headline/);
    });
  }
});

test.describe('CC-02I-04 Hero: fixed DOM order (ticket §8)', () => {
  for (const { path } of ROUTES) {
    test(`${path} nine landmark elements appear in fixed source order`, async ({ page }) => {
      await page.goto(path);
      const positions = await page.evaluate((selectors: string[]) => {
        const root = document.querySelector('[data-hero-motion-root]');
        if (!root) return null;
        const all = Array.from(root.querySelectorAll('*'));
        return selectors.map((sel) => {
          const el = root.querySelector(sel);
          return el ? all.indexOf(el) : -1;
        });
      }, DOM_ORDER_SELECTORS);

      expect(positions).not.toBeNull();
      const found = positions as number[];
      for (const pos of found) {
        expect(pos).toBeGreaterThanOrEqual(0);
      }
      for (let i = 1; i < found.length; i++) {
        expect(found[i], `${DOM_ORDER_SELECTORS[i]} must come after ${DOM_ORDER_SELECTORS[i - 1]} in DOM order`).toBeGreaterThan(found[i - 1]);
      }
    });

    test(`${path} Datum Origin precedes H1 in DOM order`, async ({ page }) => {
      await page.goto(path);
      const order = await page.evaluate(() => {
        const root = document.querySelector('[data-hero-motion-root]');
        if (!root) return null;
        const all = Array.from(root.querySelectorAll('*'));
        const origin = root.querySelector('.hero-root__origin');
        const h1 = root.querySelector('h1');
        return origin && h1 ? all.indexOf(origin) < all.indexOf(h1) : null;
      });
      expect(order).toBe(true);
    });

    test(`${path} both CTAs precede the Primary System Visual in DOM order`, async ({ page }) => {
      await page.goto(path);
      const order = await page.evaluate(() => {
        const root = document.querySelector('[data-hero-motion-root]');
        if (!root) return null;
        const all = Array.from(root.querySelectorAll('*'));
        const ctas = root.querySelector('.hero-root__ctas');
        const visual = root.querySelector('.hero-root__visual');
        return ctas && visual ? all.indexOf(ctas) < all.indexOf(visual) : null;
      });
      expect(order).toBe(true);
    });
  }
});

test.describe('CC-02I-04 Hero: motion bootstrap DOM hook (R2-02)', () => {
  for (const { path } of ROUTES) {
    test(`${path} Hero root carries data-hero-motion-root and data-motion-state="settled"`, async ({ page }) => {
      await page.goto(path);
      const root = page.locator('[data-hero-motion-root]');
      await expect(root).toHaveCount(1);
      await expect(root).toHaveAttribute('data-motion-state', 'settled');
    });

    test(`${path} Motion Bootstrap mount point precedes Primary Visual markup`, async ({ page }) => {
      await page.goto(path);
      const html = await page.locator('[data-hero-motion-root]').innerHTML();
      const mountIdx = html.indexOf('Motion Bootstrap mount point');
      const visualIdx = html.indexOf('hero-root__visual');
      expect(mountIdx).toBeGreaterThanOrEqual(0);
      expect(visualIdx).toBeGreaterThan(mountIdx);
    });
  }
});

test.describe('CC-02I-04 Hero: CTA order, distinctness, and real hrefs', () => {
  for (const { path, locale } of ROUTES) {
    test(`${path} Primary and Secondary CTA are distinct elements in Primary-then-Secondary order`, async ({ page }) => {
      await page.goto(path);
      const ctaButtons = page.locator('.hero-root__ctas a.btn');
      await expect(ctaButtons).toHaveCount(2);

      const primary = ctaButtons.nth(0);
      const secondary = ctaButtons.nth(1);
      await expect(primary).toHaveClass(/btn--primary/);
      await expect(secondary).toHaveClass(/btn--secondary/);
      const [primaryHandle, secondaryHandle] = await Promise.all([primary.elementHandle(), secondary.elementHandle()]);
      const areDistinct = await page.evaluate(
        ([a, b]) => a !== b,
        [primaryHandle, secondaryHandle]
      );
      expect(areDistinct).toBe(true);
    });

    test(`${path} CTAs link to real /${locale}/contact/ routes with correct intent`, async ({ page }) => {
      await page.goto(path);
      const ctaButtons = page.locator('.hero-root__ctas a.btn');
      await expect(ctaButtons.nth(0)).toHaveAttribute('href', `/${locale}/contact/?intent=project`);
      await expect(ctaButtons.nth(1)).toHaveAttribute('href', `/${locale}/contact/?intent=technical-advice`);
    });
  }
});

test.describe('CC-02I-04 Hero: H1 line-break contract at required viewports', () => {
  const H1_VIEWPORTS = [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '390x844', width: 390, height: 844 },
    { name: '360x800', width: 360, height: 800 },
    { name: '320x800', width: 320, height: 800 },
  ];
  for (const { path } of ROUTES) {
    for (const vp of H1_VIEWPORTS) {
      test(`${path} @ ${vp.name}: H1 renders the spec-fixed line break via white-space: pre-line`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const h1 = page.locator('h1');
        const whiteSpace = await h1.evaluate((el) => getComputedStyle(el).whiteSpace);
        expect(whiteSpace).toBe('pre-line');
        const text = await h1.textContent();
        expect(text).toContain('\n');
      });
    }
  }
});

test.describe('CC-02I-04 Hero: grid column placement at eight fixed breakpoints', () => {
  for (const { path } of ROUTES) {
    for (const vp of HERO_VIEWPORTS) {
      test(`${path} @ ${vp.name}: Hero root renders without horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `scrollWidth (${scrollWidth}) must be <= clientWidth (${clientWidth}) on ${path} @ ${vp.name}`).toBeLessThanOrEqual(clientWidth);
      });

      test(`${path} @ ${vp.name}: Hero root uses expected grid-template-columns`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const columns = await page.locator('.hero-root').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        if (vp.width >= 1024) {
          expect(columns).toBe(12);
        } else {
          expect(columns).toBe(1);
        }
      });
    }
  }
});

test.describe('CC-02I-04 Hero: content integrity (no fabricated numbers)', () => {
  for (const { path } of ROUTES) {
    test(`${path} Hero contains no fabricated engineering numbers`, async ({ page }) => {
      await page.goto(path);
      const heroHtml = await page.locator('[data-hero-motion-root]').innerHTML();
      expect(heroHtml).not.toContain('±0.01');
      expect(heroHtml).not.toContain('180 ms');
      expect(heroHtml).not.toContain('180ms');
      expect(heroHtml).not.toMatch(/\d+%\s*(faster|accuracy|precision|throughput)/i);
    });

    test(`${path} Evaluation Ledger renders exactly 3 groups`, async ({ page }) => {
      await page.goto(path);
      const rows = page.locator('.hero-root__ledger .eval-ledger__row');
      await expect(rows).toHaveCount(3);
    });
  }
});

test.describe('CC-02I-04 Hero: CC-02I-05 primitive integration (CC-02I-R2-FIX-01)', () => {
  for (const { path } of ROUTES) {
    test(`${path} Primary System Visual renders SVG with deterministic, present IDs`, async ({ page }) => {
      await page.goto(path);
      const svgIds = await page.locator('.hero-root__visual svg defs [id]').evaluateAll((els) => els.map((el) => el.id));
      expect(svgIds.length).toBeGreaterThan(0);
      for (const id of svgIds) {
        expect(id).toContain('homepage-hero-system');
      }
    });

    test(`${path} every element id in the document is unique (no duplicate SVG ids across Primary/Secondary Visual)`, async ({ page }) => {
      await page.goto(path);
      const duplicates = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
        const seen = new Map<string, number>();
        for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
        return Array.from(seen.entries()).filter(([, count]) => count > 1);
      });
      expect(duplicates, `Duplicate DOM ids found: ${JSON.stringify(duplicates)}`).toEqual([]);
    });

    test(`${path} Process Rail is focusable and has an aria-label`, async ({ page }) => {
      await page.goto(path);
      const rail = page.locator('.hero-root__rail .process-rail');
      await expect(rail).toHaveAttribute('tabindex', '0');
      const label = await rail.getAttribute('aria-label');
      expect(label).toBeTruthy();
      await rail.focus();
      await expect(rail).toBeFocused();
    });
  }
});

test.describe('CC-02I-04 Hero: axe accessibility (0 Critical, 0 Serious)', () => {
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
      if (criticalOrSerious.length > 0) {
        console.log(`axe violations on ${path} mobile:\n${criticalOrSerious.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n')}`);
      }
      expect(criticalOrSerious).toEqual([]);
    });
  }
});
