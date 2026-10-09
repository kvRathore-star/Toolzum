import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { runAll, GENERATORS } from '../../scripts/gen-parallel.mjs';

/** Fake child process: emits exit (or error) on next tick. */
function fakeChild(exitCode: number | null, emitError = false) {
  const ee = new EventEmitter() as EventEmitter & { code?: number };
  process.nextTick(() => {
    if (emitError) ee.emit('error', new Error('spawn ENOENT'));
    else ee.emit('exit', exitCode);
  });
  return ee;
}

describe('gen-parallel (build generator runner)', () => {
  it('passes when every generator exits 0', async () => {
    const spawnFn = vi.fn(() => fakeChild(0));
    const results = await runAll(['a', 'b'], spawnFn as never);
    expect(results).toEqual([
      { cmd: 'a', code: 0 },
      { cmd: 'b', code: 0 },
    ]);
    expect(spawnFn).toHaveBeenCalledTimes(2);
  });

  it('propagates a non-zero exit — the bug a bare `wait` hides', async () => {
    const spawnFn = vi.fn((cmd: string) => fakeChild(cmd === 'bad' ? 3 : 0));
    const results = await runAll(['good', 'bad'], spawnFn as never);
    expect(results.find((r) => r.cmd === 'bad')?.code).toBe(3);
    expect(results.every((r) => typeof r.code === 'number')).toBe(true);
  });

  it('treats a spawn error (ENOENT) as a failure, never a silent pass', async () => {
    const spawnFn = vi.fn(() => fakeChild(null, true));
    const results = await runAll(['missing-cmd'], spawnFn as never);
    expect(results).toEqual([{ cmd: 'missing-cmd', code: 1 }]);
  });

  it('runs exactly the five build generators', () => {
    expect(GENERATORS).toEqual([
      'npm run gen:redirects',
      'npm run gen:og',
      'npm run gen:site-data',
      'npm run gen:legal-dates',
      'npm run gen:download-slugs',
    ]);
  });
});
