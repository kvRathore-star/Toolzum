import { describe, it, expect } from 'vitest';
import {
  readTlv,
  decodeOid,
  parseName,
  formatAsn1Time,
  parseCert,
  pemToDer,
} from '@/lib/x509';

// Helpers to build tiny DER blobs: [tag, len, ...bytes].
const bytes = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));
const concat = (...parts: Uint8Array[]) => {
  const body = parts.flatMap((c) => [...c]);
  return new Uint8Array(body);
};
const derLen = (len: number): number[] => {
  if (len < 128) return [len];
  const b: number[] = [];
  let n = len;
  while (n > 0) {
    b.unshift(n & 0xff);
    n >>= 8;
  }
  return [0x80 | b.length, ...b];
};
const der = (tag: number, content: Uint8Array) => new Uint8Array([tag, ...derLen(content.length), ...content]);
const OID_SHA256_RSA = new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]);
const OID_CN = new Uint8Array([0x06, 0x03, 0x55, 0x04, 0x03]);

describe('x509 DER primitives', () => {
  it('reads short-form TLV', () => {
    const t = readTlv(der(0x30, der(0x02, new Uint8Array([0x05]))), 0);
    expect(t.tag).toBe(0x30);
    expect([...t.value]).toEqual([0x02, 0x01, 0x05]);
    expect(t.next).toBe(5);
  });

  it('reads long-form lengths', () => {
    const buf = der(0x04, new Uint8Array(200).fill(0x41));
    const t = readTlv(buf, 0);
    expect(t.value.length).toBe(200);
    expect(t.next).toBe(203);
  });

  it('throws on truncation instead of returning garbage', () => {
    expect(() => readTlv(new Uint8Array([0x30, 0x05, 0x01]), 0)).toThrow();
    expect(() => readTlv(new Uint8Array([0x30]), 0)).toThrow();
  });

  it('decodes OIDs including multi-byte arcs', () => {
    expect(decodeOid(new Uint8Array([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]))).toBe('1.2.840.113549.1.1.11');
    expect(decodeOid(new Uint8Array([0x55, 0x04, 0x03]))).toBe('2.5.4.3');
    expect(decodeOid(new Uint8Array([0x2b, 0x06, 0x01, 0x05, 0x05, 0x07, 0x13, 0x01]))).toBe('1.3.6.1.5.5.7.19.1');
  });

  it('parses a CN-only DN', () => {
    const attr = der(0x30, concat(OID_CN, der(0x13, bytes('example.com'))));
    const rdn = der(0x31, attr);
    expect(parseName(der(0x30, rdn))).toBe('CN=example.com');
  });

  it('formats UTCTime with century split', () => {
    const raw = (s: string) => new Uint8Array([0x17, s.length, ...[...s].map((c) => c.charCodeAt(0))]);
    expect(formatAsn1Time(raw('260511000000Z'))).toBe('2026-05-11T00:00:00Z');
    expect(formatAsn1Time(raw('990511000000Z'))).toBe('1999-05-11T00:00:00Z');
  });
});

describe('parseCert on a synthetic certificate', () => {
  // Builds the smallest structurally valid cert the parser accepts.
  function syntheticCert(): Uint8Array {
    const serial = der(0x02, new Uint8Array([0x01, 0x02, 0x03]));
    const sigAlg = der(0x30, concat(OID_SHA256_RSA, der(0x05, new Uint8Array([]))));
    const nameAttr = der(0x30, concat(OID_CN, der(0x13, bytes('Test'))));
    const name = der(0x30, der(0x31, nameAttr));
    const validity = der(0x30, concat(
      der(0x17, bytes('250101000000Z')),
      der(0x17, bytes('260101000000Z')),
    ));
    const rsaOid = new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]);
    const modulus = new Uint8Array([0x00, ...new Array(257).fill(0xab)]);
    const rsaKey = der(0x30, concat(
      der(0x02, modulus),
      der(0x02, new Uint8Array([0x01, 0x00, 0x01])),
    ));
    const spki = der(0x30, concat(
      der(0x30, concat(rsaOid, der(0x05, new Uint8Array([])))),
      der(0x03, concat(new Uint8Array([0x00]), rsaKey)),
    ));
    const tbs = der(0x30, concat(serial, sigAlg, name, validity, name, spki));
    return der(0x30, concat(tbs, sigAlg, der(0x03, new Uint8Array([0x00, 0xff]))));
  }

  it('extracts the headline fields', () => {
    const c = parseCert(syntheticCert());
    expect(c.version).toBe(1); // no [0] version → v1 default
    expect(c.serialHex).toBe('10203');
    expect(c.signatureAlgorithm).toBe('sha256WithRSAEncryption');
    expect(c.subject).toBe('CN=Test');
    expect(c.issuer).toBe('CN=Test');
    expect(c.notBefore).toBe('2025-01-01T00:00:00Z');
    expect(c.notAfter).toBe('2026-01-01T00:00:00Z');
    expect(c.publicKeyAlgorithm).toBe('RSA');
    expect(c.publicKeySize).toBe('2056-bit');
    expect(c.isCa).toBe(false);
  });

  it('rejects non-certificates', () => {
    expect(() => parseCert(new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x05]))).toThrow();
    expect(() => parseCert(new Uint8Array([0x00, 0x01, 0x02]))).toThrow();
  });
});

describe('pemToDer', () => {
  it('strips armor and decodes base64', () => {
    const der = pemToDer('-----BEGIN CERTIFICATE-----\nMAA=\n-----END CERTIFICATE-----');
    expect([...der]).toEqual([0x30, 0x00]);
  });

  it('throws on empty or non-base64 input', () => {
    expect(() => pemToDer('!!! not base64 at all !!!')).toThrow();
    expect(() => pemToDer('')).toThrow();
  });
});
