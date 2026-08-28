import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  const { env } = context;

  const auth = createAuth({
    DB: env.DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY,
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

    // Tools used this month (unique tool slugs)
    const monthlyUsage = await env.DB.prepare(
      `SELECT COUNT(DISTINCT toolSlug) as count FROM user_tool_usage WHERE userId = ? AND usedAt >= ?`
    )
      .bind(userId, thirtyDaysAgo)
      .first<{ count: number }>();

    // Total lifetime usage
    const totalUsage = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM user_tool_usage WHERE userId = ?`
    )
      .bind(userId)
      .first<{ count: number }>();

    // Recent activity (last 10 tool uses)
    const recentActivity = await env.DB.prepare(
      `SELECT toolSlug, toolName, category, usedAt FROM user_tool_usage WHERE userId = ? ORDER BY usedAt DESC LIMIT 10`
    )
      .bind(userId)
      .all<{
        toolSlug: string;
        toolName: string;
        category: string;
        usedAt: number;
      }>();

    // Most used tools (top 5)
    const topTools = await env.DB.prepare(
      `SELECT toolSlug, toolName, category, COUNT(*) as uses FROM user_tool_usage WHERE userId = ? GROUP BY toolSlug ORDER BY uses DESC LIMIT 5`
    )
      .bind(userId)
      .all<{
        toolSlug: string;
        toolName: string;
        category: string;
        uses: number;
      }>();

    // Usage per day (last 7 days) for chart
    const dailyUsage = await env.DB.prepare(
      `SELECT (usedAt / 86400) as day, COUNT(*) as count FROM user_tool_usage WHERE userId = ? AND usedAt >= ? GROUP BY day ORDER BY day ASC`
    )
      .bind(userId, sevenDaysAgo)
      .all<{ day: number; count: number }>();

    // Category breakdown
    const categoryBreakdown = await env.DB.prepare(
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
};
