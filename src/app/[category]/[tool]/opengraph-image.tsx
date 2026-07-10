import { ImageResponse } from 'next/og';
import { getToolByCategoryAndSlug, toolsRegistry } from "@/registry/tools";

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const toolCount = toolsRegistry.length;
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

  if (!toolMetadata) {
    return new Response('Not Found', { status: 404 });
  }

  const proBadge = toolMetadata.isPro ? (
    <div
      style={{
        position: 'absolute',
        top: 40,
        right: 40,
        background: 'linear-gradient(to right, #f59e0b, #d97706)',
        color: 'white',
        fontSize: 24,
        fontWeight: 700,
        padding: '12px 28px',
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      PRO
    </div>
  ) : null;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '64px',
          position: 'relative',
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
            borderRadius: '100%',
          }}
        />

        {proBadge}

        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            backgroundImage: 'linear-gradient(to right, #38bdf8, #818cf8)',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 1.1,
          }}
        >
          {toolMetadata.name}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.4,
            marginBottom: 16,
          }}
        >
          {toolMetadata.description}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 64,
            right: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#64748b',
            borderTop: '1px solid #1e293b',
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 26 }}>Toolzum</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ color: '#38bdf8' }}>{toolMetadata.category}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#475569' }} />
            <span>{toolCount} Free Tools</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#475569' }} />
            <span>{proCount} Pro</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
