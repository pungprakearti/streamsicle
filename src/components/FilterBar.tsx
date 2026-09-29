"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SquaresFour, List } from "@phosphor-icons/react";

type Props = {
  basePath: string;
  genres: string[];
  years: number[];
};

export function FilterBar({ basePath, genres, years }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const sort = params.get("sort") || "alpha";
  const type = params.get("type") || "all";
  const genre = params.get("genre") || "";
  const year = params.get("year") || "";
  const layout = params.get("layout") || "grid";

  const update = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value && value !== "all" && value !== "") {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
    router.push(`${basePath}?${sp.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end" style={{ marginTop: 24 }}>
      <div className="field">
        <label>Sort by</label>
        <div className="seg">
          {[["alpha", "A-Z"], ["date", "Release date"], ["pop", "Popularity"]].map(([v, l]) => (
            <label key={v} className="seg-opt">
              <input type="radio" name="sort" checked={sort === v} onChange={() => update("sort", v)} />
              {l}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Type</label>
        <div className="seg">
          {[["all", "All"], ["FILM", "Films"], ["SERIES", "Series"]].map(([v, l]) => (
            <label key={v} className="seg-opt">
              <input type="radio" name="type" checked={type === v} onChange={() => update("type", v)} />
              {l}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Genre</label>
        <select
          className="input"
          value={genre}
          onChange={(e) => update("genre", e.target.value)}
          style={{ minWidth: 170, minHeight: 35, padding: "5px 8px" }}
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Year</label>
        <select
          className="input"
          value={year}
          onChange={(e) => update("year", e.target.value)}
          style={{ minWidth: 120, minHeight: 35, padding: "5px 8px" }}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
      <div className="field" style={{ marginLeft: "auto" }}>
        <label>View</label>
        <div className="seg">
          <label className="seg-opt">
            <input type="radio" name="layout" checked={layout === "grid"} onChange={() => update("layout", "grid")} />
            <SquaresFour size={16} weight="duotone" /> Grid
          </label>
          <label className="seg-opt">
            <input type="radio" name="layout" checked={layout === "list"} onChange={() => update("layout", "list")} />
            <List size={16} weight="duotone" /> List
          </label>
        </div>
      </div>
    </div>
  );
}
