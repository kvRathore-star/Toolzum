import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import CacCalculator from '@/components/tools/modules/growth-marketing-metrics/CacCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CacCalculator', () => {
  it('renders without crashing', () => {
    render(<CacCalculator />);
    const headings = screen.getAllByText('Customer Acquisition Cost (CAC)');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('has preset buttons', () => {
    render(<CacCalculator />);
    expect(screen.getByText('SaaS Startup')).toBeInTheDocument();
  });

  it('has 3 number inputs', () => {
    render(<CacCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(3);
  });

  it('shows copy CAC button', () => {
    render(<CacCalculator />);
    expect(screen.getByLabelText('Copy CAC')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<CacCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });

  it('shows save to history button', () => {
    render(<CacCalculator />);
    expect(screen.getByLabelText('Save to history')).toBeDefined();
  });
});
