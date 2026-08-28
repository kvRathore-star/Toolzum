import { createAuth } from "../../../src/lib/auth";

export async function onRequestGet(context: { request: Request; env: Record<string, unknown> }) {
  const { env } = context;

  const auth = createAuth({
    DB: (env as { DB: D1Database }).DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET as string,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY as string,
  });

  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;

    const DB = (env as { DB: D1Database }).DB;

    const monthlyUsage = await DB.prepare(
      `SELECT COUNT(DISTINCT toolSlug) as count FROM user_tool_usage WHERE userId = ? AND usedAt >= ?`
    )
      .bind(userId, thirtyDaysAgo)
      .first<{ count: number }>();

    const totalUsage = await DB.prepare(
      `SELECT COUNT(*) as count FROM user_tool_usage WHERE userId = ?`
    )
      .bind(userId)
      .first<{ count: number }>();

    const recentActivity = await DB.prepare(
      `SELECT toolSlug, toolName, category, usedAt FROM user_tool_usage WHERE userId = ? ORDER BY usedAt DESC LIMIT 10`
    )
      .bind(userId)
      .all<{
        toolSlug: string;
        toolName: string;
        category: string;
        usedAt: number;
      }>();

    const topTools = await DB.prepare(
      `SELECT toolSlug, toolName, category, COUNT(*) as uses FROM user_tool_usage WHERE userId = ? GROUP BY toolSlug ORDER BY uses DESC LIMIT 5`
    )
      .bind(userId)
      .all<{
        toolSlug: string;
        toolName: string;
        category: string;
        uses: number;
      }>();

    const dailyUsage = await DB.prepare(
      `SELECT (usedAt / 86400) as day, COUNT(*) as count FROM user_tool_usage WHERE userId = ? AND usedAt >= ? GROUP BY day ORDER BY day ASC`
    )
      .bind(userId, sevenDaysAgo)
      .all<{ day: number; count: number }>();

    const categoryBreakdown = await DB.prepare(
      `SELECT category, COUNT(*) as uses FROM user_tool_usage WHERE userId = ? AND category IS NOT NULL GROUP BY category ORDER BY uses DESC LIMIT 5`
    )
      .bind(userId)
      .all<{ category: string; uses: number }>();

    return new Response(
      JSON.stringify({
        monthlyToolsUsed: monthlyUsage?.count ?? 0,
        totalToolsUsed: totalUsage?.count ?? 0,
        recentActivity: recentActivity?.results ?? [],
        topTools: topTools?.results ?? [],
        dailyUsage: dailyUsage?.results ?? [],
        categoryBreakdown: categoryBreakdown?.results ?? [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
