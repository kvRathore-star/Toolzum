import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import RoiCalculator from '@/components/tools/modules/finance/RoiCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RoiCalculator', () => {
  it('renders without crashing', () => {
    render(<RoiCalculator />);
    expect(screen.getByText('ROI Calculator')).toBeInTheDocument();
  });

  it('shows default initial investment', () => {
    render(<RoiCalculator />);
    expect(screen.getByDisplayValue(10000)).toBeDefined();
  });

  it('shows default final value', () => {
    render(<RoiCalculator />);
    expect(screen.getByDisplayValue(15000)).toBeDefined();
  });

  it('displays ROI percentage', () => {
    render(<RoiCalculator />);
    expect(screen.getByText('Return on Investment (ROI)')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<RoiCalculator />);
    expect(screen.getByText('Stock Investment')).toBeInTheDocument();
  });

  it('applies preset on click', () => {
    render(<RoiCalculator />);
    fireEvent.click(screen.getByText('Real Estate'));
    expect(screen.getByDisplayValue(200000)).toBeDefined();
    expect(screen.getByDisplayValue(260000)).toBeDefined();
  });

  it('shows copy ROI button', () => {
    render(<RoiCalculator />);
    expect(screen.getByLabelText('Copy result')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<RoiCalculator />);
    expect(screen.getByLabelText('Download result')).toBeDefined();
  });
});
