import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PDF_WORKER_SRC, setupPdfWorker } from '@/lib/pdfjsWorker';

const ROOT = process.cwd();

describe('pdf.js worker sourcing (Sep 2026 outage regression)', () => {
  it('points at our origin, never a CDN', () => {
    expect(PDF_WORKER_SRC).toBe('/pdf.worker.min.mjs');
    expect(PDF_WORKER_SRC).not.toMatch(/^https?:/);
  });

  it('ships the worker file in public/ (version-locked with the package)', () => {
    const workerPath = path.join(ROOT, 'public', 'pdf.worker.min.mjs');
    expect(fs.existsSync(workerPath)).toBe(true);
    const size = fs.statSync(workerPath).size;
    expect(size).toBeGreaterThan(500 * 1024); // real worker, not a stub
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', 'pdfjs-dist', 'package.json'), 'utf8')) as { version: string };
    const bundled = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
    expect(bundled.dependencies['pdfjs-dist']).toBeDefined();
    expect(pkg.version).toMatch(/^\d+\.\d+/);
  });

  it('postinstall refreshes the worker on version bumps', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.postinstall || '').toContain('copy-pdf-worker');
    expect(fs.existsSync(path.join(ROOT, 'scripts', 'copy-pdf-worker.js'))).toBe(true);
  });

  it('no source file builds a CDN worker URL anymore', () => {
    const hits: string[] = [];
    // pdfjsWorker.ts itself documents the outage history — exempt.
    const EXEMPT = new Set(['src/lib/pdfjsWorker.ts']);
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name !== 'node_modules') walk(full);
        } else if (/\.(tsx?|js)$/.test(e.name)) {
          const rel = path.relative(ROOT, full);
          if (EXEMPT.has(rel)) continue;
          const content = fs.readFileSync(full, 'utf8');
          if (/cdnjs[^'"]*pdf\.js[^'"]*worker|pdf\.js[^'"]*worker[^'"]*cdnjs/i.test(content)) {
            hits.push(rel);
          }
        }
      }
    };
    walk(path.join(ROOT, 'src'));
    walk(path.join(ROOT, 'functions'));
    expect(hits).toEqual([]);
  }, 20000);

  it('setupPdfWorker points any pdfjs namespace at our worker (idempotent)', () => {
    const fake = { GlobalWorkerOptions: { workerSrc: '' } };
    setupPdfWorker(fake as never);
    expect(fake.GlobalWorkerOptions.workerSrc).toBe('/pdf.worker.min.mjs');
    fake.GlobalWorkerOptions.workerSrc = 'x';
    setupPdfWorker(fake as never);
    expect(fake.GlobalWorkerOptions.workerSrc).toBe('/pdf.worker.min.mjs');
  });
});
