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

/**
 * Editor source lives under pdf/editor/ (split refactor). We readdir that
 * directory instead of naming files, so a NEW module automatically joins
 * the net — the failure mode this file exists to prevent is "the greps
 * stopped reaching the code and the suite went green for the wrong reason."
 * PdfEditor.tsx is a re-export shim (asserted below), so import-path
 * tests and DynamicModuleWrapper keep working while logic moves.
 */
const EDITOR_DIR = 'src/components/tools/modules/pdf/editor';
const editorFiles = fs
  .readdirSync(path.join(ROOT, EDITOR_DIR))
  .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
  .sort();
const editor = editorFiles
  .map((f) => fs.readFileSync(path.join(ROOT, EDITOR_DIR, f), 'utf8'))
  .join('\n');
const registry = read('src/registry/tools-chunk-1.ts');

/** Window-level keydown listener body (the global-shortcut surface). */
const windowListener = editor.match(
  /const onKey = \(e: KeyboardEvent\) => \{[\s\S]*?window\.addEventListener\('keydown', onKey\)/,
)?.[0];

describe('pdf-editor: documented claims vs actual behavior', () => {
  describe('split-refactor guards (the net must follow the code)', () => {
    it('net reaches every module under editor/ (readdir — new files join automatically)', () => {
      expect(editorFiles.length, 'editor/ directory missing or empty').toBeGreaterThanOrEqual(1);
      // Sanity: the concat actually contains the spine, not just leaves.
      expect(editor).toContain('onCanvasKey');
      expect(editor).toContain('const onKey = (e: KeyboardEvent)');
    });

    it('shim: pdf/PdfEditor.tsx stays a re-export only — no logic hides outside the net', () => {
      const shim = read('src/components/tools/modules/pdf/PdfEditor.tsx');
      expect(shim).toMatch(/from '\.\/editor\//);
      expect(shim, 'component logic must live under editor/ (covered by readdir)').not.toMatch(
        /onCanvasKey|const onKey = |drawOverlay|commitAnnos/,
      );
      expect(shim.length, 'shim unexpectedly large — did logic leak back in?').toBeLessThan(2000);
    });
  });

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
      expect(windowListener, 'Ctrl+S must flush inline draft via saveFlushing before writing').toMatch(
        /saveFlushingRef\.current\(\)/,
      );
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
    it('impl: restructure remaps via restructureAnnos/moveAnnosPage and stores the result', () => {
      expect(editor).toMatch(/restructureAnnos\(prevAnnos, op as 'rotate'/);
      expect(editor).toMatch(/moveAnnosPage\(prevAnnos, move\.from, move\.to, pageCount\)/);
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

  describe('shortcut binding architecture (audited after four canvas-only bugs)', () => {
    /**
     * Every (?) shortcuts-panel row, classified. 'window' = must bind on
     * the window listener (works with focus anywhere except inputs);
     * 'canvas' = deliberately focus-scoped (arrows would break scrolling
     * if stolen globally). Adding a panel row without adding it HERE
     * fails the classification test — that's the point: no more
     * unclassified shortcuts that quietly end up canvas-only.
     */
    const PANEL: { label: string; location: 'window' | 'canvas'; tokens: string[] }[] = [
      { label: 'Undo / redo', location: 'window', tokens: ["e.key.toLowerCase() === 'z'", "e.key.toLowerCase() === 'y'"] },
      { label: 'Save session', location: 'window', tokens: ["e.key.toLowerCase() === 's'"] },
      { label: 'Duplicate selected', location: 'window', tokens: ["e.key.toLowerCase() === 'd'"] },
      { label: 'Delete selected', location: 'window', tokens: ["e.key === 'Delete'"] },
      { label: 'Find panel', location: 'window', tokens: ["e.key.toLowerCase() === 'f'"] },
      { label: 'Copy / paste', location: 'window', tokens: ["e.key.toLowerCase() === 'c'", "e.key.toLowerCase() === 'v'"] },
      { label: 'Nudge (×10 with Shift)', location: 'canvas', tokens: ['Arrow'] },
      { label: 'This panel', location: 'window', tokens: ["e.key === '?'" ] },
    ];

    const panelLabels = () => {
      // Anchor on the dialog, not the toolbar button that shares the
      // aria-label; end at Done so footer link pairs don't leak in.
      const start = editor.indexOf('role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"');
      const end = editor.indexOf('Done</button>', start);
      expect(start, 'shortcuts dialog missing').toBeGreaterThan(-1);
      expect(end, 'shortcuts dialog Done button missing').toBeGreaterThan(start);
      const region = editor.slice(start, end);
      return [...region.matchAll(/\['([^']+)', '[^']+'\]/g)].map((m) => m[1]!);
    };

    const canvasHandler = () => editor.match(/const onCanvasKey[\s\S]*?\n  \};/)?.[0] ?? '';

    it('every shortcuts-panel row is classified here (new rows must pick a side)', () => {
      expect(panelLabels().sort()).toEqual(PANEL.map((p) => p.label).sort());
    });

    it('window-classified shortcuts bind in the window listener', () => {
      expect(windowListener, 'window keydown listener missing').toBeTruthy();
      for (const row of PANEL.filter((p) => p.location === 'window')) {
        for (const tok of row.tokens) {
          expect(windowListener!, `panel row "${row.label}" missing from window listener: ${tok}`).toContain(tok);
        }
      }
    });

    it('canvas handler is arrow-nudge only — no modifier-key shortcuts (double-fire + focus-dependence)', () => {
      const canvas = canvasHandler();
      expect(canvas, 'onCanvasKey not found').toBeTruthy();
      expect(canvas).toContain('Arrow');
      expect(canvas, 'canvas handler must not bind ctrl/meta shortcuts').not.toMatch(/ctrlKey/);
      expect(canvas, 'canvas handler must not bind lowercase-key shortcuts').not.toMatch(/toLowerCase\(\) === '/);
      expect(canvas).not.toMatch(/'Delete'|'Backspace'|setShowShortcuts|setShowFind/);
    });

    it('paste shortcut parity: toolbar Paste button works without selection, so must Ctrl+V', () => {
      // Historical mismatch: the button was never selection-gated, but the
      // canvas shortcut sat behind `if (!selected) return`.
      const pasteBtn = editor.match(/<button[^>]*title="Paste \(Ctrl\+V\)"[^>]*>/)?.[0] ?? '';
      expect(pasteBtn, 'Paste button title missing').toBeTruthy();
      expect(pasteBtn).not.toContain('disabled={!selected}');
      expect(windowListener).toMatch(/pasteClipboard/);
    });
  });

  describe('inline-edit keyboard scope (designed before the feature shipped)', () => {
    /**
     * Inline editing = a real textarea/input overlay inside the canvas div.
     * The window listener's typing guard IS the suspend mechanism — stateless,
     * so no flag can leak. These three rules keep it that way:
     *  1. Only Ctrl+S binds ABOVE the guard (save mid-typing is intentional).
     *  2. Enter/Escape/Tab never bind on window — element-local only.
     *  3. The canvas nudge handler guards contentEditable (overlays live
     *     inside it) or arrows would steal keystrokes mid-edit.
     */
    it('rule 1: only Ctrl+S binds above the typing guard; all other keys after', () => {
      expect(windowListener, 'window listener missing').toBeTruthy();
      const guardAt = windowListener!.indexOf('isContentEditable');
      expect(guardAt, 'typing guard missing from window listener').toBeGreaterThan(-1);
      const saveAt = windowListener!.indexOf("e.key.toLowerCase() === 's'");
      expect(saveAt).toBeGreaterThan(-1);
      expect(saveAt, 'Ctrl+S must stay ABOVE the guard (save while typing)').toBeLessThan(guardAt);
      for (const tok of ["'z'", "'y'", "'f'", "'d'", "'c'", "'v'", "'Delete'", "'?'" ]) {
        const at = windowListener!.indexOf(tok);
        expect(at, `key ${tok} missing from window listener`).toBeGreaterThan(-1);
        expect(at, `key ${tok} must sit BELOW the typing guard`).toBeGreaterThan(guardAt);
      }
    });

    it('rule 2: Enter/Escape/Tab never bind on window (element-local on editing surfaces only)', () => {
      expect(windowListener).not.toMatch(/'Enter'|'Escape'|'Tab'/);
    });

    it('rule 3: canvas nudge handler guards contentEditable overlays', () => {
      const canvas = editor.match(/const onCanvasKey[\s\S]*?\n  \};/)?.[0] ?? '';
      expect(canvas).toMatch(/isContentEditable/);
    });
  });

  describe('inline in-place editing (P1)', () => {
    it('claim: registry instructions promise double-click in-place editing with the key contract', () => {
      expect(registry).toMatch(
        /Double-click a text box, note, or flowing text to edit right on the page \(Enter commits single-line text, Escape reverts\)/,
      );
    });
    it('impl: place-and-type — new text/flow boxes open the overlay immediately', () => {
      expect(editor).toMatch(/setInlineEdit\(\{ page, index: newIdx \}\)/);
      expect(editor, 'flow toast must match the new in-place behavior').toMatch(
        /type right here, it wraps and grows/,
      );
      expect(editor).not.toMatch(/type in the left panel, it wraps/);
    });
    it('impl: double-click on select/text tools opens beginInlineEdit', () => {
      expect(editor.match(/beginInlineEdit\(page, hit\)/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(editor).toMatch(/e\.detail >= 2/);
    });
    it('impl: real input/textarea overlay + blur-commit + Escape-revert (matches left-panel contract)', () => {
      expect(editor).toMatch(/onBlur: commitInline/);
      expect(editor).toMatch(/revertInline\(\)/);
      expect(editor).toMatch(/single && e\.key === 'Enter'/);
      expect(editor, 'overlay must be a DOM editing surface so the typing guard suspends globals').toMatch(
        /inlineEditBox\(a, scale\)/,
      );
    });
    it('impl: hidden-when-not-live keeps onBlur as the single commit path (no lost drafts)', () => {
      expect(editor).toMatch(/className: box \? 'absolute z-20[^']*' : 'hidden'/);
    });
  });

  describe('inline edit × save/undo seams (post-ship follow-ups)', () => {
    it('Q1 impl: Ctrl+S and the Save button flush the live draft before writing', () => {
      expect(editor).toMatch(/const saveFlushing = \(silent = false\) => saveNow\(silent, flushInline\(\)\)/);
      expect(editor, 'window Ctrl+S must route through the flush').toMatch(/void saveFlushingRef\.current\(\)/);
      expect(editor, 'toolbar Save must route through the flush').toMatch(/onClick=\{\(\) => saveFlushing\(\)\}/);
      expect(editor).toMatch(/const saveNow = async \(silent = false, annosOverride\?:/);
      expect(editor).toMatch(/writeDraft\(snapshot/);
      expect(editor, 'old blind saveNow() call sites must not remain for explicit saves').not.toMatch(
        /onClick=\{\(\) => saveNow\(\)\}/,
      );
    });

    it('Q1 impl: dirty counts an uncommitted inline draft so beforeunload warns mid-edit', () => {
      expect(editor).toMatch(/if \(!inlineEdit\) return false;/);
      expect(editor).toMatch(/const v = a\.kind === 'note' \? inlineDraft\.slice\(0, 240\) : inlineDraft;/);
      expect(
        editor,
        'dirty must OR in the live draft — committed annos alone stays clean mid-typing',
      ).toMatch(/const dirty =[\s\S]{0,160}!!fileBytes && inlineUnsaved/);
      expect(editor).toMatch(/dirtyRef\.current = dirty;/);
    });

    it('Q2 impl: flow/note plain Enter inserts a line; only single-line text Enter commits', () => {
      expect(editor).toMatch(/single && e\.key === 'Enter'/);
      expect(
        editor,
        'multi-line boxes need a non-Enter commit path (Ctrl+Enter) or paragraph breaks are impossible',
      ).toMatch(/!single && e\.key === 'Enter' && \(e\.ctrlKey \|\| e\.metaKey\)/);
      expect(editor).toMatch(/Enter adds a line, Ctrl\+Enter commits/);
    });

    it('Q3 impl: keystrokes never touch the undo stack — exactly one flush commit, zero on no-op', () => {
      // Overlay onChange only writes local draft state (native undo owns keystrokes).
      expect(editor).toMatch(
        /onChange: \(e: React\.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>\) => setInlineDraft\(e\.target\.value\)/,
      );
      // Flush commits once via commitAnnos and bails without an entry when unchanged.
      expect(editor).toMatch(/if \(v === a\.text\) return annos; \/\/ no junk undo entries/);
      expect(editor).toMatch(/commitAnnos\(\(\) => next\);/);
    });
  });

  describe('resize handles (P1)', () => {
    it('claim: registry instructions promise 8 handles for shape/image, one Undo step, Select tool', () => {
      expect(registry).toMatch(
        /With Select, a shape or image grows eight corner\/edge handles you can drag to resize — the whole drag is one Undo step/,
      );
    });
    it('impl: pure geometry helpers exist and are wired (hit/points/resize/cursors)', () => {
      expect(editor).toMatch(/export function handlePoints\(/);
      expect(editor).toMatch(/export function hitHandle\(/);
      expect(editor).toMatch(/export function resizeRect\(/);
      expect(editor).toMatch(/export function isResizableAnno\(/);
      expect(editor).toMatch(/export const HANDLE_CURSORS/);
      expect(editor).toMatch(/export const RESIZE_HANDLES/);
    });
    it('impl: pointerdown checks handles first, Select tool only, screen-constant 8px grace', () => {
      const selectBlock = editor.match(/if \(tool === 'select'\) \{[\s\S]{0,1200}hitTestAnno/)?.[0] ?? '';
      expect(selectBlock, 'handle check must precede the body hit-test').toMatch(
        /hitHandle\(sel, x, y, 8 \/ scale\)/,
      );
      expect(selectBlock).toMatch(/isResizableAnno\(sel\)/);
      expect(selectBlock).toMatch(/pushed: false/);
    });
    it('impl: drag is one undo entry — commitAnnos on first move only, raw setAnnos after', () => {
      const move = editor.match(/const onPointerMove = \(e: React\.PointerEvent\) => \{[\s\S]*?\n  \};/)?.[0] ?? '';
      expect(move, 'resize branch must run before rubber-band drawing').toMatch(/if \(drag\.resize\)/);
      expect(move.indexOf('if (drag.resize)')).toBeLessThan(move.indexOf("tool === 'draw'"));
      expect(move).toMatch(
        /if \(!r\.pushed\) \{\s*r\.pushed = true;\s*commitAnnos\(\(prev\) => applyResize\(prev, r, box\)\);\s*\} else \{\s*setAnnos\(\(prev\) => applyResize\(prev, r, box\)\);\s*\}/,
      );
      const up = editor.match(/const onPointerUp = \(e: React\.PointerEvent\) => \{[\s\S]*?\n  \};/)?.[0] ?? '';
      expect(up, 'pointerup must early-return for resize (no select-rubber logic)').toMatch(
        /if \(drag\.resize\) \{\s*\/\/ The whole drag was one undo entry/,
      );
    });
    it('impl: overlay draws handles only for selected resizable annos under Select tool', () => {
      expect(editor).toMatch(/tool === 'select' && isResizableAnno\(a\)/);
      expect(editor).toMatch(/for \(const id of RESIZE_HANDLES\)/);
      expect(editor, 'drawOverlay must repaint when the tool changes (handles appear/disappear)').toMatch(
        /inlineEdit, tool\]\);/,
      );
    });
    it('impl: cursor affordance lives in the React style (re-render-safe), cleared on pointer leave', () => {
      expect(editor).toMatch(/tool === 'select' && hoverHandle\s*\? HANDLE_CURSORS\[hoverHandle\]/);
      expect(editor).toMatch(/onPointerLeave=\{\(\) => setHoverHandle\(null\)\}/);
      expect(
        editor,
        'deselect/tool-switch must clear a stale handle cursor on the next move',
      ).toMatch(/\/\/ Deselect \/ tool switch: a stale handle cursor must not stick\.\s*setHoverHandle\(\(prev\) => \(prev === null \? prev : null\)\)/);
    });
  });

  describe('thumbnail drag-reorder (P1)', () => {
    it('claim: registry instructions promise drag-to-reorder from the Pages sidebar, one Undo step', () => {
      expect(registry).toMatch(
        /In the Pages sidebar, drag a thumbnail to reorder the document \(one Undo step\)/,
      );
    });
    it('impl: thumbnails are draggable; drop routes through restructure move with from/to', () => {
      expect(editor).toMatch(/draggable/);
      expect(editor, 'Firefox refuses to start a drag without payload data').toMatch(
        /e\.dataTransfer\.setData\('text\/plain', String\(i\)\)/,
      );
      expect(editor).toMatch(/void restructure\('move', \{ from, to: i \}\)/);
      expect(editor).toMatch(/from !== i/); // self-drop is a no-op
    });
    it('impl: move is a structural op — guards, pdf-lib remove+insert, annos remap, undo bytes', () => {
      expect(editor).toMatch(/move\.from === move\.to/);
      expect(editor).toMatch(/doc\.removePage\(move\.from\)/);
      expect(editor).toMatch(/doc\.insertPage\(Math\.max\(0, Math\.min\(move\.to, doc\.getPageCount\(\)\)\), moving!\)/);
      expect(editor).toMatch(/moveAnnosPage\(prevAnnos, move\.from, move\.to, pageCount\)/);
      expect(editor).toMatch(/bytes: fileBytes\.slice\(\)/);
      expect(editor, 'toast must keep the annotations-follow claim').toMatch(
        /Page moved to position \$\{move \? move\.to \+ 1 : '\?'\} — annotations followed their pages/,
      );
    });
    it('impl: drop target highlighted and drag state always cleared (drop, end, self-drop)', () => {
      expect(editor).toMatch(/setThumbDragOver\(\(prev\) => \(prev === i \? prev : i\)\)/);
      expect(editor).toMatch(/setThumbDragOver\(null\)/);
      expect(editor).toMatch(/thumbDragRef\.current = null/);
    });
  });

  describe('mobile quick-action bar (P1 slice — NOT all of mobile)', () => {
    const bar = editor.match(/aria-label="Quick actions"[\s\S]{0,2500}/)?.[0] ?? '';

    it('impl: fixed bar, below-lg only, exactly the 5 agreed slots wired to real actions', () => {
      expect(bar, 'bar must exist').toBeTruthy();
      expect(editor).toMatch(/fixed bottom-0 inset-x-0 z-40 lg:hidden/); // before aria-label in source
      expect(editor).toMatch(/role="toolbar"\s+aria-label="Quick actions"/);
      expect(bar).toMatch(/aria-label="Tools"/);
      expect(bar).toMatch(/aria-label="Undo — long-press for redo"/);
      expect(bar).toMatch(/aria-label="Save working session"/);
      expect(bar).toMatch(/saveFlushing\(\)/); // same flush path as desktop
      expect(bar).toMatch(/aria-label="Download flattened PDF"/);
      expect(bar).toMatch(/onClick=\{exportPdf\}/);
      expect(bar).toMatch(/aria-label="Pages"/);
      expect(bar, 'Redo must not take a sixth slot — it rides long-press').not.toMatch(/Redo/);
      // className sits before aria-label on the bar tag:
      expect(editor).toMatch(/pb-\[env\(safe-area-inset-bottom\)\]/); // iOS home indicator
    });

    it('impl: Tools opens a bottom sheet built from the SAME tools array (no drift)', () => {
      expect(editor).toMatch(/aria-label="Choose a tool"/);
      expect(editor).toMatch(/tools\.filter\(\(t\) => t\.group === g\)/);
      expect(editor).toMatch(/setTool\(t\.id\);\s*setShowToolsSheet\(false\)/);
      expect(editor).toMatch(/aria-haspopup="dialog"/);
    });

    it('impl: Pages sidebar hidden below lg; shared list lives behind the sheet (kills 560px scroll-past)', () => {
      expect(editor).toMatch(/hidden lg:block lg:col-span-2/);
      expect(editor, 'sheet + sidebar must render the same component (DnD/reorder included)').toMatch(
        /export function PagesList\(/,
      );
      expect(editor.match(/PagesList/g)?.length ?? 0).toBeGreaterThanOrEqual(3); // def + sidebar + sheet
      expect(editor).toMatch(/onPick=\{\(\) => setShowPagesSheet\(false\)\}/); // navigate closes sheet
      const pagesSheet = editor.match(/aria-label="Pages">\s*<button aria-label="Close pages"[\s\S]{0,600}/)?.[0] ?? '';
      expect(pagesSheet).toMatch(/max-h-\[70vh\]/);
      expect(pagesSheet, 'close = backdrop + ✕, matching the shortcuts dialog (no window Escape)').toMatch(
        /aria-label="Close pages" onClick=\{\(\) => setShowPagesSheet\(false\)\}/,
      );
    });

    it('impl: long-press Undo = redo (550ms), tap = undo, cancel on leave — single handler pair', () => {
      expect(editor).toMatch(/st\.fired = true;\s*void redo\(\);\s*\}, 550\)/);
      expect(editor).toMatch(/if \(!st\.fired\) void undo\(\)/);
      expect(editor).toMatch(/onPointerLeave=\{undoPressCancel\}/);
      expect(editor).toMatch(/onContextMenu=\{\(e\) => e\.preventDefault\(\)\}/); // no long-press menu
    });

    it('follow-up logged: pinch-zoom is explicitly NOT closed by this slice', () => {
      expect(
        editor,
        'touch-none must keep its own TODO so "bar shipped" ≠ "mobile: done"',
      ).toMatch(/TODO\(mobile\): touch-none blocks native pinch-zoom/);
      expect(editor).toMatch(/never read as "mobile: done"/);
    });
  });

  describe('retype field keyboard contract (left panel + inline share one contract)', () => {
    it('claim: aria-labels promise Enter commits, Escape reverts (registry now phrases it on the inline instruction)', () => {
      expect(editor).toMatch(/Enter commits, Escape reverts/);
      expect(registry).toMatch(/Enter commits, Escape reverts|Enter commits single-line text, Escape reverts/);
    });
    it('impl: both handlers exist on the draft field', () => {
      expect(editor).toMatch(/e\.key === 'Enter'\) \(e\.target as HTMLInputElement\)\.blur\(\)/);
      expect(editor).toMatch(/e\.key === 'Escape'\) setTextDraft\(null\)/);
    });
  });
});
