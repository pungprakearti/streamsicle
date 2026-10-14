"use client";

import { toggleWatchlistAction } from "@/actions/watchlist";
import { BookmarkSimple, Check, CircleNotch } from "@phosphor-icons/react";
import { useFormStatus } from "react-dom";
import { X } from "@phosphor-icons/react";
import { useState } from "react";

type Props = {
  titleId: string;
  isOnList: boolean;
  variant?: "poster" | "inline";
};

function PosterSubmit({ isOnList }: { isOnList: boolean }) {
  const { pending } = useFormStatus();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="submit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={pending}
      aria-label={isOnList ? "Remove from watchlist" : "Add to watchlist"}
      title={isOnList ? "Remove from watchlist" : "Add to watchlist"}
      className="absolute top-1.5 right-1.5 z-[2] w-9 h-9 border-0 rounded-xl cursor-pointer grid place-items-center transition-all duration-150"
      style={{
        background: pending
          ? "color-mix(in srgb, var(--color-accent) 60%, transparent)"
          : isOnList
            ? hovered ? "var(--color-danger, #e53e3e)" : "var(--color-accent)"
            : hovered ? "var(--color-accent)" : "color-mix(in srgb, var(--color-bg) 82%, transparent)",
        color: (pending || isOnList || hovered) ? "var(--color-bg)" : "var(--color-accent)",
        boxShadow: "var(--shadow-sm)",
        transform: hovered && !pending ? "scale(1.1)" : undefined,
      }}
    >
      {pending ? (
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

function InlineSubmit({ isOnList }: { isOnList: boolean }) {
  const { pending } = useFormStatus();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="submit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={pending}
      className="btn btn-secondary transition-all duration-150"
      style={isOnList && hovered && !pending ? { borderColor: "var(--color-danger, #e53e3e)", color: "var(--color-danger, #e53e3e)" } : undefined}
    >
      {pending ? (
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

export function WatchlistButton({ titleId, isOnList, variant = "poster" }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <form action={toggleWatchlistAction} onClick={handleClick}>
      <input type="hidden" name="titleId" value={titleId} />
      {variant === "poster" ? (
        <PosterSubmit isOnList={isOnList} />
      ) : (
        <InlineSubmit isOnList={isOnList} />
      )}
    </form>
  );
}
