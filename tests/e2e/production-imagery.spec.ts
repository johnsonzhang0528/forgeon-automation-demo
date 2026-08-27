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

/*
 * PD-VX2-01: /products/vision-x2/ no longer renders YF-IMG-04 (the
 * generic, unbranded machine-vision-inspection-final-master.png) in its
 * Hero — that image never actually depicted the VISION-X2 product itself,
 * only a similar-looking but different camera rig. VISION-X2's Hero now
 * uses its own approved product master (see the VISION-X2_HERO_ROUTES /
 * "VISION-X2 product master" contract below); AXM-400 and FLEXCELL-M are
 * unaffected and keep asserting YF-IMG-05 / YF-IMG-07 via ProductVisual
 * as before.
 */
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
] as const;

const VISION_X2_HERO_ROUTES = [
  {
    path: '/zh-tw/products/vision-x2/',
    heading: 'VISION-X2',
    alt: 'VISION-X2 鏡頭特寫，深色背景中可見對焦環刻度、光學鍍膜與環形光源邊緣',
  },
  {
    path: '/en/products/vision-x2/',
    heading: 'VISION-X2',
    alt: 'VISION-X2 lens close-up against a dark background, showing the focus-ring markings, optical coating, and the glowing edge of the ring light',
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
    presentation: 'product-hero',
    loading: 'eager',
    priority: 'high',
    caption: '代表性精密搬運影像：線性軸、Z 軸、平行夾爪、工件與治具的運動／負載關係。',
  },
  {
    path: '/en/products/axm-400/',
    presentation: 'product-hero',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative precision-handling view: the motion and load relationship between linear axes, a parallel gripper, workpiece and fixture.',
  },
] as const;

const MODULAR_WORKSTATION_ROUTES = [
  {
    path: '/zh-tw/products/flexcell-m/',
    presentation: 'product-hero',
    loading: 'eager',
    priority: 'high',
    caption: '概念展示影像：機械手臂製程模組、共用輸送介面與垂直製程模組整合於同一工作站平台。',
    disclosure: '概念展示資料',
  },
  {
    path: '/en/products/flexcell-m/',
    presentation: 'product-hero',
    loading: 'eager',
    priority: 'high',
    caption: 'Concept demonstration image: robotic process module, shared transfer interface and vertical process module integrated on one workstation platform.',
    disclosure: 'Concept Demonstration Data',
  },
] as const;

const PRODUCT_CARD_ROUTES = [
  { path: '/zh-tw/products/', imageId: 'YF-IMG-04', product: 'vision-x2' },
  { path: '/en/products/', imageId: 'YF-IMG-04', product: 'vision-x2' },
  { path: '/zh-tw/products/', imageId: 'YF-IMG-05', product: 'axm-400' },
  { path: '/en/products/', imageId: 'YF-IMG-05', product: 'axm-400' },
  { path: '/zh-tw/products/', imageId: 'YF-IMG-07', product: 'flexcell-m' },
  { path: '/en/products/', imageId: 'YF-IMG-07', product: 'flexcell-m' },
] as const;

/*
 * PD-VX2-01: vision-x2 removed from this list — its Hero no longer routes
 * through ProductVisual's product-hero crop contract (own dedicated crop
 * geometry asserted separately below, matching the approved Phase 5C-R2/
 * 5D-R2 mockup object-position values instead).
 */
