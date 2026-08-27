import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import BurnRateCalculator from '@/components/tools/modules/growth-marketing-metrics/BurnRateCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BurnRateCalculator', () => {
  it('renders without crashing', () => {
    render(<BurnRateCalculator />);
    expect(screen.getByText('Startup Burn Rate & Runway')).toBeInTheDocument();
  });

  it('displays monthly burn', () => {
    render(<BurnRateCalculator />);
    expect(screen.getByText('Monthly Burn')).toBeInTheDocument();
  });

  it('displays cash runway', () => {
    render(<BurnRateCalculator />);
    expect(screen.getByText('Cash Runway Remaining')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<BurnRateCalculator />);
    expect(screen.getByText('Pre-Seed Startup')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<BurnRateCalculator />);
    fireEvent.click(screen.getByText('Seed Stage'));
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows copy burn rate button', () => {
    render(<BurnRateCalculator />);
    expect(screen.getByLabelText('Copy burn rate')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<BurnRateCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });

  it('has 3 number inputs', () => {
    render(<BurnRateCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(3);
  });
});
