import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Claims-vs-behavior guard for the PDF editor (Sep 2026).
 *
 * Pattern: user-facing copy — registry description/FAQ/instructions,
 * button titles, toasts, the (?) shortcuts panel — asserts a capability.
 * This file asserts the code actually implements it. Four shipped bugs
 * were exactly "copy says X, code does narrower":
 *   1. Ctrl+F advertised globally, bound canvas-focus-only
 *   2. Credit badges promised "shown on each button", lived in title= only
 *   3. OCR language framed as pre-run choice, only existed in results
 *   4. Ctrl+S advertised in FAQ + shortcuts panel, canvas-only (found by
 *      writing this file — the net catching its own fifth case)
 *
 * Every entry is two-sided ON PURPOSE:
 *   - `claim`: the copy must still exist (if you delete the claim from
 *     the UI/registry, delete it HERE in the same commit — dropping a
 *     capability silently fails the same as breaking it)
 *   - `impl`: the implementation must still exist
 * Failures mean drift; the fix is either restore behavior or consciously
 * retire the claim in both places.
 *
 * Deliberately NOT covered here: site-wide credit-badge map (see
 * credit-badge-coverage.test.ts), no-upload privacy (privacy-gate.test.ts).
 * This file is the tool-specific narrative-claims layer those don't reach.
 */

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const editor = read('src/components/tools/modules/pdf/PdfEditor.tsx');
const registry = read('src/registry/tools-chunk-1.ts');

