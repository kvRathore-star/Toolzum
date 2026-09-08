import { defineConfig, devices } from '@playwright/test';

// First run: npx playwright install chromium
// Full E2E against production build: npm run build && npx serve out -l 3000
// then PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
