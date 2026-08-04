import { test, expect } from '@playwright/test';

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
