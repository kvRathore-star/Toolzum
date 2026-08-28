"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoritesSignInModal } from "@/components/FavoritesSignInModal";

export function FavoriteStarButton({ slug }: { slug: string }) {
  const { favorites, toggleFavorite, isSignedIn, isLoading } = useFavorites();
  const [showSignIn, setShowSignIn] = useState(false);
  const isFav = favorites.has(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      setShowSignIn(true);
      return;
    }
    toggleFavorite(slug);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={`w-3.5 h-3.5 transition-colors ${
            isFav
              ? "fill-amber-400 text-amber-400"
              : "text-[var(--text-muted)] group-hover:text-amber-400"
          }`}
        />
        Fav
      </button>
      {showSignIn && <FavoritesSignInModal onClose={() => setShowSignIn(false)} />}
    </>
  );
}
