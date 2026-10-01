import { discover, pull, loadDiscovery } from "@/lib/sync";

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  let limit: number | undefined;
  let full = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      const n = parseInt(args[i + 1], 10);
      if (isNaN(n) || n <= 0) {
        console.error("--limit must be a positive integer");
        process.exit(1);
      }
      limit = n;
    }
    if (args[i] === "--full") {
      full = true;
    }
  }

  return { command, limit, full };
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

async function main() {
  const { command, limit, full } = parseArgs();

  if (command === "discover") {
    console.log(`[${new Date().toISOString()}] Starting discovery...`);
    const start = Date.now();
    const data = await discover();
    const elapsed = (Date.now() - start) / 1000;
    console.log(`[${new Date().toISOString()}] Discovery complete in ${formatTime(elapsed)}`);
    console.log(`  ${data.movies.length} movies, ${data.tv.length} TV shows`);
    console.log(`  Total: ${data.movies.length + data.tv.length} titles to pull`);

  } else if (command === "pull") {
    const data = loadDiscovery();
    if (!data) {
      console.error("No discovery data found. Run 'npm run sync:discover' first.");
      process.exit(1);
    }

    const parts = [limit && `limit: ${limit}`, full && "full"].filter(Boolean);
    const label = parts.length ? ` (${parts.join(", ")})` : "";
    console.log(`[${new Date().toISOString()}] Starting pull${label}...`);

    const result = await pull({ limit, full });

    console.log(`[${new Date().toISOString()}] Pull complete in ${formatTime(Number(result.totalSeconds))}:`);
    console.log(`  Synced: ${result.synced}`);
    console.log(`  Skipped (unchanged): ${result.skipped}`);
    console.log(`  Skipped (not on any service): ${result.noService}`);
    console.log(`  Total processed: ${result.total}`);
    console.log(`  Catalog: ${result.movieCount} movies, ${result.tvCount} TV shows`);
    if (result.errors.length > 0) {
      console.error(`  Errors (${result.errors.length}):`);
      for (const e of result.errors.slice(0, 20)) {
        console.error(`    - ${e}`);
      }
      if (result.errors.length > 20) {
        console.error(`    ... and ${result.errors.length - 20} more`);
      }
    }

  } else if (command === "status") {
    const data = loadDiscovery();
    if (!data) {
      console.log("No discovery data. Run 'npm run sync:discover' first.");
    } else {
      const age = Date.now() - new Date(data.discoveredAt).getTime();
      const hoursAgo = (age / 3600_000).toFixed(1);
      console.log(`Last discovery: ${data.discoveredAt} (${hoursAgo}h ago)`);
      console.log(`  ${data.movies.length} movies, ${data.tv.length} TV shows`);
      if (data.lastPulledAt) {
        const pullAge = Date.now() - new Date(data.lastPulledAt).getTime();
        const pullHoursAgo = (pullAge / 3600_000).toFixed(1);
        console.log(`Last pull: ${data.lastPulledAt} (${pullHoursAgo}h ago)`);
      } else {
        console.log(`Last pull: never`);
      }
      console.log(`  Provider IDs:`, data.providerIds);
    }

  } else {
    console.log("Usage: npm run sync -- <command> [options]");
    console.log("");
    console.log("Commands:");
    console.log("  discover          Fetch all title IDs from TMDB (run once a day)");
    console.log("  pull [--limit N] [--full]  Pull title data (incremental by default)");
    console.log("  status            Show discovery cache info");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
