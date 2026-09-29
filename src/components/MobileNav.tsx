"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="mobile-header-row">
        <ProfileSwitcher name={profileName} avatarId={profileAvatarId} />
        <span className="mobile-version">v{version}</span>
        <button
          className="mobile-nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav-drawer">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label === "Watchlist" && watchCount > 0 ? `${label} (${watchCount})` : label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
