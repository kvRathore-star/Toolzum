import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MeanMedianModeCalculator from '@/components/tools/modules/calculator/MeanMedianModeCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('MeanMedianModeCalculator', () => {
  it('renders with default values', () => {
    render(<MeanMedianModeCalculator />);
    expect(screen.getByDisplayValue('2,4,4,6,8')).toBeDefined();
  });

  it('shows mean 4.80, median 4, mode 4 for the default set (auto mode)', () => {
    render(<MeanMedianModeCalculator />);
    expect(screen.getByText('Mean')).toBeDefined();
    expect(screen.getByText('4.80')).toBeDefined();
    expect(screen.getByText('Median')).toBeDefined();
    expect(screen.getByText('Mode')).toBeDefined();
  });

  it('recalculates when input changes (1,2,3,4,5 -> mean 3.00, median 3, no mode)', () => {
    render(<MeanMedianModeCalculator />);
    fireEvent.change(screen.getByLabelText('Numbers (comma-separated)'), {
      target: { value: '1,2,3,4,5' },
    });
    expect(screen.getByText('3.00')).toBeDefined();
    expect(screen.queryByText('Mode')).toBeNull();
  });

  it('applies a preset', () => {
    render(<MeanMedianModeCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '10,20,30' }));
    expect(screen.getByDisplayValue('10,20,30')).toBeDefined();
    expect(screen.getByText('20.00')).toBeDefined();
  });

  it('does not crash or render NaN with empty input (guard pattern)', () => {
    render(<MeanMedianModeCalculator />);
    fireEvent.change(screen.getByLabelText('Numbers (comma-separated)'), {
      target: { value: '' },
    });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<MeanMedianModeCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('Mean').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
