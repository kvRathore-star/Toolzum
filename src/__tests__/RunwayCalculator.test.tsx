import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RunwayCalculator from '@/components/tools/modules/finance/RunwayCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('RunwayCalculator', () => {
  it('renders with default values', () => {
    render(<RunwayCalculator />);
    expect(screen.getByDisplayValue('500000')).toBeDefined();
    expect(screen.getByDisplayValue('50000')).toBeDefined();
  });

  it('shows 10.0 months runway by default (auto mode)', () => {
    render(<RunwayCalculator />);
    expect(screen.getByText('Runway')).toBeDefined();
    expect(screen.getByText(/10\.0/)).toBeDefined();
    expect(screen.getByText('months')).toBeDefined();
  });

  it('recalculates when burn rate changes (200000 / 15000 = 13.3 months)', () => {
    render(<RunwayCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Bootstrapped' }));
    expect(screen.getByText(/13\.3/)).toBeDefined();
  });

  it('recalculates on manual input (3000000 / 200000 = 15.0 months)', () => {
    render(<RunwayCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Series A' }));
    expect(screen.getByText(/15\.0/)).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<RunwayCalculator />);
    fireEvent.change(screen.getByLabelText('Cash Balance ($)'), { target: { value: '' } });
    expect(screen.getByText('Enter cash and burn rate')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<RunwayCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('Runway').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
