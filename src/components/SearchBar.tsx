"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import Form from "next/form";
import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function SearchBar() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const handleClear = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setQuery("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative" style={{ width: "min(420px, 100%)" }}>
      <Form action="/search">
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
          style={{ paddingLeft: 36, paddingRight: query ? 36 : 12, minHeight: 44, fontSize: 15, width: "100%" }}
        />
      </Form>
      {query && (
        <form
          onSubmit={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          style={{ margin: 0 }}
        >
          <button
            type="submit"
            aria-label="Clear search"
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
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
        </form>
      )}
    </div>
  );
}
