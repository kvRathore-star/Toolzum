import { describe, it, expect, afterEach, vi } from 'vitest';
import { PLAN_LIMITS } from '../../functions/api/check-plan';
import { smartMax } from '@/utils/fileSizeLimits';
import { checkAndRecordDownload } from '@/utils/freeUsageGuard';

const CATEGORIES = ['video/*', 'application/pdf', 'audio/*', 'image/*'];

function mockPlanFetch(planLimits: { maxFileSizeMB: number; maxBatchSize: number; threads: number }, plan: string) {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/api/check-plan')) {
      return new Response(JSON.stringify({ plan, ...planLimits }), { status: 200 });
    }
    if (url.endsWith('/api/downloads/check')) {
      return new Response(JSON.stringify({ allowed: true, remaining: 9 }), { status: 200 });
    }
    if (url.endsWith('/api/downloads/record')) {
      return new Response(JSON.stringify({ allowed: true }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  }));
}

describe('plan limits alignment (Option A)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('server download-gate ceiling is >= every smartMax category ceiling per tier', () => {
    for (const accept of CATEGORIES) {
      const { signed, free } = smartMax(accept);
      expect(PLAN_LIMITS.free.maxFileSizeMB, `free ceiling >= smartMax free (${free}MB) for ${accept}`).toBeGreaterThanOrEqual(free);
      expect(PLAN_LIMITS.signedin.maxFileSizeMB, `signedin ceiling >= smartMax signed (${signed}MB) for ${accept}`).toBeGreaterThanOrEqual(signed);
      expect(PLAN_LIMITS.pro.maxFileSizeMB, `pro ceiling >= smartMax signed (${signed}MB) for ${accept}`).toBeGreaterThanOrEqual(signed);
    }
  });

  it('replays broken flow: signed-in 40MB PDF downloads (old 25MB server cap blocked it)', async () => {
    mockPlanFetch(PLAN_LIMITS.signedin, 'signedin');
    document.cookie = 'authjs.session-token=dummy-session';

    const allowed = await checkAndRecordDownload({ fileSizeMB: 40 });
    expect(allowed).toBe(true);
  });

  it('replays broken flow: free 40MB video downloads (old 10MB server cap blocked it)', async () => {
    mockPlanFetch(PLAN_LIMITS.free, 'free');

    const allowed = await checkAndRecordDownload({ fileSizeMB: 40 });
    expect(allowed).toBe(true);
  });

  it('still blocks when the result genuinely exceeds the aligned ceiling', async () => {
    mockPlanFetch(PLAN_LIMITS.free, 'free');

    const allowed = await checkAndRecordDownload({ fileSizeMB: 60 });
    expect(allowed).toBe(false);
  });
});
