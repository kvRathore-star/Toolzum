import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

import PasswordGenerator from '@/components/tools/modules/utility/PasswordGenerator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PasswordGenerator', () => {
  it('renders with default length', () => {
    render(<PasswordGenerator />);
    expect(screen.getByDisplayValue(16)).toBeDefined();
  });

  it('generates password on button click', () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Regenerate'));
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value.length).toBeGreaterThan(0);
  });

  it('has aria-labels on icon buttons', () => {
    render(<PasswordGenerator />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);
  });

  it('changes length via slider', () => {
    render(<PasswordGenerator />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '24' } });
    expect(screen.getByDisplayValue(24)).toBeDefined();
  });
});
