# Database Schema

## Tables

- **profiles** - Family member profiles (name, avatar)
- **services** - 8 streaming services (Netflix, Prime, Disney+, Max, Apple TV+, Hulu, Paramount+, Peacock)
- **titles** - Movies and series from TMDB
- **title_services** - Which services carry each title
- **watchlist** - Per-profile saved titles with timestamp
- **cast_members** - Actors per title
- **crew_members** - Directors, writers, etc. per title
- **seasons** - TV show seasons
- **episodes** - Episodes within seasons

## Key relationships

- Title <-> Service: many-to-many via title_services
- Title <-> Profile: many-to-many via watchlist (with added_at timestamp)
- Title -> CastMember/CrewMember: one-to-many
- Title -> Season -> Episode: hierarchical

See `prisma/schema.prisma` for the full definition.
