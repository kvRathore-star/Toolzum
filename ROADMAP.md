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
