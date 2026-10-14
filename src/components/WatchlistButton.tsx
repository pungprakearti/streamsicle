"use client";

import { toggleWatchlist } from "@/actions/watchlist";
import { BookmarkSimple, Check, CircleNotch } from "@phosphor-icons/react";
import { X } from "@phosphor-icons/react";
import { useState, useOptimistic, useTransition } from "react";

type Props = {
  titleId: string;
  isOnList: boolean;
  variant?: "poster" | "inline";
};

export function WatchlistButton({ titleId, isOnList, variant = "poster" }: Props) {
  const [optimisticOnList, setOptimisticOnList] = useOptimistic(isOnList);
  const [isPending, startTransition] = useTransition();
  const [hovered, setHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticOnList(!optimisticOnList);
      await toggleWatchlist(titleId);
    });
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <input type="hidden" name="titleId" value={titleId} />
        <button
          type="submit"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={isPending}
          className="btn btn-secondary transition-all duration-150"
          style={optimisticOnList && hovered && !isPending ? { borderColor: "var(--color-danger, #e53e3e)", color: "var(--color-danger, #e53e3e)" } : undefined}
        >
          {isPending ? (
            <>
              <CircleNotch size={18} weight="bold" className="animate-spin" style={{ color: "var(--color-accent)" }} />
              Saving...
            </>
          ) : optimisticOnList && hovered ? (
            <>
              <X size={18} weight="bold" />
              Remove
            </>
          ) : optimisticOnList ? (
            <>
              <Check size={18} weight="duotone" style={{ color: "var(--color-accent)" }} />
              On your watchlist
            </>
          ) : (
            <>
              <BookmarkSimple size={18} weight="duotone" />
              Add to watchlist
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="titleId" value={titleId} />
      <button
        type="submit"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={isPending}
        aria-label={optimisticOnList ? "Remove from watchlist" : "Add to watchlist"}
        title={optimisticOnList ? "Remove from watchlist" : "Add to watchlist"}
        className="absolute top-1.5 right-1.5 z-[2] w-9 h-9 border-0 rounded-xl cursor-pointer grid place-items-center transition-all duration-150"
        style={{
          background: isPending
            ? "color-mix(in srgb, var(--color-accent) 60%, transparent)"
            : optimisticOnList
              ? hovered ? "var(--color-danger, #e53e3e)" : "var(--color-accent)"
              : hovered ? "var(--color-accent)" : "color-mix(in srgb, var(--color-bg) 82%, transparent)",
          color: (isPending || optimisticOnList || hovered) ? "var(--color-bg)" : "var(--color-accent)",
          boxShadow: "var(--shadow-sm)",
          transform: hovered && !isPending ? "scale(1.1)" : undefined,
        }}
      >
        {isPending ? (
          <CircleNotch size={20} weight="bold" className="animate-spin" />
        ) : optimisticOnList && hovered ? (
          <X size={20} weight="bold" />
        ) : optimisticOnList ? (
          <Check size={20} weight="duotone" />
        ) : (
          <BookmarkSimple size={20} weight="duotone" />
        )}
      </button>
    </form>
  );
}
