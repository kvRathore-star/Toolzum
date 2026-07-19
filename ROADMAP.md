# Toolzum Roadmap

## Completed

### Cross-Category Deduplication & Consolidation (Jul 2026)
Full sitewide audit of all 13 tool categories for duplicate/superset/overlapping tools.
- **Group 1 batch merge** (~23 cross-category redirects): Same-component multi-tab slugs consolidated (CPM/RPM, Markdown cluster). Cross-category duplicates redirected to canonical (NPS, password generator, UUID, diff checker, hash, binary, currency, water intake, heart rate, pregnancy, fraction, SVG, KB image compressor, profit, CSS gradient, percentage change).
- **3 verification merges**: Ideal Weight Calc, Calorie Intake Calc, Ovulation Tracker (custom cycle length ported into Health's tracker).
- **Superset redirects**: Days Between Dates → Date Difference Calculator, Days Until → Time Until Calculator.
- **VideoToGif consolidation**: mp4-to-gif + webm-to-gif → video-to-gif.
- **Component cross-reference labels**: Steps/StepsToCalories, LTV/CustomerLTV, BurnRate/Runway.
- **~50 entries removed** from registry, 8 dead function exports removed from MiscellaneousTools1.tsx.
- **~45 TOOL_REDIRECTS** established in tools.ts + `_redirects` for Cloudflare Pages.

### Previous
- Sitemap generation script
- OG image generation
- Standard deployment flow (Cloudflare Pages auto-deploy from `main`)

## In Progress
- Sitemap regeneration (fresh: 864 URLs, post-dedup)
- Search Console submission & indexing verification

## Pending
- Manual indexing request via Google Search Console (no credentials available in agent)
- Re-verify live pages post-deployment before submitting

### Fake/stub implementation sweep
Two fake tools were found and retired (QR Code Generator — produced unscannable images; ZIP Simulator — showed fabricated "~30% reduction" with `Math.round(total * 0.7)` and no actual compression). Pattern suggests there may be more. Check every tool that:
- Uses suspiciously simple placeholder math (hardcoded multipliers like `* 0.7`, random sample data instead of real computation)
- Is labeled "simulator" or "preview" without producing real output
- Shows a single hardcoded sample instead of processing user input
- Uses `CompressionStream` or JSZip for output bundling but doesn't actually perform the advertised operation

Confirmed stubs found so far:
1. QR Code Generator — unscannable images (retired)
2. ZIP Simulator — `Math.round(total * 0.7)` (retired)
3. → Parquet in DataToolkit — static "try Python/DuckDB" message, no file processing (retired)
4. → Excel (.xls) format-deception — CSV and JSON tabs labeled "→ Excel" generated malformed .xls files, relabeled to honest descriptions and redirected to real `xlsx-csv-converter` (retired)
5. Data Converters group (DataToolkit) — 5 buggy hand-rolled parsers: JSON→XML (no escaping → malformed XML), JSON→TOML (silently mistypes booleans), YAML→JSON (fails on arrays). Worse than visible stubs — produces plausible-looking incorrect output. Replaced with LinkCards to correct standalone versions. (retired)

Relevant grep targets: `* 0.7`, `Math.round(*`, `'sample'`, fake/stub data patterns across all module files. Hand-rolled XML escaping, manual TOML/YAML parsers in composite widget files.
