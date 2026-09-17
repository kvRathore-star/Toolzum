# Desktop Mac App (BYOK) — Discussion Doc

Status: **exploring** — no build started. Revisit in detail before scoping a sprint.
Created: Sep 12 2026.

## The proposal

A macOS desktop build of Toolzum sold as a **lifetime deal**, where AI features
run on the user's **own API key** (BYOK — bring your own key). Web app stays
subscription-based as the managed path.

- **Web subscription** = managed: we hold the keys, zero setup.
- **Desktop lifetime** = sovereign: your keys, your machine, your data.

## Why it fits this product

- ~1,026 of 1,145 tools already run 100% client-side; a desktop shell mostly
  repackages the static export (precedent: Capacitor on Android).
- BYOK zeroes the scariest cost lines (transcription $0.19/use, images
  $0.039/image move to user billing). The 1M-user-burn scenario can't happen.
- Strengthens the privacy brand: keys never leave the device.

## Recommended shape (if approved)

- **Tauri over Electron**: ~15MB binary, Rust core, harder to tamper with
  than an Electron asar — matters because license checks live client-side.
- **Direct sale** (Lemon Squeezy / Gumroad, ~5%) over App Store exclusivity
  (30% cut on a price you can never raise). Store listing for discovery only.
- **Lifetime scoped to major versions** ("v1 lifetime") — model deprecations
  (e.g. Gemini Oct 2026 rotations) force updates; unscoped lifetime means
  supporting 2026 buyers in 2029 for free.
- **First-run key wizard**: link to AI Studio → paste → test call → OS
  keychain. Non-negotiable — "invalid API key" becomes support ticket #1
  without it.

## Accepted realities

