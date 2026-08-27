import { test, expect } from '@playwright/test';

const expected = {
  'zh-tw': ['六軸機械手臂', '定位治具', '輸送線', '控制櫃與人機介面'],
  en: ['Six-axis robotic arm', 'Locating fixture', 'Conveyor line', 'Control cabinet & HMI'],
};

for (const locale of ['zh-tw', 'en'] as const) {
  test(`${locale}: canonical equipment identities remain mapped one-to-one`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const section = page.locator('.ir');
    await expect(section.locator('.ir-identification')).toHaveCount(4);
    await expect(section.locator('.ir-equipment-key__item')).toHaveCount(4);

    for (const [index, key] of ['arm', 'fixture', 'conveyor', 'control'].entries()) {
      const identification = section.locator(`[data-equipment="${key}"]`);
      const equipmentKey = section.locator(`[data-equipment-key="${key}"]`);
      await expect(identification).toContainText(expected[locale][index]);
      await expect(equipmentKey).toContainText(expected[locale][index]);
      await expect(identification).toHaveAttribute('data-anchor-x', /\d+/);
      await expect(identification).toHaveAttribute('data-anchor-y', /\d+/);
    }
  });
}

test('desktop uses anchored editorial leaders without cropping the approved master', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/zh-tw/');
  const section = page.locator('.ir');
  await section.scrollIntoViewIfNeeded();

  await expect(section.locator('.ir-identifications__leaders')).toBeVisible();
  await expect(section.locator('.ir-identification__label')).toHaveCount(4);
  await expect(section.locator('.ir-identification__label').first()).toBeVisible();
  await expect(section.locator('.ir-equipment-key')).toBeHidden();

  const imageBox = await section.locator('.ir-frame__media img').boundingBox();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.width / imageBox!.height).toBeCloseTo(1535 / 1024, 2);
});

for (const width of [320, 360, 390, 768]) {
  test(`mobile ${width}px uses the adjacent equipment key and preserves full system geometry`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/zh-tw/');
    const section = page.locator('.ir');
    await section.scrollIntoViewIfNeeded();

    await expect(section.locator('.ir-identifications__leaders')).toBeHidden();
    await expect(section.locator('.ir-identification__label').first()).toBeHidden();
    await expect(section.locator('.ir-equipment-key')).toBeVisible();

    const imageBox = await section.locator('.ir-frame__media img').boundingBox();
    expect(imageBox).not.toBeNull();
    expect(imageBox!.width / imageBox!.height).toBeCloseTo(1535 / 1024, 2);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('industrial section preserves opening → image → equipment relationships → closing DOM order', async ({ page }) => {
  await page.goto('/zh-tw/');
  const order = await page.locator('.ir').evaluate((section) =>
    ['.ir-frame__top', '.ir-frame__media', '.ir-equipment-key', '.ir-closing']
      .map((selector) => [...section.querySelectorAll('*')].indexOf(section.querySelector(selector)!))
  );
  expect(order).toEqual([...order].sort((a, b) => a - b));
});
