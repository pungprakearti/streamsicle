"use client";

import { toggleWatchlist } from "@/actions/watchlist";
import { BookmarkSimple, Check, CircleNotch } from "@phosphor-icons/react";
import { useTransition, useState } from "react";
import { X } from "@phosphor-icons/react";

type Props = {
  titleId: string;
  isOnList: boolean;
  variant?: "poster" | "inline";
};

export function WatchlistButton({ titleId, isOnList: initialIsOnList, variant = "poster" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOnList, setIsOnList] = useState(initialIsOnList);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const added = await toggleWatchlist(titleId);
      setIsOnList(added);
    });
  };

  if (variant === "poster") {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={isPending}
        aria-label={isOnList ? "Remove from watchlist" : "Add to watchlist"}
        title={isOnList ? "Remove from watchlist" : "Add to watchlist"}
        className="absolute top-1.5 right-1.5 z-[2] w-9 h-9 border-0 rounded-xl cursor-pointer grid place-items-center transition-all duration-150"
        style={{
          background: isPending
            ? "color-mix(in srgb, var(--color-accent) 60%, transparent)"
            : isOnList
              ? hovered ? "var(--color-danger, #e53e3e)" : "var(--color-accent)"
              : hovered ? "var(--color-accent)" : "color-mix(in srgb, var(--color-bg) 82%, transparent)",
          color: (isPending || isOnList || hovered) ? "var(--color-bg)" : "var(--color-accent)",
          boxShadow: "var(--shadow-sm)",
          transform: hovered && !isPending ? "scale(1.1)" : undefined,
        }}
      >
        {isPending ? (
          <CircleNotch size={20} weight="bold" className="animate-spin" />
        ) : isOnList && hovered ? (
          <X size={20} weight="bold" />
        ) : isOnList ? (
          <Check size={20} weight="duotone" />
        ) : (
          <BookmarkSimple size={20} weight="duotone" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={isPending}
      className="btn btn-secondary transition-all duration-150"
      style={isOnList && hovered && !isPending ? { borderColor: "var(--color-danger, #e53e3e)", color: "var(--color-danger, #e53e3e)" } : undefined}
    >
      {isPending ? (
        <>
          <CircleNotch size={18} weight="bold" className="animate-spin" style={{ color: "var(--color-accent)" }} />
          Saving...
        </>
      ) : isOnList && hovered ? (
        <>
          <X size={18} weight="bold" />
          Remove
        </>
      ) : isOnList ? (
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
  );
}
