"use client";

import { toggleWatchlist } from "@/actions/watchlist";
import { BookmarkSimple, Check } from "@phosphor-icons/react";
import { useTransition, useState } from "react";

type Props = {
  titleId: string;
  isOnList: boolean;
  variant?: "poster" | "inline";
};

export function WatchlistButton({ titleId, isOnList: initialIsOnList, variant = "poster" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOnList, setIsOnList] = useState(initialIsOnList);

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
        disabled={isPending}
        aria-label={isOnList ? "Remove from watchlist" : "Add to watchlist"}
        title={isOnList ? "Remove from watchlist" : "Add to watchlist"}
        className="absolute top-1.5 right-1.5 z-[2] w-9 h-9 border-0 rounded-xl cursor-pointer grid place-items-center"
        style={{
          background: isOnList ? "var(--color-accent)" : "color-mix(in srgb, var(--color-bg) 82%, transparent)",
          color: isOnList ? "var(--color-bg)" : "var(--color-accent)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {isOnList ? <Check size={20} weight="duotone" /> : <BookmarkSimple size={20} weight="duotone" />}
      </button>
    );
  }

  return (
    <button onClick={handleClick} disabled={isPending} className="btn btn-secondary">
      {isOnList ? (
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
