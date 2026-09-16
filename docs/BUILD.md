# Build Performance (#15)

Measured Sep 16 2026 (4-core Mac; CI ubuntu is faster — treat these as
upper bounds, not targets).

## Phase timings (full `npm run build`, 2,563 pages)

| Phase | Time | Notes |
|---|---|---|
| gen:redirects / site-data / download-slugs | ~7s total | Already parallel (`gen:parallel` + `wait`) |
| gen:og (incremental) | ~11s (4.4s render) | Hash-skip via `og-cache.json`; full regen only on template bump |
| Turbopack production compile | ~5.5 min | Hardware-bound; code-split via dynamic imports throughout |
| Static generation (2,563 pages) | ~11 min, 3 workers | Already at hardware parallelism (4 cores → 3 workers; Next default caps at 8) |
| gen-sw | seconds | 761 files precached |

## Why there is little left to take

- Workers already scale with CPUs (`staticGenerationMaxConcurrency`
  default 8; observed 3 on 4 cores). Oversubscribing CPU-bound React
  rendering does not help.
- Caches already layered: `.next/cache` in CI, committed OG images +
  `og-cache.json` (incremental skip), SW precache manifest.
- Gen steps total <15s incremental; only a template bump forces full OG
  regen (~8+ min at ~500ms/render — batch template changes).

## Remaining levers (all hardware or scope, none free)

1. Faster CI runners (more vCPUs → more static workers, near-linear).
2. Fewer rendered pages (SEO tradeoff — rejected; pages are the product).
3. Turbopack upgrades via `next` minor bumps (ride Dependabot).

## Hygiene rule

`gen:*` scripts must stay incremental and must not dirty the tree on a
no-op run. Counter-examples fixed during measurement: `gen:og` re-emits
byte-different webp/pngs and prunes orphans; `gen:download-slugs`
rewrites its output file. Always `git status` after a local build and
restore unintended churn before committing.
