import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_BASE } from "@/lib/constants";
import { WatchlistButton } from "./WatchlistButton";

type Props = {
  id: string;
  title: string;
  typeLabel: string;
  year: number | null;
  posterPath: string | null;
  contentRating?: string | null;
  serviceNames: string;
  rankLabel?: string;
  showWatchlist?: boolean;
  isOnWatchlist?: boolean;
  eager?: boolean;
};

export function PosterCard({
  id,
  title,
  typeLabel,
  year,
  posterPath,
  contentRating,
  serviceNames,
  rankLabel,
  showWatchlist = true,
  isOnWatchlist = false,
  eager = false,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative" style={{ aspectRatio: "2/3" }}>
        {posterPath ? (
          <Image
            src={`${TMDB_IMAGE_BASE}/w342${posterPath}`}
            alt={title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 640px) 50vw, 170px"
            loading={eager ? "eager" : undefined}
          />
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center text-sm"
            style={{ background: "var(--color-surface)", color: "var(--color-neutral-400)" }}
          >
            No poster
          </div>
        )}
        <Link
          href={`/title/${id}`}
          className="absolute inset-0 z-[1]"
          aria-label={`Open ${title}`}
        />
        {showWatchlist && (
          <WatchlistButton titleId={id} isOnList={isOnWatchlist} />
        )}
        {contentRating && (
          <span
            className="absolute z-[2] font-semibold"
            style={{
              bottom: 6,
              left: 6,
              fontSize: 9,
              letterSpacing: "0.05em",
              padding: "2px 5px",
              borderRadius: 4,
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
            }}
          >
            {contentRating}
          </span>
        )}
      </div>
      <Link href={`/title/${id}`} className="no-underline text-inherit flex flex-col gap-0.5">
        <span className="flex justify-between gap-2" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span style={{ color: "var(--color-accent-700)" }}>
            {typeLabel} {year ? `· ${year}` : ""}
          </span>
          {rankLabel && (
            <span style={{ color: "var(--color-accent-2-700)" }}>{rankLabel}</span>
          )}
        </span>
        <span
          className="font-semibold leading-tight [overflow-wrap:anywhere] hover:text-[var(--color-accent)] transition-colors"
          style={{ fontSize: 18 }}
        >
          {title}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{serviceNames}</span>
      </Link>
    </div>
  );
}
