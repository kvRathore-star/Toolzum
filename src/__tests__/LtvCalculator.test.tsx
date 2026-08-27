import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import LtvCalculator from '@/components/tools/modules/growth-marketing-metrics/LtvCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LtvCalculator', () => {
  it('renders without crashing', () => {
    render(<LtvCalculator />);
    expect(screen.getByText('Customer Lifetime Value (LTV)')).toBeInTheDocument();
  });

  it('shows default AOV', () => {
    render(<LtvCalculator />);
    expect(screen.getByDisplayValue(85)).toBeDefined();
  });

  it('shows default frequency', () => {
    render(<LtvCalculator />);
    expect(screen.getByDisplayValue(4)).toBeDefined();
  });

  it('shows default lifespan', () => {
    render(<LtvCalculator />);
    expect(screen.getByDisplayValue(5)).toBeDefined();
  });

  it('displays customer LTV', () => {
    render(<LtvCalculator />);
    expect(screen.getByText('Customer LTV')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<LtvCalculator />);
    expect(screen.getByText('SaaS Monthly')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<LtvCalculator />);
    fireEvent.click(screen.getByText('E-commerce'));
    expect(screen.getByDisplayValue(85)).toBeDefined();
  });

  it('shows copy LTV button', () => {
    render(<LtvCalculator />);
    expect(screen.getByLabelText('Copy LTV')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<LtvCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });
});
