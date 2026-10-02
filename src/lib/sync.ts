import { prisma } from "@/lib/db";
import { tmdb, computeSyncHash } from "@/lib/tmdb";
import { TMDB_PROVIDER_IDS, SERVICES } from "@/lib/constants";
import { TitleType, TitleStatus } from "@prisma/client";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DISCOVERY_PATH = join(process.cwd(), "data", "discovery.json");

const PROVIDER_SLUG = Object.fromEntries(
  Object.entries(TMDB_PROVIDER_IDS).map(([slug, id]) => [id, slug])
);

export interface DiscoveryData {
  discoveredAt: string;
  lastPulledAt?: string;
  movies: number[];
  tv: number[];
  providerIds: Record<string, number>;
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

async function resolveProviderIds(): Promise<Record<string, number>> {
  const movieProviders = await tmdb.watchProviders("movie");
  const tvProviders = await tmdb.watchProviders("tv");
  const all = [...movieProviders.results, ...tvProviders.results];

  const SERVICE_SEARCH: Record<string, string[]> = {
    netflix: ["netflix"],
    prime: ["amazon prime video"],
    disney: ["disney plus", "disney+"],
    max: ["max"],
    apple: ["apple tv plus", "apple tv+"],
    hulu: ["hulu"],
    paramount: ["paramount plus premium", "paramount+ premium", "paramount plus", "paramount+"],
    peacock: ["peacock premium", "peacock premium plus", "peacock"],
  };

  const resolved: Record<string, number> = {};

  for (const service of SERVICES) {
    const searchTerms = SERVICE_SEARCH[service.slug] || [service.slug];
    let match = null;
    for (const term of searchTerms) {
      match = all.find((p) => p.provider_name.toLowerCase() === term);
      if (match) break;
    }
    if (!match) {
      for (const term of searchTerms) {
        match = all.find((p) => p.provider_name.toLowerCase().includes(term));
        if (match) break;
      }
    }
    if (match) {
      resolved[service.slug] = match.provider_id;
      console.log(`  ${service.name}: provider_id=${match.provider_id} (${match.provider_name})`);
    } else {
      resolved[service.slug] = TMDB_PROVIDER_IDS[service.slug];
      console.log(`  ${service.name}: using fallback provider_id=${resolved[service.slug]}`);
    }
  }

  return resolved;
}

async function updateConstantsFile(providerIds: Record<string, number>): Promise<boolean> {
  const constantsPath = join(process.cwd(), "src", "lib", "constants.ts");
  const content = readFileSync(constantsPath, "utf-8");

  const lines = Object.entries(providerIds)
    .map(([slug, id]) => `  ${slug}: ${id},`)
    .join("\n");
  const newBlock = `export const TMDB_PROVIDER_IDS: Record<string, number> = {\n${lines}\n};`;

  const re = /export const TMDB_PROVIDER_IDS: Record<string, number> = \{[^}]+\};/;
  if (!re.test(content)) return false;

  const updated = content.replace(re, newBlock);
  if (updated === content) return false;

  writeFileSync(constantsPath, updated);
  return true;
}

export async function discover(): Promise<DiscoveryData> {
  console.log("Resolving provider IDs from TMDB...");
  const providerIds = await resolveProviderIds();

  const changed = await updateConstantsFile(providerIds);
  if (changed) {
    console.log("  Updated src/lib/constants.ts with new provider IDs");
  } else {
    console.log("  Provider IDs unchanged");
  }

  const movieIds = new Set<number>();
  const tvIds = new Set<number>();

  for (const [slug, providerId] of Object.entries(providerIds)) {
    console.log(`  Discovering movies on ${slug}...`);
    const movies = await discoverAllPages((page) => tmdb.discoverMovies(providerId, page));
    for (const id of movies) movieIds.add(id);
    console.log(`    ${movies.length} movies (${movieIds.size} unique total)`);

    console.log(`  Discovering TV on ${slug}...`);
    const tv = await discoverAllPages((page) => tmdb.discoverTv(providerId, page));
    for (const id of tv) tvIds.add(id);
    console.log(`    ${tv.length} shows (${tvIds.size} unique total)`);
  }

  // Preserve lastPulledAt from previous discovery so incremental pull keeps working
  const previous = loadDiscovery();
  const data: DiscoveryData = {
    discoveredAt: new Date().toISOString(),
    lastPulledAt: previous?.lastPulledAt,
    movies: [...movieIds],
    tv: [...tvIds],
    providerIds,
  };

  if (!existsSync(join(process.cwd(), "data"))) {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });
  }
  writeFileSync(DISCOVERY_PATH, JSON.stringify(data, null, 2));

  console.log(`Discovery complete: ${movieIds.size} movies, ${tvIds.size} TV shows`);
  console.log(`Saved to data/discovery.json`);

  return data;
}

