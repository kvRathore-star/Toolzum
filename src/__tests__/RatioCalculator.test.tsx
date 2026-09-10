import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RatioCalculator from '@/components/tools/modules/calculator/RatioCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('RatioCalculator', () => {
  it('renders with default values', () => {
    render(<RatioCalculator />);
    expect(screen.getByDisplayValue('12')).toBeDefined();
    expect(screen.getByDisplayValue('8')).toBeDefined();
  });

  it('simplifies 12:8 to 3 : 2 (auto mode)', () => {
    render(<RatioCalculator />);
    expect(screen.getByText('3 : 2')).toBeDefined();
  });

  it('recalculates when inputs change (100:75 -> 4 : 3)', () => {
    render(<RatioCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '100:75' }));
    expect(screen.getByText('4 : 3')).toBeDefined();
  });

  it('keeps an already-simple ratio (16:9 HD preset)', () => {
    render(<RatioCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '16:9 (HD)' }));
    expect(screen.getByText('16 : 9')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<RatioCalculator />);
    fireEvent.change(screen.getByLabelText('First Number'), { target: { value: '' } });
    expect(screen.getByText('Enter numbers')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<RatioCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('3 : 2').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
