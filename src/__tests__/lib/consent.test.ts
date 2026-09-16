import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONSENT_KEY, getConsent, mayCollectTelemetry, resetConsent, setConsent, onConsentChange } from '@/lib/consent';

describe('consent helper (#26: Decline must disable telemetry)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no choice is stored', () => {
    expect(getConsent()).toBeNull();
  });

  it('reads back stored choices and rejects unknown values', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    expect(getConsent()).toBe('accepted');
    localStorage.setItem(CONSENT_KEY, 'declined');
    expect(getConsent()).toBe('declined');
    localStorage.setItem(CONSENT_KEY, 'whatever');
    expect(getConsent()).toBeNull();
  });

  it('collects by default and when accepted, never when declined', () => {
    expect(mayCollectTelemetry()).toBe(true);
    localStorage.setItem(CONSENT_KEY, 'accepted');
    expect(mayCollectTelemetry()).toBe(true);
    localStorage.setItem(CONSENT_KEY, 'declined');
    expect(mayCollectTelemetry()).toBe(false);
  });

  it('resetConsent clears the choice so the banner shows again', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    resetConsent();
    expect(getConsent()).toBeNull();
    expect(mayCollectTelemetry()).toBe(true);
  });

  it('setConsent stores the choice and notifies live subscribers', () => {
    const seen: (string | null)[] = [];
    const unsub = onConsentChange((c) => {
      seen.push(c);
    });
    setConsent('declined');
    expect(getConsent()).toBe('declined');
    expect(mayCollectTelemetry()).toBe(false);
    setConsent('accepted');
    expect(mayCollectTelemetry()).toBe(true);
    unsub();
    setConsent('declined');
    expect(seen).toEqual(['declined', 'accepted']);
  });

  it('unsubscribed listeners hear nothing', () => {
    const fn = vi.fn();
    const unsub = onConsentChange(fn);
    unsub();
    setConsent('accepted');
    expect(fn).not.toHaveBeenCalled();
  });
});
