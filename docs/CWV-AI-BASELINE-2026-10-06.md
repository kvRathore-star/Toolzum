# CWV + AI-Citation Baseline (Oct 6, 2026)

## CWV — what was actually measured

Lab (Lighthouse) and field (CrUX) numbers are NOT available from here:
no browsers installed, PSI API 429 without key. What follows is measured,
not estimated.

### Server-side (curl, production, mobile UA, gzip) — Oct 6

| URL | HTTP | TTFB | Total | HTML bytes |
|---|---|---|---|---|
| / | 200 | 0.96s | 0.99s | 28,395 |
| /pdf/ | 200 | 0.90s | 0.96s | 46,577 |
| /image/ | 200 | 0.74s | 0.80s | 35,539 |
| /indian-utilities/gst-invoice-generator/ | 200 | 0.71s | 0.77s | 23,814 |
| /calculator/percentage-calculator/ | 200 | 1.27s | 1.28s | 25,226 |

HTML payloads are small (24–47 KB compressed). TTFB 0.7–1.3s from this
machine is the weak signal — expected far lower from a static CDN edge;
re-measure from the target region (India) before concluding.

### Static audit (code-verified Oct 6)

- Fonts: next/font/google self-hosted (Geist) — no render-blocking font CDN.
- Third-party: no gtag/hotjar/clarity/intercom in layout (zero blocking scripts found).
- Images: next/image in 17 spots; raw `<img>` limited to user-content previews (data/blob URLs) with lazy + dimensions — no LCP/CLS bombs in shell.
- Caching: immutable on `_next/static` + 30d on `/og/`. gzip on HTML confirmed live.
- JS weight: registry split landed (Homepage −567 KB, tool pages −734 KB per tracker); tool modules lazy via DynamicModuleWrapper.
- INP risk: FFmpeg/Tesseract WASM tools are CPU-heavy by nature — sequential + tab-open guidance already in how-to copy.

### Still needed (owner or CI)

- Lab: run Lighthouse mobile on home + 1 hub + 1 tool (any machine with Chrome).
- Field: PSI with API key, or CrUX after traffic returns; record LCP/INP/CLS here.
- Re-check TTFB from India (target audience) — current numbers are one network path.

## AI-citation watch — tracking sheet (baseline: UNMEASURED)

Procedure (monthly, ~20 min): ask each query verbatim in ChatGPT, Perplexity,
Gemini (signed-out default region); record cited-toolzum.com-or-not + URL.

| # | Query | ChatGPT | Perplexity | Gemini |
|---|---|---|---|---|
| 1 | best free pdf editor without signup | – | – | – |
| 2 | how to merge pdfs in order | – | – | – |
| 3 | how to compress jpg without losing quality | – | – | – |
| 4 | mp3 vs flac which is better | – | – | – |
| 5 | how is emi calculated | – | – | – |
| 6 | what goes on a gst invoice | – | – | – |
| 7 | how to mask aadhaar number | – | – | – |
| 8 | how to calculate mrr with example | – | – | – |
| 9 | is it safe to paste jwt into online decoder | – | – | – |
| 10 | srt vs vtt subtitles | – | – | – |
| 11 | what contrast ratio passes wcag | – | – | – |
| 12 | how long should a meta description be | – | – | – |

Target: cited on 10/12 by Q1. These mirror hub FAQ answers — the loop is
measurable once run.
