import { test, expect } from '@playwright/test';

const ROUTES = [
  {
    path: '/zh-tw/',
    presentation: 'wide',
    loading: 'lazy',
    priority: 'auto',
    caption: '代表性系統整合影像：輸送、定位治具、機械手臂作業、感測與輸出。',
  },
  {
    path: '/en/',
    presentation: 'wide',
    loading: 'lazy',
    priority: 'auto',
    caption: 'Representative system integration view: conveyor, locating fixtures, robotic operation, sensing and output.',
  },
  {
    path: '/zh-tw/solutions/',
    presentation: 'master',
    loading: 'eager',
    priority: 'high',
    caption: '代表性系統整合影像：輸送、定位治具、機械手臂作業、感測與輸出。',
  },
  {
    path: '/en/solutions/',
    presentation: 'master',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative system integration view: conveyor, locating fixtures, robotic operation, sensing and output.',
  },
] as const;

const CONTROL_ENGINEERING_ROUTES = [
  {
    path: '/zh-tw/about/',
    presentation: 'master',
    caption: '代表性控制工程影像：控制櫃配線、端子量測、PLC／I/O 與現場調試。',
  },
  {
    path: '/en/about/',
    presentation: 'master',
    caption: 'Representative control engineering view: cabinet wiring, terminal measurement, PLC and I/O, and on-site commissioning.',
  },
] as const;

const MACHINE_VISION_ROUTES = [
  {
    path: '/zh-tw/solutions/vision-inspection/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性機器視覺檢測影像：相機、鏡頭、環形光源、治具與工件的固定檢測關係。',
  },
  {
    path: '/en/solutions/vision-inspection/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative machine-vision inspection view: a fixed camera, lens and ring-light geometry aligned with fixtured workpieces.',
  },
  {
    path: '/zh-tw/products/vision-x2/',
    presentation: 'master',
    loading: 'lazy',
    priority: 'auto',
    caption: '代表性機器視覺檢測影像：相機、鏡頭、環形光源、治具與工件的固定檢測關係。',
  },
  {
    path: '/en/products/vision-x2/',
    presentation: 'master',
    loading: 'lazy',
    priority: 'auto',
    caption: 'Representative machine-vision inspection view: a fixed camera, lens and ring-light geometry aligned with fixtured workpieces.',
  },
] as const;

const PRECISION_HANDLING_ROUTES = [
  {
    path: '/zh-tw/solutions/precision-positioning/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性精密搬運影像：線性軸、Z 軸、平行夾爪、工件與治具的運動／負載關係。',
  },
  {
    path: '/en/solutions/precision-positioning/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative precision-handling view: the motion and load relationship between linear axes, a parallel gripper, workpiece and fixture.',
  },
  {
    path: '/zh-tw/products/axm-400/',
    presentation: 'master',
    loading: 'lazy',
    priority: 'auto',
    caption: '代表性精密搬運影像：線性軸、Z 軸、平行夾爪、工件與治具的運動／負載關係。',
  },
  {
    path: '/en/products/axm-400/',
    presentation: 'master',
    loading: 'lazy',
    priority: 'auto',
    caption: 'Representative precision-handling view: the motion and load relationship between linear axes, a parallel gripper, workpiece and fixture.',
  },
] as const;

const FIELD_COMMISSIONING_ROUTES = [
  {
    path: '/zh-tw/',
    presentation: 'wide',
    loading: 'lazy',
    priority: 'auto',
    caption: '代表性現場調試影像：控制端設定與設備端目視確認，呈現系統驗證與交付準備的協作關係。',
  },
  {
    path: '/en/',
    presentation: 'wide',
    loading: 'lazy',
    priority: 'auto',
    caption: 'Representative field-commissioning view: control-side setup and machine-side visual verification within a shared validation and handoff workflow.',
  },
  {
    path: '/zh-tw/solutions/custom-integration/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性現場調試影像：控制端設定與設備端目視確認，呈現系統驗證與交付準備的協作關係。',
  },
  {
    path: '/en/solutions/custom-integration/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative field-commissioning view: control-side setup and machine-side visual verification within a shared validation and handoff workflow.',
  },
] as const;

test.describe('YF-IMG-02 production image contract', () => {
  for (const route of ROUTES) {
    test(`${route.path} renders the localized optimized Final Master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-02"]');
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure).toHaveAttribute('data-presentation', route.presentation);
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('width', '1535');
      await expect(image).toHaveAttribute('height', '1024');
      await expect(image).toHaveAttribute('loading', route.loading);
      await expect(image).toHaveAttribute('fetchpriority', route.priority);
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(figure.locator('figcaption')).toHaveText(route.caption);
      await figure.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-02 remains visible and contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/');

      const geometry = await page.locator('[data-production-image="YF-IMG-02"]').evaluate((figure) => {
        const rect = figure.getBoundingClientRect();
        const image = figure.querySelector('img');
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          imageVisible: image ? getComputedStyle(image).display !== 'none' : false,
          objectFit: image ? getComputedStyle(image).objectFit : '',
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.imageVisible).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.width).toBeGreaterThan(0);
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});

test.describe('YF-IMG-03 production image contract', () => {
  for (const route of CONTROL_ENGINEERING_ROUTES) {
    test(`${route.path} renders the localized optimized control-engineering master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-03"]');
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure).toHaveAttribute('data-presentation', route.presentation);
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('width', '1535');
      await expect(image).toHaveAttribute('height', '1024');
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('fetchpriority', 'auto');
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(figure.locator('figcaption')).toHaveText(route.caption);
      await figure.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-03 preserves its focal crop and remains contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/about/');

      const geometry = await page.locator('[data-production-image="YF-IMG-03"]').evaluate((figure) => {
        const rect = figure.getBoundingClientRect();
        const image = figure.querySelector('img');
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          imageVisible: image ? getComputedStyle(image).display !== 'none' : false,
          objectFit: image ? getComputedStyle(image).objectFit : '',
          objectPosition: image ? getComputedStyle(image).objectPosition : '',
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.imageVisible).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.objectPosition).toBe('44% 50%');
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.width).toBeGreaterThan(0);
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});

