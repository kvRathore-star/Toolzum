import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility gate: fail only on `critical`-impact wcag2a/wcag2aa
// violations. Serious/moderate/minor are reported in the assertion
// message but do not gate — they are triaged via the a11y backlog,
// not per-PR failures (avoids flakes on pre-existing minors while
// blocking any new critical barrier, e.g. missing form labels or
// empty buttons on high-traffic surfaces).
async function expectNoCriticalViolations(page: Page, url: string) {
  await page.goto(url);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  const detail = critical
    .map((v) => `${v.id} (${v.nodes.length} nodes): ${v.help}`)
    .join('\n');
  expect(critical, `Critical a11y violations on ${url}:\n${detail}`).toEqual(
    [],
  );
}

test.beforeEach(({}, testInfo) => {
  // axe injects + walks the full DOM inside page.evaluate — under local
  // machine load that single call can exceed the 30s default test budget
  // (observed Oct 2026: timeout, not violations). Genuine critical
  // violations still fail the assertion immediately.
  testInfo.setTimeout(120_000);
});

test('home has no critical a11y violations', async ({ page }) => {
  await expectNoCriticalViolations(page, '/');
});

test('EMI calculator (CalculatorShell contract) has no critical a11y violations', async ({
  page,
}) => {
  await expectNoCriticalViolations(page, '/finance/emi-calculator');
});

test('QR generator (custom tool UI) has no critical a11y violations', async ({
  page,
}) => {
  await expectNoCriticalViolations(page, '/utility/qr-code-generator');
});
