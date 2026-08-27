import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth-client
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: { user: { id: 'user1' } },
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useFavorites');
    expect(mod.useFavorites).toBeDefined();
    expect(typeof mod.useFavorites).toBe('function');
  });
});
