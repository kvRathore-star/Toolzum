import { test, expect, type Page } from '@playwright/test';

// Responsive sweep without extra CI projects: set viewport in-test so the
// e2e job stays one browser run. Fails on horizontal overflow or missing
// primary landmarks at each breakpoint.
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const bp of BREAKPOINTS) {
  test(`homepage renders cleanly at ${bp.name} (${bp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/');
    await expect(page.getByRole('navigation').first()).toBeVisible();
    await noHorizontalOverflow(page);
  });

  test(`tool page usable at ${bp.name} (${bp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/finance/emi-calculator');
    await expect(page.getByLabel(/loan amount/i)).toBeVisible();
    await noHorizontalOverflow(page);
  });
}
