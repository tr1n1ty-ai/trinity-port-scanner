const MAX_SCANS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CONCURRENT_PER_IP = 1;

interface RateLimitEntry {
  timestamps: number[];
  activeScanCount: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0 && entry.activeScanCount === 0) {
      store.delete(ip);
    }
  }
}, 60_000);

export function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { timestamps: [], activeScanCount: 0 };
    store.set(ip, entry);
  }

  // Clean expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  // Check concurrent limit
  if (entry.activeScanCount >= MAX_CONCURRENT_PER_IP) {
    return { allowed: false, error: 'A scan is already in progress. Wait for it to complete.' };
  }

  // Check rate limit
  if (entry.timestamps.length >= MAX_SCANS_PER_WINDOW) {
    const oldestTs = entry.timestamps[0];
    const retryAfterSec = Math.ceil((oldestTs + WINDOW_MS - now) / 1000);
    return { allowed: false, error: `Rate limit exceeded. Try again in ${retryAfterSec} seconds.` };
  }

  // Allow and record
  entry.timestamps.push(now);
  entry.activeScanCount++;
  return { allowed: true };
}

export function releaseScan(ip: string): void {
  const entry = store.get(ip);
  if (entry && entry.activeScanCount > 0) {
    entry.activeScanCount--;
  }
}
