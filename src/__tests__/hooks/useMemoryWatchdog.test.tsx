import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: vi.fn(),
}));

describe('MemoryWatchdog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports MemoryWatchdog component', async () => {
    const { MemoryWatchdog } = await import('@/hooks/useMemoryWatchdog');
    expect(typeof MemoryWatchdog).toBe('function');
  });

  it('renders null', async () => {
    const { MemoryWatchdog } = await import('@/hooks/useMemoryWatchdog');
    const { render } = await import('@testing-library/react');
    const { container } = render(<MemoryWatchdog />);
    expect(container.innerHTML).toBe('');
  });
});
