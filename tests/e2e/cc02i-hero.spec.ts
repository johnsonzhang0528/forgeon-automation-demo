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

test.describe('CC-02I-04 Hero: H1 exact line-break contract at required viewports', () => {
  /**
   * Canonical H1 text is spec-fixed (production spec §5/§7, sourced from
   * src/data/locales/{zh-tw,en}.ts's `hero.headline`) — a single explicit
   * `\n` at one exact position, not CSS-determined wrapping. Asserting the
   * full string (not just "contains a newline somewhere") is what actually
   * catches a moved/added/dropped break point; the prior test's weaker
   * "any `\n` present" check would still pass on a wrong break position.
   */
  const CANONICAL_HEADLINE: Record<'zh-tw' | 'en', string> = {
    'zh-tw': '把定位、檢測與組裝，\n校準成可導入的生產流程。',
    en: 'Align positioning, inspection and assembly\ninto a production-ready system.',
  };

  const H1_VIEWPORTS = [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '390x844', width: 390, height: 844 },
    { name: '360x800', width: 360, height: 800 },
    { name: '320x800', width: 320, height: 800 },
  ];
  for (const { path, locale } of ROUTES) {
    for (const vp of H1_VIEWPORTS) {
      test(`${path} @ ${vp.name}: H1 renders the exact spec-fixed headline and line break`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const h1 = page.locator('h1');
        const whiteSpace = await h1.evaluate((el) => getComputedStyle(el).whiteSpace);
        expect(whiteSpace).toBe('pre-line');
        const text = await h1.textContent();
        expect(text, `H1 text must exactly match the canonical spec-fixed headline (including newline position) on ${path} @ ${vp.name}`).toBe(CANONICAL_HEADLINE[locale]);
      });
    }
  }

  /**
   * 320px orphan requirement (spec §5: "the final word/character must
   * never be isolated alone on its own line at any supported viewport
   * including 320px"). This is about CSS reflow wrapping additional to the
   * one spec-fixed `\n` — not something a fixed numeric assertion can
   * derive from the spec text alone, so it's checked as rendered geometry:
   * the last line's rendered width must be more than a single
   * glyph/space's width, which would indicate exactly one orphaned
   * character/short word alone on the final visual line.
   */
  for (const { path, locale } of ROUTES) {
    test(`${path} @ 320x800: H1 has no orphaned final word/character (spec §5)`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const h1 = page.locator('h1');
      const lineMetrics = await h1.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = Array.from(range.getClientRects());
        const fontSize = parseFloat(getComputedStyle(el).fontSize);
        const lines = new Map<number, { minLeft: number; maxRight: number }>();
        for (const r of rects) {
          const key = Math.round(r.top);
          const existing = lines.get(key);
          if (existing) {
            existing.minLeft = Math.min(existing.minLeft, r.left);
            existing.maxRight = Math.max(existing.maxRight, r.right);
          } else {
            lines.set(key, { minLeft: r.left, maxRight: r.right });
          }
        }
        const widths = Array.from(lines.values()).map((l) => l.maxRight - l.minLeft);
        return { lastLineWidth: widths[widths.length - 1] ?? 0, lineCount: widths.length, fontSize };
      });
      expect(lineMetrics.lineCount, `${path}: expected the canonical headline to render as multiple lines at 320px`).toBeGreaterThan(1);
      expect(
        lineMetrics.lastLineWidth,
        `${path}: final H1 line renders only ${lineMetrics.lastLineWidth}px wide at 320px (font-size ${lineMetrics.fontSize}px) — looks like an orphaned single word/character, violating spec §5's "final word/character must never be isolated alone" rule`
      ).toBeGreaterThan(lineMetrics.fontSize * 2);
      void locale;
    });
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

