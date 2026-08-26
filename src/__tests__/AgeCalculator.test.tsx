import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AgeCalculator from '@/components/tools/modules/calculator/AgeCalculator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AgeCalculator', () => {
  it('renders date inputs', () => {
    render(<AgeCalculator />);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);
  });

  it('calculates age from DOB', () => {
    render(<AgeCalculator />);
    const dobInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dobInput, { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByText('Calculate Exact Age'));
    expect(screen.getByText(/Years/)).toBeDefined();
  });

  it('shows years, months, days breakdown', () => {
    render(<AgeCalculator />);
    const dobInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dobInput, { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByText('Calculate Exact Age'));
    expect(screen.getByText(/Months/)).toBeDefined();
    expect(screen.getByText(/Days/)).toBeDefined();
  });
});
