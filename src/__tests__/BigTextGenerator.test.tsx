import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import BigTextGenerator from '@/components/tools/modules/text/BigTextGenerator';
import { clipboardWrite } from '@/lib/clipboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BigTextGenerator', () => {
  it('renders title', () => {
    render(<BigTextGenerator />);
    expect(screen.getByText('Big Text Generator')).toBeInTheDocument();
  });

  it('renders style buttons', () => {
    render(<BigTextGenerator />);
    expect(screen.getByText('ASCII Block')).toBeInTheDocument();
    expect(screen.getByText('Bubble Text')).toBeInTheDocument();
    expect(screen.getByText('Math Bold')).toBeInTheDocument();
  });

  it('generates ASCII art for text', () => {
    render(<BigTextGenerator />);
    const textarea = screen.getByPlaceholderText(/type something/i);
    fireEvent.change(textarea, { target: { value: 'A' } });
    expect(screen.getByText(/██/)).toBeInTheDocument();
  });

  it('generates bubble text', () => {
    render(<BigTextGenerator />);
    const textarea = screen.getByPlaceholderText(/type something/i);
    fireEvent.change(textarea, { target: { value: 'a' } });
    fireEvent.click(screen.getByText('Bubble Text'));
    expect(screen.getByText('ⓐ')).toBeInTheDocument();
  });

  it('copy button calls clipboardWrite', () => {
    render(<BigTextGenerator />);
    const textarea = screen.getByPlaceholderText(/type something/i);
    fireEvent.change(textarea, { target: { value: 'A' } });
    fireEvent.click(screen.getByText(/Copy/));
    expect(clipboardWrite).toHaveBeenCalled();
  });
});
