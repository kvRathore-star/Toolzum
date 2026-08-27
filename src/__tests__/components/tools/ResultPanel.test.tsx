import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultPanel } from '@/components/tools/ResultPanel';

// Mock dependencies
vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ResultPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders result panel', () => {
    render(<ResultPanel value="test output" />);
    expect(screen.getByText('Output')).toBeDefined();
  });

  it('displays custom label', () => {
    render(<ResultPanel value="test" label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeDefined();
  });

  it('shows placeholder when no value', () => {
    render(<ResultPanel value="" />);
    expect(screen.getByPlaceholderText('Result will appear here...')).toBeDefined();
  });

  it('displays value in textarea', () => {
    render(<ResultPanel value="Hello World" />);
    expect(screen.getByDisplayValue('Hello World')).toBeDefined();
  });

  it('hides label when showLabel is false', () => {
    render(<ResultPanel value="test" showLabel={false} />);
    expect(screen.queryByText('Output')).toBeNull();
  });

  it('shows copy button by default', () => {
    render(<ResultPanel value="test" />);
    expect(screen.getByText('Copy')).toBeDefined();
  });

  it('hides copy button when showCopy is false', () => {
    render(<ResultPanel value="test" showCopy={false} />);
    expect(screen.queryByText('Copy')).toBeNull();
  });

  it('shows download button by default', () => {
    render(<ResultPanel value="test" />);
    expect(screen.getByText('Save')).toBeDefined();
  });

  it('hides download button when showDownload is false', () => {
    render(<ResultPanel value="test" showDownload={false} />);
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('disables buttons when value is empty', () => {
    render(<ResultPanel value="" />);
    expect(screen.getByText('Copy').closest('button')).toBeDisabled();
    expect(screen.getByText('Save').closest('button')).toBeDisabled();
  });

  it('applies mono class when mono is true', () => {
    render(<ResultPanel value="test" mono={true} />);
    const textarea = screen.getByDisplayValue('test');
    expect(textarea.className).toContain('font-mono');
  });

  it('renders custom preview', () => {
    render(
      <ResultPanel value="test" preview={<div data-testid="custom-preview">Custom</div>} />
    );
    expect(screen.getByTestId('custom-preview')).toBeDefined();
  });
});
