import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue({
      getPageCount: vi.fn().mockReturnValue(5),
    }),
    create: vi.fn().mockResolvedValue({
      copyPages: vi.fn().mockResolvedValue([]),
      addPage: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array()),
    }),
  },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

import PdfSplitter from '@/components/tools/modules/pdf/PdfSplitter';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PdfSplitter', () => {
  it('renders without crashing', () => {
    render(<PdfSplitter />);
    expect(screen.getByText(/100% Client-Side/)).toBeInTheDocument();
  });

  it('shows upload prompt', () => {
    render(<PdfSplitter />);
    expect(screen.getByText(/Upload PDF to Split/)).toBeInTheDocument();
  });

  it('shows client-side message', () => {
    render(<PdfSplitter />);
    expect(screen.getByText(/Extract specific pages/)).toBeInTheDocument();
  });
});
