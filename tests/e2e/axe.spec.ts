import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGE_TYPES } from './fixtures';

test.describe('axe-core accessibility scan — 0 Critical, 0 Serious (spec section 5)', () => {
  for (const page_ of PAGE_TYPES) {
    test(`${page_.name} has no critical or serious axe violations`, async ({ page }) => {
      await page.goto(page_.path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const criticalOrSerious = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (criticalOrSerious.length > 0) {
        const summary = criticalOrSerious
          .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`)
          .join('\n');
        console.log(`axe violations on ${page_.path}:\n${summary}`);
      }

      expect(criticalOrSerious, `Critical/Serious axe violations on ${page_.path}`).toEqual([]);
    });
  }

  test('mobile nav open state has no critical/serious violations', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');
    await page.locator('[data-mobile-nav-toggle]').click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const criticalOrSerious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalOrSerious).toEqual([]);
  });
});
