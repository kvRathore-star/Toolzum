# Phase 3 — CSV Category Migration Checklist

Migrate the `csv-output` converter category (7 slugs) into MODULE_REGISTRY
closure wrappers, per the Phase 2 decisions.

Slugs: `csv-to-markdown`, `csv-to-ndjson`, `csv-to-sql`, `csv-html-table-converter`,
`csv-statistics`, `csv-data-cleaner`, `csv-formatter`. Verified clean: none are
redirect sources or targets, so no TOOL_REDIRECTS interaction.

## Checklist

1. **Update the smoke test parser BEFORE adding registry entries.**
   `ENTRY_RE` in `src/__tests__/registry-render-smoke.test.ts` and
   `src/__tests__/registry-integrity.test.ts` (and `scripts/gen-route-baseline.js`)
   only recognize `dynamic(...) ..., { ssr: false }` entries. CSV closures must
   **omit `ssr: false`** to preserve SSR (converters are currently server-rendered;
   `ssr: false` would swap their HTML for the loading fallback and strip SEO content).
   If the parser is not extended first, the new entries will be **silently skipped**
   by the smoke test — a coverage gap that looks like a passing test. Update the
   regex to accept entries with and without `ssr: false` before adding any closures,
   and assert the expected count.

2. **Use the parity-proven closure pattern.** Wrap each slug as:
   `dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-to-markdown" description="..." /> })))`
   — must forward **both** `slug` and `description` (ConverterRouter does; the
   registry render path passes no props). `converter-closure-parity.test.ts` guards
   this byte-for-byte.

3. **Remove the 7 slugs from CONVERTER_CONFIG** after the registry entries are in
   (registry-integrity #9 asserts no slug is routed by both).

4. **Bundle measurement.** Run a real `next build` bundle comparison before/after
   (chunk count + per-route sizes). ConverterRouter currently statically imports
   all 19 hubs; the migration should shrink per-route JS. Do not carry "no
   regression" as an assumption — measure it.

## Open decision (must be made before Phase 4 removes ConverterRouter)

**Lossy redirects.** `yaml-to-toon`, `toon-to-json`, `toon-to-yaml` redirect to
`json-toon-converter`, which renders the *json*-to-toon default mode — a user
landing on `yaml-to-toon` gets JSON→Toon, not YAML→Toon. Same class of mismatch for
`json-to-csv`/`csv-to-json`/`json-to-xml`/`csv-to-xml` → `data-format-converter`
(defaults to JSON→CSV).

Design B: remove those 7 TOOL_REDIRECTS entries and route each pair to its own page
(`DataConverter` / `ToonConverter` already support every pair via slug). Eliminates
the lossiness and the redirect hop. Do not let the redirects become permanent.
