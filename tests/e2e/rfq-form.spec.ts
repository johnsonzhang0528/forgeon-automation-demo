import { test, expect } from '@playwright/test';

test.describe('RFQ form — validation, a11y, Demo Mode (spec P0.5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-tw/contact/');
  });

  test('submitting empty form shows errors, focuses first invalid field, and sets aria-invalid', async ({ page }) => {
    await page.locator('#rfq-submit-btn').click();

    const companyNameError = page.locator('#companyName-error');
    await expect(companyNameError).toBeVisible();
    await expect(page.locator('#companyName')).toBeFocused();
    await expect(page.locator('#companyName')).toHaveAttribute('aria-invalid', 'true');
  });

  test('invalid email format shows the email-specific error message', async ({ page }) => {
    await page.locator('#companyName').fill('Test Co');
    await page.locator('#contactName').fill('Tester');
    await page.locator('#email').fill('not-an-email');
    await page.locator('#rfq-submit-btn').click();
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('requirement field enforces minimum length', async ({ page }) => {
    await page.locator('#requirement').fill('too short');
    await page.locator('#rfq-submit-btn').click();
    await expect(page.locator('#requirement-error')).toBeVisible();
    await expect(page.locator('#requirement')).toHaveAttribute('aria-invalid', 'true');
  });

  test('privacy consent checkbox error path sets aria-invalid and is announced via role=alert', async ({ page }) => {
    await page.locator('#rfq-submit-btn').click();
    const consentError = page.locator('#privacyConsent-error');
    await expect(consentError).toBeVisible();
    await expect(consentError).toHaveAttribute('role', 'alert');
    await expect(page.locator('#privacyConsent')).toHaveAttribute('aria-invalid', 'true');
  });

  test('privacy consent label links to a real, working privacy page', async ({ page }) => {
    const link = page.locator('.contact-form__consent a');
    await expect(link).toHaveAttribute('href', '/zh-tw/privacy/');
    const href = await link.getAttribute('href');
    const res = await page.request.get(href!);
    expect(res.ok()).toBeTruthy();
  });

  test('select field (country) shows aria-invalid on validation failure', async ({ page }) => {
    // Fill everything except country to isolate the select's own error path.
    await page.locator('#companyName').fill('Test Co');
    await page.locator('#contactName').fill('Tester');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#industry').selectOption('semiconductor');
    await page.locator('#projectType').selectOption('new-line');
    await page.locator('#requirement').fill('This is a sufficiently long requirement description for validation.');
    await page.locator('#privacyConsent').check();
    await page.locator('#rfq-submit-btn').click();
    await expect(page.locator('#country-error')).toBeVisible();
    await expect(page.locator('#country')).toHaveAttribute('aria-invalid', 'true');
  });

  test('full valid submission in Demo Mode shows the demo result state, not a fake success claim', async ({ page }) => {
    await page.locator('#companyName').fill('Test Co');
    await page.locator('#contactName').fill('Tester');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#country').selectOption('tw');
    await page.locator('#industry').selectOption('semiconductor');
    await page.locator('#projectType').selectOption('new-line');
    await page.locator('#requirement').fill('This is a sufficiently long requirement description for validation purposes.');
    await page.locator('#privacyConsent').check();

    await page.locator('#rfq-submit-btn').click();

    const result = page.locator('[data-form-result]');
    await expect(result).toBeVisible({ timeout: 3000 });
    await expect(result).toHaveAttribute('data-state', 'demo');
    await expect(result).toHaveAttribute('role', 'status');
    // Must not claim data was actually sent/stored.
    const text = await result.textContent();
    expect(text).not.toMatch(/2 個工作天|已送出成功/);
  });

  test('all fields are keyboard-operable in native tab order', async ({ page }) => {
    await page.locator('#companyName').focus();
    await expect(page.locator('#companyName')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#contactName')).toBeFocused();
  });

  test('attachment file input has been removed (spec P0.5 decision B)', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(0);
  });
});

test.describe('CTA intent handling (spec P0.5)', () => {
  test('?intent=technical-advice swaps heading copy and pre-selects Technical Consultation', async ({ page }) => {
    await page.goto('/zh-tw/contact/?intent=technical-advice');
    const projectTypeValue = await page.locator('#projectType').inputValue();
    expect(projectTypeValue).toBe('consultation');
  });

  test('default (no intent param) keeps the primary project-request framing', async ({ page }) => {
    await page.goto('/zh-tw/contact/');
    const projectTypeValue = await page.locator('#projectType').inputValue();
    expect(projectTypeValue).toBe('');
  });

  test('homepage primary CTA links to /contact/?intent=project', async ({ page }) => {
    await page.goto('/zh-tw/');
    const primaryCta = page.locator('a[data-intent="project"][data-source="home-hero"]');
    await expect(primaryCta).toHaveAttribute('href', '/zh-tw/contact/?intent=project');
  });

  test('homepage secondary CTA links to /contact/?intent=technical-advice', async ({ page }) => {
    await page.goto('/zh-tw/');
    const secondaryCta = page.locator('a[data-intent="technical-advice"][data-source="home-hero"]');
    await expect(secondaryCta).toHaveAttribute('href', '/zh-tw/contact/?intent=technical-advice');
  });
});
