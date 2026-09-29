import { syncTmdbData } from "@/lib/sync";

function parseArgs(): { limit?: number } {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      const n = parseInt(args[i + 1], 10);
      if (isNaN(n) || n <= 0) {
        console.error("--limit must be a positive integer");
        process.exit(1);
      }
      return { limit: n };
    }
  }
  return {};
}

async function main() {
  const opts = parseArgs();
  const label = opts.limit ? ` (limit: ${opts.limit})` : "";
  console.log(`[${new Date().toISOString()}] Starting TMDB sync${label}...`);

  const result = await syncTmdbData(opts);

  const mins = Math.floor(Number(result.totalSeconds) / 60);
  const secs = Math.round(Number(result.totalSeconds) % 60);
  console.log(`[${new Date().toISOString()}] Sync complete in ${mins}m ${secs}s:`);
  console.log(`  Synced: ${result.synced}`);
  console.log(`  Skipped (unchanged): ${result.skipped}`);
  console.log(`  Total processed: ${result.total}`);
  console.log(`  Discovered: ${result.movieCount} movies, ${result.tvCount} TV shows`);
  if (result.errors.length > 0) {
    console.error(`  Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.error(`    - ${e}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
