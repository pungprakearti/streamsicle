import { prisma } from "@/lib/db";
import { tmdb, computeSyncHash } from "@/lib/tmdb";
import { TMDB_PROVIDER_IDS } from "@/lib/constants";
import { TitleType, TitleStatus } from "@prisma/client";

const PROVIDER_SLUG = Object.fromEntries(
  Object.entries(TMDB_PROVIDER_IDS).map(([slug, id]) => [id, slug])
);

export interface SyncOptions {
  limit?: number;
}

async function upsertMovie(tmdbId: number): Promise<"synced" | "skipped" | "no_service"> {
  const [detail, credits, providers] = await Promise.all([
    tmdb.movieDetail(tmdbId),
    tmdb.movieCredits(tmdbId),
    tmdb.movieProviders(tmdbId),
  ]);

  const flatrate = providers.results?.US?.flatrate || [];
  const serviceSlugs = flatrate
    .map((p) => PROVIDER_SLUG[p.provider_id])
    .filter(Boolean);

  if (serviceSlugs.length === 0) return "no_service";

  const hash = computeSyncHash(detail, providers);
  const existing = await prisma.title.findUnique({
    where: { tmdbId },
    select: { syncHash: true },
  });
  if (existing?.syncHash === hash) return "skipped";

  const now = new Date();
  const releaseDate = detail.release_date ? new Date(detail.release_date) : null;
  let status: TitleStatus = "CATALOG";
  if (releaseDate) {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (releaseDate > now) status = "UPCOMING";
    else if (releaseDate > thirtyDaysAgo) status = "NEW";
  }

  const director = credits.crew.find((c) => c.job === "Director");

  const title = await prisma.title.upsert({
    where: { tmdbId },
    update: {
      title: detail.title,
      logline: detail.overview || null,
      releaseDate,
      status,
      rating: detail.vote_average ? detail.vote_average.toFixed(1) : null,
      runtime: detail.runtime,
      genres: detail.genres.map((g) => g.name),
      tmdbPopularity: detail.popularity,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      credit: director?.name || null,
      syncHash: hash,
    },
    create: {
      tmdbId,
      title: detail.title,
      type: TitleType.FILM,
      logline: detail.overview || null,
      releaseDate,
      status,
      rating: detail.vote_average ? detail.vote_average.toFixed(1) : null,
      runtime: detail.runtime,
      genres: detail.genres.map((g) => g.name),
      tmdbPopularity: detail.popularity,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      credit: director?.name || null,
      syncHash: hash,
    },
  });

  const services = await prisma.service.findMany({
    where: { slug: { in: serviceSlugs } },
  });
  await prisma.titleService.deleteMany({ where: { titleId: title.id } });
  await prisma.titleService.createMany({
    data: services.map((s) => ({ titleId: title.id, serviceId: s.id })),
    skipDuplicates: true,
  });

  await prisma.castMember.deleteMany({ where: { titleId: title.id } });
  const castData = credits.cast.slice(0, 12).map((c, i) => ({
    titleId: title.id,
    name: c.name,
    role: c.character || null,
    photoPath: c.profile_path,
    sortOrder: i,
  }));
  if (castData.length > 0) {
    await prisma.castMember.createMany({ data: castData });
  }

  await prisma.crewMember.deleteMany({ where: { titleId: title.id } });
  const crewJobs = ["Director", "Writer", "Screenplay", "Producer", "Director of Photography", "Original Music Composer", "Editor"];
  const crewData = credits.crew
    .filter((c) => crewJobs.includes(c.job))
    .slice(0, 8)
    .map((c, i) => ({
      titleId: title.id,
      name: c.name,
      department: c.job,
      sortOrder: i,
    }));
  if (crewData.length > 0) {
    await prisma.crewMember.createMany({ data: crewData });
  }

  return "synced";
}

