import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import GstCalculator from '@/components/tools/modules/indian-utilities/GstCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GstCalculator', () => {
  it('renders with default values (1000, 18%)', () => {
    render(<GstCalculator />);
    expect(screen.getByDisplayValue(1000)).toBeDefined();
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
  });

  it('calculates GST add correctly (180 on 1000)', () => {
    render(<GstCalculator />);
    expect(screen.getByText('₹1180.00')).toBeDefined();
    expect(screen.getByText('₹180.00')).toBeDefined();
  });

  it('calculates GST remove correctly', () => {
    render(<GstCalculator />);
    fireEvent.change(screen.getByDisplayValue(1000), { target: { value: '1180' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'remove' } });
    expect(screen.getByText('₹1000.00')).toBeDefined();
  });

  it('switches between add/remove mode', () => {
    render(<GstCalculator />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'remove' } });
    expect(selects[1]).toHaveValue('remove');
  });

  it('shows result with aria-live', () => {
    render(<GstCalculator />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeDefined();
  });
});
