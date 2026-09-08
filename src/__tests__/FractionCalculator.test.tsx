import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FractionCalculator from '@/components/tools/modules/calculator/FractionCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('FractionCalculator', () => {
  it('renders with default values', () => {
    render(<FractionCalculator />);
    expect(screen.getByDisplayValue('1/2')).toBeDefined();
    expect(screen.getByDisplayValue('1/3')).toBeDefined();
  });

  it('shows 5/6 for the default 1/2 + 1/3 (auto mode)', () => {
    render(<FractionCalculator />);
    expect(screen.getByText(/5\/6/)).toBeDefined();
  });

  it('recalculates when inputs change (3/4 + 1/3 = 13/12)', () => {
    render(<FractionCalculator />);
    fireEvent.change(screen.getByDisplayValue('1/2'), { target: { value: '3/4' } });
    expect(screen.getByText(/13\/12/)).toBeDefined();
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<FractionCalculator />);
    fireEvent.change(screen.getByDisplayValue('1/2'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
