import { describe, it, expect } from 'vitest';
import {
  SITEMAP_URLS_PER_FILE,
  sitemapFileName,
  sitemapFileCount,
  buildSitemapIndexXml,
} from '@/lib/sitemapIndex';

describe('sitemap index splitting', () => {
  it('pins the chunk size (backend output + docs agree on it)', () => {
    expect(SITEMAP_URLS_PER_FILE).toBe(500);
  });

  it('names files sitemap-1.xml, sitemap-2.xml, …', () => {
    expect(sitemapFileName(0)).toBe('sitemap-1.xml');
    expect(sitemapFileName(1)).toBe('sitemap-2.xml');
    expect(sitemapFileName(5)).toBe('sitemap-6.xml');
  });

  it('counts files with ceiling division', () => {
    expect(sitemapFileCount(0)).toBe(0);
    expect(sitemapFileCount(1)).toBe(1);
    expect(sitemapFileCount(500)).toBe(1);
    expect(sitemapFileCount(501)).toBe(2);
    expect(sitemapFileCount(1000)).toBe(2);
    expect(sitemapFileCount(1001)).toBe(3);
    expect(sitemapFileCount(-5)).toBe(0);
  });

  it('returns null when a single file suffices (no index needed)', () => {
    expect(buildSitemapIndexXml(0, 'https://example.com')).toBeNull();
    expect(buildSitemapIndexXml(1, 'https://example.com')).toBeNull();
  });

  it('builds a standards-compliant index for 2+ files', () => {
    const xml = buildSitemapIndexXml(2, 'https://example.com/')!;
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com/sitemap-1.xml</loc>');
    expect(xml).toContain('<loc>https://example.com/sitemap-2.xml</loc>');
    expect(xml).toContain('</sitemapindex>');
  });

  it('handles base URLs without trailing slash', () => {
    const xml = buildSitemapIndexXml(3, 'https://example.com/blog')!;
    expect(xml).toContain('<loc>https://example.com/blog/sitemap-3.xml</loc>');
  });

  it('escapes ampersands in the base URL', () => {
    const xml = buildSitemapIndexXml(2, 'https://example.com/?a=1&b=2')!;
    expect(xml).toContain('&amp;');
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
  });
});
