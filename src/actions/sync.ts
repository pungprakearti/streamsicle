"use server";

import { prisma } from "@/lib/db";
import { tmdb, genreIdsToNames } from "@/lib/tmdb";
import { TMDB_PROVIDER_IDS } from "@/lib/constants";
import { TitleType, TitleStatus } from "@prisma/client";

const PROVIDER_SLUG = Object.fromEntries(
  Object.entries(TMDB_PROVIDER_IDS).map(([slug, id]) => [id, slug])
);

async function upsertMovie(tmdbId: number) {
  const [detail, credits, providers] = await Promise.all([
    tmdb.movieDetail(tmdbId),
    tmdb.movieCredits(tmdbId),
    tmdb.movieProviders(tmdbId),
  ]);

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
    },
  });

  const flatrate = providers.results?.US?.flatrate || [];
  const serviceSlugs = flatrate
    .map((p) => PROVIDER_SLUG[p.provider_id])
    .filter(Boolean);

  if (serviceSlugs.length > 0) {
    const services = await prisma.service.findMany({
      where: { slug: { in: serviceSlugs } },
    });
    await prisma.titleService.deleteMany({ where: { titleId: title.id } });
    await prisma.titleService.createMany({
      data: services.map((s) => ({ titleId: title.id, serviceId: s.id })),
      skipDuplicates: true,
    });
  }

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

  return title;
}

async function upsertTvShow(tmdbId: number) {
  const [detail, credits, providers] = await Promise.all([
    tmdb.tvDetail(tmdbId),
    tmdb.tvCredits(tmdbId),
    tmdb.tvProviders(tmdbId),
  ]);

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
    },
  });

  const flatrate = providers.results?.US?.flatrate || [];
  const serviceSlugs = flatrate
    .map((p) => PROVIDER_SLUG[p.provider_id])
    .filter(Boolean);

  if (serviceSlugs.length > 0) {
    const services = await prisma.service.findMany({
      where: { slug: { in: serviceSlugs } },
    });
    await prisma.titleService.deleteMany({ where: { titleId: title.id } });
    await prisma.titleService.createMany({
      data: services.map((s) => ({ titleId: title.id, serviceId: s.id })),
      skipDuplicates: true,
    });
  }

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

  return title;
}

export async function syncTmdbData() {
  const [moviePop1, moviePop2, tvPop1, tvPop2, movieTrending, tvTrending] =
    await Promise.all([
      tmdb.moviePopular(1),
      tmdb.moviePopular(2),
      tmdb.tvPopular(1),
      tmdb.tvPopular(2),
      tmdb.movieTrending(),
      tmdb.tvTrending(),
    ]);

  const movieIds = new Set<number>();
  const tvIds = new Set<number>();

  for (const m of [...moviePop1.results, ...moviePop2.results, ...movieTrending.results]) {
    movieIds.add(m.id);
  }
  for (const t of [...tvPop1.results, ...tvPop2.results, ...tvTrending.results]) {
    tvIds.add(t.id);
  }

  let synced = 0;
  const errors: string[] = [];

  for (const id of movieIds) {
    try {
      await upsertMovie(id);
      synced++;
    } catch (e) {
      errors.push(`movie/${id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  for (const id of tvIds) {
    try {
      await upsertTvShow(id);
      synced++;
    } catch (e) {
      errors.push(`tv/${id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { synced, errors, movieCount: movieIds.size, tvCount: tvIds.size };
}
