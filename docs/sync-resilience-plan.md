# Sync Resilience Plan

Resumable full pulls with chunked processing and persistent progress tracking.

## Problem

A full pull iterates ~33k titles sequentially in `src/lib/sync.ts` (line 503-514). `lastPulledAt` is only written after the entire loop completes (line 520). If the internet drops or the process is killed mid-pull, all progress is lost and the next `--full` run starts from scratch - repeating ~132k+ TMDB API calls that take several hours.

The DB data itself is safe (each title is committed individually), but there's no checkpoint to resume from.

## Design

### 1. New DB tables

```sql
-- Tracks each sync run
CREATE TABLE sync_runs (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,           -- 'full' or 'incremental'
  status TEXT NOT NULL,         -- 'running', 'completed', 'interrupted', 'failed'
  total_ids INT,                -- how many IDs to process
  chunk_size INT DEFAULT 500,
  current_chunk INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error TEXT
);

-- Tracks which IDs have been processed in a given run
CREATE TABLE sync_run_items (
  run_id INT REFERENCES sync_runs(id) ON DELETE CASCADE,
  tmdb_id INT NOT NULL,
  media_type TEXT NOT NULL,     -- 'movie' or 'tv'
  result TEXT NOT NULL,         -- 'synced', 'skipped', 'no_service', 'error'
  error TEXT,
  processed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (run_id, tmdb_id, media_type)
);
```

### 2. Chunked processing

- Split the full ID list into chunks of 500 titles
- After each chunk completes, update `sync_runs.current_chunk`
- On resume, skip all IDs already in `sync_run_items` for this run
- Still process every title (no skipping based on hash) for `--full` as requested

### 3. Resume logic

Flow for `npm run sync:pull --full`:
1. Check for an existing run with `status = 'running'` or `'interrupted'`
2. If found, ask to resume or start fresh
3. If resuming: load the run, query `sync_run_items` for already-processed IDs, skip them
4. If starting fresh: mark old run as `'interrupted'`, create new run
5. Process remaining IDs in chunks of 500
6. After each chunk: update `current_chunk`, log progress
7. On completion: set `status = 'completed'`, update `lastPulledAt`

New flag: `npm run sync:pull --resume` to explicitly resume without prompting.

### 4. Interruption handling

- Wrap the main loop in a try/catch that sets `status = 'interrupted'` on the run
- Add SIGINT/SIGTERM handlers to do the same on Ctrl+C
- Next run detects the interrupted state and can resume

### 5. Progress display

Enhance the existing 10-second ticker to also show:
- Current chunk N of M
- How many chunks completed
- Estimated time remaining based on chunk throughput

## Files to change

- `src/lib/db.ts` or migration - Add `sync_runs` and `sync_run_items` tables
- `src/lib/sync.ts` - Chunk loop, checkpoint writes, resume logic
- `src/scripts/sync-cli.ts` - `--resume` flag, interrupted-run detection
- `docs/sync.md` - Update docs

## Not in scope

- Skipping unchanged titles before TMDB fetch (user wants full pull to mean full pull)
- Retry logic for individual failed titles (can be a follow-up)
- Parallel chunk processing (sequential is fine, rate limit is the bottleneck)
