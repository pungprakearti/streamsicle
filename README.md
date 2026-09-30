# Streamsicle

A local streaming content ledger for tracking what's available across your family's streaming services.

## Features

- Browse content across Netflix, Prime Video, Disney+, Max, Apple TV+, Hulu, Paramount+, and Peacock
- Family profiles with shared watchlist (see who added what)
- Search by title, genre, director, or service
- Track new releases and upcoming titles
- Title details with cast, crew, seasons, and episodes
- Popularity rankings from TMDB

## Setup

1. **Prerequisites**: Node.js 20+, PostgreSQL 16+
2. **Install dependencies**: `npm install`
3. **Configure environment**: Copy `.env.example` to `.env` and add your [TMDB API key](https://www.themoviedb.org/settings/api)
4. **Create database**: `createdb streamsicle`
5. **Run migrations**: `npx prisma migrate dev`
6. **Seed services**: `npm run seed`
7. **Start dev server**: `npm run dev`

Open [http://localhost:3968](http://localhost:3968).

## Syncing content

Streamsicle pulls its catalog from TMDB in two phases:

### 1. Discover (run once a day)

```bash
npm run sync:discover
```

Fetches every movie and TV show available on your 8 streaming services from TMDB's discover API. Saves all title IDs to `data/discovery.json`. Also auto-resolves the latest TMDB provider IDs and updates `src/lib/constants.ts` if they've changed.

Takes ~8 minutes due to API rate limiting.

### 2. Pull (run anytime)

```bash
npm run sync:pull
```

Reads the cached discovery and pulls title details, cast, crew, and service availability into the database. Only titles available via subscription streaming are saved - rent/purchase-only titles are skipped. Unchanged titles are detected via sync hash and skipped.

Prints progress every 10 seconds with count, rate, and estimated time remaining.

Use `--limit` for a partial pull:

```bash
npm run sync:pull -- --limit 100
```

### Status

```bash
npm run sync:status
```

Shows when the last discovery was run and how many titles are queued.

### Recommended workflow

```bash
npm run sync:discover          # Once a day
npm run sync:pull              # After discovery, or anytime to pick up where you left off
```

The app stays fully usable during a pull - new titles appear as they're synced.

## Stack

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS
- TMDB API for content data and images
- Phosphor Icons

## Version

v0.0.18
