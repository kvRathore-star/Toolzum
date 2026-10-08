import { describe, it, expect, afterEach, vi } from 'vitest';
import { PLAN_LIMITS } from '../../functions/api/check-plan';
import { CATEGORY_CAPS } from '@/lib/planTiers';
import { smartMax } from '@/utils/fileSizeLimits';
import { checkAndRecordDownload, gateBatchDownload, maxBlobMB } from '@/utils/freeUsageGuard';
import { setSignedIn } from '@/lib/session-state';

const CATEGORIES = ['video/*', 'application/pdf', 'audio/*', 'image/*'];

function mockPlanFetch(planLimits: { maxFileSizeMB: number; maxBatchSize: number; threads: number }, plan: string) {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/api/check-plan')) {
      return new Response(JSON.stringify({ plan, ...planLimits, categoryCaps: CATEGORY_CAPS }), { status: 200 });
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

  it('category ceilings cover every smartMax intake ceiling (box mirrors tools)', () => {
    // Generous-limits model (Oct 2026): one ceiling per category, same for
    // anon and signed-in. smartMax derives from the same numbers, so intake
    // guards and download enforcement can never disagree.
    for (const accept of CATEGORIES) {
      const { signed, free } = smartMax(accept);
      expect(signed, `smartMax signed for ${accept}`).toBe(free);
      expect([50, 100, 125, 150, 250]).toContain(free);
    }
    expect(smartMax('video/*')).toEqual({ signed: 250, free: 250 });
    expect(smartMax('application/pdf')).toEqual({ signed: 125, free: 125 });
    expect(smartMax('audio/*')).toEqual({ signed: 100, free: 100 });
    expect(smartMax('image/*')).toEqual({ signed: 50, free: 50 });
    expect(PLAN_LIMITS.pro.maxFileSizeMB).toBe(2000);
  });

  it('generous ceilings: 40MB PDF and 25MB video download on free caps', async () => {
    mockPlanFetch(PLAN_LIMITS.free, 'free');

    window.history.pushState({}, '', '/pdf/pdf-compressor');
    expect(await checkAndRecordDownload({ fileSizeMB: 40 })).toBe(true);
    window.history.pushState({}, '', '/video/video-compressor');
    expect(await checkAndRecordDownload({ fileSizeMB: 25 })).toBe(true);
  });

  it('still blocks past the category ceiling (130MB PDF on /pdf/)', async () => {
    mockPlanFetch(PLAN_LIMITS.free, 'free');
    window.history.pushState({}, '', '/pdf/pdf-compressor');

    const allowed = await checkAndRecordDownload({ fileSizeMB: 130 });
    expect(allowed).toBe(false);
  });

  it('counts one batch download as one unit (batchSize within the 25 cap passes)', async () => {
    mockPlanFetch(PLAN_LIMITS.signedin, 'signedin');
    setSignedIn(true);

    const allowed = await checkAndRecordDownload({ batchSize: 25, fileSizeMB: 20 });
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
      const allowed = await checkAndRecordDownload({ batchSize: 26, fileSizeMB: 20 });
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
    await expect(gateBatchDownload(25, 20)).resolves.toBe(true);
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
