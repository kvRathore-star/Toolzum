"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoritesSignInModal } from "@/components/FavoritesSignInModal";

export function FavoriteStarButton({ slug }: { slug: string }) {
  const { favorites, toggleFavorite, isSignedIn } = useFavorites();
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
        className="p-1.5 rounded-full hover:bg-[var(--bg-surface)] transition-colors"
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={`w-4 h-4 transition-colors ${
            isFav
              ? "fill-amber-400 text-amber-400"
              : "text-[var(--text-muted)] hover:text-amber-400"
          }`}
        />
      </button>
      {showSignIn && <FavoritesSignInModal onClose={() => setShowSignIn(false)} />}
    </>
  );
}
