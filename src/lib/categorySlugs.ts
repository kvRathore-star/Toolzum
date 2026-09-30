/**
 * Category → URL/asset path segment. One special case: "Growth & Marketing"
 * lives at `/growth-metrics/` (spaces and `&` are hostile in URLs and og: paths).
 * Mirrors the inline mapping in `src/app/sitemap.ts` and the `[category]` routes —
 * the OG generator and og:image metadata MUST agree or share cards 404
 * (found by scripts/verify-out.ts: 23 Growth & Marketing cards pointed at
 * og/growth-metrics/*.webp while the generator wrote og/growth & marketing/).
 */
export function categorySlug(category: string): string {
  if (category === "Growth & Marketing") return "growth-metrics";
  return category.toLowerCase().replace(/\s+/g, "-");
}
