/**
 * Minimal X.509 DER parser for the SSL Certificate Decoder — pure local
 * computation, no network. Handles standard single-certificate PEM blobs:
 * version, serial, signature algorithm, issuer/subject, validity, public
 * key (RSA/EC), SANs, key usage, basic constraints. Anything exotic
 * (multi-cert chains, non-standard extensions) parses best-effort and the
 * caller reports what was extracted rather than failing outright.
 */

export interface ParsedCert {
  version: number;
  serialHex: string;
  signatureAlgorithm: string;
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  publicKeyAlgorithm: string;
  publicKeySize: string;
  san: string[];
  keyUsage: string[];
  isCa: boolean;
}

interface Tlv {
  tag: number;
  value: Uint8Array;
  next: number;
}

export function readTlv(buf: Uint8Array, offset: number): Tlv {
  if (offset + 2 > buf.length) throw new Error('truncated');
  const tag = buf[offset]!;
  let len = buf[offset + 1]!;
  let pos = offset + 2;
  if (len & 0x80) {
    const n = len & 0x7f;
    if (n === 0 || n > 4 || pos + n > buf.length) throw new Error('bad length');
    len = 0;
    for (let i = 0; i < n; i++) len = len * 256 + buf[pos++]!;
  }
  if (pos + len > buf.length) throw new Error('truncated value');
  return { tag, value: buf.subarray(pos, pos + len), next: pos + len };
}

export function readChildren(value: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = [];
  let pos = 0;
  while (pos < value.length) {
    const t = readTlv(value, pos);
    out.push(value.subarray(pos, t.next));
    pos = t.next;
  }
  return out;
}

function tlvValue(raw: Uint8Array): Uint8Array {
  return readTlv(raw, 0).value;
}

export function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  const parts = [Math.floor(bytes[0]! / 40), bytes[0]! % 40];
  let v = 0;
  for (let i = 1; i < bytes.length; i++) {
    v = v * 128 + (bytes[i]! & 0x7f);
    if (!(bytes[i]! & 0x80)) {
      parts.push(v);
      v = 0;
    }
  }
  return parts.join('.');
}

const SIG_ALGS: Record<string, string> = {
  '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption (weak — migrate)',
  '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
  '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
  '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
  '1.2.840.113549.1.1.10': 'RSASSA-PSS',
  '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
  '1.2.840.10045.4.3.3': 'ecdsa-with-SHA384',
  '1.2.840.10045.4.3.4': 'ecdsa-with-SHA512',
  '1.3.101.112': 'Ed25519',
};

const KEY_ALGS: Record<string, string> = {
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.10045.2.1': 'EC',
  '1.3.101.112': 'Ed25519',
  '1.3.101.110': 'X25519',
};

const CURVES: Record<string, string> = {
  '1.2.840.10045.3.1.7': 'P-256',
  '1.3.132.0.34': 'P-384',
  '1.3.132.0.35': 'P-521',
};

const NAME_OIDS: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.9': 'STREET',
  '1.2.840.113549.1.9.1': 'email',
};

function decodeString(bytes: Uint8Array): string {
  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}

export function parseName(nameSeq: Uint8Array): string {
  const parts: string[] = [];
  for (const setRaw of readChildren(tlvValue(nameSeq))) {
    for (const attrRaw of readChildren(tlvValue(setRaw))) {
      const [oidRaw, valRaw] = readChildren(tlvValue(attrRaw));
      if (!oidRaw || !valRaw) continue;
      const oid = decodeOid(tlvValue(oidRaw));
      const label = NAME_OIDS[oid] || oid;
      parts.push(`${label}=${decodeString(tlvValue(valRaw!))}`);
    }
  }
  return parts.join(', ');
}

