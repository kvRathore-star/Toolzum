import { getToolByCategoryAndSlug, toolsRegistry } from "@/registry/tools";
import { getCachedToolCounts } from "@/registry/tools-helpers";

export const contentType = 'image/svg+xml';
export const size = { width: 1200, height: 630 };

const { totalImplemented } = getCachedToolCounts();
const toolCount = totalImplemented;
const proCount = toolsRegistry.filter(t => t.isPro).length;

export async function generateStaticParams() {
  return toolsRegistry.map((tool) => ({
    category: tool.category.toLowerCase().replace(/\s+/g, '-'),
    tool: tool.slug,
  }));
}

export default async function Image(props: { params: Promise<{ category: string; tool: string }> }) {
  const params = await props.params;
  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);

  if (!toolMetadata) return new Response('Not Found', { status: 404 });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <linearGradient id="proGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#020617"/>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" opacity="0.04">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <circle cx="600" cy="315" r="300" fill="url(#brand)" opacity="0.08"/>
  ${toolMetadata.isPro ? `
  <g transform="translate(1090, 40)">
    <rect x="-68" y="-12" width="136" height="48" rx="24" fill="url(#proGrad)"/>
    <text x="0" y="14" fill="white" font-family="sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="0.5">PRO</text>
  </g>` : ''}
  <text x="600" y="240" fill="url(#brand)" font-family="sans-serif" font-size="80" font-weight="800" text-anchor="middle">${escapeXml(toolMetadata.name)}</text>
  <text x="600" y="320" fill="#94a3b8" font-family="sans-serif" font-size="28" text-anchor="middle" max-width="800">${escapeXml(toolMetadata.description)}</text>
  <line x1="64" y1="530" x2="1136" y2="530" stroke="#1e293b" stroke-width="1"/>
  <text x="64" y="570" fill="#f8fafc" font-family="sans-serif" font-size="24" font-weight="700">Toolzum</text>
  <text x="1136" y="570" fill="#38bdf8" font-family="sans-serif" font-size="20" text-anchor="end">${escapeXml(toolMetadata.category)}</text>
  <circle cx="1100" cy="562" r="3" fill="#475569"/>
  <text x="1084" y="570" fill="#64748b" font-family="sans-serif" font-size="18" text-anchor="end">${toolCount} Free Tools</text>
  <circle cx="1042" cy="562" r="3" fill="#475569"/>
  <text x="1026" y="570" fill="#64748b" font-family="sans-serif" font-size="18" text-anchor="end">${proCount} Pro</text>
</svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