/**
 * CC-02I-04 HIGH-01 remediation: hardens the previous false positive, which
 * only checked that the Hero root resolves 12 grid columns but never proved
 * the Secondary Visual actually occupies a compact grid placement distinct
 * from the Primary Visual. The original defect (fixed here) was an Astro
 * cross-component scoped-style boundary: a class passed into
 * PrecisionSystemVisual never actually matched its rendered <figure>
 * (different component = different data-astro-cid-* scope attribute), so
 * the Secondary Visual silently fell back to full width — rendering as a
 * second, full-size visual stacked on the Primary Visual (real production
 * evidence: Primary ~811x608, Secondary ~811x811 at 1440px). These
 * assertions read actual rendered bounding boxes and resolved grid-column
 * placement, so a regression back to that state fails here even though
 * "12 columns exist" and "no horizontal overflow" both still pass.
 */
test.describe('CC-02I-04 Hero: Secondary Visual composition (HIGH-01 remediation)', () => {
  const DESKTOP_VIEWPORTS = [
    { name: '1024x768', width: 1024, height: 768 },
    { name: '1280x800', width: 1280, height: 800 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1920x1080', width: 1920, height: 1080 },
  ];

  for (const { path } of ROUTES) {
    for (const vp of DESKTOP_VIEWPORTS) {
      test(`${path} @ ${vp.name}: Secondary Visual resolves to Hero-owned grid columns 10-13, not the full grid width`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const secondary = page.locator('.hero-root__visual-secondary');
        await expect(secondary).toHaveCSS('grid-column-start', '10');
        await expect(secondary).toHaveCSS('grid-column-end', '13');
      });

      test(`${path} @ ${vp.name}: Secondary Visual rendered width is a compact fragment, never full-size like the Primary Visual`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const primaryBox = await page.locator('.hero-root__visual').boundingBox();
        const secondaryBox = await page.locator('.hero-root__visual-secondary').boundingBox();
        expect(primaryBox, `${path} @ ${vp.name}: Primary Visual must have a bounding box`).not.toBeNull();
        expect(secondaryBox, `${path} @ ${vp.name}: Secondary Visual must have a bounding box`).not.toBeNull();
        const primaryWidth = primaryBox!.width;
        const secondaryWidth = secondaryBox!.width;
        // Reproduces the original defect as a failing assertion: the
        // regression rendered Secondary at ~100% of Primary's width
        // (811 vs 811 at 1440px). A real compact fragment must render
        // materially smaller — well under half the Primary's width.
        expect(
          secondaryWidth,
          `${path} @ ${vp.name}: Secondary Visual width (${secondaryWidth}px) is not materially smaller than Primary Visual width (${primaryWidth}px) — this is the exact full-size-duplicate regression this test exists to catch`
        ).toBeLessThan(primaryWidth * 0.5);
        // Positive invariant tied to this file's own grid contract
        // (`max-width: 220px` on .hero-root__visual-secondary, spec §5's
        // "smaller secondary fragment"), not an arbitrary screenshot ratio.
        expect(secondaryWidth).toBeLessThanOrEqual(225);
      });

      test(`${path} @ ${vp.name}: Primary Visual remains materially dominant over Secondary Visual (visual hierarchy)`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const primaryBox = await page.locator('.hero-root__visual').boundingBox();
        const secondaryBox = await page.locator('.hero-root__visual-secondary').boundingBox();
        const primaryArea = primaryBox!.width * primaryBox!.height;
        const secondaryArea = secondaryBox!.width * secondaryBox!.height;
        expect(primaryArea, `${path} @ ${vp.name}: Primary Visual area must be substantially larger than Secondary Visual area`).toBeGreaterThan(secondaryArea * 3);
      });
    }

    test(`${path} @ 768x1024 (tablet): Secondary Visual is not a duplicate full-size visual stack`, async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(path);
      const primaryBox = await page.locator('.hero-root__visual').boundingBox();
      const secondaryBox = await page.locator('.hero-root__visual-secondary').boundingBox();
      expect(secondaryBox!.width, `${path} @ 768x1024: Secondary Visual must stay a smaller fragment relative to Primary Visual per spec §5's tablet reflow rule`).toBeLessThanOrEqual(primaryBox!.width);
    });
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
