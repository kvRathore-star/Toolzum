import { test, expect, type Page } from '@playwright/test';

// Hero upload-box gap guard: the 600px panel's leftover slack must live
// INSIDE the dashed dropzone (flex-1), never as dead space between sections.
// Fails if any inter-section gap exceeds 48px — legit rhythm is 12–32px,
// historic voids were 76px+ (reserved chips block, justify-between).
// See HomeClient FileDropZone + panel "slack rule" comment.

const MAX_GAP = 48;

async function gapBetween(
  page: Page,
  upper: string,
  lower: string,
): Promise<number> {
  return page.evaluate(
    ([u, l]) => {
      const a = document.querySelector(u)?.getBoundingClientRect();
      const b = document.querySelector(l)?.getBoundingClientRect();
      if (!a || !b) return -1;
      return b.top - a.bottom;
    },
    [upper, lower] as [string, string],
  );
}

const TABS = '[role="tablist"][aria-label="Demo actions"]';
const HEADING = 'text=What are you working with?';
const DROPZONE = '[aria-label^="Drop a file here"]';
const BADGES = '[aria-label="Accepted formats"]';
const CHIPS = '[aria-label="Choose what to do"]';
const FILE_INPUT = '#hero-file-input';

test('hero idle: no dead space between sections (desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.locator(DROPZONE)).toBeVisible();

  for (const [name, u, l] of [
    ['tabs→heading', TABS, HEADING],
    ['dropzone→badges', DROPZONE, BADGES],
  ] as const) {
    const gap = await gapBetween(page, u, l);
    expect(gap, `${name} gap`).toBeGreaterThanOrEqual(0);
    expect(gap, `${name} gap`).toBeLessThanOrEqual(MAX_GAP);
  }
});

test('hero idle: no dead space between sections (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator(DROPZONE)).toBeVisible();

  const gap = await gapBetween(page, DROPZONE, BADGES);
  expect(gap, 'dropzone→badges gap').toBeGreaterThanOrEqual(0);
  expect(gap, 'dropzone→badges gap').toBeLessThanOrEqual(MAX_GAP);
});

test('hero with file: chips sit tight under the dropzone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.locator(DROPZONE)).toBeVisible();

  // Any extension triggers intent chips (detection is ext-based).
  await page.locator(FILE_INPUT).setInputFiles([
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello world') },
  ]);
  await expect(page.locator(CHIPS)).toBeVisible();

  const gap = await gapBetween(page, DROPZONE, CHIPS);
  expect(gap, 'dropzone→chips gap').toBeGreaterThanOrEqual(0);
  expect(gap, 'dropzone→chips gap').toBeLessThanOrEqual(MAX_GAP);
});
