import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import BrailleTranslator from '@/components/tools/modules/text/BrailleTranslator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BrailleTranslator', () => {
  it('renders without crashing', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('English to Braille Translator')).toBeInTheDocument();
  });

  it('has English plaintext input', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('English Plaintext')).toBeInTheDocument();
  });

  it('has Braille output section', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('Braille Characters Output')).toBeInTheDocument();
  });

  it('has translate to Braille button', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('Translate to Braille →')).toBeInTheDocument();
  });

  it('has translate to Text button', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('← Translate to Text')).toBeInTheDocument();
  });

  it('has copy text button', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('Copy Text')).toBeInTheDocument();
  });

  it('has copy Braille button', () => {
    render(<BrailleTranslator />);
    expect(screen.getByText('Copy Braille')).toBeInTheDocument();
  });

  it('has input textarea for English text', () => {
    render(<BrailleTranslator />);
    const textarea = screen.getByPlaceholderText(/type standard text/i);
    expect(textarea).toBeDefined();
  });

  it('has output textarea for Braille', () => {
    render(<BrailleTranslator />);
    const textarea = screen.getByPlaceholderText(/braille cells output/i);
    expect(textarea).toBeDefined();
  });
});
