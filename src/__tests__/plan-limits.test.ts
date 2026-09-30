import { describe, it, expect, afterEach, vi } from 'vitest';
import { PLAN_LIMITS } from '../../functions/api/check-plan';
import { smartMax } from '@/utils/fileSizeLimits';
import { checkAndRecordDownload, gateBatchDownload, maxBlobMB } from '@/utils/freeUsageGuard';
import { setSignedIn } from '@/lib/session-state';

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
    setSignedIn(false);
    window.history.pushState({}, '', '/');
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
    setSignedIn(true);

    const allowed = await checkAndRecordDownload({ fileSizeMB: 40 });
    expect(allowed).toBe(true);
  });

  it('replays broken flow: free 25MB video downloads (old 10MB server cap blocked it)', async () => {
    mockPlanFetch(PLAN_LIMITS.free, 'free');

    const allowed = await checkAndRecordDownload({ fileSizeMB: 25 });
    expect(allowed).toBe(true);
  });

  it('still blocks when the result genuinely exceeds the aligned ceiling', async () => {
    mockPlanFetch(PLAN_LIMITS.free, 'free');

    const allowed = await checkAndRecordDownload({ fileSizeMB: 60 });
    expect(allowed).toBe(false);
  });

  it('counts one batch download as one unit (batchSize within cap passes)', async () => {
    mockPlanFetch(PLAN_LIMITS.signedin, 'signedin');
    setSignedIn(true);

    const allowed = await checkAndRecordDownload({ batchSize: 10, fileSizeMB: 20 });
    expect(allowed).toBe(true);
  });

  it('blocks batches over the plan cap before touching the quota service', async () => {
    const calls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith('/api/check-plan')) {
        return new Response(JSON.stringify({ plan: 'signedin', ...PLAN_LIMITS.signedin }), { status: 200 });
      }
      return new Response('{}', { status: 404 });
    }));
    let reason: string | null = null;
    const onPlan = (e: Event) => {
      reason = (e as CustomEvent<{ reason?: string }>).detail?.reason ?? null;
    };
    window.addEventListener('toolzum:plan-limit', onPlan);
    try {
      const allowed = await checkAndRecordDownload({ batchSize: 11, fileSizeMB: 20 });
      expect(allowed).toBe(false);
      expect(reason).toBe('batch_size');
      expect(calls.some((u) => u.endsWith('/api/downloads/record'))).toBe(false);
    } finally {
      window.removeEventListener('toolzum:plan-limit', onPlan);
    }
  });

  it('gateBatchDownload passes batchSize through and maxBlobMB takes the max', async () => {
    expect(maxBlobMB([{ size: 2 * 1048576 }, { size: 1 * 1048576 }])).toBe(2);
    expect(maxBlobMB([])).toBeUndefined();
    mockPlanFetch(PLAN_LIMITS.signedin, 'signedin');
    setSignedIn(true);
    await expect(gateBatchDownload(10, 20)).resolves.toBe(true);
  });

  // --- Pro-tool gate: server verdict drives it (Sep 2026 regression) ------
  // The old client-side gate sniffed an httpOnly cookie (always false) and
  // blocked EVERYONE — signed-in Pro admins included — before any server call.

  function stubProToolFetch(allowed: boolean, plan: string) {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/check-plan')) {
        return new Response(JSON.stringify({ plan, ...PLAN_LIMITS.signedin }), { status: 200 });
      }
      if (url.includes('/api/downloads/check')) {
        return new Response(JSON.stringify({ allowed, remaining: allowed ? 9 : 0, plan }), { status: 200 });
      }
      if (url.includes('/api/downloads/record')) {
        return new Response(JSON.stringify({ allowed: true }), { status: 200 });
      }
      return new Response('{}', { status: 404 });
    }));
  }

  it('signed-in user on a Pro tool is NOT blocked client-side (old cookie gate bug)', async () => {
    window.history.pushState({}, '', '/image/ai-image-generator');
    stubProToolFetch(true, 'signedin');
    setSignedIn(true);

    const allowed = await checkAndRecordDownload({ fileSizeMB: 10 });
    expect(allowed).toBe(true);
  });

  it('anonymous block on a Pro tool comes from the server (pro_tool_anon event)', async () => {
    window.history.pushState({}, '', '/image/ai-image-generator');
    stubProToolFetch(false, 'anon');
    setSignedIn(false);

    let reason: string | null = null;
    const onPlan = (e: Event) => {
      reason = (e as CustomEvent<{ reason?: string }>).detail?.reason ?? null;
    };
    window.addEventListener('toolzum:plan-limit', onPlan);
    try {
      const allowed = await checkAndRecordDownload({ fileSizeMB: 10 });
      expect(allowed).toBe(false);
      expect(reason).toBe('pro_tool_anon');
    } finally {
      window.removeEventListener('toolzum:plan-limit', onPlan);
    }
  });
});
