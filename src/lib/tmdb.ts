const BASE = "https://api.themoviedb.org/3";

function apiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key || key === "your-tmdb-api-key-here") {
    throw new Error("TMDB_API_KEY is not configured in .env");
  }
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
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

  movieProviders: (id: number) =>
    tmdbFetch<TmdbWatchProviders>(`/movie/${id}/watch/providers`),

  tvProviders: (id: number) =>
    tmdbFetch<TmdbWatchProviders>(`/tv/${id}/watch/providers`),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch<TmdbSearchResult>("/search/multi", { query, page: String(page) }),
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
