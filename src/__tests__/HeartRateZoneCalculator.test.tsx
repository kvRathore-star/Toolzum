import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeartRateZoneCalculator from '@/components/tools/modules/health/HeartRateZoneCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('HeartRateZoneCalculator', () => {
  it('renders with default values', () => {
    render(<HeartRateZoneCalculator />);
    expect(screen.getByDisplayValue('35')).toBeDefined();
    expect(screen.getByDisplayValue('65')).toBeDefined();
  });

  it('shows max HR with defaults (auto mode)', () => {
    render(<HeartRateZoneCalculator />);
    expect(screen.getByText(/Max HR:/)).toBeDefined();
  });

  it('updates when age changes', () => {
    render(<HeartRateZoneCalculator />);
    const before = document.body.textContent;
    fireEvent.change(screen.getByDisplayValue('35'), { target: { value: '45' } });
    expect(document.body.textContent).not.toBe(before);
  });

  it('never renders NaN with empty inputs (guard pattern)', () => {
    render(<HeartRateZoneCalculator />);
    fireEvent.change(screen.getByDisplayValue('35'), { target: { value: '' } });
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
