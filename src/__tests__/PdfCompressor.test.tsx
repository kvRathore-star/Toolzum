import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue({
      setTitle: vi.fn(),
      setAuthor: vi.fn(),
      setSubject: vi.fn(),
      setKeywords: vi.fn(),
      setProducer: vi.fn(),
      setCreator: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array()),
    }),
  },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/blob', () => ({
  createDownloadBlob: vi.fn().mockReturnValue(new Blob()),
}));

import PdfCompressor from '@/components/tools/modules/pdf/PdfCompressor';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PdfCompressor', () => {
  it('renders without crashing', () => {
    render(<PdfCompressor />);
    expect(screen.getByText(/Upload PDF to Optimize/)).toBeInTheDocument();
  });

  it('shows client-side warning', () => {
    render(<PdfCompressor />);
    expect(screen.getByText(/Client-Side Only/)).toBeInTheDocument();
  });

  it('shows file uploader', () => {
    render(<PdfCompressor />);
    expect(screen.getByText(/Upload PDF to Optimize/)).toBeInTheDocument();
  });
});
