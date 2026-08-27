import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import RoasCalculator from '@/components/tools/modules/growth-marketing-metrics/RoasCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RoasCalculator', () => {
  it('renders without crashing', () => {
    render(<RoasCalculator />);
    expect(screen.getByText('ROAS Calculator')).toBeInTheDocument();
  });

  it('shows default revenue', () => {
    render(<RoasCalculator />);
    expect(screen.getByDisplayValue(5000)).toBeDefined();
  });

  it('shows default spend', () => {
    render(<RoasCalculator />);
    expect(screen.getByDisplayValue(1000)).toBeDefined();
  });

  it('displays ROAS result', () => {
    render(<RoasCalculator />);
    expect(screen.getByText('Return on Ad Spend (ROAS)')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<RoasCalculator />);
    expect(screen.getByText('Google Ads')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<RoasCalculator />);
    fireEvent.click(screen.getByText('Facebook Ads'));
    expect(screen.getByDisplayValue(3000)).toBeDefined();
    expect(screen.getByDisplayValue(800)).toBeDefined();
  });

  it('shows copy ROAS button', () => {
    render(<RoasCalculator />);
    expect(screen.getByLabelText('Copy ROAS')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<RoasCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });
});
