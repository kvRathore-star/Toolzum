# Toolzum

Privacy-first toolbox with **1,147 tools** (1,065 interactive + 82 SEO landing pages) across **21 categories** — image, PDF, video, AI, developer, calculators, and more. All processing is client-side (nothing uploaded).

- **Stack**: Next.js 16 (static export), React 19, TypeScript (strict), Tailwind CSS
- **Deploy**: Cloudflare Pages auto-deploys from `main` (static export, ~2,565 pages)
- **Auth**: Better Auth with D1 database
- **Payments**: Razorpay + Dodo (Pro tier with credits)
- **Mobile**: PWA manifest + Capacitor (Android built, iOS not yet initialized)
- **Testing**: Vitest + Testing Library (155 test files); no E2E yet

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # generators + static export (~15 min for full build)
```

Local `npm run deploy` does not work on older macOS (workerd crashes) — just push; Cloudflare Pages handles the rest.

## Key Directories

| Path | Purpose |
|------|---------|
| `src/components/tools/modules/` | Individual tool implementations |
| `src/components/tools/modules/shared/` | Shared primitives (`CalculatorShell`, `CalcActions`, …) — see its README |
| `src/registry/tools-client-index.ts` | Client tool registry (1,065 entries) |
| `src/registry/tools-index.ts` | Server registry: 6 chunks + 82 SEO permutations = 1,147 |
| `src/lib/categoryTheme.ts` | Canonical per-category icon/color/theme (21 categories) |
| `src/app/[category]/[tool]/page.tsx` | Tool route: pre-renders every tool page |
| `functions/api/` | Cloudflare Pages Functions (auth, analytics, payments, …) |
| `scripts/` | Build-time generation (sitemap, OG images, registry index) |

## Architecture

- Tools lazy-load by slug through `DynamicModuleWrapper` (`next/dynamic`, `ssr: false`, skeleton + 15s timeout fallback); every module renders inside an `ErrorBoundary`.
- ~200 calculators share `CalculatorShell` (header, result panel with `aria-live`, copy/download/history). Computation must live inside `if (hasInput) { ... }`, not just the display.
- Heavy engines (FFmpeg, TensorFlow.js, Tesseract) load dynamically on first use, never eagerly.
- Accessibility: `jsx-a11y` interaction rules (`click-events-have-key-events`, `no-static-element-interactions`) are **errors** in CI; shared focus-trap (`useDialogA11y`) and keyboard-activation (`buttonKeyHandlers`) helpers live in `src/components/`.

## Notable Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Generators + production static export |
| `npm run lint` | ESLint (per-file locally; full repo times out on slow machines) |
| `npm run typecheck` | `tsc --noEmit --strict` (same timeout caveat) |
| `npm test` | Vitest suite |
| `npm run analyze` | Bundle analyzer (`ANALYZE=true`) |
| `npm run wasm:optimize` | Optimize WASM binaries for `ffmpeg.wasm` |

## Environment

Copy `.env.example` to `.env.local` and fill in the required variables. See `.env.example` for documentation of each variable.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
