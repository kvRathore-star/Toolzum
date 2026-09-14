import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProportionCalculator from '@/components/tools/modules/calculator/ProportionCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ProportionCalculator', () => {
  it('renders with default values', () => {
    render(<ProportionCalculator />);
    expect(screen.getByDisplayValue('2')).toBeDefined();
    expect(screen.getByDisplayValue('5')).toBeDefined();
    expect(screen.getByDisplayValue('8')).toBeDefined();
  });

  it('solves 2:5 = 8:? as 20.00 (auto mode)', () => {
    render(<ProportionCalculator />);
    expect(screen.getByText('20.00')).toBeDefined();
  });

  it('recalculates when inputs change (3:4 = 12:? -> 16.00)', () => {
    render(<ProportionCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '3:4 = 12:?' }));
    expect(screen.getByText('16.00')).toBeDefined();
  });

  it('solves a custom proportion (1:10 = 5:? -> 50.00)', () => {
    render(<ProportionCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '1:10 = 5:?' }));
    expect(screen.getByText('50.00')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<ProportionCalculator />);
    fireEvent.change(screen.getByLabelText('A (first ratio)'), { target: { value: '' } });
    expect(screen.getByText('Enter values to calculate')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<ProportionCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('20.00').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
