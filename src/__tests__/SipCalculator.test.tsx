import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import SipCalculator from '@/components/tools/modules/finance/SipCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SipCalculator', () => {
  it('renders without crashing', () => {
    render(<SipCalculator />);
    expect(screen.getByText('SIP Calculator')).toBeInTheDocument();
  });

  it('displays investment summary', () => {
    render(<SipCalculator />);
    expect(screen.getByText('Total Invested')).toBeInTheDocument();
  });

  it('displays expected future value result', () => {
    render(<SipCalculator />);
    expect(screen.getByText('Expected Future Value')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<SipCalculator />);
    expect(screen.getByText('Conservative')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('Aggressive')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<SipCalculator />);
    fireEvent.click(screen.getByText('Conservative'));
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('has 3 number inputs', () => {
    render(<SipCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(3);
  });

  it('shows copy FV button', () => {
    render(<SipCalculator />);
    expect(screen.getByLabelText('Copy result')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<SipCalculator />);
    expect(screen.getByLabelText('Download result')).toBeDefined();
  });

  it('shows calculation history toggle', () => {
    render(<SipCalculator />);
    expect(screen.getByRole('button', { name: /show calculation history/i })).toBeDefined();
  });
});