test.describe('YF-IMG-04 production image contract', () => {
  for (const route of MACHINE_VISION_ROUTES) {
    test(`${route.path} renders the localized optimized machine-vision master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-04"]');
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure).toHaveAttribute('data-presentation', route.presentation);
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('width', '1447');
      await expect(image).toHaveAttribute('height', '1087');
      await expect(image).toHaveAttribute('loading', route.loading);
      await expect(image).toHaveAttribute('fetchpriority', route.priority);
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(figure.locator('figcaption')).toHaveText(route.caption);
      await figure.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-04 preserves its optical-axis crop and remains contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/solutions/vision-inspection/');

      const geometry = await page.locator('[data-production-image="YF-IMG-04"]').evaluate((figure) => {
        const rect = figure.getBoundingClientRect();
        const media = figure.firstElementChild;
        const mediaRect = media?.getBoundingClientRect();
        const image = figure.querySelector('img');
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          mediaRatio: mediaRect ? mediaRect.width / mediaRect.height : 0,
          imageVisible: image ? getComputedStyle(image).display !== 'none' : false,
          objectFit: image ? getComputedStyle(image).objectFit : '',
          objectPosition: image ? getComputedStyle(image).objectPosition : '',
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.imageVisible).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.objectPosition).toBe('50% 52%');
      expect(geometry.mediaRatio).toBeCloseTo(width < 480 ? 1 : width < 768 ? 4 / 3 : 16 / 9, 2);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.width).toBeGreaterThan(0);
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});

test.describe('YF-IMG-05 production image contract', () => {
  for (const route of PRECISION_HANDLING_ROUTES) {
    test(`${route.path} renders the localized optimized precision-handling master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-05"]');
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure).toHaveAttribute('data-presentation', route.presentation);
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('width', '1536');
      await expect(image).toHaveAttribute('height', '1024');
      await expect(image).toHaveAttribute('loading', route.loading);
      await expect(image).toHaveAttribute('fetchpriority', route.priority);
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(figure.locator('figcaption')).toHaveText(route.caption);
      await figure.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-05 preserves its gripper-contact crop and remains contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/solutions/precision-positioning/');

      const geometry = await page.locator('[data-production-image="YF-IMG-05"]').evaluate((figure) => {
        const rect = figure.getBoundingClientRect();
        const media = figure.firstElementChild;
        const mediaRect = media?.getBoundingClientRect();
        const image = figure.querySelector('img');
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          mediaRatio: mediaRect ? mediaRect.width / mediaRect.height : 0,
          imageVisible: image ? getComputedStyle(image).display !== 'none' : false,
          objectFit: image ? getComputedStyle(image).objectFit : '',
          objectPosition: image ? getComputedStyle(image).objectPosition : '',
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.imageVisible).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.objectPosition).toBe('50% 55%');
      expect(geometry.mediaRatio).toBeCloseTo(width < 480 ? 1 : width < 768 ? 4 / 3 : 16 / 9, 2);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.width).toBeGreaterThan(0);
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});

test.describe('YF-IMG-06 production image contract', () => {
  for (const route of FIELD_COMMISSIONING_ROUTES) {
    test(`${route.path} renders the localized optimized field-commissioning master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-06"]');
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure).toHaveAttribute('data-presentation', route.presentation);
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('width', '1536');
      await expect(image).toHaveAttribute('height', '1024');
      await expect(image).toHaveAttribute('loading', route.loading);
      await expect(image).toHaveAttribute('fetchpriority', route.priority);
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(figure.locator('figcaption')).toHaveText(route.caption);
      await figure.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-06 preserves its control-side mobile crop and remains contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/solutions/custom-integration/');

      const geometry = await page.locator('[data-production-image="YF-IMG-06"]').evaluate((figure) => {
        const rect = figure.getBoundingClientRect();
        const media = figure.firstElementChild;
        const mediaRect = media?.getBoundingClientRect();
        const image = figure.querySelector('img');
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          mediaRatio: mediaRect ? mediaRect.width / mediaRect.height : 0,
          imageVisible: image ? getComputedStyle(image).display !== 'none' : false,
          objectFit: image ? getComputedStyle(image).objectFit : '',
          objectPosition: image ? getComputedStyle(image).objectPosition : '',
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.imageVisible).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.objectPosition).toBe('34% 46%');
      expect(geometry.mediaRatio).toBeCloseTo(width < 480 ? 1 : width < 768 ? 4 / 3 : 16 / 9, 2);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.width).toBeGreaterThan(0);
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});
