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
  serviceNames: string;
  rankLabel?: string;
  status?: string;
  showWatchlist?: boolean;
  isOnWatchlist?: boolean;
};

export function PosterCard({
  id,
  title,
  typeLabel,
  year,
  posterPath,
  serviceNames,
  rankLabel,
  status,
  showWatchlist = true,
  isOnWatchlist = false,
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
          className="font-semibold leading-tight hover:text-[var(--color-accent)] transition-colors"
          style={{ fontSize: 18 }}
        >
          {title}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{serviceNames}</span>
      </Link>
    </div>
  );
}
