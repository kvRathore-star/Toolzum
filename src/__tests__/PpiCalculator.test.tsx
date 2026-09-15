import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PpiCalculator from '@/components/tools/modules/calculator/PpiCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('PpiCalculator', () => {
  it('renders with default values', () => {
    render(<PpiCalculator />);
    expect(screen.getByDisplayValue('1179')).toBeDefined();
    expect(screen.getByDisplayValue('6.1')).toBeDefined();
  });

  it('shows a PPI result with defaults (auto mode)', () => {
    render(<PpiCalculator />);
    expect(screen.getByText(/PPI/i)).toBeDefined();
  });

  it('updates the result when inputs change', () => {
    render(<PpiCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('1179'), { target: { value: '3840' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<PpiCalculator />);
    fireEvent.change(screen.getByDisplayValue('6.1'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
