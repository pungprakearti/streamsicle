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
7. **Sync TMDB data**: Visit `/api/sync` after starting the app, or use the sync button in the UI
8. **Start dev server**: `npm run dev`

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS
- TMDB API for content data and images
- Phosphor Icons

## Version

v0.0.7