export function formatAsn1Time(raw: Uint8Array): string {
  const s = decodeString(tlvValue(raw));
  // UTCTime YYMMDDHHMMSSZ → full year; GeneralizedTime already full.
  const m = s.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/);
  if (m) {
    const yy = parseInt(m[1]!, 10);
    const yyyy = yy >= 50 ? 1900 + yy : 2000 + yy;
    return `${yyyy}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
  }
  return s;
}

function bitLength(intBytes: Uint8Array): number {
  let i = 0;
  while (i < intBytes.length && intBytes[i] === 0) i++;
  if (i >= intBytes.length) return 0;
  const first = intBytes[i]!;
  let bits = (intBytes.length - i) * 8;
  let mask = 0x80;
  while (mask && !(first & mask)) {
    bits--;
    mask >>= 1;
  }
  return bits;
}

const KEY_USAGE_BITS = ['digitalSignature', 'nonRepudiation', 'keyEncipherment', 'dataEncipherment', 'keyAgreement', 'keyCertSign', 'cRLSign', 'encipherOnly', 'decipherOnly'];

export function parseCert(der: Uint8Array): ParsedCert {
  const certSeq = readChildren(tlvValue(der));
  if (certSeq.length < 3) throw new Error('not a certificate');
  const tbs = readChildren(tlvValue(certSeq[0]!));
  let i = 0;
  // Optional [0] EXPLICIT version.
  let version = 1;
  {
    const first = readTlv(tbs[0]!, 0);
    if (first.tag === 0xa0) {
      const v = readTlv(first.value, 0);
      version = (v.value[0] ?? 0) + 1;
      i = 1;
    }
  }
  const serialBytes = tlvValue(tbs[i++]!);
  const serialHex = [...serialBytes].map((b) => b.toString(16).padStart(2, '0')).join('').replace(/^0+/, '') || '0';
  const sigAlgOid = decodeOid(tlvValue(readChildren(tlvValue(tbs[i++]!))[0]!));
  const issuer = parseName(tbs[i++]!);
  const validity = readChildren(tlvValue(tbs[i++]!));
  const notBefore = formatAsn1Time(validity[0]!);
  const notAfter = formatAsn1Time(validity[1]!);
  const subject = parseName(tbs[i++]!);
  const spki = readChildren(tlvValue(tbs[i++]!));
  const algSeq = readChildren(tlvValue(spki[0]!));
  const keyAlgOid = decodeOid(tlvValue(algSeq[0]!));
  const publicKeyAlgorithm = KEY_ALGS[keyAlgOid] || keyAlgOid;
  let publicKeySize = 'unknown';
  const bitString = tlvValue(spki[1]!);
  const keyBytes = bitString.subarray(1); // skip unused-bits octet
  if (keyAlgOid === '1.2.840.113549.1.1.1') {
    try {
      const rsaSeq = readChildren(tlvValue(keyBytes));
      publicKeySize = `${bitLength(tlvValue(rsaSeq[0]!))}-bit`;
    } catch { /* leave unknown */ }
  } else if (keyAlgOid === '1.2.840.10045.2.1' && algSeq[1]) {
    try {
      const curveOid = decodeOid(tlvValue(algSeq[1]));
      publicKeySize = CURVES[curveOid] || curveOid;
    } catch { /* leave unknown */ }
  }

  const san: string[] = [];
  const keyUsage: string[] = [];
  let isCa = false;
  // Extensions live after subjectAltName-agnostic fields: scan remaining
  // tbs children for [3] EXPLICIT (tag 0xa3).
  for (; i < tbs.length; i++) {
    const t = readTlv(tbs[i]!, 0);
    if (t.tag !== 0xa3) continue;
    const extSeq = readChildren(tlvValue(readTlv(t.value, 0).value));
    for (const extRaw of extSeq) {
      const parts = readChildren(tlvValue(extRaw));
      const oid = decodeOid(tlvValue(parts[0]!));
      const valRaw = parts.length === 3 ? parts[2]! : parts[1]!;
      const val = tlvValue(valRaw);
      if (oid === '2.5.29.17') {
        for (const genRaw of readChildren(tlvValue(val))) {
          const g = readTlv(genRaw, 0);
          if (g.tag === 0x82) san.push(decodeString(g.value));
          else if (g.tag === 0x87) san.push(`IP:${decodeString(g.value)}`);
        }
      } else if (oid === '2.5.29.15') {
        // val = OCTET STRING wrapping a BIT STRING: parse the inner TLV,
        // skip its unused-bits octet, then read bits MSB-first.
        try {
          const inner = readTlv(val, 0).value;
          const data = inner.subarray(1);
          KEY_USAGE_BITS.forEach((name, bit) => {
            const byte = data[Math.floor(bit / 8)] ?? 0;
            if (byte & (0x80 >> (bit % 8))) keyUsage.push(name);
          });
        } catch { /* leave empty */ }
      } else if (oid === '2.5.29.19') {
        for (const bRaw of readChildren(tlvValue(val))) {
          const b = readTlv(bRaw, 0);
          if (b.tag === 0x01 && b.value[0] === 0xff) isCa = true;
        }
      }
    }
  }

  return {
    version,
    serialHex: serialHex.toUpperCase(),
    signatureAlgorithm: SIG_ALGS[sigAlgOid] || sigAlgOid,
    issuer,
    subject,
    notBefore,
    notAfter,
    publicKeyAlgorithm,
    publicKeySize,
    san,
    keyUsage,
    isCa,
  };
}

export function pemToDer(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  if (!b64) throw new Error('empty');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let j = 0; j < bin.length; j++) out[j] = bin.charCodeAt(j);
  return out;
}
