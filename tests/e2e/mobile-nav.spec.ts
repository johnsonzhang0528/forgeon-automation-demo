import { test, expect } from '@playwright/test';
import { navItems } from '../../src/config/nav';

const VIEWPORTS = [
  { name: '320x800', width: 320, height: 800 },
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
];
const LOCALES = ['zh-tw', 'en'] as const;

test.describe('Mobile navigation drawer (spec P0.1 a11y requirements)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh-tw/');
  });

  test('opens on toggle click, closes on close button, focus returns to toggle', async ({ page }) => {
    const toggle = page.locator('[data-mobile-nav-toggle]');
    const panel = page.locator('[data-mobile-nav]');

    await expect(panel).toBeHidden();
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const closeBtn = page.locator('[data-mobile-nav-close]');
    await closeBtn.click();
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('closes on Escape key, focus returns to toggle', async ({ page }) => {
    const toggle = page.locator('[data-mobile-nav-toggle]');
    const panel = page.locator('[data-mobile-nav]');

    await toggle.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('focus trap keeps Tab cycling within the open panel', async ({ page }) => {
    const toggle = page.locator('[data-mobile-nav-toggle]');
    const panel = page.locator('[data-mobile-nav]');
    await toggle.click();
    await expect(panel).toBeVisible();

    const focusables = panel.locator('a, button');
    const count = await focusables.count();
    expect(count).toBeGreaterThan(0);

    // First focusable should already be focused (auto-focused on open).
    const first = focusables.first();
    const last = focusables.last();
    await expect(first).toBeFocused();

    // Shift+Tab from the first element should wrap to the last.
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();

    // Tab from the last element should wrap back to the first.
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
  });

  test('background content is inert / not reachable while menu is open', async ({ page }) => {
    const toggle = page.locator('[data-mobile-nav-toggle]');
    await toggle.click();

    // Background scroll must be locked while the drawer is open.
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    // Tabbing forward from inside the trap must never land on an element
    // outside the panel (focus trap keydown handler intercepts Tab/Shift+Tab
    // globally on the panel — verified above); this test additionally
    // confirms clicking the dimmed backdrop closes the menu rather than
    // allowing interaction with whatever is behind it.
    const panel = page.locator('[data-mobile-nav]');
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    // Click near the very left edge of the viewport, outside the drawer
    // panel (drawer is anchored right, min(88vw, 360px) wide) — this is
    // the semi-transparent backdrop area.
    await page.mouse.click(2, 400);
    await expect(panel).toBeHidden();
  });
});

// CC-02I-03: full drawer-regression matrix at 320/360/390px, both locales —
// re-verifying the same behaviors above against the post-CC-02I-02 Header,
// down to the ticket's mandatory 320px viewport (ticket §8/§14).
test.describe('Mobile navigation drawer regression matrix (CC-02I-03)', () => {
  for (const vp of VIEWPORTS) {
    for (const locale of LOCALES) {
      test.describe(`${vp.name} / ${locale}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(`/${locale}/`);
        });

        test('drawer opens/closes via toggle', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          const panel = page.locator('[data-mobile-nav]');
          await expect(panel).toBeHidden();
          await toggle.click();
          await expect(panel).toBeVisible();
          await expect(toggle).toHaveAttribute('aria-expanded', 'true');
          const closeBtn = page.locator('[data-mobile-nav-close]');
          await closeBtn.click();
          await expect(panel).toBeHidden();
          await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        });

        test('Escape closes the drawer', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          const panel = page.locator('[data-mobile-nav]');
          await toggle.click();
          await expect(panel).toBeVisible();
          await page.keyboard.press('Escape');
          await expect(panel).toBeHidden();
        });

        test('focus trap cycles forward (Tab) and backward (Shift+Tab)', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          const panel = page.locator('[data-mobile-nav]');
          await toggle.click();
          await expect(panel).toBeVisible();

          const focusables = panel.locator('a, button');
          const first = focusables.first();
          const last = focusables.last();
          await expect(first).toBeFocused();

          await page.keyboard.press('Shift+Tab');
          await expect(last).toBeFocused();

          await page.keyboard.press('Tab');
          await expect(first).toBeFocused();
        });

        test('focus returns to the toggle button on close', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          const panel = page.locator('[data-mobile-nav]');
          await toggle.click();
          await expect(panel).toBeVisible();
          await page.keyboard.press('Escape');
          await expect(toggle).toBeFocused();
        });

        test('body scroll lock engages on open and restores on close', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          const closeBtn = page.locator('[data-mobile-nav-close]');
          const before = await page.evaluate(() => document.body.style.overflow);
          expect(before).not.toBe('hidden');
          await toggle.click();
          const during = await page.evaluate(() => document.body.style.overflow);
          expect(during).toBe('hidden');
          await closeBtn.click();
          const after = await page.evaluate(() => document.body.style.overflow);
          expect(after).not.toBe('hidden');
        });

        test('background content is genuinely inert while the drawer is open (real click-through probe)', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          await toggle.click();

          // Probe a real point behind the (right-anchored) drawer panel —
          // near the left edge, over the backdrop — and confirm the
          // topmost element there belongs to the mobile-nav overlay, not
          // to <main> content underneath. This proves background content
          // cannot receive the click (genuinely inert), not just that it
          // looks visually dimmed.
          const probe = await page.evaluate(() => {
            const el = document.elementFromPoint(2, 300);
            const overlay = document.querySelector('[data-mobile-nav]');
            return {
              isInsideOverlay: !!(el && overlay && overlay.contains(el)),
              tag: el?.tagName ?? null,
            };
          });
          expect(probe.isInsideOverlay, `topmost element at backdrop point was ${probe.tag}, expected inside the mobile-nav overlay`).toBe(true);

          // Clicking that point must close the drawer (backdrop dismiss),
          // and must never trigger a background link's navigation.
          const urlBefore = page.url();
          await page.mouse.click(2, 300);
          const panel = page.locator('[data-mobile-nav]');
          await expect(panel).toBeHidden();
          expect(page.url()).toBe(urlBefore);
        });

        test('all 6 real nav items are present with correct hrefs', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          await toggle.click();
          const links = page.locator('.mobile-nav__link');
          await expect(links).toHaveCount(navItems.length);
          const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
          const expected = navItems.map((item) => item.path(locale));
          expect(hrefs).toEqual(expected);
          for (const href of hrefs) {
            expect(href, 'every nav link must have a real href').toBeTruthy();
            expect(href!.startsWith('#'), `nav link ${href} must not be a placeholder anchor`).toBe(false);
          }
        });

        test('language switcher works inside the drawer', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          await toggle.click();
          const langSwitch = page.locator('[data-mobile-nav] [data-lang-switch]');
          await expect(langSwitch).toBeVisible();
          const href = await langSwitch.getAttribute('href');
          expect(href).toBeTruthy();
          const targetLocale = locale === 'zh-tw' ? '/en/' : '/zh-tw/';
          expect(href).toContain(targetLocale);
        });

        test('language switch tap target does not overflow the viewport', async ({ page }) => {
          const toggle = page.locator('[data-mobile-nav-toggle]');
          await toggle.click();
          const langSwitch = page.locator('[data-mobile-nav] [data-lang-switch]');
          const box = await langSwitch.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.x, 'language switch left edge must not be negative').toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width, `language switch right edge (${box!.x + box!.width}) must not exceed viewport width (${vp.width})`).toBeLessThanOrEqual(vp.width);
        });
      });
    }
  }
});

// CC-02I-03 / R1-08: No-JS fallback. Uses a dedicated browser context with
// javaScriptEnabled: false so the drawer's own <script> never runs — the
// only way to genuinely prove the fallback works without JavaScript, not
// merely that markup exists in source.
test.describe('No-JS fallback (CC-02I-03, R1-08)', () => {
  for (const vp of [
    { name: '320x800', width: 320, height: 800 },
    { name: '360x800', width: 360, height: 800 },
  ]) {
    for (const locale of LOCALES) {
      test(`renders a fully usable fallback nav with JavaScript disabled (${vp.name}, ${locale})`, async ({ browser }) => {
        const context = await browser.newContext({
          javaScriptEnabled: false,
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();
        try {
          await page.goto(`/${locale}/`);

          const fallback = page.locator('noscript .mobile-nav-nojs, .mobile-nav-nojs');
          // With JS disabled, <noscript> content is part of the real
          // rendered/queryable DOM (browsers unhide it), so a normal
          // Playwright locator finds it directly — proving the fallback
          // is genuinely present and usable, not merely inspected as text
          // in the page source.
          await expect(fallback).toBeVisible();

          const navLinks = fallback.locator('.mobile-nav-nojs__link');
          const count = await navLinks.count();
          // navItems.length real nav links + 1 locale-switch link + 1 CTA link.
          expect(count).toBe(navItems.length + 2);

          const hrefs = await navLinks.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
          for (const href of hrefs) {
            expect(href, 'every No-JS fallback link must have a real, non-empty href').toBeTruthy();
            expect(href!.length).toBeGreaterThan(0);
            expect(href!.startsWith('#'), `No-JS fallback link ${href} must not be a placeholder anchor`).toBe(false);
          }

          const expectedNavHrefs = navItems.map((item) => item.path(locale));
          for (const expected of expectedNavHrefs) {
            expect(hrefs, `No-JS fallback missing real nav link ${expected}`).toContain(expected);
          }

          const targetLocale = locale === 'zh-tw' ? 'en' : 'zh-tw';
          const hasLocaleSwitch = hrefs.some((href) => href!.includes(`/${targetLocale}/`));
          expect(hasLocaleSwitch, `No-JS fallback missing a working locale switch link to /${targetLocale}/`).toBe(true);

          const hasCta = hrefs.some((href) => href!.includes(`/${locale}/contact/`) && href!.includes('intent=project'));
          expect(hasCta, 'No-JS fallback missing the primary Contact/Project CTA link').toBe(true);
        } finally {
          await context.close();
        }
      });
    }
  }
});
