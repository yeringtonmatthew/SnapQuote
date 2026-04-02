/**
 * SSRF protection for user-supplied webhook URLs.
 *
 * Allows only publicly routable HTTP/HTTPS URLs.
 * Blocks all private/loopback/link-local/reserved IP ranges so an
 * attacker cannot use the server as a proxy to reach internal services.
 */

// IPv4 ranges that must never be contacted.
// Stored as [network_as_uint32, prefix_length] pairs.
const BLOCKED_IPV4_CIDRS: [number, number][] = [
  [ipv4ToUint32('127.0.0.0'), 8],    // loopback
  [ipv4ToUint32('10.0.0.0'), 8],     // RFC-1918 private
  [ipv4ToUint32('172.16.0.0'), 12],  // RFC-1918 private
  [ipv4ToUint32('192.168.0.0'), 16], // RFC-1918 private
  [ipv4ToUint32('169.254.0.0'), 16], // link-local (AWS metadata etc.)
  [ipv4ToUint32('0.0.0.0'), 8],      // "this" network
];

// IPv6 prefixes that must never be contacted.
// Checked via simple string prefix matching after lowercasing.
const BLOCKED_IPV6_PREFIXES = [
  '::1',         // loopback
  'fc',          // fc00::/7 unique-local (covers fc__ and fd__)
  'fd',
  'fe80',        // link-local
  '::ffff:',     // IPv4-mapped — the numeric part is checked separately
];

function ipv4ToUint32(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

function isBlockedIPv4(hostname: string): boolean {
  // Must look like a dotted-decimal IPv4 address.
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;

  const addr = ipv4ToUint32(hostname);
  for (const [network, prefix] of BLOCKED_IPV4_CIDRS) {
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    if ((addr & mask) >>> 0 === (network & mask) >>> 0) return true;
  }
  return false;
}

function isBlockedIPv6(hostname: string): boolean {
  // Node / browser URL parsing wraps bare IPv6 in brackets: [::1]
  const bare = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname.replace(/^\[|\]$/g, '').toLowerCase();

  for (const prefix of BLOCKED_IPV6_PREFIXES) {
    if (bare === prefix || bare.startsWith(prefix + ':') || bare.startsWith(prefix + '%')) {
      return true;
    }
  }

  // Also catch compressed forms like "::ffff:192.168.1.1"
  if (bare.startsWith('::ffff:')) {
    const mapped = bare.slice('::ffff:'.length);
    if (isBlockedIPv4(mapped)) return true;
  }

  return false;
}

/**
 * Returns true only when `url` is a safe, publicly routable HTTP or HTTPS URL.
 *
 * Rejects:
 * - Non-http(s) schemes (file://, ftp://, data://, etc.)
 * - localhost and any alias resolving to 127.x.x.x
 * - All private / link-local / reserved IPv4 ranges
 * - IPv6 loopback (::1), unique-local (fc00::/7), and link-local (fe80::/10)
 * - IPv4-mapped IPv6 addresses that fall in a blocked range
 */
export function isAllowedWebhookUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Only allow plain HTTP and HTTPS.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  // Explicit localhost check (covers "localhost" as a name, not just 127.0.0.1).
  if (hostname === 'localhost') return false;

  // Block private IPv4 ranges.
  if (isBlockedIPv4(hostname)) return false;

  // Block private / loopback IPv6 ranges.
  if (isBlockedIPv6(hostname)) return false;

  return true;
}
