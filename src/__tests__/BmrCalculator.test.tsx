import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import BmrCalculator from '@/components/tools/modules/health/BmrCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BmrCalculator', () => {
  it('renders without crashing', () => {
    render(<BmrCalculator />);
    expect(screen.getByText('BMR & TDEE Calculator')).toBeInTheDocument();
  });

  it('shows default weight', () => {
    render(<BmrCalculator />);
    expect(screen.getByDisplayValue(70)).toBeDefined();
  });

  it('shows default height', () => {
    render(<BmrCalculator />);
    expect(screen.getByDisplayValue(170)).toBeDefined();
  });

  it('shows default age', () => {
    render(<BmrCalculator />);
    expect(screen.getByDisplayValue(25)).toBeDefined();
  });

  it('displays BMR result', () => {
    render(<BmrCalculator />);
    expect(screen.getByText('Basal Metabolic Rate')).toBeInTheDocument();
  });

  it('displays TDEE result', () => {
    render(<BmrCalculator />);
    expect(screen.getByText('TDEE (Daily Calories Needed)')).toBeInTheDocument();
  });

  it('has gender selector', () => {
    render(<BmrCalculator />);
    const select = screen.getAllByRole('combobox')[0];
    expect(select).toBeDefined();
  });

  it('has activity level selector', () => {
    render(<BmrCalculator />);
    expect(screen.getByText('Sedentary (Little or no exercise)')).toBeInTheDocument();
  });

  it('changes gender to female', () => {
    render(<BmrCalculator />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'female' } });
    expect(selects[0]).toHaveValue('female');
  });
});
