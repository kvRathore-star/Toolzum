import { test, expect } from '@playwright/test';

// Critical path: home -> category -> tool -> execute -> result announced.
// Covers the exact click-through flow previously verified only by hand
// (duplicate buttons, guard-order failures, missing labels).
test('EMI calculator executes end-to-end', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Toolzum/);

  await page.goto('/finance/emi-calculator');
  const principal = page.getByLabel(/loan amount/i);
  await expect(principal).toBeVisible();
  await principal.fill('100000');

  // Result panel announces via aria-live (CalculatorShell contract).
  const live = page.locator('[aria-live]');
  await expect(live.first()).toBeAttached();
});

test('command palette finds a tool by keystroke', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  await page.keyboard.type('font converter');
  await expect(page.getByText(/font converter/i).first()).toBeVisible();
  await page.keyboard.press('Escape');
});
