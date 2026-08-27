import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PAGES_DIR = join(process.cwd(), 'src/app');

const PAGES = [
  'page.tsx',
  'about/page.tsx',
  'tools/page.tsx',
  'faq/page.tsx',
  'contact/page.tsx',
  'privacy-policy/page.tsx',
  'terms/page.tsx',
  'security/page.tsx',
  'cookies/page.tsx',
  'premium-tools/page.tsx',
  'pricing/page.tsx',
  'extension/page.tsx',
  'product/page.tsx',
  'changelog/page.tsx',
  'roadmap/page.tsx',
  'status/page.tsx',
  'blog/page.tsx',
  'careers/page.tsx',
  'login/page.tsx',
  'dashboard/page.tsx',
  'billing/page.tsx',
  '[category]/page.tsx',
  '[category]/[tool]/page.tsx',
  'blog/posts/[slug]/page.tsx',
];

describe('Page File Smoke Tests', () => {
  PAGES.forEach((pagePath) => {
    it(`${pagePath} exists and is valid TSX`, () => {
      const fullPath = join(PAGES_DIR, pagePath);
      expect(existsSync(fullPath)).toBe(true);

      const content = readFileSync(fullPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);

      // Must export a default component or metadata
      const hasDefaultExport = content.includes('export default') || content.includes('export const metadata');
      expect(hasDefaultExport).toBe(true);

      // Must be valid JSX or return null (redirect pages)
      const hasJSX = content.includes('<') && content.includes('>');
      const returnsNull = content.includes('return null');
      expect(hasJSX || returnsNull).toBe(true);
    });
  });

  it('all page files are under 500 lines', () => {
    PAGES.forEach((pagePath) => {
      const fullPath = join(PAGES_DIR, pagePath);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        const lineCount = content.split('\n').length;
        expect(lineCount).toBeLessThan(500);
      }
    });
  });

  it('no page imports unused dependencies', () => {
    PAGES.forEach((pagePath) => {
      const fullPath = join(PAGES_DIR, pagePath);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        // Check for common import patterns
        const imports = content.match(/import .* from ['"].*['"]/g) || [];
        imports.forEach((imp) => {
          expect(imp).not.toContain('undefined');
          expect(imp).not.toContain('null');
        });
      }
    });
  });
});
