import Image from "next/image";
import Link from "next/link";
import { PosterCard } from "./PosterCard";
import { InfiniteGrid } from "./InfiniteGrid";
import { TMDB_IMAGE_BASE } from "@/lib/constants";

// Enough to cover the first visible row on wide screens
export const EAGER_POSTER_COUNT = 12;

type TitleItem = {
  id: string;
  title: string;
  type: "FILM" | "SERIES";
  releaseDate: Date | null;
  posterPath: string | null;
  genres: string[];
  credit: string | null;
  tmdbPopularity: number;
  contentRating: string | null;
  status: "CATALOG" | "NEW" | "UPCOMING";
  services: { service: { name: string } }[];
  watchlist: { profileId: string }[];
};

type Props = {
  titles: TitleItem[];
  layout: "grid" | "list";
  profileId: string | null;
  showRank?: boolean;
};

export function TitleGrid({ titles, layout, profileId, showRank = false }: Props) {
  if (layout === "list") {
    return (
      <table className="table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Rating</th>
            <th>Released</th>
            <th>Streaming on</th>
            {showRank && <th>Popularity</th>}
          </tr>
        </thead>
        <tbody>
          <InfiniteGrid totalCount={titles.length} tableMode>
            {titles.map((t, i) => (
              <tr key={t.id} style={{ cursor: "pointer" }}>
                <td>
                  <Link href={`/title/${t.id}`} className="flex gap-3 items-center no-underline text-inherit">
                    <div className="relative flex-none" style={{ width: 80, aspectRatio: "2/3" }}>
                      {t.posterPath && (
                        <Image
                          src={`${TMDB_IMAGE_BASE}/w185${t.posterPath}`}
                          alt={t.title}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                          loading={i < EAGER_POSTER_COUNT ? "eager" : undefined}
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold" style={{ fontSize: 16 }}>{t.title}</span>
                      <br />
                      <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{t.genres.join(" / ")}</span>
                    </div>
                  </Link>
                </td>
                <td>{t.type === "FILM" ? "Film" : "Series"}</td>
                <td>{t.contentRating || ""}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {t.releaseDate ? t.releaseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </td>
                <td>{t.services.map((s) => s.service.name).join(", ")}</td>
                {showRank && (
                  <td style={{ color: "var(--color-accent-2-700)", whiteSpace: "nowrap" }}>
                    No. {i + 1}
                  </td>
                )}
              </tr>
            ))}
          </InfiniteGrid>
        </tbody>
      </table>
    );
  }

  return (
    <div
      className="grid gap-4 sm:gap-6 title-grid"
      style={{ marginTop: 16 }}
    >
      <InfiniteGrid totalCount={titles.length}>
        {titles.map((t, i) => (
          <PosterCard
            key={t.id}
            id={t.id}
            title={t.title}
            typeLabel={t.type === "FILM" ? "Film" : "Series"}
            year={t.releaseDate?.getFullYear() ?? null}
            posterPath={t.posterPath}
            contentRating={t.contentRating}
            serviceNames={t.services.map((s) => s.service.name).join(" · ")}
            rankLabel={showRank ? `No. ${i + 1}` : undefined}
            isOnWatchlist={profileId ? t.watchlist.some((w) => w.profileId === profileId) : false}
            eager={i < EAGER_POSTER_COUNT}
          />
        ))}
      </InfiniteGrid>
    </div>
  );
}
