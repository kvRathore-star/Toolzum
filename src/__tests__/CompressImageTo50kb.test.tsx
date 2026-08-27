import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('browser-image-compression', () => ({
  default: vi.fn().mockResolvedValue(new Blob()),
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock('../../FileUploader', () => ({
  FileUploader: ({ onFileSelect, title }: { onFileSelect: (file: File, url: string) => void; title: string }) => (
    <div>
      <div>{title}</div>
      <input
        type="file"
        data-testid="file-uploader"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file, URL.createObjectURL(file));
          }
        }}
      />
    </div>
  ),
}));

import CompressImageTo50kb from '@/components/tools/modules/image/CompressImageTo50kb';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CompressImageTo50kb', () => {
  it('renders without crashing', () => {
    render(<CompressImageTo50kb />);
    expect(screen.getByText('Upload Photo (JPG / PNG)')).toBeInTheDocument();
  });

  it('shows 50KB limit warning', () => {
    render(<CompressImageTo50kb />);
    expect(screen.getByText(/Strict 50KB Portal Limit/)).toBeInTheDocument();
  });

  it('shows client-side processing message', () => {
    render(<CompressImageTo50kb />);
    expect(screen.getByText(/Files processed locally/)).toBeInTheDocument();
  });
});
