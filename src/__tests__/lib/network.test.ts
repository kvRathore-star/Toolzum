import { describe, it, expect, afterEach } from 'vitest';
import { isOffline, toUserError } from '@/utils/network';

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    value,
    configurable: true,
  });
}

describe('degraded-network UX (#45)', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('maps network TypeErrors to explicit offline copy when offline', () => {
    setOnline(false);
    expect(toUserError(new TypeError('Failed to fetch'), 'x')).toBe(
      "You're offline. Reconnect and try again.",
    );
    expect(toUserError('Load failed', 'x')).toBe(
      "You're offline. Reconnect and try again.",
    );
  });

  it('passes server errors through verbatim (offline or not)', () => {
    setOnline(false);
    expect(toUserError(new Error('AI features are temporarily disabled'), 'x')).toBe(
      'AI features are temporarily disabled',
    );
    expect(toUserError(new Error('Server error (503)'), 'x')).toBe('Server error (503)');
  });

  it('passes network errors through verbatim when online', () => {
    setOnline(true);
    expect(toUserError(new TypeError('Failed to fetch'), 'fallback')).toBe('Failed to fetch');
  });

  it('falls back on unstringifiable input', () => {
    expect(toUserError(undefined, 'fallback')).toBe('fallback');
    expect(toUserError(null, 'fallback')).toBe('fallback');
  });

  it('isOffline is SSR-safe and truthful', () => {
    setOnline(true);
    expect(isOffline()).toBe(false);
    setOnline(false);
    expect(isOffline()).toBe(true);
  });
});
