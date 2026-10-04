import { test, expect, type Page } from '@playwright/test';
import { PDFDocument, PDFPage, StandardFonts, degrees, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Manual fixture checklist as automation (docs/pdf-editor-claims.md §53+).
 *
 * These cases exercise the REAL browser render → JPEG → embed path that
 * unit tests cannot reach. What stays human: opening the export in
 * Preview/Acrobat/Chrome by hand (case 1 tail), pixel-perfect visual
 * placement of the rotated text annotation (case 5), and the real-phone
 * Hindi/Tamil check (device fonts).
 *
 * Server: `npm run dev` on :3000 must already be running.
 */

const TMP = mkdtempSync(path.join(tmpdir(), 'pdf-e2e-'));
const FONT_FIXTURES = path.join('src', '__tests__', 'fixtures', 'fonts');

// ── fixtures ────────────────────────────────────────────────────────────

async function letterSecret(): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText('SECRET', { x: 273, y: 388, size: 20, font, color: rgb(0, 0, 0) });
  const p = path.join(TMP, 'letter-secret.pdf');
  writeFileSync(p, await doc.save());
  return p;
}

async function rotatedSecret(angle: number): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText('SECRET', { x: 273, y: 388, size: 20, font, color: rgb(0, 0, 0) });
  if (angle) page.setRotation(degrees(angle));
  const p = path.join(TMP, `rotated-${angle}.pdf`);
  writeFileSync(p, await doc.save());
  return p;
}

async function rotatedSecretWithAnno(angle: number): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText('SECRET', { x: 273, y: 388, size: 20, font, color: rgb(0, 0, 0) });
  if (angle) page.setRotation(degrees(angle));
  const p = path.join(TMP, `rotated-anno-${angle}.pdf`);
  writeFileSync(p, await doc.save());
  return p;
}

async function multiFour(): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const label of ['ONE', 'TWO', 'THREE', 'FOUR']) {
    const page = doc.addPage([612, 792]);
    page.drawText(`BODY ${label}`, { x: 250, y: 380, size: 18, font });
    page.drawText('SECRET', { x: 273, y: 410, size: 20, font });
  }
  const p = path.join(TMP, 'multi-4.pdf');
  writeFileSync(p, await doc.save());
  return p;
}

async function linksAndForms(): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText('SECRET', { x: 273, y: 388, size: 20, font });
  const form = doc.getForm();
  const tf = form.createTextField('secretfield');
  tf.setText('FORMDATA');
  tf.addToPage(page, { x: 100, y: 600, width: 220, height: 24, font, borderWidth: 1 });
  const link = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [100, 500, 320, 530],
    Border: [0, 0, 0],
    A: { Type: 'A', S: 'URI', URI: doc.context.obj('https://example.com/secret-target') },
  });
  (page as unknown as { node: { addAnnot: (_r: unknown) => void } }).node.addAnnot(doc.context.register(link));
  const p = path.join(TMP, 'links-forms.pdf');
  writeFileSync(p, await doc.save());
  return p;
}

async function edgeAndTiny(): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText('SECRET', { x: 273, y: 388, size: 20, font });
  page.drawText('EDGE', { x: 556, y: 766, size: 10, font }); // top-right, 6pt from trim
  page.drawText('TINY', { x: 80, y: 60, size: 6, font }); // bottom-left, 6pt text
  const p = path.join(TMP, 'edge-tiny.pdf');
  writeFileSync(p, await doc.save());
  return p;
}

async function cropped(): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.setMediaBox(50, 40, 300, 200);
  page.drawText('SECRET', { x: 170, y: 130, size: 20, font });
  const p = path.join(TMP, 'cropped.pdf');
  writeFileSync(p, await doc.save());
  return p;
}

// ── helpers ─────────────────────────────────────────────────────────────

