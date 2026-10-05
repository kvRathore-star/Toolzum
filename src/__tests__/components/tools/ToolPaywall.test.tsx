import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolPaywall } from '@/components/tools/ToolPaywall';
import { FREE_SINGLE_ALTERNATIVE, proSlugs } from '@/registry/tools-constants';
import { clientToolsRegistry } from '@/registry/tools-client-index';

describe('ToolPaywall free-alt mapping', () => {
  it('every key is a Pro tool and every value is a real non-Pro tool', () => {
    const pro = new Set(proSlugs as string[]);
    const bySlug = new Map(clientToolsRegistry.map((t) => [t.slug, t]));
    const bad: string[] = [];
    for (const [bulk, single] of Object.entries(FREE_SINGLE_ALTERNATIVE)) {
      if (!pro.has(bulk)) bad.push(`${bulk}: not a Pro tool`);
      const target = bySlug.get(single);
      if (!target) bad.push(`${bulk}: target ${single} missing from client registry`);
      else if (pro.has(single)) bad.push(`${bulk}: target ${single} is also Pro`);
    }
    expect(Object.keys(FREE_SINGLE_ALTERNATIVE).length).toBeGreaterThan(10);
    expect(bad).toEqual([]);
  });
});

describe('ToolPaywall free-alt render', () => {
  const base = {
    isLocked: true,
    showSignInPrompt: true,
    proToolCount: 65,
    toolCount: 1100,
    title: 'Bulk Image Resizer',
  };

  it('shows the free single-file link when locked with freeAlt', () => {
    render(
      <ToolPaywall {...base} freeAlt={{ name: 'Image Resizer', href: '/image/image-resizer/' }}>
        <div>tool body</div>
      </ToolPaywall>
    );
    const link = screen.getByRole('link', { name: /try image resizer free, no signup/i });
    expect(link.getAttribute('href')).toContain('/image/image-resizer');
  });

  it('shows no free-alt link when locked without freeAlt', () => {
    render(
      <ToolPaywall {...base} freeAlt={null}>
        <div>tool body</div>
      </ToolPaywall>
    );
    expect(screen.queryByRole('link', { name: /try .* free, no signup/i })).toBeNull();
  });

  it('renders children unlocked', () => {
    render(
      <ToolPaywall {...base} isLocked={false} freeAlt={{ name: 'Image Resizer', href: '/image/image-resizer/' }}>
        <div>tool body</div>
      </ToolPaywall>
    );
    expect(screen.getByText('tool body')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /try .* free, no signup/i })).toBeNull();
  });
});
