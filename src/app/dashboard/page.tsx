"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Zap,
  User,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Layers,
  Star,
} from "lucide-react";
import Link from "next/link";
import { getCategoryTheme } from "@/lib/categoryTheme";

interface ActivityItem {
  toolSlug: string;
  toolName: string;
  category: string | null;
  usedAt: number;
}

interface TopTool {
  toolSlug: string;
  toolName: string;
  category: string | null;
  uses: number;
}

interface DailyUsage {
  day: number;
  count: number;
}

interface CategoryBreakdown {
  category: string;
  uses: number;
}

interface ActivityData {
  monthlyToolsUsed: number;
  totalToolsUsed: number;
  recentActivity: ActivityItem[];
  topTools: TopTool[];
  dailyUsage: DailyUsage[];
  categoryBreakdown: CategoryBreakdown[];
}

function timeAgo(unix: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getCategoryIcon(category: string | null) {
  if (!category) return Layers;
  try {
    const theme = getCategoryTheme(category);
    return theme.icon;
  } catch {
    return Layers;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/user/activity");
      if (res.ok) {
        const data = (await res.json()) as ActivityData;
        setActivity(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchActivity();
  }, [session, fetchActivity]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const credits = (user as { credits?: number }).credits ?? 0;
  const plan = (user as { plan?: string }).plan || "free";
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-[90vh] bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
                Dashboard
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight">
              Welcome back, {firstName}.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild size="sm">
              <Link href="/dashboard/account">
                <User className="w-3.5 h-3.5 mr-1.5" /> Account
              </Link>
            </Button>
            <Button variant="secondary" asChild size="sm">
              <Link href="/pricing">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Upgrade
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-[var(--text-muted)] hover:text-[var(--danger)]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Credits */}
          <div className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--accent)]/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Credits
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold font-mono tracking-tight">
                {credits}
              </span>
              <span className="text-xs text-[var(--text-muted)]">remaining</span>
            </div>
            <div className="mt-3 w-full bg-[var(--bg-overlay)] rounded-full h-1">
              <div
                className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((credits / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Tools Used */}
          <div className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--success)]/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
              </div>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                This Month
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold font-mono tracking-tight">
                {loadingActivity ? "—" : activity?.monthlyToolsUsed ?? 0}
              </span>
              <span className="text-xs text-[var(--text-muted)]">tools used</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <BarChart3 className="w-3 h-3" />
              {loadingActivity
                ? "Loading..."
                : `${activity?.totalToolsUsed ?? 0} all time`}
            </div>
          </div>

          {/* Favorites */}
          <Link
            href="/dashboard/favorites"
            className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-amber-400/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Favorites
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-medium group-hover:text-amber-400 transition-colors">
                View saved tools
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <ArrowUpRight className="w-3 h-3" />
              Manage favorites
            </div>
          </Link>

          {/* Plan */}
          <div className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--warning)]/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-[var(--warning)]" />
              </div>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Plan
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold capitalize tracking-tight">
                {plan}
              </span>
            </div>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent)] hover:underline"
            >
              Manage subscription <ArrowUpRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Grid: Activity + Top Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <h2 className="text-sm font-medium">Recent Activity</h2>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Last 10 uses
                </span>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {loadingActivity ? (
                <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                  Loading activity...
                </div>
              ) : activity?.recentActivity?.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Activity className="w-8 h-8 text-[var(--text-muted)]/40 mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">
                    No activity yet
                  </p>
                  <p className="text-xs text-[var(--text-muted)]/60 mt-1">
                    Start using tools to see your history here
                  </p>
                </div>
              ) : (
                activity?.recentActivity?.map((item, i) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <Link
                      key={`${item.toolSlug}-${item.usedAt}-${i}`}
                      href={`/${item.category || "utility"}/${item.toolSlug}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-overlay)] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent)]/10 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                          {item.toolName}
                        </p>
                        {item.category && (
                          <p className="text-[10px] text-[var(--text-muted)] capitalize">
                            {item.category}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono flex-shrink-0">
                        {timeAgo(item.usedAt)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Tools */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <h2 className="text-sm font-medium">Most Used</h2>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {loadingActivity ? (
                <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                  Loading...
                </div>
              ) : activity?.topTools?.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    No tools used yet
                  </p>
                </div>
              ) : (
                activity?.topTools?.map((tool, i) => {
                  const Icon = getCategoryIcon(tool.category);
                  const maxUses = activity?.topTools?.[0]?.uses ?? 1;
                  return (
                    <Link
                      key={tool.toolSlug}
                      href={`/${tool.category || "utility"}/${tool.toolSlug}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-overlay)] transition-colors group"
                    >
                      <span className="text-[10px] font-mono text-[var(--text-muted)] w-4 text-right">
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {tool.toolName}
                        </p>
                        <div className="mt-1 w-full bg-[var(--bg-overlay)] rounded-full h-1">
                          <div
                            className="bg-[var(--accent)]/60 h-full rounded-full"
                            style={{
                              width: `${(tool.uses / maxUses) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono flex-shrink-0">
                        {tool.uses}x
                      </span>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Category Breakdown */}
            {activity?.categoryBreakdown &&
              activity.categoryBreakdown.length > 0 && (
                <>
                  <div className="px-5 py-3 border-t border-[var(--border-subtle)]">
                    <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.categoryBreakdown.map((cat) => (
                        <span
                          key={cat.category}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-overlay)] rounded text-[10px] text-[var(--text-muted)] capitalize"
                        >
                          {cat.category}
                          <span className="font-mono opacity-60">
                            {cat.uses}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
