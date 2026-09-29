import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveProfile } from "@/actions/profiles";
import { getFullWatchlist } from "@/actions/watchlist";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { APP_VERSION } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect("/");
  }

  const watchlist = await getFullWatchlist();
  const watchCount = watchlist.length;

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", padding: "32px clamp(32px, 5vw, 80px) 120px" }}>
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/home" style={{ color: "var(--color-text)", textDecoration: "none" }}>
              <Logo size={84} />
            </Link>
            <span style={{ fontSize: 13, letterSpacing: "0.06em", color: "var(--color-neutral-700)" }}>
              v{APP_VERSION}
            </span>
          </div>
          <SearchBar />
        </div>
        <nav className="nav" style={{ padding: 0, marginTop: 16, gap: 24, flexWrap: "wrap" }}>
          <Link href="/home">Front page</Link>
          <Link href="/service/netflix">By service</Link>
          <Link href="/new">New &amp; coming</Link>
          <Link href="/catalog">Full catalog</Link>
          <Link href="/watchlist">
            Watchlist{watchCount > 0 ? ` (${watchCount})` : ""}
          </Link>
          <ProfileSwitcher name={profile.name} avatarId={profile.avatarId} />
        </nav>
      </header>
      <main style={{ marginTop: 72 }}>
        {children}
      </main>
    </div>
  );
}
