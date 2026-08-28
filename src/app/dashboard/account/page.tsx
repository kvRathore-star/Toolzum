"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  CreditCard,
  Star,
  LogOut,
  Zap,
  Crown,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getClientToolBySlug } from "@/registry/tools-client-index";
import { getCategoryTheme } from "@/lib/categoryTheme";

interface FavoriteTool {
  toolSlug: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<FavoriteTool[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/favorites/list")
      .then((r) => r.json() as Promise<FavoriteTool[]>)
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setFavoritesLoading(false));
  }, [session]);

  const removeFavorite = async (slug: string) => {
    setRemovingSlug(slug);
    try {
      const res = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: slug }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.toolSlug !== slug));
      }
    } finally {
      setRemovingSlug(null);
    }
  };

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

  return (
    <div className="min-h-[90vh] bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[var(--border-subtle)] pb-8">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl mb-2">
              Account
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Your profile, plan, and favorite tools.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" asChild>
              <Link href="/dashboard">
                <Zap className="w-4 h-4 mr-2" /> Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-[var(--danger)] hover:text-white hover:bg-[var(--danger)]"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>

        {/* Profile & Plan Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">

          {/* Profile Card */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--accent)]" />
              Profile
            </h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-ink)]/10 flex items-center justify-center text-[var(--accent)] text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-xl font-semibold text-[var(--text-primary)]">
                    {user.name || "Unnamed User"}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {user.email}
                  </span>
                  {user.emailVerified ? (
                    <span className="text-[10px] font-semibold bg-[var(--success)]/10 text-[var(--success)] px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-[var(--warning)]/10 text-[var(--warning)] px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Plan & Credits Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)] flex flex-col">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[var(--warning)]" />
              Plan
            </h2>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-bold capitalize text-[var(--text-primary)]">
                  {plan}
                </span>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {plan === "free"
                    ? "100 AI credits per account"
                    : "Unlimited AI credits"}
                </p>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">
                    <Zap className="w-3.5 h-3.5 inline mr-1" />
                    Credits
                  </span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">
                    {credits}
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-overlay)] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[var(--accent-ink)] h-full transition-all duration-500"
                    style={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <Link
                href="/pricing"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-[var(--radius-md)] transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                {plan === "free" ? "Upgrade Plan" : "Manage Plan"}
              </Link>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-[family-name:var(--font-serif)] text-3xl text-[var(--text-primary)] flex items-center gap-3">
                <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                Favorite Tools
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {favorites.length === 0
                  ? "No favorites yet. Star tools to save them here."
                  : `${favorites.length} tool${favorites.length === 1 ? "" : "s"} saved`}
              </p>
            </div>
          </div>

          {favoritesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-16 text-center">
              <Star className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                You haven&apos;t saved any tools yet.
              </p>
              <Link
                href="/tools/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-[var(--radius-md)] transition-colors"
              >
                Browse Tools
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(({ toolSlug }) => {
                const tool = getClientToolBySlug(toolSlug);
                if (!tool) return null;
                const theme = getCategoryTheme(tool.category);
                const Icon = theme.icon;
                return (
                  <div
                    key={toolSlug}
                    className="group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-full ${theme.bgTint} flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                      </div>
                      <button
                        onClick={() => removeFavorite(toolSlug)}
                        disabled={removingSlug === toolSlug}
                        className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        {removingSlug === toolSlug ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Link
                      href={`/${tool.category.toLowerCase().replace(/\s+/g, "-")}/${tool.slug}`}
                      className="block"
                    >
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {tool.description}
                      </p>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
