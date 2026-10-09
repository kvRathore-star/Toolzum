import { describe, it, expect } from 'vitest';
import {
  parseBootstrap,
  tldOf,
  rdapBasesFor,
  verdictFromRdap,
  lookupRdap,
  fallbackServers,
} from '@/lib/rdap';

const mockFetch = (status: number, json: unknown) => async () => new Response(JSON.stringify(json), { status });

describe('rdap bootstrap', () => {
  it('parses IANA services into a TLD map', () => {
    const map = parseBootstrap({
      services: [
        [['com', 'net'], ['https://rdap.verisign.com/com/v1/']],
        [['org'], ['https://rdap.publicinterestregistry.org/rdap/']],
      ],
    });
    expect(map.get('com')).toEqual(['https://rdap.verisign.com/com/v1/']);
    expect(map.get('org')).toEqual(['https://rdap.publicinterestregistry.org/rdap/']);
  });

  it('returns an empty map (never throws) on hostile input', () => {
    expect(parseBootstrap(null).size).toBe(0);
    expect(parseBootstrap({}).size).toBe(0);
    expect(parseBootstrap({ services: 'nope' }).size).toBe(0);
    expect(parseBootstrap({ services: [[['com'], []]] }).size).toBe(0);
  });

  it('extracts the last label as TLD', () => {
    expect(tldOf('example.com')).toBe('com');
    expect(tldOf('example.co.uk')).toBe('uk');
    expect(tldOf('Example.COM.')).toBe('com');
    expect(tldOf('nodot')).toBe(null);
    expect(tldOf('')).toBe(null);
  });

  it('fallback map covers the checked TLDs', () => {
    const map = fallbackServers();
    for (const t of ['com', 'net', 'org', 'io', 'dev', 'app', 'co', 'me', 'xyz']) {
      expect(rdapBasesFor(`example.${t}`, map)).not.toBe(null);
    }
    expect(rdapBasesFor('example.unknowntld', map)).toBe(null);
  });
});

describe('verdictFromRdap', () => {
  it('normalizes registrar, expiry, nameservers, DNSSEC', () => {
    const v = verdictFromRdap(
      {
        ldhName: 'example.com',
        events: [
          { eventAction: 'registration', eventDate: '2020-01-01T00:00:00Z' },
          { eventAction: 'expiration', eventDate: '2030-01-01T00:00:00Z' },
        ],
        entities: [{ roles: ['registrar'], vcardArray: [[], [['fn', {}, 'text', 'Example Registrar']]] }],
        nameservers: [{ ldhName: 'ns1.example.com' }],
        secureDNS: { delegationSigned: true },
      },
      'example.com',
    );
    expect(v.registered).toBe(true);
    expect(v.registrar).toBe('Example Registrar');
    expect(v.expiration).toBe('2030-01-01T00:00:00Z');
    expect(v.nameservers).toEqual(['ns1.example.com']);
    expect(v.dnssec).toBe('Signed');
  });

  it('degrades to N/A instead of guessing', () => {
    const v = verdictFromRdap({}, 'example.com');
    expect(v.registrar).toBe('N/A');
    expect(v.expiration).toBe('N/A');
    expect(v.dnssec).toBe('N/A');
  });
});

describe('lookupRdap', () => {
  it('200 → registered with verdict', async () => {
    const out = await lookupRdap('example.com', {
      fetchImpl: mockFetch(200, { ldhName: 'example.com', events: [] }) as never,
      servers: fallbackServers(),
    });
    expect(out.kind).toBe('registered');
    if (out.kind === 'registered') expect(out.verdict.domain).toBe('example.com');
  });

  it('404 → unregistered (never a guess)', async () => {
    const out = await lookupRdap('free-name-12345.com', {
      fetchImpl: mockFetch(404, { errorCode: 404 }) as never,
      servers: fallbackServers(),
    });
    expect(out).toEqual({ kind: 'unregistered' });
  });

  it('500 on all servers → unsupported (caller falls back)', async () => {
    const out = await lookupRdap('example.com', {
      fetchImpl: mockFetch(500, {}) as never,
      servers: fallbackServers(),
    });
    expect(out.kind).toBe('unsupported');
  });

  it('TLD with no server → unsupported, invalid domain → unsupported', async () => {
    const noServer = await lookupRdap('example.unknowntld', {
      fetchImpl: (async () => { throw new Error('must not fetch'); }) as never,
      servers: fallbackServers(),
    });
    expect(noServer.kind).toBe('unsupported');
    const invalid = await lookupRdap('not a domain', {
      fetchImpl: (async () => { throw new Error('must not fetch'); }) as never,
      servers: fallbackServers(),
    });
    expect(invalid.kind).toBe('unsupported');
  });
});
