import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GradeCalculator from '@/components/tools/modules/calculator/GradeCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('GradeCalculator', () => {
  it('renders with the default percentage', () => {
    render(<GradeCalculator />);
    expect(screen.getByDisplayValue('85')).toBeDefined();
  });

  it('maps 85 to letter grade B (auto mode)', () => {
    render(<GradeCalculator />);
    expect(screen.getByText('B')).toBeDefined();
  });

  it('maps 95 to A via the Excellent preset', () => {
    render(<GradeCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Excellent (A)' }));
    expect(screen.getByDisplayValue('95')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
  });

  it('maps a failing score to F', () => {
    render(<GradeCalculator />);
    fireEvent.change(screen.getByLabelText('Percentage (%)'), {
      target: { value: '55' },
    });
    expect(screen.getByText('F')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<GradeCalculator />);
    fireEvent.change(screen.getByLabelText('Percentage (%)'), {
      target: { value: '' },
    });
    expect(screen.getByText('Enter percentage')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<GradeCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('B').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
