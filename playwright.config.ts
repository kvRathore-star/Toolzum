import { defineConfig, devices } from '@playwright/test';

// First run: npx playwright install chromium
// Full E2E against production build: npm run build && npx serve out -l 3000
// then PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
//
// #31: firefox + webkit run in CI (ubuntu installs all three engines).
// Local macOS 12 can't install every browser — dev default stays
// chromium-only; CI runs the full matrix.
const localOnly = !process.env.CI;
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: localOnly
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],
});
