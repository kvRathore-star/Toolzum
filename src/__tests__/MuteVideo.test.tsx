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
    loadFFmpeg: vi.fn(),
  }),
}));

import MuteVideo from '@/components/tools/modules/video/MuteVideo';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MuteVideo', () => {
  it('shows description', () => {
    render(<MuteVideo />);
    expect(screen.getByText(/Mute \/ Replace Audio/)).toBeInTheDocument();
  });

  it('shows upload video text', () => {
    render(<MuteVideo />);
    expect(screen.getByText(/Upload Video/)).toBeInTheDocument();
  });
});
