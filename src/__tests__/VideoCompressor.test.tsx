import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/useFFmpeg', () => ({
  useFFmpeg: () => ({
    ffmpeg: null,
    isLoaded: true,
    isLoading: false,
    progress: 0,
    isFirstLoad: false,
    loadError: null,
    loadFFmpeg: vi.fn(),
  }),
}));

import VideoCompressor from '@/components/tools/modules/video/VideoCompressor';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VideoCompressor', () => {
  it('shows mode selector', () => {
    render(<VideoCompressor />);
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('GIF')).toBeInTheDocument();
  });

  it('shows client-side processing info', () => {
    render(<VideoCompressor />);
    expect(screen.getByText(/100% Client-Side/)).toBeInTheDocument();
  });

  it('shows upload input for video', () => {
    render(<VideoCompressor />);
    expect(screen.getByLabelText('Upload Video')).toBeInTheDocument();
  });
});
