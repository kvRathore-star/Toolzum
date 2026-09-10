import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PythagoreanTheoremCalculator from '@/components/tools/modules/calculator/PythagoreanTheoremCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('PythagoreanTheoremCalculator', () => {
  it('renders with default values', () => {
    render(<PythagoreanTheoremCalculator />);
    expect(screen.getByDisplayValue('3')).toBeDefined();
    expect(screen.getByDisplayValue('4')).toBeDefined();
  });

  it('solves 3-4-5 as 5.00 (auto mode)', () => {
    render(<PythagoreanTheoremCalculator />);
    expect(screen.getByText('c = √(a² + b²)')).toBeDefined();
    expect(screen.getByText('5.00')).toBeDefined();
  });

  it('recalculates for 5-12-13', () => {
    render(<PythagoreanTheoremCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '5-12-13' }));
    expect(screen.getByText('13.00')).toBeDefined();
  });

  it('recalculates on manual input (6, 8 -> 10.00)', () => {
    render(<PythagoreanTheoremCalculator />);
    fireEvent.change(screen.getByLabelText('Side a'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Side b'), { target: { value: '8' } });
    expect(screen.getByText('10.00')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<PythagoreanTheoremCalculator />);
    fireEvent.change(screen.getByLabelText('Side a'), { target: { value: '' } });
    expect(screen.getByText('Enter side lengths')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<PythagoreanTheoremCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('5.00').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
