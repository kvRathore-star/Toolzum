import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import RandomPortGenerator from '@/components/tools/modules/utility/RandomPortGenerator';
import { clipboardWrite } from '@/lib/clipboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RandomPortGenerator', () => {
  it('renders generate button', () => {
    render(<RandomPortGenerator />);
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('renders range checkboxes', () => {
    render(<RandomPortGenerator />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getByText('Well-Known (0-1023)')).toBeInTheDocument();
    expect(screen.getByText('Registered (1024-49151)')).toBeInTheDocument();
    expect(screen.getByText('Dynamic (49152-65535)')).toBeInTheDocument();
  });

  it('generates ports on click', () => {
    render(<RandomPortGenerator />);
    fireEvent.click(screen.getByText('Generate'));
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('updates count via slider', () => {
    render(<RandomPortGenerator />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '5' } });
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  it('copy button calls clipboardWrite', () => {
    render(<RandomPortGenerator />);
    fireEvent.click(screen.getByText('Generate'));
    fireEvent.click(screen.getAllByText('Copy')[0]);
    expect(clipboardWrite).toHaveBeenCalled();
  });
});
