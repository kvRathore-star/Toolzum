import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoundingCalculator from '@/components/tools/modules/math/RoundingCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('RoundingCalculator', () => {
  it('renders with default values', () => {
    render(<RoundingCalculator />);
    expect(screen.getByDisplayValue('3.14159')).toBeDefined();
    expect(screen.getByDisplayValue('2')).toBeDefined();
  });

  it('rounds 3.14159 to 3.14 half-up by default (auto mode)', () => {
    render(<RoundingCalculator />);
    expect(screen.getByText(/3\.14159.*3\.14/)).toBeDefined();
    expect(screen.getByText(/Rounds away from zero at midpoint/)).toBeDefined();
  });

  it('recalculates when decimal places change (0 dp -> 3)', () => {
    render(<RoundingCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '123.456 → 0dp' }));
    expect(screen.getByDisplayValue('123.456')).toBeDefined();
    expect(screen.getByText(/123\.456.*123/)).toBeDefined();
  });

  it('switches rounding mode (floor of 3.14159 to 2 dp -> 3.14; ceil path exists)', () => {
    render(<RoundingCalculator />);
    fireEvent.change(screen.getByLabelText('Number to round'), { target: { value: '3.149' } });
    fireEvent.click(screen.getByRole('button', { name: 'Floor (↓)' }));
    expect(screen.getByText(/3\.149.*3\.14/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Ceil (↑)' }));
    expect(screen.getByText(/3\.149.*3\.15/)).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<RoundingCalculator />);
    fireEvent.change(screen.getByLabelText('Number to round'), { target: { value: '' } });
    expect(screen.getByText('Enter a number to round')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<RoundingCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText(/Rounds away from zero at midpoint/).closest('[aria-live="polite"]')).not.toBeNull();
  });
});
