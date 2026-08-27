import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import ConversionRateCalculator from '@/components/tools/modules/growth-marketing-metrics/ConversionRateCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConversionRateCalculator', () => {
  it('renders without crashing', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByText('Conversion Rate Calculator')).toBeInTheDocument();
  });

  it('shows default conversions', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByDisplayValue(50)).toBeDefined();
  });

  it('shows default visitors', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByDisplayValue(1000)).toBeDefined();
  });

  it('displays conversion rate', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByText('E-commerce')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<ConversionRateCalculator />);
    fireEvent.click(screen.getByText('SaaS Landing Page'));
    expect(screen.getByDisplayValue(120)).toBeDefined();
    expect(screen.getByDisplayValue(3000)).toBeDefined();
  });

  it('shows copy rate button', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByLabelText('Copy rate')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<ConversionRateCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });
});
