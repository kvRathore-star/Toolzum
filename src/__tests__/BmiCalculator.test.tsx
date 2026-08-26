import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BmiCalculator from '@/components/tools/modules/health/BmiCalculator';

describe('BmiCalculator', () => {
  it('renders weight and height inputs', () => {
    render(<BmiCalculator />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    expect(spinbuttons.length).toBeGreaterThanOrEqual(2);
  });

  it('calculates BMI for normal weight', () => {
    render(<BmiCalculator />);
    expect(screen.getByText('24.2')).toBeDefined();
    expect(screen.getByText('Normal')).toBeDefined();
  });

  it('shows underweight category', () => {
    render(<BmiCalculator />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '50' } });
    expect(screen.getByText('Underweight')).toBeDefined();
  });

  it('shows overweight category', () => {
    render(<BmiCalculator />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '85' } });
    expect(screen.getByText('Overweight')).toBeDefined();
  });

  it('shows obese category', () => {
    render(<BmiCalculator />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '100' } });
    expect(screen.getByText('Obese')).toBeDefined();
  });
});
