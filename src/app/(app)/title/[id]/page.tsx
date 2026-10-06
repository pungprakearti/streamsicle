import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTitleById, getSimilarTitles } from "@/lib/queries";
import { getActiveProfileId } from "@/actions/profiles";
import { TMDB_IMAGE_BASE } from "@/lib/constants";
import { PosterCard } from "@/components/PosterCard";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TitlePage({ params }: Props) {
  const { id } = await params;
  const [title, profileId] = await Promise.all([
    getTitleById(id),
    getActiveProfileId(),
  ]);

  if (!title) notFound();

  const similar = await getSimilarTitles(id, title.genres);
  const isOnList = profileId ? title.watchlist.some((w) => w.profileId === profileId) : false;
  const isUpcoming = title.status === "UPCOMING";
  const typeLabel = title.type === "FILM" ? "Film" : "Series";

  return (
    <>
      <Link href="/home" className="btn btn-ghost" style={{ margin: "0 0 16px -12px" }}>
        <ArrowLeft size={18} weight="duotone" /> Back
      </Link>

      {title.backdropPath && (
        <div className="relative w-full" style={{ aspectRatio: "21/8" }}>
          <Image
            src={`${TMDB_IMAGE_BASE}/w1280${title.backdropPath}`}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            preload
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 50%, var(--color-bg))" }} />
        </div>
      )}

      <div className="title-hero" style={{ marginTop: title.backdropPath ? -150 : 0 }}>
        <div className="title-poster" style={{ boxShadow: "var(--shadow-lg)" }}>
          {title.posterPath ? (
            <Image
              src={`${TMDB_IMAGE_BASE}/w500${title.posterPath}`}
              alt={title.title}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 140px, 230px"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full rounded-lg grid place-items-center" style={{ background: "var(--color-surface)" }}>
              No poster
            </div>
          )}
        </div>
        <div className="title-info" style={{ paddingTop: title.backdropPath ? 170 : 0 }}>
          <span style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
            {typeLabel} {title.genres.length > 0 ? `· ${title.genres.join(" / ")}` : ""}
          </span>
          <h2 className="title-name">
            {title.title}
          </h2>
          <div className="flex flex-wrap gap-4" style={{ fontSize: 15 }}>
            <span>{formatDate(title.releaseDate)}</span>
            {title.contentRating && <span>{title.contentRating}</span>}
            {title.runtime && <span>{title.type === "FILM" ? `${title.runtime} min` : `${title.seasons?.length ?? 0} season${(title.seasons?.length ?? 0) === 1 ? "" : "s"}`}</span>}
            {title.rating && <span>Rated {title.rating}</span>}
          </div>
          {title.logline && (
            <p style={{ fontStyle: "italic", fontSize: 23, lineHeight: 1.4, margin: "8px 0 0", maxWidth: "40ch" }}>
              {title.logline}
            </p>
          )}
          {title.credit && (
            <p style={{ fontSize: 15, margin: 0 }}>
              {title.type === "FILM" ? "Directed by" : "Created by"} {title.credit}
            </p>
          )}
          <div className="flex flex-wrap gap-3 items-center" style={{ marginTop: 12 }}>
            {!isUpcoming && title.services.length > 0 && (
              <span className="btn btn-primary">Watch on {title.services[0].service.name}</span>
            )}
            <WatchlistButton titleId={title.id} isOnList={isOnList} variant="inline" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start" style={{ gap: "32px 80px", marginTop: 96 }}>
        <div className="flex flex-col" style={{ flex: "2 1 560px", minWidth: 0, gap: 96 }}>
          {title.type === "SERIES" && title.seasons && title.seasons.length > 0 && (
            <section>
              <h3 style={{ fontSize: 32, margin: "0 0 16px" }}>Seasons &amp; episodes</h3>
              {title.seasons.map((season) => (
                <div key={season.id} style={{ marginBottom: 32 }}>
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="font-semibold" style={{ fontSize: 18 }}>Season {season.seasonNumber}</span>
                    <span style={{ fontSize: 15, fontStyle: "italic" }}>
                      {season.episodeCount ?? season.episodes.length} episodes
                      {season.airDate ? ` · ${season.airDate.getFullYear()}` : ""}
                    </span>
                  </div>
                  {season.episodes.length > 0 && (
                    <div className="table-wrap"><table className="table" style={{ marginTop: 16 }}>
                      <thead>
                        <tr><th style={{ width: 48 }}>No.</th><th>Episode</th><th>Aired</th><th>Runtime</th></tr>
                      </thead>
                      <tbody>
                        {season.episodes.map((ep) => (
                          <tr key={ep.id}>
                            <td style={{ color: "var(--color-accent-2-700)", fontWeight: 600 }}>{ep.episodeNumber}</td>
                            <td>
                              <span className="font-semibold" style={{ fontSize: 16 }}>{ep.title}</span>
                              {ep.overview && (
                                <>
                                  <br />
                                  <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{ep.overview}</span>
                                </>
                              )}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>{formatDate(ep.airDate)}</td>
                            <td style={{ whiteSpace: "nowrap" }}>{ep.runtime ? `${ep.runtime} min` : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  )}
                </div>
              ))}
            </section>
          )}

          {title.castMembers && title.castMembers.length > 0 && (
            <section>
              <h3 style={{ fontSize: 32, margin: "0 0 24px" }}>Cast</h3>
              <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {title.castMembers.map((p) => (
                  <div key={p.id} className="flex flex-col gap-1">
                    <div className="relative" style={{ width: 100, height: 100, marginBottom: 8 }}>
                      {p.photoPath ? (
                        <Image
                          src={`${TMDB_IMAGE_BASE}/w185${p.photoPath}`}
                          alt={p.name}
                          fill
                          className="object-cover rounded-full"
                          sizes="100px"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full grid place-items-center" style={{ background: "var(--color-surface)", fontSize: 13, color: "var(--color-neutral-400)" }}>
                          Photo
                        </div>
                      )}
                    </div>
                    <span className="font-semibold" style={{ fontSize: 16, lineHeight: 1.2 }}>{p.name}</span>
                    {p.role && <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-neutral-700)" }}>{p.role}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {title.crewMembers && title.crewMembers.length > 0 && (
            <section>
              <h6 style={{ margin: "0 0 12px" }}>Crew</h6>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {title.crewMembers.map((p) => (
                  <div key={p.id} className="flex flex-col gap-0.5">
                    <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{p.department}</span>
                    <span className="font-semibold" style={{ fontSize: 17 }}>{p.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="sticky" style={{ flex: "1 1 280px", minWidth: 0, top: 24 }}>
          <h3 style={{ fontSize: 32, margin: "0 0 16px" }}>
            {isUpcoming ? "Arriving on" : "Where to watch"}
          </h3>
          <div className="flex flex-col gap-4">
            {title.services.map((s) => (
              <div key={s.serviceId} className="flex justify-between items-center gap-3">
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold" style={{ fontSize: 20 }}>{s.service.name}</span>
                  <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
                    {isUpcoming ? `Arrives ${formatDate(title.releaseDate)}` : "Included with subscription"}
                  </span>
                </span>
                {!isUpcoming && <span className="btn btn-secondary">Watch</span>}
              </div>
            ))}
            {title.services.length === 0 && (
              <p style={{ fontStyle: "italic", color: "var(--color-neutral-700)" }}>
                Not currently available on any tracked service.
              </p>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section style={{ marginTop: 112 }}>
          <h3 style={{ fontSize: 32, margin: "0 0 24px" }}>More like this</h3>
          <div className="grid gap-4 sm:gap-8 title-grid">
            {similar.map((t) => (
              <PosterCard
                key={t.id}
                id={t.id}
                title={t.title}
                typeLabel={t.type === "FILM" ? "Film" : "Series"}
                year={t.releaseDate?.getFullYear() ?? null}
                posterPath={t.posterPath}
                contentRating={t.contentRating}
                serviceNames={t.services.map((s) => s.service.name).join(" · ")}
                isOnWatchlist={profileId ? t.watchlist.some((w) => w.profileId === profileId) : false}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
