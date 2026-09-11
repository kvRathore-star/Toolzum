import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { countAll } from '../../../scripts/bundle-budget';

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
