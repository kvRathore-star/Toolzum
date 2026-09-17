import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BmiCalculator from '@/components/tools/modules/health/BmiCalculator';
import BmrCalculator from '@/components/tools/modules/health/BmrCalculator';
import EmiCalculator from '@/components/tools/modules/finance/EmiCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

/**
 * Formula oracles for the highest-risk tools (#trust-sweep). Health and
 * money math must equal independent computation, not just "not NaN":
 * - BMI: WHO definition kg/m^2 + 18.5/25 cutoffs
 * - BMR: Mifflin-St Jeor (male 10w+6.25h-5a+5)
 * - EMI: reducing-balance amortization
 */
describe('health + finance formula oracles', () => {
  it('BMI: defaults 70kg/170cm read 24.2', () => {
    render(<BmiCalculator />);
    expect(screen.getByText('24.2')).toBeDefined();
  });

  it('BMI: 70kg/175cm reads 22.9 Normal (WHO cutoff)', () => {
    render(<BmiCalculator />);
    const heights = screen.getAllByLabelText('Height (cm)');
    fireEvent.change(heights[0]!, { target: { value: '175' } });
    expect(screen.getByText('22.9')).toBeDefined();
    expect(screen.getByText('Normal')).toBeDefined();
  });

  it('BMI: 50kg/175cm reads Underweight (16.3)', () => {
    render(<BmiCalculator />);
    const weights = screen.getAllByLabelText('Weight (kg)');
    const heights = screen.getAllByLabelText('Height (cm)');
    fireEvent.change(weights[0]!, { target: { value: '50' } });
    fireEvent.change(heights[0]!, { target: { value: '175' } });
    expect(screen.getByText('16.3')).toBeDefined();
    expect(screen.getByText('Underweight')).toBeDefined();
  });

  it('BMR: defaults male/25/70kg/170cm read 1643 + TDEE 1971', () => {
    render(<BmrCalculator />);
    expect(screen.getByText(/1643/)).toBeDefined();
    expect(screen.getByText(/1971 kcal\/day/)).toBeDefined();
  });

  it('BMR: male/30/70kg/175cm reads 1649 (Mifflin-St Jeor)', () => {
    render(<BmrCalculator />);
    fireEvent.change(screen.getByLabelText('Age (Years)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } });
    expect(screen.getByText(/1649/)).toBeDefined();
  });

  it('EMI: $100K at 10% for 12mo reads $8791.59 (amortization)', () => {
    render(<EmiCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '$100K, 10%, 12mo' }));
    expect(screen.getByText('$8791.59')).toBeDefined();
    expect(screen.getByText('$5499.06')).toBeDefined();
  });
});
