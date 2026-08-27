import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import ProfitMarginCalculator from '@/components/tools/modules/finance/ProfitMarginCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProfitMarginCalculator', () => {
  it('renders without crashing', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByText('Profit Margin Calculator')).toBeInTheDocument();
  });

  it('shows default cost value', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByDisplayValue(100)).toBeDefined();
  });

  it('shows default revenue value', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByDisplayValue(150)).toBeDefined();
  });

  it('displays gross profit margin', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByText('Gross Profit Margin')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByText('Retail (50% margin)')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.click(screen.getByText('SaaS (80% margin)'));
    expect(screen.getByDisplayValue(10)).toBeDefined();
    expect(screen.getByDisplayValue(50)).toBeDefined();
  });

  it('shows copy margin button', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByLabelText('Copy margin')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });
});
