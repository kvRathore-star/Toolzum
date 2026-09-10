import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import SalaryCalculator from '@/components/tools/modules/finance/SalaryCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SalaryCalculator', () => {
  it('renders without crashing', () => {
    render(<SalaryCalculator />);
    expect(screen.getByText('Salary Take-Home Calculator')).toBeInTheDocument();
  });

  it('shows default CTC value', () => {
    render(<SalaryCalculator />);
    expect(screen.getByDisplayValue(1200000)).toBeDefined();
  });

  it('shows default deductions value', () => {
    render(<SalaryCalculator />);
    expect(screen.getByDisplayValue(150000)).toBeDefined();
  });

  it('displays annual breakdown', () => {
    render(<SalaryCalculator />);
    expect(screen.getByText('Annual Take-Home')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<SalaryCalculator />);
    expect(screen.getByText('₹12L CTC, ₹1.5L ded')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<SalaryCalculator />);
    fireEvent.click(screen.getByText('₹20L CTC, ₹2L ded'));
    expect(screen.getByDisplayValue(2000000)).toBeDefined();
  });

  it('shows copy button after calculation', () => {
    render(<SalaryCalculator />);
    expect(screen.getByRole('button', { name: 'Copy result' })).toBeDefined();
  });

  it('shows download button after calculation', () => {
    render(<SalaryCalculator />);
    expect(screen.getByRole('button', { name: 'Download result' })).toBeDefined();
  });
});
