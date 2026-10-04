import { test, expect, type Page } from '@playwright/test';

/**
 * Offline hardening spec (#10 pre-emptive). Uses browser offline emulation
 * (context.setOffline) — runs in CI, no device needed. Proves the three
 * failure classes stay fixed: boot works, cached tools work, uncached
 * navigations fall back instead of the browser error screen.
 */

// Registration happens on hydration; install+claim must finish before
// setOffline or reload hits the raw network (ERR_INTERNET_DISCONNECTED —
// the CI failure mode before this wait). gen-sw uses skipWaiting+clientsClaim,
// so controllerchange arrives once active.
// Install precaches 781 files / ~27MB over HTTP/1.1's 6-connection cap:
// ~40s idle, ~160s under suite contention (measured locally), longer in CI.
// A stalled fetch is the SW's problem now (scripts/sw-source.js races every
// fetch against a timeout with retries) — this helper only polls, and
// re-registers solely when there is no registration at all. Never
// unregister an install that is merely slow: that wipes its progress.
async function waitForSwControl(page: Page) {
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return;
    const deadline = Date.now() + 300_000;
    while (Date.now() < deadline) {
      if (navigator.serviceWorker.controller) return;
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg || (!reg.installing && !reg.waiting && !reg.active)) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error('service worker never activated (install stalled)');
  });
}

test.describe('offline resilience', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.setTimeout(360_000);
  });

  test('boot shell renders offline from precache', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
    await waitForSwControl(page);
    await context.setOffline(true);
    await page.reload();
    // Shell boots from precache: header + content, no browser error page.
    await expect(page.getByRole('banner').first()).toBeVisible({ timeout: 20000 });
  });

  test('previously visited tool works offline', async ({ page, context }) => {
    // Control must be established BEFORE the tool visit: the very first
    // navigation happens while install is still running, so the SW never
    // sees that response and can't runtime-cache it ('pages' NetworkFirst).
    await page.goto('/');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
    await waitForSwControl(page);
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
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
    await waitForSwControl(page);
    await context.setOffline(true);
    // A never-visited deep URL: must serve /offline, not the browser error.
    // /you.re/ — offline.html spells it "You&rsquo;re" (curly apostrophe).
    await page.goto('/pdf/pdf-merger/');
    // 45s, not 20s: firefox under CI contention needed longer for the
    // NetworkFirst rejection → catch-handler → /offline chain (passed
    // locally, failed only in the 3-engine run).
    await expect(page.getByText(/you.re offline/i)).toBeVisible({ timeout: 45_000 });
  });
});