/** Window-level keydown listener body (the global-shortcut surface). */
const windowListener = editor.match(
  /const onKey = \(e: KeyboardEvent\) => \{[\s\S]*?window\.addEventListener\('keydown', onKey\)/,
)?.[0];

describe('pdf-editor: documented claims vs actual behavior', () => {
  describe('global Ctrl+F (was canvas-focus-only — historical bug #1)', () => {
    it('claim: Find button title promises Ctrl+F with any tool', () => {
      expect(editor).toMatch(/title="Find & replace \(Ctrl\+F\) — works with any tool"/);
    });
    it('claim: shortcuts panel lists Find panel · Ctrl+F', () => {
      expect(editor).toMatch(/\['Find panel', 'Ctrl\+F'\]/);
    });
    it('impl: Ctrl+F is bound on window, not only the canvas handler', () => {
      expect(windowListener, 'window keydown listener missing').toBeTruthy();
      expect(windowListener).toMatch(/'f'/);
      expect(windowListener).toMatch(/setShowFind\(true\)/);
    });
  });

  describe('global Ctrl+S (found while writing this file — historical bug #4)', () => {
    it('claim: Save button title promises Ctrl+S session save', () => {
      expect(editor).toMatch(/Save session \(Ctrl\+S\)/);
    });
    it('claim: shortcuts panel lists Save session · Ctrl+S', () => {
      expect(editor).toMatch(/\['Save session', 'Ctrl\+S'\]/);
    });
    it('claim: registry FAQ says autosave works via Save button or Ctrl+S', () => {
      expect(registry).toMatch(/Save button or Ctrl\+S/);
    });
    it('impl: Ctrl+S is bound on window and calls saveNow (not download)', () => {
      expect(windowListener, 'window keydown listener missing').toBeTruthy();
      expect(windowListener).toMatch(/'s'/);
      expect(windowListener).toMatch(/saveNowRef\.current\(\)/);
      expect(editor, 'stale "Ctrl+S downloads" comment regressed').not.toMatch(
        /Ctrl\+S downloads/,
      );
    });
    it('impl: canvas handler does NOT also bind Ctrl+S (would double-save)', () => {
      const canvas = editor.match(/const onCanvasKey[\s\S]*?\n  \};/)?.[0] ?? '';
      expect(canvas).not.toMatch(/toLowerCase\(\) === 's'/);
    });
  });

  describe('visible per-button credit badges (historical bug #2)', () => {
    it('claim: registry description says costs are shown on each button before click', () => {
      expect(registry).toMatch(/cost credits, shown on each button before you click/);
    });
    it('claim: FAQ states AI actions cost 1 credit', () => {
      expect(registry).toMatch(/cost 1 credit/);
    });
    it('impl: all four AI buttons render a VISIBLE badge (not title-only)', () => {
      const visibleBadges = editor.match(
        /text-\[9px\] font-mono rounded bg-\[var\(--accent\)\]\/10/g,
      );
      expect(
        visibleBadges?.length ?? 0,
        'expected a visible "1" badge chip on Summarize, Fix grammar, Translate, Find sensitive',
      ).toBeGreaterThanOrEqual(4);
    });
    it('impl: all four AI buttons disclose "1 credit" in aria-label', () => {
      const labels = editor.match(/aria-label="[^"]*1 credit[^"]*"/g);
      expect(labels?.length ?? 0).toBeGreaterThanOrEqual(4);
    });
  });

  describe('OCR language chosen before run (historical bug #3)', () => {
    it('claim: registry says OCR in 8 languages', () => {
      expect(registry).toMatch(/OCR in 8 languages/);
    });
    it('claim: FAQ enumerates the eight languages', () => {
      for (const lang of ['English', 'Hindi', 'Tamil', 'German', 'Spanish', 'French', 'Polish', 'Arabic']) {
        expect(registry, `FAQ lost language ${lang}`).toContain(lang);
      }
    });
    it('impl: pre-run select exists with exactly the eight promised codes', () => {
      // Index-based: the select tag spans lines and contains `=>` in
      // onChange, so a `<select[^>]*>` regex would truncate there.
      const marker = editor.indexOf('aria-label="OCR language (choose before running OCR)"');
      expect(marker, 'pre-run OCR language select missing').toBeGreaterThan(-1);
      const open = editor.lastIndexOf('<select', marker);
      const close = editor.indexOf('</select>', marker);
      expect(open).toBeGreaterThan(-1);
      expect(close).toBeGreaterThan(open);
      const sel = editor.slice(open, close);
      const codes = [...sel.matchAll(/<option value="(\w+)"/g)].map((m) => m[1]);
      expect(codes.sort()).toEqual(['ara', 'deu', 'eng', 'fra', 'hin', 'pol', 'spa', 'tam']);
    });
    it('impl: that select appears in source before the OCR run button', () => {
      const selAt = editor.indexOf('OCR language (choose before running OCR)');
      const runAt = editor.indexOf('onClick={runOcr}');
      expect(selAt).toBeGreaterThan(-1);
      expect(runAt).toBeGreaterThan(-1);
      expect(selAt).toBeLessThan(runAt);
    });
  });

  describe('page operations preserve annotations (P0 core claim)', () => {
    it('claim: toasts promise annotations are kept / follow their pages', () => {
      expect(editor).toMatch(/annotations kept/);
      expect(editor).toMatch(/annotations followed their pages/);
    });
    it('impl: restructure remaps via restructureAnnos and stores the result', () => {
      expect(editor).toMatch(/restructureAnnos\(prevAnnos, op, page, pageCount, vpH\)/);
      expect(editor).toMatch(/setAnnos\(mapped\)/);
    });
    it('impl: structural undo entry carries pre-op PDF bytes', () => {
      expect(editor).toMatch(/bytes: fileBytes\.slice\(\)/);
    });
  });

  describe('undo-cap honesty (surfaced by the 6th-entry question)', () => {
    it('claim: overflow announces what was dropped, with a next step', () => {
      expect(editor).toMatch(/Undo depth limit — oldest page-operation snapshot dropped/);
      expect(editor).toMatch(/History panel keeps separate restore points/);
    });
    it('impl: cap runs via capStructuralHistory at the push site, not silently', () => {
      expect(editor).toMatch(/capStructuralHistory\(undoStack\.current\)/);
      expect(editor).toMatch(/if \(capped\.dropped\)/);
    });
  });

  describe('version history vs undo-stack drift guard', () => {
    it('claim: FAQ promises a 10-version history', () => {
      expect(registry).toMatch(/10-version history/);
      expect(editor).toMatch(/MAX_VERSIONS = 10/);
    });
    it('impl: takeVersion records pageCount; restore warns on mismatch', () => {
      expect(editor).toMatch(/page, label, pageCount \}\)\);/);
      expect(editor).toMatch(/shapeChanged/);
      expect(editor, 'restore must cross-reference Undo for page-shape drift').toMatch(
        /use Undo \(Ctrl\+Z\) if the page layout/,
      );
    });
  });

  describe('Arabic OCR honesty (FAQ)', () => {
    it('claim: FAQ says Arabic copies to clipboard instead of inserting', () => {
      expect(registry).toMatch(/Arabic copies to clipboard instead/);
    });
    it('impl: ocrLang ara branches to clipboardWrite, never page insert', () => {
      const araBranches = editor.match(/if \(ocrLang === 'ara'\)/g);
      expect(araBranches?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(editor).toMatch(/Copied — paste where needed \(Arabic/);
    });
  });

  describe('redaction export gate (FAQ)', () => {
    it('claim: FAQ says verification failure blocks the download', () => {
      expect(registry).toMatch(/block the download if verification fails/);
    });
    it('impl: failed verification blocks export with an explicit toast', () => {
      expect(editor).toMatch(/Redaction UNVERIFIED/);
      expect(editor).toMatch(/Export blocked; adjust regions and retry/);
      expect(editor).toMatch(/export blocked rather than shipping unverified/);
    });
  });

  describe('retype field keyboard contract (instructions step 3)', () => {
    it('claim: instructions + aria-labels promise Enter commits, Escape reverts', () => {
      expect(registry).toMatch(/Enter commits, Escape reverts/);
      expect(editor).toMatch(/Enter commits, Escape reverts/);
    });
    it('impl: both handlers exist on the draft field', () => {
      expect(editor).toMatch(/e\.key === 'Enter'\) \(e\.target as HTMLInputElement\)\.blur\(\)/);
      expect(editor).toMatch(/e\.key === 'Escape'\) setTextDraft\(null\)/);
    });
  });
});
