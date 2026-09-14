import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UrlShortener from '@/components/tools/modules/utility/UrlShortener';

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UrlShortener', () => {
  it('renders URL input', () => {
    render(<UrlShortener />);
    expect(screen.getByPlaceholderText(/example.com/)).toBeDefined();
  });

  it('has aria-label on copy button after shortening', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => 'https://short.url/abc123' });
    render(<UrlShortener />);
    const input = screen.getByPlaceholderText(/example.com/);
    fireEvent.change(input, { target: { value: 'https://example.com/long-path' } });
    fireEvent.click(screen.getByText('Shorten'));
    await waitFor(() => {
      expect(screen.getByLabelText('Copy shortened URL')).toBeDefined();
    });
  });

  it('enter key triggers shorten', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => 'https://short.url/xyz' });
    render(<UrlShortener />);
    const input = screen.getByPlaceholderText(/example.com/);
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('shows shortened URL result', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => 'https://short.url/abc123' });
    render(<UrlShortener />);
    const input = screen.getByPlaceholderText(/example.com/);
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('Shorten'));
    await waitFor(() => {
      expect(screen.getByDisplayValue('https://short.url/abc123')).toBeDefined();
    });
  });
});
