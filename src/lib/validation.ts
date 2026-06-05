import * as dns from 'dns';
import * as net from 'net';

const BLOCKED_HOSTNAMES = [
  'metadata.google.internal',
  'metadata.google.com',
  'instance-data',
];

// Check if an IP falls in a blocked range
function isBlockedIP(ip: string): string | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return 'Invalid IP address format';
  }

  const [a, b] = parts;

  // Loopback: 127.0.0.0/8
  if (a === 127) return 'Loopback addresses are blocked';

  // Private: 10.0.0.0/8
  if (a === 10) return 'Private network ranges are blocked';

  // Private: 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return 'Private network ranges are blocked';

  // Private: 192.168.0.0/16
  if (a === 192 && b === 168) return 'Private network ranges are blocked';

  // Link-local / cloud metadata: 169.254.0.0/16
  if (a === 169 && b === 254) return 'Link-local/metadata addresses are blocked';

  // Unspecified: 0.0.0.0
  if (a === 0) return 'Unspecified addresses are blocked';

  // Broadcast: 255.255.255.255
  if (parts.every((p) => p === 255)) return 'Broadcast addresses are blocked';

  // Multicast: 224.0.0.0 - 239.255.255.255
  if (a >= 224 && a <= 239) return 'Multicast addresses are blocked';

  // Reserved: 240.0.0.0 - 255.255.255.254
  if (a >= 240) return 'Reserved addresses are blocked';

  return null;
}

// Validate hostname format
function isValidHostname(hostname: string): boolean {
  if (hostname.length > 253) return false;
  // Allow alphanumeric, hyphens, dots — no special chars
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname);
}

// Resolve hostname and check the resolved IP
function resolveHostname(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) {
        reject(new Error(`Cannot resolve hostname: ${hostname}`));
        return;
      }
      resolve(address);
    });
  });
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  resolvedIP?: string;
}

export async function validateTarget(target: string): Promise<ValidationResult> {
  const trimmed = target.trim();

  if (!trimmed) {
    return { valid: false, error: 'Target is required' };
  }

  if (trimmed.length > 253) {
    return { valid: false, error: 'Target too long' };
  }

  // Check for blocked hostnames
  if (BLOCKED_HOSTNAMES.some((h) => trimmed.toLowerCase() === h || trimmed.toLowerCase().endsWith('.' + h))) {
    return { valid: false, error: 'This hostname is blocked' };
  }

  // If it's an IP address, validate directly
  if (net.isIPv4(trimmed)) {
    const blocked = isBlockedIP(trimmed);
    if (blocked) return { valid: false, error: blocked };
    return { valid: true, resolvedIP: trimmed };
  }

  // Must be a hostname — validate format
  if (!isValidHostname(trimmed)) {
    return { valid: false, error: 'Invalid hostname format. Use a valid IP or hostname.' };
  }

  // Resolve and check the resolved IP
  try {
    const resolvedIP = await resolveHostname(trimmed);
    const blocked = isBlockedIP(resolvedIP);
    if (blocked) return { valid: false, error: `${blocked} (${trimmed} resolves to ${resolvedIP})` };
    return { valid: true, resolvedIP };
  } catch {
    return { valid: false, error: `Cannot resolve hostname: ${trimmed}` };
  }
}

export function validatePortRange(portRange: string): ValidationResult {
  if (!portRange || !portRange.trim()) {
    return { valid: false, error: 'Port range is required' };
  }

  if (portRange === 'common') {
    return { valid: true };
  }

  // Validate format: numbers, commas, hyphens, spaces only
  if (!/^[\d,\-\s]+$/.test(portRange)) {
    return { valid: false, error: 'Invalid port range format. Use numbers, commas, and hyphens (e.g., "80,443" or "1-1024")' };
  }

  return { valid: true };
}
