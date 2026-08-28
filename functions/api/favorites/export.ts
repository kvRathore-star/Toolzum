import { getClientToolBySlug } from "../../../src/registry/tools-client-index";

interface Env {
  DB: D1Database;
}

async function getUserId(request: Request, DB: D1Database): Promise<string | null> {
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return null;
  const user = await DB.prepare(
    "SELECT s.userId FROM session s WHERE s.token = ? AND s.expiresAt > unixepoch()"
  ).bind(token).first<{ userId: string }>();
  return user?.userId || null;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const userId = await getUserId(context.request, DB);
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rows = await DB.prepare(
      "SELECT toolSlug, createdAt FROM user_favorite WHERE userId = ? ORDER BY createdAt DESC"
    ).bind(userId).all<{ toolSlug: string; createdAt: number }>();

    const favorites = rows.results.map((row) => {
      const tool = getClientToolBySlug(row.toolSlug);
      return {
        slug: row.toolSlug,
        name: tool?.name || row.toolSlug,
        category: tool?.category || "Unknown",
        url: tool ? `https://toolzum.com/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}` : `https://toolzum.com/tools/${row.toolSlug}`,
        addedAt: new Date(row.createdAt).toISOString(),
      };
    });

    const url = new URL(context.request.url);
    const format = url.searchParams.get('format');

    if (format === 'csv') {
      const header = "Name,Category,URL,Added At\n";
      const csv = favorites.map((f) =>
        `"${f.name}","${f.category}","${f.url}","${f.addedAt}"`
      ).join("\n");
      return new Response(header + csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="toolzum-favorites.csv"',
        },
      });
    }

    return new Response(JSON.stringify(favorites, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="toolzum-favorites.json"',
      },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
