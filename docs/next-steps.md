# Next Steps

## Done

1. **Rate limiting** - Token bucket in `src/lib/tmdb.ts`, 35 req/10s
2. **Sync hash** - `sync_hash` column on titles, SHA-256 of key fields, skips unchanged titles
3. **CLI sync script** - Discover/pull split with progress tracking
4. **Full catalog discovery** - TMDB discover API per service, ~33k titles across 8 services
5. **Provider ID auto-resolution** - Discover phase fetches current IDs from TMDB and updates constants.ts
6. **Filter non-streaming titles** - Only titles available via flatrate subscription are synced
7. **Mobile responsiveness** - Separate mobile/desktop headers, responsive grids, profile picker sizing
8. **Mobile navigation** - Hamburger menu with nav drawer, auto-closes on navigation
9. **Port 3968** - Dedicated port to avoid conflicts with other dev servers
10. **LAN access** - Windows firewall rule + port forwarding from 192.168.0.87:3968 to WSL2
11. **GitHub repo** - pungprakearti/streamsicle

## In progress

12. **First full catalog pull** - Discovery complete (~20k movies, ~13k TV shows), pull running

## Up next

### 13. Windows scheduled task for daily sync

Use Windows Task Scheduler to run discover + pull daily:

```
wsl -d Ubuntu -- bash -c "cd /home/andrew/bin/streamsicle && npm run sync:discover && npm run sync:pull >> logs/sync.log 2>&1"
```

### 14. Local hostname (nice to have)

Goal was `streamsicle.local` but mDNS doesn't cross WSL2 NAT boundary. Current solution: family uses `http://192.168.0.87:3968` directly. Could revisit with a Windows-side reverse proxy on port 80.

### 15. UI polish

- Toast notifications for watchlist add/remove
- Loading states and skeletons
- A-Z jump navigation on catalog pages
- Trailer embed (YouTube) on title detail

### 16. Future ideas

- Admin page for triggering sync from the UI
- Notification when a watchlisted upcoming title becomes available
- Genre/year filter persistence via URL params
- Search improvements (fuzzy matching, director/actor search)
