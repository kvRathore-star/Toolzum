import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import TextReverser from '@/components/tools/modules/text/TextReverser';
import { clipboardWrite } from '@/lib/clipboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TextReverser', () => {
  it('renders title', () => {
    render(<TextReverser />);
    expect(screen.getByText('Text Reverser')).toBeInTheDocument();
  });

  it('renders mode buttons', () => {
    render(<TextReverser />);
    expect(screen.getByText('Reverse Characters')).toBeInTheDocument();
    expect(screen.getByText('Reverse Words')).toBeInTheDocument();
    expect(screen.getByText('Reverse Lines')).toBeInTheDocument();
    expect(screen.getByText('Flip Upside Down')).toBeInTheDocument();
  });

  it('reverses text characters', () => {
    render(<TextReverser />);
    const textarea = screen.getByPlaceholderText(/type or paste text/i);
    fireEvent.change(textarea, { target: { value: 'abc' } });
    expect(screen.getByText('cba')).toBeInTheDocument();
  });

  it('reverses words', () => {
    render(<TextReverser />);
    const textarea = screen.getByPlaceholderText(/type or paste text/i);
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    fireEvent.click(screen.getByText('Reverse Words'));
    expect(screen.getByText('world hello')).toBeInTheDocument();
  });

  it('reverses lines', () => {
    render(<TextReverser />);
    const textarea = screen.getByPlaceholderText(/type or paste text/i);
    fireEvent.change(textarea, { target: { value: 'line1\nline2' } });
    fireEvent.click(screen.getByText('Reverse Lines'));
    const outputTextareas = screen.getAllByDisplayValue(/line2/);
    expect(outputTextareas.length).toBeGreaterThan(0);
  });

  it('copy button calls clipboardWrite', () => {
    render(<TextReverser />);
    const textarea = screen.getByPlaceholderText(/type or paste text/i);
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Copy'));
    expect(clipboardWrite).toHaveBeenCalledWith('tset');
  });

  it('clear button clears input', () => {
    render(<TextReverser />);
    const textarea = screen.getByPlaceholderText(/type or paste text/i);
    fireEvent.change(textarea, { target: { value: 'hello' } });
    fireEvent.click(screen.getByText('Clear'));
    expect(textarea).toHaveValue('');
  });
});
