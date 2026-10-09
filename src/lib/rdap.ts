/**
 * rdap.ts — first-party RDAP resolution (per-TLD bootstrap).
 *
 * Why this exists: a single hard-coded RDAP endpoint (rdap.org) fails many
 * ccTLDs, and DNS-absence heuristics cannot prove availability. The IANA
 * RDAP bootstrap registry maps every delegated TLD to its authoritative
 * RDAP server(s); a 404 from the authoritative server means "not
 * registered" — a far stronger availability signal than missing DNS.
 *
 * Pure + dependency-free (runs in Workers, Node, and Vitest). Network is
 * injected (`fetchImpl`) so tests never touch the network. An embedded
 * fallback map covers the common TLDs when the IANA fetch fails.
 */

export const IANA_BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';
export const BOOTSTRAP_TIMEOUT_MS = 6000;
export const RDAP_QUERY_TIMEOUT_MS = 10000;

/** Lower-cased TLD without dot → RDAP base URLs (trailing slash kept). */
export type RdapServerMap = Map<string, string[]>;

// Embedded fallback for the TLDs this site checks most. Only servers with
// stable, long-lived RDAP endpoints are listed; anything else resolves via
// the live IANA bootstrap, else reports unsupported (never guessed).
const FALLBACK_SERVERS: [string, string[]][] = [
  ['com', ['https://rdap.verisign.com/com/v1/']],
  ['net', ['https://rdap.verisign.com/net/v1/']],
  ['org', ['https://rdap.publicinterestregistry.org/rdap/']],
  ['io', ['https://rdap.nic.io/']],
  ['dev', ['https://rdap.nic.google/']],
  ['app', ['https://rdap.nic.google/']],
  ['co', ['https://rdap.nic.co/']],
  ['me', ['https://rdap.nic.me/']],
  ['xyz', ['https://rdap.nic.xyz/']],
];

export function fallbackServers(): RdapServerMap {
  return new Map(FALLBACK_SERVERS.map(([t, urls]) => [t, [...urls]] as [string, string[]]));
}

/**
 * Parse the IANA bootstrap registry
 * ({ services: [ [[tlds...], [urls...]], ... ] }) into a TLD map.
 * Unknown shapes yield an empty map (caller falls back) — never throws.
 */
export function parseBootstrap(json: unknown): RdapServerMap {
  const map: RdapServerMap = new Map();
  try {
    const services = (json as { services?: unknown }).services;
    if (!Array.isArray(services)) return map;
    for (const entry of services) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const [tlds, urls] = entry as [unknown, unknown];
      if (!Array.isArray(tlds) || !Array.isArray(urls)) continue;
      const cleanUrls = urls.filter((u): u is string => typeof u === 'string' && u.length > 0);
      if (cleanUrls.length === 0) continue;
      for (const t of tlds) {
        if (typeof t !== 'string' || t.length === 0) continue;
        map.set(t.toLowerCase(), cleanUrls);
      }
    }
  } catch {
    /* hostile input → empty map */
  }
  return map;
}

/** Last DNS label as TLD guess (example.co.uk → uk, whose RDAP covers it). */
export function tldOf(domain: string): string | null {
  const clean = domain.trim().toLowerCase().replace(/\.$/, '');
  const parts = clean.split('.');
  if (parts.length < 2 || parts.some((p) => p.length === 0)) return null;
  return parts[parts.length - 1]!;
}

export function rdapBasesFor(domain: string, map: RdapServerMap): string[] | null {
  const tld = tldOf(domain);
  if (!tld) return null;
  return map.get(tld) ?? null;
}

export interface RdapVerdict {
  domain: string;
  registered: boolean;
  registrar: string;
  expiration: string;
  nameservers: string[];
  dnssec: 'Signed' | 'Unsigned' | 'N/A';
}

interface RdapEntityLike {
  roles?: string[];
  vcardArray?: unknown[][];
  entities?: RdapEntityLike[];
}

