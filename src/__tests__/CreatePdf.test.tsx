import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

import CreatePdf from '@/components/tools/modules/pdf/CreatePdf';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreatePdf', () => {
  it('renders without crashing', () => {
    render(<CreatePdf />);
    expect(screen.getByText('Create PDF')).toBeInTheDocument();
  });

  it('shows mode tabs', () => {
    render(<CreatePdf />);
    expect(screen.getByText('Plain Text')).toBeInTheDocument();
    expect(screen.getByText('CSV Table')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('XML')).toBeInTheDocument();
  });

  it('shows document title input', () => {
    render(<CreatePdf />);
    expect(screen.getByDisplayValue('Document')).toBeDefined();
  });

  it('shows font size selector', () => {
    render(<CreatePdf />);
    expect(screen.getByDisplayValue('12pt')).toBeInTheDocument();
  });

  it('has include title checkbox', () => {
    render(<CreatePdf />);
    expect(screen.getByText('Include title on first page')).toBeInTheDocument();
  });

  it('has create PDF button', () => {
    render(<CreatePdf />);
    expect(screen.getByText('Create PDF')).toBeInTheDocument();
  });

  it('switches to CSV mode', () => {
    render(<CreatePdf />);
    fireEvent.click(screen.getByText('CSV Table'));
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
  });

  it('switches to JSON mode', () => {
    render(<CreatePdf />);
    fireEvent.click(screen.getByText('JSON'));
    expect(screen.getByText('Upload JSON File')).toBeInTheDocument();
  });

  it('has text input area', () => {
    render(<CreatePdf />);
    const textarea = screen.getByPlaceholderText(/enter your text/i);
    expect(textarea).toBeDefined();
  });
});
