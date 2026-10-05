import { describe, it, expect } from 'vitest';
import { metadata } from '@/app/press/page';

describe('press page', () => {
  it('has canonical metadata pointing at /press/', () => {
    expect(metadata.title).toContain('Press');
    expect(metadata.alternates?.canonical).toBe('https://toolzum.com/press/');
    expect(String(metadata.description).length).toBeGreaterThan(40);
  });
});
