"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
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

  const handleClear = () => {
    setQuery("");
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
        name="q"
        aria-label="Search"
        className="input"
        placeholder="Search films, series, directors"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: 36, paddingRight: query ? 36 : 12, minHeight: 44, fontSize: 15 }}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--color-neutral-300)",
            color: "var(--color-neutral-800)",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </div>
  );
}
