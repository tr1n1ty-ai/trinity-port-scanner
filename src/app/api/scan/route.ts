import { scan, expandPortRange } from '@/lib/scanner';
import { appendHistory } from '@/lib/store';
import { validateTarget, validatePortRange } from '@/lib/validation';
import { checkRateLimit, releaseScan } from '@/lib/rate-limit';
import type { ScanHistoryEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_CONCURRENCY = 500;
const MAX_PORTS = 10_000;

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  // Rate limiting
  const rateCheck = checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    return Response.json({ error: rateCheck.error }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    releaseScan(clientIP);
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { target, portRange, concurrency = 200, bannerGrab = false } = body;

  // Validate target (SSRF protection)
  const targetValidation = await validateTarget(target);
  if (!targetValidation.valid) {
    releaseScan(clientIP);
    return Response.json({ error: targetValidation.error }, { status: 400 });
  }

  // Validate port range format
  const portRangeValidation = validatePortRange(portRange);
  if (!portRangeValidation.valid) {
    releaseScan(clientIP);
    return Response.json({ error: portRangeValidation.error }, { status: 400 });
  }

  const ports = expandPortRange(portRange);
  if (ports.length === 0) {
    releaseScan(clientIP);
    return Response.json({ error: 'Invalid port range' }, { status: 400 });
  }

  // Cap port count
  if (ports.length > MAX_PORTS) {
    releaseScan(clientIP);
    return Response.json(
      { error: `Port range too large. Maximum ${MAX_PORTS} ports per scan (requested ${ports.length}).` },
      { status: 400 }
    );
  }

  // Cap concurrency server-side
  const safeConcurrency = Math.min(Math.max(1, Number(concurrency) || 200), MAX_CONCURRENCY);

  const resolvedTarget = targetValidation.resolvedIP || target;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of scan(resolvedTarget, ports, safeConcurrency, !!bannerGrab, request.signal)) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          if (event.type === 'complete' && event.summary) {
            const entry: ScanHistoryEntry = {
              ...event.summary,
              id: event.summary.scanId,
            };
            appendHistory(entry);
          }
        }
      } catch {
        if (!request.signal.aborted) {
          const errorData = `data: ${JSON.stringify({ type: 'error', error: 'An internal error occurred' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
        }
      } finally {
        releaseScan(clientIP);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
