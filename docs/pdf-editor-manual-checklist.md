# PDF editor — manual release checklist (the last gate)

**Rule:** the beta label comes off only when every row is ☑ **and** the owner signs below
(tracker: `docs/TODO-TRACKER.md` → release gates). A green e2e run is not approval.

| | |
|---|---|
| **Preview URL** | `___________________` (Cloudflare Pages preview of branch `preview/pdf-editor-manual` — fill in from the Pages dashboard / PR after push. **Phone cases run here, never on production.**) |
| **Fixtures** | `docs/fixtures/pdf-editor-manual/` — every file contains the literal word `SECRET` |
| **Text search** | `node scripts/pdf-find.mjs <file> SECRET` → per-page counts, exit 1 = absent. pdftotext equivalent: `pdftotext <file> - \| grep SECRET` |
| **Two-viewer rule** | Every exported PDF opens in **Preview or Acrobat** *and* **Chrome or Firefox** — viewers disagree on page boxes/rotation, so one viewer never counts. In each, Cmd+F `SECRET` must find nothing (after redaction). |
| **Outputs** | Export each case to a scratch folder (`~/tmp/pdf-manual/`); run the search helper on the file, then view it. |

## Checklist

| # | Case | Do | Verify | ☐ | Notes |
|---|------|----|--------|---|-------|
| 1 | Selective, box position | `secret-letter.pdf` → Redact → Selective → box over SECRET → export | `pdf-find` → `p1=0`; box lands **exactly** on the word, rest of line readable; page still 612×792 in both viewers | ☐ | |
| 2 | Maximum, burn + gate wording | Same file → Redact → Maximum → export; read the gate/toast wording on screen | `pdf-find` → `p1=0`; covered area is solid black **in both viewers**; what the toast promised matches what you see | ☐ | |
| 3 | Rotation 90° & 270° | `secret-rot90.pdf`, `secret-rot270.pdf` → selective over SECRET → export ×2 | `pdf-find` → 0 on both; orientation **unchanged** (90 stays 90) in both viewers; box on the word | ☐ | |
| 4 | Cropped page (origin ≠ 0) | `secret-cropped.pdf` (MediaBox 50,40 300×200) → selective → export | `pdf-find` → 0; page stays the **small box** — no white-margin regression | ☐ | |
| 5 | Pages 2 & 4 only | `secret-5pages.pdf` → redact SECRET on pages 2 and 4 → export | `pdf-find out.pdf SECRET` → **`p2=0, p4=0` and `p1=1, p3=1, p5=1`** (untouched pages byte-equivalent in both viewers) | ☐ | |
| 6 | Links & forms vs UI claim | `secret-links-forms.pdf` → selective export, then maximum export | Record actual behavior and confirm it matches what the UI/FAQ states (e2e says: selective keeps link + filled field `FORMDATA`, maximum drops both). `pdf-find` → 0 on both | ☐ | |
| 7 | Producer files (real Flate) | **Chrome:** `secret-from-chrome.pdf` ✓ exists. **Word:** open `secret-source.docx` in Word → Save As PDF → `secret-from-word.pdf`. **LibreOffice:** `secret-source.docx` → Export as PDF (or `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf --outdir …`). **Scan:** `secret-scan.pdf` ✓ exists | Redact SECRET in each produced PDF → `pdf-find` → 0 (proves the strip + verify gate on real producer streams, not just synthetic). **Scan has no text layer by design:** `pdf-find` → 0 *before* redaction too — verify visually that the box covers the printed word | ☐ | |
| 8 | Hindi round-trip (desktop) | `secret-hindi.pdf` → export **unredacted** first (annotate anything), then a fresh edit: redact `गुप्त`/SECRET line → export | Unredacted export: `pdf-find out.pdf गुप्त SECRET` → both found (no blank boxes). Redacted: → 0 | ☐ | |
| 9 | Tamil round-trip (desktop) | Same with `secret-tamil.pdf` / needle `ரகசிய` | Same as #8 | ☐ | |
| 10 | Hindi + Tamil on a real phone | Phone → **preview URL** → fresh/private profile → load a fixture (AirDrop/Files the Hindi + Tamil PDFs), export unredacted then redacted | Unredacted: native text renders **correctly on the phone screen** (no tofu □) and survives export (re-check with helper on Mac). Redacted: needle → 0. Repeat once in a **second fresh profile** | ☐ | |
| 11 | Interrupted flow — recovery | Edit `secret-letter.pdf`, add 2 annotations, wait for the Saved indicator, **close the tab mid-edit**, reopen (same browser) | Recovery offered, annotations + filename restored, nothing silently lost; record toast wording | ☐ | |
| 12 | Second tab | Same editor URL in a second tab; edit in tab A, then interact in tab B | Record what the app does/warns about concurrent tabs; note anything that loses work | ☐ | |
| 13 | Wording audit | Read **every** toast + FAQ line in the editor that claims something (export gate, "verified", autosave, fonts, privacy, limits) | Each claim backed by code/behavior — cross-check `docs/pdf-editor-claims.md`. **Any unbacked claim = FAIL** (list in Notes) | ☐ | |

## Sign-off

- Date: `____________`  Reviewer: `____________`
- Boxes passed: `___ / 13` — unresolved notes: `_______________________________`
- **Result:** ☐ PASS → owner pushes `main`, Cloudflare deploys, **beta label removed**
        ☐ FAIL → keep beta label, log gaps in the tracker, return to phase work
