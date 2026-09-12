import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsSection } from '@/app/admin/_components/AnalyticsSection';

vi.mock('lucide-react', () => {
  const stub = () => <span />;
  return {
    Download: stub,
    AlertTriangle: stub,
    BarChart3: stub,
    TrendingUp: stub,
    Users: stub,
    Search: stub,
    Filter: stub,
    ArrowUpDown: stub,
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function payload(downloadsByDay: unknown[]) {
  return {
    topTools7d: [],
    topTools30d: [],
    downloadsByDay,
    downloadsByUserType: [],
    blockedDownloads: [],
    topDownloadedTools: [],
    missedSearches: [{ query: 'backgroud', misses: 3 }],
    errorsByDay: [],
    topErrors: [],
    signupsByDay: [],
    pageViewsByDay: [],
    totals: { downloads30d: 0, blocked30d: 0, toolUsages30d: 0, errors30d: 0 },
  };
}

describe('AnalyticsSection null-date hardening (Sep 12 2026 regression)', () => {
  it('renders instead of crashing when a day bucket has a null date', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          payload([{ date: null, count: 4, blocked: 1 }]),
        ),
      ),
    );
    render(<AnalyticsSection />);
    await waitFor(() => {
      expect(screen.getByText('Downloads (30d)')).toBeDefined();
    });
    // Null date degrades to em-dash labels (allowed + blocked charts), never throws.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders normal day buckets unchanged', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(payload([{ date: '2026-09-12', count: 4, blocked: 1 }])),
      ),
    );
    render(<AnalyticsSection />);
    await waitFor(() => {
      expect(screen.getAllByText('09-12').length).toBeGreaterThan(0);
    });
    // Missed-searches panel renders from the same payload.
    expect(screen.getByText('Top Missed Searches')).toBeDefined();
    expect(screen.getByText('backgroud')).toBeDefined();
  });
});
