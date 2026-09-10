import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AspectRatioCalculator from '@/components/tools/modules/calculator/AspectRatioCalculator';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('AspectRatioCalculator', () => {
  it('renders with default values', () => {
    render(<AspectRatioCalculator />);
    expect(screen.getByDisplayValue('1920')).toBeDefined();
    expect(screen.getByDisplayValue('1080')).toBeDefined();
  });

  it('reduces 1920x1080 to 16:9 and flags the common ratio (auto mode)', () => {
    render(<AspectRatioCalculator />);
    expect(screen.getByText('16:9')).toBeDefined();
    expect(screen.getByText('Common: 16:9')).toBeDefined();
  });

  it('recalculates when dimensions change (1024x768 -> 4:3)', () => {
    render(<AspectRatioCalculator />);
    fireEvent.change(screen.getByLabelText('Width (px)'), { target: { value: '1024' } });
    fireEvent.change(screen.getByLabelText('Height (px)'), { target: { value: '768' } });
    expect(screen.getByText('Common: 4:3')).toBeDefined();
  });

  it('applies the 4:3 preset', () => {
    render(<AspectRatioCalculator />);
    fireEvent.click(screen.getByRole('button', { name: '4:3' }));
    expect(screen.getByDisplayValue('1024')).toBeDefined();
    expect(screen.getByDisplayValue('768')).toBeDefined();
  });

  it('shows the empty-state prompt and no NaN when cleared (guard pattern)', () => {
    render(<AspectRatioCalculator />);
    fireEvent.change(screen.getByLabelText('Width (px)'), { target: { value: '' } });
    expect(screen.getByText('Enter dimensions')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('has no Calculate button in auto mode and exposes an aria-live region', () => {
    render(<AspectRatioCalculator />);
    expect(screen.queryByRole('button', { name: 'Calculate' })).toBeNull();
    expect(screen.getByText('16:9').closest('[aria-live="polite"]')).not.toBeNull();
  });
});
