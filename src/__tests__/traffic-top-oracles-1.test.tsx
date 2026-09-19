import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SipCalculator from '@/components/tools/modules/finance/SipCalculator';
import CompoundInterestCalculator, { compoundStats } from '@/components/tools/modules/finance/CompoundInterestCalculator';
import MortgageCalculator, { mortgageStats } from '@/components/tools/modules/finance/MortgageCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

/**
 * Traffic-top formula oracles (finance batch 1).
 * Pure-function expectations were computed INDEPENDENTLY (annuity-due FV,
 * compound amount, amortizing payment) — not copied from component code.
 * D1 30d traffic: sip 6, compound-interest 5, mortgage 2 (+emi 5 covered).
 */
describe('traffic-top oracles: finance batch 1', () => {
  it('SIP defaults 5000/mo @12% x10y: FV 11,61,695', () => {
    render(<SipCalculator />);
    // annuity-due: 5000 * (((1.01)^120 - 1) / .01) * 1.01 = 1161695.38
    expect(screen.getByText(/11,61,695/)).toBeDefined();
  });

  it('SIP custom 10000/mo @10% x5y: FV 7,80,824', () => {
    render(<SipCalculator />);
    // 10000 * (((1+0.1/12)^60 - 1) / (0.1/12)) * (1+0.1/12) = 780823.81
    const [monthly] = screen.getAllByLabelText('Monthly Investment (₹)');
    const [years] = screen.getAllByLabelText('Time Period (Years)');
    const [rate] = screen.getAllByLabelText('Expected Return Rate (p.a. %)');
    fireEvent.change(monthly!, { target: { value: '10000' } });
    fireEvent.change(rate!, { target: { value: '10' } });
    fireEvent.change(years!, { target: { value: '5' } });
    expect(screen.getByText(/7,80,824/)).toBeDefined();
  });

  it('compoundStats(10000, 5%, 12, 10): A 16470.09, interest 6470.09, eff 5.12%', () => {
    // 10000 * (1.0041667)^120 = 16470.09; effective annual = 5.12%
    const s = compoundStats('10000', '5', '12', '10');
    expect(s.A.toFixed(2)).toBe('16470.09');
    expect(s.interest.toFixed(2)).toBe('6470.09');
    expect(s.effRate.toFixed(2)).toBe('5.12');
  });

  it('compound year-10 table row matches oracle', () => {
    const { container } = render(<CompoundInterestCalculator />);
    expect(container.textContent || '').toContain('16,470.09');
  });

  it('mortgageStats(300000, 6.5%, 30): pmt 1896.20', () => {
    // 300000 * r(1+r)^360 / ((1+r)^360 - 1), r = .065/12 → 1896.20
    const s = mortgageStats('300000', '6.5', '30');
    expect(s.pmt.toFixed(2)).toBe('1896.20');
    expect(s.total.toFixed(2)).toBe('682633.47');
    expect(s.interest.toFixed(2)).toBe('382633.47');
  });
});
