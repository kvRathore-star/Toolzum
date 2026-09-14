import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CurrencyConverter from '@/components/tools/modules/finance/CurrencyConverter';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      rates: { USD: 1.0, INR: 83.5, EUR: 0.92 },
      time_last_update_utc: new Date().toISOString(),
    }),
  });
  localStorage.clear();
});

describe('CurrencyConverter', () => {
  it('renders amount input with default value', () => {
    render(<CurrencyConverter />);
    const input = screen.getByRole('spinbutton');
    expect(input).toBeDefined();
  });

  it('has from and to currency selectors', () => {
    render(<CurrencyConverter />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('converts between currencies', async () => {
    render(<CurrencyConverter />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    const results = screen.getAllByText(/8,350\.00/);
    expect(results.length).toBeGreaterThan(0);
  });

  it('swap button swaps currencies', async () => {
    render(<CurrencyConverter />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    const swapButtons = screen.getAllByLabelText('Swap currencies');
    fireEvent.click(swapButtons[swapButtons.length - 1]);
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('INR');
    expect(selects[1]).toHaveValue('USD');
  });
});
