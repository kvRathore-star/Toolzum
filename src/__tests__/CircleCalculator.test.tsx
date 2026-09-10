import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CircleCalculator from '@/components/tools/modules/calculator/CircleCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('CircleCalculator', () => {
  it('renders with the default radius', () => {
    render(<CircleCalculator />);
    expect(screen.getByDisplayValue('5')).toBeDefined();
  });

  it('shows area 78.5 and circumference 31.4 for r=5 (auto mode)', () => {
    render(<CircleCalculator />);
    expect(screen.getByText('Area')).toBeDefined();
    expect(screen.getByText('78.5')).toBeDefined();
    expect(screen.getByText('Circumference')).toBeDefined();
    expect(screen.getByText('31.4')).toBeDefined();
  });

  it('recalculates when the radius changes (r=1 -> area 3.1)', () => {
    render(<CircleCalculator />);
    fireEvent.change(screen.getByLabelText('Radius'), { target: { value: '1' } });
    expect(screen.getByText('3.1')).toBeDefined();
  });

  it('applies the r=10 preset', () => {
    render(<CircleCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'r=10' }));
    expect(screen.getByDisplayValue('10')).toBeDefined();
    // area = pi*100 = 314.159... -> 314.2
    expect(screen.getByText('314.2')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<CircleCalculator />);
    fireEvent.change(screen.getByLabelText('Radius'), { target: { value: '' } });
    expect(screen.getByText('Enter radius')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<CircleCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('Area').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
