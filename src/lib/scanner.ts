import * as net from 'net';
import type { PortResult, ScanEvent } from './types';
import { getServiceName, grabBanner } from './services';

function sanitizeBanner(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // Strip non-printable characters (keep printable ASCII + common whitespace)
  const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, '');
  // Encode HTML entities
  const encoded = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  // Truncate
  return encoded.slice(0, 256) || undefined;
}

function probePort(host: string, port: number, timeout = 1500): Promise<PortResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      const elapsed = Date.now() - start;
      socket.destroy();
      resolve({
        port,
        status: 'open',
        service: getServiceName(port),
        responseTimeMs: elapsed,
      });
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve({ port, status: 'filtered', responseTimeMs: timeout });
    });

    socket.once('error', () => {
      socket.destroy();
      resolve({ port, status: 'closed', responseTimeMs: Date.now() - start });
    });

    socket.connect(port, host);
  });
}

export function expandPortRange(range: string): number[] {
  if (range === 'common') {
    return [
      21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 465, 587,
      631, 993, 995, 1433, 1521, 2049, 3306, 3389, 5432, 5900, 6379, 8080,
      8443, 9090, 9200, 27017,
    ];
  }

  const ports: Set<number> = new Set();

  for (const part of range.split(',')) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(65535, parseInt(endStr, 10));
      for (let p = start; p <= end; p++) {
        ports.add(p);
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (p >= 1 && p <= 65535) ports.add(p);
    }
  }

  return Array.from(ports).sort((a, b) => a - b);
}

export async function* scan(
  target: string,
  ports: number[],
  concurrency = 200,
  doBannerGrab = false,
  signal?: AbortSignal
): AsyncGenerator<ScanEvent> {
  const scanId = crypto.randomUUID();
  const totalPorts = ports.length;
  let scanned = 0;
  let queue = [...ports];
  const openPorts: PortResult[] = [];
  const startedAt = new Date().toISOString();

  // Worker pool
  const active: Set<Promise<PortResult>> = new Set();

  while (queue.length > 0 || active.size > 0) {
    if (signal?.aborted) {
      yield { type: 'error', scanId, error: 'Scan aborted' };
      return;
    }

    // Fill pool up to concurrency limit
    while (active.size < concurrency && queue.length > 0) {
      const port = queue.shift()!;
      const promise = probePort(target, port).then(async (result) => {
        if (result.status === 'open' && doBannerGrab) {
          result.banner = sanitizeBanner(await grabBanner(target, port));
        }
        active.delete(promise);
        return result;
      });
      active.add(promise);
    }

    // Wait for the next result
    if (active.size > 0) {
      const result = await Promise.race(active);
      scanned++;

      if (result.status === 'open') {
        openPorts.push(result);
        yield {
          type: 'result',
          scanId,
          portResult: result,
          portsScanned: scanned,
          totalPorts,
          percentComplete: Math.round((scanned / totalPorts) * 100),
        };
      }

      // Emit progress every 50 ports or on last port
      if (scanned % 50 === 0 || scanned === totalPorts) {
        yield {
          type: 'progress',
          scanId,
          portsScanned: scanned,
          totalPorts,
          percentComplete: Math.round((scanned / totalPorts) * 100),
        };
      }
    }
  }

  yield {
    type: 'complete',
    scanId,
    portsScanned: totalPorts,
    totalPorts,
    percentComplete: 100,
    summary: {
      scanId,
      target,
      portRange: `${ports[0]}-${ports[ports.length - 1]}`,
      startedAt,
      completedAt: new Date().toISOString(),
      openPorts: openPorts.sort((a, b) => a.port - b.port),
      totalScanned: totalPorts,
    },
  };
}
