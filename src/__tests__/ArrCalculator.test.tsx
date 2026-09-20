import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArrCalculator from '@/components/tools/modules/finance/ArrCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ArrCalculator', () => {
  it('renders with default values', () => {
    render(<ArrCalculator />);
    expect(screen.getByDisplayValue('100000')).toBeDefined();
    expect(screen.getByDisplayValue('20000')).toBeDefined();
    expect(screen.getByDisplayValue('5000')).toBeDefined();
  });

  it('shows ARR result by default (100000 + 20000 - 5000, auto mode)', () => {
    render(<ArrCalculator />);
    expect(screen.getByText('$115,000')).toBeDefined();
  });

  it('updates when inputs change', () => {
    render(<ArrCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('100000'), { target: { value: '200000' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<ArrCalculator />);
    fireEvent.change(screen.getByDisplayValue('100000'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
