# Energy (#47) — measure-first ledger

Device energy can't be measured from code (no Battery API worth trusting,
and device telemetry would violate the fingerprinting stance in
`cookies` §4). So: costs are **estimated from engine payloads**, and real
numbers come from the device lab (`docs/DEVICE-AUDIT.md` §E).

## Engine cost ledger (download + compute, Sep 2026)

| Engine | Payload | Per-run cost | Low-end handling |
|---|---|---|---|
| FFmpeg MT core | ~30MB WASM | multi-threaded transcode | single-thread fallback (`useFFmpeg`) |
| FFmpeg ST core | ~25MB WASM | single thread | default on low-end |
| Tesseract + 1 language | ~10–15MB | per-page OCR loop | heads-up toast (`PdfOcr`) |
| BlazeFace (TF.js) | ~1–2MB + TF.js runtime | per-image detect | heads-up (`BlurFace`); batch notice (`BulkFaceAnonymizer`) |
| MediaPipe selfie-multiclass | WASM + ~MB tflite | per-image segment | heads-up (`AiBgChanger`); chroma fallback, no model needed |
| Gemini cloud AI | 0 on-device | server-side (credits) | n/a — costs credits, not battery |

## Efficient defaults (already live, do not regress)

- `isLowEndDevice()` (≤4GB RAM, ≤4 cores, save-data, 2g/3g) gates
  warnings and fallbacks — **never blocks** (a slow tool beats no tool).
- `MemoryWatchdog` toasts once per session under 4GB.
- `BulkToolShell.heavyEngineNotice`: one-prop heads-up for batch tools.
- Cross-page model singletons (`modelPromise`, `segmenterPromise`) —
  one download per session, never per file.

## Measuring (lab protocol)

1. Reference device from `DEVICE-AUDIT.md` §E, airplane mode after load
   (isolates compute from radio).
2. 10 min video transcode vs 10 min text tools; record battery delta.
3. If video exceeds ~2× text drain, file the numbers below and propose
   the throttle (fewer threads, smaller batch, coarser model).

## Measurements log

| Date | Device | Workload | Drain | Notes |
|---|---|---|---|---|
| — | — | — | — | _No lab measurements yet — §E of the device audit._ |
