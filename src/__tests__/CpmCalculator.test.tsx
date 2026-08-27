import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ tool: 'cpm' }),
}));

import CpmCalculator from '@/components/tools/modules/growth-marketing-metrics/CpmCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CpmCalculator', () => {
  it('renders without crashing', () => {
    render(<CpmCalculator />);
    expect(screen.getByText('CPM Calculator')).toBeInTheDocument();
  });

  it('shows CPM/RPM/Estimate tabs', () => {
    render(<CpmCalculator />);
    expect(screen.getByText('CPM')).toBeInTheDocument();
    expect(screen.getByText('RPM')).toBeInTheDocument();
    expect(screen.getByText('Estimate')).toBeInTheDocument();
  });

  it('shows platform selector', () => {
    render(<CpmCalculator />);
    expect(screen.getByText('Custom (manual entry)')).toBeInTheDocument();
  });

  it('shows default cost', () => {
    render(<CpmCalculator />);
    expect(screen.getByDisplayValue(500)).toBeDefined();
  });

  it('shows default impressions', () => {
    render(<CpmCalculator />);
    expect(screen.getByDisplayValue(100000)).toBeDefined();
  });

  it('switches to RPM mode', () => {
    render(<CpmCalculator />);
    fireEvent.click(screen.getByText('RPM'));
    expect(screen.getByText('RPM Calculator')).toBeInTheDocument();
  });

  it('switches to Estimate mode', () => {
    render(<CpmCalculator />);
    fireEvent.click(screen.getByText('Estimate'));
    expect(screen.getByText('Earnings Calculator')).toBeInTheDocument();
  });

  it('shows YouTube platform preset', () => {
    render(<CpmCalculator />);
    fireEvent.change(screen.getByDisplayValue('Custom (manual entry)'), { target: { value: 'youtube' } });
    expect(screen.getByText(/YouTube/)).toBeInTheDocument();
  });
});
