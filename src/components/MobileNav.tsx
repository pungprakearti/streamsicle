"use client";

import { List } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProfileSwitcher } from "./ProfileSwitcher";

type Props = {
  watchCount: number;
  profileName: string;
  profileAvatarId: string;
  version: string;
};

const NAV_LINKS = [
  { href: "/home", label: "Front page" },
  { href: "/service/netflix", label: "By service" },
  { href: "/new", label: "New & coming" },
  { href: "/catalog", label: "Full catalog" },
  { href: "/watchlist", label: "Watchlist" },
];

export function MobileNav({ watchCount, profileName, profileAvatarId, version }: Props) {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      detailsRef.current?.removeAttribute("open");
    }
  }, [pathname]);

  return (
    <>
      <div className="mobile-header-row">
        <ProfileSwitcher name={profileName} avatarId={profileAvatarId} />
        <span className="mobile-version">v{version}</span>
        <details ref={detailsRef} className="mobile-menu-details">
          <summary className="mobile-nav-toggle" aria-label="Open menu">
            <List size={24} weight="bold" />
          </summary>
          <nav className="mobile-nav-drawer">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                {label === "Watchlist" && watchCount > 0 ? `${label} (${watchCount})` : label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </>
  );
}
