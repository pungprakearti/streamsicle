import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveProfile } from "@/actions/profiles";
import { getFullWatchlist } from "@/actions/watchlist";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { APP_VERSION } from "@/lib/constants";
import { BackToTop } from "@/components/BackToTop";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect("/");
  }

  const watchlist = await getFullWatchlist();
  const watchCount = watchlist.length;

  return (
    <div className="app-shell">
      <header>
        {/* Mobile header */}
        <div className="mobile-header">
          <Link href="/home" className="mobile-logo-link">
            <Logo />
          </Link>
          <MobileNav
            watchCount={watchCount}
            profileName={profile.name}
            profileAvatarId={profile.avatarId}
            version={APP_VERSION}
          />
          <SearchBar />
        </div>

        {/* Desktop header */}
        <div className="desktop-header">
          <div className="app-header-top">
            <div className="flex flex-col gap-1">
              <Link href="/home" style={{ color: "var(--color-text)", textDecoration: "none" }}>
                <Logo />
              </Link>
              <span style={{ fontSize: 13, letterSpacing: "0.06em", color: "var(--color-neutral-700)" }}>
                v{APP_VERSION}
              </span>
            </div>
            <div className="app-header-right">
              <ProfileSwitcher name={profile.name} avatarId={profile.avatarId} />
            </div>
          </div>
          <SearchBar />
          <nav className="app-nav">
            <Link href="/home">Front page</Link>
            <Link href="/service/netflix">By service</Link>
            <Link href="/new">New &amp; coming</Link>
            <Link href="/catalog">Full catalog</Link>
            <Link href="/watchlist">
              Watchlist{watchCount > 0 ? ` (${watchCount})` : ""}
            </Link>
          </nav>
        </div>
      </header>
      <main className="app-main">
        {children}
        <BackToTop />
      </main>
    </div>
  );
}
