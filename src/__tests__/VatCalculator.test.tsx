import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import VatCalculator from '@/components/tools/modules/finance/VatCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VatCalculator', () => {
  it('renders without crashing', () => {
    render(<VatCalculator />);
    expect(screen.getByText('VAT Calculator')).toBeInTheDocument();
  });

  it('shows default net price', () => {
    render(<VatCalculator />);
    expect(screen.getByDisplayValue(100)).toBeDefined();
  });

  it('displays gross price', () => {
    render(<VatCalculator />);
    expect(screen.getByText('Gross Price (Inclusive)')).toBeInTheDocument();
  });

  it('has preset buttons', () => {
    render(<VatCalculator />);
    expect(screen.getByText('UK Standard')).toBeInTheDocument();
  });

  it('shows copy gross button', () => {
    render(<VatCalculator />);
    expect(screen.getByLabelText('Copy gross')).toBeDefined();
  });

  it('shows download CSV button', () => {
    render(<VatCalculator />);
    expect(screen.getByLabelText('Download CSV')).toBeDefined();
  });

  it('has number inputs', () => {
    render(<VatCalculator />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });
});
