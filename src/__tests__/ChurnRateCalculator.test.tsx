import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChurnRateCalculator from '@/components/tools/modules/finance/ChurnRateCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ChurnRateCalculator', () => {
  it('renders with default values', () => {
    render(<ChurnRateCalculator />);
    expect(screen.getByDisplayValue('50')).toBeDefined();
    expect(screen.getByDisplayValue('1000')).toBeDefined();
  });

  it('shows 5.00% churn by default (50/1000, auto mode)', () => {
    render(<ChurnRateCalculator />);
    expect(screen.getByText(/Churn Rate: 5\.00%/)).toBeDefined();
  });

  it('updates when inputs change', () => {
    render(<ChurnRateCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('50'), { target: { value: '100' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<ChurnRateCalculator />);
    fireEvent.change(screen.getByDisplayValue('1000'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
