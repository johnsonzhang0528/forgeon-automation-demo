import { test, expect, type Page } from '@playwright/test';

const ROUTES = ['/zh-tw/', '/en/'] as const;

declare global {
  interface Window {
    __heroIntersectionObservers: number;
  }
}

async function countIntersectionObservers(page: Page) {
  await page.addInitScript(() => {
    window.__heroIntersectionObservers = 0;
    const NativeObserver = window.IntersectionObserver;
    if (!NativeObserver) return;

    window.IntersectionObserver = class extends NativeObserver {
      constructor(...args: ConstructorParameters<typeof NativeObserver>) {
        window.__heroIntersectionObservers += 1;
        super(...args);
      }
    };
  });
}

test.describe('Static photographic Hero behavior', () => {
  for (const path of ROUTES) {
    test(`${path} is complete on first render and creates no Hero motion observer`, async ({ page }) => {
      await countIntersectionObservers(page);
      await page.goto(path);

      const hero = page.locator('[data-hero-motion-root]');
      await expect(hero).toHaveAttribute('data-motion-state', 'settled');
      await expect(hero.locator('h1')).toBeVisible();
      await expect(hero.locator('.hero-root__body')).toBeVisible();
      await expect(hero.locator('.hero-root__ctas')).toBeVisible();
      await expect(hero.locator('.hero-root__media img')).toBeVisible();
      expect(await page.evaluate(() => window.__heroIntersectionObservers)).toBe(0);

      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(150);
      await expect(hero).toHaveAttribute('data-motion-state', 'settled');
    });

    test(`${path} remains usable with JavaScript disabled`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(path);

      const hero = page.locator('.hero-root');
      await expect(hero.locator('h1')).toBeVisible();
      await expect(hero.locator('.hero-root__body')).toBeVisible();
      await expect(hero.locator('.hero-root__media img')).toBeVisible();
      await expect(hero.locator('.hero-root__ctas a')).toHaveCount(2);

      await context.close();
    });

    test(`${path} removes image animation under reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);

      const styles = await page.locator('.hero-root__media img').evaluate((image) => {
        const computed = getComputedStyle(image);
        return {
          animationName: computed.animationName,
          transitionDuration: computed.transitionDuration,
          transform: computed.transform,
        };
      });

      expect(styles.animationName).toBe('none');
      expect(styles.transitionDuration).toBe('0s');
      expect(styles.transform).toBe('none');

      const ctas = page.locator('.hero-root__ctas a');
      for (let index = 0; index < 2; index += 1) {
        await ctas.nth(index).focus();
        await expect(ctas.nth(index)).toBeFocused();
        await expect(ctas.nth(index)).toHaveCSS('pointer-events', 'auto');
      }
    });
  }
});
