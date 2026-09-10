import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RectangleAreaCalculator from '@/components/tools/modules/calculator/RectangleAreaCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('RectangleAreaCalculator', () => {
  it('renders with default values', () => {
    render(<RectangleAreaCalculator />);
    expect(screen.getByDisplayValue('10')).toBeDefined();
    expect(screen.getByDisplayValue('5')).toBeDefined();
  });

  it('shows area 50, perimeter 30, diagonal 11.2 for 10x5 (auto mode)', () => {
    render(<RectangleAreaCalculator />);
    expect(screen.getByText('Area')).toBeDefined();
    expect(screen.getByText('50')).toBeDefined();
    expect(screen.getByText('Perimeter')).toBeDefined();
    expect(screen.getByText('30')).toBeDefined();
    expect(screen.getByText('Diagonal')).toBeDefined();
    expect(screen.getByText('11.2')).toBeDefined();
  });

  it('recalculates when dimensions change (3x4 -> area 12, perimeter 14, diagonal 5.0)', () => {
    render(<RectangleAreaCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '3 x 4' }));
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('14')).toBeDefined();
    expect(screen.getByText('5.0')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<RectangleAreaCalculator />);
    fireEvent.change(screen.getByLabelText('Length'), { target: { value: '' } });
    expect(screen.getByText('Enter dimensions')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<RectangleAreaCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('Area').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
