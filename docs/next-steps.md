# Next Steps

## Before first sync - DONE

All three items completed:

1. **Rate limiting** - Token bucket in `src/lib/tmdb.ts`, 35 req/10s
2. **Sync hash** - `sync_hash` column on titles, SHA-256 of key fields, skips unchanged titles
3. **CLI script** - `npm run sync` or `npm run sync -- --limit 10`

## After first sync

### 4. Local hostname setup - IN PROGRESS

Goal: family members go to `streamsicle.local` in any browser on the home WiFi and get the app (no port number, no IP address).

**Two pieces needed:**

**A) DNS - make `streamsicle.local` resolve to the host machine**

Option 1 (preferred): Router-level DNS entry - configure once, all devices pick it up.
- Router is at `192.168.0.1` - need to log into admin panel from Windows (not WSL) to check if it supports custom DNS/host entries.
- WSL cannot reach the router due to NAT (172.19.x.x virtual network). Must use a Windows browser.

Option 2 (fallback): Edit hosts file on each device manually.
- Windows: `C:\Windows\System32\drivers\etc\hosts` -> `<LAN_IP>   streamsicle.local`
- Phones/tablets: harder, may need apps or proxy config

**B) Port - drop the `:3000`**

Put a reverse proxy (Caddy is simplest) in front of Next.js on port 80.

**Current status:** Trying to access router admin at http://192.168.0.1 from a Windows browser to check for DNS entry support. Restarting machine to troubleshoot.

### 5. Windows scheduled task for daily sync

Use Windows Task Scheduler to call the standalone sync script via WSL:

```
wsl -d Ubuntu -- bash -c "cd /home/andrew/bin/streamsicle && npx tsx src/scripts/sync-cli.ts >> logs/sync.log 2>&1"
```

Pick a daily time (e.g. 6 AM). This runs independently of the dev server.

### 6. UI polish

- A-Z jump navigation on browse/catalog pages
- Toast notifications for watchlist add/remove
- Loading states and skeletons
- Active nav highlighting (currently links don't know which page is active)
- Responsive tweaks for mobile/tablet

### 7. Future ideas

- Trailer embed (YouTube) on title detail page
- Genre/year filter persistence (URL params work but could also remember last choice)
- Admin page for triggering sync from the UI
- Notification when a watchlisted upcoming title becomes available
