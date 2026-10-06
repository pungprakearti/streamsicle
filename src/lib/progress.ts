import * as readline from "readline";

export interface ProgressBarOptions {
  label: string;
  total: number;
}

export class ProgressBar {
  private label: string;
  private total: number;
  private current = 0;
  private startTime: number;
  private logLine = 2;

  constructor(options: ProgressBarOptions) {
    this.label = options.label;
    this.total = options.total;
    this.startTime = Date.now();
  }

  start(): void {
    console.clear();
    console.log("");
    console.log("");
    this.render();
  }

  update(current: number): void {
    this.current = current;
    this.render();
  }

  increment(amount = 1): void {
    this.current += amount;
    this.render();
  }

  setTotal(total: number): void {
    this.total = total;
    this.render();
  }

  log(message: string): void {
    readline.cursorTo(process.stdout, 0, this.logLine);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(message);
    this.logLine++;
    this.render();
  }

  stop(message?: string): void {
    readline.cursorTo(process.stdout, 0, this.logLine);
    if (message) {
      process.stdout.write(`\n${message}\n`);
    }
  }

  getElapsed(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  private render(): void {
    const cols = process.stdout.columns || 80;
    const pct = this.total > 0 ? Math.min(this.current / this.total, 1) : 0;
    const remaining = this.total - this.current;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current > 0 ? this.current / elapsed : 0;
    const eta = remaining > 0 && rate > 0 ? formatTime(remaining / rate) : "done";

    const stats = `  ${Math.round(pct * 100)}%  ${this.current.toLocaleString()} / ${this.total.toLocaleString()}  ETA ${eta}`;
    const prefix = `${this.label} `;
    const overhead = prefix.length + stats.length + 2;
    const barWidth = Math.max(10, cols - overhead);
    const filled = Math.round(barWidth * pct);
    const empty = barWidth - filled;
    const bar = `${prefix}[${"█".repeat(filled)}${"░".repeat(empty)}]${stats}`;

    readline.cursorTo(process.stdout, 0, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(bar);
  }
}

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
