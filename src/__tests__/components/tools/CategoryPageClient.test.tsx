import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/FavoriteStarButton', () => ({
  FavoriteStarButton: () => null,
}));

import { CategoryPageClient } from '@/components/tools/CategoryPageClient';

const freeTools = [
  {
    id: '1',
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Work out percentages.',
    category: 'Calculator',
    isPro: false,
  },
  {
    id: '2',
    slug: 'age-calculator',
    name: 'Age Calculator',
    description: 'Exact age in years.',
    category: 'Calculator',
    isPro: false,
  },
];

describe('CategoryPageClient filter dead-ends (#issue)', () => {
  it('explains an empty Pro filter with a reset path (no silent blank grid)', () => {
    render(<CategoryPageClient category="Calculator" tools={freeTools} />);
    expect(screen.getByText('Percentage Calculator')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Pro' }));
    expect(screen.getByText(/No Pro tools in/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Percentage Calculator')).toBeDefined();
    expect(screen.getByText('Age Calculator')).toBeDefined();
  });
});

describe('Hub upgrades (rival-teardown spec)', () => {
  const pdfTools = [
    {
      id: '10', slug: 'pdf-editor', name: 'PDF Editor',
      description: 'Edit PDFs.', category: 'PDF', isPro: false,
    },
    {
      id: '11', slug: 'pdf-compressor', name: 'PDF Compressor',
      description: 'Shrink PDFs.', category: 'PDF', isPro: false,
    },
  ];

  it('New badge renders only on listed slugs', () => {
    const { container } = render(
      <CategoryPageClient category="PDF" tools={pdfTools} />
    );
    const badges = container.querySelectorAll('span');
    const newBadges = Array.from(badges).filter((s) => s.textContent === 'New');
    expect(newBadges.length).toBeGreaterThan(0);
    // pdf-compressor card must not carry one: its heading has no New badge.
    const compressorHeading = Array.from(container.querySelectorAll('h3')).find((h) =>
      h.textContent?.includes('PDF Compressor')
    );
    expect(compressorHeading?.textContent).not.toContain('New');
  });

  it('related categories all resolve to live category pages', async () => {
    // Registry import is heavy; generous timeout (not a perf assertion).
    const { RELATED_CATEGORIES } = await import('@/data/categorySections');
    const { toolsRegistry } = await import('@/registry/tools');
    const catToSlug = (cat: string) =>
      cat === 'Growth & Marketing' ? 'growth-metrics' : cat.toLowerCase().replace(/\s+/g, '-');
    const live = new Set(toolsRegistry.map((t: { category: string }) => catToSlug(t.category)));
    for (const [cat, links] of Object.entries(RELATED_CATEGORIES)) {
      expect(links.length, `${cat} needs links`).toBeGreaterThan(0);
      for (const l of links as { slug: string }[]) {
        expect(live.has(l.slug), `${cat} links dead category /${l.slug}/`).toBe(true);
      }
    }
  }, 30000);

  it('trust strip + guides render on PDF hub', () => {
    const { container } = render(
      <CategoryPageClient category="PDF" tools={pdfTools} />
    );
    expect(container.textContent).toContain('pdf-lib');
    expect(container.textContent).toContain('More from Toolzum');
    expect(container.textContent).toContain('Guides');
  });

  it('every NEW_TOOL_SLUGS entry is a live tool', async () => {
    const { NEW_TOOL_SLUGS } = await import('@/data/categorySections');
    const { toolsRegistry } = await import('@/registry/tools');
    const slugs = new Set(toolsRegistry.map((t: { slug: string }) => t.slug));
    for (const slug of NEW_TOOL_SLUGS) {
      expect(slugs.has(slug), `${slug} badge points nowhere`).toBe(true);
    }
  });

  it('every CATEGORY_GUIDES slug is a live blog post', async () => {
    const { CATEGORY_GUIDES } = await import('@/data/categorySections');
    const { blogPosts } = await import('@/lib/blog-posts');
    const live = new Set(blogPosts.map((p: { slug: string }) => p.slug));
    for (const [cat, slugs] of Object.entries(CATEGORY_GUIDES)) {
      for (const slug of slugs as string[]) {
        expect(live.has(slug), `${cat} guides dead post ${slug}`).toBe(true);
      }
    }
  });
});