async function openEditor(page: Page, file: string): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('toolzum_onboarded', '1');
    localStorage.setItem('toolzum_pdf_editor_toured', '1');
  });
  // The download quota gate calls /api/check-plan + /api/downloads/* which
  // need server bindings — 500/404 in plain `next dev`, so every export would
  // hit the "Downloads temporarily unavailable" modal. Mock the contract
  // (allowed:true) so the suite exercises the export, not the quota service.
  await page.route('**/api/check-plan', (r) =>
    r.fulfill({ json: { plan: 'free', maxFileSizeMB: 125, maxBatchSize: 50, threads: 4 } }),
  );
  await page.route('**/api/downloads/check**', (r) =>
    r.fulfill({ json: { allowed: true, remaining: 99, plan: 'anon' } }),
  );
  await page.route('**/api/downloads/record', (r) => r.fulfill({ json: { allowed: true } }));
  // Case 2/5 loop openEditor inside ONE browser context, so the previous
  // iteration's autosaved draft is still in IndexedDB. Mount-time recovery
  // restores it — and the PDF file input only exists while no document is
  // loaded (`if (!pdfDoc)` renders FileUploader) — so setInputFiles would
  // wait forever for an input that recovery removed. Clear the row first.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        try {
          const openReq = indexedDB.open('toolzum-pdf-editor', 1);
          openReq.onupgradeneeded = () => {
            // DB doesn't exist yet — nothing to clear; abort so we don't
            // create an empty one that lacks the 'sessions' store.
            try {
              openReq.transaction?.abort();
            } catch {
              /* ignore */
            }
            resolve();
          };
          openReq.onerror = () => resolve();
          openReq.onsuccess = () => {
            try {
              const db = openReq.result;
              const tx = db.transaction('sessions', 'readwrite');
              tx.objectStore('sessions').delete('draft');
              const done = () => {
                try {
                  db.close();
                } catch {
                  /* ignore */
                }
                resolve();
              };
              tx.oncomplete = done;
              tx.onerror = done;
              tx.onabort = done;
            } catch {
              resolve();
            }
          };
        } catch {
          resolve();
        }
      }),
  );
  await page.goto('/pdf/pdf-editor');
  // Onboarding/survey/cookie overlays steal pointer events and cover the
  // canvas — clear them before any interaction.
  for (let i = 0; i < 3; i++) {
    const accept = page.getByRole('button', { name: /Accept All/ });
    const gotIt = page.getByRole('button', { name: 'Got it' });
    const decline = page.getByRole('button', { name: /^Decline$/ });
    if (await accept.isVisible().catch(() => false)) await accept.click().catch(() => {});
    else if (await decline.isVisible().catch(() => false)) await decline.click().catch(() => {});
    if (await gotIt.isVisible().catch(() => false)) await gotIt.click().catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.locator('input[type="file"][accept*="application/pdf"]').setInputFiles(file);
  await expect(page.getByRole('button', { name: 'Download flattened PDF' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Fit whole page' }).click({ timeout: 15_000 });
  await expect(page.locator('canvas.absolute')).toBeVisible();
}

async function dragFrac(page: Page, x1: number, y1: number, x2: number, y2: number): Promise<void> {
  const overlay = page.locator('canvas.absolute');
  // Picking tools in the sidebar can scroll the window and leave the canvas
  // partly above the viewport — mouse coords off-screen silently miss the
  // canvas and no annotation is created. Re-center first, then verify both
  // endpoints land inside the viewport (case 7 dragged at y=-152 before).
  await overlay.scrollIntoViewIfNeeded();
  const vp = page.viewportSize()!;
  // Tool/mode pickers can raise a toast that overlaps the canvas: a drag
  // whose press point is covered hits the toast instead of the canvas
  // (case 7's top drag vanished; the lower one landed). Wait for both
  // endpoints to have a clear hit target, re-reading the box each attempt
  // — a toast can also shift layout while it is on screen.
  let from = { x: 0, y: 0 };
  let to = { x: 0, y: 0 };
  let blocker = 'canvas never measured';
  const deadline = Date.now() + 10_000;
  for (let attempt = 0; ; attempt++) {
    const b = (await overlay.boundingBox())!;
    // The sticky site header (60px, z-1000) covers the viewport top, and
    // scrollIntoViewIfNeeded parks the canvas right under it — a drag at
    // y1≈0.01 then presses ON the header, which swallows the pointerdown
    // (case 7's EDGE redaction vanished). Scroll the canvas clear first.
    if (b.y < 76 && attempt < 12) {
      const moved = await page.evaluate((dy) => {
        if (window.scrollY <= 0) return false;
        window.scrollBy(0, dy);
        return true;
      }, b.y - 76);
      if (moved) {
        await page.waitForTimeout(120);
        continue;
      }
    }
    from = { x: b.x + x1 * b.width, y: b.y + y1 * b.height };
    to = { x: b.x + x2 * b.width, y: b.y + y2 * b.height };
    for (const p of [from, to]) {
      if (p.x < 0 || p.y < 0 || p.x > vp.width || p.y > vp.height) {
        throw new Error(
          `drag point (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) outside viewport ` +
            `${vp.width}x${vp.height}; canvas box ${JSON.stringify(b)}`,
        );
      }
    }
    blocker = await page.evaluate(
      ({ a, b: bp, box }) => {
        // Clamp hit-probe coords 0.5px inside the canvas rect: a frac of
        // 1.0 lands exactly on rect.right, which elementFromPoint resolves
        // to the NEXT element (rects are [left, right)) — not an overlay.
        const clamp = (p: { x: number; y: number }) => ({
          x: Math.min(Math.max(p.x, box.x + 0.5), box.x + box.width - 0.5),
          y: Math.min(Math.max(p.y, box.y + 0.5), box.y + box.height - 0.5),
        });
        const ac = clamp(a);
        const bc = clamp(bp);
        const wrapper = document.querySelector('canvas.absolute')?.parentElement || null;
        const describe = (el: Element | null, which: string): string => {
          if (!el) return `${which}: no element at point`;
          if (el.closest('[data-rht-toaster]')) return `${which}: toast overlay (${el.tagName}.${String(el.className)})`;
          if (el.closest('[aria-label="Rendering page"]')) return `${which}: rendering veil`;
          // Sticky header / toolbar / anything outside the canvas wrapper
          // swallows the press silently — flag it instead of dragging at
          // an element that never forwards pointer events to the page.
          if (wrapper && !wrapper.contains(el)) {
            return `${which}: outside canvas wrapper (${el.tagName}.${String(el.className).slice(0, 60)})`;
          }
          return '';
        };
        return (
          describe(document.elementFromPoint(ac.x, ac.y), 'start') ||
          describe(document.elementFromPoint(bc.x, bc.y), 'end')
        );
      },
      { a: from, b: to, box: b },
    );
    if (!blocker) break;
    if (Date.now() > deadline) {
      throw new Error(
        `drag start blocked for 10s by ${blocker} at (${from.x.toFixed(1)}, ${from.y.toFixed(1)})`,
      );
    }
    await page.waitForTimeout(250);
  }
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/** Center word occupies the middle ~15% in every rotation (center-invariant). */
const centerBox = () => dragFrac(pageRef()!, 0.4, 0.4, 0.6, 0.6);

let _page: Page | null = null;
function pageRef(): Page | null {
  return _page;
}

async function pickTool(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: `${name} tool`, exact: true }).click();
}

async function pickMode(page: Page, mode: 'Selective' | 'Maximum'): Promise<void> {
  await page.getByRole('radio', { name: new RegExp(`^${mode}`) }).click();
}

/** Success/error toast inside react-hot-toast's portal (not page copy). */
function toastLoc(page: Page, re: RegExp) {
  return page.locator('[data-rht-toaster]').getByText(re).first();
}

async function exportPdf(page: Page, toast?: RegExp): Promise<string> {
  // CI (3 engines, workers=2, SW installs in sibling tests) starves the
  // export render past the old 60s cap — Oct 2026 runs timed out here on
  // every multi-op case while the same exports passed locally serial.
  const dlPromise = page.waitForEvent('download', { timeout: 150_000 });
  // The toast fires when export completes but only lives ~8s, while
  // dl.path() (full file write) can outlive it — so wait for it BEFORE
  // awaiting the path, not after exportPdf returns.
  const toastPromise = toast ? toastLoc(page, toast).waitFor({ state: 'visible', timeout: 150_000 }) : null;
  await page.getByRole('button', { name: 'Download flattened PDF' }).click();
  const dl = await dlPromise;
  if (toastPromise) await toastPromise;
  const p = await dl.path();
  if (!p) throw new Error('download has no path');
  return p;
}

async function expectExportBlocked(page: Page, toast: RegExp): Promise<void> {
  const toastPromise = toastLoc(page, toast).waitFor({ state: 'visible', timeout: 60_000 });
  const dlPromise = page.waitForEvent('download', { timeout: 8_000 }).catch(() => null);
  await page.getByRole('button', { name: 'Download flattened PDF' }).click();
  expect(await dlPromise, 'export must not produce a download').toBeNull();
  await toastPromise;
}

/** pdf-lib's getSize() returns {width, height} — not a tuple. */
function pageSize(page: PDFPage): [number, number] {
  const { width, height } = page.getSize();
  return [width, height];
}

async function extractPages(pdfPath: string): Promise<string[]> {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const out: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const pg = await doc.getPage(n);
    const tc = await pg.getTextContent();
    out.push(tc.items.map((it) => ('str' in it ? String(it.str) : '')).join(' '));
  }
  await doc.cleanup();
  return out;
}

/** First DCTDecode stream = the rasterized page image (Max mode). */
function firstJpeg(buf: Buffer): Buffer {
  const s = buf.toString('latin1');
  const filter = s.indexOf('/DCTDecode');
  if (filter < 0) throw new Error('no /DCTDecode stream in export');
  const streamIdx = s.indexOf('stream', filter);
  const head = s.slice(filter, streamIdx);
  const lenMatch = /\/Length (\d+)\b/.exec(head);
  const start = s.indexOf('\n', streamIdx) + 1;
  if (lenMatch) {
    return buf.subarray(start, start + Number(lenMatch[1]));
  }
  const end = s.indexOf('endstream', start);
  return buf.subarray(start, end);
}

/** Decode a JPEG in the browser (no node-canvas) and measure center darkness. */
async function centerDarkness(page: Page, jpeg: Buffer): Promise<number> {
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    // The burn rect (centerBox = 0.4–0.6) is what must be black — sample
    // 0.42–0.58 (2% inset so JPEG bleed at the rect edge can't dilute it).
    // Measuring 0.35–0.65 would cap darkness at (0.2/0.3)² ≈ 0.44 even for
    // a perfect burn (the observed case-2b value).
    const rx = Math.floor(img.width * 0.42);
    const ry = Math.floor(img.height * 0.42);
    const rw = Math.floor(img.width * 0.16);
    const rh = Math.floor(img.height * 0.16);
    const d = ctx.getImageData(rx, ry, rw, rh).data;
    let dark = 0;
    const total = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
      if (lum < 48) dark++;
    }
    return dark / total;
  }, jpeg.toString('base64'));
}

