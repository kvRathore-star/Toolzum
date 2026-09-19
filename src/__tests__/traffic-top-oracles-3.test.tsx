import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AgeCalculator from '@/components/tools/modules/calculator/AgeCalculator';
import { UnitConverter } from '@/components/tools/modules/converter/UnitConverter';
import { TimeDurationCalculator } from '@/components/tools/modules/productivity/Timers';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

/**
 * Traffic-top formula oracles (batch 3: converters + date/time).
 * D1 30d traffic: unit-converter 5, age/time-duration 3-4.
 */
describe('traffic-top oracles: converters + date/time', () => {
  it('Age 2000-01-01 to 2025-01-01: 25 years, 0 months, 0 days', () => {
    const { container } = render(<AgeCalculator />);
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Target Date (Defaults to Today)'), { target: { value: '2025-01-01' } });
    fireEvent.click(screen.getByText('Calculate Exact Age'));
    const text = container.textContent || '';
    expect(text).toMatch(/25\s*Years/);
  });

  it('Unit 1 Mile to Kilometer: 1.60934', () => {
    const { container } = render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'Mile' } });
    const text = container.textContent || '';
    // 1 mi = 1609.344 m = 1.609344 km → max 6 fraction digits
    expect(text).toContain('1.609344');
  });

  it('TimeDuration 09:00 to 17:30: 8h 30m 0s (30600 seconds)', () => {
    const { container } = render(<TimeDurationCalculator />);
    fireEvent.click(screen.getByText('Calculate Duration'));
    expect(container.textContent || '').toContain('8h 30m 0s (30600 seconds)');
  });
});
