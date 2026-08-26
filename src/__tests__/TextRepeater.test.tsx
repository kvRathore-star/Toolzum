import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import TextRepeater from '@/components/tools/modules/text/TextRepeater';
import { clipboardWrite } from '@/lib/clipboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TextRepeater', () => {
  it('renders title', () => {
    render(<TextRepeater />);
    expect(screen.getByText('Text Repeater')).toBeInTheDocument();
  });

  it('renders default count', () => {
    render(<TextRepeater />);
    expect(screen.getByDisplayValue(5)).toBeInTheDocument();
  });

  it('repeats text 5 times by default', () => {
    render(<TextRepeater />);
    const textarea = screen.getByPlaceholderText(/type or paste/i);
    fireEvent.change(textarea, { target: { value: 'hi' } });
    expect(screen.getByDisplayValue(/hi hi hi hi hi/)).toBeInTheDocument();
  });

  it('copy button calls clipboardWrite', () => {
    render(<TextRepeater />);
    const textarea = screen.getByPlaceholderText(/type or paste/i);
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Copy All'));
    expect(clipboardWrite).toHaveBeenCalled();
  });
});
