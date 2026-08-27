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

vi.mock('@/context/WorkflowPresetContext', () => ({
  usePresetContext: () => ({
    registerConfig: vi.fn(),
  }),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

import ImageCompressor from '@/components/tools/modules/image/ImageCompressor';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ImageCompressor', () => {
  it('renders without crashing', () => {
    render(<ImageCompressor />);
    expect(screen.getByText('Upload Photo to Compress')).toBeInTheDocument();
  });

  it('shows client-side message', () => {
    render(<ImageCompressor />);
    expect(screen.getByText(/100% Client-Side/)).toBeInTheDocument();
  });
});
