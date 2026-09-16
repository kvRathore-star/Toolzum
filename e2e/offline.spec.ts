import { test, expect } from '@playwright/test';

/**
 * Offline hardening spec (#10 pre-emptive). Uses browser offline emulation
 * (context.setOffline) — runs in CI, no device needed. Proves the three
 * failure classes stay fixed: boot works, cached tools work, uncached
 * navigations fall back instead of the browser error screen.
 */
test.describe('offline resilience', () => {
  test('boot shell renders offline from precache', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
    await context.setOffline(true);
    await page.reload();
    // Shell boots from precache: header + content, no browser error page.
    await expect(page.getByRole('banner').first()).toBeVisible({ timeout: 20000 });
  });

  test('previously visited tool works offline', async ({ page, context }) => {
    await page.goto('/text/word-counter');
    const input = page.getByLabel('Text', { exact: true });
    await expect(input).toBeVisible({ timeout: 20000 });
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByLabel('Text', { exact: true })).toBeVisible({ timeout: 20000 });
    await page.getByLabel('Text', { exact: true }).fill('offline and counting');
    await expect(page.getByText(/3 words,/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('unvisited URL falls back to the offline page', async ({ page, context }) => {
    await page.goto('/');
    await context.setOffline(true);
    // A never-visited deep URL: must serve /offline, not the browser error.
    await page.goto('/pdf/pdf-merger/');
    await expect(page.getByText(/you're offline/i)).toBeVisible({ timeout: 20000 });
  });
});
