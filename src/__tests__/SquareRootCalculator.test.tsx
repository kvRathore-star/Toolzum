import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SquareRootCalculator from '@/components/tools/modules/calculator/SquareRootCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('SquareRootCalculator', () => {
  it('renders with the default number', () => {
    render(<SquareRootCalculator />);
    expect(screen.getByDisplayValue('144')).toBeDefined();
  });

  it('shows √144 = 12.0000 (auto mode)', () => {
    render(<SquareRootCalculator />);
    expect(screen.getByText('12.0000')).toBeDefined();
  });

  it('recalculates when the number changes (√2 = 1.4142)', () => {
    render(<SquareRootCalculator />);
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '2' } });
    expect(screen.getByText('1.4142')).toBeDefined();
  });

  it('applies the √10000 preset', () => {
    render(<SquareRootCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '√10000' }));
    expect(screen.getByText('100.0000')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<SquareRootCalculator />);
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '' } });
    expect(screen.getByText('Enter a number')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<SquareRootCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('12.0000').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