const PRODUCT_HERO_CROPS = [
  {
    path: '/zh-tw/products/axm-400/',
    imageId: 'YF-IMG-05',
    product: 'axm-400',
    objectPosition: '50% 55%',
    desktopRatio: 3 / 2,
  },
  {
    path: '/zh-tw/products/flexcell-m/',
    imageId: 'YF-IMG-07',
    product: 'flexcell-m',
    objectPosition: '50% 52%',
    desktopRatio: 3 / 2,
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
  {
    path: '/zh-tw/insights/automation-readiness-checklist/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性現場調試影像：控制端設定與設備端目視確認，呈現系統驗證與交付準備的協作關係。',
  },
  {
    path: '/en/insights/automation-readiness-checklist/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative field-commissioning view: control-side setup and machine-side visual verification within a shared validation and handoff workflow.',
  },
] as const;

const VISION_GUIDED_ASSEMBLY_ROUTES = [
  {
    path: '/zh-tw/solutions/vision-guided-assembly/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性視覺導引組裝影像：相機與環形光源取得工件位置，機械手臂依治具關係完成抓取、對位與組裝。',
  },
  {
    path: '/en/solutions/vision-guided-assembly/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative vision-guided assembly view: camera and ring light acquire the part position, then the robot performs picking, alignment and assembly at the fixture.',
  },
] as const;

const EXISTING_LINE_RETROFIT_ROUTES = [
  {
    path: '/zh-tw/solutions/line-upgrade/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性既有產線升級影像：保留仍可使用的舊設備，透過實體交接結構新增自動化模組、控制架構與現場調試。',
    disclosure: '概念展示內容',
  },
  {
    path: '/en/solutions/line-upgrade/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative existing-line retrofit view: retained equipment connects through a physical handoff to a new automation module, updated controls and on-site commissioning.',
    disclosure: 'Concept Demonstration Content',
  },
  {
    path: '/zh-tw/insights/upgrade-vs-rebuild/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: '代表性既有產線升級影像：保留仍可使用的舊設備，透過實體交接結構新增自動化模組、控制架構與現場調試。',
    disclosure: '本文為作品集概念案例',
  },
  {
    path: '/en/insights/upgrade-vs-rebuild/',
    presentation: 'wide',
    loading: 'eager',
    priority: 'high',
    caption: 'Representative existing-line retrofit view: retained equipment connects through a physical handoff to a new automation module, updated controls and on-site commissioning.',
    disclosure: 'This article is a technical resource piece for a portfolio concept case',
  },
] as const;

const INSIGHT_CARD_SPECS = [
  {
    slug: 'upgrade-vs-rebuild',
    imageId: 'YF-IMG-09',
  },
  {
    slug: 'automation-readiness-checklist',
    imageId: 'YF-IMG-06',
  },
] as const;

const INDUSTRY_IMAGE_SPECS = [
  {
    slug: 'semiconductor-electronics',
    imageId: 'YF-IMG-10',
    objectPosition: '50% 52%',
    caption: {
      'zh-tw': '代表性半導體與電子組裝影像：視覺、精密製程頭、PCB 治具與元件供料在同一站點協作。',
      en: 'Representative semiconductor and electronics assembly view: vision, a precision process head, PCB fixture and component feeding working within one station.',
    },
  },
  {
    slug: 'automotive-components',
    imageId: 'YF-IMG-11',
    objectPosition: '48% 52%',
    caption: {
      'zh-tw': '代表性汽車零組件自動化影像：機械手臂、鑄造件、定位治具與檢測光源構成搬運與檢查站點。',
      en: 'Representative automotive-component automation view: robot, cast part, locating fixture and inspection light forming a handling and inspection station.',
    },
  },
  {
    slug: 'metal-machining',
    imageId: 'YF-IMG-12',
    objectPosition: '50% 50%',
    caption: {
      'zh-tw': '代表性金屬加工自動化影像：機械手臂銜接加工機、工件暫存治具與站外量測位置。',
      en: 'Representative metal-machining automation view: a robot linking the machine tool, workpiece buffer fixtures and an external measurement position.',
    },
  },
  {
    slug: 'packaging-logistics',
    imageId: 'YF-IMG-13',
    objectPosition: '50% 52%',
    caption: {
      'zh-tw': '代表性包裝與物流自動化影像：輸送、分流、視覺感測與機械手臂搬運形成連續作業流程。',
      en: 'Representative packaging and logistics automation view: conveying, routing, vision sensing and robotic carton handling in one continuous workflow.',
    },
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

      const figure = page.locator(
        `[data-production-image="YF-IMG-04"][data-presentation="${route.presentation}"]`,
      );
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

      const geometry = await page
        .locator('[data-production-image="YF-IMG-04"][data-presentation="wide"]')
        .evaluate((figure) => {
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

/*
 * PD-VX2-01: VISION-X2's own approved product master (vision-x2-macro-
 * master-v1.png), used only by its dedicated Product Detail Hero
 * (src/components/products/vision-x2/VisionX2Hero.astro). Identified via
 * data-vx-image="macro-master" — the same attribute convention the
 * Homepage VISION-X2 Signature Moment (VisionX2Signature.astro) already
 * uses for this image, not the legacy YF-IMG-NN catalog.
 */
test.describe('VISION-X2 product master image contract', () => {
  for (const route of VISION_X2_HERO_ROUTES) {
    test(`${route.path} renders the approved VISION-X2 Macro Master hero`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-vx-image="macro-master"]');
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('loading', 'eager');
      await expect(image).toHaveAttribute('fetchpriority', 'high');
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).not.toHaveAttribute('alt', '');
      await expect(page.locator('h1')).toHaveText(route.heading);
      await figure.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`VISION-X2 Product Detail Hero remains contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/products/vision-x2/');

      const geometry = await page.evaluate(() => ({
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
      }));

      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});

test.describe('YF-IMG-05 production image contract', () => {
  for (const route of PRECISION_HANDLING_ROUTES) {
    test(`${route.path} renders the localized optimized precision-handling master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator(
        `[data-production-image="YF-IMG-05"][data-presentation="${route.presentation}"]`,
      );
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

      const geometry = await page
        .locator('[data-production-image="YF-IMG-05"][data-presentation="wide"]')
        .evaluate((figure) => {
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

test.describe('product-card production image contract', () => {
  for (const route of PRODUCT_CARD_ROUTES) {
    test(`${route.path} uses ${route.imageId} for ${route.product}`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator(
        `[data-production-image="${route.imageId}"][data-product-image="${route.product}"]`,
      );
      const image = figure.locator('img');

      await expect(figure).toHaveCount(1);
      await expect(figure).toHaveAttribute('data-presentation', 'product-card');
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('fetchpriority', 'auto');
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(image).toHaveAttribute('alt', '');
      await expect(figure.locator('figcaption')).toHaveCount(0);
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  test('FLEXCELL-M keeps an explicit concept disclosure with YF-IMG-07', async ({ page }) => {
    await page.goto('/zh-tw/products/');

    const flexcellCard = page.locator('a.card[href="/zh-tw/products/flexcell-m/"]');
    await expect(flexcellCard.locator('[data-production-image="YF-IMG-07"]')).toHaveCount(1);
    await expect(flexcellCard.locator('.product-glyph')).toHaveCount(0);
    await expect(flexcellCard).toContainText('概念展示資料');
  });
});

test.describe('YF-IMG-07 production image contract', () => {
  for (const route of MODULAR_WORKSTATION_ROUTES) {
    test(`${route.path} renders the localized optimized modular-workstation master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-07"]');
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
      await expect(page.locator('.product-hero__copy')).toContainText(route.disclosure);
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }
});

test.describe('product-hero responsive crop contract', () => {
  for (const route of PRODUCT_HERO_CROPS) {
    for (const width of [320, 390, 768, 1280, 1920]) {
      test(`${route.product} product hero remains visible and contained at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path);

        const geometry = await page
          .locator(
            `[data-production-image="${route.imageId}"][data-product-image="${route.product}"][data-presentation="product-hero"]`,
          )
          .evaluate((figure) => {
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
        expect(geometry.objectPosition).toBe(route.objectPosition);
        expect(geometry.mediaRatio).toBeCloseTo(width < 480 ? 1 : width < 768 ? 4 / 3 : route.desktopRatio, 2);
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
        expect(geometry.width).toBeGreaterThan(0);
        expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
      });
    }
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

test.describe('YF-IMG-08 production image contract', () => {
  for (const route of VISION_GUIDED_ASSEMBLY_ROUTES) {
    test(`${route.path} renders the localized optimized vision-guided assembly master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-08"]');
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
      await expect(page.locator('main')).toContainText(route.path.startsWith('/zh-tw/') ? '概念展示內容' : 'Concept Demonstration Content');
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-08 preserves its camera-to-workpiece-to-gripper crop at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/solutions/vision-guided-assembly/');

      const geometry = await page.locator('[data-production-image="YF-IMG-08"]').evaluate((figure) => {
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

test.describe('YF-IMG-09 production image contract', () => {
  for (const route of EXISTING_LINE_RETROFIT_ROUTES) {
    test(`${route.path} renders the localized optimized existing-line retrofit master`, async ({ page }) => {
      await page.goto(route.path);

      const figure = page.locator('[data-production-image="YF-IMG-09"]');
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
      await expect(page.locator('main')).toContainText(route.disclosure);
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
        .toBe(true);
    });
  }

  for (const width of [320, 390, 768, 1280, 1920]) {
    test(`YF-IMG-09 preserves the legacy-machine-to-new-module handoff at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/zh-tw/solutions/line-upgrade/');

      const geometry = await page.locator('[data-production-image="YF-IMG-09"]').evaluate((figure) => {
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
      expect(geometry.objectPosition).toBe('54% 50%');
      expect(geometry.mediaRatio).toBeCloseTo(width < 480 ? 1 : width < 768 ? 4 / 3 : 16 / 9, 2);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.width).toBeGreaterThan(0);
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }
});

test.describe('technical-resource card image contracts', () => {
  for (const locale of ['zh-tw', 'en'] as const) {
    for (const spec of INSIGHT_CARD_SPECS) {
      test(`/${locale}/insights/ uses ${spec.imageId} for ${spec.slug}`, async ({ page }) => {
        await page.goto(`/${locale}/insights/`);

        const figure = page.locator(
          `[data-production-image="${spec.imageId}"][data-insight-image="${spec.slug}"][data-presentation="insight-card"]`,
        );
        const image = figure.locator('img');

        await expect(figure).toHaveCount(1);
        await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
        await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
        await expect(image).toHaveAttribute('width', '1536');
        await expect(image).toHaveAttribute('height', '1024');
        await expect(image).toHaveAttribute('loading', 'lazy');
        await expect(image).toHaveAttribute('fetchpriority', 'auto');
        await expect(image).toHaveAttribute('decoding', 'async');
        await expect(image).toHaveAttribute('alt', '');
      });
    }
  }
});

test.describe('YF-IMG-10–13 industry image contracts', () => {
  for (const locale of ['zh-tw', 'en'] as const) {
    for (const spec of INDUSTRY_IMAGE_SPECS) {
      test(`/${locale}/industries/ uses ${spec.imageId} for the ${spec.slug} card`, async ({ page }) => {
        await page.goto(`/${locale}/industries/`);

        const figure = page.locator(
          `[data-production-image="${spec.imageId}"][data-industry-image="${spec.slug}"][data-presentation="industry-card"]`,
        );
        const image = figure.locator('img');

        await expect(figure).toHaveCount(1);
        await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
        await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
        await expect(image).toHaveAttribute('width', '1536');
        await expect(image).toHaveAttribute('height', '1024');
        await expect(image).toHaveAttribute('loading', 'lazy');
        await expect(image).toHaveAttribute('fetchpriority', 'auto');
        await expect(image).toHaveAttribute('decoding', 'async');
        await expect(image).toHaveAttribute('alt', '');
      });

      test(`/${locale}/industries/${spec.slug}/ renders the localized ${spec.imageId} hero`, async ({ page }) => {
        await page.goto(`/${locale}/industries/${spec.slug}/`);

        const figure = page.locator(
          `[data-production-image="${spec.imageId}"][data-industry-image="${spec.slug}"][data-presentation="industry-hero"]`,
        );
        const image = figure.locator('img');

        await expect(figure).toHaveCount(1);
        await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
        await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
        await expect(image).toHaveAttribute('width', '1536');
        await expect(image).toHaveAttribute('height', '1024');
        await expect(image).toHaveAttribute('loading', 'eager');
        await expect(image).toHaveAttribute('fetchpriority', 'high');
        await expect(image).toHaveAttribute('decoding', 'async');
        await expect(image).not.toHaveAttribute('alt', '');
        await expect(figure.locator('figcaption')).toHaveText(spec.caption[locale]);
        await expect(page.locator('main')).toContainText(
          locale === 'zh-tw' ? '概念展示內容' : 'Concept Demonstration Content',
        );
        await expect
          .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
          .toBe(true);
      });
    }
  }

  for (const spec of INDUSTRY_IMAGE_SPECS) {
    for (const width of [320, 390, 768, 1280, 1920]) {
      test(`${spec.imageId} preserves its industry process at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/zh-tw/industries/${spec.slug}/`);

        const geometry = await page
          .locator(`[data-production-image="${spec.imageId}"][data-presentation="industry-hero"]`)
          .evaluate((figure) => {
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
        expect(geometry.objectPosition).toBe(spec.objectPosition);
        expect(geometry.mediaRatio).toBeCloseTo(width < 480 ? 1 : width < 768 ? 4 / 3 : 16 / 9, 2);
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
        expect(geometry.width).toBeGreaterThan(0);
        expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
      });
    }
  }
});
