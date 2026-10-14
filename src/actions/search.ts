"use server";

import { searchTitles } from "@/lib/queries";
import { tmdb } from "@/lib/tmdb";
import { upsertMovie, upsertTvShow } from "@/lib/sync";
import { prisma } from "@/lib/db";

export async function searchWithFallback(query: string) {
  const localResults = await searchTitles(query);

  if (localResults.length >= 5) return localResults;

  try {
    const tmdbResults = await tmdb.searchMulti(query);
    const candidates = tmdbResults.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 10);

    const localTmdbIds = new Set(localResults.map((t) => t.tmdbId));
    const newCandidates = candidates.filter((c) => !localTmdbIds.has(c.id));

    const imports = newCandidates.map(async (c) => {
      try {
        if (c.media_type === "movie") {
          await upsertMovie(c.id);
        } else {
          await upsertTvShow(c.id);
        }
      } catch {
        // Title may not have any tracked service providers
      }
    });

    await Promise.all(imports);
  } catch {
    // TMDB unavailable - return local results only
    return localResults;
  }

  return searchTitles(query);
}
