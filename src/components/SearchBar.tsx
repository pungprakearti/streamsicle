"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import Form from "next/form";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function SearchBar() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const handleClear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setQuery("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <Form action="/search" className="relative" style={{ width: "min(420px, 100%)" }}>
      <MagnifyingGlass
        size={18}
        weight="duotone"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--color-accent-700)" }}
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        aria-label="Search"
        className="input"
        placeholder="Search films, series, directors"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ paddingLeft: 36, paddingRight: query ? 36 : 12, minHeight: 44, fontSize: 15 }}
      />
      {query && (
        <a
          href="#"
          role="button"
          onClick={handleClear}
          onTouchEnd={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center no-underline"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--color-neutral-300)",
            color: "var(--color-neutral-800)",
            cursor: "pointer",
          }}
        >
          <X size={14} weight="bold" />
        </a>
      )}
    </Form>
  );
}
