import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BmrCalculator from '@/components/tools/modules/health/BmrCalculator';
import EmiCalculator from '@/components/tools/modules/finance/EmiCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

/**
 * Formula oracles for the highest-risk tools (#trust-sweep). BMI categories
 * are already pinned in BmiCalculator.test.tsx; these cover what was not:
 * exact BMR values (Mifflin-St Jeor) and exact EMI amortization.
 */
describe('health + finance formula oracles', () => {  it('BMR: defaults male/25/70kg/170cm read 1643 + TDEE 1971', () => {
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
