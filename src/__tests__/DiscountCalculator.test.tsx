import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DiscountCalculator from '@/components/tools/modules/finance/DiscountCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('DiscountCalculator', () => {
  it('renders with default values', () => {
    render(<DiscountCalculator />);
    expect(screen.getByDisplayValue('100')).toBeDefined();
    expect(screen.getByDisplayValue('20')).toBeDefined();
  });

  it('shows $80 sale price by default (100 - 20%, auto mode)', () => {
    render(<DiscountCalculator />);
    expect(screen.getByText(/\$?80/)).toBeDefined();
  });

  it('updates when discount changes', () => {
    render(<DiscountCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('20'), { target: { value: '50' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<DiscountCalculator />);
    fireEvent.change(screen.getByDisplayValue('100'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
