# Toolzum

Client-side utility toolbox with 260+ tools across image, PDF, video, audio, AI, developer, and Indian utilities. Every file operation runs in your browser — zero server uploads.

- **Stack**: Next.js (client-rendered), TypeScript, Tailwind CSS
- **Deploy**: Static export to Cloudflare Pages
- **Auth**: Better Auth with D1 database
- **Payments**: Stripe + Razorpay

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export + sitemap
```

## Notable Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build + sitemap |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run wasm:optimize` | Optimize WASM binaries for `ffmpeg.wasm` |

## Environment

Copy `.env.example` to `.env.local` and fill in the required variables. See `.env.example` for documentation of each variable.

## Key Directories

| Path | Purpose |
|------|---------|
| `src/components/tools/modules/` | Individual tool implementations (~270 files) |
| `src/registry/tools.ts` | Central tool registry with metadata |
| `src/app/api/` | Next.js API Routes (analytics, downloads, payments) |
| `scripts/` | Build-time generation (sitemap, registry) |

## Architecture

- All tool processing is client-side using `pdf-lib`, `pdfjs-dist`, `jsPDF`, `ffmpeg.wasm`, `sharp` (WASM), and other browser-compatible libraries.
- Tools are lazy-loaded via Next.js `dynamic()` imports.
- SEO content is generated per-tool using category-aware templates with structured data (FAQPage, SoftwareApplication schemas).
