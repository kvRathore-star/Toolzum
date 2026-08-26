import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import SmallTextGenerator from '@/components/tools/modules/text/SmallTextGenerator';
import { clipboardWrite } from '@/lib/clipboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SmallTextGenerator', () => {
  it('renders title', () => {
    render(<SmallTextGenerator />);
    expect(screen.getByText('Small Text Generator')).toBeInTheDocument();
  });

  it('renders mode buttons', () => {
    render(<SmallTextGenerator />);
    expect(screen.getByText('Superscript')).toBeInTheDocument();
    expect(screen.getByText('Subscript')).toBeInTheDocument();
    expect(screen.getByText('Tiny Text')).toBeInTheDocument();
    expect(screen.getByText('Small Caps')).toBeInTheDocument();
  });

  it('generates superscript text', () => {
    render(<SmallTextGenerator />);
    const textarea = screen.getByPlaceholderText(/type or paste/i);
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(screen.getByText('ʰᵉˡˡᵒ')).toBeInTheDocument();
  });

  it('generates subscript text', () => {
    render(<SmallTextGenerator />);
    const textarea = screen.getByPlaceholderText(/type or paste/i);
    fireEvent.change(textarea, { target: { value: 'hello' } });
    fireEvent.click(screen.getByText('Subscript'));
    expect(screen.getByText('ₕₑₗₗₒ')).toBeInTheDocument();
  });

  it('copy button calls clipboardWrite', () => {
    render(<SmallTextGenerator />);
    const textarea = screen.getByPlaceholderText(/type or paste/i);
    fireEvent.change(textarea, { target: { value: 'hi' } });
    fireEvent.click(screen.getByText(/Copy.*Superscript/));
    expect(clipboardWrite).toHaveBeenCalled();
  });
});
