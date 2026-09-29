import Image from "next/image";
import Link from "next/link";
import { PosterCard } from "./PosterCard";
import { TMDB_IMAGE_BASE } from "@/lib/constants";

type TitleItem = {
  id: string;
  title: string;
  type: "FILM" | "SERIES";
  releaseDate: Date | null;
  posterPath: string | null;
  genres: string[];
  credit: string | null;
  tmdbPopularity: number;
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
            <th>Released</th>
            <th>Streaming on</th>
            {showRank && <th>Popularity</th>}
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
    );
  }

  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", marginTop: 16 }}
    >
      {titles.map((t, i) => (
        <PosterCard
          key={t.id}
          id={t.id}
          title={t.title}
          typeLabel={t.type === "FILM" ? "Film" : "Series"}
          year={t.releaseDate?.getFullYear() ?? null}
          posterPath={t.posterPath}
          serviceNames={t.services.map((s) => s.service.name).join(" · ")}
          rankLabel={showRank ? `No. ${i + 1}` : undefined}
          status={t.status}
          isOnWatchlist={profileId ? t.watchlist.some((w) => w.profileId === profileId) : false}
        />
      ))}
    </div>
  );
}
