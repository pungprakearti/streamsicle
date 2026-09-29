# TMDB API Integration

## Data source

All title data comes from [TMDB](https://www.themoviedb.org/) via their v3 REST API.

## Endpoints used

- `/movie/popular`, `/tv/popular` - Popular content for initial catalog
- `/trending/movie/week`, `/trending/tv/week` - Trending for "new" content
- `/movie/{id}`, `/tv/{id}` - Full title details
- `/movie/{id}/credits`, `/tv/{id}/credits` - Cast and crew
- `/tv/{id}/season/{n}` - Episode listings
- `/movie/{id}/watch/providers`, `/tv/{id}/watch/providers` - Which services carry the title
- `/search/multi` - Cross-type search

## Images

Served directly from `image.tmdb.org/t/p/{size}/{path}`. Common sizes: `w185`, `w342`, `w500`, `w780`, `original`.

## Provider mapping

TMDB provider IDs for our 8 services are mapped in `src/lib/constants.ts`.

## Sync

The sync action (`src/actions/sync.ts`) fetches popular/trending titles and upserts them into the database with provider info, credits, and season data.
