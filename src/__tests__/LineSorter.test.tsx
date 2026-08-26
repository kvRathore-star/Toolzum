import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import LineSorter from '@/components/tools/modules/utility/LineSorter';
import { clipboardWrite } from '@/lib/clipboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LineSorter', () => {
  it('renders action buttons', () => {
    render(<LineSorter />);
    expect(screen.getByText('Sort A → Z')).toBeInTheDocument();
    expect(screen.getByText('Sort Z → A')).toBeInTheDocument();
    expect(screen.getByText('Reverse')).toBeInTheDocument();
    expect(screen.getByText('Shuffle')).toBeInTheDocument();
    expect(screen.getByText('Remove Duplicates')).toBeInTheDocument();
  });

  it('sorts lines ascending', () => {
    render(<LineSorter />);
    const textarea = screen.getByPlaceholderText(/paste lines/i);
    fireEvent.change(textarea, { target: { value: 'cherry\napple\nbanana' } });
    fireEvent.click(screen.getByText('Sort A → Z'));
    const output = screen.getAllByRole('textbox')[1];
    expect(output).toHaveValue('apple\nbanana\ncherry');
  });

  it('sorts lines descending', () => {
    render(<LineSorter />);
    const textarea = screen.getByPlaceholderText(/paste lines/i);
    fireEvent.change(textarea, { target: { value: 'cherry\napple\nbanana' } });
    fireEvent.click(screen.getByText('Sort Z → A'));
    const output = screen.getAllByRole('textbox')[1];
    expect(output).toHaveValue('cherry\nbanana\napple');
  });

  it('reverses lines', () => {
    render(<LineSorter />);
    const textarea = screen.getByPlaceholderText(/paste lines/i);
    fireEvent.change(textarea, { target: { value: 'line1\nline2\nline3' } });
    fireEvent.click(screen.getByText('Reverse'));
    const output = screen.getAllByRole('textbox')[1];
    expect(output).toHaveValue('line3\nline2\nline1');
  });

  it('copy button calls clipboardWrite', () => {
    render(<LineSorter />);
    const textarea = screen.getByPlaceholderText(/paste lines/i);
    fireEvent.change(textarea, { target: { value: 'cherry\napple' } });
    fireEvent.click(screen.getByText('Sort A → Z'));
    fireEvent.click(screen.getByText('Copy'));
    expect(clipboardWrite).toHaveBeenCalledWith('apple\ncherry');
  });
});
