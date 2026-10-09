import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LEGAL_DATES, legalDate, formatLegalDate } from '@/lib/legal-dates.generated';

const ROUTES = ['/privacy-policy/', '/terms/', '/cookies/', '/disclaimer/'] as const;
const PAGE_FILES: Record<string, string> = {
  '/privacy-policy/': 'src/app/privacy-policy/page.tsx',
  '/terms/': 'src/app/terms/page.tsx',
  '/cookies/': 'src/app/cookies/page.tsx',
  '/disclaimer/': 'src/app/disclaimer/page.tsx',
};

describe('legal dates (auto-stamped from git history)', () => {
  it('covers every legal page with a valid ISO date', () => {
    for (const route of ROUTES) {
      expect(LEGAL_DATES[route], route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('no legal page hardcodes its date anymore', () => {
    for (const [route, rel] of Object.entries(PAGE_FILES)) {
      const src = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
      expect(src, `${route} hardcoded date`).not.toMatch(/Last Updated: (January|February|March|April|May|June|July|August|September|October|November|December)/);
      expect(src, `${route} uses generated date`).toContain('legalDate(');
    }
  });

  it('helpers behave', () => {
    expect(legalDate('/privacy-policy/')).toBe(LEGAL_DATES['/privacy-policy/']);
    expect(legalDate('/nope/')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatLegalDate('2026-10-09')).toBe('October 9, 2026');
  });
});