async function upsertTvShow(tmdbId: number): Promise<"synced" | "skipped" | "no_service"> {
  const [detail, credits, providers] = await Promise.all([
    tmdb.tvDetail(tmdbId),
    tmdb.tvCredits(tmdbId),
    tmdb.tvProviders(tmdbId),
  ]);

  const flatrate = providers.results?.US?.flatrate || [];
  const serviceSlugs = flatrate
    .map((p) => PROVIDER_SLUG[p.provider_id])
    .filter(Boolean);

  if (serviceSlugs.length === 0) return "no_service";

  const hash = computeSyncHash(detail, providers);
  const existing = await prisma.title.findUnique({
    where: { tmdbId },
    select: { syncHash: true },
  });
  if (existing?.syncHash === hash) return "skipped";

  const now = new Date();
  const releaseDate = detail.first_air_date ? new Date(detail.first_air_date) : null;
  let status: TitleStatus = "CATALOG";
  if (releaseDate) {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (releaseDate > now) status = "UPCOMING";
    else if (releaseDate > thirtyDaysAgo) status = "NEW";
  }

  const creator = detail.created_by?.[0]?.name || null;
  const avgRuntime = detail.episode_run_time?.length
    ? Math.round(detail.episode_run_time.reduce((a, b) => a + b, 0) / detail.episode_run_time.length)
    : null;

  const title = await prisma.title.upsert({
    where: { tmdbId },
    update: {
      title: detail.name,
      logline: detail.overview || null,
      releaseDate,
      status,
      rating: detail.vote_average ? detail.vote_average.toFixed(1) : null,
      runtime: avgRuntime,
      genres: detail.genres.map((g) => g.name),
      tmdbPopularity: detail.popularity,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      credit: creator,
      syncHash: hash,
    },
    create: {
      tmdbId,
      title: detail.name,
      type: TitleType.SERIES,
      logline: detail.overview || null,
      releaseDate,
      status,
      rating: detail.vote_average ? detail.vote_average.toFixed(1) : null,
      runtime: avgRuntime,
      genres: detail.genres.map((g) => g.name),
      tmdbPopularity: detail.popularity,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      credit: creator,
      syncHash: hash,
    },
  });

  const services = await prisma.service.findMany({
    where: { slug: { in: serviceSlugs } },
  });
  await prisma.titleService.deleteMany({ where: { titleId: title.id } });
  await prisma.titleService.createMany({
    data: services.map((s) => ({ titleId: title.id, serviceId: s.id })),
    skipDuplicates: true,
  });

  await prisma.castMember.deleteMany({ where: { titleId: title.id } });
  const castData = credits.cast.slice(0, 12).map((c, i) => ({
    titleId: title.id,
    name: c.name,
    role: c.character || null,
    photoPath: c.profile_path,
    sortOrder: i,
  }));
  if (castData.length > 0) {
    await prisma.castMember.createMany({ data: castData });
  }

  await prisma.crewMember.deleteMany({ where: { titleId: title.id } });
  const crewJobs = ["Director", "Writer", "Screenplay", "Producer", "Director of Photography", "Original Music Composer", "Editor"];
  const crewData = credits.crew
    .filter((c) => crewJobs.includes(c.job))
    .slice(0, 8)
    .map((c, i) => ({
      titleId: title.id,
      name: c.name,
      department: c.job,
      sortOrder: i,
    }));
  if (crewData.length > 0) {
    await prisma.crewMember.createMany({ data: crewData });
  }

  for (const s of detail.seasons.filter((s) => s.season_number > 0)) {
    const season = await prisma.season.upsert({
      where: {
        titleId_seasonNumber: { titleId: title.id, seasonNumber: s.season_number },
      },
      update: {
        episodeCount: s.episode_count,
        airDate: s.air_date ? new Date(s.air_date) : null,
      },
      create: {
        titleId: title.id,
        seasonNumber: s.season_number,
        episodeCount: s.episode_count,
        airDate: s.air_date ? new Date(s.air_date) : null,
      },
    });

    try {
      const seasonDetail = await tmdb.tvSeason(tmdbId, s.season_number);
      await prisma.episode.deleteMany({ where: { seasonId: season.id } });
      const epData = seasonDetail.episodes.map((ep) => ({
        seasonId: season.id,
        episodeNumber: ep.episode_number,
        title: ep.name || null,
        overview: ep.overview || null,
        airDate: ep.air_date ? new Date(ep.air_date) : null,
        runtime: ep.runtime,
      }));
      if (epData.length > 0) {
        await prisma.episode.createMany({ data: epData });
      }
    } catch {
      // Season detail may not be available yet
    }
  }

  return "synced";
}