export function loadDiscovery(): DiscoveryData | null {
  if (!existsSync(DISCOVERY_PATH)) return null;
  return JSON.parse(readFileSync(DISCOVERY_PATH, "utf-8"));
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

async function fetchChangedIds(
  type: "movie" | "tv",
  since: string,
): Promise<Set<number>> {
  const ids = new Set<number>();
  const fetcher = type === "movie" ? tmdb.movieChanges : tmdb.tvChanges;
  const first = await fetcher(since, 1);
  for (const r of first.results) ids.add(r.id);
  const pages = Math.min(first.total_pages, 500);
  for (let page = 2; page <= pages; page++) {
    const res = await fetcher(since, page);
    for (const r of res.results) ids.add(r.id);
  }
  return ids;
}

export interface PullOptions {
  limit?: number;
  full?: boolean;
}

function saveDiscovery(data: DiscoveryData) {
  writeFileSync(DISCOVERY_PATH, JSON.stringify(data, null, 2));
}

export async function pull(options: PullOptions = {}) {
  const data = loadDiscovery();
  if (!data) {
    throw new Error("No discovery data found. Run 'npm run sync:discover' first.");
  }

  const age = Date.now() - new Date(data.discoveredAt).getTime();
  const hoursAgo = (age / 3600_000).toFixed(1);
  console.log(`Using discovery from ${data.discoveredAt} (${hoursAgo}h ago)`);
  console.log(`  ${data.movies.length} movies, ${data.tv.length} TV shows`);

  // If lastPulledAt is missing but DB already has titles, recover it from the DB
  if (!data.lastPulledAt && !options.full) {
    const latest = await prisma.title.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    if (latest?.updatedAt) {
      data.lastPulledAt = latest.updatedAt.toISOString();
      saveDiscovery(data);
      console.log(`  Recovered lastPulledAt from DB: ${data.lastPulledAt}`);
    }
  }

  const canIncremental = !options.full && data.lastPulledAt;
  let changedMovieIds: Set<number> | null = null;
  let changedTvIds: Set<number> | null = null;

  if (canIncremental) {
    const sinceDate = data.lastPulledAt!.slice(0, 10);
    console.log(`Incremental mode: fetching changes since ${sinceDate}...`);
    changedMovieIds = await fetchChangedIds("movie", sinceDate);
    changedTvIds = await fetchChangedIds("tv", sinceDate);
    console.log(`  ${changedMovieIds.size} movies and ${changedTvIds.size} TV shows changed`);
  } else {
    console.log(`Full pull mode`);
  }

  let allIds: { type: "movie" | "tv"; id: number }[] = [
    ...data.movies
      .filter((id) => !changedMovieIds || changedMovieIds.has(id))
      .map((id) => ({ type: "movie" as const, id })),
    ...data.tv
      .filter((id) => !changedTvIds || changedTvIds.has(id))
      .map((id) => ({ type: "tv" as const, id })),
  ];

  if (options.limit && options.limit > 0) {
    allIds = allIds.slice(0, options.limit);
  }

  let synced = 0;
  let skipped = 0;
  let noService = 0;
  const errors: string[] = [];
  const syncStart = Date.now();

  const ticker = setInterval(() => {
    const elapsed = ((Date.now() - syncStart) / 1000).toFixed(0);
    const processed = synced + skipped + noService + errors.length;
    const pct = allIds.length > 0 ? ((processed / allIds.length) * 100).toFixed(1) : "0";
    const rate = processed > 0 ? (processed / ((Date.now() - syncStart) / 1000)).toFixed(1) : "0";
    const remaining = processed > 0
      ? Math.round((allIds.length - processed) / (processed / ((Date.now() - syncStart) / 1000)))
      : "?";
    const mins = Math.floor(Number(remaining) / 60);
    const secs = Number(remaining) % 60;
    console.log(
      `  [${elapsed}s] ${processed}/${allIds.length} (${pct}%) | +${synced} synced, ${skipped} unchanged, ${noService} no svc, ${errors.length} err | ${rate}/s | ~${mins}m${secs}s left`
    );
  }, 10_000);

  for (const entry of allIds) {
    try {
      const result = entry.type === "movie"
        ? await upsertMovie(entry.id)
        : await upsertTvShow(entry.id);
      if (result === "synced") synced++;
      else if (result === "skipped") skipped++;
      else noService++;
    } catch (e) {
      errors.push(`${entry.type}/${entry.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  clearInterval(ticker);

  const totalSeconds = ((Date.now() - syncStart) / 1000).toFixed(1);

  data.lastPulledAt = new Date().toISOString();
  saveDiscovery(data);

  return {
    synced,
    skipped,
    noService,
    errors,
    totalSeconds,
    total: allIds.length,
    movieCount: data.movies.length,
    tvCount: data.tv.length,
    incremental: !!changedMovieIds,
  };
}
