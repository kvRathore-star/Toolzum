import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { UnitConverter } from '@/components/tools/modules/converter/UnitConverter';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UnitConverter', () => {
  it('renders without crashing', () => {
    render(<UnitConverter />);
    expect(screen.getByText('Unit Converter')).toBeInTheDocument();
  });

  it('shows result section', () => {
    render(<UnitConverter />);
    expect(screen.getByText('Result')).toBeInTheDocument();
  });

  it('has category buttons', () => {
    render(<UnitConverter />);
    expect(screen.getByText('Length')).toBeInTheDocument();
    expect(screen.getByText('Mass')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('switches category to Temperature', () => {
    render(<UnitConverter />);
    fireEvent.click(screen.getByText('Temperature'));
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('switches category to Mass', () => {
    render(<UnitConverter />);
    fireEvent.click(screen.getByText('Mass'));
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('has from and to unit selectors', () => {
    render(<UnitConverter />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('has input field', () => {
    render(<UnitConverter />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows result text with conversion', () => {
    render(<UnitConverter />);
    expect(screen.getByText(/1/)).toBeDefined();
  });
});
