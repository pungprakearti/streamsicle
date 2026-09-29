import Image from "next/image";
import Link from "next/link";
import { getNewTitles, getUpcomingTitles, getPopularTitles, getServiceCounts } from "@/lib/queries";
import { getActiveProfileId } from "@/actions/profiles";
import { TMDB_IMAGE_BASE } from "@/lib/constants";
import { PosterCard } from "@/components/PosterCard";
import { WatchlistButton } from "@/components/WatchlistButton";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function HomePage() {
  const [newTitles, upcoming, popular, serviceCounts, profileId] = await Promise.all([
    getNewTitles(),
    getUpcomingTitles(),
    getPopularTitles(10),
    getServiceCounts(),
    getActiveProfileId(),
  ]);

  const lead = newTitles[0];
  const alsoNew = newTitles.slice(1, 6);

  return (
    <>
      {lead ? (
        <section className="flex flex-wrap gap-8" style={{ gap: "32px 80px" }}>
          <div style={{ flex: "2 1 520px", minWidth: 0 }}>
            <div className="flex flex-wrap gap-6 items-start">
              <div className="relative flex-none" style={{ width: 240, aspectRatio: "2/3" }}>
                {lead.posterPath && (
                  <Image
                    src={`${TMDB_IMAGE_BASE}/w500${lead.posterPath}`}
                    alt={lead.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="240px"
                    priority
                  />
                )}
                <Link href={`/title/${lead.id}`} className="absolute inset-0 z-[1]" />
              </div>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
                  New on {lead.services[0]?.service.name ?? "streaming"} {lead.releaseDate ? `· ${formatDate(lead.releaseDate)}` : ""}
                </div>
                <h2 style={{ fontSize: 60, lineHeight: 0.98, letterSpacing: "-0.03em", margin: "12px 0 16px" }}>
                  {lead.title}
                </h2>
                {lead.logline && (
                  <p style={{ fontStyle: "italic", fontSize: 24, lineHeight: 1.35, maxWidth: "30ch" }}>
                    {lead.logline}
                  </p>
                )}
                <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
                  {lead.type === "FILM" ? "Film" : "Series"} {lead.genres.length > 0 ? `· ${lead.genres.join(" / ")}` : ""} {lead.credit ? `· ${lead.credit}` : ""}
                </p>
                <Link href={`/title/${lead.id}`} className="btn btn-primary" style={{ marginTop: 8, textDecoration: "none" }}>
                  Where to watch
                </Link>
              </div>
            </div>

            <section style={{ marginTop: 72 }}>
              <h2 style={{ fontSize: 36 }}>Streaming by service</h2>
              <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", marginTop: 24 }}>
                {serviceCounts.map((svc) => (
                  <Link
                    key={svc.slug}
                    href={`/service/${svc.slug}`}
                    className="no-underline flex flex-col gap-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    <span className="font-semibold hover:text-[var(--color-accent)]" style={{ fontSize: 24, lineHeight: 1.1 }}>
                      {svc.name}
                    </span>
                    <span style={{ fontSize: 14 }}>
                      {svc.count} {svc.count === 1 ? "title" : "titles"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {alsoNew.length > 0 && (
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <h6 style={{ marginBottom: 16 }}>Also new this month</h6>
              <div className="flex flex-col gap-4">
                {alsoNew.map((t) => (
                  <div key={t.id} className="flex gap-3 items-start">
                    <div className="relative flex-none" style={{ width: 112, aspectRatio: "2/3" }}>
                      {t.posterPath && (
                        <Image
                          src={`${TMDB_IMAGE_BASE}/w185${t.posterPath}`}
                          alt={t.title}
                          fill
                          className="object-cover rounded-lg"
                          sizes="112px"
                        />
                      )}
                      <Link href={`/title/${t.id}`} className="absolute inset-0 z-[1]" />
                    </div>
                    <Link href={`/title/${t.id}`} className="no-underline text-inherit flex flex-col gap-0.5 flex-1">
                      <span className="font-semibold hover:text-[var(--color-accent)]" style={{ fontSize: 20, lineHeight: 1.2 }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                        {t.type === "FILM" ? "Film" : "Series"} {t.services.map((s) => s.service.name).join(" · ")} {t.releaseDate ? `· ${formatDate(t.releaseDate)}` : ""}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="text-center py-16">
          <h2 style={{ fontSize: 36 }}>No titles yet</h2>
          <p style={{ fontStyle: "italic", fontSize: 18, color: "var(--color-neutral-700)" }}>
            Visit <code>/api/sync</code> to import titles from TMDB.
          </p>
        </div>
      )}

      <section className="flex flex-wrap" style={{ marginTop: 112, gap: "32px 80px" }}>
        {popular.length > 0 && (
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            <h2 style={{ fontSize: 36 }}>Most watched</h2>
            <div className="flex flex-col gap-3" style={{ marginTop: 16 }}>
              {popular.map((t, i) => (
                <div key={t.id} className="flex gap-3 items-start">
                  <div className="relative flex-none" style={{ width: 112, aspectRatio: "2/3" }}>
                    {t.posterPath && (
                      <Image
                        src={`${TMDB_IMAGE_BASE}/w185${t.posterPath}`}
                        alt={t.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="112px"
                      />
                    )}
                    <Link href={`/title/${t.id}`} className="absolute inset-0 z-[1]" />
                  </div>
                  <Link href={`/title/${t.id}`} className="no-underline text-inherit flex-1 grid items-baseline" style={{ gridTemplateColumns: "48px minmax(0, 1fr)", gap: 12 }}>
                    <span className="font-semibold" style={{ fontSize: 30, lineHeight: 1, color: "var(--color-accent-2-700)", fontVariantNumeric: "lining-nums" }}>
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold hover:text-[var(--color-accent)]" style={{ fontSize: 19, lineHeight: 1.2 }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                        {t.type === "FILM" ? "Film" : "Series"} {t.services.map((s) => s.service.name).join(" · ")}
                      </span>
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            <h2 style={{ fontSize: 36 }}>Coming soon</h2>
            <div className="flex flex-col gap-4" style={{ marginTop: 16 }}>
              {upcoming.slice(0, 6).map((t) => (
                <div key={t.id} className="flex gap-3 items-start">
                  <div className="relative flex-none" style={{ width: 112, aspectRatio: "2/3" }}>
                    {t.posterPath && (
                      <Image
                        src={`${TMDB_IMAGE_BASE}/w185${t.posterPath}`}
                        alt={t.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="112px"
                      />
                    )}
                    <Link href={`/title/${t.id}`} className="absolute inset-0 z-[1]" />
                  </div>
                  <Link href={`/title/${t.id}`} className="no-underline text-inherit flex-1 grid items-baseline" style={{ gridTemplateColumns: "72px minmax(0, 1fr)", gap: 12 }}>
                    <span style={{ fontSize: 14, color: "var(--color-accent-700)" }}>
                      {formatDate(t.releaseDate)}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold hover:text-[var(--color-accent)]" style={{ fontSize: 19, lineHeight: 1.2 }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                        {t.type === "FILM" ? "Film" : "Series"} {t.services.map((s) => s.service.name).join(" · ")}
                      </span>
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/new" className="inline-block" style={{ marginTop: 24, fontSize: 15 }}>
              All new and upcoming titles
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
