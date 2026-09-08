import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NetWorthCalculator from '@/components/tools/modules/finance/NetWorthCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('NetWorthCalculator', () => {
  it('renders with default values', () => {
    render(<NetWorthCalculator />);
    expect(screen.getByDisplayValue('500000')).toBeDefined();
    expect(screen.getByDisplayValue('200000')).toBeDefined();
  });

  it('shows $300,000 net worth by default (auto mode)', () => {
    render(<NetWorthCalculator />);
    expect(screen.getByText(/\$300,000/)).toBeDefined();
  });

  it('updates when assets change', () => {
    render(<NetWorthCalculator />);
    fireEvent.change(screen.getByDisplayValue('500000'), { target: { value: '600000' } });
    expect(screen.getByText(/\$400,000/)).toBeDefined();
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<NetWorthCalculator />);
    fireEvent.change(screen.getByDisplayValue('500000'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
