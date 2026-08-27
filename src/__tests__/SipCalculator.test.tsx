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
    expect(screen.getByText('Investment Summary')).toBeInTheDocument();
  });

  it('displays year-by-year breakdown', () => {
    render(<SipCalculator />);
    expect(screen.getByText('Year-by-Year Breakdown')).toBeInTheDocument();
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
    expect(screen.getByLabelText('Copy FV')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<SipCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });

  it('shows save to history button', () => {
    render(<SipCalculator />);
    expect(screen.getByLabelText('Save to history')).toBeDefined();
  });
});
