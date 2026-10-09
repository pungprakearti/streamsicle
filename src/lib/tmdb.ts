import { createHash } from "crypto";

const BASE = "https://api.themoviedb.org/3";
const RATE_LIMIT_MAX = 45;
const RATE_LIMIT_WINDOW_MS = 10_000;

const requestTimestamps: number[] = [];

async function rateLimit(): Promise<void> {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    const oldest = requestTimestamps[0];
    const waitMs = oldest + RATE_LIMIT_WINDOW_MS - now + 50;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return rateLimit();
  }
  requestTimestamps.push(Date.now());
}

function apiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key || key === "your-tmdb-api-key-here") {
    throw new Error("TMDB_API_KEY is not configured in .env");
  }
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  await rateLimit();
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`TMDB ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  popularity: number;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
}

export interface TmdbTvShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  popularity: number;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  popularity: number;
  vote_average: number;
  runtime: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  popularity: number;
  vote_average: number;
  episode_run_time: number[];
  number_of_seasons: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  seasons: {
    season_number: number;
    episode_count: number;
    air_date: string | null;
  }[];
  created_by: { name: string }[];
}

export interface TmdbCredits {
  cast: {
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    name: string;
    job: string;
    department: string;
  }[];
}

export interface TmdbSeasonDetail {
  episodes: {
    episode_number: number;
    name: string;
    overview: string;
    air_date: string | null;
    runtime: number | null;
  }[];
}

export interface TmdbReleaseDates {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string; type: number }[];
  }[];
}

export interface TmdbContentRatings {
  results: {
    iso_3166_1: string;
    rating: string;
  }[];
}

export interface TmdbWatchProviders {
  results: {
    US?: {
      flatrate?: { provider_id: number; provider_name: string }[];
    };
  };
}

export interface TmdbSearchResult {
  page: number;
  total_results: number;
  results: (TmdbMovie & TmdbTvShow & { media_type: string })[];
}

export interface TmdbPageResult<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

export const tmdb = {
  moviePopular: (page = 1) =>
    tmdbFetch<TmdbPageResult<TmdbMovie>>("/movie/popular", { page: String(page) }),

  tvPopular: (page = 1) =>
    tmdbFetch<TmdbPageResult<TmdbTvShow>>("/tv/popular", { page: String(page) }),

  movieTrending: () =>
    tmdbFetch<TmdbPageResult<TmdbMovie>>("/trending/movie/week"),

  tvTrending: () =>
    tmdbFetch<TmdbPageResult<TmdbTvShow>>("/trending/tv/week"),

  movieDetail: (id: number) =>
    tmdbFetch<TmdbMovieDetail>(`/movie/${id}`),

  tvDetail: (id: number) =>
    tmdbFetch<TmdbTvDetail>(`/tv/${id}`),

  movieCredits: (id: number) =>
    tmdbFetch<TmdbCredits>(`/movie/${id}/credits`),

  tvCredits: (id: number) =>
    tmdbFetch<TmdbCredits>(`/tv/${id}/credits`),

  tvSeason: (tvId: number, seasonNumber: number) =>
    tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`),

  movieReleaseDates: (id: number) =>
    tmdbFetch<TmdbReleaseDates>(`/movie/${id}/release_dates`),

  tvContentRatings: (id: number) =>
    tmdbFetch<TmdbContentRatings>(`/tv/${id}/content_ratings`),

  movieProviders: (id: number) =>
    tmdbFetch<TmdbWatchProviders>(`/movie/${id}/watch/providers`),

  tvProviders: (id: number) =>
    tmdbFetch<TmdbWatchProviders>(`/tv/${id}/watch/providers`),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch<TmdbSearchResult>("/search/multi", { query, page: String(page) }),

  watchProviders: (type: "movie" | "tv") =>
    tmdbFetch<{ results: { provider_id: number; provider_name: string }[] }>(
      `/watch/providers/${type}`,
      { watch_region: "US" },
    ),

  discoverMovies: (providerId: number, page = 1) =>
    tmdbFetch<TmdbPageResult<TmdbMovie>>("/discover/movie", {
      with_watch_providers: String(providerId),
      watch_region: "US",
      with_watch_monetization_types: "flatrate",
      sort_by: "popularity.desc",
      page: String(page),
    }),

  discoverTv: (providerId: number, page = 1) =>
    tmdbFetch<TmdbPageResult<TmdbTvShow>>("/discover/tv", {
      with_watch_providers: String(providerId),
      watch_region: "US",
      with_watch_monetization_types: "flatrate",
      sort_by: "popularity.desc",
      page: String(page),
    }),

  movieChanges: (startDate: string, page = 1) =>
    tmdbFetch<TmdbPageResult<{ id: number }>>("/movie/changes", {
      start_date: startDate,
      page: String(page),
    }),

  tvChanges: (startDate: string, page = 1) =>
    tmdbFetch<TmdbPageResult<{ id: number }>>("/tv/changes", {
      start_date: startDate,
      page: String(page),
    }),
};

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

export function genreIdsToNames(ids: number[]): string[] {
  return ids.map((id) => GENRE_MAP[id] || "Unknown").filter((g) => g !== "Unknown");
}

export function extractMovieContentRating(data: TmdbReleaseDates): string | null {
  const us = data.results.find((r) => r.iso_3166_1 === "US");
  if (!us) return null;
  const theatrical = us.release_dates.find((r) => r.type === 3);
  const any = theatrical || us.release_dates.find((r) => r.certification);
  return any?.certification || null;
}

export function extractTvContentRating(data: TmdbContentRatings): string | null {
  const us = data.results.find((r) => r.iso_3166_1 === "US");
  return us?.rating || null;
}

export function computeSyncHash(
  detail: TmdbMovieDetail | TmdbTvDetail,
  providers: TmdbWatchProviders,
  contentRating?: string | null,
): string {
  const title = "title" in detail ? detail.title : detail.name;
  const payload = JSON.stringify({
    title,
    overview: detail.overview,
    vote_average: detail.vote_average,
    popularity: detail.popularity,
    poster_path: detail.poster_path,
    backdrop_path: detail.backdrop_path,
    genres: detail.genres.map((g) => g.id).sort(),
    providers: (providers.results?.US?.flatrate || []).map((p) => p.provider_id).sort(),
    contentRating: contentRating || null,
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}
