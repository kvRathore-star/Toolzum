// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateAll, type ToolInfo } from '../../scripts/generate-og-images';
import { toolsRegistry } from '@/registry/tools';

const PNG_MAGIC = '89504e470d0a1a0a';

function mkTool(name: string, slug: string, category: string, description: string): ToolInfo {
  return { name, slug, category, description };
}

function sha1(file: string): string {
  return createHash('sha1').update(readFileSync(file)).digest('hex');
}

function hashDir(dir: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of readdirSync(dir)) {
    const catPath = join(dir, cat);
    if (!statSync(catPath).isDirectory()) continue;
    for (const f of readdirSync(catPath)) map.set(`${cat}/${f}`, sha1(join(catPath, f)));
  }
  return map;
}

function changedFiles(before: Map<string, string>, after: Map<string, string>): string[] {
  return [...after.entries()]
    .filter(([p, h]) => !before.has(p) || before.get(p) !== h)
    .map(([p]) => p)
    .sort();
}

describe('OG image generation: per-tool images are decoupled from the global tool count', () => {
  it('modifying one tool description regenerates exactly that tool PNG and nothing else', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const tools = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'Original description A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'Original description B'),
        mkTool('Gamma Tool', 'gamma', 'Text', 'Original description C'),
      ];
      await generateAll(tools, ['Converter', 'Text'], dir);
      const before = hashDir(dir);

      tools[0] = { ...tools[0], description: 'Changed description A' };
      await generateAll(tools, ['Converter', 'Text'], dir);

      expect(changedFiles(before, hashDir(dir))).toEqual(['converter/alpha.png']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('changing the catalog size in another category does not regenerate existing images (global-count badge regression)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const firstRun = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'B'),
      ];
      await generateAll(firstRun, ['Converter'], dir);
      const before = hashDir(dir);

      const biggerCatalog = [
        ...firstRun,
        mkTool('Delta Tool', 'delta', 'Text', 'D'),
        mkTool('Epsilon Tool', 'epsilon', 'Text', 'E'),
      ];
      await generateAll(biggerCatalog, ['Converter', 'Text'], dir);

      const after = hashDir(dir);
      for (const [p, h] of before) {
        expect(after.get(p), `${p} must be byte-identical when tools are added elsewhere`).toBe(h);
      }
      expect(after.has('text/delta.png')).toBe(true);
      expect(after.has('text/epsilon.png')).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('adding a tool to a category regenerates only that tool PNG and that category index (bounded)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const tools = [mkTool('Alpha Tool', 'alpha', 'Converter', 'A')];
      await generateAll(tools, ['Converter'], dir);
      const before = hashDir(dir);

      tools.push(mkTool('Beta Tool', 'beta', 'Converter', 'B'));
      await generateAll(tools, ['Converter'], dir);

      expect(changedFiles(before, hashDir(dir))).toEqual(['converter/beta.png', 'converter/index.png']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('renders valid PNG output for a real registry tool (smoke)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const real = toolsRegistry[0];
      const tool = mkTool(real.name, real.slug, real.category, real.description);
      await generateAll([tool], [tool.category], dir);

      const png = readFileSync(join(dir, tool.category.toLowerCase(), `${tool.slug}.png`));
      expect(png.length).toBeGreaterThan(1000);
      expect(png.subarray(0, 8).toString('hex')).toBe(PNG_MAGIC);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a cache manifest that survives a fully-skipped re-run (no cache wipe)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    const cacheFile = join(dir, 'og-cache.json');
    try {
      const tools = [mkTool('Alpha Tool', 'alpha', 'Converter', 'A')];
      await generateAll(tools, ['Converter'], dir);
      const cacheAfterCold = JSON.parse(readFileSync(cacheFile, 'utf8'));
      expect(Object.keys(cacheAfterCold).length).toBe(2); // alpha.png + index.png

      await generateAll(tools, ['Converter'], dir);
      const cacheAfterWarm = JSON.parse(readFileSync(cacheFile, 'utf8'));
      expect(cacheAfterWarm).toEqual(cacheAfterCold);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('invalidates only the changed tool hash in the cache', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    const cacheFile = join(dir, 'og-cache.json');
    try {
      const tools = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'B'),
      ];
      await generateAll(tools, ['Converter'], dir);

      tools[0] = { ...tools[0], description: 'Changed A' };
      await generateAll(tools, ['Converter'], dir);

      const cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
      expect(cache['converter/beta.png']).toBeTruthy();
      expect(cache['converter/alpha.png']).not.toBe(sha1(join(dir, 'converter/alpha.png')));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('deletes orphaned PNG files not in the live set (stale image cleanup)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const tools = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'B'),
      ];
      await generateAll(tools, ['Converter'], dir);

      const stray = join(dir, 'converter', 'stale-tool.png');
      writeFileSync(stray, readFileSync(join(dir, 'converter', 'alpha.png')));

      await generateAll([tools[0]], ['Converter'], dir);
      expect(existsSync(stray)).toBe(false);
      expect(existsSync(join(dir, 'converter', 'alpha.png'))).toBe(true);
      expect(existsSync(join(dir, 'converter', 'index.png'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
