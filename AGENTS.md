<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

**Toolzum.com** — privacy-first PWA with **1,149 routed tool pages** (1,067 in category listings + 82 SEO landing pages) across 21 categories. All processing is client-side (nothing uploaded). Built with Next.js 16, React 19, Capacitor (Android), Cloudflare Pages + D1.

### Key Architecture

- **Tool registry:** `src/registry/tools-client-index.ts` (1,149 tools), `src/lib/categoryTheme.ts` (icon/color per category)
- **Shared shell:** `src/components/tools/modules/shared/CalculatorShell.tsx` — wraps ~90+ calculators with consistent header, result panel, copy/download/history
- **Dynamic loading:** `src/components/tools/modules/DynamicModuleWrapper.tsx` — lazy-loads tool modules by slug
- **Route pattern:** `src/app/[category]/[tool]/page.tsx` — tools live at `/{category}/{tool-slug}/`

### Build & Deploy

**Standard flow — Cloudflare Pages auto-deploys from GitHub:**

1. `npm run build` (generates OG images, sitemap, static export — ~15min for 2,565 pages)
2. `git push origin main`
3. Cloudflare Pages auto-deploys from `main`

**macOS 12.6 workaround (local testing only):**

Local `npm run deploy` fails — workerd binary crashes on macOS 12.6.
If you need to test locally, follow the old opennextjs-cloudflare flow (see git history).
Otherwise, just push — Cloudflare Pages handles the rest.

### Testing & Linting

- **Lint:** `npx eslint <file>` (per-file; full-codebase times out)
- **Typecheck:** `npx tsc --noEmit` (full-codebase times out)
- **Test:** `npm test` (Vitest)
- **CI:** GitHub Actions — lint → typecheck → test → build; npm audit blocks at critical; eslint-plugin-jsx-a11y as regression gate

### Conventions

- **Input styling:** Use `inputCls` and `labelCls` from `src/components/tools/modules/Calculators.shared`
- **Auto-calculate:** `auto` prop for simple single-formula calculators; explicit button for heavy computation, interdependent fields, or destructive operations
- **Guard pattern:** Computation must be inside `if (hasInput) { ... }`, NOT just the display. Inline division in template literals executes even in untaken ternary branches.
- **CSS vars:** Use `var(--accent)`, `var(--bg-surface)`, `var(--text-primary)` etc. — not hardcoded Tailwind colors
- **Category icons:** Defined in `src/lib/categoryTheme.ts` (canonical). Megamenu icons in `src/registry/megamenu-icons.ts` must match.
