"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Star, Trash2, ExternalLink, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getClientToolBySlug } from "@/registry/tools-client-index";
import { getCategoryTheme } from "@/lib/categoryTheme";
import toast from "react-hot-toast";

function categoryToSlug(category: string | null): string {
  if (!category) return "utility";
  if (category === "Growth & Marketing") return "growth-metrics";
  if (category === "Branding") return "marketing";
  return category.toLowerCase().replace(/\s+/g, "-");
}

interface FavoriteTool {
  toolSlug: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<FavoriteTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites/list");
      const data = await res.json() as FavoriteTool[];
      setFavorites(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadFavorites();
  }, [session, loadFavorites]);

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
        toast.success("Removed from favorites");
      }
    } finally {
      setRemovingSlug(null);
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
              Favorites
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-2">
            Your Favorite Tools
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Quick access to the tools you use most.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl">
            <Star className="w-12 h-12 text-[var(--text-muted)]/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No favorites yet</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-[300px] mx-auto">
              Click the star icon on any tool to save it here for quick access.
            </p>
            <Link
              href="/tools/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Browse Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favorites.map(({ toolSlug, createdAt }) => {
              const tool = getClientToolBySlug(toolSlug);
              if (!tool) return null;
              const theme = getCategoryTheme(tool.category);
              const Icon = theme.icon;
              return (
                <div
                  key={toolSlug}
                  className="flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg ${theme.bgTint} flex items-center justify-center shrink-0 ring-1 ring-[var(--border-subtle)]`}>
                    <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${categoryToSlug(tool.category)}/${tool.slug}`}
                      className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors block truncate"
                    >
                      {tool.name}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)] capitalize">{tool.category}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/${categoryToSlug(tool.category)}/${tool.slug}`}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-overlay)] rounded-lg transition-colors"
                      title="Open tool"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => removeFavorite(toolSlug)}
                      disabled={removingSlug === toolSlug}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from favorites"
                    >
                      {removingSlug === toolSlug ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
