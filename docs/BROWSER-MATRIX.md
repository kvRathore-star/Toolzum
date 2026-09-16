# Browser Matrix (#31)

Deliberate premise: the site ships **without** cross-origin isolation
(no COOP/COEP — Turnstile, payments, and embed flows forbid it), so
`crossOriginIsolated === false` and `SharedArrayBuffer === undefined`
on **every** engine. All WASM runs single-threaded paths; `useFFmpeg`
gates MT cores on `crossOriginIsolated` and never downloads what can't
run. CI pins this baseline (`e2e/compat-wasm.spec.ts` on
chromium + firefox + webkit).

## Automated (CI, ubuntu)

| Capability | Chromium | Firefox | WebKit | Gate |
|---|---|---|---|---|
| No-COI baseline (`crossOriginIsolated false`, no SAB) | ✓ | ✓ | ✓ | compat-wasm spec |
| Local tool executes (word counter) | ✓ | ✓ | ✓ | compat-wasm spec |
| Offline fallback reachable | ✓ | ✓ | ✓ | compat-wasm spec |
| Critical path (EMI, palette) | ✓ | ✓* | ✓* | critical-path spec |

*Firefox/WebKit projects run only in CI (`localOnly` chromium default —
Playwright browsers don't install on macOS 12).

## Manual (device lab — same rig as DEVICE-AUDIT.md)

| Capability | Chrome Android | Safari iOS | Firefox Android | Notes |
|---|---|---|---|---|
| FFmpeg ST transcode (25MB core) | verify | verify | verify | Watch IDB quota prompts on iOS |
| Tesseract OCR (~15MB) | verify | verify | — | Low-end heads-up expected |
| MediaPipe segment (GPU delegate) | verify | verify fallback | verify fallback | WebGPU absent → must degrade to chroma/heuristic, never hang |
| BlazeFace batch | verify | verify | verify | Worst-case battery row for ENERGY.md |
| PWA install + standalone | verify | Add-to-Home-Screen | verify | iOS: no mini-infobar, splash via apple-touch-icon |
| `100dvh`, safe-area, 44px targets | verify | verify | spot | DEVICE-AUDIT §D |

## Known quirks (do not "fix" without updating this table)

- Safari private mode: IDB may throw on open — every IDB helper
  resolves `null` and the app falls back (localStorage / re-download).
- Firefox ETP Strict can block `unpkg.com`/`jsdelivr` fetches: the
  multi-CDN fallback list (`useFFmpeg` + CSP allowlist) exists for this.
- Turnstile challenge inside `webkit` automation may need real
  interaction — auth-flow spec stays chromium-gated if flaky; note it
  here instead of weakening the spec: ___________________________.
