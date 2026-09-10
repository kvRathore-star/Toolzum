import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExponentCalculator from '@/components/tools/modules/calculator/ExponentCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ExponentCalculator', () => {
  it('renders with default values', () => {
    render(<ExponentCalculator />);
    expect(screen.getByDisplayValue('2')).toBeDefined();
    expect(screen.getByDisplayValue('10')).toBeDefined();
  });

  it('shows 2^10 = 1,024 (auto mode)', () => {
    render(<ExponentCalculator />);
    expect(screen.getByText(/2.*10.*=.*1,024/)).toBeDefined();
  });

  it('recalculates when the exponent changes (10^3 = 1,000)', () => {
    render(<ExponentCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '10^3 (1000)' }));
    expect(screen.getByText(/10.*3.*=.*1,000/)).toBeDefined();
  });

  it('handles 5^4 = 625', () => {
    render(<ExponentCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '5^4 (625)' }));
    expect(screen.getByText(/5.*4.*=.*625/)).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<ExponentCalculator />);
    fireEvent.change(screen.getByLabelText('Base'), { target: { value: '' } });
    expect(screen.getByText('Enter base and exponent')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<ExponentCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText(/1,024/).closest('[aria-live="polite"]')).not.toBeNull();
  });
});