function findRegistrar(entities: RdapEntityLike[] | undefined): string {
  if (!entities) return '';
  for (const e of entities) {
    if (e.roles?.includes('registrar') && Array.isArray(e.vcardArray?.[1])) {
      for (const item of e.vcardArray[1] as unknown[][]) {
        if (Array.isArray(item) && item[0] === 'fn' && typeof item[3] === 'string') return item[3];
      }
    }
    if (e.entities) {
      const nested = findRegistrar(e.entities);
      if (nested) return nested;
    }
  }
  return '';
}

export function verdictFromRdap(data: Record<string, unknown>, domain: string): RdapVerdict {
  const events = (data.events ?? []) as { eventAction?: string; eventDate?: string }[];
  const expiration = events.find((e) => e.eventAction === 'expiration')?.eventDate ?? '';
  const nameservers = ((data.nameservers ?? []) as { ldhName?: string }[])
    .map((n) => n.ldhName ?? '')
    .filter(Boolean);
  const secureDNS = data.secureDNS as { delegationSigned?: boolean } | undefined;
  return {
    domain: (data.ldhName as string) || domain,
    registered: true,
    registrar: findRegistrar(data.entities as RdapEntityLike[] | undefined) || 'N/A',
    expiration: expiration || 'N/A',
    nameservers,
    dnssec: secureDNS?.delegationSigned === true ? 'Signed' : secureDNS?.delegationSigned === false ? 'Unsigned' : 'N/A',
  };
}

export type RdapOutcome =
  | { kind: 'registered'; verdict: RdapVerdict }
  | { kind: 'unregistered' }
  | { kind: 'unsupported'; reason: string };

type FetchImpl = (_url: string, _init?: RequestInit) => Promise<Response>;

async function fetchJson(fetchImpl: FetchImpl, url: string, timeoutMs: number): Promise<{ status: number; json: unknown }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal, headers: { accept: 'application/rdap+json, application/json' } });
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      /* non-JSON body — status still decides */
    }
    return { status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve one domain against its authoritative RDAP server(s).
 * - 200 → registered (normalized verdict)
 * - 404 → unregistered (strong availability signal)
 * - anything else / no server → unsupported (caller falls back; never a guess)
 */
export async function lookupRdap(
  domain: string,
  opts: { fetchImpl: FetchImpl; servers?: RdapServerMap; bootstrapJson?: unknown },
): Promise<RdapOutcome> {
  const clean = domain.trim().toLowerCase().replace(/\.$/, '');
  if (!clean || tldOf(clean) === null) return { kind: 'unsupported', reason: 'invalid domain' };

  let map = opts.servers;
  if (!map) {
    map = fallbackServers();
    try {
      const boot = await fetchJson(opts.fetchImpl, IANA_BOOTSTRAP_URL, BOOTSTRAP_TIMEOUT_MS);
      if (boot.status >= 200 && boot.status < 300) {
        const parsed = parseBootstrap(boot.json);
        if (parsed.size > 0) map = parsed;
      }
    } catch {
      /* bootstrap unreachable — fallback map stands */
    }
  }

  const bases = rdapBasesFor(clean, map);
  if (!bases || bases.length === 0) return { kind: 'unsupported', reason: 'no RDAP server for this TLD' };

  let lastError = '';
  for (const base of bases) {
    const url = base.replace(/\/?$/, '/') + `domain/${encodeURIComponent(clean)}`;
    try {
      const { status, json } = await fetchJson(opts.fetchImpl, url, RDAP_QUERY_TIMEOUT_MS);
      if (status === 404) return { kind: 'unregistered' };
      if (status >= 200 && status < 300 && json && typeof json === 'object') {
        return { kind: 'registered', verdict: verdictFromRdap(json as Record<string, unknown>, clean) };
      }
      lastError = `HTTP ${status}`;
    } catch {
      lastError = 'network error';
    }
  }
  return { kind: 'unsupported', reason: lastError || 'all RDAP servers failed' };
}
