import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn().mockResolvedValue({
      copyPages: vi.fn().mockResolvedValue([]),
      addPage: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array()),
    }),
    load: vi.fn().mockResolvedValue({
      getPageIndices: vi.fn().mockReturnValue([]),
    }),
  },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/blob', () => ({
  createDownloadBlob: vi.fn().mockReturnValue(new Blob()),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

import PdfMerger from '@/components/tools/modules/pdf/PdfMerger';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PdfMerger', () => {
  it('renders without crashing', () => {
    render(<PdfMerger />);
    expect(screen.getByText(/100% Client-Side PDF Merger/)).toBeInTheDocument();
  });

  it('shows client-side message', () => {
    render(<PdfMerger />);
    expect(screen.getByText(/Combine multiple PDFs/)).toBeInTheDocument();
  });
});
