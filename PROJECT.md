# Streamsicle

Local-only Next.js streaming ledger. Multi-profile family watchlist app.

## Key paths

- `src/app/` - App Router pages
- `src/lib/tmdb.ts` - TMDB API client
- `src/lib/constants.ts` - Services, avatars, version
- `src/actions/` - Server actions (sync, watchlist, profiles)
- `src/lib/sync.ts` - TMDB sync engine (rate-limited, hash-based change detection)
- `src/scripts/sync-cli.ts` - Standalone sync CLI (`npm run sync -- --limit 10`)
- `prisma/schema.prisma` - DB schema

## Docs

- [Schema](docs/schema.md)
- [API integration](docs/api.md)
- [Next steps](docs/next-steps.md)

## Current version

v0.0.10

## Status

Pre-sync items (rate limiting, sync hash, CLI script) complete. Ready for first sync.
