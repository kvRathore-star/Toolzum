import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { countAll, collect } from '../../../scripts/bundle-budget';

let dir = '';

beforeEach(() => {
  dir = join(tmpdir(), `bb-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
  mkdirSync(join(dir, 'sub', 'deep'), { recursive: true });
  writeFileSync(join(dir, 'a.html'), '<html></html>');
  writeFileSync(join(dir, 'sub', 'b.html'), '<html></html>');
  writeFileSync(join(dir, 'sub', 'deep', 'c.txt'), 'x');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('bundle-budget countAll (export file-budget gate)', () => {
  it('counts nested files, not directories', () => {
    expect(countAll(dir)).toBe(3);
  });

  it('returns 0 for an empty dir', () => {
    const empty = join(dir, 'empty');
    mkdirSync(empty);
    expect(countAll(empty)).toBe(0);
  });
});

describe('bundle-budget collect (shared-chunk gate)', () => {
  const chunk = (name: string, body: string) =>
    writeFileSync(join(dir, '_next', 'static', 'chunks', name), body);
  const html = (file: string, tags: string) =>
    writeFileSync(join(dir, file), `<html><head>${tags}</head></html>`);

  beforeEach(() => {
    mkdirSync(join(dir, '_next', 'static', 'chunks'), { recursive: true });
    chunk('main-abc.js', 'main');
    chunk('page-a.js', 'a');
    chunk('page-b.js', 'b');
    const s = (n: string) => `<script src="/_next/static/chunks/${n}"></script>`;
    html('a.html', s('main-abc.js') + s('page-a.js'));
    html(join('sub', 'b.html'), s('main-abc.js') + s('page-b.js'));
    // PWA offline fallback: no scripts at all (the real out/offline.html
    // that emptied the intersection in CI before this guard).
    html('offline.html', '');
  });

  it('ignores zero-JS pages and keeps the shared intersection', () => {
    const stats = collect(dir);
    expect(stats.shared).toEqual(['main-abc.js']);
    expect(stats.pageCount).toBe(3);
    expect(stats.sizes['main-abc.js']).toBeGreaterThan(0);
  });

  it('throws when no page references any chunk', () => {
    rmSync(join(dir, 'a.html'));
    rmSync(join(dir, join('sub', 'b.html')));
    expect(() => collect(dir)).toThrow(/references any JS chunk/);
  });
});
