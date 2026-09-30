# Sync System

Streamsicle pulls its catalog from TMDB. The sync is split into two phases so discovery (slow, API-heavy) only runs once a day while data pulls can run multiple times.

## Phase 1: Discover

`npm run sync:discover`

1. Fetches current streaming provider IDs from TMDB and updates `src/lib/constants.ts` automatically (provider IDs change over time - e.g. Paramount+ moved from 531 to 2303)
2. Uses TMDB's `/discover/movie` and `/discover/tv` endpoints filtered by each of the 8 services with `watch_region=US` and `with_watch_monetization_types=flatrate`
3. Pages through all results per service (up to 500 pages each)
4. Deduplicates across services and saves all IDs to `data/discovery.json`

Discovery takes ~8 minutes due to API rate limiting. The cache includes timestamps so you know how stale it is.

## Phase 2: Pull

`npm run sync:pull [--limit N]`

1. Reads `data/discovery.json`
2. For each title, fetches detail + credits + watch providers (3 API calls)
3. Checks provider data to confirm the title is still on a tracked service (safety net)
4. Computes a sync hash (SHA-256 of key fields) and skips unchanged titles
5. Upserts title, services, cast, crew (and seasons/episodes for TV)
6. Prints progress every 10 seconds: count, percentage, rate, ETA

A full pull of ~33k titles takes several hours at ~1.1 titles/sec (rate limited to 35 API calls per 10 seconds).

## Services tracked

| Service | TMDB Provider ID |
|---------|-----------------|
| Netflix | 8 |
| Prime Video | 9 |
| Disney+ | 337 |
| Max | 1825 |
| Apple TV+ | 350 |
| Hulu | 15 |
| Paramount+ | 2303 |
| Peacock | 386 |

Provider IDs are auto-resolved during discovery. The table above may be outdated - check `src/lib/constants.ts` for current values.

## Filtering

Only titles available via flatrate (subscription) streaming on at least one tracked service are saved. Titles only available for rent/purchase are excluded. This keeps the catalog focused on "what can we watch right now."

## Files

- `src/lib/sync.ts` - Discovery and pull logic
- `src/lib/tmdb.ts` - TMDB API client with rate limiting
- `src/scripts/sync-cli.ts` - CLI entry point
- `data/discovery.json` - Cached discovery (gitignored)
- `src/lib/constants.ts` - Provider IDs (auto-updated by discover)
