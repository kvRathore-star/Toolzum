import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { EncoderDecoder } from '@/components/tools/modules/developer/EncoderDecoder';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EncoderDecoder', () => {
  it('renders without crashing', () => {
    render(<EncoderDecoder />);
    expect(screen.getByText('Encoder / Decoder')).toBeInTheDocument();
  });

  it('has encode and decode mode buttons', () => {
    render(<EncoderDecoder />);
    const encodeButtons = screen.getAllByText('Encode');
    expect(encodeButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Decode')).toBeInTheDocument();
  });

  it('has scheme selector', () => {
    render(<EncoderDecoder />);
    expect(screen.getByText('Base64')).toBeInTheDocument();
  });

  it('has input textarea', () => {
    render(<EncoderDecoder />);
    const textarea = screen.getByPlaceholderText(/enter text to encode/i);
    expect(textarea).toBeDefined();
  });

  it('has preset buttons', () => {
    render(<EncoderDecoder />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Sample URL')).toBeInTheDocument();
    expect(screen.getByText('HTML Tags')).toBeInTheDocument();
  });

  it('applies Hello World preset', () => {
    render(<EncoderDecoder />);
    fireEvent.click(screen.getByText('Hello World'));
    const textarea = screen.getByPlaceholderText(/enter text to encode/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello World');
  });

  it('switches to decode mode', () => {
    render(<EncoderDecoder />);
    fireEvent.click(screen.getByText('Decode'));
    expect(screen.getByPlaceholderText(/enter text to decode/i)).toBeDefined();
  });
});
