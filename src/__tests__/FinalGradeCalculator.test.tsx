import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FinalGradeCalculator from '@/components/tools/modules/calculator/FinalGradeCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('FinalGradeCalculator', () => {
  it('renders with default values', () => {
    render(<FinalGradeCalculator />);
    expect(screen.getByDisplayValue('85,90,78')).toBeDefined();
    expect(screen.getByDisplayValue('20,30,50')).toBeDefined();
  });

  it('shows final grade 83.0% by default (auto mode)', () => {
    render(<FinalGradeCalculator />);
    expect(screen.getByText('Final Grade')).toBeDefined();
    expect(screen.getByText('83.0%')).toBeDefined();
  });

  it('recalculates when grades change (100,100,100 -> 100.0%)', () => {
    render(<FinalGradeCalculator />);
    fireEvent.change(screen.getByLabelText('Grades (comma-separated)'), {
      target: { value: '100,100,100' },
    });
    expect(screen.getByText('100.0%')).toBeDefined();
  });

  it('applies the Exam Heavy preset', () => {
    render(<FinalGradeCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Exam Heavy' }));
    expect(screen.getByDisplayValue('92,80,70')).toBeDefined();
    // 92*.2 + 80*.2 + 70*.6 = 18.4 + 16 + 42 = 76.4
    expect(screen.getByText('76.4%')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when inputs are cleared (guard pattern)', () => {
    render(<FinalGradeCalculator />);
    fireEvent.change(screen.getByLabelText('Grades (comma-separated)'), {
      target: { value: '' },
    });
    expect(screen.getByText('Enter grades and weights')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<FinalGradeCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('Final Grade').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
