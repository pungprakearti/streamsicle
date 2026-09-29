"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (v.trim()) {
      router.push(`/search?q=${encodeURIComponent(v.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative" style={{ width: "min(420px, 100%)" }}>
      <MagnifyingGlass
        size={18}
        weight="duotone"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--color-accent-700)" }}
      />
      <input
        type="search"
        className="input"
        placeholder="Search films, series, directors"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: 36, minHeight: 44, fontSize: 15 }}
      />
    </div>
  );
}
