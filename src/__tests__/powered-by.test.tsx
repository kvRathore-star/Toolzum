import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { poweredByLibs } from '@/lib/cloudPatterns';
import { PoweredBy } from '@/components/tools/PoweredBy';
import { toolsRegistry } from '@/registry/tools';

describe('poweredByLibs', () => {
  it('maps known engines to display labels', () => {
    expect(poweredByLibs('FFmpeg WASM').map((l) => l.label)).toContain('FFmpeg');
    expect(poweredByLibs('pdf-lib, SheetJS').map((l) => l.label)).toEqual(
      expect.arrayContaining(['pdf-lib', 'SheetJS'])
    );
    expect(poweredByLibs('Canvas API, jszip')[0]).toMatchObject({ label: 'Canvas' });
  });

  it('skips junk deps and caps at 3', () => {
    expect(poweredByLibs('Vanilla JS')).toEqual([]);
    expect(poweredByLibs('none')).toEqual([]);
    expect(poweredByLibs('Browser API (landing page)')).toEqual([]);
    expect(
      poweredByLibs('FFmpeg WASM, pdf-lib, Canvas API, jszip, SheetJS')
    ).toHaveLength(3);
  });

  it('never emits version numbers', () => {
    for (const t of toolsRegistry) {
      for (const lib of poweredByLibs(t.dependencies || '')) {
        expect(lib.label).not.toMatch(/\d+\.\d+/);
      }
    }
  });

  it('real tools resolve to sane engines', () => {
    const bySlug = new Map(toolsRegistry.map((t) => [t.slug, t] as const));
    const labels = (s: string) =>
      poweredByLibs(bySlug.get(s)?.dependencies || '').map((l) => l.label);
    expect(labels('bulk-image-resizer')).toContain('Canvas');
    expect(labels('bulk-pdf-merger')).toContain('pdf-lib');
    expect(labels('bulk-audio-converter')).toContain('FFmpeg');
    expect(labels('qr-code-generator')).toContain('QRCode.js');
  });
});

describe('PoweredBy render', () => {
  it('renders plain text in rows and links on tool pages', () => {
    const { unmount } = render(<PoweredBy deps="pdf-lib, SheetJS" />);
    expect(screen.getByText(/runs on/i)).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
    unmount();
    render(<PoweredBy deps="pdf-lib, SheetJS" linked />);
    expect(screen.getByRole('link', { name: /pdf-lib/i }).getAttribute('href'))
      .toContain('pdf-lib');
  });

  it('renders nothing for junk deps', () => {
    const { container } = render(<PoweredBy deps="Vanilla JS" />);
    expect(container.textContent).toBe('');
  });
});
