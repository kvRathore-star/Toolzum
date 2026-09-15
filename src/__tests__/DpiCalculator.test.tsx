import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DpiCalculator from '@/components/tools/modules/calculator/DpiCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('DpiCalculator', () => {
  it('renders with default values', () => {
    render(<DpiCalculator />);
    expect(screen.getByDisplayValue('2560')).toBeDefined();
    expect(screen.getByDisplayValue('13.3')).toBeDefined();
  });

  it('shows a DPI result with defaults (auto mode, no click needed)', () => {
    render(<DpiCalculator />);
    expect(screen.getByText(/DPI/i)).toBeDefined();
  });

  it('updates the result when inputs change', () => {
    render(<DpiCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('2560'), { target: { value: '3840' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<DpiCalculator />);
    fireEvent.change(screen.getByDisplayValue('2560'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
