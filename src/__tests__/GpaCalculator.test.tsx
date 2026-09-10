import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GpaCalculator from '@/components/tools/modules/calculator/GpaCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('GpaCalculator', () => {
  it('renders with default values', () => {
    render(<GpaCalculator />);
    expect(screen.getByDisplayValue('A,B+,A-')).toBeDefined();
    expect(screen.getByDisplayValue('3,4,3')).toBeDefined();
  });

  it('shows GPA 3.63 for the default A,B+,A- / 3,4,3 (auto mode)', () => {
    render(<GpaCalculator />);
    expect(screen.getByText('GPA')).toBeDefined();
    expect(screen.getByText('3.63')).toBeDefined();
  });

  it('recalculates when grades change (all A -> 4.00)', () => {
    render(<GpaCalculator />);
    fireEvent.change(screen.getByLabelText('Grades (e.g., A,B+,A-)'), {
      target: { value: 'A,A,A' },
    });
    expect(screen.getByText('4.00')).toBeDefined();
  });

  it('applies the Dean\'s List preset', () => {
    render(<GpaCalculator />);
    fireEvent.click(screen.getByRole('button', { name: "Dean's List" }));
    expect(screen.getByDisplayValue('A,A-,B+')).toBeDefined();
    expect(screen.getByText('3.67')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when inputs are cleared (guard pattern)', () => {
    render(<GpaCalculator />);
    fireEvent.change(screen.getByLabelText('Grades (e.g., A,B+,A-)'), {
      target: { value: '' },
    });
    expect(screen.getByText('Enter grades and credits')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<GpaCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('GPA').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