- License enforcement is honor-system (Sublime-text model: fair price, honest
  users, don't fight pirates). Batch ZIP / Pro features live client-side and
  are trivially unlockable locally.
- BYOK adds user friction (Cloud project + billing to get a key) — the web
  subscription remains the low-friction path for casuals.
- Apple Developer account ($99/yr), notarization, and an updater
  (Sparkle / Tauri updater) are baseline costs.

## Open questions for the detailed discussion

1. Price point for v1 lifetime (and upgrade pricing v1 → v2)?
2. Direct-only vs also-on-App-Store?
3. Which AI features ship in v1 desktop (parity with web, or curated subset)?
4. Support budget for key-management tickets — docs + wizard enough?
5. Sync story: do desktop and web accounts share anything (favorites, history)?
6. Timing relative to the 96-track (ACTION-PLAN.md) — before or after Phase 2?

---

## 1. Senior build plan (added Sep 13 2026 — no code yet)

Principles from shipping Mac apps: smallest native surface, web does the UI,
Rust does secrets/files/updates, Apple does trust. No custom server except a
tiny license endpoint.

### 1.1 Goals / non-goals for v1

Goals:
- Offline-first for all 1,000+ client-side tools. No account required to open app.
- Unlimited local file sizes (2GB video, 500-image batch) — the #1 web-to-desktop upsell.
- BYOK for Gemini text + transcription + Gemini image. Zero Toolzum API spend.
- True background clipboard history via NSPasteboard (desktop-only flagship).
- Paid gate only on: batch/ZIP, folder automation (v1.1 if risky), BYOK AI panel.

Non-goals v1:
- No web-account sync (favorites/history stay local JSON). Avoids auth + merge bugs.
- No Windows/Linux. No App Store IAP. No team seats. No auto-folder monitoring if it threatens review/stability — push to v1.1.

### 1.2 Architecture (Tauri 2.x)

```
web-frontend (reuse Next static export, frozen per release)
  -> Tauri window (WKWebView)
  -> Rust core: fs + dialog + updater + clipboard + keychain + license-check
  -> OS: Keychain / NSPasteboard / ~/Library/Application Support/Toolzum/
```

- Pin `tauri = 2.x`, `@tauri-apps/plugin-updater`, `dialog`, `fs`, `process`.
- Frontend is read-only bundle: `dist-desktop/` copied at build time. No remote URL load (CSP + notarization safe).
- Capabilities (`capabilities/default.json`): allowlist only `fs:read/write $APPDATA + $DOWNLOAD + user-picked via dialog`, `dialog:open`, `updater:check/install`. Everything else denied.
- Sidecars: none in v1. FFmpeg/WASM already in web bundle — reuse. If native FFmpeg needed later, add as signed sidecar in v1.1.
- Bundle ID: `com.toolzum.desktop`. Min target: macOS 13 Ventura (covers Apple Silicon + Intel still in use, avoids macOS 12 WebKit quirks). Arch: universal (aarch64 + x86_64).

### 1.3 macOS hardening / distribution

- Hardened Runtime + `com.apple.security.cs.allow-unsigned-executable-memory` only if WASM JIT needs it — test first, prefer without.
- Notarize: `apple-developer $99/yr` → `tauri sign` → `notarytool submit --wait` → `stapler staple` → DMG with Applications symlink + icon.
- DMG layout: `/Applications` drag target, background PNG, volume name `Toolzum`.
- Direct-only v1. App Store listing later for discovery only (separate bundle + receipt validation, not a fork of licensing logic).

### 1.4 BYOK + secrets (the support-burn area)

- Store keys in Keychain via `keyring` crate (service `com.toolzum.desktop`, account `gemini|openai|anthropic`). Never `localStorage`, never JSON on disk.
- First-run wizard (blocking for AI features, skippable for offline tools):
  1. Choose provider → 2. Link to AI Studio key page → 3. Paste (validate `AIza...` shape client-side) → 4. Test call: `models/list` or 1-token generate, 10s timeout → 5. Save to Keychain → 6. Show quota note: "billing is yours, Toolzum sees $0."
- Failure copy must name the fix: `Invalid key — create one at aistudio.google.com/apikey, enable billing, paste again.` Log only `key_valid=false`, never the key.
- Rotate/revoke UI in Settings. One toggle: `Use system proxy` off by default.

### 1.5 Licensing v1 (honor-system + friction)

- Provider: Lemon Squeezy variant per tier (keeps 100-code logic simple). License key = `TZM1-XXXX-XXXX`.
- Tiny license endpoint: `POST /license/activate {key, hwid}`, `POST /license/ping`, `POST /license/deactivate`. HWID = SHA256(machine-uuid + bundle-id), stored hashed. No PII.
- Rules: **2 Macs per key**, 30-day offline grace (signed activation JWT with expiry, refreshed on ping), self-deactivate in-app. Fail-open offline inside grace, fail-closed after.
- Abuse: per-IP rate limit on activate/ping, flag keys with >5 distinct HWIDs/week for manual review, revoke keys posted publicly. No kernel DRM, no constant phoning home.
- Refunds: 14-day, via Lemon. Refund auto-revokes key.

### 1.6 Pricing ladder execution ($39 → $69 → $99)

- $39 = first 100 coupon codes (`TZM-EARLY-001..100`, single-use, expiring). Counter on site is manual but must be true — update `sold/100` on each sale.
- Then $69 (cap ~500), then $99 permanent v1 price. Math: 100×$39=$3,900 net ~$3,700 direct; covers dev account + notarization time before volume.
- v1 lifetime = all v1.x. v2 = paid upgrade ($29 early / $49 regular), never free. State this on checkout or chargeback risk rises.
- Keep web Pro $9.99/mo untouched. Desktop checkout copy: `One-time. Your API costs. Your machine.`

### 1.7 Clipboard (web vs desktop split)

- Web (already planned): manual session workspace only — `navigator.clipboard.readText()` on user gesture, stacked list + AI summarize. Banner: `Browsers can't run in background — get Desktop for automatic history.`
- Desktop v1: polling `NSPasteboard::changeCount` (1s, pause when window hidden to save battery) + global hotkey `Cmd+Shift+V` via Tauri global-shortcut plugin. History in SQLite (`clipboard.db`, FTS5), 30-day retention default, exclude password-manager UTIs (`org.nspasteboard.password`), Clear All + Pause buttons for trust. No cloud sync.

### 1.8 Files / performance

- Drag-drop via dialog + web drop handler. Stream large files — never load 2GB video fully into RAM; pass file path to Rust for chunked read where possible.
- Batch queue: concurrency 4 (matches Pro 6-thread web ceiling conservatively for thermals), progress + cancel + `reveal in Finder`.
- Storage: `~/Library/Application Support/Toolzum/{history.json,clipboard.db,settings.json}`. Cap history at 5,000 rows, vacuum monthly.

### 1.9 Updates

- Tauri updater v2 with Ed25519 signature. Feed: static JSON on toolzum.com (`/desktop/latest.json`). Staged: 10% → 50% → 100% via two feed channels (`latest.json` + `latest-beta.json` for early 100).
- Silent check on launch + manual `Check for updates`. Show changelog modal. Never auto-restart mid-batch.

### 1.10 Privacy / telemetry (minimal or it kills the brand)

- Default: zero telemetry. Optional opt-in crash reports (Sentry, scrub paths). No key, clipboard content, or filenames ever leave device. State this on the paywall — it converts.

### 1.11 QA matrix before any TestFlight/DMG to early 100

- Machines: M1 Air (13), M2/M3, 1× Intel if available. OS: 13, 14, 15.
- Cases: fresh install offline, wizard invalid/valid key, 2GB file open, 500-image batch cancel, clipboard 200-item soak, updater 1.0→1.1, license 3rd-Mac blocked + deactivate/reactivate, refund revocation.
- Perf bar: cold start <1.2s M-silicon, idle CPU 0%, clipboard poll no wake-ups in Console.

### 1.12 Support runbook (expect 80% BYOK tickets)

- Pre-write: `Invalid API key`, `Billing not enabled`, `Transcription 50MB web vs 2GB desktop confusion`, `Move license to new Mac`, `Refund in 14 days`.
- In-app `Copy diagnostics` button: version, OS, key_valid true/false, last updater error — no secrets. This alone halves back-and-forth.

### 1.13 Phased rollout

- P0 spike (1 day, throwaway): `tauri init` + load current `out/` build, prove DMG + notarization path works on this repo.
- P1 v1.0: offline tools + 2-device license + updater + wizard + clipboard history.
- P1.1: folder automation + batch presets (only if P1 stable).
- P2: App Store discovery listing (if direct traction proves demand).

### 1.14 Metrics to watch (local-first)

- Activation success %, wizard drop-off step, 3rd-device block rate, refund rate, updater adoption in 7 days. No funnel without these.

(End of detailed plan — original sections above unchanged.)
