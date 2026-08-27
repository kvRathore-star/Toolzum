import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

import MorseCodeTranslator from '@/components/tools/modules/utility/MorseCodeTranslator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MorseCodeTranslator', () => {
  it('renders without crashing', () => {
    render(<MorseCodeTranslator />);
    expect(screen.getByText('Text → Morse')).toBeInTheDocument();
  });

  it('has encode/decode toggle', () => {
    render(<MorseCodeTranslator />);
    expect(screen.getByText('Text → Morse')).toBeInTheDocument();
  });

  it('has input textarea', () => {
    render(<MorseCodeTranslator />);
    const textarea = screen.getByPlaceholderText(/type your text/i);
    expect(textarea).toBeDefined();
  });

  it('has output textarea', () => {
    render(<MorseCodeTranslator />);
    const textarea = screen.getByPlaceholderText(/translation will appear/i);
    expect(textarea).toBeDefined();
  });

  it('has SOS preset button', () => {
    render(<MorseCodeTranslator />);
    expect(screen.getByText('SOS')).toBeInTheDocument();
  });

  it('has Hello World preset button', () => {
    render(<MorseCodeTranslator />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies SOS preset', () => {
    render(<MorseCodeTranslator />);
    fireEvent.click(screen.getByText('SOS'));
    const input = screen.getByDisplayValue('SOS');
    expect(input).toBeDefined();
  });

  it('toggles to decode mode', () => {
    render(<MorseCodeTranslator />);
    fireEvent.click(screen.getByText('Text → Morse'));
    expect(screen.getByText('Morse → Text')).toBeInTheDocument();
  });

  it('translates text to morse on input', () => {
    render(<MorseCodeTranslator />);
    const textarea = screen.getByPlaceholderText(/type your text/i);
    fireEvent.change(textarea, { target: { value: 'SOS' } });
    const output = screen.getByPlaceholderText(/translation will appear/i) as HTMLTextAreaElement;
    expect(output.value).toContain('...');
  });

  it('has clear button', () => {
    render(<MorseCodeTranslator />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
