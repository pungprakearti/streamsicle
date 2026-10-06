import * as readline from "readline";

const TOTAL = 33000;
const BAR_LABEL = "Syncing titles";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function renderBar(current: number, total: number, startTime: number): void {
  const cols = process.stdout.columns || 80;
  const pct = Math.min(current / total, 1);
  const remaining = total - current;

  const elapsed = (Date.now() - startTime) / 1000;
  const rate = current / elapsed;
  const eta = remaining > 0 && rate > 0 ? formatTime(remaining / rate) : "done";

  const stats = `  ${Math.round(pct * 100)}%  ${current.toLocaleString()} / ${total.toLocaleString()}  ETA ${eta}`;
  const prefix = `${BAR_LABEL} `;
  const overhead = prefix.length + stats.length + 2;
  const barWidth = Math.max(10, cols - overhead);
  const filled = Math.round(barWidth * pct);
  const empty = barWidth - filled;
  const bar = `${prefix}[${"█".repeat(filled)}${"░".repeat(empty)}]${stats}`;

  readline.cursorTo(process.stdout, 0, 0);
  process.stdout.write(bar);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  console.clear();
  console.log("");
  console.log("");

  const startTime = Date.now();

  for (let i = 1; i <= TOTAL; i++) {
    renderBar(i, TOTAL, startTime);

    readline.cursorTo(process.stdout, 0, 2);

    if (i % 500 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(
        `  Chunk ${i / 500} of ${TOTAL / 500} complete  (${elapsed}s elapsed)\n`
      );
    }

    // Simulate variable API response times
    await sleep(Math.random() < 0.1 ? 8 : 2);
  }

  readline.cursorTo(process.stdout, 0);
  const totalTime = formatTime((Date.now() - startTime) / 1000);
  process.stdout.write(`\n\nDone! ${TOTAL.toLocaleString()} titles synced in ${totalTime}\n`);
}

main();
