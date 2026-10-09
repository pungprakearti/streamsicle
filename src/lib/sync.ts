import { prisma } from "@/lib/db";
import { tmdb, computeSyncHash, extractMovieContentRating, extractTvContentRating } from "@/lib/tmdb";
import { TMDB_PROVIDER_IDS, SERVICES } from "@/lib/constants";
import { TitleType, TitleStatus } from "@prisma/client";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { ProgressBar } from "@/lib/progress";

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
  onPage?: (page: number, totalPages: number) => void,
): Promise<number[]> {
  const ids: Set<number> = new Set();
  const first = await fetcher(1);
  for (const r of first.results) ids.add(r.id);
  const pages = Math.min(first.total_pages, maxPages);
  onPage?.(1, pages);

  for (let page = 2; page <= pages; page++) {
    const res = await fetcher(page);
    for (const r of res.results) ids.add(r.id);
    onPage?.(page, pages);
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

  const services = Object.entries(providerIds);
  const progress = new ProgressBar({ label: "Discovering", total: services.length * 2 });
  progress.start();
  let tasksDone = 0;

  for (const [slug, providerId] of services) {
    progress.log(`  Discovering movies on ${slug}...`);
    const movies = await discoverAllPages(
      (page) => tmdb.discoverMovies(providerId, page),
      500,
      (page, totalPages) => {
        progress.update(tasksDone + page / totalPages);
      },
    );
    for (const id of movies) movieIds.add(id);
    tasksDone++;
    progress.update(tasksDone);
    progress.log(`    ${movies.length} movies (${movieIds.size} unique total)`);

    progress.log(`  Discovering TV on ${slug}...`);
    const tv = await discoverAllPages(
      (page) => tmdb.discoverTv(providerId, page),
      500,
      (page, totalPages) => {
        progress.update(tasksDone + page / totalPages);
      },
    );
    for (const id of tv) tvIds.add(id);
    tasksDone++;
    progress.update(tasksDone);
    progress.log(`    ${tv.length} shows (${tvIds.size} unique total)`);
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

  progress.stop(`Discovery complete: ${movieIds.size} movies, ${tvIds.size} TV shows\nSaved to data/discovery.json`);

  return data;
}

export function loadDiscovery(): DiscoveryData | null {
  if (!existsSync(DISCOVERY_PATH)) return null;
  return JSON.parse(readFileSync(DISCOVERY_PATH, "utf-8"));
}

async function upsertMovie(tmdbId: number): Promise<"synced" | "skipped" | "no_service"> {
  const [detail, credits, providers, releaseDates] = await Promise.all([
    tmdb.movieDetail(tmdbId),
    tmdb.movieCredits(tmdbId),
    tmdb.movieProviders(tmdbId),
    tmdb.movieReleaseDates(tmdbId),
  ]);

  const flatrate = providers.results?.US?.flatrate || [];
  const serviceSlugs = flatrate
    .map((p) => PROVIDER_SLUG[p.provider_id])
    .filter(Boolean);

  if (serviceSlugs.length === 0) return "no_service";

  const contentRating = extractMovieContentRating(releaseDates);
  const hash = computeSyncHash(detail, providers, contentRating);
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
      contentRating,
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
      contentRating,
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
  const [detail, credits, providers, contentRatings] = await Promise.all([
    tmdb.tvDetail(tmdbId),
    tmdb.tvCredits(tmdbId),
    tmdb.tvProviders(tmdbId),
    tmdb.tvContentRatings(tmdbId),
  ]);

  const flatrate = providers.results?.US?.flatrate || [];
  const serviceSlugs = flatrate
    .map((p) => PROVIDER_SLUG[p.provider_id])
    .filter(Boolean);

  if (serviceSlugs.length === 0) return "no_service";

  const contentRating = extractTvContentRating(contentRatings);
  const hash = computeSyncHash(detail, providers, contentRating);
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
      contentRating,
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
      contentRating,
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
  resume?: boolean;
  chunkSize?: number;
}

const CHUNK_SIZE = 500;
const CONCURRENCY = 8;

function saveDiscovery(data: DiscoveryData) {
  writeFileSync(DISCOVERY_PATH, JSON.stringify(data, null, 2));
}

async function findResumableRun() {
  return prisma.syncRun.findFirst({
    where: { status: "running" },
    include: { chunks: { orderBy: { index: "asc" } } },
    orderBy: { startedAt: "desc" },
  });
}

async function processChunk(
  chunk: { id: string; ids: string },
  progress: ProgressBar,
  globalOffset: number,
) {
  const entries: { type: "movie" | "tv"; id: number }[] = JSON.parse(chunk.ids);
  let synced = 0;
  let skipped = 0;
  let noService = 0;
  const errors: string[] = [];

  await prisma.syncChunk.update({
    where: { id: chunk.id },
    data: { status: "running", startedAt: new Date() },
  });

  const queue = [...entries];
  let idx = 0;

  async function worker() {
    while (idx < queue.length) {
      const i = idx++;
      const entry = queue[i];
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
      progress.increment();
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  await prisma.syncChunk.update({
    where: { id: chunk.id },
    data: {
      status: "completed",
      synced,
      skipped,
      noService,
      errors,
      finishedAt: new Date(),
    },
  });

  return { synced, skipped, noService, errors };
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

  // Check for a resumable run
  const existingRun = await findResumableRun();
  if (existingRun && !options.full) {
    return resumePull(existingRun, data);
  }
  if (existingRun && options.full) {
    await prisma.syncRun.update({
      where: { id: existingRun.id },
      data: { status: "failed", finishedAt: new Date() },
    });
  }

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

  const chunkSize = options.chunkSize || CHUNK_SIZE;
  const chunks: { type: "movie" | "tv"; id: number }[][] = [];
  for (let i = 0; i < allIds.length; i += chunkSize) {
    chunks.push(allIds.slice(i, i + chunkSize));
  }

  const run = await prisma.syncRun.create({
    data: {
      mode: canIncremental ? "incremental" : "full",
      totalTitles: allIds.length,
      chunkSize,
      chunks: {
        create: chunks.map((ids, i) => ({
          index: i,
          ids: JSON.stringify(ids),
        })),
      },
    },
    include: { chunks: { orderBy: { index: "asc" } } },
  });

  console.log(`Created ${chunks.length} chunks of ~${chunkSize} titles`);

  const progress = new ProgressBar({ label: "Pulling titles", total: allIds.length });
  progress.start();

  let synced = 0;
  let skipped = 0;
  let noService = 0;
  const errors: string[] = [];

  for (const chunk of run.chunks) {
    progress.log(`  Chunk ${chunk.index + 1}/${chunks.length}`);
    const result = await processChunk(chunk, progress, 0);
    synced += result.synced;
    skipped += result.skipped;
    noService += result.noService;
    errors.push(...result.errors);

    await prisma.syncRun.update({
      where: { id: run.id },
      data: { synced, skipped, noService, errorCount: errors.length },
    });
  }

  const totalSeconds = progress.getElapsed().toFixed(1);
  progress.stop(`Pull complete: +${synced} synced, ${skipped} unchanged, ${noService} no svc, ${errors.length} errors`);

  await prisma.syncRun.update({
    where: { id: run.id },
    data: { status: "completed", finishedAt: new Date() },
  });

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
    resumed: false,
  };
}

async function resumePull(
  run: Awaited<ReturnType<typeof findResumableRun>> & {},
  data: DiscoveryData,
) {
  const completedChunks = run.chunks.filter((c) => c.status === "completed");
  const pendingChunks = run.chunks.filter((c) => c.status !== "completed");
  const completedCount = completedChunks.reduce(
    (sum, c) => sum + (JSON.parse(c.ids) as unknown[]).length, 0,
  );

  console.log(`Resuming run from ${new Date(run.startedAt).toISOString()}`);
  console.log(`  ${completedChunks.length}/${run.chunks.length} chunks done, ${pendingChunks.length} remaining`);

  let synced = completedChunks.reduce((s, c) => s + c.synced, 0);
  let skipped = completedChunks.reduce((s, c) => s + c.skipped, 0);
  let noService = completedChunks.reduce((s, c) => s + c.noService, 0);
  const errors: string[] = completedChunks.flatMap((c) => c.errors);

  const progress = new ProgressBar({ label: "Pulling titles (resumed)", total: run.totalTitles });
  progress.start();
  progress.update(completedCount);

  for (const chunk of pendingChunks) {
    progress.log(`  Chunk ${chunk.index + 1}/${run.chunks.length} (resumed)`);
    const result = await processChunk(chunk, progress, completedCount);
    synced += result.synced;
    skipped += result.skipped;
    noService += result.noService;
    errors.push(...result.errors);

    await prisma.syncRun.update({
      where: { id: run.id },
      data: { synced, skipped, noService, errorCount: errors.length },
    });
  }

  const totalSeconds = progress.getElapsed().toFixed(1);
  progress.stop(`Pull complete (resumed): +${synced} synced, ${skipped} unchanged, ${noService} no svc, ${errors.length} errors`);

  await prisma.syncRun.update({
    where: { id: run.id },
    data: { status: "completed", finishedAt: new Date() },
  });

  data.lastPulledAt = new Date().toISOString();
  saveDiscovery(data);

  return {
    synced,
    skipped,
    noService,
    errors,
    totalSeconds,
    total: run.totalTitles,
    movieCount: data.movies.length,
    tvCount: data.tv.length,
    incremental: run.mode === "incremental",
    resumed: true,
  };
}
