import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimeZoneConverter } from '@/components/tools/modules/MiscDateTimeAndConverterTools';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

describe('TimeZoneConverter hardening', () => {
  it('converts 12:00 UTC to 17:30 Kolkata (fixed +5:30, no DST)', () => {
    render(<TimeZoneConverter />);
    fireEvent.change(screen.getByLabelText('To time zone'), {
      target: { value: 'Asia/Kolkata' },
    });
    expect(screen.getByText(/17:30/)).toBeDefined();
  });

  it('survives a typoed timezone with a prompt instead of crashing', () => {
    render(<TimeZoneConverter />);
    fireEvent.change(screen.getByLabelText('From time zone'), {
      target: { value: 'Not/AZone' },
    });
    expect(
      screen.getByText('Enter a time and valid time zones'),
    ).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('offers timezone suggestions and swap action', () => {
    render(<TimeZoneConverter />);
    expect(document.querySelector('datalist#tz-list')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Swap time zones' }),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Use current time' }),
    ).toBeDefined();
  });
});
