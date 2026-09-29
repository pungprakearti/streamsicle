import Image from "next/image";
import Link from "next/link";
import { getNewTitles, getUpcomingTitles } from "@/lib/queries";
import { TMDB_IMAGE_BASE } from "@/lib/constants";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function NewPage() {
  const [newTitles, upcoming] = await Promise.all([
    getNewTitles(),
    getUpcomingTitles(),
  ]);

  const columns = [
    { title: "Just added", items: newTitles },
    { title: "Coming soon", items: upcoming },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 56, letterSpacing: "-0.025em", margin: 0 }}>New &amp; coming</h2>
          <p style={{ fontStyle: "italic", fontSize: 18, marginTop: 8 }}>
            What arrived in the last 30 days, and what lands next.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap" style={{ gap: "32px 80px", marginTop: 32 }}>
        {columns.map((col) => (
          <div key={col.title} style={{ flex: "1 1 380px", minWidth: 0 }}>
            <h3 style={{ fontSize: 32 }}>{col.title}</h3>
            {col.items.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "var(--color-neutral-700)" }}>Nothing here yet.</p>
            ) : (
              <div className="flex flex-col gap-6" style={{ marginTop: 24 }}>
                {col.items.map((t) => (
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
                      <span className="font-semibold hover:text-[var(--color-accent)]" style={{ fontSize: 21, lineHeight: 1.2 }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                        {t.type === "FILM" ? "Film" : "Series"} {t.genres.length > 0 ? `· ${t.genres.join(" / ")}` : ""} {t.services.map((s) => s.service.name).join(" · ")}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--color-accent-700)" }}>
                        {formatDate(t.releaseDate)}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
