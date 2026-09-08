import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GasMileageCalculator from '@/components/tools/modules/calculator/GasMileageCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('GasMileageCalculator', () => {
  it('renders with default values', () => {
    render(<GasMileageCalculator />);
    expect(screen.getByDisplayValue('300')).toBeDefined();
    expect(screen.getByDisplayValue('10')).toBeDefined();
  });

  it('shows 30 MPG for the 300mi / 10gal default (auto mode)', () => {
    render(<GasMileageCalculator />);
    expect(screen.getByText(/30/)).toBeDefined();
  });

  it('updates when distance changes', () => {
    render(<GasMileageCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('300'), { target: { value: '400' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<GasMileageCalculator />);
    fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
