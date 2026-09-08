import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/lib/auth', () => ({
  createAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(async ({ headers }: { headers: Headers }) =>
        headers.get('x-test-user')
          ? { user: { id: headers.get('x-test-user') } }
          : null,
      ),
    },
  })),
}));

import { onRequestPost as favAdd } from '../../../functions/api/favorites/add';
import { onRequestGet as favList } from '../../../functions/api/favorites/list';

function mockDb() {
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => ({ c: 0 })),
        run: vi.fn(async () => ({})),
        all: vi.fn(async () => ({ results: [] })),
      })),
    })),
  } as unknown as D1Database;
}

const ENV = { DB: mockDb() } as unknown as Record<string, unknown>;

function authed(body?: unknown) {
  return new Request('https://toolzum.com/api/favorites/add', {
    method: 'POST',
    headers: { 'x-test-user': 'user-1', 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
}

describe('favorites auth contract', () => {
  it('add requires a toolSlug (400), even when signed in', async () => {
    const res = await favAdd({ request: authed(), env: ENV });
    expect(res.status).toBe(400);
  });

  it('add succeeds with a valid slug', async () => {
    const res = await favAdd({
      request: authed({ toolSlug: 'pdf-compressor' }),
      env: ENV,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('list returns [] for anonymous callers instead of 401', async () => {
    const res = await favList({
      request: new Request('https://toolzum.com/api/favorites/list'),
      env: ENV,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
