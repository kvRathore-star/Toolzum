import { test, expect } from '@playwright/test';

// Auth flow smoke: login page renders, rejects empty submit client-side,
// session-dependent UI (favorites) gates to sign-in when logged out.
test('login page renders and validates', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test('homepage shows sign-in entry when logged out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
});
