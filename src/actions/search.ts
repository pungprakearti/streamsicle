"use server";

import { searchTitles } from "@/lib/queries";
import { tmdb } from "@/lib/tmdb";
import { upsertMovie, upsertTvShow } from "@/lib/sync";
import { prisma } from "@/lib/db";

type SearchFlags = {
  live: boolean;
};

function parseSearchFlags(raw: string): { query: string; flags: SearchFlags } {
  const flags: SearchFlags = { live: false };
  let query = raw;

  query = query.replace(/(?:^|\s)-live\b/gi, () => {
    flags.live = true;
    return "";
  });

  return { query: query.trim(), flags };
}

async function importFromTmdb(query: string, excludeTmdbIds: Set<number> = new Set()) {
  const tmdbResults = await tmdb.searchMulti(query);
  const candidates = tmdbResults.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .filter((c) => !excludeTmdbIds.has(c.id))
    .slice(0, 10);

  await Promise.all(
    candidates.map(async (c) => {
      try {
        if (c.media_type === "movie") {
          await upsertMovie(c.id);
        } else {
          await upsertTvShow(c.id);
        }
      } catch {
        // Title may not have any tracked service providers
      }
    }),
  );
}

export async function searchWithFallback(raw: string) {
  const { query, flags } = parseSearchFlags(raw);
  if (!query) return { results: [], flags };

  if (flags.live) {
    try {
      await importFromTmdb(query);
    } catch {
      // TMDB unavailable
    }
    return { results: await searchTitles(query), flags };
  }

  const localResults = await searchTitles(query);
  if (localResults.length >= 5) return { results: localResults, flags };

  try {
    const localTmdbIds = new Set(localResults.map((t) => t.tmdbId));
    await importFromTmdb(query, localTmdbIds);
  } catch {
    return { results: localResults, flags };
  }

  return { results: await searchTitles(query), flags };
}
