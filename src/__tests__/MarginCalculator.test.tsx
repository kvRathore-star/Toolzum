import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import MarginCalculator from '@/components/tools/modules/finance/MarginCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MarginCalculator', () => {
  it('renders without crashing', () => {
    render(<MarginCalculator />);
    expect(screen.getByText('Margin Cost Pricing Calculator')).toBeInTheDocument();
  });

  it('shows default cost value', () => {
    render(<MarginCalculator />);
    expect(screen.getByDisplayValue(100)).toBeDefined();
  });

  it('displays target selling price', () => {
    render(<MarginCalculator />);
    expect(screen.getByText('Target Selling Price')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<MarginCalculator />);
    expect(screen.getByText('Retail (50% margin)')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<MarginCalculator />);
    fireEvent.click(screen.getByText('Wholesale (20% margin)'));
    expect(screen.getByDisplayValue(100)).toBeDefined();
  });

  it('shows copy price button', () => {
    render(<MarginCalculator />);
    expect(screen.getByLabelText('Copy price')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<MarginCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });

  it('has number inputs', () => {
    render(<MarginCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });
});
