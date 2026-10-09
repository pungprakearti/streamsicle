# Streamsicle

Local-only Next.js streaming ledger. Multi-profile family watchlist app.

## Key paths

- `src/app/` - App Router pages
- `src/app/(app)/layout.tsx` - Main app shell (separate mobile/desktop headers)
- `src/lib/tmdb.ts` - TMDB API client (rate-limited, discover, watch providers)
- `src/lib/constants.ts` - Services, avatars, version, TMDB provider IDs
- `src/lib/sync.ts` - Sync engine: discover (catalog IDs) and pull (title data)
- `src/scripts/sync-cli.ts` - CLI: `discover`, `pull`, `status` subcommands
- `src/actions/` - Server actions (watchlist, profiles)
- `src/components/` - UI components (Logo, MobileNav, ProfilePicker, etc.)
- `prisma/schema.prisma` - DB schema
- `data/discovery.json` - Cached discovery results (gitignored)

## Docs

- [Schema](docs/schema.md)
- [API integration](docs/api.md)
- [Sync system](docs/sync.md)
- [Next steps](docs/next-steps.md)

## Current version

v1.0.9

## Status

Mobile-responsive UI complete. Sync discover/pull system working. First full catalog sync in progress (~33k titles across 8 services). GitHub repo: pungprakearti/streamsicle.

## Sync commands

```bash
npm run sync:discover        # Fetch all title IDs from TMDB (once a day)
npm run sync:pull            # Pull title data into DB
npm run sync:pull -- --limit 50  # Pull with limit
npm run sync:status          # Show discovery cache info
```

## Dev

```bash
npm run dev                  # Runs on port 3968
```

LAN access: `http://192.168.0.87:3968`
