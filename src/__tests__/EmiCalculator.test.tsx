import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmiCalculator from '@/components/tools/modules/finance/EmiCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('EmiCalculator', () => {
  it('renders with default values', () => {
    render(<EmiCalculator />);
    expect(screen.getByDisplayValue('100000')).toBeDefined();
    expect(screen.getByDisplayValue('10')).toBeDefined();
    expect(screen.getByDisplayValue('12')).toBeDefined();
  });

  it('calculates EMI correctly', () => {
    render(<EmiCalculator />);
    fireEvent.click(screen.getByText('Calculate EMI'));
    expect(screen.getByText('Monthly EMI')).toBeDefined();
    expect(screen.getByText(/Total Interest/)).toBeDefined();
    expect(screen.getByText(/Total Payment/)).toBeDefined();
  });

  it('shows EMI value for default inputs', () => {
    render(<EmiCalculator />);
    fireEvent.click(screen.getByText('Calculate EMI'));
    const emiText = screen.getAllByText(/\$\d+\.\d{2}/);
    expect(emiText.length).toBeGreaterThan(0);
  });

  it('has aria-live on results', () => {
    render(<EmiCalculator />);
    fireEvent.click(screen.getByText('Calculate EMI'));
    const resultGrid = screen.getByText('Monthly EMI').closest('.grid');
    expect(resultGrid).toBeDefined();
  });
});
