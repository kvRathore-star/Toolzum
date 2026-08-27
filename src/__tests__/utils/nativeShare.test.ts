import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(),
  },
  Directory: {
    Cache: 'CACHE',
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}));

vi.mock('@/utils/freeUsageGuard', () => ({
  checkAndRecordDownload: vi.fn().mockResolvedValue(true),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock document
const anchorClick = vi.fn();
vi.spyOn(document, 'createElement').mockReturnValue({
  href: '',
  download: '',
  click: anchorClick,
} as any);
vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

describe('nativeShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('exports downloadOrShare function', async () => {
    const mod = await import('@/utils/nativeShare');
    expect(mod.downloadOrShare).toBeDefined();
    expect(typeof mod.downloadOrShare).toBe('function');
  });
});
