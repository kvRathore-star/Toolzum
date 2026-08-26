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
    isLoaded: false,
    isLoading: false,
    progress: 0,
    loadFFmpeg: vi.fn(),
  }),
}));

import AudioMerger from '@/components/tools/modules/audio/AudioMerger';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AudioMerger', () => {
  it('renders without crashing', () => {
    render(<AudioMerger />);
    expect(screen.getByText(/Initializing/)).toBeInTheDocument();
  });
});
