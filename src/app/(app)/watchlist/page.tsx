import Link from "next/link";
import { getFullWatchlist } from "@/actions/watchlist";
import { getActiveProfileId } from "@/actions/profiles";
import { PosterCard } from "@/components/PosterCard";
import { ProfileAvatar } from "@/components/ProfilePicker";
import { BookmarkSimple } from "@phosphor-icons/react/dist/ssr";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function WatchlistPage() {
  const [watchlist, profileId] = await Promise.all([
    getFullWatchlist(),
    getActiveProfileId(),
  ]);

  const upcomingCount = watchlist.filter((w) => w.title.status === "UPCOMING").length;

  return (
    <>
      <h2 style={{ fontSize: 56, letterSpacing: "-0.025em", margin: 0 }}>Your watchlist</h2>
      <p style={{ fontStyle: "italic", fontSize: 18, marginTop: 8 }}>
        {watchlist.length > 0
          ? `${watchlist.length} ${watchlist.length === 1 ? "title" : "titles"} saved${upcomingCount > 0 ? `, ${upcomingCount} not out yet` : ""}`
          : "Nothing saved yet."}
      </p>

      {watchlist.length > 0 ? (
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", marginTop: 32 }}
        >
          {watchlist.map((w) => (
            <div key={w.id} className="flex flex-col gap-2">
              <PosterCard
                id={w.title.id}
                title={w.title.title}
                typeLabel={w.title.type === "FILM" ? "Film" : "Series"}
                year={w.title.releaseDate?.getFullYear() ?? null}
                posterPath={w.title.posterPath}
                serviceNames={w.title.services.map((s) => s.service.name).join(" · ")}
                isOnWatchlist={true}
              />
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
                <ProfileAvatar avatarId={w.profile.avatarId} size={20} />
                Added by {w.profile.name} {"·"} {formatDate(w.addedAt)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 32 }} className="flex flex-col gap-4 items-start">
          <p style={{ fontSize: 20, margin: 0, maxWidth: "44ch" }}>
            Use the <BookmarkSimple size={18} weight="duotone" style={{ color: "var(--color-accent)", verticalAlign: "middle" }} /> on any poster, or Add to watchlist on a title page, to keep it here.
          </p>
          <Link href="/catalog" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Browse the catalog
          </Link>
        </div>
      )}
    </>
  );
}
