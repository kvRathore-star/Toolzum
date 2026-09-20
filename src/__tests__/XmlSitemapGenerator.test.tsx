import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn(),
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import XmlSitemapGenerator from '@/components/tools/modules/seo/XmlSitemapGenerator';

function mockPlan(plan: string) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ plan }),
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function openSettings() {
  fireEvent.click(screen.getByText('Advanced settings'));
}

describe('XmlSitemapGenerator max-pages default', () => {
  it('defaults to 50 before plan resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<XmlSitemapGenerator />);
    openSettings();
    expect((screen.getByLabelText('Max pages to crawl') as HTMLSelectElement).value).toBe('50');
  });

  it('defaults to 500 for Pro users', async () => {
    mockPlan('pro');
    render(<XmlSitemapGenerator />);
    openSettings();
    await waitFor(() => {
      expect((screen.getByLabelText('Max pages to crawl') as HTMLSelectElement).value).toBe('500');
    });
  });

  it('defaults to 200 for signed-in users', async () => {
    mockPlan('signedin');
    render(<XmlSitemapGenerator />);
    openSettings();
    await waitFor(() => {
      expect((screen.getByLabelText('Max pages to crawl') as HTMLSelectElement).value).toBe('200');
    });
  });

  it('keeps 50 for anon users and disables above-cap options', async () => {
    mockPlan('anon');
    render(<XmlSitemapGenerator />);
    openSettings();
    await waitFor(() => {
      expect(screen.getByText(/your plan allows up to 100/)).toBeDefined();
    });
    expect((screen.getByLabelText('Max pages to crawl') as HTMLSelectElement).value).toBe('50');
    const options = screen.getAllByRole('option') as HTMLOptionElement[];
    const byValue = Object.fromEntries(options.map(o => [o.value, o]));
    expect(byValue['100']!.disabled).toBe(false);
    expect(byValue['200']!.disabled).toBe(true);
    expect(byValue['500']!.disabled).toBe(true);
  });
});
