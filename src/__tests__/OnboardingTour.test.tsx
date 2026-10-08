import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingTour, REPLAY_TOUR_EVENT } from '@/components/OnboardingTour';

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: null, isPending: false }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('OnboardingTour persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Post-success state: the site tour waits for the first completed
    // download (th_last_download). Tests below set it unless asserting
    // the pre-success wait itself.
    localStorage.setItem('th_last_download', String(Date.now()));
  });

  it('waits for the first download instead of stacking on first paint', async () => {
    localStorage.removeItem('th_last_download');
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    render(<OnboardingTour />);
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.queryByText('Skip tour')).toBeNull();
    vi.unstubAllGlobals();
  });

  it('shows on first visit and persists on Skip (never nags again)', async () => {
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    render(<OnboardingTour />);
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Skip tour'));
    expect(localStorage.getItem('toolzum_onboarded')).toBe('1');
    vi.unstubAllGlobals();
  });

  it('stays hidden when the flag is set', () => {
    localStorage.setItem('toolzum_onboarded', '1');
    const { container } = render(<OnboardingTour />);
    expect(container.innerHTML).toBe('');
  });

  it('replays on footer event and clears the flag', async () => {
    localStorage.setItem('toolzum_onboarded', '1');
    render(<OnboardingTour />);
    expect(screen.queryByText('Skip tour')).toBeNull();
    fireEvent(window, new CustomEvent(REPLAY_TOUR_EVENT));
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
    expect(localStorage.getItem('toolzum_onboarded')).toBeNull();
  });

  it('centers the card when the anchor exists but is hidden (mobile nav)', async () => {
    // display:none elements still query-match with a zero rect (jsdom
    // returns zeros for all rects) — the card must center, not pin
    // to the top-left corner.
    const anchor = document.createElement('button');
    anchor.setAttribute('aria-label', 'Open search');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    const { container } = render(<OnboardingTour />);
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.style.bottom).toBe('24px');
    expect(dialog.style.left).toBe('50%');
    anchor.remove();
    vi.unstubAllGlobals();
  });

  it('positions the card by a visible anchor', async () => {
    const anchor = document.createElement('button');
    anchor.setAttribute('aria-label', 'Open search');
    document.body.appendChild(anchor);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      top: 10, bottom: 40, left: 100, right: 200, width: 100, height: 30,
      x: 100, y: 10, toJSON: () => ({}),
    });
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    const { container } = render(<OnboardingTour />);
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.style.top).toBe('52px');
    expect(dialog.style.left).toBe('100px');
    anchor.remove();
    vi.unstubAllGlobals();
  });

  // PDF editor instance — decision Sep 2026: once per device via its own
  // localStorage key, NO account sync, and never stacked on the site tour.
  const editorProps = {
    steps: [{ title: 'Step A', body: 'Body A' }],
    storageKey: 'toolzum_pdf_editor_toured',
    label: 'PDF editor tour',
    syncAccount: false,
    replayEvent: null,
    deferUntilSiteTour: true,
  };

  it('editor tour shows once under its own key, never the site key', async () => {
    render(<OnboardingTour {...editorProps} />);
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Skip tour'));
    expect(localStorage.getItem('toolzum_pdf_editor_toured')).toBe('1');
    expect(localStorage.getItem('toolzum_onboarded')).toBeNull();
    // second mount: hidden for good
    const { container } = render(<OnboardingTour {...editorProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('editor tour never calls the account API (localStorage only, no account)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<OnboardingTour {...editorProps} />);
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('editor tour defers while the site-tour dialog is live (no stacked tours)', async () => {
    const siteDialog = document.createElement('div');
    siteDialog.setAttribute('role', 'dialog');
    siteDialog.setAttribute('aria-label', 'Welcome tour, step 1 of 3');
    document.body.appendChild(siteDialog);
    const { container } = render(<OnboardingTour {...editorProps} />);
    // poll ticks every 500ms — two full ticks must not release it
    await new Promise((r) => setTimeout(r, 1100));
    expect(container.innerHTML).toBe('');
    siteDialog.remove();
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    }, { timeout: 2000 });
  });

  it('editor tour releases immediately when the site flag is already set', async () => {
    localStorage.setItem('toolzum_onboarded', '1');
    render(<OnboardingTour {...editorProps} />);
    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeDefined();
    });
  });
});