async function discoverAllPages(
  fetcher: (page: number) => Promise<{ total_pages: number; results: { id: number }[] }>,
  maxPages = 500,
): Promise<number[]> {
  const ids: Set<number> = new Set();
  const first = await fetcher(1);
  for (const r of first.results) ids.add(r.id);
  const pages = Math.min(first.total_pages, maxPages);

  for (let page = 2; page <= pages; page++) {
    const res = await fetcher(page);
    for (const r of res.results) ids.add(r.id);
  }
  return [...ids];
}

export async function syncTmdbData(options: SyncOptions = {}) {
  const providerIds = Object.values(TMDB_PROVIDER_IDS);

  const movieIds = new Set<number>();
  const tvIds = new Set<number>();

  for (const providerId of providerIds) {
    const slugs = Object.entries(TMDB_PROVIDER_IDS).find(([, id]) => id === providerId);
    const label = slugs ? slugs[0] : String(providerId);
    console.log(`  Discovering movies on ${label}...`);
    const movies = await discoverAllPages((page) => tmdb.discoverMovies(providerId, page));
    for (const id of movies) movieIds.add(id);
    console.log(`    ${movies.length} movies (${movieIds.size} unique total)`);

    console.log(`  Discovering TV on ${label}...`);
    const tv = await discoverAllPages((page) => tmdb.discoverTv(providerId, page));
    for (const id of tv) tvIds.add(id);
    console.log(`    ${tv.length} shows (${tvIds.size} unique total)`);
  }

  console.log(`  Discovery complete: ${movieIds.size} movies, ${tvIds.size} TV shows`);

  let allIds: { type: "movie" | "tv"; id: number }[] = [
    ...[...movieIds].map((id) => ({ type: "movie" as const, id })),
    ...[...tvIds].map((id) => ({ type: "tv" as const, id })),
  ];

  if (options.limit && options.limit > 0) {
    allIds = allIds.slice(0, options.limit);
  }

  let synced = 0;
  let skipped = 0;
  const errors: string[] = [];
  const syncStart = Date.now();
  let lastLog = syncStart;

  const ticker = setInterval(() => {
    const elapsed = ((Date.now() - syncStart) / 1000).toFixed(0);
    const processed = synced + skipped + errors.length;
    const pct = allIds.length > 0 ? ((processed / allIds.length) * 100).toFixed(1) : "0";
    const rate = processed > 0 ? (processed / ((Date.now() - syncStart) / 1000)).toFixed(1) : "0";
    const remaining = processed > 0
      ? Math.round((allIds.length - processed) / (processed / ((Date.now() - syncStart) / 1000)))
      : "?";
    console.log(
      `  [${elapsed}s] ${processed}/${allIds.length} (${pct}%) | +${synced} synced, ${skipped} unchanged, ${errors.length} errors | ${rate}/s | ~${remaining}s left`
    );
    lastLog = Date.now();
  }, 10_000);

  for (const entry of allIds) {
    try {
      const result = entry.type === "movie"
        ? await upsertMovie(entry.id)
        : await upsertTvShow(entry.id);
      if (result === "synced") synced++;
      else if (result === "skipped") skipped++;
    } catch (e) {
      errors.push(`${entry.type}/${entry.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  clearInterval(ticker);

  const totalSeconds = ((Date.now() - syncStart) / 1000).toFixed(1);

  return {
    synced,
    skipped,
    errors,
    totalSeconds,
    total: allIds.length,
    movieCount: movieIds.size,
    tvCount: tvIds.size,
  };
}
