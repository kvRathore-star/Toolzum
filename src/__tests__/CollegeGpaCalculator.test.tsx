import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CollegeGpaCalculator from '@/components/tools/modules/calculator/CollegeGpaCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('CollegeGpaCalculator', () => {
  it('renders with default values', () => {
    render(<CollegeGpaCalculator />);
    expect(screen.getByDisplayValue('A,B+,A-')).toBeDefined();
    expect(screen.getByDisplayValue('3,4,3')).toBeDefined();
    expect(screen.getByDisplayValue('3.5')).toBeDefined();
    expect(screen.getByDisplayValue('30')).toBeDefined();
  });

  it('shows semester GPA 3.63 and cumulative GPA 3.53 by default (auto mode)', () => {
    render(<CollegeGpaCalculator />);
    expect(screen.getByText('Semester GPA')).toBeDefined();
    expect(screen.getByText('3.63')).toBeDefined();
    expect(screen.getByText('Cumulative GPA')).toBeDefined();
    expect(screen.getByText('3.53')).toBeDefined();
  });

  it('recalculates cumulative GPA when previous GPA changes', () => {
    render(<CollegeGpaCalculator />);
    fireEvent.change(screen.getByLabelText('Previous GPA'), {
      target: { value: '4' },
    });
    // (4*30 + 36.3) / 40 = 156.3/40 = 3.9075 -> 3.91
    expect(screen.getByText('3.91')).toBeDefined();
  });

  it('applies the First Semester preset (no prior credits -> cumulative equals semester)', () => {
    render(<CollegeGpaCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'First Semester' }));
    expect(screen.getByText('Semester GPA')).toBeDefined();
    expect(screen.getByText('Cumulative GPA')).toBeDefined();
    const matches = screen.getAllByText('3.63');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('shows the empty-state prompt and no NaN when credits are cleared (guard pattern)', () => {
    render(<CollegeGpaCalculator />);
    fireEvent.change(screen.getByLabelText('Semester Credits'), {
      target: { value: '' },
    });
    expect(screen.getByText('Enter semester grades and credits')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<CollegeGpaCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('Semester GPA').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
