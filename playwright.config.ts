import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

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
  // Traces/screenshots stream into outputDir WHILE tests run. Left at the
  // default test-results/ (inside the repo), every trace write made
  // `next dev`'s watcher hot-reload mid-suite (~2.5–24s rebuild per write
  // — ~12 during case 1 alone). Park artifacts in the OS temp dir locally;
  // CI (no CI env here keeps it temp too — tmpdir is writable everywhere).
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || path.join(os.tmpdir(), 'toolzum-pw-out'),
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: localOnly
    ? [
        {
          name: 'chromium',
          // macOS 12 can't install Playwright's bundled chromium (unsupported
          // OS) — drive the installed system Chrome locally instead. CI
          // (ubuntu) keeps the bundled engines below.
          use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],
});
