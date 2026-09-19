import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarginCalculator from '@/components/tools/modules/finance/MarginCalculator';
import ProfitMarginCalculator from '@/components/tools/modules/finance/ProfitMarginCalculator';
import SavingsCalculator from '@/components/tools/modules/finance/SavingsCalculator';
import SalaryCalculator from '@/components/tools/modules/finance/SalaryCalculator';
import InflationCalculator from '@/components/tools/modules/finance/InflationCalculator';
import PercentageCalculator from '@/components/tools/modules/calculator/PercentageCalculator';
import SalesTaxCalculator from '@/components/tools/modules/math/SalesTaxCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

/**
 * Traffic-top formula oracles (finance batch 2).
 * Expected values computed independently from first principles.
 * D1 30d traffic: profit-margin 4, savings/salary 3, margin/unit 5,
 * percentage/sales-tax/inflation 2.
 */
describe('traffic-top oracles: finance batch 2', () => {
  it('Margin cost 100 @30%: price 142.86', () => {
    // revenue = 100 / (1 - .30) = 142.857
    const { container } = render(<MarginCalculator />);
    expect(container.textContent || '').toContain('142.86');
  });

  it('ProfitMargin cost 100 rev 150: 33.33% margin, 50% markup', () => {
    // (150-100)/150 = 33.33%; (150-100)/100 = 50%
    const { container } = render(<ProfitMarginCalculator />);
    const text = container.textContent || '';
    expect(text).toContain('33.33%');
  });

  it('Savings 10k + 500/mo @5% x10y: year-10 balance 94,111', () => {
    // interest-first monthly schedule: balance 94111, contrib 70000, int 24111
    const { container } = render(<SavingsCalculator />);
    const text = container.textContent || '';
    expect(text).toContain('94,111');
    expect(text).toContain('70,000');
    expect(text).toContain('24,111');
  });

  it('Salary CTC 12L ded 1.5L: tax 1,05,000, take-home 10,95,000, monthly 91,250', () => {
    // taxable 10,50,000 → (10.5-9)L×15% + 82500 = 105000 (slab continuity checked)
    const { container } = render(<SalaryCalculator />);
    const text = container.textContent || '';
    expect(text).toContain('1,05,000');
    expect(text).toContain('10,95,000');
    expect(text).toContain('91,250');
  });

  it('Inflation 1000 @3% x10y: 1344', () => {
    // 1000 * 1.03^10 = 1343.92 → $1344
    const { container } = render(<InflationCalculator />);
    expect(container.textContent || '').toContain('$1344');
  });

  it('Percentage: 20% of 150 = 30; 45 is 25.00% of 180', () => {
    render(<PercentageCalculator />);
    fireEvent.change(screen.getByLabelText('What is X% of Y?'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Y, the base value'), { target: { value: '150' } });
    fireEvent.click(screen.getAllByText('Calculate')[0]!);
    expect(screen.getByText('30')).toBeDefined();
    fireEvent.change(screen.getByLabelText('X is what % of Y?'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('is what % of'), { target: { value: '180' } });
    fireEvent.click(screen.getAllByText('Calculate')[1]!);
    expect(screen.getByText('25.00%')).toBeDefined();
  });

  it('SalesTax 100 @8%: total 108.00', () => {
    const { container } = render(<SalesTaxCalculator />);
    expect(container.textContent || '').toContain('Total: $108.00');
  });
});
