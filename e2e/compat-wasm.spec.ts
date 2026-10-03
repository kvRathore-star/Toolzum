import { test, expect } from '@playwright/test';

/**
 * Browser-compat smoke (#31). Runs on chromium + firefox + webkit in CI.
 *
 * Premise under test: the site ships WITHOUT cross-origin isolation
 * (no COOP/COEP — deliberate, see docs/BROWSER-MATRIX.md), so
 * crossOriginIsolated is false and SharedArrayBuffer is undefined on
 * EVERY engine. All WASM must therefore run single-threaded paths.
 * This spec pins that baseline and proves a local tool executes on
 * each engine; heavy-engine downloads (FFmpeg/Tesseract/MediaPipe)
 * stay manual-matrix rows (too heavy/flaky for CI).
 */
test('no cross-origin isolation: single-threaded WASM baseline everywhere', async ({
  page,
}) => {
  await page.goto('/');
  const isolated = await page.evaluate(() => globalThis.crossOriginIsolated);
  expect(isolated).toBe(false);
  const sab = await page.evaluate(() => typeof SharedArrayBuffer);
  expect(sab).toBe('undefined');
});

test('local tool executes end-to-end (word counter)', async ({ page }) => {
  // The tool body is a lazy chunk (DynamicModuleWrapper): under suite
  // contention the mount lands well after first paint — allow for it.
  test.setTimeout(60_000);
  await page.goto('/text/word-counter');
  const input = page.getByLabel('Text', { exact: true });
  await expect(input).toBeVisible({ timeout: 30000 });
  await input.fill('hello brave new world');
  // Result reflects the input without any server round-trip.
  // "hello brave new world" = 4 tokens (21 chars incl. spaces).
  await expect(page.getByText(/4 words,/i).first()).toBeVisible({
    timeout: 15000,
  });
});

test('offline fallback page is reachable', async ({ page }) => {
  const res = await page.goto('/offline.html');
  expect(res?.status()).toBe(200);
  await expect(page.getByText(/you.re offline/i)).toBeVisible();
});