async function gotoPage(page: Page, target: number, total: number): Promise<void> {
  const indicator = page.getByText(new RegExp(`Page \\d+/${total}$`));
  await expect(indicator).toBeVisible({ timeout: 30_000 });
  for (let guard = 0; guard < 15; guard++) {
    const txt = (await indicator.innerText()).trim();
    const m = /Page (\d+)\/(\d+)/.exec(txt);
    if (!m) throw new Error(`bad page indicator: ${txt}`);
    const current = Number(m[1]);
    if (current === target) return;
    const name = current < target ? 'Next page' : 'Previous page';
    const next = current < target ? current + 1 : current - 1;
    await page.getByRole('button', { name, exact: true }).click();
    await expect(indicator).toHaveText(new RegExp(`Page ${next}/${total}`), { timeout: 10_000 });
  }
  throw new Error(`page navigation stuck (wanted ${target}/${total})`);
}

// ── cases ───────────────────────────────────────────────────────────────

test.describe('pdf-editor manual checklist (browser render → JPEG → embed)', () => {
  // Next dev compiles PdfEditorCore lazily — a cold load eats ~90s on this
  // machine, which would blow the per-test 120s budget on the first case.
  // Warm the route once per worker before the per-test timeout shrinks.
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180_000);
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/pdf/pdf-editor');
    await expect(page.locator('input[type="file"][accept*="application/pdf"]')).toBeVisible({ timeout: 150_000 });
    await ctx.close();
  });

  test.beforeEach(async ({ page }) => {
    // 300s whole-test ceiling (raised Oct 2026 again): the export wait
    // itself is 150s under CI contention, so setup + export must fit
    // inside the budget without preempting the download event. Genuinely
    // broken exports still fail at the 150s download wait, not here.
    test.setTimeout(300_000);
    _page = page;
  });

  test('case 1: selective redact — page size intact, SECRET gone from the text layer', async ({ page }) => {
    await openEditor(page, await letterSecret());
    await pickTool(page, 'Redact');
    await pickMode(page, 'Selective');
    await centerBox();
    const out = await exportPdf(page, /redaction checks passed/);

    const doc = await PDFDocument.load(readFileSync(out));
    const [w, h] = pageSize(doc.getPage(0));
    expect(w).toBeCloseTo(612, 1);
    expect(h).toBeCloseTo(792, 1);
    const [text] = await extractPages(out);
    expect(text).not.toContain('SECRET');
    // Human tail of case 1: open the file in Preview + Acrobat + Chrome.
  });

  test('case 2: selective redact at /Rotate 90, 180, 270 — box lands on the word every time', async ({ page }) => {
    // 3 full editor sessions (goto → upload → redact → export each) ≈ 50s apiece
    // under load — the beforeEach 120s ceiling ran out mid-loop (observed Oct
    // 2026: iters 1–2 exported, iter 3 starved at setInputFiles). 3 sessions
    // + 150s export waits under CI contention → 600s ceiling.
    test.setTimeout(600_000);
    for (const angle of [90, 180, 270]) {
      await openEditor(page, await rotatedSecret(angle));
      await pickTool(page, 'Redact');
      await pickMode(page, 'Selective');
      await centerBox();
      const out = await exportPdf(page);

      const doc = await PDFDocument.load(readFileSync(out));
      expect(doc.getPage(0).getRotation().angle, `rotation ${angle} preserved`).toBe(angle);
      const [w, h] = pageSize(doc.getPage(0));
      expect(w).toBeCloseTo(612, 1);
      expect(h).toBeCloseTo(792, 1);
      const [text] = await extractPages(out);
      expect(text, `SECRET must be gone at /Rotate ${angle}`).not.toContain('SECRET');
    }
  });

  test('case 2b: maximum redact at /Rotate 90 — gate passes AND the burned center is actually black', async ({ page }) => {
    await openEditor(page, await rotatedSecret(90));
    await pickTool(page, 'Redact');
    await pickMode(page, 'Maximum');
    await centerBox();
    const out = await exportPdf(page);

    const doc = await PDFDocument.load(readFileSync(out));
    expect(doc.getPage(0).getRotation().angle).toBe(90);
    const [w, h] = pageSize(doc.getPage(0));
    expect(w).toBeCloseTo(612, 1);
    expect(h).toBeCloseTo(792, 1);

    // Independent pixel check (the app's own gate must not be the only judge).
    const darkness = await centerDarkness(page, firstJpeg(readFileSync(out)));
    expect(darkness, 'center region must be burned black in the exported raster').toBeGreaterThan(0.95);
  });

  test('case 3 + 6: highlight overlapping a maximum redaction BLOCKS the export; removing it unblocks', async ({ page }) => {
    await openEditor(page, await letterSecret());
    await pickTool(page, 'Redact');
    await pickMode(page, 'Maximum');
    await centerBox();
    // Overlapping highlight (case 6): lightens the burned region.
    await pickTool(page, 'Highlight');
    await dragFrac(page, 0.42, 0.42, 0.58, 0.58);

    await expectExportBlocked(page, /Maximum redaction UNVERIFIED/);

    // Remove the highlight (undo — it was the last annotation) and retry.
    await page.keyboard.press('ControlOrMeta+z');
    await page.waitForTimeout(300);
    const out = await exportPdf(page, /redaction checks passed/);
    expect(readFileSync(out).length).toBeGreaterThan(1000);
  });

  test('case 4: maximum redact drops links + form fields, and the toast names the page', async ({ page }) => {
    await openEditor(page, await linksAndForms());
    await pickTool(page, 'Redact');
    await pickMode(page, 'Maximum');
    await centerBox();
    const out = await exportPdf(page, /rasterized — links and form fields on this page are not preserved/);

    const bytes = readFileSync(out);
    const s = bytes.toString('latin1');
    expect(s, 'link annotations must not survive rasterization').not.toContain('/Subtype /Link');
    expect(s, 'form widgets must not survive rasterization').not.toContain('/Subtype /Widget');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getForm().getFields()).toHaveLength(0);
    const [text] = await extractPages(out);
    expect(text).not.toContain('SECRET');
    expect(text).not.toContain('FORMDATA');
  });

  test('case 5: rotated 90° and 270° — redaction + text annotation both survive', async ({ page }) => {
    // 2 full editor sessions — scale the beforeEach 300s ceiling with the
    // session count (same Oct 2026 ceiling math as case 2), plus 150s
    // export waits under CI contention.
    test.setTimeout(400_000);
    for (const angle of [90, 270]) {
      await openEditor(page, await rotatedSecretWithAnno(angle));
      // Text annotation off-center (so the redaction box does not strip it).
      await pickTool(page, 'Text');
      await dragFrac(page, 0.3, 0.3, 0.3, 0.3); // a click (down+up) places the box
      const input = page.getByLabel('Edit text in place');
      await expect(input).toBeVisible();
      await input.fill('ANNOD');
      await input.press('Enter');
      await page.waitForTimeout(200);

      await pickTool(page, 'Redact');
      await pickMode(page, 'Selective');
      await centerBox();
      const out = await exportPdf(page);

      const doc = await PDFDocument.load(readFileSync(out));
      expect(doc.getPage(0).getRotation().angle, `rotation ${angle}`).toBe(angle);
      const [text] = await extractPages(out);
      expect(text, `flattened annotation at /Rotate ${angle}`).toContain('ANNOD');
      expect(text, `SECRET redacted at /Rotate ${angle}`).not.toContain('SECRET');
      // Human tail: eyeball the annotation sits where it appeared on screen.
    }
  });

  test('case 7: redaction at the page edge + a tiny one-word redaction', async ({ page }) => {
    await openEditor(page, await edgeAndTiny());
    await pickTool(page, 'Redact');
    await pickMode(page, 'Selective');
    await dragFrac(page, 0.9, 0.01, 1.0, 0.045); // EDGE, top-right at the trim
    await dragFrac(page, 0.11, 0.9, 0.19, 0.94); // TINY, 6pt word
    const out = await exportPdf(page);

    const [text] = await extractPages(out);
    expect(text).not.toContain('EDGE');
    expect(text).not.toContain('TINY');
    expect(text, 'the untouched center word must survive').toContain('SECRET');
  });

  test('case 8: only pages 2 and 4 redacted — index shifts keep 1 and 3 intact', async ({ page }) => {
    await openEditor(page, await multiFour());
    await pickTool(page, 'Redact');
    await pickMode(page, 'Selective');

    await gotoPage(page, 2, 4);
    await centerBox();
    await gotoPage(page, 4, 4);
    await centerBox();

    const out = await exportPdf(page);
    const doc = await PDFDocument.load(readFileSync(out));
    expect(doc.getPageCount()).toBe(4);
    const text = await extractPages(out);
    expect(text[0]).toContain('BODY ONE');
    expect(text[0]).toContain('SECRET'); // page 1 untouched
    expect(text[1]).not.toContain('SECRET'); // page 2 redacted
    expect(text[2]).toContain('BODY THREE');
    expect(text[2]).toContain('SECRET'); // page 3 untouched
    expect(text[3]).not.toContain('SECRET'); // page 4 redacted
  });

  test('case 9: cropped page (MediaBox origin ≠ 0) — unit box converts, SECRET gone, box kept', async ({ page }) => {
    await openEditor(page, await cropped());
    await pickTool(page, 'Redact');
    await pickMode(page, 'Selective');
    await centerBox();
    const out = await exportPdf(page);

    const doc = await PDFDocument.load(readFileSync(out));
    const box = doc.getPage(0).getMediaBox();
    expect(box.x).toBeCloseTo(50, 1);
    expect(box.y).toBeCloseTo(40, 1);
    expect(box.width).toBeCloseTo(300, 1);
    expect(box.height).toBeCloseTo(200, 1);
    const [text] = await extractPages(out);
    expect(text).not.toContain('SECRET');
  });

  test('case 10a: Hindi offline — export BLOCKS with the fix named, no download', async ({ page }) => {
    await page.route('**/cdn.jsdelivr.net/**', (route) => route.abort());
    await openEditor(page, await letterSecret());
    await pickTool(page, 'Text');
    await dragFrac(page, 0.3, 0.3, 0.3, 0.3);
    const input = page.getByLabel('Edit text in place');
    await expect(input).toBeVisible();
    await input.fill('नमस्ते');
    await input.press('Enter');
    await page.waitForTimeout(200);

    await expectExportBlocked(page, /Hindi\/Tamil text needs the Noto font once/);
  });

  test('case 10b: Hindi online (fonts served from fixtures) — export succeeds, every character extractable', async ({ page }) => {
    await page.route('**/cdn.jsdelivr.net/fontsource/fonts/**', (route) => {
      const url = route.request().url();
      let file = 'arimo-latin-400.ttf';
      if (url.includes('devanagari')) file = 'noto-sans-devanagari-400.ttf';
      else if (url.includes('tamil')) file = 'noto-sans-tamil-400.ttf';
      route.fulfill({ path: path.join(FONT_FIXTURES, file), contentType: 'font/ttf' });
    });
    await openEditor(page, await letterSecret());
    await pickTool(page, 'Text');
    await dragFrac(page, 0.3, 0.3, 0.3, 0.3);
    const input = page.getByLabel('Edit text in place');
    await expect(input).toBeVisible();
    await input.fill('नमस्ते');
    await input.press('Enter');
    await page.waitForTimeout(200);

    const out = await exportPdf(page, /Exported/);
    const [text] = await extractPages(out);
    for (const ch of 'नमस्ते') {
      expect(text, `extracted text must contain ${JSON.stringify(ch)} (char-multiset, matra-safe)`).toContain(ch);
    }
  });

  test('case 10c: Hindi after editor draft save (fresh profile — fonts have their own DB)', async ({ page }) => {
    await openEditor(page, await letterSecret());
    await page.route('**/cdn.jsdelivr.net/fontsource/fonts/**', (route) => {
      const url = route.request().url();
      let file = 'arimo-latin-400.ttf';
      if (url.includes('devanagari')) file = 'noto-sans-devanagari-400.ttf';
      else if (url.includes('tamil')) file = 'noto-sans-tamil-400.ttf';
      route.fulfill({ path: path.join(FONT_FIXTURES, file), contentType: 'font/ttf' });
    });
    await pickTool(page, 'Text');
    await dragFrac(page, 0.3, 0.3, 0.3, 0.3);
    const input = page.getByLabel('Edit text in place');
    await expect(input).toBeVisible();
    await input.fill('नमस्ते');
    await input.press('Enter');
    // Editor created its draft DB at mount and the 3s-idle autosave has
    // written a row (Toolbar flips to "Saved HH:MM") — exactly the
    // ordering that used to poison the shared schema and kill the font
    // fetch before it was ever issued. 15s: autosave is 3s idle, so a
    // missing row that quickly is itself the failure (autosave = 3s idle).
    await expect(page.getByText(/Saved \d{1,2}:\d{2}/).first()).toBeVisible({ timeout: 15_000 });
    const out = await exportPdf(page, /Exported/);
    const [text] = await extractPages(out);
    for (const ch of 'नमस्ते') {
      expect(text, `extracted text must contain ${JSON.stringify(ch)}`).toContain(ch);
    }
  });

  test('case 10c variant: fonts DB unavailable — plain-fetch path still exports Hindi', async ({ page }) => {
    await page.addInitScript(() => {
      const factory = indexedDB as IDBFactory & { open: (name: string, version?: number) => IDBOpenDBRequest };
      const orig = factory.open.bind(indexedDB) as (name: string, version?: number) => IDBOpenDBRequest;
      factory.open = ((name: string, version?: number) => {
        if (name === 'toolzum-fonts') throw new DOMException('toolzum-fonts blocked by test', 'InvalidStateError');
        return version === undefined ? orig(name) : orig(name, version);
      }) as typeof factory.open;
    });
    await openEditor(page, await letterSecret());
    await page.route('**/cdn.jsdelivr.net/fontsource/fonts/**', (route) => {
      const url = route.request().url();
      let file = 'arimo-latin-400.ttf';
      if (url.includes('devanagari')) file = 'noto-sans-devanagari-400.ttf';
      else if (url.includes('tamil')) file = 'noto-sans-tamil-400.ttf';
      route.fulfill({ path: path.join(FONT_FIXTURES, file), contentType: 'font/ttf' });
    });
    await pickTool(page, 'Text');
    await dragFrac(page, 0.3, 0.3, 0.3, 0.3);
    const input = page.getByLabel('Edit text in place');
    await expect(input).toBeVisible();
    await input.fill('नमस्ते');
    await input.press('Enter');
    // Cache is unavailable by design here: export must degrade to a plain
    // network fetch (served by the fixture route) and still succeed.
    const out = await exportPdf(page, /Exported/);
    const [text] = await extractPages(out);
    for (const ch of 'नमस्ते') {
      expect(text, `extracted text must contain ${JSON.stringify(ch)}`).toContain(ch);
    }
  });
});
