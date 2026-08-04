import { defineConfig, devices } from '@playwright/test';

/**
 * Runs against `astro preview` (production build output), not `astro dev`
 * — spec requires testing the actual production static output, not the
 * dev server. `webServer` builds+starts it automatically for `pnpm
 * test:e2e`; CI/manual runs can also start `pnpm preview` themselves and
 * point PLAYWRIGHT_BASE_URL at it.
 */
const PORT = 4321;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npx astro preview --port 4321',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
