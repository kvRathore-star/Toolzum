import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RevenueGrowthCalculator from '@/components/tools/modules/finance/RevenueGrowthCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('RevenueGrowthCalculator', () => {
  it('renders with default values', () => {
    render(<RevenueGrowthCalculator />);
    expect(screen.getByDisplayValue('120000')).toBeDefined();
    expect(screen.getByDisplayValue('100000')).toBeDefined();
  });

  it('shows 20.0% growth with an up arrow by default (auto mode)', () => {
    render(<RevenueGrowthCalculator />);
    expect(screen.getByText(/↑.*20\.0%/)).toBeDefined();
  });

  it('shows a down arrow on revenue decline', () => {
    render(<RevenueGrowthCalculator />);
    fireEvent.change(screen.getByLabelText('Current Period ($)'), {
      target: { value: '80000' },
    });
    expect(screen.getByText(/↓.*20\.0%/)).toBeDefined();
  });

  it('applies the Hypergrowth preset (100.0%)', () => {
    render(<RevenueGrowthCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Hypergrowth' }));
    expect(screen.getByText(/↑.*100\.0%/)).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<RevenueGrowthCalculator />);
    fireEvent.change(screen.getByLabelText('Previous Period ($)'), { target: { value: '' } });
    expect(screen.getByText('Enter current and previous revenue')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<RevenueGrowthCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText(/20\.0%/).closest('[aria-live="polite"]')).not.toBeNull();
  });
});
