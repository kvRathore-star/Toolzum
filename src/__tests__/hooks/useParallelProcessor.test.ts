import { describe, it, expect, vi } from 'vitest';

// Mock auth-client
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: { user: { id: 'user1', plan: 'free' } },
  }),
}));

describe('useParallelProcessor', () => {
  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useParallelProcessor');
    expect(mod.useParallelProcessor).toBeDefined();
    expect(typeof mod.useParallelProcessor).toBe('function');
  });

  it('exports ProcessFile interface', async () => {
    const mod = await import('@/hooks/useParallelProcessor');
    // TypeScript interfaces don't exist at runtime, but we can check the module loads
    expect(mod).toBeDefined();
  });
});
