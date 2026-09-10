import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFingerprint, getRemainingDownloads, incrementDownloadCount } from '@/utils/freeUsageGuard';

const STORAGE_KEYS = {
  count: 'th_free_uses',
  fingerprint: 'th_fp',
  signedInCount: 'th_free_signed',
  resetDate: 'th_reset',
};

describe('freeUsageGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Clear cookies to simulate signed-out user
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    
    // Mock navigator and screen for fingerprint
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      writable: true,
    });
    Object.defineProperty(screen, 'width', { value: 1920, writable: true });
    Object.defineProperty(screen, 'height', { value: 1080, writable: true });
    Object.defineProperty(navigator, 'language', { value: 'en-US', writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getFingerprint', () => {
    it('returns a string hash', () => {
      const fp = getFingerprint();
      expect(typeof fp).toBe('string');
      expect(fp.length).toBeGreaterThan(0);
    });

    it('returns consistent hash for same inputs', () => {
      const fp1 = getFingerprint();
      const fp2 = getFingerprint();
      expect(fp1).toBe(fp2);
    });
  });

  describe('getRemainingDownloads', () => {
    it('returns 5 for new user (3 anon + 2 signed-in)', () => {
      const remaining = getRemainingDownloads();
      expect(remaining).toBe(5);
    });

    it('returns less after incrementing', () => {
      incrementDownloadCount();
      const remaining = getRemainingDownloads();
      expect(remaining).toBe(4);
    });

    it('returns 2 after exhausting anon free uses', () => {
      // Use all 3 anon free downloads
      for (let i = 0; i < 3; i++) {
        incrementDownloadCount();
      }
      const remaining = getRemainingDownloads();
      // Remaining should be 2 (signed-in portion) since we only used anon portion
      expect(remaining).toBe(2);
    });

    it('does not go below 0', () => {
      // Use many downloads
      for (let i = 0; i < 15; i++) {
        incrementDownloadCount();
      }
      const remaining = getRemainingDownloads();
      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('incrementDownloadCount', () => {
    it('increments count in localStorage', () => {
      incrementDownloadCount();
      const count = localStorage.getItem(STORAGE_KEYS.count);
      expect(count).toBe('1');
    });

    it('increments multiple times', () => {
      incrementDownloadCount();
      incrementDownloadCount();
      incrementDownloadCount();
      const count = localStorage.getItem(STORAGE_KEYS.count);
      expect(count).toBe('3');
    });

    it('sets fingerprint after increment', () => {
      incrementDownloadCount();
      const fp = localStorage.getItem(STORAGE_KEYS.fingerprint);
      expect(fp).toBeTruthy();
    });

    it('resets on new day', () => {
      // Set old reset date
      localStorage.setItem(STORAGE_KEYS.resetDate, '2020-0-0');
      localStorage.setItem(STORAGE_KEYS.count, '5');
      
      incrementDownloadCount();
      
      const count = localStorage.getItem(STORAGE_KEYS.count);
      expect(count).toBe('1'); // Reset to 0, then incremented to 1
    });
  });

  describe('tampering detection', () => {
    it('resets count if fingerprint changes', () => {
      // Set initial count and fingerprint
      localStorage.setItem(STORAGE_KEYS.count, '5');
      localStorage.setItem(STORAGE_KEYS.fingerprint, 'old-fingerprint');
      
      incrementDownloadCount();
      
      // Should reset due to fingerprint mismatch
      const count = localStorage.getItem(STORAGE_KEYS.count);
      expect(count).toBe('1');
    });
  });

  describe('SSR handling', () => {
    it('returns safe defaults during SSR', () => {
      // This test runs in jsdom, but verifies the function doesn't crash
      const remaining = getRemainingDownloads();
      expect(typeof remaining).toBe('number');
    });
  });
});
