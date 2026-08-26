import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import PercentageCalculator from '@/components/tools/modules/calculator/PercentageCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PercentageCalculator', () => {
  it('renders input fields', () => {
    render(<PercentageCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(4);
  });

  it('calculates X% of Y', () => {
    render(<PercentageCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '20' } });
    fireEvent.change(inputs[1], { target: { value: '50' } });
    fireEvent.click(screen.getAllByText('Calculate')[0]);
    expect(screen.getByText('10')).toBeDefined();
  });

  it('calculates what percent X is of Y', () => {
    render(<PercentageCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[2], { target: { value: '25' } });
    fireEvent.change(inputs[3], { target: { value: '100' } });
    fireEvent.click(screen.getAllByText('Calculate')[1]);
    expect(screen.getByText('25.00%')).toBeDefined();
  });

  it('shows results with aria-live', () => {
    render(<PercentageCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '10' } });
    fireEvent.change(inputs[1], { target: { value: '200' } });
    fireEvent.click(screen.getAllByText('Calculate')[0]);
    expect(screen.getByText('20')).toBeDefined();
  });
});
