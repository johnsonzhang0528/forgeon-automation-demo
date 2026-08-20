import { test, expect } from '@playwright/test';

const DIAGRAM_ROUTES = [
  { locale: 'zh-tw', variant: 'vision-guided-assembly', path: '/zh-tw/solutions/vision-guided-assembly/', title: '從取像、定位到組裝確認的訊號路徑' },
  { locale: 'en', variant: 'vision-guided-assembly', path: '/en/solutions/vision-guided-assembly/', title: 'Signal Path from Image Capture to Assembly Confirmation' },
  { locale: 'zh-tw', variant: 'line-upgrade', path: '/zh-tw/solutions/line-upgrade/', title: '保留舊設備時，新舊系統的介面邊界' },
  { locale: 'en', variant: 'line-upgrade', path: '/en/solutions/line-upgrade/', title: 'Interface Boundaries Between Retained and New Equipment' },
] as const;

test.describe('engineering architecture diagrams', () => {
  for (const route of DIAGRAM_ROUTES) {
    test(`${route.path} renders the localized ${route.variant} architecture`, async ({ page }) => {
      await page.goto(route.path);
      const diagram = page.locator(`[data-engineering-diagram="${route.variant}"]`);
      await expect(diagram).toHaveCount(1);
      await expect(diagram).toContainText(route.title);
      await expect(diagram).toHaveAttribute('data-stage-count', '4');
      await expect(diagram.locator('[data-diagram-stage]')).toHaveCount(4);
      await expect(diagram.locator('dl dt')).toHaveCount(2);
      await expect(diagram.locator('figcaption')).not.toBeEmpty();
    });
  }

  for (const variant of ['vision-guided-assembly', 'line-upgrade'] as const) {
    for (const width of [360, 768, 1280]) {
      test(`${variant} remains readable and contained at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/zh-tw/solutions/${variant}/`);

        const geometry = await page.locator(`[data-engineering-diagram="${variant}"]`).evaluate((diagram) => {
          const rect = diagram.getBoundingClientRect();
          const stages = [...diagram.querySelectorAll<HTMLElement>('[data-diagram-stage]')].map((stage) => stage.getBoundingClientRect());
          const lastStage = stages[stages.length - 1];

          return {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: document.documentElement.scrollWidth,
            firstStage: stages[0] ? { x: stages[0].x, y: stages[0].y } : null,
            lastStage: lastStage ? { x: lastStage.x, y: lastStage.y } : null,
          };
        });

        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
        expect(geometry.width).toBeGreaterThan(0);
        expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
        expect(geometry.firstStage).not.toBeNull();
        expect(geometry.lastStage).not.toBeNull();

        if (width < 960) {
          expect(geometry.lastStage!.y).toBeGreaterThan(geometry.firstStage!.y);
        } else {
          expect(geometry.lastStage!.x).toBeGreaterThan(geometry.firstStage!.x);
        }
      });
    }
  }
});
