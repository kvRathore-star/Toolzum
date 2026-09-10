import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModuloCalculator from '@/components/tools/modules/math/ModuloCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ModuloCalculator', () => {
  it('renders with default values', () => {
    render(<ModuloCalculator />);
    expect(screen.getByDisplayValue('17')).toBeDefined();
    expect(screen.getByDisplayValue('5')).toBeDefined();
  });

  it('shows 17 mod 5 = 2 (auto mode)', () => {
    render(<ModuloCalculator />);
    expect(screen.getByText('17 mod 5 = 2')).toBeDefined();
  });

  it('recalculates on input change (100 mod 3 = 1)', () => {
    render(<ModuloCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '100 mod 3' }));
    expect(screen.getByText('100 mod 3 = 1')).toBeDefined();
  });

  it('shows the Python floored variant for negative dividends', () => {
    render(<ModuloCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '-17 mod 5' }));
    expect(screen.getByText('-17 mod 5 = -2')).toBeDefined();
    expect(screen.getByText('-17 mod 5 = 3')).toBeDefined();
  });

  it('guards division by zero without crashing', () => {
    render(<ModuloCalculator />);
    fireEvent.change(screen.getByLabelText('Divisor (b)'), { target: { value: '0' } });
    expect(screen.getByText('Divisor cannot be zero')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('shows the empty-state prompt when cleared (guard pattern)', () => {
    render(<ModuloCalculator />);
    fireEvent.change(screen.getByLabelText('Dividend (a)'), { target: { value: '' } });
    expect(screen.getByText('Enter dividend and divisor')).toBeDefined();
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<ModuloCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('17 mod 5 = 2').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
